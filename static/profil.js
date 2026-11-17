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
  const acquises = distinctionsObtenues(d);
  const nouvelles = acquises.filter(id => !(dist.obtenues || []).includes(id));
  // Une distinction se garde, comme un grade : une série rompue ou un score qui baisse ne la reprend pas (sinon elle
  // disparaissait à l'arrivée d'une autre, avec l'équipement qu'elle débloque, puis était annoncée une seconde fois)
  const obtenues = DISTINCTIONS.map(x => x[0]).filter(id => acquises.includes(id) || (dist.obtenues || []).includes(id));
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

// Outils de tracé, purs (appelés au chargement : rien d'app.js). Nombres arrondis au dixième, pour des chemins courts.
const arrondiPersonnage = v => Math.round(v * 10) / 10;
// Feuille en amande : de la base (x, y) vers l'angle donné (degrés, 0 = droite, sens des aiguilles), pointe arrondie
function feuillePersonnage(x, y, angle, longueur, largeur) {
  const a = angle * Math.PI / 180, [ux, uy] = [Math.cos(a), Math.sin(a)], [nx, ny] = [-uy, ux];
  const [mx, my] = [x + ux * longueur * 0.5, y + uy * longueur * 0.5], [tx, ty] = [x + ux * longueur, y + uy * longueur];
  const p = (...v) => v.map(arrondiPersonnage).join(" ");
  return "M" + p(x, y) + "Q" + p(mx + nx * largeur, my + ny * largeur, tx, ty) + "Q" + p(mx - nx * largeur, my - ny * largeur, x, y) + "Z";
}
// Rangée de petits ronds (bordures de vêtements, de bouclier) : un cercle de rayon r à chaque point
const pointsPersonnage = (points, r) => points.map(([x, y]) => "M" + arrondiPersonnage(x - r) + " " + arrondiPersonnage(y) + "a" + r + " " + r + " 0 1 0 " + 2 * r + " 0a" + r + " " + r + " 0 1 0 " + -2 * r + " 0").join("");
// Points répartis sur un arc de cercle (centre, rayon, angles en degrés)
const surArcPersonnage = (cx, cy, r, de, a, n) => Array.from({ length: n }, (_, k) => { const t = (de + (a - de) * k / (n - 1)) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });

// Un calque : [genre, tracé, épaisseur, ancrage]. Genres : « plein » (silhouette), « epais » (trait noir : bras, hampes),
// « incise » (détail gravé, couleur argile). Ancrages : « tete », « main » (main droite), « corps » ; décalés par forme.
const calquePersonnage = (genre, d, epaisseur, ancrage) => [genre, d, epaisseur || 0, ancrage || ""];
// La tête est presque un cercle de centre (60.5, 21) et de rayon 9.6 : couronnes et diadèmes s'y posent
const TETE_CENTRE_PERSONNAGE = [60.5, 21, 9.6];
const BRAS_PERSONNAGE = "M71 40L77 55L84 52";
const ROBES_PERSONNAGE = {
  // Tunique courte : jambes, ourlet bordé de points, encolure, ceinture double, manche
  courte: [calquePersonnage("epais", "M55 72L53 102M67 72L70 102", 4.5), calquePersonnage("plein", "M56 36H67Q73 37 75 43L76 74H47L48 43Q50 37 56 36Z"),
    calquePersonnage("incise", "M48.5 57H75M48.5 59H75M55 61L54 69M61.5 61V69M68 61L69 69M47.3 70H75.7M57 37.6Q62 40.2 67 37.6M71.5 38Q74.5 41 74 45", 1),
    calquePersonnage("incise", pointsPersonnage(Array.from({ length: 9 }, (_, k) => [49.5 + k * 3.1, 72]), 0.55), 0.8)],
  // Robe longue : plis, ourlet à double trait et rangée de points
  longue: [calquePersonnage("plein", "M56 36H67Q73 37 75 43L78 103H45L48 43Q50 37 56 36Z"),
    calquePersonnage("incise", "M48.5 57H75.5M48.5 59H75.5M55 61L52.5 94M61.5 61V94M68 61L70.5 94M58 64L57 94M65 64L66 94M45.8 95.5H77.4M45.6 100H77.6M57 37.6Q62 40.2 67 37.6M71.5 38Q74.5 41 74 45", 1),
    calquePersonnage("incise", pointsPersonnage(Array.from({ length: 10 }, (_, k) => [48 + k * 3.2, 97.8]), 0.55), 0.8)]
};
// Pieds et lanières des sandales ; puis bras gauche et bras droit, dessinés après la robe (les avant-bras dépassent)
const PIEDS_PERSONNAGE = [calquePersonnage("plein", "M48 101H56L59 106H46ZM66 101H73L79 106H66Z"), calquePersonnage("incise", "M50.5 104.5L53 101.5M69 104.5L71.5 101.5", 0.8)];
const DRAPE_PERSONNAGE = [calquePersonnage("plein", "M50 40Q42 60 46 90L51 90Q47 62 55 42Z"),
  calquePersonnage("incise", "M50 44Q62 53 76 46M49.5 47Q62 56.5 76.5 49M49 55Q62 66 77 58", 1),
  calquePersonnage("incise", pointsPersonnage([0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(t => [(1 - t) ** 2 * 49.5 + 2 * t * (1 - t) * 62 + t * t * 76.8, (1 - t) ** 2 * 51 + 2 * t * (1 - t) * 61 + t * t * 53.5]), 0.5), 0.8)];
// Point à l'angle a (degrés) et au rayon rr autour du centre de la tête, et arc de cercle entre deux angles
const ptTetePersonnage = (a, rr) => [TETE_CENTRE_PERSONNAGE[0] + rr * Math.cos(a * Math.PI / 180), TETE_CENTRE_PERSONNAGE[1] + rr * Math.sin(a * Math.PI / 180)].map(arrondiPersonnage).join(" ");
const arcTetePersonnage = (de, a, rr) => "A" + rr + " " + rr + " 0 0 " + (a > de ? 1 : 0) + " " + ptTetePersonnage(a, rr);
// Bandeau plein qui épouse le crâne entre deux angles : la base commune des parures de tête (comme la calotte du
// casque, il fait corps avec la silhouette au lieu d'y flotter)
const bandeauTetePersonnage = (de, a, interieur, exterieur) => "M" + ptTetePersonnage(de, interieur) + arcTetePersonnage(de, a, interieur)
  + "L" + ptTetePersonnage(a, exterieur) + arcTetePersonnage(a, de, exterieur) + "Z";
// Diadème (stéphané) : un croissant plein qui s'élève au-dessus des cheveux, séparé d'eux par un seul trait gravé
const DIADEME_PERSONNAGE = (() => {
  const r = TETE_CENTRE_PERSONNAGE[2];
  return [calquePersonnage("plein", "M" + ptTetePersonnage(-158, r) + "Q" + ptTetePersonnage(-104, r + 19) + " " + ptTetePersonnage(-50, r) + arcTetePersonnage(-50, -158, r) + "Z", 0, "tete"),
    calquePersonnage("incise", "M" + ptTetePersonnage(-146, r + 2.6) + arcTetePersonnage(-146, -62, r + 2.6), 0.9, "tete")];
})();
// Couronne de laurier : un bandeau plein et des feuilles identiques, régulièrement espacées, toutes inclinées du même
// angle vers l'arrière : une rangée nette, comme sur une couronne peinte. Centre, rayon et arc réglables : la même
// couronne se pose sur la tête humaine, entre les aigrettes du hibou ou derrière les oreilles du chat.
function laurierPersonnage(cx, cy, r, de, a, n) {
  const pt = (angle, rr) => [cx + rr * Math.cos(angle * Math.PI / 180), cy + rr * Math.sin(angle * Math.PI / 180)].map(arrondiPersonnage);
  const arc = (d, f, rr) => "A" + rr + " " + rr + " 0 0 " + (f > d ? 1 : 0) + " " + pt(f, rr).join(" ");
  const feuilles = Array.from({ length: n }, (_, k) => {
    const angle = de + (a - de) * k / (n - 1), [x, y] = pt(angle, r + 1.6);
    return feuillePersonnage(x, y, angle - 62 * Math.sign(de - a), 5.2, 1.35);
  }).join("");
  const bandeau = "M" + pt(a - 4 * Math.sign(de - a), r - 0.6).join(" ") + arc(a - 4 * Math.sign(de - a), de + 4 * Math.sign(de - a), r - 0.6)
    + "L" + pt(de + 4 * Math.sign(de - a), r + 1.9).join(" ") + arc(de + 4 * Math.sign(de - a), a - 4 * Math.sign(de - a), r + 1.9) + "Z";
  return [calquePersonnage("plein", bandeau + feuilles), calquePersonnage("incise", "M" + pt(a + 2 * Math.sign(de - a), r + 0.6).join(" ") + arc(a + 2 * Math.sign(de - a), de, r + 0.6), 0.8)];
}
const LAURIER_PERSONNAGE = laurierPersonnage(...TETE_CENTRE_PERSONNAGE, -60, -168, 9).map(c => calquePersonnage(c[0], c[1], c[2], "tete"));

// Ruban plein le long d'une onde (pans des bandelettes) : de (x, y), dans la direction (dx, dy), qui s'affine vers le bout
function rubanPersonnage(x, y, dx, dy, ondulation, largeur) {
  const n = 12, l = Math.hypot(dx, dy), [nx, ny] = [-dy / l, dx / l];
  const axe = Array.from({ length: n + 1 }, (_, k) => { const t = k / n, o = ondulation * Math.sin(t * 2 * Math.PI) * t;
    return [x + dx * t + nx * o, y + dy * t + ny * o, largeur / 2 * (1 - 0.45 * t)]; });
  const bord = s => axe.map(([px, py, e]) => [px + nx * e * s, py + ny * e * s].map(arrondiPersonnage).join(" "));
  return "M" + [...bord(1), ...bord(-1).reverse()].join("L") + "Z";
}

// Costume de chaque grade : [description, robe, bras droit, drapé, calques]
const COSTUMES_PERSONNAGE = [
  ["une tunique courte", "courte", BRAS_PERSONNAGE, false, []],
  ["une tablette pour écrire", "longue", BRAS_PERSONNAGE, false, [calquePersonnage("plein", "M82 40H93V52H82Z", 0, "main"),
    calquePersonnage("incise", "M87.5 41V51M83.5 44H86.5M83.5 47H86.5M89 44H92M89 47H92", 0.9, "main"), calquePersonnage("epais", "M94.5 38L91 47", 1, "main")]],
  ["la main au menton, l'air de douter", "longue", "M71 40L79 47L72 31", false, []],
  ["une lampe à huile", "longue", BRAS_PERSONNAGE, false, [
    calquePersonnage("plein", "M80 50Q88 43 96 49Q90 54 80 50ZM95 48.5L100 46.5L100 49.5ZM100.3 46.5Q97 43 99 39.5Q99.8 41.5 100.6 41.5Q100 38.5 102 36.5Q103.5 41 102.8 43.5Q102.3 46 100.3 46.5Z", 0, "main"),
    calquePersonnage("incise", "M86 48.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0M82.5 50Q88 52.5 93.5 50", 0.8, "main")]],
  ["un rouleau", "longue", BRAS_PERSONNAGE, false, [calquePersonnage("plein", "M81 47H97V54H81ZM79.5 46.5h3v8h-3zM95.5 46.5h3v8h-3z", 0, "main"),
    calquePersonnage("incise", "M84.5 49.5H93M84.5 52H91", 0.8, "main")]],
  ["un casque, une lance et un bouclier", "courte", BRAS_PERSONNAGE, false, [
    calquePersonnage("epais", "M86.6 14L82.5 106", 2, "main"), calquePersonnage("plein", feuillePersonnage(86.6, 14.5, -88, 12, 2.2) + feuillePersonnage(82.4, 105, 92, 4, 1), 0, "main"),
    calquePersonnage("incise", "M86.8 13.5L87.1 5", 0.6, "main"),
    // Casque corinthien : cimier en crinière, calotte, garde-joue et ouverture de l'œil gravés
    calquePersonnage("plein", "M49 23Q45 6 61 3.5Q72 2.5 75 9Q67 6.5 61 8.5Q53 11.5 53.5 21ZM52 18Q51.5 10.5 60 9.8Q68.5 9.5 70 16L70.5 21H53Z", 0, "tete"),
    calquePersonnage("incise", "M53 16.5Q61 13.5 70 16.5M64.5 19.5Q62.5 25.5 64.5 31M65 18.5H69M51.5 14Q57 6 66 5.5M53 10.5Q60 4.5 70 6", 0.9, "tete"),
    calquePersonnage("plein", "M33 62a14 14 0 1 0 28 0a14 14 0 1 0-28 0", 0, "corps"),
    calquePersonnage("incise", "M35.5 62a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0-23 0M43 62a4 4 0 1 0 8 0a4 4 0 1 0-8 0", 1, "corps"),
    calquePersonnage("incise", pointsPersonnage(surArcPersonnage(47, 62, 8, 0, 337.5, 16), 0.5), 0.8, "corps")]],
  ["un manteau drapé et un bâton", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M87 30L80 108", 2.2, "main"),
    calquePersonnage("plein", "M85.6 28.5Q87.5 25 90 26.5Q88.5 27.5 88.5 30Z", 0, "main")]],
  ["une lyre", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M81.5 54Q75 44 81 35M90.5 54Q97 44 91 35M79.5 37H92.5", 2, "main"),
    calquePersonnage("epais", "M84 37V55M86 37V55M88 37V55", 0.7, "main"), calquePersonnage("plein", "M79 54H93L92 59Q86 64 80 59Z", 0, "main"),
    calquePersonnage("incise", "M81.5 57.5Q86 61 90.5 57.5", 0.8, "main")]],
  ["un sceptre et un diadème", "longue", BRAS_PERSONNAGE, true, [calquePersonnage("epais", "M86 26L81 108", 2.2, "main"),
    // Sceptre à fleur de lotus : un bouton et deux pétales
    calquePersonnage("plein", "M86.3 26Q82.5 23 83.3 19Q85 21.5 86.4 21Q87.8 21.5 89.5 19Q90.2 23 86.3 26ZM85.2 20.5Q85 16.5 86.8 14.5Q88.3 16.5 87.7 20.5Z", 0, "main"),
    ...DIADEME_PERSONNAGE]],
  ["un flambeau et un diadème", "longue", "M71 40L79 37L83.5 31", true, [calquePersonnage("epais", "M82.5 34L86.8 22", 3.4, "main"),
    // Coupe du flambeau et flamme à trois langues (assez basse pour rester dans le buste)
    calquePersonnage("plein", "M83.5 23.5L90 25L90.5 21.5L84.5 20ZM87.2 21Q82.8 18 85 13Q86 15.5 87.5 16Q86.8 12 89.5 9.5Q90.3 13.5 92 15Q92.6 19.5 87.2 21Z", 0, "main"),
    ...DIADEME_PERSONNAGE]]
];

