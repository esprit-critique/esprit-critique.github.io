// piece.js : moteur de « La pièce du jour » (lot P1). Fonctions pures, sans DOM : graines, rotation, génération, procédés
// (poser, detecte, preuves), rendu des textes, questions « Chiffrer », verdict, choix de « Nommer » et notation.
// Principe (brief, § 4.1) : la vérité d'abord, puis la présentation honnête, puis les pièges, puis les leurres.
// Chaque zone porte des données structurées (d) ; son texte en est tiré par rendrePiece(). detecte() ne lit que ces
// données : c'est ce qui rend un piège décidable et vérifiable par le banc (tests/piece_moteur.py).
// generateur, melanger (app.js), fr (ateliers.js) et T (langue.js) ne sont appelés que dans des fonctions.

// Drapeau : rien de la pièce n'est exposé tant qu'il vaut false (la copie d'essai des bancs le passe à true)
const PIECE_VISIBLE = false;
// Toute modification qui change une pièce existante incrémente la version (gardée avec chaque résultat)
const PIECE_VERSION = 1;
// Premier jour de la pièce du jour (17 novembre 2026) : la pièce n° 1
const PIECE_JOUR_UN = 20774;

// ===================== Hasard reproductible =====================
function pieceHash(texte) {
  let h = 2166136261;
  for (const c of String(texte)) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0;
  return h;
}
const pieceAlea = (...parts) => generateur(pieceHash(parts.join("|")));
const pieceEntier = (alea, a, b) => a + Math.floor(alea() * (b - a + 1));
const pieceChoix = (alea, liste) => liste[Math.floor(alea() * liste.length)];
const grainePiece = (jour, niveau) => pieceHash(["piece", PIECE_VERSION, jour, niveau].join("|"));
const numeroPiece = jour => jour - PIECE_JOUR_UN + 1;
// Arrondi lisible : 3 chiffres significatifs au-delà de 1 000, l'unité en dessous
const pieceRond = v => v >= 1000 ? Math.round(v / Math.pow(10, Math.floor(Math.log10(v)) - 2)) * Math.pow(10, Math.floor(Math.log10(v)) - 2) : Math.round(v);
const pieceCap = t => t.charAt(0).toUpperCase() + t.slice(1);
const piecePct = (a, b) => Math.round(100 * (b - a) / a);

// ===================== Ce qui est permis à un niveau =====================
// Un format n'entre que s'il a assez de zones pour le niveau (au niveau 4, ni la publicité ni le sondage : 7 zones)
const pieceFormatsNiveau = n => Object.keys(PIECE_FORMATS).filter(f => PIECE_FORMATS[f].niveau <= n && PIECE_FORMATS[f].zones.length >= PIECE_NIVEAUX[n].zones[0]);
const pieceProcedesNiveau = n => Object.keys(PIECE_PROCEDES).filter(p => PIECE_PROCEDES[p].niveau <= n && PIECE_NIVEAUX[n].familles.includes(PIECE_PROCEDES[p].famille)
  && Object.keys(PIECE_PROCEDES[p].formats).some(f => pieceFormatsNiveau(n).includes(f)));
const pieceMondeCompatible = (m, format, procedes) => (!PIECE_FORMATS[format].requiert || m[PIECE_FORMATS[format].requiert])
  && procedes.every(p => !PIECE_PROCEDES[p].requiert || m[PIECE_PROCEDES[p].requiert]);
const pieceProcedeCompatible = (p, format) => !!PIECE_PROCEDES[p].formats[format];

// ===================== Rotation (brief, § 4.8) =====================
// Chaque liste tourne par cycles mélangés : un élément revient une fois par cycle, et jamais deux jours de suite
// (au passage d'un cycle au suivant, le premier élément est échangé s'il répète le dernier du cycle précédent)
function pieceRotation(liste, jour, ...sel) {
  const n = liste.length, cycle = Math.floor(jour / n), pos = jour - cycle * n;
  const perm = c => {
    const p = melanger(liste, pieceAlea("rotation", ...sel, c));
    if (n > 1 && p[0] === melanger(liste, pieceAlea("rotation", ...sel, c - 1))[n - 1]) [p[0], p[1]] = [p[1], p[0]];
    return p;
  };
  return { perm: perm(cycle), pos };
}
// Pièces saines : leur nombre exact par bloc de 20 jours (PIECE_NIVEAUX.saines)
function pieceSaine(jour, niveau) {
  const s = PIECE_NIVEAUX[niveau].saines;
  if (!s) return false;
  const bloc = Math.floor(jour / 20);
  return melanger(Array.from({ length: 20 }, (_, i) => i < s), pieceAlea("saines", niveau, bloc))[jour - bloc * 20];
}

// Choix du jour. Le format suit sa rotation (chaque format revient au plus tard en deux cycles, jamais deux jours de
// suite) ; le procédé principal est, parmi ceux que ce format accepte, celui qui attend depuis le plus longtemps
// (ordre de départ mélangé par niveau) : chaque procédé revient régulièrement, et pas à quelques jours d'intervalle.
// Les jours sont simulés depuis PIECE_DEBUT_ROTATION ; le résultat est gardé en mémoire, par niveau.
const PIECE_DEBUT_ROTATION = PIECE_JOUR_UN - 60;
const pieceChoixMemoire = {};
function pieceChoixDuJour(jour, niveau) {
  if (jour < PIECE_DEBUT_ROTATION) return pieceChoixRotation(jour, niveau, melanger(pieceProcedesNiveau(niveau), pieceAlea("attente", niveau)), {});
  const m = pieceChoixMemoire[niveau] || (pieceChoixMemoire[niveau] = { jour: PIECE_DEBUT_ROTATION, attente: null, dernier: {}, choix: {}, rangs: {} });
  if (!m.attente) m.attente = melanger(pieceProcedesNiveau(niveau), pieceAlea("attente", niveau));
  while (m.jour <= jour) {
    const c = pieceChoixRotation(m.jour, niveau, m.attente, m.dernier, m.choix[m.jour - 1]);
    // Procédés principaux des six jours précédents : évités en pièges secondaires (jamais deux fois le même ensemble en 7 jours)
    c.recents = [1, 2, 3, 4, 5, 6].map(k => m.choix[m.jour - k] && m.choix[m.jour - k].principal).filter(Boolean);
    if (c.principal) m.dernier[c.principal] = m.jour;
    // Rang de cette combinaison (format, monde, procédé) depuis le début : il fixe un prix différent à chaque retour
    const cle = [c.format, c.monde, c.principal].join(" ");
    c.rang = m.rangs[cle] = (m.rangs[cle] ?? -1) + 1;
    m.choix[m.jour++] = c;
  }
  return m.choix[jour];
}
function pieceChoixRotation(jour, niveau, attente, dernier, veille) {
  const saine = pieceSaine(jour, niveau), formats = pieceFormatsNiveau(niveau);
  const rf = pieceRotation(formats, jour, "format", niveau), format = rf.perm[rf.pos];
  const rm = pieceRotation(PIECE_MONDES.map(m => m.id), jour, "monde", niveau);
  const mondes = PIECE_MONDES.map((_, k) => PIECE_MONDES.find(x => x.id === rm.perm[(rm.pos + k) % PIECE_MONDES.length]))
    .filter(x => !(veille && veille.format === format && veille.monde === x.id));
  let principal = null;
  if (!saine) {
    // Le plus ancien (jamais servi d'abord, dans l'ordre d'attente), parmi les procédés possibles avec ce format
    const possibles = attente.filter(p => pieceProcedeCompatible(p, format) && mondes.some(m => pieceMondePossible(m, format, niveau, p)));
    principal = possibles.reduce((a, p) => ((dernier[p] ?? -Infinity) < (dernier[a] ?? -Infinity) ? p : a), possibles[0]);
  }
  const monde = mondes.find(m => pieceMondePossible(m, format, niveau, principal));
  return { saine, principal, format, monde: monde.id };
}

