// perception.js : ateliers sur la perception (illusions, hasard, corrélations, graphiques).
// Ils s'ajoutent au tableau JEUX de chiffres.js : leurs adresses sont #chiffres/…
// Toutes les figures sont dessinées ici, en SVG ; les données des graphiques sont fictives.

// ===================== Outils =====================

// Tirage selon une loi normale centrée réduite (méthode de Box-Muller)
function gauss() {
  const u = 1 - Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function correlationDe(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p[0], 0) / n, my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  points.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
  return sxy / Math.sqrt(sxx * syy);
}

const signe = x => (x > 0 ? "+" : x < 0 ? "−" : "") + fr(Math.abs(x));
const pourcent = x => signe(Math.round(x * 100)) + " %";

// Plus longue série de valeurs identiques, et nombre de changements, dans une suite de 0 et de 1
function series(suite) {
  let plusLongue = 1, courante = 1, changements = 0;
  for (let i = 1; i < suite.length; i++) {
    if (suite[i] === suite[i - 1]) courante++;
    else { changements++; courante = 1; }
    plusLongue = Math.max(plusLongue, courante);
  }
  return { plusLongue, changements };
}

// Probabilité qu'une suite de n lancers d'une pièce équilibrée n'ait aucune série plus longue que m :
// il y a 2 × (compositions de n en parts ≤ m) suites possibles sur 2^n.
function probaSeriesAuPlus(n, m) {
  const c = [1];
  for (let i = 1; i <= n; i++) {
    let s = 0;
    for (let j = 1; j <= Math.min(m, i); j++) s += c[i - j];
    c[i] = s;
  }
  return Math.min(1, 2 * c[n] / Math.pow(2, n));
}

// Loi binomiale B(n, 1/2) : probabilité d'obtenir au moins k (ou au plus k) succès
function binomialeDemi(n) {
  const p = [Math.pow(0.5, n)];
  for (let k = 1; k <= n; k++) p[k] = p[k - 1] * (n - k + 1) / k;
  return p;
}

// Rangée de cases pour une suite pile/face (1 = pile) ; « surligner » marque les séries d'au moins « seuil »
function casesSuite(suite, seuil) {
  const grille = el("div", "suite-cases");
  let debut = 0;
  const longueurs = suite.map(() => 0);
  for (let i = 1; i <= suite.length; i++) {
    if (i === suite.length || suite[i] !== suite[debut]) {
      for (let k = debut; k < i; k++) longueurs[k] = i - debut;
      debut = i;
    }
  }
  suite.forEach((v, i) => {
    const c = el("span", (v ? "pile" : "face") + (seuil && longueurs[i] >= seuil ? " serie" : ""), v ? "P" : "F");
    grille.appendChild(c);
  });
  return grille;
}

// ===================== Les ateliers =====================

