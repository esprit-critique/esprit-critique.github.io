// graphiques.js : le vocabulaire de graphiques du site (DESIGN.md, « Graphiques »), dessiné en SVG avec svg(), sans
// bibliothèque. Le site a un atelier « Graphiques trompeurs » : ses propres graphiques doivent être irréprochables.
// Barres depuis zéro, pas de double axe, pas de relief, valeurs écrites, couleur jamais seule à porter l'information,
// un titre qui dit ce que le graphique montre, et « Voir les données » pour le tableau correspondant.

// Bloc commun : titre, dessin, bouton « Voir les données » qui ouvre le tableau
function blocGraphique(titre, dessin, entetes, lignes, classe) {
  const figure = el("figure", "graphique" + (classe ? " " + classe : ""));
  figure.appendChild(el("figcaption", "graphique-titre", titre));
  figure.appendChild(dessin);
  const bouton = el("button", "lien graphique-donnees", "Voir les données");
  bouton.type = "button";
  bouton.setAttribute("aria-expanded", "false");
  const table = el("table", "tableau-donnees");
  table.hidden = true;
  const tete = el("tr");
  entetes.forEach(e => tete.appendChild(el("th", null, e)));
  table.appendChild(tete);
  lignes.forEach(l => {
    const tr = el("tr");
    l.forEach(v => tr.appendChild(el("td", null, String(v))));
    table.appendChild(tr);
  });
  bouton.addEventListener("click", () => {
    table.hidden = !table.hidden;
    bouton.setAttribute("aria-expanded", String(!table.hidden));
    bouton.textContent = typo(table.hidden ? T("Voir les données") : T("Cacher les données"));
  });
  figure.append(bouton, table);
  return figure;
}

// Barres horizontales depuis zéro, valeur écrite au bout : [[libellé, valeur, couleur]], maximum de l'échelle, repères
function graphiqueBarres(titre, donnees, max, reperes = []) {
  const haut = 26, largeur = 360, gauche = 150, droite = 50;
  const s = svg("svg", { viewBox: "0 0 " + largeur + " " + (donnees.length * haut + 18), class: "barres-svg", role: "img", "aria-label": titre });
  const echelle = v => gauche + (largeur - gauche - droite) * Math.max(0, v) / max;
  reperes.forEach(r => {
    s.appendChild(svg("line", { x1: echelle(r), y1: 0, x2: echelle(r), y2: donnees.length * haut, class: "repere-graphique" }));
    s.appendChild(texteSvg(echelle(r), donnees.length * haut + 13, String(r), { class: "graduation-graphique", "text-anchor": "middle" }));
  });
  donnees.forEach(([libelle, v, couleur], i) => {
    const y = i * haut;
    s.appendChild(texteSvg(gauche - 8, y + 17, libelle, { class: "libelle-graphique", "text-anchor": "end" }));
    const barre = svg("rect", { x: gauche, y: y + 5, width: Math.max(0, echelle(v) - gauche), height: 15, rx: 2, class: v === null ? "barre-vide" : "barre-graphique" });
    if (couleur) barre.style.setProperty("--c", couleur);
    s.appendChild(barre);
    s.appendChild(texteSvg(echelle(v || 0) + 5, y + 17, v === null ? T("jamais joué") : String(v), { class: "valeur-graphique" }));
  });
  return blocGraphique(titre, s, [T("Élément"), T("Valeur")], donnees.map(([l, v]) => [l, v === null ? T("jamais joué") : v]));
}

