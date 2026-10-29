// experiences.js : expériences classiques de la psychologie du raisonnement, et expériences de pensée.
// Chaque expérience a un id, une section de la page Ateliers, un pictogramme, une couleur, une durée
// et une fonction lancer(zone). Adresses : #tests/…
// Outils communs (derouler, afficherScore, tirerNouveaux, ajouterExplication…) : ateliers.js.

// ===================== Contenus =====================

// Test de réflexion cognitive : trois questions de Frederick (2005) et quatre du « CRT-2 »
// de Thomson et Oppenheimer (2016). « reussite » : part de bonnes réponses dans l'étude de 2016
// (travailleurs en ligne américains, environ 140 personnes).
// Niveaux : 1, questions réussies par au moins un tiers des participants (Frederick, 2005 ; Thomson et Oppenheimer, 2016) ;
// 2, variantes de même structure, et deux questions de lecture attentive ; 3, problèmes à deux étapes, et la question
// la moins réussie (le trou, 16 %). Les variantes n'ont pas de taux de réussite publié : aucun n'est affiché.
const QUESTIONS_CRT = [
  { id: "batte", niveau: 1, texte: "Une batte et une balle coûtent 1,10 € au total. La batte coûte 1 € de plus que la balle. Combien coûte la balle ?", unite: "centimes", juste: 5, intuitive: 10, euros: true,
    explication: "Si la balle coûtait 10 centimes, la batte coûterait 1,10 € et le total 1,20 €. Avec x le prix de la balle : x + (x + 1) = 1,10, donc x = 0,05 €.", reussite: 48 },
  { id: "machines", niveau: 1, texte: "Si 5 machines fabriquent 5 objets en 5 minutes, combien de temps faut-il à 100 machines pour fabriquer 100 objets ?", unite: "minutes", juste: 5, intuitive: 100,
    explication: "Chaque machine fabrique un objet en 5 minutes. 100 machines fabriquent donc 100 objets en 5 minutes.", reussite: 34 },
  { id: "nenuphars", niveau: 1, texte: "Dans un lac, une étendue de nénuphars double de surface chaque jour. Il lui faut 48 jours pour couvrir tout le lac. Combien de jours lui faut-il pour en couvrir la moitié ?", unite: "jours", juste: 47, intuitive: 24,
    explication: "La surface double chaque jour : la veille du jour où le lac est couvert, elle en couvrait la moitié.", reussite: 52 },
  { id: "course", niveau: 1, texte: "Pendant une course, vous dépassez la personne qui est en deuxième position. À quelle place êtes-vous ?", unite: "e place", juste: 2, intuitive: 1, mots: { 1: ["premier", "premiere", "1er", "1re"], 2: ["deuxieme", "second", "seconde", "2e", "2eme"] },
    explication: "En dépassant le deuxième, vous prenez sa place : vous êtes deuxième. Le premier est toujours devant vous.", reussite: 63 },
  { id: "moutons", niveau: 1, texte: "Un fermier a 15 moutons. Tous meurent sauf 8. Combien en reste-t-il ?", unite: "moutons", juste: 8, intuitive: 7,
    explication: "« Tous sauf 8 » : il en reste 8. La soustraction 15 − 8 s'impose à l'esprit avant la lecture attentive.", reussite: 83 },
  { id: "emilie", niveau: 1, texte: "Le père d'Émilie a trois filles. Les deux premières s'appellent Avril et Mai. Comment s'appelle la troisième ?", unite: "", texteLibre: true, juste: "emilie", intuitive: "juin",
    explication: "Émilie, puisque c'est la fille de son père. La suite des mois suggère « Juin ».", reussite: 62 },
  { id: "trou", niveau: 3, texte: "Combien y a-t-il de mètres cubes de terre dans un trou de 3 m de profondeur, 3 m de largeur et 3 m de longueur ?", unite: "m³", juste: 0, intuitive: 27, mots: { 0: ["aucun", "rien", "zero", "0"] },
    explication: "Aucun : un trou est vide. Le calcul 3 × 3 × 3 = 27 s'impose avant la question elle-même.", reussite: 16 },
  // Variantes : même structure que les questions publiées, autres nombres (réponses vérifiées par le calcul)
  { id: "stylo", niveau: 2, texte: "Un stylo et une gomme coûtent 2,40 € au total. Le stylo coûte 2 € de plus que la gomme. Combien coûte la gomme ?", unite: "centimes", juste: 20, intuitive: 40, euros: true,
    explication: "Avec x le prix de la gomme : x + (x + 2) = 2,40, donc x = 0,20 €. À 40 centimes, le stylo coûterait 2,40 € à lui seul." },
  { id: "raquette", niveau: 2, texte: "Une raquette et un volant coûtent 3,30 € au total. La raquette coûte 3 € de plus que le volant. Combien coûte le volant ?", unite: "centimes", juste: 15, intuitive: 30, euros: true,
    explication: "Avec x le prix du volant : x + (x + 3) = 3,30, donc x = 0,15 €. À 30 centimes, le total serait de 3,60 €." },
  { id: "imprimantes", niveau: 2, texte: "Si 3 imprimantes impriment 3 affiches en 3 minutes, combien de temps faut-il à 60 imprimantes pour imprimer 60 affiches ?", unite: "minutes", juste: 3, intuitive: 60,
    explication: "Chaque imprimante imprime une affiche en 3 minutes : 60 imprimantes impriment 60 affiches en 3 minutes." },
  { id: "virus", niveau: 2, texte: "Un virus informatique double chaque heure le nombre de fichiers infectés. Il lui faut 10 heures pour infecter tout le disque. Combien d'heures lui faut-il pour en infecter la moitié ?", unite: "heures", juste: 9, intuitive: 5,
    explication: "Le nombre de fichiers infectés double chaque heure : une heure avant que tout soit infecté, la moitié l'était." },
  { id: "mois", niveau: 2, texte: "Combien de mois de l'année comptent 28 jours ?", unite: "mois", juste: 12, intuitive: 1, mots: { 12: ["douze", "tous"], 1: ["un", "fevrier"] },
    explication: "Tous les mois comptent au moins 28 jours : douze. La question fait penser à février, le seul mois qui n'en compte parfois que 28." },
  { id: "pommes", niveau: 2, texte: "Il y a trois pommes sur une table. Vous en prenez deux. Combien de pommes avez-vous ?", unite: "pommes", juste: 2, intuitive: 1, mots: { 2: ["deux"], 1: ["une", "un"] },
    explication: "Vous en avez deux : celles que vous avez prises. La soustraction 3 − 2 répond à une autre question, combien il en reste sur la table." },
  { id: "nenuphars-quart", niveau: 3, texte: "Dans un lac, une étendue de nénuphars double de surface chaque jour. Il lui faut 48 jours pour couvrir tout le lac. Combien de jours lui faut-il pour en couvrir le quart ?", unite: "jours", juste: 46, intuitive: 12,
    explication: "La veille du 48e jour, elle couvre la moitié du lac ; l'avant-veille, le quart : 46 jours." },
  { id: "deux-plants", niveau: 3, texte: "Un plant de nénuphar double de surface chaque jour et couvre tout un lac en 48 jours. Si l'on avait commencé avec deux plants identiques au lieu d'un, combien de jours aurait-il fallu ?", unite: "jours", juste: 47, intuitive: 24,
    explication: "Deux plants, c'est la surface qu'un seul plant atteint au bout d'un jour : on gagne une journée, pas la moitié du temps." },
  { id: "bacteries", niveau: 3, texte: "Une culture de bactéries triple de volume chaque heure et remplit un flacon en 12 heures. Au bout de combien d'heures remplissait-elle le tiers du flacon ?", unite: "heures", juste: 11, intuitive: 4,
    explication: "Le volume triple chaque heure : une heure avant que le flacon soit plein, il l'était au tiers." },
  { id: "couturiers", niveau: 3, texte: "5 couturiers cousent 5 robes en 5 jours. Combien de jours faut-il à 10 couturiers pour coudre 20 robes ?", unite: "jours", juste: 10, intuitive: 5,
    explication: "Un couturier coud une robe en 5 jours. 10 couturiers cousent 10 robes en 5 jours, donc 20 robes en 10 jours." },
  { id: "escargot", niveau: 3, texte: "Un escargot grimpe le long d'un mur de 10 m. Chaque jour, il monte de 3 m ; chaque nuit, il redescend de 2 m. En combien de jours atteint-il le haut du mur ?", unite: "jours", juste: 8, intuitive: 10,
    explication: "Chaque jour suivi d'une nuit le fait monter de 1 m : au matin du 8e jour, il est à 7 m. Ce jour-là, il monte de 3 m et atteint le haut, sans redescendre."  }
];

// Tâche de Wason : versions abstraites (presque toujours ratées) et versions concrètes
const WASON_ABSTRAITES = [
  () => {
    const voyelle = melanger(["A", "E", "U"])[0], consonne = melanger(["K", "D", "R"])[0];
    const pair = melanger(["4", "6", "8"])[0], impair = melanger(["3", "7", "9"])[0];
    return {
      consigne: "Chaque carte porte une lettre sur une face et un nombre sur l'autre.",
      regle: "Règle : si une carte porte une voyelle d'un côté, alors elle porte un nombre pair de l'autre côté.",
      cartes: [voyelle, consonne, pair, impair],
      explication: "La règle est de la forme « si P, alors Q ». Il faut retourner " + voyelle + " (une voyelle : vérifier qu'il y a bien un nombre pair derrière) et " + impair + " (si une voyelle s'y cache, la règle est violée). Le " + pair + " est inutile : la règle ne dit rien des consonnes, et une consonne derrière un nombre pair ne la contredit pas. Le réflexe de retourner le " + pair + " consiste à chercher une confirmation au lieu d'une réfutation possible."
    };
  },
  () => ({
    consigne: "Chaque carte porte une couleur sur une face et une forme sur l'autre.",
    regle: "Règle : si une carte est rouge d'un côté, alors elle porte un cercle de l'autre côté.",
    cartes: ["Rouge", "Bleu", "Cercle", "Carré"],
    petites: true,
    explication: "Il faut retourner la carte rouge (vérifier qu'elle porte un cercle) et la carte « carré » (si elle est rouge, la règle est violée). Retourner « cercle » ne peut rien prouver : la règle n'interdit pas aux cartes bleues de porter un cercle."
  })
];

const WASON_CONCRETES = [
  {
    consigne: "Vous contrôlez un bar. Chaque carte représente un client : ce qu'il boit sur une face, son âge sur l'autre.",
    regle: "Règle : si une personne boit de l'alcool, alors elle a au moins 18 ans.",
    cartes: ["Bière", "Soda", "25 ans", "16 ans"],
    explication: "Il faut vérifier l'âge du buveur de bière et la boisson du client de 16 ans. C'est exactement la même structure logique que la version abstraite (P, et non-Q), mais la plupart des gens la trouvent évidente (Griggs et Cox, 1982, avec une règle sur l'âge légal de la bière)."
  },
  {
    consigne: "Vous triez le courrier. Chaque carte représente une enveloppe : fermée ou ouverte d'un côté, son timbre de l'autre.",
    regle: "Règle : si une enveloppe est fermée, alors elle doit porter un timbre à tarif plein.",
    cartes: ["Fermée", "Ouverte", "Tarif plein", "Tarif réduit"],
    explication: "Il faut vérifier le timbre de l'enveloppe fermée et l'état de l'enveloppe au tarif réduit. Johnson-Laird, Legrenzi et Legrenzi (1972) ont utilisé une règle postale de ce type, familière à leurs participants britanniques : la plupart réussissaient."
  },
  {
    consigne: "Dans une île, une coutume régit la consommation de manioc, un aliment très recherché. Chaque carte représente un homme : ce qu'il mange sur une face, s'il porte un tatouage sur l'autre.",
    regle: "Règle : si un homme mange du manioc, alors il doit avoir un tatouage au visage.",
    cartes: ["Mange du manioc", "Mange des noix", "Tatoué", "Pas de tatouage"],
    petites: true,
    explication: "Il faut vérifier ce que mange le mangeur de manioc… et ce que mange l'homme sans tatouage. Leda Cosmides (1989) a montré que des règles totalement inconnues sont bien résolues dès qu'elles prennent la forme d'un contrat social (un privilège réservé à ceux qui remplissent une condition) : nous serions particulièrement doués pour repérer les tricheurs."
  }
];

// Règles cachées possibles pour le jeu 2, 4, 6 : toutes acceptent la suite 2, 4, 6
const REGLES_246 = [
  { id: "croissants", texte: "trois nombres strictement croissants", test: (a, b, c) => a < b && b < c },
  { id: "differents", texte: "trois nombres tous différents", test: (a, b, c) => a !== b && b !== c && a !== c },
  { id: "somme", texte: "le troisième nombre est la somme des deux premiers", test: (a, b, c) => Math.abs(a + b - c) < 1e-9 },
  { id: "dernier", texte: "le dernier nombre est le plus grand des trois", test: (a, b, c) => c > a && c > b },
  { id: "pairs", texte: "trois nombres pairs", test: (a, b, c) => [a, b, c].every(x => Number.isInteger(x) && x % 2 === 0) },
  { id: "somme-paire", texte: "la somme des trois nombres est paire", test: (a, b, c) => Number.isInteger(a + b + c) && (a + b + c) % 2 === 0 },
  { id: "extremes", texte: "le premier nombre est plus petit que le troisième", test: (a, b, c) => a < c }
];

