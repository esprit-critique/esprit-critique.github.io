// tirage.js : relancer le hasard (refonte, lot 3). Partout où le site tire au sort, on peut tirer de nouveau, sans
// retomber sur la même chose : sac de tirage, bandeau de tirage sur la fiche, mode « Cartes » (recto verso), carte
// « Au hasard » de l'accueil, atelier au hasard, défi libre (#defi/<graine>). Chargé avant app.js : les outils
// d'app.js (el, lire, INDEX, acquis…) ne sont appelés que dans des fonctions.

// ===================== Sac de tirage =====================
// Les éléments, mélangés, sont distribués un à un ; le sac se remélange quand il est vide. Jamais deux fois de suite
// le même élément, y compris à la jonction de deux cycles. « rang » : nombre d'éléments déjà tirés dans le cycle.
function sacDeTirage(elements, alea = Math.random) {
  let reste = [], dernier, rang = 0;
  return {
    taille: elements.length,
    get rang() { return rang; },
    tirer() {
      if (!reste.length) {
        reste = melanger(elements, alea);
        rang = 0;
        // On tire par la fin : si le premier tiré du nouveau cycle est le dernier de l'ancien, on l'échange
        if (reste.length > 1 && reste[reste.length - 1] === dernier) [reste[0], reste[reste.length - 1]] = [reste[reste.length - 1], reste[0]];
      }
      dernier = reste.pop();
      rang++;
      return dernier;
    }
  };
}

// ===================== Fiches lues =====================
// Une fiche est « lue » quand son pied a été atteint (clé fichesLues, tableau de clés de fiches)
function noterFicheLue(cle) {
  const lues = lire("fichesLues", []);
  if (!Array.isArray(lues) || lues.includes(cle)) return;
  lues.push(cle);
  ecrire("fichesLues", lues);
}

// ===================== Tirage d'une fiche au hasard =====================
// En mémoire pour la session : périmètre choisi, historique des cartes tirées, sacs par périmètre
const TIRAGE = { actif: false, cle: null, historique: [], position: -1, perimetre: "tout", nouvelles: false, retourner: false, sacs: new Map() };

const PERIMETRES_TIRAGE = [
  ["tout", "Toutes les fiches, biais et sophismes mêlés"],
  ["type", "Le même type seulement"],
  ["categorie", "La même catégorie"],
  ["non-acquises", "Les fiches non acquises"],
  ["a-reviser", "Les fiches à réviser"]
];

// Clés du périmètre, à partir de la fiche en cours (son type, sa catégorie). Vide : toutes les fiches.
function clesDuPerimetre(perimetre, cleCourante) {
  const courante = INDEX.get(cleCourante);
  const toutes = [...INDEX.keys()];
  let cles = toutes;
  // Sans fiche en cours (tirage lancé depuis la liste) : le type de la liste (TIRAGE.type)
  const type = courante ? courante.type : TIRAGE.type;
  if (perimetre === "type" && type) cles = toutes.filter(c => INDEX.get(c).type === type);
  if (perimetre === "categorie" && courante) cles = toutes.filter(c => INDEX.get(c).fiche.categorie === courante.fiche.categorie);
  if (perimetre === "non-acquises") cles = toutes.filter(c => !acquis.has(c));
  if (perimetre === "a-reviser") cles = clesAReviser().filter(c => INDEX.has(c));
  return cles.length ? cles : toutes;
}

function sacDuTirage(cleCourante) {
  let cles = clesDuPerimetre(TIRAGE.perimetre, cleCourante);
  // « Privilégier les cartes jamais lues » : le sac ne contient que celles-là, tant qu'il en reste
  if (TIRAGE.nouvelles) {
    const lues = new Set(lire("fichesLues", []));
    const jamais = cles.filter(c => !lues.has(c));
    if (jamais.length) cles = jamais;
  }
  // Un sac par contenu : le même périmètre garde son sac d'une carte à l'autre (le compte « 3 sur 51 » continue)
  const nom = cles.join();
  if (!TIRAGE.sacs.has(nom)) TIRAGE.sacs.set(nom, sacDeTirage(cles));
  return TIRAGE.sacs.get(nom);
}

