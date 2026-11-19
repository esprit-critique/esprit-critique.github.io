// progression.js : maîtrise, grades, points de lucidité, distinctions (refonte, lot 4). Fonctions pures : elles
// travaillent sur un objet « donnees » (les clés de progression, lues par donneesProgression() dans app.js) et ne
// touchent ni au DOM ni au stockage ; testées par tests/_progression.html. Deux nombres à ne jamais confondre :
//   - la maîtrise (0 à 1 000) : la force, commune à tous les jeux ; elle peut monter ou baisser ; elle donne le grade ;
//   - les points de lucidité : l'entraînement ; ils ne baissent jamais et ne donnent aucun grade.

// ===================== Table des jeux =====================
// Pour chaque atelier : domaine, type ("note" : score par afficherScore ; "mesure" : conversion propre ; "aucun" : ne
// mesure pas une force, hors numérateur et dénominateur) et part de hasard c (réussite d'un répondant au hasard) ; le
// pourquoi en commentaire. Les parts de hasard sont déduites de la forme des questions (journal de la refonte, lot 4). Un banc échoue
// si un atelier de tousLesAteliers() manque ici : tout jeu ajouté doit dire comment il compte.
const MAITRISE_JEUX = {
  monde: ["monde", "note", 0.25],   // quatre réponses par question
  mortalite: ["monde", "note", 0.5],   // deux causes de décès comparées
  pays: ["monde", "note", 0.5],   // duels entre deux pays
  nord: ["monde", "note", 0],   // position estimée librement sur une carte
  grandeurs: ["monde", "note", 0.25],   // ordres de grandeur, quatre propositions
  chronologie: ["monde", "note", 0.5],   // lequel est venu en premier
  "vrai-faux": ["confiance", "note", 0.5],   // vrai ou faux
  intervalles: ["confiance", "note", 0],   // fourchettes libres
  ancre: ["confiance", "mesure", 0],   // effet d'ancrage (ancrages)
  foule: ["confiance", "note", 0],   // estimations libres
  comprendre: ["confiance", "note", 0],   // auto-évaluation avant et après explication
  carnet: ["confiance", "aucun", 0],   // outil personnel : l'issue est indiquée par le joueur, invérifiable (audit de 2026)
  decision: ["confiance", "aucun", 0],   // décision guidée : pas de bonne réponse
  "avant-apres": ["confiance", "aucun", 0],   // bilan en deux formes, à faire une fois
  points: ["perception", "aucun", 0],   // estimation de quantités sans bonne réponse notée
  illusion: ["perception", "aucun", 0],   // mesure d'une illusion, pas d'une force
  hasard: ["perception", "note", 0.5],   // laquelle des deux suites est au hasard
  "ecrire-hasard": ["perception", "aucun", 0],   // imiter le hasard : un profil, pas un score
  correlation: ["perception", "note", 0.25],   // estimer une corrélation parmi quatre
  graphiques: ["perception", "note", 0.25],   // repérer le piège parmi plusieurs
  crt: ["raisonner", "note", 0],   // réponse libre
  wason: ["raisonner", "note", 0],   // choix de cartes combinatoire
  "regle-246": ["raisonner", "aucun", 0],   // expérience de découverte
  "monty-hall": ["raisonner", "aucun", 0],   // jeu de hasard : gagner ne mesure pas la force
  classiques: ["raisonner", "note", 0.25],   // problèmes classiques à choix
  depistage: ["raisonner", "note", 0],   // probabilité estimée librement
  anniversaires: ["raisonner", "aucun", 0],   // expérience à faire une fois
  logique: ["raisonner", "note", 0.5],   // valide ou non
  moniteur: ["raisonner", "aucun", 0],   // expérience de la régression vers la moyenne
  etudes: ["raisonner", "aucun", 0],   // comparaison de deux études : un jugement, pas un score
  plusieurs: ["raisonner", "aucun", 0],   // jeu à plusieurs sur un même téléphone
  wald: ["raisonner", "note", 0.5],   // où renforcer l'avion
  fabriquer: ["raisonner", "aucun", 0],   // fabriquer un résultat : expérience
  "douter-juste": ["raisonner", "note", 0.5],   // douter juste, deux réponses
  citations: ["raisonner", "note", 0.33],   // authentique, déformée ou inventée (philosopher, rattaché à raisonner)
  pensee: ["raisonner", "aucun", 0],   // expériences de pensée : pas de bonne réponse
  cecite: ["raisonner", "aucun", 0],   // cécité au choix : une seule fois
  "faux-souvenirs": ["raisonner", "aucun", 0],   // faux souvenirs : une seule fois
  "debat-truque": ["debattre", "note", 0.5],   // chaque réplique : sophisme ou non
  reparer: ["debattre", "note", 0.33],   // trouver la prémisse qui manque
  reformuler: ["debattre", "note", 0.25],   // la reformulation fidèle
  "debat-a-deux": ["debattre", "aucun", 0],   // débat à deux
  bingo: ["debattre", "aucun", 0],   // bingo à imprimer
  "qui-prouve": ["debattre", "note", 0.5],   // qui doit prouver
  pyramide: ["debattre", "note", 0.14],   // sept niveaux du désaccord
  demonter: ["debattre", "note", 0.25],   // rôle de chaque phrase
  laterale: ["debattre", "note", 0.33],   // quelle source est fiable
  hameconnage: ["debattre", "note", 0.5],   // arnaque ou vrai message (section « Se protéger en ligne », rattachée à débattre)
  "mots-de-passe": ["raisonner", "note", 0.5],   // le plus solide de deux (section « Se protéger en ligne », rattachée à raisonner)
  melange: ["melange", "aucun", 0],   // tire ses questions dans les autres jeux
  "grand-test": ["raisonner", "aucun", 0]   // ses axes comptent à part (maitriseGrandTest)
};

