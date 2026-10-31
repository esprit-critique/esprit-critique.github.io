// grand-test-interface.js : interface du Grand test (page #tests/grand-test), lecture et écriture de la clé
// « grandTest ». Les calculs, le tirage et la forme des données sont dans grand-test.js (fonctions pures).
// Tant que GRAND_TEST_VISIBLE vaut false, l'expérience n'est pas inscrite : la route renvoie à la liste des
// ateliers et rien ne mène au test.

// ===================== Stockage =====================
// La clé est relue à chaque ouverture. Une valeur illisible ou d'une version inconnue n'est jamais écrasée en
// silence : le test passe en lecture seule et propose d'exporter le contenu brut avant tout effacement.

function chargerGrandTest() {
  let brut;
  try { brut = localStorage.getItem("grandTest"); } catch (e) { return { etat: etatGrandTestVide(), probleme: "stockage indisponible", brut: null, lectureSeule: true }; }
  if (brut === null) return { etat: etatGrandTestVide(), probleme: null, brut: null };
  let valeur;
  try { valeur = JSON.parse(brut); } catch (e) { return { etat: null, probleme: "données illisibles", brut, lectureSeule: true }; }
  const m = migrerGrandTest(valeur);
  if (m.erreur) return { etat: null, probleme: m.erreur, details: m.details, brut, lectureSeule: true };
  return { etat: m.etat, probleme: null, brut, migre: versionDe(valeur) !== GT_VERSION_SCHEMA };
}

// Écrit l'état ; en cas d'échec (espace plein, stockage bloqué), l'ancien contenu reste en place
function enregistrerGrandTest(etat) {
  if (!grandTestValide(etat)) return { erreur: "état invalide, non enregistré" };
  try {
    localStorage.setItem("grandTest", JSON.stringify(etat));
    return { ok: true };
  } catch (e) {
    const plein = e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22);
    return { erreur: plein ? "espace de stockage plein" : "stockage indisponible" };
  }
}

// Télécharge un texte dans un fichier, sans rien envoyer
function telechargerTexte(nomFichier, texte, type) {
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob([texte], { type: type || "application/json" }));
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
}

// N'efface que la clé du Grand test : les autres progressions du site restent intactes
function effacerGrandTest() {
  try { localStorage.removeItem("grandTest"); return true; } catch (e) { return false; }
}

// ===================== Page =====================

// Bloc affiché quand la clé est illisible : export du contenu brut, puis effacement de la seule clé du test
function blocProblemeStockage(zone, charge) {
  const bloc = el("div", "section gt-probleme");
  bloc.appendChild(el("h2", "titre-section", "Vos résultats du Grand test ne peuvent pas être lus"));
  bloc.appendChild(paragraphe("Raison : " + charge.probleme + ". Rien n'a été effacé ni modifié. Le test reste en lecture seule tant que ce contenu est là."));
  if (charge.brut !== null && charge.brut !== undefined) {
    bloc.appendChild(paragraphe("Pour ne rien perdre, enregistrez d'abord ce contenu dans un fichier. Vous pourrez le transmettre ou le réimporter plus tard, avec une version du site qui le reconnaît."));
    const exporter = el("button", "bouton", "Enregistrer le contenu brut dans un fichier");
    exporter.addEventListener("click", () => {
      telechargerTexte("grand-test-brut-" + new Date().toISOString().slice(0, 10) + ".json", charge.brut);
      annoncer("Contenu brut enregistré dans un fichier.");
    });
    bloc.appendChild(exporter);
  }
  const effacerBouton = el("button", "bouton secondaire", "Effacer seulement les données du Grand test");
  effacerBouton.addEventListener("click", () => {
    if (!confirm("Effacer les données du Grand test ? Vos autres progressions (fiches, quiz, ateliers) ne seront pas touchées.")) return;
    effacerGrandTest();
    afficherGrandTest(GT.zone);
  });
  bloc.appendChild(effacerBouton);
  zone.appendChild(bloc);
}