JEUX.push(
  // ---------------------------------------------------------------
  {
    id: "illusion",
    section: "perception",
    ordre: 1,
    picto: "illusion",
    couleur: "#1d4f91",
    duree: "3 min",
    titre: "L'illusion qui résiste",
    resume: "Réglez trois figures pour qu'elles paraissent égales, puis recommencez en connaissant le piège. Savoir suffit-il à ne plus se tromper ?",
    lancer(zone) {
      const etapes = [
        { figure: "muller", inverse: false, titre: "Les deux traits horizontaux" },
        { figure: "ebbinghaus", titre: "Les deux cercles du centre" },
        { figure: "verticale", titre: "Le trait vertical et le trait horizontal" },
        { figure: "muller", inverse: Math.random() < 0.5, titre: "Les deux traits, en connaissant le piège", averti: true }
      ];
      const ecarts = [];
      let i = 0;

      function etape() {
        zone.innerHTML = "";
        if (i >= etapes.length) return bilan();
        const e = etapes[i];
        entete(zone, i + 1, etapes.length, "Figure");
        zone.appendChild(el("p", "consigne", e.averti ? "Dernière figure : vous connaissez le piège" : "Réglez la figure"));
        zone.appendChild(el("p", "cas", consigneIllusion(e)));
        const figure = figureIllusion(e);
        zone.appendChild(figure.svg);
        const curseur = el("input", "curseur");
        curseur.type = "range";
        curseur.min = 0;
        curseur.max = 1000;
        curseur.value = Math.round(150 + Math.random() * 700);
        curseur.setAttribute("aria-label", "Taille de l'élément réglable");
        const appliquer = () => figure.regler(curseur.value / 1000);
        curseur.addEventListener("input", appliquer);
        appliquer();
        zone.appendChild(curseurAvecBoutons(curseur, 4));
        const valider = el("button", "bouton large", "Ils me paraissent égaux");
        valider.dataset.valider = "1";
        zone.appendChild(valider);
        valider.addEventListener("click", () => {
          valider.remove();
          curseur.disabled = true;
          const ecart = figure.reveler();
          ecarts.push(ecart);
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (Math.abs(ecart) < 0.04 ? "juste" : "faux"),
            Math.abs(ecart) < 0.04 ? "Presque parfait : " + pourcent(ecart) + "." : "Écart : " + pourcent(ecart) + " par rapport à l'égalité réelle."));
          retour.appendChild(paragraphe(explicationIllusion(e, ecart)));
          if (e.averti) {
            const avant = Math.abs(ecarts[0]), apres = Math.abs(ecart);
            retour.appendChild(paragraphe(apres > avant * 0.7
              ? "Votre réglage reste décalé, alors que vous saviez que la figure trompe. Savoir qu'une illusion existe ne la fait pas disparaître."
              : "Votre écart a diminué : vous avez corrigé en connaissance de cause. Mais regardez à nouveau la figure : l'illusion est toujours là, vous l'avez seulement compensée."));
          }
          zone.appendChild(retour);
          retour.appendChild(boutonSuivant(i === etapes.length - 1 ? "Voir le bilan" : "Figure suivante", () => { i++; etape(); }));
        });
      }

      function bilan() {
        noterPartie("illusion");
        const historique = lire("illusions", []);
        historique.push({ j: aujourdHui(), avant: Math.round(ecarts[0] * 1000) / 1000, apres: Math.round(Math.abs(ecarts[3]) * 1000) / 1000 });
        ecrire("illusions", historique.slice(-20));
        zone.appendChild(el("p", "consigne", "Bilan"));
        const tableau = el("table", "tableau");
        const tete = el("tr");
        tete.append(el("th", null, "Figure"), el("th", null, "Votre écart"));
        tableau.appendChild(tete);
        [["Müller-Lyer (traits)", ecarts[0]], ["Ebbinghaus (cercles)", ecarts[1]], ["Verticale-horizontale", ecarts[2]], ["Müller-Lyer, averti", ecarts[3]]].forEach(([nom, ecart]) => {
          const tr = el("tr");
          tr.append(el("td", null, nom), el("td", null, pourcent(ecart)));
          tableau.appendChild(tr);
        });
        zone.appendChild(tableau);
        ajouterExplication(zone, "Ce que montrent ces figures", [
          "Ces illusions sont parmi les plus étudiées de la psychologie : Müller-Lyer (1889), Ebbinghaus (fin du XIXe siècle), illusion verticale-horizontale (décrite par Fick en 1851). Elles ne disparaissent pas quand on sait que les éléments sont égaux : notre perception ne consulte pas nos connaissances.",
          "C'est la meilleure image de ce qu'est un biais cognitif. Le connaître ne suffit pas à l'éviter : il faut une méthode extérieure, comme une règle pour mesurer les traits. Pour le jugement, ce sont les statistiques, les listes de vérification, l'avis d'autrui.",
          "La force de l'illusion de Müller-Lyer varie selon les populations : Segall, Campbell et Herskovits (1966) l'ont trouvée plus faible chez des chasseurs-cueilleurs San du Kalahari que dans des échantillons européens. Ils l'attribuaient à l'habitude des environnements faits d'angles droits ; cette explication reste débattue."
        ], [["#biais/angle-mort", "Biais de l'angle mort"], ["#guide/difference", "Biais ou sophisme ? (guide)"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "illusion").lancer(zone));
      }

      etape();
    }
  },

  // ---------------------------------------------------------------
  {
    id: "hasard",
    section: "perception",
    picto: "hasard",
    couleur: "#9a4f9e",
    duree: "3 min",
    titre: "Le vrai hasard",
    resume: "Deux nuages de points, deux suites de pile ou face : lequel est vraiment aléatoire ? Le hasard fait plus de grappes qu'on ne le croit.",
    lancer(zone) {
      const manches = melanger(["points", "points", "points", "points", "suite", "suite", "suite", "suite"])
        .map(type => ({ type, gauche: Math.random() < 0.5 }));
      derouler(zone, manches, (m, zone, fini) => {
        const vrai = m.type === "points" ? nuageHasard(40) : suiteHasard(30);
        const faux = m.type === "points" ? nuageRegulier(40) : suiteHumaine(30);
        const [a, b] = m.gauche ? [vrai, faux] : [faux, vrai];
        zone.appendChild(el("p", "cas", m.type === "points"
          ? "L'un de ces nuages a été tiré au hasard (chaque point placé indépendamment des autres). Lequel ?"
          : "L'une de ces suites vient de 30 lancers d'une vraie pièce. Laquelle ?"));
        const duo = el("div", m.type === "points" ? "duo" : "duo-suites");
        const panneaux = [a, b].map((donnees, k) => {
          const fig = el("figure", "panneau");
          fig.appendChild(el("figcaption", null, k === 0 ? "A" : "B"));
          fig.appendChild(m.type === "points" ? dessinNuage(donnees) : casesSuite(donnees));
          duo.appendChild(fig);
          return fig;
        });
        zone.appendChild(duo);
        const boutons = ["A", "B"].map((texte, k) => {
          const bouton = boutonChoix(texte, k);
          bouton.addEventListener("click", () => repondre(k));
          zone.appendChild(bouton);
          return bouton;
        });
        function repondre(k) {
          const bon = m.gauche ? 0 : 1;
          const juste = k === bon;
          boutons.forEach((b, j) => {
            b.disabled = true;
            if (j === bon) b.classList.add("juste");
            else if (j === k) b.classList.add("faux");
          });
          panneaux[bon].classList.add("vrai-hasard");
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Non : ") + (bon === 0 ? "A" : "B") + " est le vrai hasard."));
          if (m.type === "points") {
            [a, b].forEach((donnees, j) => quadriller(panneaux[j].querySelector("svg"), donnees));
            const sv = statsNuage(vrai), sf = statsNuage(faux);
            retour.appendChild(paragraphe("Sur une grille de 16 cases, le vrai hasard laisse " + pluriel(sv.vides, "case vide", "cases vides") + " et forme " + pluriel(sv.grappes, "grappe") + " de 5 points ou plus ; l'autre nuage : " + sf.vides + " et " + sf.grappes + ". L'autre nuage a été fabriqué en interdisant aux points de trop se rapprocher, comme on le fait en imaginant le hasard."));
          } else {
            panneaux.forEach((p, j) => { p.replaceChild(casesSuite([a, b][j], 4), p.lastChild); });
            const sv = series(vrai), sf = series(faux);
            retour.appendChild(paragraphe("Vraie pièce : plus longue série de " + sv.plusLongue + ", " + sv.changements + " changements sur 29. L'autre suite : plus longue série de " + sf.plusLongue + ", " + sf.changements + " changements. Elle a été fabriquée en changeant de face 2 fois sur 3, comme le font spontanément la plupart des gens. Les séries de 4 ou plus sont encadrées."));
          }
          zone.appendChild(retour);
          fini(juste, retour);
        }
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "hasard", bonnes, resultats.length);
        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Le vrai hasard produit des grappes, des vides et de longues séries. Nous attendons au contraire un hasard « bien réparti », et nous voyons des motifs là où il n'y en a pas : c'est l'illusion des séries.",
          "Pendant la Seconde Guerre mondiale, des Londoniens voyaient des cibles privilégiées dans les impacts des bombes volantes allemandes. Une analyse statistique de R. D. Clarke (1946) a montré qu'ils suivaient très bien une répartition aléatoire.",
          "En 2014, Spotify a modifié sa lecture aléatoire : des utilisateurs se plaignaient qu'elle ne paraissait pas aléatoire, notamment quand deux titres du même artiste se suivaient. Le nouvel algorithme les répartit volontairement. Apple avait déjà ajouté en 2005 un réglage de ce type à l'iPod.",
          "La « main chaude » du basket (Gilovich, Vallone et Tversky, 1985) a longtemps servi d'exemple d'illusion des séries ; une correction statistique de Miller et Sanjurjo (2018) a montré qu'un léger effet de main chaude pourrait exister. Le débat continue."
        ], [["#biais/apophenie", "Apophénie"], ["#biais/erreur-du-joueur", "Erreur du joueur"], ["#chiffres/ecrire-hasard", "Atelier : écrire le hasard"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "hasard").lancer(zone));
      }, "Manche");
    }
  },

  // ---------------------------------------------------------------
  {
    id: "ecrire-hasard",
    section: "perception",
    picto: "pieces",
    couleur: "#c23b5a",
    duree: "2 min",
    titre: "Écrire le hasard",
    resume: "Inventez une suite de 50 pile ou face aussi aléatoire que possible. L'analyse dira si elle ressemble à une vraie pièce.",
    lancer(zone) {
      const N = 50;
      const suite = [];
      zone.innerHTML = "";
      zone.appendChild(paragraphe("Imaginez que vous lancez une pièce 50 fois et notez les résultats, sans pièce réelle. Essayez d'écrire une suite qu'on ne pourrait pas distinguer d'une vraie."));
      const compteur = el("p", "consigne");
      const affichage = el("div", "suite-cases saisie");
      const rangee = el("div", "rangee-pieces");
      const pile = boutonChoix("Pile", 0), face = boutonChoix("Face", 1);
      pile.classList.add("piece");
      face.classList.add("piece");
      rangee.append(pile, face);
      const annuler = el("button", "lien", "Effacer le dernier");
      annuler.style.marginTop = "6px";
      zone.append(compteur, affichage, rangee, annuler);
      zone.appendChild(paragraphe("Raccourcis : touches P et F, ou 1 et 2.", "source"));

      function maj() {
        compteur.textContent = typo("Lancer " + Math.min(suite.length + 1, N) + " / " + N);
        affichage.innerHTML = "";
        suite.forEach(v => affichage.appendChild(el("span", v ? "pile" : "face", v ? "P" : "F")));
        annuler.disabled = suite.length === 0;
        if (suite.length === N) analyser();
      }
      const ajouter = v => { if (suite.length < N) { suite.push(v); maj(); } };
      pile.addEventListener("click", () => ajouter(1));
      face.addEventListener("click", () => ajouter(0));
      annuler.addEventListener("click", () => { suite.pop(); maj(); });
      const clavier = e => {
        if (!document.body.contains(zone) || suite.length >= N) { document.removeEventListener("keydown", clavier); return; }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === "p" || e.key === "P") { e.preventDefault(); ajouter(1); }
        if (e.key === "f" || e.key === "F") { e.preventDefault(); ajouter(0); }
        if (e.key === "Backspace") { e.preventDefault(); suite.pop(); maj(); }
      };
      document.addEventListener("keydown", clavier);
      maj();

      function analyser() {
        document.removeEventListener("keydown", clavier);
        noterPartie("ecrire-hasard");
        zone.innerHTML = "";
        const { plusLongue, changements } = series(suite);
        const piles = suite.reduce((s, v) => s + v, 0);
        const suites = lire("hasardEcrit", []);
        suites.push({ j: aujourdHui(), c: changements, l: plusLongue });
        ecrire("hasardEcrit", suites.slice(-30));
        const loi = binomialeDemi(N - 1);
        const auMoins = k => loi.slice(k).reduce((s, p) => s + p, 0);
        const auPlus = k => loi.slice(0, k + 1).reduce((s, p) => s + p, 0);
        const pChangements = changements >= 24.5 ? auMoins(changements) : auPlus(changements);
        const pSerie = probaSeriesAuPlus(N, plusLongue);       // une vraie pièce ferait des séries au plus aussi courtes
        const pSerie5 = 1 - probaSeriesAuPlus(N, 4);

        zone.appendChild(el("p", "consigne", "Votre suite"));
        zone.appendChild(casesSuite(suite, 5));
        zone.appendChild(el("p", "consigne", "Une vraie suite de 50 lancers, tirée à l'instant"));
        zone.appendChild(casesSuite(suiteHasard(N), 5));
        zone.appendChild(paragraphe("Les séries de 5 identiques ou plus sont encadrées.", "source"));

        const constats = el("ul", "liste-simple");
        const frequence = p => p < 0.01 ? "moins de 1 % des cas" : Math.round(100 * p) + " % des cas";
        constats.appendChild(el("li", null, "Changements de face : " + changements + " sur 49. Une vraie pièce en fait 24,5 en moyenne ; elle en fait " + (changements >= 25 ? "au moins " : "au plus ") + changements + " dans " + frequence(pChangements) + "."));
        constats.appendChild(el("li", null, "Plus longue série : " + plusLongue + ". Une vraie pièce fait une série d'au moins 5 identiques dans " + Math.round(100 * pSerie5) + " % des cas."));
        constats.appendChild(el("li", null, "Piles : " + piles + " sur 50."));
        zone.appendChild(constats);

        let verdict;
        if (changements >= 32 || (plusLongue <= 4 && pSerie < 0.2)) verdict = "Votre suite alterne trop : elle évite les longues séries qu'une vraie pièce produit souvent. C'est le défaut le plus répandu.";
        else if (changements <= 17) verdict = "Votre suite change rarement de face : elle contient plus de longues séries qu'une vraie pièce n'en produit.";
        else verdict = "Votre suite ressemble à une vraie : nombre de changements et longueur des séries sont plausibles. C'est plus rare qu'on ne le croit.";
        zone.appendChild(el("p", "verdict", verdict));

        ajouterExplication(zone, "Ce que montre cet atelier", [
          "Quand on demande d'inventer une suite aléatoire, la plupart des gens changent trop souvent de face et évitent les longues séries, qui leur paraissent « trop régulières » pour être dues au hasard (synthèses de Wagenaar, 1972, et de Falk et Konold, 1997).",
          "C'est la même intuition qui fait croire qu'après cinq « pile », « face » est plus probable : l'erreur du joueur. Une pièce n'a pas de mémoire.",
          "Ce défaut est utilisé pour repérer des données inventées : des suites trop régulières sont un indice de fraude."
        ], [["#biais/erreur-du-joueur", "Erreur du joueur"], ["#chiffres/hasard", "Atelier : le vrai hasard"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "ecrire-hasard").lancer(zone), "Recommencer");
      }
    }
  },

  // ---------------------------------------------------------------
  {
    id: "correlation",
    section: "perception",
    picto: "correlation",
    couleur: "#1f8a70",
    duree: "3 min",
    titre: "Corrélation à l'œil",
    resume: "Huit nuages de points : estimez le coefficient de corrélation, de −1 à +1. À quoi ressemble une corrélation de 0,3 ?",
    lancer(zone) {
      const cibles = melanger([0.05, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, -0.35, -0.6, -0.85]).slice(0, 8);
      derouler(zone, cibles, (cible, zone, fini) => {
        const points = nuageCorrele(cible, 70);
        const r = correlationDe(points);
        zone.appendChild(el("p", "consigne", "Estimez la corrélation"));
        const graphe = dessinCorrelation(points);
        zone.appendChild(graphe);
        const affichage = el("p", "valeur-curseur");
        const curseur = el("input", "curseur");
        curseur.type = "range";
        curseur.min = -100;
        curseur.max = 100;
        curseur.step = 5;
        curseur.value = 0;
        curseur.setAttribute("aria-label", "Coefficient de corrélation estimé");
        const lire = () => curseur.value / 100;
        const maj = () => { affichage.textContent = typo("Votre estimation : r = " + signe(Number(lire().toFixed(2)))); };
        curseur.addEventListener("input", maj);
        maj();
        const reperes = el("div", "reperes-curseur");
        ["−1", "0", "+1"].forEach(t => reperes.appendChild(el("span", null, t)));
        const valider = el("button", "bouton large", "Valider");
        valider.dataset.valider = "1";
        zone.append(affichage, curseurAvecBoutons(curseur, 5), reperes, valider);
        valider.addEventListener("click", () => {
          valider.remove();
          curseur.disabled = true;
          const erreur = Math.abs(lire() - r);
          const points3 = erreur <= 0.1 ? 2 : erreur <= 0.2 ? 1 : 0;
          tracerDroite(graphe, points);
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (points3 ? "juste" : "faux"), "Corrélation réelle : r = " + signe(Number(r.toFixed(2))) + "."));
          retour.appendChild(paragraphe("Écart : " + fr(Number(erreur.toFixed(2))) + ". " + ["Plus de 0,2 d'écart : aucun point.", "Moins de 0,2 d'écart : 1 point.", "Moins de 0,1 d'écart : 2 points."][points3] +
            " La droite tracée est celle qui résume le mieux le nuage (moindres carrés)." + (Math.abs(r) < 0.5 ? " Avec r = " + signe(Number(r.toFixed(2))) + ", la droite n'explique que " + Math.round(100 * r * r) + " % de la dispersion." : "")));
          zone.appendChild(retour);
          fini({ estime: lire(), reel: r, points: points3 }, retour);
        });
      }, resultats => {
        const total = resultats.reduce((s, x) => s + x.points, 0);
        afficherScore(zone, "correlation", total, resultats.length * 2);
        const erreurMoyenne = resultats.reduce((s, x) => s + Math.abs(x.estime - x.reel), 0) / resultats.length;
        zone.appendChild(paragraphe("Écart moyen : " + fr(Number(erreurMoyenne.toFixed(2))) + "."));
        zone.appendChild(grapheEstimations(resultats));
        zone.appendChild(paragraphe("Chaque point est un nuage : en abscisse la vraie corrélation, en ordonnée votre estimation. Sur la diagonale, l'estimation est exacte.", "source"));
        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Le coefficient r mesure à quel point un nuage s'aligne sur une droite : 0 pour aucune relation linéaire, +1 ou −1 pour un alignement parfait. Son carré, r², indique la part de la dispersion « expliquée » par la droite : r = 0,5 n'en explique que 25 %.",
          "Les relations étudiées en sciences humaines sont souvent faibles : sur un siècle de psychologie sociale, l'effet typique correspond à r ≈ 0,21 (Richard, Bond et Stokes-Zoota, 2003). À l'œil, un tel nuage paraît presque informe.",
          "La présentation influence le jugement : un même nuage paraît plus corrélé quand on élargit les axes et qu'il occupe une plus petite partie du cadre (Cleveland, Diaconis et McGill, 1982).",
          "Une corrélation, même forte, ne dit rien de la cause : les deux variables peuvent dépendre d'une troisième, ou l'effet aller dans l'autre sens."
        ], [["#sophismes/correlation", "Corrélation et causalité"], ["#biais/regression-moyenne", "Régression vers la moyenne"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "correlation").lancer(zone));
      }, "Nuage");
    }
  },

  // ---------------------------------------------------------------
  {
    id: "graphiques",
    section: "perception",
    picto: "graphique",
    couleur: "#b8741a",
    duree: "4 min",
    titre: "Graphiques trompeurs",
    resume: "Axe tronqué, fenêtre choisie, double échelle, moyenne trompeuse… Huit graphiques à lire sans se faire piéger.",
    lancer(zone) {
      const pieges = tirerNouveaux("graphiques", PIEGES_GRAPHIQUES, 8, p => p.id).map(p => p.creer());
      derouler(zone, pieges, (p, zone, fini) => {
        zone.appendChild(el("p", "consigne", p.titre));
        const figure = el("figure", "figure-piege");
        figure.appendChild(p.trompeur());
        figure.appendChild(el("figcaption", null, p.legende || "Données fictives."));
        zone.appendChild(figure);
        zone.appendChild(el("p", "cas", p.question));
        const boutons = p.options.map((texte, k) => {
          const b = boutonChoix(texte, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[p.juste].classList.add("juste");
            if (k !== p.juste) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (k === p.juste ? "juste" : "faux"), (k === p.juste ? "Juste. " : "Non. ") + p.piege));
            if (p.honnete) {
              const f = el("figure", "figure-piege honnete");
              f.appendChild(p.honnete());
              f.appendChild(el("figcaption", null, "Les mêmes données, présentées honnêtement."));
              retour.appendChild(f);
            }
            retour.appendChild(paragraphe(p.explication));
            zone.appendChild(retour);
            fini(k === p.juste, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "graphiques", bonnes, resultats.length);
        ajouterExplication(zone, "Se méfier des graphiques", [
          "Un graphique n'est jamais neutre : le choix de l'axe, de la période, de l'échelle et de l'indicateur change l'impression produite, sans qu'aucun chiffre soit faux.",
          "Quelques réflexes : regarder où commence l'axe vertical, chercher la période complète, vérifier si l'on compare des valeurs absolues ou relatives, des points de pourcentage ou des pourcentages, une moyenne ou une médiane.",
          "Références : Darrell Huff, « Comment mentir avec les statistiques » (1954) ; Alberto Cairo, « How Charts Lie » (2019)."
        ], [["#sophismes/cherry-picking", "Cueillette de cerises"], ["#biais/cadrage", "Effet de cadrage"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "graphiques").lancer(zone));
      }, "Graphique");
    }
  }
);

// ===================== Illusions d'optique =====================

function consigneIllusion(e) {
  if (e.figure === "muller") return "Déplacez le curseur jusqu'à ce que le trait du bas paraisse exactement aussi long que celui du haut.";
  if (e.figure === "ebbinghaus") return "Réglez le cercle central de droite pour qu'il paraisse exactement de la même taille que celui de gauche.";
  return "Réglez la hauteur du trait vertical pour qu'il paraisse exactement aussi long que le trait horizontal.";
}

function explicationIllusion(e, ecart) {
  if (e.figure === "muller") return "Les deux traits horizontaux " + (Math.abs(ecart) < 0.04 ? "sont" : "auraient dû être") + " de même longueur : les pointes tournées vers l'extérieur allongent le trait, celles tournées vers l'intérieur le raccourcissent. C'est l'illusion de Müller-Lyer (1889).";
  if (e.figure === "ebbinghaus") return "Entouré de grands cercles, un cercle paraît plus petit ; entouré de petits, il paraît plus grand. C'est l'illusion d'Ebbinghaus : notre perception des tailles est relative à l'entourage.";
  return "Un trait vertical paraît plus long qu'un trait horizontal de même longueur, surtout quand il coupe celui-ci en son milieu. C'est l'illusion verticale-horizontale.";
}

// Construit une figure réglable : regler(t) avec t entre 0 et 1, reveler() renvoie l'écart relatif
function figureIllusion(e) {
  const s = svg("svg", { viewBox: "0 0 320 200", class: "illusion", role: "img", "aria-label": "Figure à régler" });
  const encre = { class: "illusion-trait" };
  if (e.figure === "muller") {
    const L = 150;
    // En haut : pointes vers l'extérieur (le trait paraît plus long), sauf figure inversée
    const haut = { y: 62, long: L, exterieur: !e.inverse };
    const bas = { y: 142, long: L, exterieur: !!e.inverse };
    const groupes = [haut, bas].map(t => {
      const g = svg("g");
      s.appendChild(g);
      return g;
    });
    const dessiner = () => {
      [haut, bas].forEach((t, k) => {
        const g = groupes[k];
        g.innerHTML = "";
        const x1 = 160 - t.long / 2, x2 = 160 + t.long / 2;
        g.appendChild(svg("line", Object.assign({ x1, y1: t.y, x2, y2: t.y }, encre)));
        const d = t.exterieur ? -1 : 1;            // sens des pointes
        [[x1, 1], [x2, -1]].forEach(([x, cote]) => {
          [-1, 1].forEach(v => g.appendChild(svg("line", Object.assign({ x1: x, y1: t.y, x2: x + d * cote * 20, y2: t.y + v * 16, class: "illusion-trait ailette" }))));
        });
      });
    };
    return {
      svg: s,
      regler(t) { bas.long = 70 + 190 * t; dessiner(); },
      reveler() {
        s.classList.add("revelee");
        [160 - L / 2, 160 + L / 2].forEach(x => s.appendChild(svg("line", { x1: x, y1: 40, x2: x, y2: 165, class: "illusion-guide" })));
        return (bas.long - L) / L;
      }
    };
  }
  if (e.figure === "ebbinghaus") {
    const R = 17;
    const gauche = svg("g"), droite = svg("g");
    s.append(gauche, droite);
    // À gauche : cercle central entouré de grands cercles
    gauche.appendChild(svg("circle", { cx: 82, cy: 100, r: R, class: "illusion-disque" }));
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      gauche.appendChild(svg("circle", { cx: 82 + 52 * Math.cos(a), cy: 100 + 52 * Math.sin(a), r: 25, class: "illusion-entourage ailette" }));
    }
    // À droite : cercle central réglable entouré de petits cercles
    const centre = svg("circle", { cx: 242, cy: 100, r: R, class: "illusion-disque" });
    droite.appendChild(centre);
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      droite.appendChild(svg("circle", { cx: 242 + 33 * Math.cos(a), cy: 100 + 33 * Math.sin(a), r: 7, class: "illusion-entourage ailette" }));
    }
    let r = R;
    return {
      svg: s,
      regler(t) { r = 9 + 17 * t; centre.setAttribute("r", r); },
      reveler() {
        s.classList.add("revelee");
        s.appendChild(svg("circle", { cx: 242, cy: 100, r: R, class: "illusion-guide-cercle" }));
        return (r - R) / R;
      }
    };
  }
  // Illusion verticale-horizontale : un T renversé
  const L = 150;
  s.appendChild(svg("line", Object.assign({ x1: 160 - L / 2, y1: 180, x2: 160 + L / 2, y2: 180 }, encre)));
  const verticale = svg("line", Object.assign({ x1: 160, y1: 180, x2: 160, y2: 180 - L }, encre));
  s.appendChild(verticale);
  let h = L;
  return {
    svg: s,
    regler(t) { h = 80 + 100 * t; verticale.setAttribute("y2", 180 - h); },
    reveler() {
      s.classList.add("revelee");
      // Le trait horizontal, redressé à côté du vertical, pour comparer
      s.appendChild(svg("line", { x1: 196, y1: 180, x2: 196, y2: 180 - L, class: "illusion-guide" }));
      return (h - L) / L;
    }
  };
}

