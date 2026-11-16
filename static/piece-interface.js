// piece-interface.js : la pièce du jour à l'écran (tests/piece-brief.md, § 5 et 6). Le moteur (piece.js) fabrique la
// pièce ; ce fichier la met en page selon son format, conduit les étapes (repérer, nommer, certitude, chiffrer,
// conclure) puis rend la contre-expertise, calculée sur la pièce et jamais écrite à la main.
// Avant la correction, le DOM ne porte aucune trace de l'état des zones : même balise, mêmes classes (le rôle de la
// zone, jamais son état), même ordre que la pièce honnête. Route #piece, inscrite seulement si PIECE_VISIBLE (app.js).

const PIECE_ETAPES = [["reperer", "Repérer"], ["nommer", "Nommer"], ["chiffrer", "Chiffrer"], ["conclure", "Conclure"]];
const PIECE_VERDICTS = [["etablie", "établie par ce qu'elle montre"], ["non-etablie", "non établie, mais peut-être vraie"], ["contredite", "contredite par la pièce elle-même"]];
// Rôles de la figure d'une brève : trois sous-zones dessinées ensemble
const PIECE_FIGURE = ["figure-axe", "figure-trace", "figure-legende"];
// Partie en cours (gardée en mémoire : ouvrir une fiche depuis la correction puis revenir la retrouve telle quelle)
let pieceEnCours = null;

// ===================== Route =====================
// #piece : la pièce du jour, au niveau du joueur ; #piece/<niveau>-<graine> : une pièce libre, partageable
function afficherPiece(id) {
  const vue = $("vue-piece");
  const libre = /^([1-4])-(\d{1,9})$/.exec(id || "");
  const cle = libre ? "libre-" + id : "jour-" + aujourdHui();
  if (!pieceEnCours || pieceEnCours.cle !== cle) {
    const niveau = libre ? Number(libre[1]) : Math.min(4, niveauAtelier("piece").niveau);
    const piece = libre ? pieceLibre(niveau, Number(libre[2])) : pieceDuJour(aujourdHui(), niveau);
    pieceEnCours = { cle, piece, etape: "reperer", ordre: [], noms: {}, rien: false, certitude: null, chiffres: [], verdict: null, verso: false, resultat: null };
  }
  vue.replaceChildren();
  const p = pieceEnCours.piece;
  const tete = el("div", "pdj-tete");
  tete.append(el("p", "surtitre", p.libre ? "Pièce libre" : "La pièce du jour"),
    el("h1", "page-titre", p.libre ? "Une pièce à expertiser" : "La pièce du jour"),
    el("p", "page-intro", "Un document fictif, peut-être truqué. Repérez ce qui trompe, nommez le procédé, puis lisez la contre-expertise."));
  const mise = el("div", "pdj-mise");
  mise.style.setProperty("--c", p.couleur);
  const rail = el("aside", "pdj-rail");
  rail.setAttribute("aria-label", T("Expertise"));
  // Barre d'étapes : collante en haut de l'écran sur téléphone, en tête du rail sur ordinateur (grille, style.css)
  mise.append(el("div", "pdj-barre"), pieceFeuille(p, pieceEnCours.verso), rail);
  vue.append(tete, mise);
  pieceRail();
  if (pieceEnCours.resultat) pieceAnnoter(false);
}

