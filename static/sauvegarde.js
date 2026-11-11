// sauvegarde.js : validation profonde de la progression qui vient de l'extérieur (fichier importé, sauvegarde
// automatique restaurée, et plus tard synchronisation). Une valeur d'une autre forme bloquerait le site, et une clé
// « __proto__ » pourrait modifier les objets de base : chaque clé a son schéma, et un élément invalide est écarté
// seul, sans rejeter le reste. Les champs non décrits sont gardés (pour ne rien perdre d'une donnée légitime), mais
// bornés comme une valeur « libre ». Appelé seulement depuis des fonctions : INDEX et tousLesAteliers() viennent
// de scripts chargés après celui-ci.
//
// Grammaire d'un schéma :
//   "entier" (0 à 10⁹), "jour" (numéro de jour, 0 à 10⁶), "nombre" (fini), "texte", "booleen", "paire" ([entier, entier]),
//   "fiche" (clé d'une fiche existante, « biais:ancrage »), "id" (texte ou nombre), "libre" (toute valeur JSON bornée),
//   ["liste", schéma, longueur max], ["dico", schéma, nombre de clés max, contrôle des clés ("fiche", "atelier") ?],
//   { champ: schéma, …, "!": [champs obligatoires] } (objet : un champ invalide est retiré ; si c'est un champ obligatoire,
//   tout l'objet est écarté, car le code le lit sans vérifier).

const SAUVEGARDE_INTERDITS = new Set(["__proto__", "constructor", "prototype"]);
const SAUVEGARDE_BORNES = { texte: 20000, liste: 5000, dico: 5000, profondeur: 12 };

// Un historique de parties : jour et mesures, chacune facultative
const SCH_HISTORIQUE = ["liste", "nombre", 100];
const SCH_PARTIES = { n: "entier", record: "nombre", sur: "nombre", historique: SCH_HISTORIQUE, jour: "jour", reussites90: "entier" };
const SCH_MONTY = { garder: "paire", changer: "paire", "!": ["garder", "changer"] };

const SCHEMAS_SAUVEGARDE = {
  acquis: ["liste", "fiche", 500],
  memoire: ["dico", { b: "entier", d: "jour", n: "entier", j: "entier" }, 500, "fiche"],
  records: ["dico", "nombre", 100],
  activite: ["liste", "jour", 2000],
  jour: { jour: "jour", choix: "id" },
  derniereFiche: "texte",
  modeQuiz: "texte",
  typeFiches: "texte",
  erreurs: ["liste", "texte", 500],
  experiencesFaites: ["liste", "id", 500],
  jeuxFaits: ["liste", "id", 500],
  etalonnage: ["dico", "libre", 100],
  points: { rapport: "nombre", avecRepere: "booleen" },
  resultatsAteliers: ["dico", Object.assign({ niveaux: ["dico", Object.assign({ "!": ["historique"] }, SCH_PARTIES), 10] }, SCH_PARTIES), 500, "atelier"],
  vus: ["dico", ["liste", "libre", 5000], 500],   // « libre » : deux ateliers y écrivent null (identifiant absent)
  confiance: ["dico", "paire", 20],
  fourchettes: "paire",
  illusions: ["liste", { j: "jour", avant: "nombre", apres: "nombre" }, 200],
  montyHall: { 3: SCH_MONTY, 10: SCH_MONTY, "!": ["3", "10"] },
  reponsesPensee: ["dico", "entier", 500],
  ancrages: ["liste", { j: "jour", h: "nombre", b: "nombre" }, 200],
  hasardEcrit: ["liste", { j: "jour", c: "entier", l: "entier" }, 200],
  themePays: "texte",
  vfJour: { j: "jour", id: "id", r: "libre" },
  duels: ["dico", "paire", 2000],
  certitudeQuiz: "booleen",
  certitudes: ["dico", "paire", 10],
  erreursSures: ["liste", { cle: "fiche", j: "jour" }, 200],
  debats: ["liste", { j: "jour", d: "nombre", det: "entier", s: "entier", fa: "entier", r: "entier" }, 200],
  logique: ["liste", { j: "jour", l: "nombre", c: "nombre", rejet: "booleen", fautif: "booleen" }, 200],
  etudes: ["liste", { j: "jour" }, 200],
  previsions: ["liste", { id: "id", texte: "texte", p: "nombre", echeance: "jour", creee: "jour" }, 1000],
  niveaux: ["dico", { niveau: "entier", mode: "texte", parties: "entier", serie: "entier" }, 500],
  defiJour: { jour: "jour", score: "nombre" },
  chrono: ["dico", "nombre", 100],
  theme: "texte",
  reperages: ["liste", { cle: "fiche", j: "jour", note: "texte" }, 1000],
  ceciteFaite: "booleen",
  bingo: { graine: "id", cochees: ["liste", "entier", 100] },
  decisions: ["liste", { id: "id", texte: "texte", creee: "jour", bilan: "jour", bilanFait: "jour", issue: "texte", jugement: "texte" }, 200],
  bilanFormes: ["dico", { jour: "jour", score: "nombre" }, 20],
  grandTest: ["dico", "libre", 1000],
  reglages: { animations: "texte", sobre: "booleen" },
  fichesLues: ["liste", "fiche", 500],
  maitrise: { jours: ["dico", ["liste", "nombre", 10], 500], meilleure: "nombre", depuis: "jour", grade: "entier" },
  lucidite: { total: "nombre", jours: ["dico", "nombre", 200], compteurs: ["dico", "libre", 200], uniques: ["dico", "nombre", 2000],
    journal: ["liste", ["liste", "libre", 3], 60], rattrapage: "nombre", rattrapageVu: "booleen", cumuls: ["dico", "entier", 20] },
  distinctions: { obtenues: ["liste", "texte", 100], drapeaux: { embleme: "booleen", illusions: ["liste", "texte", 50] } },
  objectif: "entier",
  profil: { pseudo: "texte" }
};

