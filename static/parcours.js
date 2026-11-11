// parcours.js : des parcours, suites d'étapes faites de contenus existants (refonte, lot 5). Rien n'est verrouillé :
// un parcours propose un ordre, il n'interdit rien. Une étape déjà faite avant de commencer est validée d'emblée.
// Étapes : "f:type:id" (lire une fiche : son pied atteint, fichesLues), "a:id" (un atelier : une partie enregistrée),
// "s" (une première série de quiz : dix notions rencontrées), "q" (quiz ciblé : cinq situations tirées des fiches du
// parcours, réussi à 4 sur 5). Clé parcours = { actif: id, quiz: { id: true } }.

const PARCOURS = [
  { id: "premiers-pas", titre: "Premiers pas",
    promesse: "Voir qu'on ne peut pas se fier à ses yeux, puis à ses raisonnements : le site en trois quarts d'heure.",
    conclusion: "Vous avez vu l'essentiel : l'œil se trompe même quand on sait, et le raisonnement aussi. La suite se joue dans la vie courante : quand vous repérez une notion autour de vous, notez-la avec « Je l'ai repéré » sur sa fiche.",
    etapes: ["a:illusion", "f:biais:confirmation", "a:crt", "f:sophismes:homme-de-paille", "q", "s"] },
  { id: "chiffres", titre: "Les chiffres qui trompent",
    promesse: "Taux de base, petits échantillons, survivants et graphiques : apprendre à lire un chiffre avant d'y croire.",
    conclusion: "Un chiffre n'est jamais seul : il a un dénominateur, un échantillon, une sélection et une mise en page. Repérez la prochaine statistique trompeuse que vous croiserez, et notez-la sur sa fiche.",
    etapes: ["f:biais:taux-de-base", "a:depistage", "f:biais:taille-echantillon", "a:correlation", "f:biais:regression-moyenne", "a:moniteur", "f:biais:survivant", "a:wald", "f:biais:simpson", "a:graphiques", "f:sophismes:correlation", "f:sophismes:cherry-picking", "a:fabriquer", "q"] },
  { id: "hasard", titre: "Le hasard n'a pas de mémoire",
    promesse: "Séries, coïncidences, portes et anniversaires : ce que le hasard fait vraiment, et ce que nous croyons y voir.",
    conclusion: "Le hasard produit des séries, des grappes et des coïncidences bien plus souvent qu'on ne le croit. La prochaine fois qu'une série vous paraît trop belle pour être fortuite, demandez-vous combien de chances elle avait d'arriver à quelqu'un.",
    etapes: ["f:biais:erreur-du-joueur", "a:hasard", "f:biais:apophenie", "a:ecrire-hasard", "f:biais:illusion-controle", "a:monty-hall", "f:biais:conjonction", "a:anniversaires", "f:sophismes:tireur-elite", "f:sophismes:post-hoc", "a:classiques", "q"] },
  { id: "savoir", titre: "Savoir ce que l'on sait",
    promesse: "Mesurer sa propre confiance : quand elle est justifiée, quand elle ne l'est pas.",
    conclusion: "Être sûr n'est pas avoir raison. Votre étalonnage se suit dans le profil ; pour le garder honnête, continuez d'indiquer votre certitude au quiz et de tenir un carnet de prévisions.",
    etapes: ["f:biais:surprecision", "a:vrai-faux", "f:biais:dunning-kruger", "a:intervalles", "f:biais:retrospectif", "a:foule", "f:biais:planification", "a:comprendre", "f:biais:angle-mort", "a:carnet", "q"] },
  { id: "decider", titre: "Décider sans se piéger",
    promesse: "Ancres, cadrages, pertes et coûts déjà engagés : les pièges qui se glissent dans nos choix.",
    conclusion: "Une bonne décision se juge à ce que l'on savait au moment de la prendre, pas à son résultat. Pour votre prochaine décision importante, faites la décision guidée et revenez à la date du bilan.",
    etapes: ["f:biais:ancrage", "a:ancre", "f:biais:cadrage", "f:biais:aversion-perte", "a:decision", "f:biais:couts-irrecuperables", "f:biais:statu-quo", "a:cecite", "f:biais:resultat", "q"] },
  { id: "debattre", titre: "Débattre sans tricher",
    promesse: "Reconnaître les sophismes des autres, et surtout les siens : repérer, réparer, reformuler.",
    conclusion: "Gagner un débat n'est pas avoir raison. Au prochain désaccord, essayez de reformuler l'argument de l'autre au mieux avant d'y répondre, et notez le sophisme que vous aurez repéré.",
    etapes: ["f:sophismes:homme-de-paille", "a:debat-truque", "f:sophismes:ad-hominem", "a:reparer", "f:sophismes:faux-dilemme", "a:reformuler", "f:sophismes:pente-glissante", "a:qui-prouve", "f:sophismes:popularite", "a:pyramide", "f:sophismes:sophisme-sophisme", "a:demonter", "q"] },
  { id: "info", titre: "Info ou intox",
    promesse: "Vérifier une source, une citation, une étude : les réflexes qui protègent de la désinformation.",
    conclusion: "Avant de partager, une minute suffit souvent : qui parle, d'où vient le chiffre, que disent les autres sources ? Notez la prochaine information douteuse que vous aurez démontée.",
    etapes: ["f:biais:verite-illusoire", "a:laterale", "f:biais:confirmation", "f:biais:raisonnement-motive", "a:citations", "f:biais:disponibilite", "a:monde", "f:biais:halo", "f:sophismes:hors-contexte", "f:sophismes:generalisation-hative", "a:etudes", "f:sophismes:autorite", "q"] },
  { id: "autres", titre: "Nous et les autres",
    promesse: "Le groupe, l'autorité et l'attribution : comment les autres pèsent sur notre jugement.",
    conclusion: "Penser par soi-même n'est pas penser seul : c'est savoir quand le groupe nous éclaire et quand il nous entraîne. Repérez la prochaine fois où vous vous êtes rangé à l'avis général sans l'examiner.",
    etapes: ["f:biais:conformisme", "a:plusieurs", "f:biais:pensee-groupe", "f:biais:attribution", "a:debat-a-deux", "f:biais:endogroupe", "f:biais:faux-consensus", "f:biais:autorite", "q"] },
  { id: "en-ligne", titre: "Ne pas se faire avoir en ligne",
    promesse: "Les leviers des arnaques, les signes qui trahissent un message, et des mots de passe qui résistent.",
    conclusion: "Une arnaque presse, menace ou promet, et demande ce qu'on ne demande jamais par message. Le bon réflexe passe toujours par un autre chemin : le numéro que vous connaissez, l'adresse que vous tapez vous-même. Notez le prochain message douteux que vous aurez démonté.",
    etapes: ["f:biais:autorite", "a:hameconnage", "f:biais:aversion-perte", "f:sophismes:ad-baculum", "a:laterale", "f:biais:conformisme", "f:sophismes:emotion", "a:mots-de-passe", "q"] }
];