// Têtes de profil. La tête humaine change de coiffure selon le genre ; oreille et mèches gravées.
const TETE_HUMAINE = "M57 37V34C52 30 51 21 55 15C59 10 66 10 68 15L69 19L72.5 23.5L69.5 24.5L70 26.5L69 27.5L69.5 30C67 32.5 65 32.5 63.5 32L63.5 37Z";
const OEIL_PERSONNAGE = calquePersonnage("incise", "M64.9 19.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0", 0.9);
// Cheveux : une masse pleine un peu plus grosse que le crâne (comme la calotte du casque), et un seul trait gravé, la
// limite des cheveux, qui passe derrière l'œil et la tempe : rien ne traverse le visage
const CHEVEUX_PERSONNAGE = [calquePersonnage("plein", "M67.8 14.5Q66 9.2 59.5 9.4Q51.5 10 50.8 19Q50.6 27 55.5 31.5L57.5 29Q60.5 23 60.8 19Q61.3 15.5 67.8 14.5Z"),
  calquePersonnage("incise", "M67.4 14.6Q61.6 15.5 60.9 19.2Q60.6 23.4 57.3 29", 0.9)];
// Formes : [id, nom, distinction qui la débloque (null : d'emblée), calques propres, porte robe et costume,
//   décalage des ancrages { tete, main, corps } par rapport à l'humain, cadrages { buste, pied } : [x, y, côté]]
const FORMES_PERSONNAGE = [
  ["humain", "Humain", null, [calquePersonnage("plein", TETE_HUMAINE), OEIL_PERSONNAGE], true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }],
  // La chouette d'Athéna, motif des vases et des monnaies : pas de robe, l'objet tenu au bout de l'aile
  ["hibou", "Hibou", "bien-etalonne", [
    calquePersonnage("plein", "M60 30C75 30 80 46 80 64C80 86 72 102 60 104C48 102 40 86 40 64C40 46 45 30 60 30ZM45 35L43 25L53 31ZM75 35L77 25L67 31Z"),
    calquePersonnage("epais", "M53 103L50 108M55 103V108M65 103V108M67 103L70 108", 1.6),
    calquePersonnage("incise", "M47 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0M63 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0M51 44a1 1 0 1 0 2 0a1 1 0 1 0-2 0M67 44a1 1 0 1 0 2 0a1 1 0 1 0-2 0M58 50L60 55L62 50"
      + "M45.5 37Q52 34.5 58 39M74.5 37Q68 34.5 62 39M43 56Q47 80 54 93M77 56Q73 80 66 93M46 60Q49 76 54 86M74 60Q71 76 66 86"
      + "M51 68l4.5 3.5 4.5-3.5 4.5 3.5 4.5-3.5M51 77l4.5 3.5 4.5-3.5 4.5 3.5 4.5-3.5M53 86l3.5 3 3.5-3 3.5 3 3.5-3", 1),
    calquePersonnage("incise", pointsPersonnage([[55, 62], [60, 61], [65, 62]], 0.6), 0.8)],
    false, { tete: [-0.5, 19], main: [-1, 21], corps: [-1.5, 20] }, { buste: [30, 20, 72], pied: [4, 6, 112] }],
  ["chat", "Chat", "oreille-fine", [
    calquePersonnage("epais", "M47 97Q34 95 38 80Q41 72 36 68", 3),
    calquePersonnage("plein", "M57 37V35C52 31 51 22 55 16L54 7L60.5 12.5Q63 11.5 65.5 12.5L68 6L68.5 15.5C71 18 73 21 73 24L70 26.5C68 30 65 32 63.5 32.5L63.5 37Z"),
    calquePersonnage("epais", "M71 24.5L80 22M71 25.5L80 26.5M70.5 26.5L78 30", 0.7),
    calquePersonnage("incise", "M64 19Q66 17.5 68 19Q66 20.5 64 19ZM56 11L58.5 14M66.6 9.5L66.3 13.5M56 22Q58 24 57 27M58.5 21Q60.5 23.5 59.5 26.5", 0.9)],
    true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }],
  // Un automate de bronze, comme ceux que décrivent les mythes grecs : rivets et plaques gravés
  ["robot", "Robot", "bayesien", [
    calquePersonnage("epais", "M62 11V5", 1.5), calquePersonnage("plein", "M53 11H71V31H66V37H58V31H53ZM59.8 4a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0"),
    calquePersonnage("incise", "M64 17H69V21H64ZM64 26H69M64.5 28H68.5M55 21a2 2 0 1 0 4 0a2 2 0 1 0-4 0M53.5 14H70.5M58.5 33.5H65.5", 0.9),
    calquePersonnage("incise", pointsPersonnage([[55, 12.5], [69, 12.5], [55, 29.5], [69, 29.5]], 0.5), 0.8)],
    true, {}, { buste: [38, 0, 62], pied: [4, -4, 112] }]
];
const GENRES_PERSONNAGE = [["neutre", "Neutre", CHEVEUX_PERSONNAGE],
  // Féminin : les cheveux et un chignon (krobylos) à l'arrière, séparé d'eux par un trait
  ["feminin", "Féminin", [...CHEVEUX_PERSONNAGE, calquePersonnage("plein", "M45.6 17.5a5 5 0 1 0 10 0a5 5 0 1 0-10 0"),
    calquePersonnage("incise", "M52.6 12.9Q55.3 17.5 52.6 22.1", 0.9)]],
  // Masculin : les cheveux et une barbe en pointe, deux traits gravés
  ["masculin", "Masculin", [...CHEVEUX_PERSONNAGE, calquePersonnage("plein", "M63 27L69.5 28.5L71 33Q67 36 62 33Z"),
    calquePersonnage("incise", "M65 30L65.8 33.6M67.4 30.3L68 33.4", 0.8)]]];
// Équipements : [id, nom, distinction, calques, variantes par forme, coiffe ?]. Des objets des vases grecs, qui dépassent
// de la silhouette (rubans, cape, feuilles) ou s'y gravent (collier) : un objet noir posé sur du noir ne se verrait pas.
// Les identifiants sont ceux des anciens équipements (écharpe, plume, médaille, novembre 2026) : les choix enregistrés
// restent valables. Une coiffe ne se dessine pas sous le casque du stratège et remplace le diadème des deux derniers grades.
const BANDELETTES_PERSONNAGE = (nx, ny, bande) => [calquePersonnage("plein", rubanPersonnage(nx, ny, -11, 12, 1.6, 2.4) + rubanPersonnage(nx, ny, -5, 16, -1.4, 2.2)),
  ...(bande ? [calquePersonnage("incise", bande, 1)] : [])];
