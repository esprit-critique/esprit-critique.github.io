// ateliers.js : page « Ateliers », suivi des parties, pictogrammes et outils communs aux jeux.
// Les jeux sont définis dans chiffres.js et perception.js (tableau JEUX, adresses #chiffres/…)
// et dans experiences.js (tableau EXPERIENCES, adresses #tests/…).
// Les fonctions el(), lienVers(), melanger(), lire(), ecrire() et typo() viennent de app.js.

// ===================== Sections de la page =====================

const SECTIONS_ATELIERS = [
  { id: "melange", titre: "Mélanges", intro: "Une question à la fois, tirée au hasard dans les jeux les plus rapides : on ne sait pas à l'avance quel jeu viendra." },
  { id: "monde", titre: "Le monde en chiffres", intro: "Des questions fondées sur des données publiques récentes (Banque mondiale, OMS, ONU), avec leurs sources. Nos idées sur le monde datent souvent de l'école." },
  { id: "confiance", titre: "Mesurer sa confiance", intro: "Savoir ce que l'on sait : vos certitudes sont-elles justifiées ? Les résultats s'accumulent d'une partie à l'autre." },
  { id: "perception", titre: "Percevoir", intro: "Quantités, hasard, corrélations, graphiques : ce que l'œil voit et ce qu'il croit voir." },
  { id: "raisonner", titre: "Raisonner", intro: "Les problèmes classiques de la psychologie du raisonnement, avec les résultats des études originales." },
  { id: "philosopher", titre: "Philosopher", intro: "Des énigmes sans réponse évidente, pour éprouver ses intuitions et apprendre à les examiner." }
];

// Tous les ateliers, avec leur adresse
function tousLesAteliers() {
  return [
    ...JEUX.map(j => ({ atelier: j, adresse: "#chiffres/" + j.id })),
    ...EXPERIENCES.map(e => ({ atelier: e, adresse: "#tests/" + e.id }))
  ];
}

// ===================== Outils communs =====================

// Nombre à la française (en anglais : point décimal et virgule entre les milliers) : virgule décimale, espace fine entre les milliers (y compris pour 1 000 à 9 999)
const fr = n => LANGUE === "en" ? Number(n).toLocaleString(LOCALE) : Number(n).toLocaleString(LOCALE).replace(/^(-?\d)(\d{3})(?=,|$)/, "$1\u202f$2");

// Convertit une saisie (« 0,05 », « 5 ct », « 12 000 »…) en nombre, ou NaN
function lireNombre(texte) {
  let t = String(texte).replace(/\s/g, "");
  // Anglais : « 12,000 » est un nombre à milliers ; « 0,05 » (habitude française) reste une décimale
  t = LANGUE === "en" && /^-?\d{1,3}(,\d{3})+(\.|$)/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
  return parseFloat(t.replace(/[^\d.\-]/g, ""));
}

function paragraphe(texte, classe) { return el("p", classe, texte); }

const SVG = "http://www.w3.org/2000/svg";
function svg(balise, attributs) {
  const e = document.createElementNS(SVG, balise);
  Object.entries(attributs || {}).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

// Dessins fixes écrits en SVG (PICTOS, TRAITS_ENTITE), faits d'éléments sans enfant « <balise a="v"/> » : chacun est
// recréé par svg(), sans insérer de HTML (la politique Trusted Types le refuse)
function dessinerSvg(parent, source) {
  for (const [, balise, attributs] of source.matchAll(/<(\w+)([^>]*?)\s*\/>/g))
    parent.appendChild(svg(balise, Object.fromEntries([...attributs.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))));
  return parent;
}

// Texte SVG, avec la typographie française
function texteSvg(x, y, contenu, attributs) {
  const t = svg("text", Object.assign({ x, y }, attributs || {}));
  t.textContent = typo(contenu);
  return t;
}

// Ajoute une section d'explication : titre, paragraphes et liens vers des fiches
function ajouterExplication(zone, titre, paragraphes, liens) {
  const bloc = el("div", "section");
  bloc.appendChild(el("h3", null, titre));
  paragraphes.forEach(p => bloc.appendChild(paragraphe(p)));
  if (liens && liens.length) {
    const zoneLiens = el("div", "voir-aussi");
    zoneLiens.style.marginTop = "10px";
    liens.forEach(([adresse, texte]) => zoneLiens.appendChild(lienVers(adresse, texte)));
    bloc.appendChild(zoneLiens);
  }
  zone.appendChild(bloc);
  return bloc;
}

// Bloc repliable « Le calcul, en détail », fermé par défaut. Les lignes qui commencent par « = » sont des
// formules, affichées à part (sans ce premier « = »).
function calculEnDetail(lignes, titre) {
  const d = el("details", "calcul-detail");
  d.appendChild(el("summary", null, titre || "Le calcul, en détail"));
  lignes.forEach(l => d.appendChild(l.startsWith("=") ? el("p", "formule", l.slice(1).trim()) : paragraphe(l)));
  return d;
}

// En-tête d'une question : « Question 3 / 10 » et jauge d'avancement
// « niveau » (facultatif) : niveau de la question, affiché discrètement
function entete(zone, numero, total, libelle, niveau) {
  // Planche de Galton (melange.js) : le jeu ne joue qu'une question, la jauge suit donc la partie entière
  if (typeof MELANGE !== "undefined" && MELANGE.actif && total === 1) { numero = melange.total + 1; total = MELANGE_LONGUEUR; }
  const e = el("div", "quiz-entete");
  // Une seule question (mode « Question au hasard ») : pas de compteur « 1 / 1 »
  const compte = total > 1 ? " " + numero + " / " + total : "";
  e.appendChild(el("span", null, T(libelle || "Question") + compte + (niveau ? " · " + T("niveau {0}", niveau) : "")));
  zone.appendChild(e);
  const jauge = el("div", "jauge");
  const rempli = el("div");
  rempli.style.width = (100 * (numero - 1) / total) + "%";
  jauge.appendChild(rempli);
  jauge.style.marginBottom = "14px";
  zone.appendChild(jauge);
}

// Légende de couleurs : [[couleur CSS, texte], …]
function legende(elements) {
  const l = el("div", "legende");
  elements.forEach(([couleur, texte]) => {
    const s = el("span");
    const carre = el("i");
    carre.style.background = couleur;
    s.append(carre, texteNoeud(texte));
    l.appendChild(s);
  });
  return l;
}

// Bouton de réponse, avec le numéro de la touche clavier correspondante (1 à 4)
function boutonChoix(texte, k) {
  const b = el("button", "choix");
  b.append(el("kbd", null, String(k + 1)), el("span", null, texte));
  return b;
}

// Bouton « Question suivante » : la touche Entrée ou → l'actionne aussi (voir app.js)
function boutonSuivant(texte, action) {
  const b = el("button", "bouton", texte);
  b.dataset.suivant = "1";
  b.style.marginTop = "12px";
  b.addEventListener("click", () => {
    const carte = b.closest("article.carte");   // la carte qui contient la partie (plusieurs cartes sur l'accueil)
    action();
    remonter(carte);
  });
  return b;
}

// Fait apparaître la correction si elle est sous le bas de l'écran (téléphone), sans masquer la question
function montrer(retour) {
  if (!retour || !retour.firstChild) return;
  const bas = retour.firstChild.getBoundingClientRect().bottom;
  const hauteurNav = window.innerWidth < 760 ? 70 : 0;
  if (bas > window.innerHeight - hauteurNav) {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: bas - window.innerHeight + hauteurNav + 80, behavior: reduit ? "auto" : "smooth" });
  }
}

// Curseur accompagné de boutons − et + pour un réglage fin au doigt
function curseurAvecBoutons(curseur, pas) {
  const ligne = el("div", "curseur-ligne");
  const moins = el("button", "bouton-pas", "−"), plus = el("button", "bouton-pas", "+");
  moins.setAttribute("aria-label", "Diminuer");
  plus.setAttribute("aria-label", "Augmenter");
  const bouger = sens => {
    if (curseur.disabled) return;
    curseur.value = Math.min(Number(curseur.max), Math.max(Number(curseur.min), Number(curseur.value) + sens * pas));
    curseur.dispatchEvent(new Event("input"));
  };
  moins.addEventListener("click", () => bouger(-1));
  plus.addEventListener("click", () => bouger(1));
  ligne.append(moins, curseur, plus);
  return ligne;
}