// ===================== La feuille =====================
// Étiquette, puis les zones dans l'ordre de lecture du format. verso : la pièce rectifiée (textes honnêtes)
function pieceFeuille(p, verso) {
  const feuille = el("article", "pdj-feuille pdj-" + p.format);
  feuille.setAttribute("aria-label", verso ? T("Pièce rectifiée") : T("Pièce à expertiser"));
  feuille.appendChild(el("p", "pdj-etiquette", (p.libre ? T("Pièce libre") : T("Pièce n° {0}", p.numero)) + " · "
    + T("Niveau {0}, {1}", p.niveau, NOMS_NIVEAUX[p.niveau]) + " · " + T("Document fictif") + (verso ? " · " + T("Version rectifiée") : "")));
  const m = PIECE_MONDES.find(x => x.id === p.monde);
  const role = r => p.zones.find(z => z.role === r);
  const zone = r => { const z = role(r); return z ? pieceZone(p, z, verso) : null; };
  const ajouter = (parent, ...enfants) => enfants.forEach(e => { if (e) parent.appendChild(e); });
  const bloc = (classe, ...enfants) => { const b = el("div", classe); ajouter(b, ...enfants); return b.childNodes.length ? b : null; };
  const f = p.format;
  if (f === "breve") {
    ajouter(feuille, el("p", "pdj-rubrique", T(m.rubrique)), zone("titre"), zone("chapo"), pieceFigure(p, verso),
      zone("phrase-contexte"), zone("phrase-chiffre"), zone("phrase-changement"), zone("phrase-citation"), zone("source"),
      el("p", "pdj-signature", T("La rédaction")));
  } else if (f === "publicite") {
    ajouter(feuille, bloc("pdj-aplat", zone("slogan"), zone("chiffre-cle"), zone("prix")), zone("caution"), zone("temoignage"),
      zone("petites-lignes"), zone("source"));
  } else if (f === "etude") {
    ajouter(feuille, el("p", "pdj-rubrique", T("Communiqué")), zone("titre"), zone("resultat"),
      bloc("pdj-methode", el("p", "pdj-intertitre", T("Méthode")), zone("methode-effectif"), zone("methode-comparaison"), zone("methode-recrutement"), zone("methode-financeur")),
      zone("tableau"), bloc("pdj-exergue", zone("conclusion")), zone("source"));
  } else if (f === "sondage") {
    ajouter(feuille, el("p", "pdj-rubrique", T("Sondage")), bloc("pdj-exergue", zone("question")), zone("barres"), zone("commentaire"),
      bloc("pdj-methode", el("p", "pdj-intertitre", T("Fiche technique")), zone("fiche-effectif"), zone("fiche-dates"), zone("fiche-recueil")), zone("source"));
  } else if (f === "reseau") {
    const tete = el("div", "pdj-compte");
    tete.appendChild(pieceAvatar(m.couleur));
    ajouter(tete, zone("compte"));
    ajouter(feuille, tete, zone("texte"), bloc("pdj-image", zone("image-chiffre"), zone("image-legende")), zone("partages"),
      bloc("pdj-reponses", zone("reponse"), zone("reponse-2"), zone("reponse-3")), zone("date"));
  } else if (f === "bulletin") {
    const bandeau = el("div", "pdj-bandeau");
    bandeau.appendChild(pieceBlason());
    ajouter(bandeau, zone("bandeau") || el("p", "pdj-bandeau-texte", T("Le journal {0}", T(m.acteurDe))));
    ajouter(feuille, bandeau, bloc("pdj-colonnes", zone("bilan-avant"), zone("bilan-apres")), bloc("pdj-methode", zone("chiffres")),
      zone("citation"), zone("phrase-changement"), zone("phrase-option"), zone("objectif-initial"), zone("objectif-verdict"), zone("source"));
  }
  return feuille;
}

// Une zone : un vrai bouton, cible de 44 px. Sa classe dit son rôle (titre, source…), jamais son état
function pieceZone(p, z, verso) {
  const b = el("button", "pdj-zone pdj-r-" + z.role);
  b.type = "button";
  b.dataset.zone = z.id;
  b.appendChild(el("span", "pdj-texte", verso ? z.rectifie : z.texte));
  if (z.role === "barres") pieceBarresSondage(b, verso ? z.honnete : z.d);
  if (verso || pieceEnCours.resultat) b.setAttribute("aria-disabled", "true");
  else pieceMarqueSur(b);
  b.addEventListener("click", () => pieceToucher(z.id));
  return b;
}