// Six domaines : cinq sections d'ateliers (philosopher, trop petite, rattachée à raisonner) et les notions
const DOMAINES = [
  ["monde", "Le monde en chiffres"], ["confiance", "Mesurer sa confiance"], ["perception", "Percevoir"],
  ["raisonner", "Raisonner"], ["debattre", "Débattre"], ["notions", "Notions"]
];
// Plafond de maîtrise d'un niveau : 500 au niveau 1, 1 000 au plus haut niveau de l'atelier (3 ou 5, niveauMax()),
// régulier entre les deux. Un niveau plus difficile rapporte donc plus, et tout atelier peut atteindre 1 000.
const plafondNiveau = (L, max = 3) => Math.round(500 + 500 * (Math.min(L, max) - 1) / Math.max(1, max - 1));

// ===================== Maîtrise d'un jeu =====================
const moyenneDe = l => l.reduce((s, x) => s + x, 0) / l.length;
const borner = (x, a, b) => Math.max(a, Math.min(b, x));

// Jeu noté : pour chaque niveau joué, réussite des 10 dernières parties, corrigée du hasard, pondérée par la confiance
// (min(1, parties / 5)), sous le plafond du niveau ; la maîtrise du jeu est la plus grande de ces valeurs.
// Dix parties et non cinq, cinq pour la pleine confiance et non trois : sur dix questions à 50 % de hasard, trois
// parties chanceuses suffisaient à fixer un niveau élevé, que l'on gardait en s'arrêtant là (meilleur niveau gardé).
// max : nombre de niveaux de l'atelier (3 par défaut)
const PARTIES_MOYENNE = 10, PARTIES_CONFIANCE = 5;
function maitriseNotee(resultat, c, max = 3) {
  if (!resultat) return 0;
  const niveaux = resultat.niveaux && Object.keys(resultat.niveaux).length ? resultat.niveaux
    : (resultat.historique && resultat.historique.length && resultat.sur ? { 0: resultat } : {});
  let meilleure = 0;
  Object.entries(niveaux).forEach(([L, r]) => {
    const h = (r.historique || []).filter(x => typeof x === "number" && isFinite(x));
    if (!h.length || !(r.sur > 0)) return;
    const reussite = borner(moyenneDe(h.slice(-PARTIES_MOYENNE)) / r.sur, 0, 1);
    const q = Math.max(0, (reussite - c) / (1 - c));
    const f = Math.min(1, (r.n || h.length) / PARTIES_CONFIANCE);
    const plafond = Number(L) ? plafondNiveau(Number(L), max) : 1000;
    meilleure = Math.max(meilleure, plafond * q * f);
  });
  return meilleure;
}

// Mesures particulières, converties en 0 à 1 000 (écrites en clair dans l'article du guide)
const MESURES = {
  // Ancrage : écart moyen entre estimations après une ancre haute et une ancre basse (h / b - 1) ; 0 → 1 000, 0,5 ou plus → 0
  ancre: d => {
    const l = (d.ancrages || []).filter(a => a.h > 0 && a.b > 0).slice(-5);
    if (!l.length) return 0;
    const effet = moyenneDe(l.map(a => Math.abs(a.h / a.b - 1)));
    return 1000 * Math.max(0, 1 - effet / 0.5) * Math.min(1, l.length / 3);
  },
};

// Prévisions du carnet (raisonner.js) : issue « oui », « non » ou « annulee » (true et false acceptés pour d'anciennes
// données). Ne comptent que les prévisions résolues dont l'échéance tombait au moins 7 jours après leur création : une
// prévision pour le jour même, dont on connaît déjà l'issue, ne dit rien de la capacité à prévoir.
const ECART_PREVISION = 7;
function previsionsRecevables(previsions) {
  return (Array.isArray(previsions) ? previsions : []).filter(p => p && typeof p.p === "number"
    && (p.issue === "oui" || p.issue === "non" || typeof p.issue === "boolean")
    && Number.isInteger(p.echeance) && Number.isInteger(p.creee) && p.echeance - p.creee >= ECART_PREVISION);
}
// Score de Brier : moyenne de (probabilité annoncée − issue)², l'issue valant 1 ou 0 ; p en % (anciennes données : 0 à 1)
const brierPrevisions = l => moyenneDe(l.map(p => Math.pow(p.p / (p.p > 1 ? 100 : 1) - (p.issue === true || p.issue === "oui" ? 1 : 0), 2)));