// ===================== Hasard =====================

const nuageHasard = n => Array.from({ length: n }, () => [Math.random(), Math.random()]);

// Points « trop bien répartis » : un nouveau point ne peut pas être trop près des autres
function nuageRegulier(n) {
  let distance = 0.85 / Math.sqrt(n);
  for (;;) {
    const points = [];
    for (let essai = 0; essai < 6000 && points.length < n; essai++) {
      const p = [Math.random(), Math.random()];
      if (points.every(q => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 > distance * distance)) points.push(p);
    }
    if (points.length === n) return points;
    distance *= 0.92;
  }
}

const suiteHasard = n => Array.from({ length: n }, () => (Math.random() < 0.5 ? 1 : 0));

// Suite « humaine » : on change de face 2 fois sur 3 au lieu d'une fois sur 2
function suiteHumaine(n) {
  const s = [Math.random() < 0.5 ? 1 : 0];
  while (s.length < n) s.push(Math.random() < 0.67 ? 1 - s[s.length - 1] : s[s.length - 1]);
  return s;
}

function dessinNuage(points) {
  const s = svg("svg", { viewBox: "0 0 160 160", class: "nuage-petit", role: "img", "aria-label": "Nuage de points" });
  s.appendChild(svg("rect", { x: 0, y: 0, width: 160, height: 160, class: "graphe-fond" }));
  points.forEach(([x, y]) => s.appendChild(svg("circle", { cx: 6 + 148 * x, cy: 6 + 148 * y, r: 3.2, class: "point-nuage" })));
  return s;
}