// Ramène le haut de la carte de jeu dans l'écran, si nécessaire
// Ramène le haut de la carte (et donc l'énoncé de la nouvelle question) à l'écran, sous l'en-tête collant
// de l'ordinateur. Le défilement est immédiat : il interrompt un défilement doux encore en cours (celui de
// montrer()), qui sinon emmènerait la page plus bas et cacherait l'énoncé. Refait à l'image suivante,
// une fois la nouvelle question mise en page.
function remonter(cible) {
  const carte = cible && cible.isConnected ? cible : document.querySelector("main > section:not([hidden]) article.carte");
  if (!carte) return;
  const aligner = () => {
    const entete = document.querySelector(".entete");
    const haut = entete && getComputedStyle(entete).position === "sticky" ? entete.getBoundingClientRect().bottom : 0;
    const top = carte.getBoundingClientRect().top;
    if (top < haut + 8) window.scrollTo({ top: window.scrollY + top - haut - 8, behavior: "instant" });
  };
  aligner();
  requestAnimationFrame(aligner);
}

// Déroule une série de questions.
// afficher(element, zone, fini) affiche une question ; quand l'utilisateur a répondu, il appelle
// fini(resultat, conteneur) : un bouton « suivant » est ajouté dans le conteneur.
// bilan(resultats) est appelé à la fin.
function derouler(zone, elements, afficher, bilan, libelle) {
  let i = 0;
  const resultats = [];
  function etape() {
    zone.replaceChildren();
    if (i >= elements.length) return bilan(resultats);
    entete(zone, i + 1, elements.length, libelle);
    afficher(elements[i], zone, (resultat, conteneur) => {
      resultats.push(resultat);
      (conteneur || zone).appendChild(boutonSuivant(i === elements.length - 1 ? "Voir le bilan" : "Suivant", () => { i++; etape(); }));
      montrer(conteneur);
    });
  }
  etape();
}

// ===================== Fichier d'agenda (iCalendar) =====================
// evenements : [{ jour, titre, description, url }], « jour » au format d'aujourdHui() (jours depuis 1970).
// Un événement « toute la journée » par entrée. Format RFC 5545 : fins de ligne CRLF, lignes repliées
// à 75 octets, identifiants uniques, dates au format VALUE=DATE.
function fichierAgenda(nomFichier, evenements) {
  const date = jour => new Date(jour * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
  const echapper = t => String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const encodeur = new TextEncoder();
  // Replie une ligne trop longue : chaque suite commence par une espace, sans couper un caractère
  const replier = ligne => {
    const morceaux = [];
    let courant = "", limite = 75;
    for (const c of ligne) {
      if (encodeur.encode(courant + c).length > limite) { morceaux.push(courant); courant = ""; limite = 74; }
      courant += c;
    }
    morceaux.push(courant);
    return morceaux.join("\r\n ");
  };
  const maintenant = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lignes = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Esprit critique//esprit-critique.github.io//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  evenements.forEach((e, k) => {
    lignes.push("BEGIN:VEVENT",
      "UID:" + date(e.jour) + "-" + k + "-" + Math.random().toString(36).slice(2, 10) + "@esprit-critique.github.io",
      "DTSTAMP:" + maintenant,
      "DTSTART;VALUE=DATE:" + date(e.jour),
      "DTEND;VALUE=DATE:" + date(e.jour + 1),
      "SUMMARY:" + echapper(e.titre));
    if (e.description) lignes.push("DESCRIPTION:" + echapper(e.description));
    if (e.url) lignes.push("URL:" + e.url);
    lignes.push("TRANSP:TRANSPARENT", "END:VEVENT");
  });
  lignes.push("END:VCALENDAR");
  const texte = lignes.map(replier).join("\r\n") + "\r\n";
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob([texte], { type: "text/calendar;charset=utf-8" }));
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
  return texte;
}

// Tire n éléments au hasard, en privilégiant ceux que l'utilisateur n'a pas encore vus.
// Quand tout a été vu, on repart de zéro (les plus anciens redeviennent nouveaux).
function tirerNouveaux(cle, elements, n, idDe = e => e.id) {
  const vus = lire("vus", {});
  const dejaVus = new Set(vus[cle] || []);
  let nouveaux = melanger(elements.filter(e => !dejaVus.has(idDe(e))));
  if (nouveaux.length < n) {
    const anciens = melanger(elements.filter(e => dejaVus.has(idDe(e))));
    nouveaux = nouveaux.concat(anciens.slice(0, n - nouveaux.length));
    vus[cle] = [];                                     // cycle terminé : on oublie les anciens
  }
  const tires = nouveaux.slice(0, n);
  vus[cle] = [...new Set([...(vus[cle] || []), ...tires.map(idDe)])];
  ecrire("vus", vus);
  return tires;
}

// ===================== Résultats des parties =====================
// resultats[id] = { n: parties terminées, record, sur, historique: [derniers scores], jour }

// Avec un niveau, les records et historiques sont aussi tenus par niveau : r.niveaux[niveau] = { n, record, sur,
// historique, reussites90 }. Les champs généraux (n, record, historique) restent tenus pour toutes les parties.
function noterPartie(id, score, sur, niveau) {
  const tous = lire("resultatsAteliers", {});
  // Points de lucidité (profil.js) : premier essai, partie notée ou non, atelier maîtrisé
  const premier = !tous[id];
  setTimeout(() => {
    if (premier) gagner("atelier-premier", 0, id);
    if (score !== undefined && score !== null && sur) gagner("atelier-note", [score, sur, niveau], id); else gagner("atelier-sans-note", 0, id);
    if (atelierMaitrise(id)) gagner("atelier-maitrise", 0, id);
  }, 0);
  const r = migrerResultat(tous[id] || { n: 0, historique: [] });
  const ancienRecord = r.record;
  r.n++;
  r.jour = aujourdHui();
  let parNiveau = null, ancienRecordNiveau;
  if (score !== undefined && score !== null) {
    r.sur = sur;
    r.historique = [...(r.historique || []), score].slice(-12);
    if (r.record === undefined || score > r.record) r.record = score;
    if (niveau) {
      r.niveaux = r.niveaux || {};
      parNiveau = r.niveaux[niveau] || { n: 0, historique: [] };
      ancienRecordNiveau = parNiveau.record;
      parNiveau.n++;
      parNiveau.sur = sur;
      parNiveau.historique = [...parNiveau.historique, score].slice(-12);
      if (parNiveau.record === undefined || score > parNiveau.record) parNiveau.record = score;
      if (score / sur >= 0.9) parNiveau.reussites90 = (parNiveau.reussites90 || 0) + 1;
      r.niveaux[niveau] = parNiveau;
    }
  }
  tous[id] = r;
  ecrire("resultatsAteliers", tous);
  noterActivite();
  if (parNiveau) return { record: parNiveau.record, ancienRecord: ancienRecordNiveau, nouveauRecord: ancienRecordNiveau !== undefined && score > ancienRecordNiveau, parties: parNiveau.n, historique: parNiveau.historique, niveau };
  return { record: r.record, ancienRecord, nouveauRecord: ancienRecord !== undefined && score > ancienRecord, parties: r.n, historique: r.historique };
}

// Résultats enregistrés avant les niveaux : ils comptent comme des parties de niveau 1
function migrerResultat(r) {
  if (r.niveaux || !r.historique || !r.historique.length || r.sur === undefined) return r;
  return Object.assign({}, r, { niveaux: { 1: { n: r.historique.length, record: r.record, sur: r.sur, historique: r.historique.slice() } } });
}

function resultatAtelier(id) {
  const r = lire("resultatsAteliers", {})[id];
  return r ? migrerResultat(r) : null;
}

// Affiche le score final d'une partie, l'éventuel record et les dernières parties
// Pour un atelier à niveaux (deroulerNiveaux), le record et l'historique affichés sont ceux du niveau de la partie
function afficherScore(zone, id, score, sur, texteScore) {
  const partie = PARTIES_EN_COURS[id];
  const niveau = partie ? niveauDePartie(partie.niveaux) : undefined;
  const avant = maitriseAvant(id);
  const r = noterPartie(id, score, sur, niveau);
  zone.appendChild(el("p", "consigne", "Bilan"));
  zone.appendChild(el("p", "grand-score", texteScore || (score + " / " + sur)));
  if (partie) {
    zone.appendChild(bilanNiveaux(id));
    delete PARTIES_EN_COURS[id];
  }
  if (r.nouveauRecord) zone.appendChild(el("p", "verdict juste", T(niveau ? "Nouveau record au niveau {0} ! L'ancien était de {1} / {2}." : "Nouveau record ! L'ancien était de {1} / {2}.", niveau, fr(r.ancienRecord), sur)));
  else if (r.parties > 1 && r.record !== undefined) zone.appendChild(el("p", "source", T(niveau ? "Votre record au niveau {0} : {1} / {2} · {3} jouées." : "Votre record : {1} / {2} · {3} jouées.", niveau, fr(r.record), sur, pluriel(r.parties, "partie"))));
  if (r.historique && r.historique.length > 1) zone.appendChild(histogrammeParties(r.historique, sur));
  if (niveau === 3 && atelierMaitrise(id)) zone.appendChild(el("p", "source", "Atelier maîtrisé : au moins 90 % au niveau 3 sur trois parties."));
  const maitrise = blocMaitriseJeu(id, avant);
  if (maitrise) zone.appendChild(maitrise);
}

