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
  return points;
}

// Compteurs cumulés (distinctions « À l'heure », « Leçon retenue »), gardés dans lucidite.cumuls
function compter(nom) {
  const e = lire("lucidite", {});
  e.cumuls = { ...(e.cumuls || {}), [nom]: ((e.cumuls || {})[nom] || 0) + 1 };
  ecrire("lucidite", e);
}

// Drapeaux des distinctions secrètes (emblème révélé, illusions vérifiées)
function noterDrapeau(nom, valeur) {
  const dist = lire("distinctions", {});
  const drapeaux = { ...(dist.drapeaux || {}) };
  if (nom === "illusions") drapeaux.illusions = [...new Set([...(drapeaux.illusions || []), valeur])];
  else drapeaux[nom] = true;
  ecrire("distinctions", { ...dist, drapeaux });
  majMaitrise();
}

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

// Blason : dessin au trait généré à partir du pseudonyme, dans le vocabulaire de l'emblème, avec une couleur de catégorie
function blason(pseudo, taille) {
  const texte = pseudo || "?";
  let h = 2166136261;
  for (const c of texte) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0;
  const alea = generateur(h);
  const couleurs = [...CATEGORIES_BIAIS, ...CATEGORIES_SOPHISMES].map(c => c.couleur);
  const s = svg("svg", { viewBox: "0 0 40 40", class: "blason", width: taille, height: taille, "aria-hidden": "true" });
  s.style.setProperty("--c", couleurs[Math.floor(alea() * couleurs.length)]);
  s.appendChild(svg("circle", { cx: 20, cy: 20, r: 18, class: "blason-fond" }));
  const traits = 1 + Math.floor(alea() * 3);
  for (let k = 0; k < traits; k++) {
    const y = 12 + k * (16 / Math.max(1, traits - 1 || 1)), dehors = alea() < 0.5 ? 1 : -1;
    s.appendChild(svg("path", { d: "M12 " + y + "h16M12 " + y + "l" + (-4 * dehors) + " -4M12 " + y + "l" + (-4 * dehors) + " 4M28 " + y + "l" + (4 * dehors) + " -4M28 " + y + "l" + (4 * dehors) + " 4", class: "blason-trait" }));
  }
  return s;
}

// ===================== En-tête : bouton de profil =====================
function majBoutonProfil(m, etat) {
  const b = document.querySelector(".bouton-profil");
  if (!b) return;
  b.hidden = modeSobre();
  if (b.hidden) return;
  etat = etat || lire("maitrise", { meilleure: 0, jours: {} });
  const globale = m ? m.globale : (Object.entries(etat.jours || {}).sort((a, x) => x[0] - a[0])[0] || [0, [0]])[1][0];
  const grade = gradeDe(etat.meilleure || 0);
  const points = (lire("lucidite", {}).jours || {})[aujourdHui()] || 0;
  const objectif = lire("objectif", 60);
  b.replaceChildren(blason((lire("profil", {}) || {}).pseudo, 26), anneau(points / objectif, 34, "anneau-profil"), insigne(grade.rang, 18), el("span", "bouton-profil-maitrise", String(globale)));
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
  identite.append(blason(profil.pseudo, 64), el("div", "profil-noms"));
  identite.lastChild.append(el("h1", "page-titre", profil.pseudo || T("Votre profil")), el("p", "profil-grade"));
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

function ongletEnsemble(p, m, etat) {
  const jours = Object.entries(etat.jours || {}).map(([j, v]) => [Number(j), v]).sort((a, b) => a[0] - b[0]);
  // Échelle jusqu'au deuxième grade au-dessus de la meilleure maîtrise : une courbe lisible, sans grade qui se chevauche
  const plusHaut = GRADES.find(([s]) => s > (etat.meilleure || 0) * 1.15 + 40) || GRADES[GRADES.length - 1];
  const echelle = Math.min(1000, (GRADES[GRADES.indexOf(plusHaut) + 1] || [1000])[0]);
  p.appendChild(graphiqueCourbe(T("Votre maîtrise, jour après jour"), jours.map(([j, v]) => [j, v[0]]), echelle, GRADES.filter(([s]) => s >= 25 && s <= echelle).map(([s, n]) => [s, T(n)])));
  p.appendChild(el("p", "source", T("La courbe commence le {0}, jour de la mise à jour qui a introduit la maîtrise : les jours d'avant ne peuvent pas être recalculés.",
    new Date((etat.depuis || aujourdHui()) * 86400000).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }))));
  const ancien = jours.filter(([j]) => j <= aujourdHui() - 28).pop();
  const valeurs = DOMAINES.map(([d]) => m.domaines[d]);
  p.appendChild(graphiqueToile(T("Vos six domaines (en pointillé : il y a quatre semaines)"), nomsDomaines(), valeurs, ancien ? ancien[1].slice(1) : null, 1000));
  p.appendChild(graphiqueBarres(T("Les mêmes domaines, en barres"), DOMAINES.map(([, nom], i) => [T(nom), valeurs[i]]).sort((a, b) => b[1] - a[1]), 1000, [500]));
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
  p.appendChild(graphiqueCalendrier(T("Les seize dernières semaines : plus la case est foncée, plus le jour a compté de points"), luc.jours || {}, aujourdHui()));
}