// Collier : des perles sur une courbe (de, creux, à), et trois pendeloques gravées au milieu
function collierPersonnage([x0, y0], [xc, yc], [x1, y1]) {
  const sur = t => [(1 - t) ** 2 * x0 + 2 * t * (1 - t) * xc + t * t * x1, (1 - t) ** 2 * y0 + 2 * t * (1 - t) * yc + t * t * y1];
  const perles = Array.from({ length: 11 }, (_, k) => sur(k / 10));
  const pendeloques = [0.3, 0.5, 0.7].map(t => { const [x, y] = sur(t); return [x, y + 2.4]; });
  return [calquePersonnage("incise", "M" + [x0, y0].join(" ") + "Q" + [xc, yc, x1, y1].join(" ") + [0.3, 0.5, 0.7].map(t => { const [x, y] = sur(t); return "M" + arrondiPersonnage(x) + " " + arrondiPersonnage(y) + "V" + arrondiPersonnage(y + 1.6); }).join(""), 0.6),
    calquePersonnage("incise", pointsPersonnage(perles, 0.7) + pointsPersonnage(pendeloques, 0.85), 0.8)];
}
const EQUIPEMENTS_PERSONNAGE = [
  ["", "Aucun", null, []],
  // Bandelettes du vainqueur (ténia) : le bandeau gravé dans les cheveux, noué derrière la tête, deux pans qui flottent
  ["echarpe", "Les bandelettes du vainqueur", "assidu", BANDELETTES_PERSONNAGE(51.6, 18.4, "M" + ptTetePersonnage(198, 7.6) + arcTetePersonnage(198, 305, 7.6)).map(c => calquePersonnage(c[0], c[1], c[2], "tete")), {
    // Sur le carré du robot, le bandeau gravé existe déjà (sa ligne haute) ; sur le hibou, les pans partent de l'aigrette
    robot: BANDELETTES_PERSONNAGE(53, 15.5, ""), hibou: BANDELETTES_PERSONNAGE(45.5, 33, "")
  }, false],
  // Chlamyde : la courte cape des éphèbes et d'Hermès, agrafée sur l'épaule, qui flotte derrière le dos
  ["plume", "Une chlamyde", "fourchettes", [
    // Elle vole à l'horizontale derrière la nuque, ourlet en dents de scie : assez haute pour rester dans le médaillon
    // du buste (plus bas, le cercle la coupait)
    calquePersonnage("plein", "M57 35.2Q51 33 44.4 32.6L42.4 35.2L44.6 37L42.2 39.6L44.8 41.4L42.8 44.4L48 45.6Q50.4 38.8 57 38.6Z", 0, "corps"),
    calquePersonnage("incise", "M46.2 35.2Q50.6 35.4 54 36.6M46.4 39.6Q49 39.2 51.4 39.2M46.4 43Q47.6 41.8 49.2 41.2", 0.9, "corps"),
    calquePersonnage("incise", "M55.4 37a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0", 0.9, "corps")], {
    // Le hibou n'a pas d'épaules : la cape part du flanc, sous l'aigrette (plus haut, elle passait pour une troisième oreille)
    hibou: [calquePersonnage("plein", "M45.4 39Q38.4 41 34.4 46L31.6 48.6L33.8 50.8L31.4 53.6L34 55.6L31.8 58.8L37.2 60.4L41.2 47.4Q42.6 42.4 46.4 41.6Z"),
      calquePersonnage("incise", "M35.6 48.2Q38 47.2 40.4 47.4M35.4 53Q37.6 52.6 39.6 53.2M36.2 57.6Q37.8 57.4 39.2 57.8", 0.9)]
  }, false],
  // Collier à pendeloques, gravé sous l'encolure (sous le bec, pour le hibou)
  ["medaille", "Un collier à pendeloques", "polyvalent", collierPersonnage([55.4, 39.4], [62, 46], [68.6, 39.4]).map(c => calquePersonnage(c[0], c[1], c[2], "corps")), {
    hibou: collierPersonnage([47.5, 50], [60, 63], [72.5, 50])
  }, false],
  ["laurier", "Une couronne de laurier", "specialiste", LAURIER_PERSONNAGE, {
    // Entre les deux aigrettes, au sommet de la tête ; derrière les oreilles du chat ; en rangée sur le carré du robot
    hibou: laurierPersonnage(60, 44, 13.6, -40, -140, 9),
    chat: laurierPersonnage(...TETE_CENTRE_PERSONNAGE, -132, -214, 6),
    robot: [calquePersonnage("plein", "M52.5 9.4H71.5V11.6H52.5Z" + [54, 57, 66, 69].map(x => feuillePersonnage(x, 9.6, -128, 5.2, 1.35)).join("") + [55.5, 67.5].map(x => feuillePersonnage(x, 9.6, -60, 4.4, 1.2)).join(""))]
  }, true]
];
// Exergue : la bande noire sous les pieds, comme au fond des coupes peintes (cadrage en pied), bordée de points
const EXERGUE_PERSONNAGE = [calquePersonnage("plein", "M-20 108H140V160H-20Z"), calquePersonnage("incise", "M-20 110H140", 0.8),
  calquePersonnage("incise", pointsPersonnage(Array.from({ length: 30 }, (_, k) => [-14 + k * 5.4, 113]), 0.6), 0.8)];

// ===================== Fonds du médaillon =====================
// Décors de vase derrière la figure, dans le repère du médaillon (centre 60, 60 ; rayon r) : le même fond pour le buste
// et le personnage en pied. Bordures (frise, vagues) en noir, comme sur les vases ; motifs du champ en argile sombre,
// plus discrets, pour que la silhouette noire reste lisible. Chaque fond rend [[« noir » | « sombre », plein ?, tracé]].
const ptMedaillonPersonnage = (a, rr) => [60 + rr * Math.cos(a), 60 + rr * Math.sin(a)].map(arrondiPersonnage).join(" ");
const cerclePersonnage = rr => "M" + arrondiPersonnage(60 - rr) + " 60a" + rr + " " + rr + " 0 1 0 " + 2 * rr + " 0a" + rr + " " + rr + " 0 1 0 " + -2 * rr + " 0";
// Frise posée sur un anneau : chaque motif, dessiné dans une case de 10 de large (u) sur 10 de haut (v, vers le centre),
// est enroulé autour du cercle de rayon r ; un tracé par motif, n motifs sur le tour
function anneauMotifsPersonnage(r, hauteur, motif, n) {
  return Array.from({ length: n }, (_, i) => motif.map(ligne => "M" + ligne.map(([u, v]) =>
    ptMedaillonPersonnage(-Math.PI / 2 + 2 * Math.PI * (i + u / 10) / n, r - v * hauteur / 10)).join("L")).join("")).join("");
}
// Une vague (« chien courant ») : le trait part du bas de la case, monte en crête puis s'enroule en spirale ; la case
// suivante reprend au bas, ce qui donne la frise continue des vases
const VAGUE_MOTIF = [[
  ...[0, 0.25, 0.5, 0.75, 1].map(t => [t * 5.5, 10 - 8.5 * Math.sin(t * Math.PI / 2)]),
  ...Array.from({ length: 18 }, (_, k) => {
    const t = (k + 1) / 18, angle = -Math.PI / 2 + t * Math.PI * 1.75, rayon = 3.4 - 2.2 * t;
    return [5.5 + rayon * Math.cos(angle), 4.9 + rayon * Math.sin(angle)];
  })
]];
const MEANDRE_MOTIF = [[[1, 8.6], [1, 1.6], [8, 1.6], [8, 6.6], [4.4, 6.6], [4.4, 4.2]]];

// Fonds : [id, nom, ce qui le débloque (null : d'emblée ; un nombre : ce grade ; un texte : cette distinction), dessin]
const FONDS_PERSONNAGE = [
  ["", "Argile nue", null, () => []],
  // Les frises font une bordure : 5e élément, sa largeur. La figure tient dans le disque intérieur, sans passer dessus
  ["meandre", "Frise grecque", 1, r => [["noir", false, cerclePersonnage(r - 2.5) + cerclePersonnage(r - 11.5) + anneauMotifsPersonnage(r - 2.5, 9, MEANDRE_MOTIF, Math.round(2 * Math.PI * (r - 7) / 9))]], 11.5],
  ["vagues", "Les vagues", 3, r => [["noir", false, cerclePersonnage(r - 2.5) + anneauMotifsPersonnage(r - 3, 9, VAGUE_MOTIF, Math.round(2 * Math.PI * (r - 7) / 10)) + cerclePersonnage(r - 12.5)]], 12.5],
  // Deux rameaux d'olivier qui remontent le long du bord, feuilles alternées et quelques olives
  ["olivier", "Rameaux d'olivier", "regulier", r => {
    const rr = r - 9, rameau = (de, a) => {
      const n = 9, tige = "M" + ptMedaillonPersonnage(de, rr) + "A" + rr + " " + rr + " 0 0 " + (a > de ? 1 : 0) + " " + ptMedaillonPersonnage(a, rr);
      let feuilles = "", olives = "";
      for (let k = 1; k < n; k++) {
        const t = de + (a - de) * k / n, [x, y] = ptMedaillonPersonnage(t, rr).split(" ").map(Number);
        const tangente = (t + (a > de ? 1 : -1) * Math.PI / 2) * 180 / Math.PI;
        feuilles += feuillePersonnage(x, y, tangente + (k % 2 ? 40 : -40), 7, 1.7);
        if (k % 3 === 1) olives += "M" + ptMedaillonPersonnage(t + (a > de ? 0.05 : -0.05), rr + (k % 2 ? 3.5 : -3.5)) + "a1.4 1.4 0 1 0 0.1 0Z";
      }
      return [["sombre", false, tige], ["sombre", true, feuilles + olives]];
    };
    return [...rameau(Math.PI * 0.62, Math.PI * 1.22), ...rameau(Math.PI * 0.38, -Math.PI * 0.22)];
  }],
  // Ciel de nuit : étoiles à quatre branches et un croissant de lune
  ["etoiles", "Ciel étoilé", "explorateur", r => {
    const etoile = (x, y, t) => "M" + x + " " + (y - t) + "L" + (x + t / 4) + " " + (y - t / 4) + "L" + (x + t) + " " + y + "L" + (x + t / 4) + " " + (y + t / 4)
      + "L" + x + " " + (y + t) + "L" + (x - t / 4) + " " + (y + t / 4) + "L" + (x - t) + " " + y + "L" + (x - t / 4) + " " + (y - t / 4) + "Z";
    const k = r / 49, places = [[24, 34, 3.4], [36, 20, 2.2], [88, 22, 3], [98, 40, 2], [20, 62, 2.2], [100, 70, 3.2], [84, 92, 2.2], [30, 88, 2.6], [70, 12, 1.8], [52, 104, 1.8]];
    const etoiles = places.map(([x, y, t]) => etoile(arrondiPersonnage(60 + (x - 60) * k), arrondiPersonnage(60 + (y - 60) * k), t)).join("");
    // Croissant en haut à gauche : un disque dont on retire un disque décalé
    const [lx, ly] = ptMedaillonPersonnage(-2.3, r - 15).split(" ").map(Number);
    const lune = "M" + (lx + 2) + " " + (ly - 6.6) + "A7 7 0 1 0 " + (lx + 2) + " " + (ly + 6.6) + "A5.6 5.6 0 1 1 " + (lx + 2) + " " + (ly - 6.6) + "Z";
    return [["clair", true, etoiles + lune]];
  }],
  // Le temple : deux colonnes doriques cannelées et l'architrave, de part et d'autre de la figure
  ["colonnes", "Le temple", 6, r => {
    const colonne = x => "M" + (x - 5) + " 34H" + (x + 5) + "V110H" + (x - 5) + "ZM" + (x - 8) + " 28H" + (x + 8) + "V31Q" + x + " 36 " + (x - 8) + " 31ZM" + (x - 8) + " 110H" + (x + 8) + "V114H" + (x - 8) + "Z";
    const cannelures = x => "M" + (x - 2.5) + " 37V108M" + x + " 37V108M" + (x + 2.5) + " 37V108";
    const g = 60 - r + 13, d = 60 + r - 13;
    return [["sombre", true, colonne(g) + colonne(d) + "M0 18H120V25H0Z"], ["noir", false, cannelures(g) + cannelures(d) + "M0 21.5H120"]];
  }],
  // Rayons d'Hélios : un soleil qui rayonne derrière la figure
  ["rayons", "Rayons d'Hélios", "grand-test", r => {
    const n = 18;
    return [["sombre", true, Array.from({ length: n }, (_, i) => {
      const a = 2 * Math.PI * i / n, l = Math.PI / n * 0.55;
      return "M60 60L" + ptMedaillonPersonnage(a - l, r + 2) + "L" + ptMedaillonPersonnage(a + l, r + 2) + "Z";
    }).join("")]];
  }]
];
// Couleurs des motifs « sombres » (argile plus cuite) et « clairs » (engobe, pour les astres), les mêmes sur le canvas
// et dans la page (--motif et --motif-clair dans style.css)
const MOTIF_PERSONNAGE = "#a4532b", MOTIF_CLAIR_PERSONNAGE = "#f2c39a";