// Identifiants d'ateliers acceptés : ceux de la liste des ateliers (le banc « ateliers » vérifie qu'il n'en manque aucun)
function sauvegardeAteliersConnus() {
  return new Set(tousLesAteliers().map(a => a.atelier.id));
}

// Valeur nettoyée selon le schéma, ou undefined si elle est invalide
function nettoyerSauvegarde(schema, v, profondeur = 0, contexte = {}) {
  if (profondeur > SAUVEGARDE_BORNES.profondeur) return undefined;
  const entier = (min, max) => Number.isInteger(v) && v >= min && v <= max ? v : undefined;
  if (typeof schema === "string") switch (schema) {
    case "entier": return entier(0, 1e9);
    case "jour": return entier(0, 1e6);
    case "nombre": return typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e12 ? v : undefined;
    case "texte": return typeof v === "string" && v.length <= SAUVEGARDE_BORNES.texte ? v : undefined;
    case "booleen": return typeof v === "boolean" ? v : undefined;
    case "paire": return Array.isArray(v) && v.length === 2 && v.every(x => Number.isInteger(x) && x >= 0 && x <= 1e9) ? [v[0], v[1]] : undefined;
    case "fiche": return typeof v === "string" && INDEX.has(v) ? v : undefined;
    case "id": return typeof v === "string" ? nettoyerSauvegarde("texte", v) : nettoyerSauvegarde("nombre", v);
    case "libre":
      if (v === null || typeof v === "boolean") return v;
      if (typeof v === "number") return nettoyerSauvegarde("nombre", v);
      if (typeof v === "string") return nettoyerSauvegarde("texte", v);
      return nettoyerSauvegarde(Array.isArray(v) ? ["liste", "libre", SAUVEGARDE_BORNES.liste] : ["dico", "libre", SAUVEGARDE_BORNES.dico], v, profondeur, contexte);
    default: return undefined;
  }
  if (Array.isArray(schema)) {
    const [genre, sous, max, cles] = schema;
    if (genre === "liste") {
      if (!Array.isArray(v)) return undefined;
      // Les plus récents sont à la fin : au-delà de la longueur maximale, on garde la fin
      return v.slice(-max).map(x => nettoyerSauvegarde(sous, x, profondeur + 1, contexte)).filter(x => x !== undefined);
    }
    if (genre === "dico") {
      if (v === null || typeof v !== "object" || Array.isArray(v)) return undefined;
      const sortie = {};
      const ateliers = cles === "atelier" ? (contexte.ateliers = contexte.ateliers || sauvegardeAteliersConnus()) : null;
      for (const [k, x] of Object.entries(v).slice(0, max)) {
        if (SAUVEGARDE_INTERDITS.has(k) || k.length > 200) continue;
        if (cles === "fiche" && !INDEX.has(k)) continue;
        if (ateliers && !ateliers.has(k)) continue;
        const r = nettoyerSauvegarde(sous, x, profondeur + 1, contexte);
        if (r !== undefined) sortie[k] = r;
      }
      return sortie;
    }
    return undefined;
  }
  // Objet à champs nommés : les champs décrits suivent leur schéma, les autres sont gardés comme valeurs libres
  if (v === null || typeof v !== "object" || Array.isArray(v)) return undefined;
  const sortie = {};
  for (const [k, x] of Object.entries(v).slice(0, SAUVEGARDE_BORNES.dico)) {
    if (SAUVEGARDE_INTERDITS.has(k) || k.length > 200) continue;
    const r = nettoyerSauvegarde(k !== "!" && Object.prototype.hasOwnProperty.call(schema, k) ? schema[k] : "libre", x, profondeur + 1, contexte);
    if (r !== undefined) sortie[k] = r;
  }
  return (schema["!"] || []).every(k => k in sortie) ? sortie : undefined;
}

// Progression nettoyée : { cle: valeur } pour les seules clés connues et valides ; « ecartees » compte les clés refusées
function validerSauvegarde(cles) {
  const valides = {};
  let ecartees = 0;
  if (cles === null || typeof cles !== "object" || Array.isArray(cles)) return { valides, ecartees: 1 };
  const contexte = {};
  for (const [cle, valeur] of Object.entries(cles)) {
    const schema = SCHEMAS_SAUVEGARDE[cle];
    const r = schema && CLES_SAUVEGARDE.includes(cle) ? nettoyerSauvegarde(schema, valeur, 0, contexte) : undefined;
    // En plus, la forme de premier niveau (FORMES_SAUVEGARDE) et, pour grandTest, la vérification propre au Grand test
    if (r === undefined || !formeValide(cle, r)) ecartees++;
    else valides[cle] = r;
  }
  return { valides, ecartees };
}
