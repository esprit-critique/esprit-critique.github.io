// raisonner.js : Logique contre croyance, Le moniteur de vol, Deux études même méthode,
// Résoudre à plusieurs, et Mon carnet de prévisions.
// Syllogismes, élèves pilotes, études et sujets sont fictifs ; les études de référence citées dans
// les bilans sont réelles.

// ===================== Logique contre croyance =====================
// 16 syllogismes : 4 dans chaque case (valide ou non, conclusion crédible ou non).
// « justifications » : pour quatre d'entre eux, trois explications, dont une seule correcte.

const SYLLOGISMES = [
  { id: "chiens", p: ["Tous les chiens sont des mammifères.", "Tous les mammifères respirent de l'air."], c: "Tous les chiens respirent de l'air.", valide: true, credible: true },
  { id: "pigeons-dents", p: ["Aucun oiseau n'a de dents.", "Tous les pigeons sont des oiseaux."], c: "Aucun pigeon n'a de dents.", valide: true, credible: true },
  { id: "cuivre", p: ["Tous les métaux conduisent l'électricité.", "Le cuivre est un métal."], c: "Le cuivre conduit l'électricité.", valide: true, credible: true },
  { id: "triangles", p: ["Tous les triangles ont trois côtés.", "Certaines figures de ce cahier sont des triangles."], c: "Certaines figures de ce cahier ont trois côtés.", valide: true, credible: true },
  { id: "fourmis", p: ["Tous les insectes ont huit pattes.", "Les fourmis sont des insectes."], c: "Les fourmis ont huit pattes.", valide: true, credible: false,
    justifications: [
      ["Valide : si les deux prémisses étaient vraies, la conclusion le serait forcément, même si la première est fausse.", true],
      ["Non valide : les fourmis ont six pattes, donc la conclusion est fausse.", false],
      ["Non valide : la première prémisse est fausse, donc le raisonnement ne tient pas.", false]
    ] },
  { id: "epinards", p: ["Aucun légume n'est vert.", "Les épinards sont des légumes."], c: "Les épinards ne sont pas verts.", valide: true, credible: false },
  { id: "ancres", p: ["Tout ce qui est en métal est léger.", "Les ancres de navire sont en métal."], c: "Les ancres de navire sont légères.", valide: true, credible: false },
  { id: "dauphins", p: ["Tous les animaux qui vivent dans l'eau sont des poissons.", "Les dauphins vivent dans l'eau."], c: "Les dauphins sont des poissons.", valide: true, credible: false },
  { id: "chats", p: ["Tous les chats sont des animaux.", "Certains animaux sont domestiques."], c: "Certains chats sont domestiques.", valide: false, credible: true,
    justifications: [
      ["Valide : tout le monde sait que des chats sont domestiques.", false],
      ["Valide : les chats sont des animaux, et certains animaux sont domestiques.", false],
      ["Non valide : les animaux domestiques dont parle la seconde prémisse ne sont peut-être pas des chats.", true]
    ] },
  { id: "roses", p: ["Toutes les roses sont des fleurs.", "Certaines fleurs fanent vite."], c: "Certaines roses fanent vite.", valide: false, credible: true,
    justifications: [
      ["Valide : les roses sont des fleurs, et certaines fleurs fanent vite, donc certaines roses aussi.", false],
      ["Non valide : les fleurs qui fanent vite ne sont peut-être pas des roses ; la conclusion est peut-être vraie, mais elle ne découle pas des prémisses.", true],
      ["Valide : on voit bien des roses faner en quelques jours.", false]
    ] },
  { id: "truites", p: ["Tous les poissons vivent dans l'eau.", "Les truites vivent dans l'eau."], c: "Les truites sont des poissons.", valide: false, credible: true },
  { id: "serpents", p: ["Aucun reptile n'a de fourrure.", "Aucun serpent n'a de fourrure."], c: "Tous les serpents sont des reptiles.", valide: false, credible: true },
  { id: "canards", p: ["Tous les poissons nagent.", "Les canards nagent."], c: "Les canards sont des poissons.", valide: false, credible: false },
  { id: "chevaux", p: ["Tous les chiens ont quatre pattes.", "Certains animaux à quatre pattes sont des chevaux."], c: "Certains chiens sont des chevaux.", valide: false, credible: false },
  { id: "pigeons-vol", p: ["Aucun poisson ne vole.", "Aucun pigeon n'est un poisson."], c: "Aucun pigeon ne vole.", valide: false, credible: false,
    justifications: [
      ["Non valide : de ce que les pigeons ne sont pas des poissons, on ne peut rien conclure sur leur vol.", true],
      ["Valide : les pigeons ne sont pas des poissons, et les poissons ne volent pas, donc les pigeons non plus.", false],
      ["Non valide : les pigeons volent, donc la conclusion est fausse.", false]
    ] },
  { id: "tortues", p: ["Si un animal est un oiseau, il pond des œufs.", "Les tortues pondent des œufs."], c: "Les tortues sont des oiseaux.", valide: false, credible: false }
];

// Énoncé d'un syllogisme
function blocSyllogisme(s) {
  const bloc = el("div", "syllogisme");
  s.p.forEach(p => bloc.appendChild(el("p", null, p)));
  bloc.appendChild(el("p", "conclusion-syllogisme", "Donc " + s.c.charAt(0).toLowerCase() + s.c.slice(1)));
  return bloc;
}

// ===================== Le moniteur de vol =====================
const ELEVES_PILOTES = ["Camille", "Yanis", "Louise", "Malo", "Inès", "Théo", "Sacha", "Nour"];

// Atterrissages extrêmes (≥ 82 ou ≤ 58), reliés à l'atterrissage suivant du même élève
function grapheMoniteur(extremes) {
  const bloc = el("div", "figure-moniteur");
  const s = svg("svg", { viewBox: "0 0 320 230", class: "graphe", role: "img", "aria-label": "Note d'un atterrissage extrême, puis note de l'atterrissage suivant du même élève" });
  const y = v => 200 - 180 * (v - 30) / 70, x0 = 90, x1 = 230;
  s.appendChild(svg("rect", { x: 46, y: 20, width: 250, height: 180, class: "graphe-fond" }));
  [30, 50, 70, 90, 100].forEach(v => {
    s.appendChild(svg("line", { x1: 46, y1: y(v), x2: 296, y2: y(v), class: "graphe-grille" }));
    s.appendChild(texteSvg(40, y(v) + 3, String(v), { class: "graphe-texte", "text-anchor": "end" }));
  });
  s.appendChild(svg("line", { x1: 46, y1: y(70), x2: 296, y2: y(70), class: "graphe-diagonale" }));
  s.appendChild(texteSvg(x0, 216, "atterrissage", { class: "graphe-texte", "text-anchor": "middle" }));
  s.appendChild(texteSvg(x1, 216, "suivant", { class: "graphe-texte", "text-anchor": "middle" }));
  const borne = v => Math.max(30, Math.min(100, v));
  extremes.forEach(e => {
    const classe = e.action === "feliciter" ? "trait-felicite" : e.action === "reprimander" ? "trait-reprimande" : "trait-neutre";
    s.appendChild(svg("line", { x1: x0, y1: y(borne(e.note)), x2: x1, y2: y(borne(e.suivante)), class: classe }));
    s.appendChild(svg("circle", { cx: x0, cy: y(borne(e.note)), r: 3, class: classe + "-point" }));
    s.appendChild(svg("circle", { cx: x1, cy: y(borne(e.suivante)), r: 3, class: classe + "-point" }));
  });
  bloc.appendChild(s);
  bloc.appendChild(legende([["var(--vert)", "après une félicitation"], ["var(--rouge)", "après une réprimande"], ["var(--discret)", "sans commentaire"]]));
  bloc.appendChild(paragraphe("Pointillé : la moyenne des talents (70). Les notes extrêmes reviennent vers elle, quel que soit le retour donné.", "source"));
  return bloc;
}

