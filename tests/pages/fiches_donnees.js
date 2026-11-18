// fiches_donnees.js : exporte en JSON les fiches et les catégories, en français et en anglais, telles que le site les
// affiche (mêmes fichiers, même ordre de chargement, traduction par T()). Lu par generer_pages.py.
//   node tests/pages/fiches_donnees.js > fiches.json
// Échoue si un intitulé n'a pas de traduction anglaise : une page anglaise ne doit jamais contenir de français oublié.
const fs = require("fs"), path = require("path"), vm = require("vm");
const STATIC = path.join(__dirname, "..", "..", "static");

// Intitulés repris de l'application (app.js), traduits par les dictionnaires du site
const LIBELLES = ["biais", "sophisme", "Biais", "Sophismes", "Mécanisme", "Comment s'en prémunir",
  "Pourquoi l'argument est invalide", "Comment répondre", "Schéma de l'argument", "En pratique", "Exemple",
  "Cas célèbre", "Se défendre", "Ne pas confondre", "À ne pas confondre avec : ", "Aller plus loin", "Source",
  "Voir aussi", "L'essentiel"];

function charger(langue, fichiers) {
  // Seul langue.js lit le document (sa langue) ; aucun fichier chargé ici ne touche au DOM au chargement
  const ctx = { console, document: { documentElement: { lang: langue } }, MutationObserver: function () { return { observe() {} }; } };
  vm.createContext(ctx);
  for (const f of fichiers) vm.runInContext(fs.readFileSync(path.join(STATIC, f), "utf8"), ctx, { filename: f });
  return vm.runInContext(`({
    categories: { biais: CATEGORIES_BIAIS, sophismes: CATEGORIES_SOPHISMES },
    fiches: { biais: BIAIS, sophismes: SOPHISMES },
    libelles: Object.fromEntries(${JSON.stringify(LIBELLES)}.map(l => [l, T(l)])),
    manquants: LANGUE === "en" ? ${JSON.stringify(LIBELLES)}.filter(l => !DICTIONNAIRE.has(cleTexte(l))) : []
  })`, ctx);
}

const fr = charger("fr", ["langue.js", "donnees.js"]);
const en = charger("en", ["langue.js", "en/dico-app.js", "donnees.js", "indices.js", "en/fiches.js"]);
if (en.manquants.length) { console.error("Traductions anglaises manquantes : " + en.manquants.join(" | ")); process.exit(1); }
// Mêmes fiches, dans le même ordre, dans les deux langues (en/fiches.js ne change que les textes)
for (const type of ["biais", "sophismes"]) {
  const a = fr.fiches[type].map(f => f.id).join(), b = en.fiches[type].map(f => f.id).join();
  if (a !== b) { console.error("Fiches différentes entre français et anglais : " + type); process.exit(1); }
}
process.stdout.write(JSON.stringify({ fr, en }));
