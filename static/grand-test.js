// grand-test.js : moteur du Grand test. Fonctions pures seulement (aucun accès au DOM ni au stockage), pour
// qu'elles soient testées seules (tests/grand_test_calculs.py, hors navigateur) : drapeaux, calculs, générateurs
// d'items, tirage et forme des données enregistrées. L'interface est dans grand-test-interface.js.
// Outils d'app.js employés seulement au moment de l'appel, jamais au chargement : generateur(), melanger().
// Plan et décisions : tests/grand-test-plan.md et tests/grand-test-journal.md.

// ===================== Drapeaux =====================
// Le Grand test n'est pas publié : tant que GRAND_TEST_VISIBLE vaut false, aucune carte, aucun lien, aucune route
// ne l'expose. PERSONNAGES_VISIBLES commande les personnages pédagogiques (niveaux et entités), désactivés aussi.
// GRAND_TEST_ESSAI admet les contenus encore à relire (aRelire: true) : réservé au banc d'essai, qui le met à true
// dans une copie du fichier (tests/lancer.sh). Ces trois valeurs restent false dans la version publiée.
const GRAND_TEST_VISIBLE = false;
const PERSONNAGES_VISIBLES = false;
const GRAND_TEST_ESSAI = false;

// ===================== Forme des données enregistrées =====================
// Une seule clé, « grandTest », dans CLES_SAUVEGARDE (app.js). Schéma détaillé : tests/grand-test-plan.md §2.

const GT_VERSION_SCHEMA = 2;
const GT_VERSION_BANQUE = "grand-test-2026-10";
const GT_MAX_TESTS = 40;                  // passations gardées ; au-delà, les plus anciennes sont retirées
const GT_MAX_VUS = 8000;                  // entrées du journal des items vus
const GT_MAX_OCTETS = 2000000;            // taille maximale de la clé, en caractères JSON
const GT_CERTITUDES = [25, 50, 70, 90, 99];
const GT_AXES = ["A", "B", "C", "D", "E", "F"];

const gtIdValide = v => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9@:._\-]{0,95}$/.test(v);
const gtEntier = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const gtObjet = v => v !== null && typeof v === "object" && !Array.isArray(v);
// Date ISO 8601 en temps universel, entre 2020 et 2100
function gtDateValide(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(v)) return false;
  const t = Date.parse(v);
  return !isNaN(t) && t >= Date.UTC(2020, 0, 1) && t < Date.UTC(2100, 0, 1);
}
// Valeur simple, sans fonction ni objet imbriqué arbitraire : booléen, nombre fini, texte court, ou petite liste
function gtValeurSimple(v) {
  if (v === null || typeof v === "boolean") return true;
  if (typeof v === "number") return isFinite(v);
  if (typeof v === "string") return v.length <= 300;
  if (Array.isArray(v)) return v.length <= 24 && v.every(x => x === null || (typeof x === "number" && isFinite(x)) || (typeof x === "string" && x.length <= 120) || typeof x === "boolean");
  return false;
}
// Petit objet de valeurs simples (valeurs tirées d'une instance, estimations d'étape…)
function gtDictionnaireSimple(v, maxCles) {
  return gtObjet(v) && Object.keys(v).length <= maxCles
    && Object.entries(v).every(([k, x]) => k.length <= 60 && (gtValeurSimple(x) || (gtObjet(x) && Object.keys(x).length <= 12 && Object.values(x).every(gtValeurSimple))));
}

function etatGrandTestVide() {
  return {
    versionSchema: GT_VERSION_SCHEMA,
    versionBanque: GT_VERSION_BANQUE,
    historiqueTests: [],
    historiqueItemsVus: [],
    rappelsEnAttente: [],
    preferences: { cartesSensibilisation: true }
  };
}

function scoresVides() {
  const s = {};
  GT_AXES.forEach(a => { s[a] = { valeur: null, plage: null, n: 0 }; });
  s.F.statut = "exploratoire";
  return s;
}

// Vérifie une passation ; renvoie la liste des problèmes (vide si elle est valide)
function erreursPassation(t, i) {
  const e = [], ou = "historiqueTests[" + i + "]";
  if (!gtObjet(t)) return [ou + " n'est pas un objet"];
  if (!gtIdValide(t.id)) e.push(ou + ".id");
  if (t.mode !== "express" && t.mode !== "complet") e.push(ou + ".mode");
  if (!gtEntier(t.graine, 0, 4294967295)) e.push(ou + ".graine");
  if (!gtDateValide(t.dateDebut)) e.push(ou + ".dateDebut");
  if (t.dateFin !== null && !(gtDateValide(t.dateFin) && Date.parse(t.dateFin) >= Date.parse(t.dateDebut))) e.push(ou + ".dateFin");
  const p = t.progression;
  if (!gtObjet(p) || !gtEntier(p.etape, 0, 6) || !gtEntier(p.item, 0, 500) || typeof p.reprise !== "boolean") e.push(ou + ".progression");
  if (!Array.isArray(t.instances) || t.instances.length > 300) e.push(ou + ".instances");
  else {
    const ids = new Set();
    t.instances.forEach((x, k) => {
      if (!gtObjet(x) || !gtIdValide(x.instanceId) || !gtIdValide(x.itemId) || !gtIdValide(x.famille) || !gtDictionnaireSimple(x.valeurs, 40)
        || typeof x.dejaVu !== "boolean" || !gtEntier(x.compteurTestsAvant, 0, 100000) || ids.has(x.itemId)) e.push(ou + ".instances[" + k + "]");
      else ids.add(x.itemId);
    });
    // Liens internes : chaque réponse porte sur un item tiré dans cette passation, une seule fois
    if (!Array.isArray(t.reponses) || t.reponses.length > t.instances.length) e.push(ou + ".reponses");
    else {
      const repondus = new Set();
      t.reponses.forEach((r, k) => {
        if (!gtObjet(r) || !ids.has(r.itemId) || repondus.has(r.itemId) || !gtValeurSimple(r.valeur)
          || !(r.certitude === null || GT_CERTITUDES.includes(r.certitude))
          || !(r.debut === null || gtDateValide(r.debut)) || !gtDateValide(r.valideeLe)
          || !(r.dureeMs === null || gtEntier(r.dureeMs, 0, 864000000))) e.push(ou + ".reponses[" + k + "]");
        else repondus.add(r.itemId);
      });
    }
  }
  if (!gtObjet(t.scores) || !GT_AXES.every(a => {
    const s = t.scores[a];
    return gtObjet(s) && (s.valeur === null || (typeof s.valeur === "number" && isFinite(s.valeur))) && gtEntier(s.n, 0, 1000)
      && (s.plage === null || (gtObjet(s.plage) && isFinite(s.plage.bas) && isFinite(s.plage.haut) && s.plage.bas <= s.plage.haut
        && s.plage.niveau === 0.8 && typeof s.plage.methode === "string" && s.plage.methode.length <= 60));
  })) e.push(ou + ".scores");
  if (!gtDictionnaireSimple(t.estimationsEtape, 20)) e.push(ou + ".estimationsEtape");
  if (!Array.isArray(t.ideesFaussesCorrigees) || t.ideesFaussesCorrigees.length > 300 || !t.ideesFaussesCorrigees.every(gtIdValide)) e.push(ou + ".ideesFaussesCorrigees");
  if (!Array.isArray(t.entitesAffaiblies) || t.entitesAffaiblies.length > 90 || !t.entitesAffaiblies.every(gtIdValide)) e.push(ou + ".entitesAffaiblies");
  const n = t.niveau;
  if (!gtObjet(n) || !(n.id === null || gtEntier(n.id, 1, 5)) || !["inconnu", "observe", "non-calcule"].includes(n.statut)
    || !(n.calculeLe === null || gtDateValide(n.calculeLe))) e.push(ou + ".niveau");
  if (!gtObjet(t.rappels) || !["j7", "j30"].every(k => t.rappels[k] === null || gtEntier(t.rappels[k], 18000, 60000))) e.push(ou + ".rappels");
  if (!Array.isArray(t.issues) || t.issues.length > 50 || !t.issues.every(x => typeof x === "string" && x.length <= 200)) e.push(ou + ".issues");
  return e;
}

// Vérifie l'objet entier « grandTest » ; renvoie la liste des problèmes (vide si tout est valide)
function erreursGrandTest(v) {
  if (!gtObjet(v)) return ["la valeur n'est pas un objet"];
  let taille;
  try { taille = JSON.stringify(v).length; } catch (e) { return ["valeur non sérialisable"]; }
  if (taille > GT_MAX_OCTETS) return ["taille excessive (" + taille + " caractères)"];
  const e = [];
  if (v.versionSchema !== GT_VERSION_SCHEMA) e.push("versionSchema");
  if (typeof v.versionBanque !== "string" || !gtIdValide(v.versionBanque)) e.push("versionBanque");
  if (!Array.isArray(v.historiqueTests) || v.historiqueTests.length > GT_MAX_TESTS) e.push("historiqueTests");
  else {
    const ids = new Set();
    v.historiqueTests.forEach((t, i) => {
      e.push(...erreursPassation(t, i));
      if (gtObjet(t)) { if (ids.has(t.id)) e.push("historiqueTests[" + i + "].id en double"); ids.add(t.id); }
    });
    // Une seule passation en cours à la fois
    if (v.historiqueTests.filter(t => gtObjet(t) && t.dateFin === null).length > 1) e.push("plusieurs passations en cours");
  }
  if (!Array.isArray(v.historiqueItemsVus) || v.historiqueItemsVus.length > GT_MAX_VUS) e.push("historiqueItemsVus");
  else v.historiqueItemsVus.forEach((x, i) => {
    if (!gtObjet(x) || !gtIdValide(x.instanceId) || !gtIdValide(x.itemId) || !gtIdValide(x.famille) || !gtIdValide(x.runId)
      || !gtDateValide(x.date) || !gtEntier(x.compteurTests, 1, 100000)) e.push("historiqueItemsVus[" + i + "]");
  });
  if (!Array.isArray(v.rappelsEnAttente) || v.rappelsEnAttente.length > 20 || !v.rappelsEnAttente.every(r =>
    gtObjet(r) && gtIdValide(r.runId) && (r.type === "j7" || r.type === "j30") && gtEntier(r.jour, 18000, 60000))) e.push("rappelsEnAttente");
  if (!gtObjet(v.preferences) || typeof v.preferences.cartesSensibilisation !== "boolean") e.push("preferences");
  return e;
}

const grandTestValide = v => erreursGrandTest(v).length === 0;