// Tire une carte. Le premier tirage ajoute une entrée d'historique (« retour » ramène à la page de départ) ;
// les suivants la remplacent.
function tirerCarte(perimetre) {
  if (perimetre) TIRAGE.perimetre = perimetre;
  const sac = sacDuTirage(TIRAGE.cle);
  let cle = sac.tirer();
  if (cle === TIRAGE.cle && sac.taille > 1) cle = sac.tirer();
  const premier = !TIRAGE.actif;
  TIRAGE.historique = TIRAGE.historique.slice(0, TIRAGE.position + 1).concat(cle);
  TIRAGE.position = TIRAGE.historique.length - 1;
  allerALaCarte(cle, premier);
}

function allerALaCarte(cle, nouvelleEntree) {
  const r = INDEX.get(cle);
  TIRAGE.actif = true;
  TIRAGE.cle = cle;
  TIRAGE.retourner = true;
  const adresse = "#" + r.type + "/" + r.fiche.id;
  if (nouvelleEntree) location.hash = adresse; else location.replace(adresse);
}

function carteTireePrecedente() {
  if (TIRAGE.position <= 0) return;
  TIRAGE.position--;
  allerALaCarte(TIRAGE.historique[TIRAGE.position], false);
}

// Bandeau de tirage, en tête de la fiche, seulement si l'on y est arrivé par un tirage ; sinon le tirage s'arrête
function bandeauTirage(cle) {
  if (!TIRAGE.actif || TIRAGE.cle !== cle) {
    Object.assign(TIRAGE, { actif: false, cle: null, historique: [], position: -1 });
    return null;
  }
  const sac = sacDuTirage(cle);
  const bandeau = el("section", "bandeau-tirage");
  bandeau.setAttribute("aria-label", "Tirage au hasard");
  bandeau.appendChild(el("p", "bandeau-tirage-titre", T("Tirage au hasard : carte {0} sur {1}", Math.max(1, sac.rang), sac.taille)));
  const reglages = el("div", "bandeau-tirage-reglages");
  const etiquette = el("label", "invisible", "Périmètre du tirage");
  const choix = el("select", "champ champ-perimetre");
  choix.id = "perimetre-tirage";
  etiquette.htmlFor = choix.id;
  PERIMETRES_TIRAGE.forEach(([valeur, texte]) => {
    const o = el("option", null, texte);
    o.value = valeur;
    o.selected = valeur === TIRAGE.perimetre;
    choix.appendChild(o);
  });
  choix.addEventListener("change", () => { TIRAGE.perimetre = choix.value; majCompte(); });
  const nouvelles = el("label", "case-tirage");
  const caseNouvelles = el("input");
  caseNouvelles.type = "checkbox";
  caseNouvelles.checked = TIRAGE.nouvelles;
  caseNouvelles.addEventListener("change", () => { TIRAGE.nouvelles = caseNouvelles.checked; majCompte(); });
  nouvelles.append(caseNouvelles, texteNoeud(" " + T("Privilégier les cartes jamais lues")));
  reglages.append(etiquette, choix, nouvelles);
  const majCompte = () => {
    const s = sacDuTirage(cle);
    bandeau.querySelector(".bandeau-tirage-titre").textContent = typo(T("Tirage au hasard : carte {0} sur {1}", s.rang, s.taille));
  };
  const actions = el("div", "actions");
  const precedente = el("button", "bouton secondaire", "Carte précédente");
  precedente.type = "button";
  precedente.disabled = TIRAGE.position <= 0;
  precedente.addEventListener("click", carteTireePrecedente);
  const autre = el("button", "bouton", "Tirer une autre carte");
  autre.type = "button";
  autre.dataset.tirer = "1";
  autre.setAttribute("aria-keyshortcuts", "R");
  autre.appendChild(el("kbd", null, "R"));
  autre.addEventListener("click", () => tirerCarte());
  actions.append(precedente, autre);
  bandeau.append(reglages, actions);
  return bandeau;
}

// Le retournement (DESIGN.md) à l'arrivée sur une carte tirée ; l'état final est la carte affichée
function retournerALArrivee(carte) {
  if (!TIRAGE.retourner) return;
  TIRAGE.retourner = false;
  animer(carte, [{ transform: "perspective(1200px) rotateY(-90deg)", opacity: 0.3 }, { transform: "none", opacity: 1 }], { duration: 420 });
}

