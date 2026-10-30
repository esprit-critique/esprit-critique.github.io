// pratiques.js : ateliers du lot 5. Les avions de Wald, La foule intérieure, Fabriquer un résultat, La cécité au choix,
// et d'autres ajoutés ensuite. Situations, études et personnages sont fictifs ; les études citées dans les bilans
// sont réelles et vérifiées.

PICTOS.avion = '<path d="M24 4c2 0 3 2 3 5v9l15 8v4l-15-4v9l5 4v3l-8-2-8 2v-3l5-4v-9L6 30v-4l15-8V9c0-3 1-5 3-5z" class="fond"/><path d="M24 4c2 0 3 2 3 5v9l15 8v4l-15-4v9l5 4v3l-8-2-8 2v-3l5-4v-9L6 30v-4l15-8V9c0-3 1-5 3-5z"/><circle cx="14" cy="25" r="1.6" class="plein"/><circle cx="33" cy="24" r="1.6" class="plein"/><circle cx="24" cy="33" r="1.6" class="plein"/>';

// ===================== Outils statistiques =====================

// Logarithme de la fonction gamma (approximation de Lanczos, g = 7, 9 coefficients)
function logGamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Fonction bêta incomplète régularisée I_x(a, b), par fraction continue (méthode de Lentz)
function betaIncomplete(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const facteur = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x > (a + 1) / (a + b + 2)) return 1 - betaIncomplete(1 - x, b, a);
  let f = 1, c = 1, d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  f = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let num = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
    c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    f *= d * c;
    num = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
    c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    const delta = d * c;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-12) break;
  }
  return facteur * f / a;
}

// Test t de Student pour deux échantillons indépendants (variances supposées égales) : valeur p bilatérale
function testT(a, b) {
  const moy = t => t.reduce((s, x) => s + x, 0) / t.length;
  const ma = moy(a), mb = moy(b);
  const ss = (t, m) => t.reduce((s, x) => s + (x - m) ** 2, 0);
  const ddl = a.length + b.length - 2;
  const variance = (ss(a, ma) + ss(b, mb)) / ddl;
  const t = (ma - mb) / Math.sqrt(variance * (1 / a.length + 1 / b.length));
  return { t, ddl, p: betaIncomplete(ddl / (ddl + t * t), ddl / 2, 0.5), ecart: ma - mb };
}

// ===================== Les avions de Wald =====================
const SURVIVANTS = [
  { texte: "Les immeubles anciens du centre-ville sont solides : la plupart ont plus de cent ans et tiennent toujours debout.",
    options: ["On construisait mieux autrefois", "Les immeubles fragiles de la même époque ont été démolis ou se sont effondrés : on ne voit que ceux qui ont tenu", "Les matériaux anciens durcissent avec le temps"], juste: 1,
    explication: "Les immeubles qu'on peut observer aujourd'hui sont ceux qui ont résisté. Les autres, peut-être nombreux, ont disparu et ne comptent plus dans l'impression d'ensemble." },
  { texte: "Les chansons des années 1980 qu'on entend encore à la radio sont presque toutes excellentes. La musique était meilleure à l'époque.",
    options: ["Les radios ne rediffusent que les chansons qui ont plu ; les chansons oubliées de la même époque, bien plus nombreuses, n'y passent plus", "Les musiciens des années 1980 étaient plus doués", "Les goûts musicaux ne changent pas"], juste: 0,
    explication: "On compare les meilleures chansons d'hier, filtrées par le temps, à toute la production d'aujourd'hui, pas encore filtrée." },
  { texte: "Une salle de sport interroge ses clients inscrits depuis plus de deux ans : 90 % se disent satisfaits. Elle en conclut que presque tous ses clients sont satisfaits.",
    options: ["90 %, c'est une large majorité", "Les clients mécontents sont partis avant deux ans : l'enquête n'interroge que ceux qui sont restés", "Les clients mentent dans les enquêtes"], juste: 1,
    explication: "En n'interrogeant que les clients restés, l'enquête écarte ceux qui avaient le plus de raisons d'être insatisfaits." },
  { texte: "Tous les champions d'échecs interrogés par un magazine jouaient déjà enfant. Le magazine en conclut que commencer tôt suffit pour devenir champion.",
    options: ["Les échecs demandent des années d'entraînement", "Le magazine n'a pas interrogé les nombreux joueurs qui ont commencé enfant sans devenir champions", "Les champions se souviennent mal de leur enfance"], juste: 1,
    explication: "Pour savoir si commencer tôt suffit, il faudrait regarder tous ceux qui ont commencé tôt, et pas seulement ceux qui ont réussi." }
];

// ===================== Fabriquer un résultat =====================
const MESURES_TISANE = [["sommeil", "la qualité du sommeil"], ["stress", "le niveau de stress"], ["humeur", "l'humeur"]];
// Un participant : sexe tiré au hasard, et trois mesures sans aucun effet de la tisane (loi normale centrée réduite)
const participantTisane = () => ({ femme: Math.random() < 0.5, sommeil: gauss(), stress: gauss(), humeur: gauss() });

// Analyse avec les choix du chercheur : mesure, sous-groupe, retrait des valeurs extrêmes (au-delà de 2 écarts-types)
function analyseTisane(donnees, choix) {
  const garder = p => choix.groupe === "tous" || (choix.groupe === "femmes") === p.femme;
  let a = donnees.tisane.filter(garder).map(p => p[choix.mesure]);
  let b = donnees.temoin.filter(garder).map(p => p[choix.mesure]);
  if (choix.extremes) { a = a.filter(x => Math.abs(x) <= 2); b = b.filter(x => Math.abs(x) <= 2); }
  if (a.length < 3 || b.length < 3) return null;
  return testT(a, b);
}

// Part des études « significatives » quand un chercheur essaie toutes ces options sur des données sans effet :
// 3 mesures × 3 sous-groupes × avec ou sans valeurs extrêmes, puis, faute de résultat, 10 participants de plus par groupe
function simulerChercheurs(n = 1000) {
  let significatives = 0;
  for (let k = 0; k < n; k++) {
    const d = { tisane: Array.from({ length: 20 }, participantTisane), temoin: Array.from({ length: 20 }, participantTisane) };
    const essayer = () => MESURES_TISANE.some(([m]) => ["tous", "femmes", "hommes"].some(g => [false, true].some(e => {
      const r = analyseTisane(d, { mesure: m, groupe: g, extremes: e });
      return r && r.p < 0.05;
    })));
    let trouve = essayer();
    if (!trouve) {
      for (let j = 0; j < 10; j++) { d.tisane.push(participantTisane()); d.temoin.push(participantTisane()); }
      trouve = essayer();
    }
    if (trouve) significatives++;
  }
  return significatives / n;
}

// ===================== La cécité au choix =====================
const AFFIRMATIONS_CECITE = [
  "Le petit-déjeuner est le repas le plus important de la journée.",
  "Un livre papier vaut mieux qu'un livre numérique.",
  "Les vacances à la montagne valent mieux que les vacances à la mer.",
  "Le café est meilleur que le thé.",
  "Il vaut mieux se lever tôt, même le week-end.",
  "Un film en version originale vaut mieux qu'un film doublé.",
  "Il vaut mieux vivre en ville qu'à la campagne.",
  "Avoir un animal de compagnie rend plus heureux.",
  "Il faut ranger sa maison tous les jours.",
  "Les jeux de société sont plus amusants en famille qu'entre amis.",
  "Il vaut mieux voyager en train qu'en avion quand c'est possible.",
  "La musique est plus agréable en concert qu'enregistrée."
];

// Échelle d'accord de 1 à 9, en boutons sur une ligne
function echelleNeuf(surChoix) {
  const bloc = el("div", "echelle-sept echelle-neuf");
  const rangee = el("div", "echelle-sept-boutons");
  const boutons = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
    const b = el("button", "choix", String(n));
    b.setAttribute("aria-label", n + " sur 9");
    b.addEventListener("click", () => { boutons.forEach(x => { x.disabled = true; }); b.classList.add("choisi"); surChoix(n); });
    rangee.appendChild(b);
    return b;
  });
  const bornes = el("div", "echelle-sept-bornes");
  bornes.append(el("span", null, "Pas du tout d'accord"), el("span", null, "Tout à fait d'accord"));
  bloc.append(rangee, bornes);
  return bloc;
}
const sensAccord = n => n <= 3 ? "plutôt pas d'accord" : n >= 7 ? "plutôt d'accord" : "partagé";

// ===================== Ateliers =====================