// ===================== Vérité =====================
// Données cachées du monde : une série annuelle de 12 ans, l'année de l'intervention, et les chiffres de chaque format.
// profil : "tendance" (sens tiré), "fenetre" (tendance longue contraire à la fin de série), "cumul" (dernières années
// en baisse), "pic" (année record juste avant l'intervention, puis retour à la normale), "forte" (hausse réelle d'au moins 2×)
function veritePiece(monde, jour, profil, intensite, alea) {
  const fin = new Date(jour * 86400000).getUTCFullYear() - 1, annees = Array.from({ length: 12 }, (_, i) => fin - 11 + i);
  const v0 = pieceEntier(alea, monde.ordre[0], monde.ordre[1]);
  const sens = alea() < 0.5 ? 1 : -1;
  let taux = Array.from({ length: 11 }, () => sens * (0.03 + 0.05 * alea()));
  let k = pieceEntier(alea, 6, 9);   // indice de l'année de l'intervention
  if (profil === "fenetre") {
    const w = { forte: 2, moyenne: 3, faible: 4 }[intensite];
    taux = taux.map((t, i) => i >= 11 - w + 1 ? -sens * (0.06 + 0.04 * alea()) : sens * (0.05 + 0.04 * alea()));
  }
  if (profil === "forte") taux = taux.map(() => 0.08 + 0.05 * alea());
  const valeurs = [v0];
  taux.forEach(t => valeurs.push(Math.max(1, valeurs[valeurs.length - 1] * (1 + t))));
  if (profil === "cumul") {
    // Hausse puis baisse : la dernière valeur annuelle est au plus intensite × la précédente
    const f = { forte: 0.7, moyenne: 0.8, faible: 0.9 }[intensite];
    valeurs[11] = valeurs[10] * (f - 0.02 * alea());
  }
  if (profil === "pic") {
    const m = { forte: 2, moyenne: 1.75, faible: 1.5 }[intensite];
    const base = valeurs[k - 4];
    for (let i = k - 4; i < 12; i++) valeurs[i] = base * (0.97 + 0.06 * alea());
    valeurs[k - 1] = base * (m + 0.1 + 0.1 * alea());
  }
  const serie = valeurs.map(pieceRond);
  // L'arrondi ne doit pas ramener la valeur sous le seuil voulu
  if (profil === "pic") serie[k - 1] = Math.max(serie[k - 1], Math.ceil({ forte: 2, moyenne: 1.75, faible: 1.5 }[intensite] * pieceMoyenneTrois(serie, k)) + 1);
  if (profil === "cumul") serie[11] = Math.min(serie[11], Math.floor({ forte: 0.7, moyenne: 0.8, faible: 0.9 }[intensite] * serie[10]));
  const e = monde.etude, p = monde.produit;
  return {
    annees, serie, k, anneeIntervention: annees[k], fin, sensLong: Math.sign(serie[11] - serie[0]) || 1,
    taux: (t1 => ({ t1, t2: t1 + pieceEntier(alea, 3, 9) * (alea() < 0.2 ? -1 : 1) }))(pieceEntier(alea, 12, 40)),
    distribution: monde.distribution && (med => ({ mediane: med, moyenne: Math.round(med * 1.05) }))(pieceEntier(alea, 10, 60)),
    risque: monde.risque && { avec: pieceEntier(alea, 2, 9), sans: 0 },
    debutant: monde.debutant && { avant: pieceEntier(alea, 600, 1200) },
    etude: e && { n: pieceEntier(alea, 600, 1500), semaines: pieceEntier(alea, 8, 20), base: pieceEntier(alea, e.base[0], e.base[1]), effet: [0.5, 1, 1.5][pieceEntier(alea, 0, 2)] },
    sondage: { n: pieceEntier(alea, 600, 1500), oui: pieceEntier(alea, 52, 70), avant: 0, sansAvis: pieceEntier(alea, 4, 10) },
    prix: p && (prix => ({ prix, ancien: Math.round(prix * (1.1 + 0.2 * alea())) }))(pieceEntier(alea, p.prix[0], p.prix[1])),
    satisfaits: pieceEntier(alea, 72, 91), clients: pieceRond(pieceEntier(alea, 3000, 60000)),
    objectif: pieceEntier(alea, 15, 30), partages: pieceEntier(alea, 40, 900),
    compte: pieceChoix(alea, PIECE_COMPTES), prenom: pieceChoix(alea, PIECE_PRENOMS)
  };
}
// Moyenne des trois années qui précèdent l'année record (k - 1)
const pieceMoyenneTrois = (serie, k) => Math.round((serie[k - 4] + serie[k - 3] + serie[k - 2]) / 3);

// ===================== Présentation honnête =====================
// Données de chaque zone, avant tout piège : c'est aussi la pièce rectifiée
function pieceZonesHonnetes(format, monde, v, alea) {
  const n = v.serie.length, sens = Math.sign(v.serie[n - 1] - v.serie[0]) || 1;
  const pctTotal = piecePct(v.serie[0], v.serie[n - 1]);
  const moyHab = pieceMoyenneTrois(v.serie, v.k), apres = v.serie[n - 1];
  const s = v.sondage, oui0 = s.oui - pieceEntier(alea, 3, 8);
  const d = {
    titre: format === "etude" ? { etude: true, causal: false } : { sens, pct: Math.abs(pctTotal), depuis: v.annees[0] },
    chapo: { v1: v.serie[0], a1: v.annees[0], v2: v.serie[n - 1], a2: v.annees[n - 1] },
    "figure-axe": { axe: { type: "barres", min: 0, max: Math.max(...v.serie), inverse: false, vmin: Math.min(...v.serie), vmax: Math.max(...v.serie) } },
    "figure-trace": { trace: { annees: v.annees, valeurs: v.serie, cumule: false, nb: n, periode: n } },
    "figure-legende": { cumule: false },
    "phrase-contexte": { sensLong: sens, pctLong: Math.abs(pctTotal), a1: v.annees[0], a2: v.annees[n - 1] },
    "phrase-chiffre": monde.distribution && alea() < 0.5
      ? { distribution: { statistique: "mediane", typique: true, mediane: v.distribution.mediane, moyenne: v.distribution.moyenne } }
      : { taux: { t1: v.taux.t1, t2: v.taux.t2, annonce: "points" } },
    "phrase-changement": { autreChangement: true, annee: v.anneeIntervention },
    "phrase-citation": { expert: "dans", fort: false },
    source: { source: "datee", annee: v.fin + 1, age: 0 },
    slogan: { slogan: "simple" },
    "chiffre-cle": { satisfaits: v.satisfaits },
    caution: { expert: "dans", fort: false },
    temoignage: { prenom: v.prenom },
    prix: v.prix && { prix: { prix: v.prix.prix, barre: v.prix.ancien, ancien: v.prix.ancien } },
    "petites-lignes": { notes: true },
    question: {},
    barres: { axe: { type: "barres", min: 0, max: 100, inverse: false, vmin: Math.min(s.oui, 100 - s.oui - s.sansAvis, s.sansAvis), vmax: Math.max(s.oui, 100 - s.oui - s.sansAvis) },
      oui: s.oui, non: 100 - s.oui - s.sansAvis, sansAvis: s.sansAvis },
    commentaire: { taux: { t1: oui0, t2: s.oui, annonce: "points" }, generalise: true },
    "fiche-effectif": { effectif: { n: s.n, tire: true } },
    "fiche-dates": {},
    "fiche-recueil": { recrutement: "tirage" },
    compte: { compte: v.compte },
    texte: { texte: "valeurs", v1: v.serie[0], a1: v.annees[0], v2: v.serie[n - 1], a2: v.annees[n - 1] },
    "image-chiffre": { image: "valeurs", v1: v.serie[0], v2: v.serie[n - 1] },
    "image-legende": { v1: v.serie[0], a1: v.annees[0], v2: v.serie[n - 1], a2: v.annees[n - 1] },
    partages: { partages: v.partages },
    reponse: { reponse: 0 }, "reponse-2": { reponse: 1 }, "reponse-3": { reponse: 2 },
    date: {},
    resultat: v.etude && { resultat: "groupes", ...pieceValeursEtude(monde, v), survivant: false },
    "methode-effectif": v.etude && { effectif: { n: v.etude.n, tire: true }, finis: Math.round(v.etude.n * (0.96 + 0.03 * alea())), semaines: v.etude.semaines },
    "methode-comparaison": { comparaison: "essai" },
    "methode-recrutement": { recrutement: "tirage" },
    "methode-financeur": { financeur: "public" },
    tableau: v.etude && { tableau: "groupes", ...pieceValeursEtude(monde, v) },
    conclusion: { causal: true, generalise: true },
    bandeau: {},
    "bilan-avant": { bilan: "moyenne", valeur: moyHab, moyenne: moyHab },
    "bilan-apres": { valeur: apres },
    chiffres: { moyenne: moyHab, apres, record: false },
    citation: { expert: "dans", fort: false },
    "phrase-option": { option: true },
    "objectif-initial": { objectif: v.objectif * sens, annee: v.anneeIntervention },
    "objectif-verdict": { objectifVerdict: true, resultat: pctTotal, objectif: v.objectif * sens, proclame: Math.abs(pctTotal) >= v.objectif }
  };
  return PIECE_FORMATS[format].zones.filter(r => d[r]).map(role => ({ role, d: JSON.parse(JSON.stringify(d[role])) }));
}
// Étude : valeur de départ et effet réel (le groupe suivi fait mieux, dans le sens où « mieux » se mesure)
function pieceValeursEtude(monde, v) {
  const s = monde.etude.baisseEstMieux ? -1 : 1;
  return { g1: Math.round(10 * (v.etude.base + s * v.etude.effet)) / 10, g2: v.etude.base };
}