// ===================== Migrations =====================
// Fonctions pures, version par version. Version 1 : la forme de départ du cahier des charges (§10.1), avec
// « parcours », « historiqueVus » et des réponses dont le début est un nombre de millisecondes. Une migration ne
// perd ni passation, ni réponse, ni graine. Elle renvoie { etat } ou { erreur } ; jamais d'écrasement silencieux.

function versionDe(v) {
  if (!gtObjet(v)) return null;
  if (v.versionSchema !== undefined) return v.versionSchema;
  if (Array.isArray(v.parcours)) return 1;
  return null;
}

function migrer1vers2(v) {
  const graineDe = t => gtEntier(t.graine, 0, 4294967295) ? t.graine : 0;
  const tests = (v.parcours || []).filter(gtObjet).map(t => {
    const graine = graineDe(t);
    const instances = (t.instances || []).filter(gtObjet).map(x => ({
      instanceId: String(x.id) + "@" + graine, itemId: String(x.id), famille: String(x.famille || x.id),
      valeurs: gtObjet(x.valeurs) ? x.valeurs : {}, dejaVu: !!x.dejaVu, compteurTestsAvant: 0
    }));
    const reponses = (t.reponses || []).filter(gtObjet).map(r => {
      const validee = gtDateValide(r.valideeLe) ? r.valideeLe : t.creeLe;
      // Le début était un nombre de millisecondes depuis l'ouverture de l'item : on le reconstruit si possible
      const debut = typeof r.debut === "string" ? r.debut
        : typeof r.dureeMs === "number" && gtDateValide(validee) ? new Date(Date.parse(validee) - r.dureeMs).toISOString() : null;
      return { itemId: String(r.itemId), valeur: r.valeur === undefined ? null : r.valeur, certitude: r.certitude === undefined ? null : r.certitude,
        debut, valideeLe: validee, dureeMs: typeof r.dureeMs === "number" ? Math.max(0, Math.round(r.dureeMs)) : null };
    });
    return {
      id: String(t.id), mode: t.mode, graine, dateDebut: t.creeLe, dateFin: t.termineLe === undefined ? null : t.termineLe,
      progression: { etape: gtEntier(t.etape, 0, 6) ? t.etape : 0, item: gtEntier(t.itemCourant, 0, 500) ? t.itemCourant : 0, reprise: t.termineLe == null },
      instances, reponses, scores: scoresVides(),
      estimationsEtape: gtObjet(t.estimationsEtape) ? t.estimationsEtape : {},
      ideesFaussesCorrigees: [], entitesAffaiblies: [], niveau: { id: null, statut: "inconnu", calculeLe: null },
      rappels: gtObjet(t.rappels) ? { j7: t.rappels.j7 === undefined ? null : t.rappels.j7, j30: t.rappels.j30 === undefined ? null : t.rappels.j30 } : { j7: null, j30: null },
      issues: Array.isArray(t.issues) ? t.issues.map(String).slice(0, 50) : []
    };
  });
  // Rang de chaque passation terminée, pour le compteur de tests du journal des vues
  const rang = {};
  tests.filter(t => t.dateFin).sort((a, b) => Date.parse(a.dateFin) - Date.parse(b.dateFin)).forEach((t, k) => { rang[t.id] = k + 1; });
  const vus = (v.historiqueVus || []).filter(gtObjet).map(x => ({
    instanceId: String(x.instanceId), itemId: String(x.instanceId).split("@")[0], famille: String(x.famille), runId: String(x.runId),
    date: x.date, compteurTests: rang[x.runId] || Object.keys(rang).length + 1
  }));
  return {
    versionSchema: 2, versionBanque: gtIdValide(v.banqueVersion) ? v.banqueVersion : GT_VERSION_BANQUE,
    historiqueTests: tests, historiqueItemsVus: vus,
    rappelsEnAttente: Array.isArray(v.rappelsEnAttente) ? v.rappelsEnAttente : [],
    preferences: gtObjet(v.preferences) && typeof v.preferences.cartesSensibilisation === "boolean" ? { cartesSensibilisation: v.preferences.cartesSensibilisation } : { cartesSensibilisation: true }
  };
}

const MIGRATIONS_GT = { 1: migrer1vers2 };

// Amène une valeur enregistrée à la version courante. { etat } si le résultat est valide, sinon { erreur, details }.
function migrerGrandTest(v) {
  let version = versionDe(v);
  if (version === null) return { erreur: "forme inconnue", details: [] };
  if (version > GT_VERSION_SCHEMA) return { erreur: "version plus récente que ce site (" + version + ")", details: [] };
  let etat = v;
  try {
    while (version < GT_VERSION_SCHEMA) {
      const etape = MIGRATIONS_GT[version];
      if (!etape) return { erreur: "aucune migration depuis la version " + version, details: [] };
      etat = etape(etat);
      version = versionDe(etat);
    }
  } catch (e) {
    return { erreur: "migration impossible", details: [String(e && e.message)] };
  }
  const erreurs = erreursGrandTest(etat);
  return erreurs.length ? { erreur: "données invalides", details: erreurs.slice(0, 20) } : { etat };
}

// Pour l'import d'une sauvegarde (app.js, formeValide) : la valeur est-elle utilisable, après migration ?
const grandTestImportable = v => !migrerGrandTest(v).erreur;

// ===================== Passations =====================
// Opérations pures sur l'état : elles renvoient un nouvel état, ou { erreur }.

const copieProfonde = v => JSON.parse(JSON.stringify(v));

const passationEnCours = etat => etat.historiqueTests.find(t => t.dateFin === null) || null;
const passationsTerminees = etat => etat.historiqueTests.filter(t => t.dateFin !== null);

// Nouvelle passation : les instances tirées sont fournies par le tirage (voir « Tirage »)
function commencerPassation(etat, mode, graine, instances, maintenant) {
  if (passationEnCours(etat)) return { erreur: "une passation est déjà en cours" };
  const e = copieProfonde(etat);
  const id = "run-" + maintenant.replace(/[^0-9]/g, "").slice(0, 14) + "-" + graine.toString(36);
  e.historiqueTests.push({
    id, mode, graine, dateDebut: maintenant, dateFin: null,
    progression: { etape: 0, item: 0, reprise: true },
    instances: instances.map(x => ({ instanceId: x.instanceId, itemId: x.itemId, famille: x.famille, valeurs: x.valeurs || {},
      dejaVu: !!x.dejaVu, compteurTestsAvant: x.compteurTestsAvant || 0 })),
    reponses: [], scores: scoresVides(), estimationsEtape: {}, ideesFaussesCorrigees: [], entitesAffaiblies: [],
    niveau: { id: null, statut: "inconnu", calculeLe: null }, rappels: { j7: null, j30: null }, issues: []
  });
  // Au-delà du maximum, les plus anciennes passations terminées sont retirées (jamais celle en cours)
  while (e.historiqueTests.length > GT_MAX_TESTS) e.historiqueTests.splice(e.historiqueTests.findIndex(t => t.dateFin !== null), 1);
  return { etat: e, id };
}

// Enregistre une réponse validée. Une réponse déjà validée ne peut plus être modifiée.
function enregistrerReponseGT(etat, reponse) {
  const t = passationEnCours(etat);
  if (!t) return { erreur: "aucune passation en cours" };
  if (!t.instances.some(x => x.itemId === reponse.itemId)) return { erreur: "item inconnu dans cette passation" };
  if (t.reponses.some(r => r.itemId === reponse.itemId)) return { erreur: "réponse déjà validée" };
  const r = { itemId: reponse.itemId, valeur: reponse.valeur === undefined ? null : reponse.valeur,
    certitude: reponse.certitude === undefined ? null : reponse.certitude, debut: reponse.debut || null,
    valideeLe: reponse.valideeLe, dureeMs: reponse.dureeMs === undefined ? null : reponse.dureeMs };
  if (!gtValeurSimple(r.valeur) || !(r.certitude === null || GT_CERTITUDES.includes(r.certitude)) || !gtDateValide(r.valideeLe)
    || !(r.debut === null || gtDateValide(r.debut)) || !(r.dureeMs === null || gtEntier(r.dureeMs, 0, 864000000))) return { erreur: "réponse mal formée" };
  const e = copieProfonde(etat);
  const te = passationEnCours(e);
  te.reponses.push(r);
  te.progression.item = te.reponses.length;
  return { etat: e };
}

// Modifie un champ d'une passation en cours (étape atteinte, estimations, rappels…)
function majPassation(etat, modifier) {
  const e = copieProfonde(etat);
  const t = passationEnCours(e);
  if (!t) return { erreur: "aucune passation en cours" };
  modifier(t, e);
  return { etat: e };
}

// Termine la passation en cours : date de fin, et inscription de ses items au journal des vues
function terminerPassation(etat, maintenant) {
  const e = copieProfonde(etat);
  const t = passationEnCours(e);
  if (!t) return { erreur: "aucune passation en cours" };
  t.dateFin = maintenant;
  t.progression.reprise = false;
  const rang = passationsTerminees(e).length;
  t.instances.forEach(x => e.historiqueItemsVus.push({ instanceId: x.instanceId, itemId: x.itemId, famille: x.famille, runId: t.id, date: maintenant, compteurTests: rang }));
  // Journal plafonné : on retire d'abord les vues les plus anciennes
  if (e.historiqueItemsVus.length > GT_MAX_VUS) e.historiqueItemsVus.splice(0, e.historiqueItemsVus.length - GT_MAX_VUS);
  return { etat: e };
}

// Abandon explicite : la passation est retirée, ses réponses aussi ; rien d'autre ne change
function abandonnerPassation(etat) {
  const e = copieProfonde(etat);
  e.historiqueTests = e.historiqueTests.filter(t => t.dateFin !== null);
  return { etat: e };
}

// ===================== Calculs =====================
// Fonctions pures, testées seules par tests/grand_test_calculs.py contre un oracle écrit à part, en Python.
// Aucune ne produit de score global : chaque axe a sa statistique, sa plage plausible à 80 % et son nombre d'items.
// Outils d'autres fichiers, employés à l'appel : generateur() (app.js), phiInverse() (debattre.js),
// scoreFourchette() (chiffres.js).

const Z80 = 1.2816;                 // quantile 0,9 de la loi normale : plage bilatérale à 80 %
const TIRAGES_PLAGE = 2000;         // rééchantillonnages pour les plages
const ITEMS_MIN_PLAGE = 3;          // en dessous : « trop peu d'items pour estimer », aucune plage
const ITEMS_PRECISION = 8;          // en dessous : « précision faible »