// ===================== Deux études, même méthode =====================
// Trois sujets fictifs peu clivants. Les deux études de chaque sujet ont la même méthode et la même
// taille ; seules leurs conclusions s'opposent. « pour » : l'étude qui va dans le sens de l'affirmation.
const SUJETS_ETUDES = [
  { id: "musique", affirmation: "Travailler en musique aide à se concentrer.",
    methode: "Une équipe a réparti au hasard 120 étudiants en deux groupes pendant un semestre : l'un révisait en musique, l'autre en silence. Les deux groupes ont passé le même examen final.",
    pour: "Le groupe qui révisait en musique a obtenu des notes nettement meilleures.",
    contre: "Le groupe qui révisait en silence a obtenu des notes nettement meilleures." },
  { id: "matin", affirmation: "On apprend mieux le matin que le soir.",
    methode: "Des chercheurs ont tiré au sort 140 lycéens pour apprendre la même liste de mots, soit à 8 heures, soit à 20 heures, puis les ont interrogés une semaine plus tard.",
    pour: "Les lycéens du matin se souvenaient de nettement plus de mots.",
    contre: "Les lycéens du soir se souvenaient de nettement plus de mots." },
  { id: "pauses", affirmation: "Des pauses courtes et fréquentes valent mieux qu'une longue pause.",
    methode: "Dans une entreprise, 100 employés volontaires ont été répartis au hasard : les uns prenaient cinq minutes de pause chaque heure, les autres une demi-heure en milieu de journée. On a mesuré le nombre d'erreurs dans leurs dossiers pendant un mois.",
    pour: "Le groupe des pauses courtes a commis nettement moins d'erreurs.",
    contre: "Le groupe de la longue pause a commis nettement moins d'erreurs." }
];

// Échelle de 1 à 7 : boutons sur une ligne
function echelleSept(gauche, droite, surChoix) {
  const bloc = el("div", "echelle-sept");
  const rangee = el("div", "echelle-sept-boutons");
  const boutons = [1, 2, 3, 4, 5, 6, 7].map(n => {
    const b = el("button", "choix", String(n));
    b.setAttribute("aria-label", n + " sur 7");
    b.addEventListener("click", () => {
      boutons.forEach(x => { x.disabled = true; });
      b.classList.add("choisi");
      surChoix(n);
    });
    rangee.appendChild(b);
    return b;
  });
  const bornes = el("div", "echelle-sept-bornes");
  bornes.append(el("span", null, gauche), el("span", null, droite));
  bloc.append(rangee, bornes);
  return bloc;
}

// ===================== Résoudre à plusieurs =====================
// Problèmes à choix : versions de la tâche de Wason et questions du test de réflexion cognitive
const PROBLEMES_GROUPE = [
  { id: "wason", enonce: "Quatre cartes ont une lettre d'un côté et un chiffre de l'autre. On voit : E, K, 4 et 7. Règle : « si une carte porte une voyelle, alors elle porte un chiffre pair de l'autre côté ». Quelles cartes faut-il retourner, au minimum, pour vérifier la règle ?",
    options: ["E seulement", "E et 4", "E et 7", "E, 4 et 7"], juste: 2,
    explication: "Seules E (une voyelle doit cacher un chiffre pair) et 7 (un chiffre impair ne doit pas cacher de voyelle) peuvent contredire la règle. Retourner le 4 ne prouve rien : la règle ne dit rien des consonnes." },
  { id: "bar", enonce: "Vous contrôlez un bar. Chaque carte représente un client : sa boisson d'un côté, son âge de l'autre. On voit : « bière », « eau », « 25 ans », « 16 ans ». Règle : « si une personne boit de l'alcool, elle a au moins 18 ans ». Quelles cartes retourner ?",
    options: ["Bière seulement", "Bière et 25 ans", "Bière et 16 ans", "Bière, 25 ans et 16 ans"], juste: 2,
    explication: "Il faut vérifier l'âge du buveur de bière et la boisson du client de 16 ans. C'est la même structure logique que la tâche abstraite, mais on la réussit beaucoup plus souvent." },
  { id: "batte", enonce: "Une batte et une balle coûtent 1,10 € au total. La batte coûte 1 € de plus que la balle. Combien coûte la balle ?",
    options: ["10 centimes", "5 centimes", "1 centime", "15 centimes"], juste: 1,
    explication: "Si la balle coûtait 10 centimes, la batte coûterait 1,10 € et le total 1,20 €. Avec x le prix de la balle : x + (x + 1) = 1,10, donc x = 0,05 €." },
  { id: "machines", enonce: "Si 5 machines fabriquent 5 objets en 5 minutes, combien de temps faut-il à 100 machines pour fabriquer 100 objets ?",
    options: ["100 minutes", "5 minutes", "20 minutes", "1 minute"], juste: 1,
    explication: "Chaque machine fabrique un objet en 5 minutes : 100 machines fabriquent 100 objets en 5 minutes." },
  { id: "nenuphars", enonce: "Dans un lac, une étendue de nénuphars double de surface chaque jour. Il lui faut 48 jours pour couvrir tout le lac. Combien de jours lui faut-il pour en couvrir la moitié ?",
    options: ["24 jours", "47 jours", "36 jours", "12 jours"], juste: 1,
    explication: "La surface double chaque jour : la veille du jour où le lac est couvert, la moitié l'était." },
  { id: "course", enonce: "Pendant une course, vous dépassez la personne qui est en deuxième position. À quelle place êtes-vous ?",
    options: ["Premier", "Deuxième", "Troisième", "On ne peut pas savoir"], juste: 1,
    explication: "Vous prenez sa place : vous êtes deuxième, la première personne est toujours devant." }
];
// Estimations : quantités sourcées de « Êtes-vous sûr à 90 % ? »
const ESTIMATIONS_GROUPE = ["seine", "baikal", "burj", "os", "piano", "elephant"];

// ===================== Mon carnet de prévisions =====================
const MODELES_PREVISION = [
  "Je finirai … avant le …",
  "J'aurai lu … d'ici le …",
  "Il pleuvra à … le …",
  "Mon équipe gagnera son prochain match contre …",
  "Le colis commandé le … arrivera avant le …"
];