EXPERIENCES.push(
  // ---------------------------------------------------------------
  {
    id: "wald",
    section: "raisonner",
    picto: "avion",
    couleur: "#44546a",
    duree: "3 min",
    titre: "Les avions de Wald",
    resume: "Les avions qui reviennent de mission sont criblés d'impacts. Où renforcer le blindage ? Puis quatre autres situations où l'on ne voit que les survivants.",
    lancer(zone) {
      const etapes = [{ wald: true }, ...melanger(SURVIVANTS)];
      derouler(zone, etapes, (e, zone, fini) => {
        let q = e;   // la question posée : celle de Wald, ou une situation de SURVIVANTS
        if (e.wald) {
          zone.appendChild(el("p", "cas", "Pendant la Seconde Guerre mondiale, on relève les impacts de balles sur les bombardiers qui rentrent de mission. Ils sont nombreux sur les ailes et le fuselage, rares sur les moteurs et le poste de pilotage. Où faut-il renforcer le blindage ?"));
          const schema = SCHEMAS["biais:survivant"]();
          const figure = el("figure", "figure-piege");
          figure.appendChild(schema.svg);
          figure.appendChild(el("figcaption", null, "Schéma illustratif : les impacts relevés sur les avions revenus."));
          zone.appendChild(figure);
          q = { options: ["Sur les ailes et le fuselage, là où les impacts sont nombreux", "Sur les moteurs et le poste de pilotage, là où les impacts sont rares", "Partout de la même façon"], juste: 1,
            explication: "Les avions observés sont ceux qui sont revenus. S'ils portent peu d'impacts sur les moteurs, c'est que les avions touchés là ne sont pas revenus : c'est là qu'il faut blinder. Les impacts visibles montrent au contraire les endroits où un avion peut être touché et rentrer quand même." };
        } else zone.appendChild(el("p", "cas", e.texte));
        zone.appendChild(el("p", "consigne", e.wald ? "Votre choix" : "Qu'est-ce qui explique le mieux cette impression ?"));
        const boutons = q.options.map((t, k) => {
          const b = boutonChoix(t, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[q.juste].classList.add("juste");
            if (k !== q.juste) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.append(el("p", "verdict " + (k === q.juste ? "juste" : "faux"), k === q.juste ? "Juste." : "Réponse : " + q.options[q.juste].charAt(0).toLowerCase() + q.options[q.juste].slice(1) + "."), paragraphe(q.explication));
            zone.appendChild(retour);
            fini(k === q.juste, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        afficherScore(zone, "wald", resultats.filter(Boolean).length, resultats.length);
        ajouterExplication(zone, "Ce qu'on ne voit pas", [
          "Le biais du survivant consiste à tirer des conclusions des seuls cas qui ont franchi un filtre (les avions revenus, les entreprises qui ont réussi, les immeubles encore debout), en oubliant ceux que le filtre a éliminés.",
          "L'histoire des avions est attribuée au statisticien Abraham Wald, qui travaillait pour l'armée américaine. L'idée est fondée, mais l'anecdote a été enjolivée : ses mémorandums ne font aucune recommandation de blindage, et aucun croquis d'avion de sa main n'est connu (Feature Column de l'American Mathematical Society, 2016)."
        ], [["#biais/survivant", "Biais du survivant"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "wald").lancer(zone));
      }, "Situation");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "fabriquer",
    section: "raisonner",
    picto: "graphique",
    couleur: "#b8741a",
    duree: "5 min",
    titre: "Fabriquer un résultat",
    resume: "Une tisane sans aucun effet, quarante participants. Changez de mesure, de sous-groupe, retirez des valeurs, ajoutez des participants… jusqu'à obtenir un résultat « significatif ».",
    lancer(zone) {
      zone.innerHTML = "";
      const donnees = { tisane: Array.from({ length: 20 }, participantTisane), temoin: Array.from({ length: 20 }, participantTisane) };
      const choix = { mesure: "sommeil", groupe: "tous", extremes: false };
      let ajouts = 0, analyses = 0;
      const essais = new Set();
      zone.appendChild(paragraphe("Vous êtes chercheur. Vingt participants ont bu une tisane, vingt autres de l'eau chaude. Les données sont simulées : la tisane n'a aucun effet, sur rien. Votre but, pourtant : un résultat « significatif », c'est-à-dire p < 0,05."));
      const controles = el("div", "controles-tisane");
      const resultat = el("div", "resultat-tisane");
      resultat.setAttribute("aria-live", "polite");
      zone.append(controles, resultat);
      const puces = (titre, valeurs, cle) => {
        const bloc = el("div");
        bloc.appendChild(el("p", "consigne", titre));
        const rangee = el("div", "puces puces-theme");
        valeurs.forEach(([v, libelle]) => {
          const b = el("button", "puce" + (choix[cle] === v ? " active" : ""), libelle);
          b.setAttribute("aria-pressed", String(choix[cle] === v));
          b.addEventListener("click", () => { choix[cle] = v; dessiner(); });
          rangee.appendChild(b);
        });
        bloc.appendChild(rangee);
        return bloc;
      };
      const dessiner = () => {
        controles.innerHTML = "";
        controles.append(puces("Mesure", MESURES_TISANE.map(([m, l]) => [m, l.replace(/^(la|le|l')\s?/, "")]), "mesure"),
          puces("Participants", [["tous", "Tous"], ["femmes", "Femmes seulement"], ["hommes", "Hommes seulement"]], "groupe"),
          puces("Valeurs extrêmes (au-delà de 2 écarts-types)", [[false, "Gardées"], [true, "Retirées"]], "extremes"));
        const ajouter = el("button", "bouton secondaire", "Ajouter 10 participants par groupe" + (ajouts ? " (" + (20 + 10 * ajouts) + " par groupe)" : ""));
        ajouter.disabled = ajouts >= 2;
        ajouter.addEventListener("click", () => {
          ajouts++;
          for (let j = 0; j < 10; j++) { donnees.tisane.push(participantTisane()); donnees.temoin.push(participantTisane()); }
          dessiner();
        });
        controles.appendChild(ajouter);
        const r = analyseTisane(donnees, choix);
        const cle = JSON.stringify(choix) + ajouts;
        if (!essais.has(cle)) { essais.add(cle); analyses++; }
        resultat.innerHTML = "";
        if (!r) { resultat.appendChild(paragraphe("Trop peu de participants dans ce sous-groupe.")); return; }
        const sig = r.p < 0.05;
        resultat.append(el("p", "grand-score p-valeur" + (sig ? " significatif" : ""), "p = " + fr(Number(r.p.toFixed(3)))),
          paragraphe("Différence entre les groupes, sur " + MESURES_TISANE.find(([m]) => m === choix.mesure)[1] + " : " + signe(Number(r.ecart.toFixed(2))) + " écart-type. " + pluriel(analyses, "analyse essayée", "analyses essayées") + "."));
        if (sig) resultat.appendChild(el("p", "verdict juste", "« Significatif ! » La tisane semble agir… sur des données où elle n'a aucun effet."));
        const conclure = el("button", "bouton large", sig ? "Publier ce résultat" : "Abandonner et voir le bilan");
        conclure.dataset.valider = "1";
        conclure.addEventListener("click", () => bilan(sig));
        resultat.appendChild(conclure);
      };
      const bilan = publie => {
        noterPartie("fabriquer", publie ? 1 : 0, 1);
        zone.innerHTML = "";
        zone.appendChild(el("p", "consigne", "Bilan"));
        zone.appendChild(paragraphe(publie
          ? "Vous avez obtenu un résultat « significatif » en " + pluriel(analyses, "analyse") + ", sans fraude : seulement des choix d'analyse, chacun défendable isolément."
          : "Vous n'avez pas obtenu de résultat significatif en " + pluriel(analyses, "analyse") + ". Un chercheur obstiné y serait souvent parvenu."));
        const part = simulerChercheurs(1000);
        zone.appendChild(el("p", "grand-score", Math.round(100 * part) + " %"));
        zone.appendChild(paragraphe("Sur 1 000 études simulées à l'instant, toutes sur une tisane sans effet, un chercheur qui essaie les trois mesures, les trois sous-groupes, avec ou sans valeurs extrêmes, puis ajoute dix participants par groupe faute de résultat, obtient p < 0,05 dans " + Math.round(100 * part) + " % des cas. Avec une seule analyse fixée d'avance, ce serait 5 %."));
        ajouterExplication(zone, "Les degrés de liberté du chercheur", [
          "Simmons, Nelson et Simonsohn (2011) ont montré qu'en combinant quelques libertés d'analyse de ce genre, on obtient un faux positif dans 61 % des cas. Ils ont ainsi « démontré » qu'écouter une chanson des Beatles rajeunissait les auditeurs.",
          "Les remèdes : déclarer à l'avance la mesure, l'échantillon et l'analyse (préenregistrement), publier toutes les analyses essayées, et se méfier d'un résultat isolé, surtout s'il est surprenant."
        ], [["#sophismes/cherry-picking", "Cueillette de cerises"], ["#sophismes/tireur-elite", "Sophisme du tireur d'élite"], ["#biais/taille-echantillon", "Taille de l'échantillon"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "fabriquer").lancer(zone), "Nouvelles données");
      };
      dessiner();
    }
  },
  // ---------------------------------------------------------------
  {
    id: "foule",
    section: "confiance",
    picto: "intervalle",
    couleur: "#2f6db5",
    duree: "4 min",
    titre: "La foule intérieure",
    resume: "Estimez six quantités. Puis supposez que votre première estimation soit fausse, et faites-en une seconde. La moyenne des deux est-elle plus juste ?",
    lancer(zone) {
      const questions = tirerNouveaux("foule", ETALONNAGE.filter(q => !estAnnee(q)), 6);
      const premieres = [];
      zone.innerHTML = "";
      // Tour 1 : premières estimations, puis tour 2 : estimations « dialectiques »
      const etapes = [...questions.map(q => ({ q, tour: 1 })), ...questions.map(q => ({ q, tour: 2 }))];
      derouler(zone, etapes, (e, zone, fini) => {
        const q = e.q;
        zone.appendChild(el("p", "cas", q.q + (q.unite ? " (en " + q.unite + ")" : "") + " ?"));
        if (e.tour === 2) {
          const p1 = premieres[questions.indexOf(q)];
          zone.appendChild(paragraphe("Votre première estimation : " + fr(p1) + ". Supposez qu'elle soit fausse. Pourquoi le serait-elle ? Était-elle plutôt trop haute ou trop basse ? Faites une seconde estimation, différente, à partir de cette nouvelle hypothèse.", "consigne-longue"));
        }
        const ligne = el("div", "ligne");
        const champ = el("input", "champ");
        champ.inputMode = "decimal";
        champ.setAttribute("aria-label", e.tour === 1 ? "Votre estimation" : "Votre seconde estimation");
        const ok = el("button", "bouton", "Valider");
        ok.dataset.valider = "1";
        ligne.append(champ, ok);
        zone.appendChild(ligne);
        ok.addEventListener("click", () => {
          const v = lireNombre(champ.value);
          if (isNaN(v) || v <= 0) { champ.focus(); return; }
          champ.disabled = true;
          ok.remove();
          if (e.tour === 1) premieres.push(v); else e.seconde = v;
          const retour = el("div", "retour-quiz");
          retour.appendChild(paragraphe(e.tour === 1 ? "Noté. La réponse viendra au second tour." : "Noté.", "source"));
          zone.appendChild(retour);
          fini(e.tour === 2 ? { q, premiere: premieres[questions.indexOf(q)], seconde: v } : null, retour);
        });
      }, resultats => {
        const paires = resultats.filter(Boolean);
        // Erreur en ordres de grandeur ; la moyenne des deux estimations est leur moyenne géométrique
        const erreur = (v, q) => Math.abs(Math.log10(v / q.v));
        const lignes = paires.map(r => {
          const moyenne = Math.sqrt(r.premiere * r.seconde);
          return { ...r, moyenne, e1: erreur(r.premiere, r.q), e2: erreur(r.seconde, r.q), em: erreur(moyenne, r.q) };
        });
        const mieux = lignes.filter(l => l.em < l.e1).length;
        const moy = k => lignes.reduce((s, l) => s + l[k], 0) / lignes.length;
        afficherScore(zone, "foule", mieux, lignes.length);
        zone.appendChild(paragraphe("La moyenne de vos deux estimations a fait mieux que la première dans " + mieux + " cas sur " + lignes.length + ". Erreur moyenne, en ordres de grandeur : première estimation " + fr(Number(moy("e1").toFixed(2))) + ", seconde " + fr(Number(moy("e2").toFixed(2))) + ", moyenne des deux " + fr(Number(moy("em").toFixed(2))) + "."));
        const liste = el("ul", "liste-simple");
        lignes.forEach(l => liste.appendChild(el("li", null, l.q.q + " : " + fr(l.q.v) + (l.q.unite ? " " + l.q.unite : "") + " ; vous : " + fr(l.premiere) + " puis " + fr(l.seconde) + ", moyenne " + fr(Number(l.moyenne.toPrecision(3))))));
        zone.appendChild(liste);
        ajouterExplication(zone, "La foule intérieure", [
          "La moyenne de plusieurs estimations indépendantes est souvent plus juste que chacune, parce que leurs erreurs se compensent en partie. Une seule personne peut imiter cet effet : Herzog et Hertwig (2009) ont montré qu'une seconde estimation faite après avoir cherché pourquoi la première serait fausse, moyennée avec elle, est plus juste qu'une simple seconde estimation.",
          "Le gain existe, mais il reste modeste : sur 1,2 million de participants, van Dolder et van den Assem trouvent qu'il est bien inférieur à celui que procure l'avis d'une autre personne. Demander à quelqu'un d'autre reste le meilleur moyen."
        ], [["#biais/surprecision", "Excès de précision"], ["#biais/ancrage", "Effet d'ancrage"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "foule").lancer(zone));
      }, "Estimation");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "cecite",
    section: "philosopher",
    picto: "pensee",
    couleur: "#8a3f8f",
    duree: "5 min",
    titre: "La cécité au choix",
    resume: "Donnez votre avis sur douze affirmations sans enjeu, puis expliquez quelques-unes de vos réponses. À ne faire qu'une fois : le principe se dévoile à la fin.",
    lancer(zone) {
      zone.innerHTML = "";
      const dejaFait = lire("ceciteFaite", false);
      const reponses = [];
      const commencer = () => derouler(zone, AFFIRMATIONS_CECITE, (a, zone, fini) => {
        zone.appendChild(el("p", "cas", "« " + a + " »"));
        zone.appendChild(echelleNeuf(n => { reponses.push(n); const r = el("div", "retour-quiz"); zone.appendChild(r); fini(n, r); }));
      }, () => justifier(), "Affirmation");
      if (dejaFait) {
        zone.appendChild(paragraphe("Vous avez déjà fait cette expérience : vous en connaissez le principe, qui ne peut plus vous surprendre. Vous pouvez la refaire, ou la proposer à quelqu'un d'autre.", "source"));
        const b = el("button", "bouton", "Recommencer quand même");
        b.addEventListener("click", commencer);
        zone.appendChild(b);
        return;
      }
      commencer();

      // Quatre réponses à justifier, dont deux inversées en secret (n devient 10 − n), parmi les réponses nettes
      function justifier() {
        const nettes = AFFIRMATIONS_CECITE.map((a, k) => k).filter(k => reponses[k] !== 5);
        const choisies = melanger(nettes.length >= 4 ? nettes : AFFIRMATIONS_CECITE.map((a, k) => k)).slice(0, 4);
        const inversees = new Set(choisies.filter(k => reponses[k] !== 5).slice(0, 2));
        const signalees = new Set();
        zone.innerHTML = "";
        zone.appendChild(el("p", "consigne", "Vos réponses"));
        zone.appendChild(paragraphe("Voici quatre de vos réponses. Pour chacune, expliquez en une phrase pourquoi vous pensez cela."));
        choisies.forEach(k => {
          const affichee = inversees.has(k) ? 10 - reponses[k] : reponses[k];
          const bloc = el("div", "question-test");
          bloc.append(el("p", "cas", "« " + AFFIRMATIONS_CECITE[k] + " »"), paragraphe("Votre réponse : " + affichee + " sur 9 (" + sensAccord(affichee) + ")."));
          const texte = el("textarea", "champ champ-texte");
          texte.rows = 2;
          texte.setAttribute("aria-label", "Pourquoi ?");
          texte.placeholder = "Pourquoi ?";
          const pasMoi = el("button", "lien-bouton", "Ce n'est pas ce que j'ai répondu");
          pasMoi.addEventListener("click", () => { signalees.add(k); pasMoi.textContent = "Signalé"; pasMoi.disabled = true; });
          bloc.append(texte, pasMoi);
          zone.appendChild(bloc);
        });
        const fin = el("button", "bouton large", "Terminer");
        fin.dataset.valider = "1";
        fin.addEventListener("click", () => reveler(choisies, inversees, signalees));
        zone.appendChild(fin);
      }

      function reveler(choisies, inversees, signalees) {
        ecrire("ceciteFaite", true);
        const reperees = [...inversees].filter(k => signalees.has(k)).length;
        noterPartie("cecite", reperees, inversees.size);
        zone.innerHTML = "";
        zone.appendChild(el("p", "consigne", "Révélation"));
        zone.appendChild(el("p", "grand-score", reperees + " / " + inversees.size));
        zone.appendChild(paragraphe("Deux des quatre réponses affichées avaient été inversées : on vous montrait l'avis contraire du vôtre. Vous en avez signalé " + reperees + "."));
        const liste = el("ul", "liste-simple");
        [...inversees].forEach(k => liste.appendChild(el("li", null, "« " + AFFIRMATIONS_CECITE[k] + " » : vous aviez répondu " + reponses[k] + ", on vous a montré " + (10 - reponses[k]) + (signalees.has(k) ? ". Repéré." : ". Non repéré.") )));
        zone.appendChild(liste);
        ajouterExplication(zone, "Défendre un choix qu'on n'a pas fait", [
          "Hall, Johansson et Strandberg (2012) ont fait remplir à 160 personnes un questionnaire d'opinions politiques, puis leur ont montré certaines réponses inversées en secret. 69 % n'ont pas repéré au moins une des deux inversions, et 53 % ont défendu sans ambiguïté l'avis opposé au leur.",
          "Nous connaissons nos raisons moins bien que nous le croyons : face à une réponse qu'on nous attribue, nous construisons souvent une justification après coup. Ici, sur des sujets sans enjeu et avec un seul essai, le résultat ne mesure rien de précis : c'est une démonstration, pas un test.",
          "Cette expérience ne se fait qu'une fois : maintenant que vous en connaissez le principe, vous seriez sur vos gardes. Vous pouvez la proposer à quelqu'un d'autre."
        ], [["#biais/raisonnement-motive", "Raisonnement motivé"], ["#biais/perseverance", "Persévérance des croyances"]]);
      }
    }
  }
);

// Liens depuis les fiches
[["biais:survivant", "#tests/wald"], ["sophismes:cherry-picking", "#tests/fabriquer"], ["sophismes:tireur-elite", "#tests/fabriquer"], ["biais:taille-echantillon", "#tests/fabriquer"],
 ["biais:surprecision", "#tests/foule"], ["biais:raisonnement-motive", "#tests/cecite"]].forEach(([cle, adresse]) => {
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), adresse])];
});

// ===================== Bingo des sophismes =====================
// Grille de 16 sophismes tirée d'une graine : la même graine donne la même grille (adresse #bingo/<graine>),
// pour jouer à plusieurs pendant un débat télévisé ou un repas de famille. On coche ce qu'on entend.
// Graine demandée par l'adresse #bingo/<graine> (sinon, une nouvelle grille au hasard)
let grainePourBingo = null;

function grilleBingo(graine) {
  return melanger(SOPHISMES, generateur(graine)).slice(0, 16);
}

function afficherBingo(zone, graine) {
  graine = Number(graine) || Math.floor(Math.random() * 1e6);
  const fiches = grilleBingo(graine);
  const memo = lire("bingo", {});
  const cochees = new Set(memo.graine === graine ? memo.cochees : []);
  zone.innerHTML = "";
  zone.appendChild(paragraphe("Pendant un débat, une émission ou un repas, cochez chaque sophisme que vous entendez. Une ligne, une colonne ou une diagonale complète : bingo. Avec la même adresse, chacun a la même grille."));
  const grille = el("div", "bingo-grille");
  grille.setAttribute("role", "group");
  grille.setAttribute("aria-label", "Grille de bingo des sophismes");
  const message = el("p", "verdict");
  message.setAttribute("aria-live", "polite");
  const lignes = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], [0, 5, 10, 15], [3, 6, 9, 12]];
  const maj = () => {
    ecrire("bingo", { graine, cochees: [...cochees] });
    const bingo = lignes.some(l => l.every(k => cochees.has(k)));
    message.textContent = bingo ? "Bingo ! Une ligne complète." : pluriel(cochees.size, "case cochée", "cases cochées") + " sur 16.";
  };
  fiches.forEach((f, k) => {
    const b = el("button", "bingo-case" + (cochees.has(k) ? " cochee" : ""), f.nom);
    b.setAttribute("aria-pressed", String(cochees.has(k)));
    b.addEventListener("click", () => {
      if (cochees.has(k)) cochees.delete(k); else cochees.add(k);
      b.classList.toggle("cochee", cochees.has(k));
      b.setAttribute("aria-pressed", String(cochees.has(k)));
      maj();
    });
    grille.appendChild(b);
  });
  zone.append(grille, message);
  maj();
  const adresse = location.origin + location.pathname + "#bingo/" + graine;
  zone.appendChild(paragraphe("Grille n° " + graine + " : " + adresse, "source bingo-adresse"));
  const actions = el("div", "actions");
  const nouvelle = el("button", "bouton secondaire", "Nouvelle grille");
  nouvelle.addEventListener("click", () => { location.hash = "bingo/" + Math.floor(Math.random() * 1e6); });
  const imprimer = el("button", "bouton secondaire", "Imprimer");
  imprimer.addEventListener("click", () => window.print());
  const partager = el("button", "bouton secondaire", "Partager cette grille");
  partager.addEventListener("click", async () => {
    try {
      if (navigator.share) { await navigator.share({ text: "Bingo des sophismes : " + adresse }); return; }
      await navigator.clipboard.writeText(adresse);
      annoncer("Adresse copiée.");
    } catch (e) { if (!e || e.name !== "AbortError") annoncer(adresse); }
  });
  actions.append(nouvelle, imprimer, partager);
  zone.appendChild(actions);
  const legende = el("details", "calcul-detail");
  legende.appendChild(el("summary", null, "Les seize sophismes de cette grille"));
  const ul = el("ul", "liste-simple");
  fiches.forEach(f => { const li = el("li"); li.append(lienVers("#sophismes/" + f.id, f.nom), texteNoeud(" : " + f.definition)); ul.appendChild(li); });
  legende.appendChild(ul);
  zone.appendChild(legende);
}

// ===================== Qui doit prouver ? =====================
// Situations fictives. reponse : 0 celui qui affirme ; 1 celui qui doute ; 2 les deux, chacun pour ce qu'il affirme ;
// 3 personne, c'est une question de goût.
const OPTIONS_PREUVE = ["Celui qui affirme", "Celui qui doute", "Les deux, chacun pour ce qu'il affirme", "Personne : c'est une affaire de goût"];
const QUI_PROUVE = [
  { texte: "Léo : « Ce bracelet magnétique soulage les douleurs articulaires. » Julie : « J'en doute. »", reponse: 0,
    explication: "C'est à Léo, qui affirme un effet, d'apporter des preuves. Julie n'a rien à démontrer en doutant." },
  { texte: "Nora : « Ce restaurant est le meilleur du quartier. » Paul : « Je préfère celui d'en face. »", reponse: 3,
    explication: "Il s'agit de goûts : aucun des deux n'a de preuve à fournir, même si chacun peut donner ses raisons." },
  { texte: "Marc : « Le nouveau logiciel fait gagner une heure par jour. » Inès : « Faux, il en fait perdre une. »", reponse: 2,
    explication: "Inès ne se contente pas de douter : elle affirme le contraire. Chacun doit appuyer sa propre affirmation." },
  { texte: "Un vendeur : « Prouvez-moi que ce complément ne marche pas, et je vous rembourse. »", reponse: 0,
    explication: "Le vendeur renverse la charge de la preuve : c'est à lui, qui vante un effet, de le démontrer." },
  { texte: "Sami : « Il a plu toute la journée hier à Lyon. » Clara : « Je ne crois pas. »", reponse: 0,
    explication: "Sami affirme un fait vérifiable ; c'est à lui de le montrer, par exemple avec un relevé météo. Le doute de Clara n'affirme rien." },
  { texte: "Mathilde : « La Terre tourne autour du Soleil. » Bob : « Je n'y crois pas, prouve-le. »", reponse: 1,
    explication: "Mathilde énonce un fait établi depuis des siècles, et dont les preuves sont accessibles à tous : elles ont déjà été apportées. Celui qui conteste un résultat aussi solide doit expliquer en quoi il serait faux." },
  { texte: "Emma : « Le bleu est la plus belle couleur. » Tom : « Pas du tout, c'est le vert. »", reponse: 3,
    explication: "Préférences esthétiques : il n'y a rien à prouver, seulement des goûts à échanger." },
  { texte: "Un élu : « Cette mesure a fait baisser les cambriolages de 30 %. » Un journaliste : « Sur quelles données ? »", reponse: 0,
    explication: "L'élu avance un chiffre et une cause : à lui de montrer les données et la méthode. La question du journaliste n'affirme rien." },
  { texte: "Yasmine : « Ce médicament est efficace : il a passé un essai comparatif publié. » Karim : « Je pense que l'essai est truqué. »", reponse: 2,
    explication: "Yasmine a apporté un élément de preuve. Karim affirme une fraude : c'est maintenant à lui d'étayer cette accusation." },
  { texte: "Ali : « Je pense que la réunion de demain va être annulée. » Rose : « Pourquoi ? »", reponse: 0,
    explication: "Une simple prévision, mais c'est quand même à Ali de dire sur quoi il s'appuie, s'il veut être cru." }
];

// ===================== La pyramide du désaccord =====================
// D'après l'essai de Paul Graham, « How to Disagree » (2008) : sept façons de répondre, de la moins à la plus utile.
const NIVEAUX_GRAHAM = ["Insulte", "Attaque personnelle", "Réponse au ton", "Contradiction", "Contre-argument", "Réfutation", "Réfutation du point central"];
const PYRAMIDES = [
  { affirmation: "Clara : « La ville devrait remplacer le parking de la place du marché par un jardin. Les commerces n'y perdraient rien : la plupart des clients du marché viennent à pied, d'après le comptage de l'an dernier. »",
    repliques: [
      ["Quelle idée ridicule, on voit bien que vous n'y connaissez rien.", 0],
      ["Vous dites ça parce que vous n'avez pas de voiture.", 1],
      ["Votre ton donneur de leçons est insupportable.", 2],
      ["Non, les commerces y perdraient.", 3],
      ["Les livreurs ont besoin de se garer près du marché, et un jardin ne le permettrait pas.", 4],
      ["Vous dites « la plupart des clients viennent à pied » : le comptage a eu lieu un mardi matin, pas un samedi, jour où le marché attire surtout des clients en voiture.", 5],
      ["Tout votre raisonnement repose sur ce comptage. S'il ne représente pas les jours de forte affluence, on ne sait pas si les commerces y perdraient : il faudrait compter un samedi avant de décider.", 6]
    ] },
  { affirmation: "Hugo : « Le collège devrait commencer les cours à 9 heures au lieu de 8 heures : les adolescents dorment trop peu, et le sommeil compte pour apprendre. »",
    repliques: [
      ["N'importe quoi, comme d'habitude.", 0],
      ["Facile à dire pour quelqu'un qui n'a jamais eu à se lever tôt.", 1],
      ["Vous prenez un ton très sûr de vous pour un simple parent d'élève.", 2],
      ["Je ne suis pas d'accord.", 3],
      ["Beaucoup de parents commencent le travail à 8 h 30 et ne pourraient plus déposer leurs enfants.", 4],
      ["Vous dites que les adolescents dorment trop peu ; mais s'ils se couchent plus tard quand les cours commencent plus tard, ils ne gagneront pas de sommeil.", 5],
      ["Votre proposition suppose qu'un début à 9 heures ferait gagner du sommeil. C'est le point à vérifier : si les adolescents décalent leur coucher d'autant, la mesure ne sert à rien, quoi qu'on pense par ailleurs du sommeil.", 6]
    ] }
];

// ===================== Décision guidée =====================
// Les huit vérifications du guide (« Avant une décision importante »), en parcours, avec une date de bilan.
const VERIFICATIONS_DECISION = [
  ["Quels arguments contre votre choix avez-vous cherchés ?", "#biais/confirmation", "confirmation"],
  ["Que sait-on de la fréquence habituelle de ce genre de situation ?", "#biais/taux-de-base", "taux de base"],
  ["Quelle était votre estimation avant d'entendre le premier chiffre ?", "#biais/ancrage", "ancrage"],
  ["Continueriez-vous si vous n'aviez encore rien investi ?", "#biais/couts-irrecuperables", "coûts irrécupérables"],
  ["Reformulez les options autrement : votre préférence change-t-elle ?", "#biais/cadrage", "cadrage"],
  ["Combien de temps des projets comparables ont-ils pris ?", "#biais/planification", "planification"],
  ["Quels avis indépendants avez-vous recueillis avant toute discussion de groupe ?", "#biais/pensee-groupe", "pensée de groupe"],
  ["Qu'attendez-vous exactement de cette décision ? Notez-le pour pouvoir la juger plus tard.", "#biais/resultat", "biais du résultat"]
];

// Ateliers de cette seconde partie
EXPERIENCES.push(
  // ---------------------------------------------------------------
  {
    id: "bingo",
    section: "debattre",
    picto: "grille",
    couleur: "#c0601b",
    duree: "un débat",
    titre: "Bingo des sophismes",
    resume: "Une grille de seize sophismes à cocher pendant un débat ou un repas. Partagez l'adresse : chacun a la même grille. Elle s'imprime aussi.",
    lancer(zone) { afficherBingo(zone, grainePourBingo); grainePourBingo = null; }
  },
  // ---------------------------------------------------------------
  {
    id: "qui-prouve",
    section: "debattre",
    picto: "balance",
    couleur: "#3d6b4f",
    duree: "3 min",
    titre: "Qui doit prouver ?",
    resume: "Dans un désaccord, qui doit apporter des preuves : celui qui affirme, celui qui doute, les deux, ou personne ? Dix situations.",
    lancer(zone) {
      derouler(zone, melanger(QUI_PROUVE), (q, zone, fini) => {
        zone.appendChild(el("p", "cas", q.texte));
        zone.appendChild(el("p", "consigne", "Qui doit apporter des preuves ?"));
        const boutons = OPTIONS_PREUVE.map((t, k) => {
          const b = boutonChoix(t, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[q.reponse].classList.add("juste");
            if (k !== q.reponse) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.append(el("p", "verdict " + (k === q.reponse ? "juste" : "faux"), (k === q.reponse ? "Juste : " : "Réponse : ") + OPTIONS_PREUVE[q.reponse].toLowerCase() + "."), paragraphe(q.explication));
            zone.appendChild(retour);
            fini(k === q.reponse, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        afficherScore(zone, "qui-prouve", resultats.filter(Boolean).length, resultats.length);
        ajouterExplication(zone, "La charge de la preuve", [
          "C'est à celui qui affirme d'apporter des preuves, pas aux autres de démontrer qu'il a tort. Douter n'est pas affirmer le contraire : celui qui dit « je n'en sais rien » n'a rien à prouver.",
          "Mais contester un résultat solidement établi, c'est affirmer quelque chose à son tour : il faut alors dire pourquoi les preuves existantes seraient fausses. Et pour une affaire de goût, il n'y a rien à prouver, seulement des raisons à échanger."
        ], [["#sophismes/ignorance", "Appel à l'ignorance"], ["#guide/philosophie", "Outils philosophiques"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "qui-prouve").lancer(zone));
      }, "Situation");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "pyramide",
    section: "debattre",
    picto: "chronologie",
    couleur: "#5b5bb5",
    duree: "4 min",
    titre: "La pyramide du désaccord",
    resume: "De l'insulte à la réfutation du point central : sept façons de répondre à un argument. Classez quatorze répliques.",
    lancer(zone) {
      const etapes = melanger(PYRAMIDES).flatMap(p => melanger(p.repliques).map(([texte, niveau]) => ({ affirmation: p.affirmation, texte, niveau })));
      derouler(zone, etapes, (r, zone, fini) => {
        zone.appendChild(paragraphe(r.affirmation, "source"));
        zone.appendChild(el("p", "cas", "Réponse : « " + r.texte + " »"));
        zone.appendChild(el("p", "consigne", "À quel étage de la pyramide est cette réponse ?"));
        const boutons = NIVEAUX_GRAHAM.map((t, k) => {
          const b = boutonChoix(t, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[r.niveau].classList.add("juste");
            if (k !== r.niveau) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (k === r.niveau ? "juste" : "faux"), (k === r.niveau ? "Juste : " : "Réponse : ") + NIVEAUX_GRAHAM[r.niveau].toLowerCase() + "."));
            zone.appendChild(retour);
            fini(k === r.niveau, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        afficherScore(zone, "pyramide", resultats.filter(Boolean).length, resultats.length);
        ajouterExplication(zone, "Monter dans la pyramide", [
          "Paul Graham propose, dans un essai de 2008 (« How to Disagree »), de classer les réponses à un désaccord : l'insulte, l'attaque personnelle, la réponse au ton, la simple contradiction, le contre-argument, la réfutation (citer ce que l'autre a dit et montrer en quoi c'est faux), enfin la réfutation du point central. C'est un essai, pas une étude, mais la grille aide à repérer les réponses qui esquivent le fond.",
          "Une réponse vive peut être une bonne réfutation, et une réponse polie, une esquive : c'est le contenu qui compte, pas le ton."
        ], [["#sophismes/ad-hominem", "Attaque personnelle"], ["#sophismes/hareng-rouge", "Diversion"], ["#guide/debattre", "Débattre honnêtement"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "pyramide").lancer(zone));
      }, "Réponse");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "decision",
    section: "confiance",
    picto: "calendrier",
    couleur: "#0e7c86",
    duree: "10 min",
    titre: "Décision guidée",
    resume: "Une décision importante à prendre ? Huit questions pour l'examiner, ce que vous en attendez, et une date pour en faire le bilan.",
    lancer(zone) {
      const decisions = () => lire("decisions", []);
      const auj = aujourdHui();
      const dateDe = jour => new Date(jour * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      const relancer = () => EXPERIENCES.find(x => x.id === "decision").lancer(zone);
      zone.innerHTML = "";
      // Bilans arrivés à échéance : on sépare la qualité de la décision de celle du résultat
      decisions().filter(d => !d.bilanFait && d.bilan <= auj).forEach(d => {
        const bloc = el("div", "prevision a-resoudre");
        bloc.append(el("p", "consigne", "Bilan à faire"), el("p", "cas", d.texte), paragraphe("Ce que vous attendiez : « " + (d.reponses[7] || "non noté") + " »", "source"));
        const issue = el("textarea", "champ champ-texte");
        issue.rows = 2; issue.placeholder = "Qu'est-il arrivé ?"; issue.setAttribute("aria-label", "Qu'est-il arrivé ?");
        bloc.appendChild(issue);
        bloc.appendChild(el("p", "consigne", "Avec ce que vous saviez alors, la décision était-elle bonne, quel que soit le résultat ?"));
        const actions = el("div", "actions");
        [["bonne", "Bonne décision"], ["mauvaise", "Mauvaise décision"], ["incertain", "Je ne sais pas"]].forEach(([v, t]) => {
          const b = el("button", "bouton secondaire", t);
          b.addEventListener("click", () => {
            const l = decisions();
            const x = l.find(y => y.id === d.id);
            Object.assign(x, { bilanFait: auj, issue: issue.value.trim(), jugement: v });
            ecrire("decisions", l);
            noterPartie("decision");
            relancer();
          });
          actions.appendChild(b);
        });
        bloc.appendChild(actions);
        zone.appendChild(bloc);
      });

      zone.appendChild(el("p", "consigne", "Nouvelle décision"));
      const texte = el("textarea", "champ champ-texte");
      texte.rows = 2;
      texte.placeholder = "La décision à prendre";
      texte.setAttribute("aria-label", "La décision à prendre");
      const commencer = el("button", "bouton large", "Examiner cette décision");
      commencer.dataset.valider = "1";
      zone.append(texte, commencer);
      commencer.addEventListener("click", () => {
        if (!texte.value.trim()) { texte.focus(); return; }
        const sujet = texte.value.trim();
        const reponses = [];
        derouler(zone, VERIFICATIONS_DECISION, ([question, lien, nom], zone, fini) => {
          zone.appendChild(el("p", "consigne", sujet));
          zone.appendChild(el("p", "cas", question));
          const champ = el("textarea", "champ champ-texte");
          champ.rows = 3;
          champ.setAttribute("aria-label", question);
          const ok = el("button", "bouton", "Noter");
          ok.dataset.valider = "1";
          zone.append(champ, ok, paragraphe("", "source"));
          zone.lastChild.appendChild(lienVers(lien, "En savoir plus : " + nom));
          ok.addEventListener("click", () => {
            reponses.push(champ.value.trim());
            champ.disabled = true;
            ok.remove();
            const r = el("div", "retour-quiz");
            zone.appendChild(r);
            fini(true, r);
          });
        }, () => {
          zone.appendChild(el("p", "consigne", "Date du bilan"));
          zone.appendChild(paragraphe("Choisissez une date où vous pourrez juger la décision : le bilan vous attendra ici, et vous pourrez l'ajouter à votre agenda."));
          const date = el("input", "champ");
          date.type = "date";
          date.setAttribute("aria-label", "Date du bilan");
          date.value = new Date((auj + 90) * 86400000).toISOString().slice(0, 10);
          const enregistrer = el("button", "bouton large", "Enregistrer");
          enregistrer.dataset.valider = "1";
          zone.append(date, enregistrer);
          enregistrer.addEventListener("click", () => {
            const jour = Math.round(Date.parse(date.value + "T00:00:00Z") / 86400000);
            if (isNaN(jour)) { date.focus(); return; }
            const l = decisions();
            l.push({ id: Date.now().toString(36), texte: sujet, creee: auj, bilan: jour, reponses });
            ecrire("decisions", l.slice(-50));
            noterActivite();
            zone.innerHTML = "";
            zone.appendChild(el("p", "verdict juste", "Décision enregistrée. Bilan prévu le " + dateDe(jour) + "."));
            const agenda = el("button", "bouton secondaire", "Ajouter le bilan à mon agenda");
            agenda.addEventListener("click", () => fichierAgenda("bilan-decision.ics", [{ jour, titre: "Bilan de décision : " + sujet, description: "Faites le bilan sur https://esprit-critique.github.io/#tests/decision", url: "https://esprit-critique.github.io/#tests/decision" }]));
            zone.appendChild(agenda);
            ajouterExplication(zone, "Juger la décision, pas seulement le résultat", [
              "Une bonne décision peut mal tourner, et une mauvaise réussir par chance. Noter avant ce que l'on sait et ce que l'on attend permet, au bilan, de juger la décision avec les informations qu'on avait, sans le biais rétrospectif ni le biais du résultat."
            ], [["#biais/resultat", "Biais du résultat"], ["#biais/retrospectif", "Biais rétrospectif"], ["#guide/decision", "Avant une décision importante"]]);
            boutonRejouer(zone, relancer, "Retour à mes décisions");
          });
        }, "Question");
      });

      // Décisions déjà examinées
      const passees = decisions();
      if (passees.length) {
        zone.appendChild(el("p", "consigne", "Vos décisions"));
        const ul = el("ul", "liste-simple");
        passees.slice().reverse().forEach(d => ul.appendChild(el("li", null, d.texte + " — " + (d.bilanFait ? "bilan fait : " + ({ bonne: "bonne décision", mauvaise: "mauvaise décision", incertain: "jugement incertain" })[d.jugement] : "bilan le " + dateDe(d.bilan)))));
        zone.appendChild(ul);
      }
    }
  }
);

[["sophismes:ignorance", "#tests/qui-prouve"], ["sophismes:ad-hominem", "#tests/pyramide"], ["sophismes:hareng-rouge", "#tests/pyramide"],
 ["biais:resultat", "#tests/decision"], ["biais:confirmation", "#tests/decision"]].forEach(([cle, adresse]) => {
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), adresse])];
});

// ===================== Comprenez-vous vraiment ? =====================
// Protocole de Rozenblit et Keil (2002) : noter sa compréhension de 1 à 7, l'expliquer pas à pas, noter
// à nouveau, répondre à une question qui demande le mécanisme, noter une dernière fois.
// Mécanismes vérifiés sur Wikipédia (articles « Fermeture à glissière », « Réfrigérateur », « Chasse d'eau »,
// « Serrure à goupilles », « Bicyclette »).
const MECANISMES = [
  { objet: "une fermeture éclair",
    question: "Que fait le curseur quand on le fait glisser vers le haut ?",
    options: ["Ses deux gorges, qui se rejoignent, rapprochent les dents décalées des deux bandes et les engrènent",
      "Il presse les dents l'une contre l'autre, et elles tiennent par simple frottement",
      "Il accroche chaque dent à un œillet placé en face, sur l'autre bande",
      "Il tord légèrement chaque dent, qui se bloque ensuite contre sa voisine"],
    explication: "Deux bandes de tissu portent des dents, décalées d'une bande à l'autre. Le curseur a deux gorges qui se rejoignent : en montant, il guide les dents des deux bandes l'une vers l'autre et les engrène ; en descendant, il les sépare.",
    source: "Wikipédia, « Fermeture à glissière »." },
  { objet: "un réfrigérateur",
    question: "D'où vient le froid à l'intérieur ?",
    options: ["Un fluide s'y évapore en prenant de la chaleur ; comprimé, il se condense à l'arrière, où il la rejette",
      "Le moteur produit de l'air froid, qu'un ventilateur souffle à l'intérieur",
      "Un gaz très froid, chargé en usine, se réchauffe lentement au fil des années",
      "Les parois isolantes absorbent la chaleur des aliments"],
    explication: "Le réfrigérateur ne fabrique pas de froid : il déplace de la chaleur. Un fluide frigorigène s'évapore dans l'appareil en prenant de la chaleur ; le compresseur le comprime, ce qui l'échauffe ; il se condense dans la grille ou les tuyaux de l'arrière, où il cède cette chaleur à la pièce, puis revient s'évaporer.",
    source: "Wikipédia, « Réfrigérateur »." },
  { objet: "une chasse d'eau",
    question: "Qu'est-ce qui arrête le remplissage du réservoir ?",
    options: ["Le flotteur, qui remonte avec le niveau de l'eau et referme le robinet d'arrivée",
      "Une minuterie, réglée sur la contenance du réservoir",
      "La pression de l'eau accumulée, qui repousse l'eau du tuyau d'arrivée",
      "L'obturateur, qui en retombant au fond coupe aussi l'arrivée d'eau"],
    explication: "Le levier soulève l'obturateur du fond du réservoir : l'eau descend dans la cuvette en quelques secondes et l'obturateur se repose. Le flotteur, descendu avec le niveau, a ouvert le robinet d'arrivée ; en remontant avec l'eau, il le referme. Un tube de trop-plein évacue l'eau si le flotteur ferme mal.",
    source: "Wikipédia, « Chasse d'eau »." },
  { objet: "une serrure à clé plate (serrure à goupilles)",
    question: "Pourquoi le cylindre ne tourne-t-il qu'avec la bonne clé ?",
    options: ["Des goupilles poussées par des ressorts le bloquent ; seule la bonne clé les aligne toutes à la limite du cylindre",
      "La clé contient un code magnétique que la serrure lit",
      "Les crans de la clé s'emboîtent dans des encoches du cylindre, comme un engrenage",
      "La clé pousse directement le pêne, à condition d'avoir la bonne longueur"],
    explication: "Des paires de goupilles, poussées par des ressorts, traversent à la fois le cylindre et le corps de la serrure, et l'empêchent de tourner. Chaque cran de la clé soulève une paire à une hauteur précise : avec la bonne clé, toutes les séparations s'alignent sur la limite du cylindre, qui peut alors tourner. Un cran trop court ou trop long laisse une goupille en travers.",
    source: "Wikipédia, « Serrure à goupilles »." },
  { objet: "un vélo",
    question: "Que relie la chaîne ?",
    options: ["Le plateau du pédalier au pignon de la roue arrière",
      "Le pédalier aux deux roues",
      "La roue avant à la roue arrière",
      "Le pédalier à la roue avant"],
    explication: "Les pédales font tourner le plateau du pédalier ; la chaîne transmet ce mouvement au pignon de la roue arrière, seule motrice. La roue avant, libre, sert à diriger : une chaîne qui la relierait empêcherait de tourner le guidon.",
    source: "Wikipédia, « Bicyclette »." }
];

EXPERIENCES.push(
  {
    id: "comprendre",
    section: "confiance",
    picto: "pensee",
    couleur: "#2f6db5",
    duree: "8 min",
    titre: "Comprenez-vous vraiment ?",
    resume: "Notez votre compréhension de cinq objets du quotidien, puis expliquez-en trois pas à pas et répondez à une question sur chacun. Votre note change-t-elle ?",
    lancer(zone) {
      const notes = {};
      const expliques = melanger(MECANISMES.map((m, k) => k)).slice(0, 3);
      const echelle = surChoix => echelleSept("Je n'en ai qu'une idée vague", "Je pourrais l'expliquer en détail", surChoix);
      // Étapes : cinq premières notes, puis, pour chacun des trois objets, explication et question diagnostique
      const etapes = [...MECANISMES.map((m, k) => ({ k, type: "note" })),
        ...expliques.flatMap(k => [{ k, type: "expliquer" }, { k, type: "diagnostic" }])];
      derouler(zone, etapes, (e, zone, fini) => {
        const m = MECANISMES[e.k];
        const n = notes[e.k] || (notes[e.k] = []);
        if (e.type === "note") {
          zone.appendChild(el("p", "cas", "Comment comprenez-vous le fonctionnement d'" + m.objet + " ?"));
          zone.appendChild(echelle(v => { n.push(v); fini(null, zone); }));
          return;
        }
        if (e.type === "expliquer") {
          zone.appendChild(el("p", "cas", "Expliquez, étape par étape, comment fonctionne " + m.objet + "."));
          zone.appendChild(paragraphe("Écrivez comme pour quelqu'un qui n'en a jamais vu : chaque pièce, et ce qu'elle fait. Personne d'autre ne lira votre texte.", "consigne-longue"));
          const texte = el("textarea", "champ champ-texte");
          texte.rows = 5;
          texte.setAttribute("aria-label", "Votre explication");
          const ok = el("button", "bouton", "J'ai fini");
          ok.dataset.valider = "1";
          zone.append(texte, ok);
          ok.addEventListener("click", () => {
            texte.disabled = true;
            ok.remove();
            zone.appendChild(paragraphe("Après avoir écrit votre explication, comment jugez-vous maintenant votre compréhension ?"));
            zone.appendChild(echelle(v => { n.push(v); fini(null, zone); }));
          });
          return;
        }
        // Question diagnostique, puis l'explication de référence et une dernière note
        zone.appendChild(el("p", "cas", m.objet[0].toUpperCase() + m.objet.slice(1) + " : " + m.question));
        const ordre = melanger([0, 1, 2, 3]);
        const boutons = ordre.map((o, i) => {
          const b = boutonChoix(m.options[o], i);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[ordre.indexOf(0)].classList.add("juste");
            if (o !== 0) b.classList.add("faux");
            e.juste = o === 0;
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (e.juste ? "juste" : "faux"), e.juste ? "Juste." : "Pas tout à fait."));
            retour.appendChild(paragraphe(m.explication));
            retour.appendChild(paragraphe(m.source, "source"));
            retour.appendChild(paragraphe("Et maintenant, comment jugez-vous votre compréhension de départ ?"));
            retour.appendChild(echelle(v => { n.push(v); fini({ k: e.k, juste: e.juste }, retour); }));
            zone.appendChild(retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const diag = resultats.filter(Boolean);
        const justes = diag.filter(r => r.juste).length;
        const baisses = expliques.filter(k => notes[k][2] < notes[k][0]).length;
        afficherScore(zone, "comprendre", justes, diag.length, justes + " / " + diag.length + " aux questions");
        const liste = el("ul", "liste-simple");
        expliques.forEach(k => liste.appendChild(el("li", null, MECANISMES[k].objet[0].toUpperCase() + MECANISMES[k].objet.slice(1) + " : " + notes[k].join(" → ") + " sur 7")));
        zone.appendChild(paragraphe("Vos notes, avant d'expliquer, après l'explication, puis après la question :"));
        zone.appendChild(liste);
        zone.appendChild(paragraphe(baisses === 0 ? "Votre note n'a baissé pour aucun des trois objets : votre première estimation était peut-être déjà prudente." : "Votre note a baissé pour " + (baisses === 3 ? "les trois objets" : baisses === 2 ? "deux des trois objets" : "un des trois objets") + ". Une baisse est le résultat le plus fréquent."));
        ajouterExplication(zone, "L'illusion de profondeur explicative", [
          "Rozenblit et Keil (2002) ont fait noter à des étudiants leur compréhension d'objets courants (fermeture éclair, chasse d'eau, serrure à cylindre…), puis la leur ont fait expliquer pas à pas et répondre à une question précise. Leurs notes ont baissé après l'explication, puis encore après la question : nous confondons la familiarité avec un objet et la compréhension de son mécanisme. Cette illusion est plus forte pour les mécanismes que pour les faits (une capitale) ou les procédures (une recette).",
          "Lawson (2006) a demandé de compléter le dessin d'un vélo : beaucoup de participants ont commis des erreurs graves, comme faire passer la chaîne autour de la roue avant aussi bien que de la roue arrière.",
          "Fernbach et ses collègues (2013) ont trouvé qu'expliquer le détail d'une politique publique rendait les avis moins tranchés. Mais Crawford et Ruscio (2021), en trois réplications préenregistrées, n'ont pas retrouvé cet effet sur la modération des opinions : la baisse de la compréhension ressentie, elle, reste bien établie."
        ], [["#biais/dunning-kruger", "Effet Dunning-Kruger"], ["#biais/surprecision", "Excès de précision"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "comprendre").lancer(zone));
      }, "Étape");
    }
  }
);

[["biais:dunning-kruger", "#tests/comprendre"], ["biais:surprecision", "#tests/comprendre"]].forEach(([cle, adresse]) => {
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), adresse])];
});

// ===================== Démonter un argument =====================
// Arguments fictifs. Chaque phrase a un rôle ; « appui » est l'indice de la phrase qu'elle soutient
// (raison), conteste (objection) ou défend (réponse) ; null pour la conclusion et le hors-sujet.
const ROLES_ARGUMENT = ["Conclusion", "Raison", "Objection", "Réponse à une objection", "Hors sujet"];
const ARGUMENTS_A_DEMONTER = [
  { titre: "La rue du Marché",
    phrases: [
      { t: "La rue du Marché date du XVIIIe siècle.", role: 4, appui: null },
      { t: "La commune devrait la rendre piétonne.", role: 0, appui: null },
      { t: "Le bruit et la pollution des voitures y gênent les riverains chaque jour.", role: 1, appui: 1 },
      { t: "Dans les rues voisines rendues piétonnes, les commerçants disent avoir gagné des clients.", role: 1, appui: 1 },
      { t: "On objectera que les livraisons deviendraient impossibles.", role: 2, appui: 1 },
      { t: "Pourtant, des créneaux de livraison tôt le matin suffisent dans les rues voisines.", role: 3, appui: 4 }
    ] },
  { titre: "Les entraînements du soir",
    phrases: [
      { t: "Le club de natation devrait avancer ses entraînements du soir de 20 heures à 18 heures.", role: 0, appui: null },
      { t: "À 20 heures, beaucoup de jeunes nageurs arrivent fatigués et se couchent tard.", role: 1, appui: 0 },
      { t: "De plus, le bassin est libre dès 18 heures depuis que l'aquagym a changé d'horaire.", role: 1, appui: 0 },
      { t: "Certes, des parents qui travaillent jusqu'à 18 heures ne pourront plus accompagner leurs enfants.", role: 2, appui: 0 },
      { t: "Mais un covoiturage entre familles, déjà proposé par plusieurs parents, réglerait la plupart des cas.", role: 3, appui: 3 },
      { t: "Le club fêtera ses quarante ans l'an prochain.", role: 4, appui: null }
    ] },
  { titre: "La bibliothèque le dimanche",
    phrases: [
      { t: "Près d'un inscrit sur trois a un emploi en semaine, d'après le registre de la bibliothèque.", role: 1, appui: 1 },
      { t: "Pour beaucoup d'inscrits, le dimanche est donc le seul jour où venir.", role: 1, appui: 2 },
      { t: "C'est pourquoi la bibliothèque doit rester ouverte le dimanche.", role: 0, appui: null },
      { t: "Ouvrir le dimanche coûte cher en heures majorées, répondra-t-on.", role: 2, appui: 2 },
      { t: "Fermer le lundi matin, où presque personne ne vient, compenserait ce coût.", role: 3, appui: 3 },
      { t: "La bibliothèque a été repeinte au printemps.", role: 4, appui: null }
    ] },
  { titre: "Les téléphones en classe",
    phrases: [
      { t: "Les notifications interrompent l'attention, même quand on n'y répond pas.", role: 1, appui: 2 },
      { t: "Les téléphones ont beaucoup changé en vingt ans.", role: 4, appui: null },
      { t: "Le collège devrait donc demander aux élèves de déposer leur téléphone à l'entrée des salles.", role: 0, appui: null },
      { t: "Mais, disent certains, les élèves en ont besoin pour prévenir leurs parents.", role: 2, appui: 2 },
      { t: "Ils le récupèrent à chaque pause, et le secrétariat peut joindre les familles en cas d'urgence.", role: 3, appui: 3 }
    ] }
];

// L'arbre de l'argument : la conclusion en haut, sous chaque phrase ce qui la soutient ou la conteste
function arbreArgument(arg) {
  const branche = k => {
    const p = arg.phrases[k];
    const li = el("li", "role-" + p.role);
    li.append(el("span", "arbre-role", ROLES_ARGUMENT[p.role]), texteNoeud(" " + p.t));
    const enfants = arg.phrases.map((q, j) => j).filter(j => arg.phrases[j].appui === k);
    if (enfants.length) {
      const ul = el("ul");
      enfants.forEach(j => ul.appendChild(branche(j)));
      li.appendChild(ul);
    }
    return li;
  };
  const bloc = el("div", "arbre-argument");
  const racine = el("ul");
  racine.appendChild(branche(arg.phrases.findIndex(p => p.role === 0)));
  bloc.appendChild(racine);
  const hors = arg.phrases.filter(p => p.role === 4);
  if (hors.length) bloc.appendChild(paragraphe("Hors de l'arbre : " + hors.map(p => "« " + p.t + " »").join(" ") + " Ces phrases ne soutiennent ni ne contestent rien.", "source"));
  return bloc;
}

EXPERIENCES.push(
  {
    id: "demonter",
    section: "debattre",
    picto: "arbre",
    couleur: "#a2502a",
    duree: "4 min",
    titre: "Démonter un argument",
    resume: "Un court texte fictif, phrase par phrase : conclusion, raison, objection, réponse ou hors sujet ? Puis l'arbre de l'argument apparaît.",
    lancer(zone) {
      const arg = tirerNouveaux("demonter", ARGUMENTS_A_DEMONTER, 1)[0];
      derouler(zone, arg.phrases.map((p, k) => k), (k, zone, fini) => {
        const p = arg.phrases[k];
        zone.appendChild(el("p", "consigne", "« " + arg.titre + " » (texte fictif)"));
        // Le texte entier, la phrase à classer mise en évidence
        const texte = el("p", "texte-argument");
        arg.phrases.forEach((q, j) => {
          texte.appendChild(el(j === k ? "mark" : "span", null, q.t));
          if (j < arg.phrases.length - 1) texte.appendChild(texteNoeud(" "));
        });
        zone.appendChild(texte);
        zone.appendChild(el("p", "consigne", "Quel est le rôle de la phrase surlignée ?"));
        const boutons = ROLES_ARGUMENT.map((t, r) => {
          const b = boutonChoix(t, r);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            boutons[p.role].classList.add("juste");
            if (r !== p.role) b.classList.add("faux");
            const cible = p.appui === null ? "" : " « " + arg.phrases[p.appui].t + " »";
            const detail = [
              "C'est la thèse que tout le texte veut établir.",
              "Elle soutient :" + cible,
              "Elle conteste :" + cible,
              "Elle répond à l'objection :" + cible,
              "Elle ne soutient ni ne conteste rien : la retirer ne change pas l'argument."
            ][p.role];
            const retour = el("div", "retour-quiz");
            retour.append(el("p", "verdict " + (r === p.role ? "juste" : "faux"), (r === p.role ? "Juste : " : "Réponse : ") + ROLES_ARGUMENT[p.role].toLowerCase() + "."), paragraphe(detail));
            zone.appendChild(retour);
            fini(r === p.role, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const justes = resultats.filter(Boolean).length;
        afficherScore(zone, "demonter", justes, resultats.length);
        zone.appendChild(el("p", "consigne", "L'arbre de l'argument"));
        zone.appendChild(arbreArgument(arg));
        ajouterExplication(zone, "Lire la structure avant de juger", [
          "Un argument se compose d'une conclusion et des raisons qui la soutiennent ; un bon texte examine aussi les objections et y répond. Les mots de liaison (« donc », « c'est pourquoi », « certes », « mais ») guident, mais l'ordre des phrases ne suit pas toujours la logique : la conclusion n'est pas forcément au début.",
          "Dessiner l'arbre permet de voir ce qui porte la conclusion. On peut alors vérifier chaque raison, repérer une objection restée sans réponse, et écarter ce qui ne fait que remplir le texte."
        ], [["#sophismes/hareng-rouge", "Hareng rouge"], ["#sophismes/homme-de-paille", "Homme de paille"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "demonter").lancer(zone), "Un autre argument");
      }, "Phrase");
    }
  }
);

[["sophismes:hareng-rouge", "#tests/demonter"], ["sophismes:homme-de-paille", "#tests/demonter"]].forEach(([cle, adresse]) => {
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), adresse])];
});

// ===================== Lecture latérale =====================
// Sites, organismes et résultats de recherche entièrement fictifs. verdict : indice dans VERDICTS_SITE.
const VERDICTS_SITE = ["Fiable pour cette information", "Engagé : à croiser avec d'autres sources", "Peu fiable"];
const SITES_FICTIFS = [
  { nom: "Observatoire européen de la nutrition de l'enfant",
    affirmation: "« Aucune étude sérieuse ne montre que les boissons sucrées favorisent le surpoids des enfants. »",
    apropos: "Un logo sobre, une adresse en .org, un comité scientifique de douze membres présentés avec leurs titres, une rubrique « Nos publications » bien fournie et une charte d'indépendance en pied de page.",
    ailleurs: [
      "Un registre public des représentants d'intérêts : l'Observatoire y est financé à 90 % par une fédération de fabricants de boissons.",
      "Un article d'un quotidien national : son président a dirigé pendant dix ans le service marketing d'un fabricant de sodas.",
      "Une revue de synthèse universitaire sur le sujet, qui conclut au contraire à un lien entre boissons sucrées et surpoids."
    ],
    verdict: 2,
    explication: "Le site soigne toutes les apparences d'un organisme scientifique, mais il est financé par les fabricants concernés, sans le dire, et contredit les synthèses indépendantes. Rien de cela ne se voyait en restant sur le site." },
  { nom: "Le Courrier de la Vallée",
    affirmation: "« Le pont de la départementale sera fermé trois semaines à partir du 4 mars pour travaux. »",
    apropos: "Une mise en page datée, des publicités envahissantes, des photos de qualité inégale. La page « Qui sommes-nous » se limite à une adresse et un numéro de téléphone.",
    ailleurs: [
      "Une encyclopédie en ligne : quotidien régional fondé il y a plus de soixante-dix ans, avec une rédaction d'une trentaine de journalistes.",
      "Le site de la préfecture fictive du département : l'arrêté de fermeture du pont, aux mêmes dates.",
      "Plusieurs médias régionaux qui citent régulièrement ses informations locales."
    ],
    verdict: 0,
    explication: "L'apparence du site est peu engageante, mais il s'agit d'un journal établi, et l'information est confirmée par la source officielle. La qualité de la mise en page ne dit rien de la fiabilité."
  },
  { nom: "Santé Nature Vérité",
    affirmation: "« Une cure de vitamine C à haute dose guérit la grippe en quarante-huit heures. »",
    apropos: "Des témoignages chaleureux, un médecin en blouse blanche sur la page d'accueil, des références à des « études récentes » et un bandeau « Information libre et indépendante ».",
    ailleurs: [
      "Un service public d'enregistrement des noms de domaine : site créé il y a huit mois, propriétaire anonyme.",
      "Un site de vérification des faits : plusieurs de ses articles ont été démentis ; le médecin de la photo est une image vendue par une banque d'images.",
      "Une boutique en ligne liée au site, qui vend des compléments de vitamine C."
    ],
    verdict: 2,
    explication: "Le site vend les produits qu'il recommande, son auteur est inconnu et ses affirmations ont déjà été démenties. Le mot « indépendant » sur un site ne prouve rien : c'est ce que d'autres disent de lui qui compte."
  },
  { nom: "Laboratoire d'hydrologie de l'université de Valmont",
    affirmation: "« Le niveau moyen de la nappe phréatique de la région a baissé de deux mètres en trente ans. »",
    apropos: "Une page austère, une liste de chercheurs avec leurs publications, des jeux de données téléchargeables et la méthode de mesure décrite en détail.",
    ailleurs: [
      "Une encyclopédie en ligne : l'université fictive de Valmont est un établissement public ; le laboratoire est rattaché à un organisme national de recherche.",
      "Une revue scientifique à comité de lecture, qui a publié l'étude sur la nappe phréatique.",
      "Un article de presse régionale qui cite l'étude et interroge un hydrologue d'un autre laboratoire, qui juge les mesures solides."
    ],
    verdict: 0,
    explication: "Laboratoire public, étude publiée dans une revue à comité de lecture et jugée solide par un spécialiste extérieur : pour cette information, la source est fiable."
  },
  { nom: "Institut pour la liberté d'entreprendre",
    affirmation: "« Baisser les impôts sur les entreprises augmenterait l'emploi de 3 % en cinq ans. »",
    apropos: "Un site professionnel, des rapports en PDF avec graphiques, des « chercheurs associés » et une citation d'un prix Nobel d'économie en page d'accueil.",
    ailleurs: [
      "Une encyclopédie en ligne : groupe de réflexion qui défend ouvertement la baisse des impôts et la réduction de la dépense publique ; ses financeurs sont des entreprises et des fondations privées, dont la liste est publiée.",
      "Un article de presse économique : son chiffre de 3 % vient d'un modèle fondé sur des hypothèses favorables ; d'autres économistes obtiennent un effet bien plus faible.",
      "Les rapports d'un organisme public de prévision, qui donnent une fourchette large et incertaine."
    ],
    verdict: 1,
    explication: "Ce groupe ne cache ni son orientation ni ses financeurs : ses rapports peuvent être utiles, mais ils défendent une thèse. Son chiffre est l'hypothèse haute d'un débat ; il faut le croiser avec des sources aux positions différentes."
  },
  { nom: "Collectif citoyen pour l'air pur",
    affirmation: "« La pollution de l'air près de l'école des Tilleuls dépasse les seuils recommandés trois jours sur quatre. »",
    apropos: "Un site militant, des photos de manifestations, des appels à signer une pétition et un ton alarmé.",
    ailleurs: [
      "Le site de l'organisme régional de surveillance de la qualité de l'air : sa station la plus proche, à deux kilomètres, ne dépasse les seuils qu'un jour sur dix.",
      "Un article de presse locale : le collectif a installé ses propres capteurs bon marché devant l'école ; un ingénieur rappelle que leurs mesures peuvent être faussées par l'humidité.",
      "Un rapport du même organisme régional, qui juge utile une campagne de mesure près de l'école, faute de station sur place."
    ],
    verdict: 1,
    explication: "Le collectif défend une cause et ses capteurs sont imprécis, mais la question est légitime et la station officielle est loin. Ni à rejeter, ni à croire telle quelle : il faut croiser, et attendre des mesures fiables sur place."
  }
];

EXPERIENCES.push(
  {
    id: "laterale",
    section: "debattre",
    picto: "carte",
    couleur: "#3d6b4f",
    duree: "5 min",
    titre: "Lecture latérale",
    resume: "Quatre sites fictifs, une affirmation chacun. Rester sur le site pour l'examiner, ou chercher ce que d'autres en disent ? Puis jugez leur fiabilité.",
    lancer(zone) {
      const sites = tirerNouveaux("laterale", SITES_FICTIFS, 4);
      derouler(zone, sites, (s, zone, fini) => {
        zone.appendChild(el("p", "consigne", "Site fictif : « " + s.nom + " »"));
        zone.appendChild(el("p", "cas", s.affirmation));
        let ailleursVu = false, verdictDonne = false;
        const actions = el("div", "ligne actions-lecture");
        const voirSite = el("button", "bouton secondaire", "Examiner le site");
        const voirAilleurs = el("button", "bouton secondaire", "Chercher ce que d'autres en disent");
        actions.append(voirSite, voirAilleurs);
        zone.appendChild(actions);
        const blocSite = el("div", "encadre-lecture"), blocAilleurs = el("div", "encadre-lecture");
        voirSite.addEventListener("click", () => {
          voirSite.disabled = true;
          blocSite.append(el("p", "consigne", "Sur le site"), paragraphe(s.apropos));
          actions.after(blocSite);
        });
        const montrerAilleurs = () => {
          if (ailleursVu) return;
          ailleursVu = true;
          voirAilleurs.disabled = true;
          blocAilleurs.appendChild(el("p", "consigne", "Ailleurs, en cherchant le nom du site (résultats fictifs)"));
          const ul = el("ul", "liste-simple");
          s.ailleurs.forEach(t => ul.appendChild(el("li", null, t)));
          blocAilleurs.appendChild(ul);
          verdictTitre.before(blocAilleurs);
        };
        voirAilleurs.addEventListener("click", () => { if (!verdictDonne) s.cherche = true; montrerAilleurs(); });
        const verdictTitre = el("p", "consigne", "Votre jugement sur cette source");
        zone.appendChild(verdictTitre);
        const boutons = VERDICTS_SITE.map((t, k) => {
          const b = boutonChoix(t, k);
          b.addEventListener("click", () => {
            verdictDonne = true;
            boutons.forEach(x => { x.disabled = true; });
            boutons[s.verdict].classList.add("juste");
            if (k !== s.verdict) b.classList.add("faux");
            montrerAilleurs();
            const retour = el("div", "retour-quiz");
            retour.append(el("p", "verdict " + (k === s.verdict ? "juste" : "faux"), (k === s.verdict ? "Juste : " : "Réponse : ") + VERDICTS_SITE[s.verdict].charAt(0).toLowerCase() + VERDICTS_SITE[s.verdict].slice(1) + "."), paragraphe(s.explication));
            zone.appendChild(retour);
            fini({ juste: k === s.verdict, cherche: !!s.cherche }, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const justes = resultats.filter(r => r.juste).length;
        const cherches = resultats.filter(r => r.cherche).length;
        afficherScore(zone, "laterale", justes, resultats.length);
        zone.appendChild(paragraphe("Vous avez cherché ce que d'autres disaient du site avant de juger " + (cherches === 0 ? "pour aucun des " + resultats.length + " sites." : cherches === resultats.length ? "pour les " + resultats.length + " sites." : "pour " + cherches + " sites sur " + resultats.length + ".")));
        ajouterExplication(zone, "Lire en largeur, pas en profondeur", [
          "Wineburg et McGrew (2019) ont observé 45 internautes expérimentés évaluer des sites réels : 10 historiens docteurs, 10 vérificateurs de faits professionnels et 25 étudiants de Stanford. Historiens et étudiants restaient sur le site et se laissaient souvent prendre à des signes faciles à imiter : logo officiel, nom de domaine, présentation soignée. Les vérificateurs, eux, quittaient le site après un coup d'œil et ouvraient d'autres onglets pour savoir qui était derrière : ils arrivaient à des conclusions mieux fondées, bien plus vite.",
          "La question utile n'est pas « ce site a-t-il l'air sérieux ? » mais « que disent de lui des sources indépendantes ? » : qui le finance, qui l'écrit, que vaut ce qu'il avance ailleurs."
        ], [["#biais/halo", "Effet de halo"], ["#sophismes/autorite", "Argument d'autorité"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "laterale").lancer(zone), "D'autres sites");
      }, "Site");
    }
  }
);

[["biais:halo", "#tests/laterale"], ["sophismes:autorite", "#tests/laterale"]].forEach(([cle, adresse]) => {
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), adresse])];
});

// ===================== Bilan avant et après =====================
// Deux formes parallèles de 20 questions : les mêmes 20 notions (10 biais, 10 sophismes), les mêmes leurres,
// mais la situation du champ cas pour la forme A et celle du champ cas2 pour la forme B. Tirage fixe
// (generateur(2026)) : tout le monde passe les mêmes formes. Résultats dans « bilanFormes ».
function formesParalleles() {
  const alea = generateur(2026);
  const sures = type => TYPES[type].fiches.filter(f => f.cas && f.cas2
    && !SITUATIONS_DOUTEUSES.has(cleFiche(type, f) + "#1") && !SITUATIONS_DOUTEUSES.has(cleFiche(type, f) + "#2"));
  const notions = ["biais", "sophismes"].flatMap(type => melanger(sures(type), alea).slice(0, 10).map(fiche => ({ type, fiche })));
  notions.forEach(n => { n.options = choisirOptions(n.type, n.fiche, alea); });
  const forme = (champ, graine) => melanger(notions, generateur(graine)).map(n => ({ ...n, cas: n.fiche[champ] }));
  return { A: forme("cas", 1), B: forme("cas2", 2) };
}

EXPERIENCES.push(
  {
    id: "avant-apres",
    section: "confiance",
    picto: "calendrier",
    couleur: "#2f6db5",
    duree: "2 × 8 min",
    titre: "Bilan avant et après",
    resume: "Vingt situations à identifier maintenant, vingt autres sur les mêmes notions dans quelques semaines : avez-vous progressé ?",
    lancer(zone) {
      const passe = lire("bilanFormes", {});
      zone.innerHTML = "";
      const dateDe = j => new Date(j * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      zone.appendChild(paragraphe("La forme A se passe au début ; la forme B, sur les mêmes vingt notions avec d'autres situations, après quelques semaines de pratique. Ces deux formes n'ont pas été validées : rien ne garantit qu'elles soient de même difficulté, et un écart de quelques points peut tenir au hasard.", "consigne-longue"));
      ["A", "B"].forEach(f => {
        if (passe[f]) zone.appendChild(paragraphe("Forme " + f + " : " + passe[f].score + " / 20, le " + dateDe(passe[f].jour) + ".", "source"));
      });
      if (passe.A && passe.B) {
        const d = passe.B.score - passe.A.score;
        zone.appendChild(el("p", "grand-score", (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d)));
        zone.appendChild(paragraphe(Math.abs(d) <= 3 ? "Un écart de 3 points ou moins ne permet pas de conclure : avec 20 questions, il est à la portée du hasard." : d > 0 ? "Un progrès net, sous réserve que les deux formes soient de difficulté comparable." : "Un recul net : la forme B est peut-être plus difficile, ou certaines notions se sont effacées."));
      }
      const forme = !passe.A ? "A" : !passe.B ? "B" : null;
      if (passe.A && !passe.B && aujourdHui() - passe.A.jour < 14) zone.appendChild(paragraphe("Pour mesurer un progrès, attendez de préférence deux semaines au moins après la forme A, en pratiquant entre-temps.", "source"));
      if (forme) {
        const b = el("button", "bouton large", "Commencer la forme " + forme);
        b.dataset.suivant = "1";
        b.addEventListener("click", () => passer(forme));
        zone.appendChild(b);
      } else {
        const b = el("button", "bouton secondaire", "Effacer et recommencer");
        b.addEventListener("click", () => { ecrire("bilanFormes", {}); EXPERIENCES.find(x => x.id === "avant-apres").lancer(zone); });
        zone.appendChild(b);
      }

      function passer(forme) {
        derouler(zone, formesParalleles()[forme], (q, zone, fini) => {
          zone.appendChild(el("p", "consigne", "Quel " + (q.type === "biais" ? "biais" : "sophisme") + " cette situation illustre-t-elle ?"));
          zone.appendChild(el("p", "cas", q.cas));
          const boutons = q.options.map((o, k) => {
            const b = boutonChoix(o.nom, k);
            b.addEventListener("click", () => {
              boutons.forEach(x => { x.disabled = true; });
              boutons[q.options.indexOf(q.fiche)].classList.add("juste");
              if (o !== q.fiche) b.classList.add("faux");
              const retour = el("div", "retour-quiz");
              retour.appendChild(el("p", "verdict " + (o === q.fiche ? "juste" : "faux"), o === q.fiche ? "Juste." : "Réponse : " + q.fiche.nom + "."));
              zone.appendChild(retour);
              fini(o === q.fiche, retour);
            });
            zone.appendChild(b);
            return b;
          });
        }, resultats => {
          const score = resultats.filter(Boolean).length;
          ecrire("bilanFormes", { ...lire("bilanFormes", {}), [forme]: { jour: aujourdHui(), score } });
          zone.innerHTML = "";
          zone.appendChild(el("p", "consigne", "Forme " + forme));
          zone.appendChild(el("p", "grand-score", score + " / 20"));
          if (forme === "A") {
            zone.appendChild(paragraphe("Revenez dans quelques semaines pour la forme B. Vous pouvez noter la date dans votre agenda."));
            const agenda = el("button", "bouton secondaire", "Ajouter un rappel à l'agenda");
            agenda.addEventListener("click", () => fichierAgenda("bilan-forme-b.ics", [{ jour: aujourdHui() + 21, titre: "Esprit critique : bilan, forme B", description: "https://esprit-critique.github.io/#tests/avant-apres", url: "https://esprit-critique.github.io/#tests/avant-apres" }]));
            zone.appendChild(agenda);
          }
          ajouterExplication(zone, "Mesurer un progrès", [
            "Repasser le même test mesure surtout le souvenir des réponses. Deux formes parallèles évitent cet écueil, à condition d'être aussi difficiles l'une que l'autre, ce qui se vérifie d'ordinaire en les faisant passer à de nombreuses personnes. Ces deux formes-ci ne l'ont pas été : prenez l'écart comme une indication, pas comme une mesure."
          ], [["#portrait", "Votre portrait"]]);
          boutonRejouer(zone, () => EXPERIENCES.find(x => x.id === "avant-apres").lancer(zone), "Retour au bilan");
        }, "Question");
      }
    }
  }
);