// Petites barres : les dernières parties, de la plus ancienne à la plus récente
function histogrammeParties(historique, sur) {
  const bloc = el("div", "historique");
  bloc.appendChild(el("span", "historique-titre", "Vos dernières parties"));
  const barres = el("div", "historique-barres");
  historique.forEach((s, k) => {
    const b = el("span", k === historique.length - 1 ? "actuelle" : null);
    b.style.height = Math.max(6, 100 * s / sur) + "%";
    b.title = s + " / " + sur;
    barres.appendChild(b);
  });
  bloc.appendChild(barres);
  return bloc;
}

// Bouton « Rejouer » en fin de partie
function boutonRejouer(zone, relancer, texte) {
  const b = el("button", "bouton large", texte || "Rejouer");
  b.dataset.suivant = "1";
  b.style.marginTop = "16px";
  b.addEventListener("click", () => { relancer(); remonter(); });
  zone.appendChild(b);
  return b;
}

// ===================== Étalonnage cumulé =====================
// Vrai ou faux : confiance[niveau] = [réponses, justes]. Fourchettes à 90 % : [fourchettes, réussies].

const NIVEAUX_CONFIANCE = [50, 70, 90, 99];

function noterConfiance(niveau, juste) {
  const c = lire("confiance", {});
  const [n, j] = c[niveau] || [0, 0];
  c[niveau] = [n + 1, j + (juste ? 1 : 0)];
  ecrire("confiance", c);
}

function noterFourchettes(n, dedans) {
  const [total, reussies] = lire("fourchettes", [0, 0]);
  ecrire("fourchettes", [total + n, reussies + dedans]);
}

// ===================== Pictogrammes =====================
// Petits dessins au trait, un par atelier. « plein » : surface colorée ; « fond » : couleur claire.

const PICTOS = {
  monde: '<circle cx="24" cy="24" r="17" class="fond"/><ellipse cx="24" cy="24" rx="7.5" ry="17"/><path d="M7 24h34M10.5 14.5h27M10.5 33.5h27"/>',
  balance: '<path d="M24 7v32M16 40h16"/><path d="M7 18 41 11"/><path d="M7 18 3 29M7 18l4 11M41 11l-4 11M41 11l4 11"/><path d="M2.5 29h9a4.5 3.5 0 0 1-9 0zM36.5 22h9a4.5 3.5 0 0 1-9 0z" class="fond"/>',
  pays: '<rect x="8" y="21" width="12" height="20" class="fond"/><rect x="28" y="9" width="12" height="32" class="plein"/><path d="M5 41h38"/><path d="M14 9v7m-3-3 3 3 3-3"/>',
  grandeurs: '<path d="M4 31h40"/><path d="M6 25v12M18 25v12M30 25v12M42 25v12"/><path d="M9.6 28v6M11.7 28v6M13.2 28v6M14.4 28v6M21.6 28v6M23.7 28v6M25.2 28v6M26.4 28v6M33.6 28v6M35.7 28v6M37.2 28v6M38.4 28v6"/><path d="M27 12h6l-3 6z" class="plein"/>',
  chronologie: '<path d="M4 26h37m-4-4 4 4-4 4"/><circle cx="11" cy="26" r="3.5" class="plein"/><circle cx="22" cy="26" r="3.5" class="fond"/><circle cx="32" cy="26" r="3.5" class="plein"/><path d="M11 21v-9M22 31v8M32 21v-6"/>',
  jauge: '<path d="M7 33a17 17 0 0 1 34 0" class="fond"/><path d="M7 33a17 17 0 0 1 34 0"/><path d="M7 33h4M37 33h4M24 16v4M12 21l3 3M36 21l-3 3"/><path d="M24 33 33 20"/><circle cx="24" cy="33" r="2.5" class="plein"/>',
  intervalle: '<path d="M4 28h40"/><path d="M14 19h-5v18h5M34 19h5v18h-5" /><rect x="9" y="25" width="30" height="6" class="fond"/><circle cx="28" cy="28" r="4" class="plein"/>',
  ancre: '<circle cx="24" cy="10" r="4"/><path d="M24 14v27M16 20h16"/><path d="M8 28c1.5 8 8 13 16 13s14.5-5 16-13"/><path d="M5 31l3-3 3 3M37 31l3-3 3 3"/>',
  points: '<circle cx="12" cy="13" r="2.4" class="plein"/><circle cx="20" cy="22" r="2.4" class="plein"/><circle cx="30" cy="12" r="2.4" class="plein"/><circle cx="37" cy="24" r="2.4" class="plein"/><circle cx="14" cy="33" r="2.4" class="plein"/><circle cx="27" cy="31" r="2.4" class="plein"/><circle cx="35" cy="37" r="2.4" class="plein"/><circle cx="22" cy="40" r="2.4" class="plein"/><circle cx="9" cy="23" r="2.4" class="plein"/><circle cx="25" cy="17" r="2.4" class="plein"/>',
  hasard: '<rect x="4" y="11" width="18" height="26" class="fond"/><rect x="26" y="11" width="18" height="26"/><circle cx="8" cy="15" r="1.8" class="plein"/><circle cx="10" cy="17.5" r="1.8" class="plein"/><circle cx="17" cy="31" r="1.8" class="plein"/><circle cx="8.5" cy="30" r="1.8" class="plein"/><circle cx="18" cy="17" r="1.8" class="plein"/><circle cx="30" cy="16" r="1.8" class="plein"/><circle cx="39" cy="16" r="1.8" class="plein"/><circle cx="35" cy="24" r="1.8" class="plein"/><circle cx="30" cy="32" r="1.8" class="plein"/><circle cx="39" cy="32" r="1.8" class="plein"/>',
  pieces: '<rect x="3" y="18" width="7" height="12" class="plein"/><rect x="12" y="18" width="7" height="12"/><rect x="21" y="18" width="7" height="12" class="plein"/><rect x="30" y="18" width="7" height="12" class="plein"/><rect x="39" y="18" width="6" height="12" class="plein"/><path d="M21 36h24"/>',
  correlation: '<path d="M6 6v36h36"/><circle cx="13" cy="34" r="2" class="plein"/><circle cx="17" cy="29" r="2" class="plein"/><circle cx="20" cy="33" r="2" class="plein"/><circle cx="24" cy="24" r="2" class="plein"/><circle cx="28" cy="27" r="2" class="plein"/><circle cx="31" cy="18" r="2" class="plein"/><circle cx="35" cy="21" r="2" class="plein"/><circle cx="38" cy="13" r="2" class="plein"/><path d="M10 37 41 10" class="pointille"/>',
  graphique: '<path d="M6 6v36h37"/><path d="M3 30l6-2-6-2 6-2"/><rect x="13" y="22" width="8" height="20" class="fond"/><rect x="27" y="10" width="8" height="32" class="plein"/>',
  batte: '<path d="M8 40 30 14c2-2.5 6-2.8 8-.6s1.6 6-.8 8L12 44z" class="fond"/><path d="M8 40 30 14c2-2.5 6-2.8 8-.6s1.6 6-.8 8L12 44zM8 40l4 4"/><circle cx="37" cy="36" r="5" class="plein"/>',
  cartes: '<rect x="3" y="14" width="9" height="13" class="plein"/><rect x="14" y="14" width="9" height="13"/><rect x="25" y="14" width="9" height="13"/><rect x="36" y="14" width="9" height="13" class="plein"/><path d="M5 33h5M38 33h5"/>',
  suite: '<rect x="4" y="25" width="9" height="12" class="fond"/><rect x="15" y="19" width="9" height="18" class="fond"/><rect x="26" y="13" width="9" height="24" class="fond"/><rect x="37" y="7" width="7" height="30" class="pointille"/><path d="M4 41h40"/>',
  portes: '<rect x="4" y="10" width="11" height="30"/><rect x="18.5" y="10" width="11" height="30" class="fond"/><rect x="33" y="10" width="11" height="30"/><circle cx="12.5" cy="26" r="1.2" class="plein"/><circle cx="41.5" cy="26" r="1.2" class="plein"/><path d="M18.5 10l6 3v30l-6-3"/>',
  livre: '<path d="M24 13c-5-4-12-4-18-2v26c6-2 13-2 18 2 5-4 12-4 18-2V11c-6-2-13-2-18 2z" class="fond"/><path d="M24 13c-5-4-12-4-18-2v26c6-2 13-2 18 2 5-4 12-4 18-2V11c-6-2-13-2-18 2zM24 13v26"/><path d="M10 18h9M10 23h9M29 18h9M29 23h9"/>',
  grille: '<rect x="6" y="6" width="7" height="7" class="fond"/><rect x="16" y="6" width="7" height="7" class="fond"/><rect x="26" y="6" width="7" height="7" class="plein"/><rect x="36" y="6" width="7" height="7" class="fond"/><rect x="6" y="16" width="7" height="7" class="fond"/><rect x="16" y="16" width="7" height="7" class="fond"/><rect x="26" y="16" width="7" height="7" class="fond"/><rect x="36" y="16" width="7" height="7" class="fond"/><rect x="6" y="26" width="7" height="7" class="fond"/><rect x="16" y="26" width="7" height="7"/><rect x="26" y="26" width="7" height="7" class="fond"/><rect x="36" y="26" width="7" height="7" class="fond"/><rect x="6" y="36" width="7" height="7" class="fond"/><rect x="16" y="36" width="7" height="7" class="fond"/><rect x="26" y="36" width="7" height="7" class="fond"/><rect x="36" y="36" width="7" height="7" class="plein"/>',
  calendrier: '<rect x="6" y="10" width="36" height="32" class="fond"/><rect x="6" y="10" width="36" height="32"/><path d="M6 18h36M15 6v8M33 6v8"/><circle cx="14" cy="25" r="1.5" class="plein"/><circle cx="22" cy="25" r="1.5"/><circle cx="30" cy="25" r="1.5"/><circle cx="38" cy="25" r="1.5"/><circle cx="14" cy="31" r="1.5"/><circle cx="22" cy="31" r="3.2" class="plein"/><circle cx="30" cy="31" r="1.5"/><circle cx="38" cy="31" r="1.5"/><circle cx="14" cy="37" r="1.5"/><circle cx="22" cy="37" r="1.5"/><circle cx="30" cy="37" r="3.2" class="plein"/>',
  illusion: '<path d="M12 16h24M12 33h24"/><path d="M12 16 6 10M12 16l-6 6M36 16l6-6M36 16l6 6M12 33l6-6M12 33l6 6M36 33l-6-6M36 33l-6 6" class="ailette-picto"/>',
  pensee: '<path d="M14 30c-5 0-8-3.5-8-8 0-4 3-7.5 7-8 1-5 5.5-8 10-8 4 0 7.5 2.2 9 5.5 5.2-.3 9 3.5 9 8.5 0 5-4 8.5-8.5 8.5H14z" class="fond"/><path d="M14 30c-5 0-8-3.5-8-8 0-4 3-7.5 7-8 1-5 5.5-8 10-8 4 0 7.5 2.2 9 5.5 5.2-.3 9 3.5 9 8.5 0 5-4 8.5-8.5 8.5H14z"/><circle cx="16" cy="37" r="2.6" class="plein"/><circle cx="11" cy="43" r="1.8" class="plein"/><path d="M21 15.5c.8-2.5 3-3.8 5.3-3.4 2.4.4 3.9 2.6 3.5 4.9-.4 2.4-3.6 2.8-4 5.3"/><circle cx="25.7" cy="25.6" r="1.1" class="plein"/>',
  carte: '<rect x="4" y="9" width="40" height="30" class="fond"/><rect x="4" y="9" width="40" height="30"/><path d="M4 24h40M17.3 9v30M30.7 9v30M4 16.5h40M4 31.5h40" class="pointille"/><circle cx="13" cy="19" r="3" class="plein"/><circle cx="35" cy="27" r="3" class="plein"/><path d="M24 2v5m-2.5-2.5L24 2l2.5 2.5"/>',
  citation: '<path d="M6 34c0-9 4-16 12-19l2 3c-4 2-7 6-7 10h6v12H6z" class="plein"/><path d="M26 34c0-9 4-16 12-19l2 3c-4 2-7 6-7 10h6v12H26z" class="fond"/><path d="M26 34c0-9 4-16 12-19l2 3c-4 2-7 6-7 10h6v12H26z"/>',
  arbre: '<circle cx="24" cy="8" r="4" class="plein"/><path d="M24 12v4M24 16 12 26M24 16l12 10"/><circle cx="12" cy="29" r="3.5" class="fond"/><circle cx="36" cy="29" r="3.5" class="fond"/><path d="M12 32.5 7 40M12 32.5l5 7.5M36 32.5 31 40M36 32.5l5 7.5"/><circle cx="7" cy="41" r="2.4" class="plein"/><circle cx="31" cy="41" r="2.4" class="plein"/>'
};