function ongletJeux(p, m) {
  SECTIONS_ATELIERS.filter(s => s.id !== "melange").forEach(section => {
    const dom = section.id === "philosopher" ? "raisonner" : section.id;
    const lignes = tousLesAteliers().filter(a => a.atelier.section === section.id && MAITRISE_JEUX[a.atelier.id] && MAITRISE_JEUX[a.atelier.id][1] !== "aucun")
      .map(a => { const v = m.jeux[a.atelier.id] ? m.jeux[a.atelier.id][1] : 0; return [a.atelier.titre, resultatAtelier(a.atelier.id) ? v : null, a.atelier.couleur]; });
    if (!lignes.length) return;
    p.appendChild(graphiqueBarres(T("{0} : maîtrise de chaque jeu (repères 500, 750, 1 000 : plafonds des niveaux 1, 2 et 3)", section.titre), lignes, 1000, [500, 750]));
    if (section.id !== "philosopher") p.appendChild(el("p", "source", T("Maîtrise du domaine : {0}. Un jeu jamais joué compte pour zéro.", m.domaines[dom])));
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
function codex(taille) {
  // Dans l'ordre des catégories : les points d'une même couleur forment un arc
  const cles = Object.keys(TYPES).flatMap(t => ORDRE[t].map(f => [t, f]));
  const s = svg("svg", { viewBox: "0 0 300 300", class: "codex", width: taille, height: taille, role: "img", "aria-label": T("Le codex : {0} notions maîtrisées sur {1}", cles.filter(([t, f]) => etatCodex(cleFiche(t, f)) === 4).length, cles.length) });
  const n = cles.length;
  cles.forEach(([type, f], i) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n, etat = etatCodex(cleFiche(type, f));
    const lien = svg("a", { href: "#" + type + "/" + f.id, "aria-label": f.nom + " : " + T(ETATS_CODEX[etat]) });
    const point = svg("circle", { cx: 150 + 122 * Math.cos(a), cy: 150 + 122 * Math.sin(a), r: 3 + etat * 1.1, class: "codex-point etat-" + etat });
    point.style.setProperty("--c", COULEURS[f.categorie]);
    lien.appendChild(point);
    s.appendChild(lien);
  });
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
    const adresse = lien.startsWith("#") ? lien : "#" + lien.replace(":", "/");
    carte.appendChild(lienVers(adresse, a ? T("Revoir") : T("Y aller"), "lien-discret"));
    grille.appendChild(carte);
  });
  p.appendChild(grille);
}

function ongletReglages(p) {
  const profil = lire("profil", {}) || {};
  const champ = el("input", "champ");
  champ.maxLength = 24;
  champ.value = profil.pseudo || "";
  champ.id = "pseudo-profil";
  const etiquette = el("label", "consigne", "Pseudonyme (24 caractères au plus ; il reste sur cet appareil)");
  etiquette.htmlFor = champ.id;
  champ.addEventListener("change", () => { ecrire("profil", { ...profil, pseudo: champ.value.trim().slice(0, 24) }); afficherPageProfil(); });
  p.append(etiquette, champ);
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
  // Synchronisation chiffrée (coffre.js), seulement si elle est en service
  const place = el("div");
  p.appendChild(place);
  blocSynchro().then(b => { if (b) place.appendChild(b); }).catch(() => {});
  p.appendChild(lienVers("#guide/maitrise", "Comment votre maîtrise est calculée", "lien-discret"));
  p.appendChild(el("br"));
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
  roue.setAttribute("aria-label", T("Le codex des notions"));
  roue.appendChild(codex(120));
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
  bloc.appendChild(graphiqueBarres(T("Maîtrise de ce jeu, avant et après la partie"), [[T("Avant"), avant.jeu], [T("Après"), apres]], 1000, [500, 750]));
  const r = resultatAtelier(id);
  const niveauMax = r && r.niveaux ? Math.max(...Object.keys(r.niveaux).map(Number)) : 0;
  if (MAITRISE_JEUX[id][1] === "note" && niveauMax && niveauMax < 3) bloc.appendChild(el("p", "source", T("Pour dépasser {0}, jouez au niveau {1}.", PLAFONDS_NIVEAU[niveauMax], niveauMax + 1)));
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
  bloc.append(graphiqueHasard(T("Votre score face au hasard : les scores qu'on obtiendrait en répondant au hasard"), proba, score), el("p", null, phrase));
  return bloc;
}