// Figure de la brève : axe (graduations), tracé (barres ou courbe), légende. Une partie qui n'est pas une zone est
// dessinée sans être touchable (piece.decor). Les valeurs viennent des données de la zone (honnêtes au verso).
function pieceFigure(p, verso) {
  const parties = PIECE_FIGURE.map(r => {
    const z = p.zones.find(x => x.role === r);
    if (z) return { z, d: verso ? z.honnete : z.d };
    const dec = (p.decor || []).find(x => x.role === r);
    return dec ? { z: null, d: dec.d } : null;
  });
  if (!parties.some(x => x && x.z)) return null;
  const [axe, trace, legende] = parties;
  const fig = el("div", "pdj-figure");
  const a = axe.d.axe, t = trace.d.trace;
  const haut = 12, bas = 160;
  const y = v => a.inverse ? haut + (bas - haut) * (v - a.min) / (a.max - a.min) : bas - (bas - haut) * (Math.max(a.min, v) - a.min) / (a.max - a.min);
  // Axe : cinq graduations
  const sa = svg("svg", { viewBox: "0 0 60 190", class: "pdj-svg-axe", "aria-hidden": "true" });
  for (let k = 0; k <= 4; k++) {
    const v = a.min + (a.max - a.min) * k / 4;
    sa.appendChild(svg("line", { x1: 52, y1: y(v), x2: 59, y2: y(v), class: "pdj-trait" }));
    const tx = svg("text", { x: 48, y: y(v) + 4, class: "pdj-graduation", "text-anchor": "end" });
    tx.textContent = fr(Math.round(v));
    sa.appendChild(tx);
  }
  sa.appendChild(svg("line", { x1: 59, y1: haut, x2: 59, y2: bas, class: "pdj-trait" }));
  // Tracé
  const st = svg("svg", { viewBox: "0 0 280 190", class: "pdj-svg-trace", "aria-hidden": "true" });
  const n = t.valeurs.length, pas = 264 / n, x = k => 8 + pas * (k + 0.5);
  for (let k = 0; k <= 4; k++) st.appendChild(svg("line", { x1: 0, y1: haut + (bas - haut) * k / 4, x2: 280, y2: haut + (bas - haut) * k / 4, class: "pdj-grille" }));
  if (a.type === "barres") {
    t.valeurs.forEach((v, k) => {
      const y0 = y(a.min), y1 = y(v);
      st.appendChild(svg("rect", { x: x(k) - pas * 0.3, y: Math.min(y0, y1), width: pas * 0.6, height: Math.abs(y0 - y1), class: "pdj-barre" }));
    });
  } else {
    st.appendChild(svg("polyline", { points: t.valeurs.map((v, k) => x(k) + "," + y(v)).join(" "), class: "pdj-courbe" }));
    t.valeurs.forEach((v, k) => st.appendChild(svg("circle", { cx: x(k), cy: y(v), r: 3, class: "pdj-point" })));
  }
  [0, n - 1].forEach(k => {
    const tx = svg("text", { x: x(k), y: 182, class: "pdj-graduation", "text-anchor": "middle" });
    tx.textContent = String(t.annees[k]);
    st.appendChild(tx);
  });
  st.appendChild(svg("line", { x1: 0, y1: a.inverse ? haut : bas, x2: 280, y2: a.inverse ? haut : bas, class: "pdj-trait" }));
  const m = PIECE_MONDES.find(z => z.id === p.monde);
  const enveloppe = (partie, dessin, classe) => {
    if (partie.z) {
      const b = pieceZone(p, partie.z, verso);
      b.classList.add(classe);
      // Nom accessible : ce que montre la partie (graduations, valeurs), jamais son état
      b.setAttribute("aria-label", verso ? partie.z.rectifie : partie.z.texte);
      b.firstChild.remove();
      b.prepend(dessin);
      return b;
    }
    const div = el("div", "pdj-decor " + classe);
    div.appendChild(dessin);
    div.setAttribute("role", "img");
    div.setAttribute("aria-label", pieceTexteZone(classe === "pdj-f-axe" ? "figure-axe" : classe === "pdj-f-trace" ? "figure-trace" : "figure-legende", partie.d, p, m, null));
    return div;
  };
  const rang = el("div", "pdj-figure-rang");
  rang.append(enveloppe(axe, sa, "pdj-f-axe"), enveloppe(trace, st, "pdj-f-trace"));
  const leg = el("span", "pdj-texte", pieceTexteZone("figure-legende", legende.d, p, m, null));
  fig.append(rang, enveloppe(legende, leg, "pdj-f-legende"));
  return fig;
}

// Barres du sondage : une ligne par réponse, longueur lue sur l'axe affiché (de min à max), valeur écrite. Le texte
// devient le nom accessible ; l'axe est écrit sous les barres, comme sur la pièce.
function pieceBarresSondage(b, d) {
  const a = d.axe;
  b.setAttribute("aria-label", b.textContent);
  b.firstChild.remove();
  const liste = el("span", "pdj-sondage");
  [["Oui", d.oui], ["Non", d.non], ["Sans avis", d.sansAvis]].forEach(([nom, v]) => {
    const ligne = el("span", "pdj-sondage-ligne");
    const barre = el("span", "pdj-sondage-barre");
    barre.style.setProperty("--part", String(Math.max(0, Math.min(1, (v - a.min) / (a.max - a.min)))));
    ligne.append(el("span", "pdj-sondage-nom", nom), barre, el("span", "pdj-sondage-valeur", fr(v) + " %"));
    liste.appendChild(ligne);
  });
  liste.appendChild(el("span", "pdj-sondage-axe", T("Axe de {0} à {1} %", fr(a.min), fr(a.max))));
  b.appendChild(liste);
}

// Avatar du réseau fictif : un glyphe géométrique, jamais un visage ; blason du bulletin : losange et ailettes
function pieceAvatar() {
  const s = svg("svg", { viewBox: "0 0 40 40", class: "pdj-avatar", "aria-hidden": "true" });
  s.append(svg("circle", { cx: 20, cy: 20, r: 18, class: "pdj-avatar-fond" }), svg("path", { d: "M10 26L20 12L30 26Z", class: "pdj-avatar-trait" }));
  return s;
}
function pieceBlason() {
  const s = svg("svg", { viewBox: "0 0 40 46", class: "pdj-blason", "aria-hidden": "true" });
  s.append(svg("path", { d: "M4 4H36V24Q36 38 20 44Q4 38 4 24Z", class: "pdj-avatar-fond" }), svg("path", { d: "M10 22H30M10 22l5-5M10 22l5 5M30 22l-5-5M30 22l-5 5", class: "pdj-avatar-trait" }));
  return s;
}

