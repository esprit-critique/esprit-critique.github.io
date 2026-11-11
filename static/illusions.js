// illusions.js : l'illusion du jour (accueil). Chaque illusion est un dessin SVG fait d'éléments « leurre » (ce qui
// trompe l'œil) et « repere » (ce qui le démontre, caché d'abord). « Vérifier » pose la classe « revele » sur le dessin :
// les leurres s'effacent, les repères apparaissent (le mouvement de la révélation, DESIGN.md), par des transitions CSS
// d'opacité, que la règle des animations réduites arrête. Sources vérifiées le 11 novembre 2026 (journal de la refonte).
// Dessin dans un cadre de 320 × 200 ; svg() vient d'ateliers.js, appelé seulement depuis les fonctions.

// Trait d'encre, leurre et repère : trois classes de style.css
const ILL_ENCRE = { class: "ill-encre" }, ILL_LEURRE = { class: "ill-encre leurre" }, ILL_REPERE = { class: "repere" };
const illTrait = (x1, y1, x2, y2, a = ILL_ENCRE) => svg("line", Object.assign({ x1, y1, x2, y2 }, a));
const illRond = (cx, cy, r, a) => svg("circle", Object.assign({ cx, cy, r }, a));

const ILLUSIONS_DU_JOUR = [
  {
    id: "muller-lyer", titre: "Müller-Lyer",
    question: "Lequel des deux traits est le plus long ?",
    explication: "Les deux traits ont la même longueur. Les pointes tournées vers l'extérieur allongent le trait, celles tournées vers l'intérieur le raccourcissent.",
    source: "Franz Carl Müller-Lyer, « Optische Urteilstäuschungen », Archiv für Physiologie, 1889.",
    dessiner(g) {
      const ailettes = (x, y, sens) => [[-1, -1], [-1, 1]].map(([dx, dy]) => illTrait(x, y, x + sens * 16 * dx, y + 16 * dy, ILL_LEURRE));
      g.append(illTrait(90, 60, 230, 60), illTrait(90, 140, 230, 140),
        ...ailettes(90, 60, 1), ...ailettes(230, 60, -1), ...ailettes(90, 140, -1), ...ailettes(230, 140, 1),
        illTrait(90, 30, 90, 170, ILL_REPERE), illTrait(230, 30, 230, 170, ILL_REPERE));
    }
  },
  {
    id: "ebbinghaus", titre: "Ebbinghaus",
    question: "Lequel des deux cercles du centre est le plus grand ?",
    explication: "Les deux cercles du centre sont identiques. Entouré de grands cercles, un cercle paraît plus petit ; entouré de petits, il paraît plus grand.",
    source: "Hermann Ebbinghaus, fin du XIXe siècle ; popularisée par Edward Titchener (1901).",
    dessiner(g) {
      const couronne = (cx, n, d, r) => Array.from({ length: n }, (_, k) => illRond(cx + d * Math.cos(2 * Math.PI * k / n), 100 + d * Math.sin(2 * Math.PI * k / n), r, ILL_LEURRE));
      g.append(...couronne(85, 6, 52, 22), ...couronne(235, 8, 30, 7), illRond(85, 100, 14, { class: "ill-plein" }), illRond(235, 100, 14, { class: "ill-plein" }),
        illTrait(40, 86, 280, 86, ILL_REPERE), illTrait(40, 114, 280, 114, ILL_REPERE));
    }
  },
  {
    id: "verticale-horizontale", titre: "Verticale et horizontale",
    question: "Le trait vertical est-il plus long que le trait horizontal ?",
    explication: "Les deux traits ont la même longueur. Un trait vertical paraît plus long qu'un horizontal, surtout quand il le coupe en son milieu.",
    source: "Adolf Fick, 1851.",
    dessiner(g) {
      // Repère : un carré de 120 de côté, dans lequel le T tient exactement
      g.append(illTrait(100, 170, 220, 170), illTrait(160, 170, 160, 50),
        svg("path", { d: "M100 170V50H220V170", class: "repere" }));
    }
  },
  {
    id: "zollner", titre: "Zöllner",
    question: "Les grandes lignes obliques sont-elles parallèles ?",
    explication: "Elles sont parfaitement parallèles. Les petits traits qui les croisent, inclinés tantôt d'un côté, tantôt de l'autre, les font paraître converger.",
    source: "Johann Karl Friedrich Zöllner, Annalen der Physik, 1860.",
    dessiner(g) {
      for (let k = 0; k < 5; k++) {
        const x = 30 + 52 * k;
        g.appendChild(illTrait(x, 20, x + 60, 180));
        for (let t = 1; t < 8; t++) {
          const px = x + 60 * t / 8, py = 20 + 160 * t / 8;
          g.appendChild(k % 2 ? illTrait(px - 10, py, px + 10, py, ILL_LEURRE) : illTrait(px, py - 10, px, py + 10, ILL_LEURRE));
        }
      }
    }
  },
  {
    id: "hering", titre: "Hering",
    question: "Les deux lignes horizontales sont-elles droites ?",
    explication: "Elles sont droites et parallèles. Les rayons qui partent du centre les font paraître bombées vers l'extérieur.",
    source: "Ewald Hering, Beiträge zur Physiologie, 1861.",
    dessiner(g) {
      for (let k = 0; k < 24; k++) {
        const a = Math.PI * k / 24;
        // Rayons partant d'un petit cercle vide : pas de tache d'encre au centre
        const c = Math.cos(a), s = Math.sin(a) * 0.62;
        g.append(illTrait(160 + 14 * c, 100 + 14 * s, 160 + 170 * c, 100 + 170 * s, { class: "ill-fin leurre" }), illTrait(160 - 14 * c, 100 - 14 * s, 160 - 170 * c, 100 - 170 * s, { class: "ill-fin leurre" }));
      }
      g.append(svg("line", { x1: 20, y1: 70, x2: 300, y2: 70, class: "ill-fort" }), svg("line", { x1: 20, y1: 130, x2: 300, y2: 130, class: "ill-fort" }));
    }
  },
  {
    id: "mur-cafe", titre: "Le mur du café",
    question: "Les lignes grises entre les rangées de carreaux sont-elles parallèles ?",
    explication: "Elles sont droites et parallèles. Le décalage des carreaux sombres et clairs, de part et d'autre d'un joint fin, les fait paraître inclinées.",
    source: "Richard Gregory et Priscilla Heard, « Border locking and the Café Wall illusion », Perception, 1979.",
    dessiner(g) {
      const decalages = [0, 10, 20, 10, 0, 10, 20];
      decalages.forEach((d, r) => {
        for (let c = -1; c < 9; c++) {
          if (c % 2) g.appendChild(svg("rect", { x: 20 + c * 36 + d, y: 26 + r * 22, width: 36, height: 20, class: "ill-carreau leurre" }));
        }
        if (r) g.appendChild(svg("line", { x1: 20, y1: 25 + r * 22, x2: 300, y2: 25 + r * 22, class: "ill-joint" }));
      });
      g.appendChild(svg("rect", { x: 0, y: 0, width: 20, height: 200, class: "ill-cache" }));
      g.appendChild(svg("rect", { x: 300, y: 0, width: 20, height: 200, class: "ill-cache" }));
    }
  },
  {
    id: "kanizsa", titre: "Le triangle de Kanizsa",
    question: "Voyez-vous un triangle blanc par-dessus les autres formes ?",
    explication: "Aucun triangle n'est dessiné : seulement trois disques entamés et trois angles. Le cerveau complète les bords qui manquent.",
    source: "Gaetano Kanizsa, « Margini quasi-percettivi in campi con stimolazione omogenea », Rivista di Psicologia, 1955.",
    dessiner(g) {
      const sommets = [[160, 36], [96, 150], [224, 150]];
      const disque = ([cx, cy]) => {
        // Disque entamé d'un secteur de 60° tourné vers le centre du triangle
        const centre = Math.atan2(112 - cy, 160 - cx), r = 26;
        const a1 = centre - Math.PI / 6, a2 = centre + Math.PI / 6;
        const p = a => (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1);
        return svg("path", { d: "M" + cx + " " + cy + "L" + p(a2) + "A" + r + " " + r + " 0 1 1 " + p(a1) + "Z", class: "ill-plein" });
      };
      g.append(...sommets.map(disque));
      // Triangle d'angles, à l'envers, en trait
      const bas = [[160, 172], [96, 58], [224, 58]];
      bas.forEach(([x, y], k) => {
        const [ax, ay] = bas[(k + 1) % 3], [bx, by] = bas[(k + 2) % 3];
        const pt = (tx, ty) => [x + (tx - x) * 0.28, y + (ty - y) * 0.28];
        const [p1x, p1y] = pt(ax, ay), [p2x, p2y] = pt(bx, by);
        g.append(illTrait(x, y, p1x, p1y), illTrait(x, y, p2x, p2y));
      });
      // Repères : les bords que le cerveau invente, en pointillé
      g.appendChild(svg("path", { d: "M160 36L96 150L224 150Z", class: "repere" }));
    }
  },
  {
    id: "jastrow", titre: "Jastrow",
    question: "Laquelle des deux formes est la plus grande ?",
    explication: "Les deux formes sont identiques : le bord court de l'une, placé contre le bord long de l'autre, fait paraître celle du bas plus grande.",
    source: "Joseph Jastrow, American Journal of Psychology, 1892.",
    dessiner(g) {
      // Une portion d'anneau : arc extérieur de rayon 130, intérieur de 80, sur 60°
      const forme = (dy, a) => svg("path", { d: "M95 " + (130 + dy) + "A130 130 0 0 1 225 " + (130 + dy) + "L200 " + (155 + dy) + "A80 80 0 0 0 120 " + (155 + dy) + "Z", class: a });
      g.append(forme(-70, "ill-forme"), forme(-5, "ill-forme"), forme(-5, "repere-forme"));
      g.lastChild.setAttribute("transform", "translate(0 -65)");
    }
  },
  {
    id: "contraste", titre: "Le contraste simultané",
    question: "Lequel des deux carrés gris est le plus clair ?",
    explication: "Les deux carrés ont exactement le même gris. Sur un fond sombre, un gris paraît plus clair ; sur un fond clair, plus sombre.",
    source: "Michel-Eugène Chevreul, De la loi du contraste simultané des couleurs, 1839.",
    dessiner(g) {
      g.append(svg("rect", { x: 20, y: 30, width: 140, height: 140, class: "ill-fond-sombre leurre" }), svg("rect", { x: 160, y: 30, width: 140, height: 140, class: "ill-fond-clair leurre" }),
        svg("rect", { x: 65, y: 75, width: 50, height: 50, class: "ill-gris" }), svg("rect", { x: 205, y: 75, width: 50, height: 50, class: "ill-gris" }),
        svg("rect", { x: 115, y: 92, width: 90, height: 16, class: "ill-gris repere-plein" }));
    }
  }
];