function afficherGrandTest(zone) {
  GT.zone = zone;
  GT.focaliser = false;
  zone.innerHTML = "";
  const charge = chargerGrandTest();
  if (charge.probleme && !charge.etat) { blocProblemeStockage(zone, charge); return; }
  GT.etat = charge.etat;
  GT.lectureSeule = !!charge.lectureSeule;
  if (charge.probleme) {
    const p = el("p", "gt-message", "Stockage indisponible dans ce navigateur : vos réponses ne seront pas gardées.");
    p.setAttribute("role", "status");
    zone.appendChild(p);
  }
  rafraichir();
}

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
    montrer(carte.querySelector(".retour-quiz"));
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
    montrer(carte.querySelector(".retour-quiz"));
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
  fini.ideesFaussesCorrigees = ideesFaussesCorrigees(fini).slice(0, 300);
  const niveau = niveauObserve(r.etat);
  fini.niveau = { id: niveau.id, statut: niveau.statut, calculeLe: maintenantISO() };
  sauver(r.etat);
  GT.zone.innerHTML = "";
  afficherProfil(GT.zone, t.id);
}

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
  const hasards = { A: hasardConventionnel(lignes.filter(l => l.item.axe === "A" && l.juste !== null).map(l => l.item.chance)), B: 0.25, C: 0.25 };
  const graphe = grapheAxes(scores, hasards);
  if (graphe) {
    axes.insertBefore(graphe, axes.firstChild);
    axes.insertBefore(paragraphe("Point : part de réponses justes ; barre : plage plausible ; trait fin : niveau du hasard.", "source"), graphe.nextSibling);
  }
  const etal = blocEtalonnage(lignes);
  if (etal) e.appendChild(etal);
  fourchettes.forEach((x, k) => { const l = lignes.filter(l => l.item.type === "fourchette" && Array.isArray(l.reponse.valeur))[k]; e.appendChild(ligneIntervalle({ q: l.item.q.q, v: x.q.v, unite: x.q.unite }, x.bas, x.haut, x.bas <= x.q.v && x.q.v <= x.haut)); });
  zone.appendChild(blocAteliersConseilles(t));
  [blocEntitesRencontrees(t), blocNiveau(GT.etat)].forEach(b => { if (b) zone.appendChild(b); });
  zone.appendChild(blocProgression(GT.etat));

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


// ===================== Graphiques et progression (lot 7) =====================
// SVG générés par le code, avec les classes existantes du site (aucune couleur nouvelle) ; chaque graphique a un titre,
// une description et un tableau équivalent : il n'est jamais la seule restitution. Échelles de 0 à 100 % non tronquées.

const AVERTISSEMENT_PROGRESSION = "Une progression peut refléter un apprentissage du format ; les scores fluctuent et tendent parfois à revenir vers la moyenne.";

// SVG accessible : role img, titre et description reliés
function svgAccessible(viewBox, titre, description) {
  const id = "gt-g-" + Math.random().toString(36).slice(2, 8);
  const s = svg("svg", { viewBox, class: "graphe", role: "img", "aria-labelledby": id + "-t " + id + "-d" });
  const t = svg("title", { id: id + "-t" }); t.textContent = typo(titre);
  const d = svg("desc", { id: id + "-d" }); d.textContent = typo(description);
  s.append(t, d);
  return s;
}

// Tableau équivalent : légende, en-têtes, lignes
function tableauEquivalent(legende, entetes, lignes) {
  const table = el("table", "gt-tableau");
  table.appendChild(el("caption", null, legende));
  const tr = el("tr");
  entetes.forEach(h => { const th = el("th", null, h); th.scope = "col"; tr.appendChild(th); });
  const thead = el("thead"); thead.appendChild(tr); table.appendChild(thead);
  const tbody = el("tbody");
  lignes.forEach(l => { const r = el("tr"); l.forEach(c => r.appendChild(el("td", null, c))); tbody.appendChild(r); });
  table.appendChild(tbody);
  const cadre = el("div", "gt-tableau-cadre");
  cadre.appendChild(table);
  return cadre;
}