// ===================== Mode « Cartes » (recto verso) =====================
// Au recto une situation, au verso le nom, la définition et le lien vers la fiche. Auto-évaluation : rien n'est
// enregistré (ni révision, ni point). Suivante dans l'ordre de la liste (→), une autre au hasard (R), retourner (espace).
function afficherCartes(type) {
  const zone = $("liste");
  zone.replaceChildren();
  $("vue-fiches").classList.remove("large");
  const fiches = fichesFiltrees(type).length ? fichesFiltrees(type) : TYPES[type].fiches;
  const sac = sacDeTirage(fiches);
  let fiche = sac.tirer(), verso = false;
  zone.append(lienVers("#" + type, "← " + TYPES[type].pluriel, "lien retour"), el("h1", "page-titre", "Cartes"),
    el("p", "page-intro", T("Une situation au recto : quel est le {0} ? Retournez la carte pour vérifier. Rien n'est enregistré : c'est une auto-évaluation.", TYPES[type].singulier)));
  const carte = el("article", "carte carte-recto-verso a-indice");
  carte.setAttribute("aria-live", "polite");
  const actions = el("div", "actions actions-cartes");
  const retourner = el("button", "bouton", "Retourner");
  retourner.type = "button";
  retourner.dataset.retourner = "1";
  retourner.setAttribute("aria-keyshortcuts", "Space");
  const suivante = el("button", "bouton secondaire", "Suivante");
  suivante.type = "button";
  suivante.dataset.suivant = "1";
  const autre = el("button", "bouton secondaire", "Une autre au hasard");
  autre.type = "button";
  autre.dataset.tirer = "1";
  actions.append(retourner, suivante, autre);
  const dessiner = () => {
    carte.replaceChildren();
    carte.style.setProperty("--c", COULEURS[fiche.categorie]);
    const situations = [fiche.cas, fiche.cas2, ...(fiche.casSup || [])].filter(Boolean);
    if (!verso) {
      carte.append(el("p", "surtitre", T("Recto : quel {0} ?", TYPES[type].singulier)), el("p", "cas", situations[Math.floor(Math.random() * situations.length)]));
    } else {
      carte.append(numeroFiche(type, fiche, "numero-fiche indice-coin"), el("p", "surtitre", T("Verso : {0}", fiche.categorie)), el("h2", "carte-verso-nom", fiche.nom),
        el("p", "fiche-definition", fiche.definition), lienVers("#" + type + "/" + fiche.id, "Lire la fiche", "lien-discret"));
    }
    retourner.textContent = typo(verso ? T("Revoir le recto") : T("Retourner"));
    animer(carte, [{ transform: "perspective(1200px) rotateY(-90deg)", opacity: 0.3 }, { transform: "none", opacity: 1 }], { duration: 320 });
  };
  retourner.addEventListener("click", () => { verso = !verso; dessiner(); });
  suivante.addEventListener("click", () => { fiche = fiches[(fiches.indexOf(fiche) + 1) % fiches.length]; verso = false; dessiner(); });
  autre.addEventListener("click", () => { fiche = sac.tirer(); verso = false; dessiner(); });
  zone.append(carte, actions);
  dessiner();
}

// ===================== Accueil : une carte au hasard =====================
// Une fiche tirée du sac de toutes les fiches, avec « Une autre » ; l'ouvrir n'est pas un tirage (pas de bandeau)
const SAC_ACCUEIL = { sac: null };
function carteAuHasard() {
  if (!SAC_ACCUEIL.sac) SAC_ACCUEIL.sac = sacDeTirage([...INDEX.keys()]);
  const carte = el("article", "carte carte-hasard a-indice");
  const dessiner = () => {
    const { type, fiche } = INDEX.get(SAC_ACCUEIL.sac.tirer());
    carte.replaceChildren();
    carte.style.setProperty("--c", COULEURS[fiche.categorie]);
    carte.append(numeroFiche(type, fiche, "numero-fiche indice-coin"), el("p", "surtitre", "Au hasard"),
      el("h2", null, fiche.nom), el("p", "source", fiche.definition));
    const actions = el("div", "actions");
    actions.appendChild(lienVers("#" + type + "/" + fiche.id, "Lire la fiche", "bouton secondaire"));
    const autre = el("button", "bouton secondaire", "Une autre");
    autre.type = "button";
    autre.addEventListener("click", () => { dessiner(); carte.querySelector("button").focus(); });
    actions.appendChild(autre);
    carte.appendChild(actions);
    animer(carte, [{ transform: "perspective(1200px) rotateY(-90deg)", opacity: 0.3 }, { transform: "none", opacity: 1 }], { duration: 320 });
  };
  dessiner();
  return carte;
}