// ===================== Marques =====================
function pieceMarqueSur(b) {
  const e = pieceEnCours, rang = e.ordre.indexOf(b.dataset.zone);
  b.setAttribute("aria-pressed", String(rang >= 0));
  const ancienne = b.querySelector(".pdj-pastille");
  if (ancienne && rang >= 0 && ancienne.textContent === String(rang + 1)) return;
  if (ancienne) ancienne.remove();
  if (rang >= 0) {
    const pastille = el("span", "pdj-pastille", String(rang + 1));
    pastille.setAttribute("aria-hidden", "true");
    b.appendChild(pastille);
    // Seule une marque nouvelle se pose en mouvement (une marque renumérotée change sans bouger)
    if (!ancienne) animer(pastille, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }], { duration: 160 });
  }
}
// Toucher une zone : marque posée ou retirée (seulement à l'étape « Repérer »)
function pieceToucher(id) {
  const e = pieceEnCours;
  if (e.resultat || e.verso) return;
  if (e.etape !== "reperer") { annoncer(T("Revenez à l'étape « Repérer » pour changer vos marques.")); return; }
  const i = e.ordre.indexOf(id);
  if (i >= 0) { e.ordre.splice(i, 1); delete e.noms[id]; } else { e.ordre.push(id); e.rien = false; }
  document.querySelectorAll("#vue-piece .pdj-zone").forEach(pieceMarqueSur);
  pieceRail();
}
const pieceCompte = n => n === 0 ? T("Aucune marque posée") : n === 1 ? T("1 marque posée") : T("{0} marques posées", n);

