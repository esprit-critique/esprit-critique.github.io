// app.js : logique de l'application (navigation, accueil, fiches, quiz, révisions, progression).
// Contenu : donnees.js. Illustrations : schemas.js. Ateliers : ateliers.js, chiffres.js, perception.js,
// experiences.js, avec leurs contenus dans jeux-donnees.js et pays.js.

// ===================== Protection contre l'encadrement =====================
// Un autre site ne doit pas pouvoir afficher celui-ci dans un cadre pour faire cliquer à l'insu du visiteur
// (« clickjacking ») ; GitHub Pages ne permet pas l'en-tête qui l'interdirait. Un cadre du même site (les bancs
// d'essai) reste permis : seul un parent d'une autre origine rend la lecture de top.location impossible.
(function refuserEncadrement() {
  try { void window.top.location.href; } catch (e) {
    document.body.textContent = "";
    const p = document.createElement("p");
    p.className = "sans-script";
    const a = document.createElement("a");
    a.href = location.href; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Ouvrir Esprit critique dans un nouvel onglet";
    p.append("Ce site ne s'affiche pas dans la page d'un autre site. ", a);
    document.body.appendChild(p);
    throw new Error("Esprit critique : affichage dans le cadre d'un autre site refusé");
  }
})();

// ===================== Vérification du chargement =====================
// Sur une connexion instable, un fichier peut ne pas arriver : on le dit clairement plutôt que d'afficher une page cassée.
(function verifierChargement() {
  const manquants = [
    [typeof BIAIS, "donnees.js"], [typeof NS_SVG, "schemas.js"], [typeof PAYS, "pays.js"], [typeof MONDE, "jeux-donnees.js"],
    [typeof PICTOS, "ateliers.js"], [typeof NOMS_NIVEAUX, "niveaux.js"], [typeof EXPERIENCES, "experiences.js"], [typeof JEUX, "chiffres.js"], [typeof gauss, "perception.js"], [typeof DEBATS, "debattre.js"], [typeof SYLLOGISMES, "raisonner.js"], [typeof testT, "pratiques.js"], [typeof INDICES, "indices.js"]
  ].filter(([type]) => type === "undefined").map(([, fichier]) => fichier);
  if (!manquants.length) return;
  const main = document.querySelector("main");
  main.innerHTML = '<section class="vue"><article class="carte"><h2>Chargement incomplet</h2>' +
    '<p>Une partie de l\'application n\'a pas pu être chargée (' + manquants.join(", ") + '). Vérifiez votre connexion à Internet, puis rechargez la page.</p>' +
    '<button class="bouton" onclick="location.reload()">Recharger</button></article></section>';
  throw new Error("Fichiers manquants : " + manquants.join(", "));
})();

// ===================== Données de base =====================

const TYPES = {
  biais: {
    fiches: BIAIS,
    categories: CATEGORIES_BIAIS,
    singulier: "biais",
    pluriel: "Biais",
    titreMecanisme: "Mécanisme",
    titreParade: "Comment s'en prémunir",
    consigneQuiz: "Quel biais est à l'œuvre ?"
  },
  sophismes: {
    fiches: SOPHISMES,
    categories: CATEGORIES_SOPHISMES,
    singulier: "sophisme",
    pluriel: "Sophismes",
    titreMecanisme: "Pourquoi l'argument est invalide",
    titreParade: "Comment répondre",
    consigneQuiz: "Quel sophisme est commis ?"
  }
};

// Couleur de chaque catégorie, définie dans donnees.js
const COULEURS = {};
[...CATEGORIES_BIAIS, ...CATEGORIES_SOPHISMES].forEach(c => { COULEURS[c.nom] = c.couleur; });

// Toutes les fiches, repérées par une clé "biais:ancrage" ou "sophismes:post-hoc"
const INDEX = new Map();
Object.entries(TYPES).forEach(([type, conf]) => {
  conf.fiches.forEach(fiche => INDEX.set(type + ":" + fiche.id, { type, fiche }));
});
const cleFiche = (type, fiche) => type + ":" + fiche.id;
const trouverFiche = (type, id) => (INDEX.get(type + ":" + id) || {}).fiche;

// Ordre d'affichage : catégorie par catégorie, comme dans la liste
const ORDRE = {};
Object.entries(TYPES).forEach(([type, conf]) => {
  ORDRE[type] = conf.categories.flatMap(cat => conf.fiches.filter(f => f.categorie === cat.nom));
});

// Notions proches (« lies » et « distinction », dans les deux sens).
// Elles ne sont jamais proposées comme mauvaise réponse : une situation pourrait leur correspondre aussi.
const PROCHES = new Map();
function relier(a, b) {
  if (!PROCHES.has(a)) PROCHES.set(a, new Set());
  if (!PROCHES.has(b)) PROCHES.set(b, new Set());
  PROCHES.get(a).add(b);
  PROCHES.get(b).add(a);
}
INDEX.forEach(({ fiche }, cle) => {
  (fiche.lies || []).forEach(l => relier(cle, l));
  if (fiche.distinction) relier(cle, fiche.distinction[0]);
});

// ===================== Outils =====================

const $ = id => document.getElementById(id);