// Problèmes classiques. type « choix » : une bonne réponse ; « nombre » : réponse chiffrée ;
// « paire » : deux choix successifs, dont on vérifie la cohérence.
// Niveaux : 1, problèmes à une étape, très connus ; 2, problèmes qui demandent de comparer ou de combiner ;
// 3, problèmes qui demandent un calcul de probabilité conditionnelle ou de repérer une variable cachée.
const PROBLEMES = [
  { id: "linda", niveau: 1, titre: "Linda", type: "choix",
    enonce: "Linda a 31 ans. Elle est célibataire, franche et très brillante. Elle a étudié la philosophie. Étudiante, elle se préoccupait beaucoup des questions de discrimination et de justice sociale, et a participé à des manifestations antinucléaires. Quelle affirmation est la plus probable ?",
    options: ["Linda est guichetière dans une banque.", "Linda est guichetière dans une banque et militante féministe."], juste: 0,
    resultat: "Tversky et Kahneman (1983) : environ 85 % des participants choisissent la seconde réponse, parce que la description ressemble au stéréotype d'une militante.",
    explication: "Toutes les guichetières féministes sont des guichetières : la probabilité de « guichetière et féministe » ne peut pas dépasser celle de « guichetière ». P(A et B) ≤ P(A), quelle que soit la description.",
    liens: [["#biais/conjonction", "Erreur de conjonction"]] },
  { id: "maternites", niveau: 2, titre: "Les deux maternités", type: "choix",
    enonce: "Une ville compte deux maternités. Dans la grande naissent environ 45 bébés par jour, dans la petite environ 15. Environ 50 % des bébés sont des garçons, mais la proportion varie d'un jour à l'autre. Pendant un an, chaque maternité a compté les jours où plus de 60 % des bébés nés étaient des garçons. Laquelle en a compté le plus ?",
    options: ["La grande maternité", "La petite maternité", "À peu près autant (à 5 % près)"], juste: 1,
    resultat: "Tversky et Kahneman (1974) : 56 % des participants répondent « à peu près autant », 22 % « la grande » et 22 % « la petite ».",
    explication: "Plus un échantillon est petit, plus ses proportions s'écartent de la moyenne. Pour une pièce équilibrée, plus de 60 % de garçons se produit environ 55 jours par an avec 15 naissances, contre environ 25 jours avec 45 naissances (calcul exact par la loi binomiale).",
    simulation: "maternites",
    liens: [["#biais/taille-echantillon", "Insensibilité à la taille de l'échantillon"]] },
  { id: "taxi", niveau: 3, titre: "Le taxi", type: "nombre",
    enonce: "Dans une ville, 85 % des taxis sont verts et 15 % sont bleus. Un taxi a renversé un piéton de nuit et pris la fuite. Un témoin affirme qu'il était bleu. Testé dans les mêmes conditions de visibilité, ce témoin reconnaît correctement la couleur dans 80 % des cas et se trompe dans 20 % des cas. Quelle est la probabilité que le taxi soit bleu ?",
    unite: "%", reponse: 41, tolerance: 5,
    resultat: "La réponse la plus fréquente est 80 % : la fiabilité du témoin, sans tenir compte de la rareté des taxis bleus (Tversky et Kahneman, 1982).",
    explication: "Sur 100 accidents de ce type : 15 impliquent un taxi bleu, que le témoin reconnaît 12 fois ; 85 impliquent un taxi vert, que le témoin prend pour un bleu 17 fois. Parmi les 29 taxis désignés comme bleus, 12 le sont vraiment : 12 / 29 ≈ 41 %.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "dick", niveau: 2, titre: "Ingénieurs et avocats", type: "nombre",
    enonce: "Un groupe compte 30 ingénieurs et 70 avocats. On en tire une personne au hasard. Sa description : « Dick a 30 ans. Il est marié, sans enfants. Très capable et très motivé, il promet de réussir dans son domaine. Ses collègues l'apprécient. » Quelle est la probabilité que Dick soit ingénieur ?",
    unite: "%", reponse: 30, tolerance: 5,
    resultat: "Kahneman et Tversky (1973) : les participants répondaient 50 %, que le groupe compte 30 % ou 70 % d'ingénieurs. Sans description, ils utilisaient correctement les proportions.",
    explication: "La description ne dit rien de la profession : elle ne doit pas modifier la proportion de départ, 30 %. Une information sans valeur suffit pourtant à faire oublier le taux de base.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "steve", niveau: 1, titre: "Steve", type: "choix",
    enonce: "« Steve est très timide et renfermé, toujours serviable, mais peu intéressé par les gens ou par le monde réel. Doux et ordonné, il a besoin d'ordre et de structure, et la passion du détail. » Steve est-il plus probablement bibliothécaire ou agriculteur ?",
    options: ["Bibliothécaire", "Agriculteur"], juste: 1,
    resultat: "Tversky et Kahneman (1974) : on classe les métiers selon leur ressemblance avec le stéréotype, sans tenir compte du nombre de personnes qui les exercent.",
    explication: "La description évoque le stéréotype du bibliothécaire, mais les agriculteurs sont bien plus nombreux : même si une faible part d'entre eux lui ressemble, ils l'emportent en nombre. Kahneman (2011) rappelle qu'aux États-Unis on compte plus de vingt agriculteurs pour un bibliothécaire, parmi les hommes.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "epidemie", niveau: 1, titre: "L'épidémie", type: "paire",
    enonce: "Une épidémie inhabituelle menace de tuer 600 personnes. Deux programmes sont proposés. Programme A : 200 personnes seront sauvées. Programme B : une chance sur trois de sauver les 600 personnes, deux chances sur trois de ne sauver personne.",
    options: ["Programme A", "Programme B"],
    enonce2: "Même situation, deux autres programmes. Programme C : 400 personnes mourront. Programme D : une chance sur trois que personne ne meure, deux chances sur trois que les 600 meurent.",
    options2: ["Programme C", "Programme D"],
    coherent: (r1, r2) => r1 === r2,
    resultat: "Tversky et Kahneman (1981), auprès de deux groupes différents : 72 % choisissent A dans la première formulation, 78 % choisissent D dans la seconde.",
    explication: "A et C décrivent exactement la même issue (200 survivants, 400 morts), comme B et D. Présentée en vies sauvées, l'option sûre attire ; présentée en morts, c'est le pari. Vous avez vu les deux formulations à la suite, ce qui aide à rester cohérent : l'effet est bien plus fort quand chacun n'en voit qu'une.",
    liens: [["#biais/cadrage", "Effet de cadrage"], ["#biais/aversion-perte", "Aversion à la perte"]] },
  { id: "allais", niveau: 2, titre: "Deux loteries", type: "paire",
    enonce: "Choisissez entre deux loteries. A : 2 500 € avec une probabilité de 33 %, 2 400 € avec 66 %, rien avec 1 %. B : 2 400 € à coup sûr.",
    options: ["A", "B"],
    enonce2: "Choisissez maintenant entre C : 2 500 € avec une probabilité de 33 %, rien sinon ; et D : 2 400 € avec une probabilité de 34 %, rien sinon.",
    options2: ["C", "D"],
    coherent: (r1, r2) => r1 === r2,
    resultat: "Kahneman et Tversky (1979), avec des montants en livres israéliennes : 82 % choisissent B, 83 % choisissent C, et 61 % font les deux choix à la fois.",
    explication: "Le second choix s'obtient en retirant du premier une chance de 66 % de gagner 2 400 €, commune à A et B. Selon la théorie de l'utilité espérée, qui préfère B doit donc préférer D. Préférer B puis C, c'est le paradoxe d'Allais (1953) : la certitude pèse plus lourd que la probabilité ne le justifie (effet de certitude).",
    liens: [["#biais/aversion-perte", "Aversion à la perte"]] },
  { id: "ellsberg", niveau: 2, titre: "L'urne d'Ellsberg", type: "paire",
    enonce: "Une urne contient 90 boules : 30 rouges, et 60 noires ou jaunes dans des proportions inconnues. On tire une boule ; vous gagnez 100 € si elle est de la couleur choisie. Pariez-vous sur le rouge ou sur le noir ?",
    options: ["Rouge", "Noir"],
    enonce2: "Même urne. Pariez-vous sur « rouge ou jaune », ou sur « noir ou jaune » ?",
    options2: ["Rouge ou jaune", "Noir ou jaune"],
    coherent: (r1, r2) => r1 === r2,
    resultat: "La plupart des gens choisissent le rouge, puis « noir ou jaune » (Ellsberg, 1961) : ils préfèrent les probabilités connues, 1/3 puis 2/3.",
    explication: "Préférer le rouge, c'est penser qu'il y a moins de 30 boules noires, donc plus de 30 jaunes ; préférer ensuite « noir ou jaune », c'est penser le contraire. Aucune croyance sur l'urne ne justifie ces deux choix : ils traduisent l'aversion à l'ambiguïté.",
    liens: [["#biais/statu-quo", "Biais du statu quo"]] },
  { id: "etats-finaux", niveau: 2, titre: "Gagner ou perdre", type: "paire",
    enonce: "On vous donne 1 000 €. Choisissez : A, une chance sur deux de gagner 1 000 € de plus ; ou B, 500 € de plus à coup sûr.",
    options: ["A : le pari", "B : 500 € sûrs"],
    enonce2: "On vous donne 2 000 €. Choisissez : C, une chance sur deux de perdre 1 000 € ; ou D, perdre 500 € à coup sûr.",
    options2: ["C : le pari", "D : perdre 500 €"],
    coherent: (r1, r2) => r1 === r2,
    resultat: "Kahneman et Tversky (1979) : 84 % choisissent B dans le premier cas, 69 % choisissent C dans le second.",
    explication: "En richesse finale, les deux problèmes sont identiques : A et C donnent 1 000 ou 2 000 € avec une chance sur deux, B et D donnent 1 500 € à coup sûr. Nous jugeons les gains et les pertes par rapport à un point de référence : prudents face aux gains, joueurs face aux pertes.",
    liens: [["#biais/aversion-perte", "Aversion à la perte"], ["#biais/cadrage", "Effet de cadrage"]] },
  { id: "sally-clark", niveau: 3, titre: "1 sur 73 millions", type: "choix",
    enonce: "En 1999, l'Anglaise Sally Clark est jugée pour le meurtre de ses deux bébés, morts subitement. Un pédiatre affirme que la probabilité que deux enfants d'une telle famille meurent de mort subite du nourrisson est de 1 sur 73 millions. Que vaut ce chiffre ?",
    options: ["C'est la probabilité qu'elle soit innocente", "Il ne donne pas la probabilité de son innocence, et il est mal calculé", "Il prouve sa culpabilité au-delà du doute raisonnable"], juste: 1,
    resultat: "Condamnée en novembre 1999, Sally Clark est libérée en appel en janvier 2003. La Royal Statistical Society avait dénoncé en 2001 un chiffre « sans fondement statistique ».",
    explication: "Deux erreurs. Le calcul (1 sur 8 543 au carré) suppose les deux décès indépendants, alors que des facteurs génétiques ou familiaux communs rendent un second décès plus probable. Surtout, il faut comparer deux explications rares : deux morts subites, ou deux meurtres d'enfants par leur mère, eux aussi extrêmement rares. Confondre la probabilité des indices si l'accusée est innocente avec la probabilité qu'elle soit innocente au vu des indices, c'est le sophisme du procureur.",
    liens: [["#biais/procureur", "Sophisme du procureur"]] },
  { id: "monte-carlo", niveau: 1, titre: "Après cinq « pile »", type: "choix",
    enonce: "Une pièce équilibrée vient de tomber cinq fois de suite sur « pile ». Au prochain lancer :",
    options: ["« Face » est plus probable", "« Pile » est plus probable", "Les deux sont également probables"], juste: 2,
    resultat: "Le 18 août 1913, au casino de Monte-Carlo, la bille est tombée 26 fois de suite sur le noir. Des joueurs ont perdu des millions de francs en misant sur le rouge, persuadés qu'il « devait » sortir.",
    explication: "La pièce n'a pas de mémoire : chaque lancer est indépendant. Une série de cinq « pile » avait une chance sur 32 de se produire ; une fois qu'elle s'est produite, le lancer suivant reste à une chance sur deux.",
    liens: [["#biais/erreur-du-joueur", "Erreur du joueur"]] },
  { id: "instructeurs", niveau: 1, titre: "Les instructeurs de vol", type: "choix",
    enonce: "Des instructeurs de l'armée de l'air israélienne constatent qu'après avoir félicité un élève pour une manœuvre particulièrement réussie, sa manœuvre suivante est souvent moins bonne ; et qu'après avoir réprimandé un élève pour une manœuvre ratée, la suivante est souvent meilleure. Ils en concluent que les réprimandes sont plus efficaces que les félicitations. Ont-ils raison ?",
    options: ["Oui, les faits le montrent", "Non : on observerait la même chose sans félicitations ni réprimandes", "Non : les félicitations sont toujours plus efficaces"], juste: 1,
    resultat: "Daniel Kahneman raconte cet épisode, vécu lors d'une formation d'instructeurs de vol, dans « Système 1 / Système 2 » (2011).",
    explication: "Une performance exceptionnelle doit en partie à la chance : la suivante sera en moyenne plus proche de la normale, quoi qu'on fasse. C'est la régression vers la moyenne ; elle fait croire à l'efficacité des punitions et à l'inefficacité des récompenses.",
    liens: [["#biais/regression-moyenne", "Régression vers la moyenne"]] },
  { id: "berkeley", niveau: 3, titre: "Les admissions de Berkeley", type: "choix",
    enonce: "À l'automne 1973, l'université de Berkeley a admis 44 % des 8 442 hommes candidats et 35 % des 4 321 femmes candidates. Ces chiffres prouvent-ils une discrimination contre les femmes ?",
    options: ["Oui, l'écart est trop grand pour être dû au hasard", "Pas forcément : il faut regarder département par département", "Non, l'écart est trop faible pour compter"], juste: 1,
    resultat: "Bickel, Hammel et O'Connell (1975) : département par département, les femmes n'étaient pas désavantagées. Elles postulaient davantage aux départements les plus sélectifs.",
    explication: "C'est le paradoxe de Simpson : une tendance globale peut disparaître, voire s'inverser, dans chaque sous-groupe, parce que les groupes ne se répartissent pas de la même façon. Il faut se demander quelle comparaison répond à la question posée.",
    liens: [["#biais/simpson", "Paradoxe de Simpson"]] },
  { id: "comtes", niveau: 3, titre: "Les comtés ruraux", type: "choix",
    enonce: "Aux États-Unis, les comtés où le taux de cancer du rein est le plus bas sont surtout ruraux, peu peuplés et situés dans le Midwest, le Sud et l'Ouest. Quelle explication privilégier ?",
    options: ["La vie rurale protège : air pur, eau propre, alimentation saine", "Leurs petites populations produisent des taux extrêmes, dans un sens comme dans l'autre", "Les cancers y sont moins bien diagnostiqués"], juste: 1,
    resultat: "L'exemple, tiré de Wainer et Zwerling (2006), est repris par Kahneman (2011) : les comtés où le taux est le plus élevé sont… eux aussi surtout ruraux et peu peuplés.",
    explication: "Dans une petite population, quelques cas suffisent à faire varier fortement un taux : on trouve donc les petits comtés aux deux extrêmes. Avant d'expliquer un taux extrême, il faut se demander sur combien de cas il repose.",
    liens: [["#biais/taille-echantillon", "Insensibilité à la taille de l'échantillon"]] },
  // Problèmes ajoutés pour la progression. Quand l'étude d'origine ne donne pas de chiffres vérifiés,
  // le résultat se limite au calcul exact.
  { id: "moise", niveau: 1, titre: "L'arche", type: "choix",
    enonce: "Combien d'animaux de chaque espèce Moïse a-t-il embarqués dans l'arche ?",
    options: ["Deux", "Sept", "Aucun : c'est Noé qui a construit l'arche"], juste: 2,
    resultat: "Dans l'expérience d'Erickson et Mattson (1981), seule une petite minorité des participants a relevé l'erreur, alors que tous savaient que l'arche est celle de Noé.",
    explication: "La question parle de Moïse, et non de Noé. Les deux personnages appartiennent au même récit biblique et leurs noms se ressemblent : on répond à la question qu'on attend, sans vérifier ses termes." },
  { id: "naissances", niveau: 1, titre: "Six naissances", type: "choix",
    enonce: "Dans une famille de six enfants, quelle suite de naissances est la plus probable : fille, garçon, fille, garçon, garçon, fille ; ou garçon, garçon, garçon, garçon, garçon, garçon ? (On suppose une chance sur deux à chaque naissance.)",
    options: ["La première", "La seconde", "Les deux sont aussi probables"], juste: 2,
    resultat: "Calcul : chaque suite précise de six naissances a une probabilité de (1/2)⁶, soit 1 sur 64.",
    explication: "La première suite « a l'air » plus aléatoire, mais elle n'est pas plus probable que la seconde : c'est l'heuristique de représentativité décrite par Kahneman et Tversky (1972). Ce qui est plus probable, c'est d'avoir trois filles et trois garçons dans n'importe quel ordre.",
    liens: [["#biais/erreur-du-joueur", "Erreur du joueur"]] },
  { id: "chaussettes", niveau: 1, titre: "Les chaussettes", type: "nombre",
    enonce: "Un tiroir contient 10 chaussettes noires et 10 blanches, mélangées. Dans le noir, combien faut-il en sortir, au minimum, pour être sûr d'avoir deux chaussettes de la même couleur ?",
    unite: "chaussettes", reponse: 3, tolerance: 0,
    resultat: "Raisonnement : avec deux couleurs, trois chaussettes suffisent toujours.",
    explication: "Les deux premières peuvent être de couleurs différentes ; la troisième est forcément de la couleur de l'une d'elles. La réponse 11, fréquente, répond à une autre question : être sûr d'avoir deux chaussettes noires." },
  { id: "des-11-12", niveau: 1, titre: "Onze ou douze", type: "choix",
    enonce: "On lance deux dés et l'on fait la somme des points. Qu'est-ce qui est le plus probable : obtenir 11, ou obtenir 12 ?",
    options: ["Obtenir 11", "Obtenir 12", "Les deux sont aussi probables"], juste: 0,
    resultat: "Calcul : 2 chances sur 36 pour 11, 1 sur 36 pour 12.",
    explication: "11 s'obtient de deux façons (5 puis 6, ou 6 puis 5), 12 d'une seule (6 et 6). Penser les deux dés comme un tout fait oublier que les combinaisons ne sont pas toutes aussi nombreuses." },
  { id: "dollar-manquant", niveau: 1, titre: "L'euro manquant", type: "choix",
    enonce: "Trois amis paient une chambre 30 €, 10 € chacun. Le patron s'aperçoit qu'elle coûte 25 € et charge le groom de rendre 5 €. Le groom garde 2 € et rend 1 € à chacun. Chacun a donc payé 9 €, soit 27 €, plus les 2 € du groom : 29 €. Où est passé le dernier euro ?",
    options: ["Le groom l'a gardé en plus", "Nulle part : il ne faut pas ajouter les 2 € du groom aux 27 €", "Le patron l'a gardé"], juste: 1,
    resultat: "Énigme classique, dite « du dollar manquant ».",
    explication: "Les 27 € payés se répartissent en 25 € pour le patron et 2 € pour le groom. Les ajouter de nouveau compte les 2 € deux fois. Le bon compte : 27 € payés + 3 € rendus = 30 €." },
  { id: "factorielle", niveau: 2, titre: "Cinq secondes de calcul", type: "choix",
    enonce: "Sans calculer, en cinq secondes : à quoi le produit 8 × 7 × 6 × 5 × 4 × 3 × 2 × 1 est-il le plus proche ?",
    options: ["Environ 500", "Environ 2 000", "Environ 40 000"], juste: 2,
    resultat: "Tversky et Kahneman (1974) ont posé la question dans les deux ordres : l'estimation médiane était de 2 250 en partant de 8, et de 512 en partant de 1. Le résultat exact est 40 320.",
    explication: "On calcule les premiers produits, puis on extrapole à partir de ce début : un ancrage. Les deux groupes restent très en dessous, et celui qui commence par les petits nombres plus encore.",
    liens: [["#biais/ancrage", "Effet d'ancrage"]] },
  { id: "lettre-k", niveau: 2, titre: "La lettre K", type: "choix",
    enonce: "Dans un texte en anglais, la lettre K est-elle plus souvent la première lettre d'un mot, ou la troisième ?",
    options: ["La première", "La troisième", "Autant l'une que l'autre"], juste: 1,
    resultat: "Tversky et Kahneman (1973) ont posé cette question : les participants surestimaient les mots commençant par K.",
    explication: "Il est facile de chercher des mots par leur première lettre (kitchen, kind), beaucoup moins par leur troisième (ask, make, like). La facilité à trouver des exemples sert d'estimation de la fréquence : c'est l'heuristique de disponibilité.",
    liens: [["#biais/disponibilite", "Heuristique de disponibilité"]] },
  { id: "quatre-lancers", niveau: 2, titre: "Au moins un six", type: "choix",
    enonce: "On lance un dé quatre fois. La probabilité d'obtenir au moins un six dépasse-t-elle une chance sur deux ?",
    options: ["Oui, elle est d'environ 52 %", "Non, elle est d'environ 33 %", "Oui, elle est de 4 chances sur 6, soit 67 %"], juste: 0,
    resultat: "Calcul : 1 − (5/6)⁴ ≈ 0,518.",
    explication: "On ne peut pas additionner les chances (4 × 1/6) : ce calcul compterait deux fois les parties où plusieurs six sortent. On calcule plutôt la probabilité de n'avoir aucun six, (5/6)⁴ ≈ 0,482, et son complément." },
  { id: "vitesse-moyenne", niveau: 2, titre: "L'aller et le retour", type: "nombre",
    enonce: "Vous faites un trajet aller à 60 km/h, puis le même trajet retour à 40 km/h. Quelle est votre vitesse moyenne sur l'ensemble ?",
    unite: "km/h", reponse: 48, tolerance: 0.5,
    resultat: "Calcul : pour 60 km de trajet, l'aller dure 1 h, le retour 1 h 30 ; 120 km en 2 h 30 font 48 km/h.",
    explication: "La réponse intuitive, 50 km/h, fait la moyenne des deux vitesses. Mais on roule plus longtemps à 40 km/h qu'à 60 : la vitesse lente pèse davantage." },
  { id: "interets", niveau: 2, titre: "1 % par mois", type: "nombre",
    enonce: "Un placement rapporte 1 % par mois, et les intérêts sont réinvestis chaque mois. Combien rapporte-t-il en un an, en pourcentage ? (Une décimale.)",
    unite: "%", reponse: 12.7, tolerance: 0.15,
    resultat: "Calcul : 1,01¹² ≈ 1,1268, soit 12,7 % par an.",
    explication: "La réponse intuitive, 12 %, oublie que les intérêts de chaque mois rapportent à leur tour : c'est l'effet des intérêts composés, qui croît vite avec la durée." },
  { id: "taxi-30", niveau: 3, titre: "Le taxi, autre ville", type: "nombre",
    enonce: "Dans une autre ville, 70 % des taxis sont verts et 30 % sont bleus. Un témoin affirme que le taxi d'un accident était bleu ; testé dans les mêmes conditions, il reconnaît la bonne couleur 80 fois sur 100. Quelle est la probabilité que le taxi ait vraiment été bleu ?",
    unite: "%", reponse: 63, tolerance: 3,
    resultat: "Calcul : 24 / (24 + 14) ≈ 63 %.",
    explication: "Sur 100 accidents : 30 impliquent un taxi bleu, que le témoin reconnaît 24 fois ; 70 un taxi vert, qu'il prend pour un bleu 14 fois. Parmi les 38 taxis désignés comme bleus, 24 le sont vraiment.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "taxi-5", niveau: 3, titre: "Le taxi rare", type: "nombre",
    enonce: "Dans une ville, 95 % des taxis sont verts et 5 % sont bleus. Un témoin affirme qu'un taxi en fuite était bleu ; il reconnaît la bonne couleur 90 fois sur 100. Quelle est la probabilité que le taxi ait vraiment été bleu ?",
    unite: "%", reponse: 32, tolerance: 3,
    resultat: "Calcul : 45 / (45 + 95) ≈ 32 %.",
    explication: "Sur 1 000 accidents : 50 impliquent un taxi bleu, reconnu 45 fois ; 950 un taxi vert, pris pour un bleu 95 fois. Même avec un témoin fiable à 90 %, un taxi désigné comme bleu est plus souvent vert, parce que les bleus sont rares.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "taxi-50", niveau: 3, titre: "Le taxi, moitié-moitié", type: "nombre",
    enonce: "Dans une ville, la moitié des taxis sont verts et l'autre moitié bleus. Un témoin, qui reconnaît la bonne couleur 80 fois sur 100, affirme que le taxi était bleu. Quelle est la probabilité que le taxi ait vraiment été bleu ?",
    unite: "%", reponse: 80, tolerance: 3,
    resultat: "Calcul : 40 / (40 + 10) = 80 %.",
    explication: "Quand les deux couleurs sont aussi fréquentes, le taux de base ne déplace rien, et la fiabilité du témoin donne directement la réponse. C'est seulement dans ce cas que la réponse intuitive est juste.",
    liens: [["#biais/taux-de-base", "Négligence du taux de base"]] },
  { id: "bertrand", niveau: 3, titre: "Les trois coffrets", type: "choix",
    enonce: "Trois coffrets : l'un contient deux pièces d'or, un autre deux pièces d'argent, le dernier une pièce d'or et une d'argent. On choisit un coffret au hasard et l'on en tire une pièce au hasard : elle est en or. Quelle est la probabilité que l'autre pièce du coffret soit aussi en or ?",
    options: ["1 chance sur 2", "2 chances sur 3", "1 chance sur 3"], juste: 1,
    resultat: "Paradoxe des coffrets de Joseph Bertrand (1889). Calcul : 2 chances sur 3.",
    explication: "Il y a trois pièces d'or en tout, et chacune avait autant de chances d'être tirée. Deux d'entre elles sont dans le coffret « or-or » : dans deux cas sur trois, l'autre pièce est en or. Raisonner sur les coffrets (« or-or ou or-argent, une chance sur deux ») oublie que le coffret « or-or » donne de l'or à coup sûr." },
  { id: "mere", niveau: 3, titre: "Le pari du chevalier de Méré", type: "choix",
    enonce: "Qu'est-ce qui est le plus probable : obtenir au moins un six en lançant un dé 4 fois, ou obtenir au moins un double six en lançant deux dés 24 fois ?",
    options: ["Au moins un six en 4 lancers", "Au moins un double six en 24 lancers", "Les deux sont aussi probables"], juste: 0,
    resultat: "Problème discuté par Pascal et Fermat en 1654. Calcul : 1 − (5/6)⁴ ≈ 51,8 % ; 1 − (35/36)²⁴ ≈ 49,1 %.",
    explication: "Le raisonnement « 4 lancers pour une chance sur 6, donc 24 pour une chance sur 36 » suppose que les chances s'additionnent. Elles ne s'additionnent pas : on calcule la probabilité de ne jamais réussir, puis son complément." },
  { id: "qi-moyen", niveau: 3, titre: "Le premier élève", type: "nombre",
    enonce: "Dans une ville, le QI moyen des élèves de quatrième est de 100. On tire au hasard 50 élèves. Le premier testé a un QI de 150. Quel QI moyen faut-il attendre pour l'ensemble des 50 ?",
    unite: "points", reponse: 101, tolerance: 0.5,
    resultat: "Calcul : (150 + 49 × 100) / 50 = 101.",
    explication: "Les 49 autres élèves ne « compensent » pas le premier : on attend pour eux la moyenne habituelle, 100. Répondre 100 revient à croire que le hasard rééquilibre de lui-même un écart, comme dans l'erreur du joueur.",
    liens: [["#biais/erreur-du-joueur", "Erreur du joueur"]] }
];