// Étalonnage (clé confiance : { certitude en % : [réponses, justes] }, vrai ou faux) : score de Brier de la certitude
// annoncée, rapporté à celui d'un répondant qui annonce toujours 50 % (0,25) : 1 000 × (1 − Brier / 0,25), 0 au pire ;
// 30 réponses pour la pleine confiance. Une règle de score strictement propre (Gneiting et Raftery, 2007) : on ne
// l'améliore ni en se trompant exprès, ni en annonçant 50 % partout (ce qui annulait l'ancien écart entre certitude et
// réussite sans rien savoir). Elle récompense à la fois l'étalonnage et le savoir. Compte comme un jeu du domaine « confiance ».
function brierEtalonnage(confiance) {
  const lignes = Object.entries(confiance || {}).filter(([k, v]) => Array.isArray(v) && v[0] > 0 && v[1] >= 0 && v[1] <= v[0] && Number(k) > 0 && Number(k) <= 100);
  const n = lignes.reduce((s, [, v]) => s + v[0], 0);
  if (!n) return { n: 0, brier: 0.25 };
  const somme = lignes.reduce((s, [k, [m, j]]) => { const p = Number(k) / 100; return s + j * (1 - p) ** 2 + (m - j) * p ** 2; }, 0);
  return { n, brier: somme / n };
}
function maitriseEtalonnage(d) {
  const { n, brier } = brierEtalonnage(d.confiance);
  if (!n) return 0;
  return 1000 * Math.max(0, 1 - brier / 0.25) * Math.min(1, n / 30);
}

// Fourchettes à 90 % (intervalles, chiffres.js) : note d'une partie sur 10 tirée du score de fourchette moyen
// (scoreFourchette, Gneiting et Raftery, 2007, en ordres de grandeur) : 10 × (1 − score / 3), 0 au pire. Compter les
// fourchettes justes récompensait les fourchettes immenses (de 0 à 10¹² : 10 sur 10) ; ce score pénalise la largeur
// autant que l'erreur. Repère : des fourchettes justes d'un facteur 4 donnent 8 ; d'un facteur 10, 7 ; d'un facteur
// 1 000, 0. Les parties notées ainsi portent « largeur: 1 » dans leur niveau (resultatsAteliers.intervalles) : les
// anciennes, notées au nombre de fourchettes justes, ne comptent plus dans la maîtrise.
const SCORE_FOURCHETTE_NUL = 3;
const noteFourchettes = couts => Math.round(10 * Math.max(0, 1 - moyenneDe(couts) / SCORE_FOURCHETTE_NUL));
function niveauxNotesParLargeur(r) {
  if (!r || !r.niveaux) return null;
  const niveaux = Object.fromEntries(Object.entries(r.niveaux).filter(([, x]) => x && x.largeur));
  return Object.keys(niveaux).length ? { niveaux } : null;
}

function maitriseJeu(id, d) {
  const [, type, c] = MAITRISE_JEUX[id] || [];
  const r = (d.resultatsAteliers || {})[id];
  if (type === "note") return maitriseNotee(id === "intervalles" ? niveauxNotesParLargeur(r) : r, c, niveauMax(id));
  if (type === "mesure") return MESURES[id] ? MESURES[id](d) : 0;
  return 0;
}

// Révision espacée (méthode Leitner classique) : une bonne réponse ne fait monter la notion de boîte que si sa révision
// était due (échéance atteinte) ou si la notion est nouvelle ; une bonne réponse anticipée compte (n, j) sans changer
// ni la boîte ni l'échéance. Une erreur ramène toujours en boîte 1. « Au hasard » juste : pas de montée, échéance
// recalculée seulement si la révision était due. Sans cette règle, cinq bonnes réponses le même jour mettaient une
// notion en boîte 5 (et rapportaient ses points) : l'espacement, que le site enseigne, n'était plus respecté.
// Rend la nouvelle mémoire de la notion et les faits utiles aux points ; ne modifie pas m.
function reponseLeitner(m0, juste, certitude, jour, intervalles) {
  const m = { b: 0, d: 0, n: 0, j: 0, ...(m0 || {}) };
  const due = m.n === 0 || m.d <= jour;
  const boiteAvant = m.b;
  m.n++;
  if (juste) {
    m.j++;
    if (due && certitude !== "hasard") m.b = Math.min(5, m.b + 1);
    if (due) m.d = jour + Math.max(1, intervalles[m.b]);
  } else {
    m.b = 1;
    m.d = jour + Math.max(1, intervalles[1]);
  }
  return { m, due, monte: m.b > boiteAvant && juste };
}

