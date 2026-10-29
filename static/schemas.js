// schemas.js : illustrations des fiches, dessinées en SVG.
// SCHEMAS["biais:ancrage"]() renvoie { svg, legende }. Les couleurs viennent de style.css
// (classes sch-…), elles s'adaptent donc au mode sombre et à la couleur de la catégorie.
// Quand les données sont réelles, la légende cite la source ; sinon, elle précise « simulées » ou « fictives ».

const NS_SVG = "http://www.w3.org/2000/svg";

function S(balise, attributs, texte) {
  const e = document.createElementNS(NS_SVG, balise);
  Object.entries(attributs || {}).forEach(([k, v]) => {
    // L'épaisseur passe par le style : sinon, les classes de style.css l'écraseraient
    if (k === "stroke-width") e.style.strokeWidth = v;
    else e.setAttribute(k, v);
  });
  if (texte !== undefined) e.textContent = typeof typo === "function" ? typo(texte) : texte;
  return e;
}

function toile(largeur, hauteur, description) {
  return S("svg", { viewBox: "0 0 " + largeur + " " + hauteur, role: "img", "aria-label": description });
}

function ecrireTexte(svg, x, y, contenu, classe, ancre) {
  svg.appendChild(S("text", { x, y, class: classe || "sch-texte", "text-anchor": ancre || "start" }, contenu));
}