// Scénarios de dépistage réels ; d'autres sont créés au hasard (voir scenarioAuHasard)
const SCENARIOS_DEPISTAGE = [
  { id: "casscells", contexte: "Une maladie touche 1 personne sur 1 000. Un test la détecte toujours chez les malades, mais il est faussement positif chez 5 % des personnes en bonne santé. Une personne prise au hasard est testée positive.",
    question: "Quelle est la probabilité qu'elle soit réellement malade ?", prevalence: 0.001, sensibilite: 1, fauxPositifs: 0.05, population: 1000,
    noms: ["malades", "bien portants"], courts: ["malades", "bien portants"],
    resultat: "Casscells et ses collègues (1978) ont posé cette question à des médecins et étudiants de Harvard : la réponse la plus fréquente était 95 %." },
  { id: "mammographie", contexte: "Une femme de 50 ans passe une mammographie de dépistage. Dans sa tranche d'âge, 1 % des femmes ont un cancer du sein. Si une femme a un cancer, la mammographie est positive dans 90 % des cas ; si elle n'en a pas, elle est positive dans 9 % des cas. Sa mammographie est positive.",
    question: "Quelle est la probabilité qu'elle ait un cancer ?", prevalence: 0.01, sensibilite: 0.9, fauxPositifs: 0.09, population: 1000,
    noms: ["femmes ayant un cancer", "femmes sans cancer"], courts: ["avec cancer", "sans cancer"],
    resultat: "Gigerenzer et ses collègues (2007) ont posé cette question à 160 gynécologues : la plupart ont répondu 90 % ou 81 %, et seuls 21 % ont trouvé la bonne réponse, environ 1 sur 10. Après une formation aux fréquences naturelles, la grande majorité y parvenait." }
];

