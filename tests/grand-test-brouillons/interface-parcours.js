
// ===================== Parcours : étapes et écrans =====================
// Une passation est une suite d'écrans calculée à partir de ses instances (ecransPassation). L'écran affiché est
// toujours le premier qui n'est pas achevé : la reprise après une fermeture est exacte, sans perte ni doublon, et une
// réponse validée ne se modifie plus. Un écran est achevé quand sa réponse est enregistrée, ou quand sa marque de
// passage (estimationsEtape) l'est. Principes pédagogiques appliqués (tests/grand-test-plan.md §9) : prédire avant
// de voir (estimation de réussite en début d'étape), correction expliquée, exemples entrelacés (tirage),
// prébunking (avertissement en début d'étape), considérer l'opposé (questions de société), auto-explication
// facultative, motivation sans humiliation (aucun score global, aucun classement, aucune étiquette).

// Durées par étape, estimées par un pilotage simulé (temps de lecture et de réponse ; voir tests/grand-test-journal.md,
// lot 6) : elles ne sont pas mesurées sur de vraies personnes.
const ETAPES_GT = [
  { titre: "Avant de commencer", pourquoi: "Ces premières réponses serviront de point de comparaison à la fin.", duree: { complet: 3 },
    avertissement: "Il n'y a pas de bonne réponse ici : répondez spontanément." },
  { titre: "Ce que vous croyez savoir", pourquoi: "Distinguer le vrai du faux, et savoir quand on sait.", duree: { complet: 9, express: 3 },
    avertissement: "Certaines affirmations fausses sont très répandues ; certaines vraies surprennent. Fiez-vous à ce que vous savez, pas à ce qui sonne juste." },
  { titre: "Raisonner", pourquoi: "Résister à la première réponse qui vient, et juger un raisonnement sur sa forme.", duree: { complet: 13, express: 3 },
    avertissement: "Plusieurs questions suggèrent une réponse rapide qui est fausse. Prenez le temps de vérifier avant de valider." },
  { titre: "Chiffres et hasard", pourquoi: "Probabilités, statistiques et ordres de grandeur.", duree: { complet: 14, express: 4 },
    avertissement: "Les chiffres sont fictifs mais les calculs sont réels. Un papier et un crayon sont permis." },
  { titre: "Peser les preuves", pourquoi: "Ce qu'une étude ou un argument permet vraiment de conclure.", duree: { complet: 10, express: 3 },
    avertissement: "Deux réflexes trompent : tout croire, et tout rejeter. Une preuve solide permet de conclure." },
  { titre: "Retour et mémoire", pourquoi: "Ce que la mémoire retient, et ce qu'elle reconstruit.", duree: { complet: 6, express: 1 },
    avertissement: "Ces exercices ne sont pas notés." }
];
const DUREES_ANNONCEES = { express: "12 à 15 minutes", complet: "environ 45 à 60 minutes, en une ou plusieurs fois" };
const NIVEAUX_CERTITUDE_GT = { binaire: [50, 70, 90, 99], vf: [50, 70, 90, 99], qcm: [25, 50, 70, 90, 99], calcul: [25, 50, 70, 90, 99] };
const LIBELLES_CERTITUDE_GT = { qcm: { 25: "Au hasard (25 %)" }, calcul: { 25: "Très peu sûr (25 %)" } };

const CE_QUE_LE_TEST_NE_MESURE_PAS = [
  "Ni l'intelligence, ni une « rationalité » globale : les axes sont séparés, car les recherches ne justifient pas une seule échelle.",
  "Pas votre rang : les questions sont nouvelles, personne d'autre ne les a passées ; aucune comparaison avec d'autres personnes n'est possible.",
  "Pas ce que vous faites spontanément : ici, vous savez qu'on teste votre esprit critique. Dans la vie, sans avertissement, avec un enjeu ou une émotion, on fait en général moins bien.",
  "Pas l'honnêteté en débat, l'écoute, la connaissance d'un domaine, ni la capacité à changer d'avis sur un sujet qui vous tient à cœur.",
  "Pas un inventaire de vos idées fausses : les affirmations proposées ne sont qu'un échantillon.",
  "Pas un diagnostic : aucune conclusion médicale, psychologique ou professionnelle ne peut en être tirée.",
  "Les résultats dépendent aussi de l'aisance en français écrit, de la familiarité avec ce type de questions et de la culture scientifique scolaire ; l'axe « Probabilités et statistiques » avantage les formations mathématiques.",
  "Les plages affichées expriment l'incertitude de la mesure sous un modèle, pas une certitude sur vous ni une norme nationale."
];

const maintenantISO = () => new Date().toISOString();
const marque = (t, cle) => !!(t.estimationsEtape && t.estimationsEtape[cle]);
const repondu = (t, itemId) => t.reponses.some(r => r.itemId === itemId);

// Les écrans d'une passation, dans l'ordre. type : intro, item, fin, ou une phase de démonstration de mémoire.
function ecransPassation(t) {
  const ecrans = [];
  const etapes = [...new Set(t.instances.map(x => x.valeurs.etape))].sort((a, b) => a - b);
  etapes.forEach(e => {
    const items = t.instances.filter(x => x.valeurs.etape === e);
    ecrans.push({ type: "intro", etape: e, cle: e + "-intro" });
    if (e === 5) {
      const de = b => items.find(x => x.valeurs.banque === b);
      const drm = de("drm"), recit = de("recit"), source = de("source");
      const demos = [drm, recit, source].filter(Boolean);
      if (t.mode === "complet") ecrans.push({ type: "consentement", etape: 5, cle: "5-consentement" });
      if (drm) ecrans.push({ type: "drm-etude", etape: 5, cle: "5-drm-lu", itemId: drm.itemId });
      if (recit) ecrans.push({ type: "recit-lecture", etape: 5, cle: "5-recit-lu", itemId: recit.itemId });
      if (source) ecrans.push({ type: "source-lecture", etape: 5, cle: "5-source-lu", itemId: source.itemId });
      items.filter(x => x.valeurs.banque === "exposition").forEach(x => ecrans.push({ type: "item", etape: 5, itemId: x.itemId }));
      if (recit) ecrans.push({ type: "recit-question", etape: 5, cle: "5-recit-question", itemId: recit.itemId });
      items.filter(x => x.valeurs.role === "rappel").forEach(x => ecrans.push({ type: "item", etape: 5, itemId: x.itemId }));
      demos.forEach(x => ecrans.push({ type: "item", etape: 5, itemId: x.itemId }));
    } else items.forEach(x => ecrans.push({ type: "item", etape: e, itemId: x.itemId }));
    ecrans.push({ type: "fin", etape: e, cle: e + "-fin" });
  });
  ecrans.push({ type: "resultats" });
  return ecrans;
}