// Axes A à C : point = proportion de réponses justes, segment = plage plausible à 80 %, trait vertical = hasard
function grapheAxes(scores, hasards) {
  const axes = ["A", "B", "C"].filter(a => scores[a].n >= ITEMS_MIN_PLAGE);
  if (!axes.length) return null;
  const x = v => 34 + 270 * v, h = 30 + 40 * axes.length;
  const s = svgAccessible("0 0 320 " + h, "Réussite par axe, avec plage plausible",
    axes.map(a => a + " : " + pourcentArrondi(scores[a].valeur) + ", plage de " + pourcentArrondi(scores[a].plage.bas) + " à " + pourcentArrondi(scores[a].plage.haut) + ", hasard " + pourcentArrondi(hasards[a])).join(" ; ") + ".");
  s.appendChild(svg("rect", { x: 34, y: 8, width: 270, height: h - 34, class: "graphe-fond" }));
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    s.appendChild(svg("line", { x1: x(v), y1: 8, x2: x(v), y2: h - 26, class: "graphe-grille" }));
    s.appendChild(texteSvg(x(v), h - 12, Math.round(100 * v) + " %", { class: "graphe-texte", "text-anchor": "middle" }));
  });
  axes.forEach((a, k) => {
    const y = 30 + 40 * k, sc = scores[a];
    s.appendChild(texteSvg(26, y + 4, a, { class: "graphe-texte", "text-anchor": "end" }));
    s.appendChild(svg("rect", { x: x(sc.plage.bas), y: y - 5, width: Math.max(1.5, x(sc.plage.haut) - x(sc.plage.bas)), height: 10, class: "barre-svg" }));
    s.appendChild(svg("line", { x1: x(hasards[a]), y1: y - 11, x2: x(hasards[a]), y2: y + 11, class: "graphe-diagonale" }));
    s.appendChild(svg("circle", { cx: x(sc.valeur), cy: y, r: 5, class: "graphe-point" }));
  });
  return s;
}

// Courbe d'étalonnage : courbeEtalonnage() du site, sans modification (niveaux 50 à 99 %) ; le niveau 25 % à part
function blocEtalonnage(lignes) {
  const avec = lignes.filter(l => l.juste !== null && l.reponse.certitude !== null);
  if (avec.length < ITEMS_MIN_PLAGE) return null;
  const cumul = {};
  avec.forEach(l => { const c = l.reponse.certitude; const [n, j] = cumul[c] || [0, 0]; cumul[c] = [n + 1, j + (l.juste ? 1 : 0)]; });
  const bloc = el("div", "gt-etalonnage");
  const graphe = courbeEtalonnage(Object.fromEntries(NIVEAUX_CONFIANCE.filter(c => cumul[c]).map(c => [c, cumul[c]])));
  graphe.setAttribute("aria-label", "Courbe d'étalonnage : réussite observée selon la certitude annoncée ; la diagonale correspond à un étalonnage parfait");
  bloc.appendChild(graphe);
  bloc.appendChild(tableauEquivalent("Réussite selon la certitude annoncée", ["Certitude", "Réponses", "Justes", "Réussite"],
    Object.keys(cumul).map(Number).sort((a, b) => a - b).map(c => [c + " %" + (c === 25 ? " (hors du graphique)" : ""), String(cumul[c][0]), String(cumul[c][1]), pourcentArrondi(cumul[c][1] / cumul[c][0])])));
  return bloc;
}

// Séries par axe pour la progression : réponses justes (0/1) de chaque test terminé, dans l'ordre
function seriesAxe(tests, axe) {
  return tests.map(t => lignesPassation(t).filter(l => l.item.axe === axe && l.juste !== null).map(l => l.juste ? 1 : 0));
}

