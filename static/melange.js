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
const melange = { dernier: null, juste: 0, total: 0, passees: 0 };

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
    }
    afficherScoreMelange(zone);
    questionMelangee(zone);
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
  p.textContent = typo((melange.total
    ? T("Cette session : {0} bonne(s) réponse(s) sur {1}. Les réponses ne sont pas enregistrées.", melange.juste, melange.total)
    : T("Les réponses ne sont pas enregistrées : elles servent à s'entraîner.")) + passees);
}

JEUX.push({
  id: "melange",
  section: "melange",
  picto: "cartes",
  couleur: "#1d4f91",
  duree: "1 min",
  titre: "Planche de Galton",
  resume: "Une question à la fois, tirée au hasard dans les jeux les plus rapides. Vous ne savez pas à l'avance quel jeu viendra.",
  lancer(zone) {
    zone.replaceChildren();
    melange.dernier = null;
    melange.juste = 0;
    melange.total = 0;
    melange.passees = 0;
    const cadre = el("div", "melange");
    cadre.append(el("p", "melange-jeu"), el("div", "melange-partie"), el("p", "source melange-score"));
    zone.appendChild(cadre);
    afficherScoreMelange(cadre);
    questionMelangee(cadre);
  }
});