// ===================== Le rail : étapes et contrôles =====================
function pieceRail(focus) {
  const e = pieceEnCours, p = e.piece, rail = document.querySelector("#vue-piece .pdj-rail");
  rail.replaceChildren();
  const haut = p.niveau >= 3;
  const etapes = el("ol", "pdj-etapes");
  etapes.setAttribute("aria-label", T("Étapes"));
  const courante = e.resultat ? null : e.etape === "certitude" ? "nommer" : e.etape;
  PIECE_ETAPES.filter(([id]) => haut || (id !== "chiffrer" && id !== "conclure")).forEach(([id, nom], k) => {
    const li = el("li");
    li.append(el("span", "pdj-etape-num", String(k + 1)), el("span", "pdj-etape-nom", nom));
    if (id === courante) li.setAttribute("aria-current", "step");
    etapes.appendChild(li);
  });
  document.querySelector("#vue-piece .pdj-barre").replaceChildren(etapes);
  const corps = el("div", "pdj-corps");
  rail.appendChild(corps);
  const titre = texte => { const h = el("h2", "pdj-titre-etape", texte); h.tabIndex = -1; corps.appendChild(h); return h; };
  const bouton = (texte, action, classe) => { const b = el("button", "bouton" + (classe ? " " + classe : ""), texte); b.type = "button"; b.addEventListener("click", action); return b; };
  const aller = etape => { e.etape = etape; pieceRail(true); };
  let h;
  if (e.resultat) {
    h = titre("Contre-expertise");
    pieceRapport(corps);
  } else if (e.etape === "reperer") {
    h = titre("Repérer");
    corps.appendChild(el("p", null, p.annonce ? T("Un piège se cache dans cette pièce. Touchez la zone qui trompe.")
      : T("Touchez les zones qui trompent. Si rien ne cloche, déclarez « Rien à signaler » : la retenue rapporte autant que la détection.")));
    const compteur = el("p", "pdj-compteur", e.rien ? T("Rien à signaler") : pieceCompte(e.ordre.length));
    compteur.setAttribute("aria-live", "polite");
    corps.appendChild(compteur);
    const actions = el("div", "pdj-actions");
    if (!p.annonce) {
      const rien = bouton("Rien à signaler", () => {
        e.rien = !e.rien;
        if (e.rien) { e.ordre = []; e.noms = {}; }
        document.querySelectorAll("#vue-piece .pdj-zone").forEach(pieceMarqueSur);
        pieceRail();
        document.querySelector("#vue-piece .pdj-rien").focus();
      }, "secondaire pdj-rien");
      rien.setAttribute("aria-pressed", String(e.rien));
      actions.appendChild(rien);
    }
    const suite = bouton("Continuer", () => aller(e.rien ? "certitude" : "nommer"));
    suite.disabled = !e.rien && !e.ordre.length;
    actions.appendChild(suite);
    corps.appendChild(actions);
  } else if (e.etape === "nommer") {
    h = titre("Nommer");
    corps.appendChild(el("p", null, "Pour chaque marque, quel procédé est à l'œuvre ?"));
    e.ordre.forEach((id, k) => {
      const z = p.zones.find(x => x.id === id);
      const groupe = el("fieldset", "pdj-nommer");
      groupe.appendChild(el("legend", null, T("Marque {0} : « {1} »", k + 1, pieceExtrait(z))));
      pieceOptionsNommer(p, z).forEach(proc => {
        const b = el("button", "choix", PIECE_PROCEDES[proc].nom);
        b.type = "button";
        b.setAttribute("aria-pressed", String(e.noms[id] === proc));
        b.addEventListener("click", () => {
          e.noms[id] = proc;
          groupe.querySelectorAll(".choix").forEach(c => c.setAttribute("aria-pressed", String(c === b)));
          corps.querySelector(".pdj-suite").disabled = e.ordre.some(x => !e.noms[x]);
        });
        groupe.appendChild(b);
      });
      corps.appendChild(groupe);
    });
    const actions = el("div", "pdj-actions");
    const suite = bouton("Continuer", () => aller("certitude"), "pdj-suite");
    suite.disabled = e.ordre.some(x => !e.noms[x]);
    actions.append(bouton("Revoir mes marques", () => aller("reperer"), "secondaire"), suite);
    corps.appendChild(actions);
  } else if (e.etape === "certitude") {
    h = titre("Votre relevé est-il exact ?");
    corps.appendChild(el("p", null, e.rien ? T("Votre relevé : rien à signaler.") : pieceCompte(e.ordre.length) + "."));
    const puces = el("div", "puces pdj-certitude");
    puces.setAttribute("role", "group");
    puces.setAttribute("aria-label", T("Certitude"));
    NIVEAUX_CERTITUDE.forEach(([id, nom]) => {
      const b = el("button", "puce", nom);
      b.type = "button";
      b.setAttribute("aria-pressed", String(e.certitude === id));
      // Le rail est reconstruit : le focus revient sur la certitude choisie
      b.addEventListener("click", () => { e.certitude = id; pieceRail(); document.querySelector("#vue-piece .pdj-certitude [aria-pressed='true']").focus(); });
      puces.appendChild(b);
    });
    corps.appendChild(puces);
    corps.appendChild(el("p", "source", "Avant le verrouillage, tout se modifie ; après, plus rien."));
    const actions = el("div", "pdj-actions");
    const verrou = bouton("Verrouiller mon relevé", () => (haut ? aller("chiffrer") : pieceTerminer()));
    verrou.disabled = !e.certitude;
    actions.append(bouton("Modifier mon relevé", () => aller(e.rien ? "reperer" : "nommer"), "secondaire"), verrou);
    corps.appendChild(actions);
  } else if (e.etape === "chiffrer") {
    h = titre("Chiffrer");
    const q = p.chiffrer[0];
    corps.appendChild(el("p", "pdj-question", pieceQuestion(p, q)));
    if (q.options) {
      const groupe = el("div", "pdj-options");
      q.options.forEach(v => {
        const b = el("button", "choix", pieceSigne(v) + " %");
        b.type = "button";
        b.addEventListener("click", () => { e.chiffres = [v]; aller("conclure"); });
        groupe.appendChild(b);
      });
      corps.appendChild(groupe);
    } else {
      const forme = el("form", "pdj-saisie");
      const etiquette = el("label", null, "Votre réponse, en %");
      const champ = el("input");
      Object.assign(champ, { type: "text", inputMode: "numeric", id: "pdj-champ", autocomplete: "off" });
      etiquette.htmlFor = "pdj-champ";
      const valider = el("button", "bouton", "Valider");
      valider.type = "submit";
      const erreur = el("p", "pdj-erreur");
      erreur.setAttribute("aria-live", "polite");
      forme.append(etiquette, champ, valider, erreur);
      forme.addEventListener("submit", ev => {
        ev.preventDefault();
        const v = lireNombre(champ.value.replace(/[%\s]/g, "").replace("−", "-"));
        if (!Number.isFinite(v)) { erreur.textContent = T("Écrivez un nombre, par exemple −12 ou 35."); champ.focus(); return; }
        e.chiffres = [v];
        aller("conclure");
      });
      corps.appendChild(forme);
    }
  } else if (e.etape === "conclure") {
    h = titre("Conclure");
    corps.appendChild(el("p", null, "La conclusion de la pièce est :"));
    const groupe = el("div", "pdj-options");
    PIECE_VERDICTS.forEach(([id, nom]) => {
      const b = el("button", "choix", nom);
      b.type = "button";
      b.addEventListener("click", () => { e.verdict = id; pieceTerminer(); });
      groupe.appendChild(b);
    });
    corps.appendChild(groupe);
  }
  if (focus && h) h.focus();
}

// Extrait d'une zone, pour la nommer dans le rail (« Marque 2 : « Source : … » »)
function pieceExtrait(z) {
  const t = z.texte.replace(/\s+/g, " ").trim();
  return t.length > 60 ? t.slice(0, 57).replace(/\s\S*$/, "") + "…" : t;
}
const pieceSigne = v => (v > 0 ? "+" : v < 0 ? "−" : "") + fr(Math.abs(v));
// La question chiffrée, selon son type (calculée par le moteur sur la vérité)
function pieceQuestion(p, q) {
  const m = PIECE_MONDES.find(x => x.id === p.monde);
  if (q.type === "variation") return T("D'après la pièce, de combien {0} a-t-il varié entre {1} et {2}, en pourcentage ?", T(m.mesure), q.a1, q.a2);
  if (q.type === "variation-bilan") return T("D'après l'encadré chiffré, de combien le dernier relevé s'écarte-t-il de la moyenne des trois années précédentes, en pourcentage ?");
  if (q.type === "remise") return T("Par rapport au prix pratiqué jusqu'au mois dernier, quelle est la vraie remise, en pourcentage ?");
  if (q.type === "ecart-sondage") return T("Combien de points de pourcentage séparent le oui du non ?");
  return T("Quelle part des participants, en pourcentage, a quitté l'étude avant la fin ?");
}