// Progression d'un axe : un point par test (complet plein, express creux), plage verticale ; les points ne sont
// reliés qu'entre tests du même mode, qui seuls sont comparables
function grapheProgression(tests, axe) {
  const pts = tests.map((t, k) => ({ k, mode: t.mode, s: (t.scores && t.scores[axe] && t.scores[axe].n >= ITEMS_MIN_PLAGE) ? t.scores[axe] : null })).filter(p => p.s);
  if (!pts.length) return null;
  const n = tests.length, x = k => 40 + (n === 1 ? 125 : 250 * k / (n - 1)), y = v => 150 - 130 * v;
  const s = svgAccessible("0 0 320 190", "Progression de l'axe " + axe + " : " + AXES_GT[axe].nom,
    pts.map(p => "test " + (p.k + 1) + " (" + p.mode + ") : " + pourcentArrondi(p.s.valeur)).join(" ; ") + ". Les tests express et complets ne sont pas reliés.");
  s.appendChild(svg("rect", { x: 40, y: 20, width: 250, height: 130, class: "graphe-fond" }));
  [0, 0.5, 1].forEach(v => {
    s.appendChild(svg("line", { x1: 40, y1: y(v), x2: 290, y2: y(v), class: "graphe-grille" }));
    s.appendChild(texteSvg(34, y(v) + 3, Math.round(100 * v) + " %", { class: "graphe-texte", "text-anchor": "end" }));
  });
  const pasEtiquettes = Math.ceil(n / 8);
  tests.forEach((t, k) => { if (k % pasEtiquettes === 0 || k === n - 1) s.appendChild(texteSvg(x(k), 168, String(k + 1), { class: "graphe-texte", "text-anchor": "middle" })); });
  s.appendChild(texteSvg(165, 184, "Tests, dans l'ordre", { class: "graphe-texte", "text-anchor": "middle" }));
  ["complet", "express"].forEach(mode => {
    const m = pts.filter(p => p.mode === mode);
    if (m.length > 1) s.appendChild(svg("polyline", { points: m.map(p => x(p.k) + "," + y(p.s.valeur)).join(" "), class: mode === "complet" ? "graphe-point-ligne" : "graphe-point-partie-ligne" }));
  });
  pts.forEach(p => {
    s.appendChild(svg("line", { x1: x(p.k), y1: y(p.s.plage.bas), x2: x(p.k), y2: y(p.s.plage.haut), class: "sch-trait" }));
    s.appendChild(svg("circle", { cx: x(p.k), cy: y(p.s.valeur), r: 4, class: p.mode === "complet" ? "graphe-point" : "graphe-point-partie" }));
  });
  return s;
}

// Section « Au fil de vos tests » : graphiques, tableau, tendance selon la règle préenregistrée
function blocProgression(etat) {
  const tests = passationsTerminees(etat);
  const bloc = el("section", "gt-progression-tests");
  bloc.appendChild(el("h3", null, "Au fil de vos tests"));
  if (!tests.length) { bloc.appendChild(paragraphe("Aucun test terminé.")); return bloc; }
  ["A", "B", "C"].forEach(a => {
    const g = grapheProgression(tests, a);
    if (!g) return;
    bloc.appendChild(el("p", "consigne", a + ". " + AXES_GT[a].nom));
    bloc.appendChild(g);
    const complets = tests.filter(t => t.mode === "complet");
    const tdc = tendance(seriesAxe(complets, a), graineDe(a + complets.map(t => t.id).join()));
    bloc.appendChild(paragraphe("Tests complets : " + tdc.verdict + "." + (complets.length >= 3 ? "" : " Une tendance ne s'annonce qu'à partir de trois tests comparables."), "source"));
  });
  bloc.appendChild(paragraphe("Point plein : test complet ; point creux : test express. " + AVERTISSEMENT_PROGRESSION, "source"));
  bloc.appendChild(tableauEquivalent("Vos tests terminés", ["Test", "Mode", "Date", "A", "B", "C", "Idées fausses corrigées"],
    tests.map((t, k) => [String(k + 1), t.mode, new Date(t.dateFin).toLocaleDateString("fr-FR"),
      ...["A", "B", "C"].map(a => t.scores && t.scores[a] && t.scores[a].plage ? pourcentArrondi(t.scores[a].valeur) + " (" + pourcentArrondi(t.scores[a].plage.bas) + "–" + pourcentArrondi(t.scores[a].plage.haut) + ")" : "—"),
      String((t.ideesFaussesCorrigees || []).length)])));
  return bloc;
}

// Idées fausses rencontrées et corrigées dans une passation : affirmations fausses jugées vraies
const ideesFaussesCorrigees = t => lignesPassation(t).filter(l => l.item.type === "vf" && l.item.juste === false && l.reponse.valeur === true).map(l => l.item.instanceId);


