// profil.js : maîtrise, grade, points de lucidité et distinctions dans l'interface (refonte, lot 4). Le calcul est dans
// progression.js (fonctions pures), les dessins dans graphiques.js. Chargé avant app.js : les outils d'app.js ne sont
// appelés que dans des fonctions. Le mode sobre (reglages.sobre) cache tout cela ; tout continue d'être compté.

// ===================== Données et état =====================
function donneesProgression() {
  const d = {};
  CLES_SAUVEGARDE.forEach(c => { d[c] = lire(c, undefined); });
  const dist = lire("distinctions", {});
  return Object.assign(d, {
    aujourdhui: aujourdHui(),
    ateliers: tousLesAteliers().map(a => a.atelier.id),
    nbFiches: INDEX.size,
    categorieDe: cle => (INDEX.get(cle) || { fiche: {} }).fiche.categorie,
    drapeaux: dist.drapeaux || {},
    compteursLucidite: (lire("lucidite", {}) || {}).cumuls || {}
  });
}

const modeSobre = () => !!lire("reglages", {}).sobre;

// Calcule la maîtrise, photographie le jour, détecte un changement de grade et les distinctions nouvelles.
// annoncer : faux au chargement (rien n'est annoncé au premier affichage, seulement après une action)
function majMaitrise(annoncerChangements = true) {
  const d = donneesProgression();
  const m = maitrises(d, d.ateliers, d.nbFiches);
  const avant = lire("maitrise", null);
  const etat = photographier(avant, d.aujourdhui, m);
  const gradeAvant = gradeDe((avant && avant.meilleure) || 0), gradeApres = gradeDe(etat.meilleure);
  etat.grade = gradeApres.rang;
  ecrire("maitrise", etat);
  d.domaines = m.domaines;
  const dist = lire("distinctions", {});
  const obtenues = distinctionsObtenues(d);
  const nouvelles = obtenues.filter(id => !(dist.obtenues || []).includes(id));
  if (nouvelles.length || !dist.obtenues) ecrire("distinctions", { ...dist, obtenues });
  if (annoncerChangements && !modeSobre()) {
    if (avant && gradeApres.rang > gradeAvant.rang) bandeauGrade(gradeApres);
    if (dist.obtenues) nouvelles.forEach(id => {
      const x = DISTINCTIONS.find(y => y[0] === id);
      montrerMoment(T("Distinction : {0}", T(x[1])), T(x[3]));
    });
  }
  majBoutonProfil(m, etat);
  return { m, etat };
}

// Point d'entrée unique des points de lucidité : appelé là où un événement se produit (quiz, ateliers, cartes du jour…)
function gagner(source, valeur, cle) {
  const jour = aujourdHui();
  const [etat, points] = appliquerGain(lire("lucidite", {}), source, valeur, jour, cle);
  if (!points) return 0;
  ecrire("lucidite", etat);
  if (!modeSobre()) {
    const objectif = lire("objectif", 60);
    const avant = (etat.jours[jour] || 0) - points;
    montrerPastille("+" + points);
    if (avant < objectif && etat.jours[jour] >= objectif) montrerMoment(T("Objectif du jour atteint"), T("{0} points de lucidité aujourd'hui.", etat.jours[jour]));
  }
  majBoutonProfil();
  const maintenant = new Date();
  if (maintenant.getHours() < 5) trouverSecret("noctambule");
  if (maintenant.getDay() === 5 && maintenant.getDate() === 13) trouverSecret("vendredi-13");
  return points;
}

// Compteurs cumulés (distinctions « À l'heure », « Leçon retenue »), gardés dans lucidite.cumuls
function compter(nom) {
  const e = lire("lucidite", {});
  e.cumuls = { ...(e.cumuls || {}), [nom]: ((e.cumuls || {})[nom] || 0) + 1 };
  ecrire("lucidite", e);
}

// Drapeaux des distinctions secrètes (emblème révélé, illusions vérifiées, secrets trouvés)
function noterDrapeau(nom, valeur) {
  const dist = lire("distinctions", {});
  const drapeaux = { ...(dist.drapeaux || {}) };
  if (nom === "illusions" || nom === "secrets") drapeaux[nom] = [...new Set([...(drapeaux[nom] || []), valeur])];
  else drapeaux[nom] = true;
  ecrire("distinctions", { ...dist, drapeaux });
  majMaitrise();
}

// ===================== Secrets =====================
// Chaque découverte s'inscrit une fois dans distinctions.drapeaux.secrets ; les distinctions secrètes (progression.js)
// les lisent. Solutions dans tests/secrets.md.
function trouverSecret(id) {
  if (!(((lire("distinctions", {}) || {}).drapeaux || {}).secrets || []).includes(id)) noterDrapeau("secrets", id);
}

// L'énigme de la console : les numéros de fiches dont les initiales forment un mot, à chercher ensuite dans la recherche.
// Le mot est choisi parmi quelques-uns, le premier qu'on peut écrire avec les fiches de la langue affichée.
function enigmeConsole() {
  // Mots écrits avec les initiales disponibles (en français, aucune fiche ne commence par L, O, U ni V)
  const mots = LANGUE === "en" ? ["reason", "proof", "mind"] : ["esprit", "debat", "biais"];
  const fiches = Object.keys(TYPES).flatMap(t => ORDRE[t].map(f => [t, f]));
  for (const mot of mots) {
    const prises = new Set();
    const numeros = [...mot].map(lettre => {
      const r = fiches.find(([t, f]) => !prises.has(t + f.id) && comparable(T(f.nom)).startsWith(lettre));
      if (!r) return null;
      prises.add(r[0] + r[1].id);
      return (r[0] === "biais" ? "B " : "S ") + r[1].num;
    });
    if (numeros.every(Boolean)) return { mot, indice: numeros.join(", ") };
  }
  return null;
}

// Sésame : le mot tapé au clavier hors d'un champ révèle l'emblème
const tapeSesame = [];
document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || (e.target.matches && e.target.matches("input, textarea, select"))) return;
  tapeSesame.push(e.key.toLowerCase());
  if (tapeSesame.length > 5) tapeSesame.shift();
  if (tapeSesame.join("") !== (LANGUE === "en" ? "doubt" : "doute")) return;
  const embleme = document.querySelector(".embleme");
  if (embleme) { embleme.classList.add("revele"); setTimeout(() => embleme.classList.remove("revele"), 3400); }
  annoncer(T("Sésame : douter n'est pas tout rejeter, c'est vérifier avant de croire."));
  trouverSecret("sesame");
});

// Bilingue, et l'énigme pour qui ouvre la console : une fois le site entièrement chargé
window.addEventListener("load", () => {
  // Sans annonce au chargement : la distinction apparaîtra à la prochaine action
  const dist = lire("distinctions", {}) || {}, drapeaux = dist.drapeaux || {};
  if (!(drapeaux.secrets || []).includes("langue-" + LANGUE)) ecrire("distinctions", { ...dist, drapeaux: { ...drapeaux, secrets: [...(drapeaux.secrets || []), "langue-" + LANGUE] } });
  const e = enigmeConsole();
  if (e) console.info(T("Esprit critique : vous regardez sous le capot, bonne habitude. Prenez l'initiale des fiches {0}, dans cet ordre, puis cherchez le mot obtenu dans la recherche du site.", e.indice));
});

// ===================== Moments de récompense, jamais bloquants =====================
function montrerPastille(texte) {
  const cible = document.querySelector(".bouton-profil") || document.body;
  const p = el("span", "pastille-points", texte);
  p.setAttribute("aria-hidden", "true");
  document.body.appendChild(p);
  const r = cible.getBoundingClientRect();
  p.style.setProperty("--x", Math.round(r.left + r.width / 2) + "px");
  p.style.setProperty("--y", Math.round(r.bottom + 6) + "px");
  const a = animer(p, [{ transform: "translate(-50%, 10px)", opacity: 0 }, { transform: "translate(-50%, 0)", opacity: 1, offset: 0.3 }, { transform: "translate(-50%, -6px)", opacity: 0 }], { duration: 1400 });
  if (a) a.onfinish = () => p.remove(); else setTimeout(() => p.remove(), 1200);
  annoncer(T("{0} points de lucidité", texte));
}