// Les démonstrations sont-elles refusées ? (consentement du complet ; l'express ne les propose qu'en une, la liste)
const demonstrationsRefusees = t => t.estimationsEtape && t.estimationsEtape["5-consentement"] === "non";

function ecranAcheve(t, ecran) {
  if (ecran.type === "resultats") return t.dateFin !== null;
  if (ecran.type === "item") return repondu(t, ecran.itemId);
  // Phases de démonstration : achevées si la démonstration est refusée ou déjà répondue
  if (["drm-etude", "recit-lecture", "source-lecture", "recit-question"].includes(ecran.type) && (demonstrationsRefusees(t) || repondu(t, ecran.itemId))) return true;
  return marque(t, ecran.cle);
}

const ecranCourant = t => ecransPassation(t).find(e => !ecranAcheve(t, e));

// Avancement : nombre d'écrans achevés sur le total, et minutes restantes estimées
function avancement(t) {
  const ecrans = ecransPassation(t), faits = ecrans.filter(e => ecranAcheve(t, e)).length;
  const etapesRestantes = [...new Set(ecrans.filter(e => !ecranAcheve(t, e) && e.etape !== undefined).map(e => e.etape))];
  return { faits, total: ecrans.length, minutes: etapesRestantes.reduce((m, e) => m + (ETAPES_GT[e].duree[t.mode] || 0), 0) };
}

// ===================== Page et passation =====================

const GT = { zone: null, etat: null, lectureSeule: false, debutEcran: null };

// Enregistre l'état ; en cas d'échec, l'avertit sans boucler et garde l'état en mémoire
function sauver(etat) {
  GT.etat = etat;
  if (GT.lectureSeule) return false;
  const r = enregistrerGrandTest(etat);
  if (r.erreur) {
    annoncer("Vos réponses n'ont pas pu être enregistrées (" + r.erreur + "). Exportez votre progression avant de fermer la page.");
    return false;
  }
  return true;
}

function rafraichir() {
  const zone = GT.zone;
  zone.innerHTML = "";
  const t = passationEnCours(GT.etat);
  if (!t) { accueilGrandTest(zone); return; }
  const ecran = ecranCourant(t);
  GT.debutEcran = maintenantISO();
  zone.appendChild(barreProgression(t, ecran));
  if (ecran.type === "resultats") { terminerEtAfficher(t); return; }
  ({ intro: ecranIntro, fin: ecranFin, consentement: ecranConsentement, "drm-etude": ecranDrmEtude, "recit-lecture": ecranRecitLecture,
    "source-lecture": ecranSourceLecture, "recit-question": ecranRecitQuestion, item: ecranItem })[ecran.type](zone, t, ecran);
  // Nouvel écran : le focus va à son titre (lecteur d'écran, clavier), sauf à la première ouverture de la page
  const titre = zone.querySelector("h2");
  if (titre && GT.focaliser) { titre.tabIndex = -1; titre.focus(); }
  GT.focaliser = true;
}

// Modifie la passation en cours et réaffiche
function modifier(fonction) {
  const r = majPassation(GT.etat, fonction);
  if (r.erreur) { annoncer(r.erreur); return; }
  sauver(r.etat);
  rafraichir();
}
const marquer = (cle, valeur) => modifier(t => { t.estimationsEtape[cle] = valeur === undefined ? true : valeur; });

// Enregistre une réponse validée (horodatée) ; renvoie true si elle l'est
function repondre(itemId, valeur, certitude) {
  const valideeLe = maintenantISO();
  const r = enregistrerReponseGT(GT.etat, { itemId, valeur, certitude, debut: GT.debutEcran, valideeLe,
    dureeMs: Math.max(0, Date.parse(valideeLe) - Date.parse(GT.debutEcran)) });
  if (r.erreur) { annoncer(r.erreur); return false; }
  sauver(r.etat);
  return true;
}

function barreProgression(t, ecran) {
  const a = avancement(t);
  const bloc = el("div", "gt-progression");
  const etape = ecran.etape !== undefined ? ETAPES_GT[ecran.etape] : null;
  bloc.appendChild(el("p", "surtitre", "Test " + t.mode + (etape ? " · étape " + ecran.etape + " : " + etape.titre : " · résultats")));
  const jauge = el("div", "jauge");
  jauge.setAttribute("role", "progressbar");
  jauge.setAttribute("aria-label", "Avancement du test");
  jauge.setAttribute("aria-valuemin", "0");
  jauge.setAttribute("aria-valuemax", String(a.total));
  jauge.setAttribute("aria-valuenow", String(a.faits));
  jauge.setAttribute("aria-valuetext", a.faits + " écrans sur " + a.total + (a.minutes ? ", environ " + a.minutes + " minutes restantes" : ""));
  const rempli = el("div");
  rempli.style.width = (100 * a.faits / a.total) + "%";
  jauge.appendChild(rempli);
  bloc.appendChild(jauge);
  if (a.minutes) bloc.appendChild(el("p", "source", "Environ " + a.minutes + " minutes restantes. Vous pouvez fermer la page : le test reprendra ici."));
  return bloc;
}

