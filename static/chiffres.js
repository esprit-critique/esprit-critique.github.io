// chiffres.js : jeux d'estimation fondés sur des données réelles.
// Les contenus (questions, chiffres, sources) sont dans jeux-donnees.js et pays.js.
// Chaque jeu a un id, une section de la page Ateliers, un pictogramme, une couleur, une durée
// et une fonction lancer(zone) qui construit son interface.
// Outils communs (derouler, afficherScore, tirerNouveaux, svg…) : ateliers.js.

// ===================== Outils =====================

// Arrondit à 2 chiffres significatifs (pour des ancres « naturelles »)
function arrondir2(x) {
  if (x === 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(x))) - 1);
  return Math.round(x / p) * p;
}

function moyenneGeometrique(t) {
  return Math.exp(t.reduce((s, x) => s + Math.log(x), 0) / t.length);
}

// Un grand nombre en clair : 3,04e12 → « 3 000 milliards » (2 chiffres significatifs par défaut)
function enClair(x, chiffres = 2) {
  const p = v => fr(Number(v.toPrecision(chiffres)));
  if (x < 1e6) return p(x);
  if (x < 1e9) return p(x / 1e6) + (x < 2e6 ? " million" : " millions");
  if (x < 1e15) return p(x / 1e9) + (x < 2e9 ? " milliard" : " milliards");
  return p(x / 1e15) + (x < 2e15 ? " million" : " millions") + " de milliards";
}

// Exposant en caractères surélevés : 12 → « ¹² »
const exposant = e => String(e).split("").map(c => c === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]).join("");

// Notation scientifique lisible : 3,04e12 → « 3 × 10¹² »
function puissanceDeDix(x) {
  const e = Math.floor(Math.log10(x));
  const m = x / Math.pow(10, e);
  return (Math.abs(m - 1) < 0.05 ? "" : fr(Number(m.toFixed(1))) + " × ") + "10" + exposant(e);
}

// Barres comparées : [{ nom, valeur, texte, source, forte }] ; « reference » ajoute un repère
function barresComparees(conteneur, elements, reference) {
  const max = Math.max(...elements.map(e => e.valeur), reference ? reference.valeur : 0);
  elements.forEach(e => {
    const ligne = el("div", "barre-ligne");
    ligne.appendChild(el("div", "barre-nom", e.nom + " : " + e.texte));
    const fond = el("div", "barre-fond");
    const barre = el("div", "barre" + (e.forte ? " forte" : ""));
    barre.style.width = Math.max(0.6, 100 * e.valeur / max) + "%";
    fond.appendChild(barre);
    if (reference) {
      const repere = el("div", "repere");
      repere.style.left = (100 * reference.valeur / max) + "%";
      fond.appendChild(repere);
    }
    ligne.appendChild(fond);
    if (e.source) ligne.appendChild(el("div", "barre-source", e.source));
    conteneur.appendChild(ligne);
  });
  if (reference) conteneur.appendChild(el("p", "barre-source", "Trait vertical : " + reference.texte));
}

// ===================== Les jeux =====================