function statsNuage(points) {
  const cases = Array(16).fill(0);
  points.forEach(([x, y]) => { cases[Math.min(3, Math.floor(x * 4)) + 4 * Math.min(3, Math.floor(y * 4))]++; });
  return { cases, vides: cases.filter(c => c === 0).length, grappes: cases.filter(c => c >= 5).length };
}

// Superpose la grille 4 × 4 : cases vides et grappes mises en évidence
function quadriller(s, points) {
  const { cases } = statsNuage(points);
  cases.forEach((c, k) => {
    const x = 6 + 37 * (k % 4), y = 6 + 37 * Math.floor(k / 4);
    if (c === 0 || c >= 5) s.insertBefore(svg("rect", { x, y, width: 37, height: 37, class: c === 0 ? "case-vide" : "case-grappe" }), s.children[1]);
  });
  for (let k = 1; k < 4; k++) {
    s.appendChild(svg("line", { x1: 6 + 37 * k, y1: 6, x2: 6 + 37 * k, y2: 154, class: "grille-nuage" }));
    s.appendChild(svg("line", { x1: 6, y1: 6 + 37 * k, x2: 154, y2: 6 + 37 * k, class: "grille-nuage" }));
  }
}

// ===================== Corrélation =====================

// Nuage de n points de corrélation proche de r (variables normales)
function nuageCorrele(r, n) {
  return Array.from({ length: n }, () => {
    const x = gauss();
    return [x, r * x + Math.sqrt(1 - r * r) * gauss()];
  });
}