// Une étape est-elle faite ? (d : lectures, résultats, mémoire, quiz ciblés réussis)
function etapeFaite(etape, parcours, d) {
  const [genre, ...reste] = etape.split(":");
  if (genre === "f") return (d.fichesLues || []).includes(reste.join(":"));
  if (genre === "a") return !!(d.resultatsAteliers || {})[reste[0]];
  if (genre === "s") return Object.keys(d.memoire || {}).length >= 10;
  if (genre === "q") return !!((d.parcours || {}).quiz || {})[parcours.id];
  return false;
}
const donneesParcours = () => ({ fichesLues: lire("fichesLues", []), resultatsAteliers: lire("resultatsAteliers", {}), memoire: lire("memoire", {}), parcours: lire("parcours", {}) });
const avancementParcours = (p, d) => p.etapes.filter(e => etapeFaite(e, p, d)).length;

// Libellé et adresse d'une étape
function descriptionEtape(etape, p) {
  const [genre, ...reste] = etape.split(":");
  if (genre === "f") {
    const r = INDEX.get(reste.join(":"));
    return { texte: T("Lire la fiche « {0} »", r.fiche.nom), adresse: "#" + r.type + "/" + r.fiche.id };
  }
  if (genre === "a") {
    const a = tousLesAteliers().find(x => x.atelier.id === reste[0]);
    return { texte: T("Atelier : {0}", a.atelier.titre), adresse: a.adresse };
  }
  if (genre === "s") return { texte: T("Une première série de quiz"), adresse: "#quiz/tout" };
  return { texte: T("Quiz ciblé : cinq situations sur les notions du parcours, 4 sur 5 pour valider"), adresse: "#parcours/" + p.id + "/quiz" };
}