const JEUX = [
  // ---------------------------------------------------------------
  {
    id: "monde",
    section: "monde",
    picto: "monde",
    couleur: "#2a8a5c",
    duree: "3 min",
    titre: "Le monde en chiffres",
    resume: "Dix questions sur l'état du monde, avec les données les plus récentes. En 2017, des milliers de personnes ont fait moins bien que le hasard.",
    lancer(zone) {
      deroulerNiveaux(zone, {
        id: "monde", n: 10, relancer: () => JEUX.find(j => j.id === "monde").lancer(zone),
        tirer: niveau => tirerSelonNiveau("monde", MONDE, 1, niveau)[0]
      }, (q, zone, fini) => {
        zone.appendChild(el("p", "cas", q.question));
        const boutons = q.options.map((texte, k) => {
          const b = boutonChoix(texte, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[q.juste].classList.add("juste");
            if (k !== q.juste) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (k === q.juste ? "juste" : "faux"), k === q.juste ? "Juste." : "Réponse : " + q.options[q.juste] + "."));
            retour.appendChild(paragraphe(q.explication));
            if (q.public !== null) {
              retour.appendChild(paragraphe("En 2017, " + q.public + " % des personnes interrogées par Gapminder ont répondu juste" + (q.notepublic ? " " + q.notepublic : "") + ". Un choix au hasard en donnerait 33 %.", "source"));
            }
            zone.appendChild(retour);
            fini(k === q.juste, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "monde", bonnes, resultats.length);
        zone.appendChild(paragraphe("Un choix au hasard donnerait en moyenne 3,3 sur 10 : c'est ce que Hans Rosling appelait le score des chimpanzés. Dans l'enquête Gapminder de 2017, les participants obtenaient en moyenne 2,2 bonnes réponses sur 12, soit moins que le hasard."));
        ajouterExplication(zone, "Pourquoi tant d'erreurs ?", [
          "Faire moins bien que le hasard signifie que l'erreur n'est pas due à l'ignorance seule : les réponses sont systématiquement trop pessimistes.",
          "Rosling y voyait plusieurs causes : les médias rapportent surtout les événements négatifs et spectaculaires, les progrès lents et continus ne font pas l'actualité, et nos connaissances datent souvent de notre scolarité.",
          "Les questions changent d'une partie à l'autre (" + MONDE.length + " en tout) : celles que vous n'avez pas encore vues passent en priorité."
        ], [["#biais/negativite", "Biais de négativité"], ["#biais/disponibilite", "Heuristique de disponibilité"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "monde").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "mortalite",
    section: "monde",
    picto: "balance",
    couleur: "#c2412d",
    duree: "2 min",
    titre: "Qu'est-ce qui tue le plus ?",
    resume: "Dix duels entre causes de décès dans le monde, d'après l'OMS et l'ONU. Les risques spectaculaires sont rarement les plus meurtriers.",
    lancer(zone) {
      const exclus = new Set();
      deroulerNiveaux(zone, {
        id: "mortalite", n: 10, libelle: "Duel", relancer: () => JEUX.find(j => j.id === "mortalite").lancer(zone),
        // Un duel sur deux oppose un risque très médiatisé à une cause plus meurtrière
        tirer: (niveau, i) => auNiveau(niveau, n => tirerDuelsCauses(1, { niveau: n, media: i % 2 === 0, exclus })[0]) || tirerDuelsCauses(1, { exclus })[0]
      }, ([a, b], zone, fini) => {
        zone.appendChild(el("p", "consigne", "Chaque année, dans le monde, qu'est-ce qui cause le plus de décès ?"));
        const boutons = [a, b].map((cause, k) => {
          const bouton = boutonChoix(cause.nom, k);
          bouton.addEventListener("click", () => repondre(cause));
          zone.appendChild(bouton);
          return bouton;
        });

        function repondre(choix) {
          const gagnant = a.valeur > b.valeur ? a : b;
          const juste = choix === gagnant;
          boutons.forEach((x, k) => {
            x.disabled = true;
            const cause = [a, b][k];
            if (cause === gagnant) x.classList.add("juste");
            else if (cause === choix) x.classList.add("faux");
          });
          const retour = el("div", "retour-quiz");
          const rapport = Math.max(a.valeur, b.valeur) / Math.min(a.valeur, b.valeur);
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"),
            (juste ? "Juste : " : "Non : ") + gagnant.nom.charAt(0).toLowerCase() + gagnant.nom.slice(1) + ", environ " + (rapport < 10 ? fr(Number(rapport.toFixed(1))) : fr(Math.round(rapport))) + " fois plus."));
          barresComparees(retour, [a, b].map(c => ({ nom: c.nom, valeur: c.valeur, texte: c.texte, source: c.source, forte: c === gagnant })));
          if (a.facteur || b.facteur) retour.appendChild(paragraphe("Un facteur de risque (tabac, alcool, pollution) n'est pas une maladie : on compte les décès qui lui sont attribuables, toutes maladies confondues.", "source"));
          zone.appendChild(retour);
          fini(juste, retour);
        }
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "mortalite", bonnes, resultats.length);
        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Les causes de décès spectaculaires et médiatisées (requins, terrorisme, accidents d'avion) sont souvent surestimées par rapport aux causes banales et silencieuses (chutes, noyades, maladies chroniques).",
          "Lichtenstein, Slovic et leurs collègues (1978) ont demandé à des participants d'estimer la fréquence de 41 causes de décès : les causes rares et dramatiques étaient surestimées, les causes fréquentes sous-estimées. Combs et Slovic (1979) ont montré que ces erreurs suivaient la couverture des journaux plutôt que les statistiques.",
          "Les chiffres proviennent de sources et d'années différentes (2021 à 2025) : ils donnent des ordres de grandeur. Les duels ne comparent que des causes séparées par un facteur 1,6 au moins."
        ], [["#biais/disponibilite", "Heuristique de disponibilité"], ["#biais/negativite", "Biais de négativité"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "mortalite").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "pays",
    section: "monde",
    picto: "pays",
    couleur: "#0e7c86",
    duree: "3 min",
    titre: "Plus ou moins ?",
    resume: "Dix duels entre " + PAYS.length + " pays : population, revenu, espérance de vie, dépenses militaires, réfugiés… Données 2024-2025 de la Banque mondiale et du HCR. Quatre thèmes au choix.",
    lancer(zone) {
      const theme = lire("themePays", "tout");
      const indicateurs = [];
      deroulerNiveaux(zone, {
        id: "pays", n: 10, libelle: "Duel", relancer: () => JEUX.find(j => j.id === "pays").lancer(zone),
        avant: zone => zone.appendChild(choixThemePays(zone, theme)),   // choix du thème, au premier duel
        estJuste: justeOuPresque,
        // Niveaux 1 et 2 : duels ; niveau 3 : classer quatre pays
        tirer: niveau => (niveau === 3 && tirerClassementPays(theme)) || auNiveau(niveau, n => tirerDuelsPays(1, theme, { niveau: n, indicateurs })[0]) || tirerDuelsPays(1, theme, { indicateurs })[0]
      }, (duel, zone, fini) => {
        const ind = INDICATEURS_PAYS[duel.cle];
        if (duel.classement) {
          zone.appendChild(el("p", "cas", ind.question));
          zone.appendChild(el("p", "consigne", "Classez ces quatre pays, en commençant par la réponse"));
          classementInteractif(zone, duel.pays, p => p.nom, ordre => {
            const annee = p => (p.annees && p.annees[duel.cle]) || ANNEES_PAYS[duel.cle];
            const source = p => ind.source ? (ind.source.includes(String(annee(p))) ? ind.source : ind.source + ", " + annee(p)) : "Banque mondiale, " + annee(p);
            const bon = [...duel.pays].sort((a, b) => b[duel.cle] - a[duel.cle]);
            const retour = el("div", "retour-quiz");
            const part = corrigerClassement(retour, ordre, bon, p => p.nom, p => ind.format(p[duel.cle]) + " (" + source(p) + ")");
            zone.appendChild(retour);
            fini(part, retour);
          });
          return;
        }
        zone.appendChild(el("p", "cas", ind.question));
        const boutons = [duel.a, duel.b].map((p, k) => {
          const b = boutonChoix(p.nom, k);
          b.addEventListener("click", () => repondre(p));
          zone.appendChild(b);
          return b;
        });

        function repondre(choix) {
          const va = duel.a[duel.cle], vb = duel.b[duel.cle];
          const gagnant = va > vb ? duel.a : duel.b;
          const juste = choix === gagnant;
          boutons.forEach((x, k) => {
            x.disabled = true;
            const p = [duel.a, duel.b][k];
            if (p === gagnant) x.classList.add("juste");
            else if (p === choix) x.classList.add("faux");
          });
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Non : ") + gagnant.nom + "."));
          const annee = p => (p.annees && p.annees[duel.cle]) || ANNEES_PAYS[duel.cle];
          const source = p => (ind.source ? (ind.source.includes(String(annee(p))) ? ind.source : ind.source + ", " + annee(p)) : "Banque mondiale, " + annee(p));
          const mondial = MONDE_PAYS[duel.cle] !== undefined && duel.cle !== "pop" ? "moyenne mondiale, " + ind.format(MONDE_PAYS[duel.cle]) : null;
          if (ind.barres === false) {
            const liste = el("ul", "liste-simple");
            [duel.a, duel.b].forEach(p => liste.appendChild(el("li", p === gagnant ? "valeur-forte" : null, p.nom + " : " + ind.format(p[duel.cle]) + " (" + source(p) + ")")));
            retour.appendChild(liste);
            if (mondial) retour.appendChild(paragraphe("Pour comparaison : " + mondial + ".", "source"));
          } else {
            barresComparees(retour, [duel.a, duel.b].map(p => ({
              nom: p.nom, valeur: p[duel.cle], texte: ind.format(p[duel.cle]), forte: p === gagnant, source: source(p)
            })), mondial ? { valeur: MONDE_PAYS[duel.cle], texte: mondial } : null);
          }
          if (ind.note) retour.appendChild(paragraphe(ind.note, "source"));
          if (duel.cle === "surf" && [duel.a, duel.b].some(p => Math.abs(p.lat) >= 45) && [duel.a, duel.b].some(p => Math.abs(p.lat) < 30)) {
            retour.appendChild(paragraphe("Sur la plupart des cartes du monde (projection de Mercator), les pays éloignés de l'équateur paraissent bien plus grands qu'ils ne le sont : à 60° de latitude, les surfaces apparaissent quatre fois trop grandes.", "source"));
          }
          zone.appendChild(retour);
          fini(juste, retour);
        }
      }, resultats => {
        const bonnes = Number(sommeResultats(resultats).toFixed(1));
        afficherScore(zone, "pays", bonnes, resultats.length, fr(bonnes) + " / " + resultats.length);
        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Nos images des pays vieillissent mal. La fécondité a fortement baissé presque partout (2,2 enfants par femme dans le monde en 2024, contre 4,7 en 1960), l'espérance de vie a progressé partout, et beaucoup de pays dits « pauvres » ne le sont plus.",
          "Hans Rosling appelait « instinct du fossé » la tendance à diviser le monde en deux camps, riches et pauvres, alors que la plupart des pays se situent entre les deux.",
          "Pour les superficies, les cartes trompent : la projection de Mercator agrandit les régions proches des pôles. Le Groenland paraît aussi grand que l'Afrique, qui est en réalité environ 14 fois plus vaste.",
          "En géopolitique aussi, l'actualité déforme les proportions : près des trois quarts des réfugiés vivent dans des pays à revenu faible ou intermédiaire (calcul d'après les données du HCR, fin 2024), souvent voisins du pays qu'ils ont fui. L'Iran, la Turquie, la Colombie et l'Allemagne en accueillent le plus.",
          "Données : Banque mondiale (World Development Indicators, dont les estimations du SIPRI et de l'OIT) et HCR, téléchargées en octobre 2026. Les duels ne comparent que des pays dont les valeurs sont suffisamment différentes."
        ], [["#biais/disponibilite", "Heuristique de disponibilité"], ["#biais/ancrage", "Effet d'ancrage"]]);
        zone.appendChild(el("p", "consigne", "Rejouer sur un thème"));
        zone.appendChild(choixThemePays(zone, lire("themePays", "tout")));
        boutonRejouer(zone, () => JEUX.find(j => j.id === "pays").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "nord",
    section: "monde",
    picto: "carte",
    couleur: "#2f6db5",
    duree: "2 min",
    titre: "Le nord est où ?",
    resume: "Rome ou New York, Lima ou Miami : laquelle est la plus au nord, la plus à l'est ? Notre carte mentale aligne ce qui ne l'est pas.",
    lancer(zone) {
      const exclus = new Set();
      deroulerNiveaux(zone, {
        id: "nord", n: 10, relancer: () => JEUX.find(j => j.id === "nord").lancer(zone),
        estJuste: justeOuPresque,
        // Niveau 3 : classer quatre villes
        tirer: (niveau, i) => (niveau === 3 && tirerClassementVilles()) || tirerPaireVillesNiveau(niveau, i, exclus)
      }, (q, zone, fini) => {
        if (q.classement) {
          zone.appendChild(el("p", "cas", q.sens === "nord" ? "Classez ces villes du nord au sud." : "Classez ces villes d'ouest en est."));
          classementInteractif(zone, q.villes, v => VILLES[v][0], ordre => {
            const bon = [...q.villes].sort((a, b) => q.sens === "nord" ? VILLES[b][1] - VILLES[a][1] : VILLES[a][2] - VILLES[b][2]);
            const retour = el("div", "retour-quiz");
            const part = corrigerClassement(retour, ordre, bon, v => VILLES[v][0], coordonnees);
            retour.appendChild(planisphere(bon, q.sens, true));   // numéros du bon ordre, comme la liste
            zone.appendChild(retour);
            fini(part, retour);
          });
          return;
        }
        const [a, b] = q.villes;
        const libelle = { nord: "la plus au nord", est: "la plus à l'est", ouest: "la plus à l'ouest" }[q.sens];
        zone.appendChild(el("p", "cas", "Quelle ville est " + libelle + " ?"));
        const boutons = [a, b].map((v, k) => {
          const bouton = boutonChoix(VILLES[v][0], k);
          bouton.addEventListener("click", () => repondre(v));
          zone.appendChild(bouton);
          return bouton;
        });
        function repondre(choix) {
          const coord = v => q.sens === "nord" ? VILLES[v][1] : VILLES[v][2];
          const bonne = (q.sens === "ouest" ? coord(a) < coord(b) : coord(a) > coord(b)) ? a : b;
          const juste = choix === bonne;
          boutons.forEach((x, k) => {
            x.disabled = true;
            const v = [a, b][k];
            if (v === bonne) x.classList.add("juste");
            else if (v === choix) x.classList.add("faux");
          });
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Non : ") + VILLES[bonne][0] + "."));
          retour.appendChild(planisphere([a, b], q.sens));
          retour.appendChild(paragraphe([a, b].map(v => VILLES[v][0] + " : " + coordonnees(v)).join(" ; ") + "."));
          if (q.note) retour.appendChild(paragraphe(q.note));
          zone.appendChild(retour);
          fini(juste, retour);
        }
      }, resultats => {
        const bonnes = Number(sommeResultats(resultats).toFixed(1));
        afficherScore(zone, "nord", bonnes, resultats.length, fr(bonnes) + " / " + resultats.length);
        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Nous ne mémorisons pas une carte précise, mais des relations simplifiées. Barbara Tversky (1981) a montré que nous « alignons » les régions voisines : des étudiants pensaient que Rome était au sud de Philadelphie et Boston à l'ouest de Rio de Janeiro. Ces erreurs persistaient même quand on les prévenait.",
          "Nous raisonnons aussi de façon hiérarchique : la Californie est à l'ouest du Nevada, donc toute ville californienne serait à l'ouest de toute ville du Nevada. Stevens et Coupe (1978) ont montré que San Diego était ainsi placée à l'ouest de Reno, alors que c'est l'inverse.",
          "Le climat trompe aussi : l'Europe de l'Ouest, réchauffée par l'océan, est bien plus au nord que ne le laissent croire ses hivers."
        ], [["#chiffres/pays", "Plus ou moins ? (pays)"], ["#biais/disponibilite", "Heuristique de disponibilité"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "nord").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "grandeurs",
    section: "monde",
    picto: "grandeurs",
    couleur: "#2b7bb9",
    duree: "4 min",
    titre: "Ordres de grandeur",
    resume: "Combien d'arbres sur Terre ? De neurones dans un cerveau ? Placez huit quantités sur une échelle logarithmique.",
    lancer(zone) {
      zone.innerHTML = "";
      deroulerNiveaux(zone, {
        id: "grandeurs", n: 8, relancer: () => JEUX.find(j => j.id === "grandeurs").lancer(zone),
        // Niveau 3 : une question sur deux suit la méthode de Fermi (décomposer avant d'estimer)
        tirer: (niveau, i) => niveau === 3 && i % 2 === 1
          ? { fermiDe: tirerSelonNiveau("grandeurs:fermi", FERMI, 1, 3, f => f.id, () => 3)[0] }
          : tirerSelonNiveau("grandeurs", GRANDEURS, 1, niveau)[0],
        estJuste: points => points >= 2   // moins d'un facteur 3
      }, (q, zone, fini) => {
        if (q.fermiDe) return afficherFermi(q.fermiDe, zone, fini);
        const vraie = Math.log10(q.v);
        // Fenêtre de 9 puissances de dix, décalée au hasard pour que sa position ne trahisse pas la réponse
        const debut = Math.max(0, Math.floor(vraie) - 2 - Math.floor(Math.random() * 5));
        const fin = debut + 9;
        zone.appendChild(el("p", "cas", q.q));
        const affichage = el("p", "valeur-curseur");
        const curseur = el("input", "curseur");
        curseur.type = "range";
        curseur.min = 0;
        curseur.max = 900;
        curseur.value = 450;
        curseur.setAttribute("aria-label", "Votre estimation, sur une échelle logarithmique");
        const valeur = () => Math.pow(10, debut + 9 * curseur.value / 900);
        const majAffichage = () => { affichage.textContent = typo("Environ " + enClair(valeur()) + "  (" + puissanceDeDix(valeur()) + ")"); };
        curseur.addEventListener("input", majAffichage);
        majAffichage();
        const echelle = echelleLog(debut, fin);
        const valider = el("button", "bouton large", "Valider");
        valider.dataset.valider = "1";
        zone.append(affichage, curseurAvecBoutons(curseur, 9), echelle, valider);
        zone.appendChild(paragraphe("Chaque graduation multiplie par dix. Une estimation à un facteur 2 près est très bonne.", "source"));
        valider.addEventListener("click", () => {
          valider.remove();
          curseur.disabled = true;
          const estimation = valeur();
          const ecart = Math.abs(Math.log10(estimation) - vraie);
          const facteur = Math.pow(10, ecart);
          const points = ecart <= Math.log10(2) ? 3 : ecart <= Math.log10(3) ? 2 : ecart <= 1 ? 1 : 0;
          // Repère de la vraie valeur sur l'échelle
          const repere = el("div", "repere-vrai");
          repere.style.left = (100 * (vraie - debut) / 9) + "%";
          echelle.appendChild(repere);
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (points >= 2 ? "juste" : "faux"),
            "Réponse : environ " + enClair(q.v, 3) + " (" + puissanceDeDix(q.v) + ")."));
          retour.appendChild(paragraphe(facteur < 1.15 ? "Dans le mille." :
            "Votre estimation était " + (estimation > q.v ? "trop haute" : "trop basse") + " d'un facteur " + fr(Number(facteur.toFixed(facteur < 10 ? 1 : 0))) + ". " +
            ["Aucun point : plus d'un facteur 10 d'écart.", "1 point : moins d'un facteur 10.", "2 points : moins d'un facteur 3.", "3 points : moins d'un facteur 2."][points]));
          retour.appendChild(paragraphe("Source : " + q.source + ".", "source"));
          zone.appendChild(retour);
          fini(points, retour);
        });
      }, resultats => {
        const total = resultats.reduce((s, p) => s + p, 0);
        afficherScore(zone, "grandeurs", total, resultats.length * 3);
        ajouterExplication(zone, "Penser en ordres de grandeur", [
          "Au-delà de quelques milliers, les nombres deviennent abstraits : un million et un milliard « sonnent » pareil, alors qu'un milliard de secondes dure près de 32 ans et un million à peine plus de 11 jours.",
          "Pour estimer une grande quantité, on peut la décomposer en facteurs que l'on connaît mieux (méthode dite « de Fermi ») : par exemple, battements de cœur dans une vie = battements par minute × minutes par an × années.",
          "Un écart d'un facteur 2 sur une échelle logarithmique est une bonne estimation ; un facteur 10, une erreur d'ordre de grandeur."
        ], [["#biais/ancrage", "Effet d'ancrage"], ["#chiffres/intervalles", "Êtes-vous sûr à 90 % ?"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "grandeurs").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "chronologie",
    section: "monde",
    picto: "chronologie",
    couleur: "#a77a12",
    duree: "3 min",
    titre: "Avant ou après ?",
    resume: "Dix paires d'événements historiques : lequel a eu lieu en premier ? Certaines paires bousculent notre sens du temps.",
    lancer(zone) {
      const exclus = new Set();
      deroulerNiveaux(zone, {
        id: "chronologie", n: 10, libelle: "Paire", relancer: () => JEUX.find(j => j.id === "chronologie").lancer(zone),
        estJuste: justeOuPresque,
        // Niveau 3 : placer quatre événements dans l'ordre
        tirer: (niveau, i) => (niveau === 3 && tirerClassementChronologie()) || tirerPaireChronologieNiveau(niveau, i, exclus)
      }, (paire, zone, fini) => {
        if (paire.classement) {
          zone.appendChild(el("p", "cas", "Classez ces événements du plus ancien au plus récent."));
          classementInteractif(zone, paire.evenements, e => e.nom, ordre => {
            const bon = [...paire.evenements].sort((a, b) => momentEvenement(a) - momentEvenement(b));
            const retour = el("div", "retour-quiz");
            const part = corrigerClassement(retour, ordre, bon, e => e.nom, dateEvenement);
            zone.appendChild(retour);
            fini(part, retour);
          });
          return;
        }
        zone.appendChild(el("p", "consigne", "Lequel a eu lieu en premier ?"));
        const [a, b] = paire.evenements;
        const boutons = [a, b].map((e, k) => {
          const bouton = boutonChoix(e.nom, k);
          bouton.addEventListener("click", () => repondre(e));
          zone.appendChild(bouton);
          return bouton;
        });
        function repondre(choix) {
          const premier = momentEvenement(a) < momentEvenement(b) ? a : b;
          const juste = choix === premier;
          boutons.forEach((x, k) => {
            x.disabled = true;
            const e = [a, b][k];
            if (e === premier) x.classList.add("juste");
            else if (e === choix) x.classList.add("faux");
          });
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Non : ") + premier.nom.charAt(0).toLowerCase() + premier.nom.slice(1) + "."));
          retour.appendChild(frise(a, b));
          // Il n'y a pas d'an 0 : de 30 av. J.-C. (−30) à 79, il s'écoule 108 ans, et non 109
          const ecart = Math.abs(a.annee - b.annee) - (a.annee * b.annee < 0 ? 1 : 0);
          retour.appendChild(paragraphe(ecart === 0 ? "Les deux ont eu lieu la même année." : (a.vers || b.vers ? "Environ " : "") + pluriel(ecart, "an") + " d'écart."));
          if (paire.note) retour.appendChild(paragraphe(paire.note));
          zone.appendChild(retour);
          fini(juste, retour);
        }
      }, resultats => {
        const bonnes = Number(sommeResultats(resultats).toFixed(1));
        afficherScore(zone, "chronologie", bonnes, resultats.length, fr(bonnes) + " / " + resultats.length);
        ajouterExplication(zone, "Notre sens du temps", [
          "Nous rangeons les événements dans des cases apprises séparément : « l'Antiquité », « la révolution industrielle », « le Japon des samouraïs ». Des faits classés dans des chapitres différents semblent appartenir à des mondes éloignés, alors qu'ils sont parfois contemporains.",
          "À l'inverse, une même étiquette regroupe des périodes immenses : l'Égypte des pharaons a duré environ 3 000 ans, et Cléopâtre est plus proche de nous que des bâtisseurs de la grande pyramide.",
          "Le jeu propose d'abord des paires célèbres pour leur effet de surprise (" + PAIRES_CELEBRES.length + "), puis des paires tirées au hasard parmi " + EVENEMENTS.length + " événements datés."
        ]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "chronologie").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "vrai-faux",
    section: "confiance",
    picto: "jauge",
    couleur: "#5b5bb5",
    duree: "4 min",
    titre: "Vrai ou faux ?",
    resume: "Douze affirmations, et pour chacune votre degré de certitude. Quand vous êtes sûr à 90 %, avez-vous raison 9 fois sur 10 ?",
    lancer(zone) {
      // Six affirmations vraies et six fausses, dans un ordre aléatoire
      const sens = melanger([true, true, true, true, true, true, false, false, false, false, false, false]);
      deroulerNiveaux(zone, {
        id: "vrai-faux", n: 12, libelle: "Affirmation", relancer: () => JEUX.find(j => j.id === "vrai-faux").lancer(zone),
        tirer: (niveau, i) => tirerSelonNiveau(sens[i] ? "vrai-faux:v" : "vrai-faux:f", VRAI_FAUX.filter(a => a.vrai === sens[i]), 1, niveau)[0],
        estJuste: r => r.juste
      }, (a, zone, fini) => {
        zone.appendChild(el("p", "cas", a.texte));
        const reponses = [["Vrai", true], ["Faux", false]].map(([texte, valeur], k) => {
          const b = boutonChoix(texte, k);
          b.addEventListener("click", () => {
            reponses.forEach(x => { x.disabled = true; });
            b.classList.add("choisi");
            demanderConfiance(valeur);
          });
          zone.appendChild(b);
          return b;
        });

        function demanderConfiance(valeur) {
          const bloc = el("div", "bloc-confiance");
          bloc.appendChild(el("p", "consigne", "À quel point êtes-vous sûr ?"));
          const rangee = el("div", "rangee-confiance");
          const libelles = { 50: "50 % · au hasard", 70: "70 %", 90: "90 %", 99: "99 % · certain" };
          const boutons = NIVEAUX_CONFIANCE.map((niveau, k) => {
            const b = boutonChoix(libelles[niveau], k);
            b.classList.add("confiance");
            b.addEventListener("click", () => {
              boutons.forEach(x => { x.disabled = true; });
              b.classList.add("choisi");
              corriger(valeur, niveau);
            });
            rangee.appendChild(b);
            return b;
          });
          bloc.appendChild(rangee);
          zone.appendChild(bloc);
        }

        function corriger(valeur, niveau) {
          const juste = valeur === a.vrai;
          noterConfiance(niveau, juste);
          const points = pointsConfiance(niveau, juste);
          reponses[a.vrai ? 0 : 1].classList.add("juste");
          if (!juste) reponses[valeur ? 0 : 1].classList.add("faux");
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Bonne réponse : c'est " : "Erreur : c'est ") + (a.vrai ? "vrai" : "faux") + ". " + signe(points) + " points"));
          retour.appendChild(paragraphe(a.explication));
          retour.appendChild(paragraphe("Source : " + a.source + ".", "source"));
          zone.appendChild(retour);
          fini({ juste, niveau, points }, retour);
        }
      }, resultats => {
        const bonnes = resultats.filter(r => r.juste).length;
        const points = resultats.reduce((s, r) => s + r.points, 0);
        afficherScore(zone, "vrai-faux", bonnes, resultats.length);
        zone.appendChild(el("p", "verdict", "Points : " + signe(points)));
        // Espérance de points quand on croit avoir 70 % de chances, selon la certitude annoncée
        const esperance = annonce => 0.7 * pointsConfiance(annonce, true) + 0.3 * pointsConfiance(annonce, false);
        zone.appendChild(calculEnDetail([
          "Chaque réponse rapporte un nombre de points qui dépend de la certitude p annoncée :",
          "= juste : 100 × (1 + log₂ p) ; fausse : 100 × (1 + log₂ (1 − p))",
          "= " + NIVEAUX_CONFIANCE.map(c => c + " % : " + signe(pointsConfiance(c, true)) + " ou " + signe(pointsConfiance(c, false))).join(" ; "),
          "Ce barème est une règle de score « propre » : on gagne le plus, en moyenne, en annonçant sa vraie probabilité d'avoir raison. Par exemple, si vous pensez avoir 70 % de chances :",
          "= annoncer 70 % rapporte en moyenne " + signe(Math.round(esperance(70))) + " ; annoncer 90 %, " + signe(Math.round(esperance(90))) + " ; annoncer 99 %, " + signe(Math.round(esperance(99))),
          "Exagérer sa certitude coûte donc des points, comme la sous-estimer. Votre total de la partie : " + signe(points) + "."
        ]));
        zone.appendChild(paragraphe("Chaque réponse rapporte d'autant plus de points que vous étiez sûr… et en coûte beaucoup plus si vous vous trompiez : +85 ou −232 points à 90 %, +99 ou −564 à 99 %. Avec ce barème (une « règle de score propre »), on a intérêt à annoncer exactement sa certitude réelle.", "source"));

        // Étalonnage de cette partie et étalonnage cumulé
        const partie = {};
        resultats.forEach(r => {
          const [n, j] = partie[r.niveau] || [0, 0];
          partie[r.niveau] = [n + 1, j + (r.juste ? 1 : 0)];
        });
        const cumul = lire("confiance", {});
        zone.appendChild(el("p", "consigne", "Votre étalonnage, toutes parties confondues"));
        zone.appendChild(courbeEtalonnage(cumul, partie));
        zone.appendChild(legende([["var(--c-fort)", "toutes vos réponses"], ["var(--orange)", "cette partie"], ["var(--discret)", "étalonnage parfait"]]));
        const lignes = el("ul", "liste-simple");
        NIVEAUX_CONFIANCE.forEach(niveau => {
          const [n, j] = cumul[niveau] || [0, 0];
          if (n) lignes.appendChild(el("li", null, "Sûr à " + niveau + " % : juste " + j + " fois sur " + n + " (" + Math.round(100 * j / n) + " %)."));
        });
        zone.appendChild(lignes);

        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Être bien étalonné, c'est avoir raison 9 fois sur 10 quand on se dit sûr à 90 %. Pour les questions de culture générale, la plupart des gens sont trop sûrs d'eux : dans les expériences de Fischhoff, Slovic et Lichtenstein (1977), les réponses données avec 90 % de certitude n'étaient justes qu'environ 75 % du temps.",
          "L'étalonnage s'améliore avec un retour fréquent et précis. Les prévisionnistes météo, qui confrontent chaque jour leurs probabilités aux faits, sont réputés très bien étalonnés (Murphy et Winkler, 1977).",
          "Vos réponses s'accumulent d'une partie à l'autre : après quelques parties, la courbe devient fiable. Les " + VRAI_FAUX.length + " affirmations sont proposées sans répétition tant que vous ne les avez pas toutes vues."
        ], [["#biais/surprecision", "Excès de précision"], ["#biais/dunning-kruger", "Effet Dunning-Kruger"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "vrai-faux").lancer(zone));
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "intervalles",
    section: "confiance",
    picto: "intervalle",
    couleur: "#2f6db5",
    duree: "4 min",
    titre: "Êtes-vous sûr à 90 % ?",
    resume: "Pour dix quantités, donnez une fourchette dont vous êtes sûr à 90 %. Combien contiendront la bonne réponse ?",
    lancer(zone) {
      zone.innerHTML = "";
      // Questions toutes affichées ensemble : le niveau s'ajuste d'une partie à l'autre
      const niveau = niveauAtelier("intervalles").niveau;
      zone.appendChild(choixNiveau("intervalles", () => JEUX.find(j => j.id === "intervalles").lancer(zone)));
      const questions = tirerSelonNiveau("intervalles", ETALONNAGE, 10, niveau);
      // Niveau 3 : deux fourchettes par quantité, à 50 % et à 90 %
      const double = niveau === 3;
      zone.appendChild(paragraphe(double
        ? "Pour chaque quantité, donnez deux fourchettes : une dont vous êtes sûr à 50 %, et une, plus large, dont vous êtes sûr à 90 %. La première doit tenir dans la seconde."
        : "Pour chaque quantité, indiquez une valeur basse et une valeur haute telles que vous soyez sûr à 90 % que la vraie valeur se trouve entre les deux. Si vous ne savez pas, élargissez la fourchette : le but n'est pas d'être précis, mais d'être juste sur votre degré de certitude."));
      zone.appendChild(paragraphe(double ? "Bien étalonné, environ 5 fourchettes à 50 % et 9 fourchettes à 90 % sur 10 contiennent la bonne réponse." : "Bien étalonné, vous devriez avoir environ 9 bonnes fourchettes sur 10.", "source"));

      const champs = questions.map((q, k) => {
        const bloc = el("div", "question-test");
        bloc.appendChild(paragraphe((k + 1) + ". " + q.q + (q.unite ? " (" + q.unite + ")" : "")));
        const paire = etiquette => {
          const ligne = el("div", "ligne");
          const bas = el("input", "champ");
          const haut = el("input", "champ");
          [bas, haut].forEach(c => { c.inputMode = "decimal"; c.style.width = "7em"; });
          bas.placeholder = "au moins";
          haut.placeholder = "au plus";
          bas.setAttribute("aria-label", "Valeur basse" + (etiquette ? ", " + etiquette : ""));
          haut.setAttribute("aria-label", "Valeur haute" + (etiquette ? ", " + etiquette : ""));
          if (etiquette) ligne.appendChild(el("span", "source etiquette-fourchette", etiquette));
          ligne.append(bas, el("span", "source", "à"), haut);
          bloc.appendChild(ligne);
          return [bas, haut];
        };
        const champsQ = double ? [...paire("à 50 %"), ...paire("à 90 %")] : paire();
        zone.appendChild(bloc);
        return champsQ;
      });

      const valider = el("button", "bouton large", "Voir les réponses");
      valider.dataset.valider = "1";
      zone.appendChild(valider);
      valider.addEventListener("click", () => {
        const lirePaire = (b, h) => {
          let x = lireNombre(b.value), y = lireNombre(h.value);
          if (x > y) [x, y] = [y, x];
          return [x, y];
        };
        // Au niveau 3 : [bas, haut] à 90 % ; et [bas, haut] à 50 % dans « cinquante »
        const reponses = champs.map(c => double ? lirePaire(c[2], c[3]) : lirePaire(c[0], c[1]));
        const cinquante = double ? champs.map(c => lirePaire(c[0], c[1])) : null;
        const vides = champs.flat().filter(c => isNaN(lireNombre(c.value))).length;
        if (vides) {
          valider.textContent = "Il manque " + pluriel(vides, "valeur") + " à remplir";
          champs.flat().find(c => isNaN(lireNombre(c.value))).focus();
          return;
        }
        if (double && cinquante.some(([x, y], k) => x < reponses[k][0] || y > reponses[k][1])) {
          valider.textContent = "Chaque fourchette à 50 % doit tenir dans celle à 90 %";
          return;
        }
        zone.innerHTML = "";
        let dedans = 0;
        const liste = el("div");
        questions.forEach((q, k) => {
          const [x, y] = reponses[k];
          const ok = q.v >= x && q.v <= y;
          if (ok) dedans++;
          liste.appendChild(ligneIntervalle(q, x, y, ok));
        });
        noterFourchettes(questions.length, dedans);
        const couts = questions.map((q, k) => scoreFourchette(q, reponses[k][0], reponses[k][1], 0.1));
        const moyenneCout = couts.reduce((a, b) => a + b, 0) / couts.length;
        const dedans50 = double ? questions.filter((q, k) => q.v >= cinquante[k][0] && q.v <= cinquante[k][1]).length : null;
        const couts50 = double ? questions.map((q, k) => scoreFourchette(q, cinquante[k][0], cinquante[k][1], 0.5)) : null;
        noterPartieEntiere("intervalles", niveau, questions.map((q, k) => q.v >= reponses[k][0] && q.v <= reponses[k][1]));
        afficherScore(zone, "intervalles", dedans, questions.length);
        zone.appendChild(paragraphe(dedans >= 8
          ? "Votre étalonnage est bon : vos fourchettes reflètent correctement votre incertitude."
          : "Vos fourchettes étaient trop étroites : vous étiez plus sûr de vous que vos connaissances ne le justifiaient."));
        zone.appendChild(el("p", "verdict", "Score de fourchette : " + fr(Number(moyenneCout.toFixed(2))) + " (plus il est bas, mieux c'est)"));
        zone.appendChild(paragraphe("Une fourchette étroite et juste vaut mieux qu'une fourchette large ; une fourchette fausse coûte cher. Une fourchette juste, d'un facteur 4 de large, coûte environ 0,6 ; manquer la vraie valeur d'un facteur 10 coûte 20 de plus.", "source"));
        if (double) zone.appendChild(paragraphe("Fourchettes à 50 % justes : " + dedans50 + " sur 10 (objectif : environ 5). Fourchettes à 90 % justes : " + dedans + " sur 10 (objectif : environ 9)." + (dedans50 > 7 ? " Vos fourchettes à 50 % sont trop larges : vous pouvez les resserrer." : dedans50 < 3 ? " Vos fourchettes à 50 % sont trop étroites." : "")));
        const pire = couts.indexOf(Math.max(...couts));
        zone.appendChild(calculEnDetail([
          "Pour une fourchette [b, h] donnée au niveau de confiance 1 − α, et une vraie valeur v :",
          "= coût = (h − b) + (2/α) × (b − v) si v est en dessous ; + (2/α) × (v − h) si v est au-dessus",
          "À 90 %, α = 0,1, donc 2/α = 20 : sortir de la fourchette coûte vingt fois plus cher que de l'élargir. À 50 %, 2/α = 4. Le score est une règle propre (Gneiting et Raftery, 2007) : on obtient le meilleur score moyen en donnant des fourchettes qui reflètent exactement son incertitude.",
          "Les écarts se mesurent en ordres de grandeur (log₁₀ : un facteur 10 vaut 1) ; les années, en siècles.",
          "= Votre fourchette la plus coûteuse : « " + questions[pire].q + " », de " + fr(reponses[pire][0]) + " à " + fr(reponses[pire][1]) + " pour " + fr(questions[pire].v) + " : coût " + fr(Number(couts[pire].toFixed(2))),
          double ? "= Score moyen à 50 % : " + fr(Number((couts50.reduce((a, b) => a + b, 0) / 10).toFixed(2))) + " ; à 90 % : " + fr(Number(moyenneCout.toFixed(2))) : "= Score moyen : " + fr(Number(moyenneCout.toFixed(2))) + " sur " + questions.length + " fourchettes"
        ]));
        const [total, reussies] = lire("fourchettes", [0, 0]);
        if (total > questions.length) zone.appendChild(paragraphe("Toutes parties confondues : " + reussies + " fourchettes justes sur " + total + ", soit " + Math.round(100 * reussies / total) + " % (objectif : 90 %).", "source"));
        zone.appendChild(liste);
        zone.appendChild(legende([["var(--c-fort)", "votre fourchette"], ["var(--vert)", "vraie valeur, dans la fourchette"], ["var(--rouge)", "vraie valeur, hors de la fourchette"]]));

        ajouterExplication(zone, "Ce que montre ce jeu", [
          "La plupart des gens obtiennent entre 3 et 6 sur 10 à ce type d'exercice : pour des intervalles « sûrs à 90 % », la vraie valeur tombe typiquement dedans dans 30 à 60 % des cas (McKenzie, Liersch et Yaniv, 2008).",
          "Alpert et Raiffa (1969, publié en 1982) demandaient des intervalles sûrs à 98 % : la vraie valeur en sortait dans 42 % des cas, au lieu de 2 %.",
          "Méthode pour s'améliorer : estimer chaque borne séparément (« je suis presque certain que c'est au moins… »), puis se demander pourquoi la vraie valeur pourrait être en dehors."
        ], [["#biais/surprecision", "Excès de précision"], ["#biais/planification", "Erreur de planification"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "intervalles").lancer(zone), "Nouvelle série");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "ancre",
    section: "confiance",
    picto: "ancre",
    couleur: "#c0601b",
    duree: "3 min",
    titre: "L'ancre",
    resume: "Huit estimations, chacune précédée d'un nombre tiré au hasard. Ce nombre influence-t-il vos réponses ?",
    lancer(zone) {
      // Moitié d'ancres hautes, moitié d'ancres basses, dans un ordre aléatoire
      const questions = tirerNouveaux("ancre", ANCRES, 8);
      const types = melanger(["haute", "haute", "haute", "haute", "basse", "basse", "basse", "basse"]);
      const tours = questions.map((q, k) => {
        const facteur = types[k] === "haute" ? 2 + Math.random() * 2 : 0.25 + Math.random() * 0.25;
        let ancre = arrondir2(q.v * facteur);
        if (q.pourcent) ancre = Math.min(ancre, 99);
        if (q.annee) ancre = Math.round(q.v + (types[k] === "haute" ? 1 : -1) * (80 + Math.random() * 120));
        return { q, type: types[k], ancre, estimation: null };
      });
      let i = 0;

      function afficher() {
        zone.innerHTML = "";
        if (i >= tours.length) return bilan();
        const t = tours[i];
        entete(zone, i + 1, tours.length);
        const roue = el("div", "tirage");
        roue.append(el("span", "tirage-libelle", "Nombre tiré au hasard"), el("span", "tirage-nombre", fr(t.ancre)));
        zone.appendChild(roue);
        zone.appendChild(el("p", "cas", t.q.q + " : plus ou moins de " + fr(t.ancre) + (t.q.unite ? " " + t.q.unite : "") + " ?"));
        const actions = el("div", "actions");
        ["Moins", "Plus"].forEach(libelle => {
          const b = el("button", "bouton secondaire", libelle);
          b.addEventListener("click", () => {
            actions.remove();
            zone.appendChild(paragraphe("Votre estimation :"));
            const ligne = el("div", "ligne");
            const champ = el("input", "champ");
            champ.inputMode = "decimal";
            champ.setAttribute("aria-label", "Votre estimation");
            const ok = el("button", "bouton", "Valider");
            ok.dataset.valider = "1";
            ligne.append(champ, el("span", "source", t.q.unite), ok);
            zone.appendChild(ligne);
            champ.focus();
            ok.addEventListener("click", () => {
              const v = lireNombre(champ.value);
              if (isNaN(v) || v <= 0) { champ.focus(); return; }
              t.estimation = v;
              i++;
              afficher();
            });
          });
          actions.appendChild(b);
        });
        zone.appendChild(actions);
        zone.appendChild(paragraphe("Le nombre ci-dessus est tiré au hasard : il ne donne aucune indication sur la réponse.", "source"));
      }

      function bilan() {
        noterPartie("ancre");
        zone.appendChild(el("p", "consigne", "Résultat"));
        const ecart = t => t.q.annee ? 1 + (t.estimation - t.q.v) / 100 : t.estimation / t.q.v;
        const hautes = tours.filter(t => t.type === "haute").map(ecart).filter(x => x > 0);
        const basses = tours.filter(t => t.type === "basse").map(ecart).filter(x => x > 0);
        const mh = moyenneGeometrique(hautes), mb = moyenneGeometrique(basses);
        if (hautes.length && basses.length) {
          const ancrages = lire("ancrages", []);
          ancrages.push({ j: aujourdHui(), h: Number(mh.toFixed(3)), b: Number(mb.toFixed(3)) });
          ecrire("ancrages", ancrages.slice(-30));
        }

        // Deux barres : estimation moyenne relative à la vraie valeur
        const graphique = el("div");
        [["Après un nombre élevé", mh], ["Après un nombre faible", mb]].forEach(([libelle, m]) => {
          const ligne = el("div", "barre-ligne");
          const pct = Math.round((m - 1) * 100);
          ligne.appendChild(el("div", "barre-nom", libelle + " : " + signe(pct) + " % par rapport à la vraie valeur"));
          const fond = el("div", "barre-fond centre");
          const barre = el("div", "barre");
          const largeur = Math.min(50, Math.abs(Math.log2(m)) * 25);
          barre.style.width = largeur + "%";
          barre.style.marginLeft = m >= 1 ? "50%" : (50 - largeur) + "%";
          fond.appendChild(barre);
          ligne.appendChild(fond);
          graphique.appendChild(ligne);
        });
        zone.appendChild(graphique);
        zone.appendChild(paragraphe(mh > mb
          ? "Vos estimations ont été plus élevées après un nombre élevé qu'après un nombre faible : c'est l'effet d'ancrage."
          : "Sur ces huit questions, l'effet d'ancrage n'apparaît pas dans vos réponses. Sur un petit nombre de questions, le hasard peut le masquer ; il apparaît nettement en moyenne sur un grand nombre de personnes."));

        const tableau = el("table", "tableau");
        const tete = el("tr");
        tete.append(el("th", null, "Question"), el("th", null, "Nombre"), el("th", null, "Vous / réel"));
        tableau.appendChild(tete);
        tours.forEach(t => {
          const tr = el("tr");
          tr.append(el("td", null, t.q.q), el("td", null, fr(t.ancre)), el("td", null, fr(t.estimation) + " / " + fr(t.q.v)));
          tableau.appendChild(tr);
        });
        zone.appendChild(tableau);

        ajouterExplication(zone, "Ce que montre ce jeu", [
          "Un nombre que l'on sait arbitraire suffit à tirer les estimations vers lui. Tversky et Kahneman (1974) utilisaient une roue de loterie truquée ; d'autres études ont utilisé les deux derniers chiffres du numéro de sécurité sociale des participants (Ariely, Loewenstein et Prelec, 2003).",
          "Répondre d'abord à la question « plus ou moins ? » renforce l'effet : on cherche des raisons pour lesquelles la réponse pourrait être proche de l'ancre."
        ], [["#biais/ancrage", "Effet d'ancrage"]]);
        boutonRejouer(zone, () => JEUX.find(j => j.id === "ancre").lancer(zone));
      }

      afficher();
    }
  },

  // ---------------------------------------------------------------
  {
    id: "points",
    section: "perception",
    picto: "points",
    couleur: "#8a3f8f",
    duree: "1 min",
    titre: "Combien de points ?",
    resume: "Un nuage de points s'affiche une seconde et demie. Estimez leur nombre. Votre perception est-elle fidèle ?",
    lancer(zone) {
      zone.innerHTML = "";
      zone.appendChild(paragraphe("Huit nuages de points vont s'afficher, chacun pendant une seconde et demie. Donnez à chaque fois votre estimation, sans compter."));
      const precedents = lire("points", null);
      const sans = el("button", "bouton large", "Commencer");
      sans.dataset.suivant = "1";
      zone.appendChild(sans);
      sans.addEventListener("click", () => partiePoints(zone, false));
      if (precedents) {
        const avec = el("button", "bouton secondaire large", "Recommencer avec un repère");
        avec.style.marginTop = "8px";
        zone.appendChild(avec);
        avec.addEventListener("click", () => partiePoints(zone, true));
        zone.appendChild(paragraphe("La version « avec un repère » montre d'abord un nuage dont on vous donne le nombre, comme dans l'expérience d'Izard et Dehaene (2008).", "source"));
      }
    }
  }
];

// ===================== Tirages =====================

// Duels entre causes de décès : écart d'au moins 1,6 (les chiffres sont des estimations),
// pas de comparaison entre un facteur de risque et les maladies qu'il provoque,
// et une fois sur deux un « piège » : une cause médiatique face à une cause plus meurtrière.
// options : { niveau, media (impose un duel « risque médiatique » ou l'interdit), exclus (clés déjà tirées) }
function tirerDuelsCauses(n, options = {}) {
  const ids = Object.keys(CAUSES);
  const exclus = options.exclus || new Set();
  const recents = new Set(lire("vus", {}).duels || []);
  const duels = [];
  const pris = new Set();
  for (let essai = 0; duels.length < n && essai < 5000; essai++) {
    const a = ids[Math.floor(Math.random() * ids.length)];
    const b = ids[Math.floor(Math.random() * ids.length)];
    const A = CAUSES[a], B = CAUSES[b];
    const cle = [a, b].sort().join("|");
    if (a === b || pris.has(cle) || exclus.has(cle) || (essai < 3000 && recents.has(cle))) continue;
    if (A.facteur && B.facteur) continue;
    if ((A.exclure || []).includes(b) || (B.exclure || []).includes(a)) continue;
    const rapport = Math.max(A.valeur, B.valeur) / Math.min(A.valeur, B.valeur);
    if (rapport < 1.6 || rapport > 2000) continue;
    if (options.niveau && niveauDuelCauses(rapport) !== options.niveau) continue;
    if (options.media !== undefined ? options.media : duels.length % 2 === 0) {
      const media = A.mediatique && !B.mediatique ? A : B.mediatique && !A.mediatique ? B : null;
      if (!media || media.valeur > Math.min(A.valeur, B.valeur)) continue;
    }
    pris.add(cle);
    exclus.add(cle);
    duels.push(melanger([A, B]));
  }
  const vus = lire("vus", {});
  vus.duels = [...(vus.duels || []), ...pris].slice(-60);
  ecrire("vus", vus);
  return duels;
}

// Indicateurs du jeu « Plus ou moins ? » : question posée et mise en forme des valeurs
// Thèmes du jeu « Plus ou moins ? »
const THEMES_PAYS = [["tout", "Tout"], ["population", "Population et territoire"], ["economie", "Économie et environnement"], ["geopolitique", "Géopolitique"]];

// Milliards ou milliers de milliards de dollars, en clair
const dollars = v => v >= 1e10 ? fr(Math.round(v / 1e9)) + " milliards de dollars" : fr(Number((v / 1e9).toFixed(1))) + " milliard" + (v >= 2e9 ? "s" : "") + " de dollars";

const INDICATEURS_PAYS = {
  pop: { theme: "population", poids: 3, question: "Quel pays compte le plus d'habitants ?", format: v => v >= 1e9 ? fr(Number((v / 1e9).toFixed(2))) + " milliard d'habitants" : v >= 1e6 ? fr(Number((v / 1e6).toFixed(1))) + " millions d'habitants" : fr(Math.round(v / 1000) * 1000) + " habitants" },
  surf: { theme: "population", poids: 3, question: "Quel pays est le plus vaste ?", format: v => fr(v >= 100000 ? Math.round(v / 1000) * 1000 : v) + " km²",
    note: "Superficie totale, eaux intérieures comprises, selon la FAO." },
  dens: { theme: "population", poids: 1, question: "Quel pays est le plus densément peuplé ?", format: v => fr(v >= 10 ? Math.round(v) : v) + " habitants par km²" },
  croissance: { theme: "population", poids: 2, question: "Quelle population augmente le plus vite ?", format: v => signe(v) + " % par an", barres: false,
    note: "Évolution annuelle de la population : naissances moins décès, plus le solde des migrations." },
  ev: { theme: "population", poids: 3, question: "Dans quel pays l'espérance de vie à la naissance est-elle la plus longue ?", format: v => fr(v) + " ans" },
  fec: { theme: "population", poids: 3, question: "Dans quel pays les femmes ont-elles le plus d'enfants, en moyenne ?", format: v => fr(v) + " enfants par femme",
    note: "Il faut environ 2,1 enfants par femme pour qu'une population se renouvelle à long terme, sans immigration." },
  age65: { theme: "population", poids: 2, question: "Dans quel pays la part des 65 ans et plus est-elle la plus forte ?", format: v => fr(v) + " % de la population" },
  mi: { theme: "population", poids: 2, question: "Dans quel pays la mortalité infantile est-elle la plus élevée ?", format: v => fr(v) + " décès avant 1 an pour 1 000 naissances" },
  foret: { theme: "population", poids: 2, question: "Dans quel pays les forêts couvrent-elles la plus grande part du territoire ?", format: v => fr(Math.round(v)) + " % du territoire" },
  pib: { theme: "economie", poids: 2, question: "Dans quel pays le revenu moyen par habitant est-il le plus élevé ?", format: v => fr(Math.round(v / 100) * 100) + " $ par habitant",
    note: "PIB par habitant en parité de pouvoir d'achat : les montants tiennent compte des différences de prix entre pays." },
  pibtotal: { theme: "economie", poids: 2, question: "Quel pays a l'économie la plus importante (PIB total) ?", format: dollars,
    note: "PIB en dollars courants, aux taux de change du marché : il mesure le poids économique d'un pays, pas le niveau de vie de ses habitants." },
  chomage: { theme: "economie", poids: 2, question: "Dans quel pays le taux de chômage est-il le plus élevé ?", format: v => fr(v) + " % de la population active", source: "OIT, via la Banque mondiale",
    note: "Estimations harmonisées de l'Organisation internationale du travail : les chiffres nationaux officiels peuvent différer." },
  transferts: { theme: "economie", poids: 2, question: "Dans quel pays l'argent envoyé par les émigrés pèse-t-il le plus dans l'économie ?", format: v => fr(v) + " % du PIB",
    note: "Sommes envoyées à leur famille par les personnes parties travailler à l'étranger, rapportées au PIB du pays qui les reçoit." },
  net: { theme: "economie", poids: 2, question: "Dans quel pays la part de la population qui utilise Internet est-elle la plus forte ?", format: v => fr(Math.round(v)) + " % de la population" },
  co2: { theme: "economie", poids: 2, question: "Quel pays émet le plus de CO₂ par habitant ?", format: v => fr(v) + " t de CO₂ par habitant et par an",
    note: "Émissions de CO₂ hors changements d'usage des terres (déforestation…), sans compter les biens importés." },
  armee: { theme: "geopolitique", poids: 2, question: "Quel pays consacre la plus grande part de sa richesse (PIB) à ses armées ?", format: v => fr(v) + " % du PIB", source: "SIPRI, via la Banque mondiale",
    note: "Dépenses militaires estimées par l'Institut international de recherche sur la paix de Stockholm (SIPRI)." },
  armeeusd: { theme: "geopolitique", poids: 2, question: "Quel pays dépense le plus pour ses armées, en dollars ?", format: dollars, source: "SIPRI, via la Banque mondiale",
    note: "Dépenses militaires estimées par le SIPRI, en dollars courants." },
  refugies: { theme: "geopolitique", poids: 2, question: "Quel pays accueille le plus de réfugiés ?", format: v => fr(v) + " personnes réfugiées", source: "HCR, fin 2024",
    note: "Réfugiés et autres personnes ayant besoin d'une protection internationale, selon le HCR (les réfugiés palestiniens pris en charge par l'UNRWA ne sont pas comptés). Près des trois quarts d'entre eux vivent dans des pays à revenu faible ou intermédiaire." },
  refugieshab: { theme: "geopolitique", poids: 2, question: "Quel pays accueille le plus de réfugiés par rapport à sa population ?", format: v => fr(v) + " réfugiés pour 1 000 habitants", source: "HCR, fin 2024",
    note: "Réfugiés et autres personnes ayant besoin d'une protection internationale (HCR), rapportés à la population de 2024 (Banque mondiale)." },
  origine: { theme: "geopolitique", poids: 2, question: "De quel pays sont originaires le plus de réfugiés ?", format: v => fr(v) + " personnes réfugiées à l'étranger", source: "HCR, fin 2024",
    note: "Personnes ayant fui ce pays et reconnues comme réfugiées ou ayant besoin d'une protection internationale, fin 2024 (HCR)." },
  femmes: { theme: "geopolitique", poids: 2, question: "Dans quel pays les femmes occupent-elles la plus grande part des sièges au parlement ?", format: v => fr(Math.round(v)) + " % des sièges", source: "Union interparlementaire, via la Banque mondiale" }
};

// options : { niveau, indicateurs (indicateurs déjà posés dans la partie, pour limiter les répétitions) }
function tirerDuelsPays(n, theme = "tout", options = {}) {
  const retenus = Object.keys(INDICATEURS_PAYS).filter(c => theme === "tout" || INDICATEURS_PAYS[c].theme === theme);
  const cles = retenus.flatMap(c => Array(INDICATEURS_PAYS[c].poids).fill(c));
  const plafond = Math.max(2, Math.ceil(n / retenus.length));
  const recents = new Set(lire("vus", {}).pays || []);
  const duels = [];
  const indicateursPris = options.indicateurs || [];
  for (let essai = 0; duels.length < n && essai < 20000; essai++) {
    const cle = cles[Math.floor(Math.random() * cles.length)];
    // Pas plus de deux duels sur le même indicateur dans une partie (un peu plus si le thème en compte peu)
    if (indicateursPris.filter(c => c === cle).length >= plafond) continue;
    const candidats = PAYS.filter(p => p[cle] !== undefined);
    const a = candidats[Math.floor(Math.random() * candidats.length)];
    const b = candidats[Math.floor(Math.random() * candidats.length)];
    if (a === b) continue;
    const id = cle + ":" + [a.id, b.id].sort().join("-");
    if (recents.has(id) || duels.some(d => d.id === id)) continue;
    const [mode, [bas, haut], minimum] = ECARTS_PAYS[cle];
    const va = a[cle], vb = b[cle];
    if (minimum !== undefined && (va < minimum || vb < minimum)) continue;
    const ecart = mode === "ratio" ? Math.max(va, vb) / Math.max(Math.min(va, vb), 1e-9) : Math.abs(va - vb);
    if (ecart < bas || ecart > haut) continue;
    if (options.niveau && niveauDuelPays(cle, va, vb) !== options.niveau) continue;
    indicateursPris.push(cle);
    duels.push({ cle, a, b, id });
  }
  const vus = lire("vus", {});
  vus.pays = [...(vus.pays || []), ...duels.map(d => d.id)].slice(-300);
  ecrire("vus", vus);
  return duels;
}

// Puces de choix du thème : un clic relance une partie sur ce thème
function choixThemePays(zone, actuel) {
  const puces = el("div", "puces puces-theme");
  THEMES_PAYS.forEach(([id, nom]) => {
    const b = el("button", "puce" + (id === actuel ? " active" : ""), nom);
    b.setAttribute("aria-pressed", String(id === actuel));
    b.addEventListener("click", () => {
      ecrire("themePays", id);
      JEUX.find(j => j.id === "pays").lancer(zone);
      remonter();
    });
    puces.appendChild(b);
  });
  return puces;
}

// ===================== Niveaux des ateliers fondés sur des données =====================
// Le niveau se calcule à partir des données : plus l'écart entre les deux réponses est faible,
// plus la question est difficile. t mesure la place de l'écart dans la plage admise (0 = le plus serré).
const tiers = t => t >= 2 / 3 ? 1 : t >= 1 / 3 ? 2 : 3;

// Plus ou moins ? : place de l'écart dans les bornes d'ECARTS_PAYS (rapport sur une échelle logarithmique, ou différence)
function niveauDuelPays(cle, va, vb) {
  const [mode, [bas, haut]] = ECARTS_PAYS[cle];
  const t = mode === "ratio"
    ? Math.log(Math.max(va, vb) / Math.max(Math.min(va, vb), 1e-9) / bas) / Math.log(haut / bas)
    : (Math.abs(va - vb) - bas) / (haut - bas);
  return tiers(t);
}

// Qu'est-ce qui tue le plus ? : rapport entre les deux causes (de 1,6 à 2 000) ; 10 et plus : niveau 1, 3 et plus : niveau 2
const niveauDuelCauses = rapport => rapport >= 10 ? 1 : rapport >= 3 ? 2 : 3;

// Avant ou après ? : écart entre les deux dates, rapporté à l'écart maximal admis pour des dates de cette
// ancienneté (12 ans, ou le quart de l'ancienneté de la plus ancienne)
function niveauPaireChronologie(a, b) {
  const ecart = Math.abs(momentEvenement(a) - momentEvenement(b));
  return tiers(ecart / Math.max(12, 0.25 * (2026 - Math.min(a.annee, b.annee))));
}

// Le nord est où ? : écart de latitude (0,8 à 9°) ou de longitude (0,8 à 14°)
function niveauPaireVilles(a, b, sens) {
  const lat = sens === "nord", max = lat ? 9 : 14;
  return tiers((Math.abs(lat ? VILLES[a][1] - VILLES[b][1] : VILLES[a][2] - VILLES[b][2]) - 0.8) / (max - 0.8));
}

// Les paires célèbres (« Avant ou après ? », « Le nord est où ? ») sont des pièges classiques : niveau 2,
// sauf niveau indiqué dans les données
const niveauPaireCelebre = p => p.niveau || 2;

// ===================== Classements du niveau 3 =====================
// Quatre éléments à ranger ; chaque paire doit être nettement séparée, pour qu'un seul ordre soit défendable.

// Plus ou moins ? : quatre pays sur un indicateur, deux à deux séparés d'au moins la borne basse d'ECARTS_PAYS
function tirerClassementPays(theme) {
  const retenus = Object.keys(INDICATEURS_PAYS).filter(c => theme === "tout" || INDICATEURS_PAYS[c].theme === theme);
  for (let essai = 0; essai < 3000; essai++) {
    const cle = retenus[Math.floor(Math.random() * retenus.length)];
    const [mode, [bas], minimum] = ECARTS_PAYS[cle];
    const quatre = melanger(PAYS.filter(p => p[cle] !== undefined && (minimum === undefined || p[cle] >= minimum))).slice(0, 4);
    const ecart = (a, b) => mode === "ratio" ? Math.max(a, b) / Math.max(Math.min(a, b), 1e-9) : Math.abs(a - b);
    if (quatre.every((a, i) => quatre.slice(i + 1).every(b => ecart(a[cle], b[cle]) >= bas))) return { classement: true, cle, pays: quatre };
  }
  return null;
}

// Le nord est où ? : quatre villes, séparées d'au moins 1,5°, sur moins de 20° de latitude ou 35° de longitude
function tirerClassementVilles() {
  const ids = Object.keys(VILLES);
  for (let essai = 0; essai < 5000; essai++) {
    const sens = Math.random() < 0.5 ? "nord" : "est";
    const quatre = melanger(ids).slice(0, 4);
    const v = quatre.map(id => sens === "nord" ? VILLES[id][1] : VILLES[id][2]).sort((a, b) => a - b);
    if (v.every((x, i) => i === 0 || x - v[i - 1] >= 1.5) && v[3] - v[0] <= (sens === "nord" ? 20 : 35)) return { classement: true, sens, villes: quatre };
  }
  return null;
}

// Avant ou après ? : quatre événements de sujets différents, séparés d'au moins deux ans (sauf dates précises),
// sur une période courte au regard de leur ancienneté
function tirerClassementChronologie() {
  for (let essai = 0; essai < 5000; essai++) {
    const quatre = melanger(EVENEMENTS).slice(0, 4);
    if (quatre.filter(e => e.vers).length > 1) continue;
    const sujets = quatre.map(e => e.sujet).filter(Boolean);
    if (new Set(sujets).size < sujets.length) continue;
    const tries = [...quatre].sort((a, b) => momentEvenement(a) - momentEvenement(b));
    const separes = tries.every((e, i) => i === 0 || (e.date && tries[i - 1].date ? momentEvenement(e) > momentEvenement(tries[i - 1]) : e.annee - tries[i - 1].annee >= 2));
    if (separes && tries[3].annee - tries[0].annee <= Math.max(40, 0.3 * (2026 - tries[0].annee))) return { classement: true, evenements: quatre };
  }
  return null;
}

// Tente un tirage au niveau demandé, puis aux niveaux voisins
function auNiveau(niveau, tirage) {
  for (const n of [niveau, niveau - 1, niveau + 1, niveau - 2, niveau + 2].filter(x => x >= 1 && x <= 3)) {
    const r = tirage(n);
    if (r) return r;
  }
  return null;
}

// Paires d'événements : d'abord les paires célèbres pas encore vues, puis des paires au hasard
// dont l'écart est faible au regard de leur ancienneté (sinon la réponse serait évidente)
const evenement = id => EVENEMENTS.find(e => e.id === id);
const momentEvenement = e => e.date ? Date.parse(e.date + "T12:00:00Z") / (365.25 * 86400000) + 1970 : e.annee + 0.5;

// options : { niveau, sansCelebres, exclus (clés des paires déjà tirées dans la partie) }
function tirerPairesChronologie(n, options = {}) {
  const celebres = options.sansCelebres ? [] : tirerNouveaux("chronologie:celebres", PAIRES_CELEBRES, 3, p => p.a + "|" + p.b)
    .map(p => ({ evenements: melanger([evenement(p.a), evenement(p.b)]), note: p.note }));
  const paires = [...celebres];
  const prises = options.exclus || new Set();
  celebres.forEach(p => prises.add(p.evenements.map(e => e.id).sort().join("|")));
  for (let essai = 0; paires.length < n && essai < 20000; essai++) {
    const a = EVENEMENTS[Math.floor(Math.random() * EVENEMENTS.length)];
    const b = EVENEMENTS[Math.floor(Math.random() * EVENEMENTS.length)];
    if (a === b || (a.vers && b.vers) || (a.sujet && a.sujet === b.sujet)) continue;
    const cle = [a.id, b.id].sort().join("|");
    if (prises.has(cle)) continue;
    const ecart = Math.abs(a.annee - b.annee);
    const anciennete = 2026 - Math.min(a.annee, b.annee);
    if (ecart === 0 && !(a.date && b.date)) continue;
    if (ecart > Math.max(12, 0.25 * anciennete)) continue;
    if (ecart < 2 && !(a.date && b.date)) continue;
    if (options.niveau && niveauPaireChronologie(a, b) !== options.niveau) continue;
    prises.add(cle);
    paires.push({ evenements: melanger([a, b]) });
  }
  return melanger(paires);
}


// Paires de villes : d'abord des paires célèbres, puis des paires au hasard assez proches pour être difficiles
// options : { niveau, sansCelebres, exclus (clés des paires déjà tirées dans la partie) }
function tirerPairesVilles(n, options = {}) {
  const celebres = options.sansCelebres ? [] : tirerNouveaux("nord", PAIRES_VILLES, 4, p => p.a + "|" + p.b + "|" + p.sens)
    .map(p => ({ villes: melanger([p.a, p.b]), sens: p.sens, note: p.note }));
  const ids = Object.keys(VILLES);
  const paires = [...celebres];
  const prises = options.exclus || new Set();
  celebres.forEach(p => prises.add(p.villes.slice().sort().join("|")));
  for (let essai = 0; paires.length < n && essai < 20000; essai++) {
    const a = ids[Math.floor(Math.random() * ids.length)], b = ids[Math.floor(Math.random() * ids.length)];
    const cle = [a, b].sort().join("|");
    if (a === b || prises.has(cle)) continue;
    const sens = Math.random() < 0.6 ? "nord" : "est";
    const ecart = Math.abs(sens === "nord" ? VILLES[a][1] - VILLES[b][1] : VILLES[a][2] - VILLES[b][2]);
    // Assez proches pour hésiter, assez éloignées pour que les coordonnées tranchent sans ambiguïté
    if (ecart < 0.8 || ecart > (sens === "nord" ? 9 : 14)) continue;
    if (options.niveau && niveauPaireVilles(a, b, sens) !== options.niveau) continue;
    prises.add(cle);
    paires.push({ villes: [a, b], sens });
  }
  return melanger(paires);
}

// Une question de « Le nord est où ? » au niveau demandé : une sur trois est une paire célèbre
function tirerPaireVillesNiveau(niveau, i, exclus) {
  if (i % 3 === 0) {
    const libres = PAIRES_VILLES.filter(p => !exclus.has([p.a, p.b].sort().join("|")));
    const p = tirerSelonNiveau("nord", libres, 1, niveau, x => x.a + "|" + x.b + "|" + x.sens, niveauPaireCelebre)[0];
    if (p) {
      exclus.add([p.a, p.b].sort().join("|"));
      return { villes: melanger([p.a, p.b]), sens: p.sens, note: p.note };
    }
  }
  return auNiveau(niveau, n => tirerPairesVilles(1, { niveau: n, sansCelebres: true, exclus })[0]);
}

// Une question de « Avant ou après ? » au niveau demandé : une sur trois est une paire célèbre
function tirerPaireChronologieNiveau(niveau, i, exclus) {
  if (i % 3 === 0) {
    const libres = PAIRES_CELEBRES.filter(p => !exclus.has([p.a, p.b].sort().join("|")));
    const p = tirerSelonNiveau("chronologie:celebres", libres, 1, niveau, x => x.a + "|" + x.b, niveauPaireCelebre)[0];
    if (p) {
      exclus.add([p.a, p.b].sort().join("|"));
      return { evenements: melanger([evenement(p.a), evenement(p.b)]), note: p.note };
    }
  }
  return auNiveau(niveau, n => tirerPairesChronologie(1, { niveau: n, sansCelebres: true, exclus })[0]);
}

// « 41,9° N, 12,5° E »
function coordonnees(v) {
  const [, lat, lon] = VILLES[v];
  return fr(Math.abs(lat)) + "° " + (lat >= 0 ? "N" : "S") + ", " + fr(Math.abs(lon)) + "° " + (lon >= 0 ? "E" : "O");
}

// Planisphère schématique : méridiens et parallèles tous les 30°, et les deux villes
// numeros : les points portent leur rang (1, 2…) au lieu du nom, pour quatre villes parfois très proches
function planisphere(villes, sens, numeros) {
  const s = svg("svg", { viewBox: "0 0 320 170", class: "planisphere", role: "img", "aria-label": numeros ? "Position des villes sur un planisphère, numérotées dans l'ordre" : "Position des deux villes sur un planisphère" });
  const x = lon => 10 + 300 * (lon + 180) / 360, y = lat => 10 + 150 * (90 - lat) / 180;
  s.appendChild(svg("rect", { x: 10, y: 10, width: 300, height: 150, class: "graphe-fond" }));
  for (let lon = -150; lon <= 150; lon += 30) s.appendChild(svg("line", { x1: x(lon), y1: 10, x2: x(lon), y2: 160, class: "graphe-grille" }));
  for (let lat = -60; lat <= 60; lat += 30) s.appendChild(svg("line", { x1: 10, y1: y(lat), x2: 310, y2: y(lat), class: lat === 0 ? "equateur" : "graphe-grille" }));
  s.appendChild(texteSvg(306, y(0) - 3, "équateur", { class: "sch-petit", "text-anchor": "end" }));
  const points = villes.map((v, k) => ({ nom: numeros ? String(k + 1) : VILLES[v][0], px: x(VILLES[v][2]), py: y(VILLES[v][1]) }));
  villes.forEach((v, k) => {
    const [, lat, lon] = VILLES[v];
    // Ligne de repère : le parallèle (nord) ou le méridien (est) de chaque ville
    if (sens === "nord") s.appendChild(svg("line", { x1: 10, y1: y(lat), x2: 310, y2: y(lat), class: k === 0 ? "repere-a" : "repere-b" }));
    else s.appendChild(svg("line", { x1: x(lon), y1: 10, x2: x(lon), y2: 160, class: k === 0 ? "repere-a" : "repere-b" }));
    s.appendChild(svg("circle", { cx: x(lon), cy: y(lat), r: 4.5, class: k === 0 ? "ville-a" : "ville-b" }));
  });
  placerEtiquettes(points, [[306 - 44, y(0) - 13, 306, y(0) - 1]])
    .forEach(e => s.appendChild(texteSvg(e.x, e.y, e.nom, { class: "sch-texte sch-gras", "text-anchor": e.ancre })));
  return s;
}

// Étiquettes des villes du planisphère : la ville la plus au nord porte la sienne au-dessus, l'autre en dessous.
// La largeur du texte est estimée (le dessin n'est pas encore affiché, getBBox() est indisponible) ;
// on essaie plusieurs positions jusqu'à n'en toucher ni l'autre étiquette, ni un point, ni le bord, ni « obstacles ».
function placerEtiquettes(points, obstacles) {
  const largeur = nom => 7.2 * nom.length;          // gras, 12 px : 7,2 unités par caractère, avec marge
  const seCoupent = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const ordre = [...points].sort((a, b) => a.py - b.py);   // du nord au sud
  const places = [];
  ordre.forEach((p, k) => {
    const autres = points.filter(q => q !== p).map(q => [q.px - 6, q.py - 6, q.px + 6, q.py + 6]);
    const w = largeur(p.nom);
    const dessus = k === 0;
    const droite = p.px < 230;
    const candidats = [];
    [dessus, !dessus].forEach(haut => [droite, !droite].forEach(adr => [0, 10, 20].forEach(d => candidats.push({ haut, adr, d }))));
    const choix = candidats.map(c => {
      const ty = c.haut ? p.py - 7 - c.d : p.py + 15 + c.d;
      const tx = c.adr ? p.px + 6 : p.px - 6;
      const boite = [c.adr ? tx : tx - w, ty - 10, c.adr ? tx + w : tx, ty + 3];
      return { nom: p.nom, x: tx, y: ty, ancre: c.adr ? "start" : "end", boite };
    }).find(c => c.boite[0] >= 2 && c.boite[2] <= 318 && c.boite[1] >= 2 && c.boite[3] <= 168
      && ![...autres, ...obstacles, ...places.map(e => e.boite)].some(o => seCoupent(c.boite, o)));
    places.push(choix || { nom: p.nom, x: p.px + 6, y: dessus ? p.py - 7 : p.py + 15, ancre: "start", boite: [0, 0, 0, 0] });
  });
  return places;
}

// ===================== Illustrations des jeux =====================

// Libellé d'une date : « 1876 », « vers 2560 av. J.-C. », « 31 mars 1889 »
function dateEvenement(e) {
  if (e.date) {
    const d = new Date(e.date + "T12:00:00");
    const jour = d.getDate() === 1 ? "1er" : String(d.getDate());
    return jour + " " + d.toLocaleDateString("fr-FR", { month: "long" }) + " " + d.getFullYear();
  }
  return (e.vers ? "vers " : "") + (e.annee < 0 ? -e.annee + " av. J.-C." : String(e.annee));
}

// Frise : deux événements placés à leur date, le plus ancien à gauche
function frise(a, b) {
  const [p, q] = momentEvenement(a) <= momentEvenement(b) ? [a, b] : [b, a];
  const bloc = el("div", "frise");
  const s = svg("svg", { viewBox: "0 0 320 56", class: "frise-svg", role: "img", "aria-label": "Frise chronologique" });
  s.appendChild(svg("line", { x1: 8, y1: 28, x2: 312, y2: 28, class: "sch-trait" }));
  s.appendChild(svg("path", { d: "M306 23l6 5-6 5", class: "sch-trait" }));
  // Date de gauche alignée sur le bord gauche, date de droite sur le bord droit : les plus longues
  // (« 23 septembre 1889 », « vers 2560 av. J.-C. ») ne sont jamais coupées
  [[p, 40, 4, "start"], [q, 280, 316, "end"]].forEach(([e, x, xTexte, ancre], k) => {
    s.appendChild(svg("circle", { cx: x, cy: 28, r: 7, class: k === 0 ? "sch-c" : "sch-clair-fort" }));
    s.appendChild(texteSvg(xTexte, 14, dateEvenement(e), { class: "sch-texte sch-gras", "text-anchor": ancre }));
  });
  bloc.appendChild(s);
  const liste = el("ol", "frise-liste");
  [p, q].forEach(e => liste.appendChild(el("li", null, dateEvenement(e) + " — " + e.nom)));
  bloc.appendChild(liste);
  return bloc;
}

// Méthode de Fermi : le joueur estime chaque facteur ; on compare le produit à la vraie valeur (mêmes points
// qu'une estimation directe : 3 points à moins d'un facteur 2, 2 à moins de 3, 1 à moins de 10)
function afficherFermi(f, zone, fini) {
  const q = GRANDEURS.find(g => g.id === f.id);
  zone.appendChild(el("p", "consigne", "Méthode de Fermi : décomposez avant d'estimer"));
  zone.appendChild(el("p", "cas", q.q));
  zone.appendChild(paragraphe("Estimez chaque facteur ; le site fera le calcul." + (f.facteurs.some(x => x[3]) ? " Les facteurs marqués « ÷ » divisent le résultat." : ""), "source"));
  const champs = f.facteurs.map(([libelle, , , diviser]) => {
    const ligne = el("div", "ligne ligne-fermi");
    const champ = el("input", "champ");
    champ.inputMode = "decimal";
    champ.setAttribute("aria-label", libelle);
    ligne.append(el("span", "facteur-fermi", (diviser ? "÷ " : "× ") + libelle), champ);
    zone.appendChild(ligne);
    return champ;
  });
  const valider = el("button", "bouton large", "Calculer");
  valider.dataset.valider = "1";
  zone.appendChild(valider);
  valider.addEventListener("click", () => {
    const valeurs = champs.map(c => lireNombre(c.value));
    const vide = champs.find((c, k) => isNaN(valeurs[k]) || valeurs[k] <= 0);
    if (vide) { vide.focus(); return; }
    champs.forEach(c => { c.disabled = true; });
    valider.remove();
    const produit = valeurs.reduce((t, v, k) => f.facteurs[k][3] ? t / v : t * v, 1);
    const ecart = Math.abs(Math.log10(produit) - Math.log10(q.v));
    const points = ecart <= Math.log10(2) ? 3 : ecart <= Math.log10(3) ? 2 : ecart <= 1 ? 1 : 0;
    const retour = el("div", "retour-quiz");
    retour.appendChild(el("p", "verdict " + (points >= 2 ? "juste" : "faux"), "Votre produit : environ " + enClair(produit, 2) + " ; la réponse : environ " + enClair(q.v, 3) + "."));
    const liste = el("ul", "liste-simple");
    f.facteurs.forEach(([libelle, vrai, source], k) => liste.appendChild(el("li", null, libelle + " : vous, " + fr(Number(valeurs[k].toPrecision(3))) + " ; en réalité, " + fr(vrai) + " (" + source + ")")));
    retour.append(el("p", "consigne", "Facteur par facteur"), liste);
    retour.appendChild(paragraphe(points === 3 ? "3 points : moins d'un facteur 2 d'écart." : points === 2 ? "2 points : moins d'un facteur 3." : points === 1 ? "1 point : moins d'un facteur 10." : "Aucun point : plus d'un facteur 10 d'écart.", "source"));
    retour.appendChild(paragraphe("Décomposer une grandeur inconnue en facteurs que l'on connaît mieux limite les erreurs : celles des facteurs se compensent souvent. Enrico Fermi était célèbre pour ces estimations rapides.", "source"));
    zone.appendChild(retour);
    fini(points, retour);
  });
}

// Échelle logarithmique de 10^debut à 10^fin, graduée à chaque puissance de dix
function echelleLog(debut, fin) {
  const echelle = el("div", "echelle-log");
  for (let e = debut; e <= fin; e++) {
    // Une graduation sur deux est étiquetée ; sur un écran très étroit, une sur quatre (classe « secondaire »)
    const g = el("span", "graduation" + ((e - debut) % 2 === 0 ? " etiquetee" : "") + ((e - debut) % 4 === 2 ? " secondaire" : ""));
    g.style.left = (100 * (e - debut) / (fin - debut)) + "%";
    if ((e - debut) % 2 === 0) g.dataset.texte = typo(etiquettePuissance(e));
    echelle.appendChild(g);
  }
  return echelle;
}

// Étiquette courte d'une puissance de dix : 1, 10, 100, 1 000, 10 k, 100 k, 1 M, 10 M, 100 M, puis 10⁹, 10¹⁰…
function etiquettePuissance(e) {
  if (e < 4) return fr(Math.pow(10, e));
  if (e < 6) return fr(Math.pow(10, e - 3)) + " k";
  if (e < 9) return fr(Math.pow(10, e - 6)) + " M";
  return "10" + exposant(e);
}

// Points du barème logarithmique : +100·(1 + log2 p) si juste, +100·(1 + log2 (1 − p)) sinon
function pointsConfiance(niveau, juste) {
  const p = niveau / 100;
  return Math.round(100 * (1 + Math.log2(juste ? p : 1 - p)));
}

// Courbe d'étalonnage : pour chaque niveau de confiance, la part de réponses justes
function courbeEtalonnage(cumul, partie) {
  const s = svg("svg", { viewBox: "0 0 320 236", class: "graphe", role: "img", "aria-label": "Courbe d'étalonnage" });
  const x = c => 46 + 250 * (c - 50) / 50;          // confiance de 50 à 100 %
  const y = r => 200 - 180 * r / 100;                // réussite de 0 à 100 %
  s.appendChild(svg("rect", { x: 46, y: 20, width: 250, height: 180, class: "graphe-fond" }));
  [0, 25, 50, 75, 100].forEach(r => {
    s.appendChild(svg("line", { x1: 46, y1: y(r), x2: 296, y2: y(r), class: "graphe-grille" }));
    s.appendChild(texteSvg(40, y(r) + 3, r + " %", { class: "graphe-texte", "text-anchor": "end" }));
  });
  NIVEAUX_CONFIANCE.forEach(c => {
    s.appendChild(svg("line", { x1: x(c), y1: 20, x2: x(c), y2: 200, class: "graphe-grille" }));
    s.appendChild(texteSvg(x(c), 214, c + " %", { class: "graphe-texte", "text-anchor": "middle" }));
  });
  s.appendChild(svg("line", { x1: x(50), y1: y(50), x2: x(100), y2: y(100), class: "graphe-diagonale" }));
  s.appendChild(texteSvg(171, 228, "Certitude annoncée", { class: "graphe-texte", "text-anchor": "middle" }));
  const tracer = (stats, classe) => {
    const pts = NIVEAUX_CONFIANCE.filter(c => stats[c] && stats[c][0]).map(c => [c, 100 * stats[c][1] / stats[c][0], stats[c][0]]);
    if (pts.length > 1) s.appendChild(svg("polyline", { points: pts.map(([c, r]) => x(c) + "," + y(r)).join(" "), class: classe + "-ligne" }));
    pts.forEach(([c, r, n]) => s.appendChild(svg("circle", { cx: x(c), cy: y(r), r: Math.min(9, 3 + Math.sqrt(n)), class: classe })));
  };
  tracer(cumul, "graphe-point");
  if (partie) tracer(partie, "graphe-point-partie");
  return s;
}

// Ligne graphique d'un intervalle : fourchette de l'utilisateur et vraie valeur
// Score de fourchette (« interval score », Gneiting et Raftery, 2007), règle de score propre : pour une fourchette
// [b, h] au niveau 1 − α et une vraie valeur v, coût = (h − b) + (2/α) × (b − v) si v < b, + (2/α) × (v − h) si v > h.
// À 90 %, α = 0,1 et 2/α = 20 ; à 50 %, 2/α = 4. Une fourchette étroite et juste coûte peu, une fourchette fausse cher.
// Les quantités s'étendent sur plusieurs ordres de grandeur : on mesure en log₁₀ (un facteur 10 vaut 1). Les années
// se mesurent en siècles (un siècle vaut 1), pour qu'une erreur de date pèse comme une erreur d'ordre de grandeur.
const estAnnee = q => q.unite === "" && q.v >= 1000 && q.v <= 2100;
function echelleFourchette(q) {
  return estAnnee(q) ? x => x / 100 : x => Math.log10(Math.max(x, Math.abs(q.v) / 1e6));
}
function scoreFourchette(q, bas, haut, alpha) {
  const t = echelleFourchette(q), b = t(bas), h = t(haut), v = t(q.v);
  return (h - b) + (2 / alpha) * Math.max(0, b - v) + (2 / alpha) * Math.max(0, v - h);
}

function ligneIntervalle(q, bas, haut, ok) {
  const ligne = el("div", "barre-ligne");
  ligne.appendChild(el("div", "barre-nom", q.q + " : " + fr(q.v) + (q.unite ? " " + q.unite : "") + (q.note ? " (" + q.note + ")" : "")));
  const min = Math.min(bas, q.v), max = Math.max(haut, q.v);
  const marge = (max - min) * 0.15 || Math.abs(q.v) * 0.1 || 1;
  const debut = min - marge, fin = max + marge;
  const pos = v => 100 * (v - debut) / (fin - debut);
  const fond = el("div", "intervalle");
  const plage = el("div", "intervalle-plage");
  plage.style.left = pos(bas) + "%";
  plage.style.width = Math.max(0.8, pos(haut) - pos(bas)) + "%";
  const point = el("div", "intervalle-point " + (ok ? "dedans" : "dehors"));
  point.style.left = pos(q.v) + "%";
  fond.append(plage, point);
  ligne.appendChild(fond);
  ligne.appendChild(el("div", "barre-source", "Votre fourchette : " + fr(bas) + " à " + fr(haut)));
  return ligne;
}

// ===================== Combien de points ? =====================

// Niveaux (d'une partie à l'autre) : 1, de 18 à 75 points ; 2, de 40 à 190 ; 3, de 100 à 300 points, plus serrés,
// affichés 1 seconde au lieu de 1,5. Si l'appareil demande de réduire les animations, l'affichage reste de 1,5 seconde.
const NOMBRES_POINTS = { 1: [18, 22, 27, 33, 40, 48, 60, 75], 2: [40, 55, 75, 90, 100, 120, 140, 190], 3: [100, 120, 140, 165, 190, 220, 260, 300] };
function partiePoints(zone, avecRepere) {
  const niveau = niveauAtelier("points").niveau;
  const nombres = melanger(NOMBRES_POINTS[niveau]).map(n => n + Math.floor(Math.random() * 8));
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duree = niveau === 3 && !reduit ? 1000 : 1500;
  const ecartMinimal = niveau === 3 ? 36 : 81;   // carré de la distance minimale entre deux points
  const essais = [];
  let i = 0;

  function nuage(n) {
    const s = svg("svg", { viewBox: "0 0 300 300", class: "nuage", role: "img", "aria-label": "Nuage de points" });
    const points = [];
    let tentatives = 0;
    while (points.length < n && tentatives < 20000) {
      tentatives++;
      const x = 8 + Math.random() * 284, y = 8 + Math.random() * 284;
      if (points.every(([a, b]) => (a - x) ** 2 + (b - y) ** 2 > ecartMinimal)) points.push([x, y]);
    }
    points.forEach(([x, y]) => s.appendChild(svg("circle", { cx: x, cy: y, r: 3.5 })));
    return s;
  }

  function repere() {
    zone.innerHTML = "";
    zone.appendChild(choixNiveau("points", () => JEUX.find(j => j.id === "points").lancer(zone)));
    zone.appendChild(el("p", "consigne", "Repère : ce nuage contient 30 points"));
    zone.appendChild(nuage(30));
    const ok = el("button", "bouton large", "Commencer les estimations");
    ok.dataset.suivant = "1";
    zone.appendChild(ok);
    ok.addEventListener("click", essai);
  }

  function essai() {
    zone.innerHTML = "";
    if (i >= nombres.length) return bilan();
    entete(zone, i + 1, nombres.length, "Nuage");
    const n = nombres[i];
    const cadre = el("div", "cadre-nuage");
    cadre.appendChild(nuage(n));
    zone.appendChild(cadre);
    setTimeout(() => {
      cadre.innerHTML = "";
      cadre.appendChild(el("p", "cas", "Combien de points ?"));
      const ligne = el("div", "ligne");
      const champ = el("input", "champ");
      champ.inputMode = "numeric";
      champ.setAttribute("aria-label", "Nombre de points");
      const ok = el("button", "bouton", "Valider");
      ok.dataset.valider = "1";
      ligne.append(champ, ok);
      cadre.appendChild(ligne);
      champ.focus();
      ok.addEventListener("click", () => {
        const v = lireNombre(champ.value);
        if (isNaN(v) || v <= 0) { champ.focus(); return; }
        essais.push([n, v]);
        i++;
        essai();
      });
    }, duree);
  }

  function bilan() {
    const rapport = moyenneGeometrique(essais.map(([n, v]) => v / n));
    const pct = Math.round((rapport - 1) * 100);
    ecrire("points", { rapport, avecRepere });
    // Pour l'ajustement du niveau : une estimation compte comme juste à moins de 25 % d'écart
    noterPartieEntiere("points", niveau, essais.map(([n, v]) => Math.abs(v / n - 1) <= 0.25));
    delete PARTIES_EN_COURS.points;
    noterPartie("points");
    zone.appendChild(el("p", "consigne", "Résultat"));
    zone.appendChild(el("p", "grand-score", (pct >= 0 ? "+" : "") + pct + " %"));
    zone.appendChild(paragraphe("En moyenne, vos estimations étaient " + (Math.abs(pct) < 5 ? "très proches des vraies valeurs." : pct < 0 ? "inférieures de " + (-pct) + " % aux vraies valeurs." : "supérieures de " + pct + " % aux vraies valeurs.")));

    // Nuage de points (échelle logarithmique) : vraie valeur en abscisse, estimation en ordonnée
    const s = svg("svg", { viewBox: "0 0 320 320", class: "graphe", role: "img", "aria-label": "Vos estimations comparées aux vraies valeurs" });
    const echelle = v => 30 + 270 * (Math.log(v) - Math.log(10)) / (Math.log(400) - Math.log(10));
    s.appendChild(svg("rect", { x: 30, y: 20, width: 270, height: 270, class: "graphe-fond" }));
    [10, 20, 50, 100, 200, 400].forEach(v => {
      const p = echelle(v);
      s.appendChild(svg("line", { x1: p, y1: 20, x2: p, y2: 290, class: "graphe-grille" }));
      s.appendChild(svg("line", { x1: 30, y1: 320 - p, x2: 300, y2: 320 - p, class: "graphe-grille" }));
      s.appendChild(texteSvg(p, 306, String(v), { class: "graphe-texte", "text-anchor": "middle" }));
      s.appendChild(texteSvg(25, 324 - p, String(v), { class: "graphe-texte", "text-anchor": "end" }));
    });
    s.appendChild(svg("line", { x1: 30, y1: 290, x2: 300, y2: 20, class: "graphe-diagonale" }));
    essais.forEach(([n, v]) => {
      const y = Math.min(400, Math.max(10, v));
      s.appendChild(svg("circle", { cx: echelle(n), cy: 320 - echelle(y), r: 5, class: "graphe-point" }));
    });
    zone.appendChild(s);
    zone.appendChild(paragraphe("Abscisse : nombre réel de points. Ordonnée : votre estimation. Échelles logarithmiques. Sur la diagonale, l'estimation est exacte ; en dessous, elle est trop basse.", "source"));

    ajouterExplication(zone, "Ce que montre ce jeu", [
      "Sans repère, la plupart des adultes sous-estiment les quantités de points qu'ils voient : leurs estimations augmentent avec le nombre réel, mais restent en dessous (Izard et Dehaene, 2008, et les études qu'ils citent).",
      "Dans leur expérience, il suffisait de montrer une seule fois un nuage en annonçant « 30 points » pour corriger les estimations sur toute la gamme des quantités. Notre perception des quantités est relative : elle a besoin d'un étalon.",
      "C'est l'une des raisons pour lesquelles les grands nombres (foules, budgets, victimes) sont si mal perçus sans point de comparaison."
    ], [["#biais/ancrage", "Effet d'ancrage"]]);
    const actions = el("div", "actions");
    const encore = el("button", "bouton", "Recommencer");
    encore.dataset.suivant = "1";
    encore.addEventListener("click", () => partiePoints(zone, false));
    const avec = el("button", "bouton secondaire", "Avec un repère");
    avec.addEventListener("click", () => partiePoints(zone, true));
    actions.append(encore, avec);
    zone.appendChild(actions);
  }

  if (avecRepere) repere(); else essai();
}

// ===================== Affichage =====================

// Affiche le jeu demandé (#chiffres/monde…)
function afficherChiffres(conteneur, id) {
  const jeu = JEUX.find(j => j.id === id);
  const faits = lire("jeuxFaits", []);
  if (!faits.includes(jeu.id)) ecrire("jeuxFaits", [...faits, jeu.id]);
  ouvrirAtelier(conteneur, jeu);
}