// ===================== Fin et contre-expertise =====================
function pieceTerminer() {
  const e = pieceEnCours, p = e.piece;
  e.resultat = noterPiece(p, { marques: Object.fromEntries(e.ordre.map(id => [id, e.noms[id] || null])), rien: e.rien, chiffres: e.chiffres, verdict: e.verdict, certitude: e.certitude });
  e.etape = "fin";
  document.querySelectorAll("#vue-piece .pdj-zone").forEach(b => b.setAttribute("aria-disabled", "true"));
  pieceAnnoter(true);
  pieceRail(true);
}

// État d'une zone à la correction : trouvé, manqué, fausse alerte, leurre évité, toléré ; null si rien à dire
function pieceEtatZone(p, z, marquee) {
  if (z.etat === "piegee") return marquee ? "trouve" : "manque";
  if (z.toleres.length) return marquee ? "tolere" : null;
  if (z.etat === "leurre") return marquee ? "fausse" : "evite";
  return marquee ? "fausse" : null;
}
const PIECE_ETATS = { trouve: "Trouvé", manque: "Manqué", fausse: "Fausse alerte", evite: "Leurre évité", tolere: "Ni juste ni faux" };

// Annote la pièce comme une copie corrigée : pastille, état (glyphe, mot, couleur), procédé, preuve, version honnête
function pieceAnnoter(animer_) {
  const e = pieceEnCours, p = e.piece, feuille = document.querySelector("#vue-piece .pdj-feuille");
  if (!feuille || e.verso) return;
  const annotees = [];
  p.zones.forEach(z => {
    const b = feuille.querySelector('[data-zone="' + z.id + '"]');
    if (!b) return;
    const marquee = e.ordre.includes(z.id), etat = pieceEtatZone(p, z, marquee);
    b.classList.remove("pdj-etat-trouve", "pdj-etat-manque", "pdj-etat-fausse", "pdj-etat-evite", "pdj-etat-tolere");
    if (!etat) return;
    b.classList.add("pdj-etat-" + etat);
    const ancre = b.closest(".pdj-figure") || b;
    let notes = ancre.nextElementSibling;
    if (!notes || !notes.classList.contains("pdj-notes")) { notes = el("div", "pdj-notes"); ancre.after(notes); }
    const note = pieceNote(p, z, etat);
    notes.appendChild(note);
    annotees.push(note);
  });
  // La révélation : les annotations apparaissent l'une après l'autre (état final déjà posé)
  if (animer_) annotees.forEach((n, k) => animer(n, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: 60 * k, fill: "backwards" }));
}