// Points des étapes faites (une fois par étape) et du parcours terminé (une fois)
function crediterParcours(p, d) {
  p.etapes.forEach((e, k) => { if (etapeFaite(e, p, d)) gagner("etape-parcours", 0, p.id + ":" + k); });
  if (avancementParcours(p, d) === p.etapes.length) gagner("parcours-termine", 0, p.id);
}

// Prochaine étape du parcours actif (ou de « Premiers pas » pour un nouveau visiteur) : l'action principale de l'accueil
function prochaineEtape() {
  const d = donneesParcours();
  const p = PARCOURS.find(x => x.id === d.parcours.actif && avancementParcours(x, d) < x.etapes.length);
  if (!p) return null;
  const e = p.etapes.find(x => !etapeFaite(x, p, d));
  return { parcours: p, ...descriptionEtape(e, p) };
}

// ===================== Pages =====================
function afficherParcours(id, sous) {
  const zone = $("vue-parcours");
  zone.replaceChildren();
  const d = donneesParcours();
  const p = PARCOURS.find(x => x.id === id);
  if (!p) {
    zone.append(el("h1", "page-titre", "Parcours"), el("p", "page-intro", "Des chemins à travers les fiches et les ateliers, avec un début, un ordre et une fin. Rien n'est verrouillé : un parcours propose un ordre, il n'interdit rien."));
    const grille = el("div", "cartes-grille");
    PARCOURS.forEach(x => {
      const n = avancementParcours(x, d), fini = n === x.etapes.length;
      const carte = lienVers("#parcours/" + x.id, undefined, "carte entree carte-parcours");
      carte.append(el("p", "surtitre", fini ? T("Terminé") : n ? T("{0} étapes sur {1}", n, x.etapes.length) : T("{0} étapes", x.etapes.length)), el("h2", null, x.titre), el("p", null, x.promesse));
      const barre = el("div", "barre-maitrise");
      const rempli = el("div");
      rempli.style.setProperty("--part", n / x.etapes.length);
      barre.appendChild(rempli);
      carte.appendChild(barre);
      grille.appendChild(carte);
    });
    zone.appendChild(grille);
    return;
  }
  if (sous === "quiz") { quizCible(zone, p); return; }
  crediterParcours(p, d);
  const n = avancementParcours(p, d), fini = n === p.etapes.length;
  zone.append(lienVers("#parcours", "← Tous les parcours", "lien retour"), el("h1", "page-titre", p.titre), el("p", "page-intro", p.promesse));
  if (d.parcours.actif !== p.id && !fini) {
    const suivre = el("button", "bouton", "Suivre ce parcours");
    suivre.type = "button";
    suivre.addEventListener("click", () => { ecrire("parcours", { ...lire("parcours", {}), actif: p.id }); afficherParcours(p.id); annoncer(T("Parcours suivi : {0}. Sa prochaine étape est sur l'accueil.", p.titre)); });
    zone.appendChild(suivre);
  }
  zone.appendChild(el("p", "source", T("{0} étapes faites sur {1}.", n, p.etapes.length)));
  const chemin = el("ol", "chemin-parcours");
  let suivanteMise = false;
  p.etapes.forEach(e => {
    const fait = etapeFaite(e, p, d), { texte, adresse } = descriptionEtape(e, p);
    const li = el("li", "etape" + (fait ? " faite" : ""));
    const suivante = !fait && !suivanteMise;
    if (suivante) { li.classList.add("suivante"); suivanteMise = true; }
    li.append(el("span", "etape-etat", fait ? T("Fait") : suivante ? T("Prochaine étape") : T("À faire")), lienVers(adresse, texte, suivante ? "bouton" : "lien-texte"));
    chemin.appendChild(li);
  });
  zone.appendChild(chemin);
  if (fini) {
    const fin = el("article", "carte conclusion-parcours");
    fin.append(sceau(p, 56), el("h2", null, T("Parcours terminé : {0}", p.titre)), el("p", null, p.conclusion), lienVers("#parcours", "Choisir un autre parcours", "bouton secondaire"));
    zone.appendChild(fin);
  }
}