// Expériences de pensée : pas de « bonne réponse », mais les positions des philosophes
const EXPERIENCES_PENSEE = [
  { id: "poulet", titre: "Le poulet de Russell", auteur: "Bertrand Russell, « Problèmes de philosophie », 1912",
    texte: "Un poulet a été nourri par le fermier chaque matin de sa vie, plus de mille fois. Chaque jour a confirmé la régularité.",
    question: "Le poulet peut-il être sûr d'être nourri demain ?",
    options: ["Oui, presque certainement", "Il peut le prévoir, sans aucune certitude", "Non, il ne peut rien en conclure"],
    discussion: "Russell conclut : « L'homme qui a nourri le poulet tous les jours de sa vie finit par lui tordre le cou. » Mille observations ne garantissent pas la suivante : c'est le problème de l'induction, posé par David Hume (1739). Aucune démonstration ne permet de passer de « jusqu'ici » à « toujours ». Karl Popper en tire qu'une théorie scientifique n'est jamais prouvée, seulement mise à l'épreuve et non encore réfutée.",
    critique: "Pour l'esprit critique : une régularité passée est un indice, pas une garantie, surtout quand quelqu'un a intérêt à ce qu'elle cesse.",
    liens: [["#sophismes/generalisation-hative", "Généralisation hâtive"]] },
  { id: "tas", titre: "Le tas de sable", auteur: "Eubulide de Milet, IVe siècle av. J.-C.",
    texte: "Un million de grains de sable forment un tas. Si l'on retire un grain d'un tas, il reste un tas. En répétant l'opération, on arrive à un seul grain.",
    question: "Un seul grain de sable est-il un tas ?",
    options: ["Oui : le raisonnement est valide", "Non, et il existe un nombre précis de grains où le tas cesse", "Non : « tas » est un mot flou, sans limite nette, mais les cas clairs existent"],
    discussion: "C'est le paradoxe sorite (du grec sôros, « tas »). Pour certains philosophes, il existe une limite précise mais inconnaissable (épistémicisme, Timothy Williamson) ; pour d'autres, les mots vagues admettent des degrés de vérité, ou des cas « ni vrais ni faux ». Presque tous rejettent la conclusion.",
    critique: "Pour l'esprit critique : l'absence de frontière nette ne prouve pas l'absence de différence. Le jour et la nuit existent, même si l'on ne peut pas dire à quelle seconde l'un devient l'autre. Nier cela, c'est le sophisme du continuum.",
    liens: [["#sophismes/continuum", "Sophisme du continuum"]] },
  { id: "thesee", titre: "Le navire de Thésée", auteur: "Plutarque, « Vie de Thésée » ; Thomas Hobbes, 1655",
    texte: "Les Athéniens conservent le navire de Thésée. Au fil des siècles, ils remplacent chaque planche pourrie par une neuve, jusqu'à ce qu'il ne reste aucune planche d'origine. Hobbes ajoute : et si quelqu'un avait gardé les vieilles planches pour reconstruire le navire ?",
    question: "Lequel est le navire de Thésée ?",
    options: ["Le navire réparé, qui n'a jamais cessé de naviguer", "Le navire reconstruit avec les planches d'origine", "Aucun fait ne tranche : tout dépend de ce qu'on appelle « le même »"],
    discussion: "Les philosophes distinguent plusieurs critères d'identité : la continuité (le navire réparé), la matière (le navire reconstruit), la fonction ou la forme. La question reste ouverte, et se pose pour les personnes : presque toutes nos cellules se renouvellent, sommes-nous la même personne ?",
    critique: "Pour l'esprit critique : beaucoup de désaccords portent sur des mots, pas sur des faits. Préciser ce que l'on entend par « le même », « naturel » ou « liberté » dissout bien des disputes.",
    liens: [["#sophismes/equivoque", "Équivoque"], ["#sophismes/definition-persuasive", "Définition persuasive"]] },
  { id: "theiere", titre: "La théière de Russell", auteur: "Bertrand Russell, « Is There a God? », écrit en 1952",
    texte: "Russell imagine affirmer qu'une théière de porcelaine tourne autour du Soleil, entre la Terre et Mars, trop petite pour être vue même par les plus puissants télescopes. Personne ne peut prouver le contraire.",
    question: "À qui revient la charge de la preuve ?",
    options: ["À celui qui affirme que la théière existe", "À celui qui en doute", "À personne : la question est indécidable"],
    discussion: "Pour Russell, ce serait « une absurdité intolérable » d'exiger des sceptiques qu'ils prouvent l'inexistence de la théière. Christopher Hitchens a résumé le principe : « Ce qui peut être affirmé sans preuve peut être rejeté sans preuve. » Carl Sagan ajoutait que des affirmations extraordinaires demandent des preuves extraordinaires.",
    critique: "Pour l'esprit critique : « vous ne pouvez pas prouver que c'est faux » n'est pas un argument. C'est l'appel à l'ignorance.",
    liens: [["#sophismes/ignorance", "Appel à l'ignorance"]] },
  { id: "gettier", titre: "Le problème de Gettier", auteur: "Edmund Gettier, 1963",
    texte: "Smith a de bonnes raisons de croire que Jones obtiendra le poste et que Jones a dix pièces dans sa poche. Il en conclut : « Celui qui obtiendra le poste a dix pièces dans sa poche. » Surprise : c'est Smith qui obtient le poste… et, sans le savoir, il a lui-même dix pièces dans sa poche.",
    question: "Smith savait-il que celui qui obtiendrait le poste avait dix pièces dans sa poche ?",
    options: ["Oui : sa croyance était vraie et justifiée", "Non : il a eu raison par chance", "Je ne sais pas"],
    discussion: "Depuis Platon, on définissait souvent la connaissance comme une croyance vraie et justifiée. En trois pages, Gettier a montré qu'une croyance peut être vraie et justifiée sans être une connaissance, quand elle tombe juste par hasard. La plupart des philosophes l'ont suivi ; aucune définition alternative ne fait consensus.",
    critique: "Pour l'esprit critique : avoir raison ne prouve pas qu'on a bien raisonné. Juger une décision à son seul résultat, c'est le biais du résultat.",
    liens: [["#biais/resultat", "Biais du résultat"]] },
  { id: "achille", titre: "Achille et la tortue", auteur: "Zénon d'Élée, Ve siècle av. J.-C., rapporté par Aristote",
    texte: "Achille, coureur rapide, laisse une avance à une tortue. Quand il atteint le point de départ de la tortue, elle a un peu avancé ; quand il atteint ce nouveau point, elle a encore avancé, et ainsi de suite, à l'infini.",
    question: "Où est l'erreur ?",
    options: ["Il n'y en a pas : le mouvement est une illusion", "Une infinité d'étapes peut tenir dans un temps fini", "Il n'y a pas d'erreur : Achille ne rattrape jamais la tortue"],
    discussion: "Les étapes sont de plus en plus courtes : leurs durées forment une série dont la somme est finie (comme 1/2 + 1/4 + 1/8 + … = 1). Les mathématiques des limites, rigoureusement fondées au XIXe siècle, résolvent le calcul ; les philosophes discutent encore de ce que signifie accomplir une infinité d'actions.",
    critique: "Pour l'esprit critique : un raisonnement peut sembler impeccable et cacher une prémisse fausse, ici « une infinité d'étapes prend un temps infini ». Quand une conclusion est absurde, cherchez la prémisse.",
    liens: [["#guide/logique", "Valide, vrai, solide (guide)"]] },
  { id: "corbeau", titre: "Le corbeau de Hempel", auteur: "Carl Hempel, 1945",
    texte: "« Tous les corbeaux sont noirs » équivaut logiquement à « tout ce qui n'est pas noir n'est pas un corbeau ». Une pomme verte n'est pas noire et n'est pas un corbeau : elle confirme donc la seconde phrase.",
    question: "Observer une pomme verte confirme-t-il que tous les corbeaux sont noirs ?",
    options: ["Non, pas du tout", "Oui, mais d'une quantité infime", "Oui, autant qu'un corbeau noir"],
    discussion: "La réponse la plus répandue, d'inspiration probabiliste, est « oui, mais infinitésimalement » : il existe tant d'objets non noirs qu'une pomme verte n'apporte presque rien, alors qu'un corbeau aurait pu être blanc. Une observation confirme d'autant plus une hypothèse qu'elle aurait pu la réfuter.",
    critique: "Pour l'esprit critique : un indice vaut ce qu'il aurait pu démentir. Accumuler des cas qui ne pouvaient pas contredire une idée ne prouve rien ; c'est la leçon de la tâche des quatre cartes de Wason.",
    liens: [["#tests/wason", "Atelier : quatre cartes"], ["#biais/confirmation", "Biais de confirmation"]] },
  { id: "menteur", titre: "Le menteur", auteur: "Eubulide de Milet, IVe siècle av. J.-C.",
    texte: "Considérez la phrase suivante : « Cette phrase est fausse. »",
    question: "Est-elle vraie ou fausse ?",
    options: ["Vraie", "Fausse", "Ni l'une ni l'autre"],
    discussion: "Si elle est vraie, elle est fausse ; si elle est fausse, elle est vraie. Le logicien Alfred Tarski (1933) en a conclu qu'une langue ne peut pas, sans contradiction, contenir son propre prédicat « vrai » : il faut distinguer la langue dont on parle et celle dans laquelle on en parle. D'autres solutions admettent des phrases ni vraies ni fausses.",
    critique: "Pour l'esprit critique : certaines affirmations ne peuvent pas être évaluées telles quelles. Avant de débattre du vrai et du faux, vérifiez qu'une phrase dit bien quelque chose.",
    liens: [["#sophismes/petition-principe", "Pétition de principe"]] },
  { id: "pascal", titre: "Le pari de Pascal", auteur: "Blaise Pascal, « Pensées », 1670",
    texte: "Si Dieu existe et que vous y croyez, vous gagnez un bonheur infini ; si vous n'y croyez pas, vous risquez une perte infinie. S'il n'existe pas, croire ne vous coûte presque rien. Donc il est rationnel de parier que Dieu existe.",
    question: "L'argument est-il convaincant ?",
    options: ["Oui : le calcul est imparable", "Non : il oublie d'autres possibilités", "Non : on ne choisit pas ce que l'on croit"],
    discussion: "L'argument est l'ancêtre de la théorie de la décision. Ses critiques sont anciennes : il ne considère qu'un seul dieu, alors que d'autres pourraient punir la croyance en celui-là (objection des « dieux multiples ») ; on ne décide pas de croire comme on décide d'agir ; et les gains infinis rendent le calcul instable (un pari minuscule sur un gain infini l'emporterait sur tout).",
    critique: "Pour l'esprit critique : réduire un choix à deux options en ignorant les autres, c'est le faux dilemme.",
    liens: [["#sophismes/faux-dilemme", "Faux dilemme"], ["#sophismes/consequences", "Appel aux conséquences"]] },
  { id: "machine", titre: "La machine à expériences", auteur: "Robert Nozick, « Anarchie, État et utopie », 1974",
    texte: "Des neuroscientifiques peuvent vous brancher à une machine qui vous ferait vivre, jusqu'à la fin de vos jours, les expériences les plus agréables que vous puissiez désirer. Une fois branché, vous ne sauriez pas que vous êtes dans la machine.",
    question: "Vous brancheriez-vous ?",
    options: ["Oui", "Non", "Je ne sais pas"],
    discussion: "Nozick pensait que la plupart refuseraient, et en tirait un argument contre l'hédonisme : nous voulons faire des choses et être quelqu'un, pas seulement en avoir l'impression. Le philosophe et psychologue Joshua Greene suggère que le biais du statu quo pèse sur ce refus : si l'on vous apprenait que votre vie actuelle se déroule déjà dans une telle machine, voudriez-vous en sortir ?",
    critique: "Pour l'esprit critique : une intuition peut dépendre du point de départ qu'on nous propose. Inverser la question est un bon test.",
    liens: [["#biais/statu-quo", "Biais du statu quo"]] },
  { id: "voile", titre: "Le voile d'ignorance", auteur: "John Rawls, « Théorie de la justice », 1971",
    texte: "Vous devez choisir les règles d'une société sans savoir quelle place vous y occuperez : riche ou pauvre, en bonne santé ou malade, avec ou sans talents recherchés.",
    question: "Quel principe choisissez-vous ?",
    options: ["Rendre la richesse moyenne la plus élevée possible", "Garantir le meilleur sort possible aux plus défavorisés", "Laisser chacun conserver ce qu'il obtient sur le marché"],
    discussion: "Rawls soutient que des personnes raisonnables, derrière ce voile, choisiraient des libertés égales pour tous et n'accepteraient les inégalités que si elles profitent aux plus défavorisés (principe de différence). L'économiste John Harsanyi répondait qu'un choix rationnel sous incertitude maximise au contraire le bien-être moyen.",
    critique: "Pour l'esprit critique : se demander ce que l'on penserait d'une règle si l'on était à une autre place est un bon remède au biais d'autocomplaisance.",
    liens: [["#biais/autocomplaisance", "Biais d'autocomplaisance"]] },
  { id: "tramway", titre: "Le tramway", auteur: "Philippa Foot, 1967 ; Judith Jarvis Thomson",
    texte: "Un tramway sans freins fonce vers cinq personnes attachées sur la voie. Vous pouvez actionner un aiguillage : le tramway partira sur une autre voie, où il tuera une personne.",
    question: "Actionnez-vous l'aiguillage ?",
    options: ["Oui", "Non"],
    discussion: "La plupart des gens répondent oui. Mais si, pour arrêter le tramway, il fallait pousser une personne d'une passerelle sur la voie, la plupart refusent, alors que le bilan est le même : une mort contre cinq. Les philosophes cherchent ce qui distingue les deux cas : tuer ou laisser mourir, utiliser une personne comme moyen, intention et simple prévision.",
    critique: "Pour l'esprit critique : deux situations aux conséquences identiques peuvent susciter des jugements opposés. Repérer ce qui change vraiment entre elles est l'exercice même de l'analyse.",
    liens: [["#biais/omission", "Biais d'omission"]] },
  { id: "chambre", titre: "La chambre chinoise", auteur: "John Searle, 1980",
    texte: "Enfermé dans une pièce, vous recevez des questions écrites en chinois, langue que vous ignorez. Un énorme manuel vous indique quels caractères renvoyer en réponse. De l'extérieur, vos réponses sont parfaites : on vous croit chinois.",
    question: "Comprenez-vous le chinois ?",
    options: ["Oui : répondre parfaitement, c'est comprendre", "Non : manipuler des symboles n'est pas comprendre", "La pièce entière comprend, pas la personne"],
    discussion: "Searle voulait montrer qu'un programme informatique, si performant soit-il, manipule des symboles sans en saisir le sens. La « réponse du système » (c'est l'ensemble qui comprend) est l'objection la plus discutée. Le débat a pris une actualité nouvelle avec les modèles de langage.",
    critique: "Pour l'esprit critique : une réponse fluide et assurée n'est pas une preuve de compréhension, chez une machine comme chez un humain.",
    liens: [["#biais/autorite", "Soumission à l'autorité"]] },
  { id: "cuve", titre: "Le cerveau dans une cuve", auteur: "Hilary Putnam, 1981, d'après le « malin génie » de Descartes (1641)",
    texte: "Un savant a placé votre cerveau dans une cuve et le stimule pour lui donner exactement les sensations d'une vie normale.",
    question: "Pouvez-vous prouver que ce n'est pas le cas ?",
    options: ["Oui", "Non, mais il est raisonnable de ne pas y croire", "Non, et rien ne permet donc de croire quoi que ce soit"],
    discussion: "Descartes doutait de tout ce dont on peut douter, jusqu'à trouver une certitude : « Je pense, donc je suis. » Putnam soutient que l'hypothèse se réfute elle-même : un cerveau dans une cuve ne pourrait pas même former la pensée « je suis un cerveau dans une cuve », faute de lien avec de vraies cuves. D'autres répondent qu'il suffit que nos croyances soient raisonnables, sans être certaines.",
    critique: "Pour l'esprit critique : exiger la certitude absolue conduit à ne plus rien croire. Ce qui compte, c'est d'ajuster sa confiance aux preuves, ni plus ni moins.",
    liens: [["#chiffres/vrai-faux", "Atelier : vrai ou faux, avec confiance"]] }
];