const moyenneGT = t => t.length ? t.reduce((a, b) => a + b, 0) / t.length : null;

// Proportion k/n et intervalle de Wilson avec correction de continuité (Newcombe, 1998, méthode 4), au niveau
// donné par z (80 % par défaut). n = 0 : aucune valeur. Bornes ramenées à 0 si k = 0 et à 1 si k = n.
function wilsonCorrige(k, n, z = Z80) {
  if (!gtEntier(n, 0, 1e6) || !gtEntier(k, 0, n)) throw new Error("wilsonCorrige : k et n entiers, 0 ≤ k ≤ n");
  if (n === 0) return { p: null, bas: null, haut: null, n: 0 };
  const p = k / n, q = 1 - p, z2 = z * z;
  const bas = k === 0 ? 0 : (2 * n * p + z2 - 1 - z * Math.sqrt(z2 - 2 - 1 / n + 4 * p * (n * q + 1))) / (2 * (n + z2));
  const haut = k === n ? 1 : (2 * n * p + z2 + 1 + z * Math.sqrt(z2 + 2 - 1 / n + 4 * p * (n * q - 1))) / (2 * (n + z2));
  return { p, bas: Math.max(0, bas), haut: Math.min(1, haut), n };
}

// Libellé d'une proportion par rapport au hasard. Jamais de libellé pseudo-précis sur trop peu d'items.
function interpreterProportion(r, hasard) {
  if (!r || !r.n) return "non mesuré";
  if (r.n < ITEMS_MIN_PLAGE) return "trop peu d'items pour estimer";
  if (r.bas <= hasard && hasard <= r.haut) return "au niveau du hasard";
  if (r.haut < hasard) return "en dessous du hasard";
  if (r.bas > 0.75 && r.n >= ITEMS_PRECISION) return "presque sans faute";
  return "nettement au-dessus du hasard";
}

const precisionDe = n => n >= ITEMS_PRECISION ? "normale" : n >= ITEMS_MIN_PLAGE ? "faible" : "insuffisante";

// Hasard conventionnel d'un ensemble d'items : moyenne des chances de chaque item (0 pour une réponse calculée,
// 0,25 pour un QCM à quatre choix, 0,5 pour un jugement binaire). Convention de calcul, pas une performance mesurée.
function hasardConventionnel(chances) {
  return chances.length ? moyenneGT(chances) : null;
}

// Part des erreurs qui sont exactement le leurre intuitif ; null (« non calculable ») s'il n'y a aucune erreur
function partLeurre(reponses) {
  const erreurs = reponses.filter(r => !r.juste);
  return erreurs.length ? erreurs.filter(r => r.leurre).length / erreurs.length : null;
}

