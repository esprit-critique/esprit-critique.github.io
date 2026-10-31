
// ===================== Profil d'une passation =====================
// Cinq axes séparés, chacun avec sa plage plausible et son nombre d'items, puis l'indicateur d'impartialité à part.
// Aucun score global, aucun rang, aucune étiquette sur la personne : les libellés décrivent des réponses.

const AXES_GT = {
  A: { nom: "Réflexion et logique", mesure: "Résister à une réponse intuitive fausse ; juger un raisonnement sur sa forme." },
  B: { nom: "Probabilités et statistiques", mesure: "Taux de base, hasard, échantillons, risques, moyennes." },
  C: { nom: "Peser les preuves", mesure: "Ce qu'une étude ou une observation permet de conclure, ni plus ni moins." },
  D: { nom: "Discernement", mesure: "Distinguer le vrai du faux, séparément de la tendance à répondre « vrai » ou « faux »." },
  E: { nom: "Étalonnage", mesure: "Votre certitude correspond-elle à votre taux de réussite ?" },
  F: { nom: "Impartialité (indicateur exploratoire)", mesure: "Juger la force d'un argument sans favoriser son propre camp." }
};
const pourcentArrondi = x => Math.round(100 * x) + " %";

// Ligne de résultat d'un axe de réussite (A, B, C)
function resumeProportion(axe, s, hasard) {
  if (!s || !s.n) return "Non mesuré dans ce test.";
  if (s.n < ITEMS_MIN_PLAGE) return s.n + " item" + (s.n > 1 ? "s" : "") + " seulement : trop peu pour estimer.";
  const r = { n: s.n, bas: s.plage.bas, haut: s.plage.haut };
  return pourcentArrondi(s.valeur) + " de réponses justes sur " + s.n + " items. Plage plausible : de " + pourcentArrondi(s.plage.bas) + " à " + pourcentArrondi(s.plage.haut)
    + ". " + majuscule(interpreterProportion(r, hasard)) + (hasard !== null ? " (hasard : " + pourcentArrondi(hasard) + ")" : "") + "."
    + (precisionDe(s.n) === "faible" ? " Précision faible : peu d'items." : "");
}