// ===================== Ateliers conseillés et ateliers nouveaux (lot 8) =====================
// Trois ateliers conseillés à la fin d'un test : erreurs pondérées par la certitude, lien famille → fiche → atelier
// (identifiants réels, vérifiés par le banc « familles »), sections variées, ateliers déjà pratiqués écartés s'il
// existe une autre piste. La phrase « Pourquoi celui-ci » décrit un type de raisonnement observé, jamais un trait.
function ateliersConseilles(t) {
  const poids = {}, raisons = {};
  const pratiques = lire("resultatsAteliers", {});
  lignesPassation(t).filter(l => l.juste === false).forEach(l => {
    const w = l.reponse.certitude ? l.reponse.certitude / 100 : 0.5;
    const adresses = new Set(l.item.ateliers || []);
    (l.item.fiches || []).forEach(cle => ateliersDeLaFiche(cle).forEach(a => adresses.add(a.adresse)));
    const famille = familleGT(l.item.famille);
    adresses.forEach(ad => {
      poids[ad] = (poids[ad] || 0) + w;
      if (!raisons[ad] || w > raisons[ad].w) raisons[ad] = { w, texte: famille ? famille.construit : "une affirmation sur « " + (l.item.texte || "").slice(0, 60) + "… »" };
    });
  });
  const tous = tousLesAteliers();
  const candidats = Object.keys(poids).map(ad => tous.find(a => a.adresse === ad)).filter(Boolean)
    .sort((a, b) => poids[b.adresse] - poids[a.adresse] || a.adresse.localeCompare(b.adresse));
  const nouveaux = candidats.filter(a => !pratiques[a.atelier.id]), ordre = nouveaux.length >= 3 ? nouveaux : nouveaux.concat(candidats.filter(a => pratiques[a.atelier.id]));
  const choisis = [], sections = new Set();
  ordre.forEach(a => { if (choisis.length < 3 && !sections.has(a.atelier.section)) { choisis.push(a); sections.add(a.atelier.section); } });
  ordre.forEach(a => { if (choisis.length < 3 && !choisis.includes(a)) choisis.push(a); });
  return choisis.map(a => ({ atelier: a, raison: "Pourquoi celui-ci : plusieurs de vos réponses à revoir portaient sur ce point — " + raisons[a.adresse].texte.charAt(0).toLowerCase() + raisons[a.adresse].texte.slice(1) + "." }));
}

function blocAteliersConseilles(t) {
  const conseils = ateliersConseilles(t);
  const bloc = el("section", "gt-conseils");
  bloc.appendChild(el("h3", null, "Trois ateliers pour aller plus loin"));
  if (!conseils.length) { bloc.appendChild(paragraphe("Aucune erreur à approfondir dans ce test : explorez librement les ateliers.")); return bloc; }
  conseils.forEach(c => {
    const p = el("p");
    p.append(lienVers(c.atelier.adresse, c.atelier.atelier.titre, "lien-texte"), el("br"), el("span", "source", c.raison));
    bloc.appendChild(p);
  });
  return bloc;
}

// Deux ateliers nouveaux, issus de l'audit des manques : la mémoire (aucun atelier n'existait) et la sur-correction.
// Leur contenu est à relire : ils ne sont inscrits que si le Grand test est visible (copie d'essai seulement).
function atelierFauxSouvenirs(zone) {
  zone.innerHTML = "";
  const graine = Math.floor(Math.random() * 4294967295) >>> 0;
  const demo = demonstrationDRM(Math.floor(Math.random() * LISTES_DRM_GT.length), graine);
  zone.appendChild(paragraphe("Lisez cette liste de dix mots, sans vous presser. Vous devrez ensuite reconnaître ceux qui y figuraient."));
  const ul = el("ul", "gt-liste-mots");
  demo.liste.forEach(m => ul.appendChild(el("li", null, m)));
  zone.appendChild(ul);
  zone.appendChild(boutonSuivant("J'ai lu la liste", () => {
    zone.innerHTML = "";
    const reponses = demo.test.map(() => null);
    const valider = boutonValider();
    demo.test.forEach((x, k) => zone.appendChild(groupeChoix("« " + x.mot + " » était-il dans la liste ?", ["Oui", "Non"], null, j => { reponses[k] = j === 0; valider.disabled = reponses.some(r => r === null); }).element));
    zone.appendChild(valider);
    valider.addEventListener("click", () => {
      const b = bilanDRM(demo, reponses);
      zone.querySelectorAll("button").forEach(x => { x.disabled = true; });
      valider.remove();
      noterPartie("faux-souvenirs", b.critiqueReconnu ? 0 : 1, 1);
      ajouterExplication(zone, "Ce que montre cet atelier", [(b.critiqueReconnu ? "Vous avez reconnu « " + demo.critique + " », absent de la liste. " : "« " + demo.critique + " » n'était pas dans la liste, et vous l'avez écarté. ") + demo.explication,
        "Paradigme de Roediger et McDermott (1995). Ces listes françaises sont originales et non normées : c'est une démonstration, pas une mesure."], [["#biais/faux-souvenirs", "Fiche : faux souvenirs"]]);
      boutonRejouer(zone, () => atelierFauxSouvenirs(zone));
    });
  }));
}