// Échelles d'un nuage : chaque axe couvre l'étendue des données, avec une marge
function echellesNuage(points) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const bornes = t => { const a = Math.min(...t), b = Math.max(...t), m = (b - a) * 0.08; return [a - m, b + m]; };
  const [x0, x1] = bornes(xs), [y0, y1] = bornes(ys);
  return { x: v => 20 + 270 * (v - x0) / (x1 - x0), y: v => 270 - 250 * (v - y0) / (y1 - y0), x0, x1 };
}

function dessinCorrelation(points) {
  const s = svg("svg", { viewBox: "0 0 300 290", class: "graphe", role: "img", "aria-label": "Nuage de points" });
  const e = echellesNuage(points);
  s.appendChild(svg("rect", { x: 20, y: 20, width: 270, height: 250, class: "graphe-fond" }));
  s.appendChild(svg("path", { d: "M20 20V270H290", class: "sch-trait" }));
  points.forEach(([x, y]) => s.appendChild(svg("circle", { cx: e.x(x), cy: e.y(y), r: 3.6, class: "graphe-point" })));
  return s;
}

// Droite des moindres carrés, tracée sur le nuage
function tracerDroite(s, points) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p[0], 0) / n, my = points.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  points.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; });
  const pente = sxy / sxx;
  const e = echellesNuage(points);
  let [xa, ya, xb, yb] = [e.x(e.x0), e.y(my + pente * (e.x0 - mx)), e.x(e.x1), e.y(my + pente * (e.x1 - mx))];
  // La droite s'arrête au bord du graphique (y de 20 à 270) plutôt que d'en sortir
  const couper = (y, yAutre, x, xAutre) => {
    const borne = y < 20 ? 20 : y > 270 ? 270 : y;
    return borne === y ? [x, y] : [x + (xAutre - x) * (borne - y) / (yAutre - y), borne];
  };
  [xa, ya] = couper(ya, yb, xa, xb);
  [xb, yb] = couper(yb, ya, xb, xa);
  s.appendChild(svg("line", { x1: xa, y1: ya, x2: xb, y2: yb, class: "droite-regression" }));
}