// Calibration d'un carnet : les prévisions à moins de 50 % sont ramenées à leur complément
// (« 30 % que oui » = « 70 % que non »), puis groupées par tranches de 10 points (50-59, 60-69…)
function courbeCarnet(resolues) {
  const s = svg("svg", { viewBox: "0 0 320 236", class: "graphe", role: "img", "aria-label": "Courbe d'étalonnage de vos prévisions" });
  const x = c => 46 + 250 * (c - 50) / 50, y = r => 200 - 180 * r / 100;
  s.appendChild(svg("rect", { x: 46, y: 20, width: 250, height: 180, class: "graphe-fond" }));
  [0, 25, 50, 75, 100].forEach(r => {
    s.appendChild(svg("line", { x1: 46, y1: y(r), x2: 296, y2: y(r), class: "graphe-grille" }));
    s.appendChild(texteSvg(40, y(r) + 3, r + " %", { class: "graphe-texte", "text-anchor": "end" }));
  });
  [50, 60, 70, 80, 90, 100].forEach(c => s.appendChild(texteSvg(x(c), 214, c + " %", { class: "graphe-texte", "text-anchor": "middle" })));
  s.appendChild(svg("line", { x1: x(50), y1: y(50), x2: x(100), y2: y(100), class: "graphe-diagonale" }));
  s.appendChild(texteSvg(171, 230, "Probabilité annoncée", { class: "graphe-texte", "text-anchor": "middle" }));
  const tranches = {};
  resolues.forEach(r => {
    const p = r.p >= 50 ? r.p : 100 - r.p, oui = r.p >= 50 ? r.issue === "oui" : r.issue === "non";
    const t = Math.min(90, 10 * Math.floor(p / 10));
    tranches[t] = tranches[t] || [0, 0];
    tranches[t][0]++;
    if (oui) tranches[t][1]++;
  });
  const pts = Object.keys(tranches).map(Number).sort((a, b) => a - b).map(t => [t + 5, 100 * tranches[t][1] / tranches[t][0], tranches[t][0]]);
  if (pts.length > 1) s.appendChild(svg("polyline", { points: pts.map(([c, r]) => x(c) + "," + y(r)).join(" "), class: "graphe-point-ligne" }));
  pts.forEach(([c, r, n]) => s.appendChild(svg("circle", { cx: x(c), cy: y(r), r: Math.min(9, 3 + Math.sqrt(n)), class: "graphe-point" })));
  return s;
}

// ===================== Ateliers =====================