// ===================== Ateliers : un atelier au hasard =====================
const SAC_ATELIERS = { sac: null };
function atelierAuHasard() {
  const bloc = el("div", "atelier-hasard");
  const bouton = el("button", "bouton secondaire", "Un atelier au hasard");
  bouton.type = "button";
  const resultat = el("div", "atelier-hasard-resultat");
  resultat.setAttribute("aria-live", "polite");
  bouton.addEventListener("click", () => {
    if (!SAC_ATELIERS.sac) SAC_ATELIERS.sac = sacDeTirage(tousLesAteliers());
    const { atelier, adresse } = SAC_ATELIERS.sac.tirer();
    resultat.replaceChildren();
    const carte = lienVers(adresse, undefined, "carte entree atelier");
    carte.style.setProperty("--c", atelier.couleur);
    const cadre = el("span", "picto-cadre");
    cadre.appendChild(pictogramme(atelier.picto));
    const corps = el("div", "atelier-corps");
    corps.append(el("h2", null, atelier.titre), el("p", null, atelier.resume));
    carte.append(cadre, corps);
    resultat.appendChild(carte);
    bouton.textContent = typo(T("Un autre atelier au hasard"));
    animer(carte, [{ transform: "perspective(1200px) rotateY(-90deg)", opacity: 0.3 }, { transform: "none", opacity: 1 }], { duration: 320 });
  });
  bloc.append(bouton, resultat);
  return bloc;
}

// ===================== Défi libre (#defi/<graine>) =====================
// Dix questions tirées d'une graine : rejouables, partageables (même mécanisme que #bingo/<graine>), sans rien
// enregistrer dans le défi du jour. C'est la manière de se mesurer à des amis sans serveur.
function grainePourDefi(texte) {
  return /^\d{1,9}$/.test(texte || "") ? Number(texte) : 1 + Math.floor(Math.random() * 999999998);
}

function afficherDefiLibre(texte) {
  const graine = grainePourDefi(texte);
  if (String(graine) !== texte) { location.replace("#defi/" + graine); return; }
  const zone = $("vue-accueil");
  zone.replaceChildren();
  zone.classList.remove("large");
  zone.append(lienVers("#accueil", "← Accueil", "lien retour"), el("h1", "page-titre", "Défi libre"),
    el("p", "page-intro", T("Dix questions tirées de la graine n° {0} : la même adresse donne les mêmes questions à tous ceux qui l'ouvrent. Rien n'est enregistré.", graine)));
  const carte = el("article", "carte defi-jour");
  carte.style.setProperty("--c", "#a8432e");
  zone.appendChild(carte);
  const adresse = location.origin + location.pathname + "#defi/" + graine;
  const relancer = () => { location.hash = "defi/" + grainePourDefi(); };
  const partager = async texteAPartager => {
    try {
      if (navigator.share) { await navigator.share({ text: texteAPartager }); return; }
      await navigator.clipboard.writeText(texteAPartager);
      annoncer(T("Copié : {0}", texteAPartager));
    } catch (erreur) {
      if (erreur && erreur.name === "AbortError") return;
      annoncer(texteAPartager);
    }
  };
  const actionsDefi = score => {
    const actions = el("div", "actions");
    const autre = el("button", "bouton", "Un autre défi");
    autre.type = "button";
    autre.dataset.tirer = "1";
    autre.addEventListener("click", relancer);
    const partage = el("button", "bouton secondaire", "Partager ce défi");
    partage.type = "button";
    partage.addEventListener("click", () => partager(score === undefined
      ? T("Un défi Esprit critique, dix questions : {0}", adresse)
      : T("Défi Esprit critique n° {0} : {1} / 10. À vous : {2}", graine, score, adresse)));
    actions.append(autre, partage);
    return actions;
  };
  const commencer = el("button", "bouton", "Commencer");
  commencer.type = "button";
  commencer.addEventListener("click", () => {
    const jeu = el("div");
    carte.replaceChildren();
    carte.append(el("p", "surtitre", T("Défi libre n° {0}", graine)), jeu);
    derouler(jeu, questionsDuDefi(0, graine), questionDeDefi, resultats => {
      const score = resultats.filter(Boolean).length;
      noterActivite();
      carte.replaceChildren();
      carte.append(el("p", "surtitre", T("Défi libre n° {0}", graine)), el("p", "grand-score", score + " / 10"), actionsDefi(score));
      carte.scrollIntoView({ block: "start" });
    });
  });
  carte.append(el("p", "surtitre", T("Défi libre n° {0}", graine)), el("h2", null, "Dix questions difficiles"),
    el("p", "source", "Monde en chiffres, vrai ou faux, citations et chronologie, aux niveaux 2 et 3."), commencer, actionsDefi());
}