function montrerMoment(titre, texte) {
  const m = el("div", "moment");
  m.setAttribute("role", "status");
  const fermer = el("button", "lien moment-fermer", "Fermer");
  fermer.type = "button";
  fermer.addEventListener("click", () => m.remove());
  m.append(el("p", "moment-titre", titre), el("p", "source", texte), fermer);
  document.body.appendChild(m);
  animer(m, [{ transform: "translateY(12px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 280 });
  setTimeout(() => m.remove(), 6000);
}

// Changement de grade : bandeau avec le mouvement de la révélation (les ailettes de l'insigne s'effacent)
function bandeauGrade(grade) {
  const m = el("div", "moment moment-grade");
  m.setAttribute("role", "status");
  const ins = insigne(grade.rang, 44);
  m.append(ins, el("p", "moment-titre", T("Nouveau grade : {0}", T(grade.nom))), el("p", "source", "La maîtrise mesure votre réussite dans les jeux de ce site, pas votre intelligence."));
  const fermer = el("button", "lien moment-fermer", "Fermer");
  fermer.type = "button";
  fermer.addEventListener("click", () => m.remove());
  m.appendChild(fermer);
  document.body.appendChild(m);
  requestAnimationFrame(() => ins.classList.add("revele"));
  setTimeout(() => m.remove(), 8000);
}

// ===================== Insigne, blason =====================
// Insigne de grade : galons faits des ailettes de l'emblème (un chevron par grade jusqu'à trois, puis barres, puis étoile)
function insigne(rang, taille) {
  const s = svg("svg", { viewBox: "0 0 40 40", class: "insigne", width: taille, height: taille, role: "img", "aria-label": T("Insigne : {0}", T(GRADES[rang][1])) });
  const chevrons = Math.min(3, rang), barres = Math.max(0, Math.min(3, rang - 3)), etoile = rang >= 7;
  for (let k = 0; k < chevrons; k++) s.appendChild(svg("path", { d: "M10 " + (14 + k * 7) + "l10 -6 10 6", class: "insigne-trait" }));
  for (let k = 0; k < barres; k++) s.appendChild(svg("path", { d: "M11 " + (34 - k * 4) + "h18", class: "insigne-trait" }));
  if (etoile) s.appendChild(svg("path", { d: "M20 2l1.8 3.7 4 .6-2.9 2.8.7 4L20 11.2 16.4 13l.7-4-2.9-2.8 4-.6z", class: "insigne-plein" }));
  if (rang >= 8) s.appendChild(svg("path", { d: "M6 20h4M30 20h4", class: "insigne-trait" }));
  if (rang >= 9) s.appendChild(svg("path", { d: "M6 20 3 17M6 20l-3 3M34 20l3-3M34 20l3 3", class: "insigne-trait" }));
  if (!rang) s.appendChild(svg("circle", { cx: 20, cy: 20, r: 3, class: "insigne-plein" }));
  return s;
}

// Personnage : figure noire sur médaillon de terre cuite, à la manière des vases grecs (silhouette pleine, détails
// incisés couleur argile) : une silhouette reste lisible jusqu'à 26 px, là où l'ancienne figure au trait se perdait.
// Le costume dit le rôle du grade (tunique du novice, casque du stratège, lyre du virtuose…) ; un médaillon noir, en bas
// à gauche, porte l'objet du meilleur domaine, cerné de sa couleur ; autour, six arcs : la maîtrise de chaque domaine.
// Forme (humain, hibou, chat, robot), genre et équipement se choisissent dans les réglages (clé « profil », champ
// personnage) ; les formes et les équipements autres que les premiers se gagnent par une distinction difficile.
// Deux cadrages du même dessin : le buste (avatars, profil) et le personnage en pied (fiche à partager, réglages). Les
// tracés sont des chemins SVG : le même dessin sert à la page (svg()) et à l'image à partager (Path2D sur un canvas).
// Coordonnées : la figure dans une grille de 120, tournée vers la droite ; le médaillon dans un carré de 120.
const DOMAINES_PERSONNAGE = {
  monde: ["#0e7c86", "un globe", "M-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M-6 0h12M0-6c-3 3-3 9 0 12c3-3 3-9 0-12"],
  confiance: ["#c23b5a", "une jauge", "M-7 3a7 7 0 0 1 14 0M0 3l4-6"],
  perception: ["#8a3f8f", "un œil", "M-7 0q7-7 14 0q-7 7-14 0M-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"],
  raisonner: ["#2f6db5", "une grille de logique", "M-5-5h10v10h-10zM-5 0h10M0-5v10"],
  debattre: ["#c2412d", "deux bulles de dialogue", "M-7-6h8v6h-5l-3 3zM1-1h6v6h-1v3l-3-3h-2z"],
  notions: ["#a77a12", "un livre ouvert", "M0-4q-3-2-7-1v10q4-1 7 1zM0-4q3-2 7-1v10q-4-1-7 1z"]
};
// Couleurs du vase, les mêmes dans les deux thèmes (comme une image) ; reprises par --terre et --figure dans style.css.
// Contraste figure / argile : 4,9:1.
const TERRE_PERSONNAGE = "#c8693a", FIGURE_PERSONNAGE = "#1b120c";

// Un calque : [genre, tracé, épaisseur, ancrage]. Genres : « plein » (silhouette), « epais » (trait noir : bras, hampes),
// « incise » (détail gravé, couleur argile). Ancrages : « tete », « main » (main droite), « corps » ; décalés par forme.
const calquePersonnage = (genre, d, epaisseur, ancrage) => [genre, d, epaisseur || 0, ancrage || ""];
const BRAS_PERSONNAGE = "M71 40L77 55L84 52";
const ROBES_PERSONNAGE = {
  courte: [calquePersonnage("epais", "M55 72L53 102M67 72L70 102", 4.5), calquePersonnage("plein", "M56 36H67Q73 37 75 43L76 74H47L48 43Q50 37 56 36Z"),
    calquePersonnage("incise", "M48.5 58H75M55 60L54 72M61.5 60V72M68 60L69 72", 1.1)],
  longue: [calquePersonnage("plein", "M56 36H67Q73 37 75 43L78 103H45L48 43Q50 37 56 36Z"), calquePersonnage("incise", "M48.5 58H75.5M55 61L52 101M61.5 61V101M68 61L71 101", 1.1)]
};
// Pieds, bras gauche et bras droit : dessinés après la robe, pour que les avant-bras dépassent de la silhouette
const PIEDS_PERSONNAGE = calquePersonnage("plein", "M48 101H56L59 106H46ZM66 101H73L79 106H66Z");
const DRAPE_PERSONNAGE = [calquePersonnage("plein", "M50 40Q42 60 46 90L51 90Q47 62 55 42Z"), calquePersonnage("incise", "M50 44Q62 53 76 46M49 52Q62 63 77 56", 1.1)];
const DIADEME_PERSONNAGE = [calquePersonnage("plein", "M58 12.5L59.2 8.5L60.8 12ZM62.4 11.7L64 7.5L65.4 11.8Z", 0, "tete"), calquePersonnage("incise", "M55 16Q61 11.5 68 14.5", 1.1, "tete")];

// Costume de chaque grade : [description, robe, bras droit, drapé, calques]
const COSTUMES_PERSONNAGE = [
  ["une tunique courte", "courte", BRAS_PERSONNAGE, false, []],
  ["une tablette pour écrire", "longue", BRAS_PERSONNAGE, false, [calquePersonnage("plein", "M82 40H93V52H82Z", 0, "main"),
    calquePersonnage("incise", "M87.5 41V51M83.5 44H86.5M83.5 47H86.5M89 44H92M89 47H92", 0.9, "main")]],
  ["la main au menton, l'air de douter", "longue", "M71 40L79 47L72 31", false, []],
  ["une lampe à huile", "longue", BRAS_PERSONNAGE, false, [calquePersonnage("plein", "M80 50Q88 43 96 49Q90 54 80 50ZM95 48.5L100 46.5L100 49.5ZM100 46Q97.5 41 100.5 36Q104 41 100.5 46Z", 0, "main"),
    calquePersonnage("incise", "M86 48.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0", 0.9, "main")]],
  ["un rouleau", "longue", BRAS_PERSONNAGE, false, [calquePersonnage("plein", "M81 47H97V54H81Z", 0, "main"), calquePersonnage("incise", "M83.5 47V54M94.5 47V54M86 50.5H92", 0.9, "main")]],
  ["un casque, une lance et un bouclier", "courte", BRAS_PERSONNAGE, false, [
    calquePersonnage("epais", "M86 14L82 108", 2, "main"), calquePersonnage("plein", "M87 2L89.6 14H84.4Z", 0, "main"),
    calquePersonnage("plein", "M49 23Q45 6 61 3.5Q72 2.5 75 9Q67 6.5 61 8.5Q53 11.5 53.5 21Z", 0, "tete"), calquePersonnage("incise", "M56.5 15.5Q63 13.5 69 16M64.5 20Q62.5 25.5 64.5 31", 1.1, "tete"),
    calquePersonnage("plein", "M33 62a14 14 0 1 0 28 0a14 14 0 1 0-28 0", 0, "corps"),
    calquePersonnage("incise", "M36 62a11 11 0 1 0 22 0a11 11 0 1 0-22 0M43 62a4 4 0 1 0 8 0a4 4 0 1 0-8 0", 1.1, "corps")]],
  ["un manteau drapé et un bâton", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M87 30L80 108", 2.2, "main")]],
  ["une lyre", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M81.5 54Q75 44 81 35M90.5 54Q97 44 91 35M79.5 37H92.5", 2, "main"),
    calquePersonnage("epais", "M84 37V55M86 37V55M88 37V55", 0.7, "main"), calquePersonnage("plein", "M79 54H93L92 59Q86 64 80 59Z", 0, "main")]],
  ["un sceptre et un diadème", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M86 26L81 108", 2.2, "main"),
    calquePersonnage("plein", "M83.5 22.5a3 3 0 1 0 6 0a3 3 0 1 0-6 0", 0, "main"), ...DIADEME_PERSONNAGE]],
  ["un flambeau et un diadème", "longue", "M71 40L80 37L86 24", true, [calquePersonnage("epais", "M85 27L89.5 12", 3, "main"),
    calquePersonnage("plein", "M89.5 13Q83 8 88 -2Q90 4 94 2Q96 9 89.5 13Z", 0, "main"), ...DIADEME_PERSONNAGE]]
];

// Têtes de profil. La tête humaine change de coiffure selon le genre.
const TETE_HUMAINE = "M57 37V34C52 30 51 21 55 15C59 10 66 10 68 15L69 19L72.5 23.5L69.5 24.5L70 26.5L69 27.5L69.5 30C67 32.5 65 32.5 63.5 32L63.5 37Z";
const OEIL_PERSONNAGE = calquePersonnage("incise", "M65 19.2a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0-2.2 0", 1);
const CHEVEUX_PERSONNAGE = calquePersonnage("incise", "M67 13.5Q62.5 16 63 22Q61.5 26 58 27.5", 1.1);
// Formes : [id, nom, distinction qui la débloque (null : d'emblée), calques propres, porte robe et costume,
//   décalage des ancrages { tete, main, corps } par rapport à l'humain, cadrages { buste, pied } : [x, y, côté]]
const FORMES_PERSONNAGE = [
  ["humain", "Humain", null, [calquePersonnage("plein", TETE_HUMAINE), OEIL_PERSONNAGE], true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }],
  // La chouette d'Athéna, motif des vases et des monnaies : pas de robe, l'objet tenu au bout de l'aile
  ["hibou", "Hibou", "bien-etalonne", [
    calquePersonnage("plein", "M60 30C75 30 80 46 80 64C80 86 72 102 60 104C48 102 40 86 40 64C40 46 45 30 60 30ZM45 35L43 25L53 31ZM75 35L77 25L67 31Z"),
    calquePersonnage("epais", "M53 103L50 108M55 103V108M65 103V108M67 103L70 108", 1.6),
    calquePersonnage("incise", "M47 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0M63 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0M51 44a1 1 0 1 0 2 0a1 1 0 1 0-2 0M67 44a1 1 0 1 0 2 0a1 1 0 1 0-2 0M58 50L60 55L62 50"
      + "M43 56Q47 80 54 93M77 56Q73 80 66 93M51 68l4.5 3.5 4.5-3.5 4.5 3.5 4.5-3.5M51 77l4.5 3.5 4.5-3.5 4.5 3.5 4.5-3.5", 1.1)],
    false, { tete: [-1.5, 19], main: [2, 22], corps: [-1.5, 20] }, { buste: [32, 22, 66], pied: [4, 6, 112] }],
  ["chat", "Chat", "oreille-fine", [
    calquePersonnage("epais", "M47 97Q34 95 38 80Q41 72 36 68", 3),
    calquePersonnage("plein", "M57 37V35C52 31 51 22 55 16L54 7L60.5 12.5Q63 11.5 65.5 12.5L68 6L68.5 15.5C71 18 73 21 73 24L70 26.5C68 30 65 32 63.5 32.5L63.5 37Z"),
    calquePersonnage("epais", "M71 24.5L80 22M71 25.5L80 26.5M70.5 26.5L78 30", 0.7), calquePersonnage("incise", "M64 19Q66 17.5 68 19Q66 20.5 64 19Z", 1)],
    true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }],
  // Un automate de bronze, comme ceux que décrivent les mythes grecs
  ["robot", "Robot", "bayesien", [
    calquePersonnage("epais", "M62 11V5", 1.5), calquePersonnage("plein", "M53 11H71V31H66V37H58V31H53ZM59.8 4a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0"),
    calquePersonnage("incise", "M64 17H69V21H64ZM64 26H69M55 21a2 2 0 1 0 4 0a2 2 0 1 0-4 0", 1)],
    true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }]
];
const GENRES_PERSONNAGE = [["neutre", "Neutre", [CHEVEUX_PERSONNAGE]],
  ["feminin", "Féminin", [calquePersonnage("plein", "M50 18a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0"), calquePersonnage("incise", "M55 16Q61 11.5 67.5 14.5M63 15.5Q61.5 22 58 27.5", 1.1)]],
  ["masculin", "Masculin", [calquePersonnage("plein", "M63 27L69.5 28.5L71 33Q67 36 62 33Z"), CHEVEUX_PERSONNAGE]]];