// ===================== Procédés : poser, detecte, preuves =====================
// poser(piece, zone, intensite, alea) modifie les données de la zone (et, si besoin, de la zone de preuve) ;
// detecte(piece, zone) dit si la zone présente le procédé, d'après ses seules données ; parametre(zone) donne la valeur
// soumise aux seuils (marge interdite vérifiée par le banc) ; les preuves sont les zones listées dans PIECE_PROCEDES.formats.
const pieceZoneDe = (piece, role) => piece.zones.find(z => z.role === role);
const pieceRatioAxe = a => ((a.vmax - a.min) / (a.vmin - a.min)) / (a.vmax / a.vmin);
const PIECE_REGLES = {
  "axe-tronque": {
    poser(piece, z, I) {
      const a = z.d.axe, rV = a.vmax / a.vmin;
      I = PIECE_PROCEDES["axe-tronque"].intensites[I] || 4;
      // Borne basse telle que le rapport des hauteurs vaille I fois celui des valeurs, arrondie vers le haut
      let m = Math.ceil((I * rV * a.vmin - a.vmax) / (I * rV - 1));
      if (m >= a.vmin) m = a.vmin - 1;
      a.min = m;
    },
    detecte: (piece, z) => !!(z.d.axe && z.d.axe.type === "barres" && z.d.axe.min > 0 && pieceRatioAxe(z.d.axe) >= 1.5),
    parametre: z => z.d.axe && z.d.axe.type === "barres" ? (z.d.axe.min > 0 ? pieceRatioAxe(z.d.axe) : 1) : null, seuils: [1.5, 1, "min"]
  },
  "fenetre": {
    poser(piece, z, I) {
      const w = { forte: 2, moyenne: 3, faible: 4 }[I] || 2, t = z.d.trace, n = t.annees.length;
      t.annees = t.annees.slice(n - w); t.valeurs = t.valeurs.slice(n - w); t.nb = w;
      t.sensAffiche = Math.sign(t.valeurs[w - 1] - t.valeurs[0]); t.sensLong = Math.sign(piece.verite.serie[n - 1] - piece.verite.serie[0]);
      t.fenetre = true;
      const titre = pieceZoneDe(piece, "titre");
      if (titre) Object.assign(titre.d, { sens: t.sensAffiche, pct: Math.abs(piecePct(t.valeurs[0], t.valeurs[w - 1])), depuis: t.annees[0] });
    },
    detecte: (piece, z) => !!(z.d.trace && z.d.trace.fenetre && z.d.trace.nb / z.d.trace.periode <= 1 / 3 && z.d.trace.sensAffiche !== z.d.trace.sensLong),
    parametre: z => z.d.trace ? z.d.trace.nb / z.d.trace.periode : null, seuils: [1 / 3, 1, "max"]
  },
  "cumul": {
    poser(piece, z) {
      const t = z.d.trace;
      let s = 0;
      t.annuelles = t.valeurs.slice();
      t.valeurs = t.valeurs.map(x => (s += x));
      t.cumule = true;
      // L'axe suit les valeurs cumulées : sans cela, les barres sortaient du cadre par le haut (pièce du 18 novembre 2026)
      const axe = pieceZoneDe(piece, "figure-axe") || (piece.decor || []).find(x => x.role === "figure-axe");
      if (axe && axe.d.axe) Object.assign(axe.d.axe, { max: Math.max(axe.d.axe.max, ...t.valeurs), vmax: Math.max(...t.valeurs), vmin: Math.min(...t.valeurs) });
      pieceZoneDe(piece, "figure-legende").d.cumule = true;
      const titre = pieceZoneDe(piece, "titre");
      if (titre) Object.assign(titre.d, { sens: 1, pct: piecePct(t.valeurs[0], t.valeurs[t.valeurs.length - 1]), depuis: t.annees[0] });
    },
    detecte: (piece, z) => !!(z.d.trace && z.d.trace.cumule && z.d.trace.annuelles[11] / z.d.trace.annuelles[10] <= 0.9),
    parametre: z => z.d.trace && z.d.trace.cumule ? z.d.trace.annuelles[11] / z.d.trace.annuelles[10] : null, seuils: [0.9, null, "max"]
  },
  "axe-inverse": {
    poser(piece, z) {
      z.d.axe.type = "courbe"; z.d.axe.inverse = true;
      const titre = pieceZoneDe(piece, "titre");
      if (titre) titre.d.sens = -titre.d.sens;
    },
    detecte: (piece, z) => !!(z.d.axe && z.d.axe.inverse)
  },
  "relatif-sans-absolu": {
    poser(piece, z, I) {
      // Risque absolu sur 1 000 : avec et sans ; l'écart en points vaut au plus I
      // Risque pour 1 000 : avec, puis sans (le double) ; l'écart, en points de pourcentage, vaut au plus 1
      const parMille = 10 * ({ forte: 0.1, moyenne: 0.5, faible: 1 }[I] || 0.1);
      const risque = { avec: parMille, sans: 2 * parMille, relatif: 50, ecart: parMille / 10 };
      z.d = { risque: { ...risque, relatifSeul: true } };
      z.honnete = { risque: { ...risque, relatifSeul: false } };
    },
    detecte: (piece, z) => !!(z.d.risque && z.d.risque.relatifSeul && z.d.risque.ecart <= 1 && z.d.risque.relatif >= 30),
    parametre: z => z.d.risque && z.d.risque.relatifSeul ? z.d.risque.ecart : null, seuils: [1, null, "max"]
  },
  "pourcentage-sans-base": {
    poser(piece, z, I) {
      const base = Math.max(2, Math.round(({ forte: 5, moyenne: 10, faible: 20 }[I] || 5) * 0.6));
      const apres = base * 3;
      z.d = { hausse: { base, apres, pct: piecePct(base, apres), baseVisible: false } };
    },
    detecte: (piece, z) => !!(z.d.hausse && !z.d.hausse.baseVisible && z.d.hausse.base <= 20),
    parametre: z => z.d.hausse && !z.d.hausse.baseVisible ? z.d.hausse.base : null, seuils: [20, 500, "max"]
  },
  "points-pourcentage": {
    // Binaire : l'écart en points est annoncé comme une hausse en pour cent (toujours une hausse, pour rester exact sur le sens)
    poser(piece, z) {
      const t = z.d.taux || piece.verite.taux, [t1, t2] = t.t2 > t.t1 ? [t.t1, t.t2] : [t.t2, t.t1];
      z.d = { ...(z.role === "commentaire" ? z.d : {}), taux: { t1, t2, annonce: "pct" } };
      z.honnete = { ...(z.role === "commentaire" ? z.honnete : {}), taux: { t1, t2, annonce: "points" } };
    },
    detecte: (piece, z) => !!(z.d.taux && z.d.taux.annonce === "pct")
  },
  "moyenne-mediane": {
    poser(piece, z, I) {
      const r = { forte: 3, moyenne: 2, faible: 1.5 }[I] || 3, med = piece.verite.distribution.mediane;
      z.d = { distribution: { statistique: "moyenne", typique: true, mediane: med, moyenne: Math.ceil(med * r) } };
      z.honnete = { distribution: { statistique: "mediane", typique: true, mediane: med, moyenne: Math.ceil(med * r) } };
    },
    detecte: (piece, z) => !!(z.d.distribution && z.d.distribution.statistique === "moyenne" && z.d.distribution.typique && z.d.distribution.moyenne / z.d.distribution.mediane >= 1.5),
    parametre: z => z.d.distribution && z.d.distribution.statistique === "moyenne" ? z.d.distribution.moyenne / z.d.distribution.mediane : null, seuils: [1.5, 1.1, "min"]
  },
  "petit-echantillon": {
    poser(piece, z, I) {
      const n = { forte: 8, moyenne: 15, faible: 30 }[I] || 8;
      z.d.effectif = { n, tire: z.d.effectif.tire };
      if (z.d.finis) z.d.finis = n;
    },
    detecte: (piece, z) => !!(z.d.effectif && z.d.effectif.n <= 30),
    parametre: z => z.d.effectif ? z.d.effectif.n : null, seuils: [30, 400, "max"]
  },
  "sans-temoin": {
    poser(piece, z) {
      z.d.comparaison = "avantApres";
      ["resultat", "tableau"].forEach(r => { const x = pieceZoneDe(piece, r); if (x) { x.d.resultat = x.d.tableau = "avantApres"; } });
    },
    detecte: (piece, z) => z.d.comparaison === "avantApres"
  },
  "survivant": {
    poser(piece, z, I) {
      const a = { forte: 0.6, moyenne: 0.45, faible: 0.3 }[I] || 0.6;
      z.d.survivant = true;
      const eff = pieceZoneDe(piece, "methode-effectif");
      eff.d.finis = Math.floor(eff.d.effectif.n * (1 - a));
      z.d.abandon = 1 - eff.d.finis / eff.d.effectif.n;
    },
    detecte: (piece, z) => !!(z.d.survivant && z.d.abandon >= 0.3),
    parametre: z => z.d.survivant ? z.d.abandon : null, seuils: [0.3, 0.05, "min"]
  },
  "auto-selection": {
    poser(piece, z) { z.d.recrutement = "volontaires"; },
    detecte: (piece, z) => z.d.recrutement === "volontaires"
  },
  "correlation": {
    poser(piece, z) { z.d.causal = true; pieceZoneDe(piece, "methode-comparaison").d.comparaison = "observation"; },
    detecte: (piece, z) => !!(z.d.etude && z.d.causal && (pieceZoneDe(piece, "methode-comparaison") || { d: {} }).d.comparaison === "observation")
  },
  "post-hoc": {
    poser(piece, z) {
      const v = piece.verite;
      z.d = { posthoc: true, sens: Math.sign(v.serie[11] - v.serie[v.k - 1]) || 1, pct: Math.abs(piecePct(v.serie[v.k - 1], v.serie[11])) };
      const preuve = pieceZoneDe(piece, piece.format === "reseau" ? "reponse" : "phrase-changement");
      preuve.d = piece.format === "reseau" ? { reponse: "changement", annee: v.anneeIntervention } : { autreChangement: true, annee: v.anneeIntervention };
    },
    detecte: (piece, z) => !!(z.d.posthoc && piece.zones.some(x => x.d.autreChangement || x.d.reponse === "changement"))
  },
  "regression": {
    poser(piece, z) {
      const v = piece.verite;
      Object.assign(z.d, { bilan: "record", valeur: v.serie[v.k - 1], annee: v.annees[v.k - 1] });
      pieceZoneDe(piece, "chiffres").d.record = true;
    },
    detecte: (piece, z) => !!(z.d.bilan === "record" && z.d.valeur / z.d.moyenne >= 1.5),
    parametre: z => z.d.bilan ? z.d.valeur / z.d.moyenne : null, seuils: [1.5, 1.1, "min"]
  },
  "critere-deplace": {
    // Le résultat reste le vrai ; c'est l'objectif initial (la preuve) qui était plus haut : résultat ≤ f × objectif
    poser(piece, z, I) {
      const f = { forte: 0.5, moyenne: 0.65, faible: 0.8 }[I] || 0.5, res = z.d.resultat, signe = Math.sign(res) || 1;
      const obj = signe * Math.ceil(Math.abs(res) / f);
      Object.assign(z.d, { objectif: obj, proclame: true, nouvelObjectif: signe * Math.max(1, Math.abs(res) - 2) });
      z.honnete = { objectifVerdict: true, resultat: res, objectif: obj, proclame: false };
      pieceZoneDe(piece, "objectif-initial").d.objectif = obj;
    },
    detecte: (piece, z) => !!(z.d.objectifVerdict && z.d.proclame && Math.abs(z.d.resultat) / Math.abs(z.d.objectif) <= 0.8),
    parametre: z => z.d.objectifVerdict && z.d.proclame ? Math.abs(z.d.resultat) / Math.abs(z.d.objectif) : null, seuils: [0.8, 1, "max"]
  },
  "autorite": {
    poser(piece, z) { z.d.expert = "hors"; z.d.fort = true; },
    detecte: (piece, z) => z.d.expert === "hors"
  },
  "popularite": {
    poser(piece, z) { z.d = { popularite: true, conclut: true }; },
    detecte: (piece, z) => !!(z.d.popularite && z.d.conclut)
  },
  "faux-dilemme": {
    poser(piece, z) {
      z.d = { dilemme: true };
      if (piece.format === "reseau") pieceZoneDe(piece, "reponse").d = { reponse: "option" };
      if (piece.format === "publicite") pieceZoneDe(piece, "petites-lignes").d.option = true;
    },
    detecte: (piece, z) => !!z.d.dilemme
  },
  "nature": {
    poser(piece, z) { z.d = { nature: true, conclut: true }; },
    detecte: (piece, z) => !!(z.d.nature && z.d.conclut)
  },
  "peur": {
    poser(piece, z) { z.d = { peur: true }; },
    detecte: (piece, z) => !!z.d.peur
  },
  "prix-barre": {
    poser(piece, z, I) {
      const f = { forte: 2, moyenne: 1.6, faible: 1.3 }[I] || 2;
      z.d.prix.barre = Math.ceil(z.d.prix.ancien * f);
    },
    detecte: (piece, z) => !!(z.d.prix && z.d.prix.barre / z.d.prix.ancien >= 1.3),
    parametre: z => z.d.prix ? z.d.prix.barre / z.d.prix.ancien : null, seuils: [1.3, 1, "min"]
  },
  "source-absente": {
    poser(piece, z) { z.d = { source: "vague", vague: pieceEntier(piece.alea, 0, 1) }; },
    detecte: (piece, z) => z.d.source === "vague"
  },
  "conflit": {
    poser(piece, z) { z.d.financeur = "interesse"; z.d.independante = true; },
    detecte: (piece, z) => !!(z.d.financeur === "interesse" && z.d.independante)
  },
  "perime": {
    poser(piece, z, I) {
      const age = { forte: 10, moyenne: 7, faible: 5 }[I] || 10;
      z.d = { source: "datee", annee: piece.verite.fin + 1 - age, age, actuel: true };
    },
    detecte: (piece, z) => !!(z.d.source === "datee" && z.d.actuel && z.d.age >= 5),
    parametre: z => z.d.source === "datee" ? z.d.age : null, seuils: [5, 1, "min"]
  }
};