// ===================== Les expériences =====================

const EXPERIENCES = [
  // ---------------------------------------------------------------
  {
    id: "crt",
    section: "raisonner",
    picto: "batte",
    couleur: "#2f6db5",
    duree: "1 min",
    titre: "Trois questions faciles",
    resume: "Le test de réflexion cognitive : des problèmes simples dont la première réponse qui vient à l'esprit est fausse. " + QUESTIONS_CRT.length + " questions, trois par partie.",
    lancer(zone) {
      zone.innerHTML = "";
      // Questions toutes affichées ensemble : le niveau s'ajuste d'une partie à l'autre. Le niveau 1 réunit
      // les trois questions originales (Frederick, 2005), le niveau 2 celles de Thomson et Oppenheimer (2016).
      const niveau = niveauAtelier("crt").niveau;
      zone.appendChild(choixNiveau("crt", () => EXPERIENCES.find(e => e.id === "crt").lancer(zone)));
      // Premier passage : les trois questions originales de Frederick, dans leur ordre
      const premiere = !resultatAtelier("crt") && !(lire("vus", {}).crt || []).length;
      const questions = (premiere ? QUESTIONS_CRT.slice(0, 3) : tirerSelonNiveau("crt", QUESTIONS_CRT, 3, niveau))
        .sort((a, b) => QUESTIONS_CRT.indexOf(a) - QUESTIONS_CRT.indexOf(b));
      if (premiere) { const vus = lire("vus", {}); vus.crt = questions.map(q => q.id); ecrire("vus", vus); }
      const justes = [];
      const zonesResultat = [];
      const champs = questions.map((q, i) => {
        const bloc = el("div", "question-test");
        bloc.appendChild(paragraphe((i + 1) + ". " + q.texte));
        const ligne = el("div", "ligne");
        const champ = el("input", "champ");
        if (!q.texteLibre) champ.inputMode = "decimal";
        champ.setAttribute("aria-label", "Votre réponse à la question " + (i + 1));
        ligne.append(champ, el("span", "source", q.unite));
        bloc.appendChild(ligne);
        const resultat = el("p", null);
        resultat.style.margin = "8px 0 0";
        resultat.hidden = true;
        bloc.appendChild(resultat);
        zonesResultat.push(resultat);
        zone.appendChild(bloc);
        return champ;
      });

      const valider = el("button", "bouton large", "Valider mes réponses");
      valider.dataset.valider = "1";
      zone.appendChild(valider);

      valider.addEventListener("click", () => {
        let bonnes = 0, intuitives = 0;
        questions.forEach((q, i) => {
          const verdict = corrigerCRT(q, champs[i].value);
          const resultat = zonesResultat[i];
          champs[i].disabled = true;
          resultat.hidden = false;
          resultat.className = verdict === "juste" ? "juste-texte" : "faux-texte";
          justes[i] = verdict === "juste";
          if (verdict === "juste") {
            bonnes++;
            resultat.textContent = typo("Juste. " + q.explication);
          } else {
            if (verdict === "intuitive") intuitives++;
            resultat.textContent = typo((verdict === "intuitive" ? "C'est la réponse intuitive, mais elle est fausse. " : "Réponse attendue : " + (q.texteLibre ? "Émilie" : q.juste + " " + q.unite) + ". ") + q.explication);
          }
          if (q.reussite) resultat.appendChild(el("span", "source bloc", "Dans l'étude de Thomson et Oppenheimer (2016), " + q.reussite + " % de bonnes réponses."));
        });
        valider.remove();
        noterPartieEntiere("crt", niveau, questions.map((q, i) => !!justes[i]));
        afficherScore(zone, "crt", bonnes, 3);
        if (intuitives) zone.appendChild(paragraphe("Dont " + pluriel(intuitives, "réponse intuitive", "réponses intuitives") + " : exactement l'erreur que la question tend."));
        ajouterExplication(zone, "Ce que montre ce test", [
          "Chaque question suggère immédiatement une réponse fausse. Répondre juste suppose de remarquer cette réponse, de s'en méfier et de vérifier : c'est le passage du système 1 au système 2.",
          "Shane Frederick (2005) a soumis les trois questions originales à environ 3 400 personnes : 17 % seulement ont répondu juste aux trois. Ces questions sont devenues célèbres : beaucoup de participants les connaissent déjà, d'où les nouvelles versions de Thomson et Oppenheimer (2016), moins dépendantes du calcul."
        ], [["#guide/systemes", "Deux modes de pensée (guide)"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "crt").lancer(zone), "Trois autres questions");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "wason",
    section: "raisonner",
    picto: "cartes",
    couleur: "#c2412d",
    duree: "2 min",
    titre: "Quatre cartes",
    resume: "La tâche de sélection de Wason : quelles cartes faut-il retourner pour vérifier une règle ? Abstraite, elle est presque toujours ratée.",
    lancer(zone) {
      zone.innerHTML = "";
      const abstraite = melanger(WASON_ABSTRAITES)[0]();
      const concrete = melanger(WASON_CONCRETES)[0];
      const resultats = [];

      function etape(config, numero, suite) {
        // Cartes dans le désordre : on retient la position de P et de non-Q
        const ordre = melanger([0, 1, 2, 3]);
        const bloc = el("div", "etape-wason");
        bloc.appendChild(el("p", "consigne", "Version " + numero + " sur 2"));
        bloc.appendChild(paragraphe(config.consigne));
        bloc.appendChild(paragraphe(config.regle, "encadre"));
        bloc.appendChild(paragraphe("Touchez les cartes qu'il faut retourner, et seulement celles-là.", "source"));
        const rangee = el("div", "cartes-wason" + (config.petites ? " petites" : ""));
        const choisies = new Set();
        const cartes = ordre.map(k => {
          const c = el("button", "carte-wason", config.cartes[k]);
          c.setAttribute("aria-pressed", "false");
          c.addEventListener("click", () => {
            if (choisies.has(k)) choisies.delete(k); else choisies.add(k);
            c.classList.toggle("choisie");
            c.setAttribute("aria-pressed", String(choisies.has(k)));
          });
          rangee.appendChild(c);
          return c;
        });
        bloc.appendChild(rangee);
        const valider = el("button", "bouton large", "Valider");
        valider.dataset.valider = "1";
        bloc.appendChild(valider);
        zone.appendChild(bloc);
        valider.addEventListener("click", () => {
          // Les bonnes cartes sont toujours la 1re (P) et la 4e (non-Q) de la liste d'origine
          const juste = choisies.size === 2 && choisies.has(0) && choisies.has(3);
          resultats.push(juste);
          cartes.forEach((c, i) => {
            c.disabled = true;
            if (ordre[i] === 0 || ordre[i] === 3) c.classList.add("attendue");
          });
          valider.remove();
          bloc.appendChild(el("p", juste ? "verdict juste" : "verdict faux", juste ? "Juste." : "Ce n'est pas la bonne sélection. Les cartes à retourner sont encadrées en vert."));
          bloc.appendChild(paragraphe(config.explication));
          suite();
        });
      }

      etape(abstraite, 1, () => {
        const b = boutonSuivant("Deuxième version", () => {
          b.remove();
          etape(concrete, 2, () => {
            afficherScore(zone, "wason", resultats.filter(Boolean).length, 2);
            ajouterExplication(zone, "Ce que montre cette expérience", [
              (resultats[0] ? "Vous avez réussi la version abstraite, ce qui est rare. " : "") + "Dans sa version abstraite, la tâche de Wason (1968) est réussie par moins de 10 % des participants. La plupart choisissent la voyelle et le nombre pair, ou la voyelle seule.",
              "Dans un contexte familier, en particulier quand il s'agit de repérer une infraction, une nette majorité réussit (Griggs et Cox, 1982). Notre logique dépend fortement du contenu.",
              "La bonne stratégie est celle du modus tollens : pour tester « si P, alors Q », examiner les cas P et les cas non-Q. Chercher à confirmer (retourner Q) ne prouve rien."
            ], [["#biais/confirmation", "Biais de confirmation"], ["#sophismes/affirmation-consequent", "Affirmation du conséquent"]]);
            boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "wason").lancer(zone), "Deux nouvelles versions");
          });
        });
        zone.appendChild(b);
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "regle-246",
    section: "raisonner",
    picto: "suite",
    couleur: "#1f8a70",
    duree: "3 min",
    titre: "Trouver la règle",
    resume: "La suite 2, 4, 6 respecte une règle cachée. Proposez des suites pour la découvrir. La règle change à chaque partie.",
    lancer(zone) {
      zone.innerHTML = "";
      // Première partie : la règle de Wason (1960) ; ensuite, une règle tirée au hasard
      const regle = resultatAtelier("regle-246") ? melanger(REGLES_246)[0] : REGLES_246[0];
      const essais = [];

      zone.appendChild(paragraphe("J'ai en tête une règle qui s'applique à des suites de trois nombres. La suite 2, 4, 6 la respecte."));
      zone.appendChild(paragraphe("Proposez autant de suites que vous voulez : je vous dirai si chacune respecte la règle. Quand vous pensez avoir trouvé, écrivez votre hypothèse, puis demandez la réponse.", "source"));

      const ligne = el("div", "ligne");
      const champs = [0, 1, 2].map(k => {
        const c = el("input", "champ");
        c.inputMode = "decimal";
        c.style.width = "4.5em";
        c.setAttribute("aria-label", "Nombre " + (k + 1));
        ligne.appendChild(c);
        return c;
      });
      const tester = el("button", "bouton", "Tester");
      tester.dataset.valider = "1";
      ligne.appendChild(tester);
      zone.appendChild(ligne);

      const journal = el("ul", "journal");
      zone.appendChild(journal);

      const hypothese = el("input", "recherche");
      hypothese.placeholder = "Ma règle : …";
      hypothese.setAttribute("aria-label", "Votre hypothèse");
      hypothese.style.marginTop = "6px";
      zone.appendChild(hypothese);

      const reveler = el("button", "bouton secondaire large", "Révéler la règle");
      zone.appendChild(reveler);

      tester.addEventListener("click", () => {
        const v = champs.map(c => lireNombre(c.value));
        if (v.some(isNaN)) { champs.find(c => isNaN(lireNombre(c.value))).focus(); return; }
        const ok = regle.test(v[0], v[1], v[2]);
        essais.push(ok);
        const li = el("li", ok ? "juste-texte" : "faux-texte", v.map(fr).join(", ") + " — " + (ok ? "oui, respecte la règle" : "non, ne respecte pas la règle"));
        journal.appendChild(li);
        champs.forEach(c => { c.value = ""; });
        champs[0].focus();
      });

      reveler.addEventListener("click", () => {
        reveler.remove();
        tester.disabled = true;
        hypothese.disabled = true;
        champs.forEach(c => { c.disabled = true; });
        noterPartie("regle-246");
        const negatifs = essais.filter(ok => !ok).length;
        zone.appendChild(el("p", "verdict", "La règle était : " + regle.texte + "."));
        if (hypothese.value.trim()) zone.appendChild(paragraphe("Votre hypothèse : « " + hypothese.value.trim() + " »."));
        zone.appendChild(paragraphe("Vous avez proposé " + pluriel(essais.length, "suite") + ", dont " + negatifs + " qui ne respectai" + (negatifs > 1 ? "ent" : "t") + " pas la règle."));
        ajouterExplication(zone, "Ce que montre cette expérience", [
          negatifs === 0 && essais.length > 0
            ? "Toutes vos suites respectaient la règle : chacune a confirmé votre hypothèse sans jamais pouvoir la mettre en défaut. C'est la stratégie la plus courante."
            : "Proposer des suites qui ne respectent pas la règle est la seule façon de tester les limites d'une hypothèse. Peu de participants le font spontanément.",
          "Peter Wason (1960) : la plupart des participants proposent des suites comme 8, 10, 12 ou 20, 22, 24, qui confirment l'hypothèse « nombres pairs croissant de 2 ». Ils annoncent cette règle avec assurance ; environ un sur cinq seulement trouve la bonne (« trois nombres croissants ») au premier essai.",
          "Une hypothèse se teste en cherchant ce qui pourrait la réfuter (Karl Popper). Les " + REGLES_246.length + " règles possibles de cet atelier sont toutes compatibles avec 2, 4, 6."
        ], [["#biais/confirmation", "Biais de confirmation"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "regle-246").lancer(zone), "Une nouvelle règle");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "monty-hall",
    section: "raisonner",
    picto: "portes",
    couleur: "#c0601b",
    duree: "2 min",
    titre: "Le problème de Monty Hall",
    resume: "Trois portes, une voiture, deux chèvres. Faut-il changer de porte ? Jouez, puis essayez la version à dix portes.",
    lancer(zone) {
      zone.innerHTML = "";
      const stats = lire("montyHall", { 3: { garder: [0, 0], changer: [0, 0] }, 10: { garder: [0, 0], changer: [0, 0] } });
      let nbPortes = 3;
      let partie;
      const choixVersion = el("div", "segment segment-petit");
      const message = paragraphe("");
      const portes = el("div", "portes");
      const actions = el("div", "actions");
      const tableau = el("table", "tableau");
      zone.appendChild(paragraphe("Derrière l'une des portes se trouve une voiture, derrière les autres une chèvre. Choisissez une porte. Le présentateur, qui sait où est la voiture, ouvrira alors toutes les autres portes sauf une, en ne montrant que des chèvres, et vous proposera de changer."));
      zone.append(choixVersion, portes, message, actions, tableau);

      [3, 10].forEach(n => {
        const a = el("a", null, n + " portes");
        a.href = "#tests/monty-hall";
        a.addEventListener("click", e => { e.preventDefault(); nbPortes = n; nouvellePartie(); });
        choixVersion.appendChild(a);
      });

      function nouvellePartie() {
        partie = { voiture: Math.floor(Math.random() * nbPortes), choix: null, restante: null, fini: false };
        message.textContent = typo("Choisissez une porte.");
        [...choixVersion.children].forEach(a => a.classList.toggle("actif", a.textContent.startsWith(String(nbPortes))));
        dessiner();
      }

      function dessiner() {
        portes.innerHTML = "";
        portes.className = "portes" + (nbPortes > 3 ? " nombreuses" : "");
        actions.innerHTML = "";
        for (let i = 0; i < nbPortes; i++) {
          let texte = String(i + 1);
          let classe = "porte";
          const ouverte = partie.choix !== null && i !== partie.choix && i !== partie.restante;
          if (i === partie.choix) classe += " choisie";
          if (ouverte || (partie.fini && i !== partie.voiture)) { texte = "Chèvre"; classe += " ouverte"; }
          if (partie.fini && i === partie.voiture) { texte = "Voiture"; classe += " voiture"; }
          const b = el("button", classe, texte);
          b.setAttribute("aria-label", "Porte " + (i + 1) + (texte !== String(i + 1) ? " : " + texte : ""));
          b.disabled = partie.choix !== null;
          b.addEventListener("click", () => choisir(i));
          portes.appendChild(b);
        }
        if (partie.choix !== null && !partie.fini) {
          const garder = el("button", "bouton secondaire", "Garder la porte " + (partie.choix + 1));
          const changer = el("button", "bouton", "Prendre la porte " + (partie.restante + 1));
          garder.addEventListener("click", () => terminer(false));
          changer.addEventListener("click", () => terminer(true));
          actions.append(garder, changer);
        }
        if (partie.fini) {
          const rejouer = el("button", "bouton", "Rejouer");
          rejouer.dataset.suivant = "1";
          rejouer.addEventListener("click", nouvellePartie);
          const simuler = el("button", "bouton secondaire", "Simuler 1 000 parties");
          simuler.addEventListener("click", simulation);
          actions.append(rejouer, simuler);
        }
        tableau.innerHTML = "";
        const s = stats[nbPortes];
        if (s.garder[1] + s.changer[1] > 0) {
          const entete = el("tr");
          entete.append(el("th", null, "Vos parties à " + nbPortes + " portes"), el("th", null, "Gagnées"));
          tableau.appendChild(entete);
          [["En gardant", s.garder], ["En changeant", s.changer]].forEach(([libelle, [g, n]]) => {
            const tr = el("tr");
            tr.append(el("td", null, libelle), el("td", null, n ? g + " / " + n + " (" + Math.round(100 * g / n) + " %)" : "—"));
            tableau.appendChild(tr);
          });
        }
      }

      function choisir(i) {
        partie.choix = i;
        // Le présentateur garde fermée la porte de la voiture, ou une porte au hasard si le joueur l'a trouvée
        const autres = [...Array(nbPortes).keys()].filter(p => p !== i);
        partie.restante = i === partie.voiture ? autres[Math.floor(Math.random() * autres.length)] : partie.voiture;
        message.textContent = typo(nbPortes === 3
          ? "Le présentateur ouvre une autre porte : une chèvre. Gardez-vous votre porte ou prenez-vous la porte " + (partie.restante + 1) + " ?"
          : "Le présentateur ouvre " + (nbPortes - 2) + " portes : que des chèvres. Gardez-vous votre porte ou prenez-vous la porte " + (partie.restante + 1) + " ?");
        dessiner();
      }

      function terminer(change) {
        if (change) partie.choix = partie.restante;
        partie.fini = true;
        const gagne = partie.choix === partie.voiture;
        const s = stats[nbPortes][change ? "changer" : "garder"];
        s[1]++;
        if (gagne) s[0]++;
        ecrire("montyHall", stats);
        noterPartie("monty-hall");
        message.textContent = typo((gagne ? "Gagné : la voiture était derrière la porte " : "Perdu : la voiture était derrière la porte ") + (partie.voiture + 1) + ".");
        dessiner();
        if (!zone.querySelector(".explication-monty")) expliquer();
      }

      function simulation() {
        let gardeGagne = 0;
        for (let k = 0; k < 1000; k++) if (Math.floor(Math.random() * nbPortes) === Math.floor(Math.random() * nbPortes)) gardeGagne++;
        message.textContent = typo("Sur 1 000 parties simulées à " + nbPortes + " portes : en gardant, " + fr(gardeGagne) + " voitures (" + fr(gardeGagne / 10) + " %) ; en changeant, " + fr(1000 - gardeGagne) + " (" + fr((1000 - gardeGagne) / 10) + " %).");
      }

      function expliquer() {
        const bloc = el("div", "explication-monty");
        zone.appendChild(bloc);
        ajouterExplication(bloc, "Explication", [
          "Il faut changer : on gagne alors 2 fois sur 3. Le premier choix a 1 chance sur 3 d'être le bon, et l'ouverture des portes par le présentateur ne change pas cette probabilité, puisqu'il sait où est la voiture et ne montre que des chèvres. Les 2/3 restants se reportent sur l'autre porte fermée.",
          "La version à dix portes rend l'intuition évidente : votre premier choix a 1 chance sur 10 d'être le bon. Quand le présentateur ouvre huit portes en évitant soigneusement l'une d'elles, c'est celle-là qui cache la voiture, 9 fois sur 10.",
          "En 1990, Marilyn vos Savant publie la bonne réponse dans le magazine Parade. Elle reçoit environ 10 000 lettres affirmant qu'elle se trompe, dont près de 1 000 signées par des titulaires d'un doctorat."
        ], [["#biais/erreur-du-joueur", "Erreur du joueur"], ["#biais/taux-de-base", "Négligence du taux de base"]]);
        const total = k => stats[3][k][1] + stats[10][k][1], gagnes = k => stats[3][k][0] + stats[10][k][0];
        bloc.appendChild(calculEnDetail([
          "Vous choisissez la porte 1 ; le présentateur ouvre la porte 3, qui cache une chèvre. Notons V1, V2, V3 « la voiture est derrière la porte 1, 2, 3 », chacune de probabilité 1/3 au départ.",
          "S'il est derrière la porte 1, le présentateur ouvre la 2 ou la 3 au hasard ; si la voiture est derrière la 2, il est obligé d'ouvrir la 3 ; si elle est derrière la 3, il ne l'ouvre jamais :",
          "= P(ouvre 3 | V1) = 1/2 ; P(ouvre 3 | V2) = 1 ; P(ouvre 3 | V3) = 0",
          "= P(V2 | ouvre 3) = (1 × 1/3) / (1/2 × 1/3 + 1 × 1/3 + 0 × 1/3) = (1/3) / (1/2) = 2/3",
          "Garder gagne donc 1 fois sur 3, changer 2 fois sur 3. Avec dix portes, le présentateur ouvre huit portes en évitant la voiture : garder gagne 1 fois sur 10, changer 9 fois sur 10.",
          (total("changer") + total("garder"))
            ? "Vos parties : en changeant, " + gagnes("changer") + " victoires sur " + total("changer") + " ; en gardant, " + gagnes("garder") + " sur " + total("garder") + ". Sur peu de parties, le hasard peut masquer l'écart."
            : "Jouez quelques parties : vos propres résultats s'afficheront ici."
        ]));
      }

      nouvellePartie();
    }
  },

  // ---------------------------------------------------------------
  {
    id: "classiques",
    section: "raisonner",
    picto: "livre",
    couleur: "#8a3f8f",
    duree: "4 min",
    titre: "Problèmes classiques",
    resume: "Linda, les deux maternités, le taxi, l'urne d'Ellsberg, Sally Clark… " + PROBLEMES.length + " problèmes célèbres, cinq par partie, avec les résultats des études originales.",
    lancer(zone) {
      deroulerNiveaux(zone, {
        id: "classiques", n: 5, libelle: "Problème", relancer: () => EXPERIENCES.find(e => e.id === "classiques").lancer(zone),
        tirer: niveau => tirerSelonNiveau("classiques", PROBLEMES, 1, niveau)[0],
        estJuste: r => r !== false   // null : problème de préférence, sans réponse fausse
      }, (p, zone, fini) => {
        zone.appendChild(el("p", "consigne", p.titre));
        zone.appendChild(el("p", "cas", p.enonce));
        const conclure = (juste, retour, verdictTexte) => {
          retour.insertBefore(el("p", "verdict " + (juste === null ? "" : juste ? "juste" : "faux"), verdictTexte), retour.firstChild);
          retour.appendChild(paragraphe(p.explication));
          retour.appendChild(paragraphe(p.resultat, "source"));
          if (p.simulation === "maternites") retour.appendChild(simulationMaternites());
          if (p.liens) {
            const l = el("div", "voir-aussi");
            p.liens.forEach(([a, t]) => l.appendChild(lienVers(a, t)));
            retour.appendChild(l);
          }
          zone.appendChild(retour);
          fini(juste, retour);
        };

        if (p.type === "choix") {
          const boutons = p.options.map((texte, k) => {
            const b = boutonChoix(texte, k);
            b.addEventListener("click", () => {
              boutons.forEach(x => { x.disabled = true; });
              boutons[p.juste].classList.add("juste");
              if (k !== p.juste) b.classList.add("faux");
              conclure(k === p.juste, el("div", "retour-quiz"), k === p.juste ? "Juste." : "Réponse : " + p.options[p.juste]);
            });
            zone.appendChild(b);
            return b;
          });
        } else if (p.type === "nombre") {
          const ligne = el("div", "ligne");
          const champ = el("input", "champ");
          champ.inputMode = "decimal";
          champ.setAttribute("aria-label", "Votre réponse");
          const ok = el("button", "bouton", "Valider");
          ok.dataset.valider = "1";
          ligne.append(champ, el("span", "source", p.unite), ok);
          zone.appendChild(ligne);
          ok.addEventListener("click", () => {
            const v = lireNombre(champ.value);
            if (isNaN(v)) { champ.focus(); return; }
            champ.disabled = true;
            ok.remove();
            const juste = Math.abs(v - p.reponse) <= p.tolerance;
            conclure(juste, el("div", "retour-quiz"), (juste ? "Juste : " : "Réponse : ") + "environ " + fr(p.reponse) + " " + p.unite + ".");
          });
        } else {
          // Deux choix successifs : on vérifie leur cohérence
          let premier;
          const boutons = p.options.map((texte, k) => {
            const b = boutonChoix(texte, k);
            b.addEventListener("click", () => {
              premier = k;
              boutons.forEach(x => { x.disabled = true; });
              b.classList.add("choisi");
              second();
            });
            zone.appendChild(b);
            return b;
          });
          function second() {
            zone.appendChild(el("p", "cas second-enonce", p.enonce2));
            const boutons2 = p.options2.map((texte, k) => {
              const b = boutonChoix(texte, k);
              b.addEventListener("click", () => {
                boutons2.forEach(x => { x.disabled = true; });
                b.classList.add("choisi");
                const coherent = p.coherent(premier, k);
                conclure(coherent, el("div", "retour-quiz"), coherent
                  ? "Vos deux choix sont cohérents entre eux."
                  : "Vos deux choix se contredisent : « " + p.options[premier] + " » puis « " + p.options2[k] + " ». C'est le choix le plus fréquent.");
              });
              zone.appendChild(b);
              return b;
            });
          }
        }
      }, resultats => {
        const bonnes = resultats.filter(r => r === true).length;
        afficherScore(zone, "classiques", bonnes, resultats.length);
        ajouterExplication(zone, "À retenir", [
          "Ces problèmes ont fondé l'étude des biais de jugement. Leur point commun : une réponse intuitive, appuyée sur la ressemblance, la formulation ou la certitude, l'emporte sur le calcul.",
          "Les problèmes que vous n'avez pas encore vus passent en priorité : " + PROBLEMES.length + " en tout."
        ], [["#biais", "Toutes les fiches de biais"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "classiques").lancer(zone), "Cinq autres problèmes");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "depistage",
    section: "raisonner",
    picto: "arbre",
    couleur: "#a77a12",
    duree: "3 min",
    titre: "Tests positifs",
    resume: "Un test positif signifie-t-il qu'on est malade ? Quatre situations, réelles ou tirées au hasard, à résoudre en fréquences naturelles.",
    lancer(zone) {
      const reels = tirerNouveaux("depistage", SCENARIOS_DEPISTAGE, 1);
      const scenarios = [...reels, scenarioAuHasard(), scenarioAuHasard(), scenarioAuHasard()];
      derouler(zone, scenarios, (s, zone, fini) => {
        zone.appendChild(el("p", "cas", s.contexte));
        zone.appendChild(paragraphe(s.question));
        const ligne = el("div", "ligne");
        const champ = el("input", "champ");
        champ.inputMode = "decimal";
        champ.setAttribute("aria-label", "Probabilité, en pourcentage");
        const ok = el("button", "bouton", "Valider");
        ok.dataset.valider = "1";
        ligne.append(champ, el("span", "source", "%"), ok);
        zone.appendChild(ligne);
        ok.addEventListener("click", () => {
          const v = lireNombre(champ.value);
          if (isNaN(v) || v < 0 || v > 100) { champ.focus(); return; }
          champ.disabled = true;
          ok.remove();
          const c = comptesDepistage(s);
          const vrai = 100 * c.vraisPositifs / (c.vraisPositifs + c.fauxPositifs);
          const juste = Math.abs(v - vrai) <= Math.max(3, vrai * 0.2);
          const retour = el("div", "retour-quiz");
          retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), (juste ? "Juste : " : "Réponse : ") + "environ " + fr(vrai < 10 ? Number(vrai.toFixed(1)) : Math.round(vrai)) + " %."));
          retour.appendChild(arbreFrequences(s, c));
          // Accord au singulier quand il n'y a qu'une personne (« 1 malade », « 1 femme ayant un cancer »)
          const accord = (n, nom) => n > 1 ? nom : nom.split(" ").map(m => m !== "sans" && m.endsWith("s") ? m.slice(0, -1) : m).join(" ");
          retour.appendChild(paragraphe("Sur " + fr(s.population) + " personnes : " + fr(c.malades) + " " + accord(c.malades, s.noms[0]) + ", dont " + fr(c.vraisPositifs) + " avec un résultat positif ; " + fr(c.sains) + " " + accord(c.sains, s.noms[1]) + ", dont " + fr(c.fauxPositifs) + " avec un résultat positif quand même. Sur " + fr(c.vraisPositifs + c.fauxPositifs) + " résultats positifs, " + fr(c.vraisPositifs) + " seulement " + (c.vraisPositifs > 1 ? "correspondent" : "correspond") + " à un vrai cas."));
          if (s.resultat) retour.appendChild(paragraphe(s.resultat, "source"));
          const pc = x => fr(Number((100 * x).toPrecision(3))) + " %";
          const pPositif = s.sensibilite * s.prevalence + s.fauxPositifs * (1 - s.prevalence);
          retour.appendChild(calculEnDetail([
            "La formule de Bayes donne la probabilité d'un vrai cas sachant que le résultat est positif :",
            "= P(cas | positif) = P(positif | cas) × P(cas) / P(positif)",
            "Ici : P(cas) = " + pc(s.prevalence) + " ; P(positif | cas) = " + pc(s.sensibilite) + " ; P(positif | pas un cas) = " + pc(s.fauxPositifs) + ".",
            "= P(positif) = " + pc(s.sensibilite) + " × " + pc(s.prevalence) + " + " + pc(s.fauxPositifs) + " × " + pc(1 - s.prevalence) + " = " + pc(pPositif),
            "= P(cas | positif) = " + pc(s.sensibilite * s.prevalence) + " / " + pc(pPositif) + " = " + pc(s.sensibilite * s.prevalence / pPositif),
            "L'arbre fait le même calcul avec des effectifs : " + fr(c.vraisPositifs) + " / (" + fr(c.vraisPositifs) + " + " + fr(c.fauxPositifs) + "), à l'arrondi près. Le dénominateur compte tous les résultats positifs, vrais et faux : c'est là que le taux de base pèse."
          ]));
          zone.appendChild(retour);
          fini(juste, retour);
        });
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "depistage", bonnes, resultats.length);
        ajouterExplication(zone, "La méthode des fréquences naturelles", [
          "Plutôt que de manipuler des pourcentages, imaginez un nombre de personnes (1 000 ou 10 000) et suivez-les dans l'arbre : combien sont concernées, combien sont détectées, combien sont signalées à tort. La réponse se lit alors directement.",
          "Quand la situation recherchée est rare, même un très bon test produit plus de fausses alertes que de vrais cas. Quand elle est fréquente, un résultat positif devient beaucoup plus fiable : le taux de base change tout.",
          "Gigerenzer et Hoffrage (1995) ont montré que présenter les données en fréquences naturelles plutôt qu'en probabilités améliore nettement les réponses."
        ], [["#biais/taux-de-base", "Négligence du taux de base"], ["#biais/procureur", "Sophisme du procureur"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "depistage").lancer(zone));
      }, "Situation");
    }
  },

  // ---------------------------------------------------------------
  {
    id: "anniversaires",
    section: "raisonner",
    picto: "calendrier",
    couleur: "#0e7c86",
    duree: "2 min",
    titre: "Le paradoxe des anniversaires",
    resume: "Combien de personnes faut-il réunir pour que deux d'entre elles aient probablement le même anniversaire ? Devinez, puis simulez.",
    lancer(zone) {
      zone.innerHTML = "";
      zone.appendChild(el("p", "cas", "Combien de personnes faut-il réunir pour avoir plus d'une chance sur deux que deux d'entre elles aient le même anniversaire (jour et mois) ?"));
      const ligne = el("div", "ligne");
      const champ = el("input", "champ");
      champ.inputMode = "numeric";
      champ.setAttribute("aria-label", "Nombre de personnes");
      const ok = el("button", "bouton", "Valider");
      ok.dataset.valider = "1";
      ligne.append(champ, el("span", "source", "personnes"), ok);
      zone.appendChild(ligne);
      ok.addEventListener("click", () => {
        const v = Math.round(lireNombre(champ.value));
        if (isNaN(v) || v < 2) { champ.focus(); return; }
        champ.disabled = true;
        ok.remove();
        noterPartie("anniversaires");
        const retour = el("div", "retour-quiz");
        retour.appendChild(el("p", "verdict " + (Math.abs(v - 23) <= 2 ? "juste" : "faux"), "Il suffit de 23 personnes : " + fr(Number((100 * probaAnniversaire(23)).toFixed(1))) + " %."));
        retour.appendChild(paragraphe("Avec " + v + " personnes, la probabilité est de " + fr(Number((100 * probaAnniversaire(Math.min(v, 366))).toFixed(1))) + " %. Avec 57 personnes, elle dépasse 99 %."));
        retour.appendChild(courbeAnniversaires(v));
        retour.appendChild(paragraphe("L'intuition pense à « quelqu'un qui a le même anniversaire que moi » : pour cela, il faudrait 253 personnes. Mais n'importe quelle paire convient, et 23 personnes forment 253 paires.", "source"));
        const sansPaire = n => 1 - probaAnniversaire(n);
        const n = Math.min(v, 366);
        const pc = x => fr(Number((100 * x).toFixed(1))) + " %";
        retour.appendChild(calculEnDetail([
          "On calcule d'abord la probabilité que tous les anniversaires soient différents : la deuxième personne doit éviter 1 date, la troisième 2 dates, et ainsi de suite.",
          "= P(tous différents) = 365/365 × 364/365 × 363/365 × … × (365 − n + 1)/365",
          "La probabilité d'au moins un anniversaire commun en est le complément : 1 − P(tous différents).",
          "= Avec " + n + " personnes : 1 − " + fr(Number(sansPaire(n).toFixed(3))) + " = " + pc(probaAnniversaire(n)),
          "= Avec 22 personnes : 1 − " + fr(Number(sansPaire(22).toFixed(3))) + " = " + pc(probaAnniversaire(22)) + " ; avec 23 : 1 − " + fr(Number(sansPaire(23).toFixed(3))) + " = " + pc(probaAnniversaire(23)),
          "23 est donc le plus petit groupe où la probabilité dépasse une chance sur deux. Chaque facteur est proche de 1, mais il y en a autant que de personnes, et 23 personnes forment 23 × 22 / 2 = 253 paires.",
          "On suppose les 365 jours équiprobables et l'on ignore le 29 février ; les naissances réelles, un peu inégales selon les jours, rendent les coïncidences très légèrement plus probables."
        ]));
        zone.appendChild(retour);
        zone.appendChild(simulationAnniversaires());
        ajouterExplication(zone, "Ce que montre cet atelier", [
          "Les coïncidences sont bien plus fréquentes qu'on ne le croit, parce que le nombre de façons de coïncider croît très vite : c'est la combinatoire qui surprend, pas le hasard.",
          "Le même raisonnement explique pourquoi des événements « incroyables » arrivent régulièrement à quelqu'un quelque part : avec assez de personnes et d'occasions, l'improbable devient presque certain. Ce problème est souvent attribué au mathématicien Richard von Mises (1939)."
        ], [["#biais/apophenie", "Apophénie"], ["#sophismes/tireur-elite", "Sophisme du tireur d'élite"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "anniversaires").lancer(zone), "Recommencer");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "citations",
    section: "philosopher",
    picto: "citation",
    couleur: "#7a5c2e",
    duree: "3 min",
    titre: "Qui l'a vraiment dit ?",
    resume: "Voltaire, Einstein, Gandhi, Machiavel… Huit citations célèbres par partie : authentiques, déformées ou inventées ? " + CITATIONS.length + " citations vérifiées.",
    lancer(zone) {
      const statuts = [["authentique", "Authentique : bien de cet auteur"], ["deformee", "Déformée : l'original est différent"], ["apocryphe", "Inventée ou mal attribuée"]];
      const verdicts = { authentique: "Authentique.", deformee: "Déformée.", apocryphe: "Inventée ou mal attribuée." };
      deroulerNiveaux(zone, {
        id: "citations", n: 8, libelle: "Citation", relancer: () => EXPERIENCES.find(e => e.id === "citations").lancer(zone),
        tirer: niveau => tirerSelonNiveau("citations", CITATIONS, 1, niveau)[0]
      }, (c, zone, fini) => {
        zone.appendChild(el("blockquote", "citation", "« " + c.texte + " »"));
        zone.appendChild(el("p", "auteur-citation", "— attribuée à " + c.auteur));
        zone.appendChild(el("p", "consigne", "Cette citation est-elle…"));
        const boutons = statuts.map(([statut, libelle], k) => {
          const b = boutonChoix(libelle, k);
          b.addEventListener("click", () => {
            boutons.forEach(x => { x.disabled = true; });
            const bon = statuts.findIndex(([st]) => st === c.statut);
            boutons[bon].classList.add("juste");
            if (k !== bon) b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (k === bon ? "juste" : "faux"), (k === bon ? "Juste : " : "Non : ") + verdicts[c.statut].charAt(0).toLowerCase() + verdicts[c.statut].slice(1)));
            retour.appendChild(paragraphe(c.explication));
            zone.appendChild(retour);
            fini(k === bon, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        const bonnes = resultats.filter(Boolean).length;
        afficherScore(zone, "citations", bonnes, resultats.length);
        ajouterExplication(zone, "Pourquoi tant de fausses citations ?", [
          "Une phrase circule d'autant mieux qu'elle est signée d'un grand nom : on prête à Einstein, Gandhi, Churchill, Voltaire ou Twain des centaines de mots qu'ils n'ont jamais prononcés. C'est l'argument d'autorité à l'état pur : la signature fait la valeur de la phrase.",
          "Les citations authentiques, elles, sont souvent coupées de leur contexte, ce qui en change le sens.",
          "Avant de citer : chercher l'œuvre, la date et le contexte ; se méfier des phrases trop bien tournées et des auteurs « aimants » ; consulter des sites spécialisés comme Wikiquote ou Quote Investigator, qui recherchent la première trace écrite."
        ], [["#sophismes/autorite", "Argument d'autorité"], ["#sophismes/hors-contexte", "Citation hors contexte"], ["#biais/faux-souvenirs", "Faux souvenirs"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "citations").lancer(zone), "Huit autres citations");
      });
    }
  },

  // ---------------------------------------------------------------
  {
    id: "pensee",
    section: "philosopher",
    picto: "pensee",
    couleur: "#44546a",
    duree: "5 min",
    titre: "Expériences de pensée",
    resume: "Le poulet de Russell, le navire de Thésée, la chambre chinoise… Quatre énigmes philosophiques par partie : votre réponse, puis celles des philosophes.",
    lancer(zone) {
      derouler(zone, tirerNouveaux("pensee", EXPERIENCES_PENSEE, 4), (x, zone, fini) => {
        zone.appendChild(el("p", "consigne", x.titre));
        zone.appendChild(el("p", "auteur-pensee", x.auteur));
        zone.appendChild(el("p", "cas", x.texte));
        zone.appendChild(el("p", "question-pensee", x.question));
        const boutons = x.options.map((texte, k) => {
          const b = boutonChoix(texte, k);
          b.addEventListener("click", () => {
            boutons.forEach(y => { y.disabled = true; });
            b.classList.add("choisi");
            const reponses = lire("reponsesPensee", {});
            reponses[x.id] = k;
            ecrire("reponsesPensee", reponses);
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict", "Votre réponse : « " + texte + " »."));
            retour.appendChild(paragraphe(x.discussion));
            retour.appendChild(paragraphe(x.critique, "encadre"));
            const l = el("div", "voir-aussi");
            l.style.marginTop = "10px";
            x.liens.forEach(([a, t]) => l.appendChild(lienVers(a, t)));
            retour.appendChild(l);
            zone.appendChild(retour);
            fini(true, retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, () => {
        noterPartie("pensee");
        const vues = Object.keys(lire("reponsesPensee", {})).length;
        zone.appendChild(el("p", "consigne", "Fin de la série"));
        zone.appendChild(paragraphe("Vous avez réfléchi à " + vues + " expérience" + (vues > 1 ? "s" : "") + " de pensée sur " + EXPERIENCES_PENSEE.length + "."));
        ajouterExplication(zone, "À quoi servent les expériences de pensée ?", [
          "Elles isolent une question en imaginant une situation simple, souvent irréalisable, où un seul facteur varie. Galilée, Einstein ou Darwin s'en sont servis autant que les philosophes.",
          "Elles ont leurs limites : nos intuitions sur des cas extrêmes et inhabituels peuvent être peu fiables, et changer avec la formulation. Les philosophes discutent donc aussi de la valeur de ces intuitions.",
          "Le guide présente quelques outils de la philosophie utiles au quotidien : rasoir d'Ockham, charge de la preuve, réfutabilité."
        ], [["#guide/philosophie", "Outils philosophiques (guide)"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "pensee").lancer(zone), "Quatre autres expériences");
      }, "Expérience");
    }
  }
];

// ===================== Outils des expériences =====================

// Corrige une réponse au test de réflexion : « juste », « intuitive » ou « fausse »
function corrigerCRT(q, saisie) {
  const texte = normaliser(String(saisie).trim());
  if (q.texteLibre) {
    if (texte.includes(q.juste)) return "juste";
    if (texte.includes(q.intuitive)) return "intuitive";
    return "fausse";
  }
  let v = lireNombre(saisie);
  if (isNaN(v) && q.mots) {
    const trouve = Object.entries(q.mots).find(([, mots]) => mots.some(m => texte.split(/[^a-z0-9]+/).includes(m)));
    if (trouve) v = Number(trouve[0]);
  }
  if (q.euros && v > 0 && v < 1) v = Math.round(v * 100);   // réponse donnée en euros
  if (v === q.juste) return "juste";
  if (v === q.intuitive) return "intuitive";
  return "fausse";
}

// Simulation d'une année dans les deux maternités
function simulationMaternites() {
  const bloc = el("div", "simulation");
  const bouton = el("button", "bouton secondaire", "Simuler une année");
  const sortie = el("div");
  bouton.addEventListener("click", () => {
    const jours = n => {
      let compte = 0;
      for (let j = 0; j < 365; j++) {
        let garcons = 0;
        for (let k = 0; k < n; k++) if (Math.random() < 0.5) garcons++;
        if (garcons > 0.6 * n) compte++;
      }
      return compte;
    };
    const grande = jours(45), petite = jours(15);
    sortie.innerHTML = "";
    barresComparees(sortie, [
      { nom: "Petite maternité (15 naissances par jour)", valeur: petite, texte: petite + " jours", forte: true },
      { nom: "Grande maternité (45 naissances par jour)", valeur: grande, texte: grande + " jours" }
    ]);
    bouton.textContent = "Simuler une autre année";
  });
  bloc.append(bouton, sortie);
  return bloc;
}

// Scénario de dépistage tiré au hasard, dans un contexte varié (chiffres fictifs)
function scenarioAuHasard() {
  const contextes = [
    { texte: (p, s, f) => "Une maladie fictive touche " + p + " des personnes testées. Le test est positif chez " + s + " des malades, et à tort chez " + f + " des personnes en bonne santé. Une personne est testée positive.",
      question: "Quelle est la probabilité qu'elle soit malade ?", noms: ["malades", "bien portants"], courts: ["malades", "bien portants"], prevalences: [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2] },
    { texte: (p, s, f) => "Un logiciel de reconnaissance faciale surveille une gare. Parmi les voyageurs, " + p + " sont des personnes recherchées. Il donne l'alerte pour " + s + " des personnes recherchées, et par erreur pour " + f + " des autres voyageurs. Une alerte se déclenche.",
      question: "Quelle est la probabilité que la personne soit vraiment recherchée ?", noms: ["personnes recherchées", "autres voyageurs"], courts: ["recherchées", "autres voyageurs"], prevalences: [0.0005, 0.001, 0.002] },
    { texte: (p, s, f) => "Dans une messagerie, " + p + " des courriels reçus sont des spams. Le filtre repère " + s + " des spams, et classe à tort " + f + " des courriels légitimes comme spams. Un courriel est classé comme spam.",
      question: "Quelle est la probabilité que ce soit vraiment un spam ?", noms: ["spams", "courriels légitimes"], courts: ["spams", "légitimes"], prevalences: [0.3, 0.5, 0.6] },
    { texte: (p, s, f) => "Dans une banque, " + p + " des paiements par carte sont frauduleux. Le système d'alerte signale " + s + " des fraudes, et à tort " + f + " des paiements honnêtes. Un paiement est signalé.",
      question: "Quelle est la probabilité qu'il soit frauduleux ?", noms: ["paiements frauduleux", "paiements honnêtes"], courts: ["fraudes", "honnêtes"], prevalences: [0.001, 0.002, 0.005] }
  ];
  const c = melanger(contextes)[0];
  const prevalence = melanger(c.prevalences)[0];
  const sensibilite = melanger([0.8, 0.9, 0.95, 0.99])[0];
  const fauxPositifs = melanger([0.01, 0.02, 0.05, 0.1])[0];
  const population = prevalence >= 0.01 ? 10000 : prevalence >= 0.001 ? 100000 : 1000000;
  const pct = x => fr(Number((100 * x).toFixed(2))) + " %";
  return { contexte: c.texte(pct(prevalence), pct(sensibilite), pct(fauxPositifs)) + " (Chiffres fictifs.)", question: c.question, prevalence, sensibilite, fauxPositifs, population, noms: c.noms, courts: c.courts };
}

function comptesDepistage(s) {
  const malades = Math.round(s.population * s.prevalence);
  const sains = s.population - malades;
  return { malades, sains, vraisPositifs: Math.round(malades * s.sensibilite), fauxPositifs: Math.round(sains * s.fauxPositifs) };
}

// Arbre de fréquences naturelles : population → concernés / non concernés → positifs
function arbreFrequences(s, c) {
  const g = svg("svg", { viewBox: "0 0 320 168", class: "arbre", role: "img", "aria-label": "Arbre de fréquences" });
  const boite = (x, y, texte, sous, classe) => {
    g.appendChild(svg("rect", { x: x - 52, y: y - 17, width: 104, height: 34, rx: 3, class: "arbre-boite " + (classe || "") }));
    g.appendChild(texteSvg(x, y - 2, texte, { class: "sch-texte sch-gras", "text-anchor": "middle" }));
    g.appendChild(texteSvg(x, y + 11, sous, { class: "sch-petit", "text-anchor": "middle" }));
  };
  const lien = (x1, y1, x2, y2) => g.appendChild(svg("line", { x1, y1: y1 + 17, x2, y2: y2 - 17, class: "sch-trait" }));
  lien(160, 20, 88, 84);
  lien(160, 20, 232, 84);
  lien(88, 84, 88, 148);
  lien(232, 84, 232, 148);
  boite(160, 20, fr(s.population), "personnes");
  boite(88, 84, fr(c.malades), s.courts[0]);
  boite(232, 84, fr(c.sains), s.courts[1]);
  boite(88, 148, fr(c.vraisPositifs), "positifs (vrais)", "arbre-vrai");
  boite(232, 148, fr(c.fauxPositifs), "positifs (faux)", "arbre-faux");
  // Proportion des vrais positifs parmi tous les positifs, en barre
  const bloc = el("div", "arbre-bloc");
  bloc.appendChild(g);
  const total = c.vraisPositifs + c.fauxPositifs;
  const barre = el("div", "barre-positifs");
  const vrais = el("span", "vrais");
  vrais.style.width = Math.max(0.8, 100 * c.vraisPositifs / total) + "%";
  barre.append(vrais, el("span", "faux"));
  bloc.appendChild(barre);
  bloc.appendChild(legende([["var(--rouge)", "vrais positifs"], ["var(--orange)", "fausses alertes"]]));
  return bloc;
}

// Probabilité qu'au moins deux personnes sur n partagent leur anniversaire (365 jours équiprobables)
function probaAnniversaire(n) {
  let p = 1;
  for (let k = 0; k < n; k++) p *= (365 - k) / 365;
  return 1 - p;
}

function courbeAnniversaires(estimation) {
  const s = svg("svg", { viewBox: "0 0 320 200", class: "graphe", role: "img", "aria-label": "Probabilité d'un anniversaire commun selon la taille du groupe" });
  const x = n => 40 + 260 * n / 80, y = p => 170 - 150 * p;
  s.appendChild(svg("rect", { x: 40, y: 20, width: 260, height: 150, class: "graphe-fond" }));
  [0, 0.5, 1].forEach(p => {
    s.appendChild(svg("line", { x1: 40, y1: y(p), x2: 300, y2: y(p), class: "graphe-grille" }));
    s.appendChild(texteSvg(34, y(p) + 3.5, Math.round(100 * p) + " %", { class: "graphe-texte", "text-anchor": "end" }));
  });
  [0, 20, 40, 60, 80].forEach(n => s.appendChild(texteSvg(x(n), 186, String(n), { class: "graphe-texte", "text-anchor": "middle" })));
  const pts = [];
  for (let n = 0; n <= 80; n++) pts.push(x(n) + "," + y(probaAnniversaire(n)));
  s.appendChild(svg("polyline", { points: pts.join(" "), class: "courbe" }));
  s.appendChild(svg("line", { x1: x(23), y1: y(0), x2: x(23), y2: y(probaAnniversaire(23)), class: "graphe-diagonale" }));
  s.appendChild(svg("circle", { cx: x(23), cy: y(probaAnniversaire(23)), r: 5, class: "graphe-point" }));
  s.appendChild(texteSvg(x(23) + 8, y(probaAnniversaire(23)) + 14, "23", { class: "sch-texte sch-gras" }));
  if (estimation > 0 && estimation <= 80 && estimation !== 23) {
    s.appendChild(svg("circle", { cx: x(estimation), cy: y(probaAnniversaire(estimation)), r: 5, class: "graphe-point-partie" }));
    // En haut à gauche du point : la courbe, croissante, passe à sa droite et en dessous à sa gauche
    s.appendChild(texteSvg(x(estimation) - 7, y(probaAnniversaire(estimation)) - 7, "vous", { class: "sch-petit sch-gras", "text-anchor": "end" }));
  }
  return s;
}

// Simulation : un groupe de n personnes, avec leurs anniversaires sur une année
function simulationAnniversaires() {
  const bloc = el("div", "simulation");
  bloc.appendChild(el("p", "consigne", "Simulation"));
  const reglage = el("div", "ligne");
  const curseur = el("input", "curseur");
  curseur.type = "range";
  curseur.min = 5;
  curseur.max = 70;
  curseur.value = 23;
  curseur.setAttribute("aria-label", "Taille du groupe");
  const libelle = el("span", "source");
  reglage.append(curseur, libelle);
  const bouton = el("button", "bouton secondaire", "Former un groupe au hasard");
  const annee = el("div", "annee-anniversaires");
  const sortie = paragraphe("");
  const bilan = paragraphe("", "source");
  let groupes = 0, coincidences = 0;
  const majLibelle = () => { libelle.textContent = typo(curseur.value + " personnes (probabilité théorique : " + Math.round(100 * probaAnniversaire(Number(curseur.value))) + " %)"); };
  curseur.addEventListener("input", () => { majLibelle(); groupes = 0; coincidences = 0; bilan.textContent = ""; });
  majLibelle();
  bouton.addEventListener("click", () => {
    const n = Number(curseur.value);
    const jours = Array.from({ length: n }, () => Math.floor(Math.random() * 365));
    const compte = {};
    jours.forEach(j => { compte[j] = (compte[j] || 0) + 1; });
    annee.innerHTML = "";
    for (let j = 0; j < 365; j++) {
      const c = el("span", compte[j] > 1 ? "double" : compte[j] ? "simple" : null);
      annee.appendChild(c);
    }
    const communs = Object.values(compte).filter(c => c > 1).length;
    groupes++;
    if (communs) coincidences++;
    sortie.textContent = typo(communs ? "Anniversaire commun : " + pluriel(communs, "date partagée", "dates partagées") + " (en rouge)." : "Aucun anniversaire commun dans ce groupe.");
    bilan.textContent = typo("Groupes formés : " + groupes + " ; avec au moins un anniversaire commun : " + coincidences + " (" + Math.round(100 * coincidences / groupes) + " %).");
  });
  bloc.append(reglage, bouton, annee, sortie, bilan);
  return bloc;
}

// ===================== Affichage =====================

// Affiche l'expérience demandée (#tests/crt…)
function afficherExperiences(conteneur, id) {
  const exp = EXPERIENCES.find(e => e.id === id);
  const faites = lire("experiencesFaites", []);
  if (!faites.includes(exp.id)) ecrire("experiencesFaites", [...faites, exp.id]);
  ouvrirAtelier(conteneur, exp);
}