// Équipements : [id, nom, distinction, calques]
const EQUIPEMENTS_PERSONNAGE = [
  ["", "Aucun", null, []],
  ["echarpe", "Une écharpe", "assidu", [calquePersonnage("plein", "M55 35Q48 38 42 47L45.5 48.5Q49 42 57 39Z", 0, "corps"), calquePersonnage("incise", "M56 37Q62 40 68 36.5", 1.1, "corps")]],
  ["plume", "Une plume", "fourchettes", [calquePersonnage("plein", "M58 12Q60 -1 72 -3Q66 4 62 12Z", 0, "tete"), calquePersonnage("incise", "M60.5 11Q63 3 70 -1", 0.9, "tete")]],
  ["medaille", "Une médaille", "polyvalent", [calquePersonnage("incise", "M58 46a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M60.7 46a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0-1.6 0M58.5 37.5L61.5 42.5L64.5 37.5", 1.1, "corps")]],
  ["laurier", "Une couronne de laurier", "specialiste", [calquePersonnage("plein", "M53.5 17.5l-4.5-2.5 1.5 4.5zM55 13.5l-3-4 4.5 1.5zM58.5 11l-1-5 3 4zM63.5 10.5l1-5 1.5 5z", 0, "tete"),
    calquePersonnage("incise", "M55 17Q60 13 67 14", 1.1, "tete")]]
];
// Exergue : la bande noire sous les pieds, comme au fond des coupes peintes (cadrage en pied)
const EXERGUE_PERSONNAGE = "M-20 108H140V160H-20Z";

// Choix enregistré, ramené aux valeurs permises et débloquées (une donnée importée ou une distinction perdue ne casse rien)
function choixPersonnage() {
  const c = ((lire("profil", {}) || {}).personnage) || {};
  const obtenues = new Set(((lire("distinctions", {}) || {}).obtenues) || []);
  const permis = (liste, id) => { const x = liste.find(e => e[0] === id); return x && (!x[2] || obtenues.has(x[2])) ? x : liste[0]; };
  return { forme: permis(FORMES_PERSONNAGE, c.forme), genre: GENRES_PERSONNAGE.find(g => g[0] === c.genre) || GENRES_PERSONNAGE[0],
    equipement: permis(EQUIPEMENTS_PERSONNAGE, c.equipement), obtenues };
}

// Le dessin, indépendant du support : couleur et objet du meilleur domaine, valeurs des domaines, calques
// [genre, tracé, épaisseur, dx, dy], cadrage (translation et échelle de la figure dans le médaillon), description.
// pied : vrai pour le personnage entier, faux pour le buste ; rayon : celui du médaillon (49 avec les arcs, sinon 58)
function dessinPersonnage(etat, pied, rayon) {
  const rang = etat ? gradeDe(etat.meilleure || 0).rang : 0;
  const dernier = etat ? Object.entries(etat.jours || {}).sort((a, b) => b[0] - a[0])[0] : null;
  const valeurs = DOMAINES.map(([d], i) => [d, dernier ? dernier[1][i + 1] || 0 : 0]);
  const [fort, vfort] = valeurs.reduce((a, b) => b[1] > a[1] ? b : a, ["", 0]);
  const objet = vfort > 0 ? DOMAINES_PERSONNAGE[fort] : null;
  const { forme, genre, equipement } = etat ? choixPersonnage() : { forme: FORMES_PERSONNAGE[0], genre: GENRES_PERSONNAGE[0], equipement: EQUIPEMENTS_PERSONNAGE[0] };
  const [, nomForme, , calquesForme, habille, decalages, cadrages] = forme;
  const [role, robe, bras, drape, calquesRole] = COSTUMES_PERSONNAGE[rang];
  const tenant = calquesRole.some(c => c[3] === "main");
  // Ordre de peinture : le drapé derrière, la robe, la tête, les bras, puis les accessoires (le bouclier devant tout)
  const calques = [];
  if (pied) calques.push(calquePersonnage("plein", EXERGUE_PERSONNAGE));
  if (habille) {
    if (drape) calques.push(...DRAPE_PERSONNAGE);
    calques.push(...ROBES_PERSONNAGE[robe], PIEDS_PERSONNAGE);
    calques.push(...calquesForme);
    if (forme[0] === "humain") calques.push(...genre[2]);
    calques.push(calquePersonnage("epais", "M52 40L47 55L50 66", 5), calquePersonnage("epais", bras, 5));
  } else {
    calques.push(...calquesForme);
    // Sans bras (hibou) : un bout d'aile tendu vers l'objet tenu
    if (tenant) calques.push(calquePersonnage("epais", "M77 66L84 73", 4));
  }
  // Le casque remplace la coiffure : il est dessiné par-dessus, les autres accessoires de tête aussi
  calques.push(...calquesRole, ...equipement[3]);
  const traits = calques.map(([g, d, e, ancrage]) => [g, d, e, ...((ancrage && decalages[ancrage]) || [0, 0])]);
  // Cadrage : le carré choisi de la grille de la figure remplit le médaillon ; le buste va jusqu'à la main droite, pour
  // que l'objet du rôle reste visible (le buste un peu plus que le pied)
  const [x0, y0, cote] = cadrages[pied ? "pied" : "buste"];
  const echelle = 2 * rayon * (pied ? 0.94 : 1) / cote;
  const cadrage = [60 - echelle * (x0 + cote / 2), 60 - echelle * (y0 + cote / 2) + (pied ? 0 : 4), echelle];
  const elements = [T(role), ...(equipement[3].length ? [T(equipement[1]).toLowerCase()] : []), ...(objet ? [T("l'emblème de son meilleur domaine, {0} : {1}", T(DOMAINES.find(([d]) => d === fort)[1]), T(objet[1]))] : [])];
  const description = T("Votre personnage ({0}), grade {1}", T(nomForme).toLowerCase(), T(GRADES[rang][1])) + " : " + elements.join(", ") + ". "
    + T("Maîtrise par domaine : {0}.", DOMAINES.map(([, nom], i) => T(nom) + " " + valeurs[i][1]).join(", "));
  return { couleur: objet ? objet[0] : null, objet, valeurs, traits, cadrage, description };
}

// Arc d'un domaine : 54° (6° d'écart), du haut dans le sens des aiguilles, rayon 56 autour du centre (60, 60)
const anglesArcPersonnage = i => [(-90 + i * 60 + 3) * Math.PI / 180, (-90 + i * 60 + 57) * Math.PI / 180];
// Médaillon de l'objet du domaine, en bas à gauche (à droite, la main tient l'objet du rôle) : seulement à partir de 64 px (plus petit, il ne se lirait pas)
const MEDAILLON_OBJET = [32, 88, 11];
// Chaque portrait a son masque : identifiant unique dans la page
let numeroPortrait = 0;