// ---------- Accueil ----------
function blocCeQueLeTestNeMesurePas(titreNiveau) {
  const bloc = el("section", "section gt-limites");
  bloc.appendChild(el(titreNiveau || "h2", "titre-section", "Ce que le test ne mesure pas"));
  const ul = el("ul", "liste-simple");
  CE_QUE_LE_TEST_NE_MESURE_PAS.forEach(t => ul.appendChild(el("li", null, t)));
  bloc.appendChild(ul);
  return bloc;
}

function accueilGrandTest(zone) {
  zone.appendChild(paragraphe("Ce test ne produit pas de score global. Vos réponses restent dans votre navigateur et ne sont pas envoyées. Répondez sans chercher ailleurs : le but est d'observer votre raisonnement, pas ce que vous pouvez trouver. Vous pouvez fractionner le test complet ; votre progression sera reprise sur cet appareil."));
  const choix = el("div", "gt-modes");
  [["express", "Test express", "Un aperçu de chaque façon de raisonner. Certaines mesures y sont trop courtes pour être précises."],
   ["complet", "Test complet", "Cinq étapes, avec des mesures plus précises et des démonstrations de mémoire. Vous pouvez le faire en plusieurs fois."]]
    .forEach(([mode, titre, texte]) => {
      const carte = el("div", "gt-mode");
      carte.append(el("h2", "titre-section", titre), el("p", "etiquette", DUREES_ANNONCEES[mode]), paragraphe(texte));
      const b = el("button", "bouton", "Commencer le test " + mode);
      b.addEventListener("click", () => commencerTest(mode));
      carte.appendChild(b);
      choix.appendChild(carte);
    });
  zone.appendChild(choix);
  zone.appendChild(blocCeQueLeTestNeMesurePas());
  const faits = passationsTerminees(GT.etat);
  if (faits.length) {
    const p = el("p", "conseil");
    p.appendChild(texteNoeud(pluriel(faits.length, "test terminé", "tests terminés") + ". "));
    const b = el("button", "lien-bouton", "Voir vos résultats");
    b.addEventListener("click", () => { zone.innerHTML = ""; afficherProfil(zone, faits[faits.length - 1].id); });
    p.appendChild(b);
    zone.appendChild(p);
  }
  zone.appendChild(boutonEffacerGrandTest());
}

function boutonEffacerGrandTest() {
  const b = el("button", "lien-bouton", "Effacer seulement les données du Grand test");
  b.addEventListener("click", () => {
    if (!confirm("Effacer toutes les données du Grand test ? Vos autres progressions (fiches, quiz, ateliers) ne seront pas touchées.")) return;
    effacerGrandTest();
    afficherGrandTest(GT.zone);
  });
  return b;
}

function commencerTest(mode) {
  // Graine : nouvelle à chaque passation, reproductible ensuite (elle est enregistrée)
  const graine = Math.floor(Math.random() * 4294967295) >>> 0;
  const tirage = tirerPassation(GT.etat, mode, graine);
  if (!tirage.instances.length) { annoncer("Aucune question n'est encore disponible : les contenus attendent leur relecture."); return; }
  const r = commencerPassation(GT.etat, mode, graine, tirage.instances, maintenantISO());
  if (r.erreur) { annoncer(r.erreur); return; }
  const t = r.etat.historiqueTests.find(x => x.id === r.id);
  t.issues = tirage.issues.slice(0, 50).map(x => x.slice(0, 200));
  GT.focaliser = true;
  sauver(r.etat);
  rafraichir();
}

// ---------- Introduction et fin d'étape ----------
// Nombre d'items notés d'une étape (pour l'estimation préalable)
const itemsNotesEtape = (t, e) => t.instances.filter(x => x.valeurs.etape === e).map(x => resoudreItem(x, t.graine)).filter(i => i && ["qcm", "calcul", "binaire", "vf"].includes(i.type));

function ecranIntro(zone, t, ecran) {
  const e = ETAPES_GT[ecran.etape];
  zone.appendChild(el("h2", "titre-section", "Étape " + ecran.etape + " : " + e.titre));
  zone.appendChild(el("p", "etiquette", "Environ " + (e.duree[t.mode] || 1) + " minute" + ((e.duree[t.mode] || 1) > 1 ? "s" : "")));
  zone.appendChild(paragraphe("Pourquoi cette étape : " + e.pourquoi.charAt(0).toLowerCase() + e.pourquoi.slice(1)));
  zone.appendChild(paragraphe(e.avertissement, "consigne-longue"));
  if (ecran.etape === 1 && t.mode === "complet") zone.appendChild(paragraphe("Les corrections de cette étape viendront à la fin de l'étape, pas après chaque affirmation : les voir trop tôt modifierait votre façon de répondre aux suivantes."));
  if (ecran.etape === 2 && t.mode === "complet") zone.appendChild(paragraphe("Les raisonnements « valide ou non valide » seront corrigés à la fin de l'étape ; les autres questions, aussitôt."));
  const notes = itemsNotesEtape(t, ecran.etape);
  if (notes.length) {
    // Prédire avant de voir : combien de réponses justes pensez-vous obtenir ?
    const champ = el("input", "champ");
    champ.type = "number"; champ.min = "0"; champ.max = String(notes.length); champ.inputMode = "numeric";
    champ.id = "gt-estimation";
    const etiquette = el("label", null, "Avant de commencer : sur " + notes.length + " questions notées, combien pensez-vous en réussir ? (facultatif)");
    etiquette.htmlFor = "gt-estimation";
    const ligne = el("div", "ligne");
    ligne.append(champ);
    zone.append(etiquette, ligne);
    const bouton = boutonSuivant("Commencer l'étape", () => {
      const v = lireNombre(champ.value);
      marquer(ecran.cle, { estimation: isFinite(v) ? Math.max(0, Math.min(notes.length, Math.round(v))) : null, sur: notes.length });
    });
    bouton.dataset.valider = "1";
    zone.appendChild(bouton);
  } else zone.appendChild(boutonSuivant("Commencer l'étape", () => marquer(ecran.cle)));
}