// Notions : 80 % pour les boîtes de révision (somme des boîtes des 90 fiches / 450), 20 % pour les duels entre notions
// proches (réussite corrigée du hasard, deux réponses ; pleine confiance à partir de 20 duels)
function maitriseNotions(d, nbFiches) {
  const boites = Object.values(d.memoire || {}).reduce((s, m) => s + borner(Number(m.b) || 0, 0, 5), 0);
  const duels = Object.values(d.duels || {}).filter(Array.isArray);
  const n = duels.reduce((s, x) => s + x[0], 0), j = duels.reduce((s, x) => s + x[1], 0);
  const q = n ? Math.max(0, (j / n - 0.5) / 0.5) * Math.min(1, n / 20) : 0;
  return 800 * Math.min(1, boites / (5 * nbFiches)) + 200 * q;
}

// Grand test : chaque axe du dernier test complet dont moins de la moitié des items avaient déjà été vus (même règle que
// pour le niveau, grand-test.js) compte comme un jeu du domaine le plus proche. A à D : proportion de
// réussite corrigée d'un hasard estimé à 1/4, pleine confiance à 10 items ; E (étalonnage) : score de Brier de la
// certitude rapporté à 0,25, comme l'étalonnage du vrai ou faux (l'ancien excès de confiance, |certitude − réussite|,
// s'annulait en se trompant exprès ; un test sans score de Brier ne compte pas pour E). F (exploratoire) ne compte pas.
const AXES_GRAND_TEST = { A: "raisonner", B: "perception", C: "raisonner", D: "debattre", E: "confiance" };
function maitriseGrandTest(d) {
  const tests = ((d.grandTest || {}).historiqueTests || []).filter(t => t && t.mode === "complet" && t.dateFin && t.scores
    && (!Array.isArray(t.instances) || t.instances.filter(x => x && x.dejaVu).length < t.instances.length / 2));
  if (!tests.length) return {};
  const scores = tests[tests.length - 1].scores, sortie = {};
  Object.entries(AXES_GRAND_TEST).forEach(([axe, domaine]) => {
    const s = scores[axe];
    if (!s || typeof s.valeur !== "number") return;
    const f = Math.min(1, (s.n || 0) / 10);
    if (axe === "E") { if (typeof s.brier === "number") sortie[axe] = [domaine, 1000 * Math.max(0, 1 - s.brier / 0.25) * f]; return; }
    sortie[axe] = [domaine, 1000 * Math.max(0, (s.valeur - 0.25) / 0.75) * f];
  });
  return sortie;
}

// Maîtrise de chaque domaine : moyenne de ses jeux mesurés, un jeu jamais joué comptant pour zéro (on ne gonfle pas son
// score en ne jouant qu'à ce qu'on réussit) ; et maîtrise globale, moyenne des six domaines
function maitrises(d, ateliers, nbFiches) {
  const jeux = {};
  ateliers.filter(id => MAITRISE_JEUX[id] && MAITRISE_JEUX[id][1] !== "aucun").forEach(id => { jeux[id] = [MAITRISE_JEUX[id][0], maitriseJeu(id, d)]; });
  jeux.etalonnage = ["confiance", maitriseEtalonnage(d)];
  Object.entries(maitriseGrandTest(d)).forEach(([axe, v]) => { jeux["grand-test-" + axe] = v; });
  const domaines = {};
  DOMAINES.forEach(([dom]) => {
    if (dom === "notions") { domaines.notions = maitriseNotions(d, nbFiches); return; }
    const v = Object.values(jeux).filter(([x]) => x === dom).map(([, m]) => m);
    domaines[dom] = v.length ? moyenneDe(v) : 0;
  });
  const globale = Math.round(moyenneDe(DOMAINES.map(([dom]) => domaines[dom])));
  Object.keys(domaines).forEach(k => { domaines[k] = Math.round(domaines[k]); });
  Object.keys(jeux).forEach(k => { jeux[k][1] = Math.round(jeux[k][1]); });
  return { globale, domaines, jeux };
}

// ===================== Grades =====================
// Donnés par la meilleure maîtrise atteinte : un grade acquis ne se perd pas
const GRADES = [[0, "Novice"], [5, "Élève"], [25, "Sceptique"], [60, "Détective"], [120, "Analyste"], [220, "Stratège"],
  [350, "Philosophe"], [500, "Virtuose"], [650, "Maître"], [800, "Esprit critique"]];
function gradeDe(meilleure) {
  let i = 0;
  GRADES.forEach(([seuil], k) => { if (meilleure >= seuil) i = k; });
  return { rang: i, nom: GRADES[i][1], seuil: GRADES[i][0], suivant: GRADES[i + 1] || null };
}