// Pointe de flèche réutilisable (identifiant unique par dessin)
let compteurFleches = 0;
function definirFleche(svg) {
  const id = "pointe-" + (++compteurFleches);
  const defs = S("defs");
  const marqueur = S("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
  marqueur.appendChild(S("path", { d: "M0 0 L10 5 L0 10 z", class: "sch-discret" }));
  defs.appendChild(marqueur);
  svg.appendChild(defs);
  return "url(#" + id + ")";
}

// Barres horizontales : lignes = [{ libelle, valeur, texte, classe }]
function barresHorizontales(description, lignes, { max, largeurLibelle = 0, hauteurBarre = 16 } = {}) {
  const pas = hauteurBarre + 30;
  const svg = toile(320, lignes.length * pas + 6, description);
  const x0 = 8 + largeurLibelle, largeur = 300 - largeurLibelle - 52;
  lignes.forEach((l, i) => {
    const y = 6 + i * pas;
    ecrireTexte(svg, 8, y + 11, l.libelle, "sch-texte");
    svg.appendChild(S("rect", { x: x0, y: y + 17, width: largeur, height: hauteurBarre, class: "sch-fond" }));
    svg.appendChild(S("rect", { x: x0, y: y + 17, width: Math.max(1.5, largeur * l.valeur / max), height: hauteurBarre, class: l.classe || "sch-c" }));
    ecrireTexte(svg, x0 + Math.max(1.5, largeur * l.valeur / max) + 6, y + 17 + hauteurBarre - 4, l.texte, "sch-texte sch-gras");
  });
  return svg;
}

// Loi normale par la méthode de Box-Muller, à partir d'un générateur reproductible
function normale(alea) {
  const u = 1 - alea(), v = alea();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Diagramme « si P alors Q » : P inclus dans Q, un point dans Q hors de P
function implication(description, libP, libQ, libPoint) {
  const svg = toile(320, 196, description);
  ecrireTexte(svg, 160, 16, "Q : " + libQ, "sch-texte sch-gras", "middle");
  svg.appendChild(S("circle", { cx: 160, cy: 108, r: 80, class: "sch-clair" }));
  svg.appendChild(S("circle", { cx: 160, cy: 108, r: 80, class: "sch-c-trait" }));
  svg.appendChild(S("circle", { cx: 130, cy: 114, r: 42, class: "sch-carte" }));
  svg.appendChild(S("circle", { cx: 130, cy: 114, r: 42, class: "sch-c-trait" }));
  ecrireTexte(svg, 130, 118, "P : " + libP, "sch-texte sch-gras", "middle");
  svg.appendChild(S("circle", { cx: 204, cy: 108, r: 6, class: "sch-rouge" }));
  ecrireTexte(svg, 204, 128, libPoint, "sch-petit", "middle");
  return svg;
}

const SCHEMAS = {
  // ---------------------------------------------------------------- Probabilités
  "biais:survivant": () => {
    const svg = toile(320, 236, "Silhouette d'avion vue de dessus, avec des impacts sur les ailes, le fuselage et la queue, mais aucun sur les moteurs ni sur le poste de pilotage.");
    const avion = "sch-fond sch-contour";
    svg.appendChild(S("polygon", { points: "146,96 24,130 24,142 146,124", class: avion }));
    svg.appendChild(S("polygon", { points: "174,96 296,130 296,142 174,124", class: avion }));
    svg.appendChild(S("polygon", { points: "149,192 112,206 112,214 149,207", class: avion }));
    svg.appendChild(S("polygon", { points: "171,192 208,206 208,214 171,207", class: avion }));
    svg.appendChild(S("ellipse", { cx: 160, cy: 118, rx: 16, ry: 100, class: avion }));
    // Zones sans impact : moteurs et poste de pilotage
    [[92, 120], [228, 120]].forEach(([x, y]) => svg.appendChild(S("ellipse", { cx: x, cy: y, rx: 9, ry: 16, class: "sch-c-trait" })));
    svg.appendChild(S("ellipse", { cx: 160, cy: 40, rx: 9, ry: 13, class: "sch-c-trait" }));
    // Impacts relevés sur les avions revenus
    [[40, 134], [52, 131], [60, 137], [70, 128], [118, 113], [128, 118], [112, 121], [50, 138], [134, 108],
     [280, 134], [268, 131], [260, 137], [250, 128], [202, 113], [192, 118], [208, 121], [270, 138], [186, 108],
     [156, 76], [165, 86], [157, 150], [164, 160], [155, 172], [163, 180], [126, 204], [194, 204], [160, 199]]
      .forEach(([x, y]) => svg.appendChild(S("circle", { cx: x, cy: y, r: 2.7, class: "sch-rouge" })));
    ecrireTexte(svg, 92, 160, "moteur", "sch-petit", "middle");
    ecrireTexte(svg, 228, 160, "moteur", "sch-petit", "middle");
    ecrireTexte(svg, 184, 30, "poste de pilotage", "sch-petit");
    return {
      svg,
      legende: "Le raisonnement d'Abraham Wald : sur les avions revenus de mission, les impacts (en rouge) épargnent les moteurs et le poste de pilotage. Ce ne sont pas les zones les plus solides, ce sont celles où un impact empêchait le retour. Schéma illustratif, pas un relevé réel."
    };
  },

  "biais:taux-de-base": () => {
    const svg = toile(320, 238, "Grille de 1 000 carrés : un seul malade testé positif, environ cinquante bien portants testés positifs, et le reste testé négatif.");
    const alea = generateur(1000);
    const faux = new Set(melanger([...Array(999).keys()].map(i => i + 1), alea).slice(0, 50));
    for (let i = 0; i < 1000; i++) {
      const x = 10 + (i % 40) * 7.5, y = 6 + Math.floor(i / 40) * 7.5;
      svg.appendChild(S("rect", { x, y, width: 6.5, height: 6.5, class: i === 0 ? "sch-rouge" : faux.has(i) ? "sch-orange" : "sch-gris" }));
    }
    [["sch-rouge", "1 malade, testé positif"], ["sch-orange", "≈ 50 bien portants, testés positifs"], ["sch-gris", "≈ 949 testés négatifs"]].forEach(([classe, libelle], k) => {
      svg.appendChild(S("rect", { x: 10, y: 202 + k * 12, width: 8, height: 8, class: classe }));
      ecrireTexte(svg, 23, 209 + k * 12, libelle, "sch-petit");
    });
    return {
      svg,
      legende: "Maladie touchant 1 personne sur 1 000, test sans faux négatif mais avec 5 % de faux positifs. Sur 51 tests positifs, un seul correspond à un malade : environ 2 %."
    };
  },

  "biais:procureur": () => {
    const svg = toile(320, 150, "Soixante personnes partageant le même profil génétique, dont l'accusé.");
    for (let i = 0; i < 60; i++) {
      const x = 22 + (i % 15) * 19.5, y = 22 + Math.floor(i / 15) * 26;
      const accuse = i === 22;
      svg.appendChild(S("circle", { cx: x, cy: y - 5, r: 4.5, class: accuse ? "sch-c" : "sch-gris" }));
      svg.appendChild(S("path", { d: `M${x - 7} ${y + 10} a7 7 0 0 1 14 0 z`, class: accuse ? "sch-c" : "sch-gris" }));
    }
    ecrireTexte(svg, 160, 138, "l'accusé : un porteur du profil parmi environ 60", "sch-petit", "middle");
    return {
      svg,
      legende: "Un profil génétique présent chez 1 personne sur 1 million correspond, dans un pays de 60 millions d'habitants, à environ 60 personnes. Sans autre élément, la correspondance ne désigne pas plus l'accusé que les 59 autres."
    };
  },

  "biais:conjonction": () => {
    const svg = toile(320, 190, "Deux ensembles qui se recoupent : guichetières et militantes féministes. L'intersection est plus petite que chacun des deux ensembles.");
    const clip = "clip-conj-" + (++compteurFleches);
    const defs = S("defs");
    const cp = S("clipPath", { id: clip });
    cp.appendChild(S("circle", { cx: 112, cy: 96, r: 76 }));
    defs.appendChild(cp);
    svg.appendChild(defs);
    svg.appendChild(S("circle", { cx: 112, cy: 96, r: 76, class: "sch-clair" }));
    svg.appendChild(S("circle", { cx: 208, cy: 96, r: 76, class: "sch-clair" }));
    svg.appendChild(S("circle", { cx: 208, cy: 96, r: 76, class: "sch-c", "clip-path": "url(#" + clip + ")", opacity: 0.55 }));
    svg.appendChild(S("circle", { cx: 112, cy: 96, r: 76, class: "sch-c-trait" }));
    svg.appendChild(S("circle", { cx: 208, cy: 96, r: 76, class: "sch-c-trait" }));
    ecrireTexte(svg, 83, 100, "Guichetières", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 238, 94, "Militantes", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 238, 109, "féministes", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 160, 100, "les deux", "sch-petit", "middle");
    ecrireTexte(svg, 160, 186, "P(guichetière et féministe) ≤ P(guichetière)", "sch-texte", "middle");
    return {
      svg,
      legende: "L'ensemble des guichetières féministes est inclus dans celui des guichetières : il ne peut pas être plus probable. Un scénario plus détaillé paraît plus plausible, mais il est toujours moins probable."
    };
  },

  "biais:erreur-du-joueur": () => {
    const svg = toile(320, 110, "Cinq lancers donnant pile, puis un sixième lancer inconnu dont la probabilité de donner pile reste d'une chance sur deux.");
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 52;
      const inconnu = i === 5;
      svg.appendChild(S("circle", { cx: x, cy: 42, r: 20, class: inconnu ? "sch-clair" : "sch-fond" }));
      svg.appendChild(S("circle", { cx: x, cy: 42, r: 20, class: inconnu ? "sch-c-trait" : "sch-trait" }));
      ecrireTexte(svg, x, 48, inconnu ? "?" : "P", "sch-titre", "middle");
      ecrireTexte(svg, x, 80, inconnu ? "6e lancer" : (i + 1) + (i === 0 ? "er" : "e"), "sch-petit", "middle");
    }
    ecrireTexte(svg, 290, 100, "pile : 1 chance sur 2", "sch-texte sch-gras", "end");
    return { svg, legende: "Une pièce n'a pas de mémoire : après cinq « pile », la probabilité d'obtenir « pile » au lancer suivant est toujours de 1/2." };
  },

  "biais:regression-moyenne": () => {
    const svg = toile(320, 230, "Graphique en pente : les cinq meilleurs à la première mesure baissent à la seconde, les cinq moins bons progressent.");
    const alea = generateur(2024);
    const personnes = [...Array(40)].map(() => {
      const niveau = 50 + 8 * normale(alea);
      return { m1: niveau + 8 * normale(alea), m2: niveau + 8 * normale(alea) };
    }).sort((a, b) => b.m1 - a.m1);
    const hauts = personnes.slice(0, 5), bas = personnes.slice(-5);
    const moy = t => t.reduce((s, x) => s + x, 0) / t.length;
    const y = v => 200 - (v - 25) * 2.6;
    const x1 = 90, x2 = 230;
    svg.appendChild(S("line", { x1: 60, y1: y(50), x2: 260, y2: y(50), class: "sch-pointille" }));
    ecrireTexte(svg, 262, y(50) + 4, "moyenne", "sch-petit");
    [[hauts, "sch-c"], [bas, "sch-orange"]].forEach(([groupe, classe]) => {
      groupe.forEach(p => {
        svg.appendChild(S("line", { x1, y1: y(p.m1), x2, y2: y(p.m2), class: classe === "sch-c" ? "sch-c-trait" : "sch-orange-trait", "stroke-width": 1.4, opacity: 0.9 }));
        svg.appendChild(S("circle", { cx: x1, cy: y(p.m1), r: 3.5, class: classe }));
        svg.appendChild(S("circle", { cx: x2, cy: y(p.m2), r: 3.5, class: classe }));
      });
    });
    ecrireTexte(svg, x1, 16, "1re mesure", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, x2, 16, "2e mesure", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 8, y(moy(hauts.map(p => p.m1))), "5 meilleurs", "sch-petit");
    ecrireTexte(svg, 8, y(moy(bas.map(p => p.m1))), "5 moins bons", "sch-petit");
    ecrireTexte(svg, 160, 224, "moyennes : " + Math.round(moy(hauts.map(p => p.m1))) + " → " + Math.round(moy(hauts.map(p => p.m2))) + " et " + Math.round(moy(bas.map(p => p.m1))) + " → " + Math.round(moy(bas.map(p => p.m2))), "sch-petit", "middle");
    return {
      svg,
      legende: "Données simulées : chaque score combine un niveau réel et une part de hasard. Sans aucune intervention, les cinq meilleurs de la première mesure baissent en moyenne à la seconde, et les cinq moins bons progressent."
    };
  },

  "biais:simpson": () => {
    const svg = toile(320, 214, "Taux de succès de deux traitements des calculs rénaux : A est meilleur pour les petits et pour les gros calculs, mais moins bon au total.");
    const groupes = [["Petits calculs", 93, 87, "81/87", "234/270"], ["Gros calculs", 73, 69, "192/263", "55/80"], ["Ensemble", 78, 83, "273/350", "289/350"]];
    groupes.forEach(([nom, a, b, fa, fb], i) => {
      const y = 14 + i * 60;
      ecrireTexte(svg, 8, y, nom, "sch-texte sch-gras");
      [[a, fa, "sch-c", "A"], [b, fb, "sch-discret", "B"]].forEach(([v, f, classe, lettre], k) => {
        const yb = y + 7 + k * 19;
        ecrireTexte(svg, 8, yb + 12, lettre, "sch-petit");
        svg.appendChild(S("rect", { x: 22, y: yb, width: 200, height: 15, class: "sch-fond" }));
        svg.appendChild(S("rect", { x: 22, y: yb, width: 2 * v, height: 15, class: classe }));
        ecrireTexte(svg, 22 + 2 * v + 6, yb + 12, v + " % (" + f + ")", "sch-petit");
      });
    });
    ecrireTexte(svg, 8, 206, "A : chirurgie ouverte · B : néphrolithotomie percutanée", "sch-petit");
    return {
      svg,
      legende: "Calculs rénaux (Charig et al., 1986). A réussit mieux pour les petits comme pour les gros calculs, mais moins bien au total : A a surtout été utilisé pour les gros calculs, plus difficiles à traiter."
    };
  },

  "biais:taille-echantillon": () => {
    const svg = toile(320, 216, "Nuage de points : score moyen d'écoles selon leur nombre d'élèves. Les petites écoles occupent les deux extrêmes.");
    const alea = generateur(7);
    const ecoles = [...Array(140)].map(() => {
      const taille = Math.round(Math.exp(Math.log(20) + alea() * (Math.log(2000) - Math.log(20))));
      return { taille, score: 500 + (100 / Math.sqrt(taille)) * normale(alea) };
    });
    const tries = [...ecoles].sort((a, b) => b.score - a.score);
    const meilleures = new Set(tries.slice(0, 10)), pires = new Set(tries.slice(-10));
    const x = t => 40 + 260 * (Math.log(t) - Math.log(20)) / (Math.log(2000) - Math.log(20));
    const y = s => 180 - (s - 450) * 1.6;
    svg.appendChild(S("rect", { x: 40, y: 20, width: 260, height: 160, class: "sch-fond" }));
    svg.appendChild(S("line", { x1: 40, y1: y(500), x2: 300, y2: y(500), class: "sch-pointille" }));
    ecoles.forEach(e => {
      const classe = meilleures.has(e) ? "sch-c" : pires.has(e) ? "sch-orange" : "sch-gris";
      svg.appendChild(S("circle", { cx: x(e.taille), cy: Math.max(22, Math.min(178, y(e.score))), r: 3, class: classe }));
    });
    [20, 100, 500, 2000].forEach(t => ecrireTexte(svg, x(t), 194, String(t), "sch-petit", "middle"));
    ecrireTexte(svg, 170, 210, "nombre d'élèves (échelle logarithmique)", "sch-petit", "middle");
    ecrireTexte(svg, 36, y(500) + 4, "500", "sch-petit", "end");
    svg.appendChild(S("circle", { cx: 44, cy: 10, r: 3.5, class: "sch-c" }));
    ecrireTexte(svg, 51, 14, "10 meilleurs scores", "sch-petit");
    svg.appendChild(S("circle", { cx: 164, cy: 10, r: 3.5, class: "sch-orange" }));
    ecrireTexte(svg, 171, 14, "10 moins bons scores", "sch-petit");
    return {
      svg,
      legende: "Données simulées : toutes les écoles ont exactement le même niveau réel (500). Les dix meilleurs scores (en couleur) et les dix plus mauvais (en orange) sont pourtant presque tous ceux de petites écoles, dont la moyenne varie davantage."
    };
  },

  // ---------------------------------------------------------------- Décision
  "biais:ancrage": () => {
    const svg = toile(320, 130, "Estimations médianes du pourcentage de pays africains à l'ONU : 25 % après une roue arrêtée sur 10, 45 % après une roue arrêtée sur 65.");
    const x = v => 20 + v * 4;
    [["Roue arrêtée sur 10", 10, 25], ["Roue arrêtée sur 65", 65, 45]].forEach(([libelle, ancre, estimation], i) => {
      const y = 10 + i * 60;
      ecrireTexte(svg, 20, y + 10, libelle + " : estimation médiane", "sch-texte");
      svg.appendChild(S("rect", { x: 20, y: y + 16, width: 280, height: 18, class: "sch-fond" }));
      svg.appendChild(S("rect", { x: 20, y: y + 16, width: x(estimation) - 20, height: 18, class: "sch-c" }));
      ecrireTexte(svg, x(estimation) - 6, y + 29, estimation + " %", "sch-sur-c", "end");
      svg.appendChild(S("line", { x1: x(ancre), y1: y + 12, x2: x(ancre), y2: y + 38, class: "sch-rouge-trait" }));
      ecrireTexte(svg, x(ancre), y + 50, "ancre : " + ancre, "sch-petit", "middle");
    });
    return {
      svg,
      legende: "Tversky et Kahneman (1974) : estimation médiane du pourcentage de pays africains membres de l'ONU, après une roue truquée qui s'arrête sur 10 ou sur 65. Le nombre tiré, sans rapport avec la question, tire l'estimation vers lui."
    };
  },

  "biais:cadrage": () => ({
    svg: barresHorizontales("Part des participants choisissant l'option sûre : 72 % quand le choix est formulé en vies sauvées, 22 % quand il est formulé en décès.", [
      { libelle: "Formulé en vies sauvées", valeur: 72, texte: "72 %" },
      { libelle: "Formulé en décès", valeur: 22, texte: "22 %", classe: "sch-orange" }
    ], { max: 100 }),
    legende: "Problème de la « maladie asiatique » (Tversky et Kahneman, 1981) : part des participants qui choisissent l'option sûre. Les deux formulations décrivent exactement le même résultat pour les 600 personnes menacées."
  }),

  "biais:aversion-perte": () => {
    const svg = toile(320, 226, "Courbe de valeur de la théorie des perspectives : plus pentue du côté des pertes que du côté des gains.");
    const fleche = definirFleche(svg);
    const ox = 160, oy = 86, ex = 1.3, ey = 0.9;
    const v = x => x >= 0 ? Math.pow(x, 0.88) : -2.25 * Math.pow(-x, 0.88);
    svg.appendChild(S("line", { x1: 20, y1: oy, x2: 304, y2: oy, class: "sch-trait", "marker-end": fleche }));
    svg.appendChild(S("line", { x1: ox, y1: 218, x2: ox, y2: 10, class: "sch-trait", "marker-end": fleche }));
    let d = "";
    for (let x = -100; x <= 100; x += 2) d += (x === -100 ? "M" : "L") + (ox + x * ex).toFixed(1) + " " + (oy - v(x) * ey).toFixed(1) + " ";
    svg.appendChild(S("path", { d, class: "sch-c-trait", "stroke-width": 3 }));
    [[100, "gagner 100 € : +" + Math.round(v(100))], [-100, "perdre 100 € : −" + Math.round(-v(-100))]].forEach(([x, libelle]) => {
      const px = ox + x * ex, py = oy - v(x) * ey;
      svg.appendChild(S("line", { x1: px, y1: oy, x2: px, y2: py, class: "sch-pointille" }));
      svg.appendChild(S("circle", { cx: px, cy: py, r: 4, class: "sch-c" }));
      ecrireTexte(svg, x > 0 ? px - 4 : px + 10, x > 0 ? py - 8 : py + 4, libelle, "sch-petit", x > 0 ? "end" : "start");
    });
    ecrireTexte(svg, 300, oy + 16, "gains", "sch-petit", "end");
    ecrireTexte(svg, 22, oy - 6, "pertes", "sch-petit");
    ecrireTexte(svg, ox - 6, 18, "valeur ressentie", "sch-petit", "end");
    return {
      svg,
      legende: "Fonction de valeur de la théorie des perspectives, avec les paramètres estimés par Tversky et Kahneman (1992) : une perte de 100 € pèse environ 2,25 fois plus qu'un gain de 100 €."
    };
  },

  "biais:statu-quo": () => ({
    svg: barresHorizontales("Taux de consentement au don d'organes : environ 12 % en Allemagne, plus de 99 % en Autriche.", [
      { libelle: "Allemagne : il faut s'inscrire", valeur: 12, texte: "≈ 12 %", classe: "sch-orange" },
      { libelle: "Autriche : consentement présumé", valeur: 99.98, texte: "> 99 %" }
    ], { max: 100 }),
    legende: "Consentement enregistré au don d'organes selon l'option par défaut (Johnson et Goldstein, 2003). Les deux pays sont voisins et culturellement proches ; seule la règle par défaut diffère."
  }),

  "biais:leurre": () => {
    const svg = toile(320, 220, "Choix d'abonnement avec et sans l'option leurre : web plus papier passe de 84 % à 32 % quand le leurre disparaît.");
    const blocs = [
      ["Avec l'option leurre", [["Web seul, 59 $", 16], ["Papier seul (leurre)", 0], ["Web + papier, 125 $", 84]]],
      ["Sans l'option leurre", [["Web seul, 59 $", 68], ["Web + papier, 125 $", 32]]]
    ];
    let y = 12;
    blocs.forEach(([titre, options]) => {
      ecrireTexte(svg, 8, y, titre, "sch-texte sch-gras");
      y += 8;
      options.forEach(([libelle, v]) => {
        ecrireTexte(svg, 8, y + 11, libelle, "sch-petit");
        svg.appendChild(S("rect", { x: 150, y, width: 120, height: 14, class: "sch-fond" }));
        svg.appendChild(S("rect", { x: 150, y, width: Math.max(1, 1.2 * v), height: 14, class: libelle.startsWith("Web +") ? "sch-c" : "sch-discret" }));
        ecrireTexte(svg, 150 + Math.max(1, 1.2 * v) + 5, y + 11, v + " %", "sch-petit");
        y += 22;
      });
      y += 14;
    });
    return {
      svg,
      legende: "Expérience rapportée par Dan Ariely (2008) sur une offre de The Economist. Personne ne choisit l'option « papier seul », mais sa présence fait passer l'offre combinée de 32 % à 84 % des choix."
    };
  },

  // ---------------------------------------------------------------- Mémoire et attention
  "biais:pic-fin": () => {
    const svg = toile(320, 160, "Deux épreuves d'eau froide : la courte dure 60 secondes ; la longue ajoute 30 secondes un peu moins pénibles.");
    const dessiner = (x0, titre, avecFin) => {
      const ex = 120 / 90, base = 128, haut = v => base - v * 9;
      svg.appendChild(S("line", { x1: x0, y1: base, x2: x0 + 124, y2: base, class: "sch-trait" }));
      let d = `M${x0} ${base} L${x0} ${haut(8)} L${x0 + 60 * ex} ${haut(8)}`;
      d += avecFin ? ` L${x0 + 90 * ex} ${haut(5.5)} L${x0 + 90 * ex} ${base} z` : ` L${x0 + 60 * ex} ${base} z`;
      svg.appendChild(S("path", { d, class: "sch-clair" }));
      svg.appendChild(S("path", { d, class: "sch-c-trait" }));
      ecrireTexte(svg, x0, 18, titre, "sch-texte sch-gras");
      ecrireTexte(svg, x0 + 60 * ex, base + 14, "60 s", "sch-petit", "middle");
      if (avecFin) ecrireTexte(svg, x0 + 90 * ex, base + 14, "90 s", "sch-petit", "middle");
    };
    dessiner(18, "Épreuve courte", false);
    dessiner(178, "Épreuve longue", true);
    ecrireTexte(svg, 160, 156, "hauteur : inconfort ressenti · largeur : durée", "sch-petit", "middle");
    return {
      svg,
      legende: "Kahneman et al. (1993) : la seconde épreuve contient plus d'inconfort au total, mais se termine un peu moins mal. Invités à refaire l'une des deux, la majorité des participants choisit la plus longue."
    };
  },

  // ---------------------------------------------------------------- Social
  "biais:conformisme": () => {
    const svg = toile(320, 166, "Stimulus de l'expérience d'Asch : une ligne de référence et trois lignes de comparaison A, B et C ; la ligne B est égale à la référence.");
    const base = 140;
    svg.appendChild(S("line", { x1: 50, y1: base - 90, x2: 50, y2: base, class: "sch-trait", "stroke-width": 5 }));
    ecrireTexte(svg, 50, base + 18, "référence", "sch-petit", "middle");
    [["A", 70, 165, "sch-rouge-trait"], ["B", 90, 215, "sch-vert-trait"], ["C", 110, 265, "sch-trait"]].forEach(([lettre, longueur, x, classe]) => {
      svg.appendChild(S("line", { x1: x, y1: base - longueur, x2: x, y2: base, class: classe, "stroke-width": 5 }));
      ecrireTexte(svg, x, base + 18, lettre, "sch-texte sch-gras", "middle");
    });
    ecrireTexte(svg, 120, 14, "rouge : réponse des complices", "sch-petit");
    ecrireTexte(svg, 120, 28, "vert : bonne réponse", "sch-petit");
    return {
      svg,
      legende: "Stimulus de type Asch (1951) : la ligne B est manifestement égale à la référence. Face à des complices qui répondent tous « A », environ trois quarts des participants se rangent au moins une fois à leur avis."
    };
  },

  // ---------------------------------------------------------------- Image de soi
  "biais:planification": () => ({
    svg: barresHorizontales("Durée de rédaction d'un mémoire : estimation la plus probable 33,9 jours, estimation pessimiste 48,6 jours, durée réelle 55,5 jours.", [
      { libelle: "Estimation « la plus probable »", valeur: 33.9, texte: "33,9 jours" },
      { libelle: "Estimation « dans le pire des cas »", valeur: 48.6, texte: "48,6 jours" },
      { libelle: "Durée réelle (moyenne)", valeur: 55.5, texte: "55,5 jours", classe: "sch-rouge" }
    ], { max: 62 }),
    legende: "Buehler, Griffin et Ross (1994) : 37 étudiants terminant leur mémoire. La durée réelle dépasse en moyenne même leur estimation la plus pessimiste."
  }),

  // ---------------------------------------------------------------- Sophismes
  "sophismes:faux-dilemme": () => {
    const svg = toile(320, 160, "Deux options présentées comme les seules, entourées d'options passées sous silence.");
    [[40, 58, "Option A"], [200, 58, "Option B"]].forEach(([x, y, t]) => {
      svg.appendChild(S("rect", { x, y, width: 80, height: 40, rx: 3, class: "sch-clair" }));
      svg.appendChild(S("rect", { x, y, width: 80, height: 40, rx: 3, class: "sch-c-trait" }));
      ecrireTexte(svg, x + 40, y + 25, t, "sch-texte sch-gras", "middle");
    });
    ecrireTexte(svg, 160, 83, "ou", "sch-texte", "middle");
    [[10, 8, "C"], [120, 4, "D"], [236, 10, "E"], [70, 118, "F"], [180, 120, "G"]].forEach(([x, y, t]) => {
      svg.appendChild(S("rect", { x, y, width: 70, height: 32, rx: 3, class: "sch-pointille" }));
      ecrireTexte(svg, x + 35, y + 21, "Option " + t, "sch-petit", "middle");
    });
    return { svg, legende: "Le faux dilemme ne présente que deux options, souvent une inacceptable et celle qu'on veut imposer. Les autres possibilités (en pointillé) sont passées sous silence." };
  },

  "sophismes:juste-milieu": () => {
    const svg = toile(320, 120, "Droite graduée : la réponse juste 4, la réponse fausse 6 et leur moyenne 5, qui reste fausse.");
    const x = v => 30 + (v - 2) * 52;
    svg.appendChild(S("line", { x1: x(2), y1: 70, x2: x(7), y2: 70, class: "sch-trait" }));
    for (let v = 2; v <= 7; v++) {
      svg.appendChild(S("line", { x1: x(v), y1: 65, x2: x(v), y2: 75, class: "sch-trait" }));
      ecrireTexte(svg, x(v), 92, String(v), "sch-petit", "middle");
    }
    [[4, "sch-vert", "« 2 + 2 = 4 »", 40], [6, "sch-rouge", "« 2 + 2 = 6 »", 40], [5, "sch-orange", "juste milieu : 5", 112]].forEach(([v, classe, libelle, ty]) => {
      svg.appendChild(S("circle", { cx: x(v), cy: 70, r: 7, class: classe }));
      ecrireTexte(svg, x(v), ty, libelle, "sch-petit sch-gras", "middle");
    });
    return { svg, legende: "Le compromis entre une réponse juste et une réponse fausse reste faux. La position médiane dépend surtout de l'extrémisme de chaque camp." };
  },

  "sophismes:correlation": () => {
    const svg = toile(320, 172, "Schéma causal : la chaleur augmente à la fois les ventes de glaces et les noyades, d'où une corrélation entre les deux sans lien de cause.");
    const fleche = definirFleche(svg);
    const boite = (x, y, l, t) => {
      svg.appendChild(S("rect", { x, y, width: l, height: 34, rx: 3, class: "sch-clair" }));
      svg.appendChild(S("rect", { x, y, width: l, height: 34, rx: 3, class: "sch-c-trait" }));
      ecrireTexte(svg, x + l / 2, y + 22, t, "sch-texte sch-gras", "middle");
    };
    boite(110, 8, 100, "Chaleur");
    boite(8, 118, 132, "Ventes de glaces");
    boite(180, 118, 132, "Baignades, noyades");
    svg.appendChild(S("line", { x1: 140, y1: 44, x2: 84, y2: 114, class: "sch-trait", "marker-end": fleche }));
    svg.appendChild(S("line", { x1: 180, y1: 44, x2: 236, y2: 114, class: "sch-trait", "marker-end": fleche }));
    svg.appendChild(S("line", { x1: 142, y1: 135, x2: 178, y2: 135, class: "sch-pointille", "stroke-width": 2 }));
    ecrireTexte(svg, 160, 166, "corrélation, sans lien de cause", "sch-petit", "middle");
    ecrireTexte(svg, 92, 80, "cause", "sch-petit", "end");
    ecrireTexte(svg, 228, 80, "cause", "sch-petit");
    return { svg, legende: "Un facteur commun (la chaleur) fait varier ensemble deux phénomènes qui n'ont aucune influence l'un sur l'autre." };
  },

  "sophismes:pente-glissante": () => {
    const svg = toile(320, 176, "Probabilité qu'une chaîne d'étapes se réalise entièrement quand chaque étape a 80 % de chances : 80 % pour une étape, environ 11 % pour dix.");
    const base = 140;
    for (let n = 1; n <= 10; n++) {
      const p = Math.pow(0.8, n);
      const x = 24 + (n - 1) * 28;
      svg.appendChild(S("rect", { x, y: base - p * 120, width: 20, height: p * 120, class: n === 10 ? "sch-rouge" : "sch-c" }));
      ecrireTexte(svg, x + 10, base + 14, String(n), "sch-petit", "middle");
      if ([1, 3, 5, 10].includes(n)) ecrireTexte(svg, x + 10, base - p * 120 - 5, Math.round(p * 100) + " %", "sch-petit sch-gras", "middle");
    }
    svg.appendChild(S("line", { x1: 18, y1: base, x2: 306, y2: base, class: "sch-trait" }));
    ecrireTexte(svg, 160, 170, "nombre d'étapes, chacune probable à 80 %", "sch-petit", "middle");
    return { svg, legende: "Chaque étape d'une pente glissante peut sembler probable ; leur enchaînement complet l'est beaucoup moins. Avec dix étapes à 80 %, la probabilité d'arriver au bout n'est que de 0,8¹⁰ ≈ 11 %." };
  },

  "sophismes:tireur-elite": () => {
    const svg = toile(320, 206, "Impacts répartis au hasard sur un mur, avec une cible dessinée après coup autour d'un regroupement.");
    svg.appendChild(S("rect", { x: 6, y: 6, width: 308, height: 194, class: "sch-fond" }));
    for (let y = 40; y < 200; y += 34) svg.appendChild(S("line", { x1: 6, y1: y, x2: 314, y2: y, class: "sch-trait-fin" }));
    const alea = generateur(31);
    const impacts = [...Array(70)].map(() => [16 + alea() * 288, 16 + alea() * 174]);
    // Cherche, après coup, l'endroit où les impacts sont les plus groupés
    let meilleur = null;
    for (let cx = 46; cx <= 274; cx += 8) {
      for (let cy = 46; cy <= 160; cy += 8) {
        const n = impacts.filter(([x, y]) => (x - cx) ** 2 + (y - cy) ** 2 <= 34 * 34).length;
        if (!meilleur || n > meilleur.n) meilleur = { cx, cy, n };
      }
    }
    [34, 23, 12].forEach((r, k) => svg.appendChild(S("circle", { cx: meilleur.cx, cy: meilleur.cy, r, class: k === 2 ? "sch-clair" : "sch-c-trait" })));
    impacts.forEach(([x, y]) => {
      const dedans = (x - meilleur.cx) ** 2 + (y - meilleur.cy) ** 2 <= 34 * 34;
      svg.appendChild(S("circle", { cx: x, cy: y, r: 3, class: dedans ? "sch-c" : "sch-discret" }));
    });
    return { svg, legende: "Des impacts tirés au hasard forment toujours des regroupements. Dessiner la cible après coup autour du plus dense le fait paraître significatif. Données simulées." };
  },

  "sophismes:cherry-picking": () => {
    const svg = toile(320, 196, "Courbe en hausse sur 25 ans ; une fenêtre choisie à partir d'un pic exceptionnel donne l'impression d'une baisse.");
    const valeurs = [10.0, 10.6, 10.2, 11.1, 11.5, 11.0, 12.0, 12.4, 15.2, 12.9, 12.6, 13.4, 13.1, 13.8, 13.5, 14.0, 14.9, 14.6, 15.4, 15.1, 16.0, 16.4, 16.1, 17.0, 17.3];
    const x = i => 22 + i * 11.8, y = v => 166 - (v - 9) * 16;
    svg.appendChild(S("rect", { x: x(8) - 4, y: 14, width: x(15) - x(8) + 8, height: 156, class: "sch-clair" }));
    // Droite de tendance (moindres carrés)
    const n = valeurs.length, mx = (n - 1) / 2, my = valeurs.reduce((s, v) => s + v, 0) / n;
    const pente = valeurs.reduce((s, v, i) => s + (i - mx) * (v - my), 0) / valeurs.reduce((s, v, i) => s + (i - mx) ** 2, 0);
    svg.appendChild(S("line", { x1: x(0), y1: y(my - pente * mx), x2: x(n - 1), y2: y(my + pente * (n - 1 - mx)), class: "sch-pointille" }));
    svg.appendChild(S("polyline", { points: valeurs.map((v, i) => x(i) + "," + y(v)).join(" "), class: "sch-trait", "stroke-width": 1.8 }));
    svg.appendChild(S("polyline", { points: valeurs.slice(8, 16).map((v, i) => x(i + 8) + "," + y(v)).join(" "), class: "sch-rouge-trait" }));
    svg.appendChild(S("circle", { cx: x(8), cy: y(15.2), r: 4, class: "sch-rouge" }));
    ecrireTexte(svg, x(11.5), 28, "fenêtre choisie", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, x(24), 24, "tendance d'ensemble", "sch-petit sch-halo", "end");
    [0, 8, 16, 24].forEach(i => ecrireTexte(svg, x(i), 186, "an " + (i + 1), "sch-petit", i === 24 ? "end" : "middle"));
    return { svg, legende: "Données fictives. La tendance d'ensemble monte nettement ; en partant d'un pic exceptionnel (en rouge), une fenêtre bien choisie suggère pourtant une baisse." };
  },

  "sophismes:affirmation-consequent": () => ({
    svg: implication("Le cercle P (il a plu) est inclus dans le cercle Q (route mouillée) ; un point rouge se trouve dans Q sans être dans P.", "il a plu", "la route est mouillée", "arrosage"),
    legende: "« Si P alors Q » : tout ce qui est dans P est dans Q. Mais être dans Q ne garantit pas d'être dans P : la route peut être mouillée sans qu'il ait plu (point rouge)."
  }),

  "sophismes:negation-antecedent": () => ({
    svg: implication("Le cercle P (à Paris) est inclus dans le cercle Q (en France) ; un point rouge se trouve hors de P mais dans Q.", "à Paris", "en France", "à Lyon"),
    legende: "« Si P alors Q » : ne pas être dans P n'empêche pas d'être dans Q. On peut être en France sans être à Paris (point rouge)."
  }),

  "sophismes:petition-principe": () => {
    const svg = toile(320, 150, "Deux affirmations qui se justifient l'une l'autre en boucle.");
    const fleche = definirFleche(svg);
    [[90, "P"], [230, "Q"]].forEach(([x, t]) => {
      svg.appendChild(S("circle", { cx: x, cy: 75, r: 28, class: "sch-clair" }));
      svg.appendChild(S("circle", { cx: x, cy: 75, r: 28, class: "sch-c-trait" }));
      ecrireTexte(svg, x, 81, t, "sch-titre", "middle");
    });
    svg.appendChild(S("path", { d: "M112 56 Q160 14 208 56", class: "sch-trait", "marker-end": fleche }));
    svg.appendChild(S("path", { d: "M208 94 Q160 136 112 94", class: "sch-trait", "marker-end": fleche }));
    ecrireTexte(svg, 160, 26, "Q, car P", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 160, 132, "P, car Q", "sch-petit sch-gras", "middle");
    return { svg, legende: "Chaque affirmation sert de preuve à l'autre : le raisonnement tourne en rond et ne convainc que ceux qui acceptent déjà la conclusion." };
  },

  // ---------------------------------------------------------------- Ajouts : biais
  "biais:disponibilite": () => {
    const ids = ["route", "homicides", "noyades", "terrorisme", "avions", "requins"];
    const lignes = ids.map(id => ({ libelle: CAUSES[id].nom, valeur: CAUSES[id].valeur, texte: fr(CAUSES[id].valeur),
      classe: CAUSES[id].mediatique ? "sch-orange" : "sch-c" }));
    lignes[4].texte = "≈ 450";
    return {
      svg: barresHorizontales("Décès annuels dans le monde : accidents de la route environ 1 160 000, homicides 458 000, noyades 300 000, terrorisme 7 555, accidents d'avions de ligne environ 450, attaques de requins environ 6.", lignes, { max: 1300000 }),
      legende: "Décès annuels dans le monde (OMS, ONUDC, Global Terrorism Index, Aviation Safety Network, International Shark Attack File ; années 2021 à 2025). En orange, les causes les plus médiatisées : à part les homicides, leurs barres sont presque invisibles."
    };
  },

  "biais:surprecision": () => ({
    svg: barresHorizontales("Part des réponses hors de l'intervalle donné : attendue 2 %, observée 42 % pour des intervalles sûrs à 98 %.", [
      { libelle: "Hors de l'intervalle « sûr à 98 % » : attendu", valeur: 2, texte: "2 %" },
      { libelle: "Hors de l'intervalle « sûr à 98 % » : observé", valeur: 42, texte: "42 %", classe: "sch-rouge" }
    ], { max: 50 }),
    legende: "Alpert et Raiffa (1969, publié en 1982) : des étudiants donnaient des intervalles dont ils se disaient sûrs à 98 %. La vraie valeur en sortait 21 fois plus souvent que prévu."
  }),

  "biais:dunning-kruger": () => {
    const svg = toile(320, 122, "Quart des participants le moins performant : rang réel 12e centile, rang estimé 62e centile.");
    const x = c => 20 + 2.8 * c;
    svg.appendChild(S("rect", { x: x(0), y: 62, width: x(100) - x(0), height: 14, class: "sch-fond" }));
    [0, 25, 50, 75, 100].forEach(c => {
      svg.appendChild(S("line", { x1: x(c), y1: 58, x2: x(c), y2: 80, class: "sch-trait-fin" }));
      ecrireTexte(svg, x(c), 96, c + "e", "sch-petit", "middle");
    });
    ecrireTexte(svg, x(50), 112, "rang centile (100e : le meilleur)", "sch-petit", "middle");
    svg.appendChild(S("line", { x1: x(12), y1: 69, x2: x(62) - 8, y2: 69, class: "sch-rouge-trait" }));
    svg.appendChild(S("circle", { cx: x(12), cy: 69, r: 7, class: "sch-discret" }));
    svg.appendChild(S("circle", { cx: x(62), cy: 69, r: 7, class: "sch-rouge" }));
    ecrireTexte(svg, x(12), 44, "Réel : 12e", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, x(62), 44, "Estimé : 62e", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 160, 18, "Le quart le moins performant", "sch-petit", "middle");
    return { svg, legende: "Kruger et Dunning (1999), moyenne de quatre études : les participants du quart le moins performant se situaient vers le 12e centile, mais se plaçaient eux-mêmes vers le 62e. Une partie de l'écart tient à des artefacts statistiques (voir la source)." };
  },

  "biais:confirmation": () => {
    const svg = toile(320, 210, "Deux ensembles emboîtés : la règle réelle (nombres croissants) contient l'hypothèse (nombres pairs croissant de 2). Seuls les tests hors de l'hypothèse permettent de les distinguer.");
    svg.appendChild(S("rect", { x: 10, y: 24, width: 300, height: 176, rx: 4, class: "sch-fond" }));
    ecrireTexte(svg, 18, 18, "Toutes les suites de trois nombres", "sch-petit");
    svg.appendChild(S("ellipse", { cx: 160, cy: 116, rx: 146, ry: 78, class: "sch-clair" }));
    svg.appendChild(S("ellipse", { cx: 160, cy: 116, rx: 146, ry: 78, class: "sch-c-trait" }));
    ecrireTexte(svg, 160, 66, "Règle réelle : nombres croissants", "sch-petit sch-gras", "middle");
    svg.appendChild(S("ellipse", { cx: 108, cy: 132, rx: 84, ry: 48, class: "sch-carte" }));
    svg.appendChild(S("ellipse", { cx: 108, cy: 132, rx: 84, ry: 48, class: "sch-c-trait" }));
    ecrireTexte(svg, 108, 112, "Hypothèse :", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 108, 125, "pairs, de 2 en 2", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 108, 147, "8, 10, 12 : oui", "sch-texte", "middle");
    ecrireTexte(svg, 108, 162, "(ne tranche rien)", "sch-petit", "middle");
    ecrireTexte(svg, 248, 128, "1, 5, 9 : oui", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 248, 144, "(la réfute)", "sch-petit", "middle");
    ecrireTexte(svg, 272, 192, "3, 2, 1 : non", "sch-petit", "middle");
    return { svg, legende: "La tâche 2, 4, 6 de Wason (1960). Les suites qui respectent l'hypothèse la confirment sans pouvoir la mettre en défaut ; seule une suite choisie hors de l'hypothèse, comme 1, 5, 9, peut révéler qu'elle est trop étroite." };
  },

  "biais:apophenie": () => {
    const svg = toile(320, 200, "Cent soixante points placés au hasard, indépendamment les uns des autres : on y voit pourtant des grappes et des vides.");
    const alea = generateur(20261029);
    const points = Array.from({ length: 160 }, () => [8 + 304 * alea(), 8 + 184 * alea()]);
    svg.appendChild(S("rect", { x: 0, y: 0, width: 320, height: 200, class: "sch-fond" }));
    // Repère la zone la plus dense et la plus vide, sur une grille de 8 × 5 cases
    const cases = Array(40).fill(0);
    points.forEach(([x, y]) => { cases[Math.min(7, Math.floor(x / 40)) + 8 * Math.min(4, Math.floor(y / 40))]++; });
    const pleine = cases.indexOf(Math.max(...cases)), vide = cases.indexOf(Math.min(...cases));
    const etiquettes = [];
    [[pleine, "sch-c-trait", "grappe"], [vide, "sch-rouge-trait", "vide"]].forEach(([k, classe, libelle]) => {
      // Cercle de rayon 27 centré sur la case, mais jamais hors du cadre
      const cx = Math.min(291, Math.max(29, 40 * (k % 8) + 20)), cy = Math.min(171, Math.max(29, 40 * Math.floor(k / 8) + 20));
      svg.appendChild(S("circle", { cx, cy, r: 27, class: classe, "stroke-dasharray": "4 3" }));
      etiquettes.push([cx, cy < 100 ? cy + 42 : cy - 33, libelle]);
    });
    points.forEach(([x, y]) => svg.appendChild(S("circle", { cx: x, cy: y, r: 2.6, class: "sch-discret" })));
    // Étiquettes dessinées après les points, avec un liseré, pour rester lisibles
    etiquettes.forEach(([x, y, libelle]) => ecrireTexte(svg, x, y, libelle, "sch-petit sch-gras sch-halo", "middle"));
    return { svg, legende: "160 points tirés au hasard, chacun indépendamment des autres (données simulées). La « grappe » et le « vide » entourés sont dus au seul hasard : un hasard parfaitement régulier serait, lui, suspect." };
  },

  "biais:negativite": () => ({
    svg: barresHorizontales("Part de l'humanité vivant dans l'extrême pauvreté : 43 % en 1990, 10 % en 2024. En 2017, 9 % des personnes interrogées savaient qu'elle avait fortement baissé.", [
      { libelle: "Extrême pauvreté dans le monde, 1990", valeur: 43, texte: "43 %" },
      { libelle: "Extrême pauvreté dans le monde, 2024", valeur: 10, texte: "10 %" },
      { libelle: "Personnes qui le savaient (enquête de 2017)", valeur: 9, texte: "9 %", classe: "sch-rouge" }
    ], { max: 50 }),
    legende: "Banque mondiale (seuil de 3 dollars par jour) ; enquête Gapminder de 2017, à une question proche. Hans Rosling voyait dans ce pessimisme systématique un effet de notre attention aux mauvaises nouvelles."
  }),

  "biais:dotation": () => ({
    svg: barresHorizontales("Part des participants qui gardent l'objet reçu plutôt que de l'échanger : tasse 89 %, barre chocolatée 90 %.", [
      { libelle: "Ont reçu une tasse : la gardent", valeur: 89, texte: "89 %" },
      { libelle: "Ont reçu du chocolat : le gardent", valeur: 90, texte: "90 %" },
      { libelle: "Choix libre, sans objet reçu", valeur: 50, texte: "≈ moitié-moitié", classe: "sch-gris" }
    ], { max: 100 }),
    legende: "Knetsch (1989). Recevoir un objet suffit à le valoriser : presque personne n'échange, quel que soit l'objet reçu, alors qu'un groupe libre de choisir se partage à peu près également."
  }),

  "biais:halo": () => {
    const svg = toile(320, 170, "Une seule qualité visible, l'apparence, se diffuse sur des qualités sans rapport : intelligence, honnêteté, compétence.");
    const fleche = definirFleche(svg);
    svg.appendChild(S("rect", { x: 104, y: 10, width: 112, height: 38, rx: 4, class: "sch-c" }));
    ecrireTexte(svg, 160, 34, "Belle apparence", "sch-sur-c", "middle");
    [["Intelligent ?", 50], ["Honnête ?", 160], ["Compétent ?", 270]].forEach(([t, x]) => {
      svg.appendChild(S("line", { x1: 160, y1: 50, x2: x, y2: 108, class: "sch-trait", "marker-end": fleche }));
      svg.appendChild(S("rect", { x: x - 48, y: 112, width: 96, height: 34, rx: 4, class: "sch-clair" }));
      svg.appendChild(S("rect", { x: x - 48, y: 112, width: 96, height: 34, rx: 4, class: "sch-c-trait" }));
      ecrireTexte(svg, x, 133, t, "sch-texte", "middle");
    });
    ecrireTexte(svg, 160, 166, "aucune information réelle sur ces qualités", "sch-petit", "middle");
    return { svg, legende: "Schéma de l'effet de halo : une impression globale, souvent fondée sur un seul trait visible, colore le jugement sur des qualités qui n'ont aucun rapport avec lui." };
  },

  // ---------------------------------------------------------------- Ajouts : sophismes
  "sophismes:homme-de-paille": () => {
    const svg = toile(320, 160, "La position réelle, nuancée, est remplacée par une caricature, plus facile à attaquer.");
    const fleche = definirFleche(svg);
    svg.appendChild(S("rect", { x: 10, y: 20, width: 130, height: 70, rx: 4, class: "sch-clair" }));
    svg.appendChild(S("rect", { x: 10, y: 20, width: 130, height: 70, rx: 4, class: "sch-c-trait" }));
    ecrireTexte(svg, 75, 42, "Position réelle", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 75, 62, "« Réduire un peu", "sch-petit", "middle");
    ecrireTexte(svg, 75, 77, "la vitesse en ville »", "sch-petit", "middle");
    svg.appendChild(S("rect", { x: 180, y: 20, width: 130, height: 70, rx: 4, class: "sch-pointille" }));
    ecrireTexte(svg, 245, 42, "Caricature", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 245, 62, "« Interdire", "sch-petit", "middle");
    ecrireTexte(svg, 245, 77, "les voitures »", "sch-petit", "middle");
    svg.appendChild(S("line", { x1: 142, y1: 55, x2: 176, y2: 55, class: "sch-trait", "marker-end": fleche }));
    svg.appendChild(S("line", { x1: 245, y1: 130, x2: 245, y2: 96, class: "sch-rouge-trait", "marker-end": fleche }));
    ecrireTexte(svg, 245, 148, "l'attaque vise la caricature", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 75, 115, "la position réelle", "sch-petit", "middle");
    ecrireTexte(svg, 75, 130, "reste intacte", "sch-petit", "middle");
    return { svg, legende: "Exemple fictif. L'homme de paille réfute une version déformée, plus extrême ou plus faible, de la thèse adverse : la thèse réelle n'est jamais discutée." };
  },

  "sophismes:ignorance": () => {
    const svg = toile(320, 130, "Trois états : prouvé vrai, non prouvé, prouvé faux. Le sophisme passe directement de « non prouvé » à « faux » ou à « vrai ».");
    const fleche = definirFleche(svg);
    [["Prouvé vrai", 10, "sch-vert"], ["Prouvé faux", 220, "sch-rouge"]].forEach(([t, x, classe]) => {
      svg.appendChild(S("rect", { x, y: 34, width: 90, height: 40, rx: 4, class: classe }));
      ecrireTexte(svg, x + 45, 58, t, "sch-sur-c", "middle");
    });
    // L'état « en suspens » : fond d'encadré et texte normal, lisibles dans les deux thèmes
    svg.appendChild(S("rect", { x: 115, y: 34, width: 90, height: 40, rx: 4, class: "sch-fond sch-contour" }));
    ecrireTexte(svg, 160, 51, "Ni prouvé", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 160, 65, "ni réfuté", "sch-texte sch-gras", "middle");
    svg.appendChild(S("path", { d: "M160 80 Q 210 118 262 80", class: "sch-rouge-trait", "marker-end": fleche }));
    svg.appendChild(S("path", { d: "M160 80 Q 110 118 58 80", class: "sch-rouge-trait", "marker-end": fleche }));
    ecrireTexte(svg, 160, 22, "« Personne n'a prouvé le contraire »", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 160, 124, "saut illégitime, dans un sens comme dans l'autre", "sch-petit", "middle");
    return { svg, legende: "L'absence de preuve n'est pas une preuve d'absence, ni une preuve de présence : une affirmation non démontrée reste simplement en suspens." };
  },

  "sophismes:generalisation-hative": () => {
    const svg = toile(320, 170, "Cent personnes représentées par des points ; trois seulement, observées, servent à conclure sur toutes.");
    const alea = generateur(1729);
    const observes = new Set([7, 8, 17]);
    for (let k = 0; k < 100; k++) {
      const x = 22 + 28 * (k % 10) + 4 * (alea() - 0.5), y = 20 + 13 * Math.floor(k / 10) + 3 * (alea() - 0.5);
      svg.appendChild(S("circle", { cx: x, cy: y, r: observes.has(k) ? 6 : 4, class: observes.has(k) ? "sch-rouge" : "sch-gris" }));
    }
    ecrireTexte(svg, 160, 156, "3 cas observés → une conclusion sur les 100", "sch-texte sch-gras", "middle");
    return { svg, legende: "Schéma : conclure sur un groupe entier à partir de quelques cas, souvent les plus visibles ou les plus frappants, sans savoir s'ils sont représentatifs." };
  },

  "sophismes:ad-hominem": () => {
    const svg = toile(320, 150, "L'attaque vise la personne qui avance l'argument, et non l'argument lui-même, qui reste sans réponse.");
    const fleche = definirFleche(svg);
    svg.appendChild(S("circle", { cx: 70, cy: 60, r: 36, class: "sch-clair" }));
    svg.appendChild(S("circle", { cx: 70, cy: 60, r: 36, class: "sch-c-trait" }));
    ecrireTexte(svg, 70, 64, "La personne", "sch-petit sch-gras", "middle");
    svg.appendChild(S("rect", { x: 160, y: 34, width: 150, height: 52, rx: 4, class: "sch-carte" }));
    svg.appendChild(S("rect", { x: 160, y: 34, width: 150, height: 52, rx: 4, class: "sch-c-trait" }));
    ecrireTexte(svg, 235, 56, "Son argument", "sch-texte sch-gras", "middle");
    ecrireTexte(svg, 235, 74, "(prémisses, conclusion)", "sch-petit", "middle");
    svg.appendChild(S("line", { x1: 107, y1: 60, x2: 159, y2: 60, class: "sch-trait" }));
    svg.appendChild(S("line", { x1: 70, y1: 132, x2: 70, y2: 100, class: "sch-rouge-trait", "marker-end": fleche }));
    ecrireTexte(svg, 70, 146, "l'attaque", "sch-petit sch-gras", "middle");
    ecrireTexte(svg, 235, 112, "aucune réponse", "sch-petit", "middle");
    ecrireTexte(svg, 235, 127, "sur le fond", "sch-petit", "middle");
    return { svg, legende: "Schéma : critiquer la personne (son caractère, ses intérêts, son passé) ne dit rien de la validité de son argument, qui doit être examiné pour lui-même." };
  }
};