function ecranFin(zone, t, ecran) {
  const e = ecran.etape;
  zone.appendChild(el("h2", "titre-section", "Fin de l'étape " + e + " : " + ETAPES_GT[e].titre));
  const etapeDe = id => t.instances.find(x => x.itemId === id).valeurs.etape;
  const lignes = lignesPassation(t).filter(l => etapeDe(l.reponse.itemId) === e);
  const notees = lignes.filter(l => l.juste !== null);
  if (notees.length) {
    const justes = notees.filter(l => l.juste).length;
    const estimation = (t.estimationsEtape[e + "-intro"] || {}).estimation;
    zone.appendChild(paragraphe(justes + " réponse" + (justes > 1 ? "s" : "") + " juste" + (justes > 1 ? "s" : "") + " sur " + notees.length + "."
      + (typeof estimation === "number" ? " Vous en aviez prévu " + estimation + "." : "")));
  }
  // Corrections différées, annoncées au début de l'étape
  const differees = lignes.filter(l => (l.item.type === "vf" || l.item.type === "binaire") && t.mode === "complet");
  if (differees.length) {
    zone.appendChild(el("h3", null, "Les corrections"));
    differees.forEach(l => zone.appendChild(correctionCourte(l)));
  }
  if (e === 5) zone.appendChild(bilanMemoire(t));
  zone.appendChild(boutonSuivant(e === 5 || !t.instances.some(x => x.valeurs.etape > e) ? "Voir les résultats" : "Étape suivante", () => marquer(ecran.cle)));
  if (t.instances.some(x => x.valeurs.etape > e)) zone.appendChild(paragraphe("Vous pouvez aussi vous arrêter ici : le test reprendra à l'étape suivante.", "source"));
}

// ---------- Items ----------
// Groupe de choix : légende programmatique, boutons à état (aria-pressed), un seul choisi
function groupeChoix(legende, options, classe, surChoix) {
  const fs = el("fieldset", "gt-groupe" + (classe ? " " + classe : ""));
  fs.appendChild(el("legend", "consigne", legende));
  let choisi = null;
  const boutons = options.map((texte, k) => {
    const b = classe === "gt-certitude" ? el("button", "puce", texte) : boutonChoix(texte, k);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      boutons.forEach(x => { x.setAttribute("aria-pressed", "false"); x.classList.remove("choisi", "active"); });
      b.setAttribute("aria-pressed", "true");
      b.classList.add(classe === "gt-certitude" ? "active" : "choisi");
      choisi = k;
      surChoix(k);
    });
    fs.appendChild(b);
    return b;
  });
  return { element: fs, boutons, valeur: () => choisi, desactiver: () => boutons.forEach(b => { b.disabled = true; }) };
}

function groupeCertitude(type, surChoix) {
  const niveaux = NIVEAUX_CERTITUDE_GT[type];
  const libelles = LIBELLES_CERTITUDE_GT[type] || {};
  const g = groupeChoix("Votre certitude d'avoir juste", niveaux.map(n => libelles[n] || n + " %"), "gt-certitude", () => surChoix());
  g.niveau = () => g.valeur() === null ? null : niveaux[g.valeur()];
  return g;
}

function boutonValider(texte) {
  const b = el("button", "bouton large", texte || "Valider");
  b.dataset.valider = "1";
  b.disabled = true;
  return b;
}

// Liens vers les fiches et les ateliers d'un item (identifiants vérifiés par le banc « familles »)
function liensItem(item) {
  const liens = el("div", "voir-aussi");
  (item.fiches || []).forEach(cle => {
    const [type, id] = cle.split(":");
    const f = trouverFiche(type, id);
    if (f) liens.appendChild(lienVers("#" + type + "/" + id, f.nom));
  });
  (item.ateliers || []).forEach(adresse => {
    const a = tousLesAteliers().find(x => x.adresse === adresse);
    if (a) liens.appendChild(lienVers(adresse, "Atelier : " + a.atelier.titre));
  });
  return liens.childNodes.length ? liens : null;
}

// Texte de la réponse attendue
function texteAttendu(item) {
  if (item.type === "qcm") return item.choixAffiches[item.justeAffiche];
  if (item.type === "calcul") return nombreGT(item.juste) + (item.unite ? " " + item.unite : "");
  if (item.type === "binaire") return item.juste ? "le raisonnement est valide" : "le raisonnement n'est pas valide";
  if (item.type === "vf") return item.juste ? "vrai" : "faux";
  return "";
}

// Correction complète d'un item noté : verdict, explication, source, liens ; crayon rouge si la réponse est fausse
function correction(item, valeur, certitude) {
  const juste = reponseJuste(item, valeur);
  const retour = el("div", "retour-quiz");
  retour.setAttribute("role", "status");
  retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), juste ? "Juste." : (valeur === null ? "Sans réponse. " : "") + "Réponse attendue : " + texteAttendu(item) + "."));
  if (!juste && reponseLeurre(item, valeur)) retour.appendChild(paragraphe("C'est la réponse qui vient spontanément : la question est construite pour la suggérer."));
  retour.appendChild(paragraphe(item.explication));
  if (item.surCorrection) retour.appendChild(paragraphe(MESSAGE_SUR_CORRECTION));
  if (item.source) retour.appendChild(el("p", "source", "Source : " + item.source));
  const liens = liensItem(item);
  if (liens) retour.appendChild(liens);
  // Auto-explication facultative, après une erreur commise avec assurance : rien n'est enregistré
  if (!juste && certitude !== null && certitude >= 90) {
    const id = "gt-auto-" + Math.random().toString(36).slice(2, 8);
    const etiquette = el("label", "source", "Facultatif : en une phrase, pourquoi la réponse attendue est-elle juste ? (rien n'est enregistré)");
    etiquette.htmlFor = id;
    const zoneTexte = el("textarea", "champ champ-texte");
    zoneTexte.id = id; zoneTexte.rows = 2;
    retour.append(etiquette, zoneTexte);
  }
  return retour;
}