// taille : en pixels ; anneauDomaines : les six arcs autour ; pied : le personnage entier au lieu du buste
function personnage(etat, taille, anneauDomaines, pied) {
  const rayon = anneauDomaines ? 49 : 58;
  const p = dessinPersonnage(etat, pied, rayon);
  const s = svg("svg", { viewBox: "0 0 120 120", class: "blason portrait", width: taille, height: taille, "aria-hidden": "true" });
  s.style.setProperty("--c", p.couleur || "var(--accent)");
  if (anneauDomaines) p.valeurs.forEach(([d, v], i) => {
    const [a0, a1] = anglesArcPersonnage(i);
    const d0 = "M" + (60 + 56 * Math.cos(a0)).toFixed(2) + " " + (60 + 56 * Math.sin(a0)).toFixed(2) + "A56 56 0 0 1 " + (60 + 56 * Math.cos(a1)).toFixed(2) + " " + (60 + 56 * Math.sin(a1)).toFixed(2);
    s.appendChild(svg("path", { d: d0, class: "portrait-piste" }));
    const arc = svg("path", { d: d0, pathLength: 100, class: "portrait-arc", "stroke-dasharray": Math.round(Math.min(1000, v) / 10) + " 100" });
    arc.style.setProperty("--c", DOMAINES_PERSONNAGE[d][0]);
    const nom = svg("title");
    nom.textContent = T(DOMAINES[i][1]) + " : " + v;
    arc.appendChild(nom);
    if (v > 0) s.appendChild(arc);
  });
  const id = "portrait-masque-" + (++numeroPortrait);
  const masque = svg("clipPath", { id });
  masque.appendChild(svg("circle", { cx: 60, cy: 60, r: rayon }));
  s.append(masque, svg("circle", { cx: 60, cy: 60, r: rayon, class: "medaillon-fond" }));
  const [tx, ty, k] = p.cadrage;
  const cadre = svg("g", { "clip-path": "url(#" + id + ")" });
  const figure = svg("g", { transform: "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ") scale(" + k.toFixed(4) + ")" });
  p.traits.forEach(([g, d, e, dx, dy]) => figure.appendChild(svg("path", { d, class: "figure-" + g, ...(e ? { "stroke-width": e } : {}),
    ...(dx || dy ? { transform: "translate(" + dx + " " + dy + ")" } : {}) })));
  cadre.appendChild(figure);
  s.append(cadre, svg("circle", { cx: 60, cy: 60, r: rayon, class: "medaillon-bord" }));
  if (p.objet && taille >= 64) {
    const [cx, cy, r] = MEDAILLON_OBJET;
    s.append(svg("circle", { cx, cy, r: r + 1.5, class: "medaillon-objet-bord" }), svg("circle", { cx, cy, r, class: "medaillon-objet" }),
      svg("path", { d: p.objet[2], class: "medaillon-objet-trait", transform: "translate(" + cx + " " + cy + ")" }));
  }
  if (anneauDomaines) {
    s.setAttribute("role", "img");
    s.removeAttribute("aria-hidden");
    s.setAttribute("aria-label", p.description);
  }
  return s;
}

// Le même personnage sur l'image à partager : (x, y) coin haut gauche, cote en pixels ; toujours avec les arcs
function dessinerPersonnageCanvas(ctx, etat, x, y, cote, pied) {
  const rayon = 49, p = dessinPersonnage(etat, pied, rayon);
  ctx.save();
  ctx.translate(x, y); ctx.scale(cote / 120, cote / 120);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  p.valeurs.forEach(([d, v], i) => {
    const [a0, a1] = anglesArcPersonnage(i);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(60, 60, 56, a0, a1); ctx.strokeStyle = "#ebe7df"; ctx.stroke();
    if (v > 0) { ctx.beginPath(); ctx.arc(60, 60, 56, a0, a0 + (a1 - a0) * Math.min(1000, v) / 1000); ctx.strokeStyle = DOMAINES_PERSONNAGE[d][0]; ctx.stroke(); }
  });
  ctx.beginPath(); ctx.arc(60, 60, rayon, 0, 2 * Math.PI); ctx.fillStyle = TERRE_PERSONNAGE; ctx.fill();
  ctx.save();
  ctx.clip();
  const [tx, ty, k] = p.cadrage;
  ctx.translate(tx, ty); ctx.scale(k, k);
  p.traits.forEach(([g, d, e, dx, dy]) => {
    ctx.save(); ctx.translate(dx, dy);
    const chemin = new Path2D(d);
    if (g === "plein") { ctx.fillStyle = FIGURE_PERSONNAGE; ctx.fill(chemin); }
    else { ctx.lineWidth = e; ctx.strokeStyle = g === "incise" ? TERRE_PERSONNAGE : FIGURE_PERSONNAGE; ctx.stroke(chemin); }
    ctx.restore();
  });
  ctx.restore();
  ctx.beginPath(); ctx.arc(60, 60, rayon, 0, 2 * Math.PI); ctx.lineWidth = 1.5; ctx.strokeStyle = FIGURE_PERSONNAGE; ctx.stroke();
  if (p.objet) {
    const [cx, cy, r] = MEDAILLON_OBJET;
    ctx.beginPath(); ctx.arc(cx, cy, r + 1.5, 0, 2 * Math.PI); ctx.fillStyle = p.objet[0]; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fillStyle = FIGURE_PERSONNAGE; ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = 1.4; ctx.strokeStyle = TERRE_PERSONNAGE; ctx.stroke(new Path2D(p.objet[2])); ctx.restore();
  }
  ctx.restore();
}

// Frise à méandres (grecque) : une bande de motifs de 10 sur 10, pour la fiche et l'image à partager
function traceMeandre(longueur) {
  let d = "M0 0.6H" + longueur + "M0 9.4H" + longueur;
  for (let x = 1; x + 9 <= longueur; x += 10) d += "M" + x + " 7.6V2.4H" + (x + 7) + "V6H" + (x + 3.5) + "V4.4";
  return d;
}

// ===================== Salutations =====================
// Le personnage du joueur (accueil, bilans), le même que dans le profil, mode sobre compris : c'est son avatar
function personnageDuJoueur(taille) {
  return personnage(lire("maitrise", { jours: {}, meilleure: 0 }), taille);
}
function avecPersonnage(...enfants) {
  const ligne = el("div", "avec-personnage");
  const textes = el("div", "avec-personnage-textes");
  textes.append(...enfants);
  ligne.append(personnageDuJoueur(48), textes);
  return ligne;
}
const prenomDuJoueur = () => ((lire("profil", {}) || {}).pseudo || "").trim();

// Formules de l'en-tête, par moment de la journée ; la formule change chaque jour (rotation sans remise, app.js)
const SALUTS = {
  matin: ["Bonjour", "Bien le bonjour", "Belle matinée", "Debout, les neurones"],
  midi: ["Bonjour", "Bon appétit", "Pause méritée", "Re-bonjour"],
  apresMidi: ["Bon après-midi", "Re-bonjour", "Salut", "Belle journée"],
  soir: ["Bonsoir", "Bonne soirée", "Re-bonsoir", "Bonsoir l'esprit vif"],
  nuit: ["Encore debout", "Bonsoir", "Tiens, un oiseau de nuit", "Insomnie critique"]
};
// Phrases du jour quand rien de particulier ne se présente : des idées et des clins d'œil, jamais des faits chiffrés,
// jamais la peur de perdre une série (le site apprend à ne pas se laisser manipuler)
const PHRASES_DU_JOUR = [
  "Aujourd'hui, une seule règle : on croit ce qu'on vérifie, pas l'inverse.",
  "Votre cerveau est génial. Il est aussi très doué pour vous raconter des histoires.",
  "Un biais par jour éloigne la crédulité.",
  "Petit rappel amical : avoir l'impression de savoir n'est pas savoir.",
  "Les sophismes portent de beaux costumes. Aujourd'hui, on lit les étiquettes.",
  "Si c'est trop beau pour être vrai, ça mérite au moins une deuxième lecture.",
  "Votre intuition a souvent raison. Aujourd'hui, on apprend à savoir quand.",
  "Votre meilleur adversaire du jour : votre première impression.",
  "Le doute n'est pas une faiblesse, c'est un outil. Aujourd'hui, on l'aiguise.",
  "Une source, une date, un auteur : le trio gagnant avant de partager quoi que ce soit.",
  "Changer d'avis devant une preuve, c'est une victoire, pas une défaite.",
  "Un chiffre tout seul ne dit rien : demandez-lui toujours son dénominateur.",
  "Tout le monde se trompe. L'astuce, c'est de s'en apercevoir avant les autres.",
  "Ce qui vient facilement à l'esprit n'est pas forcément ce qui arrive souvent.",
  "Un argument se juge à ses raisons, pas à la tête de celui qui le défend.",
  "Les coïncidences adorent se déguiser en signes. Ne vous laissez pas faire.",
  "Savoir ce qu'on ne sait pas : voilà déjà un sacré savoir.",
  "Être sûr n'est pas avoir raison. Votre étalonnage, lui, ne ment pas.",
  "Prenez votre temps : la réponse rapide n'est pas toujours la bonne.",
  "Aujourd'hui, soyez sceptique avec élégance.",
  "Les illusions d'optique ne trichent qu'avec vos yeux. Les biais, avec tout le reste.",
  "On ne devient pas critique en un jour. Mais un jour de plus, ça compte.",
  "Une bonne question vaut mieux que dix réponses rapides.",
  "Le monde est plein d'arguments boiteux. Bonne nouvelle : vous savez maintenant marcher droit."
];
// Situations : plusieurs tournures, une par jour (rotation sans remise)
const PHRASES_RETOUR = ["Tiens, un revenant ! {0} jours sans nous voir : vos révisions ont gardé votre place au chaud.",
  "{0} jours d'absence : l'oubli a fait son travail, à vous de défaire le sien.",
  "Vous revoilà, après {0} jours. Vos notions vous attendaient, sagement rangées."];
const PHRASES_RETOUR_SANS_REVISION = ["Vous revoilà, après {0} jours. Heureux hasard, ou décision éclairée ?",
  "{0} jours sans nous voir. Les biais, eux, n'ont pas pris de vacances.",
  "Quel plaisir de vous revoir après {0} jours. On reprend où vous en étiez ?"];
const PHRASES_OBJECTIF = ["Objectif du jour dans la poche. Tout ce qui suit, c'est pour le plaisir.",
  "Objectif atteint ! Votre cortex mérite une ovation (modérée : on reste critiques).",
  "Objectif du jour rempli. La suite, c'est du bonus, et du bonus bien mérité."];
const PHRASES_REVISIONS = ["{0} notions frappent à la porte de votre mémoire. On leur ouvre ?",
  "{0} notions arrivent à échéance : c'est leur moment pour s'ancrer.",
  "Votre mémoire a {0} rendez-vous aujourd'hui. Ils ne prennent que quelques minutes."];
const PHRASES_SERIE = ["{0} jours d'affilée. La régularité, c'est le super-pouvoir le plus sous-estimé.",
  "{0} jours de suite : votre esprit critique fait de la musculation.",
  "{0} jours d'affilée. À ce rythme, les sophismes vont finir par vous éviter."];
const PHRASES_PARCOURS = ["Votre parcours « {0} » vous attend juste en dessous. Une étape, et on avance.",
  "Prochaine étape de « {0} » : elle est juste en dessous, prête quand vous l'êtes.",
  "« {0} » continue. Encore une étape, et vous en saurez un peu plus que tout à l'heure."];
const PHRASES_NUIT = ["Il est tard : les questions seront encore là demain, promis.",
  "Une partie de nuit ? Méfiez-vous : à cette heure-ci, tout semble convaincant.",
  "Les biais ne dorment jamais. Vous, en revanche, vous devriez peut-être."];

// Titre et phrase de l'accueil, selon l'heure, la date et la situation du joueur (la première qui s'applique)
function salutation(nouveau) {
  const maintenant = new Date(), h = maintenant.getHours(), jour = aujourdHui();
  const moment = h < 5 ? "nuit" : h < 11 ? "matin" : h < 14 ? "midi" : h < 18 ? "apresMidi" : h < 22 ? "soir" : "nuit";
  const [mois, date, semaine] = [maintenant.getMonth() + 1, maintenant.getDate(), maintenant.getDay()];
  const varier = (liste, sel) => tirerSansRemise(liste, 1, jour, sel)[0];
  let formule = T(varier(SALUTS[moment], 31));
  if (mois === 1 && date === 1) formule = T("Bonne année");
  else if (mois === 12 && date === 25) formule = T("Joyeux Noël");
  else if (moment !== "nuit" && (semaine === 0 || semaine === 6) && jour % 2) formule = T("Bon week-end");
  const nom = prenomDuJoueur();
  const titre = nom ? T("{0}, {1}.", formule, nom) : formule + ".";
  // Situation : du plus utile au plus général
  const activite = lire("activite", []), avant = activite.filter(j => j < jour);
  const absence = avant.length ? jour - avant[avant.length - 1] : 0;
  const luc = (lire("lucidite", {}) || {}).jours || {};
  const aReviser = clesAReviser().length, serie = serieDeJours();
  const etape = typeof prochaineEtape === "function" ? prochaineEtape() : null;
  let phrase;
  if (mois === 4 && date === 1) phrase = T("Premier avril : aujourd'hui plus que jamais, vérifiez avant de croire. (Celle-là, elle est vraie.)");
  else if (nouveau) phrase = T("Bienvenue ! Ici, on apprend à se tromper moins… en commençant par se tromper un peu.");
  else if (absence >= 7) phrase = T(varier(aReviser ? PHRASES_RETOUR : PHRASES_RETOUR_SANS_REVISION, 41), absence);
  else if (!modeSobre() && (luc[jour] || 0) >= lire("objectif", 60)) phrase = T(varier(PHRASES_OBJECTIF, 43));
  else if (aReviser >= 3) phrase = T(varier(PHRASES_REVISIONS, 47), aReviser);
  else if (serie >= 3 && serie % 7 === 0) phrase = T(varier(PHRASES_SERIE, 53), serie);
  else if (etape) phrase = T(varier(PHRASES_PARCOURS, 59), T(etape.parcours.titre));
  else if (moment === "nuit") phrase = T(varier(PHRASES_NUIT, 61));
  else phrase = T(varier(PHRASES_DU_JOUR, 37));
  return { titre, phrase };
}

// Un mot du personnage à la fin d'une partie, selon la part de réussite (0 à 1)
function reactionBilan(part) {
  const nom = prenomDuJoueur(), ajout = texte => nom ? T("{0}, {1}", texte, nom) + "." : texte + ".";
  if (part >= 0.9) return ajout(T("Remarquable"));
  if (part >= 0.7) return ajout(T("Belle partie"));
  if (part >= 0.5) return ajout(T("Pas mal du tout"));
  return T("Les erreurs d'aujourd'hui sont les réflexes de demain.");
}

// ===================== En-tête : bouton de profil =====================
function majBoutonProfil(m, etat) {
  const b = document.querySelector(".bouton-profil");
  if (!b) return;
  // Mode sobre : bouton neutre (blason seul), pour que le profil et ses réglages restent atteignables
  b.classList.toggle("sobre", modeSobre());
  // Mode sobre : l'avatar seul, sans maîtrise ni insigne (l'avatar reste celui du joueur, comme dans son profil)
  if (modeSobre()) { b.replaceChildren(personnageDuJoueur(26)); b.setAttribute("aria-label", T("Profil et réglages")); return; }
  etat = etat || lire("maitrise", { meilleure: 0, jours: {} });
  const globale = m ? m.globale : (Object.entries(etat.jours || {}).sort((a, x) => x[0] - a[0])[0] || [0, [0]])[1][0];
  const grade = gradeDe(etat.meilleure || 0);
  const points = (lire("lucidite", {}).jours || {})[aujourdHui()] || 0;
  const objectif = lire("objectif", 60);
  b.replaceChildren(personnage(etat, 26), anneau(points / objectif, 34, "anneau-profil"), insigne(grade.rang, 18), el("span", "bouton-profil-maitrise", String(globale)));
  b.setAttribute("aria-label", T("Profil : {0}, maîtrise {1} ; {2} points sur {3} pour l'objectif du jour", T(grade.nom), globale, points, objectif));
}

// ===================== Page Profil =====================
const ONGLETS_PROFIL = [["ensemble", "Vue d'ensemble"], ["jeux", "Jeux"], ["notions", "Notions"], ["distinctions", "Distinctions"], ["parcours", "Parcours"], ["reglages", "Réglages"]];
let ongletProfil = "ensemble";

function afficherPageProfil(onglet) {
  if (onglet && ONGLETS_PROFIL.some(([o]) => o === onglet)) ongletProfil = onglet;
  const zone = $("vue-profil");
  zone.replaceChildren();
  const { m, etat } = majMaitrise(false);
  const profil = lire("profil", {}) || {};
  const grade = gradeDe(etat.meilleure || 0);
  // En tête : blason, pseudonyme, insigne du grade, maîtrise, jauge vers le grade suivant
  const tete = el("div", "profil-tete");
  const identite = el("div", "profil-identite");
  // Le portrait ouvre la fiche à partager : le personnage en pied, en grand (sa description complète y est lue)
  const portrait = el("button", "bouton-portrait");
  portrait.type = "button";
  portrait.setAttribute("aria-label", T("Ouvrir la fiche de votre personnage"));
  const dessin = personnage(etat, 112, true);
  dessin.setAttribute("aria-hidden", "true");
  portrait.appendChild(dessin);
  portrait.addEventListener("click", () => ouvrirFichePersonnage(portrait));
  identite.append(portrait, el("div", "profil-noms"));
  identite.lastChild.append(el("h1", "page-titre" + ((profil.pseudo || "").length > 12 ? " titre-long" : ""), profil.pseudo || T("Votre profil")), el("p", "profil-grade"));
  identite.querySelector(".profil-grade").append(insigne(grade.rang, 26), texteNoeud(" " + T(grade.nom)));
  tete.appendChild(identite);
  const chiffre = el("div", "profil-maitrise");
  chiffre.append(el("span", "grand-nombre", String(m.globale)), el("span", "source", "de maîtrise, sur 1 000"));
  tete.appendChild(chiffre);
  zone.appendChild(tete);
  if (grade.suivant) zone.appendChild(graphiqueJauge(T("Vers le grade « {0} »", T(grade.suivant[1])), etat.meilleure, grade.seuil, grade.suivant[0],
    T("Encore {0} points de maîtrise. Le jeu qui rapporterait le plus : {1}.", grade.suivant[0] - etat.meilleure, jeuConseille(m))));
  zone.appendChild(el("p", "source avertissement-maitrise", "La maîtrise mesure votre réussite dans les jeux de ce site, pas votre intelligence."));
  zone.appendChild(lienVers("#portrait", "Votre portrait : ce que vos réponses révèlent de votre façon de juger →", "lien-discret"));
  const partage = el("button", "bouton secondaire bouton-partage", "Fiche à partager");
  partage.type = "button";
  partage.addEventListener("click", () => ouvrirFichePersonnage(partage));
  zone.appendChild(partage);

  const onglets = el("div", "onglets-profil");
  onglets.setAttribute("role", "tablist");
  ONGLETS_PROFIL.forEach(([id, titre]) => {
    const b = el("button", "onglet-profil", titre);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(id === ongletProfil));
    b.addEventListener("click", () => { location.replace("#profil/" + id); });
    onglets.appendChild(b);
  });
  zone.appendChild(onglets);
  const panneau = el("div", "panneau-profil");
  panneau.setAttribute("role", "tabpanel");
  // Titre de l'onglet, pour les lecteurs d'écran : les blocs du panneau (h3) viennent ainsi après un h2
  panneau.appendChild(el("h2", "invisible", ONGLETS_PROFIL.find(([o]) => o === ongletProfil)[1]));
  zone.appendChild(panneau);
  // Onglet tiré de l'adresse : choix fermé, la vue d'ensemble par défaut
  switch (ongletProfil) {
    case "jeux": ongletJeux(panneau, m, etat); break;
    case "notions": ongletNotions(panneau, m, etat); break;
    case "distinctions": ongletDistinctions(panneau, m, etat); break;
    case "reglages": ongletReglages(panneau, m, etat); break;
    case "parcours": ongletParcours(panneau); break;
    default: ongletEnsemble(panneau, m, etat);
  }
}