// Typographie française : espace fine insécable avant ; : ! ? % » et après «,
// pour que la ponctuation ne se retrouve jamais seule en début de ligne
function typo(texte) {
  return String(texte).replace(/ ([;:!?%»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=\d{3}\b)/g, "$1 ");
}

// Crée un élément HTML avec une classe et un texte (textContent : aucun risque d'injection)
function el(balise, classe, texte) {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = typo(texte);
  return e;
}

const texteNoeud = texte => document.createTextNode(typo(texte));

function lienVers(adresse, texte, classe) {
  const a = el("a", classe, texte);
  a.href = adresse;
  return a;
}

// Minuscules et sans accents, pour une recherche tolérante
function normaliser(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Mélange de Fisher-Yates ; « alea » permet un mélange reproductible (situation du jour)
function melanger(tableau, alea = Math.random) {
  const t = [...tableau];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

// Générateur pseudo-aléatoire reproductible (mulberry32) : même graine, même suite de nombres
function generateur(graine) {
  let a = graine >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Numéro du jour (heure locale), pour les révisions et la situation du jour
function aujourdHui() {
  const d = new Date();
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

const pluriel = (n, mot, motPluriel) => n + " " + (n > 1 ? (motPluriel || mot + "s") : mot);

// ===================== Sauvegarde locale =====================
// localStorage peut être indisponible (navigation privée) : chaque accès est protégé.

function lire(cle, defaut) {
  try {
    const v = localStorage.getItem(cle);
    return v === null ? defaut : JSON.parse(v);
  } catch (e) {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch (e) { /* rien */ }
}

function effacer(cle) {
  try { localStorage.removeItem(cle); } catch (e) { /* rien */ }
}

// Toutes les clés enregistrées par l'application (pour l'effacement et la sauvegarde dans un fichier)
const CLES_SAUVEGARDE = [
  "acquis", "memoire", "records", "activite", "jour", "derniereFiche", "modeQuiz", "typeFiches", "erreurs",
  "experiencesFaites", "jeuxFaits", "etalonnage", "points", "resultatsAteliers", "vus", "confiance",
  "fourchettes", "illusions", "montyHall", "reponsesPensee", "ancrages", "hasardEcrit", "themePays", "vfJour",
  "duels", "certitudeQuiz", "certitudes", "erreursSures", "debats", "logique", "etudes", "previsions", "niveaux", "defiJour", "chrono", "theme", "reperages", "ceciteFaite", "bingo", "decisions", "bilanFormes"
];

// Forme attendue de chaque clé, pour vérifier une sauvegarde importée : une valeur d'une autre forme
// (un texte à la place d'un tableau…) bloquerait le site au chargement suivant. Elle est donc ignorée.
const FORMES_SAUVEGARDE = {
  tableau: ["acquis", "activite", "erreurs", "experiencesFaites", "jeuxFaits", "fourchettes", "illusions", "ancrages", "hasardEcrit",
    "erreursSures", "debats", "logique", "etudes", "previsions", "reperages", "decisions"],
  objet: ["memoire", "records", "jour", "etalonnage", "points", "resultatsAteliers", "vus", "confiance", "montyHall", "reponsesPensee",
    "vfJour", "duels", "certitudes", "niveaux", "defiJour", "chrono", "bingo", "bilanFormes"],
  texte: ["derniereFiche", "modeQuiz", "typeFiches", "themePays", "theme"],
  booleen: ["certitudeQuiz", "ceciteFaite"]
};
const formeDe = v => Array.isArray(v) ? "tableau" : v !== null && typeof v === "object" ? "objet" : typeof v === "string" ? "texte" : typeof v === "boolean" ? "booleen" : "autre";
const formeValide = (cle, valeur) => (FORMES_SAUVEGARDE[formeDe(valeur)] || []).includes(cle);

// Fiches marquées comme acquises par l'utilisateur
const acquis = new Set(lire("acquis", []).filter(c => INDEX.has(c)));

function basculerAcquis(cle) {
  if (acquis.has(cle)) acquis.delete(cle); else acquis.add(cle);
  ecrire("acquis", [...acquis]);
}

// ===================== Révision espacée (méthode Leitner) =====================
// Chaque fiche rencontrée au quiz a une « boîte » de 1 à 5. Bonne réponse : boîte suivante,
// révision plus tardive. Erreur : retour en boîte 1, révision le lendemain.
// memoire["biais:ancrage"] = { b: boîte, d: jour de la prochaine révision, n: réponses, j: justes }

const INTERVALLES = [0, 1, 3, 7, 14, 30]; // en jours, selon la boîte
const memoire = lire("memoire", {});

// Ancienne version : les erreurs du quiz étaient une simple liste. On les reprend en boîte 1.
(function migrerAnciennesErreurs() {
  const anciennes = lire("erreurs", null);
  if (!anciennes) return;
  anciennes.forEach(cle => {
    if (INDEX.has(cle) && !memoire[cle]) memoire[cle] = { b: 1, d: aujourdHui(), n: 1, j: 0 };
  });
  ecrire("memoire", memoire);
  effacer("erreurs");
})();

// « certitude » (facultative) : "sur", "plutot" ou "hasard". Une bonne réponse donnée au hasard ne fait pas
// monter la notion de boîte ; une erreur commise en étant sûr la ramène en boîte 1, comme toute erreur.
function enregistrerReponse(cle, juste, certitude) {
  const m = memoire[cle] || { b: 0, d: 0, n: 0, j: 0 };
  m.n++;
  if (juste) {
    m.j++;
    if (certitude !== "hasard") m.b = Math.min(5, m.b + 1);
  } else {
    m.b = 1;
  }
  m.d = aujourdHui() + Math.max(1, INTERVALLES[m.b]);
  memoire[cle] = m;
  ecrire("memoire", memoire);
  noterActivite();
}

// Fichier .ics des révisions prévues sur les 60 prochains jours (les révisions en retard comptent pour aujourd'hui)
function exporterRevisions() {
  const auj = aujourdHui();
  const parJour = {};
  Object.keys(memoire).filter(c => INDEX.has(c)).forEach(c => {
    const jour = Math.max(auj, memoire[c].d);
    if (jour < auj + 60) parJour[jour] = (parJour[jour] || 0) + 1;
  });
  const evenements = Object.keys(parJour).map(Number).sort((a, b) => a - b).map(jour => ({
    jour,
    titre: "Esprit critique : " + pluriel(parJour[jour], "notion") + " à réviser",
    description: "Révisions du quiz : https://esprit-critique.github.io/#quiz/reviser",
    url: "https://esprit-critique.github.io/#quiz"
  }));
  return fichierAgenda("revisions-esprit-critique.ics", evenements);
}

// Fiches dont la révision est due, les plus en retard d'abord
function clesAReviser() {
  const auj = aujourdHui();
  return Object.keys(memoire)
    .filter(c => INDEX.has(c) && memoire[c].d <= auj)
    .sort((a, b) => memoire[a].d - memoire[b].d || memoire[a].b - memoire[b].b);
}

function prochaineRevision() {
  const jours = Object.keys(memoire).filter(c => INDEX.has(c)).map(c => memoire[c].d);
  return jours.length ? Math.min(...jours) : null;
}

// Jours d'activité, pour la série de jours consécutifs
function noterActivite() {
  const jours = new Set(lire("activite", []));
  jours.add(aujourdHui());
  ecrire("activite", [...jours].sort((a, b) => a - b).slice(-400));
}

function serieDeJours() {
  const jours = new Set(lire("activite", []));
  let j = aujourdHui();
  if (!jours.has(j)) j--; // la série reste valable tant qu'on n'a pas manqué hier
  let n = 0;
  while (jours.has(j)) { n++; j--; }
  return n;
}

function statistiques() {
  let n = 0, justes = 0;
  const parCategorie = {};
  Object.entries(memoire).forEach(([cle, m]) => {
    const r = INDEX.get(cle);
    if (!r) return;
    n += m.n;
    justes += m.j;
    const c = r.fiche.categorie;
    parCategorie[c] = parCategorie[c] || { n: 0, j: 0, type: r.type };
    parCategorie[c].n += m.n;
    parCategorie[c].j += m.j;
  });
  return { n, justes, parCategorie };
}

// ===================== Questions (quiz et situation du jour) =====================

// Quatre réponses : la bonne et trois leurres du même type, dont deux de la même catégorie
// si possible. Les notions proches de la bonne réponse sont exclues.
function choisirOptions(type, fiche, alea = Math.random) {
  const proches = PROCHES.get(cleFiche(type, fiche)) || new Set();
  const candidates = TYPES[type].fiches.filter(f => f !== fiche && !proches.has(cleFiche(type, f)));
  const memeCategorie = melanger(candidates.filter(f => f.categorie === fiche.categorie), alea).slice(0, 2);
  const autres = melanger(candidates.filter(f => !memeCategorie.includes(f)), alea);
  return melanger([fiche, ...memeCategorie, ...autres].slice(0, 4), alea);
}

function creerQuestion(type, fiche, alea = Math.random) {
  const cas = fiche.cas2 && alea() < 0.5 ? fiche.cas2 : fiche.cas;
  return { type, fiche, cas, options: choisirOptions(type, fiche, alea) };
}

// Affiche une question dans « carte ». « surReponse(option) » est appelé au premier clic ;
// « actions(zone) » ajoute les boutons de suite sous la correction.
// Avec « q.certitude », la certitude est demandée entre le choix et la correction ;
// « surReponse(option, certitude) » reçoit alors "sur", "plutot" ou "hasard".
function rendreQuestion(carte, q, reponseDejaDonnee, surReponse, actions) {
  if (q.libre) return rendreQuestionLibre(carte, q, reponseDejaDonnee, surReponse, actions);
  carte.style.setProperty("--c", "#2a8a5c");
  carte.append(el("p", "consigne", q.consigne || TYPES[q.type].consigneQuiz), el("p", "cas", q.cas));

  const boutons = q.options.map((option, i) => {
    const b = el("button", "choix");
    b.append(el("kbd", null, String(i + 1)), el("span", null, option.nom));
    b.addEventListener("click", () => {
      if (carte.dataset.repondu) return;
      if (!q.certitude) {
        surReponse(option);
        corriger(option);
        return;
      }
      carte.dataset.repondu = "1";
      boutons.forEach(x => { x.disabled = true; });
      b.classList.add("choisi");
      demanderCertitude(option);
    });
    carte.appendChild(b);
    return b;
  });

  function demanderCertitude(option) {
    const bloc = el("div", "certitude");
    bloc.appendChild(el("p", "consigne", "Votre certitude ?"));
    const rangee = el("div", "certitude-boutons");
    NIVEAUX_CERTITUDE.forEach(([niveau, libelle], k) => {
      const b = el("button", "bouton secondaire");
      b.dataset.niveau = niveau;
      b.append(el("kbd", null, String(7 + k)), el("span", null, libelle));
      b.addEventListener("click", () => {
        bloc.remove();
        surReponse(option, niveau);
        corriger(option);
      });
      rangee.appendChild(b);
    });
    bloc.appendChild(rangee);
    carte.appendChild(bloc);
  }

  function corriger(option) {
    carte.dataset.repondu = "1";
    const juste = option === q.fiche;
    // La couleur de la catégorie n'apparaît qu'après la réponse, pour ne pas donner d'indice
    carte.style.setProperty("--c", COULEURS[q.fiche.categorie]);
    boutons.forEach((b, i) => {
      b.disabled = true;
      b.classList.remove("choisi");
      if (q.options[i] === q.fiche) b.classList.add("juste");
      else if (q.options[i] === option) b.classList.add("faux");
    });
    const retour = el("div", "retour-quiz");
    retour.append(
      el("p", "verdict " + (juste ? "juste" : "faux"), juste ? "Bonne réponse : " + q.fiche.nom + "." : "Réponse attendue : " + q.fiche.nom + "."),
      el("p", null, q.fiche.definition)
    );
    if (!juste) retour.appendChild(el("p", "source", "Votre réponse, « " + option.nom + " », désigne autre chose : " + option.definition));
    // Duel entre notions proches : ce qui les distingue, et les deux fiches
    if (q.voisine) {
      const p = el("p", "distinction");
      p.append(el("strong", null, "Ce qui les distingue : "), document.createTextNode(typo(q.fiche.distinction[1])));
      retour.appendChild(p);
      const liens = el("div", "voir-aussi");
      [[q.type, q.fiche], [q.voisine.type, q.voisine.fiche]].forEach(([t, f]) => liens.appendChild(lienVers("#" + t + "/" + f.id, f.nom)));
      retour.appendChild(liens);
    }
    const indice = boutonIndice(carte, q);
    if (indice) retour.appendChild(indice);
    const zoneActions = el("div", "actions");
    actions(zoneActions);
    retour.appendChild(zoneActions);
    carte.appendChild(retour);
  }

  if (reponseDejaDonnee) corriger(reponseDejaDonnee);
}

// ===================== Trouver l'indice =====================
// Après la correction, la situation se découpe en passages (après chaque virgule ou ponctuation) : on touche
// celui qui trahit la notion. INDICES (indices.js) donne le passage attendu, pour les champs cas et cas2.
function boutonIndice(carte, q) {
  const numero = q.cas === q.fiche.cas ? 1 : q.cas === q.fiche.cas2 ? 2 : 0;
  const indice = numero && INDICES[cleFiche(q.type, q.fiche) + "#" + numero];
  const p = carte.querySelector("p.cas");
  if (!indice || !p) return null;
  // typo() ne fait que remplacer des espaces par des espaces insécables : les positions restent les mêmes
  const espaces = t => t.replace(/[\u00a0\u202f]/g, " ");
  const texte = p.textContent;
  const debut = espaces(texte).indexOf(espaces(indice));
  if (debut < 0) return null;
  const fin = debut + indice.length;
  const b = el("button", "bouton secondaire", "Trouver l'indice");
  b.addEventListener("click", () => {
    const consigne = el("p", "consigne", "Touchez le passage qui trahit la notion.");
    b.replaceWith(consigne);
    // Coupure après une ponctuation suivie d'une espace, sauf si une autre ponctuation suit (« ! » ») ;
    // « 4,7 » n'est pas coupé
    const morceaux = [];
    let courant = "";
    for (let i = 0; i < texte.length; i++) {
      courant += texte[i];
      if (/\s/.test(texte[i]) && /[,;:.!?»]/.test(texte[i - 1] || "") && i + 1 < texte.length && !/[»!?;:]/.test(texte[i + 1])) {
        morceaux.push(courant);
        courant = "";
      }
    }
    if (courant) morceaux.push(courant);
    // Phrase sans ponctuation intérieure : un passage par mot
    if (morceaux.length < 3) morceaux.splice(0, morceaux.length, ...texte.match(/\S+\s*/g));
    p.innerHTML = "";
    let pos = 0;
    const passages = morceaux.map(m => {
      const s = el("button", "passage");
      s.textContent = m;
      s.dataset.debut = pos;
      s.dataset.fin = pos + m.length;
      pos += m.length;
      s.addEventListener("click", () => {
        const touche = Number(s.dataset.debut) < fin && Number(s.dataset.fin) > debut;
        // La situation, avec l'indice surligné
        p.innerHTML = "";
        p.append(document.createTextNode(texte.slice(0, debut)), el("mark", "indice"), document.createTextNode(texte.slice(fin)));
        p.querySelector("mark").textContent = texte.slice(debut, fin);
        consigne.replaceWith(el("p", "verdict " + (touche ? "juste" : "faux"), touche ? "Bien vu : l'indice est surligné." : "Ce passage-là ne trahit pas la notion ; l'indice est surligné."));
        annoncer(touche ? "Bien vu." : "L'indice est surligné.");
      });
      p.appendChild(s);
      return s;
    });
    passages[0].focus();
  });
  return b;
}

// ===================== Journal des repérages =====================
// « Je l'ai repéré » : l'utilisateur note qu'il a rencontré la notion dans la vie courante, avec une note facultative.
// reperages : [{ cle, j (jour), note }], les 300 derniers.
function journalReperage(cle) {
  const bloc = el("div", "reperage");
  const dessiner = () => {
    bloc.innerHTML = "";
    const miens = lire("reperages", []).filter(r => r.cle === cle);
    const bouton = el("button", "bouton secondaire", "Je l'ai repéré");
    const note = el("input", "champ");
    note.placeholder = "Où ? (facultatif)";
    note.setAttribute("aria-label", "Où avez-vous repéré cette notion ? (facultatif)");
    note.maxLength = 140;
    bouton.addEventListener("click", () => {
      const tous = lire("reperages", []);
      tous.push({ cle, j: aujourdHui(), note: note.value.trim() });
      ecrire("reperages", tous.slice(-300));
      noterActivite();
      annoncer("Repérage noté.");
      dessiner();
    });
    const ligne = el("div", "ligne");
    ligne.append(note, bouton);
    bloc.append(el("p", "consigne", "Dans la vie courante"), ligne);
    if (miens.length) {
      const dernier = miens[miens.length - 1];
      const date = new Date(dernier.j * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
      bloc.appendChild(el("p", "source", "Repéré " + pluriel(miens.length, "fois", "fois") + ", la dernière fois le " + date + (dernier.note ? " : « " + dernier.note + " »" : "") + "."));
    }
  };
  dessiner();
  return bloc;
}

// ===================== Réponse libre =====================
// Toutes les appellations d'une fiche, sans accents, majuscules ni ponctuation : son nom et ses autres noms
const sansPonctuation = t => normaliser(t).replace(/[^a-z0-9]+/g, " ").trim();
const appellations = fiche => [fiche.nom, ...(fiche.autresNoms || "").split(",")].map(sansPonctuation).filter(Boolean);

// La fiche que désigne une réponse tapée, ou null
function ficheDeReponse(texte) {
  const t = sansPonctuation(texte);
  if (!t) return null;
  for (const r of INDEX.values()) if (appellations(r.fiche).includes(t)) return r.fiche;
  return null;
}

// Fiches proposées pendant la saisie : celles dont une appellation commence par le texte tapé, puis celles qui le contiennent
function suggestionsFiches(texte) {
  const t = sansPonctuation(texte);
  if (t.length < 2) return [];
  const fiches = [...INDEX.values()];
  const debut = fiches.filter(r => appellations(r.fiche).some(a => a.startsWith(t) || a.split(" ").some(m => m.startsWith(t))));
  const dedans = fiches.filter(r => !debut.includes(r) && appellations(r.fiche).some(a => a.includes(t)));
  return [...debut, ...dedans].slice(0, 6);
}

function rendreQuestionLibre(carte, q, reponseDejaDonnee, surReponse, actions) {
  carte.style.setProperty("--c", "#2a8a5c");
  carte.append(el("p", "consigne", "Quelle notion ? Tapez son nom"), el("p", "cas", q.cas));
  const bloc = el("div", "reponse-libre");
  const ligne = el("div", "ligne");
  const champ = el("input", "champ");
  champ.type = "text";
  champ.autocomplete = "off";
  champ.spellcheck = false;
  champ.placeholder = "Nom du biais ou du sophisme";
  const idListe = "suggestions-" + Math.random().toString(36).slice(2, 8);
  champ.setAttribute("role", "combobox");
  champ.setAttribute("aria-label", "Nom de la notion");
  champ.setAttribute("aria-autocomplete", "list");
  champ.setAttribute("aria-controls", idListe);
  champ.setAttribute("aria-expanded", "false");
  const valider = el("button", "bouton", "Valider");
  valider.dataset.valider = "1";
  ligne.append(champ, valider);
  const liste = el("ul", "suggestions");
  liste.id = idListe;
  liste.setAttribute("role", "listbox");
  liste.hidden = true;
  bloc.append(ligne, liste);
  carte.appendChild(bloc);
  let proposees = [], active = -1;

  const montrerSuggestions = () => {
    proposees = suggestionsFiches(champ.value);
    active = -1;
    liste.innerHTML = "";
    proposees.forEach((r, k) => {
      const li = el("li", null, r.fiche.nom);
      li.id = idListe + "-" + k;
      li.setAttribute("role", "option");
      li.addEventListener("mousedown", e => { e.preventDefault(); choisir(k); });
      liste.appendChild(li);
    });
    liste.hidden = !proposees.length;
    champ.setAttribute("aria-expanded", String(!!proposees.length));
  };
  const surligner = k => {
    active = k;
    [...liste.children].forEach((li, i) => { li.classList.toggle("active", i === k); li.setAttribute("aria-selected", String(i === k)); });
    if (k >= 0) champ.setAttribute("aria-activedescendant", idListe + "-" + k); else champ.removeAttribute("aria-activedescendant");
  };
  const choisir = k => {
    champ.value = proposees[k].fiche.nom;
    liste.hidden = true;
    champ.setAttribute("aria-expanded", "false");
    champ.focus();
  };
  champ.addEventListener("input", montrerSuggestions);
  champ.addEventListener("keydown", e => {
    if (liste.hidden || !proposees.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      surligner((active + (e.key === "ArrowDown" ? 1 : proposees.length - 1)) % proposees.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      e.stopPropagation();   // Entrée choisit la suggestion ; une seconde Entrée valide
      choisir(active);
    } else if (e.key === "Escape") {
      liste.hidden = true;
      champ.setAttribute("aria-expanded", "false");
    }
  });
  valider.addEventListener("click", () => {
    if (!champ.value.trim()) { champ.focus(); return; }
    const reponse = ficheDeReponse(champ.value) || { nom: champ.value.trim() };
    surReponse(reponse);
    corriger(reponse);
  });

  function corriger(reponse) {
    carte.dataset.repondu = "1";
    champ.value = reponse.nom;
    champ.disabled = true;
    valider.remove();
    liste.hidden = true;
    const juste = reponse === q.fiche;
    carte.style.setProperty("--c", COULEURS[q.fiche.categorie]);
    const retour = el("div", "retour-quiz");
    retour.append(
      el("p", "verdict " + (juste ? "juste" : "faux"), juste ? "Bonne réponse : " + q.fiche.nom + "." : "Réponse attendue : " + q.fiche.nom + "."),
      el("p", null, q.fiche.definition)
    );
    if (!juste) retour.appendChild(el("p", "source", reponse.definition
      ? "Votre réponse, « " + reponse.nom + " », désigne autre chose : " + reponse.definition
      : "« " + reponse.nom + " » ne correspond à aucune fiche. Les noms anglais et les autres appellations sont aussi acceptés."));
    const zoneActions = el("div", "actions");
    actions(zoneActions);
    retour.appendChild(zoneActions);
    carte.appendChild(retour);
  }
  if (reponseDejaDonnee) corriger(reponseDejaDonnee);
}

// ===================== Défi du jour =====================
// Dix questions de niveau 2 et 3, tirées de plusieurs ateliers, les mêmes pour tout le monde ce jour-là
// (generateur(aujourdHui())). Une seule tentative par jour, enregistrée dans « defiJour ».
function questionsDuDefi(jour) {
  const alea = generateur(jour * 7 + 2026);
  const difficiles = l => l.filter(x => (x.niveau || 1) >= 2);
  const statuts = [["authentique", "Authentique"], ["deformee", "Déformée"], ["apocryphe", "Inventée ou mal attribuée"]];
  const monde = melanger(difficiles(MONDE), alea).slice(0, 3).map(m => ({ texte: m.question, options: m.options, juste: m.juste, explication: m.explication }));
  const vf = melanger(difficiles(VRAI_FAUX), alea).slice(0, 3).map(a => ({ texte: a.texte, options: ["Vrai", "Faux"], juste: a.vrai ? 0 : 1, explication: a.explication }));
  const citations = melanger(difficiles(CITATIONS), alea).slice(0, 2).map(c => ({ texte: "« " + c.texte + " » — attribuée à " + c.auteur, options: statuts.map(([, l]) => l), juste: statuts.findIndex(([st]) => st === c.statut), explication: c.explication }));
  const chrono = melanger(PAIRES_CELEBRES, alea).slice(0, 2).map(p => {
    const [a, b] = melanger([evenement(p.a), evenement(p.b)], alea);
    return { texte: "Lequel a eu lieu en premier ?", options: [a.nom, b.nom], juste: momentEvenement(a) < momentEvenement(b) ? 0 : 1, explication: p.note };
  });
  return melanger([...monde, ...vf, ...citations, ...chrono], alea);
}

function carteDefiDuJour() {
  const jour = aujourdHui();
  const carte = el("article", "carte defi-jour");
  carte.style.setProperty("--c", "#a8432e");
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const texteDePartage = score => "Défi Esprit critique du " + date + " : " + score + " / 10. " + location.origin + location.pathname;
  const memo = lire("defiJour", null);

  const resultat = score => {
    carte.innerHTML = "";
    carte.append(el("p", "surtitre", "Défi du jour"), el("p", "grand-score", score + " / 10"),
      el("p", "source", "Un nouveau défi demain, le même pour tout le monde."));
    const partager = el("button", "bouton secondaire", "Partager mon résultat");
    partager.addEventListener("click", async () => {
      const texte = texteDePartage(score);
      try {
        if (navigator.share) { await navigator.share({ text: texte }); return; }
        await navigator.clipboard.writeText(texte);
        annoncer("Résultat copié : " + texte);
      } catch (erreur) {
        if (erreur && erreur.name === "AbortError") return;
        annoncer(texte);
      }
    });
    carte.appendChild(partager);
  };

  if (memo && memo.jour === jour) { resultat(memo.score); return carte; }
  carte.append(el("p", "surtitre", "Défi du jour"), el("h2", null, "Dix questions difficiles"),
    el("p", "source", "Monde en chiffres, vrai ou faux, citations et chronologie, aux niveaux 2 et 3. Une seule tentative par jour, et les mêmes questions pour tout le monde."));
  const commencer = el("button", "bouton", "Relever le défi");
  commencer.addEventListener("click", () => {
    const zone = el("div");
    carte.innerHTML = "";
    carte.append(el("p", "surtitre", "Défi du jour"), zone);
    derouler(zone, questionsDuDefi(jour), (q, zone, fini) => {
      zone.appendChild(el("p", "cas", q.texte));
      const boutons = q.options.map((texte, k) => {
        const b = boutonChoix(texte, k);
        b.addEventListener("click", () => {
          boutons.forEach(x => { x.disabled = true; });
          boutons[q.juste].classList.add("juste");
          if (k !== q.juste) b.classList.add("faux");
          const retour = el("div", "retour-quiz");
          retour.append(el("p", "verdict " + (k === q.juste ? "juste" : "faux"), k === q.juste ? "Juste." : "Réponse : " + q.options[q.juste] + "."), paragraphe(q.explication));
          zone.appendChild(retour);
          fini(k === q.juste, retour);
        });
        zone.appendChild(b);
        return b;
      });
    }, resultats => {
      const score = resultats.filter(Boolean).length;
      ecrire("defiJour", { jour, score });
      noterActivite();
      resultat(score);
      carte.scrollIntoView({ block: "start" });
    });
  });
  carte.appendChild(commencer);
  return carte;
}

// ===================== Accueil =====================

function situationDuJour() {
  const jour = aujourdHui();
  const toutes = [...INDEX.values()];
  const alea = generateur(jour * 7919 + 17);
  const { type, fiche } = toutes[Math.floor(alea() * toutes.length)];
  return creerQuestion(type, fiche, alea);
}

// L'emblème de Müller-Lyer en grand : toucher le dessin révèle que les deux traits ont la même longueur.
// Mêmes classes que l'emblème de l'en-tête (embleme-trait, embleme-ailette, embleme-guide, revele).
function ouverture() {
  const bloc = el("div", "ouverture");
  const bouton = el("button", "ouverture-dessin");
  bouton.setAttribute("aria-pressed", "false");
  bouton.setAttribute("aria-label", "Vérifier : afficher des repères verticaux aux extrémités des traits");
  const dessin = svg("svg", { viewBox: "0 0 40 28", class: "embleme", "aria-hidden": "true" });
  dessin.append(svg("path", { class: "embleme-guide", d: "M10 2v24M30 2v24" }), svg("path", { class: "embleme-trait", d: "M10 8h20M10 20h20" }),
    svg("path", { class: "embleme-ailette", d: "M10 8 5 3M10 8l-5 5M30 8l5-5M30 8l5 5M10 20l5-5M10 20l5 5M30 20l-5-5M30 20l-5 5" }));
  bouton.appendChild(dessin);
  bouton.addEventListener("click", () => {
    const revele = dessin.classList.toggle("revele");
    bouton.setAttribute("aria-pressed", String(revele));
    if (revele) annoncer("Les repères le montrent : les deux traits ont la même longueur.");
  });
  const texte = el("p", null, "Ces deux traits ont la même longueur.");
  texte.appendChild(el("small", null, "Le savoir ne change rien à ce que l'on voit : c'est tout le problème des biais. Touchez pour vérifier."));
  bloc.append(bouton, texte);
  return bloc;
}

function afficherAccueil() {
  const zone = $("vue-accueil");
  zone.innerHTML = "";
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  zone.append(el("p", "date-du-jour", date.charAt(0).toUpperCase() + date.slice(1)), el("h1", "page-titre", "Aujourd'hui"));
  zone.appendChild(el("p", "page-intro", BIAIS.length + " biais et " + SOPHISMES.length + " sophismes, un quiz qui revient sur vos erreurs, et " + tousLesAteliers().length + " ateliers : données réelles, perception, expériences classiques et philosophie."));

  // Ouverture : pour un nouveau visiteur (aucune activité, aucun atelier), l'emblème en grand, première leçon du site
  const resultats = lire("resultatsAteliers", {});
  if (!lire("activite", []).length && !Object.keys(formeDe(resultats) === "objet" ? resultats : {}).length) zone.appendChild(ouverture());

  // Appel à l'action : réviser s'il y a des notions dues, sinon commencer le quiz ; les fiches en second choix
  const nbAReviser = clesAReviser().length;
  const appel = el("div", "appel-action");
  appel.appendChild(nbAReviser
    ? lienVers("#quiz/reviser", "Réviser les notions dues (" + nbAReviser + ")", "bouton")
    : lienVers("#quiz", Object.keys(memoire).length ? "Continuer le quiz" : "Commencer le quiz : 10 situations", "bouton"));
  appel.appendChild(lienVers("#" + (lire("typeFiches", "biais") === "sophismes" ? "sophismes" : "biais"), "Parcourir les " + (BIAIS.length + SOPHISMES.length) + " fiches", "bouton secondaire"));
  zone.appendChild(appel);

  // Situation du jour : la même pour tout le monde, une par jour
  const q = situationDuJour();
  const memo = lire("jour", null);
  const dejaRepondu = memo && memo.jour === aujourdHui() ? q.options.find(o => o.id === memo.choix) : null;
  const carteJour = el("article", "carte");
  carteJour.appendChild(el("p", "surtitre", "Situation du jour"));
  rendreQuestion(carteJour, q, dejaRepondu, option => {
    ecrire("jour", { jour: aujourdHui(), choix: option.id });
    enregistrerReponse(cleFiche(q.type, q.fiche), option === q.fiche);
  }, actions => {
    actions.appendChild(lienVers("#" + q.type + "/" + q.fiche.id, "Lire la fiche", "bouton secondaire"));
    actions.appendChild(lienVers("#quiz", "Continuer au quiz", "bouton"));
  });
  zone.appendChild(carteJour);

  // Défi du jour, puis vrai ou faux du jour
  zone.appendChild(carteDefiDuJour());
  zone.appendChild(carteVraiFauxDuJour());

  // Révisions
  const dues = clesAReviser().length;
  const carteRevision = el("article", "carte");
  carteRevision.style.setProperty("--c", "#2a8a5c");
  carteRevision.appendChild(el("p", "surtitre", "Révisions"));
  if (dues > 0) {
    carteRevision.appendChild(el("h2", null, pluriel(dues, "notion") + " à revoir aujourd'hui"));
    carteRevision.appendChild(el("p", "source", "Les notions reviennent après 1, 3, 7, 14 puis 30 jours, tant que vous y répondez correctement."));
    const b = el("button", "bouton", "Réviser maintenant");
    b.addEventListener("click", () => lancerQuiz("reviser"));
    carteRevision.appendChild(b);
  } else if (Object.keys(memoire).length === 0) {
    carteRevision.appendChild(el("h2", null, "Pas encore de révision"));
    carteRevision.appendChild(el("p", "source", "Chaque notion rencontrée au quiz est ensuite reprogrammée : plus tôt si vous vous trompez, plus tard si vous répondez juste."));
    const b = el("button", "bouton", "Commencer une série");
    b.addEventListener("click", () => lancerQuiz("tout"));
    carteRevision.appendChild(b);
  } else {
    const prochaine = prochaineRevision() - aujourdHui();
    carteRevision.appendChild(el("h2", null, "Aucune révision aujourd'hui"));
    carteRevision.appendChild(el("p", "source", prochaine === 1 ? "Prochaine révision demain." : "Prochaine révision dans " + prochaine + " jours."));
    const b = el("button", "bouton secondaire", "Une série de découverte");
    b.addEventListener("click", () => lancerQuiz("tout"));
    carteRevision.appendChild(b);
  }
  // Rappels dans l'agenda : un événement par jour où au moins une notion est due, sur 60 jours
  const programmees = Object.keys(memoire).filter(c => INDEX.has(c));
  if (programmees.length) {
    const agenda = el("button", "bouton secondaire", "Ajouter mes révisions à mon agenda");
    agenda.style.marginTop = "10px";
    agenda.addEventListener("click", () => exporterRevisions());
    carteRevision.append(agenda, el("p", "source", "Le fichier reflète les révisions prévues aujourd'hui ; il ne se met pas à jour ensuite. Le refaire après quelques séries."));
  }
  zone.appendChild(carteRevision);

  // Progression
  const stats = statistiques();
  const carteProgression = el("article", "carte");
  carteProgression.appendChild(el("p", "surtitre", "Votre progression"));
  const tuiles = el("div", "tuiles");
  [
    [acquis.size + " / " + INDEX.size, "fiches acquises"],
    [stats.n ? Math.round(100 * stats.justes / stats.n) + " %" : "—", stats.n ? "de réussite sur " + pluriel(stats.n, "réponse") : "de réussite au quiz"],
    [String(serieDeJours()), "jour" + (serieDeJours() > 1 ? "s" : "") + " d'affilée"]
  ].forEach(([nombre, libelle]) => {
    const t = el("div", "tuile");
    t.append(el("span", "tuile-nombre", nombre), el("span", "tuile-libelle", libelle));
    tuiles.appendChild(t);
  });
  carteProgression.appendChild(tuiles);

  const categories = Object.entries(stats.parCategorie)
    .filter(([, s]) => s.n >= 3)
    .sort((a, b) => a[1].j / a[1].n - b[1].j / b[1].n);
  if (categories.length > 0) {
    carteProgression.appendChild(el("p", "consigne", "À renforcer en priorité"));
    categories.slice(0, 4).forEach(([nom, s]) => {
      const ligne = el("div", "barre-ligne");
      ligne.style.setProperty("--c", COULEURS[nom]);
      ligne.appendChild(el("div", "barre-nom", nom + " (" + TYPES[s.type].singulier + ") : " + Math.round(100 * s.j / s.n) + " % de réussite"));
      const fond = el("div", "barre-fond");
      const barre = el("div", "barre");
      barre.style.width = Math.max(2, 100 * s.j / s.n) + "%";
      barre.style.background = COULEURS[nom];
      fond.appendChild(barre);
      ligne.appendChild(fond);
      carteProgression.appendChild(ligne);
    });
  } else {
    carteProgression.appendChild(el("p", "source", "Après quelques séries de quiz, vos catégories les plus fragiles apparaîtront ici."));
  }
  zone.appendChild(carteProgression);

  // Suggestions
  const suggestions = [];
  const derniere = INDEX.get(lire("derniereFiche", ""));
  if (derniere) suggestions.push(["#" + derniere.type + "/" + derniere.fiche.id, "Reprendre la lecture", derniere.fiche.nom, COULEURS[derniere.fiche.categorie]]);
  const conseil = atelierConseille();
  if (conseil) suggestions.push([conseil.adresse, resultatAtelier(conseil.atelier.id) ? "Atelier à reprendre" : "Atelier à essayer", conseil.atelier.titre, conseil.atelier.couleur]);
  const nonAcquises = [...INDEX.entries()].filter(([cle]) => !acquis.has(cle));
  if (nonAcquises.length) {
    const [, r] = nonAcquises[Math.floor(generateur(aujourdHui())() * nonAcquises.length)];
    suggestions.push(["#" + r.type + "/" + r.fiche.id, "Une fiche à découvrir", r.fiche.nom, COULEURS[r.fiche.categorie]]);
  }
  if (suggestions.length) {
    zone.appendChild(el("h3", "titre-bloc", "À explorer"));
    const grille = el("div", "cartes-grille");
    suggestions.forEach(([adresse, surtitre, titre, couleur]) => {
      const carte = lienVers(adresse, undefined, "carte entree");
      carte.style.setProperty("--c", couleur);
      carte.append(el("span", "etiquette", surtitre), el("h2", null, titre));
      carte.lastChild.style.margin = "4px 0 0";
      grille.appendChild(carte);
    });
    zone.appendChild(grille);
  }
}

// Carte « Vrai ou faux du jour » de l'accueil
function carteVraiFauxDuJour() {
  const jour = aujourdHui();
  const a = VRAI_FAUX[Math.floor(generateur(jour * 104729 + 3)() * VRAI_FAUX.length)];
  const memo = lire("vfJour", null);
  const carte = el("article", "carte vf-jour");
  carte.style.setProperty("--c", "#5b5bb5");
  carte.appendChild(el("p", "surtitre", "Vrai ou faux du jour"));
  carte.appendChild(el("p", "cas", a.texte));
  const boutons = [["Vrai", true], ["Faux", false]].map(([texte, valeur]) => {
    const b = el("button", "choix", texte);
    b.addEventListener("click", () => {
      ecrire("vfJour", { j: jour, id: a.id, r: valeur });
      corriger(valeur);
    });
    carte.appendChild(b);
    return b;
  });
  function corriger(valeur) {
    const juste = valeur === a.vrai;
    boutons.forEach(b => { b.disabled = true; });
    boutons[a.vrai ? 0 : 1].classList.add("juste");
    if (!juste) boutons[valeur ? 0 : 1].classList.add("faux");
    const retour = el("div", "retour-quiz");
    retour.append(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Bonne réponse : c'est " : "Eh non : c'est ") + (a.vrai ? "vrai." : "faux.")),
      el("p", null, a.explication), el("p", "source", "Source : " + a.source + "."));
    const actions = el("div", "actions");
    actions.appendChild(lienVers("#chiffres/vrai-faux", "Douze autres, avec votre degré de certitude", "bouton secondaire"));
    retour.appendChild(actions);
    carte.appendChild(retour);
  }
  if (memo && memo.j === jour && memo.id === a.id) corriger(memo.r);
  return carte;
}

// ===================== Fiches =====================

const etat = {
  type: lire("typeFiches", "biais"),               // dernier type consulté
  recherche: "",
  categorie: { biais: "Toutes", sophismes: "Toutes" }, // "Toutes", une catégorie ou "À revoir"
  defilement: { biais: 0, sophismes: 0 }
};
if (!TYPES[etat.type]) etat.type = "biais";

// Numéro de catalogue : « B 10 » à l'écran, « Biais numéro 10 » pour les lecteurs d'écran
function numeroFiche(type, f, classe) {
  const n = el("span", classe);
  n.append(el("span", null, (type === "biais" ? "B" : "S") + "\u00a0" + f.num), el("span", "invisible", (type === "biais" ? "Biais" : "Sophisme") + " numéro " + f.num + ", "));
  n.firstChild.setAttribute("aria-hidden", "true");
  return n;
}

// Recherche par numéro : « B 10 », « b10 », « S7 »
function rechercheNumero(q) {
  const m = q.match(/^([bs])\s*(\d+)$/);
  return m ? { type: m[1] === "b" ? "biais" : "sophismes", num: Number(m[2]) } : null;
}
function correspondRecherche(type, f, q) {
  const n = rechercheNumero(q);
  return n ? n.type === type && f.num === n.num : texteRecherche(f).includes(q);
}

function texteRecherche(f) {
  return normaliser([f.nom, f.autresNoms || "", f.definition, f.categorie, f.source, f.celebre || ""].join(" "));
}

function fichesFiltrees(type) {
  const q = normaliser(etat.recherche.trim());
  const cat = etat.categorie[type];
  return TYPES[type].fiches.filter(f => {
    if (cat === "À revoir" && acquis.has(cleFiche(type, f))) return false;
    if (cat !== "Toutes" && cat !== "À revoir" && f.categorie !== cat) return false;
    return !q || correspondRecherche(type, f, q);
  });
}

function afficherSegment(type) {
  const zone = $("segment-type");
  zone.innerHTML = "";
  Object.entries(TYPES).forEach(([t, conf]) => {
    const a = lienVers("#" + t, undefined, t === type ? "actif" : "");
    a.append(texteNoeud(conf.pluriel + " "), el("small", null, String(conf.fiches.length)));
    if (t === type) a.setAttribute("aria-current", "page");
    zone.appendChild(a);
  });
}

function afficherFiltres(type) {
  const zone = $("filtres");
  zone.innerHTML = "";
  ["Toutes", ...TYPES[type].categories.map(c => c.nom), "À revoir"].forEach(nom => {
    const puce = el("button", "puce" + (etat.categorie[type] === nom ? " active" : ""));
    if (COULEURS[nom]) {
      puce.style.setProperty("--c", COULEURS[nom]);
      puce.style.setProperty("--sur-c", "#ffffff");
      puce.appendChild(el("span", "pastille"));
    }
    puce.appendChild(texteNoeud(nom));
    puce.addEventListener("click", () => {
      etat.categorie[type] = nom;
      afficherFiltres(type);
      afficherListe(type);
    });
    zone.appendChild(puce);
  });
}

function afficherListe(type) {
  const zone = $("liste");
  zone.innerHTML = "";
  const fiches = fichesFiltrees(type);

  if (fiches.length === 0) {
    const autre = type === "biais" ? "sophismes" : "biais";
    const q = normaliser(etat.recherche.trim());
    const ailleurs = q ? TYPES[autre].fiches.filter(f => correspondRecherche(autre, f, q)).length : 0;
    zone.appendChild(el("p", "vide", etat.categorie[type] === "À revoir" && !q
      ? "Toutes les fiches de cette section sont acquises."
      : "Aucune fiche ne correspond."));
    if (ailleurs) {
      const p = el("p", "vide");
      const lien = lienVers("#" + autre, pluriel(ailleurs, "résultat") + " parmi les " + TYPES[autre].pluriel.toLowerCase() + " →");
      lien.addEventListener("click", () => { etat.garderRecherche = true; });
      p.appendChild(lien);
      zone.appendChild(p);
    }
    return;
  }

  TYPES[type].categories.forEach(cat => {
    const groupe = fiches.filter(f => f.categorie === cat.nom);
    if (groupe.length === 0) return;
    const bloc = el("section", "groupe");
    bloc.style.setProperty("--c", cat.couleur);
    const entete = el("div", "groupe-entete");
    const nom = el("div", "groupe-nom", cat.nom);
    nom.appendChild(el("span", "nombre", String(groupe.length)));
    entete.append(nom, el("p", "groupe-description", cat.description));
    const liste = el("div", "groupe-liste");
    groupe.forEach(f => {
      const ligne = lienVers("#" + type + "/" + f.id, undefined, "ligne-fiche");
      const corps = el("span", "lf-corps");
      const nom = el("span", "lf-nom");
      nom.append(numeroFiche(type, f, "lf-num"), texteNoeud(f.nom));
      corps.append(nom, el("span", "lf-def", f.definition));
      const etatFiche = el("span", "lf-etat", acquis.has(cleFiche(type, f)) ? "✓" : "");
      if (acquis.has(cleFiche(type, f))) etatFiche.setAttribute("aria-label", "acquise");
      ligne.append(corps, etatFiche);
      liste.appendChild(ligne);
    });
    bloc.append(entete, liste);
    zone.appendChild(bloc);
  });
}

function majProgression(type) {
  const fiches = TYPES[type].fiches;
  const n = fiches.filter(f => acquis.has(cleFiche(type, f))).length;
  $("texte-progression").textContent = n + " / " + fiches.length + " acquises";
  $("jauge").style.width = (100 * n / fiches.length) + "%";
}

function ajouterSection(parent, titre, contenu, classe) {
  if (!contenu) return;
  const s = el("div", "section");
  s.appendChild(el("h3", null, titre));
  s.appendChild(typeof contenu === "string" ? el("p", classe, contenu) : contenu);
  parent.appendChild(s);
}

function niveauMemoire(b) {
  const n = el("span", "niveau");
  n.setAttribute("aria-label", "niveau " + b + " sur 5");
  for (let i = 1; i <= 5; i++) n.appendChild(el("i", i <= b ? "plein" : null));
  return n;
}

function afficherFiche(type, fiche) {
  const cle = cleFiche(type, fiche);
  const conf = TYPES[type];
  const zone = $("liste");
  zone.innerHTML = "";
  zone.appendChild(lienVers("#" + type, "← " + conf.pluriel, "lien retour"));

  const carte = el("article", "carte");
  carte.style.setProperty("--c", COULEURS[fiche.categorie]);

  const entete = el("div", "entete-carte");
  const badge = el("span", "badge", "✓ Acquise");
  const etiquette = el("span", "etiquette-numero");
  etiquette.append(el("span", "etiquette", conf.singulier + " · " + fiche.categorie), numeroFiche(type, fiche, "numero-fiche"));
  entete.append(etiquette, badge);
  carte.append(entete, el("h1", "fiche-titre", fiche.nom));
  if (fiche.autresNoms) carte.appendChild(el("p", "autres-noms", fiche.autresNoms));
  carte.appendChild(el("p", "fiche-definition", fiche.definition));

  ajouterSection(carte, "Schéma de l'argument", fiche.forme, "forme");
  if (typeof SCHEMAS !== "undefined" && SCHEMAS[cle]) {
    const { svg, legende } = SCHEMAS[cle]();
    const figure = el("figure", "schema");
    figure.append(svg, el("figcaption", null, legende));
    ajouterSection(carte, "Illustration", figure);
  }
  ajouterSection(carte, conf.titreMecanisme, fiche.mecanisme);
  ajouterSection(carte, "Exemple", fiche.exemple, "encadre");
  ajouterSection(carte, "Cas célèbre", fiche.celebre, "celebre");
  if (fiche.distinction) {
    const [cible, texte] = fiche.distinction;
    const r = INDEX.get(cible);
    if (r) {
      const p = el("p", "distinction");
      p.append(texteNoeud("Avec "), lienVers("#" + r.type + "/" + r.fiche.id, r.fiche.nom + (r.type !== type ? " (" + TYPES[r.type].singulier + ")" : "")), texteNoeud(" : " + texte));
      ajouterSection(carte, "Ne pas confondre", p);
    }
  }
  ajouterSection(carte, conf.titreParade, fiche.parade);
  ajouterSection(carte, "S'entraîner", entrainementFiche(type, fiche));
  const ateliers = ateliersDeLaFiche(cle);
  if (ateliers.length) {
    const liste = el("div", "ateliers-fiche");
    ateliers.forEach(({ atelier, adresse }) => {
      const lien = lienVers(adresse, undefined, "atelier-lie");
      lien.style.setProperty("--c", atelier.couleur);
      const cadre = el("span", "picto-cadre petit");
      cadre.appendChild(pictogramme(atelier.picto));
      lien.append(cadre, el("span", null, atelier.titre));
      liste.appendChild(lien);
    });
    ajouterSection(carte, "À éprouver soi-même", liste);
  }
  ajouterSection(carte, "Source", fiche.source, "source");
  if (fiche.lies && fiche.lies.length) {
    const voir = el("div", "voir-aussi");
    fiche.lies.forEach(l => {
      const r = INDEX.get(l);
      if (r) voir.appendChild(lienVers("#" + r.type + "/" + r.fiche.id, r.fiche.nom + (r.type !== type ? " (" + TYPES[r.type].singulier + ")" : "")));
    });
    ajouterSection(carte, "Voir aussi", voir);
  }

  // Pied : acquis et mémorisation
  const pied = el("div", "pied-fiche");
  const bouton = el("button", "bouton-acquis");
  function majBouton() {
    const oui = acquis.has(cle);
    bouton.classList.toggle("oui", oui);
    bouton.textContent = oui ? "✓ Acquise — retirer" : "Marquer comme acquise";
    bouton.setAttribute("aria-pressed", String(oui));
    badge.hidden = !oui;
  }
  bouton.addEventListener("click", () => { basculerAcquis(cle); majBouton(); });
  majBouton();
  pied.appendChild(bouton);
  const m = memoire[cle];
  if (m) {
    const info = el("span", "memoire-fiche", "Quiz : " + m.j + " / " + m.n + " · mémorisation");
    info.appendChild(niveauMemoire(m.b));
    const ecart = m.d - aujourdHui();
    info.appendChild(texteNoeud(ecart <= 0 ? " · à revoir aujourd'hui" : " · à revoir dans " + pluriel(ecart, "jour")));
    pied.appendChild(info);
  }
  carte.appendChild(pied);
  carte.appendChild(journalReperage(cle));
  zone.appendChild(carte);

  // Fiches précédente et suivante, dans l'ordre de la liste
  const ordre = ORDRE[type];
  const i = ordre.indexOf(fiche);
  const nav = el("nav", "suivantes");
  nav.setAttribute("aria-label", "Fiches voisines");
  if (i > 0) nav.appendChild(lienVers("#" + type + "/" + ordre[i - 1].id, "← " + ordre[i - 1].nom));
  if (i < ordre.length - 1) nav.appendChild(lienVers("#" + type + "/" + ordre[i + 1].id, ordre[i + 1].nom + " →"));
  zone.appendChild(nav);

  ecrire("derniereFiche", cle);
}

function tirerAuHasard() {
  let candidates = fichesFiltrees(etat.type);
  if (candidates.length === 0) candidates = TYPES[etat.type].fiches;
  const f = candidates[Math.floor(Math.random() * candidates.length)];
  location.hash = etat.type + "/" + f.id;
}

// ===================== Quiz =====================

const TAILLE_SERIE = 10;
const MODES_QUIZ = [["tout", "Tout"], ["biais", "Biais"], ["sophismes", "Sophismes"], ["reviser", "À réviser"], ["proches", "Notions proches"], ["libre", "Réponse libre"], ["chrono", "Chrono 60 s"]];
const NIVEAUX_CERTITUDE = [["sur", "Sûr"], ["plutot", "Plutôt sûr"], ["hasard", "Au hasard"]];

// Situations exclues du mode « Notions proches » : elles conviennent aussi à la notion voisine,
// la fiche étant une forme particulière de sa voisine. Détail :
// tests/paires-douteuses.md. « #1 » désigne le champ cas, « #2 » le champ cas2.
const SITUATIONS_DOUTEUSES = new Set([
  "biais:procureur#1", "biais:procureur#2", "biais:planification#1", "biais:planification#2",
  "sophismes:tu-quoque#1", "sophismes:tu-quoque#2"
]);

// Mode « Notions proches » : une situation de la fiche X, et deux réponses, X et sa voisine (champ distinction).
// Une situation par fiche ; priorité aux paires jamais jouées ou souvent confondues.
function serieDeDuels() {
  const duels = lire("duels", {});
  const parFiche = [...INDEX.entries()].map(([cle, { type, fiche }]) => {
    const voisine = fiche.distinction && INDEX.get(fiche.distinction[0]);
    const situations = voisine ? [[fiche.cas, 1], [fiche.cas2, 2]].filter(([cas, k]) => cas && !SITUATIONS_DOUTEUSES.has(cle + "#" + k)) : [];
    if (!situations.length) return null;
    const [n, j] = duels[cle] || [0, 0];
    return { cle, type, fiche, voisine, situations, poids: (n ? j / n : -0.5) + Math.random() * 1.2 };
  }).filter(Boolean);
  return parFiche.sort((a, b) => a.poids - b.poids).slice(0, TAILLE_SERIE).map(x => ({
    type: x.type, fiche: x.fiche, voisine: x.voisine,
    cas: melanger(x.situations)[0][0],
    options: melanger([x.fiche, x.voisine.fiche]),
    consigne: "Laquelle de ces deux notions proches décrit la situation ?"
  }));
}

function noterDuel(cle, juste) {
  const duels = lire("duels", {});
  const [n, j] = duels[cle] || [0, 0];
  duels[cle] = [n + 1, j + (juste ? 1 : 0)];
  ecrire("duels", duels);
}

// Taux de réussite par niveau de certitude, et dernières erreurs commises en étant sûr
function noterCertitude(cle, certitude, juste) {
  const stats = lire("certitudes", {});
  const [n, j] = stats[certitude] || [0, 0];
  stats[certitude] = [n + 1, j + (juste ? 1 : 0)];
  ecrire("certitudes", stats);
  if (certitude === "sur" && !juste) {
    const liste = lire("erreursSures", []).filter(e => e.cle !== cle);
    liste.push({ cle, j: aujourdHui() });
    ecrire("erreursSures", liste.slice(-30));
  }
}
const ANCIENS_MODES = { "les deux": "tout", "erreurs": "reviser" };

const quiz = {
  mode: ANCIENS_MODES[lire("modeQuiz", "tout")] || lire("modeQuiz", "tout"),
  serie: [],   // questions : { type, fiche, cas, options, reponse }
  index: 0,
  bonnes: 0
};
if (!MODES_QUIZ.some(([m]) => m === quiz.mode)) quiz.mode = "tout";

function nouvelleSerie() {
  let choisies;
  if (quiz.mode === "proches") {
    quiz.serie = serieDeDuels();
    quiz.index = 0;
    quiz.bonnes = 0;
    return;
  }
  if (quiz.mode === "reviser") {
    choisies = clesAReviser().slice(0, TAILLE_SERIE).map(c => INDEX.get(c));
  } else {
    // Priorité aux notions jamais vues ou mal mémorisées, avec une part de hasard
    choisies = [...INDEX.values()]
      .filter(r => quiz.mode === "tout" || quiz.mode === "libre" || r.type === quiz.mode)
      .map(r => ({ r, poids: (memoire[cleFiche(r.type, r.fiche)] ? memoire[cleFiche(r.type, r.fiche)].b : -1) + Math.random() * 2.5 }))
      .sort((a, b) => a.poids - b.poids)
      .slice(0, TAILLE_SERIE)
      .map(x => x.r);
    choisies = melanger(choisies);
  }
  quiz.serie = choisies.map(r => creerQuestion(r.type, r.fiche));
  // Révision : une situation supplémentaire (casSup), pour ne pas reconnaître un texte déjà lu
  if (quiz.mode === "reviser") quiz.serie.forEach(q => {
    const sup = q.fiche.casSup;
    const m = memoire[cleFiche(q.type, q.fiche)];
    if (sup && sup.length) q.cas = sup[(m ? m.n : 0) % sup.length];
  });
  // Réponse libre : la situation seule ; retrouver le nom de mémoire est plus exigeant que le reconnaître
  if (quiz.mode === "libre") quiz.serie.forEach(q => { q.libre = true; });
  quiz.index = 0;
  quiz.bonnes = 0;
}

function lancerQuiz(mode) {
  quiz.mode = mode;
  ecrire("modeQuiz", mode);
  nouvelleSerie();
  if (location.hash === "#quiz") afficherQuiz(); else location.hash = "quiz";
}

function afficherFiltresQuiz() {
  const zone = $("filtres-quiz");
  zone.innerHTML = "";
  document.querySelectorAll(".option-certitude").forEach(o => o.remove());
  MODES_QUIZ.forEach(([mode, libelle]) => {
    const texte = mode === "reviser" ? libelle + " (" + clesAReviser().length + ")" : libelle;
    const puce = el("button", "puce" + (quiz.mode === mode ? " active" : ""), texte);
    puce.addEventListener("click", () => lancerQuiz(mode));
    zone.appendChild(puce);
  });
  // Option : indiquer sa certitude avant la correction
  const option = el("label", "option-certitude");
  const case_ = el("input");
  case_.type = "checkbox";
  case_.checked = lire("certitudeQuiz", true);
  case_.addEventListener("change", () => ecrire("certitudeQuiz", case_.checked));
  option.append(case_, document.createTextNode(" Indiquer ma certitude"));
  if (quiz.mode !== "libre" && quiz.mode !== "chrono") zone.after(option);   // ces modes ne demandent pas de certitude
}

function afficherQuiz() {
  afficherFiltresQuiz();
  const zone = $("zone-quiz");
  zone.innerHTML = "";
  // Mode chrono : situations tirées au hasard, quatre propositions, 60 secondes
  if (quiz.mode === "chrono") {
    const fiches = [...INDEX.values()];
    partieChrono(zone, {
      cle: "quiz", titre: "Quiz chrono", relancer: () => lancerQuiz("tout"),
      tirer: () => {
        const r = fiches[Math.floor(Math.random() * fiches.length)];
        const q = creerQuestion(r.type, r.fiche);
        return { texte: q.cas, options: q.options.map(o => o.nom), juste: q.options.indexOf(q.fiche) };
      }
    });
    return;
  }

  if (quiz.serie.length === 0) {
    const carte = el("article", "carte");
    if (quiz.mode === "reviser") {
      carte.appendChild(el("h2", null, "Rien à réviser aujourd'hui"));
      const prochaine = prochaineRevision();
      carte.appendChild(el("p", null, prochaine === null
        ? "Les notions rencontrées au quiz reviendront ici au bon moment : le lendemain en cas d'erreur, puis après 3, 7, 14 et 30 jours."
        : "Prochaine révision " + (prochaine - aujourdHui() === 1 ? "demain." : "dans " + (prochaine - aujourdHui()) + " jours.")));
      const b = el("button", "bouton", "Une série de découverte");
      b.addEventListener("click", () => lancerQuiz("tout"));
      carte.appendChild(b);
    } else {
      carte.appendChild(el("p", null, "Aucune question disponible."));
    }
    zone.appendChild(carte);
    return;
  }

  if (quiz.index >= quiz.serie.length) {
    afficherBilan(zone);
    return;
  }

  const q = quiz.serie[quiz.index];
  const entete = el("div", "quiz-entete");
  entete.append(
    el("span", null, "Question " + (quiz.index + 1) + " / " + quiz.serie.length),
    el("span", null, pluriel(quiz.bonnes, "bonne réponse", "bonnes réponses"))
  );
  const jauge = el("div", "jauge");
  const rempli = el("div");
  rempli.style.width = (100 * quiz.index / quiz.serie.length) + "%";
  rempli.style.background = "var(--vert)";
  jauge.appendChild(rempli);
  jauge.style.marginBottom = "14px";

  const carte = el("article", "carte");
  if (!q.reponse) q.certitude = !q.libre && lire("certitudeQuiz", true);
  rendreQuestion(carte, q, q.reponse, (option, certitude) => {
    q.reponse = option;
    q.niveau = certitude;
    const juste = option === q.fiche;
    const cle = cleFiche(q.type, q.fiche);
    if (juste) quiz.bonnes++;
    // Les duels n'entrent pas dans les boîtes de révision : un choix entre deux est trop facile
    if (q.voisine) { noterDuel(cle, juste); noterActivite(); } else enregistrerReponse(cle, juste, certitude);
    if (certitude) noterCertitude(cle, certitude, juste);
    entete.lastChild.textContent = pluriel(quiz.bonnes, "bonne réponse", "bonnes réponses");
  }, actions => {
    actions.appendChild(lienVers("#" + q.type + "/" + q.fiche.id, "Voir la fiche", "bouton secondaire"));
    const fin = quiz.index === quiz.serie.length - 1;
    const suivante = el("button", "bouton", fin ? "Voir le bilan" : "Question suivante");
    suivante.dataset.suivant = "1";
    suivante.addEventListener("click", () => {
      quiz.index++;
      afficherQuiz();
      // Immédiat : interrompt le défilement doux vers la correction, qui cacherait la nouvelle situation
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    });
    actions.appendChild(suivante);
  });
  zone.append(entete, jauge, carte);
}

function afficherBilan(zone) {
  const n = quiz.serie.length;
  const ratees = quiz.serie.filter(q => q.reponse !== q.fiche);
  const records = lire("records", {});
  const ancien = records[quiz.mode];
  if (quiz.mode !== "reviser" && n === TAILLE_SERIE && (ancien === undefined || quiz.bonnes > ancien)) {
    records[quiz.mode] = quiz.bonnes;
    ecrire("records", records);
  }

  const carte = el("article", "carte");
  carte.style.setProperty("--c", "#2a8a5c");
  carte.appendChild(el("p", "consigne", quiz.mode === "reviser" ? "Bilan de la révision" : "Bilan de la série"));
  carte.appendChild(el("p", "grand-score", quiz.bonnes + " / " + n));

  const ratio = quiz.bonnes / n;
  let message;
  if (ratio === 1) message = "Sans faute.";
  else if (ratio >= 0.8) message = "Très bonne maîtrise.";
  else if (ratio >= 0.5) message = "Des bases solides ; quelques notions à revoir.";
  else message = "Les fiches ci-dessous méritent une relecture.";
  carte.appendChild(el("p", null, message));
  if (quiz.mode !== "reviser" && ancien !== undefined) {
    carte.appendChild(el("p", "source", "Meilleur score précédent dans ce mode : " + ancien + " / " + TAILLE_SERIE + "."));
  }
  if (ratees.length > 0) {
    carte.appendChild(el("p", "consigne", quiz.mode === "proches" ? "Paires à revoir" : "Reviendront demain"));
    const ul = el("ul", "liste-simple");
    ratees.forEach(q => {
      const li = el("li");
      li.appendChild(lienVers("#" + q.type + "/" + q.fiche.id, q.fiche.nom));
      if (q.voisine) {
        li.appendChild(document.createTextNode(" / "));
        li.appendChild(lienVers("#" + q.voisine.type + "/" + q.voisine.fiche.id, q.voisine.fiche.nom));
      }
      ul.appendChild(li);
    });
    carte.appendChild(ul);
  }
  if (quiz.serie.some(q => q.niveau === "sur" && q.reponse !== q.fiche) && quiz.mode !== "proches") {
    carte.appendChild(el("p", "source", "Les erreurs commises en étant sûr reviennent dès demain : on les corrige mieux que les autres (Butterfield et Metcalfe, 2001), mais elles réapparaissent si la correction est oubliée (Butler, Fazio et Marsh, 2011)."));
  }

  const actions = el("div", "actions");
  const encore = el("button", "bouton", "Nouvelle série");
  encore.dataset.suivant = "1";
  encore.addEventListener("click", () => { nouvelleSerie(); afficherQuiz(); });
  actions.appendChild(encore);
  const dues = clesAReviser().length;
  if (dues > 0 && quiz.mode !== "reviser") {
    const revoir = el("button", "bouton secondaire", "Réviser (" + dues + ")");
    revoir.addEventListener("click", () => lancerQuiz("reviser"));
    actions.appendChild(revoir);
  }
  carte.appendChild(actions);
  zone.appendChild(carte);
}

// ===================== Navigation =====================
// L'adresse après # décide de ce qui est affiché : #accueil, #biais, #biais/ancrage, #quiz,
// #ateliers, #chiffres/monde, #tests/crt, #guide, #guide/methode…
// Le bouton « retour » du navigateur fonctionne, et chaque page a son propre lien.

const ONGLET_DE = { accueil: "accueil", biais: "fiches", sophismes: "fiches", quiz: "quiz", ateliers: "ateliers", chiffres: "ateliers", tests: "ateliers", portrait: "ateliers", guide: "guide", bingo: "ateliers" };
const SECTION_DE = { accueil: "vue-accueil", biais: "vue-fiches", sophismes: "vue-fiches", quiz: "vue-quiz", ateliers: "vue-ateliers", chiffres: "vue-chiffres", tests: "vue-tests", portrait: "vue-portrait", guide: "vue-guide", bingo: "vue-tests" };
let precedent = { vue: null, id: null };

function afficherPage() {
  // Une adresse mal formée (« %E0 ») ne doit pas bloquer la page : on garde alors le texte brut
  let adresse = location.hash.slice(1);
  try { adresse = decodeURIComponent(adresse); } catch (erreur) { /* adresse laissée telle quelle */ }
  let [vue, id] = adresse.split("/");
  if (!ONGLET_DE[vue]) vue = "accueil";
  // Sans identifiant, les jeux et les expériences renvoient à la liste des ateliers
  if ((vue === "chiffres" || vue === "tests") && !(vue === "chiffres" ? JEUX : EXPERIENCES).some(a => a.id === id)) vue = "ateliers";

  // Mémorise la position dans la liste avant de la quitter
  if ((precedent.vue === "biais" || precedent.vue === "sophismes") && !precedent.id) {
    etat.defilement[precedent.vue] = window.scrollY;
  }

  document.querySelectorAll(".onglet").forEach(o => {
    const actif = o.dataset.onglet === ONGLET_DE[vue];
    o.classList.toggle("actif", actif);
    if (actif) o.setAttribute("aria-current", "page"); else o.removeAttribute("aria-current");
  });
  Object.values(SECTION_DE).forEach(s => { $(s).hidden = s !== SECTION_DE[vue]; });
  // Relance la petite animation d'apparition
  const section = $(SECTION_DE[vue]);
  if (precedent.vue !== vue || precedent.id !== id) {
    section.classList.remove("vue");
    void section.offsetWidth;
    section.classList.add("vue");
  }

  let titre = "";
  let defilement = 0;

  if (vue === "accueil") afficherAccueil();

  if (vue === "biais" || vue === "sophismes") {
    if (etat.type !== vue) {
      if (!etat.garderRecherche) { etat.recherche = ""; $("recherche").value = ""; }
      etat.type = vue;
      ecrire("typeFiches", vue);
    }
    etat.garderRecherche = false;
    document.querySelector('.onglet[data-onglet="fiches"]').href = "#" + vue;
    const fiche = id ? trouverFiche(vue, id) : null;
    $("outils-liste").hidden = !!fiche;
    if (fiche) {
      afficherFiche(vue, fiche);
      titre = fiche.nom;
    } else {
      titre = TYPES[vue].pluriel;
      $("recherche").placeholder = vue === "biais" ? "Rechercher un biais, un auteur, un cas…" : "Rechercher un sophisme, un auteur, un cas…";
      afficherSegment(vue);
      afficherFiltres(vue);
      afficherListe(vue);
      majProgression(vue);
      if (precedent.vue === vue) defilement = etat.defilement[vue];
    }
  }

  if (vue === "quiz") {
    titre = "Quiz";
    // #quiz/proches ouvre directement un mode
    if (id && id !== quiz.mode && MODES_QUIZ.some(([m]) => m === id)) {
      quiz.mode = id;
      ecrire("modeQuiz", id);
      quiz.serie = [];
    }
    // Nouvelle série si aucune n'est en cours, ou si la précédente est terminée
    if (quiz.serie.length === 0 || (precedent.vue !== "quiz" && quiz.index >= quiz.serie.length)) nouvelleSerie();
    afficherQuiz();
  }

  if (vue === "ateliers") { titre = "Ateliers"; afficherAteliers(); }
  if (vue === "portrait") { titre = "Votre portrait"; afficherPortrait(); }
  if (vue === "chiffres") { afficherChiffres($("vue-chiffres"), id); titre = JEUX.find(j => j.id === id).titre; }
  if (vue === "tests") { afficherExperiences($("vue-tests"), id); titre = EXPERIENCES.find(e => e.id === id).titre; }
  // #bingo/<graine> : la grille du bingo des sophismes correspondant à cette graine, à partager
  if (vue === "bingo") {
    grainePourBingo = id;
    ouvrirAtelier($("vue-tests"), EXPERIENCES.find(e => e.id === "bingo"));
    titre = "Bingo des sophismes";
  }

  if (vue === "guide") {
    titre = "Guide";
    const cible = id && $("g-" + id);
    if (cible) {
      defilement = null;
      requestAnimationFrame(() => cible.scrollIntoView({ block: "start" }));
    }
  }

  document.title = (titre ? titre + " · " : "") + "Esprit critique";
  precedent = { vue, id };
  if (defilement !== null) window.scrollTo(0, defilement);
}

// ===================== Branchements =====================

window.addEventListener("hashchange", afficherPage);

$("recherche").addEventListener("input", e => {
  etat.recherche = e.target.value;
  afficherListe(etat.type);
});

$("btn-hasard").addEventListener("click", tirerAuHasard);

$("btn-verif").addEventListener("click", () => {
  document.querySelectorAll("#verif input").forEach(c => { c.checked = false; });
});

// ===================== Sauvegardes automatiques =====================
// Dans le navigateur, sans rien envoyer : une copie de la progression par jour (au premier passage de la journée),
// et une copie juste avant une opération qui la remplace (import d'un fichier, restauration). Les quatre dernières
// sont gardées dans la clé « sauvegardesAuto », hors de CLES_SAUVEGARDE : elles ne partent pas dans le fichier exporté.
const MAX_SAUVEGARDES_AUTO = 4;

// La progression actuelle : toutes les clés enregistrées
function etatActuel() {
  const cles = {};
  CLES_SAUVEGARDE.forEach(cle => {
    const v = lire(cle, undefined);
    if (v !== undefined) cles[cle] = v;
  });
  return cles;
}

function sauvegardesAuto() {
  const liste = lire("sauvegardesAuto", []);
  return Array.isArray(liste) ? liste.filter(s => s && formeDe(s.cles) === "objet" && typeof s.jour === "number") : [];
}

function sauvegarderAuto(motif) {
  const cles = etatActuel();
  if (!Object.keys(cles).length) return;   // rien à sauvegarder (première visite)
  const liste = sauvegardesAuto();
  // Une seule copie quotidienne par jour ; les copies « avant … » s'ajoutent
  if (motif === "quotidienne" && liste.some(s => s.jour === aujourdHui() && s.motif === "quotidienne")) return;
  liste.push({ jour: aujourdHui(), motif, heure: new Date().toTimeString().slice(0, 5), cles });
  ecrire("sauvegardesAuto", liste.slice(-MAX_SAUVEGARDES_AUTO));
}

// Remplace la progression par celle d'une copie, en ne gardant que les clés valides
function remplacerProgression(cles) {
  CLES_SAUVEGARDE.forEach(effacer);
  Object.entries(cles).forEach(([cle, valeur]) => { if (CLES_SAUVEGARDE.includes(cle) && formeValide(cle, valeur)) ecrire(cle, valeur); });
}

function afficherSauvegardesAuto() {
  const zone = $("sauvegardes-auto");
  if (!zone) return;
  zone.innerHTML = "";
  const liste = sauvegardesAuto();
  zone.appendChild(el("p", "source", liste.length
    ? "Sauvegardes automatiques, gardées dans ce navigateur :"
    : "Sauvegardes automatiques : une copie de votre progression sera faite chaque jour, dans ce navigateur."));
  if (!liste.length) return;
  const ul = el("ul", "liste-simple");
  liste.slice().reverse().forEach(s => {
    const li = el("li");
    const date = new Date(s.jour * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
    li.appendChild(texteNoeud(date + (s.heure ? ", " + s.heure : "") + " (" + ({ quotidienne: "copie du jour", "avant import": "avant un import", "avant restauration": "avant une restauration" }[s.motif] || "copie") + ") "));
    const b = el("button", "lien", "Restaurer");
    b.setAttribute("aria-label", "Restaurer la sauvegarde du " + date);
    b.addEventListener("click", () => {
      if (!confirm("Remplacer votre progression actuelle par la sauvegarde du " + date + " ?")) return;
      sauvegarderAuto("avant restauration");
      remplacerProgression(s.cles);
      location.hash = "accueil";
      location.reload();
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
  zone.appendChild(ul);
}

sauvegarderAuto("quotidienne");
afficherSauvegardesAuto();

$("btn-effacer").addEventListener("click", () => {
  if (!confirm("Effacer toute votre progression (fiches acquises, quiz, révisions, ateliers), sauvegardes automatiques comprises ? Cette action est définitive.")) return;
  CLES_SAUVEGARDE.forEach(effacer);
  effacer("sauvegardesAuto");
  location.hash = "accueil";
  location.reload();
});

// Sauvegarde dans un fichier, pour transférer sa progression d'un appareil à l'autre
$("btn-exporter").addEventListener("click", () => {
  const donnees = { application: "Esprit critique", version: 1, date: new Date().toISOString(), cles: etatActuel() };
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob([JSON.stringify(donnees)], { type: "application/json" }));
  lien.download = "esprit-critique-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
  annoncer("Progression enregistrée dans un fichier.");
});

$("fichier-import").addEventListener("change", e => {
  const fichier = e.target.files[0];
  if (!fichier) return;
  // Une sauvegarde pèse quelques dizaines de kilo-octets : au-delà de 5 Mo, ce n'en est pas une
  if (fichier.size > 5e6) { annoncer("Ce fichier est trop gros pour être une sauvegarde d'Esprit critique."); e.target.value = ""; return; }
  const lecteur = new FileReader();
  lecteur.onload = () => {
    let donnees;
    try { donnees = JSON.parse(lecteur.result); } catch (erreur) { donnees = null; }
    if (!donnees || donnees.application !== "Esprit critique" || formeDe(donnees.cles) !== "objet") {
      annoncer("Ce fichier n'est pas une sauvegarde d'Esprit critique.");
      return;
    }
    // Seules les clés connues, de la forme attendue, sont reprises
    const valides = Object.entries(donnees.cles).filter(([cle, valeur]) => CLES_SAUVEGARDE.includes(cle) && formeValide(cle, valeur));
    const ecartees = Object.keys(donnees.cles).length - valides.length;
    const date = new Date(donnees.date);
    if (!confirm("Remplacer votre progression actuelle par celle du fichier" + (isNaN(date) ? "" : " (" + date.toLocaleDateString("fr-FR") + ")") + " ?"
      + (ecartees ? " " + ecartees + " élément(s) illisible(s) seront ignorés." : ""))) return;
    sauvegarderAuto("avant import");
    remplacerProgression(Object.fromEntries(valides));
    location.hash = "accueil";
    location.reload();
  };
  lecteur.readAsText(fichier);
  e.target.value = "";
});

// Petit message temporaire en bas de l'écran
let minuterieAnnonce;
function annoncer(texte) {
  const a = $("annonce");
  a.textContent = typo(texte);
  a.hidden = false;
  a.classList.remove("visible");
  void a.offsetWidth;
  a.classList.add("visible");
  clearTimeout(minuterieAnnonce);
  minuterieAnnonce = setTimeout(() => { a.classList.remove("visible"); setTimeout(() => { a.hidden = true; }, 300); }, 3200);
}

// Partager le site : menu de partage du téléphone, ou copie du lien
$("btn-partager").addEventListener("click", async () => {
  const adresse = location.origin + location.pathname;
  const donnees = { title: "Esprit critique", text: "Biais cognitifs et sophismes : fiches, quiz et ateliers fondés sur des données réelles.", url: adresse };
  try {
    if (navigator.share) { await navigator.share(donnees); return; }
    await navigator.clipboard.writeText(adresse);
    annoncer("Lien copié : " + adresse);
  } catch (erreur) {
    if (erreur && erreur.name === "AbortError") return;   // partage annulé par l'utilisateur
    annoncer("Lien du site : " + adresse);
  }
});

// Thème : automatique (selon l'appareil), clair ou sombre. Le script de l'en-tête l'applique avant l'affichage.
function appliquerTheme(choix) {
  if (choix === "light" || choix === "dark") document.documentElement.dataset.theme = choix;
  else delete document.documentElement.dataset.theme;
  document.querySelectorAll("[data-theme-choix]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.themeChoix === (choix || "auto"))));
  // Couleur de la barre du navigateur, sur téléphone
  const sombre = choix === "dark" || (choix !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.content = sombre ? "#16130f" : "#f6f4ef"; });
}
document.querySelectorAll("[data-theme-choix]").forEach(b => b.addEventListener("click", () => {
  const choix = b.dataset.themeChoix;
  if (choix === "auto") effacer("theme"); else ecrire("theme", choix);
  appliquerTheme(choix);
}));
appliquerTheme(lire("theme", "auto"));

// Mode hors ligne : le service worker garde une copie du site (sw.js). Seulement en HTTPS ou en local.
// Seulement pour la page elle-même, pas dans un cadre (les bancs d'essai chargent le site dans un cadre)
if ("serviceWorker" in navigator && window.top === window && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch(() => { /* hors ligne indisponible : le site fonctionne normalement */ });
}

// Verdicts longs (plus d'une ligne environ) : italique en 17 px au lieu de 19, moins fatigant à lire
new MutationObserver(mutations => mutations.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType !== 1) return;
  [n, ...n.querySelectorAll(".verdict")].forEach(v => {
    if (v.classList.contains("verdict") && v.textContent.length > 48) v.classList.add("verdict-long");
  });
}))).observe(document.querySelector("main"), { childList: true, subtree: true });

// L'emblème est une illusion de Müller-Lyer : un clic montre que les deux traits sont égaux
document.querySelector(".marque").addEventListener("click", () => {
  const embleme = document.querySelector(".embleme");
  if (embleme.classList.contains("revele")) return;
  embleme.classList.add("revele");
  annoncer("Les deux traits de l'emblème ont la même longueur. Le savoir ne change rien à ce que vous voyez.");
  setTimeout(() => embleme.classList.remove("revele"), 3400);
});

// Clavier : 1 à 4 pour répondre, Entrée ou → pour passer à la suite
document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const cible = e.target;
  // Dans les ateliers, Entrée passe au champ suivant, puis valide
  if (e.key === "Enter" && cible.matches && cible.matches("input.champ")) {
    const zone = cible.closest(".carte") || document;
    const champs = [...zone.querySelectorAll("input.champ:not(:disabled)")];
    const i = champs.indexOf(cible);
    e.preventDefault();
    if (i >= 0 && i < champs.length - 1 && champs[i + 1].value === "") { champs[i + 1].focus(); return; }
    const bouton = zone.querySelector("[data-valider]:not(:disabled)");
    if (bouton) bouton.click();
    return;
  }
  // Sur un curseur, Entrée valide
  if (e.key === "Enter" && cible.matches && cible.matches("input[type=range]")) {
    const bouton = (cible.closest(".carte") || document).querySelector("[data-valider]:not(:disabled)");
    if (bouton) { e.preventDefault(); bouton.click(); }
    return;
  }
  if (cible.matches && cible.matches("input, textarea, select")) return;
  const section = document.querySelector("main > section:not([hidden])");
  if (!section) return;
  // Certitude au quiz : 7 Sûr, 8 Plutôt sûr, 9 Au hasard (les touches 1 à 4 restent aux réponses)
  const certitude = /^[789]$/.test(e.key) && section.querySelectorAll(".certitude [data-niveau]")[Number(e.key) - 7];
  if (certitude) {
    e.preventDefault();
    certitude.click();
  } else if (/^[1-9]$/.test(e.key)) {
    // Sur l'accueil, un défi en cours passe avant la situation du jour
    const portee = section.querySelector(".defi-jour .choix:not(:disabled)") ? section.querySelector(".defi-jour") : section;
    const choix = portee.querySelectorAll(".choix:not(:disabled)");
    if (choix[Number(e.key) - 1]) { e.preventDefault(); choix[Number(e.key) - 1].click(); }
  } else if (e.key === "Enter" || e.key === "ArrowRight") {
    const suite = section.querySelector("[data-suivant]");
    if (suite && !cible.matches("a, button")) { e.preventDefault(); suite.click(); }
  }
});

// Applique la typographie française au texte fixe de la page (guide, titres)
(function typographierPage() {
  const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let noeud;
  while ((noeud = marcheur.nextNode())) {
    if (!noeud.parentElement.closest("script, style")) noeud.nodeValue = typo(noeud.nodeValue);
  }
})();

// ===================== Premier affichage =====================
document.querySelector('.onglet[data-onglet="fiches"]').href = "#" + etat.type;
if (!location.hash) history.replaceState(null, "", "#accueil");
afficherPage();