// Correction courte, pour les blocs de corrections différées (fin d'étape)
function correctionCourte(l) {
  const bloc = el("div", "question-test");
  const juste = l.juste;
  bloc.appendChild(el("p", "cas", l.item.type === "vf" ? "« " + l.item.texte + " »" : l.item.texte));
  bloc.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Réponse attendue : ") + texteAttendu(l.item) + "."));
  bloc.appendChild(paragraphe(l.item.explication));
  if (l.item.source) bloc.appendChild(el("p", "source", "Source : " + l.item.source));
  const liens = liensItem(l.item);
  if (liens) bloc.appendChild(liens);
  return bloc;
}

function ecranItem(zone, t, ecran) {
  const inst = t.instances.find(x => x.itemId === ecran.itemId);
  const item = resoudreItem(inst, t.graine);
  const rendus = { qcm: itemChoix, binaire: itemChoix, vf: itemChoix, calcul: itemCalcul, fourchette: itemFourchette, rappel: itemRappel,
    "angle-mort": itemAngleMort, "exposition-lecture": itemExpositionLecture, "exposition-note": itemExpositionNote, societe: itemSociete,
    drm: itemDrmReconnaissance, recit: itemRecitReconnaissance, source: itemSourceTest };
  const carte = el("div", "gt-item");
  zone.appendChild(carte);
  // Titre de l'écran : numéro de la question dans son étape
  const memeEtape = t.instances.filter(x => x.valeurs.etape === inst.valeurs.etape);
  if (!["drm", "recit", "source"].includes(item.type))
    carte.appendChild(el("h2", "gt-numero", "Question " + (memeEtape.indexOf(inst) + 1) + " sur " + memeEtape.length));
  rendus[item.type](carte, t, item, inst);
}

// Correction tout de suite, sauf exceptions de méthode : vrai-faux et raisonnements du complet (d′, impartialité)
const correctionDifferee = (t, item) => t.mode === "complet" && (item.type === "vf" || item.type === "binaire");

function itemChoix(carte, t, item) {
  if (item.texte) carte.appendChild(el("p", item.type === "vf" ? "cas" : null, item.type === "vf" ? "« " + item.texte + " »" : item.texte));
  const question = item.type === "vf" ? "Cette affirmation est-elle vraie ou fausse ?" : item.question;
  const options = item.type === "qcm" ? item.choixAffiches : item.type === "vf" ? ["Vrai", "Faux"] : item.choix;
  const valider = boutonValider();
  let g, c;
  const verifier = () => { valider.disabled = g.valeur() === null || c.niveau() === null; };
  g = groupeChoix(question, options, null, verifier);
  c = groupeCertitude(item.type, verifier);
  carte.append(g.element, c.element, valider);
  valider.addEventListener("click", () => {
    const k = g.valeur();
    const valeur = item.type === "qcm" ? k : k === 0;
    if (!repondre(item.itemId, valeur, c.niveau())) return;
    g.desactiver(); c.desactiver(); valider.remove();
    if (correctionDifferee(t, item)) {
      const p = el("p", "source", "Réponse enregistrée. La correction viendra à la fin de l'étape.");
      p.setAttribute("role", "status");
      carte.appendChild(p);
    } else {
      const juste = reponseJuste(item, valeur);
      const cible = item.type === "qcm" ? item.justeAffiche : (item.juste ? 0 : 1);
      g.boutons[cible].classList.add("juste");
      if (!juste) g.boutons[k].classList.add("faux");
      carte.appendChild(correction(item, valeur, c.niveau()));
    }
    carte.appendChild(boutonSuivant("Suivant", () => rafraichir()));
    montrer(carte.lastChild);
  });
}

function itemCalcul(carte, t, item) {
  carte.appendChild(paragraphe(item.texte));
  const id = "gt-calcul-" + item.i;
  const etiquette = el("label", "consigne", item.question);
  etiquette.htmlFor = id;
  const champ = el("input", "champ");
  champ.id = id; champ.inputMode = "decimal"; champ.autocomplete = "off";
  const ligne = el("div", "ligne");
  ligne.append(champ, el("span", "source", item.unite));
  const valider = boutonValider();
  const c = groupeCertitude("calcul", () => verifier());
  const verifier = () => { valider.disabled = !isFinite(lireNombre(champ.value)) || c.niveau() === null; };
  champ.addEventListener("input", verifier);
  carte.append(etiquette, ligne, c.element, valider);
  valider.addEventListener("click", () => {
    const valeur = lireNombre(champ.value);
    if (!repondre(item.itemId, valeur, c.niveau())) return;
    champ.disabled = true; c.desactiver(); valider.remove();
    carte.appendChild(correction(item, valeur, c.niveau()));
    carte.appendChild(boutonSuivant("Suivant", () => rafraichir()));
    montrer(carte.lastChild);
  });
}

// Fourchette à 90 % et estimation centrale ; correction tout de suite ou après le rappel (moitié des items du complet)
function itemFourchette(carte, t, item) {
  const q = item.q;
  carte.appendChild(el("p", "cas", q.q + " (en " + q.unite + ")"));
  carte.appendChild(paragraphe("Donnez votre meilleure estimation, puis une fourchette assez large pour être sûr à 90 % qu'elle contient la vraie valeur.", "consigne-longue"));
  const champs = ["Estimation", "Au moins", "Au plus"].map((libelle, k) => {
    const id = "gt-f-" + k;
    const lab = el("label", null, libelle);
    lab.htmlFor = id;
    const champ = el("input", "champ");
    champ.id = id; champ.inputMode = "decimal"; champ.autocomplete = "off";
    const ligne = el("div", "ligne");
    ligne.append(lab, champ, el("span", "source", q.unite));
    carte.appendChild(ligne);
    return champ;
  });
  const valider = boutonValider();
  const lus = () => champs.map(c => lireNombre(c.value));
  const verifier = () => { const [e, b, h] = lus(); valider.disabled = ![e, b, h].every(isFinite) || !(b <= e && e <= h); };
  champs.forEach(c => c.addEventListener("input", verifier));
  const aide = el("p", "source", "La borne basse doit être inférieure ou égale à l'estimation, et l'estimation à la borne haute.");
  carte.append(aide, valider);
  valider.addEventListener("click", () => {
    const [e, b, h] = lus();
    if (!repondre(item.itemId, [b, e, h], null)) return;
    champs.forEach(c => { c.disabled = true; }); valider.remove();
    if (item.correction === "differee") {
      const p = el("p", "source", "Réponse enregistrée. La vraie valeur sera donnée plus tard, à l'étape 5 : c'est voulu.");
      p.setAttribute("role", "status");
      carte.appendChild(p);
    } else carte.appendChild(correctionFourchette(q, b, e, h));
    carte.appendChild(boutonSuivant("Suivant", () => rafraichir()));
  });
}