// Photographie du jour (clé maitrise) : 400 jours au plus, meilleure maîtrise atteinte. La meilleure maîtrise, qui
// donne le grade, est lissée : c'est le minimum de la maîtrise globale sur les trois derniers jours photographiés (ou
// moins au début). Un pic d'un jour (une série chanceuse) ne fixe donc plus un grade. Un grade acquis reste acquis.
const JOURS_LISSAGE = 3;
function photographier(etat, jour, m) {
  const e = { jours: {}, meilleure: 0, ...(etat || {}) };
  e.jours = { ...e.jours, [jour]: [m.globale, ...DOMAINES.map(([dom]) => m.domaines[dom])] };
  const cles = Object.keys(e.jours).map(Number).sort((a, b) => a - b);
  cles.slice(0, Math.max(0, cles.length - 400)).forEach(k => { delete e.jours[k]; });
  const derniers = Object.keys(e.jours).map(Number).sort((a, b) => a - b).slice(-JOURS_LISSAGE);
  e.meilleure = Math.max(e.meilleure || 0, Math.min(...derniers.map(k => e.jours[k][0])));
  if (!e.depuis) e.depuis = jour;
  return e;
}

// ===================== Points de lucidité =====================
// Barème du quiz : il paie l'étalonnage. « Au hasard » est le meilleur choix sous 1/3 de chances d'avoir raison,
// « Plutôt sûr » entre 1/3 et 3/4, « Sûr » au-delà (quatre réponses) ; duels (deux réponses) : 60 % et 6/7.
const BAREME_QUIZ = { sur: [10, -8], plutot: [8, -2], hasard: [4, 0], aucune: [4, 0] };
const BAREME_DUEL = { sur: [5, -9], plutot: [4, -3], hasard: [2, 0], aucune: [2, 0] };
function pointsReponse(bareme, certitude, juste) {
  const b = bareme[certitude] || bareme.aucune;
  return juste ? b[0] : b[1];
}

// Sources de points, avec leur limite : [points, plafond par jour (ou "une fois" par clé), portée du plafond]
// Le plafond se compte en événements (nombre) ou en points (« points: true »).
const SOURCES_LUCIDITE = {
  // Le total d'une série (barème de l'étalonnage) ; au plus 100 par jour, deux séries parfaites : refaire le quiz en
  // boucle sur des notions déjà sues ne doit pas rapporter sans fin (sans fonction « points », il ne rapportait rien)
  "quiz": { points: total => total, plafondPoints: 100 },
  "reponse-libre": { points: () => 12 },
  "boite": { points: b => 2 * b },
  "boite-5": { points: () => 10, unique: true },
  "revision-a-l-heure": { points: n => 3 * n },
  "chrono": { points: s => Math.min(40, 2 * Math.max(0, s)), parJour: 3 },
  "situation-jour": { points: juste => 5 + (juste ? 3 : 0), parJour: 1 },
  "vf-jour": { points: juste => 3 + (juste ? 2 : 0), parJour: 1 },
  "defi-jour": { points: score => 2 * score + 10, parJour: 1 },
  "trois-cartes": { points: () => 10, parJour: 1 },
  "defi-libre": { points: score => 2 * score, parJour: 2 },
  "piece-jour": { points: note => 2 * note + 10, parJour: 1 },
  "piece-libre": { points: note => 2 * note, parJour: 2 },
  "piece-etalonnage": { points: p => p, parJour: 3 },
  "atelier-note": { points: ([score, sur, niveau]) => Math.round(10 * borner(score / sur, 0, 1) * ({ 2: 1.5, 3: 2, 4: 2.5, 5: 3 }[niveau] || 1)), parJourCle: 3 },
  // Ateliers sans note (expériences, bingo, jeux à plusieurs) : une seule fois par atelier ; les refaire n'apprend
  // plus grand-chose et rapportait 8 points par jour et par atelier
  "atelier-sans-note": { points: () => 8, unique: true },
  "atelier-premier": { points: () => 15, unique: true },
  "atelier-maitrise": { points: () => 50, unique: true },
  "galton": { points: justes => 2 * justes, plafondPoints: 20 },
  "reperage": { points: () => 5, parJour: 2 },
  "fiche-lue": { points: () => 2, unique: true },
  "grand-test": { points: mode => mode === "complet" ? 100 : 30, tousLes: 30 },
  "etape-parcours": { points: () => 10, unique: true },
  "parcours-termine": { points: () => 50, unique: true }
};

// Durée minimale avant qu'une fiche compte comme lue (points « fiche-lue », fichesLues), en millisecondes : 15 s pour
// 1 000 caractères (environ 650 mots par minute : une lecture en diagonale, mais plus un simple défilement)
const dureeLectureMin = caracteres => Math.round(15 * Math.max(0, caracteres));

// Vrai si une limite (par jour, plafond de points, « une fois ») empêche ce gain aujourd'hui : le bilan le dit au joueur,
// qui croirait sinon que sa partie n'a pas été prise en compte
function gainBloque(etat, source, jour, cle = "") {
  const s = SOURCES_LUCIDITE[source], e = etat || {}, c = e.compteurs || {};
  if (!s) return false;
  const id = source + "|" + cle;
  if (s.unique) return !!(e.uniques && e.uniques[id]);
  if (c.jour !== jour) return false;
  const compte = s.parJour ? source : s.parJourCle ? id : null;
  if (compte && (c[compte] || 0) >= (s.parJour || s.parJourCle)) return true;
  return !!(s.plafondPoints && (c[source + ":points"] || 0) >= s.plafondPoints);
}

