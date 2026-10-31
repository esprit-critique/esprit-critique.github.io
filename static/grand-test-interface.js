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

const GT_PAGE = { zone: null, charge: null, message: null };

// Message d'état, annoncé aux lecteurs d'écran sans déplacer le focus
function messageGT(zone, texte, classe) {
  const p = el("p", "gt-message" + (classe ? " " + classe : ""), texte);
  p.setAttribute("role", "status");
  zone.appendChild(p);
  return p;
}

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
    afficherGrandTest(GT_PAGE.zone);
  });
  bloc.appendChild(effacerBouton);
  zone.appendChild(bloc);
}

function afficherGrandTest(zone) {
  GT_PAGE.zone = zone;
  zone.innerHTML = "";
  const charge = chargerGrandTest();
  GT_PAGE.charge = charge;
  if (charge.probleme && !charge.etat) { blocProblemeStockage(zone, charge); return; }
  if (charge.probleme) messageGT(zone, "Stockage indisponible dans ce navigateur : vos réponses ne seront pas gardées.");
  const etat = charge.etat;
  const enCours = passationEnCours(etat);
  zone.appendChild(paragraphe("Ce test ne produit pas de score global. Vos réponses restent dans votre navigateur et ne sont pas envoyées."));
  if (enCours) messageGT(zone, "Un test " + enCours.mode + " est en cours : " + pluriel(enCours.reponses.length, "réponse validée", "réponses validées") + " sur " + enCours.instances.length + ".");
  else messageGT(zone, passationsTerminees(etat).length ? pluriel(passationsTerminees(etat).length, "test terminé", "tests terminés") + "." : "Aucun test passé pour l'instant.");
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
  });
}