EXPERIENCES.push(
  // ---------------------------------------------------------------
  {
    id: "logique",
    section: "raisonner",
    picto: "arbre",
    couleur: "#5b5bb5",
    duree: "7 min",
    titre: "Logique contre croyance",
    resume: "Seize syllogismes : la conclusion découle-t-elle des prémisses, qu'elle soit vraie ou non ? Puis vous jugez les raisonnements d'autres joueurs.",
    lancer(zone) {
      const items = melanger(SYLLOGISMES);
      const reponses = {};       // id → true si l'utilisateur dit « valide »
      const choisies = [];       // justifications choisies par l'utilisateur : { s, texte, correcte }
      derouler(zone, items, (s, zone, fini) => {
        zone.appendChild(el("p", "consigne", "La conclusion découle-t-elle nécessairement des prémisses ?"));
        zone.appendChild(blocSyllogisme(s));
        zone.appendChild(paragraphe("Supposez les prémisses vraies, même si elles ne le sont pas.", "source"));
        const choix = [boutonChoix("Oui, c'est valide", 0), boutonChoix("Non, ce n'est pas valide", 1)];
        choix.forEach((b, k) => {
          b.addEventListener("click", () => {
            choix.forEach(x => { x.disabled = true; });
            b.classList.add("choisi");
            reponses[s.id] = k === 0;
            // Pas de correction à ce stade : elle viendrait influencer les réponses suivantes
            if (s.justifications) {
              zone.appendChild(el("p", "consigne", "Laquelle de ces explications est la vôtre ?"));
              const options = melanger(s.justifications);
              const boutons = options.map(([texte, correcte], i) => {
                const j = boutonChoix(texte, i);
                j.addEventListener("click", () => {
                  boutons.forEach(x => { x.disabled = true; });
                  j.classList.add("choisi");
                  choisies.push({ s, texte, correcte });
                  const retour = el("div", "retour-quiz");
                  retour.appendChild(paragraphe("Réponse enregistrée. La correction viendra à la fin.", "source"));
                  zone.appendChild(retour);
                  fini(null, retour);
                });
                zone.appendChild(j);
                return j;
              });
            } else {
              const retour = el("div", "retour-quiz");
              retour.appendChild(paragraphe("Réponse enregistrée. La correction viendra à la fin.", "source"));
              zone.appendChild(retour);
              fini(null, retour);
            }
          });
          zone.appendChild(b);
        });
      }, () => phaseDeux(), "Syllogisme");

      // Phase 2 : cinq raisonnements « d'autres joueurs », dont l'un est mot pour mot le vôtre
      function phaseDeux() {
        const propre = choisies.find(c => !c.correcte) || choisies[0];
        const autres = melanger(SYLLOGISMES.filter(s => s.justifications).flatMap(s => s.justifications.map(([texte, correcte]) => ({ s, texte, correcte })))
          .filter(x => !(x.s === propre.s && x.texte === propre.texte)));
        // Deux corrects et deux fautifs parmi les autres, pour que la proportion ne trahisse rien
        const quatre = [...autres.filter(x => x.correcte).slice(0, 2), ...autres.filter(x => !x.correcte).slice(0, 2)];
        const cinq = melanger([...quatre, { ...propre, propre: true }]);
        const prenoms = melanger(["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4", "Joueur 5"]);
        const jugements = [];
        zone.innerHTML = "";
        derouler(zone, cinq, (x, zone, fini) => {
          zone.appendChild(el("p", "consigne", "Le raisonnement d'un autre joueur"));
          zone.appendChild(blocSyllogisme(x.s));
          zone.appendChild(el("p", "replique-qui", prenoms[cinq.indexOf(x)] + " explique :"));
          zone.appendChild(el("p", "cas", "« " + x.texte + " »"));
          zone.appendChild(el("p", "consigne", "Ce raisonnement est-il correct ?"));
          const choix = [boutonChoix("Correct", 0), boutonChoix("Incorrect", 1)];
          choix.forEach((b, k) => {
            b.addEventListener("click", () => {
              choix.forEach(y => { y.disabled = true; });
              b.classList.add("choisi");
              jugements.push({ x, accepte: k === 0 });
              const retour = el("div", "retour-quiz");
              retour.appendChild(paragraphe("Réponse enregistrée.", "source"));
              zone.appendChild(retour);
              fini(null, retour);
            });
            zone.appendChild(b);
          });
        }, () => bilan(jugements), "Raisonnement");
      }

      function bilan(jugements) {
        const accepte = f => SYLLOGISMES.filter(f).filter(s => reponses[s.id]).length;
        const logique = (accepte(s => s.valide) - accepte(s => !s.valide)) / 2;
        const croyance = (accepte(s => s.credible) - accepte(s => !s.credible)) / 2;
        const justes = SYLLOGISMES.filter(s => reponses[s.id] === s.valide).length;
        const propre = jugements.find(j => j.x.propre);
        const rang = jugements.indexOf(propre) + 1;
        const historique = lire("logique", []);
        historique.push({ j: aujourdHui(), l: logique, c: croyance, rejet: !propre.accepte, fautif: !propre.x.correcte });
        ecrire("logique", historique.slice(-30));
        afficherScore(zone, "logique", justes, SYLLOGISMES.length);

        zone.appendChild(el("p", "consigne", "Le raisonnement n° " + rang + " était le vôtre"));
        zone.appendChild(paragraphe("Vous l'aviez choisi mot pour mot pour le syllogisme « " + propre.x.s.c.charAt(0).toLowerCase() + propre.x.s.c.slice(1, -1) + " ». Présenté comme celui d'un autre, vous l'avez jugé " + (propre.accepte ? "correct" : "incorrect") + ". Il était en fait " + (propre.x.correcte ? "correct." : "incorrect.") +
          (propre.accepte === propre.x.correcte ? "" : propre.x.correcte ? " Vous avez rejeté un raisonnement juste : le vôtre." : " Vous avez su le rejeter chez un autre alors que vous l'aviez adopté vous-même.")));

        const liste = el("ul", "liste-simple");
        liste.append(
          el("li", null, "Indice de logique : " + signe(logique) + " (de −4 à +4). Il mesure l'effet de la validité sur vos réponses : (valides acceptés − non valides acceptés) / 2."),
          el("li", null, "Indice de croyance : " + signe(croyance) + " (de −4 à +4). Il mesure l'effet de la crédibilité de la conclusion : (crédibles acceptés − non crédibles acceptés) / 2.")
        );
        zone.appendChild(liste);

        // Correction des seize syllogismes, groupés par case
        const correction = el("div", "section");
        correction.appendChild(el("h3", null, "Correction"));
        [[true, true, "Valides, conclusion crédible"], [true, false, "Valides, conclusion non crédible"], [false, true, "Non valides, conclusion crédible"], [false, false, "Non valides, conclusion non crédible"]].forEach(([v, c, titre]) => {
          correction.appendChild(el("p", "consigne", titre));
          const ul = el("ul", "liste-simple");
          SYLLOGISMES.filter(s => s.valide === v && s.credible === c).forEach(s => {
            const ok = reponses[s.id] === s.valide;
            ul.appendChild(el("li", ok ? null : "erreur-liste", s.p.join(" ") + " Donc " + s.c.charAt(0).toLowerCase() + s.c.slice(1) + (ok ? "" : " (vous : " + (reponses[s.id] ? "valide" : "non valide") + ")")));
          });
          correction.appendChild(ul);
        });
        zone.appendChild(correction);

        ajouterExplication(zone, "Juger la forme, pas la conclusion", [
          "Un raisonnement est valide quand ses prémisses, si elles étaient vraies, garantiraient sa conclusion. La vérité de la conclusion n'y change rien. Pourtant, nous acceptons plus volontiers un raisonnement dont la conclusion nous paraît vraie : c'est le biais de croyance. Evans, Barston et Pollard (1983) l'ont trouvé surtout sur les syllogismes non valides.",
          "Son interprétation est discutée : analysé par courbes ROC, il apparaîtrait surtout comme un biais de réponse, une tendance à dire « valide » quand la conclusion est crédible, plutôt que comme une moins bonne capacité à juger la logique (Dube, Rotello et Heit, 2010).",
          "Nous sommes meilleurs pour critiquer les raisonnements des autres que les nôtres. Trouche et ses collègues (2016) ont présenté à des participants leur propre raisonnement comme celui d'un autre : parmi ceux qui ne l'ont pas reconnu, 56 à 58 % l'ont rejeté, et plus souvent quand il était non valide."
        ], [["#biais/croyance-logique", "Biais de croyance"], ["#sophismes/affirmation-consequent", "Affirmation du conséquent"], ["#sophismes/negation-antecedent", "Négation de l'antécédent"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "logique").lancer(zone));
      }
    }
  },
  // ---------------------------------------------------------------
  {
    id: "moniteur",
    section: "raisonner",
    picto: "jauge",
    couleur: "#2f6db5",
    duree: "4 min",
    titre: "Le moniteur de vol",
    resume: "Vous encadrez huit élèves pilotes. Après chaque atterrissage, félicitez, réprimandez ou ne dites rien. Vos retours font-ils progresser vos élèves ?",
    lancer(zone) {
      // Talent fixe (moyenne 70, écart-type 5) ; chaque note = talent + bruit (écart-type 12), bornée de 0 à 100
      const eleves = ELEVES_PILOTES.map(nom => ({ nom, talent: 70 + 5 * gauss() }));
      const ordre = melanger(eleves.flatMap(e => [e, e, e]));
      const vols = [];
      derouler(zone, ordre, (eleve, zone, fini) => {
        const note = Math.round(Math.min(100, Math.max(0, eleve.talent + 12 * gauss())));
        zone.appendChild(el("p", "consigne", "Atterrissage de " + eleve.nom));
        const grand = el("p", "note-vol", note + " / 100");
        zone.appendChild(grand);
        const precedents = vols.filter(v => v.eleve === eleve).map(v => v.note);
        zone.appendChild(paragraphe(precedents.length ? "Ses atterrissages précédents : " + precedents.join(", ") + "." : "Premier atterrissage de " + eleve.nom + " aujourd'hui.", "source"));
        zone.appendChild(el("p", "cas", "Que dites-vous à " + eleve.nom + " ?"));
        const actions = [["feliciter", "Féliciter"], ["reprimander", "Réprimander"], ["rien", "Ne rien dire"]];
        const boutons = actions.map(([id, texte], k) => {
          const b = boutonChoix(texte, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            b.classList.add("choisi");
            vols.push({ eleve, note, action: id });
            const retour = el("div", "retour-quiz");
            retour.appendChild(paragraphe(eleve.nom + " repart pour un tour de piste.", "source"));
            zone.appendChild(retour);
            fini(id, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, () => {
        // Variation de la note suivante du même élève, selon le retour donné
        const suites = vols.map((v, i) => {
          const suivant = vols.slice(i + 1).find(w => w.eleve === v.eleve);
          return suivant ? { ...v, suivante: suivant.note } : null;
        }).filter(Boolean);
        const variation = action => {
          const l = suites.filter(s => s.action === action);
          return l.length ? { n: l.length, moy: l.reduce((t, s) => t + s.suivante - s.note, 0) / l.length } : null;
        };
        noterPartie("moniteur");
        zone.appendChild(el("p", "consigne", "Bilan"));
        const liste = el("ul", "liste-simple");
        [["feliciter", "Après une félicitation"], ["reprimander", "Après une réprimande"], ["rien", "Sans commentaire"]].forEach(([a, libelle]) => {
          const v = variation(a);
          if (v) liste.appendChild(el("li", null, libelle + ", la note suivante de l'élève a varié de " + signe(Math.round(v.moy)) + " points en moyenne (" + pluriel(v.n, "cas", "cas") + ")."));
        });
        zone.appendChild(liste);
        zone.appendChild(el("p", "verdict", "Révélation : vos retours n'avaient aucun effet."));
        zone.appendChild(paragraphe("Dans ce simulateur, chaque note est le talent de l'élève, fixe, plus une part de hasard. Ce que vous disiez ne changeait rien. Si la note suivait une félicitation en baissant et une réprimande en remontant, c'est la régression vers la moyenne : on félicite après un atterrissage exceptionnel, et le suivant est en général plus ordinaire ; on réprimande après un mauvais, et le suivant est en général meilleur."));
        // Graphique : atterrissages extrêmes, puis note suivante
        const extremes = suites.filter(s => s.note >= 82 || s.note <= 58);
        if (extremes.length) zone.appendChild(grapheMoniteur(extremes));
        ajouterExplication(zone, "La régression vers la moyenne", [
          "Quand un résultat dépend en partie du hasard, un résultat extrême est en général suivi d'un résultat plus proche de la moyenne, quoi qu'on fasse entre les deux. Attribuer ce retour à la moyenne à son propre retour, c'est conclure à une cause d'après une simple succession.",
          "C'est l'histoire des instructeurs de vol racontée par Daniel Kahneman, qu'on retrouve dans l'atelier « Problèmes classiques »."
        ], [["#biais/regression-moyenne", "Régression vers la moyenne"], ["#sophismes/post-hoc", "Post hoc ergo propter hoc"], ["#biais/illusion-controle", "Illusion de contrôle"], ["#tests/classiques", "Problèmes classiques"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "moniteur").lancer(zone), "Rejouer avec d'autres élèves");
      }, "Atterrissage");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "etudes",
    section: "raisonner",
    picto: "balance",
    couleur: "#c0601b",
    duree: "5 min",
    titre: "Deux études, même méthode",
    resume: "Donnez votre avis sur trois questions, puis jugez la qualité de six études fictives. Les deux études de chaque question ont exactement la même méthode.",
    lancer(zone) {
      const avis = {};
      const notes = { avant: {}, apres: {} };
      // 1. Avis ; 2. études (deux par sujet, jamais à la suite) ; 3. « envisagez l'inverse », puis nouvelles notes
      const etudes = () => {
        let ordre;
        do ordre = melanger(SUJETS_ETUDES.flatMap(s => [{ s, sens: "pour" }, { s, sens: "contre" }]));
        while (ordre.some((e, i) => i && ordre[i - 1].s === e.s));
        return ordre;
      };
      const etapes = [
        ...SUJETS_ETUDES.map(s => ({ type: "avis", s })),
        ...etudes().map(e => ({ type: "etude", ...e, tour: "avant" })),
        { type: "consigne" },
        ...etudes().map(e => ({ type: "etude", ...e, tour: "apres" }))
      ];
      derouler(zone, etapes, (e, zone, fini) => {
        const terminer = () => { const r = el("div", "retour-quiz"); zone.appendChild(r); fini(null, r); };
        if (e.type === "avis") {
          zone.appendChild(el("p", "consigne", "Votre avis"));
          zone.appendChild(el("p", "cas", "« " + e.s.affirmation + " »"));
          zone.appendChild(echelleSept("Pas du tout d'accord", "Tout à fait d'accord", n => { avis[e.s.id] = n; terminer(); }));
        } else if (e.type === "consigne") {
          zone.appendChild(el("p", "consigne", "Envisagez l'inverse"));
          zone.appendChild(el("p", "cas", "Vous allez revoir les six études. Pour chacune, demandez-vous : « aurais-je jugé sa méthode de la même façon si elle avait trouvé le résultat inverse ? »"));
          terminer();
        } else {
          zone.appendChild(el("p", "consigne", e.tour === "avant" ? "Une étude (fictive)" : "Une étude (fictive), à revoir"));
          zone.appendChild(el("p", "cas", e.s.methode + " " + e.s[e.sens]));
          zone.appendChild(el("p", "consigne", "Qualité de cette étude, de 1 à 7 ?"));
          zone.appendChild(echelleSept("Très faible", "Excellente", n => { notes[e.tour][e.s.id + ":" + e.sens] = n; terminer(); }));
        }
      }, () => {
        // Asymétrie : note moyenne des études favorables à son avis − note des défavorables
        const asymetrie = tour => {
          const ecarts = SUJETS_ETUDES.filter(s => avis[s.id] !== 4).map(s => {
            const favorable = avis[s.id] > 4 ? "pour" : "contre", defavorable = favorable === "pour" ? "contre" : "pour";
            return notes[tour][s.id + ":" + favorable] - notes[tour][s.id + ":" + defavorable];
          });
          return ecarts.length ? ecarts.reduce((a, b) => a + b, 0) / ecarts.length : null;
        };
        const avant = asymetrie("avant"), apres = asymetrie("apres");
        noterPartie("etudes");
        const historique = lire("etudes", []);
        if (avant !== null) { historique.push({ j: aujourdHui(), avant, apres }); ecrire("etudes", historique.slice(-30)); }
        zone.appendChild(el("p", "consigne", "Bilan"));
        if (avant === null) {
          zone.appendChild(paragraphe("Vous étiez neutre (4 sur 7) sur les trois questions : l'asymétrie ne peut pas se calculer. Rejouez en prenant position."));
        } else {
          zone.appendChild(el("p", "grand-score", signe(Number(avant.toFixed(1)))));
          zone.appendChild(paragraphe("Indice d'asymétrie : en moyenne, vous avez noté les études favorables à votre avis " + (avant > 0 ? fr(Number(avant.toFixed(1))) + " point" + (Math.abs(avant) >= 2 ? "s" : "") + " plus haut" : avant < 0 ? fr(Number((-avant).toFixed(1))) + " point" + (Math.abs(avant) >= 2 ? "s" : "") + " plus bas" : "exactement comme") + " que les défavorables, alors que leur méthode était identique. Après la consigne « envisagez l'inverse », l'écart est de " + signe(Number(apres.toFixed(1))) + "."));
          zone.appendChild(paragraphe("Attention : trois questions et six notes font une mesure très bruitée. Un écart d'un point peut venir du hasard ; seule une tendance sur plusieurs parties dit quelque chose.", "source"));
        }
        ajouterExplication(zone, "Juger la méthode, pas le résultat", [
          "Lord, Ross et Lepper (1979) ont montré à 48 étudiants, favorables ou opposés à la peine de mort, deux études de méthodes comparables aux conclusions opposées. Chacun a jugé plus convaincante celle qui allait dans son sens, et les deux camps sont repartis plus convaincus.",
          "Dans une suite de ces travaux, Lord, Lepper et Preston (1984) ont trouvé que la consigne « envisagez l'inverse » réduisait ce biais davantage que la consigne « soyez impartial ».",
          "Kahan et ses collègues (2017) ont montré que les mêmes données étaient interprétées différemment selon qu'elles portaient sur un sujet neutre ou politique. Une réplication en Europe de l'Ouest (746 participants, sur l'immigration) a reproduit l'effet, mais pas son augmentation avec le niveau en calcul.",
          "Lire des informations contraires à son avis ne provoque pas pour autant d'effet rebond : dans trois grandes expériences, Guess et Coppock (2018) n'en ont pas trouvé."
        ], [["#biais/raisonnement-motive", "Raisonnement motivé"], ["#biais/confirmation", "Biais de confirmation"], ["#biais/perseverance", "Persévérance des croyances"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "etudes").lancer(zone));
      }, "Étape");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "plusieurs",
    section: "raisonner",
    picto: "cartes",
    couleur: "#3d6b4f",
    duree: "20 min",
    titre: "Résoudre à plusieurs",
    resume: "De 2 à 6 joueurs autour d'un téléphone : chacun répond en secret, puis le groupe discute et répond ensemble. Le groupe fait-il mieux que ses membres ?",
    lancer(zone) {
      zone.innerHTML = "";
      zone.appendChild(paragraphe("Un seul téléphone, qu'on se passe. Chacun répond en secret ; le site montre ensuite la répartition des réponses, sans les noms, puis le groupe discute trois minutes et donne une réponse commune."));
      zone.appendChild(el("p", "consigne", "Prénoms des joueurs (2 à 6)"));
      const grille = el("div", "grille-joueurs");
      const champs = [0, 1, 2, 3, 4, 5].map(k => {
        const c = el("input", "champ");
        c.placeholder = "Joueur " + (k + 1);
        c.setAttribute("aria-label", "Prénom du joueur " + (k + 1) + (k < 2 ? "" : ", facultatif"));
        grille.appendChild(c);
        return c;
      });
      zone.append(grille, paragraphe("Les deux premiers suffisent ; laissez vides les autres cases.", "source"));
      zone.appendChild(el("p", "consigne", "Que jouer ?"));
      const modes = [boutonChoix("Six problèmes de logique", 0), boutonChoix("Six estimations", 1)];
      modes.forEach((b, k) => {
        b.addEventListener("click", () => {
          const joueurs = champs.map((c, i) => c.value.trim() || (i < 2 ? "Joueur " + (i + 1) : "")).filter(Boolean);
          if (k === 0) problemes(joueurs); else estimations(joueurs);
        });
        zone.appendChild(b);
      });

      // Passe le téléphone à chaque joueur, à tour de rôle, et recueille sa réponse en secret
      function tourDeTable(joueurs, poser, quandTousOntRepondu) {
        let k = 0;
        const suivant = () => {
          zone.innerHTML = "";
          if (k >= joueurs.length) return quandTousOntRepondu();
          const nom = joueurs[k];
          zone.appendChild(el("p", "consigne", "Passez le téléphone à " + nom));
          zone.appendChild(paragraphe("Les autres ne regardent pas l'écran.", "source"));
          const pret = el("button", "bouton large", "Je suis " + nom);
          pret.dataset.suivant = "1";
          pret.addEventListener("click", () => {
            zone.innerHTML = "";
            poser(k, nom, () => { k++; suivant(); remonter(); });
          });
          zone.appendChild(pret);
        };
        suivant();
      }

      // Minuteur de discussion, avec pause et passage
      function discussion(conteneur, secondes, ensuite) {
        let reste = secondes, minuteur = null;
        const affichage = el("p", "minuteur");
        const maj = () => { affichage.textContent = Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0"); affichage.classList.toggle("fini", reste === 0); };
        const arreter = () => { if (minuteur) clearInterval(minuteur); minuteur = null; };
        maj();
        const pause = el("button", "bouton secondaire", "Démarrer la discussion");
        pause.addEventListener("click", () => {
          if (minuteur) { arreter(); pause.textContent = "Reprendre"; return; }
          pause.textContent = "Pause";
          minuteur = setInterval(() => {
            if (!affichage.isConnected) return arreter();
            reste = Math.max(0, reste - 1);
            maj();
            if (reste === 0) { arreter(); pause.disabled = true; pause.textContent = "Temps écoulé"; }
          }, 1000);
        });
        const fin = el("button", "bouton", "Répondre ensemble");
        fin.dataset.suivant = "1";
        fin.addEventListener("click", () => { arreter(); ensuite(); });
        const actions = el("div", "actions");
        actions.append(pause, fin);
        conteneur.append(affichage, actions);
      }

      function problemes(joueurs) {
        const resultats = [];
        let i = 0;
        const probleme = () => {
          if (i >= PROBLEMES_GROUPE.length) return bilanProblemes();
          const p = PROBLEMES_GROUPE[i];
          const individuelles = [];
          tourDeTable(joueurs, (k, nom, ok) => {
            entete(zone, i + 1, PROBLEMES_GROUPE.length, "Problème");
            zone.appendChild(el("p", "consigne", nom + ", répondez seul"));
            zone.appendChild(el("p", "cas", p.enonce));
            p.options.forEach((o, j) => {
              const b = boutonChoix(o, j);
              b.addEventListener("click", () => { individuelles.push(j); ok(); });
              zone.appendChild(b);
            });
          }, () => {
            entete(zone, i + 1, PROBLEMES_GROUPE.length, "Problème");
            zone.appendChild(el("p", "cas", p.enonce));
            zone.appendChild(el("p", "consigne", "Vos réponses individuelles"));
            const liste = el("ul", "liste-simple");
            p.options.forEach((o, j) => liste.appendChild(el("li", null, o + " : " + pluriel(individuelles.filter(x => x === j).length, "joueur"))));
            zone.appendChild(liste);
            zone.appendChild(paragraphe("Discutez : chacun explique son raisonnement, puis mettez-vous d'accord sur une réponse commune.", "source"));
            discussion(zone, 180, () => {
              zone.innerHTML = "";
              entete(zone, i + 1, PROBLEMES_GROUPE.length, "Problème");
              zone.appendChild(el("p", "cas", p.enonce));
              zone.appendChild(el("p", "consigne", "La réponse du groupe"));
              const boutons = p.options.map((o, j) => {
                const b = boutonChoix(o, j);
                b.addEventListener("click", () => {
                  boutons.forEach(x => { x.disabled = true; });
                  boutons[p.juste].classList.add("juste");
                  if (j !== p.juste) b.classList.add("faux");
                  resultats.push({ individuels: individuelles.filter(x => x === p.juste).length / individuelles.length, groupe: j === p.juste });
                  const retour = el("div", "retour-quiz");
                  retour.appendChild(el("p", "verdict " + (j === p.juste ? "juste" : "faux"), (j === p.juste ? "Juste : " : "Réponse : ") + p.options[p.juste] + "."));
                  retour.appendChild(paragraphe(p.explication));
                  retour.appendChild(boutonSuivant(i === PROBLEMES_GROUPE.length - 1 ? "Voir le bilan" : "Problème suivant", () => { i++; probleme(); }));
                  zone.appendChild(retour);
                  montrer(retour);
                });
                zone.appendChild(b);
                return b;
              });
            });
          });
        };
        const bilanProblemes = () => {
          zone.innerHTML = "";
          const indiv = Math.round(100 * resultats.reduce((t, r) => t + r.individuels, 0) / resultats.length);
          const groupe = resultats.filter(r => r.groupe).length;
          afficherScore(zone, "plusieurs", groupe, resultats.length);
          zone.appendChild(paragraphe("Réponses individuelles justes : " + indiv + " % ; réponses du groupe justes : " + groupe + " sur " + resultats.length + "."));
          ajouterExplication(zone, "Raisonner ensemble", [
            "Sur la tâche de sélection de Wason, Moshman et Geil (1998) ont observé 9 % de réussite chez des étudiants seuls, et 75 % chez des groupes de cinq ou six qui en discutaient. Quand quelqu'un a trouvé, il peut le démontrer, et le groupe se range à son argument plutôt qu'à la majorité.",
            "Cet avantage suppose une vraie discussion des raisons. Un groupe qui suit l'avis le plus assuré ou le plus fréquent, sans l'examiner, perd cet avantage."
          ], [["#biais/pensee-groupe", "Pensée de groupe"], ["#biais/conformisme", "Conformisme"], ["#biais/autorite", "Soumission à l'autorité"]]);
          boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "plusieurs").lancer(zone));
        };
        probleme();
      }

      function estimations(joueurs) {
        const questions = ESTIMATIONS_GROUPE.map(id => ETALONNAGE.find(q => q.id === id));
        const manches = [questions.slice(0, 3), questions.slice(3)];
        const resultats = [];   // { manche, q, valeurs }
        let i = 0;
        const question = () => {
          if (i >= 6) return bilanEstimations();
          const manche = i < 3 ? 1 : 2, q = manches[manche - 1][i % 3];
          const valeurs = [];
          tourDeTable(joueurs, (k, nom, ok) => {
            entete(zone, i + 1, 6, "Estimation");
            zone.appendChild(el("p", "consigne", "Manche " + manche + (manche === 1 ? " : sans voir les autres" : " : en voyant les réponses précédentes")));
            zone.appendChild(el("p", "cas", q.q + (q.unite ? " (en " + q.unite + ")" : "") + " ?"));
            if (manche === 2 && valeurs.length) zone.appendChild(paragraphe("Réponses des joueurs précédents : " + valeurs.map(v => fr(v)).join(" ; ") + ".", "source"));
            const champ = el("input", "champ");
            champ.inputMode = "decimal";
            champ.setAttribute("aria-label", "Votre estimation");
            const valider = el("button", "bouton", "Valider");
            valider.dataset.valider = "1";
            valider.addEventListener("click", () => {
              const v = lireNombre(champ.value);
              if (isNaN(v) || v <= 0) return champ.focus();
              valeurs.push(v);
              ok();
            });
            const ligne = el("div", "ligne");
            ligne.append(champ, valider);
            zone.appendChild(ligne);
          }, () => {
            resultats.push({ manche, q, valeurs });
            entete(zone, i + 1, 6, "Estimation");
            zone.appendChild(el("p", "cas", q.q + " ?"));
            const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
            const ecart = v => Math.abs(v - q.v) / q.v;
            const mieux = valeurs.filter(v => ecart(v) < ecart(moyenne)).length;
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict", "Réponse : " + fr(q.v) + (q.unite ? " " + q.unite : "") + "."));
            retour.appendChild(paragraphe("Vos estimations : " + valeurs.map(v => fr(v)).join(" ; ") + ". Moyenne du groupe : " + fr(Number(moyenne.toPrecision(3))) + ", à " + Math.round(100 * ecart(moyenne)) + " % de la réponse. " + (mieux ? pluriel(mieux, "joueur a", "joueurs ont") + " fait mieux que la moyenne." : "Personne n'a fait mieux que la moyenne du groupe.")));
            retour.appendChild(boutonSuivant(i === 5 ? "Voir le bilan" : i === 2 ? "Manche 2" : "Estimation suivante", () => { i++; question(); }));
            zone.appendChild(retour);
          });
        };
        const bilanEstimations = () => {
          zone.innerHTML = "";
          noterPartie("plusieurs");
          // Diversité : écart-type des logarithmes des estimations, en moyenne sur les questions de la manche
          const diversite = m => {
            const l = resultats.filter(r => r.manche === m).map(r => {
              const logs = r.valeurs.map(v => Math.log10(v));
              const moy = logs.reduce((a, b) => a + b, 0) / logs.length;
              return Math.sqrt(logs.reduce((a, b) => a + (b - moy) ** 2, 0) / logs.length);
            });
            return l.reduce((a, b) => a + b, 0) / l.length;
          };
          const d1 = diversite(1), d2 = diversite(2);
          zone.appendChild(el("p", "consigne", "Bilan"));
          zone.appendChild(paragraphe("Dispersion de vos estimations (écart-type des logarithmes) : " + fr(Number(d1.toFixed(2))) + " dans la manche 1, " + fr(Number(d2.toFixed(2))) + " dans la manche 2. " +
            (d2 < d1 ? "Voir les réponses des autres a resserré vos estimations." : "Voir les réponses des autres n'a pas resserré vos estimations, cette fois.")));
          zone.appendChild(paragraphe("Les questions n'étant pas les mêmes d'une manche à l'autre, la comparaison reste indicative.", "source"));
          ajouterExplication(zone, "La sagesse des foules, et sa fragilité", [
            "La moyenne d'estimations indépendantes est souvent plus juste que la plupart des estimations individuelles : les erreurs dans un sens compensent les erreurs dans l'autre.",
            "Cette compensation suppose l'indépendance. Lorenz et ses collègues (2011, 144 étudiants) ont montré que voir les estimations des autres réduisait leur diversité sans rendre le groupe plus juste, tout en augmentant la confiance des participants."
          ], [["#biais/conformisme", "Conformisme"], ["#biais/ancrage", "Effet d'ancrage"], ["#biais/pensee-groupe", "Pensée de groupe"]]);
          boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "plusieurs").lancer(zone));
        };
        question();
      }
    }
  }
);

// Mon carnet de prévisions : une page de JEUX, dans la section « Mesurer sa confiance »
JEUX.push({
  id: "carnet",
  section: "confiance",
  picto: "calendrier",
  couleur: "#5b5bb5",
  duree: "2 min",
  titre: "Mon carnet de prévisions",
  resume: "Notez vos prévisions avec une probabilité et une échéance. À l'échéance, souvenez-vous de ce que vous aviez annoncé, puis comparez : score de Brier, étalonnage, mémoire.",
  lancer(zone) {
    const previsions = () => lire("previsions", []);
    const enregistrer = l => ecrire("previsions", l);
    const auj = aujourdHui();
    const dateDe = jour => new Date(jour * 86400000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    zone.innerHTML = "";

    // Formulaire
    const form = el("div", "carnet-formulaire");
    form.appendChild(el("p", "consigne", "Nouvelle prévision"));
    const texte = el("textarea", "champ champ-texte");
    texte.rows = 2;
    texte.maxLength = 300;   // le carnet est gardé dans le navigateur : textes courts
    texte.placeholder = "Ce qui arrivera, ou non";
    texte.setAttribute("aria-label", "Votre prévision");
    const modeles = el("div", "puces modeles");
    MODELES_PREVISION.forEach(m => {
      const p = el("button", "puce", m);
      p.addEventListener("click", () => { texte.value = m; texte.focus(); });
      modeles.appendChild(p);
    });
    const proba = el("input", "curseur");
    proba.type = "range"; proba.min = 5; proba.max = 95; proba.step = 5; proba.value = 70;
    proba.setAttribute("aria-label", "Probabilité");
    const affichage = el("p", "valeur-curseur");
    const maj = () => { affichage.textContent = typo("Probabilité : " + proba.value + " %"); };
    proba.addEventListener("input", maj);
    maj();
    const echeance = el("input", "champ");
    echeance.type = "date";
    echeance.setAttribute("aria-label", "Échéance");
    echeance.value = new Date((auj + 7) * 86400000).toISOString().slice(0, 10);
    const ajouter = el("button", "bouton large", "Ajouter au carnet");
    ajouter.dataset.valider = "1";
    ajouter.addEventListener("click", () => {
      const jour = Math.round(Date.parse(echeance.value + "T00:00:00Z") / 86400000);
      if (!texte.value.trim() || texte.value.includes("…")) { texte.focus(); return; }
      if (isNaN(jour)) { echeance.focus(); return; }
      const l = previsions();
      l.push({ id: Date.now().toString(36), texte: texte.value.trim(), p: Number(proba.value), echeance: jour, creee: auj, issue: null });
      enregistrer(l);
      noterActivite();
      JEUX.find(j => j.id === "carnet").lancer(zone);
    });
    form.append(texte, modeles, affichage, curseurAvecBoutons(proba, 5), el("p", "consigne", "Échéance"), echeance, ajouter);
    zone.appendChild(form);
    zone.appendChild(paragraphe("Complétez les « … » d'un modèle. Pas d'actualité préenregistrée : elle serait vite périmée.", "source"));

    const l = previsions();
    const aResoudre = l.filter(x => !x.issue && x.echeance <= auj);
    const enCours = l.filter(x => !x.issue && x.echeance > auj).sort((a, b) => a.echeance - b.echeance);
    const resolues = l.filter(x => x.issue && x.issue !== "annulee");

    // Prévisions arrivées à échéance : issue, puis souvenir, puis révélation
    if (aResoudre.length) {
      zone.appendChild(el("h3", "titre-carnet", "À résoudre"));
      aResoudre.forEach(x => {
        const bloc = el("div", "prevision a-resoudre");
        bloc.append(el("p", "cas", x.texte), el("p", "source", "Échéance : " + dateDe(x.echeance)));
        const issues = [["oui", "Arrivé"], ["non", "Pas arrivé"], ["annulee", "Annulée"]];
        const boutons = issues.map(([id, libelle]) => {
          const b = el("button", "bouton secondaire", libelle);
          b.addEventListener("click", () => {
            boutons.forEach(y => y.remove());
            if (id === "annulee") { resoudre(x, "annulee", null); return; }
            // Avant de revoir la probabilité annoncée, il faut s'en souvenir
            bloc.appendChild(el("p", "consigne", "De mémoire : quelle probabilité aviez-vous annoncée ?"));
            const souvenir = el("input", "curseur");
            souvenir.type = "range"; souvenir.min = 5; souvenir.max = 95; souvenir.step = 5; souvenir.value = 50;
            souvenir.setAttribute("aria-label", "Probabilité dont vous vous souvenez");
            const aff = el("p", "valeur-curseur");
            const m = () => { aff.textContent = typo(souvenir.value + " %"); };
            souvenir.addEventListener("input", m);
            m();
            const ok = el("button", "bouton", "Révéler");
            ok.dataset.valider = "1";
            ok.addEventListener("click", () => resoudre(x, id, Number(souvenir.value)));
            bloc.append(aff, curseurAvecBoutons(souvenir, 5), ok);
          });
          return b;
        });
        const actions = el("div", "actions");
        boutons.forEach(b => actions.appendChild(b));
        bloc.appendChild(actions);
        zone.appendChild(bloc);
      });
    }
    const resoudre = (x, issue, souvenir) => {
      const tous = previsions();
      const y = tous.find(z => z.id === x.id);
      y.issue = issue;
      y.souvenir = souvenir;
      y.resolue = auj;
      enregistrer(tous);
      noterPartie("carnet");
      JEUX.find(j => j.id === "carnet").lancer(zone);
      if (issue !== "annulee") annoncer("Vous aviez annoncé " + x.p + " % ; vous vous souveniez de " + souvenir + " %.");
    };

    // Bilan
    if (resolues.length) {
      zone.appendChild(el("h3", "titre-carnet", "Votre bilan"));
      const brier = resolues.reduce((t, x) => t + (x.p / 100 - (x.issue === "oui" ? 1 : 0)) ** 2, 0) / resolues.length;
      // Glissement des souvenirs, compté positivement quand il rapproche la probabilité de ce qui s'est produit
      const glissements = resolues.filter(x => x.souvenir !== null && x.souvenir !== undefined).map(x => x.issue === "oui" ? x.souvenir - x.p : x.p - x.souvenir);
      const glissement = glissements.length ? glissements.reduce((a, b) => a + b, 0) / glissements.length : 0;
      const liste = el("ul", "liste-simple");
      liste.append(
        el("li", null, "Score de Brier moyen : " + fr(Number(brier.toFixed(3))) + " sur " + pluriel(resolues.length, "prévision") + " (0 : parfait ; 0,25 : toujours répondre 50 %)."),
        el("li", null, "Mémoire : en moyenne, vous vous êtes souvenu d'une probabilité " + (Math.abs(glissement) < 2.5 ? "à peu près exacte" : fr(Math.round(Math.abs(glissement))) + " points " + (glissement > 0 ? "plus proche" : "plus éloignée") + " de ce qui s'est produit") + ".")
      );
      zone.appendChild(liste);
      zone.appendChild(courbeCarnet(resolues));
      zone.appendChild(paragraphe("Les prévisions à moins de 50 % sont comptées par leur complément (30 % que oui = 70 % que non), puis groupées par tranches de 10 points. Avec peu de prévisions, la courbe reste très approximative.", "source"));
    }

    // Prévisions en cours
    if (enCours.length) {
      zone.appendChild(el("h3", "titre-carnet", "En cours"));
      const ul = el("ul", "liste-simple");
      enCours.forEach(x => ul.appendChild(el("li", null, x.texte + " — " + x.p + " %, échéance le " + dateDe(x.echeance))));
      zone.appendChild(ul);
      const agenda = el("button", "bouton secondaire", "Ajouter les échéances à mon agenda");
      agenda.addEventListener("click", () => fichierAgenda("previsions-esprit-critique.ics", enCours.map(x => ({
        jour: x.echeance, titre: "Prévision à résoudre : " + x.texte,
        description: "Ouvrez votre carnet pour indiquer l'issue : https://esprit-critique.github.io/#chiffres/carnet",
        url: "https://esprit-critique.github.io/#chiffres/carnet"
      }))));
      zone.appendChild(agenda);
    }
    if (!l.length) zone.appendChild(paragraphe("Votre carnet est vide. Ajoutez une première prévision : elle reviendra ici à son échéance.", "source"));

    ajouterExplication(zone, "Pourquoi tenir un carnet", [
      "Le score de Brier est l'écart moyen, au carré, entre la probabilité annoncée et ce qui s'est produit (1 ou 0). Il récompense à la fois la justesse et l'honnêteté sur son incertitude.",
      "Les prévisions s'améliorent avec l'entraînement : moins d'une heure de formation aux probabilités a amélioré de 6 à 11 % le score de Brier de prévisionnistes, sur quatre ans de concours (Chang et al., 2016). Formation, travail en équipe et sélection des meilleurs y contribuent (Mellers et al., 2014).",
      "Noter avant, c'est se protéger de sa mémoire : après les voyages de Nixon en Chine et en URSS, environ deux tiers des participants de Fischhoff et Beyth (1974) se souvenaient de prévisions plus proches de ce qui était arrivé qu'elles ne l'étaient. C'est le biais rétrospectif."
    ], [["#biais/retrospectif", "Biais rétrospectif"], ["#biais/surprecision", "Excès de précision"], ["#chiffres/vrai-faux", "Vrai ou faux ?"]]);
  }
});

// Liens depuis les fiches
[
  ["biais:croyance-logique", "#tests/logique", true], ["sophismes:affirmation-consequent", "#tests/logique"], ["sophismes:negation-antecedent", "#tests/logique"],
  ["biais:regression-moyenne", "#tests/moniteur", true], ["sophismes:post-hoc", "#tests/moniteur"], ["biais:illusion-controle", "#tests/moniteur"],
  ["biais:raisonnement-motive", "#tests/etudes", true], ["biais:confirmation", "#tests/etudes"], ["biais:perseverance", "#tests/etudes"],
  ["biais:pensee-groupe", "#tests/plusieurs", true], ["biais:conformisme", "#tests/plusieurs"], ["biais:autorite", "#tests/plusieurs"],
  ["biais:retrospectif", "#chiffres/carnet", true], ["biais:surprecision", "#chiffres/carnet"]
].forEach(([cle, adresse, enPremier]) => {
  const liste = (ATELIERS_DES_FICHES[cle] || []).filter(a => a !== adresse);
  ATELIERS_DES_FICHES[cle] = enPremier ? [adresse, ...liste] : [...liste, adresse];
});