// ===================== Leurres =====================
const PIECE_LEURRES_POSER = {
  "ton-vif": z => { z.d = { tonVif: true }; },
  "chiffre-rond": z => { z.d = { rond: true }; },
  "expert-domaine": z => { z.d = { expert: "dans", fort: true }; },
  "courbe-non-nulle": (z, piece) => { const a = z.d.axe; a.type = "courbe"; a.min = Math.max(0, pieceRond(a.vmin * 0.8)); },
  "pourcentage-base": (z, piece) => { const b = piece.verite.debutant.avant; z.d = { hausse: { base: b, apres: Math.round(b * 1.4), pct: 40, baseVisible: true } }; },
  "grand-echantillon": z => { z.d.effectif = { n: Math.max(1000, z.d.effectif.n), tire: true }; z.d.solide = true; if (z.d.finis) z.d.finis = Math.round(z.d.effectif.n * 0.97); },
  "associe": z => { z.d.associe = true; },
  "popularite-fait": z => { z.d = { popularite: true, conclut: false }; },
  "source-datee": z => { z.d.precise = true; },
  "hausse-reelle": z => { z.d.reelle = true; }
};

// ===================== Génération =====================
// Pièce du jour : la même pour tout le monde, ce jour-là et à ce niveau
function pieceDuJour(jour, niveau) {
  return construirePiece(niveau, jour, grainePiece(jour, niveau), pieceChoixDuJour(jour, niveau));
}
// Le monde laisse-t-il assez de leurres possibles avec ce format et ce piège principal ? (sinon tous les essais échouent)
function pieceLeurresPossibles(monde, format, niveau, principal) {
  const P = principal && PIECE_PROCEDES[principal], roles = P ? P.formats[format] : [];
  const possibles = Object.values(PIECE_LEURRES).filter(L => L.formats[format] && !roles.includes(L.formats[format]) && (!L.requiert || monde[L.requiert])
    && !(P && P.effet !== "aucun" && L.formats[format] === PIECE_FORMATS[format].conclusion));
  // Deux leurres ne partagent pas une zone : on compte les zones distinctes
  return new Set(possibles.map(L => L.formats[format])).size >= PIECE_NIVEAUX[niveau].leurres[0];
}
function pieceMondePossible(m, format, niveau, principal) {
  return pieceMondeCompatible(m, format, principal ? [principal] : []) && pieceLeurresPossibles(m, format, niveau, principal);
}
// Pièce libre : graine partageable, choix tirés de la graine plutôt que de la rotation
function pieceLibre(niveau, graine) {
  const alea = pieceAlea("libre", niveau, graine);
  const saine = alea() * 20 < PIECE_NIVEAUX[niveau].saines;
  const principal = saine ? null : pieceChoix(alea, pieceProcedesNiveau(niveau).filter(p => pieceFormatsNiveau(niveau).some(f => pieceProcedeCompatible(p, f) && PIECE_MONDES.some(m => pieceMondePossible(m, f, niveau, p)))));
  const format = pieceChoix(alea, pieceFormatsNiveau(niveau).filter(f => (!principal || pieceProcedeCompatible(principal, f)) && PIECE_MONDES.some(m => pieceMondePossible(m, f, niveau, principal))));
  const monde = pieceChoix(alea, PIECE_MONDES.filter(m => pieceMondePossible(m, format, niveau, principal))).id;
  return construirePiece(niveau, PIECE_JOUR_UN + 30, graine, { saine, principal, format, monde }, true);
}