const PIECE_GLYPHES = { trouve: "M4 10l4 4 8-9", manque: "M10 4v8M10 15.5v.5", fausse: "M5 5l10 10M15 5L5 15", evite: "M3 10h14M3 10l4-4M3 10l4 4M17 10l-4-4M17 10l-4 4", tolere: "M4 10h12" };
function pieceNote(p, z, etat) {
  const e = pieceEnCours, note = el("div", "pdj-note pdj-note-" + etat);
  const tete = el("p", "pdj-note-etat");
  const g = svg("svg", { viewBox: "0 0 20 20", class: "pdj-glyphe", "aria-hidden": "true" });
  g.appendChild(svg("path", { d: PIECE_GLYPHES[etat] }));
  const rang = e.ordre.indexOf(z.id);
  tete.append(g, texteNoeud(T(PIECE_ETATS[etat]) + (rang >= 0 ? " · " + T("marque {0}", rang + 1) : "")));
  note.appendChild(tete);
  if (z.etat === "piegee") {
    const P = PIECE_PROCEDES[z.procede];
    note.appendChild(el("p", "pdj-note-nom", P.nom));
    note.appendChild(el("p", null, P.trompe));
    const preuves = (z.preuves || []).map(id => p.zones.find(x => x.id === id)).filter(Boolean);
    if (preuves.length) {
      const ligne = el("p", "pdj-preuve", "La preuve est ici : ");
      preuves.forEach((q, k) => {
        const lien = el("button", "lien", "« " + pieceExtrait(q) + " »");
        lien.type = "button";
        lien.addEventListener("click", () => { const cible = document.querySelector('#vue-piece [data-zone="' + q.id + '"]'); if (cible) { cible.scrollIntoView({ block: "center" }); cible.focus(); } });
        if (k) ligne.appendChild(texteNoeud(", "));
        ligne.appendChild(lien);
      });
      note.appendChild(ligne);
    }
    const honnete = el("p", "pdj-honnete");
    honnete.append(el("del", null, z.texte), el("span", "pdj-fleche", " → "), el("ins", null, z.rectifie));
    note.appendChild(honnete);
    const nomme = e.noms[z.id];
    if (rang >= 0 && nomme && nomme !== z.procede) {
      const voisin = P.voisins.includes(nomme);
      const ligne = el("p", "pdj-nomme");
      ligne.append(el("del", null, PIECE_PROCEDES[nomme].nom), texteNoeud(voisin ? " " + T("(voisin : la moitié des points du nom)") : ""));
      note.appendChild(ligne);
      // Ce qui sépare : ce que fait le procédé choisi, que la pièce ne fait pas ici
      note.appendChild(el("p", "pdj-separe", T("≠ {0} : {1}", T(PIECE_PROCEDES[nomme].nom), T(PIECE_PROCEDES[nomme].trompe))));
    }
    if (P.fiche) note.appendChild(pieceLienFiche(P.fiche));
  } else if (z.etat === "leurre") {
    note.appendChild(el("p", null, PIECE_LEURRES[z.leurre].pourquoi));
    if (etat === "fausse") note.appendChild(el("p", "pdj-note-nom", T("Il ressemble à : {0}", T(PIECE_PROCEDES[PIECE_LEURRES[z.leurre].imite] ? PIECE_PROCEDES[PIECE_LEURRES[z.leurre].imite].nom : "")) ));
  } else if (etat === "tolere") {
    note.appendChild(el("p", null, "Cette conclusion n'est pas établie, à cause d'un piège ailleurs sur la pièce : la marquer ne compte ni juste ni faux. C'est le piège lui-même qu'il fallait trouver."));
  } else {
    note.appendChild(el("p", null, "Rien ne cloche ici : ce que dit cette zone est exact, et elle n'en tire aucune conclusion."));
  }
  return note;
}

// Lien vers la fiche (« B 10 · Nom ») ou l'atelier lié au procédé
function pieceLienFiche(ref) {
  const [type, id] = ref.split(":");
  const p = el("p", "pdj-fiche");
  if (type === "atelier") {
    const a = tousLesAteliers().find(x => x.atelier.id === id);
    if (a) p.appendChild(lienVers(a.adresse, T("Atelier « {0} »", T(a.atelier.titre)), "lien-texte"));
  } else {
    const f = trouverFiche(type, id);
    if (f) p.appendChild(lienVers("#" + type + "/" + id, (type === "biais" ? "B " : "S ") + f.num + " · " + f.nom, "lien-texte"));
  }
  return p;
}

