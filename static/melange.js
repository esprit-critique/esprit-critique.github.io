// melange.js : « Question au hasard ». À chaque question, un jeu est tiré au hasard parmi ceux qui se jouent
// en une question rapide, et l'on répond à cette question-là. Le jeu tiré est celui de sa page : mêmes questions,
// mêmes corrections, mêmes niveaux. Une question seule n'enregistre ni partie, ni record, ni portrait.
// Dépend de app.js (el, lienVers, melanger), ateliers.js (tousLesAteliers, entete) et niveaux.js (MELANGE).

// Jeux retenus : une question se répond en quelques dizaines de secondes, sans matériel ni second joueur.
// Exclus : les jeux à plusieurs étapes (Wason, Monty Hall, débats), à saisie longue (dépistage, expériences de
// pensée), ceux qui ne tiennent pas dans une seule question (rapport de deux études, placement sur plusieurs axes…).
const MELANGE_JEUX = ["monde", "mortalite", "pays", "nord", "chronologie", "vrai-faux", "hasard", "correlation",
  "graphiques", "classiques", "citations"];

// Session en cours, en mémoire seulement (perdue au rechargement)
const melange = { dernier: null, juste: 0, total: 0, passees: 0, parSection: {} };
// Une partie : vingt questions répondues (les questions passées ne comptent pas), puis le bilan par catégorie
const MELANGE_LONGUEUR = 20;

// Tire un jeu au hasard, différent du précédent
function jeuAuHasard() {
  const choix = tousLesAteliers().map(a => a.atelier).filter(j => MELANGE_JEUX.includes(j.id));
  const autres = choix.filter(j => j.id !== melange.dernier);
  const pool = autres.length ? autres : choix;
  const jeu = pool[Math.floor(Math.random() * pool.length)];
  melange.dernier = jeu.id;
  return jeu;
}

// Affiche une question d'un jeu tiré au hasard, dans la zone « partie »
function questionMelangee(zone) {
  const jeu = jeuAuHasard();
  const bandeau = zone.querySelector(".melange-jeu");
  bandeau.replaceChildren();
  bandeau.append(el("span", "melange-etiquette", T("Jeu tiré au hasard")), texteNoeud(" : "),
    lienVers(tousLesAteliers().find(a => a.atelier === jeu).adresse, jeu.titre, "lien-texte"));
  const partie = zone.querySelector(".melange-partie");
  partie.replaceChildren();
  // Le tirage d'une question l'inscrit dans « vus » (tirerSelonNiveau) : passer la question rend « vus » tel qu'il était
  const vusAvant = lire("vus", {});
  // Le jeu s'affiche dans sa propre zone : il la vide à chaque étape, sans toucher au bandeau
  const jeuZone = el("div", "melange-question");
  partie.appendChild(jeuZone);
  // « Passer cette question » : avant d'avoir répondu seulement, sans pénalité, avec une nouvelle question d'un autre jeu
  const passer = el("button", "bouton secondaire melange-passer", "Passer cette question");
  passer.type = "button";
  passer.dataset.tirer = "1";
  passer.addEventListener("click", () => {
    ecrire("vus", vusAvant);
    melange.passees += 1;
    afficherScoreMelange(zone);
    questionMelangee(zone);
  });
  const repondu = () => { passer.disabled = true; };
  jeuZone.addEventListener("click", e => { if (e.target.closest && e.target.closest("button")) repondu(); }, true);
  jeuZone.addEventListener("change", repondu, true);
  partie.appendChild(passer);
  // Pendant le lancement, deroulerNiveaux joue une seule question et rend la main à melangeFin
  MELANGE.fin = (resultat, juste) => {
    if (resultat !== null && resultat !== undefined) {
      melange.total += 1;
      if (juste) melange.juste += 1;
      const s = melange.parSection[jeu.section] || (melange.parSection[jeu.section] = { juste: 0, total: 0, couleur: jeu.couleur });
      s.total += 1;
      if (juste) s.juste += 1;
    }
    afficherScoreMelange(zone);
    if (melange.total >= MELANGE_LONGUEUR) bilanMelange(zone); else questionMelangee(zone);
  };
  MELANGE.actif = true;
  try {
    jeu.lancer(jeuZone);
  } finally {
    MELANGE.actif = false;
  }
}

