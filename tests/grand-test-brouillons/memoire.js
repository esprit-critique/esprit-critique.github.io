
// ===================== Démonstrations de mémoire (jamais notées) =====================
// Trois démonstrations, chacune avec 20 instances : listes de mots associés (faux souvenir du mot critique),
// désinformation (une question glisse une couleur fausse), mémoire de la source (qui a dit quoi). Elles ne comptent
// dans aucun axe. Chacune est annoncée avant, et suivie d'une correction complète.

const FEMININS_RECITS_GT = new Set(["enveloppe", "laisse", "voiture", "valise", "écharpe", "couverture"]);

// Liste de mots associés : la liste à apprendre, puis six mots à reconnaître (trois appris, le mot critique jamais
// présenté, deux sans rapport), dans un ordre tiré par la graine
function demonstrationDRM(i, graine) {
  const [critique, mots, sansRapport] = LISTES_DRM_GT[i];
  const appris = [mots[1], mots[5], mots[8]];
  const test = melanger([...appris.map(m => ({ mot: m, present: true, critique: false })), { mot: critique, present: false, critique: true },
    ...sansRapport.map(m => ({ mot: m, present: false, critique: false }))], generateur(graineDe("drm@" + i + ":" + graine)));
  return { instanceId: "drm@" + i, type: "drm", liste: mots, critique, test,
    explication: "« " + critique + " » ne figurait pas dans la liste : tous les mots appris y étaient associés. La mémoire retient le sens général, puis complète ; le mot qui résume la liste paraît alors familier. Ce faux souvenir s'accompagne souvent d'une vraie certitude." };
}

// Récit et question trompeuse : la question présuppose une couleur fausse ; la reconnaissance vient plus tard
function demonstrationRecit(i, graine) {
  const [scene, objet, vue, suggeree, autres] = RECITS_GT[i];
  const [prenom, genre] = prenomGT(i, 9);
  const fem = FEMININS_RECITS_GT.has(objet);
  const article = fem ? "La" : "Le";
  const choix = melanger([vue, suggeree, ...autres], generateur(graineDe("recit@" + i + ":" + graine)));
  return { instanceId: "recit@" + i, type: "recit",
    recit: accorder(scene.replace("{c}", vue), prenom, genre),
    questionTrompeuse: article + " " + objet + " " + suggeree + " de " + prenom + " était-" + (fem ? "elle" : "il") + " plutôt neu" + (fem ? "ve" : "f") + " ou plutôt usé" + (fem ? "e" : "") + " ?",
    reponsesTrompeuse: ["Plutôt neu" + (fem ? "ve" : "f"), "Plutôt usé" + (fem ? "e" : ""), "Je ne sais pas"],
    reconnaissance: "Dans le récit, de quelle couleur était " + (fem ? "la " : "le ") + objet + " ?",
    choix, vue, suggeree,
    explication: "Dans le récit, " + (fem ? "la " : "le ") + objet + " était " + vue + ". La question suivante parlait " + (fem ? "de la " : "du ") + objet + " " + suggeree + " : une information glissée après coup peut se mêler au souvenir. C'est l'effet de désinformation, étudié notamment par Elizabeth Loftus." };
}

// Mémoire de la source : six informations, chacune attribuée à l'une de deux sources ; il faut ensuite retrouver
// la source de chacune
function demonstrationSource(i, graine) {
  const [sourceA, sourceB, infos] = SOURCES_GT[i % SOURCES_GT.length];
  const combinaison = COMBINAISONS_SOURCE_GT[Math.floor(i / SOURCES_GT.length) % COMBINAISONS_SOURCE_GT.length];
  const lues = infos.map((t, k) => ({ texte: t, source: combinaison >> k & 1 ? sourceA : sourceB }));
  return { instanceId: "source@" + i, type: "source", sources: [sourceA, sourceB], lues,
    test: melanger(lues, generateur(graineDe("source@" + i + ":" + graine))),
    explication: "On retient souvent une information sans se rappeler d'où elle vient. Le contenu et sa source sont mémorisés en partie séparément, et la source s'efface plus vite. Avant de répéter une information, demandez-vous où vous l'avez lue." };
}

// Bilans des démonstrations (fonctions pures, à partir des réponses)
// DRM : reponses = tableau de booléens (« était dans la liste ») dans l'ordre du test
function bilanDRM(demo, reponses) {
  const k = demo.test.findIndex(x => x.critique);
  const appris = demo.test.map((x, j) => x.present ? reponses[j] : null).filter(x => x !== null);
  const intrus = demo.test.map((x, j) => !x.present && !x.critique ? reponses[j] : null).filter(x => x !== null);
  return { critiqueReconnu: reponses[k] === true, apprisReconnus: appris.filter(Boolean).length, intrusReconnus: intrus.filter(Boolean).length };
}

// Désinformation : reponse = couleur choisie
const bilanRecit = (demo, couleur) => ({ juste: couleur === demo.vue, suggeree: couleur === demo.suggeree });

// Source : reponses = sources choisies, dans l'ordre du test (null : « je ne sais plus »)
function bilanSource(demo, reponses) {
  const justes = demo.test.filter((x, j) => reponses[j] === x.source).length;
  return { justes, oublis: reponses.filter(r => r === null).length, n: demo.test.length };
}

// Indice descriptif de sur-correction d'une passation : parmi les situations où la preuve permettait de conclure
// (familles marquées surCorrection), part des réponses qui ont choisi le rejet par principe (le leurre)
function indiceSurCorrection(items) {
  return surCorrection(items.filter(x => x.surCorrection).map(x => ({ preuveSuffisante: true, rejet: x.reponse === x.leurreAffiche })));
}
const MESSAGE_SUR_CORRECTION = "L'esprit critique n'est pas le contre-pied systématique. Une conclusion peut être solide quand la méthode et les données le sont.";
