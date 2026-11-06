// langue.js : langue de l'interface. Le site est écrit en français ; la page en/index.html le propose en anglais.
// La langue est celle de la page (<html lang="…">). En français, ce fichier ne change rien : T() rend son texte tel quel.
// En anglais, les textes viennent des dictionnaires en/dico-*.js (français à gauche, anglais à droite) :
//   - T("texte français", valeurs…) traduit une phrase construite par le code ; {0}, {1}… reçoivent les valeurs ;
//   - tout texte affiché dont le français figure dans un dictionnaire est remplacé par son anglais au moment de
//     l'affichage (texte des nœuds, attributs aria-label, title, placeholder, alt) : le code français n'a pas à changer.
// Un texte absent des dictionnaires reste en français. Pour les repérer : python3 tests/en/controle.py

const LANGUE = document.documentElement.lang === "en" ? "en" : "fr";
// Format des dates et des nombres (« 6 novembre » / « 6 November », « 1 200,5 » / « 1,200.5 »)
const LOCALE = LANGUE === "en" ? "en-GB" : "fr-FR";

// Clé d'un texte : espaces insécables et suites d'espaces ramenés à une espace, pour que la typographie
// française (espace fine avant « : », « ? »…) ne change pas la clé
const cleTexte = t => String(t).replace(/[  \s]+/g, " ").trim();

const DICTIONNAIRE = new Map();
function EN_AJOUTER(paires) {
  for (const [francais, anglais] of paires) DICTIONNAIRE.set(cleTexte(francais), anglais);
}

// Texte dans la langue de la page. En anglais, un texte sans traduction reste en français.
function T(francais, ...valeurs) {
  let texte = francais;
  if (LANGUE === "en") {
    const traduit = DICTIONNAIRE.get(cleTexte(francais));
    if (traduit !== undefined) texte = traduit;
  }
  return valeurs.length ? texte.replace(/\{(\d+)\}/g, (m, i) => (i in valeurs ? valeurs[i] : m)) : texte;
}

if (LANGUE === "en") {
  // Texte déjà traduit, par nœud : évite de retraduire ce que l'on vient d'écrire
  const deja = new WeakMap();
  const ATTRIBUTS = ["aria-label", "title", "placeholder", "alt"];

  function traduireNoeud(n) {
    const brut = n.nodeValue;
    if (deja.get(n) === brut) return;
    const cle = cleTexte(brut);
    if (!cle) return;
    const traduit = DICTIONNAIRE.get(cle);
    if (traduit === undefined) return;
    // On garde les blancs du début et de la fin (ils séparent des nœuds voisins)
    const nouveau = brut.match(/^\s*/)[0] + traduit + brut.match(/\s*$/)[0];
    deja.set(n, nouveau);
    n.nodeValue = nouveau;
  }

  function traduireAttributs(e) {
    for (const a of ATTRIBUTS) {
      const v = e.getAttribute && e.getAttribute(a);
      if (!v) continue;
      const traduit = DICTIONNAIRE.get(cleTexte(v));
      if (traduit !== undefined && traduit !== v) e.setAttribute(a, traduit);
    }
  }

  function traduireArbre(racine) {
    if (racine.nodeType === 3) return traduireNoeud(racine);
    if (racine.nodeType !== 1) return;
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = racine; n; n = marcheur.nextNode()) {
      if (n.nodeType === 3) traduireNoeud(n);
      else if (!/^(SCRIPT|STYLE)$/.test(n.nodeName)) traduireAttributs(n);
    }
  }

  new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === "childList") m.addedNodes.forEach(traduireArbre);
      else if (m.type === "characterData") traduireNoeud(m.target);
      else if (m.type === "attributes") traduireAttributs(m.target);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS });
}