// Carte de l'accueil : l'illusion du jour (la même pour tout le monde), « Vérifier » et « Une autre illusion »
function carteIllusionDuJour() {
  const carte = el("article", "carte illusion-jour");
  let indice = Math.floor(generateur(aujourdHui() * 7919 + 11)() * ILLUSIONS_DU_JOUR.length);
  const afficher = () => {
    const ill = ILLUSIONS_DU_JOUR[indice];
    carte.replaceChildren();
    carte.appendChild(el("p", "surtitre", T("L'illusion du jour : {0}", T(ill.titre))));
    carte.appendChild(el("p", "illusion-question", ill.question));
    const dessin = svg("svg", { viewBox: "0 0 320 200", class: "illusion-dessin", role: "img", "aria-label": T(ill.question) });
    ill.dessiner(dessin);
    carte.appendChild(dessin);
    const explication = el("p", "illusion-explication", ill.explication);
    explication.hidden = true;
    const source = el("p", "source", ill.source);
    source.hidden = true;
    const actions = el("div", "actions");
    const verifier = el("button", "bouton", "Vérifier");
    verifier.type = "button";
    verifier.setAttribute("aria-pressed", "false");
    verifier.addEventListener("click", () => {
      const revele = dessin.classList.toggle("revele");
      verifier.setAttribute("aria-pressed", String(revele));
      verifier.textContent = typo(revele ? T("Revoir l'illusion") : T("Vérifier"));
      explication.hidden = source.hidden = !revele;
      if (revele) annoncer(ill.explication);
    });
    const autre = el("button", "bouton secondaire", "Une autre illusion");
    autre.type = "button";
    autre.addEventListener("click", () => {
      // Jamais la même deux fois de suite
      indice = (indice + 1 + Math.floor(Math.random() * (ILLUSIONS_DU_JOUR.length - 1))) % ILLUSIONS_DU_JOUR.length;
      afficher();
      carte.querySelector(".bouton").focus();
    });
    actions.append(verifier, autre);
    carte.append(explication, source, actions, lienVers("#chiffres/illusion", "Mesurer votre propre illusion dans l'atelier", "lien-discret"));
  };
  afficher();
  return carte;
}