// Courbe dans le temps : points [[jour, valeur]], bandes horizontales (seuils de grade), maximum de l'échelle
function graphiqueCourbe(titre, points, max, bandes = []) {
  const L = 320, H = 170, g = 34, b = 22;
  const s = svg("svg", { viewBox: "0 0 " + L + " " + H, class: "courbe-svg", role: "img", "aria-label": titre });
  const j0 = points.length ? points[0][0] : 0, j1 = points.length ? Math.max(points[points.length - 1][0], j0 + 1) : 1;
  const x = j => g + (L - g - 8) * (j - j0) / (j1 - j0), y = v => H - b - (H - b - 8) * v / max;
  // Bandes des seuils ; un nom trop proche du précédent n'est pas écrit (la ligne reste), un nom en haut passe sous sa ligne
  // Les noms des seuils sont écrits après la courbe (plus bas), avec un liseré : la courbe ne passe jamais par-dessus
  let dernierY = Infinity;
  const nomsBandes = [];
  bandes.filter(([seuil]) => seuil <= max).forEach(([seuil, nom]) => {
    s.appendChild(svg("line", { x1: g, y1: y(seuil), x2: L - 8, y2: y(seuil), class: "repere-graphique" }));
    if (dernierY - y(seuil) < 12) return;
    dernierY = y(seuil);
    nomsBandes.push(texteSvg(g + 3, y(seuil) < 16 ? y(seuil) + 11 : y(seuil) - 3, nom, { class: "graduation-graphique nom-seuil" }));
  });
  s.appendChild(svg("line", { x1: g, y1: H - b, x2: L - 8, y2: H - b, class: "axe-graphique" }));
  [0, max].forEach(v => s.appendChild(texteSvg(g - 5, y(v) + 4, String(v), { class: "graduation-graphique", "text-anchor": "end" })));
  if (points.length === 1) s.appendChild(svg("circle", { cx: x(j0), cy: y(points[0][1]), r: 4, class: "point-graphique" }));
  if (points.length > 1) s.appendChild(svg("polyline", { points: points.map(([j, v]) => x(j).toFixed(1) + "," + y(v).toFixed(1)).join(" "), class: "ligne-graphique" }));
  if (points.length) {
    const [jd, vd] = points[points.length - 1];
    s.appendChild(svg("circle", { cx: x(jd), cy: y(vd), r: 4, class: "point-graphique" }));
    s.appendChild(texteSvg(Math.min(x(jd), L - 30), y(vd) - 8, String(vd), { class: "valeur-graphique", "text-anchor": "middle" }));
  }
  nomsBandes.forEach(t => s.appendChild(t));
  const date = j => new Date(j * 86400000).toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" });
  if (points.length) {
    s.appendChild(texteSvg(g, H - 6, date(j0), { class: "graduation-graphique" }));
    if (points.length > 1) s.appendChild(texteSvg(L - 8, H - 6, date(points[points.length - 1][0]), { class: "graduation-graphique", "text-anchor": "end" }));
  }
  return blocGraphique(titre, s, [T("Jour"), T("Valeur")], points.map(([j, v]) => [date(j), v]));
}

// Toile des domaines (0 à max), avec en pointillé une toile plus ancienne ; l'aire d'une toile trompe : les valeurs sont
// écrites à chaque sommet, et les mêmes données existent en barres (graphiqueBarres)
function graphiqueToile(titre, axes, valeurs, anciennes, max) {
  const c = 150, r = 92, n = axes.length;
  // Marges du cadre : les noms des axes dépassent du cercle
  const s = svg("svg", { viewBox: "-70 -14 440 328", class: "toile-svg", role: "img", "aria-label": titre });
  const pt = (i, v) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return [c + r * v / max * Math.cos(a), c + r * v / max * Math.sin(a)]; };
  [0.5, 1].forEach(k => s.appendChild(svg("polygon", { points: axes.map((_, i) => pt(i, k * max).join(",")).join(" "), class: "grille-toile" })));
  axes.forEach((nom, i) => {
    s.appendChild(svg("line", { x1: c, y1: c, x2: pt(i, max)[0], y2: pt(i, max)[1], class: "grille-toile" }));
    const [lx, ly] = pt(i, max * 1.2);
    // Nom long : sur deux lignes, coupé à l'espace le plus proche du milieu, pour tenir dans le cadre
    const espaces = [...nom.matchAll(/ /g)].map(m => m.index);
    const coupe = nom.length > 12 && espaces.length ? espaces.reduce((a, b) => Math.abs(b - nom.length / 2) < Math.abs(a - nom.length / 2) ? b : a) : -1;
    const lignes = coupe < 0 ? [nom] : [nom.slice(0, coupe), nom.slice(coupe + 1)];
    lignes.forEach((ligne, k) => s.appendChild(texteSvg(lx, ly + (k - (lignes.length - 1) / 2) * 17, ligne, { class: "libelle-graphique", "text-anchor": lx < c - 10 ? "end" : lx > c + 10 ? "start" : "middle" })));
  });
  if (anciennes) s.appendChild(svg("polygon", { points: anciennes.map((v, i) => pt(i, v).join(",")).join(" "), class: "toile-ancienne" }));
  s.appendChild(svg("polygon", { points: valeurs.map((v, i) => pt(i, v).join(",")).join(" "), class: "toile-actuelle" }));
  valeurs.forEach((v, i) => {
    // Les zéros se superposeraient au centre : non écrits ici, ils restent dans le tableau des données
    if (v === 0) return;
    const [x, y] = pt(i, Math.max(v, max * 0.12));
    s.appendChild(texteSvg(x, y + 4, String(v), { class: "valeur-graphique", "text-anchor": "middle" }));
  });
  return blocGraphique(titre, s, [T("Domaine"), T("Aujourd'hui"), T("Il y a quatre semaines")],
    axes.map((a, i) => [a, valeurs[i], anciennes ? anciennes[i] : "—"]));
}