// Débloqué ? null : toujours ; un nombre : grade atteint ; un texte : distinction obtenue
const debloquePersonnage = (condition, obtenues, rang) => condition === null || (typeof condition === "number" ? rang >= condition : obtenues.has(condition));
// Ce qui manque, en clair : « grade Détective » ou le nom de la distinction
const conditionPersonnage = condition => typeof condition === "number" ? T("grade {0}", T(GRADES[condition][1])) : T((DISTINCTIONS.find(x => x[0] === condition) || [, condition])[1]);

// Choix enregistré, ramené aux valeurs permises et débloquées (une donnée importée ou une distinction perdue ne casse rien)
function choixPersonnage() {
  const c = ((lire("profil", {}) || {}).personnage) || {};
  const obtenues = new Set(((lire("distinctions", {}) || {}).obtenues) || []);
  const rang = gradeDe(((lire("maitrise", {}) || {}).meilleure) || 0).rang;
  const permis = (liste, id) => { const x = liste.find(e => e[0] === id); return x && debloquePersonnage(x[2], obtenues, rang) ? x : liste[0]; };
  return { forme: permis(FORMES_PERSONNAGE, c.forme), genre: GENRES_PERSONNAGE.find(g => g[0] === c.genre) || GENRES_PERSONNAGE[0],
    equipement: permis(EQUIPEMENTS_PERSONNAGE, c.equipement), fond: permis(FONDS_PERSONNAGE, c.fond), obtenues, rang };
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
  const { forme, genre, equipement, fond } = etat ? choixPersonnage() : { forme: FORMES_PERSONNAGE[0], genre: GENRES_PERSONNAGE[0], equipement: EQUIPEMENTS_PERSONNAGE[0], fond: FONDS_PERSONNAGE[0] };
  const [, nomForme, , calquesForme, habille, decalages, cadrages] = forme;
  const [role, robe, bras, drape, calquesRole] = COSTUMES_PERSONNAGE[rang];
  const tenant = calquesRole.some(c => c[3] === "main");
  // Ordre de peinture : le drapé derrière, la robe, la tête, les bras, puis les accessoires (le bouclier devant tout)
  const calques = [];
  if (pied) calques.push(...EXERGUE_PERSONNAGE);
  if (habille) {
    if (drape) calques.push(...DRAPE_PERSONNAGE);
    calques.push(...ROBES_PERSONNAGE[robe], ...PIEDS_PERSONNAGE);
    calques.push(...calquesForme);
    // Sous le casque du stratège, les cheveux ne se voient pas (leur trait gravé passerait sur la joue) ; la barbe, si
    if (forme[0] === "humain") calques.push(...genre[2].filter(c => rang !== 5 || !CHEVEUX_PERSONNAGE.includes(c)));
    calques.push(calquePersonnage("epais", "M52 40L47 55L50 66", 5), calquePersonnage("epais", bras, 5));
  } else {
    calques.push(...calquesForme);
    // Sans bras (hibou) : le bout de l'aile tendu vers l'objet tenu, ses pennes gravées
    if (tenant) calques.push(calquePersonnage("plein", "M76.5 57Q85 63 87 73L83 74.5Q80 67 75 64Z"), calquePersonnage("incise", "M78.5 62L81 60.5M80.5 65.5L83.5 64M82 69L85 68", 0.8));
  }
  // Le casque remplace la coiffure : il est dessiné par-dessus, les autres accessoires de tête aussi. Une coiffe
  // (laurier) ne se pose pas sur le casque, et prend la place du diadème : deux couronnes l'une sur l'autre se brouillent
  const coiffe = !!equipement[5], casque = rang === 5;
  const calquesEquipement = coiffe && casque ? [] : ((equipement[4] || {})[forme[0]] || equipement[3]);
  calques.push(...(coiffe ? calquesRole.filter(c => !DIADEME_PERSONNAGE.includes(c)) : calquesRole), ...calquesEquipement);
  const traits = calques.map(([g, d, e, ancrage]) => [g, d, e, ...((ancrage && decalages[ancrage]) || [0, 0])]);
  // Cadrage : le carré choisi de la grille de la figure remplit le médaillon ; le buste va jusqu'à la main droite, pour
  // que l'objet du rôle reste visible (le buste un peu plus que le pied)
  const [x0, y0, cote] = cadrages[pied ? "pied" : "buste"];
  const interieur = rayon - (fond[4] || 0);
  const echelle = 2 * interieur * (pied ? 0.94 : 1) / cote;
  const cadrage = [60 - echelle * (x0 + cote / 2), 60 - echelle * (y0 + cote / 2) + (pied ? 0 : 4 * interieur / rayon), echelle];
  // Le laurier à la place du diadème : la description ne parle plus du diadème
  const sansDiademe = coiffe && calquesRole.some(c => DIADEME_PERSONNAGE.includes(c));
  const elements = [T(sansDiademe ? ({ "un sceptre et un diadème": "un sceptre", "un flambeau et un diadème": "un flambeau" })[role] || role : role), ...(calquesEquipement.length ? [T(equipement[1]).toLowerCase()] : []), ...(fond[0] ? [T("fond : {0}", T(fond[1]).toLowerCase())] : []), ...(objet ? [T("l'emblème de son meilleur domaine, {0} : {1}", T(DOMAINES.find(([d]) => d === fort)[1]), T(objet[1]))] : [])];
  const description = T("Votre personnage ({0}), grade {1}", T(nomForme).toLowerCase(), T(GRADES[rang][1])) + " : " + elements.join(", ") + ". "
    + T("Maîtrise par domaine : {0}.", DOMAINES.map(([, nom], i) => T(nom) + " " + valeurs[i][1]).join(", "));
  return { couleur: objet ? objet[0] : null, objet, valeurs, traits, cadrage, description, fond: fond[3](rayon), interieur: fond[4] ? interieur : null };
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
    // Écart de 200, plus long que le tracé : avec « 100 », un tiret revenait à la fin de l'arc, et un domaine presque
    // vide montrait deux pastilles (bouts ronds), une à chaque extrémité
    const arc = svg("path", { d: d0, pathLength: 100, class: "portrait-arc", "stroke-dasharray": Math.round(Math.min(1000, v) / 10) + " 200" });
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
  // Fond à bordure : la figure est rognée au disque intérieur (le buste s'arrête sur la frise, pas dessous)
  let support = cadre;
  if (p.interieur) {
    const masqueInterieur = svg("clipPath", { id: id + "-interieur" });
    masqueInterieur.appendChild(svg("circle", { cx: 60, cy: 60, r: p.interieur }));
    support = svg("g", { "clip-path": "url(#" + id + "-interieur)" });
    s.appendChild(masqueInterieur);
  }
  const figure = svg("g", { transform: "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ") scale(" + k.toFixed(4) + ")" });
  p.traits.forEach(([g, d, e, dx, dy]) => figure.appendChild(svg("path", { d, class: "figure-" + g, ...(e ? { "stroke-width": e } : {}),
    ...(dx || dy ? { transform: "translate(" + dx + " " + dy + ")" } : {}) })));
  // Le fond, derrière la figure, dans le repère du médaillon
  p.fond.forEach(([teinte, plein, d]) => cadre.appendChild(svg("path", { d, class: "motif-" + teinte + (plein ? " motif-plein" : "") })));
  support.appendChild(figure);
  if (support !== cadre) cadre.appendChild(support);
  // Bord du médaillon et filet intérieur, comme le cadre d'un médaillon de coupe
  s.append(cadre, svg("circle", { cx: 60, cy: 60, r: rayon - 2.6, class: "medaillon-filet" }), svg("circle", { cx: 60, cy: 60, r: rayon, class: "medaillon-bord" }));
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
  p.fond.forEach(([teinte, plein, d]) => {
    const couleur = { noir: FIGURE_PERSONNAGE, sombre: MOTIF_PERSONNAGE, clair: MOTIF_CLAIR_PERSONNAGE }[teinte], chemin = new Path2D(d);
    if (plein) { ctx.fillStyle = couleur; ctx.fill(chemin); } else { ctx.strokeStyle = couleur; ctx.lineWidth = 1.2; ctx.stroke(chemin); }
  });
  if (p.interieur) { ctx.beginPath(); ctx.arc(60, 60, p.interieur, 0, 2 * Math.PI); ctx.clip(); }
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
  ctx.beginPath(); ctx.arc(60, 60, rayon - 2.6, 0, 2 * Math.PI); ctx.lineWidth = 0.6; ctx.strokeStyle = FIGURE_PERSONNAGE; ctx.stroke();
  ctx.beginPath(); ctx.arc(60, 60, rayon, 0, 2 * Math.PI); ctx.lineWidth = 1.5; ctx.stroke();
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
const PHRASES_RETOUR = ["Tiens, un revenant. {0} jours sans nous voir : vos révisions ont gardé votre place au chaud.",
  "{0} jours d'absence : l'oubli a fait son travail, à vous de défaire le sien.",
  "Vous revoilà, après {0} jours. Vos notions vous attendaient, sagement rangées."];
const PHRASES_RETOUR_SANS_REVISION = ["Vous revoilà, après {0} jours. Heureux hasard, ou décision éclairée ?",
  "{0} jours sans nous voir. Les biais, eux, n'ont pas pris de vacances.",
  "Quel plaisir de vous revoir après {0} jours. On reprend où vous en étiez ?"];
const PHRASES_OBJECTIF = ["Objectif du jour dans la poche. Tout ce qui suit, c'est pour le plaisir.",
  "Objectif atteint. Votre cortex mérite une ovation (modérée : on reste critiques).",
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
  // Un titre ne prend pas de point final (DESIGN.md, « Textes »)
  const titre = nom ? T("{0}, {1}", formule, nom) : formule;
  // Situation : du plus utile au plus général
  const activite = lire("activite", []), avant = activite.filter(j => j < jour);
  const absence = avant.length ? jour - avant[avant.length - 1] : 0;
  const luc = (lire("lucidite", {}) || {}).jours || {};
  const aReviser = clesAReviser().length, serie = serieDeJours();
  const etape = typeof prochaineEtape === "function" ? prochaineEtape() : null;
  let phrase;
  if (mois === 4 && date === 1) phrase = T("Premier avril : aujourd'hui plus que jamais, vérifiez avant de croire. (Celle-là, elle est vraie.)");
  else if (nouveau) phrase = T("Ici, on apprend à se tromper moins, en commençant par se tromper un peu.");
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
let ongletProfilAFocaliser = false;

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
    // Changer d'onglet garde la page où elle est (app.js) ; le focus revient sur l'onglet, recréé par l'affichage
    b.addEventListener("click", () => { ongletProfilAFocaliser = true; location.replace("#profil/" + id); });
    if (ongletProfilAFocaliser && id === ongletProfil) { ongletProfilAFocaliser = false; requestAnimationFrame(() => b.focus({ preventScroll: true })); }
    onglets.appendChild(b);
  });
  zone.appendChild(onglets);
  // Sur téléphone, les onglets défilent sur une ligne : l'onglet ouvert est ramené dans la vue, et l'estompe du bord
  // droit disparaît quand on arrive au bout
  const auBout = () => onglets.classList.toggle("au-bout", onglets.scrollLeft + onglets.clientWidth >= onglets.scrollWidth - 2);
  onglets.addEventListener("scroll", auBout, { passive: true });
  requestAnimationFrame(() => {
    const ouvert = onglets.querySelector('[aria-selected="true"]');
    if (ouvert && onglets.scrollWidth > onglets.clientWidth) {
      const gauche = ouvert.getBoundingClientRect().left - onglets.getBoundingClientRect().left + onglets.scrollLeft;
      onglets.scrollLeft = gauche - (onglets.clientWidth - ouvert.offsetWidth) / 2;
    }
    auBout();
  });
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
  return T(tousLesAteliers().find(a => a.atelier.id === jeux[0][0]).atelier.titre);
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
  // Rien de mesuré : quatre graphiques vides ne disent rien ; un seul état vide, et l'action qui les remplira (DESIGN.md)
  if (!(etat.meilleure > 0) && !((lire("lucidite", {}) || {}).total > 0)) {
    p.append(dessinVide(), el("h3", "titre-section", "Pas encore de mesure"),
      el("p", null, "Une partie d'un atelier ou du quiz suffit : votre courbe de maîtrise, vos six domaines et votre calendrier d'entraînement apparaîtront ici."),
      lienVers("#ateliers", "Choisir un atelier", "bouton"));
    return;
  }
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
    p.appendChild(graphiqueBarres(T("{0} : maîtrise de chaque jeu (repères 500 et 750 : plafonds des niveaux 1 et 2 d'un atelier à trois niveaux)", T(section.titre)), lignes, 1000, [500, 750], messageJeuxSection(lignes)));
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
    // Zone de toucher : tout l'espace entre deux voisins (90 points sur la roue, 44 px impossibles sans chevauchement ;
    // « Le codex en liste » reste l'accès complet)
    if (!mini) lien.appendChild(svg("circle", { cx: 150 + 122 * Math.cos(a), cy: 150 + 122 * Math.sin(a), r: Math.PI * 122 / n, class: "codex-cible" }));
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
    if (secrete && !a) {
      const carte = el("div", "distinction-carte secrete");
      carte.append(medailleDistinction(id, false, true, 40), el("p", "distinction-nom", T("Distinction secrète")));
      grille.appendChild(carte); return;
    }
    const carte = el("div", "distinction-carte" + (a ? " obtenue" : ""));
    carte.append(medailleDistinction(id, a, !!secrete, 40), el("p", "distinction-nom", (a ? "✓ " : "") + T(nom)), el("p", "source", pourquoi));
    const cadeau = [...FORMES_PERSONNAGE, ...EQUIPEMENTS_PERSONNAGE, ...FONDS_PERSONNAGE].find(x => x[2] === id);
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
  const { forme, genre, equipement, fond, obtenues, rang } = choixPersonnage();
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
      // À gagner : par une distinction (son nom, sa raison en info-bulle) ou par un grade
      const gagne = debloquePersonnage(distinction === undefined ? null : distinction, obtenues, rang);
      const d = gagne || typeof distinction === "number" ? null : DISTINCTIONS.find(x => x[0] === distinction);
      const b = el("button", "puce" + (id === actuel ? " active" : ""), gagne ? nom : T("{0} (à gagner : {1})", T(nom), conditionPersonnage(distinction)));
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
  rangee("Fond", FONDS_PERSONNAGE, fond[0], "fond");
  p.appendChild(el("p", "source", "Formes, équipements et fonds se gagnent avec une distinction (onglet « Distinctions ») ou un grade."));
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
  // Roue vide (aucune fiche lue ni rencontrée) : un cercle pâle qui ne dit rien, on attend la première fiche
  if (Object.keys(memoire).length || lire("fichesLues", []).length) {
    const roue = el("a", "codex-mini");
    roue.href = "#profil/notions";
    const dessin = codex(120, true);
    roue.setAttribute("aria-label", dessin.getAttribute("aria-label"));
    roue.appendChild(dessin);
    carte.appendChild(roue);
  }
  carte.appendChild(lienVers("#profil", "Votre profil →", "lien-discret"));
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

// Ce que montrent la fiche et l'image à partager. Les distinctions secrètes ne sont jamais nommées : leur nom dévoilerait
// le secret, et certaines disent une habitude (« Noctambule » : des points gagnés entre minuit et 5 heures).
function donneesFiche() {
  const { m, etat } = majMaitrise(false);
  const obtenues = new Set((lire("distinctions", {}) || {}).obtenues || []);
  const gagnees = DISTINCTIONS.filter(([id]) => obtenues.has(id));
  const luc = lire("lucidite", {}) || {}, jour = aujourdHui();
  return { m, etat, grade: gradeDe(etat.meilleure || 0), pseudo: prenomDuJoueur(), lucidite: luc.total || 0,
    // Points des quatorze derniers jours, du plus ancien à aujourd'hui
    jours: Array.from({ length: 14 }, (_, k) => ((luc.jours || {})[jour - 13 + k]) || 0), objectif: lire("objectif", 60),
    // État de chaque distinction, dans l'ordre de la liste : obtenue ou non, secrète ou non
    medailles: DISTINCTIONS.map(x => [obtenues.has(x[0]), !!x[5], x[1], x[0]]),
    nombre: gagnees.length };
}

// ===================== Graphiques de la fiche, en SVG et sur le canvas =====================
// Mêmes géométries pour la page et pour l'image : chaque graphique décrit ses formes, deux fonctions les peignent.
// Échelle des grades : dix pastilles sur un trait ; atteintes en terre cuite, l'actuelle cerclée, les autres vides
function formesEchelleGrades(rang, largeur) {
  const pas = (largeur - 24) / (GRADES.length - 1);
  return GRADES.map((_, k) => ({ x: 12 + k * pas, r: k === rang ? 9 : 6, etat: k < rang ? "atteint" : k === rang ? "actuel" : "futur" }));
}
// Barres des quatorze derniers jours : hauteur selon le plus grand de l'objectif et du meilleur jour
function formesJours(jours, objectif, largeur, hauteur) {
  const max = Math.max(objectif, ...jours, 1), pas = largeur / jours.length;
  return { barres: jours.map((v, k) => ({ x: k * pas + pas * 0.15, l: pas * 0.7, h: v ? Math.max(2, v / max * hauteur) : 0, aujourdhui: k === jours.length - 1 })),
    objectif: hauteur - objectif / max * hauteur };
}
// Médailles des distinctions : en rangées de « parRangee »
function formesMedailles(medailles, parRangee, pas) {
  return medailles.map(([obtenue, secrete, nom, id], k) => ({ x: (k % parRangee) * pas + pas / 2, y: Math.floor(k / parRangee) * pas + pas / 2, obtenue, secrete, nom, id }));
}
// Point d'interrogation d'une distinction secrète pas encore trouvée, centré sur 0, dans un rayon de 6
const MOTIF_SECRET = "M-2.2-1.8Q-2.2-4.3 0-4.3Q2.3-4.3 2.3-2Q2.3-.3 0 .4V1.6M0 3.6V3.7";
// Glyphes des distinctions : un dessin par distinction, gravé en trait sur la pièce (centré sur 0, dans un rayon de 7,
// réduit à l'affichage). Même grammaire que les objets des domaines ; une référence grecque quand elle va de soi
// (trépied de Delphes, scytale, colonne dorique, navire). Une distinction sans glyphe garderait le motif de couronne.
const cerclePiece = (x, y, r) => "M" + (x - r) + " " + y + "a" + r + " " + r + " 0 1 0 " + 2 * r + " 0a" + r + " " + r + " 0 1 0 " + -2 * r + " 0";
const pointsPiece = (n, r, depart, taille) => Array.from({ length: n }, (_, k) => {
  const a = (depart + 360 * k / n) * Math.PI / 180;
  return cerclePiece(arrondiPersonnage(r * Math.cos(a)), arrondiPersonnage(r * Math.sin(a)), taille);
}).join("");
const MOTIF_MEDAILLE = "M-3.6 2.5Q-5.5-2 -1.8-4.6M3.6 2.5Q5.5-2 1.8-4.6M-4.4-0.5l-1.6-.6M-4.2 1.6l-1.7.2M4.4-0.5l1.6-.6M4.2 1.6l1.7.2";
const GLYPHES_DISTINCTIONS = {
  // Une pousse : le premier doute qui germe (un « ? » se confondait avec les distinctions secrètes)
  "premier-doute": "M0 6V-1M-6 6H6M0 1Q-4.6 1-5.4-3.8Q-1-3.6 0 1M0-1Q3.6-1.4 4.8-6Q.6-5.8 0-1",
  "regulier": pointsPiece(7, 5, -90, 0.9),
  "assidu": "M-4.5-4.5V4.5M-1.5-4.5V4.5M1.5-4.5V4.5M4.5-4.5V4.5M-6.5 3L6.5-3",
  "a-l-heure": cerclePiece(0, 0, 5.8) + "M0 0V-3.8M0 0L2.8 1.8",
  "memoire-longue": "M-5.6 5.5V3.5M-2.8 5.5V1.5M0 5.5V-.5M2.8 5.5V-2.5M5.6 5.5V-4.5",
  "cartographe": "M0-6.2L1.5-1.5L6.2 0L1.5 1.5L0 6.2L-1.5 1.5L-6.2 0L-1.5-1.5Z",
  "codex-complet": "M-4.5-5.8H4V5.8H-4.5ZM-2.4-5.8V5.8M0-2.4H2.2M0 0H2.2",
  "bien-etalonne": "M0-5.6V4.8M-3.6 5.2H3.6M-5.6-3.4H5.6M-5.6-3.4L-7.2.6H-4ZM5.6-3.4L4 .6H7.2Z",
  "je-sais": "M-5.4-5.4H5.4V5.4H-5.4Z" + cerclePiece(-2.6, -2.6, 0.8) + cerclePiece(0, 0, 0.8) + cerclePiece(2.6, 2.6, 0.8),
  "lecon-retenue": "M-5.6.8A5.6 5.6 0 1 0-3.4-4.4M-3.4-4.4L-.6-4.6M-3.4-4.4L-3.6-1.6M-2.4.6L-.4 2.6L3.2-1.6",
  "fourchettes": "M-3.6-5.4H-6V5.4H-3.6M3.6-5.4H6V5.4H3.6" + cerclePiece(0, 0, 1.1),
  "previsionniste": "M-5.4-3.4H5.4Q4.6.8 0 .8Q-4.6.8-5.4-3.4ZM-3 .6L-5 6M3 .6L5 6M0 .8V6M-2-5.6Q-1-4.4-2-3.6M1.6-6Q2.6-4.8 1.6-3.8",
  "bayesien": cerclePiece(-2.2, 0, 4) + cerclePiece(2.2, 0, 4),
  "porte-deux": "M-3.6 5.6V-2.2A3.6 3.6 0 0 1 3.6-2.2V5.6ZM-6.4 5.6H6.4" + cerclePiece(1.8, 1.6, 0.5),
  "sans-ancre": "M0-4.2V5M-2.8-2.4H2.8M-5 1.4Q-4.4 5 0 5Q4.4 5 5 1.4" + cerclePiece(0, -5.4, 1.2) + "M-6.2 6.2L6.2-6.2",
  "p-005": "M-6.6 4.6Q-3.4 4.6-1.8-.6Q0-6 1.8-.6Q3.4 4.6 6.6 4.6M-6.6 4.6H6.6M4 4.6V2.2",
  "oreille-fine": "M-1.2 6Q-3.4 3.6-3.4-.4Q-3.4-5.8 1-5.8Q4.6-5.8 4.6-2.2Q4.6.2 2.6 1.6Q1.2 2.6 1.6 4.4Q1.8 6-.4 6.2M-.6-2.4Q1.4-3 1.6-1.2Q1.6 0 .6.6",
  "homme-acier": "M-4.6-5.6H4.6M-3.6-4.2H3.6M-2.6-4.2V4.6M2.6-4.2V4.6M0-4.2V4.6M-4.6 6H4.6M-3.6 4.6H3.6",
  "bingo": "M-5.4-5.4H5.4V5.4H-5.4ZM-5.4-1.8H5.4M-5.4 1.8H5.4M-1.8-5.4V5.4M1.8-5.4V5.4M-4.2 4.2L4.2-4.2",
  "sur-le-terrain": "M-4.8 1.2a1.8 3 0 1 0 3.6 0a1.8 3 0 1 0-3.6 0M1.2-3a1.8 3 0 1 0 3.6 0a1.8 3 0 1 0-3.6 0M-3.4 5.4H-2.6M2.6 1.2H3.4",
  "naturaliste": "M-5.4 5.4Q-5.4-3.2 5.4-5.4Q3.6 4-5.4 5.4ZM-5.4 5.4L2.4-2.4M-2 2Q-2.2 0-1 -1M0 0Q1.6.6 2.4 0",
  "decision-eclairee": "M0 6.2V.4M0 .4L-4.6-4.2M0 .4L4.6-4.2M-4.6-4.2H-2M-4.6-4.2V-1.6M4.6-4.2H2M4.6-4.2V-1.6",
  "explorateur": "M-6.2 1.8H6.2L3.8 5.4H-3.8ZM-.4 1.8V-6.2M0-5.6L4.8.4H0M-.8-5Q-4.8-1.6-4.2.4H-.8",
  "tour-complet": "M4.6-2.8A5.6 5.6 0 1 0 5.4 1.6M4.6-2.8L5.2-5.8M4.6-2.8L1.6-2.4",
  "grand-test": "M-6 2.8A6 6 0 0 1 6 2.8M0 2.8L3.4-1.8M-6 2.8H-4.4M6 2.8H4.4M0-3.2V-1.8M-4.2-1.4L-3.2-.4M4.2-1.4L3.2-.4" + cerclePiece(0, 2.8, 0.9),
  "specialiste": cerclePiece(0, 0, 5.8) + cerclePiece(0, 0, 3.2) + cerclePiece(0, 0, 0.9),
  "polyvalent": "M0-6L5.2-3V3L0 6L-5.2 3V-3Z" + cerclePiece(0, 0, 1.4),
  "apparences": "M-4.4-2.6H4.4M-4.4-2.6L-2.6-4.4M-4.4-2.6L-2.6-.8M4.4-2.6L2.6-4.4M4.4-2.6L2.6-.8M-3.4 3H3.4M-3.4 3L-5.2 1.2M-3.4 3L-5.2 4.8M3.4 3L5.2 1.2M3.4 3L5.2 4.8",
  "demonteur": "M0-5.6L-1.8-2.6M0-5.6L1.8-2.6M-5.6 4.4H-2.4M-5.6 4.4L-3.8 1.4M5.6 4.4H2.4M5.6 4.4L3.8 1.4" + cerclePiece(0, 1, 0.6),
  "chercheur": cerclePiece(-1.4, -1.4, 3.8) + "M1.4 1.4L5.6 5.6",
  "noctambule": "M1.2-5.6A5.8 5.8 0 1 0 1.2 5.6A4.4 4.4 0 1 1 1.2-5.6ZM4.8-4.2L5.4-2.8L6.8-2.2L5.4-1.6L4.8-.2L4.2-1.6L2.8-2.2L4.2-2.8Z",
  "bilingue": "M-6.6 5L-4.2-4.6L-1.8 5M-5.6 1.6H-2.8M5.8 1.4Q4.4 5 2.6 5Q.6 5 .6 2.6Q.6 0 2.6 0Q4.2 0 5 3.6Q5.4 5.2 6.4 5",
  "sesame": cerclePiece(-3.4, 0, 2.6) + "M-.8 0H6.2M4 0V2.6M6.2 0V2.6",
  // Fer à cheval porte-bonheur, ouverture en haut (à l'envers, il ressemblait à la porte de Monty Hall) : un fer plein,
  // les trous des clous dans son épaisseur (posés dans le vide, ils dessinaient un visage)
  "vendredi-13": "M-5.4-5.4V.2A5.4 5.4 0 0 0 5.4.2V-5.4H2.8V.2A2.8 2.8 0 0 1-2.8.2V-5.4Z" + cerclePiece(-4.1, -2.8, 0.35) + cerclePiece(4.1, -2.8, 0.35) + cerclePiece(-3.2, 2.6, 0.35) + cerclePiece(3.2, 2.6, 0.35),
  "oeil-de-lynx": "M-6.6 0Q0-6.2 6.6 0Q0 6.2-6.6 0ZM0-3.4Q1.4 0 0 3.4Q-1.4 0 0-3.4Z",
  "seize-sceaux": cerclePiece(0, -1, 4) + pointsPiece(8, 2.2, 0, 0.5).replace(/M(-?[\d.]+) (-?[\d.]+)/g, (m, x, y) => "M" + x + " " + arrondiPersonnage(Number(y) - 1)) + "M-2.2 2.6L-3.8 6.2M2.2 2.6L3.8 6.2",
  // Cadenas : l'énigme à ouvrir (une scytale, trop rare à cette taille, se lisait comme une règle)
  "cryptographe": "M-4.6-.4H4.6V6H-4.6ZM-2.8-.4V-3Q-2.8-6.2 0-6.2Q2.8-6.2 2.8-3V-.4M0 3.4V4.6" + cerclePiece(0, 2.4, 0.9)
};
// Le dessin d'une médaille, pour la page et le canvas : glyphe de la distinction, ou « ? » pour une secrète à trouver
const motifMedaille = f => !f.obtenue && f.secrete ? MOTIF_SECRET : GLYPHES_DISTINCTIONS[f.id] || MOTIF_MEDAILLE;
// Le glyphe est réduit pour laisser de l'air jusqu'au filet de la pièce
const ECHELLE_GLYPHE = 0.78;

// Emblème d'un domaine : médaillon noir, cerné de sa couleur, l'objet gravé (même dessin que sur le personnage)
function emblemeDomaine(d, taille) {
  const s = svg("svg", { viewBox: "-13 -13 26 26", class: "portrait embleme-domaine", width: taille, height: taille, "aria-hidden": "true" });
  s.style.setProperty("--c", DOMAINES_PERSONNAGE[d][0]);
  s.append(svg("circle", { r: 12.5, class: "medaillon-objet-bord" }), svg("circle", { r: 11, class: "medaillon-objet" }), svg("path", { d: DOMAINES_PERSONNAGE[d][2], class: "medaillon-objet-trait" }));
  return s;
}

function svgEchelleGrades(rang) {
  const s = svg("svg", { viewBox: "0 0 300 24", class: "fiche-echelle", "aria-hidden": "true" });
  s.appendChild(svg("path", { d: "M12 12H288", class: "fiche-echelle-trait" }));
  formesEchelleGrades(rang, 300).forEach(f => s.appendChild(svg("circle", { cx: f.x, cy: 12, r: f.r, class: "fiche-grade-" + f.etat })));
  return s;
}
function svgJours(jours, objectif) {
  const s = svg("svg", { viewBox: "0 0 140 44", class: "fiche-jours", "aria-hidden": "true" });
  const f = formesJours(jours, objectif, 140, 40);
  s.appendChild(svg("path", { d: "M0 40.5H140", class: "fiche-jours-base" }));
  f.barres.forEach(b => { if (b.h) s.appendChild(svg("rect", { x: b.x, y: 40 - b.h, width: b.l, height: b.h, rx: 1, class: b.aujourdhui ? "fiche-jour-actuel" : "fiche-jour" })); });
  s.appendChild(svg("path", { d: "M0 " + f.objectif + "H140", class: "fiche-jours-objectif" }));
  return s;
}
// Le vase de la fiche : sa forme dit le trait dominant (domaine le plus fort), son décor dit le grade atteint. Argile
// et noir seulement, comme le médaillon. Repère 60 × 78, base à 75.
// Vases : [domaine, nom, contour, anses, zone noire du haut (jusqu'à y), zone noire du bas (depuis y), bande décorée
//   [y1, y2] ou null, base des rayons (y)]
const VASES_PERSONNAGE = [
  ["raisonner", "une amphore", "M23 3H37V6H35V13Q51 18 52 34Q52 54 36 66V70H40V75H20V70H24V66Q8 54 8 34Q9 18 25 13V6H23Z",
    "M25 8Q11 7 12.5 19.5M35 8Q49 7 47.5 19.5", 21, 66, [34, 42], 66],
  ["monde", "un cratère", "M6 8H54V12H51Q52 30 44 40Q40 46 33 48V66H40V75H20V66H27V48Q20 46 16 40Q8 30 9 12H6Z",
    "M9.5 18Q1 19 5 29M50.5 18Q59 19 55 29", 15, 48, [22, 30], 48],
  ["confiance", "un lécythe", "M27 3H33V8H32V14Q44 15 44 22V63Q44 68 36 68V70H40V75H20V70H24V68Q16 68 16 63V22Q16 15 28 14V8H27Z",
    "M32 9.5Q40.5 9 40 15", 21, 63, [34, 42], 63],
  // La coupe à yeux : deux grands yeux peints sur la vasque, à la place de la bande
  ["perception", "une coupe à yeux", "M4 22H56Q55 38 38 42V64H44V70H16V64H22V42Q5 38 4 22Z",
    "M6 25Q-1.5 25 2.5 31.5M54 25Q61.5 25 57.5 31.5", 24.5, 42, [25.5, 29.5], null],
  ["debattre", "une œnochoé", "M22 6Q26 2 30 5Q34 2 38 6Q36 10 34 12V16Q48 22 48 40Q48 58 36 66V70H40V75H20V70H24V66Q12 58 12 40Q12 22 26 16V12Q24 10 22 6Z",
    "M35.5 10Q51 8 46.5 29", 24, 64, [37, 45], 64],
  ["notions", "une hydrie", "M24 4H36V7H34V14Q50 18 51 32Q52 52 37 66V70H41V75H19V70H23V66Q8 52 9 32Q10 18 26 14V7H24Z",
    "M34.5 9Q49 8 47 21M10.5 37Q3 37 5.5 44M49.5 37Q57 37 54.5 44", 22, 64, [39, 47], 64]
];
// Le trait qui vous décrit : celui de votre domaine le plus fort (des expressions sans genre grammatical)
const TRAITS_PERSONNAGE = { monde: "Sens des ordres de grandeur", confiance: "Juste mesure de soi", perception: "Regard aiguisé",
  raisonner: "Esprit logique", debattre: "Art de la réplique", notions: "Mémoire d'encyclopédie" };
const domaineDominant = domaines => DOMAINES.map(([id]) => [id, domaines[id] || 0]).reduce((a, x) => x[1] > a[1] ? x : a, ["", 0]);
function traitDominant(domaines) {
  const [d, v] = domaineDominant(domaines);
  return v > 0 ? T(TRAITS_PERSONNAGE[d]) : T("Esprit en devenir");
}
// Décors gagnés avec les grades, du plus simple au plus riche : [grade minimal, nom] (la coupe à yeux n'a ni rayons ni
// laurier : ses yeux occupent la vasque)
const DECORS_VASE = [[1, "un filet"], [2, "des points"], [3, "une frise grecque"], [5, "des rayons"], [7, "une couronne de laurier"]];

function svgVase(domaines, rang) {
  const [d, v] = domaineDominant(domaines);
  // Rien de mesuré : l'amphore, nue
  const [, nom, contour, anses, haut, bas, bande, rayons] = VASES_PERSONNAGE.find(x => v > 0 && x[0] === d) || VASES_PERSONNAGE[0];
  const decors = DECORS_VASE.filter(([r]) => rang >= r);
  const s = svg("svg", { viewBox: "0 0 60 78", class: "fiche-vase", role: "img",
    "aria-label": (rayons === null ? decors.filter(([r]) => r < 5) : decors).length ? T("{0}, décor : {1}", T(nom), (rayons === null ? decors.filter(([r]) => r < 5) : decors).map(([, n]) => T(n)).join(", ")) : T(nom) });
  const id = "vase-masque-" + (++numeroPortrait);
  const masque = svg("clipPath", { id });
  masque.appendChild(svg("path", { d: contour }));
  const g = svg("g", { "clip-path": "url(#" + id + ")" });
  const noir = d => svg("path", { d, class: "vase-noir" }), argile = d => svg("path", { d, class: "vase-argile" });
  g.append(svg("rect", { x: 0, y: 0, width: 60, height: 78, class: "vase-fond" }), noir("M0 0H60V" + haut + "H0ZM0 " + bas + "H60V78H0Z"));
  // La coupe à yeux : ses deux yeux, toujours, sous la lèvre (la seule forme sans rayons au pied)
  if (rayons === null) g.append(noir("M12 34.5Q19 29.5 26 34.5Q19 39.5 12 34.5ZM34 34.5Q41 29.5 48 34.5Q41 39.5 34 34.5Z"),
    argile("M16.8 34.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0M38.8 34.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0"));
  if (rang >= 1) g.appendChild(noir("M0 " + (haut + 2.5) + "H60V" + (haut + 3.5) + "H0Z"));
  if (rang >= 2) g.appendChild(argile(pointsPersonnage([24, 30, 36].map(x => [x, haut - 3]), 1)));
  if (rang >= 3 && bande) {
    const [y1, y2] = bande, k = (y2 - y1) / 10;
    g.append(noir("M0 " + y1 + "H60V" + y2 + "H0Z"));
    const frise = svg("path", { d: traceMeandre(60 / k), class: "vase-frise", transform: "translate(0 " + y1 + ") scale(" + k + ")" });
    g.appendChild(frise);
  }
  if (rang >= 5 && rayons !== null) g.appendChild(noir(Array.from({ length: 12 }, (_, i) => "M" + (i * 5) + " " + rayons + "L" + (i * 5 + 2.5) + " " + (rayons - 8) + "L" + (i * 5 + 5) + " " + rayons + "Z").join("")));
  if (rang >= 7 && rayons !== null) {
    // Laurier : une branche au-dessus de la bande, feuilles par paires de part et d'autre de la tige, pointées vers la
    // gauche comme une couronne qui fait le tour du vase
    const y = bande[0] - 4.5;
    g.appendChild(noir(Array.from({ length: 9 }, (_, i) => feuillePersonnage(4 + i * 7, y, 205, 5.5, 1.5) + feuillePersonnage(4 + i * 7, y, 155, 5.5, 1.5)).join("")
      + "M0 " + (y - 0.35) + "H60V" + (y + 0.35) + "H0Z"));
  }
  s.append(masque, g, svg("path", { d: contour, class: "vase-contour" }), svg("path", { d: anses, class: "vase-anse" }));
  return s;
}
// Une médaille en SVG (rayon 10, centrée sur 0) : pièce noire et glyphe si obtenue ; sinon cercle tireté et glyphe pâle
// (on voit ce qu'il reste à gagner), ou « ? » pour une secrète
function pieceMedaille(f) {
  const g = svg("g");
  if (f.obtenue) g.append(svg("circle", { r: 10, class: "medaille-obtenue" }), svg("circle", { r: 8.4, class: "medaille-filet" }));
  else g.appendChild(svg("circle", { r: 9, class: "medaille-a-gagner" }));
  const motif = svg("path", { d: motifMedaille(f), class: f.obtenue ? "medaille-motif" : "medaille-motif-a-gagner" });
  if (!(f.secrete && !f.obtenue)) motif.setAttribute("transform", "scale(" + ECHELLE_GLYPHE + ")");
  g.appendChild(motif);
  return g;
}
// Médaille seule, pour une carte de l'onglet « Distinctions » (décorative : le nom est écrit à côté)
function medailleDistinction(id, obtenue, secrete, taille) {
  const s = svg("svg", { viewBox: "-11 -11 22 22", width: taille, height: taille, class: "medaille-distinction", "aria-hidden": "true" });
  s.appendChild(pieceMedaille({ id, obtenue, secrete }));
  return s;
}
function svgMedailles(medailles) {
  // Huit par rangée (au lieu de treize) : chaque glyphe se lit, autour de 40 px de large sur la fiche
  const parRangee = 8, pas = 24, rangees = Math.ceil(medailles.length / parRangee);
  const s = svg("svg", { viewBox: "0 0 " + parRangee * pas + " " + rangees * pas, class: "fiche-medailles", "aria-hidden": "true" });
  formesMedailles(medailles, parRangee, pas).forEach(f => {
    const g = svg("g", { transform: "translate(" + f.x + " " + f.y + ")" });
    // Au survol : le nom (une secrète obtenue reste secrète, une secrète à gagner aussi)
    const nom = svg("title");
    nom.textContent = f.secrete ? T("Distinction secrète") : f.obtenue ? T(f.nom) : T("{0} (à gagner)", T(f.nom));
    g.appendChild(nom);
    g.appendChild(pieceMedaille(f));
    s.appendChild(g);
  });
  return s;
}

// Peintures sur le canvas de l'image (thème clair, comme le reste de l'image)
function peindreEmblemeDomaine(ctx, d, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 12.5, r / 12.5);
  ctx.beginPath(); ctx.arc(0, 0, 12.5, 0, 2 * Math.PI); ctx.fillStyle = DOMAINES_PERSONNAGE[d][0]; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, 2 * Math.PI); ctx.fillStyle = FIGURE_PERSONNAGE; ctx.fill();
  ctx.lineWidth = 1.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = TERRE_PERSONNAGE; ctx.stroke(new Path2D(DOMAINES_PERSONNAGE[d][2]));
  ctx.restore();
}
function peindreEchelleGrades(ctx, rang, x, y, largeur) {
  ctx.save(); ctx.translate(x, y); const k = largeur / 300; ctx.scale(k, k);
  ctx.strokeStyle = "#dcd7cc"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, 12); ctx.lineTo(288, 12); ctx.stroke();
  formesEchelleGrades(rang, 300).forEach(f => {
    ctx.beginPath(); ctx.arc(f.x, 12, f.r, 0, 2 * Math.PI);
    if (f.etat === "futur") { ctx.fillStyle = "#fffefb"; ctx.fill(); ctx.strokeStyle = "#dcd7cc"; ctx.lineWidth = 1.5; ctx.stroke(); }
    else { ctx.fillStyle = TERRE_PERSONNAGE; ctx.fill(); if (f.etat === "actuel") { ctx.strokeStyle = FIGURE_PERSONNAGE; ctx.lineWidth = 2.5; ctx.stroke(); } }
  });
  ctx.restore();
}
function peindreJours(ctx, jours, objectif, x, y, largeur, hauteur) {
  const f = formesJours(jours, objectif, largeur, hauteur);
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#dcd7cc"; ctx.fillRect(0, hauteur, largeur, 2);
  f.barres.forEach(b => { if (b.h) { ctx.fillStyle = b.aujourdhui ? FIGURE_PERSONNAGE : TERRE_PERSONNAGE; ctx.fillRect(b.x, hauteur - b.h, b.l, b.h); } });
  ctx.setLineDash([8, 6]); ctx.strokeStyle = "#6b6862"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, f.objectif); ctx.lineTo(largeur, f.objectif); ctx.stroke();
  ctx.restore();
}
function peindreMedailles(ctx, medailles, x, y, pas) {
  const k = pas / 24;
  formesMedailles(medailles, 19, pas).forEach(f => {
    ctx.save(); ctx.translate(x + f.x, y + f.y); ctx.scale(k, k);
    if (f.obtenue) {
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, 2 * Math.PI); ctx.fillStyle = FIGURE_PERSONNAGE; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 8.4, 0, 2 * Math.PI); ctx.strokeStyle = TERRE_PERSONNAGE; ctx.lineWidth = 0.6; ctx.stroke();
    } else { ctx.beginPath(); ctx.arc(0, 0, 9, 0, 2 * Math.PI); ctx.setLineDash([2.5, 2]); ctx.strokeStyle = "#b9b2a5"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
    // Le glyphe : argile sur la pièce noire, gris pâle sur une médaille à gagner (« ? » pour une secrète)
    const reduit = !(f.secrete && !f.obtenue);
    if (reduit) ctx.scale(ECHELLE_GLYPHE, ECHELLE_GLYPHE);
    ctx.strokeStyle = f.obtenue ? TERRE_PERSONNAGE : "#b9b2a5"; ctx.lineWidth = 1.3 / (reduit ? ECHELLE_GLYPHE : 1) * (reduit ? 0.92 : 0.85);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(new Path2D(motifMedaille(f)));
    ctx.restore();
  });
}