// Jeu mesuré le plus faible (ou jamais joué) du domaine le plus faible
function jeuConseille(m) {
  const [domaine] = Object.entries(m.domaines).filter(([d]) => d !== "notions").sort((a, b) => a[1] - b[1])[0] || [];
  const jeux = Object.entries(m.jeux).filter(([id, [d]]) => d === domaine && tousLesAteliers().some(a => a.atelier.id === id)).sort((a, b) => a[1][1] - b[1][1]);
  if (!jeux.length) return T("une série de quiz");
  return tousLesAteliers().find(a => a.atelier.id === jeux[0][0]).atelier.titre;
}

const nomsDomaines = () => DOMAINES.map(([, nom]) => T(nom));

// Messages des graphiques du profil : la conclusion que chaque graphique doit faire passer
// Courbe de maîtrise : évolution sur les sept derniers jours mesurés (ou depuis le premier jour, s'il est plus récent)
function messageMaitrise(jours) {
  if (jours.length < 2) return T("Un seul jour mesuré : la courbe se dessinera au fil de vos parties.");
  const [jd, vd] = jours[jours.length - 1];
  const [j0, v0] = jours.filter(([j]) => j <= jd - 7).pop() || jours[0];
  const ecart = vd[0] - v0[0], duree = pluriel(jd - j0, "jour");
  if (ecart > 0) return T("Votre maîtrise a gagné {0} points en {1}.", ecart, duree);
  if (ecart < 0) return T("Votre maîtrise a perdu {0} points en {1}.", -ecart, duree);
  return T("Votre maîtrise n'a pas bougé en {0}.", duree);
}

// Toile : le domaine qui a le plus progressé en quatre semaines ; sans historique, l'équilibre du profil
function messageToile(valeurs, anciennes) {
  const noms = nomsDomaines();
  if (anciennes) {
    const gains = valeurs.map((v, i) => v - (anciennes[i] || 0));
    const k = gains.indexOf(Math.max(...gains));
    return gains[k] > 0 ? T("En quatre semaines, c'est en {0} que vous avez le plus progressé (+{1}).", noms[k], gains[k])
      : T("Aucun domaine n'a progressé en quatre semaines.");
  }
  const fort = valeurs.indexOf(Math.max(...valeurs)), faible = valeurs.indexOf(Math.min(...valeurs));
  if (valeurs[fort] === 0) return T("Aucun domaine mesuré pour l'instant : une partie suffit pour remplir ce graphique.");
  // Des domaines encore à zéro ne sont pas « au même niveau » : ils n'ont simplement pas été mesurés
  const zeros = valeurs.filter(v => v === 0).length;
  if (zeros) return T("Point fort : {0} ({1}). Domaines encore à zéro : {2} sur 6.", noms[fort], valeurs[fort], zeros);
  if (valeurs[fort] - valeurs[faible] < 150) return T("Vos six domaines sont à peu près au même niveau.");
  return T("Profil inégal : {0} devance {1} de {2} points.", noms[fort], noms[faible], valeurs[fort] - valeurs[faible]);
}

// Jeux d'une section : le plus et le moins maîtrisés, et le nombre de jeux jamais joués
function messageJeuxSection(lignes) {
  const joues = lignes.filter(([, v]) => v !== null).sort((a, b) => b[1] - a[1]);
  const jamais = lignes.length - joues.length;
  if (!joues.length) return T("Aucun jeu de cette section joué pour l'instant.");
  const debut = joues.length > 1 ? T("Le plus maîtrisé : {0} ({1}) ; le moins : {2} ({3}).", T(joues[0][0]), joues[0][1], T(joues[joues.length - 1][0]), joues[joues.length - 1][1])
    : T("Un seul jeu joué : {0} ({1}).", T(joues[0][0]), joues[0][1]);
  return jamais ? debut + " " + T("Jamais joués : {0}.", jamais) : debut;
}

function ongletEnsemble(p, m, etat) {
  const jours = Object.entries(etat.jours || {}).map(([j, v]) => [Number(j), v]).sort((a, b) => a[0] - b[0]);
  // Échelle jusqu'au deuxième grade au-dessus de la meilleure maîtrise : une courbe lisible, sans grade qui se chevauche
  const plusHaut = GRADES.find(([s]) => s > (etat.meilleure || 0) * 1.15 + 40) || GRADES[GRADES.length - 1];
  const echelle = Math.min(1000, (GRADES[GRADES.indexOf(plusHaut) + 1] || [1000])[0]);
  p.appendChild(graphiqueCourbe(T("Votre maîtrise, jour après jour"), jours.map(([j, v]) => [j, v[0]]), echelle, GRADES.filter(([s]) => s >= 25 && s <= echelle).map(([s, n]) => [s, T(n)]), messageMaitrise(jours)));
  p.appendChild(el("p", "source", T("La courbe commence le {0}, jour de la mise à jour qui a introduit la maîtrise : les jours d'avant ne peuvent pas être recalculés.",
    new Date((etat.depuis || aujourdHui()) * 86400000).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }))));
  const ancien = jours.filter(([j]) => j <= aujourdHui() - 28).pop();
  const valeurs = DOMAINES.map(([d]) => m.domaines[d]);
  p.appendChild(graphiqueToile(T("Vos six domaines (en pointillé : il y a quatre semaines)"), nomsDomaines(), valeurs, ancien ? ancien[1].slice(1) : null, 1000,
    messageToile(valeurs, ancien ? ancien[1].slice(1) : null)));
  const faible = valeurs.indexOf(Math.min(...valeurs));
  p.appendChild(graphiqueBarres(T("Les mêmes domaines, en barres"), DOMAINES.map(([, nom], i) => [T(nom), valeurs[i]]).sort((a, b) => b[1] - a[1]), 1000, [500],
    Math.max(...valeurs) > 0 ? T("À travailler en priorité : {0} ({1}). Jeu conseillé : {2}.", nomsDomaines()[faible], valeurs[faible], T(jeuConseille(m)))
      : T("Aucun domaine mesuré pour l'instant : une partie suffit pour remplir ce graphique.")));
  // Forces et points faibles
  const jeux = Object.entries(m.jeux).filter(([id]) => tousLesAteliers().some(a => a.atelier.id === id)).map(([id, [, v]]) => [tousLesAteliers().find(a => a.atelier.id === id).atelier.titre, v]);
  const joues = jeux.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (joues.length) {
    const bloc = el("div", "forces");
    bloc.append(el("h3", "titre-bloc", "Forces et points faibles"),
      el("p", null, T("Vos jeux les plus forts : {0}.", joues.slice(0, 3).map(([n, v]) => n + " (" + v + ")").join(", "))),
      el("p", null, T("À travailler : {0}.", jeux.sort((a, b) => a[1] - b[1]).slice(0, 3).map(([n, v]) => n + " (" + v + ")").join(", "))));
    p.appendChild(bloc);
  }
  // Objectif, série, points, calendrier
  const luc = lire("lucidite", {}) || {};
  const objectif = lire("objectif", 60);
  p.appendChild(el("h3", "titre-bloc", "Entraînement"));
  p.appendChild(el("p", null, T("Aujourd'hui : {0} points de lucidité sur un objectif de {1}. Série : {2} (un jour de repos par semaine ne la rompt pas). Total depuis le début : {3} points.",
    (luc.jours || {})[aujourdHui()] || 0, objectif, pluriel(serieAvecRepos(lire("activite", []), aujourdHui()), "jour"), luc.total || 0)));
  const actifs = depuis => Object.keys(luc.jours || {}).filter(j => Number(j) > aujourdHui() - depuis && (luc.jours[j] || 0) > 0).length;
  p.appendChild(graphiqueCalendrier(T("Les seize dernières semaines : plus la case est foncée, plus le jour a compté de points"), luc.jours || {}, aujourdHui(),
    T("{0} sur les seize dernières semaines, dont {1} sur les quatre dernières.", pluriel(actifs(112), "jour d'entraînement", "jours d'entraînement"), actifs(28))));
}