// Bilan : estimation de l'utilisateur en fonction de la vraie corrélation
function grapheEstimations(resultats) {
  const s = svg("svg", { viewBox: "0 0 300 300", class: "graphe", role: "img", "aria-label": "Vos estimations comparées aux vraies corrélations" });
  const p = v => 30 + 250 * (v + 1) / 2;
  s.appendChild(svg("rect", { x: 30, y: 20, width: 250, height: 250, class: "graphe-fond" }));
  [-1, -0.5, 0, 0.5, 1].forEach(v => {
    s.appendChild(svg("line", { x1: p(v), y1: 20, x2: p(v), y2: 270, class: "graphe-grille" }));
    s.appendChild(svg("line", { x1: 30, y1: 290 - p(v), x2: 280, y2: 290 - p(v), class: "graphe-grille" }));
    s.appendChild(texteSvg(p(v), 284, signe(v), { class: "graphe-texte", "text-anchor": "middle" }));
    s.appendChild(texteSvg(25, 294 - p(v), signe(v), { class: "graphe-texte", "text-anchor": "end" }));
  });
  s.appendChild(svg("line", { x1: p(-1), y1: 290 - p(-1), x2: p(1), y2: 290 - p(1), class: "graphe-diagonale" }));
  resultats.forEach(r => s.appendChild(svg("circle", { cx: p(r.reel), cy: 290 - p(r.estime), r: 5, class: "graphe-point" })));
  return s;
}

// ===================== Graphiques trompeurs =====================

// Graphique en barres. barres : [{ libelle, valeur, forte }] ; min et max : bornes de l'axe vertical
function grapheBarres(barres, min, max, options = {}) {
  // Quatre unités de marge à gauche et à droite : les graduations longues (« 54,25 % ») restent dans le cadre
  const s = svg("svg", { viewBox: "-4 0 308 210", class: "graphe graphe-barres", role: "img", "aria-label": options.titre || "Graphique en barres" });
  const y = v => 180 - 160 * (v - min) / (max - min);
  s.appendChild(svg("rect", { x: 44, y: 20, width: 246, height: 160, class: "graphe-fond" }));
  const pas = options.pas || (max - min) / 4;
  for (let v = min; v <= max + 1e-9; v += pas) {
    s.appendChild(svg("line", { x1: 44, y1: y(v), x2: 290, y2: y(v), class: "graphe-grille" }));
    s.appendChild(texteSvg(38, y(v) + 3.5, fr(Number(v.toFixed(2))) + (options.unite || ""), { class: "graphe-texte", "text-anchor": "end" }));
  }
  const largeur = 246 / barres.length;
  barres.forEach((b, k) => {
    const x = 44 + largeur * k + largeur * 0.22;
    const haut = y(Math.max(min, b.valeur));
    s.appendChild(svg("rect", { x, y: haut, width: largeur * 0.56, height: Math.max(0, 180 - haut), class: b.forte ? "barre-svg forte" : "barre-svg" }));
    s.appendChild(texteSvg(x + largeur * 0.28, 196, b.libelle, { class: "graphe-texte", "text-anchor": "middle" }));
  });
  if (options.tronque) s.appendChild(svg("path", { d: "M38 172l12-4M38 178l12-4", class: "sch-trait" }));
  s.appendChild(svg("path", { d: "M44 20V180H290", class: "sch-trait" }));
  return s;
}

// Graphique en courbe. series : [{ points: [[x, y]…], classe }] ; inverse : axe vertical inversé
function grapheCourbe(series, xmin, xmax, ymin, ymax, options = {}) {
  const s = svg("svg", { viewBox: "-4 0 308 210", class: "graphe", role: "img", "aria-label": options.titre || "Graphique en courbe" });
  const x = v => 44 + 236 * (v - xmin) / (xmax - xmin);
  const y = v => options.inverse ? 20 + 160 * (v - ymin) / (ymax - ymin) : 180 - 160 * (v - ymin) / (ymax - ymin);
  s.appendChild(svg("rect", { x: 44, y: 20, width: 236, height: 160, class: "graphe-fond" }));
  const pas = (ymax - ymin) / 4;
  for (let v = ymin; v <= ymax + 1e-9; v += pas) {
    s.appendChild(svg("line", { x1: 44, y1: y(v), x2: 280, y2: y(v), class: "graphe-grille" }));
    s.appendChild(texteSvg(38, y(v) + 3.5, fr(Math.round(v)), { class: "graphe-texte", "text-anchor": "end" }));
  }
  const etiquettes = options.etiquettesX || [xmin, xmax];
  etiquettes.forEach(v => s.appendChild(texteSvg(x(v), 196, String(v), { class: "graphe-texte", "text-anchor": "middle" })));
  if (options.axeDroit) {
    const [a, b] = options.axeDroit.bornes;
    for (let k = 0; k <= 4; k++) {
      const v = a + (b - a) * k / 4;
      s.appendChild(texteSvg(286, 180 - 160 * k / 4 + 3.5, fr(Math.round(v)), { class: "graphe-texte graphe-texte-b", "text-anchor": "start" }));
    }
  }
  series.forEach(serie => {
    const yy = serie.echelle || y;
    s.appendChild(svg("polyline", { points: serie.points.map(([a, b]) => x(a) + "," + yy(b)).join(" "), class: serie.classe || "courbe" }));
  });
  s.appendChild(svg("path", { d: "M44 20V180H280", class: "sch-trait" }));
  return s;
}