// Rapport d'expertise : note (la chute), détail par part, chiffre et verdict corrigés, étalonnage, partage, suites
function pieceRapport(corps) {
  const e = pieceEnCours, p = e.piece, r = e.resultat, haut = p.niveau >= 3;
  const note = el("p", "grand-score pdj-note-finale", T("{0} / 10", r.note));
  corps.appendChild(note);
  animer(note, [{ opacity: 0, transform: "translateY(-28px)" }, { opacity: 1, transform: "translateY(3px)", offset: 0.75 }, { opacity: 1, transform: "none" }], { duration: 560 });
  const parts = [["Repérage", r.parts.reperage, haut ? 5 : 7], ["Nom", r.parts.nom, haut ? 2 : 3]];
  if (haut) parts.push(["Chiffre", r.parts.chiffre, 2], ["Verdict", r.parts.verdict, 1]);
  const liste = el("dl", "pdj-parts");
  parts.forEach(([nom, v, sur]) => {
    const ligne = el("div", "pdj-part");
    const barre = el("span", "pdj-part-barre");
    barre.style.setProperty("--part", String(Math.max(0, Math.min(1, v / sur))));
    barre.setAttribute("aria-hidden", "true");
    const dd = el("dd", null, T("{0} sur {1}", fr(Math.round(v * 10) / 10), sur));
    dd.prepend(barre);
    ligne.append(el("dt", null, nom), dd);
    liste.appendChild(ligne);
  });
  corps.appendChild(liste);
  const pieges = p.zones.filter(z => z.etat === "piegee").length;
  corps.appendChild(el("p", null, pieges === 0
    ? (e.rien ? T("Pièce saine, reconnue comme telle : rien à signaler, et vous l'avez vu.") : T("Pièce saine : il n'y avait rien à signaler."))
    : T("Pièges : {0} trouvé(s) sur {1} ; fausses alertes : {2}.", r.F, r.P, r.A)));
  // Étalonnage : la certitude annoncée face à l'exactitude du relevé
  const sur = { sur: "sûr", plutot: "plutôt sûr", hasard: "au hasard" }[e.certitude];
  corps.appendChild(el("p", "pdj-etalonnage", r.exact ? T("Vous étiez {0}, et votre relevé était exact.", T(sur)) : T("Vous étiez {0}, et votre relevé n'était pas exact.", T(sur))));
  if (haut) {
    const q = p.chiffrer[0], x = e.chiffres[0], juste = typeof x === "number" && Math.abs(x - q.reponse) <= (q.options ? 0 : q.tolerance);
    const bloc = el("div", "pdj-correction-etape");
    bloc.append(el("p", "pdj-intertitre", "Chiffrer"), el("p", null, pieceQuestion(p, q)));
    if (!juste) { const l = el("p", null, T("Votre réponse : ")); l.appendChild(el("del", null, pieceSigne(x) + " %")); bloc.appendChild(l); }
    bloc.appendChild(el("p", "pdj-attendu", T("Réponse attendue : {0} %", pieceSigne(q.reponse)) + (q.options ? "" : " " + T("(à {0} points près)", q.tolerance))));
    corps.appendChild(bloc);
    const conc = el("div", "pdj-correction-etape");
    conc.append(el("p", "pdj-intertitre", "Conclure"));
    const nom = id => T(PIECE_VERDICTS.find(v => v[0] === id)[1]);
    if (e.verdict !== p.verdict) { const l = el("p", null, T("Votre verdict : ")); l.appendChild(el("del", null, nom(e.verdict))); conc.appendChild(l); }
    conc.appendChild(el("p", "pdj-attendu", T("Conclusion attendue : {0}.", nom(p.verdict))));
    if (p.verdict === "non-etablie") conc.appendChild(el("p", null, "Une preuve fautive ne rend pas la conclusion fausse : elle ne l'établit pas, voilà tout."));
    const f = trouverFiche("sophismes", "sophisme-sophisme");
    if (f) conc.appendChild(pieceLienFiche("sophismes:sophisme-sophisme"));
    corps.appendChild(conc);
  }
  // Retournement : la pièce rectifiée au verso
  const actions = el("div", "pdj-actions pdj-actions-fin");
  const bascule = el("button", "bouton secondaire pdj-bascule", e.verso ? "Voir la pièce d'origine" : "Voir la pièce rectifiée");
  bascule.type = "button";
  bascule.setAttribute("aria-pressed", String(e.verso));
  bascule.addEventListener("click", () => pieceRetourner());
  const partager = el("button", "bouton secondaire", "Partager mon relevé");
  partager.type = "button";
  partager.addEventListener("click", () => piecePartager());
  actions.append(bascule, partager);
  corps.appendChild(actions);
  const suite = lienVers("#piece/" + p.niveau + "-" + (1 + Math.floor(Math.random() * 999999)), "Une pièce libre, au même niveau", "lien-texte pdj-suite-libre");
  corps.appendChild(el("p", null)).appendChild(suite);
}

// Le retournement : la feuille pivote, du recto annoté au verso rectifié (échange simple si le mouvement est réduit)
function pieceRetourner() {
  const e = pieceEnCours;
  e.verso = !e.verso;
  const ancienne = document.querySelector("#vue-piece .pdj-feuille");
  // Les annotations suivent la feuille d'origine : on les retire au verso, on les repose au recto
  document.querySelectorAll("#vue-piece .pdj-notes").forEach(n => n.remove());
  const nouvelle = pieceFeuille(e.piece, e.verso);
  ancienne.replaceWith(nouvelle);
  if (!e.verso) pieceAnnoter(false);
  animer(nouvelle, [{ opacity: 0.3, transform: "perspective(1400px) rotateY(-80deg)" }, { opacity: 1, transform: "none" }], { duration: 560 });
  const b = document.querySelector("#vue-piece .pdj-bascule");
  b.textContent = typo(T(e.verso ? "Voir la pièce d'origine" : "Voir la pièce rectifiée"));
  b.setAttribute("aria-pressed", String(e.verso));
  annoncer(T(e.verso ? "Pièce rectifiée affichée." : "Pièce d'origine affichée."));
}

// Relevé à partager : signes triés, jamais dans l'ordre des zones (la position trahirait la réponse)
function pieceTextePartage() {
  const e = pieceEnCours, p = e.piece, r = e.resultat;
  const tete = p.libre ? T("Pièce libre · niveau {0} · {1}/10", p.niveau, r.note) : T("Pièce n° {0} · niveau {1} · {2}/10", p.numero, p.niveau, r.note);
  const signes = "●".repeat(r.F) + "○".repeat(r.P - r.F) + "×".repeat(r.A);
  return tete + (signes ? "\n" + signes : "") + "\n" + T("Document fictif") + " · " + location.origin + location.pathname;
}
async function piecePartager() {
  const texte = pieceTextePartage();
  try {
    if (navigator.share) { await navigator.share({ text: texte }); return; }
    await navigator.clipboard.writeText(texte);
    annoncer(T("Relevé copié : {0}", texte));
  } catch (erreur) {
    if (erreur && erreur.name === "AbortError") return;
    annoncer(texte);
  }
}