function ongletJeux(p, m) {
  SECTIONS_ATELIERS.filter(s => s.id !== "melange").forEach(section => {
    const dom = section.id === "philosopher" ? "raisonner" : section.id;
    const domaineConnu = DOMAINES.some(([d]) => d === dom);
    const lignes = tousLesAteliers().filter(a => a.atelier.section === section.id && MAITRISE_JEUX[a.atelier.id] && MAITRISE_JEUX[a.atelier.id][1] !== "aucun")
      .map(a => { const v = m.jeux[a.atelier.id] ? m.jeux[a.atelier.id][1] : 0; return [a.atelier.titre, resultatAtelier(a.atelier.id) ? v : null, a.atelier.couleur]; });
    if (!lignes.length) return;
    p.appendChild(graphiqueBarres(T("{0} : maîtrise de chaque jeu (repères 500 et 750 : plafonds des niveaux 1 et 2 d'un atelier à trois niveaux)", section.titre), lignes, 1000, [500, 750], messageJeuxSection(lignes)));
    if (domaineConnu) p.appendChild(el("p", "source", T("Maîtrise du domaine : {0}. Un jeu jamais joué compte pour zéro.", m.domaines[dom])));
  });
}

// Le codex : une roue de 90 points en 14 arcs aux couleurs des catégories ; chaque point est une fiche, dans l'un de
// cinq états (jamais ouverte, lue, rencontrée au quiz, consolidée en boîte 3, maîtrisée en boîte 5). Version en liste
// pour les lecteurs d'écran.
const ETATS_CODEX = ["jamais ouverte", "lue", "rencontrée au quiz", "consolidée", "maîtrisée"];
function etatCodex(cle) {
  const m = memoire[cle];
  if (m && m.b >= 5) return 4;
  if (m && m.b >= 3) return 3;
  if (m) return 2;
  return lire("fichesLues", []).includes(cle) ? 1 : 0;
}
// mini : dessin décoratif de l'accueil (un seul lien autour, vers le profil) : ni lien par point, ni texte
function codex(taille, mini) {
  // Dans l'ordre des catégories : les points d'une même couleur forment un arc
  const cles = Object.keys(TYPES).flatMap(t => ORDRE[t].map(f => [t, f]));
  const s = svg("svg", { viewBox: "0 0 300 300", class: "codex", width: taille, height: taille, role: "img", ...(mini ? { "aria-hidden": "true" } : {}), "aria-label": T("Le codex : {0} notions maîtrisées sur {1}", cles.filter(([t, f]) => etatCodex(cleFiche(t, f)) === 4).length, cles.length) });
  const n = cles.length;
  cles.forEach(([type, f], i) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n, etat = etatCodex(cleFiche(type, f));
    const lien = svg("a", { href: "#" + type + "/" + f.id, "aria-label": f.nom + " : " + T(ETATS_CODEX[etat]) });
    const point = svg("circle", { cx: 150 + 122 * Math.cos(a), cy: 150 + 122 * Math.sin(a), r: 3 + etat * 1.1, class: "codex-point etat-" + etat });
    point.style.setProperty("--c", COULEURS[f.categorie]);
    if (mini) { s.appendChild(point); return; }
    lien.appendChild(point);
    s.appendChild(lien);
  });
  if (mini) return s;
  const maitrisees = cles.filter(([t, f]) => etatCodex(cleFiche(t, f)) === 4).length;
  s.append(texteSvg(150, 150, String(maitrisees), { class: "codex-nombre", "text-anchor": "middle" }), texteSvg(150, 172, T("notions maîtrisées sur {0}", n), { class: "graduation-graphique", "text-anchor": "middle" }));
  return s;
}

function ongletNotions(p, m) {
  p.appendChild(el("p", null, T("Maîtrise des notions : {0}. Chaque point du codex est une fiche ; sa taille dit où vous en êtes : jamais ouverte, lue, rencontrée au quiz, consolidée (boîte 3), maîtrisée (boîte 5).", m.domaines.notions)));
  const roue = el("div", "codex-cadre");
  roue.appendChild(codex(300));
  p.appendChild(roue);
  const details = el("details", "codex-liste");
  details.appendChild(el("summary", null, "Le codex en liste"));
  const ul = el("ul", "liste-simple");
  INDEX.forEach(({ type, fiche }, cle) => {
    const li = el("li");
    li.append(lienVers("#" + type + "/" + fiche.id, fiche.nom), texteNoeud(" : " + T(ETATS_CODEX[etatCodex(cle)])));
    ul.appendChild(li);
  });
  details.appendChild(ul);
  p.appendChild(details);
}

function ongletDistinctions(p) {
  const obtenues = new Set((lire("distinctions", {}) || {}).obtenues || []);
  p.appendChild(el("p", null, T("{0} distinctions obtenues sur {1}. Chacune récompense une habitude que le site enseigne, pas le temps passé.", obtenues.size, DISTINCTIONS.length)));
  const grille = el("div", "distinctions");
  DISTINCTIONS.forEach(([id, nom, , pourquoi, lien, secrete]) => {
    const a = obtenues.has(id);
    if (secrete && !a) { grille.appendChild(el("div", "distinction-carte secrete", T("Distinction secrète"))); return; }
    const carte = el("div", "distinction-carte" + (a ? " obtenue" : ""));
    carte.append(el("p", "distinction-nom", (a ? "✓ " : "") + T(nom)), el("p", "source", pourquoi));
    const cadeau = [...FORMES_PERSONNAGE, ...EQUIPEMENTS_PERSONNAGE].find(x => x[2] === id);
    if (cadeau) carte.appendChild(el("p", "source", T("Débloque pour votre personnage : {0}.", T(cadeau[1]).toLowerCase())));
    const adresse = lien.startsWith("#") ? lien : "#" + lien.replace(":", "/");
    carte.appendChild(lienVers(adresse, a ? T("Revoir") : T("Y aller"), "lien-discret"));
    grille.appendChild(carte);
  });
  p.appendChild(grille);
}

// Choix du personnage : forme, genre (pour l'humain), équipement. Ce qui n'est pas encore gagné reste affiché, désactivé,
// avec la distinction qui le débloque : un objectif visible plutôt qu'une surprise.
function reglagesPersonnage(p, profil) {
  const { forme, genre, equipement, obtenues } = choixPersonnage();
  const choisir = champ => valeur => { ecrire("profil", { ...profil, personnage: { ...(profil.personnage || {}), [champ]: valeur } }); majBoutonProfil(); afficherPageProfil(); };
  p.appendChild(el("p", "consigne", "Votre personnage"));
  const apercu = el("div", "apercu-personnage");
  apercu.appendChild(personnage(lire("maitrise", { jours: {}, meilleure: 0 }), 136, true, true));
  p.appendChild(apercu);
  const rangee = (titre, liste, actuel, champ) => {
    const groupe = el("div", "puces puces-personnage");
    groupe.setAttribute("role", "group");
    groupe.setAttribute("aria-label", T(titre));
    liste.forEach(([id, nom, distinction]) => {
      const gagne = !distinction || obtenues.has(distinction);
      const d = gagne ? null : DISTINCTIONS.find(x => x[0] === distinction);
      const b = el("button", "puce" + (id === actuel ? " active" : ""), gagne ? nom : T("{0} (à gagner : {1})", T(nom), T(d[1])));
      b.type = "button";
      b.disabled = !gagne;
      b.setAttribute("aria-pressed", String(id === actuel));
      if (d) b.title = d[3];
      b.addEventListener("click", () => choisir(champ)(id));
      groupe.appendChild(b);
    });
    p.append(el("p", "source", titre), groupe);
  };
  rangee("Forme", FORMES_PERSONNAGE, forme[0], "forme");
  if (forme[0] === "humain") rangee("Genre", GENRES_PERSONNAGE.map(([id, nom]) => [id, nom, null]), genre[0], "genre");
  rangee("Équipement", EQUIPEMENTS_PERSONNAGE, equipement[0], "equipement");
  p.appendChild(el("p", "source", "Les formes et les équipements à gagner se débloquent avec une distinction difficile (onglet « Distinctions »)."));
}