function pictogramme(nom) {
  const s = svg("svg", { viewBox: "0 0 48 48", class: "picto", "aria-hidden": "true" });
  return dessinerSvg(s, PICTOS[nom] || PICTOS.livre);
}

// ===================== Ateliers liés aux fiches =====================
// Sur la page d'une fiche, les ateliers qui permettent d'éprouver la notion soi-même.

const ATELIERS_DES_FICHES = {
  "biais:ancrage": ["#chiffres/ancre", "#chiffres/points"],
  "biais:surprecision": ["#chiffres/intervalles", "#chiffres/vrai-faux"],
  "biais:dunning-kruger": ["#chiffres/vrai-faux"],
  "biais:planification": ["#chiffres/intervalles"],
  "biais:conjonction": ["#tests/classiques"],
  "biais:taux-de-base": ["#tests/depistage", "#tests/classiques"],
  "biais:procureur": ["#tests/depistage", "#tests/classiques"],
  "biais:erreur-du-joueur": ["#chiffres/ecrire-hasard", "#chiffres/hasard", "#tests/classiques"],
  "biais:apophenie": ["#chiffres/hasard", "#tests/anniversaires"],
  "biais:confirmation": ["#tests/regle-246", "#tests/wason"],
  "biais:croyance-logique": ["#tests/wason"],
  "biais:cadrage": ["#tests/classiques", "#chiffres/graphiques"],
  "biais:aversion-perte": ["#tests/classiques"],
  "biais:statu-quo": ["#tests/classiques", "#tests/pensee"],
  "biais:disponibilite": ["#chiffres/mortalite", "#chiffres/monde", "#chiffres/nord"],
  "biais:negativite": ["#chiffres/monde", "#chiffres/pays"],
  "biais:angle-mort": ["#chiffres/illusion"],
  "biais:regression-moyenne": ["#tests/classiques", "#chiffres/correlation"],
  "biais:taille-echantillon": ["#tests/classiques"],
  "biais:simpson": ["#tests/classiques"],
  "biais:resultat": ["#tests/pensee"],
  "biais:omission": ["#tests/pensee"],
  "biais:autocomplaisance": ["#tests/pensee"],
  "biais:faux-souvenirs": ["#tests/citations"],
  "sophismes:correlation": ["#chiffres/correlation"],
  "sophismes:cherry-picking": ["#chiffres/graphiques"],
  "sophismes:affirmation-consequent": ["#tests/wason"],
  "sophismes:generalisation-hative": ["#tests/pensee", "#tests/classiques"],
  "sophismes:continuum": ["#tests/pensee"],
  "sophismes:ignorance": ["#tests/pensee"],
  "sophismes:faux-dilemme": ["#tests/pensee"],
  "sophismes:consequences": ["#tests/pensee"],
  "sophismes:equivoque": ["#tests/pensee"],
  "sophismes:definition-persuasive": ["#tests/pensee"],
  "sophismes:petition-principe": ["#tests/pensee"],
  "sophismes:autorite": ["#tests/citations"],
  "sophismes:hors-contexte": ["#tests/citations"],
  "sophismes:tireur-elite": ["#tests/anniversaires"]
};

function ateliersDeLaFiche(cle) {
  const tous = tousLesAteliers();
  return (ATELIERS_DES_FICHES[cle] || []).map(adresse => tous.find(a => a.adresse === adresse)).filter(Boolean);
}

// ===================== Page « Ateliers » =====================

function carteAtelier({ atelier, adresse }) {
  const carte = lienVers(adresse, undefined, "carte entree atelier");
  carte.style.setProperty("--c", atelier.couleur);
  const cadre = el("div", "picto-cadre");
  cadre.appendChild(pictogramme(atelier.picto));
  const corps = el("div", "atelier-corps");
  const haut = el("div", "entete-carte");
  const r = resultatAtelier(atelier.id);
  let badge = "";
  if (r && r.n) badge = "✓ " + pluriel(r.n, "partie") + (r.record !== undefined && r.sur ? " · " + T("record {0}/{1}", r.record, r.sur) : "");
  haut.append(el("span", "etiquette", atelier.duree), el("span", "badge", badge));
  corps.append(haut, el("h2", null, atelier.titre), el("p", null, atelier.resume));
  // Barre de maîtrise du jeu (profil.js), pour les jeux mesurés déjà joués
  if (r && !modeSobre() && MAITRISE_JEUX[atelier.id] && MAITRISE_JEUX[atelier.id][1] !== "aucun") {
    const v = Math.round(maitriseJeu(atelier.id, donneesProgression()));
    const barre = el("div", "barre-maitrise");
    barre.setAttribute("role", "img");
    barre.setAttribute("aria-label", T("Maîtrise de ce jeu : {0} sur 1 000", v));
    const rempli = el("div");
    rempli.style.setProperty("--part", v / 1000);
    barre.appendChild(rempli);
    corps.append(barre, el("span", "source", T("Maîtrise : {0}", v)));
  }
  carte.append(cadre, corps);
  return carte;
}