// Applique un gain à l'état (clé lucidite) et rend [nouvel état, points gagnés]. Pur : même entrée, même sortie.
// cle : ce qui identifie l'événement (fiche, atelier…) pour les limites « une fois » et « par jour et par clé ».
function appliquerGain(etat, source, valeur, jour, cle = "") {
  const e = { total: 0, jours: {}, compteurs: {}, uniques: {}, journal: [], ...(etat || {}) };
  e.jours = { ...e.jours }; e.compteurs = { ...e.compteurs }; e.uniques = { ...e.uniques }; e.journal = [...e.journal];
  const s = SOURCES_LUCIDITE[source];
  if (!s || !s.points) return [e, 0];
  const id = source + "|" + cle;
  if (s.unique && e.uniques[id]) return [e, 0];
  if (s.tousLes && e.uniques[id] && jour - e.uniques[id] < s.tousLes) return [e, 0];
  // Les compteurs du jour : un seul jour gardé (les plafonds sont quotidiens)
  if (e.compteurs.jour !== jour) e.compteurs = { jour };
  const compte = s.parJour ? source : s.parJourCle ? id : null;
  if (compte && (e.compteurs[compte] || 0) >= (s.parJour || s.parJourCle)) return [e, 0];
  let points = Math.max(0, Math.round(s.points(valeur)));
  if (s.plafondPoints) points = Math.min(points, Math.max(0, s.plafondPoints - (e.compteurs[source + ":points"] || 0)));
  if (compte) e.compteurs[compte] = (e.compteurs[compte] || 0) + 1;
  if (s.plafondPoints) e.compteurs[source + ":points"] = (e.compteurs[source + ":points"] || 0) + points;
  if (s.unique || s.tousLes) e.uniques[id] = jour;
  return [ajouterPoints(e, points, jour, source), points];
}

// Ajoute des points au total et au jour (120 jours gardés) et au journal (50 derniers gains)
function ajouterPoints(e, points, jour, source) {
  if (points <= 0) return e;
  e.total += points;
  e.jours[jour] = (e.jours[jour] || 0) + points;
  const jours = Object.keys(e.jours).map(Number).sort((a, b) => a - b);
  jours.slice(0, Math.max(0, jours.length - 120)).forEach(k => { delete e.jours[k]; });
  e.journal = [...e.journal, [jour, source, points]].slice(-50);
  return e;
}

// Total d'une série de quiz : jamais négatif
const totalSerie = points => Math.max(0, points.reduce((s, x) => s + x, 0));

// Rattrapage : une seule fois, la progression passée convertie en points (6 par bonne réponse au quiz, 4 par boîte
// atteinte, 15 par atelier essayé, 8 par partie jusqu'à 20 par atelier, 5 par jour d'activité, 5 par repérage jusqu'à 60)
function pointsDeRattrapage(d) {
  const memoire = Object.values(d.memoire || {});
  const ateliers = Object.values(d.resultatsAteliers || {});
  return memoire.reduce((s, m) => s + 6 * (Number(m.j) || 0) + 4 * borner(Number(m.b) || 0, 0, 5), 0)
    + ateliers.reduce((s, r) => s + 15 + 8 * Math.min(20, Number(r.n) || 0), 0)
    + 5 * (d.activite || []).length + 5 * Math.min(60, (d.reperages || []).length);
}
function rattraper(etat, d, jour) {
  const e = { total: 0, jours: {}, compteurs: {}, uniques: {}, journal: [], ...(etat || {}) };
  if (e.rattrapage !== undefined) return [e, 0];
  const points = pointsDeRattrapage(d);
  e.rattrapage = points;
  e.total += points;
  return [e, points];
}

// Série de jours avec un jour de repos : un jour manqué par période de sept jours ne la rompt pas
function serieAvecRepos(activite, aujourdhui) {
  const jours = new Set(activite);
  let j = jours.has(aujourdhui) ? aujourdhui : aujourdhui - 1, n = 0, dernierRepos = Infinity;
  while (true) {
    if (jours.has(j)) { n++; j--; continue; }
    // Jour manqué : pardonné si aucun autre ne l'a été dans les sept jours qui suivent, et si la série continue avant
    if (dernierRepos - j >= 7 && jours.has(j - 1) && n > 0) { dernierRepos = j; j--; continue; }
    return n;
  }
}