function correctionFourchette(q, b, e, h) {
  const dedans = b <= q.v && q.v <= h;
  const retour = el("div", "retour-quiz");
  retour.setAttribute("role", "status");
  retour.appendChild(el("p", "verdict " + (dedans ? "juste" : "faux"), (dedans ? "Dans votre fourchette. " : "Hors de votre fourchette. ") + "Vraie valeur : " + nombreGT(q.v) + " " + q.unite + "."));
  retour.appendChild(ligneIntervalle({ q: q.q, v: q.v, unite: q.unite }, b, h, dedans));
  retour.appendChild(el("p", "source", "Votre estimation : " + nombreGT(e) + " " + q.unite + ". Source : " + q.source + "."));
  return retour;
}

function itemRappel(carte, t, item) {
  carte.appendChild(paragraphe("Retour sur une estimation de l'étape 3 : « " + item.q.q + " ». Quelle était votre estimation, au plus près de votre souvenir ?"));
  const champ = el("input", "champ");
  champ.id = "gt-rappel"; champ.inputMode = "decimal"; champ.autocomplete = "off";
  const lab = el("label", "consigne", "Votre estimation d'alors (en " + item.q.unite + ")");
  lab.htmlFor = "gt-rappel";
  const ligne = el("div", "ligne");
  ligne.append(champ, el("span", "source", item.q.unite));
  const valider = boutonValider();
  champ.addEventListener("input", () => { valider.disabled = !isFinite(lireNombre(champ.value)); });
  const passer = el("button", "lien-bouton", "Je ne m'en souviens pas");
  passer.addEventListener("click", () => { if (repondre(item.itemId, null, null)) rafraichir(); });
  carte.append(lab, ligne, valider, passer);
  valider.addEventListener("click", () => { if (repondre(item.itemId, lireNombre(champ.value), null)) rafraichir(); });
}

function itemAngleMort(carte, t, item) {
  carte.appendChild(paragraphe("Voici une tendance de jugement :"));
  carte.appendChild(el("p", "cas", item.description));
  let moi = null, autres = null;
  const valider = boutonValider("Suivant");
  const echelle = (legende, surChoix) => {
    const fs = el("fieldset", "gt-groupe");
    fs.appendChild(el("legend", "consigne", legende));
    fs.appendChild(echelleNeuf(surChoix));
    return fs;
  };
  carte.append(echelle("À quel point cela vous arrive-t-il ? (1 : jamais, 9 : très souvent)", n => { moi = n; valider.disabled = autres === null; }),
    echelle("À quel point cela arrive-t-il à la plupart des gens ?", n => { autres = n; valider.disabled = moi === null; }), valider);
  valider.addEventListener("click", () => { if (repondre(item.itemId, [moi, autres], null)) rafraichir(); });
}

function itemExpositionLecture(carte, t, item) {
  carte.appendChild(paragraphe("Lisez cette phrase, puis indiquez de quoi elle parle. Il ne s'agit pas de dire si elle est vraie."));
  carte.appendChild(el("p", "cas", item.texte));
  const domaines = ["mots", "lieux", "animaux"];
  const g = groupeChoix("Elle parle surtout…", ["de mots", "de lieux", "d'animaux"], null, k => { if (repondre(item.itemId, domaines[k], null)) rafraichir(); });
  carte.appendChild(g.element);
}

const NOTES_VERITE = ["Certainement fausse", "Probablement fausse", "Plutôt fausse", "Plutôt vraie", "Probablement vraie", "Certainement vraie"];
function itemExpositionNote(carte, t, item) {
  carte.appendChild(el("p", "cas", item.texte));
  const g = groupeChoix("Cette affirmation vous paraît…", NOTES_VERITE, "gt-notes", k => { if (repondre(item.itemId, k + 1, null)) rafraichir(); });
  carte.appendChild(g.element);
}

// Question de société : position, puis force de chaque argument, de 1 à 7, quel que soit son camp
function itemSociete(carte, t, item) {
  carte.appendChild(el("p", "cas", item.question));
  carte.appendChild(paragraphe("Votre avis est libre et n'est pas noté. Il sert seulement à vérifier, ensuite, si l'on juge les arguments de son camp plus indulgemment.", "consigne-longue"));
  let position = null;
  const notes = item.arguments.map(() => null);
  const valider = boutonValider();
  const verifier = () => { valider.disabled = position === null || notes.some(n => n === null); };
  const g = groupeChoix("Votre position", ["Plutôt pour", "Plutôt contre", "Sans avis"], null, k => { position = [1, -1, 0][k]; verifier(); });
  carte.appendChild(g.element);
  item.arguments.forEach((a, k) => {
    const fs = el("fieldset", "gt-groupe");
    fs.appendChild(el("legend", "consigne", "Argument " + (k + 1) + " — à quel point est-il solide ?"));
    fs.appendChild(el("p", "cas", "« " + a.texte + " »"));
    fs.appendChild(echelleSept("Très faible", "Très solide", n => { notes[k] = n; verifier(); }));
    carte.appendChild(fs);
  });
  carte.appendChild(valider);
  valider.addEventListener("click", () => {
    if (!repondre(item.itemId, [position, ...notes], null)) return;
    carte.querySelectorAll("button").forEach(b => { if (b !== valider) b.disabled = true; });
    valider.remove();
    const retour = el("div", "retour-quiz");
    retour.appendChild(el("p", "verdict juste", "Ce que montrent ces arguments"));
    item.arguments.forEach(a => retour.appendChild(paragraphe((a.camp === "pour" ? "Pour, " : "Contre, ") + (a.qualite === "solide" ? "solide : il donne une raison qui se discute sur le fond." : "faible : " + (ficheSophismeNom(a.sophisme) || "un sophisme") + ".") + " « " + a.texte + " »")));
    retour.appendChild(paragraphe("Pour aller plus loin : quelle observation vous ferait changer d'avis sur cette question ?", "consigne-longue"));
    carte.appendChild(retour);
    carte.appendChild(boutonSuivant("Suivant", () => rafraichir()));
  });
}
const ficheSophismeNom = id => { const f = id && trouverFiche("sophismes", id); return f ? f.nom.charAt(0).toLowerCase() + f.nom.slice(1) : null; };