function afficherScoreMelange(zone) {
  const p = zone.querySelector(".melange-score");
  const passees = melange.passees ? " " + T("Questions passées : {0}.", melange.passees) : "";
  p.textContent = typo(T("Question {0} sur {1}", Math.min(melange.total + 1, MELANGE_LONGUEUR), MELANGE_LONGUEUR) + " · " + (melange.total
    ? T("{0} bonne(s) réponse(s) sur {1}.", melange.juste, melange.total)
    : T("Les réponses ne sont pas enregistrées : elles servent à s'entraîner.")) + passees);
}

// Bilan : le score, puis un anneau par catégorie jouée (part des bonnes réponses, valeurs écrites dans l'anneau)
function bilanMelange(zone) {
  zone.querySelector(".melange-jeu").replaceChildren();
  zone.querySelector(".melange-score").replaceChildren();
  const partie = zone.querySelector(".melange-partie");
  partie.replaceChildren();
  const bilan = el("div", "melange-bilan");
  bilan.append(el("p", "consigne", "Bilan"), el("p", "grand-score", melange.juste + " / " + melange.total),
    el("p", "source", T("Par catégorie : la part de bonnes réponses. Questions passées : {0}.", melange.passees)));
  const anneaux = el("div", "anneaux");
  SECTIONS_ATELIERS.filter(sec => melange.parSection[sec.id]).forEach(sec => {
    const { juste, total, couleur } = melange.parSection[sec.id];
    const part = Math.round(100 * juste / total);
    const figure = el("figure", "anneau");
    figure.style.setProperty("--c", couleur);
    // pathLength = 100 : le tracé « part 100 » remplit exactement la part de l'anneau, quel que soit son rayon
    const dessin = svg("svg", { viewBox: "0 0 120 120", role: "img", "aria-label": T("{0} : {1} bonne(s) réponse(s) sur {2}, soit {3} %", T(sec.titre), juste, total, part) });
    dessin.append(svg("circle", { cx: 60, cy: 60, r: 48, class: "anneau-fond", pathLength: 100 }),
      svg("circle", { cx: 60, cy: 60, r: 48, class: "anneau-valeur", pathLength: 100, "stroke-dasharray": part + " 100", transform: "rotate(-90 60 60)" }),
      texteSvg(60, 58, juste + " / " + total, { class: "anneau-score", "text-anchor": "middle" }),
      texteSvg(60, 80, part + PC, { class: "anneau-part", "text-anchor": "middle" }));
    figure.append(dessin, el("figcaption", null, sec.titre));
    anneaux.appendChild(figure);
  });
  bilan.appendChild(anneaux);
  partie.appendChild(bilan);
  boutonRejouer(partie, () => JEUX.find(j => j.id === "melange").lancer(zone.parentNode));
  annoncer(T("Bilan : {0} bonne(s) réponse(s) sur {1}.", melange.juste, melange.total));
  gagner("galton", melange.juste);
}

JEUX.push({
  id: "melange",
  section: "melange",
  picto: "cartes",
  couleur: "#1d4f91",
  duree: "1 min",
  titre: "Planche de Galton",
  resume: "Vingt questions, une à la fois, tirées au hasard dans les jeux les plus rapides, puis un bilan par catégorie. Vous ne savez pas à l'avance quel jeu viendra.",
  lancer(zone) {
    zone.replaceChildren();
    melange.dernier = null;
    melange.juste = 0;
    melange.total = 0;
    melange.passees = 0;
    melange.parSection = {};
    const cadre = el("div", "melange");
    cadre.append(el("p", "melange-jeu"), el("div", "melange-partie"), el("p", "source melange-score"));
    zone.appendChild(cadre);
    afficherScoreMelange(cadre);
    questionMelangee(cadre);
  }
});