function atelierDouterJuste(zone) {
  zone.innerHTML = "";
  const graine = Math.floor(Math.random() * 4294967295) >>> 0, alea = generateur(graine);
  const familles = melanger(FAMILLES_GT.filter(f => f.surCorrection), alea).slice(0, 4);
  const items = familles.map(f => instanceGT(f, Math.floor(alea() * tailleFamille(f)), graine));
  derouler(zone, items, (item, z, fini) => {
    z.appendChild(paragraphe(item.texte));
    const g = groupeChoix(item.question, item.choixAffiches, null, k => {
      g.desactiver();
      g.boutons[item.justeAffiche].classList.add("juste");
      if (k !== item.justeAffiche) g.boutons[k].classList.add("faux");
      const retour = correction(item, k, null);
      z.appendChild(retour);
      fini(k === item.justeAffiche, retour);
    });
    z.appendChild(g.element);
  }, resultats => {
    const justes = resultats.filter(Boolean).length;
    afficherScore(zone, "douter-juste", justes, resultats.length);
    ajouterExplication(zone, "Douter juste", [MESSAGE_SUR_CORRECTION, "Chaque situation était construite pour que la preuve permette de conclure, ou pour que la règle apprise ne s'applique plus. Rejeter par principe est une erreur aussi."], [["#sophismes/sophisme-sophisme", "Fiche : sophisme du sophisme"]]);
    boutonRejouer(zone, () => atelierDouterJuste(zone));
  });
}


// ===================== Entités et niveaux (lot 9 ; absents tant que PERSONNAGES_VISIBLES vaut false) =====================
// Dessin commun au trait (le trait de Müller-Lyer) et 2 ou 3 traits distinctifs ; couleur de la catégorie de la fiche
// (--c), aucun dégradé, aucune ombre, aucune animation. Nom accessible : le rôle pédagogique de l'entité.
const TRAITS_ENTITE = {
  ouvertes: '<path d="M10 24 4 18M10 24l-6 6M38 24l6-6M38 24l6 6"/>', fermees: '<path d="M10 24l6-6M10 24l6 6M38 24l-6-6M38 24l-6 6"/>',
  double: '<path d="M10 32h28"/>', cercle: '<circle cx="24" cy="12" r="5" class="fond"/>', pointille: '<path d="M10 38h28" class="pointille"/>',
  fleche: '<path d="M18 40h14m-4-4 4 4-4 4"/>', vague: '<path d="M10 8c4-4 8 4 12 0s8 4 12 0"/>', croix: '<path d="M36 6l6 6M42 6l-6 6"/>'
};
function dessinEntite(e, fiche) {
  const s = svg("svg", { viewBox: "0 0 48 48", class: "picto", role: "img", "aria-label": e[1] + " : métaphore du mécanisme « " + fiche.nom + " »" });
  s.innerHTML = '<path d="M10 24h28"/>' + e[2].map(t => TRAITS_ENTITE[t]).join("");   // dessins fixes, aucune donnée extérieure
  return s;
}
const ficheDeCle = cle => { const [type, id] = cle.split(":"); return { type, id, fiche: trouverFiche(type, id) }; };
const premierePhrase = t => (String(t).match(/^.*?[.!?](\s|$)/) || [t])[0].trim();