// Atelier conseillé : le premier jamais essayé, sinon celui qui n'a pas été joué depuis le plus longtemps
function atelierConseille() {
  const tous = tousLesAteliers();
  const resultats = lire("resultatsAteliers", {});
  const anciens = new Set([...lire("jeuxFaits", []), ...lire("experiencesFaites", [])]);
  // Le Grand test a sa propre carte mise en avant (carteGrandTest) : il n'est pas repris dans la suggestion
  // Le mélange n'enregistre pas de résultat : il n'est jamais suggéré comme « jamais essayé »
  const jamais = tous.filter(a => !resultats[a.atelier.id] && !anciens.has(a.atelier.id) && a.atelier.id !== "grand-test" && a.atelier.section !== "melange");
  if (jamais.length) return jamais[Math.floor(generateur(aujourdHui())() * jamais.length)];
  return tous.slice().sort((a, b) => ((resultats[a.atelier.id] || {}).jour || 0) - ((resultats[b.atelier.id] || {}).jour || 0))[0];
}

function afficherAteliers() {
  const zone = $("vue-ateliers");
  zone.replaceChildren();
  zone.classList.add("large");   // ordinateur large : les cartes d'atelier sur deux colonnes (style.css)
  zone.append(el("h1", "page-titre", "Ateliers"),
    el("p", "page-intro", T("{0} : estimer le monde réel, mesurer sa confiance, éprouver sa perception et refaire les expériences classiques. Répondez spontanément : c'est la première réaction qui est intéressante.", pluriel(tousLesAteliers().length, "atelier"))));

  // Bilan personnel
  const resultats = lire("resultatsAteliers", {});
  const parties = Object.values(resultats).reduce((s, r) => s + (r.n || 0), 0);
  const essayes = tousLesAteliers().filter(a => resultats[a.atelier.id]).length;
  const conseil = atelierConseille();
  const carte = el("article", "carte bilan-ateliers");
  carte.appendChild(el("p", "surtitre", parties ? "Votre parcours" : "Par où commencer ?"));
  if (parties) {
    const tuiles = el("div", "tuiles");
    const confiance = lire("confiance", {});
    const [n90, j90] = confiance[90] || [0, 0];
    const [nf, df] = lire("fourchettes", [0, 0]);
    [
      [String(parties), parties > 1 ? T("parties jouées") : T("partie jouée")],
      [essayes + " / " + tousLesAteliers().length, "ateliers essayés"],
      n90 >= 5 ? [Math.round(100 * j90 / n90) + PC, "de réussite quand vous êtes « sûr à 90 % »"]
        : nf >= 10 ? [Math.round(100 * df / nf) + PC, "de vos fourchettes « à 90 % » sont justes"]
        : ["—", "étalonnage : jouez à « Vrai ou faux ? »"]
    ].forEach(([nombre, libelle]) => {
      const t = el("div", "tuile");
      t.append(el("span", "tuile-nombre", nombre), el("span", "tuile-libelle", libelle));
      tuiles.appendChild(t);
    });
    carte.appendChild(tuiles);
  }
  if (parties) {
    const p = el("p", "conseil");
    p.appendChild(lienVers("#portrait", "Voir votre portrait : ce que vos réponses révèlent →", "lien-texte"));
    p.style.marginBottom = "6px";
    carte.appendChild(p);
  }
  if (conseil) {
    const p = el("p", "conseil");
    p.append(texteNoeud(parties ? "Suggestion : " : "Pour commencer : "), lienVers(conseil.adresse, conseil.atelier.titre, "lien-texte"), texteNoeud(" (" + conseil.atelier.duree.replace(" ", "\u00a0") + ")."));
    carte.appendChild(p);
  }
  carte.appendChild(atelierAuHasard());   // tirage.js : un atelier tiré du sac, avec nouveau tirage
  zone.appendChild(carte);
  // Le Grand test, atelier à part, mis en avant au-dessus des sections (grand-test-interface.js)
  if (typeof GRAND_TEST_VISIBLE !== "undefined" && GRAND_TEST_VISIBLE) zone.appendChild(carteGrandTest());

  // Sommaire : un bouton par section, qui l'ouvre et y fait défiler la page
  const sommaire = el("nav", "puces sommaire-ateliers");
  sommaire.setAttribute("aria-label", "Sections des ateliers");
  SECTIONS_ATELIERS.forEach(section => {
    const b = el("button", "puce", section.titre);
    b.addEventListener("click", () => basculerSection($("section-" + section.id), true, true));
    sommaire.appendChild(b);
  });
  zone.insertBefore(sommaire, carte);

  const ouvertes = lire("sectionsOuvertes", {});
  SECTIONS_ATELIERS.forEach(section => {
    const ateliers = tousLesAteliers().filter(a => a.atelier.section === section.id)
      .sort((a, b) => (a.atelier.ordre || 50) - (b.atelier.ordre || 50));
    if (!ateliers.length) return;
    const essayes = ateliers.filter(a => resultats[a.atelier.id]).length;
    const bloc = el("section", "section-ateliers");
    bloc.id = "section-" + section.id;
    bloc.dataset.section = section.id;
    // En-tête pliable : un bouton, qui indique le nombre d'ateliers et ceux déjà essayés
    const titre = el("h2", "titre-section");
    const bouton = el("button", "pliant");
    bouton.setAttribute("aria-controls", "corps-" + section.id);
    bouton.append(el("span", "pliant-titre", section.titre),
      el("span", "pliant-compte", T("{0} / {1} essayés", essayes, ateliers.length)));
    const fleche = svg("svg", { viewBox: "0 0 24 24", class: "pliant-fleche", "aria-hidden": "true" });
    fleche.appendChild(svg("path", { d: "m6 9 6 6 6-6" }));
    bouton.appendChild(fleche);
    bouton.addEventListener("click", () => basculerSection(bloc, bouton.getAttribute("aria-expanded") !== "true", false));
    titre.appendChild(bouton);
    bloc.appendChild(titre);
    // Corps de la section : masqué tant que la section est pliée
    const corps = el("div", "corps-section");
    corps.id = "corps-" + section.id;
    corps.appendChild(el("p", "intro-section", section.intro));
    const grille = el("div", "cartes-grille");
    ateliers.forEach(a => grille.appendChild(carteAtelier(a)));
    corps.appendChild(grille);
    bloc.appendChild(corps);
    zone.appendChild(bloc);
    // Ouverte : si le visiteur l'a dépliée ; sinon, celle du prochain atelier conseillé, sauf s'il l'a repliée lui-même
    basculerSection(bloc, ouvertes[section.id] === true || (ouvertes[section.id] === undefined && !!conseil && conseil.atelier.section === section.id), false, false);
  });
}

