// Ajoute des traductions à static/en/grand-test-donnees.js (créé s'il n'existe pas).
//   node tests/en/gt_ajouter.js traductions.json      {identifiant: anglais}, identifiants de  node tests/en/gt_liste.js
// Le fichier produit remplace, au chargement de la page anglaise, les textes de static/grand-test-donnees.js, à leur place.
const fs = require("fs"), path = require("path");
const { liste, id } = require("./gt_liste.js");
const FICHIER = path.join(__dirname, "..", "..", "static", "en", "grand-test-donnees.js");

const ENTETE = `// grand-test-donnees.js (anglais) : les textes anglais des données du Grand test, chacun à son chemin dans static/grand-test-donnees.js.
// Fichier produit par tests/en/gt_ajouter.js (ne pas le modifier à la main) ; tests/en/gt_liste.js --verifier contrôle qu'il couvre tout.
// Chargé après grand-test-donnees.js : il remplace les textes à leur place, et le reste du code n'y voit que de l'anglais.
(function () {
  const TEXTES = `;
const PIED = `
  const RACINES = { RELECTURE_GT, FAMILLES_GT, TAXONOMIE_GT, SURFACES_DETECTION, LISTES_DRM_GT, RECITS_GT, SOURCES_GT, VF_SOURCES_GT, VF_GT,
    EXPOSITIONS_GT, INDICATEURS_GRANDEURS_GT, ANGLE_MORT_GT, SOCIETE_GT, ENTITES_GT, NIVEAUX_GT, CARTES_GT };
  // Un élément se désigne par son rang, ou par son identifiant (champ id, ou premier élément d'une liste)
  const trouver = (conteneur, cle) => Array.isArray(conteneur) && typeof cle === "string" ? conteneur.find(e => e && (e.id === cle || e[0] === cle)) : conteneur[cle];
  for (const [nom, chemin, texte] of TEXTES) {
    let cible = RACINES[nom];
    for (let k = 0; k < chemin.length - 1; k++) cible = trouver(cible, chemin[k]);
    cible[chemin[chemin.length - 1]] = texte;
  }
})();
`;

function lire() {
  if (!fs.existsSync(FICHIER)) return [];
  const src = fs.readFileSync(FICHIER, "utf8"), debut = src.indexOf("const TEXTES = ") + 15, fin = src.indexOf("];\n", debut) + 1;
  return JSON.parse(src.slice(debut, fin));
}

const trad = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const attendus = liste(), parId = new Map(attendus.map(([n, c, t]) => [id(n, c), [n, c, t]]));
const existants = new Map(lire().map(([n, c, t]) => [id(n, c), [n, c, t]]));
let ajoutes = 0;
for (const [i, en] of Object.entries(trad)) {
  if (!parId.has(i)) { console.error("identifiant inconnu :", i); process.exit(1); }
  const [n, c] = parId.get(i);
  existants.set(i, [n, c, en]); ajoutes++;
}
// Dans l'ordre des données françaises
const ordre = new Map(attendus.map(([n, c], k) => [id(n, c), k]));
const sortie = [...existants.entries()].filter(([i]) => ordre.has(i)).sort((a, b) => ordre.get(a[0]) - ordre.get(b[0])).map(([, v]) => v);
fs.writeFileSync(FICHIER, ENTETE + "[\n" + sortie.map(v => JSON.stringify(v)).join(",\n") + "\n];\n" + PIED);
console.log(path.relative(process.cwd(), FICHIER), ":", sortie.length, "textes (" + ajoutes + " ajoutés ou remplacés)");