// Le sceau d'un parcours terminé : l'emblème dans un cercle, à la couleur de la première fiche du parcours
function sceau(p, taille) {
  const premiere = p.etapes.find(e => e.startsWith("f:"));
  const s = svg("svg", { viewBox: "0 0 40 40", class: "sceau", width: taille, height: taille, role: "img", "aria-label": T("Sceau du parcours « {0} »", p.titre) });
  s.style.setProperty("--c", premiere ? COULEURS[INDEX.get(premiere.slice(2)).fiche.categorie] : "var(--accent)");
  return dessinerSvg(s, '<circle cx="20" cy="20" r="17" class="sceau-cercle"/><circle cx="20" cy="20" r="13.5" class="sceau-cercle fin"/><path d="M13 15h14M13 25h14" class="sceau-trait"/><path d="M13 15l-3-3M13 15l-3 3M27 15l3-3M27 15l3 3M13 25l3-3M13 25l3 3M27 25l-3-3M27 25l-3 3" class="sceau-trait"/>');
}

// Quiz ciblé : cinq situations tirées des fiches du parcours, réussi à 4 sur 5
function quizCible(zone, p) {
  zone.append(lienVers("#parcours/" + p.id, T("← {0}", p.titre), "lien retour"), el("h1", "page-titre", "Quiz ciblé"),
    el("p", "page-intro", T("Cinq situations sur les notions du parcours « {0} ». Quatre bonnes réponses sur cinq valident l'étape.", p.titre)));
  const cles = p.etapes.filter(e => e.startsWith("f:")).map(e => e.slice(2));
  const tirees = melanger(cles.length >= 5 ? cles : [...cles, ...cles, ...cles]).slice(0, 5);
  const questions = tirees.map(cle => {
    const { type, fiche } = INDEX.get(cle);
    const q = creerQuestion(type, fiche);
    return { texte: q.cas, options: q.options.map(o => o.nom), juste: q.options.indexOf(q.fiche), explication: fiche.nom + " : " + fiche.definition };
  });
  const carte = el("article", "carte");
  const jeu = el("div");
  carte.appendChild(jeu);
  zone.appendChild(carte);
  derouler(jeu, questions, questionDeDefi, resultats => {
    const score = resultats.filter(Boolean).length;
    carte.replaceChildren();
    carte.append(el("p", "grand-score", score + " / 5"));
    if (score >= 4) {
      const e = lire("parcours", {});
      ecrire("parcours", { ...e, quiz: { ...(e.quiz || {}), [p.id]: true } });
      carte.appendChild(el("p", "verdict juste", "Étape validée."));
    } else carte.appendChild(el("p", null, "Il en faut quatre sur cinq : relisez les fiches du parcours, puis réessayez."));
    const actions = el("div", "actions");
    actions.appendChild(lienVers("#parcours/" + p.id, T("Revenir au parcours"), "bouton"));
    const encore = el("button", "bouton secondaire", "Réessayer");
    encore.type = "button";
    encore.addEventListener("click", () => afficherParcours(p.id, "quiz"));
    actions.appendChild(encore);
    carte.appendChild(actions);
  });
}

// Profil, onglet « Parcours » : avancementParcours et sceaux
function ongletParcours(panneau) {
  const d = donneesParcours();
  const grille = el("div", "distinctions");
  PARCOURS.forEach(p => {
    const n = avancementParcours(p, d), fini = n === p.etapes.length;
    const carte = el("div", "distinction-carte" + (fini ? " obtenue" : ""));
    if (fini) carte.appendChild(sceau(p, 40));
    carte.append(el("p", "distinction-nom", p.titre), el("p", "source", fini ? T("Terminé") : T("{0} étapes sur {1}", n, p.etapes.length)), lienVers("#parcours/" + p.id, fini ? T("Revoir") : T("Y aller"), "lien-discret"));
    grille.appendChild(carte);
  });
  panneau.appendChild(grille);
}