const entier = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// Chaque piège crée des données au hasard, une version trompeuse et une version honnête
const PIEGES_GRAPHIQUES = [
  {
    id: "axe-tronque",
    creer() {
      const v1 = entier(400, 600) / 10;
      const v2 = Math.round(v1 * (1 + entier(30, 70) / 1000) * 10) / 10;
      const hausse = Math.round(100 * (v2 - v1) / v1);
      const min = Math.floor(v1) - 1, max = Math.ceil(v2) + 0.5;
      return {
        titre: "Taux de satisfaction des clients",
        trompeur: () => grapheBarres([{ libelle: "2024", valeur: v1 }, { libelle: "2025", valeur: v2, forte: true }], min, max, { unite: " %", tronque: true, pas: (max - min) / 4 }),
        honnete: () => grapheBarres([{ libelle: "2024", valeur: v1 }, { libelle: "2025", valeur: v2, forte: true }], 0, 100, { unite: " %", pas: 25 }),
        question: "D'après ce graphique, comment la satisfaction a-t-elle évolué ?",
        options: ["Elle a environ triplé", "Elle a progressé de " + fr(Number((v2 - v1).toFixed(1))) + " points, soit environ " + hausse + " %", "Elle a doublé"],
        juste: 1,
        piege: "L'axe vertical commence à " + fr(min) + " %, et non à zéro.",
        explication: "Un axe qui ne commence pas à zéro grossit les écarts : la barre de 2025 paraît plusieurs fois plus haute alors que la valeur n'a augmenté que de " + hausse + " %. Pour des barres, dont on compare les longueurs, l'axe doit partir de zéro."
      };
    }
  },
  {
    id: "fenetre",
    creer() {
      // Série de 30 ans en hausse, avec du bruit ; on montre une fenêtre de 6 ans en baisse
      let serie, debut;
      do {
        serie = [];
        let v = 50;
        for (let k = 0; k < 30; k++) { v += 1.6 + 4.5 * gauss(); serie.push(v); }
        debut = -1;
        for (let k = 8; k <= 22; k++) if (serie[k + 5] < serie[k] - 6) { debut = k; break; }
      } while (debut < 0 || serie[29] < serie[0] + 25);
      const annees = serie.map((v, k) => [1996 + k, v]);
      const fenetre = annees.slice(debut, debut + 6);
      const ymin = Math.floor(Math.min(...annees.map(p => p[1])) / 10) * 10, ymax = Math.ceil(Math.max(...annees.map(p => p[1])) / 10) * 10;
      const fmin = Math.floor(Math.min(...fenetre.map(p => p[1])) - 2), fmax = Math.ceil(Math.max(...fenetre.map(p => p[1])) + 2);
      return {
        titre: "Nombre d'adhérents d'une association (en milliers)",
        trompeur: () => grapheCourbe([{ points: fenetre }], fenetre[0][0], fenetre[5][0], fmin, fmax, { etiquettesX: [fenetre[0][0], fenetre[5][0]] }),
        honnete: () => grapheCourbe([{ points: annees }, { points: fenetre, classe: "courbe-fenetre" }], 1996, 2025, ymin, ymax, { etiquettesX: [1996, 2005, 2015, 2025] }),
        question: "D'après ce graphique, quelle est la tendance de long terme ?",
        options: ["À la baisse", "Impossible à dire avec ce seul graphique", "À la hausse"],
        juste: 1,
        piege: "Six années ne disent rien de la tendance de long terme.",
        explication: "Sur trente ans, le nombre d'adhérents a nettement augmenté ; la courbe montrée n'en est qu'un extrait, choisi parce qu'il baissait. Avant de conclure, il faut demander pourquoi la période commence et finit là."
      };
    }
  },
  {
    id: "cumul",
    creer() {
      const annuel = [];
      let v = entier(120, 160);
      for (let k = 0; k < 8; k++) { annuel.push(Math.round(v)); v *= 0.86 + Math.random() * 0.06; }
      const cumul = annuel.map((x, k) => annuel.slice(0, k + 1).reduce((s, y) => s + y, 0));
      const max = Math.ceil(cumul[7] / 100) * 100;
      return {
        titre: "Ventes cumulées d'un modèle de vélo depuis son lancement",
        trompeur: () => grapheCourbe([{ points: cumul.map((c, k) => [2018 + k, c]) }], 2018, 2025, 0, max, { etiquettesX: [2018, 2021, 2025] }),
        honnete: () => grapheBarres(annuel.map((a, k) => ({ libelle: String(2018 + k).slice(2), valeur: a, forte: k === 7 })), 0, Math.ceil(annuel[0] / 50) * 50, { pas: Math.ceil(annuel[0] / 50) * 50 / 4 }),
        question: "Les ventes annuelles sont-elles en hausse ?",
        options: ["Oui, nettement", "Non, elles baissent chaque année", "On ne peut pas le savoir"],
        juste: 1,
        piege: "Une courbe de cumul monte toujours, même quand chaque année est moins bonne que la précédente.",
        explication: "La pente de la courbe, de plus en plus faible, trahit la baisse : les ventes annuelles ont reculé d'environ 10 % par an (barres ci-dessus, années 2018 à 2025). Les présentations en cumul sont fréquentes quand les chiffres annuels sont mauvais."
      };
    }
  },
  {
    id: "double-axe",
    creer() {
      const a = [], b = [];
      for (let k = 0; k < 10; k++) {
        a.push(900 + 8 * k + 6 * gauss());
        b.push(40 + 5 * k + 1.5 * gauss());
      }
      const yA = v => 180 - 160 * (v - 880) / (1000 - 880);
      const yB = v => 180 - 160 * (v - 20) / (110 - 20);
      return {
        titre: "Chiffre d'affaires de deux entreprises (millions d'euros)",
        trompeur: () => grapheCourbe([
          { points: a.map((v, k) => [2016 + k, v]), echelle: yA },
          { points: b.map((v, k) => [2016 + k, v]), echelle: yB, classe: "courbe-b" }
        ], 2016, 2025, 880, 1000, { etiquettesX: [2016, 2020, 2025], axeDroit: { bornes: [20, 110] } }),
        honnete: () => grapheCourbe([
          { points: a.map((v, k) => [2016 + k, v]) },
          { points: b.map((v, k) => [2016 + k, v]), classe: "courbe-b" }
        ], 2016, 2025, 0, 1000, { etiquettesX: [2016, 2020, 2025] }),
        legende: "Courbe pleine : entreprise A (axe de gauche). Courbe pointillée : entreprise B (axe de droite). Données fictives.",
        question: "L'entreprise B a-t-elle dépassé l'entreprise A ?",
        options: ["Oui, vers 2020", "Non : B reste plus de dix fois plus petite", "Oui, en 2025"],
        juste: 1,
        piege: "Les deux courbes n'utilisent pas la même échelle.",
        explication: "Avec deux axes verticaux, on peut faire se croiser n'importe quelles courbes en choisissant les bornes de chaque axe. Sur une échelle commune, B reste autour de 5 % de A."
      };
    }
  },
  {
    id: "points-pourcentage",
    creer() {
      const t1 = entier(3, 6), t2 = t1 + entier(1, 3);
      const relatif = Math.round(100 * (t2 - t1) / t1);
      return {
        titre: "Taux de chômage dans une région",
        trompeur: () => grapheBarres([{ libelle: "2024", valeur: t1 }, { libelle: "2025", valeur: t2, forte: true }], 0, 10, { unite: " %", pas: 2.5 }),
        honnete: null,
        question: "Le taux passe de " + t1 + " % à " + t2 + " %. De combien a-t-il augmenté ?",
        options: ["De " + (t2 - t1) + " %", "De " + (t2 - t1) + " point" + (t2 - t1 > 1 ? "s" : "") + ", soit +" + relatif + " %", "De " + relatif + " points"],
        juste: 1,
        piege: "Il faut distinguer points de pourcentage et pourcentage.",
        explication: "L'écart entre deux taux se mesure en points (" + (t2 - t1) + "), la variation relative en pourcentage (+" + relatif + " %). Selon l'effet recherché, on choisira l'un ou l'autre : « +" + (t2 - t1) + " point » paraît anodin, « +" + relatif + " % » alarmant."
      };
    }
  },
  {
    id: "moyenne-mediane",
    creer() {
      const salaires = Array.from({ length: 19 }, () => entier(19, 27) * 100);
      const patron = entier(35, 45) * 1000;
      const tous = [...salaires, patron].sort((x, y) => x - y);
      const moyenne = Math.round(tous.reduce((s, x) => s + x, 0) / tous.length / 10) * 10;
      const mediane = Math.round((tous[9] + tous[10]) / 2 / 10) * 10;
      const classes = [[1500, 2000], [2000, 2500], [2500, 3000], [3000, 10000], [10000, 50000]];
      const effectifs = classes.map(([a, b]) => tous.filter(x => x >= a && x < b).length);
      return {
        titre: "Salaires mensuels nets dans une entreprise de 20 personnes",
        trompeur: () => grapheBarres(classes.map(([a, b], k) => ({ libelle: k === 4 ? "> 10 k" : fr(a / 1000) + "-" + fr(b / 1000) + " k", valeur: effectifs[k], forte: k === 4 })), 0, 20, { pas: 5 }),
        honnete: null,
        legende: "Nombre de salariés par tranche de salaire. Données fictives.",
        question: "L'entreprise annonce un salaire moyen de " + fr(moyenne) + " €. Combien gagne un salarié typique ?",
        options: ["Environ " + fr(moyenne) + " €", "Environ " + fr(mediane) + " €", "Environ " + fr(Math.round(patron / 1000) * 1000) + " €"],
        juste: 1,
        piege: "La moyenne est tirée vers le haut par un seul salaire très élevé.",
        explication: "La moitié des salariés gagne moins de " + fr(mediane) + " € (c'est la médiane). La moyenne, " + fr(moyenne) + " €, dépasse le salaire de 19 salariés sur 20 à cause du salaire du dirigeant. Pour des revenus, la médiane décrit mieux la situation typique."
      };
    }
  },
  {
    id: "axe-inverse",
    creer() {
      const points = [];
      let v = 40;
      for (let k = 0; k < 12; k++) { v += (k < 5 ? 0.5 : 3) + 1.5 * gauss(); points.push([2014 + k, v]); }
      const ymin = 30, ymax = Math.ceil(Math.max(...points.map(p => p[1])) / 10) * 10 + 10;
      return {
        titre: "Nombre d'accidents sur une route (par an)",
        trompeur: () => grapheCourbe([{ points }], 2014, 2025, ymin, ymax, { inverse: true, etiquettesX: [2014, 2019, 2025] }),
        honnete: () => grapheCourbe([{ points }], 2014, 2025, ymin, ymax, { etiquettesX: [2014, 2019, 2025] }),
        question: "Depuis 2019, le nombre d'accidents a-t-il augmenté ou diminué ?",
        options: ["Il a diminué", "Il a augmenté", "Il est resté stable"],
        juste: 1,
        piege: "L'axe vertical est inversé : les valeurs augmentent vers le bas.",
        explication: "La courbe descend, mais l'axe est gradué de haut en bas. En 2014, un graphique de l'agence Reuters sur les morts par arme à feu en Floride, construit avec un axe inversé, a été largement lu à l'envers."
      };
    }
  },
  {
    id: "risque-relatif",
    creer() {
      const base = entier(1, 3);
      return {
        titre: "« Ce médicament double le risque de thrombose »",
        trompeur: () => grapheBarres([{ libelle: "Sans", valeur: 1 }, { libelle: "Avec", valeur: 2, forte: true }], 0, 2, { pas: 0.5 }),
        honnete: () => grilleRisque(base, base * 2),
        legende: "Risque relatif (base 1 sans le médicament). Données fictives.",
        question: "Le risque passe de " + base + " à " + base * 2 + " cas pour 10 000 personnes traitées pendant un an. Sur 10 000 personnes traitées, combien de cas supplémentaires ?",
        options: [String(base), String(base * 100), "5 000"],
        juste: 0,
        piege: "« Doubler » un risque très faible le laisse très faible.",
        explication: "Le risque relatif (×2) impressionne ; le risque absolu (+" + base + " pour 10 000) permet de décider. En 1995, l'annonce au Royaume-Uni d'un risque de thrombose « doublé » avec certaines pilules contraceptives a conduit de nombreuses femmes à arrêter leur contraception, suivie d'une hausse des grossesses non désirées et des avortements."
      };
    }
  },
  {
    id: "pictogramme",
    creer() {
      const v1 = entier(2, 5) * 10;
      return {
        titre: "Production de lait d'une coopérative (millions de litres)",
        trompeur: () => grapheBidons(v1, true),
        honnete: () => grapheBidons(v1, false),
        legende: "À gauche : " + v1 + " millions de litres. À droite : " + 2 * v1 + " millions. Données fictives.",
        question: "Ce dessin représente-t-il fidèlement le rapport entre les deux productions ?",
        options: ["Oui", "Non : il l'exagère", "Non : il le minimise"],
        juste: 1,
        piege: "La production double, mais le bidon est agrandi dans les deux dimensions : sa surface est multipliée par quatre.",
        explication: "L'œil compare les surfaces, pas les hauteurs. Doubler la hauteur et la largeur d'une image la fait paraître quatre fois plus grande. Une représentation fidèle aligne des images identiques, ou utilise des barres."
      };
    }
  }
];