function afficherProfil(zone, runId) {
  const t = GT.etat.historiqueTests.find(x => x.id === runId);
  if (!t) return;
  const scores = calculerScores(t);
  const lignes = lignesPassation(t);
  zone.appendChild(el("h2", "titre-section", "Vos résultats"));
  zone.appendChild(el("p", "etiquette", "Test " + t.mode + (t.dateFin ? ", terminé le " + new Date(t.dateFin).toLocaleDateString("fr-FR") : "")));
  zone.appendChild(paragraphe("Il n'y a pas de score global : chaque axe se lit séparément, avec sa marge d'incertitude. Ces résultats décrivent vos réponses à ce test, pas votre valeur."));

  const axes = el("div", "gt-axes");
  ["A", "B", "C"].forEach(a => {
    const chances = lignes.filter(l => l.item.axe === a && l.juste !== null).map(l => l.item.chance);
    const hasard = a === "A" ? hasardConventionnel(chances) : 0.25;
    const bloc = blocAxe(a);
    bloc.appendChild(paragraphe(resumeProportion(a, scores[a], hasard)));
    if (a === "A") {
      const part = partLeurre(lignes.filter(l => l.item.axe === "A" && l.juste !== null).map(l => ({ juste: l.juste, leurre: l.leurre })));
      if (part !== null) bloc.appendChild(paragraphe("Parmi vos erreurs, " + pourcentArrondi(part) + " correspondaient exactement à la réponse intuitive que la question suggérait.", "source"));
      if (a === "A" && t.mode === "complet") {
        const syl = lignes.filter(l => l.item.type === "binaire" && l.reponse.valeur !== null).map(l => ({ credible: l.item.credible, repondValide: l.reponse.valeur === true }));
        const b = biaisCroyance(syl);
        if (b !== null) bloc.appendChild(paragraphe("Indicateur exploratoire : vous avez jugé « valides » " + (b > 0 ? pourcentArrondi(b) + " de raisonnements de plus quand leur conclusion était crédible" : b < 0 ? pourcentArrondi(-b) + " de raisonnements de moins quand leur conclusion était crédible" : "autant de raisonnements à conclusion crédible que non crédible") + ", sur " + syl.length + " raisonnements. Seule la forme aurait dû compter.", "source"));
      }
    }
    axes.appendChild(bloc);
  });
  // D
  const d = blocAxe("D");
  if (scores.D.valeur !== null) {
    d.appendChild(paragraphe("Discernement (d′) : " + nombreGT(Math.round(scores.D.valeur * 100) / 100) + (scores.D.plage ? ", plage plausible de " + nombreGT(Math.round(scores.D.plage.bas * 100) / 100) + " à " + nombreGT(Math.round(scores.D.plage.haut * 100) / 100) : "")
      + ". Zéro correspond au hasard, 3,54 au maximum possible avec 12 affirmations vraies et 12 fausses."));
    const c = scores.D.c;
    d.appendChild(paragraphe("Tendance de réponse (c) : " + nombreGT(Math.round(c * 100) / 100) + (c > 0.2 ? ", une tendance à répondre « faux »." : c < -0.2 ? ", une tendance à répondre « vrai »." : ", sans tendance marquée.") + " Discerner et avoir une tendance sont deux choses différentes.", "source"));
  } else {
    const vf = lignes.filter(l => l.item.type === "vf" && l.juste !== null);
    d.appendChild(paragraphe(vf.length ? vf.filter(l => l.juste).length + " affirmations jugées correctement sur " + vf.length + ". Démonstration seulement : le test express compte trop peu d'affirmations pour estimer le discernement." : "Non mesuré dans ce test."));
  }
  axes.appendChild(d);
  // E
  const e = blocAxe("E");
  if (scores.E.valeur !== null) {
    const sc = scores.E.valeur;
    e.appendChild(paragraphe("Écart entre certitude moyenne et réussite : " + (sc >= 0 ? "+" : "−") + Math.abs(Math.round(100 * sc)) + " points"
      + (scores.E.plage ? " (plage plausible de " + Math.round(100 * scores.E.plage.bas) + " à " + Math.round(100 * scores.E.plage.haut) + ")" : "") + ", sur " + scores.E.n + " réponses. "
      + (scores.E.plage && scores.E.plage.bas > 0 ? "Votre certitude a dépassé votre réussite." : scores.E.plage && scores.E.plage.haut < 0 ? "Vous avez été moins sûr que vous auriez pu l'être." : "Pas d'écart net entre certitude et réussite.")));
    const reponses = lignes.filter(l => l.juste !== null && l.reponse.certitude !== null).map(l => ({ p: l.reponse.certitude / 100, o: l.juste ? 1 : 0 }));
    const b = brier(reponses), m = murphy(reponses);
    if (b && m) e.appendChild(paragraphe("Score de Brier : " + nombreGT(Math.round(b.score * 1000) / 1000) + " (0 est parfait). Il se décompose en fiabilité " + nombreGT(Math.round(m.fiabilite * 1000) / 1000)
      + ", moins résolution " + nombreGT(Math.round(m.resolution * 1000) / 1000) + ", plus incertitude " + nombreGT(Math.round(m.incertitude * 1000) / 1000) + ".", "source"));
  } else e.appendChild(paragraphe("Trop peu de réponses avec certitude pour estimer."));
  const fourchettes = lignes.filter(l => l.item.type === "fourchette" && Array.isArray(l.reponse.valeur))
    .map(l => ({ q: { v: l.item.q.v, unite: l.item.q.unite }, bas: l.reponse.valeur[0], haut: l.reponse.valeur[2] }));
  const bf = bilanFourchettes(fourchettes);
  if (bf) e.appendChild(paragraphe("Fourchettes « à 90 % » : " + bf.k + " sur " + bf.n + " contenaient la vraie valeur." + (bf.n < 8 ? " Trop peu de fourchettes pour en tirer une tendance." : "")));
  axes.appendChild(e);
  // F
  const f = blocAxe("F");
  if (t.mode !== "complet") f.appendChild(paragraphe("Non mesuré dans le test express."));
  else if (scores.F.valeur === null) f.appendChild(paragraphe("Non calculé : il faut avoir pris position sur au moins une question, et noter les huit arguments."));
  else f.appendChild(paragraphe("En moyenne, vous avez noté les arguments de votre camp " + (Math.abs(scores.F.valeur) < 0.05 ? "comme ceux du camp opposé" : nombreGT(Math.round(Math.abs(scores.F.valeur) * 10) / 10) + " point " + (scores.F.valeur > 0 ? "plus" : "moins") + " solides que ceux du camp opposé") + ", sur une échelle de 1 à 7. Indicateur exploratoire, fondé sur " + scores.F.n + " notes : ce n'est pas un score stable."));
  axes.appendChild(f);
  zone.appendChild(axes);

  // Sur-correction, répétitions, réponses très rapides
  const sur = indiceSurCorrection(lignes.filter(l => l.juste !== null).map(l => Object.assign({ reponse: l.reponse.valeur }, l.item)));
  if (sur && sur.indice > 0) zone.appendChild(paragraphe("Sur " + sur.n + " situations où la preuve permettait de conclure, " + Math.round(sur.indice * sur.n) + " réponse" + (sur.indice * sur.n > 1.5 ? "s ont" : " a") + " rejeté la conclusion par principe. " + MESSAGE_SUR_CORRECTION));
  const dejaVus = t.instances.filter(x => x.dejaVu).length;
  if (dejaVus) zone.appendChild(paragraphe(dejaVus + " item" + (dejaVus > 1 ? "s" : "") + " sur " + t.instances.length + " (" + pourcentArrondi(dejaVus / t.instances.length) + ") avai" + (dejaVus > 1 ? "ent" : "t") + " déjà été vu" + (dejaVus > 1 ? "s" : "") + " lors d'un test précédent.", "source"));
  const rapides = t.reponses.filter(r => r.dureeMs !== null && r.dureeMs < 2000 && r.certitude !== null).length;
  if (rapides) zone.appendChild(paragraphe(rapides + " réponse" + (rapides > 1 ? "s" : "") + " très rapide" + (rapides > 1 ? "s" : "") + " (moins de deux secondes) : à interpréter avec prudence.", "source"));

  zone.appendChild(blocCeQueLeTestNeMesurePas("h3"));
  const retour = el("button", "bouton secondaire", "Retour à l'accueil du test");
  retour.addEventListener("click", () => rafraichir());
  zone.appendChild(retour);
}

function blocAxe(a) {
  const bloc = el("section", "gt-axe");
  bloc.appendChild(el("h3", null, a + ". " + AXES_GT[a].nom));
  bloc.appendChild(el("p", "source", AXES_GT[a].mesure));
  return bloc;
}
