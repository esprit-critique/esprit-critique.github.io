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