// Jauge vers un objectif : part remplie, texte « reste N »
function graphiqueJauge(titre, valeur, debut, fin, texte) {
  const bloc = el("div", "jauge-grade");
  bloc.appendChild(el("p", "jauge-grade-titre", titre));
  const barre = el("div", "jauge");
  const rempli = el("div");
  rempli.style.setProperty("--part", Math.max(0, Math.min(1, (valeur - debut) / Math.max(1, fin - debut))));
  rempli.className = "jauge-remplie";
  barre.setAttribute("role", "progressbar");
  barre.setAttribute("aria-valuemin", String(debut));
  barre.setAttribute("aria-valuemax", String(fin));
  barre.setAttribute("aria-valuenow", String(valeur));
  barre.setAttribute("aria-label", titre);
  barre.appendChild(rempli);
  bloc.append(barre, el("p", "source", texte));
  return bloc;
}

// Anneau (objectif du jour, bouton de profil) : part remplie de 0 à 1
function anneau(part, taille, classe) {
  const s = svg("svg", { viewBox: "0 0 40 40", class: "anneau-mini " + (classe || ""), width: taille, height: taille, "aria-hidden": "true" });
  s.append(svg("circle", { cx: 20, cy: 20, r: 16, pathLength: 100, class: "anneau-fond" }),
    svg("circle", { cx: 20, cy: 20, r: 16, pathLength: 100, class: "anneau-valeur", "stroke-dasharray": Math.round(100 * Math.max(0, Math.min(1, part))) + " 100", transform: "rotate(-90 20 20)" }));
  return s;
}

// Calendrier d'activité : 16 semaines, une case par jour, plus ou moins foncée selon les points du jour
function graphiqueCalendrier(titre, pointsParJour, aujourdhui) {
  const semaines = 16, cote = 12, ecart = 3;
  const s = svg("svg", { viewBox: "0 0 " + (semaines * (cote + ecart) + 2) + " " + (7 * (cote + ecart) + 2), class: "calendrier-svg", role: "img", "aria-label": titre });
  const debut = aujourdhui - semaines * 7 + 1, lignes = [];
  const max = Math.max(1, ...Object.values(pointsParJour));
  for (let k = 0; k < semaines * 7; k++) {
    const jour = debut + k, p = pointsParJour[jour] || 0;
    const r = svg("rect", { x: 1 + Math.floor(k / 7) * (cote + ecart), y: 1 + (k % 7) * (cote + ecart), width: cote, height: cote, rx: 2, class: "case-calendrier" + (p ? " active" : "") });
    r.style.setProperty("--intensite", p ? 0.25 + 0.75 * p / max : 0);
    s.appendChild(r);
    if (p) lignes.push([new Date(jour * 86400000).toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" }), p]);
  }
  return blocGraphique(titre, s, [T("Jour"), T("Points")], lignes);
}

// Histogramme de la loi binomiale : scores possibles en répondant au hasard, score du joueur mis en évidence
function graphiqueHasard(titre, probabilites, score) {
  const n = probabilites.length - 1, L = 320, H = 130, b = 20;
  const max = Math.max(...probabilites);
  const s = svg("svg", { viewBox: "0 0 " + L + " " + H, class: "hasard-svg", role: "img", "aria-label": titre });
  const larg = (L - 10) / (n + 1);
  probabilites.forEach((p, k) => {
    const h = (H - b - 8) * p / max;
    const barre = svg("rect", { x: 5 + k * larg + 1, y: H - b - h, width: larg - 2, height: h, class: "bille" + (k === score ? " score-joueur" : "") });
    // La chute (DESIGN.md) : chaque colonne tombe en place, décalée selon sa position
    barre.style.setProperty("--retard", (k * 40) + "ms");
    s.appendChild(barre);
    s.appendChild(texteSvg(5 + k * larg + larg / 2, H - 6, String(k), { class: "graduation-graphique" + (k === score ? " score-joueur-texte" : ""), "text-anchor": "middle" }));
  });
  return blocGraphique(titre, s, [T("Score"), T("Probabilité au hasard")], probabilites.map((p, k) => [k, (100 * p).toFixed(2) + PC]));
}
