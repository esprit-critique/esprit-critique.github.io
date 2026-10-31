
// ===================== Items d'une passation et scores =====================
// resoudreItem reconstruit un item à partir de son instance enregistrée (et de la graine de la passation) : c'est la
// même fonction pure qui sert à l'affichage, à la correction et au calcul des scores. Les réponses brutes restent
// enregistrées, pour recalculer si une formule change.

function melangerArguments(q, graine) {
  const [id, question, ps, pf, spf, cs, cf, scf] = q;
  const args = [{ camp: "pour", qualite: "solide", texte: ps }, { camp: "pour", qualite: "faible", texte: pf, sophisme: spf },
    { camp: "contre", qualite: "solide", texte: cs }, { camp: "contre", qualite: "faible", texte: cf, sophisme: scf }];
  return { id, question, arguments: melanger(args, generateur(graineDe(id + ":" + graine))) };
}

function resoudreItem(inst, graine) {
  const id = inst.instanceId, v = inst.valeurs || {};
  const famille = familleGT(inst.famille);
  if (famille) return instanceGT(famille, v.i, graine);
  const base = { instanceId: id, itemId: inst.itemId, famille: inst.famille, etape: v.etape, banque: v.banque, aRelire: true };
  if (v.banque === "vf") {
    const x = VF_GT.find(y => y.id === id);
    return Object.assign(base, { type: "vf", axe: "D", texte: x.texte, juste: x.vrai, explication: x.explication, source: x.source, fiches: x.fiches || [], chance: 0.5 });
  }
  if (v.banque === "exposition") {
    const x = EXPOSITIONS_GT.find(y => y[0] === id);
    return Object.assign(base, { type: v.role === "lecture" ? "exposition-lecture" : "exposition-note", texte: x[3], domaine: x[1], vrai: x[2], role: v.role });
  }
  if (v.banque === "grandeur") return Object.assign(base, { type: v.role === "rappel" ? "rappel" : "fourchette", axe: "E", q: grandeurGT(id), correction: v.correction });
  if (v.banque === "angleMort") {
    const x = ANGLE_MORT_GT.find(y => y[0] === id);
    return Object.assign(base, { type: "angle-mort", description: x[2], fiche: x[1] });
  }
  if (v.banque === "societe") return Object.assign(base, { type: "societe", axe: "F" }, melangerArguments(SOCIETE_GT.find(y => y[0] === id), graine));
  const i = Number(id.split("@")[1]);
  if (v.banque === "drm") return Object.assign(base, demonstrationDRM(i, graine));
  if (v.banque === "recit") return Object.assign(base, demonstrationRecit(i, graine));
  if (v.banque === "source") return Object.assign(base, demonstrationSource(i, graine));
  return null;
}

// Une réponse est-elle juste ? (items notés seulement ; null pour une non-réponse ou un item non noté)
function reponseJuste(item, valeur) {
  if (valeur === null || valeur === undefined) return null;
  if (item.type === "qcm") return valeur === item.justeAffiche;
  if (item.type === "calcul") return typeof valeur === "number" && Math.abs(valeur - item.juste) < 1e-6;
  if (item.type === "binaire" || item.type === "vf") return valeur === item.juste;
  return null;
}
// La réponse est-elle le leurre intuitif ?
function reponseLeurre(item, valeur) {
  if (valeur === null || valeur === undefined || item.leurre === null || item.leurre === undefined) return false;
  if (item.type === "qcm") return valeur === item.leurreAffiche;
  if (item.type === "calcul") return typeof valeur === "number" && Math.abs(valeur - item.leurre) < 1e-6;
  if (item.type === "binaire") return valeur === item.leurre;
  return false;
}

// Toutes les réponses d'une passation, avec leur item résolu et leur exactitude
function lignesPassation(t) {
  const instances = {};
  t.instances.forEach(x => { instances[x.itemId] = x; });
  return t.reponses.map(r => {
    const item = resoudreItem(instances[r.itemId], t.graine);
    return { reponse: r, item, juste: item ? reponseJuste(item, r.valeur) : null, leurre: item ? reponseLeurre(item, r.valeur) : false };
  }).filter(l => l.item);
}

const plageWilson = r => r.n >= ITEMS_MIN_PLAGE ? { bas: r.bas, haut: r.haut, niveau: 0.8, methode: "Wilson corrigé" } : null;

// Scores séparés des six axes ; aucun score global. Les plages sont des plages plausibles à 80 % sous un modèle.
function calculerScores(t) {
  const lignes = lignesPassation(t), graine = graineDe(t.reponses);
  const scores = scoresVides();
  ["A", "B", "C"].forEach(axe => {
    const l = lignes.filter(x => x.item.axe === axe && x.juste !== null);
    const r = wilsonCorrige(l.filter(x => x.juste).length, l.length);
    scores[axe] = { valeur: r.p, plage: plageWilson(r), n: l.length };
  });
  // D : discernement. d′ seulement au complet (12 vrais et 12 faux) ; à l'express, démonstration sans note
  const vf = lignes.filter(x => x.item.type === "vf" && x.juste !== null);
  if (t.mode === "complet" && vf.length >= 24) {
    const d = discernement(vf.map(x => ({ vrai: x.item.juste, repondVrai: x.reponse.valeur === true })), graine);
    scores.D = { valeur: d.d, plage: d.plageD ? { bas: d.plageD.bas, haut: d.plageD.haut, niveau: 0.8, methode: "rééchantillonnage" } : null, n: vf.length, c: d.c };
  } else scores.D = { valeur: null, plage: null, n: vf.length, statut: "démonstration" };
  // E : étalonnage, sur tous les items notés avec certitude
  const avecCertitude = lignes.filter(x => x.juste !== null && x.reponse.certitude !== null).map(x => ({ p: x.reponse.certitude / 100, o: x.juste ? 1 : 0 }));
  const s = avecCertitude.length >= ITEMS_MIN_PLAGE ? surconfiancePlage(avecCertitude, graine) : null;
  scores.E = s ? { valeur: s.valeur, plage: s.plage ? { bas: s.plage.bas, haut: s.plage.haut, niveau: 0.8, methode: "rééchantillonnage" } : null, n: s.n } : { valeur: null, plage: null, n: avecCertitude.length };
  // F : impartialité, indicateur exploratoire, complet seulement, sans plage
  const societe = lignes.filter(x => x.item.type === "societe" && Array.isArray(x.reponse.valeur));
  const questions = societe.map(x => {
    const [position, ...notes] = x.reponse.valeur;
    return { position: position === 1 ? "pour" : position === -1 ? "contre" : null, notes: x.item.arguments.map((a, k) => ({ camp: a.camp, qualite: a.qualite, note: notes[k] })) };
  });
  const camp = questions.length ? indiceCamp(questions) : { indice: null };
  const decisions = questions.reduce((n, q) => n + q.notes.length, 0);
  scores.F = { valeur: t.mode === "complet" && decisions >= 8 ? camp.indice : null, plage: null, n: decisions, statut: "exploratoire" };
  return scores;
}