// Texte du prochain grade, commun à la fiche et à l'image
const texteProchainGrade = (grade, meilleure) => grade.suivant
  ? T("Prochain grade : {0}, encore {1} points de maîtrise.", T(grade.suivant[1]), grade.suivant[0] - meilleure)
  : T("Grade le plus haut atteint.");

// Image à partager : le personnage en pied entre deux frises, le grade et l'échelle des grades, la maîtrise et les
// points, les six domaines, les quatorze derniers jours, les médailles des distinctions.
// avecPseudo : faux par défaut (le pseudo peut être un vrai nom) ; la case de la fiche l'ajoute pour cette image seulement.
function partagerGrade(avecPseudo) {
  const f = donneesFiche();
  return partagerImage("esprit-critique-personnage.png", ctx => {
    const frise = y => { ctx.save(); ctx.translate(96, y); ctx.scale(4, 4); ctx.lineWidth = 1.1; ctx.strokeStyle = FIGURE_PERSONNAGE; ctx.lineCap = "square"; ctx.stroke(new Path2D(traceMeandre(222))); ctx.restore(); };
    frise(44);
    dessinerPersonnageCanvas(ctx, f.etat, 360, 96, 360, true);
    ctx.textAlign = "center"; ctx.fillStyle = "#1c1b19";
    if (avecPseudo && f.pseudo) { ctx.font = policeTitre(50); ctx.fillText(f.pseudo, 540, 505); }
    ctx.font = policeTitre(avecPseudo && f.pseudo ? 40 : 52); ctx.fillText(T(f.grade.nom), 540, avecPseudo && f.pseudo ? 552 : 530);
    peindreEchelleGrades(ctx, f.grade.rang, 300, 568, 480);
    ctx.font = policeTexte(26); ctx.fillStyle = "#6b6862"; ctx.fillText(texteProchainGrade(f.grade, f.etat.meilleure || 0), 540, 636);
    // Les deux chiffres
    ctx.fillStyle = "#1c1b19"; ctx.font = policeTitre(96); ctx.fillText(String(f.m.globale), 308, 742); ctx.fillText(String(f.lucidite), 772, 742);
    ctx.font = policeTexte(28); ctx.fillStyle = "#6b6862"; ctx.fillText(T("de maîtrise, sur 1 000"), 308, 782); ctx.fillText(T("points de lucidité"), 772, 782);
    // À gauche, les six domaines : emblème, nom, valeur, barre
    ctx.textAlign = "left";
    DOMAINES.forEach(([d, nom], i) => {
      const y = 812 + i * 44, v = f.m.domaines[d];   // dernière barre finie à 1 040 : de l'air avant les distinctions
      peindreEmblemeDomaine(ctx, d, 114, y + 16, 17);
      ctx.font = policeTexte(24); ctx.fillStyle = "#1c1b19"; ctx.fillText(T(nom), 142, y + 12);
      ctx.textAlign = "right"; ctx.fillText(String(v), 520, y + 12); ctx.textAlign = "left";
      ctx.fillStyle = "#ebe7df"; ctx.fillRect(142, y + 20, 378, 8);
      ctx.fillStyle = DOMAINES_PERSONNAGE[d][0]; ctx.fillRect(142, y + 20, 378 * Math.min(1000, v) / 1000, 8);
    });
    // À droite, les quatorze derniers jours
    ctx.textAlign = "center"; ctx.font = policeTexte(24); ctx.fillStyle = "#1c1b19";
    ctx.fillText(T("Les 14 derniers jours"), 772, 838);
    peindreJours(ctx, f.jours, f.objectif, 588, 858, 368, 150);
    ctx.font = policeTexte(22); ctx.fillStyle = "#6b6862"; ctx.fillText(T("en pointillé : l'objectif du jour ({0} points)", f.objectif), 772, 1042);
    // Les médailles des distinctions
    ctx.fillStyle = "#1c1b19"; ctx.font = "700 " + policeTexte(30);
    ctx.fillText(T("{0} sur {1}", pluriel(f.nombre, "distinction"), DISTINCTIONS.length), 540, 1088);
    // Deux rangées de 19 au pas de 44, centrées (1 080 − 19 × 44) / 2 = 122 ; finies à 1 190
    peindreMedailles(ctx, f.medailles, 122, 1102, 44);
    ctx.textAlign = "left"; ctx.font = "italic 26px Newsreader, Georgia, serif"; ctx.fillStyle = "#6b6862";
    ctx.fillText(T("La maîtrise mesure la réussite dans les jeux du site, pas l'intelligence."), 96, 1224);   // l'adresse est à 1 270
    frise(1290);
  });
}

