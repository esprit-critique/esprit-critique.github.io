// grand-test.js (anglais) : les générateurs d'items du Grand test, en anglais. Ils reprennent ceux de ../grand-test.js
// (mêmes tirages, mêmes calculs, mêmes rangs de bonne réponse et de leurre) mais écrivent leurs phrases en anglais :
// l'ordre des mots, l'article et l'accord ne sont pas ceux du français, d'où des gabarits à eux. Les morceaux de phrase
// (« surfaces ») sont déjà en anglais : static/en/grand-test-donnees.js les a remplacés dans les données.
// instanceGT (../grand-test.js) emploie GENERATEURS_GT_EN[f.generer] quand la page est en anglais.

// Accords d'un texte selon le genre de la personne : {p} prénom, {Il}/{il} (He/She), {lui} (him/her), {his} (his/her), {self} (himself/herself)
function accorderEN(texte, prenom, genre) {
  const f = genre === "f";
  return texte.replace(/\{p\}/g, prenom).replace(/\{Il\}/g, f ? "She" : "He").replace(/\{il\}/g, f ? "she" : "he")
    .replace(/\{lui\}/g, f ? "her" : "him").replace(/\{his\}/g, f ? "her" : "his").replace(/\{self\}/g, f ? "herself" : "himself");
}