function construirePiece(niveau, jour, graine, choix, libre = false) {
  const N = PIECE_NIVEAUX[niveau], monde = PIECE_MONDES.find(m => m.id === choix.monde), format = choix.format;
  // Plusieurs essais, tous déterministes : on garde le premier qui respecte la composition du niveau
  for (let essai = 0; essai < 40; essai++) {
    const alea = pieceAlea("piece", graine, essai);
    const pieges = choix.principal ? [choix.principal] : [];
    if (!choix.saine) {
      const voulu = pieceEntier(alea, N.pieges[0], N.pieges[1]);
      const candidats = melanger(pieceProcedesNiveau(niveau).filter(p => pieceProcedeCompatible(p, format) && pieceMondeCompatible(monde, format, [p])), alea);
      // Les procédés principaux des jours précédents passent en dernier
      if (choix.recents) candidats.sort((a, b) => choix.recents.includes(a) - choix.recents.includes(b));
      for (const p of candidats) {
        if (pieges.length >= voulu) break;
        if (pieges.includes(p) || pieges.some(q => PIECE_PROCEDES[q].incompatibles.includes(p) || PIECE_PROCEDES[p].incompatibles.includes(q))) continue;
        const roles = q => PIECE_PROCEDES[q].formats[format];
        // Deux pièges ne partagent ni zone ni preuve
        if (pieges.some(q => roles(q).some(r => roles(p).includes(r)))) continue;
        pieges.push(p);
      }
    }
    const piece = essaiPiece(niveau, jour, graine, monde, format, pieges, alea, libre, choix.rang);
    if (piece) return piece;
  }
  throw new Error("pièce impossible : " + [niveau, jour, format, monde.id, choix.principal].join(" "));
}

function essaiPiece(niveau, jour, graine, monde, format, pieges, alea, libre, rang) {
  const N = PIECE_NIVEAUX[niveau], I = N.intensite;
  const profil = pieges.includes("fenetre") ? "fenetre" : pieges.includes("cumul") ? "cumul" : pieges.includes("regression") ? "pic" : "tendance";
  // Leurres : tirés avant la vérité, car « hausse réelle » demande une série en forte hausse
  const nbLeurres = pieceEntier(alea, N.leurres[0], N.leurres[1]);
  const rolesPieges = pieges.flatMap(p => PIECE_PROCEDES[p].formats[format]);
  const leurres = [];
  for (const l of melanger(Object.keys(PIECE_LEURRES), alea)) {
    if (leurres.length >= nbLeurres) break;
    const L = PIECE_LEURRES[l], role = L.formats[format];
    if (!role || rolesPieges.includes(role) || leurres.some(x => PIECE_LEURRES[x].formats[format] === role) || (L.requiert && !monde[L.requiert])) continue;
    if (role === PIECE_FORMATS[format].conclusion && pieges.some(p => PIECE_PROCEDES[p].effet !== "aucun")) continue;
    if (l === "hausse-reelle" && profil !== "tendance") continue;
    leurres.push(l);
  }
  if (leurres.length < N.leurres[0]) return null;
  const verite = veritePiece(monde, jour, leurres.includes("hausse-reelle") ? "forte" : profil, I, alea);
  // Pièce du jour : quand la même combinaison revient, le prix change (sinon deux publicités pourraient être identiques)
  if (rang != null && verite.prix) {
    const [a, b] = monde.produit.prix, ecart = verite.prix.ancien / verite.prix.prix;
    verite.prix.prix = a + (pieceEntier(pieceAlea("prix", format, monde.id, niveau), 0, b - a) + rang) % (b - a + 1);
    verite.prix.ancien = Math.round(verite.prix.prix * ecart);
  }
  const piece = { version: PIECE_VERSION, graine, jour, niveau, numero: numeroPiece(jour), libre, monde: monde.id, format,
    couleur: monde.couleur, verite, alea, zones: pieceZonesHonnetes(format, monde, verite, alea), manques: [] };
  piece.zones.forEach(z => { z.honnete = JSON.parse(JSON.stringify(z.d)); z.etat = "saine"; z.toleres = []; });
  // Pièges : la transformation déclarée de chaque zone, puis les preuves ; une preuve modifiée devient aussi la version honnête
  if (pieges.includes("critere-deplace") && Math.abs(pieceZoneDe(piece, "objectif-verdict").d.resultat) < 4) return null;
  for (const p of pieges) {
    const [role, ...preuves] = PIECE_PROCEDES[p].formats[format];
    const z = pieceZoneDe(piece, role);
    if (!z) return null;
    PIECE_REGLES[p].poser(piece, z, I, alea);
    Object.assign(z, { etat: "piegee", procede: p, intensite: I, preuves });
  }
  piece.zones.forEach(z => {
    if (z.etat === "piegee") return;
    // Une zone de preuve garde ce qu'elle montre (c'est une information vraie)
    if (pieges.some(p => PIECE_PROCEDES[p].formats[format].slice(1).includes(z.role))) z.honnete = JSON.parse(JSON.stringify(z.d));
  });
  // Conclusion tolérée pour chaque piège qui la rend non établie ou contredite
  const conclusion = pieceZoneDe(piece, PIECE_FORMATS[format].conclusion);
  pieges.forEach(p => { if (PIECE_PROCEDES[p].effet !== "aucun" && conclusion && conclusion.etat !== "piegee") conclusion.toleres.push(p); });
  for (const l of leurres) {
    const z = pieceZoneDe(piece, PIECE_LEURRES[l].formats[format]);
    if (!z || z.etat !== "saine" || z.toleres.length) return null;
    PIECE_LEURRES_POSER[l](z, piece);
    z.honnete = JSON.parse(JSON.stringify(z.d));
    Object.assign(z, { etat: "leurre", leurre: l });
  }
  // Zones gardées : pièges, preuves, leurres, conclusion et, dès le niveau 3, la zone qui porte « Chiffrer » ; puis d'autres
  const garder = new Set();
  piece.zones.forEach(z => { if (z.etat !== "saine" || z.toleres.length) garder.add(z.role); });
  pieges.forEach(p => PIECE_PROCEDES[p].formats[format].forEach(r => garder.add(r)));
  if (conclusion) garder.add(conclusion.role);
  PIECE_FORMATS[format].cle.forEach(r => { if (pieceZoneDe(piece, r)) garder.add(r); });
  const cible = pieceEntier(alea, N.zones[0], N.zones[1]);
  for (const z of melanger(piece.zones, alea)) { if (garder.size >= cible) break; garder.add(z.role); }
  if (garder.size < N.zones[0] || garder.size > N.zones[1]) return null;
  // Parties de figure non retenues comme zones : dessinées sans être touchables (un axe sans tracé ne se lirait pas).
  // Elles sont saines par construction (toute zone piégée, tolérée ou leurre est gardée).
  const figure = ["figure-axe", "figure-trace", "figure-legende"];
  piece.decor = piece.zones.some(z => figure.includes(z.role) && garder.has(z.role))
    ? piece.zones.filter(z => figure.includes(z.role) && !garder.has(z.role)).map(z => ({ role: z.role, d: z.d })) : [];
  piece.zones = piece.zones.filter(z => garder.has(z.role));
  // Garantie de composition : au moins deux zones saines ou leurres, non tolérées, par piège
  const libres = piece.zones.filter(z => z.etat !== "piegee" && !z.toleres.length).length;
  if (libres < 2 * pieges.length) return null;
  if (pieges.some(p => PIECE_PROCEDES[p].formats[format].slice(1).some(r => !garder.has(r)))) return null;
  piece.zones.forEach((z, i) => { z.id = "z" + (i + 1); });
  piece.zones.forEach(z => { if (z.preuves) z.preuves = z.preuves.map(r => pieceZoneDe(piece, r).id); });
  piece.annonce = N.annonce ? pieges.length : null;
  piece.verdict = verdictPiece(piece);
  piece.chiffrer = chiffrerPiece(piece, alea);
  delete piece.alea;
  rendrePiece(piece);
  return piece;
}