// ===================== Distinctions =====================
// Calculées à partir des données enregistrées : elles sont donc rétroactives. [id, nom, condition, pourquoi, lien, secrète]
const DISTINCTIONS = [
  ["premier-doute", "Premier doute", d => Object.keys(d.memoire || {}).length >= 10, "Dix notions différentes rencontrées au quiz, l'équivalent d'une série.", "#quiz"],
  ["regulier", "Régulier", d => serieAvecRepos(d.activite || [], d.aujourdhui) >= 7, "Sept jours de suite : la régularité fait la mémoire.", "#quiz/reviser"],
  ["assidu", "Assidu", d => serieAvecRepos(d.activite || [], d.aujourdhui) >= 30, "Trente jours de suite.", "#quiz/reviser"],
  ["a-l-heure", "À l'heure", d => (d.compteursLucidite || {}).revisionsALHeure >= 20, "Vingt révisions faites le jour prévu : espacer les révisions aide à retenir.", "#quiz/reviser"],
  ["memoire-longue", "Mémoire longue", d => Object.values(d.memoire || {}).filter(m => m.b >= 5).length >= 10, "Dix notions en boîte 5, la dernière boîte de révision (une révision tous les 30 jours).", "#quiz/reviser"],
  ["cartographe", "Cartographe", d => new Set((d.fichesLues || []).map(c => d.categorieDe(c))).size >= 14, "Une fiche lue dans chacune des quatorze catégories.", "#biais"],
  ["codex-complet", "Codex complet", d => Object.keys(d.memoire || {}).length >= d.nbFiches, "Les 90 notions rencontrées au quiz.", "#quiz"],
  ["bien-etalonne", "Bien étalonné", d => { const [n, j] = (d.certitudes || {}).sur || [0, 0]; const t = Object.values(d.certitudes || {}).reduce((s, x) => s + (x[0] || 0), 0); return t >= 50 && n > 0 && j / n >= 0.85; }, "Cinquante réponses avec certitude, et au moins 85 % de réussite quand vous êtes sûr.", "biais:surprecision"],
  ["je-sais", "Je sais que je ne sais pas", d => { const c = d.certitudes || {}, [n, j] = c.sur || [0, 0]; return (c.hasard || [0])[0] >= 25 && n >= 20 && j / n >= 0.85; }, "Vingt-cinq réponses déclarées « au hasard », et au moins 85 % de réussite sur vingt réponses ou plus quand vous êtes sûr : savoir ce qu'on sait, et qu'on ne sait pas.", "biais:dunning-kruger"],
  ["lecon-retenue", "Leçon retenue", d => (d.compteursLucidite || {}).leconsRetenues >= 10, "Dix bonnes réponses à des notions sur lesquelles vous vous étiez trompé en étant sûr.", "#quiz/reviser"],
  ["fourchettes", "Fourchettes honnêtes", d => { const [n, j] = d.fourchettes || [0, 0]; return n >= 30 && j / n >= 0.85 && j / n <= 0.95 && maitriseJeu("intervalles", d) >= 300; }, "Trente fourchettes à 90 %, dont 85 à 95 % justes, et au moins 300 de maîtrise à ce jeu, dont la note pénalise les fourchettes trop larges : ni trop étroites, ni immenses.", "#chiffres/intervalles"],
  ["previsionniste", "Prévisionniste", d => { const l = previsionsRecevables(d.previsions); return l.length >= 10 && new Set(l.map(p => p.creee)).size >= 5 && brierPrevisions(l) <= 0.2; }, "Dix prévisions résolues, faites au moins sept jours à l'avance et sur cinq jours différents, avec un score de Brier d'au plus 0,20 (0 : des prévisions parfaites ; 0,25 : toujours « 50 % »).", "#tests/carnet"],
  ["bayesien", "Bayésien", d => { const r = ((d.resultatsAteliers || {}).depistage || {}).niveaux; return !!(r && r[3] && (r[3].historique || []).some(x => x / r[3].sur >= 0.9)); }, "« Tests positifs » réussi à 90 % au niveau 3.", "#tests/depistage"],
  ["porte-deux", "Porte numéro deux", d => Object.values(d.montyHall || {}).reduce((s, x) => s + ((x.changer || [0, 0])[1] || 0), 0) >= 20, "Avoir changé de porte vingt fois à Monty Hall.", "#tests/monty-hall"],
  ["sans-ancre", "Sans ancre", d => { const l = (d.ancrages || []).slice(-3); return l.length >= 3 && l.every(a => Math.abs(a.h / a.b - 1) < 0.1); }, "Un effet d'ancrage inférieur à 10 % à chacune de vos trois dernières parties.", "biais:ancrage"],
  ["p-005", "p < 0,05", d => !!(d.resultatsAteliers || {}).fabriquer, "« Fabriquer un résultat » terminé : voir comment on fabrique une découverte.", "#tests/fabriquer"],
  ["oreille-fine", "Oreille fine", d => { const l = (d.debats || []).slice(-3); return l.length >= 3 && l.every(x => x.d >= 2); }, "Une sensibilité d′ d'au moins 2 à chacun de vos trois derniers débats : une très bonne distinction entre sophismes et répliques recevables.", "#tests/debat-truque"],
  ["homme-acier", "Homme d'acier", d => { const r = ((d.resultatsAteliers || {}).reformuler || {}).niveaux || {}; return !!(r[2] || r[3]); }, "« Reformuler sans trahir » terminé au niveau 2 ou plus.", "#tests/reformuler"],
  ["bingo", "Bingo", d => !!(d.bingo && d.bingo.ligne), "Une ligne complète au bingo des sophismes.", "#tests/bingo"],
  ["sur-le-terrain", "Sur le terrain", d => (d.reperages || []).length >= 10 && joursDeReperage(d) >= 5, "Dix repérages notés, sur cinq jours différents au moins : l'esprit critique sert dans la vie courante.", "#accueil"],
  ["naturaliste", "Naturaliste", d => new Set((d.reperages || []).map(r => r.cle)).size >= 10 && joursDeReperage(d) >= 5, "Des repérages pour dix notions différentes, sur cinq jours différents au moins.", "#accueil"],
  ["decision-eclairee", "Décision éclairée", d => (d.decisions || []).some(x => x.bilanFait), "Une décision guidée dont le bilan a été fait.", "#tests/decision"],
  ["explorateur", "Explorateur", d => Object.keys(d.resultatsAteliers || {}).length >= 25, "Vingt-cinq ateliers essayés.", "#ateliers"],
  ["tour-complet", "Tour complet", d => d.ateliers.every(id => (d.resultatsAteliers || {})[id] || id === "grand-test"), "Tous les ateliers essayés.", "#ateliers"],
  ["grand-test", "Grand test", d => ((d.grandTest || {}).historiqueTests || []).some(t => t && t.mode === "complet" && t.dateFin), "Un Grand test complet terminé.", "#tests/grand-test"],
  ["specialiste", "Spécialiste", d => Object.values(d.domaines || {}).some(v => v >= 800), "800 de maîtrise dans un domaine.", "#profil"],
  ["polyvalent", "Polyvalent", d => DOMAINES.every(([dom]) => (d.domaines || {})[dom] >= 300), "Au moins 300 dans chacun des six domaines.", "#profil"],
  ["apparences", "Les apparences", d => !!(d.drapeaux || {}).embleme, "Avoir révélé l'emblème de l'en-tête.", "#accueil", true],
  ["demonteur", "Démonteur d'illusions", d => ((d.drapeaux || {}).illusions || []).length >= 8, "Avoir vérifié huit illusions du jour différentes.", "#accueil", true],
  // Secrets ajoutés le 15 novembre 2026 (solutions : tests/secrets.md), du plus facile au plus difficile
  ["chercheur", "Chercheur de secrets", d => secretTrouve(d, "chercheur"), "Avoir cherché un secret là où on cherche tout.", "#accueil", true],
  // Noctambule récompensait des points gagnés entre minuit et 5 h ; le sommeil consolide ce qu'on vient d'apprendre
  // (Diekelmann et Born, 2010) : même identifiant, autre condition (thème sombre choisi, pour lire le soir)
  ["noctambule", "Noctambule", d => secretTrouve(d, "noctambule"), "Avoir choisi le thème sombre, pour lire le soir sans s'éblouir. Et dormir ensuite : le sommeil consolide ce qu'on vient d'apprendre.", "#accueil", true],
  ["bilingue", "Bilingue", d => secretTrouve(d, "langue-fr") && secretTrouve(d, "langue-en"), "Avoir visité le site dans ses deux langues.", "#accueil", true],
  ["sesame", "Sésame", d => secretTrouve(d, "sesame"), "Avoir tapé au clavier le mot qui ouvre l'esprit critique, hors de tout champ.", "#accueil", true],
  ["vendredi-13", "Vendredi 13", d => secretTrouve(d, "vendredi-13"), "Avoir joué un vendredi 13, sans qu'il arrive rien de plus qu'un autre jour.", "biais:apophenie", true],
  ["oeil-de-lynx", "Œil de lynx", d => secretTrouve(d, "oeil-de-lynx"), "Avoir donné le nombre exact d'un nuage d'au moins cent points.", "#chiffres/points", true],
  ["seize-sceaux", "Tous les sceaux", d => typeof PARCOURS !== "undefined" && PARCOURS.every(p => avancementParcours(p, donneesParcours()) === p.etapes.length), "Avoir terminé tous les parcours.", "#parcours", true],
  ["cryptographe", "Cryptographe", d => secretTrouve(d, "cryptographe"), "Avoir résolu l'énigme laissée à ceux qui regardent sous le capot.", "#accueil", true]
];
const joursDeReperage = d => new Set((d.reperages || []).map(r => r && r.j)).size;
const secretTrouve = (d, id) => (((d.drapeaux || {}).secrets) || []).includes(id);
function distinctionsObtenues(d) {
  return DISTINCTIONS.filter(([, , condition]) => { try { return !!condition(d); } catch (e) { return false; } }).map(([id]) => id);
}

// ===================== Score face au hasard =====================
// Loi binomiale : probabilité d'obtenir exactement k bonnes réponses sur n en répondant au hasard (probabilité p)
function binomiale(n, p) {
  const l = [];
  let c = 1;
  for (let k = 0; k <= n; k++) {
    l.push(c * Math.pow(p, k) * Math.pow(1 - p, n - k));
    c = c * (n - k) / (k + 1);
  }
  return l;
}
// Probabilité d'obtenir au moins k sur n au hasard
const auMoinsAuHasard = (k, n, p) => binomiale(n, p).slice(k).reduce((s, x) => s + x, 0);