// « Les mécanismes rencontrés aujourd'hui » : entités liées aux erreurs de cette passation, erreurs sûres d'abord
function blocEntitesRencontrees(t, visible = PERSONNAGES_VISIBLES) {
  if (!visible) return null;
  const poids = {};
  lignesPassation(t).filter(l => l.juste === false).forEach(l => fichesItem(l.item).forEach(cle => { poids[cle] = (poids[cle] || 0) + (l.reponse.certitude || 50); }));
  const cles = Object.keys(poids).sort((a, b) => poids[b] - poids[a]).slice(0, 6);
  const bloc = el("section", "gt-entites");
  bloc.appendChild(el("h3", null, "Les mécanismes rencontrés aujourd'hui"));
  if (!cles.length) { bloc.appendChild(paragraphe("Aucune erreur liée à une fiche dans ce test.")); return bloc; }
  bloc.appendChild(paragraphe("Chaque figure représente un mécanisme qui peut arriver à tout le monde, pas une caractéristique de votre personne.", "source"));
  cles.forEach(cle => {
    const e = ENTITES_GT.find(x => x[0] === cle), f = ficheDeCle(cle);
    if (!e || !f.fiche) return;
    const carte = el("div", "gt-entite");
    carte.style.setProperty("--c", COULEURS[f.fiche.categorie] || "");
    const texte = el("div");
    texte.append(el("p", "consigne", e[1]), paragraphe("Mécanisme : " + f.fiche.definition), paragraphe("Parade : " + premierePhrase(f.fiche.parade)));
    const liens = el("div", "voir-aussi");
    liens.appendChild(lienVers("#" + f.type + "/" + f.id, "Fiche : " + f.fiche.nom));
    ateliersDeLaFiche(cle).slice(0, 1).forEach(a => liens.appendChild(lienVers(a.adresse, "Atelier : " + a.atelier.titre)));
    texte.appendChild(liens);
    carte.append(dessinEntite(e, f.fiche), texte);
    bloc.appendChild(carte);
  });
  return bloc;
}

function blocNiveau(etat, visible = PERSONNAGES_VISIBLES) {
  if (!visible) return null;
  const n = niveauObserve(etat);
  const bloc = el("section", "gt-niveau");
  bloc.appendChild(el("h3", null, "Repère de pratique"));
  if (n.id === null) bloc.appendChild(paragraphe("À mesurer : il faut au moins un test complet."));
  else {
    const [titre, personnage, saitFaire] = NIVEAUX_GT[n.id - 1];
    bloc.append(el("p", "consigne", "Niveau " + n.id + " : " + titre), paragraphe(personnage + " — " + saitFaire));
  }
  bloc.appendChild(paragraphe(TEXTE_NIVEAU_GT, "source"));
  bloc.appendChild(paragraphe("Monter d'un niveau demande une réussite répétée dans deux tests complets espacés d'au moins sept jours, en tenant compte de l'incertitude ; un niveau qui ne se confirme plus redescend.", "source"));
  return bloc;
}

// ===================== Inscription =====================
// Seulement si le test est publié (ou dans la copie d'essai du banc) : sinon aucune carte, aucune route.

if (GRAND_TEST_VISIBLE) {
  EXPERIENCES.push({
    id: "grand-test",
    section: "confiance",
    ordre: 1,
    picto: "jauge",
    couleur: "#5b5bb5",
    duree: "15 ou 50 min",
    titre: "Le Grand test",
    resume: "Cinq façons de raisonner, mesurées séparément, avec leur marge d'incertitude : ni score global, ni classement. En version express (12 à 15 minutes) ou complète, en plusieurs fois.",
    lancer(zone) { afficherGrandTest(zone); }
  }, {
    id: "faux-souvenirs", section: "philosopher", picto: "pensee", couleur: "#8a3f8f", duree: "3 min", titre: "Faux souvenirs",
    resume: "Lisez une liste de mots, puis reconnaissez-les : la mémoire ajoute parfois un mot qui n'y était pas.",
    lancer(zone) { atelierFauxSouvenirs(zone); }
  }, {
    id: "douter-juste", section: "raisonner", picto: "balance", couleur: "#2f6db5", duree: "4 min", titre: "Douter juste",
    resume: "Quatre situations où la preuve permet de conclure, ou où une règle apprise ne s'applique plus : l'esprit critique n'est pas le contre-pied.",
    lancer(zone) { atelierDouterJuste(zone); }
  });
}