// Ouvre ou plie une section d'ateliers. La position est retenue sur cet appareil (clé « sectionsOuvertes »),
// sans être envoyée nulle part ni incluse dans la sauvegarde de la progression.
function basculerSection(bloc, ouvrir, defiler, memoriser = true) {
  if (!bloc) return;
  bloc.querySelector(".pliant").setAttribute("aria-expanded", String(ouvrir));
  bloc.querySelector(".corps-section").hidden = !ouvrir;
  bloc.classList.toggle("ouverte", ouvrir);
  if (memoriser) {
    const ouvertes = lire("sectionsOuvertes", {});
    ouvertes[bloc.dataset.section] = ouvrir;
    ecrire("sectionsOuvertes", ouvertes);
  }
  if (ouvrir && defiler) {
    bloc.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}

// Page d'un atelier : lien de retour, titre, puis le jeu lui-même
function ouvrirAtelier(conteneur, atelier, adresseCourante) {
  conteneur.replaceChildren();
  const tous = tousLesAteliers();
  const rang = tous.findIndex(a => a.atelier === atelier);
  const nav = el("div", "nav-atelier");
  nav.appendChild(lienVers("#ateliers", "← Ateliers", "lien retour"));
  const suivant = tous[(rang + 1) % tous.length];
  nav.appendChild(lienVers(suivant.adresse, T(suivant.atelier.titre) + " →", "lien retour atelier-suivant"));
  conteneur.appendChild(nav);

  const carte = el("article", "carte");
  carte.style.setProperty("--c", atelier.couleur);
  const tete = el("div", "tete-atelier");
  const cadre = el("div", "picto-cadre");
  cadre.appendChild(pictogramme(atelier.picto));
  const titre = el("h1", "fiche-titre", atelier.titre);
  tete.append(cadre, titre);
  carte.appendChild(tete);
  const zone = el("div", "zone-jeu");
  carte.appendChild(zone);
  conteneur.appendChild(carte);
  atelier.lancer(zone);
}

// ===================== Votre portrait =====================
// Rassemble ce que les ateliers ont mesuré : étalonnage, ancrage, illusion, hasard, raisonnement…

function moyenne(t) { return t.reduce((a, b) => a + b, 0) / t.length; }

// Taux de réussite moyen d'un atelier (scores rapportés au maximum), ou null
function reussiteAtelier(id) {
  const r = resultatAtelier(id);
  if (!r || !r.historique || !r.historique.length || !r.sur) return null;
  return { taux: moyenne(r.historique) / r.sur, parties: r.historique.length, record: r.record, sur: r.sur };
}

// ===================== Portrait : paragraphe d'analyse =====================
// Écrit à partir des seules données du navigateur, par des règles et des gabarits de phrases (aucun serveur, aucun
// modèle de langage). Aucune phrase sur une mesure de moins de SEUIL_PORTRAIT réponses ; chaque chiffre avec son effectif ;
// des constats (« vos réponses… »), jamais un trait de personnalité.
const SEUIL_PORTRAIT = 5;

// Données du navigateur, dans la forme qu'attend analysePortrait (les bancs lui passent des profils types)
function donneesPortrait() {
  const ateliers = tousLesAteliers().map(({ atelier, adresse }) => {
    const r = reussiteAtelier(atelier.id);
    return r && { nom: atelier.titre, adresse, n: r.parties * r.sur, j: Math.round(r.taux * r.parties * r.sur) };
  }).filter(Boolean);
  return { memoire, duels: lire("duels", {}), certitudes: lire("certitudes", {}), activite: lire("activite", []),
    revisions: ((lire("lucidite", {}) || {}).cumuls || {}).revisionsALHeure || 0, aReviser: clesAReviser().length,
    ateliers, aujourdhui: aujourdHui(), conseil: atelierConseille() };
}

// → { phrases: [texte…], lien: [adresse, texte] }
function analysePortrait(d) {
  const pct = (j, n) => Math.round(100 * j / n) + PC;
  const assez = x => x && x.n >= SEUIL_PORTRAIT;
  // Mesures comparables : catégories de fiches au quiz, ateliers, notions proches
  const parCategorie = {};
  Object.entries(d.memoire || {}).forEach(([cle, m]) => {
    const e = INDEX.get(cle);
    if (!e || !m.n) return;
    const c = parCategorie[e.fiche.categorie] = parCategorie[e.fiche.categorie] || { n: 0, j: 0 };
    c.n += m.n; c.j += m.j || 0;
  });
  const duels = Object.entries(d.duels || {}).filter(([cle, x]) => INDEX.has(cle) && x[0]);
  const totalDuels = duels.reduce((t, [, [n, j]]) => ({ n: t.n + n, j: t.j + j }), { n: 0, j: 0 });
  const mesures = [
    ...Object.entries(parCategorie).map(([cat, x]) => ({ ...x, nom: T("les fiches « {0} » au quiz", T(cat)), adresse: "#quiz" })),
    ...(d.ateliers || []).map(a => ({ ...a, nom: T("l'atelier « {0} »", T(a.nom)) })),
    { ...totalDuels, nom: T("les notions proches au quiz"), adresse: "#quiz/proches" }
  ].filter(assez).sort((a, b) => b.j / b.n - a.j / a.n || b.n - a.n);
  const sur = d.certitudes && d.certitudes.sur && { n: d.certitudes.sur[0], j: d.certitudes.sur[1] };
  const paire = duels.filter(([, [n, j]]) => n >= SEUIL_PORTRAIT && j < n).sort((a, b) => a[1][1] / a[1][0] - b[1][1] / b[1][0])[0];
  const jours = (d.activite || []).filter(j => j > d.aujourdhui - 30).length;
  const regularite = () => T("Sur les 30 derniers jours : {0} ; depuis le début, {1}.", pluriel(jours, "jour d'activité", "jours d'activité"),
    pluriel(d.revisions || 0, "révision faite le jour prévu", "révisions faites le jour prévu"));
  if (!mesures.length && !assez(sur)) {
    return { phrases: [T("Vos réponses sont encore trop peu nombreuses pour en tirer un bilan : chaque mesure en demande au moins {0}.", SEUIL_PORTRAIT), ...(jours ? [regularite()] : [])],
      lien: d.aReviser ? ["#quiz/reviser", T("Suggestion : {0} à faire aujourd'hui", pluriel(d.aReviser, "révision"))] : ["#quiz", T("Pour commencer : une série de dix situations au quiz")] };
  }
  const phrases = [];
  // 1. Le plus solide
  if (mesures.length) { const m = mesures[0]; phrases.push(T("Le plus solide : {0}, avec {1} de bonnes réponses ({2} sur {3}).", m.nom, pct(m.j, m.n), m.j, m.n)); }
  // 2. Le plus fragile : une paire confondue, sinon la mesure la moins réussie
  if (paire) {
    const [cle, [n, j]] = paire, f = INDEX.get(cle).fiche, v = INDEX.get(f.distinction[0]).fiche;
    phrases.push(T("Le plus fragile : vos réponses confondent « {0} » et « {1} » ({2} sur {3}).", f.nom, v.nom, pluriel(n - j, "erreur"), pluriel(n, "duel")));
  } else if (mesures.length > 1 && mesures[mesures.length - 1].j / mesures[mesures.length - 1].n < mesures[0].j / mesures[0].n) {
    const m = mesures[mesures.length - 1];
    phrases.push(T("Le plus fragile : {0}, avec {1} de bonnes réponses ({2} sur {3}).", m.nom, pct(m.j, m.n), m.j, m.n));
  }
  // 3. Étalonnage : certitude déclarée et réussite
  if (assez(sur)) {
    phrases.push(sur.j / sur.n < 0.8
      ? T("Quand vous répondez « Sûr » au quiz, vos réponses sont justes {0} fois sur {1} ({2}) : la certitude dépasse la réussite.", sur.j, sur.n, pct(sur.j, sur.n))
      : T("Quand vous répondez « Sûr » au quiz, vos réponses sont justes {0} fois sur {1} ({2}).", sur.j, sur.n, pct(sur.j, sur.n)));
  }
  // 4. Régularité
  if (jours) phrases.push(regularite());
  // 5. Une seule suggestion
  let lien;
  if (paire) lien = ["#quiz/proches", T("Suggestion : une série « Notions proches » au quiz")];
  else if (d.aReviser) lien = ["#quiz/reviser", T("Suggestion : {0} à faire aujourd'hui", pluriel(d.aReviser, "révision"))];
  else if (assez(sur) && sur.j / sur.n < 0.8) lien = ["#chiffres/vrai-faux", T("Suggestion : mesurer votre confiance dans « Vrai ou faux ? »")];
  else if (mesures.length > 1) lien = [mesures[mesures.length - 1].adresse || "#quiz", T("Suggestion : retravailler {0}", mesures[mesures.length - 1].nom)];
  else lien = d.conseil ? [d.conseil.adresse, T("Suggestion : l'atelier « {0} »", T(d.conseil.atelier.titre))] : ["#quiz", T("Suggestion : une série au quiz")];
  return { phrases: phrases.slice(0, 4), lien };
}

function afficherPortrait() {
  const zone = $("vue-portrait");
  zone.replaceChildren();
  zone.appendChild(lienVers("#ateliers", "← Ateliers", "lien retour"));
  zone.append(el("h1", "page-titre", "Votre portrait"),
    el("p", "page-intro", "Ce que vos réponses aux ateliers révèlent de votre façon de juger. Chaque mesure s'affine à mesure que vous jouez ; tout reste dans votre navigateur."));
  // Vue d'ensemble : trois à cinq phrases tirées des mesures ci-dessous, et une suggestion
  const analyse = analysePortrait(donneesPortrait());
  const resume = el("p", "analyse-portrait", analyse.phrases.join(" ") + " ");
  resume.appendChild(lienVers(analyse.lien[0], analyse.lien[1] + " →", "lien-texte"));
  zone.appendChild(resume);

  const blocs = [];
  const ajouter = (titre, couleur, adresse, contenu, aMesurer) => blocs.push({ titre, couleur, adresse, contenu, aMesurer });
  const pct = x => Math.round(100 * x) + PC;

  // 0. Le Grand test (grand-test-interface.js), s'il est publié : mode, date et axes séparés, sans score global
  if (typeof GRAND_TEST_VISIBLE !== "undefined" && GRAND_TEST_VISIBLE) {
    const resume = resumePortraitGrandTest();
    ajouter("Le Grand test", "#5b5bb5", "#tests/grand-test", resume, "Cinq façons de raisonner, mesurées séparément : à mesurer.");
  }

  // 1. Confiance
  const confiance = lire("confiance", {});
  const n = NIVEAUX_CONFIANCE.reduce((a, c) => a + ((confiance[c] || [0])[0]), 0);
  if (n >= 5) {
    const justes = NIVEAUX_CONFIANCE.reduce((a, c) => a + ((confiance[c] || [0, 0])[1]), 0);
    const annoncee = NIVEAUX_CONFIANCE.reduce((a, c) => a + c * ((confiance[c] || [0])[0]), 0) / n;
    const reelle = 100 * justes / n;
    const ecart = Math.round(annoncee - reelle);
    const bloc = el("div");
    bloc.appendChild(paragraphe(T("Sur {0} réponses, vous vous êtes dit sûr à {1} % en moyenne, et vous aviez raison dans {2} % des cas.", n, Math.round(annoncee), Math.round(reelle)) + " " +
      (ecart > 5 ? T("Excès de confiance : {0} points.", ecart) : ecart < -5 ? T("Vous vous sous-estimez de {0} points.", -ecart) : T("Votre confiance est bien étalonnée."))));
    bloc.appendChild(courbeEtalonnage(confiance));
    ajouter("Votre confiance", "#5b5bb5", "#chiffres/vrai-faux", bloc);
  } else ajouter("Votre confiance", "#5b5bb5", "#chiffres/vrai-faux", null, "Quand vous êtes « sûr à 90 % », avez-vous raison 9 fois sur 10 ?");

  // 2. Fourchettes
  const [nf, df] = lire("fourchettes", [0, 0]);
  if (nf >= 10) {
    ajouter("Vos fourchettes", "#2f6db5", "#chiffres/intervalles", paragraphe(T("{0} de vos fourchettes « sûres à 90 % » contiennent la bonne réponse ({1} fourchettes).", pct(df / nf), nf) + " " +
      (df / nf < 0.8 ? T("Elles sont trop étroites : élargissez-les.") : T("C'est proche de l'objectif de 90 %."))));
  } else ajouter("Vos fourchettes", "#2f6db5", "#chiffres/intervalles", null, "Vos intervalles « sûrs à 90 % » le sont-ils vraiment ?");

  // 3. Ancrage
  const ancrages = lire("ancrages", []);
  if (ancrages.length) {
    const effet = Math.exp(moyenne(ancrages.map(a => Math.log(a.h / a.b)))) - 1;
    ajouter("L'ancre", "#c0601b", "#chiffres/ancre", paragraphe((effet >= 0 ? T("Après un nombre élevé, vos estimations sont en moyenne {0} plus élevées qu'après un nombre faible ({1}).", pct(effet), pluriel(ancrages.length, "partie")) : T("Après un nombre élevé, vos estimations sont en moyenne {0} plus basses qu'après un nombre faible ({1}).", pct(-effet), pluriel(ancrages.length, "partie"))) + " " + T("Sans effet d'ancrage, l'écart serait proche de zéro.")));
  } else ajouter("L'ancre", "#c0601b", "#chiffres/ancre", null, "Un nombre tiré au hasard influence-t-il vos estimations ?");

  // 4. Illusion
  const illusions = lire("illusions", []);
  if (illusions.length) {
    ajouter("L'illusion", "#1d4f91", "#chiffres/illusion", paragraphe(T("Votre réglage de l'illusion de Müller-Lyer s'écarte en moyenne de {0} ; une fois averti du piège, de {1}.", pct(moyenne(illusions.map(i => Math.abs(i.avant)))), pct(moyenne(illusions.map(i => i.apres))))));
  } else ajouter("L'illusion", "#1d4f91", "#chiffres/illusion", null, "Savoir qu'une illusion existe suffit-il à ne plus la voir ?");

  // 5. Hasard
  const suites = lire("hasardEcrit", []);
  if (suites.length) {
    let plusLongueAttendue = 0;
    for (let m = 1; m <= 50; m++) plusLongueAttendue += 1 - (m === 1 ? 0 : probaSeriesAuPlus(50, m - 1));
    ajouter("Le hasard", "#c23b5a", "#chiffres/ecrire-hasard", paragraphe(T("Dans vos suites inventées, vous changez de face {0} fois sur 49 en moyenne (une vraie pièce : 24,5), et votre plus longue série mesure {1} lancers (une vraie pièce : environ {2}).", fr(Number(moyenne(suites.map(x => x.c)).toFixed(1))), fr(Number(moyenne(suites.map(x => x.l)).toFixed(1))), fr(Number(plusLongueAttendue.toFixed(1))))));
  } else ajouter("Le hasard", "#c23b5a", "#chiffres/ecrire-hasard", null, "Savez-vous imiter une vraie pièce de monnaie ?");

  // 6. Monty Hall
  const monty = lire("montyHall", null);
  if (monty) {
    const tot = k => monty[3][k][1] + monty[10][k][1], gagnees = k => monty[3][k][0] + monty[10][k][0];
    const parties = tot("garder") + tot("changer");
    if (parties) ajouter("Monty Hall", "#c0601b", "#tests/monty-hall", paragraphe(T("Vous changez de porte dans {0} des parties ({1} au total). En changeant : {2} victoires sur {3} ; en gardant : {4} sur {5}.", pct(tot("changer") / parties), parties, gagnees("changer"), tot("changer"), gagnees("garder"), tot("garder"))));
  }
  if (!blocs.some(b => b.titre === "Monty Hall")) ajouter("Monty Hall", "#c0601b", "#tests/monty-hall", null, "Changez-vous de porte ?");

  // 7. Raisonnement
  const lignes = [["Tests positifs (raisonnement probabiliste)", "depistage"], ["Problèmes classiques", "classiques"], ["Test de réflexion cognitive", "crt"], ["Quatre cartes de Wason", "wason"], ["Graphiques trompeurs", "graphiques"], ["Corrélation à l'œil", "correlation"]]
    .map(([nom, id]) => [nom, reussiteAtelier(id)]).filter(([, r]) => r);
  if (lignes.length) {
    const liste = el("ul", "liste-simple");
    lignes.forEach(([nom, r]) => liste.appendChild(el("li", null, T("{0} : {1} de réussite ({2})", T(nom), pct(r.taux), pluriel(r.parties, "partie")))));
    ajouter("Votre raisonnement", "#8a3f8f", "#tests/classiques", liste);
  } else ajouter("Votre raisonnement", "#8a3f8f", "#tests/classiques", null, "Résistez-vous aux pièges des problèmes classiques ?");

  // 8. Connaissance du monde
  const monde = [["Le monde en chiffres", "monde"], ["Qu'est-ce qui tue le plus ?", "mortalite"], ["Plus ou moins ?", "pays"], ["Le nord est où ?", "nord"], ["Ordres de grandeur", "grandeurs"], ["Avant ou après ?", "chronologie"], ["Qui l'a vraiment dit ?", "citations"]]
    .map(([nom, id]) => [nom, reussiteAtelier(id)]).filter(([, r]) => r);
  if (monde.length) {
    const liste = el("ul", "liste-simple");
    monde.forEach(([nom, r]) => liste.appendChild(el("li", null, T("{0} : {1} en moyenne, record {2} / {3}", T(nom), pct(r.taux), r.record, r.sur))));
    ajouter("Votre image du monde", "#2a8a5c", "#chiffres/monde", liste);
  } else ajouter("Votre image du monde", "#2a8a5c", "#chiffres/monde", null, "Votre image du monde est-elle à jour ?");

  // 9. Philosophie
  const reponses = lire("reponsesPensee", {});
  const vues = EXPERIENCES_PENSEE.filter(x => reponses[x.id] !== undefined);
  if (vues.length) {
    const liste = el("ul", "liste-simple");
    vues.forEach(x => liste.appendChild(el("li", null, T("{0} : « {1} »", T(x.titre), T(x.options[reponses[x.id]])))));
    ajouter("Vos réponses philosophiques", "#44546a", "#tests/pensee", liste);
  } else ajouter("Vos réponses philosophiques", "#44546a", "#tests/pensee", null, "Que répondez-vous au poulet de Russell, au navire de Thésée ?");

  // 10. Notions proches (quiz)
  const duels = Object.entries(lire("duels", {})).filter(([cle, [n]]) => n && INDEX.has(cle));
  if (duels.length) {
    // Une paire n'est signalée qu'à partir de SEUIL_PORTRAIT duels : « 1 erreur sur 1 » ne dit rien
    const confondues = duels.filter(([, [n, j]]) => j < n && n >= SEUIL_PORTRAIT).sort((a, b) => a[1][1] / a[1][0] - b[1][1] / b[1][0]);
    const erreursIsolees = !confondues.length && duels.some(([, [n, j]]) => j < n);
    const bloc = el("div");
    const total = duels.reduce((t, [, [n]]) => t + n, 0), justes = duels.reduce((t, [, [, j]]) => t + j, 0);
    bloc.appendChild(paragraphe(T("{0} de bonnes réponses sur {1} entre notions proches.", pct(justes / total), pluriel(total, "duel")) + (confondues.length ? "" : " " + (erreursIsolees ? T("Aucune paire n'a encore {0} duels : rien à signaler pour l'instant.", SEUIL_PORTRAIT) : T("Aucune paire confondue pour l'instant.")))));
    if (confondues.length) {
      const liste = el("ul", "liste-simple");
      confondues.slice(0, 8).forEach(([cle, [n, j]]) => {
        const { type, fiche } = INDEX.get(cle);
        const voisine = INDEX.get(fiche.distinction[0]);
        const li = el("li");
        li.append(lienVers("#" + type + "/" + fiche.id, fiche.nom), document.createTextNode(" / "),
          lienVers("#" + voisine.type + "/" + voisine.fiche.id, voisine.fiche.nom), document.createTextNode(typo(" : " + T("{0} sur {1}", pluriel(n - j, "erreur"), n))));
        liste.appendChild(li);
      });
      bloc.append(el("p", "consigne", "Les paires que vous confondez"), liste);
    }
    ajouter("Les notions proches", "#2a8a5c", "#quiz/proches", bloc);
  } else ajouter("Les notions proches", "#2a8a5c", "#quiz/proches", null, "Distinguez-vous un biais de sa notion voisine ?");

  // 11. Certitude au quiz
  const certitudes = lire("certitudes", {});
  const niveaux = NIVEAUX_CERTITUDE.filter(([k]) => certitudes[k] && certitudes[k][0] >= SEUIL_PORTRAIT);   // pas de taux sur 1 réponse
  if (niveaux.length) {
    const bloc = el("div");
    const liste = el("ul", "liste-simple");
    niveaux.forEach(([k, libelle]) => liste.appendChild(el("li", null, T("{0} : {1} de bonnes réponses ({2})", T(libelle), pct(certitudes[k][1] / certitudes[k][0]), pluriel(certitudes[k][0], "réponse")))));
    bloc.appendChild(liste);
    const sures = lire("erreursSures", []).filter(e => INDEX.has(e.cle)).reverse();
    if (sures.length) {
      const l = el("ul", "liste-simple");
      sures.slice(0, 10).forEach(e => {
        const { type, fiche } = INDEX.get(e.cle);
        const li = el("li");
        li.appendChild(lienVers("#" + type + "/" + fiche.id, fiche.nom));
        l.appendChild(li);
      });
      bloc.append(el("p", "consigne", "Erreurs commises en étant sûr"), l,
        paragraphe("Elles reviennent dès le lendemain : on corrige mieux une erreur commise avec assurance (Butterfield et Metcalfe, 2001), mais elle réapparaît si la correction est oubliée (Butler, Fazio et Marsh, 2011).", "source"));
    }
    ajouter("Certitude au quiz", "#2a8a5c", "#quiz", bloc);
  } else ajouter("Certitude au quiz", "#2a8a5c", "#quiz", null, "Quand vous êtes sûr de votre réponse au quiz, avez-vous raison ?");

  // 12. Repérer les sophismes (le débat truqué)
  const debats = lire("debats", []);
  if (debats.length) {
    const tot = k => debats.reduce((t, x) => t + x[k], 0);
    const { d } = dPrime(tot("det"), tot("s"), tot("fa"), tot("r"));
    ajouter("Repérer les sophismes", "#a8432e", "#tests/debat-truque", paragraphe(T("Sur {0}, vous avez repéré {1} sophismes sur {2}, avec {3} sur {4} répliques recevables. Sensibilité d′ cumulée : {5} (0 : hasard ; 2 ou plus : très bonne distinction).", pluriel(debats.length, "débat"), tot("det"), tot("s"), pluriel(tot("fa"), "fausse alerte", "fausses alertes"), tot("r"), fr(Number(d.toFixed(2))))));
  } else ajouter("Repérer les sophismes", "#a8432e", "#tests/debat-truque", null, "Repérez-vous les sophismes d'un débat sans crier au sophisme à tort ?");

  // 14. Repérages dans la vie courante (bouton « Je l'ai repéré » des fiches)
  const reperages = lire("reperages", []).filter(r => INDEX.has(r.cle));
  if (reperages.length) {
    const compte = {};
    reperages.forEach(r => { compte[r.cle] = (compte[r.cle] || 0) + 1; });
    const liste = el("ul", "liste-simple");
    Object.entries(compte).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([cle, n]) => {
      const { type, fiche } = INDEX.get(cle);
      const li = el("li");
      li.append(lienVers("#" + type + "/" + fiche.id, fiche.nom), texteNoeud(" : " + (n === 1 ? T("1 fois") : T("{0} fois", n))));
      liste.appendChild(li);
    });
    const recents = reperages.filter(r => r.note).slice(-3).reverse();
    const bloc = el("div");
    bloc.append(paragraphe(T("{0} dans la vie courante, sur {1}.", pluriel(reperages.length, "repérage"), pluriel(Object.keys(compte).length, "notion"))), liste);
    if (recents.length) {
      const l2 = el("ul", "liste-simple");
      recents.forEach(r => l2.appendChild(el("li", null, T("{0} : « {1} »", INDEX.get(r.cle).fiche.nom, r.note))));
      bloc.append(el("p", "consigne", "Vos dernières notes"), l2);
    }
    ajouter("Vos repérages", "#2a8a5c", "#biais", bloc);
  } else ajouter("Vos repérages", "#2a8a5c", "#biais", null, "Repérez-vous ces biais et ces sophismes autour de vous ? Notez-le depuis les fiches.");

  // 13. Niveaux des ateliers : niveau atteint, réussite moyenne par niveau, maîtrise
  const aNiveaux = tousLesAteliers().filter(({ atelier }) => { const r = resultatAtelier(atelier.id); return r && r.niveaux; });
  if (aNiveaux.length) {
    const table = el("table", "tableau-niveaux");
    const tete = el("tr");
    // Colonnes 4 et 5 seulement si un atelier qui va jusque-là y a été joué
    const colonnes = [1, 2, 3, ...[4, 5].filter(n => aNiveaux.some(({ atelier }) => resultatAtelier(atelier.id).niveaux[n]))];
    ["Atelier", "Atteint", ...colonnes.map(String)].forEach(t => tete.appendChild(el("th", null, t)));
    table.appendChild(tete);
    aNiveaux.forEach(({ atelier, adresse }) => {
      const r = resultatAtelier(atelier.id);
      const tr = el("tr");
      const nom = el("td");
      nom.appendChild(lienVers(adresse, atelier.titre));
      if (atelierMaitrise(atelier.id)) nom.appendChild(el("span", "source bloc", "maîtrisé"));
      tr.append(nom, el("td", null, String(niveauAtelier(atelier.id).niveau)));
      colonnes.forEach(n => {
        const x = r.niveaux[n];
        tr.appendChild(el("td", null, x && x.historique.length ? pct(moyenne(x.historique) / x.sur) : "—"));
      });
      table.appendChild(tr);
    });
    const bloc = el("div");
    bloc.append(table, paragraphe("« Atteint » : niveau actuel. Colonnes 1, 2 et 3 : réussite moyenne des parties jouées à chaque niveau. Un atelier est maîtrisé après trois parties à 90 % ou plus au niveau 3.", "source"));
    ajouter("Niveaux", "#44546a", "#ateliers", bloc);
  } else ajouter("Niveaux", "#44546a", "#ateliers", null, "Jusqu'où montez-vous ? Les ateliers ajustent leur difficulté à vos réponses.");

  const mesures = blocs.filter(b => b.contenu);
  zone.appendChild(el("p", "source", mesures.length > 1 ? T("{0} mesures sur {1} disponibles.", mesures.length, blocs.length) : T("{0} mesure sur {1} disponible.", mesures.length, blocs.length)));
  [...mesures, ...blocs.filter(b => !b.contenu)].forEach(b => {
    const carte = el("article", "carte" + (b.contenu ? "" : " a-mesurer"));
    carte.style.setProperty("--c", b.couleur);
    carte.appendChild(el("h2", null, b.titre));
    if (b.contenu) {
      carte.appendChild(b.contenu);
      const lien = lienVers(b.adresse, "Rejouer pour affiner →", "lien-texte");
      lien.style.display = "inline-block";
      lien.style.marginTop = "8px";
      carte.appendChild(lien);
    } else {
      carte.appendChild(el("p", "source", b.aMesurer));
      carte.appendChild(lienVers(b.adresse, "Mesurer →", "bouton secondaire"));
    }
    zone.appendChild(carte);
  });
}