// Graine déterministe dérivée d'un contenu (FNV-1a, 32 bits) : mêmes réponses, mêmes plages
function graineDe(contenu) {
  const texte = typeof contenu === "string" ? contenu : JSON.stringify(contenu);
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) { h ^= texte.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// Percentile d'un tableau trié (interpolation linéaire entre rangs, type 7 de Hyndman et Fan)
function percentileTrie(tries, q) {
  if (!tries.length) return null;
  const h = (tries.length - 1) * q, b = Math.floor(h);
  return tries[b] + (h - b) * ((tries[Math.min(b + 1, tries.length - 1)]) - tries[b]);
}

function verifierTirages(tirages) {
  if (!gtEntier(tirages, 200, 5000)) throw new Error("reechantillonner : de 200 à 5 000 tirages");
}

// Rééchantillonnage (bootstrap) d'une statistique : percentiles 10 et 90 des valeurs obtenues.
// donnees : tableau ; statistique(tableau) → nombre ; alea : générateur reproductible (generateur(graine)).
// Les tirages qui donnent une valeur non définie (NaN, null) sont écartés et comptés.
function reechantillonner(donnees, statistique, tirages, alea) {
  verifierTirages(tirages);
  if (!Array.isArray(donnees) || !donnees.length) return null;
  return reechantillonnerStrates([donnees], strates => statistique(strates[0]), tirages, alea);
}

// Même chose, chaque strate rééchantillonnée séparément (ex. : vrais et faux pour d′, items de deux passations)
function reechantillonnerStrates(strates, statistique, tirages, alea) {
  verifierTirages(tirages);
  if (!strates.length || strates.some(s => !Array.isArray(s) || !s.length)) return null;
  const valeurs = [];
  let indefinis = 0;
  for (let t = 0; t < tirages; t++) {
    const echantillon = strates.map(s => s.map(() => s[Math.floor(alea() * s.length)]));
    const v = statistique(echantillon);
    if (typeof v === "number" && isFinite(v)) valeurs.push(v); else indefinis++;
  }
  if (!valeurs.length) return null;
  valeurs.sort((a, b) => a - b);
  return { bas: percentileTrie(valeurs, 0.1), haut: percentileTrie(valeurs, 0.9), tirages, indefinis };
}

// ---------- D. Discernement : détection du signal ----------
// H = (vrais jugés vrais + 0,5) / (vrais + 1), F = (faux jugés vrais + 0,5) / (faux + 1) ; d′ = z(H) − z(F) ;
// c = −(z(H) + z(F)) / 2. c > 0 : tendance à répondre « faux » ; c < 0 : tendance à répondre « vrai ».
function detectionSignal(vraisJugesVrais, nVrais, fauxJugesVrais, nFaux) {
  if (!gtEntier(nVrais, 1, 1000) || !gtEntier(nFaux, 1, 1000) || !gtEntier(vraisJugesVrais, 0, nVrais) || !gtEntier(fauxJugesVrais, 0, nFaux)) return null;
  const h = (vraisJugesVrais + 0.5) / (nVrais + 1), f = (fauxJugesVrais + 0.5) / (nFaux + 1);
  const zh = phiInverse(h), zf = phiInverse(f);
  return { d: zh - zf, c: -(zh + zf) / 2, h, f };
}

// d′ et c avec leurs plages : vrais et faux rééchantillonnés séparément. jugements : [{ vrai, repondVrai }]
function discernement(jugements, graine) {
  const vrais = jugements.filter(j => j.vrai).map(j => j.repondVrai ? 1 : 0);
  const faux = jugements.filter(j => !j.vrai).map(j => j.repondVrai ? 1 : 0);
  if (!vrais.length || !faux.length) return null;
  const somme = t => t.reduce((a, b) => a + b, 0);
  const ds = detectionSignal(somme(vrais), vrais.length, somme(faux), faux.length);
  const plageD = reechantillonnerStrates([vrais, faux], ([v, x]) => detectionSignal(somme(v), v.length, somme(x), x.length).d, TIRAGES_PLAGE, generateur(graine));
  const plageC = reechantillonnerStrates([vrais, faux], ([v, x]) => detectionSignal(somme(v), v.length, somme(x), x.length).c, TIRAGES_PLAGE, generateur(graine + 1));
  return Object.assign(ds, { plageD, plageC, nVrais: vrais.length, nFaux: faux.length });
}

// ---------- E. Étalonnage ----------
// reponses : [{ p (certitude, de 0 à 1), o (1 si juste, 0 sinon) }]
function brier(reponses) {
  if (!reponses.length) return null;
  const score = moyenneGT(reponses.map(r => (r.p - r.o) ** 2));
  return { score, surconfiance: moyenneGT(reponses.map(r => r.p)) - moyenneGT(reponses.map(r => r.o)), n: reponses.length };
}

// Décomposition de Murphy (1973), une classe par niveau de certitude annoncé :
// Brier = fiabilité − résolution + incertitude, exactement, puisque toutes les prévisions d'une classe sont égales.
function murphy(reponses) {
  if (!reponses.length) return null;
  const n = reponses.length, obar = moyenneGT(reponses.map(r => r.o));
  const classes = {};
  reponses.forEach(r => { (classes[r.p] = classes[r.p] || []).push(r.o); });
  let fiabilite = 0, resolution = 0;
  const parNiveau = Object.keys(classes).map(Number).sort((a, b) => a - b).map(p => {
    const os = classes[p], ok = moyenneGT(os);
    fiabilite += os.length / n * (p - ok) ** 2;
    resolution += os.length / n * (ok - obar) ** 2;
    return { p, n: os.length, justes: os.reduce((a, b) => a + b, 0), taux: ok };
  });
  const incertitude = obar * (1 - obar);
  return { fiabilite, resolution, incertitude, somme: fiabilite - resolution + incertitude, parNiveau };
}

// Surconfiance avec sa plage (points de pourcentage) : rééchantillonnage des réponses
function surconfiancePlage(reponses, graine) {
  const b = brier(reponses);
  if (!b) return null;
  const plage = reechantillonner(reponses, t => brier(t).surconfiance, TIRAGES_PLAGE, generateur(graine));
  return { valeur: b.surconfiance, plage, n: b.n };
}

// Fourchettes : couverture observée et score d'intervalle du site (scoreFourchette, α = 0,1 : fourchettes à 90 %).
// items : [{ q: { v, unite }, bas, haut }]. Échelle log₁₀ pour les grandeurs positives, siècles pour les années.
function bilanFourchettes(items) {
  if (!items.length) return null;
  const dedans = items.filter(x => x.bas <= x.q.v && x.q.v <= x.haut).length;
  return { k: dedans, n: items.length, couverture: wilsonCorrige(dedans, items.length), score: moyenneGT(items.map(x => scoreFourchette(x.q, x.bas, x.haut, 0.1))) };
}

// ---------- Démonstrations (jamais notées) ----------

// Biais rétrospectif : rapprochement du souvenir vers la vraie valeur, borné à [−1, 1] ; null si l'estimation
// initiale était exacte. Échelle logarithmique pour les grandeurs positives, linéaire pour les années.
function rapprochement(estimation, vraie, souvenir, echelle) {
  const t = echelle === "log" ? x => Math.log10(x) : x => x;
  if (echelle === "log" && !(estimation > 0 && vraie > 0 && souvenir > 0)) return null;
  const e = t(estimation), v = t(vraie), r = t(souvenir);
  const ecart = Math.abs(e - v);
  if (ecart < 1e-12) return null;
  return Math.max(-1, Math.min(1, (ecart - Math.abs(r - v)) / ecart));
}

// Vérité illusoire : écart moyen de note entre affirmations déjà lues et nouvelles (toutes, puis fausses seules).
// notes : [{ expose, vrai, note }]
function veriteIllusoire(notes) {
  const ecart = t => {
    const a = t.filter(x => x.expose).map(x => x.note), b = t.filter(x => !x.expose).map(x => x.note);
    return a.length && b.length ? moyenneGT(a) - moyenneGT(b) : null;
  };
  return { toutes: ecart(notes), fausses: ecart(notes.filter(x => !x.vrai)), n: notes.length };
}

// Angle mort : moyenne « la plupart des gens » moins moyenne « moi ». Un écart d'auto-perception, rien d'autre.
function angleMort(reponses) {
  if (!reponses.length) return null;
  return moyenneGT(reponses.map(r => r.autres)) - moyenneGT(reponses.map(r => r.moi));
}

// Surestimation d'une étape : réussite estimée avant l'étape moins réussite observée (en points)
const surestimation = (estimee, observee) => estimee === null || observee === null ? null : estimee - observee;

// ---------- F. Impartialité (indicateurs exploratoires) ----------
// questions : [{ position: "pour" | "contre" | null, notes: [{ camp, qualite: "solide" | "faible", note }] }]
function indiceCamp(questions) {
  const avecPosition = questions.filter(q => q.position === "pour" || q.position === "contre");
  if (!avecPosition.length) return { indice: null, raison: "aucune position choisie" };
  const siens = [], autres = [];
  avecPosition.forEach(q => q.notes.forEach(x => (x.camp === q.position ? siens : autres).push(x.note)));
  if (!siens.length || !autres.length) return { indice: null, raison: "notes incomplètes" };
  return { indice: moyenneGT(siens) - moyenneGT(autres), n: siens.length + autres.length };
}

function sensibiliteQualite(questions) {
  const toutes = [].concat(...questions.map(q => q.notes));
  const s = toutes.filter(x => x.qualite === "solide").map(x => x.note), f = toutes.filter(x => x.qualite === "faible").map(x => x.note);
  return s.length && f.length ? moyenneGT(s) - moyenneGT(f) : null;
}

// Biais de croyance : taux de « valide » pour les conclusions crédibles moins pour les non crédibles.
// jugements : [{ credible, repondValide }]
function biaisCroyance(jugements) {
  const taux = t => t.length ? t.filter(x => x.repondValide).length / t.length : null;
  const c = taux(jugements.filter(j => j.credible)), nc = taux(jugements.filter(j => !j.credible));
  return c === null || nc === null ? null : c - nc;
}

// ---------- Sur-correction ----------
// Part des situations où la preuve permettait de conclure et où la réponse l'a rejetée par principe.
// situations : [{ preuveSuffisante, rejet }]
function surCorrection(situations) {
  const concluantes = situations.filter(s => s.preuveSuffisante);
  return concluantes.length ? { indice: concluantes.filter(s => s.rejet).length / concluantes.length, n: concluantes.length } : null;
}

// ---------- Comparaisons et tendances ----------
// Différence de réussite entre deux passations (b − a), items de chacune rééchantillonnés séparément.
// « Progrès net » ou « recul net » seulement si la plage à 80 % exclut zéro.
function comparerPassations(a, b, graine) {
  if (!a.length || !b.length) return null;
  const difference = moyenneGT(b) - moyenneGT(a);
  const plage = reechantillonnerStrates([a, b], ([x, y]) => moyenneGT(y) - moyenneGT(x), TIRAGES_PLAGE, generateur(graine));
  const verdict = plage.bas > 0 ? "progrès net" : plage.haut < 0 ? "recul net" : "pas de changement net mesurable";
  return { difference, plage, verdict };
}

// Pente (moindres carrés) d'une série de proportions selon le rang de la passation
function pente(valeurs) {
  const n = valeurs.length, xm = (n - 1) / 2, ym = moyenneGT(valeurs);
  let num = 0, den = 0;
  valeurs.forEach((y, x) => { num += (x - xm) * (y - ym); den += (x - xm) ** 2; });
  return den ? num / den : null;
}

// Tendance sur des passations comparables : règle fixée d'avance. Moins de trois passations : rien n'est annoncé.
// Sinon, plage à 80 % de la pente par rééchantillonnage des items de chaque passation ; si elle contient zéro,
// « tendance non mesurable ». series : [[0/1 par item] par passation, dans l'ordre].
function tendance(series, graine) {
  if (series.length < 3 || series.some(s => !s.length)) return { verdict: "pas assez de tests comparables", pente: null, plage: null };
  const p = pente(series.map(moyenneGT));
  const plage = reechantillonnerStrates(series, ech => pente(ech.map(moyenneGT)), TIRAGES_PLAGE, generateur(graine));
  const verdict = plage.bas > 0 ? "tendance à la hausse" : plage.haut < 0 ? "tendance à la baisse" : "tendance non mesurable";
  return { verdict, pente: p, plage };
}

// Entité « affaiblie dans vos réponses » : au moins trois items distincts liés dans chacune de deux passations
// comparables, aucune instance répétée, et plage à 80 % de la baisse du taux d'erreur entièrement au-dessus de zéro.
// avant, apres : [{ instanceId, erreur (0/1) }]
function entiteAffaiblie(avant, apres, graine) {
  const ids = t => new Set(t.map(x => x.instanceId));
  if (ids(avant).size < 3 || ids(apres).size < 3) return { affaiblie: false, raison: "moins de trois items par test" };
  if ([...ids(apres)].some(i => ids(avant).has(i))) return { affaiblie: false, raison: "items répétés" };
  const a = avant.map(x => x.erreur), b = apres.map(x => x.erreur);
  const plage = reechantillonnerStrates([a, b], ([x, y]) => moyenneGT(x) - moyenneGT(y), TIRAGES_PLAGE, generateur(graine));
  return plage.bas > 0 ? { affaiblie: true, baisse: moyenneGT(a) - moyenneGT(b), plage } : { affaiblie: false, raison: "évolution non mesurable", plage };
}

// ===================== Générateurs d'items =====================
// Table fermée : une famille de grand-test-donnees.js nomme son générateur (champ « generer ») ; aucun code ne vient
// des données. Un générateur est une fonction pure (famille, i) → item, où i (de 0 à tailleFamille(f) − 1) désigne
// l'instance. La bonne réponse et le leurre sont CALCULÉS à partir des valeurs ; l'ordre des choix d'un QCM est tiré
// ensuite (instanceGT). Item : { type, texte, question, choix, juste, leurre, unite, explication, valeurs, chances }.
// Pour un QCM, juste et leurre sont des rangs dans « choix » (ordre canonique) ; pour un calcul, des nombres ;
// pour un raisonnement (binaire), des booléens (« valide »).

// Nombre à la française, sans dépendre d'Intl : virgule décimale, espace fine insécable entre les milliers
function nombreGT(x, decimales) {
  const d = decimales === undefined ? (Number.isInteger(x) ? 0 : 1) : decimales;
  const [entier, frac] = Math.abs(x).toFixed(d).split(".");
  const groupes = entier.length > 3 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : entier;
  return (x < 0 ? "−" : "") + groupes + (frac && Number(frac) !== 0 ? "," + frac.replace(/0+$/, "") : "");
}
const pourcentGT = x => nombreGT(x) + " %";
const majuscule = t => t.charAt(0).toUpperCase() + t.slice(1);
const elision = (mot, suite) => /^[aeiouyhâéèêîôœ]/i.test(suite) ? mot.slice(0, -1) + "'" + suite : mot + " " + suite;
// Élisions oubliées par l'assemblage des gabarits : « que une » → « qu'une », « de Adam » → « d'Adam »
const elisions = t => t.replace(/\b([Qq]u|[Dd])e (?=[aeiouàâéèêëîïôûœAEIOUÉÈÎ])/g, "$1'");

// Prénom d'une instance, décalé selon la famille pour varier les surfaces
const prenomGT = (i, decalage) => PRENOMS_GT[(i * 7 + (decalage || 0)) % PRENOMS_GT.length];

// Accords d'un texte selon le genre de la personne : {p} prénom, {Il} {il} {lui}, {e}, {er} (-er/-ère), {ne}, {r} (-r/-se)
function accorder(texte, prenom, genre) {
  const f = genre === "f";
  return texte.replace(/\{p\}/g, prenom).replace(/\{Il\}/g, f ? "Elle" : "Il").replace(/\{il\}/g, f ? "elle" : "il")
    .replace(/\{lui\}/g, f ? "elle" : "lui").replace(/\{e\}/g, f ? "e" : "").replace(/\{er\}/g, f ? "ère" : "er")
    .replace(/\{ne\}/g, f ? "ne" : "").replace(/\{r\}/g, f ? "se" : "r").replace(/\{son\}/g, "son");
}

// Remplace {cle} par la valeur du champ ; {Cle} par la même valeur avec une majuscule
function remplir(texte, valeurs) {
  return texte.replace(/\{([A-Za-z0-9]+)\}/g, (m, cle) => {
    const v = valeurs[cle] !== undefined ? valeurs[cle] : valeurs[cle.charAt(0).toLowerCase() + cle.slice(1)];
    if (v === undefined) return m;
    const t = typeof v === "number" ? nombreGT(v) : String(v);
    return /^[A-Z]/.test(cle) && valeurs[cle] === undefined ? majuscule(t) : t;
  });
}

// Liste de surfaces d'une famille (directe, ou nom d'une liste partagée)
const LISTES_PARTAGEES_GT = () => ({ SURFACES_DETECTION });
const surfacesDe = f => typeof f.surfaces === "string" ? LISTES_PARTAGEES_GT()[f.surfaces] : f.surfaces;

// Les raisonnements : énumère les instances d'une forme et d'une crédibilité à partir de la taxonomie
function instancesSyllogisme(f) {
  const T = TAXONOMIE_GT, liste = [];
  T.forEach((g, gi) => g.sous.forEach((s, si) => s.membres.forEach(m => {
    const autreGroupe = T[(gi + 1 + si) % T.length], soeur = g.sous[1 - si];
    if (f.forme === "chaine") liste.push(f.credible ? { a: m, b: s.b, c: g.c } : { a: m, b: autreGroupe.sous[si].b, c: autreGroupe.c });
    if (f.forme === "exclusion") liste.push(f.credible ? { a: m, b: s.b, c: autreGroupe.c } : { a: m, b: autreGroupe.sous[si].b, c: g.c });
    if (f.forme === "moyen") liste.push(f.credible ? { a: m, b: s.b, c: g.c } : { a: m, b: soeur.b, c: g.c });
    if (f.forme === "certains") liste.push(f.credible ? { a: m, b: s.b, c: g.c } : { a: m, b: soeur.b, c: g.c });
  })));
  return liste;
}

function tailleFamille(f) {
  if (f.generer === "syllogisme") return instancesSyllogisme(f).length;
  return surfacesDe(f).length;
}

const tous = ([nom, fem]) => (fem ? "Toutes les " : "Tous les ") + nom;
const certains = ([nom, fem]) => (fem ? "Certaines " : "Certains ") + nom;

const GENERATEURS_GT = {
  // ---------- Axe A ----------
  vitesseMoyenne(f, i) {
    const [a, b] = f.nombres[i % f.nombres.length], [prenom, genre] = prenomGT(i, 1);
    const juste = 2 * a * b / (a + b), leurre = (a + b) / 2;
    return {
      type: "calcul", unite: "km/h",
      texte: accorder("{p} " + f.surfaces[i] + ". À l'aller, sa vitesse moyenne est de " + a + " km/h ; au retour, par le même chemin, de " + b + " km/h.", prenom, genre),
      question: "Quelle est sa vitesse moyenne sur l'ensemble de l'aller-retour ?",
      juste, leurre, valeurs: { a, b },
      explication: "Le trajet le plus lent dure plus longtemps : il pèse davantage dans la moyenne. Pour une distance d, le temps total est d/" + a + " + d/" + b + ", et la vitesse moyenne vaut 2d divisé par ce temps, soit " + nombreGT(juste) + " km/h. La moyenne simple, " + nombreGT(leurre) + " km/h, oublie que l'on passe plus de temps à " + a + " km/h."
    };
  },
  hausseBaisse(f, i) {
    const [base, p] = f.nombres[i % f.nombres.length], [objet] = f.surfaces[i];
    const juste = Math.round(base * (1 + p / 100) * (1 - p / 100) * 100) / 100, hausse = base * (1 + p / 100);
    return {
      type: "calcul", unite: "€",
      texte: objet + " est de " + nombreGT(base) + " €. Il augmente de " + p + " %, puis, le mois suivant, baisse de " + p + " %.",
      question: "Quelle est sa valeur finale, en euros ?",
      juste, leurre: base, valeurs: { base, p },
      explication: "La baisse s'applique à la valeur déjà augmentée, " + nombreGT(hausse) + " €, et non à " + nombreGT(base) + " €. " + p + " % de " + nombreGT(hausse) + " € font plus que " + p + " % de " + nombreGT(base) + " € : on finit plus bas qu'au départ, à " + nombreGT(juste) + " €."
    };
  },
  piquets(f, i) {
    const [longueur, pas] = f.nombres[i % f.nombres.length], [lieu, pluriel, singulier] = f.surfaces[i];
    const n = longueur / pas;
    return {
      type: "calcul", unite: pluriel.replace(/^des /, ""),
      texte: lieu + " mesure " + longueur + " mètres. On y place " + singulier + " tous les " + pas + " mètres, d'un bout à l'autre, avec " + singulier + " à chaque extrémité.",
      question: "Combien en faut-il en tout ?",
      juste: n + 1, leurre: n, valeurs: { longueur, pas },
      explication: longueur + " mètres font " + n + " intervalles de " + pas + " mètres. Il faut une borne de plus que d'intervalles, puisque les deux bouts en ont une : " + (n + 1) + ". Faire un petit dessin avec trois intervalles suffit à le voir."
    };
  },
  moyennePonderee(f, i) {
    const [n1, m1, n2, m2] = f.nombres[i % f.nombres.length], [cadre, g1, g2, mesure, unite] = f.surfaces[i];
    const juste = (n1 * m1 + n2 * m2) / (n1 + n2), leurre = (m1 + m2) / 2;
    return {
      type: "calcul", unite,
      texte: cadre + ", " + mesure + " est de " + m1 + " " + unite + " pour les " + n1 + " " + g1 + ", et de " + m2 + " " + unite + " pour les " + n2 + " " + g2 + ".",
      question: "Quelle est la moyenne pour les " + (n1 + n2) + " réunis ?",
      juste, leurre, valeurs: { n1, m1, n2, m2 },
      explication: "Le groupe le plus nombreux compte davantage : il faut pondérer par les effectifs. (" + n1 + " × " + m1 + " + " + n2 + " × " + m2 + ") ÷ " + (n1 + n2) + " = " + nombreGT(juste) + ". La moyenne des deux moyennes, " + nombreGT(leurre) + ", traite les deux groupes comme s'ils avaient la même taille."
    };
  },
  porteeNegation(f, i) {
    const [groupe, fem, positif, negatifUn, negatifAucun] = f.surfaces[i];
    const [Tous, Aucun, Certains, un] = fem ? ["Toutes", "Aucune", "Certaines", "une"] : ["Tous", "Aucun", "Certains", "un"];
    return {
      type: "qcm",
      texte: "Une affirmation circule : « " + Tous + " les " + groupe + " " + positif + ". » On apprend qu'elle est fausse.",
      question: "Que peut-on en conclure avec certitude ?",
      choix: ["Au moins " + un + " des " + groupe + " " + negatifUn + ".", Aucun + " des " + groupe + " " + negatifAucun + ".",
        Certains + " des " + groupe + " " + positif + ".", Tous + " les " + groupe + " " + positif + ", sauf " + un + "."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Pour qu'« tous » soit faux, il suffit d'une seule exception. On sait donc qu'au moins " + un + " fait exception. On ne sait ni combien d'exceptions il y a, ni s'il en reste qui conviennent."
    };
  },
  presuppose(f, i) {
    const [texte, question, fait, raisons] = f.surfaces[i];
    return {
      type: "qcm",
      texte: texte + " Question posée : « " + question + " »",
      question: "Quelle est la meilleure réponse ?",
      choix: ["Le texte ne dit pas que " + fait + " : la question suppose un fait qui n'est pas établi.", raisons[0], raisons[1], raisons[2]],
      juste: 0, leurre: 1, valeurs: {},
      explication: "La question glisse un fait que rien n'établit : " + fait + ". Chercher une raison, c'est accepter ce fait sans preuve. Avant de répondre à « pourquoi ? », vérifiez que la chose s'est bien produite."
    };
  },
  relations(f, i) {
    const [posM, posF, negM, negF] = f.surfaces[i];
    const p = [prenomGT(i, 2), prenomGT(i, 3), prenomGT(i, 4)];
    const pos = q => q[1] === "f" ? posF : posM, neg = q => q[1] === "f" ? negF : negM;
    return {
      type: "qcm",
      texte: p[0][0] + " est moins " + pos(p[0]) + " que " + p[1][0] + ". " + p[1][0] + " est plus " + neg(p[1]) + " que " + p[2][0] + ".",
      question: "Laquelle de ces trois personnes est la plus " + posF + " ?",
      choix: [p[2][0], p[0][0], p[1][0], "On ne peut pas le savoir avec ces informations."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Remettez les deux phrases dans le même sens : " + p[0][0] + " est moins " + pos(p[0]) + " que " + p[1][0] + ", et " + p[1][0] + " moins " + pos(p[1]) + " que " + p[2][0] + ". L'ordre est donc " + p[0][0] + ", " + p[1][0] + ", " + p[2][0] + ". Lire « moins » et « plus " + negM + " » trop vite inverse le classement."
    };
  },
  seulementSi(f, i) {
    const [regle, action, condition, infinitif] = f.surfaces[i], [prenom, genre] = prenomGT(i, 5);
    const fait = accorder("{p} " + action, prenom, genre);
    return {
      type: "qcm",
      texte: regle + " " + accorder("{p} " + condition + ".", prenom, genre),
      question: "Que peut-on en conclure ?",
      choix: ["On ne peut pas savoir si " + fait + ".", fait + ".", elision(prenom + " n'a pas le droit de", infinitif) + ".", "Tout le monde peut désormais " + infinitif + "."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "« On ne peut … que si … » donne une condition nécessaire : sans elle, impossible ; avec elle, rien n'est garanti. " + accorder("{p} " + condition, prenom, genre) + ", mais rien ne dit que " + fait + ". Conclure le contraire revient à lire « si » à la place de « seulement si »."
    };
  },
  syllogisme(f, i) {
    const x = instancesSyllogisme(f)[i];
    let premisses, conclusion;
    if (f.forme === "chaine") { premisses = [tous(x.a) + " sont des " + x.b[0] + ".", tous(x.b) + " sont des " + x.c[0] + "."]; conclusion = "Donc " + tous(x.a).toLowerCase() + " sont des " + x.c[0] + "."; }
    if (f.forme === "exclusion") { premisses = [tous(x.a) + " sont des " + x.b[0] + ".", "Les " + x.b[0] + " ne sont jamais des " + x.c[0] + "."]; conclusion = "Donc les " + x.a[0] + " ne sont jamais des " + x.c[0] + "."; }
    if (f.forme === "moyen") { premisses = [tous(x.a) + " sont des " + x.c[0] + ".", tous(x.b) + " sont des " + x.c[0] + "."]; conclusion = "Donc " + tous(x.a).toLowerCase() + " sont des " + x.b[0] + "."; }
    if (f.forme === "certains") { premisses = [tous(x.a) + " sont des " + x.c[0] + ".", certains(x.c) + " sont des " + x.b[0] + "."]; conclusion = "Donc " + certains(x.a).toLowerCase() + " sont des " + x.b[0] + "."; }
    const explications = {
      chaine: "Si tous les premiers sont inclus dans les seconds, et les seconds dans les troisièmes, les premiers le sont forcément dans les troisièmes : le raisonnement est valide, quel que soit le sujet.",
      exclusion: "Si tous les premiers sont dans un ensemble qui n'a rien de commun avec un troisième, les premiers n'ont rien de commun avec lui non plus : le raisonnement est valide, quel que soit le sujet.",
      moyen: "Deux groupes peuvent appartenir au même grand ensemble sans que l'un soit inclus dans l'autre : le raisonnement n'est pas valide, même quand la conclusion est vraie.",
      certains: "Les « certains » dont parle la deuxième phrase ne sont peut-être pas ceux de la première : le raisonnement n'est pas valide, même quand la conclusion est vraie."
    };
    const croyance = f.credible ? "La conclusion paraît " + (f.credible ? "vraie" : "fausse") + " ; " : "La conclusion paraît fausse ; ";
    return {
      type: "binaire",
      texte: premisses.join(" ") + " " + conclusion,
      question: "Supposez que les deux premières phrases sont vraies, même si elles vous semblent fausses. La conclusion en découle-t-elle nécessairement ?",
      choix: ["Oui, le raisonnement est valide", "Non, il n'est pas valide"],
      juste: f.valide, leurre: f.valide === f.credible ? null : f.credible,
      valeurs: { credible: f.credible }, credible: f.credible,
      explication: explications[f.forme] + " " + croyance + "seule compte la forme du raisonnement."
    };
  },

  // ---------- Axe B ----------
  tauxDeBase(f, i) {
    const [prev, sens, fp] = f.nombres[i % f.nombres.length];
    const [cadre, cherche, appareil, ensemble] = surfacesDe(f)[(i + (f.decalage || 0)) % surfacesDe(f).length];
    const vrais = 100 * prev * sens / 100, faux = (10000 - 100 * prev) * fp / 100, juste = Math.round(100 * vrais / (vrais + faux));
    const leurre = f.prevalence === "faible" ? sens : prev;
    // Distracteurs : d'autres nombres du texte, puis des valeurs de repli, tous différents
    const candidats = (f.prevalence === "faible" ? [100 - fp, 50, 75, 25] : [Math.round(prev * sens / 100), 100 - sens, 30, 20]).filter(v => v !== juste && v !== leurre);
    const autres = [...new Set(candidats)].slice(0, 2);
    return {
      type: "qcm",
      texte: cadre + ", on veut repérer " + cherche + " : c'est le cas, en moyenne, de " + pourcentGT(prev) + " " + ensemble.replace(/^les /, "des ") + ". " + appareil + " donne l'alerte pour " + pourcentGT(sens) + " des cas recherchés, mais aussi, à tort, pour " + pourcentGT(fp) + " des autres.",
      question: "Le dispositif donne l'alerte. Quelle est, à peu près, la probabilité qu'il s'agisse vraiment " + elision("de", cherche) + " ?",
      choix: ["Environ " + pourcentGT(juste), "Environ " + pourcentGT(leurre), "Environ " + pourcentGT(autres[0]), "Environ " + pourcentGT(autres[1])],
      juste: 0, leurre: 1, valeurs: { prev, sens, fp },
      explication: "Sur 10 000 cas, " + nombreGT(100 * prev) + " sont concernés : l'alerte en signale " + nombreGT(vrais) + ". Sur les " + nombreGT(10000 - 100 * prev) + " autres, elle en signale à tort " + nombreGT(faux) + ". Sur " + nombreGT(vrais + faux) + " alertes, " + nombreGT(vrais) + " correspondent donc à de vrais cas, soit environ " + pourcentGT(juste) + (f.prevalence === "faible" ? " : ce qui est rare reste rare, même après une alerte." : " : quand ce que l'on cherche est fréquent, une alerte est le plus souvent juste.")
    };
  },
  conjonction(f, i) {
    const [portrait, a, b, c] = f.surfaces[i], [prenom, genre] = prenomGT(i, 6);
    const P = accorder(portrait, prenom, genre), dire = t => accorder("{p} " + t, prenom, genre);
    return {
      type: "qcm",
      texte: P,
      question: "Laquelle de ces affirmations est la plus probable ?",
      choix: [dire(a) + ".", dire(a) + " et " + accorder(b, prenom, genre) + ".", dire(a) + " et " + accorder(c, prenom, genre) + ".", dire(a) + ", " + accorder(b, prenom, genre) + " et " + accorder(c, prenom, genre) + "."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Chaque option qui ajoute une condition décrit un cas particulier de la première : elle ne peut pas être plus probable. Le portrait rend le second trait plausible, mais il faut en plus que la première affirmation soit vraie. Plus une description est détaillée, moins elle est probable, même si elle paraît plus vraisemblable."
    };
  },
  echantillon(f, i) {
    const [n1, n2, seuil] = f.nombres[i % f.nombres.length], [deux, grand, petit, unites, evenement] = f.surfaces[i];
    return {
      type: "qcm",
      texte: "On compare " + deux + ". Chaque jour, " + grand.charAt(0).toLowerCase() + grand.slice(1) + " voit passer environ " + n1 + " " + unites + ", " + petit.charAt(0).toLowerCase() + petit.slice(1) + " environ " + n2 + ". Chacun, indépendamment des autres, " + evenement + " une fois sur deux.",
      question: "Sur une année, où compte-t-on le plus de jours où cette proportion dépasse " + seuil + " % ?",
      choix: [petit, grand, "À peu près autant dans les deux", "Impossible à dire sans connaître les jours de la semaine"],
      juste: 0, leurre: 2, valeurs: { n1, n2, seuil },
      explication: "Plus un échantillon est petit, plus sa proportion s'écarte souvent de la moyenne : avec " + n2 + " personnes, quelques choix suffisent à dépasser " + seuil + " %. Avec " + n1 + ", les écarts se compensent. Les résultats extrêmes viennent donc plus souvent des petits échantillons."
    };
  },
  regression(f, i) {
    const [t1, t2, b1, b2] = f.nombres[i % f.nombres.length], [epreuve, participants] = f.surfaces[i];
    return {
      type: "qcm",
      texte: "Lors de " + epreuve + ", on suit les 10 % des " + participants + " qui ont le mieux réussi la première. En moyenne, ils passent de " + t1 + " à " + t2 + " points. Les 10 % les moins bons, eux, passent de " + b1 + " à " + b2 + " points. La moyenne de l'ensemble est la même aux deux.",
      question: "Quelle est l'explication la plus probable ?",
      choix: ["Le premier résultat mêlait niveau et chance ; la chance ne se répète pas, et les extrêmes se rapprochent de la moyenne.",
        "Les meilleurs se sont relâchés après leur succès.", "La seconde fois était plus difficile pour tout le monde.", "Les moins bons ont copié les meilleurs."],
      juste: 0, leurre: 1, valeurs: { t1, t2, b1, b2 },
      explication: "Un très bon résultat tient au niveau, mais aussi à la chance du jour, qui ne se reproduit pas forcément. Les meilleurs baissent et les moins bons remontent, alors que la moyenne générale ne bouge pas : c'est la régression vers la moyenne. Elle ne demande aucune explication psychologique."
    };
  },
  risqueRelatif(f, i) {
    const [n, hausse] = f.nombres[i % f.nombres.length], [facteur, evenement, population] = f.surfaces[i];
    const juste = n * hausse / 100, leurre = hausse * 100;
    return {
      type: "qcm",
      texte: "Une étude (fictive) annonce : « " + majuscule(facteur) + " augmente de " + hausse + " % le risque de " + evenement + ". » Sans cela, ce risque concerne " + n + " " + population + " sur 10 000.",
      question: "Pour 10 000 " + population + " concernés, combien de cas en plus faut-il attendre ?",
      choix: [nombreGT(juste) + " cas", nombreGT(leurre) + " cas", nombreGT(n + juste) + " cas", nombreGT(n * hausse) + " cas"],
      juste: 0, leurre: 1, valeurs: { n, hausse },
      explication: "« +" + hausse + " % » est une hausse relative : elle s'applique aux " + n + " cas habituels. " + hausse + " % de " + n + " font " + nombreGT(juste) + " cas de plus sur 10 000, soit " + nombreGT(n + juste) + " au total. Un risque rare reste rare, même quand il augmente beaucoup en pourcentage."
    };
  },
  esperance(f, i) {
    const [mise, gain, k] = f.nombres[i % f.nombres.length], jeu = f.surfaces[i];
    const juste = gain / k - mise, signe = v => (v > 0 ? "+" : "") + nombreGT(v) + " €";
    return {
      type: "qcm",
      texte: "À " + jeu + ", une partie coûte " + mise + " €. On reçoit " + gain + " € avec une chance sur " + k + ", et rien sinon ; la mise n'est jamais rendue.",
      question: "En moyenne, combien gagne-t-on (ou perd-on) par partie ?",
      choix: [signe(juste), signe(gain - mise), signe(gain / k), signe(-mise)],
      juste: 0, leurre: 1, valeurs: { mise, gain, k },
      explication: "En moyenne, une partie rapporte " + gain + " € × 1/" + k + " = " + nombreGT(gain / k) + " €, et coûte toujours " + mise + " €. Le bilan moyen est donc de " + signe(juste) + " par partie. Le gain affiché, " + gain + " €, n'arrive qu'une fois sur " + k + "."
    };
  },
  simpson(f, i) {
    const [a1, na1, a2, na2, b1, nb1, b2, nb2] = f.nombres[i % f.nombres.length], [titre, succes, g1, g2] = f.surfaces[i];
    const pc = (k, n) => pourcentGT(Math.round(100 * k / n));
    return {
      type: "qcm",
      texte: "On a comparé " + titre.charAt(0).toLowerCase() + titre.slice(1) + " (" + succes + "). Méthode A : " + a1 + " sur " + na1 + " pour les " + g1 + ", " + a2 + " sur " + na2 + " pour les " + g2 + ", soit " + (a1 + a2) + " sur " + (na1 + na2) + " au total. Méthode B : " + b1 + " sur " + nb1 + " pour les " + g1 + ", " + b2 + " sur " + nb2 + " pour les " + g2 + ", soit " + (b1 + b2) + " sur " + (nb1 + nb2) + " au total.",
      question: "Pour les " + g1 + " comme pour les " + g2 + ", quelle méthode réussit le mieux ?",
      choix: ["La méthode A", "La méthode B", "Les deux font aussi bien", "Cela dépend du nombre total de cas"],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Groupe par groupe, A fait mieux : " + pc(a1, na1) + " contre " + pc(b1, nb1) + ", puis " + pc(a2, na2) + " contre " + pc(b2, nb2) + ". Au total, B semble meilleure parce qu'elle a surtout traité les cas faciles. C'est le paradoxe de Simpson : un total peut inverser ce que montre chaque groupe."
    };
  },
  joueur(f, i) {
    const [objet, issue, k, n] = f.surfaces[i];
    const chance = "1 chance sur " + k;
    return {
      type: "qcm",
      texte: objet + " vient de tomber sur " + issue + " " + n + " fois de suite.",
      question: "Au coup suivant, quelle est la probabilité de tomber de nouveau sur " + issue + " ?",
      choix: [majuscule(chance), "Moins de " + chance + " : une telle série doit s'interrompre", "Plus de " + chance + " : la série est lancée", "Cela dépend du nombre total de coups déjà joués"],
      juste: 0, leurre: 1, valeurs: { k, n },
      explication: "Chaque coup est indépendant : l'objet n'a pas de mémoire et ne « rattrape » rien. La probabilité reste de " + chance + ", série ou pas. Les longues séries sont d'ailleurs plus fréquentes au hasard qu'on ne le croit."
    };
  },
  denominateur(f, i) {
    const [part, evenement, groupe, conclusion, ensemble] = f.surfaces[i];
    return {
      type: "qcm",
      texte: part + " % " + evenement + " concernent " + groupe + ". Quelqu'un en conclut que " + conclusion + ".",
      question: "Que faut-il savoir pour juger cette conclusion ?",
      choix: ["La part " + elision("de", groupe.replace(/^des /, "")) + " parmi les " + ensemble + ".", "Rien de plus : " + part + " %, c'est une nette majorité.",
        "Le nombre total de cas recensés.", "La date à laquelle ces chiffres ont été publiés."],
      juste: 0, leurre: 1, valeurs: { part },
      explication: "Si " + groupe.replace(/^des /, "les ") + " représentent déjà " + part + " % des " + ensemble + ", ce chiffre ne montre rien de particulier. Il faut comparer la part des cas à la part du groupe dans l'ensemble. Sans ce dénominateur, la conclusion ne tient pas."
    };
  },
  unites(f, i) {
    const [objet, verbe, options] = f.surfaces[i];
    const base = options.map(([v, , facteur]) => v * facteur), texteOpt = ([v, u]) => nombreGT(v, 3) + " " + u;
    const juste = base.indexOf(Math.max(...base)), leurre = options.map(o => o[0]).indexOf(Math.max(...options.map(o => o[0])));
    const ordre = [juste, leurre, ...[0, 1, 2, 3].filter(k => k !== juste && k !== leurre)];
    const pluriel = objet.split(" ").map((m, k) => k === 0 && !/[sx]$/.test(m) ? m + "s" : m).join(" ");
    return {
      type: "qcm",
      texte: "On compare quatre " + pluriel + " : voici leurs mesures.",
      question: "Laquelle de ces quatre mesures est la plus grande ?",
      choix: ordre.map(k => texteOpt(options[k])),
      juste: 0, leurre: 1, valeurs: {},
      explication: "Il faut tout convertir dans la même unité avant de comparer : le plus grand nombre n'est pas forcément la plus grande quantité. Ici, " + texteOpt(options[juste]) + " l'emporte. " + texteOpt(options[leurre]) + " affiche le plus grand nombre, dans une unité plus petite."
    };
  },
  pointsPourcents(f, i) {
    const [a, b] = f.nombres[i % f.nombres.length], sujet = f.surfaces[i];
    const points = a - b, rel = 100 * points / a, faux = 100 * points / b;
    const environ = x => (Number.isInteger(x) ? "" : "environ ") + pourcentGT(Math.round(x));
    return {
      type: "qcm",
      texte: sujet + " passe de " + pourcentGT(a) + " à " + pourcentGT(b) + ".",
      question: "Quelle description est exacte ?",
      choix: ["Une baisse de " + points + " points, soit " + environ(rel) + " de moins.", "Une baisse de " + points + " points, soit " + pourcentGT(points) + " de moins.",
        "Une baisse de " + Math.round(rel) + " points, soit " + pourcentGT(points) + " de moins.", "Une baisse de " + points + " points, soit " + environ(faux) + " de moins."],
      juste: 0, leurre: 1, valeurs: { a, b },
      explication: "La différence entre deux pourcentages se compte en points : " + a + " − " + b + " = " + points + " points. Rapportée à la valeur de départ, elle fait " + environ(rel) + " de moins. Confondre points et pourcents fait paraître un changement plus petit ou plus grand qu'il n'est."
    };
  },
  montyIgnorant(f, i) {
    const [pluriel, singulier, fem, ouvreur, n] = f.surfaces[i];
    const [un, une, il, ferme] = fem ? ["une", "une", "elle", "fermée"] : ["un", "un", "il", "fermé"];
    return {
      type: "qcm",
      texte: "Un lot est caché dans " + (fem ? "l'une" : "l'un") + " de " + n + " " + pluriel + ". Vous en choisissez " + un + ", sans l'ouvrir. " + ouvreur + " : " + il + " ne contient pas le lot. On vous propose de changer pour " + une + " autre " + singulier + " encore " + ferme + ".",
      question: "Avez-vous intérêt à changer ?",
      choix: ["Non : chaque " + singulier + " encore " + ferme + " a maintenant la même chance, 1 sur " + (n - 1) + ".", "Oui : changer augmente vos chances, comme dans le problème de Monty Hall.",
        "Non : garder son premier choix est toujours plus sûr.", "Oui, mais seulement si l'on change deux fois."],
      juste: 0, leurre: 1, valeurs: { n },
      explication: "Dans le problème de Monty Hall, le présentateur sait où est le lot et ouvre toujours une porte vide : c'est ce qui rend le changement avantageux. Ici, l'ouverture est due au hasard, et elle aurait pu révéler le lot. " + (fem ? "Toutes les " : "Tous les ") + pluriel + " encore " + (fem ? "fermées" : "fermés") + " ont alors la même chance : la solution ne se transpose pas quand les règles changent."
    };
  },

  // ---------- Axe C ----------
  conceptuel(f, i) {
    const s = f.surfaces[i], valeurs = {};
    f.champs.forEach((c, k) => { valeurs[c] = s[k]; });
    return {
      type: "qcm",
      texte: remplir(f.texte, valeurs), question: remplir(f.question, valeurs),
      choix: f.choix.map(c => remplir(c, valeurs)),
      juste: 0, leurre: f.leurre, valeurs: {},
      explication: f.explication
    };
  }
};

// Instance d'une famille, avec l'ordre de ses choix tiré par la graine de la passation (rangs « affichés »)
function instanceGT(f, i, graine) {
  const item = GENERATEURS_GT[f.generer](f, i);
  ["texte", "question", "explication"].forEach(k => { item[k] = elisions(item[k]); });
  if (item.choix) item.choix = item.choix.map(elisions);
  const instanceId = f.id + "@" + i;
  Object.assign(item, { instanceId, itemId: instanceId, famille: f.id, axe: f.axe, i, aRelire: f.aRelire !== false,
    fiches: f.fiches || [], ateliers: f.ateliers || [], surCorrection: !!f.surCorrection, preuveSuffisante: !!f.preuveSuffisante });
  if (item.type === "qcm") {
    const ordre = melanger([0, 1, 2, 3], generateur(graineDe(instanceId + ":" + graine)));
    item.ordre = ordre;
    item.choixAffiches = ordre.map(k => item.choix[k]);
    item.justeAffiche = ordre.indexOf(item.juste);
    item.leurreAffiche = item.leurre === null ? null : ordre.indexOf(item.leurre);
    item.chance = 0.25;
  } else item.chance = item.type === "binaire" ? 0.5 : 0;
  return item;
}

const familleGT = id => FAMILLES_GT.find(f => f.id === id);

// ===================== Tirage =====================
// Tirage stratifié et reproductible des items d'une passation. Règles (tests/grand-test-plan.md §6 et §7) :
// une famille au plus une fois par test ; une instance vue dans l'un des trois derniers tests terminés ne revient
// pas ; si une strate n'a plus d'instance libre, la plus anciennement vue revient, marquée réutilisée et notée dans
// « issues ». Une instance déjà vue (même il y a longtemps) est marquée dejaVu : elle n'est jamais présentée comme
// nouvelle. Les items alternent les strates (exemples entrelacés) au lieu d'enchaîner ceux d'une même forme.

const ATTENTE_REPETITION = 3;    // tests terminés avant qu'une instance vue puisse revenir

const STRATES_GT = {
  "A-calcul": f => f.axe === "A" && f.type === "calcul",
  "A-lecture": f => f.axe === "A" && f.type === "qcm",
  "A-raisonnement": f => f.axe === "A" && f.type === "binaire",
  "B": f => f.axe === "B",
  "C": f => f.axe === "C"
};

// Banques d'items rédigés (non générés) : chaque élément a un identifiant, une famille (au plus une par test : les
// affirmations qui se dévoileraient l'une l'autre partagent la leur), une strate d'équilibre et un domaine.
// Toutes sont écrites par IA : aRelire, donc tirées seulement dans la copie d'essai tant qu'aucune personne ne les
// a relues. Les démonstrations de mémoire ont 20 instances par famille, comme les familles générées.
const COMBINAISONS_SOURCE_GT = [0b000111, 0b101010, 0b110001, 0b011100];
const BANQUES_GT = {
  vf: () => VF_GT.map(x => ({ id: x.id, famille: "vf:" + (x.groupe || x.id), strate: x.vrai ? "vrai" : "faux", domaine: x.domaine, aRelire: x.aRelire !== false })),
  exposition: () => EXPOSITIONS_GT.map(([id, domaine, vrai]) => ({ id, famille: "ex:" + id, strate: vrai ? "vrai" : "faux", domaine, aRelire: true })),
  grandeur: () => GRANDEURS_PAYS_GT.map(([pays, k]) => ({ id: "gr-" + pays + "-" + k, famille: "gr:" + pays, strate: "gr", domaine: k, aRelire: true })),
  angleMort: () => ANGLE_MORT_GT.map(([id]) => ({ id, famille: "am:" + id, strate: "am", domaine: "am", aRelire: true })),
  societe: () => SOCIETE_GT.map(([id]) => ({ id, famille: "so:" + id, strate: "so", domaine: "so", aRelire: true })),
  drm: () => LISTES_DRM_GT.map((x, i) => ({ id: "drm@" + i, famille: "m-drm", strate: "m", domaine: "m", aRelire: true })),
  recit: () => RECITS_GT.map((x, i) => ({ id: "recit@" + i, famille: "m-desinformation", strate: "m", domaine: "m", aRelire: true })),
  source: () => Array.from({ length: SOURCES_GT.length * COMBINAISONS_SOURCE_GT.length }, (_, i) => ({ id: "source@" + i, famille: "m-source", strate: "m", domaine: "m", aRelire: true }))
};

// Composition par mode. Familles générées : « strate » et nombre de familles ; banques : « banque » et nombre
// d'items ; « equilibre » : autant de chaque valeur (formes valides et non valides ; vrai et faux).
const COMPOSITION_GT = {
  complet: [
    { etape: 0, banque: "angleMort", n: 4 }, { etape: 0, banque: "exposition", n: 8, equilibre: true, role: "lecture" },
    { etape: 1, banque: "vf", n: 24, equilibre: true },
    { etape: 2, strate: "A-calcul", n: 4 }, { etape: 2, strate: "A-lecture", n: 4 }, { etape: 2, strate: "A-raisonnement", n: 8, equilibre: "valide" },
    { etape: 3, strate: "B", n: 10 }, { etape: 3, banque: "grandeur", n: 6 },
    { etape: 4, strate: "C", n: 10 }, { etape: 4, banque: "societe", n: 2 },
    { etape: 5, banque: "exposition", n: 8, equilibre: true, role: "nouvelle" },
    { etape: 5, banque: "drm", n: 1 }, { etape: 5, banque: "recit", n: 1 }, { etape: 5, banque: "source", n: 1 }
  ],
  express: [
    { etape: 1, banque: "vf", n: 8, equilibre: true },
    { etape: 2, strate: "A-calcul", n: 1 }, { etape: 2, strate: "A-lecture", n: 1 }, { etape: 2, strate: "A-raisonnement", n: 2, equilibre: "valide" },
    { etape: 3, strate: "B", n: 4 }, { etape: 3, banque: "grandeur", n: 3 },
    { etape: 4, strate: "C", n: 4 },
    { etape: 5, banque: "drm", n: 1 }
  ]
};

// Ce que l'historique dit de chaque instance : rang du dernier test terminé où elle a été vue, tests où elle l'a été
function memoireDesVues(etat) {
  const derniere = {}, tests = {};
  etat.historiqueItemsVus.forEach(v => {
    derniere[v.instanceId] = Math.max(derniere[v.instanceId] || 0, v.compteurTests);
    (tests[v.instanceId] = tests[v.instanceId] || new Set()).add(v.runId);
  });
  return { derniere, tests, termines: passationsTerminees(etat).length };
}

// Classe des candidats : 0 jamais vu, 1 libre (vu avant les trois derniers tests), 2 bloqué (réutilisation)
const classeVue = (memoire, id) => memoire.derniere[id] === undefined ? 0 : memoire.derniere[id] <= memoire.termines - ATTENTE_REPETITION ? 1 : 2;

// Le meilleur candidat : classe la plus basse, puis vu le plus anciennement ; à égalité, l'ordre tiré au hasard
function meilleurCandidat(ids, memoire) {
  return ids.slice().sort((a, b) => classeVue(memoire, a) - classeVue(memoire, b) || (memoire.derniere[a] || 0) - (memoire.derniere[b] || 0))[0];
}

function descriptionVue(memoire, id) {
  const vuDans = memoire.tests[id];
  return { dejaVu: !!vuDans, compteurTestsAvant: vuDans ? vuDans.size : 0 };
}

// Choisit une instance d'une famille générée
function choisirInstance(f, memoire, alea) {
  const ids = melanger(Array.from({ length: tailleFamille(f) }, (_, i) => i), alea);
  const choisi = meilleurCandidat(ids.map(i => f.id + "@" + i), memoire);
  return Object.assign({ i: Number(choisi.split("@").pop()), reutilisee: classeVue(memoire, choisi) === 2 }, descriptionVue(memoire, choisi));
}

// Choisit n familles d'une strate ; avec « equilibre », alterne les valeurs du champ (ex. valide / non valide)
function choisirFamilles(familles, n, equilibre, alea) {
  const melangees = melanger(familles, alea);
  if (!equilibre) return melangees.slice(0, n);
  const groupes = [melangees.filter(f => f[equilibre]), melangees.filter(f => !f[equilibre])];
  const choisies = [];
  for (let k = 0; choisies.length < n && (groupes[0].length || groupes[1].length); k++) {
    const g = groupes[k % 2].length ? groupes[k % 2] : groupes[1 - k % 2];
    choisies.push(g.shift());
  }
  return choisies;
}

// Choisit n éléments d'une banque : familles inédites dans ce test, strates équilibrées si demandé, domaines
// répartis (à chaque pas, le domaine le moins représenté jusque-là), jamais vus d'abord.
function choisirDansBanque(elements, n, equilibre, memoire, familles, alea) {
  const restants = melanger(elements, alea).filter(x => !familles.has(x.famille));
  const strates = [...new Set(elements.map(x => x.strate))].sort();
  const choisis = [], domaines = {};
  for (let k = 0; k < n; k++) {
    const voulue = equilibre ? strates[k % strates.length] : null;
    let pool = restants.filter(x => !familles.has(x.famille) && (!voulue || x.strate === voulue));
    if (!pool.length) pool = restants.filter(x => !familles.has(x.famille));
    if (!pool.length) break;
    const meilleure = Math.min(...pool.map(x => classeVue(memoire, x.id)));
    pool = pool.filter(x => classeVue(memoire, x.id) === meilleure);
    const moinsUtilise = Math.min(...pool.map(x => domaines[x.domaine] || 0));
    const x = meilleurCandidat(pool.filter(y => (domaines[y.domaine] || 0) === moinsUtilise).map(y => y.id), memoire);
    const elt = pool.find(y => y.id === x);
    choisis.push(Object.assign({ reutilisee: meilleure === 2 }, elt));
    familles.add(elt.famille);
    domaines[elt.domaine] = (domaines[elt.domaine] || 0) + 1;
    restants.splice(restants.indexOf(elt), 1);
  }
  return choisis;
}

// Ordonne les items d'une étape en évitant deux items de même strate à la suite quand c'est possible : à chaque pas,
// un item de la strate qui en compte le plus parmi celles qui diffèrent de la précédente (ex aequo : la première)
function entrelacer(items, alea) {
  const restants = melanger(items, alea), ordre = [];
  while (restants.length) {
    const precedente = ordre.length ? ordre[ordre.length - 1].strate : null;
    const compte = {};
    restants.forEach(x => { compte[x.strate] = (compte[x.strate] || 0) + 1; });
    const permises = Object.keys(compte).filter(s => s !== precedente);
    const strates = permises.length ? permises : Object.keys(compte);
    const maximum = Math.max(...strates.map(s => compte[s]));
    const choisie = strates.filter(s => compte[s] === maximum).sort()[0];
    ordre.push(restants.splice(restants.findIndex(x => x.strate === choisie), 1)[0]);
  }
  return ordre;
}

// Tire les items d'une passation. Renvoie { instances, issues }. Chaque instance porte son étape et, pour une famille
// générée, son rang i : de quoi la reconstruire à l'identique au moment de l'afficher. Items dérivés (étape 5) :
// la note des affirmations lues à l'étape 0, et le rappel des estimations des fourchettes (complet seulement).
function tirerPassation(etat, mode, graine, familles) {
  const alea = generateur(graine);
  const memoire = memoireDesVues(etat);
  const issues = [], parEtape = {}, famillesPrises = new Set();
  const publiable = x => GRAND_TEST_ESSAI || x.aRelire === false;
  const ajouter = (etape, x) => (parEtape[etape] = parEtape[etape] || []).push(x);
  COMPOSITION_GT[mode].forEach(({ etape, strate, banque, n, equilibre, role }) => {
    if (strate) {
      const candidates = (familles || FAMILLES_GT).filter(publiable).filter(STRATES_GT[strate]);
      if (candidates.length < n) issues.push("strate " + strate + " : " + candidates.length + " famille(s) publiables sur " + n + " demandées");
      choisirFamilles(candidates, n, equilibre, alea).forEach(f => {
        const c = choisirInstance(f, memoire, alea);
        if (c.reutilisee) issues.push("instance réutilisée faute de réserve : " + f.id + "@" + c.i);
        famillesPrises.add(f.id);
        ajouter(etape, { instanceId: f.id + "@" + c.i, itemId: f.id + "@" + c.i, famille: f.id, strate, valeurs: { i: c.i, etape }, dejaVu: c.dejaVu, compteurTestsAvant: c.compteurTestsAvant });
      });
      return;
    }
    const elements = BANQUES_GT[banque]().filter(publiable);
    const choisis = choisirDansBanque(elements, n, equilibre, memoire, famillesPrises, alea);
    if (choisis.length < n) issues.push("banque " + banque + " : " + choisis.length + " élément(s) publiables sur " + n + " demandés");
    choisis.forEach((x, k) => {
      if (x.reutilisee) issues.push("instance réutilisée faute de réserve : " + x.id);
      const valeurs = { etape, banque };
      if (role) valeurs.role = role;
      // Fourchettes du complet : la moitié corrigée aussitôt, l'autre seulement après le rappel (démonstration du
      // biais rétrospectif : le rapprochement du souvenir se compare entre valeurs vues et non vues)
      if (banque === "grandeur") valeurs.correction = mode === "complet" && k % 2 ? "differee" : "immediate";
      const v = descriptionVue(memoire, x.id);
      const suffixe = banque === "exposition" ? (role === "lecture" ? "@lecture" : "@note") : "";
      ajouter(etape, { instanceId: x.id, itemId: x.id + suffixe, famille: x.famille, strate: banque + ":" + x.strate, valeurs, dejaVu: v.dejaVu, compteurTestsAvant: v.compteurTestsAvant });
      if (banque === "exposition" && role === "lecture")
        ajouter(5, { instanceId: x.id, itemId: x.id + "@note", famille: x.famille, strate: "exposition:" + x.strate, valeurs: { etape: 5, banque, role: "vue" }, dejaVu: v.dejaVu, compteurTestsAvant: v.compteurTestsAvant });
      if (banque === "grandeur" && mode === "complet")
        ajouter(5, { instanceId: x.id, itemId: x.id + "@rappel", famille: x.famille, strate: "rappel", valeurs: { etape: 5, banque, role: "rappel", correction: valeurs.correction }, dejaVu: v.dejaVu, compteurTestsAvant: v.compteurTestsAvant });
    });
  });
  const instances = [];
  Object.keys(parEtape).map(Number).sort((a, b) => a - b).forEach(e => {
    // Étape 5 : les démonstrations de mémoire et les rappels gardent un ordre fixe ; les affirmations à noter sont mêlées
    const items = e === 5 ? [].concat(entrelacer(parEtape[e].filter(x => x.strate.startsWith("exposition")), alea), parEtape[e].filter(x => !x.strate.startsWith("exposition")))
      : entrelacer(parEtape[e], alea);
    items.forEach(x => {
      const copie = Object.assign({}, x);
      delete copie.strate;
      instances.push(copie);
    });
  });
  return { instances, issues };
}

// Une grandeur de fourchette, construite à partir des données de pays de la Banque mondiale (pays.js)
function grandeurGT(id) {
  const [, pays, k] = id.split("-");
  const p = PAYS.find(x => x.id === pays), ind = INDICATEURS_GRANDEURS_GT[k];
  if (!p || p[k] === undefined) return null;
  const annee = (p.annees && p.annees[k]) || ANNEES_PAYS[k];
  const v = Math.round(p[k] * ind.facteur * 10 ** ind.decimales) / 10 ** ind.decimales;
  return { id, q: p.nom + " : " + ind.libelle + " en " + annee, v, unite: ind.unite, annee,
    source: "Banque mondiale, World Development Indicators (" + annee + "), données du site (pays.js)" };
}