// ---------- Démonstrations de mémoire ----------
function ecranConsentement(zone, t, ecran) {
  zone.appendChild(el("h2", "titre-section", "Trois démonstrations de mémoire"));
  zone.appendChild(paragraphe("Les exercices qui suivent ne sont pas notés. Ils montrent comment la mémoire retient et reconstruit. L'un d'eux contient volontairement une question trompeuse : tout sera expliqué et corrigé à la fin de l'étape. Les scènes sont anodines."));
  zone.appendChild(paragraphe("Vous pouvez aussi passer ces démonstrations : cela ne change rien à vos résultats.", "source"));
  const oui = boutonSuivant("Faire les démonstrations", () => marquer(ecran.cle, "oui"));
  const non = el("button", "bouton secondaire", "Passer les démonstrations");
  non.addEventListener("click", () => {
    // Démonstrations passées : on enregistre des non-réponses, pour que la reprise ne les propose plus
    const demos = t.instances.filter(x => ["drm", "recit", "source"].includes(x.valeurs.banque));
    marquer(ecran.cle, "non");
    demos.forEach(x => repondre(x.itemId, null, null));
    rafraichir();
  });
  zone.append(oui, non);
}

function ecranDrmEtude(zone, t, ecran) {
  const demo = resoudreItem(t.instances.find(x => x.itemId === ecran.itemId), t.graine);
  zone.appendChild(el("h2", "titre-section", "Une liste de mots"));
  zone.appendChild(paragraphe("Lisez attentivement ces dix mots. Vous devrez les reconnaître plus tard. Prenez le temps qu'il vous faut."));
  const ul = el("ul", "gt-liste-mots");
  demo.liste.forEach(m => ul.appendChild(el("li", null, m)));
  zone.appendChild(ul);
  zone.appendChild(boutonSuivant("J'ai lu la liste", () => marquer(ecran.cle)));
}

function ecranRecitLecture(zone, t, ecran) {
  const demo = resoudreItem(t.instances.find(x => x.itemId === ecran.itemId), t.graine);
  zone.appendChild(el("h2", "titre-section", "Un court récit"));
  zone.appendChild(paragraphe("Lisez ce récit une fois, attentivement."));
  zone.appendChild(el("p", "cas", demo.recit));
  zone.appendChild(boutonSuivant("J'ai lu le récit", () => marquer(ecran.cle)));
}

function ecranSourceLecture(zone, t, ecran) {
  const demo = resoudreItem(t.instances.find(x => x.itemId === ecran.itemId), t.graine);
  zone.appendChild(el("h2", "titre-section", "Des informations et leur source"));
  zone.appendChild(paragraphe("Voici six informations sur un village imaginaire, chacune avec sa source. Vous devrez retrouver plus tard qui a dit quoi."));
  const ul = el("ul", "liste-simple");
  demo.lues.forEach(x => ul.appendChild(el("li", null, "Selon " + x.source + " : " + x.texte)));
  zone.appendChild(ul);
  zone.appendChild(boutonSuivant("J'ai lu les informations", () => marquer(ecran.cle)));
}

// La question trompeuse : sa réponse n'est pas notée ; elle est gardée pour la restitution
function ecranRecitQuestion(zone, t, ecran) {
  const demo = resoudreItem(t.instances.find(x => x.itemId === ecran.itemId), t.graine);
  zone.appendChild(el("h2", "titre-section", "Une question sur le récit"));
  const g = groupeChoix(demo.questionTrompeuse, demo.reponsesTrompeuse, null, k => marquer(ecran.cle, k + 1));
  zone.appendChild(g.element);
}

function itemDrmReconnaissance(carte, t, demo) {
  carte.appendChild(el("h2", "titre-section", "La liste de mots"));
  carte.appendChild(paragraphe("Pour chaque mot, dites s'il figurait dans la liste lue tout à l'heure."));
  const reponses = demo.test.map(() => null);
  const valider = boutonValider();
  demo.test.forEach((x, k) => {
    const g = groupeChoix("« " + x.mot + " » était-il dans la liste ?", ["Oui", "Non"], null, j => { reponses[k] = j === 0; valider.disabled = reponses.some(r => r === null); });
    carte.appendChild(g.element);
  });
  carte.appendChild(valider);
  valider.addEventListener("click", () => { if (repondre(demo.itemId, reponses, null)) rafraichir(); });
}

function itemRecitReconnaissance(carte, t, demo) {
  carte.appendChild(el("h2", "titre-section", "Le récit"));
  const g = groupeChoix(demo.reconnaissance, demo.choix, null, k => {
    const question = t.estimationsEtape["5-recit-question"];
    if (repondre(demo.itemId, [typeof question === "number" ? question : null, k], null)) rafraichir();
  });
  carte.appendChild(g.element);
}

function itemSourceTest(carte, t, demo) {
  carte.appendChild(el("h2", "titre-section", "Qui a dit quoi ?"));
  const reponses = demo.test.map(() => undefined);
  const valider = boutonValider();
  demo.test.forEach((x, k) => {
    const g = groupeChoix("« " + x.texte + " » — d'où venait cette information ?", [demo.sources[0], demo.sources[1], "Je ne sais plus"], null, j => {
      reponses[k] = j === 2 ? null : demo.sources[j]; valider.disabled = reponses.some(r => r === undefined);
    });
    carte.appendChild(g.element);
  });
  carte.appendChild(valider);
  valider.addEventListener("click", () => { if (repondre(demo.itemId, reponses.map(r => r === null ? "" : r), null)) rafraichir(); });
}