const GENERATEURS_GT_EN = {
  // ---------- Axe A ----------
  vitesseMoyenne(f, i) {
    const [a, b] = f.nombres[i % f.nombres.length], [prenom, genre] = prenomGT(i, 1);
    const juste = 2 * a * b / (a + b), leurre = (a + b) / 2;
    return {
      type: "calcul", unite: "km/h",
      texte: accorderEN("{p} " + f.surfaces[i] + ". On the way there, {his} average speed is " + a + " km/h; on the way back, by the same route, " + b + " km/h.", prenom, genre),
      question: "What is the average speed over the whole round trip?",
      juste, leurre, valeurs: { a, b },
      explication: "The slower leg takes longer: it weighs more in the average. For a distance d, the total time is d/" + a + " + d/" + b + ", and the average speed is 2d divided by that time, which is " + nombreGT(juste) + " km/h. The simple average, " + nombreGT(leurre) + " km/h, forgets that more time is spent at " + a + " km/h."
    };
  },
  hausseBaisse(f, i) {
    const [base, p] = f.nombres[i % f.nombres.length], [objet] = f.surfaces[i];
    const juste = Math.round(base * (1 + p / 100) * (1 - p / 100) * 100) / 100, hausse = base * (1 + p / 100);
    return {
      type: "calcul", unite: "€",
      texte: objet + " is €" + nombreGT(base) + ". It rises by " + p + "%, then, the following month, falls by " + p + "%.",
      question: "What is its final value, in euros?",
      juste, leurre: base, valeurs: { base, p },
      explication: "The fall applies to the value that has already risen, €" + nombreGT(hausse) + ", and not to €" + nombreGT(base) + ". " + p + "% of €" + nombreGT(hausse) + " is more than " + p + "% of €" + nombreGT(base) + ": you end up lower than you started, at €" + nombreGT(juste) + "."
    };
  },
  piquets(f, i) {
    const [longueur, pas] = f.nombres[i % f.nombres.length], [lieu, pluriel, singulier, participe] = f.surfaces[i];
    const n = longueur / pas;
    return {
      type: "calcul", unite: pluriel,
      texte: lieu + " is " + longueur + " metres long. " + majuscule(singulier) + " is " + participe + " every " + pas + " metres, from one end to the other, including one at each end.",
      question: "How many are needed in all?",
      juste: n + 1, leurre: n, valeurs: { longueur, pas },
      explication: longueur + " metres make " + n + " intervals of " + pas + " metres. You need one more than there are intervals, since both ends have one: " + (n + 1) + ". A quick sketch with three intervals is enough to see it."
    };
  },
  moyennePonderee(f, i) {
    const [n1, m1, n2, m2] = f.nombres[i % f.nombres.length], [cadre, g1, g2, mesure, unite] = f.surfaces[i];
    const juste = (n1 * m1 + n2 * m2) / (n1 + n2), leurre = (m1 + m2) / 2;
    return {
      type: "calcul", unite,
      texte: cadre + ", " + mesure + " is " + m1 + " " + unite + " for the " + n1 + " " + g1 + ", and " + m2 + " " + unite + " for the " + n2 + " " + g2 + ".",
      question: "What is the average for all " + (n1 + n2) + " taken together?",
      juste, leurre, valeurs: { n1, m1, n2, m2 },
      explication: "The larger group counts for more: you have to weight by the group sizes. (" + n1 + " × " + m1 + " + " + n2 + " × " + m2 + ") ÷ " + (n1 + n2) + " = " + nombreGT(juste) + ". The average of the two averages, " + nombreGT(leurre) + ", treats the two groups as if they were the same size."
    };
  },
  porteeNegation(f, i) {
    const [groupe, , positif, negatifUn, negatifAucun] = f.surfaces[i];
    return {
      type: "qcm",
      texte: "A claim is going round: “All the " + groupe + " " + positif + ".” We learn that it is false.",
      question: "What can we conclude with certainty?",
      choix: ["At least one of the " + groupe + " " + negatifUn + ".", "None of the " + groupe + " " + negatifAucun + ".",
        "Some of the " + groupe + " " + positif + ".", "All the " + groupe + " " + positif + ", except one."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "For “all” to be false, a single exception is enough. So we know that at least one is an exception. We know neither how many exceptions there are, nor whether any of them still fit the claim."
    };
  },
  presuppose(f, i) {
    const [texte, question, fait, raisons] = f.surfaces[i];
    return {
      type: "qcm",
      texte: texte + " Question asked: “" + question + "”",
      question: "What is the best answer?",
      choix: ["The text does not say that " + fait + ": the question assumes a fact that has not been established.", raisons[0], raisons[1], raisons[2]],
      juste: 0, leurre: 1, valeurs: {},
      explication: "The question slips in a fact that nothing establishes: " + fait + ". Looking for a reason means accepting that fact without proof. Before answering “why?”, check that it actually happened."
    };
  },
  relations(f, i) {
    // surfaces : [adjectif, superlatif, comparatif de l'inverse, (idem)]
    const [pos, superlatif, neg] = f.surfaces[i];
    const p = [prenomGT(i, 2), prenomGT(i, 3), prenomGT(i, 4)];
    return {
      type: "qcm",
      texte: p[0][0] + " is less " + pos + " than " + p[1][0] + ". " + p[1][0] + " is " + neg + " than " + p[2][0] + ".",
      question: "Which of these three people is " + superlatif + "?",
      choix: [p[2][0], p[0][0], p[1][0], "It cannot be known from this information."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Put the two sentences in the same direction: " + p[0][0] + " is less " + pos + " than " + p[1][0] + ", and " + p[1][0] + " is less " + pos + " than " + p[2][0] + ". The order is therefore " + p[0][0] + ", " + p[1][0] + ", " + p[2][0] + ". Reading “less” and “" + neg + "” too quickly reverses the ranking."
    };
  },
  seulementSi(f, i) {
    const [regle, action, condition, infinitif] = f.surfaces[i], [prenom, genre] = prenomGT(i, 5);
    const fait = accorderEN("{p} " + action, prenom, genre);
    return {
      type: "qcm",
      texte: regle + " " + accorderEN("{p} " + condition + ".", prenom, genre),
      question: "What can we conclude?",
      choix: ["We cannot tell whether " + fait + ".", fait + ".", prenom + " is not allowed to " + infinitif + ".", "Everyone can now " + infinitif + "."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "“You can only … if …” gives a necessary condition: without it, impossible; with it, nothing is guaranteed. " + accorderEN("{p} " + condition, prenom, genre) + ", but nothing says that " + fait + ". Concluding the opposite amounts to reading “if” as “only if”."
    };
  },
  syllogisme(f, i) {
    const x = instancesSyllogisme(f)[i];
    const tousEN = ([nom]) => "all " + nom, certainsEN = ([nom]) => "some " + nom;
    let premisses, conclusion;
    if (f.forme === "chaine") { premisses = [majuscule(tousEN(x.a)) + " are " + x.b[0] + ".", majuscule(tousEN(x.b)) + " are " + x.c[0] + "."]; conclusion = "So " + tousEN(x.a) + " are " + x.c[0] + "."; }
    if (f.forme === "exclusion") { premisses = [majuscule(tousEN(x.a)) + " are " + x.b[0] + ".", majuscule(x.b[0]) + " are never " + x.c[0] + "."]; conclusion = "So " + x.a[0] + " are never " + x.c[0] + "."; }
    if (f.forme === "moyen") { premisses = [majuscule(tousEN(x.a)) + " are " + x.c[0] + ".", majuscule(tousEN(x.b)) + " are " + x.c[0] + "."]; conclusion = "So " + tousEN(x.a) + " are " + x.b[0] + "."; }
    if (f.forme === "certains") { premisses = [majuscule(tousEN(x.a)) + " are " + x.c[0] + ".", majuscule(certainsEN(x.c)) + " are " + x.b[0] + "."]; conclusion = "So " + certainsEN(x.a) + " are " + x.b[0] + "."; }
    const explications = {
      chaine: "If all the first are included in the second, and the second in the third, the first are necessarily included in the third: the argument is valid, whatever the subject.",
      exclusion: "If all the first are in a set that has nothing in common with a third, the first have nothing in common with it either: the argument is valid, whatever the subject.",
      moyen: "Two groups can belong to the same larger set without either being included in the other: the argument is not valid, even when the conclusion is true.",
      certains: "The “some” that the second sentence talks about may not be the ones in the first: the argument is not valid, even when the conclusion is true."
    };
    const croyance = "The conclusion looks " + (f.credible ? "true" : "false") + "; ";
    return {
      type: "binaire",
      texte: premisses.join(" ") + " " + conclusion,
      question: "Suppose the first two sentences are true, even if they seem false to you. Does the conclusion necessarily follow?",
      choix: ["Yes, the argument is valid", "No, it is not valid"],
      juste: f.valide, leurre: f.valide === f.credible ? null : f.credible,
      valeurs: { credible: f.credible }, credible: f.credible,
      explication: explications[f.forme] + " " + croyance + "only the form of the argument matters."
    };
  },

  // ---------- Axe B ----------
  tauxDeBase(f, i) {
    const [prev, sens, fp] = f.nombres[i % f.nombres.length];
    const [cadre, cherche, appareil, ensemble] = surfacesDe(f)[(i + (f.decalage || 0)) % surfacesDe(f).length];
    const vrais = 100 * prev * sens / 100, faux = (10000 - 100 * prev) * fp / 100, juste = Math.round(100 * vrais / (vrais + faux));
    const leurre = f.prevalence === "faible" ? sens : prev;
    const candidats = (f.prevalence === "faible" ? [100 - fp, 50, 75, 25] : [Math.round(prev * sens / 100), 100 - sens, 30, 20]).filter(v => v !== juste && v !== leurre);
    const autres = [...new Set(candidats)].slice(0, 2);
    return {
      type: "qcm",
      texte: cadre + ", we want to spot " + cherche + ": on average, this is the case for " + pourcentGT(prev) + " of " + ensemble + ". " + appareil + " raises the alert for " + pourcentGT(sens) + " of the cases being looked for, but also, wrongly, for " + pourcentGT(fp) + " of the others.",
      question: "The system raises the alert. Roughly what is the probability that it really is " + cherche + "?",
      choix: ["About " + pourcentGT(juste), "About " + pourcentGT(leurre), "About " + pourcentGT(autres[0]), "About " + pourcentGT(autres[1])],
      juste: 0, leurre: 1, valeurs: { prev, sens, fp },
      explication: "Out of 10,000 cases, " + nombreGT(100 * prev) + " are affected: the alert flags " + nombreGT(vrais) + " of them. Out of the other " + nombreGT(10000 - 100 * prev) + ", it wrongly flags " + nombreGT(faux) + ". Of " + nombreGT(vrais + faux) + " alerts, " + nombreGT(vrais) + " therefore correspond to real cases, about " + pourcentGT(juste) + (f.prevalence === "faible" ? ": what is rare stays rare, even after an alert." : ": when what you are looking for is common, an alert is most often right.")
    };
  },
  conjonction(f, i) {
    const [portrait, a, b, c] = f.surfaces[i], [prenom, genre] = prenomGT(i, 6);
    const P = accorderEN(portrait, prenom, genre), dire = t => accorderEN("{p} " + t, prenom, genre), reste = t => accorderEN(t, prenom, genre);
    return {
      type: "qcm",
      texte: P,
      question: "Which of these statements is the most probable?",
      choix: [dire(a) + ".", dire(a) + " and " + reste(b) + ".", dire(a) + " and " + reste(c) + ".", dire(a) + ", " + reste(b) + " and " + reste(c) + "."],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Every option that adds a condition describes a special case of the first: it cannot be more probable. The portrait makes the second trait plausible, but the first statement also has to be true. The more detailed a description, the less probable it is, even if it seems more plausible."
    };
  },
  echantillon(f, i) {
    const [n1, n2, seuil] = f.nombres[i % f.nombres.length], [deux, grand, petit, unites, evenement] = f.surfaces[i];
    const minus = t => t.charAt(0).toLowerCase() + t.slice(1);
    return {
      type: "qcm",
      texte: "We are comparing " + deux + ". Each day, " + minus(grand) + " sees about " + n1 + " " + unites + " pass through, " + minus(petit) + " about " + n2 + ". Each one, independently of the others, " + evenement + " half the time.",
      question: "Over a year, which has more days when this proportion exceeds " + seuil + "%?",
      choix: [petit, grand, "About the same in both", "Impossible to say without knowing the days of the week"],
      juste: 0, leurre: 2, valeurs: { n1, n2, seuil },
      explication: "The smaller a sample, the more often its proportion strays from the average: with " + n2 + " people, a few choices are enough to exceed " + seuil + "%. With " + n1 + ", the deviations cancel out. Extreme results therefore come more often from small samples."
    };
  },
  regression(f, i) {
    const [t1, t2, b1, b2] = f.nombres[i % f.nombres.length], [epreuve, participants] = f.surfaces[i];
    return {
      type: "qcm",
      texte: "In " + epreuve + ", we follow the top 10% of " + participants + " on the first one. On average, they go from " + t1 + " to " + t2 + " points. The bottom 10%, meanwhile, go from " + b1 + " to " + b2 + " points. The overall average is the same in both.",
      question: "What is the most likely explanation?",
      choix: ["The first result mixed ability and luck; luck does not repeat, and extremes move back towards the average.",
        "The best relaxed after their success.", "The second time was harder for everyone.", "The weakest copied the best."],
      juste: 0, leurre: 1, valeurs: { t1, t2, b1, b2 },
      explication: "A very good result reflects ability, but also the luck of the day, which does not necessarily repeat. The best fall back and the weakest rise, while the overall average does not move: this is regression to the mean. It needs no psychological explanation."
    };
  },
  risqueRelatif(f, i) {
    const [n, hausse] = f.nombres[i % f.nombres.length], [facteur, evenement, population] = f.surfaces[i];
    const juste = n * hausse / 100, leurre = hausse * 100;
    return {
      type: "qcm",
      texte: "A (fictitious) study announces: “" + facteur + " increases the risk of " + evenement + " by " + hausse + "%.” Without it, this risk affects " + n + " " + population + " in 10,000.",
      question: "Out of 10,000 " + population + " affected, how many extra cases should we expect?",
      choix: [nombreGT(juste) + " cases", nombreGT(leurre) + " cases", nombreGT(n + juste) + " cases", nombreGT(n * hausse) + " cases"],
      juste: 0, leurre: 1, valeurs: { n, hausse },
      explication: "“+" + hausse + "%” is a relative increase: it applies to the usual " + n + " cases. " + hausse + "% of " + n + " makes " + nombreGT(juste) + " extra cases in 10,000, or " + nombreGT(n + juste) + " in all. A rare risk stays rare, even when it rises a lot in percentage terms."
    };
  },
  esperance(f, i) {
    const [mise, gain, k] = f.nombres[i % f.nombres.length], jeu = f.surfaces[i];
    const juste = gain / k - mise, signe = v => (v > 0 ? "+" : v < 0 ? "−" : "") + "€" + nombreGT(Math.abs(v));
    return {
      type: "qcm",
      texte: "At " + jeu + ", a game costs €" + mise + ". You receive €" + gain + " with a 1-in-" + k + " chance, and nothing otherwise; the stake is never returned.",
      question: "On average, how much do you win (or lose) per game?",
      choix: [signe(juste), signe(gain - mise), signe(gain / k), signe(-mise)],
      juste: 0, leurre: 1, valeurs: { mise, gain, k },
      explication: "On average, one game brings in €" + gain + " × 1/" + k + " = €" + nombreGT(gain / k) + ", and always costs €" + mise + ". The average result is therefore " + signe(juste) + " per game. The advertised prize, €" + gain + ", comes up only once in " + k + "."
    };
  },
  simpson(f, i) {
    const [a1, na1, a2, na2, b1, nb1, b2, nb2] = f.nombres[i % f.nombres.length], [titre, succes, g1, g2] = f.surfaces[i];
    const pc = (k, n) => pourcentGT(Math.round(100 * k / n));
    return {
      type: "qcm",
      texte: "We compared " + titre.charAt(0).toLowerCase() + titre.slice(1) + " (" + succes + "). Method A: " + a1 + " out of " + na1 + " for the " + g1 + ", " + a2 + " out of " + na2 + " for the " + g2 + ", i.e. " + (a1 + a2) + " out of " + (na1 + na2) + " overall. Method B: " + b1 + " out of " + nb1 + " for the " + g1 + ", " + b2 + " out of " + nb2 + " for the " + g2 + ", i.e. " + (b1 + b2) + " out of " + (nb1 + nb2) + " overall.",
      question: "For the " + g1 + " as for the " + g2 + ", which method does better?",
      choix: ["Method A", "Method B", "Both do equally well", "It depends on the total number of cases"],
      juste: 0, leurre: 1, valeurs: {},
      explication: "Group by group, A does better: " + pc(a1, na1) + " against " + pc(b1, nb1) + ", then " + pc(a2, na2) + " against " + pc(b2, nb2) + ". Overall, B seems better because it mostly handled the easy cases. This is Simpson’s paradox: a total can reverse what each group shows."
    };
  },
  joueur(f, i) {
    const [objet, issue, k, n] = f.surfaces[i];
    const chance = "1 chance in " + k;
    return {
      type: "qcm",
      texte: objet + " has just landed on " + issue + " " + n + " times in a row.",
      question: "On the next try, what is the probability of landing on " + issue + " again?",
      choix: [majuscule(chance), "Less than " + chance + ": such a streak has to end", "More than " + chance + ": the streak is on", "It depends on the total number of tries already made"],
      juste: 0, leurre: 1, valeurs: { k, n },
      explication: "Each try is independent: the object has no memory and does not “catch up” on anything. The probability stays at " + chance + ", streak or no streak. Long streaks are also more common by chance than people think."
    };
  },
  denominateur(f, i) {
    const [part, evenement, groupe, conclusion, ensemble] = f.surfaces[i];
    return {
      type: "qcm",
      texte: pourcentGT(part) + " of " + evenement + " involve " + groupe + ". Someone concludes that " + conclusion + ".",
      question: "What do you need to know to judge this conclusion?",
      choix: ["The share of " + groupe + " among the " + ensemble + ".", "Nothing more: " + pourcentGT(part) + " is a clear majority.",
        "The total number of cases recorded.", "The date on which these figures were published."],
      juste: 0, leurre: 1, valeurs: { part },
      explication: "If " + groupe + " already make up " + pourcentGT(part) + " of the " + ensemble + ", this figure shows nothing in particular. You have to compare the share of the cases with the group’s share of the whole. Without that denominator, the conclusion does not hold."
    };
  },
  unites(f, i) {
    const [objet, verbe, options] = f.surfaces[i];
    const base = options.map(([v, , facteur]) => v * facteur), texteOpt = ([v, u]) => nombreGT(v, 3) + " " + u;
    const juste = base.indexOf(Math.max(...base)), leurre = options.map(o => o[0]).indexOf(Math.max(...options.map(o => o[0])));
    const ordre = [juste, leurre, ...[0, 1, 2, 3].filter(k => k !== juste && k !== leurre)];
    return {
      type: "qcm",
      texte: "We are comparing four " + objet + ": here are their measurements.",
      question: "Which of these four measurements is the largest?",
      choix: ordre.map(k => texteOpt(options[k])),
      juste: 0, leurre: 1, valeurs: {},
      explication: "You have to convert everything into the same unit before comparing: the biggest number is not necessarily the biggest quantity. Here, " + texteOpt(options[juste]) + " wins. " + texteOpt(options[leurre]) + " shows the biggest number, in a smaller unit."
    };
  },
  pointsPourcents(f, i) {
    const [a, b] = f.nombres[i % f.nombres.length], sujet = f.surfaces[i];
    const points = a - b, rel = 100 * points / a, faux = 100 * points / b;
    const environ = x => (Number.isInteger(x) ? "" : "about ") + pourcentGT(Math.round(x));
    return {
      type: "qcm",
      texte: sujet + " goes from " + pourcentGT(a) + " to " + pourcentGT(b) + ".",
      question: "Which description is accurate?",
      choix: ["A drop of " + points + " points, or " + environ(rel) + " less.", "A drop of " + points + " points, or " + pourcentGT(points) + " less.",
        "A drop of " + Math.round(rel) + " points, or " + pourcentGT(points) + " less.", "A drop of " + points + " points, or " + environ(faux) + " less."],
      juste: 0, leurre: 1, valeurs: { a, b },
      explication: "The difference between two percentages is counted in points: " + a + " − " + b + " = " + points + " points. Relative to the starting value, it amounts to " + environ(rel) + " less. Confusing points and percentages makes a change look smaller or larger than it is."
    };
  },
  montyIgnorant(f, i) {
    const [pluriel, singulier, , ouvreur, n] = f.surfaces[i];
    return {
      type: "qcm",
      texte: "A prize is hidden in one of " + n + " " + pluriel + ". You choose one, without opening it. " + ouvreur + ": it does not contain the prize. You are offered the chance to switch to another " + singulier + " that is still closed.",
      question: "Is it in your interest to switch?",
      choix: ["No: each " + singulier + " that is still closed now has the same chance, 1 in " + (n - 1) + ".", "Yes: switching improves your chances, as in the Monty Hall problem.",
        "No: sticking with your first choice is always safer.", "Yes, but only if you switch twice."],
      juste: 0, leurre: 1, valeurs: { n },
      explication: "In the Monty Hall problem, the host knows where the prize is and always opens an empty one: that is what makes switching advantageous. Here, the opening is down to chance, and it could have revealed the prize. All the " + pluriel + " still closed therefore have the same chance: the solution does not carry over when the rules change."
    };
  },
};

// ---------- Démonstrations de mémoire, en anglais (appelées par demonstrationDRM, demonstrationRecit et demonstrationSource) ----------
function demonstrationDRM_EN(i, graine) {
  const [critique, mots, sansRapport] = LISTES_DRM_GT[i];
  const appris = [mots[1], mots[5], mots[8]];
  const test = melanger([...appris.map(m => ({ mot: m, present: true, critique: false })), { mot: critique, present: false, critique: true },
    ...sansRapport.map(m => ({ mot: m, present: false, critique: false }))], generateur(graineDe("drm@" + i + ":" + graine)));
  return { instanceId: "drm@" + i, type: "drm", liste: mots, critique, test,
    explication: "“" + critique + "” was not in the list: all the words you learned were associated with it. Memory retains the general meaning, then fills in; the word that sums up the list then seems familiar. This false memory is often accompanied by real certainty." };
}

function demonstrationRecit_EN(i, graine) {
  const [scene, objet, vue, suggeree, autres] = RECITS_GT[i];
  const [prenom, genre] = prenomGT(i, 9);
  const choix = melanger([vue, suggeree, ...autres], generateur(graineDe("recit@" + i + ":" + graine)));
  return { instanceId: "recit@" + i, type: "recit",
    recit: accorderEN(scene.replace("{c}", vue), prenom, genre),
    questionTrompeuse: "Was " + prenom + "’s " + suggeree + " " + objet + " rather new or rather worn?",
    reponsesTrompeuse: ["Rather new", "Rather worn", "I don’t know"],
    reconnaissance: "In the story, what colour was the " + objet + "?",
    choix, vue, suggeree,
    explication: "In the story, the " + objet + " was " + vue + ". The next question spoke of the " + suggeree + " " + objet + ": information slipped in afterwards can blend with the memory. This is the misinformation effect, studied notably by Elizabeth Loftus." };
}

function demonstrationSource_EN(i, graine) {
  const [sourceA, sourceB, infos] = SOURCES_GT[i % SOURCES_GT.length];
  const combinaison = COMBINAISONS_SOURCE_GT[Math.floor(i / SOURCES_GT.length) % COMBINAISONS_SOURCE_GT.length];
  const lues = infos.map((t, k) => ({ texte: t, source: combinaison >> k & 1 ? sourceA : sourceB }));
  return { instanceId: "source@" + i, type: "source", sources: [sourceA, sourceB], lues,
    test: melanger(lues, generateur(graineDe("source@" + i + ":" + graine))),
    explication: "We often remember a piece of information without recalling where it came from. The content and its source are stored partly separately, and the source fades faster. Before repeating a piece of information, ask yourself where you read it." };
}