function ongletReglages(p) {
  const profil = lire("profil", {}) || {};
  const champ = el("input", "champ champ-texte");
  champ.maxLength = 24;
  champ.value = profil.pseudo || "";
  champ.id = "pseudo-profil";
  const etiquette = el("label", "consigne", "Pseudonyme (24 caractères au plus ; il reste sur cet appareil)");
  etiquette.htmlFor = champ.id;
  champ.addEventListener("change", () => { ecrire("profil", { ...profil, pseudo: champ.value.trim().slice(0, 24) }); afficherPageProfil(); });
  p.append(etiquette, champ);
  reglagesPersonnage(p, profil);
  p.appendChild(el("p", "consigne", "Objectif du jour"));
  const objectif = el("div", "puces");
  [30, 60, 100].forEach(v => {
    const b = el("button", "puce" + (lire("objectif", 60) === v ? " active" : ""), T("{0} points", v));
    b.type = "button";
    b.setAttribute("aria-pressed", String(lire("objectif", 60) === v));
    b.addEventListener("click", () => { ecrire("objectif", v); afficherPageProfil(); });
    objectif.appendChild(b);
  });
  p.appendChild(objectif);
  const sobre = el("label", "case-tirage");
  const caseSobre = el("input");
  caseSobre.type = "checkbox";
  caseSobre.checked = modeSobre();
  caseSobre.addEventListener("change", () => { ecrire("reglages", { ...lire("reglages", {}), sobre: caseSobre.checked }); majBoutonProfil(); afficherPageProfil(); });
  sobre.append(caseSobre, texteNoeud(" " + T("Mode sobre : cacher la maîtrise, les grades, les points et les distinctions (tout continue d'être compté)")));
  p.appendChild(sobre);
  // Thème et animations : les choix du pied de page, repris ici ; un clic actionne le bouton du pied, qui applique le
  // réglage et met à jour l'état (aria-pressed) des deux rangées
  [["Thème", "theme-choix", [["auto", "Auto"], ["light", "Clair"], ["dark", "Sombre"]]],
    ["Animations", "animations-choix", [["auto", "Automatiques"], ["reduites", "Réduites"]]]].forEach(([titre, attribut, choix]) => {
    p.appendChild(el("p", "consigne", titre));
    const groupe = el("div", "puces");
    groupe.setAttribute("role", "group");
    groupe.setAttribute("aria-label", T(titre));
    choix.forEach(([valeur, libelle]) => {
      const pied = document.querySelector(".pied [data-" + attribut + '="' + valeur + '"]');
      const b = el("button", "puce", libelle);
      b.type = "button";
      b.setAttribute("data-" + attribut, valeur);
      b.setAttribute("aria-pressed", pied ? pied.getAttribute("aria-pressed") : "false");
      if (pied) b.addEventListener("click", () => pied.click());
      groupe.appendChild(b);
    });
    p.appendChild(groupe);
  });
  p.appendChild(lienVers("#guide/donnees", "Vos données : sauvegarde, import, effacement", "lien-discret"));
  // Synchronisation chiffrée (coffre.js), seulement si elle est en service
  const place = el("div");
  p.appendChild(place);
  blocSynchro().then(b => { if (b) place.appendChild(b); }).catch(() => {});
  const installer = boutonInstallation();
  if (installer) p.appendChild(installer);
  p.appendChild(lienVers("#guide/maitrise", "Comment votre maîtrise est calculée", "lien-discret"));
  p.appendChild(lienVers("#guide/motivation", "Comment ce site essaie de vous motiver", "lien-discret"));
}

// ===================== Accueil =====================
// Grade, maîtrise, jauge, objectif du jour ; message de rattrapage ; bilan de la semaine le premier jour de la semaine
function carteProgressionAccueil() {
  if (modeSobre()) return null;
  const { m, etat } = majMaitrise(false);
  const grade = gradeDe(etat.meilleure || 0);
  const luc = lire("lucidite", {}) || {};
  const objectif = lire("objectif", 60), auj = (luc.jours || {})[aujourdHui()] || 0;
  const carte = el("article", "carte carte-progression-v2");
  const tete = el("div", "profil-grade");
  tete.append(insigne(grade.rang, 30), el("span", null, T(grade.nom)), el("span", "grand-nombre petit", String(m.globale)));
  carte.append(el("p", "surtitre", "Votre maîtrise"), tete);
  if (grade.suivant) carte.appendChild(graphiqueJauge(T("Vers « {0} »", T(grade.suivant[1])), etat.meilleure, grade.seuil, grade.suivant[0], T("Encore {0} points de maîtrise.", grade.suivant[0] - etat.meilleure)));
  const obj = el("div", "objectif-jour");
  obj.append(anneau(auj / objectif, 44, "anneau-objectif"), el("p", null, T("Objectif du jour : {0} sur {1} points de lucidité", auj, objectif)));
  carte.appendChild(obj);
  if (luc.rattrapage && !luc.rattrapageVu) {
    carte.appendChild(el("p", "source", T("Votre progression passée vaut {0} points.", luc.rattrapage)));
    ecrire("lucidite", { ...luc, rattrapageVu: true });
  }
  const roue = el("a", "codex-mini");
  roue.href = "#profil/notions";
  const dessin = codex(120, true);
  roue.setAttribute("aria-label", dessin.getAttribute("aria-label"));
  roue.appendChild(dessin);
  carte.append(roue, lienVers("#profil", "Votre profil →", "lien-discret"));
  return carte;
}

function carteBilanSemaine() {
  if (modeSobre()) return null;
  const jour = aujourdHui();
  // Le lundi (jour 0 du calendrier UTC : 1er janvier 1970 = jeudi, donc (jour + 3) % 7 === 0 un lundi)
  if ((jour + 3) % 7 !== 0) return null;
  const jours = (lire("lucidite", {}) || {}).jours || {};
  const somme = (a, b) => Object.entries(jours).filter(([j]) => j >= a && j < b).reduce((s, [, p]) => s + p, 0);
  const cette = somme(jour - 7, jour), avant = somme(jour - 14, jour - 7);
  const sur = lire("certitudes", {}).sur || [0, 0];
  const carte = el("article", "carte");
  carte.append(el("p", "surtitre", "La semaine écoulée"),
    el("p", null, T("{0} points de lucidité ({1} la semaine d'avant).", cette, avant)),
    el("p", "source", sur[0] ? T("Quand vous êtes sûr, vous avez raison {0} fois sur 100 (depuis le début).", Math.round(100 * sur[1] / sur[0])) : T("Indiquez votre certitude au quiz pour suivre votre étalonnage.")));
  return carte;
}

// Au premier chargement après la mise à jour : la progression passée convertie une seule fois en points
function rattraperProgression() {
  const [etat, points] = rattraper(lire("lucidite", {}), donneesProgression(), aujourdHui());
  if (points || !lire("lucidite", null)) ecrire("lucidite", etat);
}

// ===================== Bilan d'une partie et du quiz =====================
// Après chaque partie : maîtrise du jeu avant et après, effet sur la maîtrise globale, ce qui ferait monter le plafond
function blocMaitriseJeu(id, avant) {
  if (modeSobre() || !MAITRISE_JEUX[id] || MAITRISE_JEUX[id][1] === "aucun") return null;
  const { m } = majMaitrise();
  const apres = m.jeux[id] ? m.jeux[id][1] : 0;
  const bloc = el("div", "maitrise-jeu");
  const ecart = apres - avant.jeu;
  bloc.appendChild(el("p", null, T("Maîtrise de ce jeu : {0} ({1})", apres, (ecart >= 0 ? "+" : "") + ecart) + " · " + T("maîtrise globale : {0}", m.globale)));
  bloc.appendChild(graphiqueBarres(T("Maîtrise de ce jeu, avant et après la partie"), [[T("Avant"), avant.jeu], [T("Après"), apres]], 1000, [500, 750],
    ecart > 0 ? T("Cette partie a fait monter votre maîtrise de ce jeu de {0} points.", ecart) : ecart < 0 ? T("Cette partie a fait baisser votre maîtrise de ce jeu de {0} points.", -ecart) : T("Cette partie n'a pas changé votre maîtrise de ce jeu.")));
  const r = resultatAtelier(id);
  const plusHaut = r && r.niveaux ? Math.max(...Object.keys(r.niveaux).map(Number)) : 0;
  if (MAITRISE_JEUX[id][1] === "note" && plusHaut && plusHaut < niveauMax(id)) bloc.appendChild(el("p", "source", T("Pour dépasser {0}, jouez au niveau {1}.", plafondNiveau(plusHaut, niveauMax(id)), plusHaut + 1)));
  return bloc;
}
function maitriseAvant(id) {
  const m = maitrises(donneesProgression(), tousLesAteliers().map(a => a.atelier.id), INDEX.size);
  return { jeu: m.jeux[id] ? m.jeux[id][1] : 0, globale: m.globale };
}

// Votre score face au hasard : la loi binomiale des scores qu'on obtiendrait en répondant au hasard
function blocFaceAuHasard(score, n, p) {
  const proba = binomiale(n, p);
  const auMoins = auMoinsAuHasard(score, n, p);
  const bloc = el("div", "face-au-hasard");
  const sur1000 = auMoins * 1000;
  const phrase = sur1000 >= 10 ? T("En répondant au hasard, on obtient {0} sur {1} ou mieux environ {2} fois sur 100.", score, n, Math.round(auMoins * 100))
    : T("En répondant au hasard, on obtient {0} sur {1} ou mieux environ {2} fois sur 1 000 ({3} %).", score, n, sur1000 < 1 ? T("moins d'une") : Math.round(sur1000), (auMoins * 100).toLocaleString(LOCALE, { maximumFractionDigits: 2 }));
  // Seuils usuels de 5 % et 1 % : en dessous, le hasard seul explique mal le score
  const message = auMoins < 0.01 ? T("Le hasard seul n'explique presque jamais un tel score.") : auMoins < 0.05 ? T("Le hasard seul explique rarement un tel score.")
    : T("Ce score reste à la portée du hasard : à lui seul, il ne prouve pas encore un savoir-faire.");
  bloc.append(graphiqueHasard(T("Votre score face au hasard : les scores qu'on obtiendrait en répondant au hasard"), proba, score, message), el("p", null, phrase));
  return bloc;
}