// Deux bidons : agrandis dans les deux dimensions (trompeur) ou répétés (honnête)
function grapheBidons(v1, trompeur) {
  const s = svg("svg", { viewBox: "0 0 300 190", class: "graphe", role: "img", "aria-label": "Pictogrammes de bidons de lait" });
  const bidon = (x, yBas, h) => {
    const l = h * 0.62;
    const g = svg("g", { class: "bidon" });
    g.appendChild(svg("path", { d: `M${x - l / 2} ${yBas} v${-h * 0.72} q0 ${-h * 0.1} ${l * 0.2} ${-h * 0.14} h${l * 0.6} q${l * 0.2} ${h * 0.04} ${l * 0.2} ${h * 0.14} v${h * 0.72} z` }));
    g.appendChild(svg("rect", { x: x - l * 0.2, y: yBas - h, width: l * 0.4, height: h * 0.12 }));
    s.appendChild(g);
  };
  if (trompeur) {
    bidon(80, 175, 70);
    bidon(205, 175, 140);
  } else {
    bidon(60, 175, 70);
    [150, 200].forEach(x => bidon(x, 175, 70));
    s.appendChild(texteSvg(60, 95, "×1", { class: "sch-texte sch-gras", "text-anchor": "middle" }));
    s.appendChild(texteSvg(175, 95, "×2", { class: "sch-texte sch-gras", "text-anchor": "middle" }));
  }
  s.appendChild(svg("line", { x1: 10, y1: 175, x2: 290, y2: 175, class: "sch-trait" }));
  return s;
}

// 10 000 personnes en grille de 100 × 100 : les cas apparaissent en couleur
function grilleRisque(avant, apres) {
  const bloc = el("div", "risque-duo");
  [["Sans le médicament", avant], ["Avec le médicament", apres]].forEach(([titre, n]) => {
    const fig = el("figure", "panneau");
    fig.appendChild(el("figcaption", null, titre + " : " + n + " sur 10 000"));
    const s = svg("svg", { viewBox: "0 0 100 100", class: "grille-10000", role: "img", "aria-label": titre });
    s.appendChild(svg("rect", { x: 0, y: 0, width: 100, height: 100, class: "grille-fond" }));
    // Positions dispersées mais toujours dans le cadre (pas de 37 et 23 modulo 80 et 76)
    for (let k = 0; k < n; k++) s.appendChild(svg("rect", { x: 10 + (17 + 37 * k) % 80, y: 12 + (41 + 23 * k) % 76, width: 1.6, height: 1.6, class: "grille-cas" }));
    fig.appendChild(s);
    bloc.appendChild(fig);
  });
  bloc.appendChild(paragraphe("Chaque carré gris représente 10 000 personnes ; chaque point rouge, un cas. Il faut chercher pour les voir.", "source"));
  return bloc;
}