// Fiche à partager : une boîte de dialogue native (showModal) : Échap la ferme, le reste de la page devient inerte
// (le focus ne peut pas en sortir vers la page), le focus revient ensuite au bouton qui l'a ouverte. Un clic sur le
// fond (hors du contenu) la ferme aussi. Le fond flouté est dans style.css (::backdrop). Les graphiques sont décoratifs
// (aria-hidden) : chacun a son texte à côté.
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
  const section = titre => el("h3", "fiche-section", titre);
  // Titre : le pseudo du joueur, sur sa propre fiche (l'image ne le porte que si la case est cochée)
  let casePseudo = null;
  const titre = el("h2", "fiche-perso-titre", f.pseudo || T("Votre personnage"));
  titre.id = "titre-fiche-personnage";
  // Sans pseudo, la fiche propose d'en donner un : il devient le titre (et celui du profil), comme dans les réglages
  let nomChange = false;
  const champNom = f.pseudo ? null : el("div", "fiche-nom");
  if (champNom) {
    const saisie = el("input", "champ champ-texte");
    saisie.id = "fiche-nom-saisie";
    saisie.maxLength = 24;
    saisie.autocomplete = "nickname";
    const etiquette = el("label", "source", "Votre nom sur la fiche (il reste sur cet appareil)");
    etiquette.htmlFor = saisie.id;
    const valider = el("button", "bouton secondaire", "Valider");
    valider.type = "button";
    const enregistrer = () => {
      const nom = saisie.value.trim().slice(0, 24);
      if (!nom) { saisie.focus(); return; }
      ecrire("profil", { ...(lire("profil", {}) || {}), pseudo: nom });
      nomChange = true;
      titre.textContent = nom;
      champNom.replaceWith(casePseudoImage());
      titre.focus();
    };
    valider.addEventListener("click", enregistrer);
    saisie.addEventListener("keydown", e => { if (e.key === "Enter") enregistrer(); });
    const ligne = el("div", "fiche-nom-ligne");
    ligne.append(saisie, valider);
    champNom.append(etiquette, ligne);
  }
  titre.tabIndex = -1;
  const grade = el("p", "profil-grade fiche-grade");
  grade.append(insigne(f.grade.rang, 26), texteNoeud(" " + T(f.grade.nom)));
  // Le prochain grade n'est plus écrit sous l'échelle : il en est le nom accessible
  const echelle = svgEchelleGrades(f.grade.rang);
  echelle.removeAttribute("aria-hidden");
  echelle.setAttribute("role", "img");
  echelle.setAttribute("aria-label", texteProchainGrade(f.grade, f.etat.meilleure || 0));
  contenu.append(frise(), titre, ...(champNom ? [champNom] : []), personnage(f.etat, 240, true, true), grade, echelle);
  // Maîtrise et points de lucidité, chacun avec son graphique
  const chiffres = el("div", "fiche-chiffres");
  const blocMaitrise = el("div"), blocLucidite = el("div");
  blocMaitrise.append(el("span", "fiche-nombre", String(f.m.globale)), el("span", "source", "de maîtrise, sur 1 000"),
    svgVase(f.m.domaines, f.grade.rang), el("span", "fiche-trait", traitDominant(f.m.domaines)));
  blocLucidite.append(el("span", "fiche-nombre", String(f.lucidite)), el("span", "source", "points de lucidité"), svgJours(f.jours, f.objectif),
    el("span", "source fiche-legende", T("14 jours, objectif {0}", f.objectif)));
  chiffres.append(blocMaitrise, blocLucidite);
  contenu.appendChild(chiffres);
  // Les six domaines : emblème, nom, valeur, barre à la couleur du domaine
  const domaines = el("ul", "fiche-domaines");
  DOMAINES.forEach(([d, nom]) => {
    const v = f.m.domaines[d], ligne = el("li", "fiche-domaine");
    const barre = el("span", "fiche-barre"), rempli = el("span");
    rempli.style.setProperty("--part", Math.min(1000, v) / 1000);
    barre.style.setProperty("--c", DOMAINES_PERSONNAGE[d][0]);
    barre.appendChild(rempli);
    ligne.append(emblemeDomaine(d, 26), el("span", "fiche-domaine-nom", T(nom)), el("span", "fiche-domaine-valeur", String(v)), barre);
    domaines.appendChild(ligne);
  });
  contenu.append(section("Domaines"), domaines);
  // Distinctions, en compact : le compte dans le titre, une médaille par distinction (pleine si obtenue, nommée au
  // survol) ; ce que chacune récompense est dans l'onglet « Distinctions » du profil, pas ici
  const titreDistinctions = section("Distinctions");
  titreDistinctions.appendChild(el("span", "fiche-compte", " " + f.nombre + "/" + DISTINCTIONS.length));
  contenu.append(titreDistinctions, svgMedailles(f.medailles));
  // Pseudo sur l'image : non par défaut (il peut être un vrai nom) ; le choix n'est pas enregistré. La case vient avec le
  // pseudo : plus bas s'il existait déjà, à la place du champ s'il vient d'être donné
  if (f.pseudo) contenu.appendChild(casePseudoImage());
  const actions = el("div", "fiche-actions");
  const partager = el("button", "bouton", "Partager l'image");
  partager.type = "button";
  partager.addEventListener("click", () => partagerGrade(!!(casePseudo && casePseudo.checked)).catch(e => annoncer(e.message)));
  function casePseudoImage() {
    const option = el("label", "fiche-option");
    casePseudo = el("input");
    casePseudo.type = "checkbox";
    option.append(casePseudo, texteNoeud(" " + T("Mettre mon pseudo sur l'image")));
    return option;
  }
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
    // Un nom donné dans la fiche : le profil derrière est réaffiché pour le prendre en titre ; le focus va au portrait
    if (nomChange && typeof afficherPageProfil === "function" && document.querySelector("#vue-profil .profil-tete")) {
      afficherPageProfil();
      const portrait = document.querySelector(".bouton-portrait");
      if (portrait) portrait.focus();
    } else if (declencheur && declencheur.isConnected) declencheur.focus();
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