// ===================== Verdict et « Chiffrer » =====================
const PIECE_FORCE = { aucun: 0, "non-etablie": 1, contredite: 2 };
function verdictPiece(piece) {
  const f = Math.max(0, ...piece.zones.filter(z => z.etat === "piegee").map(z => PIECE_FORCE[PIECE_PROCEDES[z.procede].effet]));
  return ["etablie", "non-etablie", "contredite"][f];
}
// Une question de lecture chiffrée, calculée sur la vérité ; quatre choix au niveau 3, saisie libre au niveau 4
function chiffrerPiece(piece, alea) {
  const mode = PIECE_NIVEAUX[piece.niveau].chiffrer;
  if (!mode) return [];
  const v = piece.verite, m = PIECE_MONDES.find(x => x.id === piece.monde);
  let q;
  if (piece.format === "breve" || piece.format === "reseau") q = { type: "variation", a1: v.annees[0], a2: v.annees[11], reponse: piecePct(v.serie[0], v.serie[11]) };
  else if (piece.format === "bulletin") q = { type: "variation-bilan", reponse: piecePct(pieceMoyenneTrois(v.serie, v.k), v.serie[11]) };
  else if (piece.format === "publicite") q = { type: "remise", reponse: Math.round(100 * (v.prix.ancien - v.prix.prix) / v.prix.ancien) };
  else if (piece.format === "sondage") q = { type: "ecart-sondage", reponse: pieceZoneDe(piece, "barres").d.oui - pieceZoneDe(piece, "barres").d.non };
  else { const e = pieceZoneDe(piece, "methode-effectif").d; q = { type: "abandon", reponse: Math.round(100 * (e.effectif.n - e.finis) / e.effectif.n) }; }
  q.tolerance = 2;
  q.options = null;
  if (mode === "choix") {
    const r = q.reponse, d = Math.max(5, Math.round(Math.abs(r) / 2));
    q.options = melanger([r, r + d, r - d, r + 2 * d === r ? r + 1 : r + 2 * d].filter((x, i, l) => l.indexOf(x) === i), alea);
  }
  q.mesure = m.mesure;
  return [q];
}

// ===================== « Nommer » =====================
// Les choix d'une zone ne trahissent pas son état : un procédé « imposé » (le vrai pour une zone piégée, un tiré au
// hasard sinon), ses voisins selon le niveau, puis d'autres procédés possibles pour ce rôle de zone, puis du niveau
function pieceOptionsNommer(piece, zone) {
  const N = PIECE_NIVEAUX[piece.niveau], alea = pieceAlea("nommer", piece.graine, zone.id);
  const permis = pieceProcedesNiveau(piece.niveau);
  const pourRole = permis.filter(p => (PIECE_PROCEDES[p].formats[piece.format] || [])[0] === zone.role);
  const impose = zone.etat === "piegee" ? zone.procede : pieceChoix(alea, pourRole.length ? pourRole : permis);
  const choix = [impose];
  PIECE_PROCEDES[impose].voisins.filter(v => permis.includes(v)).slice(0, N.voisins).forEach(v => choix.push(v));
  for (const p of [...melanger(pourRole, alea), ...melanger(permis, alea)]) {
    if (choix.length >= N.choix) break;
    if (!choix.includes(p)) choix.push(p);
  }
  return melanger(choix, alea);
}

// ===================== Notation (brief, § 5.2) =====================
// reponse : { marques: { idZone: procédé ou null }, rien: bool, chiffres: [nombre], verdict, certitude }
function noterPiece(piece, reponse) {
  const haut = piece.niveau >= 3, R = haut ? 5 : 7, N = haut ? 2 : 3;
  const pieges = piece.zones.filter(z => z.etat === "piegee"), P = pieges.length;
  const marques = reponse.rien ? {} : (reponse.marques || {});
  let F = 0, A = 0, exacts = 0, voisins = 0;
  Object.entries(marques).forEach(([id, nom]) => {
    const z = piece.zones.find(x => x.id === id);
    if (!z || z.toleres.length) return;
    if (z.etat === "piegee") {
      F++;
      if (nom === z.procede) exacts++;
      else if (nom && PIECE_PROCEDES[z.procede].voisins.includes(nom)) voisins++;
    } else A++;
  });
  const reperage = P ? (reponse.rien ? 0 : R * Math.max(0, F / P - A / (2 * P))) : (reponse.rien ? R : R * Math.max(0, 1 - A / 2));
  const nom = P ? N * (exacts + 0.5 * voisins) / P : N * reperage / R;
  let chiffre = 0, verdict = 0;
  if (haut) {
    (piece.chiffrer || []).forEach((q, i) => {
      const x = (reponse.chiffres || [])[i], part = 2 / piece.chiffrer.length;
      if (typeof x !== "number") return;
      const e = Math.abs(x - q.reponse);
      chiffre += q.options ? (e === 0 ? part : 0) : (e <= q.tolerance ? part : e <= 2 * q.tolerance ? part / 2 : 0);
    });
    verdict = reponse.verdict === piece.verdict ? 1 : 0;
  }
  const total = reperage + nom + chiffre + verdict;
  return { note: Math.min(10, Math.floor(total + 0.5 + 1e-9)), parts: { reperage, nom, chiffre, verdict }, P, F, A, exact: F === P && A === 0 && (!!P || !!reponse.rien) };
}

// ===================== Rendu des textes =====================
// Texte affiché (d) et texte rectifié (honnete) de chaque zone ; nombres par fr(), gabarits entiers par T()
function rendrePiece(piece) {
  const m = PIECE_MONDES.find(x => x.id === piece.monde);
  const notes = piece.format === "publicite" ? pieceNotesPub(piece, m) : null;
  piece.zones.forEach(z => {
    z.texte = pieceTexteZone(z.role, z.d, piece, m, notes);
    z.rectifie = z.etat === "piegee" ? pieceTexteZone(z.role, z.honnete, piece, m, notes) : z.texte;
  });
}
// Notes de bas de publicité : ce que disent les zones à astérisque gardées (preuves comprises)
function pieceNotesPub(piece, m) {
  const v = piece.verite, n = [];
  const cle = pieceZoneDe(piece, "chiffre-cle"), prix = pieceZoneDe(piece, "prix"), lignes = pieceZoneDe(piece, "petites-lignes");
  if (cle && cle.d.risque && cle.d.risque.relatifSeul) n.push(T("*{0} sur 1 000 parmi {1}, contre {2} sur 1 000 sans.", fr(cle.d.risque.avec), T(m.risque[1]), fr(cle.d.risque.sans)));
  else if (cle && cle.d.hausse && !cle.d.hausse.baseVisible) n.push(T("*De {0} à {1} {2}.", fr(cle.d.hausse.base), fr(cle.d.hausse.apres), T(m.debutant[1])));
  else if (cle && cle.d.satisfaits) n.push(T("*Enquête auprès de {0} {1}.", fr(v.sondage.n), T(m.produit.clients)));
  if (prix) n.push(T("**Prix pratiqué jusqu'au mois dernier : {0} €.", fr(prix.d.prix.ancien)));
  if (lignes && lignes.d.option) n.push(T("Autre possibilité, tout aussi valable : {0}.", T(m.dilemme[2])));
  return n.length ? n.join(" ") : T("Prix toutes taxes comprises.");
}