// ===================== Images à partager (lot 8) =====================
// Une image portrait (1 080 × 1 350) dessinée dans un canvas sur l'appareil ; partagée par navigator.share quand il
// accepte les fichiers, sinon téléchargée. Rien n'est envoyé à un serveur. Toujours en thème clair (papier et encre).
function lignesAJuster(ctx, texte, largeur) {
  const mots = String(texte).split(" "), lignes = [];
  let ligne = "";
  mots.forEach(m => { const essai = ligne ? ligne + " " + m : m; if (ctx.measureText(essai).width > largeur && ligne) { lignes.push(ligne); ligne = m; } else ligne = essai; });
  if (ligne) lignes.push(ligne);
  return lignes;
}
async function partagerImage(nomFichier, dessiner) {
  await document.fonts.ready;
  const toile = document.createElement("canvas");
  toile.width = 1080; toile.height = 1350;
  const ctx = toile.getContext("2d");
  ctx.fillStyle = "#f6f4ef"; ctx.fillRect(0, 0, 1080, 1350);
  dessiner(ctx);
  ctx.fillStyle = "#6b6862"; ctx.font = "34px -apple-system, Helvetica, Arial, sans-serif"; ctx.textAlign = "left";
  ctx.fillText("esprit-critique.github.io" + (LANGUE === "en" ? "/en/" : ""), 96, 1270);
  const blob = await new Promise(ok => toile.toBlob(ok, "image/png"));
  const fichier = new File([blob], nomFichier, { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [fichier] })) { await navigator.share({ files: [fichier] }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  const lien = el("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
  annoncer(T("Image enregistrée : {0}", nomFichier));
}
const policeTitre = taille => "700 " + taille + "px Newsreader, Georgia, serif";
const policeTexte = taille => taille + "px -apple-system, Helvetica, Arial, sans-serif";

function partagerFiche(type, fiche) {
  return partagerImage("esprit-critique-" + fiche.id + ".png", ctx => {
    ctx.fillStyle = COULEURS[fiche.categorie]; ctx.fillRect(0, 0, 28, 1350);
    ctx.fillStyle = COULEURS[fiche.categorie]; ctx.font = policeTitre(44); ctx.textAlign = "right";
    ctx.fillText((type === "biais" ? "B " : "S ") + fiche.num, 984, 150);
    ctx.textAlign = "left"; ctx.font = "650 34px Newsreader, Georgia, serif";
    ctx.fillText((TYPES[type].singulier + " · " + fiche.categorie).toUpperCase(), 96, 150);
    ctx.fillStyle = "#1c1b19"; ctx.font = policeTitre(96);
    let y = 300;
    lignesAJuster(ctx, fiche.nom, 888).forEach(l => { ctx.fillText(l, 96, y); y += 104; });
    ctx.font = "400 46px Newsreader, Georgia, serif"; y += 30;
    lignesAJuster(ctx, fiche.definition, 888).slice(0, 12).forEach(l => { ctx.fillText(l, 96, y); y += 64; });
  });
}

// Ce que montrent la fiche et l'image à partager. Les distinctions secrètes ne sont que comptées : leur nom dévoilerait
// le secret, et certaines disent une habitude (« Noctambule » : des points gagnés entre minuit et 5 heures).
function donneesFiche() {
  const { m, etat } = majMaitrise(false);
  const obtenues = new Set((lire("distinctions", {}) || {}).obtenues || []);
  const gagnees = DISTINCTIONS.filter(([id]) => obtenues.has(id));
  return { m, etat, grade: gradeDe(etat.meilleure || 0), pseudo: prenomDuJoueur(), lucidite: (lire("lucidite", {}) || {}).total || 0,
    noms: gagnees.filter(x => !x[5]).map(x => T(x[1])), secretes: gagnees.filter(x => x[5]).length, nombre: gagnees.length };
}

// Image à partager : le personnage en pied entre deux frises, le grade, la maîtrise, les points, les distinctions.
// avecPseudo : faux par défaut (le pseudo peut être un vrai nom) ; la case de la fiche l'ajoute pour cette image seulement.
function partagerGrade(avecPseudo) {
  const f = donneesFiche();
  return partagerImage("esprit-critique-personnage.png", ctx => {
    const frise = y => { ctx.save(); ctx.translate(96, y); ctx.scale(4, 4); ctx.lineWidth = 1.1; ctx.strokeStyle = FIGURE_PERSONNAGE; ctx.lineCap = "square"; ctx.stroke(new Path2D(traceMeandre(222))); ctx.restore(); };
    frise(48);
    dessinerPersonnageCanvas(ctx, f.etat, 300, 110, 480, true);
    ctx.textAlign = "center"; ctx.fillStyle = "#1c1b19";
    let y = 650;
    if (avecPseudo && f.pseudo) { ctx.font = policeTitre(64); ctx.fillText(f.pseudo, 540, y); y += 70; }
    ctx.font = policeTitre(56); ctx.fillText(T(f.grade.nom), 540, y);
    y += 150;
    ctx.font = policeTitre(120); ctx.fillText(String(f.m.globale), 300, y); ctx.fillText(String(f.lucidite), 780, y);
    ctx.font = policeTexte(32); ctx.fillStyle = "#6b6862";
    ctx.fillText(T("de maîtrise, sur 1 000"), 300, y + 48); ctx.fillText(T("points de lucidité"), 780, y + 48);
    y += 130;
    ctx.fillStyle = "#1c1b19"; ctx.font = "700 " + policeTexte(36);
    ctx.fillText(T("{0} sur {1}", pluriel(f.nombre, "distinction"), DISTINCTIONS.length), 540, y);
    ctx.font = policeTexte(32); ctx.fillStyle = "#3a3833";
    // Six noms au plus : au-delà, le nombre restant (trois lignes ne suffiraient pas, et la liste serait coupée)
    const noms = f.noms.length > 6 ? [...f.noms.slice(0, 6), T("et {0} autres", f.noms.length - 6)] : f.noms;
    const liste = [...noms, ...(f.secretes ? [pluriel(f.secretes, "secrète")] : [])].join(" · ");
    lignesAJuster(ctx, liste, 888).slice(0, 3).forEach(l => { y += 46; ctx.fillText(l, 540, y); });
    ctx.textAlign = "left"; ctx.font = "italic 30px Newsreader, Georgia, serif"; ctx.fillStyle = "#6b6862";
    ctx.fillText(T("La maîtrise mesure la réussite dans les jeux du site, pas l'intelligence."), 96, 1210);
    frise(1290);
  });
}

// Fiche à partager : une boîte de dialogue native (showModal) : Échap la ferme, le reste de la page devient inerte
// (le focus ne peut pas en sortir vers la page), le focus revient ensuite au bouton qui l'a ouverte. Un clic sur le
// fond (hors du contenu) la ferme aussi. Le fond flouté est dans style.css (::backdrop).
function ouvrirFichePersonnage(declencheur) {
  const f = donneesFiche();
  const boite = el("dialog", "fiche-personnage");
  boite.setAttribute("aria-labelledby", "titre-fiche-personnage");
  const contenu = el("div", "fiche-contenu");
  // Le focus va d'abord au contenu : un lecteur d'écran lit la fiche depuis le début
  contenu.tabIndex = -1;
  contenu.autofocus = true;
  const frise = () => {
    const s = svg("svg", { viewBox: "0 0 220 10", class: "frise-grecque", "aria-hidden": "true" });
    s.appendChild(svg("path", { d: traceMeandre(220), class: "frise-trait" }));
    return s;
  };
  const titre = el("h2", "fiche-titre", "Votre personnage");
  titre.id = "titre-fiche-personnage";
  const pseudo = el("p", "fiche-pseudo", f.pseudo);
  pseudo.hidden = true;
  const grade = el("p", "profil-grade fiche-grade");
  grade.append(insigne(f.grade.rang, 26), texteNoeud(" " + T(f.grade.nom)));
  const chiffres = el("div", "fiche-chiffres");
  [[f.m.globale, "de maîtrise, sur 1 000"], [f.lucidite, "points de lucidité"]].forEach(([n, legende]) => {
    const bloc = el("div");
    bloc.append(el("span", "fiche-nombre", String(n)), el("span", "source", legende));
    chiffres.appendChild(bloc);
  });
  contenu.append(frise(), titre, pseudo, personnage(f.etat, 240, true, true), grade, chiffres,
    el("p", "fiche-distinctions-titre", T("{0} sur {1}", pluriel(f.nombre, "distinction"), DISTINCTIONS.length)));
  if (f.noms.length) {
    const liste = el("ul", "fiche-distinctions");
    f.noms.forEach(nom => liste.appendChild(el("li", null, nom)));
    contenu.appendChild(liste);
  }
  if (f.secretes) contenu.appendChild(el("p", "source", T("Dont {0} : leur nom reste caché.", pluriel(f.secretes, "secrète"))));
  // Pseudo : masqué par défaut, sur la fiche comme sur l'image ; le choix n'est pas enregistré
  let casePseudo = null;
  if (f.pseudo) {
    const option = el("label", "fiche-option");
    casePseudo = el("input");
    casePseudo.type = "checkbox";
    casePseudo.addEventListener("change", () => { pseudo.hidden = !casePseudo.checked; });
    option.append(casePseudo, texteNoeud(" " + T("Afficher mon pseudo")));
    contenu.appendChild(option);
  }
  contenu.appendChild(el("p", "source", "La maîtrise mesure votre réussite dans les jeux de ce site, pas votre intelligence."));
  const actions = el("div", "fiche-actions");
  const partager = el("button", "bouton", "Partager l'image");
  partager.type = "button";
  partager.addEventListener("click", () => partagerGrade(!!(casePseudo && casePseudo.checked)).catch(e => annoncer(e.message)));
  const fermer = el("button", "bouton secondaire", "Fermer");
  fermer.type = "button";
  fermer.addEventListener("click", () => boite.close());
  actions.append(partager, fermer);
  contenu.append(actions, frise());
  boite.appendChild(contenu);
  // Clic sur le fond : la cible est la boîte elle-même (le contenu la remplit, sans marge intérieure)
  boite.addEventListener("click", e => { if (e.target === boite) boite.close(); });
  boite.addEventListener("close", () => {
    boite.remove();
    if (declencheur && declencheur.isConnected) declencheur.focus();
  });
  document.body.appendChild(boite);
  boite.showModal();
  animer(contenu, [{ transform: "translateY(12px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 280 });
}

// ===================== Accueil du nouveau visiteur (lot 8) =====================
// Trois écrans, en tête de l'accueil, qu'on peut passer : l'illusion, l'objectif du jour, le premier pas. Jamais
// bloquant (une carte dans la page, pas une fenêtre) ; une fois fini ou passé, il ne revient plus (profil.accueilFait).
function carteBienvenue() {
  if ((lire("profil", {}) || {}).accueilFait) return null;
  const carte = el("article", "carte carte-bienvenue");
  carte.setAttribute("aria-label", T("Bienvenue"));
  const terminer = () => { ecrire("profil", { ...(lire("profil", {}) || {}), accueilFait: true }); carte.remove(); };
  let ecran = 0;
  const dessiner = () => {
    carte.replaceChildren();
    carte.appendChild(el("p", "surtitre", T("Bienvenue · {0} sur 3", ecran + 1)));
    if (ecran === 0) {
      carte.append(el("h2", null, "Un site qui commence par vous tromper"), ouverture());
    } else if (ecran === 1) {
      carte.append(el("h2", null, "Combien de temps par jour ?"), el("p", "source", "L'objectif du jour se compte en points de lucidité : une série de quiz bien répondue en rapporte plusieurs dizaines. Vous pourrez le changer dans votre profil."));
      const puces = el("div", "puces");
      [[30, "Tranquille : 30 points"], [60, "Régulier : 60 points"], [100, "Intensif : 100 points"]].forEach(([v, texte]) => {
        const b = el("button", "puce" + (lire("objectif", 60) === v ? " active" : ""), texte);
        b.type = "button";
        b.setAttribute("aria-pressed", String(lire("objectif", 60) === v));
        b.addEventListener("click", () => { ecrire("objectif", v); ecran = 2; dessiner(); });
        puces.appendChild(b);
      });
      carte.appendChild(puces);
    } else {
      carte.append(el("h2", null, "Par où commencer ?"), el("p", "source", "« Premiers pas » fait le tour du site en trois quarts d'heure : une illusion, deux fiches, un test de réflexion, un quiz. Rien n'est verrouillé : tout reste ouvert."));
      const actions = el("div", "actions");
      const parcours = lienVers("#parcours/premiers-pas", T("Commencer : {0}", T("Premiers pas")), "bouton");
      parcours.addEventListener("click", () => { ecrire("parcours", { ...lire("parcours", {}), actif: "premiers-pas" }); terminer(); });
      const quiz = lienVers("#quiz", "Plutôt le quiz", "bouton secondaire");
      quiz.addEventListener("click", terminer);
      actions.append(parcours, quiz);
      carte.appendChild(actions);
    }
    const nav = el("div", "actions bienvenue-nav");
    if (ecran < 2) {
      const suite = el("button", "bouton secondaire", "Suivant");
      suite.type = "button";
      suite.addEventListener("click", () => { ecran++; dessiner(); carte.querySelector("h2").focus(); });
      nav.appendChild(suite);
    }
    const passer = el("button", "lien", "Passer l'accueil");
    passer.type = "button";
    passer.addEventListener("click", terminer);
    nav.appendChild(passer);
    carte.appendChild(nav);
    carte.querySelector("h2").tabIndex = -1;
  };
  dessiner();
  return carte;
}
