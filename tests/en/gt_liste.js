// Textes à traduire de static/grand-test-donnees.js, avec leur chemin dans les données.
//   node tests/en/gt_liste.js            une ligne par texte : identifiant, chemin (JSON), texte français (séparés par des tabulations)
//   node tests/en/gt_liste.js --verifier  rend 1 si static/en/grand-test-donnees.js ne couvre pas exactement ces chemins
// (TEXTE_NIVEAU_GT, une chaîne constante, est traduite par un dictionnaire : en/dico-grand-test.js.)
// Les données d'item (nombres, formes, identifiants de fiches…) ne sont pas traduites ; static/en/grand-test-donnees.js
// remplace les textes, à leur place, au chargement de la page anglaise.
const vm = require("vm"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const STATIC = path.join(__dirname, "..", "..", "static");

const NOMS = ["RELECTURE_GT", "FAMILLES_GT", "TAXONOMIE_GT", "SURFACES_DETECTION", "LISTES_DRM_GT", "RECITS_GT", "SOURCES_GT", "VF_SOURCES_GT", "VF_GT",
  "EXPOSITIONS_GT", "INDICATEURS_GRANDEURS_GT", "ANGLE_MORT_GT", "SOCIETE_GT", "ENTITES_GT", "NIVEAUX_GT", "CARTES_GT"];

// Pour chaque structure : quels champs d'un élément contiennent du texte (null : tout texte de l'élément)
const CHAMPS = {
  FAMILLES_GT: ["construit", "surfaces", "texte", "question", "choix", "explication"],
  VF_GT: ["texte", "explication", "source", "diffusion"],
  CARTES_GT: ["texte", "source", "limite", "statut"],
  INDICATEURS_GRANDEURS_GT: ["libelle", "unite"],
  RELECTURE_GT: ["personne"],
  EXPOSITIONS_GT: [3], ANGLE_MORT_GT: [2], SOCIETE_GT: [1, 2, 3, 5, 6], ENTITES_GT: [1]
};
const A_LETTRE = /[A-Za-zÀ-ÿŒœ]/;

function charger() {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(STATIC, "grand-test-donnees.js"), "utf8") + "\nthis.D = {" + NOMS.join(",") + "};", ctx);
  return ctx.D;
}

function feuilles(x, chemin, sortie) {
  if (typeof x === "string") { if (A_LETTRE.test(x)) sortie.push([chemin, x]); }
  else if (Array.isArray(x)) x.forEach((y, i) => feuilles(y, chemin.concat(i), sortie));
  else if (x && typeof x === "object") Object.keys(x).forEach(k => feuilles(x[k], chemin.concat(k), sortie));
}

function liste() {
  const D = charger(), sortie = [];
  for (const nom of NOMS) {
    const v = D[nom], champs = CHAMPS[nom];
    if (typeof v === "string") { sortie.push([nom, [], v]); continue; }
    if (nom === "RELECTURE_GT") { sortie.push([nom, ["personne"], v.personne]); continue; }
    const elements = Array.isArray(v) ? v.map((e, i) => [e, (e && (e.id !== undefined ? e.id : typeof e[0] === "string" && (nom === "EXPOSITIONS_GT" || nom === "ANGLE_MORT_GT" || nom === "SOCIETE_GT" || nom === "ENTITES_GT") ? e[0] : i))])
      : Object.keys(v).map(k => [v[k], k]);
    const parNom = !Array.isArray(v);
    for (const [e, ident] of elements) {
      const f = [];
      if (champs && (Array.isArray(e) || typeof e === "object")) {
        for (const c of champs) if (e[c] !== undefined) feuilles(e[c], [c], f);
      } else if (parNom && champs) {
        // objet de valeurs (INDICATEURS_GRANDEURS_GT)
        for (const c of champs) if (e[c] !== undefined) feuilles(e[c], [c], f);
      } else feuilles(e, [], f);
      for (const [chemin, texte] of f) sortie.push([nom, [ident].concat(chemin), texte]);
    }
  }
  return sortie;
}

const id = (nom, chemin) => crypto.createHash("sha1").update(nom + JSON.stringify(chemin)).digest("hex").slice(0, 7);

if (require.main === module) {
  const L = liste();
  if (process.argv.includes("--verifier")) {
    const fichier = path.join(STATIC, "en", "grand-test-donnees.js");
    if (!fs.existsSync(fichier)) { console.log("static/en/grand-test-donnees.js n'existe pas"); process.exit(1); }
    const src = fs.readFileSync(fichier, "utf8"), debut = src.indexOf("const TEXTES = ") + 15, fin = src.indexOf("];\n", debut) + 1;
    const T = JSON.parse(src.slice(debut, fin)), attendus = new Set(L.map(([n, c]) => n + JSON.stringify(c))), presents = new Set(T.map(([n, c]) => n + JSON.stringify(c)));
    const manque = [...attendus].filter(k => !presents.has(k)), en_trop = [...presents].filter(k => !attendus.has(k));
    manque.slice(0, 10).forEach(k => console.log("sans traduction :", k)); en_trop.slice(0, 10).forEach(k => console.log("chemin inconnu :", k));
    console.log(manque.length + " sans traduction, " + en_trop.length + " en trop"); process.exit(manque.length || en_trop.length ? 1 : 0);
  }
  for (const [nom, chemin, texte] of L) console.log(id(nom, chemin) + "\t" + nom + JSON.stringify(chemin) + "\t" + texte.replace(/\t/g, " "));
}
module.exports = { liste, id };