// Restitution des démonstrations (fin de l'étape 5) : corrections complètes, sans note
function bilanMemoire(t) {
  const bloc = el("div", "gt-memoire");
  const lignes = lignesPassation(t);
  const de = b => lignes.find(l => l.item.banque === b && l.reponse.valeur !== null);
  // Vérité illusoire : notes moyennes des affirmations déjà lues et nouvelles
  const notes = lignes.filter(l => l.item.type === "exposition-note" && typeof l.reponse.valeur === "number")
    .map(l => ({ expose: l.item.role === "vue", vrai: l.item.vrai, note: l.reponse.valeur }));
  if (notes.length) {
    const v = veriteIllusoire(notes);
    bloc.appendChild(el("h3", null, "Les affirmations déjà lues"));
    bloc.appendChild(paragraphe("Huit des affirmations à noter avaient été lues au début du test, sans que vous ayez à les juger. "
      + (v.toutes === null ? "" : "Vous les avez notées en moyenne " + (v.toutes > 0 ? nombreGT(Math.round(v.toutes * 10) / 10) + " point plus vraies" : v.toutes < 0 ? nombreGT(Math.round(-v.toutes * 10) / 10) + " point moins vraies" : "comme les autres") + " que les nouvelles, sur une échelle de 1 à 6. ")
      + "Chez beaucoup de gens, une phrase déjà lue paraît un peu plus vraie : c'est l'effet de vérité illusoire. Sur seize phrases, ce résultat est une illustration, pas une mesure."));
    const ul = el("ul", "liste-simple");
    lignes.filter(l => l.item.type === "exposition-note").forEach(l => ul.appendChild(el("li", null, (l.item.vrai ? "Vraie : " : "Fausse : ") + l.item.texte)));
    bloc.appendChild(ul);
  }
  // Biais rétrospectif : rapprochement des souvenirs, valeurs vues et non vues
  const rappels = lignes.filter(l => l.item.type === "rappel");
  if (rappels.length) {
    const estimations = {};
    lignes.filter(l => l.item.type === "fourchette" && Array.isArray(l.reponse.valeur)).forEach(l => { estimations[l.item.instanceId] = l.reponse.valeur[1]; });
    const r = rappels.filter(l => typeof l.reponse.valeur === "number" && estimations[l.item.instanceId] !== undefined)
      .map(l => ({ correction: l.item.correction, s: rapprochement(estimations[l.item.instanceId], l.item.q.v, l.reponse.valeur, "log") })).filter(x => x.s !== null);
    bloc.appendChild(el("h3", null, "Vos souvenirs d'estimation"));
    const moy = c => { const s = r.filter(x => x.correction === c).map(x => x.s); return s.length ? moyenneGT(s) : null; };
    const vues = moy("immediate"), nonVues = moy("differee");
    bloc.appendChild(paragraphe("Pour trois estimations, vous aviez vu la vraie valeur ; pour trois autres, non. "
      + (vues !== null && nonVues !== null ? "Vos souvenirs se sont rapprochés de la vraie valeur de " + Math.round(100 * vues) + " % en moyenne quand vous l'aviez vue, contre " + Math.round(100 * nonVues) + " % sinon. " : "")
      + "Connaître la réponse tend à déplacer le souvenir de ce que l'on pensait : c'est le biais rétrospectif. Sur six estimations, ce n'est qu'une illustration."));
    lignes.filter(l => l.item.type === "fourchette" && l.item.correction === "differee" && Array.isArray(l.reponse.valeur))
      .forEach(l => bloc.appendChild(correctionFourchette(l.item.q, ...[l.reponse.valeur[0], l.reponse.valeur[1], l.reponse.valeur[2]])));
  }
  const drm = de("drm");
  if (drm && Array.isArray(drm.reponse.valeur)) {
    const b = bilanDRM(drm.item, drm.reponse.valeur);
    bloc.appendChild(el("h3", null, "La liste de mots"));
    bloc.appendChild(paragraphe((b.critiqueReconnu ? "Vous avez reconnu « " + drm.item.critique + " », qui n'était pas dans la liste. " : "Vous n'avez pas reconnu « " + drm.item.critique + " », qui n'était pas dans la liste. ") + drm.item.explication));
  }
  const recit = de("recit");
  if (recit && Array.isArray(recit.reponse.valeur)) {
    const couleur = recit.item.choix[recit.reponse.valeur[1]];
    bloc.appendChild(el("h3", null, "Le récit"));
    bloc.appendChild(paragraphe((couleur === recit.item.vue ? "Vous avez retrouvé la bonne couleur. " : couleur === recit.item.suggeree ? "Vous avez choisi la couleur suggérée par la question, pas celle du récit. " : "Vous avez choisi une autre couleur. ") + recit.item.explication));
  }
  const source = de("source");
  if (source && Array.isArray(source.reponse.valeur)) {
    const b = bilanSource(source.item, source.reponse.valeur.map(x => x === "" ? null : x));
    bloc.appendChild(el("h3", null, "Qui a dit quoi"));
    bloc.appendChild(paragraphe("Source retrouvée pour " + b.justes + " information" + (b.justes > 1 ? "s" : "") + " sur " + b.n + ". " + source.item.explication));
  }
  return bloc;
}

// ---------- Résultats ----------
function terminerEtAfficher(t) {
  const r = terminerPassation(GT.etat, maintenantISO());
  if (r.erreur) { annoncer(r.erreur); return; }
  const fini = r.etat.historiqueTests.find(x => x.id === t.id);
  fini.scores = calculerScores(fini);
  sauver(r.etat);
  GT.zone.innerHTML = "";
  afficherProfil(GT.zone, t.id);
}