function pieceTexteZone(role, d, piece, m, notes) {
  const v = piece.verite, M = pieceCap(T(m.mesure)), u = T(m.unite);
  const sensTxt = s => s > 0 ? T("en hausse") : T("en baisse");
  // « 1er novembre » en français ; le mois seul quand le jour n'apporte rien
  const date = decalage => {
    const d = new Date((piece.jour + decalage) * 86400000), j = d.getUTCDate();
    const mois = d.toLocaleDateString(LOCALE, { month: "long", timeZone: "UTC" });
    return LANGUE === "en" ? j + " " + mois : (j === 1 ? "1er" : j) + " " + mois;
  };
  const moisAnnee = decalage => new Date((piece.jour + decalage) * 86400000).toLocaleDateString(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" });
  switch (role) {
    case "titre":
      if (d.etude) return d.associe ? T("{0} : un lien observé avec {1}", pieceCap(T(m.etude.pratique)), T(m.etude.resultat))
        : d.causal ? T("{0} améliore {1}", pieceCap(T(m.etude.pratique)), T(m.etude.resultat))
        : T("{0} et {1} : les résultats d'une étude", pieceCap(T(m.etude.pratique)), T(m.etude.resultat));
      if (d.posthoc) return T("{0} : {1} de {2} %, c'est bien la preuve que ça marche", pieceCap(T(m.intervention)), sensTxt(d.sens), fr(d.pct));
      return T("{0} : {1} de {2} % depuis {3}", M, sensTxt(d.sens), fr(d.pct), d.depuis);
    case "chapo": return T("{0} : {1} {2} en {3}, {4} en {5}.", M, fr(d.v1), u, d.a1, fr(d.v2), d.a2);
    case "figure-axe": {
      const a = d.axe;
      return (a.type === "barres" ? T("Graphique en barres") : T("Courbe")) + " · " + (a.inverse ? T("axe vertical gradué de {0} (en haut) à {1} (en bas)", fr(a.min), fr(a.max)) : T("axe vertical gradué de {0} à {1}", fr(a.min), fr(a.max)));
    }
    case "figure-trace": {
      const t = d.trace, n = t.valeurs.length;
      return T("{0} valeurs, de {1} ({2}) à {3} ({4})", n, fr(t.valeurs[0]), t.annees[0], fr(t.valeurs[n - 1]), t.annees[n - 1]);
    }
    case "figure-legende": return d.cumule ? T("Valeurs cumulées depuis {0}, en {1}", v.annees[0], u) : T("Valeurs annuelles, en {0}", u);
    case "phrase-contexte": return T("Sur {0} ans, de {1} à {2}, la tendance est {3} : {4} %.", v.annees.length, d.a1, d.a2, d.sensLong > 0 ? T("à la hausse") : T("à la baisse"), (d.sensLong > 0 ? "+" : "−") + fr(d.pctLong))
      + (pieceZoneDe(piece, "phrase-chiffre") && pieceZoneDe(piece, "phrase-chiffre").d.distribution ? " " + T("Médiane pour {0} : {1} {2}.", T(m.distribution[0]), fr(v.distribution.mediane), T(m.distribution[1])) : "");
    case "phrase-chiffre":
      if (d.rond) { const pas = Math.pow(10, Math.max(0, Math.floor(Math.log10(v.serie[11])) - 1)); return T("Plus de {0} {1} en {2}, d'après les relevés.", fr(Math.floor(v.serie[11] / pas) * pas), u, v.annees[11]); }
      if (d.distribution) return d.distribution.statistique === "moyenne"
        ? T("{0} : {1} {2} pour {3}, en moyenne.", pieceCap(T(m.distribution[0])), fr(d.distribution.moyenne), T(m.distribution[1]), T(m.distribution[2]))
        : T("{0} : {1} {2} pour {3}, en médiane.", pieceCap(T(m.distribution[0])), fr(d.distribution.mediane), T(m.distribution[1]), T(m.distribution[2]));
      return piecePhraseTaux(pieceCap(T(m.taux)), d.taux);
    case "phrase-changement": return T("En {0}, {1} a aussi mis en place {2}.", d.annee, T(m.acteur), T(m.autreChangement));
    case "phrase-citation": case "citation": case "caution": {
      const expert = T(m.expert[d.expert === "hors" ? 1 : 0]);
      if (role === "caution") return d.fort ? T("Recommandation : {0}, qui l'utilise tous les jours.", expert) : T("Recommandation : {0}.", expert);
      if (d.peur) return T("« Sans {0}, {1}. Il faut donc continuer », prévient {2}.", T(m.intervention), T(m.peur), T(m.acteur));
      if (d.dilemme) return T("« C'est {0} ou {1} », tranche {2}.", T(m.dilemme[0]), T(m.dilemme[1]), T(m.acteur));
      if (d.posthoc) return T("« Depuis {0}, c'est {1} de {2} % : c'est bien la preuve que cela marche », se félicite {3}.", T(m.intervention), sensTxt(d.sens), fr(d.pct), T(m.acteur));
      return d.fort ? T("« {0} a changé la donne, c'est net », affirme {1}.", pieceCap(T(m.intervention)), expert)
        : T("« Il faudra du temps pour mesurer l'effet de cette décision », estime {0}.", expert);
    }
    case "source": {
      if (d.source === "vague") return d.vague ? T("Source : une étude récente.") : T("Source : selon des experts.");
      if (d.actuel) return T("Source : relevés {0}, {1} (chiffres actuels).", T(m.acteurDe), d.annee);
      return d.precise ? T("Source : relevés {0}, publiés en {1}, consultables sur demande.", T(m.acteurDe), moisAnnee(-3)) : T("Source : relevés {0}, {1}.", T(m.acteurDe), d.annee);
    }
    case "slogan": case "texte": {
      const p = m.produit;
      if (d.popularite) return d.conclut ? T("Déjà {0} {1} : c'est bien la preuve que ça marche !", fr(v.clients), T(p.clients)) : T("Déjà {0} {1}.", fr(v.clients), T(p.clients));
      if (d.nature) return d.conclut ? T("100 % naturel, donc forcément sans danger.") : T("Ingrédients d'origine naturelle.");
      if (d.peur) return role === "slogan" ? T("Sans {0}, {1}. Alors, qu'attendez-vous ?", T(p.nom), T(m.peur)) : T("Sans {0}, {1}. Ouvrez les yeux !", T(m.intervention), T(m.peur));
      if (d.dilemme) return T("C'est simple : {0}, ou {1}.", T(m.dilemme[0]), T(m.dilemme[1]));
      if (d.tonVif) return role === "slogan" ? T("{0} : {1} € seulement. Oui, vraiment !", pieceCap(T(p.nom)), fr(v.prix.prix)) : T("{0} : de {1} à {2} {3}. Énorme !", M, fr(v.serie[0]), fr(v.serie[11]), u);
      if (d.posthoc) return T("Depuis {0}, {1} est {2} de {3} %. C'est bien la preuve que ça marche !", T(m.intervention), T(m.mesure), sensTxt(d.sens), fr(d.pct));
      if (d.distribution) return d.distribution.statistique === "moyenne"
        ? T("{0} : {1} {2} en moyenne. Voilà ce que vit {3} !", pieceCap(T(m.distribution[0])), fr(d.distribution.moyenne), T(m.distribution[1]), T(m.distribution[2]))
        : T("{0} : {1} {2} en médiane. Voilà ce que vit {3}.", pieceCap(T(m.distribution[0])), fr(d.distribution.mediane), T(m.distribution[1]), T(m.distribution[2]));
      if (role === "slogan") return T("{0} : à découvrir, et à juger par vous-même.", pieceCap(T(p.nom)));
      return T("{0} : de {1} à {2} {3} entre {4} et {5}. À méditer.", M, fr(d.v1), fr(d.v2), u, d.a1, d.a2);
    }
    case "chiffre-cle": case "image-chiffre": {
      if (d.risque) return d.risque.relatifSeul ? T("Risque {0} réduit de {1} %*", T(m.risque[0]), fr(d.risque.relatif))
        : T("Risque {0} : {1} sur 1 000 au lieu de {2}, soit {3} point de pourcentage de moins", T(m.risque[0]), fr(d.risque.avec), fr(d.risque.sans), fr(d.risque.ecart));
      if (d.hausse) return d.hausse.baseVisible
        ? T("{0} : +{1} % en un an, de {2} à {3}", pieceCap(T(m.debutant[0])), fr(d.hausse.pct), fr(d.hausse.base), fr(d.hausse.apres))
        : T("{0} : +{1} % en un an" + (role === "chiffre-cle" ? "*" : ""), pieceCap(T(m.debutant[0])), fr(d.hausse.pct));
      if (role === "image-chiffre") return T("{0} → {1}", fr(d.v1), fr(d.v2));
      return T("{0} % de {1} satisfaits*", fr(d.satisfaits), T(m.produit.clients));
    }
    case "image-legende": return T("Données {0} : {1} {2} en {3}, {4} en {5}.", T(m.acteurDe), fr(d.v1), u, d.a1, fr(d.v2), d.a2);
    case "temoignage": return T("« Je recommande, sans hésiter », témoigne {0}.", d.prenom);
    case "prix": return T("{0} € au lieu de {1} €**", fr(d.prix.prix), fr(d.prix.barre));
    case "petites-lignes": return notes;
    case "question": return T("« {0} »", T(m.sondage));
    case "barres": return T("Oui {0} % · Non {1} % · Sans avis {2} % (axe de {3} à {4} %)", d.oui, d.non, d.sansAvis, fr(d.axe.min), fr(d.axe.max));
    case "commentaire": return piecePhraseTaux(T("Le oui"), d.taux) + " " + (d.taux.t2 > 50 ? T("{0} répondent donc majoritairement oui.", pieceCap(T(m.population))) : T("{0} sont donc partagés.", pieceCap(T(m.population))));
    case "fiche-effectif": case "methode-effectif": {
      if (role === "fiche-effectif") return d.solide ? T("{0} personnes interrogées : un échantillon solide.", fr(d.effectif.n)) : T("{0} personnes interrogées.", fr(d.effectif.n));
      return T("{0} participants au départ, suivis pendant {1} semaines ; {2} sont allés jusqu'au bout.", fr(d.effectif.n), d.semaines, fr(d.finis));
    }
    case "fiche-dates": return T("Enquête réalisée en {0}.", moisAnnee(-14));
    case "fiche-recueil": case "methode-recrutement": return d.recrutement === "volontaires" ? T("Questionnaire en ligne, rempli par des volontaires.") : T("Échantillon tiré au sort parmi {0}.", T(m.population));
    case "compte": return "@" + d.compte;
    case "partages": return T("{0} partages", fr(d.partages));
    case "reponse": case "reponse-2": case "reponse-3": {
      if (d.expert) return T("@{0}, {1} : les chiffres tiennent, mais il faudra du recul pour juger.", PIECE_COMPTES[(PIECE_COMPTES.indexOf(v.compte) + 3) % PIECE_COMPTES.length], T(m.expert[0]));
      const qui = "@" + PIECE_COMPTES[(PIECE_COMPTES.indexOf(v.compte) + 1 + (d.reponse === 1 ? 1 : d.reponse === 2 ? 2 : 0)) % PIECE_COMPTES.length];
      if (d.reponse === "changement") return T("{0} : en {1}, il y a aussi eu {2}.", qui, d.annee, T(m.autreChangement));
      if (d.reponse === "option") return T("{0} : ou bien {1}, non ?", qui, T(m.dilemme[2]));
      const texte = pieceZoneDe(piece, "texte"), image = pieceZoneDe(piece, "image-chiffre");
      if (role === "reponse" && texte && texte.d.distribution) return T("{0} : la médiane est de {1} {2} ; quelques valeurs extrêmes tirent la moyenne.", qui, fr(texte.d.distribution.mediane), T(m.distribution[1]));
      if (role === "reponse" && image && image.d.hausse && !image.d.hausse.baseVisible) return T("{0} : de {1} à {2} {3}, en réalité.", qui, fr(image.d.hausse.base), fr(image.d.hausse.apres), T(m.debutant[1]));
      return [T("{0} : source ?", qui), T("{0} : intéressant, merci.", qui), T("{0} : on en reparle dans un an.", qui)][typeof d.reponse === "number" ? d.reponse : 0];
    }
    case "date": return T("Publié le {0}", date(-1));
    case "resultat": case "tableau": {
      const e = m.etude, ue = T(e.unite);
      if (d.resultat === "avantApres" || d.tableau === "avantApres") return role === "tableau" ? T("Avant : {0} · Après : {1}", fr(d.g2), fr(d.g1)) : T("{0} : {1} {2} avant, {3} après.", pieceCap(T(e.resultat)), fr(d.g2), ue, fr(d.g1));
      if (d.survivant) return T("{0} : {1} {2} chez les participants arrivés au bout, contre {3} au départ.", pieceCap(T(e.resultat)), fr(d.g1), ue, fr(d.g2));
      return role === "tableau" ? T("Groupe suivi : {0} · Groupe témoin : {1}", fr(d.g1), fr(d.g2)) : T("{0} : {1} {2} dans le groupe suivi, {3} dans le groupe témoin.", pieceCap(T(e.resultat)), fr(d.g1), ue, fr(d.g2));
    }
    case "methode-comparaison": return { essai: T("Les participants ont été répartis au hasard en deux groupes, dont un groupe témoin."),
      observation: T("Étude d'observation : on a comparé ceux qui le faisaient déjà à ceux qui ne le faisaient pas."),
      avantApres: T("Mesure avant puis après, sur les mêmes participants, sans groupe de comparaison.") }[d.comparaison];
    case "methode-financeur": return d.financeur === "interesse" ? T("Étude indépendante, financée par {0}.", T(m.etude.financeur)) : T("Étude financée par un organisme public, sans lien avec {0}.", T(m.acteur));
    case "conclusion": return T("Conclusion : {0} améliore {1} chez les {2}.", T(m.etude.pratique), T(m.etude.resultat), T(m.etude.participants));
    case "bandeau": return d.tonVif ? T("Le journal {0} : ça bouge, et on vous dit tout !", T(m.acteurDe)) : T("Le journal {0}", T(m.acteurDe));
    case "bilan-avant": return d.bilan === "record" ? T("Avant {0} : {1} {2}, en {3}.", T(m.intervention), fr(d.valeur), u, d.annee) : T("Avant {0} : {1} {2} en moyenne par an.", T(m.intervention), fr(d.valeur), u);
    case "bilan-apres": return T("Après : {0} {1}.", fr(d.valeur), u);
    case "chiffres": return T("Moyenne des trois années précédentes : {0} {1}.", fr(d.moyenne), u) + (d.record ? " " + T("L'année suivante avait été exceptionnelle.") : "") + " " + T("Dernier relevé : {0} {1}.", fr(d.apres), u);
    case "phrase-option": return T("Autre piste étudiée : {0}.", T(m.dilemme[2]));
    case "objectif-initial": return T("Objectif annoncé en {0} : {1} % sur {2}.", d.annee, (d.objectif > 0 ? "+" : "−") + fr(Math.abs(d.objectif)), T(m.mesure));
    case "objectif-verdict": {
      const r = (d.resultat > 0 ? "+" : "−") + fr(Math.abs(d.resultat));
      if (d.nouvelObjectif !== undefined) return T("Objectif atteint : {0} %, au-delà des {1} % visés cette année.", r, (d.nouvelObjectif > 0 ? "+" : "−") + fr(Math.abs(d.nouvelObjectif)));
      return d.proclame ? T("Résultat : {0} %, objectif atteint.", r) : T("Résultat : {0} %, objectif pas encore atteint.", r);
    }
  }
  return "";
}
// « de 12 % à 17 %, soit 5 points de plus » ; le piège « pour cent » annonce l'écart en points comme une hausse en %
function piecePhraseTaux(sujet, t) {
  const ecart = t.t2 - t.t1;
  if (t.annonce === "pct") return T("{0} passe de {1} % à {2} %, soit une hausse de {3} %.", sujet, t.t1, t.t2, Math.abs(ecart));
  return ecart >= 0 ? T("{0} passe de {1} % à {2} %, soit {3} points de plus.", sujet, t.t1, t.t2, ecart) : T("{0} passe de {1} % à {2} %, soit {3} points de moins.", sujet, t.t1, t.t2, -ecart);
}
