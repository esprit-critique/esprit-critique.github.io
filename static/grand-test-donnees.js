// grand-test-donnees.js : données du Grand test. Aucune fonction, aucun appel : seulement des listes et des familles.
// Le moteur (grand-test.js) transforme chaque famille en instances par une fonction pure de sa table fermée
// GENERATEURS_GT (champ « generer »), jamais par eval.
//
// Une FAMILLE réunit des items de même structure logique, de même leurre et de même difficulté visée ; seule la surface
// change (contexte, prénoms, objets, nombres pris dans des plages à difficulté constante). La bonne réponse et le leurre
// sont calculés par le générateur à partir des valeurs tirées, jamais écrits à la main par instance.
// Champs d'une famille :
//   id, axe (A à F, ou « M » pour les démonstrations de mémoire), type (calcul, qcm, binaire), generer, difficulte
//   (visée, non mesurée : 2 = environ 55 à 65 % de réussite attendus chez un public instruit, hypothèse à valider),
//   construit (ce que la famille vise), fiches (identifiants réels de donnees.js), ateliers (adresses réelles),
//   mode (« note » ou « demonstration »), aRelire (contenu écrit par IA : relecture humaine obligatoire avant toute
//   publication), surfaces et nombres (les variables).
// Toutes les situations sont fictives ; les personnes, lieux et études aussi, sauf mention d'une source.
// Aucun item n'est repris ni adapté de près d'un instrument protégé (CRT, CRT-2, CART, HCTA, Watson-Glaser, MIST…)
// ni des banques du site : voir tests/grand-test-plan.md et le contrôle de similarité du banc « calculs ».

// Prénoms variés (genre : m ou f), pour les situations
const PRENOMS_GT = [
  ["Léa", "f"], ["Karim", "m"], ["Inès", "f"], ["Tom", "m"], ["Aïcha", "f"], ["Hugo", "m"], ["Mei", "f"], ["Samuel", "m"],
  ["Zoé", "f"], ["Yanis", "m"], ["Clara", "f"], ["Malik", "m"], ["Nina", "f"], ["Lucas", "m"], ["Fatou", "f"], ["Théo", "m"],
  ["Jade", "f"], ["Omar", "m"], ["Lina", "f"], ["Antoine", "m"], ["Sofia", "f"], ["Bilal", "m"], ["Emma", "f"], ["Noah", "m"],
  ["Rose", "f"], ["Adam", "m"], ["Maya", "f"], ["Eliott", "m"], ["Salomé", "f"], ["Ismaël", "m"], ["Louise", "f"], ["Tiago", "m"],
  ["Anaïs", "f"], ["Moussa", "m"], ["Chloé", "f"], ["Gabriel", "m"], ["Yasmine", "f"], ["Raphaël", "m"], ["Alice", "f"], ["Sacha", "m"]
];

// ===================== Axe A : réflexion et logique =====================

const FAMILLES_GT = [
  // ---------- A, réponses calculées (4 familles) ----------
  {
    id: "a-vitesse", axe: "A", type: "calcul", generer: "vitesseMoyenne", difficulte: 2, mode: "note", aRelire: true,
    construit: "Moyenne de vitesses sur un même trajet : la vitesse moyenne est la moyenne harmonique, pas la moyenne simple",
    fiches: ["biais:ancrage"], ateliers: ["#tests/classiques"],
    // [véhicule, [vitesse aller, vitesse retour] possibles] : la moyenne harmonique 2ab / (a + b) est entière
    // [vitesse aller, vitesse retour] en km/h, alignées sur les surfaces : la moyenne harmonique 2ab / (a + b) est entière
    nombres: [[10, 15], [12, 24], [15, 30], [18, 36], [20, 30], [30, 60], [40, 60], [45, 90], [50, 75], [60, 90], [60, 120], [70, 105], [80, 120], [36, 45], [24, 40], [28, 84], [42, 84], [48, 80], [54, 108], [63, 126]],
    surfaces: [
      "va au lac à vélo", "va au stade à vélo", "rejoint la plage à vélo électrique", "rejoint la ferme voisine en tracteur",
      "rejoint la gare en scooter", "rejoint le marché en voiture", "rend visite à sa tante en voiture", "rejoint le village voisin à moto",
      "conduit un bus jusqu'au terminus", "livre un colis en camionnette", "dépose sa sœur à l'aéroport en voiture", "traverse la plaine en train régional",
      "rejoint l'atelier en voiture", "part à la pêche en bateau à moteur", "rejoint l'île en navette maritime", "monte au refuge en voiture",
      "rejoint la carrière en camion", "va au chantier en voiture", "se rend au concert en voiture", "rejoint la côte en voiture"
    ]
  },
  {
    id: "a-hausse-baisse", axe: "A", type: "calcul", generer: "hausseBaisse", difficulte: 2, mode: "note", aRelire: true,
    construit: "Pourcentages successifs : une hausse puis une baisse du même pourcentage ne ramènent pas au point de départ",
    fiches: ["biais:ancrage"], ateliers: ["#chiffres/graphiques"],
    // [prix de départ, pourcentage] : le prix final est entier
    nombres: [[200, 10], [500, 20], [400, 50], [1000, 30], [800, 25], [300, 10], [2000, 40], [600, 50], [1200, 20], [900, 10], [1600, 25], [700, 10], [1500, 20], [2500, 40], [3000, 30], [100, 50], [4000, 25], [1100, 10], [5000, 20], [250, 20]],
    surfaces: [
      ["Le prix d'un vélo", "€"], ["Le loyer d'un garage", "€"], ["Le prix d'une guitare", "€"], ["Le budget d'une fête de quartier", "€"],
      ["Le prix d'un canapé", "€"], ["Le tarif d'un abonnement annuel", "€"], ["Le prix d'un ordinateur", "€"], ["Le budget d'une sortie scolaire", "€"],
      ["Le prix d'une tente", "€"], ["Le prix d'un appareil photo", "€"], ["Le prix d'un lave-linge", "€"], ["Le budget d'un club de théâtre", "€"],
      ["Le prix d'un scooter", "€"], ["Le prix d'une tondeuse", "€"], ["Le prix d'un piano numérique", "€"], ["Le prix d'une paire de skis", "€"],
      ["Le prix d'une cuisinière", "€"], ["Le prix d'un aquarium", "€"], ["Le prix d'une table en chêne", "€"], ["Le prix d'une trottinette", "€"]
    ]
  },
  {
    id: "a-intervalles", axe: "A", type: "calcul", generer: "piquets", difficulte: 2, mode: "note", aRelire: true,
    construit: "Compter des intervalles : n intervalles entre deux bouts demandent n + 1 bornes",
    fiches: ["biais:ancrage"], ateliers: ["#tests/classiques"],
    // [longueur en mètres, espacement en mètres] : de 6 à 30 intervalles
    nombres: [[60, 5], [100, 10], [90, 6], [120, 8], [48, 4], [150, 10], [70, 7], [200, 20], [84, 6], [36, 3], [250, 25], [160, 8], [45, 5], [96, 8], [120, 6], [180, 12], [75, 5], [64, 4], [140, 10], [99, 9]],
    surfaces: [
      ["Une allée", "des arbres", "un arbre", "planté"], ["Une clôture", "des poteaux", "un poteau", "planté"],
      ["Une rue", "des lampadaires", "un lampadaire", "installé"], ["Une promenade", "des bancs", "un banc", "installé"],
      ["Une piste", "des plots", "un plot", "posé"], ["Un quai", "des bornes", "une borne", "posée"],
      ["Un pont", "des drapeaux", "un drapeau", "accroché"], ["Une haie", "des piquets", "un piquet", "planté"],
      ["Un sentier", "des balises", "une balise", "posée"], ["Un couloir", "des appliques", "une applique", "fixée"],
      ["Une jetée", "des lanternes", "une lanterne", "accrochée"], ["Un parking", "des panneaux", "un panneau", "fixé"],
      ["Une digue", "des réverbères", "un réverbère", "installé"], ["Un mur", "des crochets", "un crochet", "fixé"],
      ["Une ligne d'arrivée", "des cônes", "un cône", "posé"], ["Une avenue", "des platanes", "un platane", "planté"],
      ["Une rampe", "des supports", "un support", "fixé"], ["Une berge", "des saules", "un saule", "planté"],
      ["Une estrade", "des spots", "un spot", "fixé"], ["Un verger", "des pommiers", "un pommier", "planté"]
    ]
  },
  {
    id: "a-moyenne-ponderee", axe: "A", type: "calcul", generer: "moyennePonderee", difficulte: 2, mode: "note", aRelire: true,
    construit: "Moyenne de deux groupes de tailles différentes : il faut pondérer par les effectifs",
    fiches: ["biais:simpson"], ateliers: ["#tests/classiques"],
    // [effectif 1, moyenne 1, effectif 2, moyenne 2] : moyenne pondérée entière, différente de la moyenne simple
    nombres: [[10, 12, 30, 16], [20, 8, 5, 18], [30, 10, 10, 14], [15, 20, 5, 12], [40, 9, 10, 14], [12, 15, 4, 7], [25, 6, 75, 10], [8, 18, 24, 14], [50, 11, 25, 17], [9, 20, 3, 8],
      [60, 5, 20, 9], [14, 13, 7, 16], [36, 10, 12, 14], [16, 9, 48, 13], [45, 12, 15, 8], [70, 14, 30, 4], [24, 16, 8, 12], [18, 7, 6, 15], [35, 11, 5, 19], [44, 10, 11, 15]],
    surfaces: [
      ["Dans une classe", "filles", "garçons", "la note moyenne au contrôle", "sur 20"], ["Dans un club de course", "adultes", "jeunes", "le temps moyen sur le parcours", "minutes"],
      ["Dans une entreprise", "employés du matin", "employés du soir", "le nombre moyen de colis préparés par heure", "colis"],
      ["Dans un verger", "pommiers jeunes", "pommiers anciens", "la récolte moyenne par arbre", "kilos"], ["Dans une chorale", "sopranos", "altos", "le nombre moyen de répétitions suivies", "répétitions"],
      ["Dans une bibliothèque", "lecteurs inscrits l'an dernier", "nouveaux inscrits", "le nombre moyen de livres empruntés", "livres"],
      ["Dans un tournoi", "joueurs débutants", "joueurs confirmés", "le score moyen", "points"], ["Dans une boulangerie", "jours de semaine", "jours de week-end", "le nombre moyen de gâteaux vendus par heure", "gâteaux"],
      ["Dans une école de musique", "élèves de piano", "élèves de violon", "le nombre moyen d'heures de pratique par semaine", "heures"],
      ["Dans un potager collectif", "parcelles ombragées", "parcelles ensoleillées", "la récolte moyenne de tomates par parcelle", "kilos"],
      ["Dans une équipe de livreurs", "livreurs à vélo", "livreurs en camionnette", "le nombre moyen de livraisons par jour", "livraisons"],
      ["Dans un cours de natation", "nageurs du mardi", "nageurs du jeudi", "le nombre moyen de longueurs nagées", "longueurs"],
      ["Dans une ferme", "poules de la première cour", "poules de la seconde cour", "le nombre moyen d'œufs par semaine", "œufs"],
      ["Dans un atelier de poterie", "élèves du soir", "élèves du samedi", "le nombre moyen de bols réalisés", "bols"],
      ["Dans un centre d'appels", "conseillers expérimentés", "nouveaux conseillers", "le nombre moyen d'appels traités par heure", "appels"],
      ["Dans un club d'échecs", "membres adultes", "membres enfants", "le nombre moyen de parties jouées par mois", "parties"],
      ["Dans une association", "bénévoles réguliers", "bénévoles occasionnels", "le nombre moyen d'heures données par mois", "heures"],
      ["Dans une cantine", "repas du midi", "repas du soir", "le nombre moyen de couverts par service", "couverts"],
      ["Dans un club de randonnée", "sorties d'été", "sorties d'hiver", "la distance moyenne parcourue", "kilomètres"],
      ["Dans une serre", "plants du premier bac", "plants du second bac", "la hauteur moyenne", "centimètres"]
    ]
  },

  // ---------- A, lecture fine (4 familles, QCM) ----------
  {
    id: "a-portee-negation", axe: "A", type: "qcm", generer: "porteeNegation", difficulte: 2, mode: "note", aRelire: true,
    construit: "Portée de la négation : « il est faux que tous… » veut dire « au moins un ne… pas », pas « aucun »",
    fiches: ["sophismes:faux-dilemme"], ateliers: ["#tests/logique"],
    // [groupe (féminin ?), propriété à l'infinitif passé positive, négative]
    surfaces: [
      ["invités", false, "ont apporté un dessert", "n'a pas apporté de dessert", "n'a apporté de dessert"],
      ["trains de ce matin", false, "sont arrivés à l'heure", "n'est pas arrivé à l'heure", "n'est arrivé à l'heure"],
      ["élèves de la classe", false, "ont rendu leur devoir", "n'a pas rendu son devoir", "n'a rendu son devoir"],
      ["boulangeries du quartier", true, "sont ouvertes le lundi", "n'est pas ouverte le lundi", "n'est ouverte le lundi"],
      ["joueurs de l'équipe", false, "ont participé à l'entraînement", "n'a pas participé à l'entraînement", "n'a participé à l'entraînement"],
      ["fenêtres de la maison", true, "sont fermées", "n'est pas fermée", "n'est fermée"],
      ["colis de la tournée", false, "ont été livrés", "n'a pas été livré", "n'a été livré"],
      ["candidates au concours", true, "ont réussi l'épreuve écrite", "n'a pas réussi l'épreuve écrite", "n'a réussi l'épreuve écrite"],
      ["livres empruntés", false, "ont été rendus", "n'a pas été rendu", "n'a été rendu"],
      ["lampes du couloir", true, "sont allumées", "n'est pas allumée", "n'est allumée"],
      ["coureurs inscrits", false, "ont franchi la ligne d'arrivée", "n'a pas franchi la ligne d'arrivée", "n'a franchi la ligne d'arrivée"],
      ["tomates du potager", true, "sont mûres", "n'est pas mûre", "n'est mûre"],
      ["musiciens de l'orchestre", false, "ont reçu la partition", "n'a pas reçu la partition", "n'a reçu la partition"],
      ["salles du musée", true, "sont accessibles en fauteuil", "n'est pas accessible en fauteuil", "n'est accessible en fauteuil"],
      ["bénévoles de l'association", false, "sont venus samedi", "n'est pas venu samedi", "n'est venu samedi"],
      ["voitures du parking", true, "sont garées correctement", "n'est pas garée correctement", "n'est garée correctement"],
      ["participants de l'atelier", false, "ont payé leur inscription", "n'a pas payé son inscription", "n'a payé son inscription"],
      ["portes de l'immeuble", true, "sont verrouillées", "n'est pas verrouillée", "n'est verrouillée"],
      ["vols de l'après-midi", false, "sont partis à l'heure", "n'est pas parti à l'heure", "n'est parti à l'heure"],
      ["plantes de la serre", true, "ont été arrosées", "n'a pas été arrosée", "n'a été arrosée"]
    ]
  },
  {
    id: "a-presuppose", axe: "A", type: "qcm", generer: "presuppose", difficulte: 2, mode: "note", aRelire: true,
    construit: "Présupposé : une question peut contenir une prémisse que rien n'établit ; la bonne réponse est alors de le dire",
    fiches: ["sophismes:question-piege"], ateliers: ["#tests/qui-prouve"],
    // [texte établi, question qui présuppose un fait absent du texte, fait présupposé, trois raisons plausibles mais non établies]
    surfaces: [
      ["La mairie de Valmont a ouvert une nouvelle piscine en juin. Elle accueille les nageurs tous les jours sauf le lundi.", "Pourquoi la piscine de Valmont a-t-elle été fermée en juillet ?", "la piscine a été fermée en juillet", ["Pour réparer le système de chauffage.", "Faute de maîtres-nageurs pendant l'été.", "À cause d'un problème de qualité de l'eau."]],
      ["Le club de lecture de Saint-Aubin se réunit le premier jeudi du mois. Il compte une vingtaine de membres.", "Pourquoi le club de lecture a-t-il perdu la moitié de ses membres ?", "le club a perdu la moitié de ses membres", ["Parce que l'horaire ne convenait plus.", "Parce que les livres choisis étaient trop longs.", "Parce qu'un autre club a ouvert à côté."]],
      ["La boulangerie de la place a changé de propriétaire au printemps. Elle vend désormais aussi des pizzas.", "Pourquoi les prix de la boulangerie ont-ils doublé ?", "les prix ont doublé", ["À cause de la hausse du prix de la farine.", "Pour financer le nouveau four à pizza.", "Parce que le nouveau propriétaire vise une autre clientèle."]],
      ["Le festival de musique de Lorvan a eu lieu en août, sur trois jours. Douze groupes s'y sont produits.", "Pourquoi le festival de Lorvan a-t-il été annulé l'an prochain ?", "le festival a été annulé pour l'an prochain", ["Faute de subventions.", "À cause des plaintes des riverains.", "Parce que les organisateurs ont déménagé."]],
      ["Une nouvelle ligne de bus relie la gare à l'hôpital depuis septembre. Elle passe toutes les vingt minutes.", "Pourquoi la nouvelle ligne de bus est-elle toujours vide ?", "la ligne est toujours vide", ["Parce que les horaires sont mal affichés.", "Parce que le trajet est plus rapide à pied.", "Parce que les habitants ignorent qu'elle existe."]],
      ["Le collège Jean-Moulin a installé des casiers dans le hall. Chaque élève de sixième en a reçu un.", "Pourquoi les élèves de troisième ont-ils refusé leurs casiers ?", "les élèves de troisième ont refusé leurs casiers", ["Parce que les casiers sont trop petits.", "Parce qu'ils sont trop loin des salles.", "Parce que les clés se perdent facilement."]],
      ["Le marché du dimanche s'est installé sur le parking de la salle des fêtes. On y trouve une trentaine d'étals.", "Pourquoi les maraîchers ont-ils quitté le marché du dimanche ?", "les maraîchers ont quitté le marché", ["Parce que l'emplacement coûte trop cher.", "Parce que le parking est mal abrité.", "Parce que les clients préfèrent le marché du samedi."]],
      ["La médiathèque prête désormais des jeux de société. Les prêts durent trois semaines.", "Pourquoi la médiathèque a-t-elle arrêté de prêter des jeux de société ?", "la médiathèque a arrêté ces prêts", ["Parce que trop de pièces étaient perdues.", "Faute de place sur les étagères.", "Parce que les jeux revenaient abîmés."]],
      ["Une entreprise de Corvel fabrique des vélos pliants. Elle emploie quarante personnes.", "Pourquoi l'entreprise de Corvel a-t-elle délocalisé sa production ?", "l'entreprise a délocalisé sa production", ["Pour réduire ses coûts.", "Pour se rapprocher de ses fournisseurs.", "Faute de place dans ses locaux."]],
      ["Le parc des Tilleuls a été réaménagé l'an dernier. On y a planté cinquante arbres et installé des jeux.", "Pourquoi les jeux du parc des Tilleuls ont-ils été retirés ?", "les jeux ont été retirés", ["Parce qu'ils ne respectaient pas les normes.", "À cause de dégradations répétées.", "Pour agrandir la pelouse."]],
      ["Un café-librairie a ouvert rue des Lilas. Il organise une lecture chaque vendredi soir.", "Pourquoi le café-librairie fait-il faillite ?", "le café-librairie fait faillite", ["Parce que le loyer est trop élevé.", "Parce que les lectures attirent peu de monde.", "À cause de la concurrence en ligne."]],
      ["L'équipe de handball de Brézé a gagné son premier match de la saison. Elle a recruté deux joueuses cet été.", "Pourquoi l'entraîneur de Brézé a-t-il démissionné ?", "l'entraîneur a démissionné", ["À cause de désaccords avec le président du club.", "Pour entraîner une équipe plus connue.", "Pour des raisons familiales."]],
      ["Le théâtre municipal propose des places à cinq euros pour les étudiants. La saison compte dix spectacles.", "Pourquoi les étudiants boudent-ils le théâtre municipal ?", "les étudiants boudent le théâtre", ["Parce que les spectacles commencent trop tard.", "Parce que la programmation ne les intéresse pas.", "Parce que le théâtre est loin du campus."]],
      ["La commune de Ferrières a installé des panneaux solaires sur l'école. Ils couvrent une partie de la toiture.", "Pourquoi les panneaux solaires de l'école tombent-ils en panne ?", "les panneaux tombent en panne", ["À cause d'un défaut de fabrication.", "Parce qu'ils ont été mal installés.", "À cause des intempéries de l'hiver."]],
      ["Une épicerie sans emballage a ouvert près de la gare. Elle vend des pâtes, du riz et des légumes secs au poids.", "Pourquoi l'épicerie sans emballage a-t-elle réduit ses horaires ?", "l'épicerie a réduit ses horaires", ["Faute de clients le soir.", "Parce que la gérante est seule.", "Pour limiter ses frais d'électricité."]],
      ["Le club de football de Vauclair a acheté de nouveaux maillots. Les joueurs les ont portés au premier match.", "Pourquoi les nouveaux maillots de Vauclair ont-ils été rappelés par le fabricant ?", "les maillots ont été rappelés", ["À cause d'un tissu qui irrite la peau.", "Parce que les couleurs déteignent.", "À cause d'une erreur dans le logo."]],
      ["Un atelier de réparation de vélos ouvre le samedi matin à la maison de quartier. Les bénévoles prêtent les outils.", "Pourquoi l'atelier de réparation a-t-il été interdit par la mairie ?", "la mairie a interdit l'atelier", ["Pour des raisons d'assurance.", "Parce que la salle n'est pas adaptée.", "À cause du bruit pour les voisins."]],
      ["La piscine de Rochebrune propose des cours d'aquagym le mercredi. Les cours durent quarante-cinq minutes.", "Pourquoi les cours d'aquagym de Rochebrune coûtent-ils plus cher qu'ailleurs ?", "ces cours coûtent plus cher qu'ailleurs", ["Parce que l'eau y est chauffée davantage.", "Parce que les groupes sont plus petits.", "Parce que les professeurs sont plus qualifiés."]],
      ["Le jardin botanique a reçu une collection de cactus. Elle est exposée dans la grande serre.", "Pourquoi la collection de cactus a-t-elle dépéri ?", "la collection a dépéri", ["Parce que la serre est trop humide.", "Faute de soins pendant les vacances.", "Parce que les cactus ont été trop arrosés."]],
      ["Une auto-école propose des leçons de conduite le dimanche. Elle dispose de trois voitures.", "Pourquoi l'auto-école a-t-elle le plus faible taux de réussite de la ville ?", "l'auto-école a le plus faible taux de réussite", ["Parce que ses moniteurs sont débutants.", "Parce que les leçons du dimanche sont trop courtes.", "Parce que ses voitures sont anciennes."]]
    ]
  },
  {
    id: "a-relations", axe: "A", type: "qcm", generer: "relations", difficulte: 2, mode: "note", aRelire: true,
    construit: "Relations exprimées à l'envers (« moins… que », « plus jeune que ») : il faut les remettre dans un même sens",
    fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"],
    // [adjectif positif m, f ; adjectif inverse m, f ; question]
    surfaces: [
      ["âgé", "âgée", "jeune", "jeune"], ["grand", "grande", "petit", "petite"], ["rapide", "rapide", "lent", "lente"],
      ["matinal", "matinale", "tardif", "tardive"], ["patient", "patiente", "impatient", "impatiente"], ["bavard", "bavarde", "silencieux", "silencieuse"],
      ["prudent", "prudente", "téméraire", "téméraire"], ["riche", "riche", "pauvre", "pauvre"], ["fort", "forte", "faible", "faible"],
      ["âgé", "âgée", "jeune", "jeune"], ["grand", "grande", "petit", "petite"], ["rapide", "rapide", "lent", "lente"],
      ["matinal", "matinale", "tardif", "tardive"], ["patient", "patiente", "impatient", "impatiente"], ["bavard", "bavarde", "silencieux", "silencieuse"],
      ["prudent", "prudente", "téméraire", "téméraire"], ["riche", "riche", "pauvre", "pauvre"], ["fort", "forte", "faible", "faible"],
      ["âgé", "âgée", "jeune", "jeune"], ["grand", "grande", "petit", "petite"]
    ]
  },
  {
    id: "a-seulement-si", axe: "A", type: "qcm", generer: "seulementSi", difficulte: 2, mode: "note", aRelire: true,
    construit: "« Seulement si » : une condition nécessaire, pas suffisante. Remplir la condition ne garantit pas l'action",
    fiches: ["sophismes:affirmation-consequent", "sophismes:negation-antecedent"], ateliers: ["#tests/wason"],
    // [règle, action au passé composé ({e} : accord), condition remplie (présent), action à l'infinitif]
    surfaces: [
      ["On ne peut entrer dans le laboratoire que si l'on porte un badge.", "est entré{e} dans le laboratoire", "porte un badge", "entrer dans le laboratoire"],
      ["On ne peut emprunter un livre que si l'on est inscrit à la bibliothèque.", "a emprunté un livre", "est inscrit{e} à la bibliothèque", "emprunter un livre"],
      ["On ne peut monter dans ce manège que si l'on mesure plus d'un mètre vingt.", "est monté{e} dans le manège", "mesure plus d'un mètre vingt", "monter dans le manège"],
      ["On ne peut voter à l'assemblée du club que si l'on a payé sa cotisation.", "a voté à l'assemblée", "a payé sa cotisation", "voter à l'assemblée"],
      ["On ne peut accéder au toit que si l'on a la clé du local technique.", "est monté{e} sur le toit", "a la clé du local technique", "accéder au toit"],
      ["On ne peut participer à la finale que si l'on a gagné sa demi-finale.", "a participé à la finale", "a gagné sa demi-finale", "participer à la finale"],
      ["On ne peut utiliser la salle de musique que si l'on a réservé un créneau.", "a utilisé la salle de musique", "a réservé un créneau", "utiliser la salle de musique"],
      ["On ne peut entrer au concert que si l'on a un billet.", "est entré{e} au concert", "a un billet", "entrer au concert"],
      ["On ne peut plonger dans le grand bassin que si l'on a son brevet de natation.", "a plongé dans le grand bassin", "a son brevet de natation", "plonger dans le grand bassin"],
      ["On ne peut conduire le minibus du club que si l'on a plus de vingt et un ans.", "a conduit le minibus", "a plus de vingt et un ans", "conduire le minibus"],
      ["On ne peut retirer un colis au relais que si l'on a le code reçu par message.", "a retiré un colis au relais", "a le code reçu par message", "retirer un colis"],
      ["On ne peut jouer sur le court couvert que si l'on est membre du club.", "a joué sur le court couvert", "est membre du club", "jouer sur le court couvert"],
      ["On ne peut exposer au salon que si l'on a envoyé son dossier avant mars.", "a exposé au salon", "a envoyé son dossier avant mars", "exposer au salon"],
      ["On ne peut entrer dans la réserve que si l'on est accompagné d'un garde.", "est entré{e} dans la réserve", "est accompagné{e} d'un garde", "entrer dans la réserve"],
      ["On ne peut se garer dans la cour que si l'on a une vignette.", "s'est garé{e} dans la cour", "a une vignette", "se garer dans la cour"],
      ["On ne peut passer l'examen pratique que si l'on a réussi l'examen théorique.", "a passé l'examen pratique", "a réussi l'examen théorique", "passer l'examen pratique"],
      ["On ne peut se connecter au réseau de l'atelier que si l'on a un mot de passe.", "s'est connecté{e} au réseau de l'atelier", "a un mot de passe", "se connecter au réseau"],
      ["On ne peut adopter un chat au refuge que si l'on a rempli le questionnaire.", "a adopté un chat au refuge", "a rempli le questionnaire", "adopter un chat"],
      ["On ne peut chanter en soliste que si l'on a assisté à toutes les répétitions.", "a chanté en soliste", "a assisté à toutes les répétitions", "chanter en soliste"],
      ["On ne peut embarquer sur le bateau que si l'on porte un gilet.", "a embarqué sur le bateau", "porte un gilet", "embarquer sur le bateau"]
    ]
  },

  // ---------- A, raisonnements : validité × crédibilité (8 familles, deux formes par case) ----------
  // Forme et crédibilité sont fixées par famille ; les termes viennent de TAXONOMIE_GT. La crédibilité d'une conclusion
  // est calculée à partir des appartenances de la taxonomie, jamais écrite à la main.
  { id: "a-syl-chaine-credible", axe: "A", type: "binaire", generer: "syllogisme", forme: "chaine", credible: true, valide: true, difficulte: 1, mode: "note", aRelire: true,
    construit: "Forme valide, conclusion crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-chaine-incredible", axe: "A", type: "binaire", generer: "syllogisme", forme: "chaine", credible: false, valide: true, difficulte: 3, mode: "note", aRelire: true,
    construit: "Forme valide, conclusion non crédible : la croyance pousse à rejeter un raisonnement juste", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-exclusion-credible", axe: "A", type: "binaire", generer: "syllogisme", forme: "exclusion", credible: true, valide: true, difficulte: 1, mode: "note", aRelire: true,
    construit: "Forme valide (exclusion), conclusion crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-exclusion-incredible", axe: "A", type: "binaire", generer: "syllogisme", forme: "exclusion", credible: false, valide: true, difficulte: 3, mode: "note", aRelire: true,
    construit: "Forme valide (exclusion), conclusion non crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-moyen-credible", axe: "A", type: "binaire", generer: "syllogisme", forme: "moyen", credible: true, valide: false, difficulte: 3, mode: "note", aRelire: true,
    construit: "Forme non valide (moyen terme non distribué), conclusion crédible : la croyance pousse à accepter", fiches: ["biais:croyance-logique", "sophismes:affirmation-consequent"], ateliers: ["#tests/logique"] },
  { id: "a-syl-moyen-incredible", axe: "A", type: "binaire", generer: "syllogisme", forme: "moyen", credible: false, valide: false, difficulte: 1, mode: "note", aRelire: true,
    construit: "Forme non valide (moyen terme non distribué), conclusion non crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-certains-credible", axe: "A", type: "binaire", generer: "syllogisme", forme: "certains", credible: true, valide: false, difficulte: 3, mode: "note", aRelire: true,
    construit: "Forme non valide (« certains »), conclusion crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] },
  { id: "a-syl-certains-incredible", axe: "A", type: "binaire", generer: "syllogisme", forme: "certains", credible: false, valide: false, difficulte: 1, mode: "note", aRelire: true,
    construit: "Forme non valide (« certains »), conclusion non crédible", fiches: ["biais:croyance-logique"], ateliers: ["#tests/logique"] }
];

// Taxonomie des raisonnements : groupes disjoints (une catégorie générale), chacun avec deux sous-catégories disjointes
// et leurs membres. [pluriel, féminin ?]. Les appartenances sont celles du sens courant, sans cas limite.
const TAXONOMIE_GT = [
  { c: ["plantes", true], sous: [
    { b: ["fleurs", true], membres: [["roses", true], ["tulipes", true], ["marguerites", true], ["jonquilles", true]] },
    { b: ["arbres", false], membres: [["chênes", false], ["sapins", false], ["bouleaux", false], ["érables", false]] }] },
  { c: ["animaux", false], sous: [
    { b: ["mammifères", false], membres: [["chiens", false], ["chats", false], ["chevaux", false], ["lapins", false]] },
    { b: ["oiseaux", false], membres: [["moineaux", false], ["pigeons", false], ["aigles", false], ["hiboux", false]] }] },
  { c: ["instruments de musique", false], sous: [
    { b: ["instruments à cordes", false], membres: [["violons", false], ["guitares", true], ["harpes", true], ["violoncelles", false]] },
    { b: ["instruments à vent", false], membres: [["flûtes", true], ["trompettes", true], ["clarinettes", true], ["saxophones", false]] }] },
  { c: ["meubles", false], sous: [
    { b: ["sièges", false], membres: [["chaises", true], ["tabourets", false], ["fauteuils", false], ["canapés", false]] },
    { b: ["meubles de rangement", false], membres: [["armoires", true], ["commodes", true], ["buffets", false], ["bahuts", false]] }] },
  { c: ["vêtements", false], sous: [
    { b: ["vêtements du haut", false], membres: [["chemises", true], ["pulls", false], ["vestes", true], ["gilets", false]] },
    { b: ["vêtements du bas", false], membres: [["pantalons", false], ["jupes", true], ["shorts", false], ["bermudas", false]] }] }
];

// ===================== Axe B : probabilités et statistiques =====================

FAMILLES_GT.push(
  {
    id: "b-taux-base", axe: "B", type: "qcm", generer: "tauxDeBase", prevalence: "faible", difficulte: 2, mode: "note", aRelire: true,
    construit: "Taux de base : quand ce que l'on cherche est rare, la plupart des alertes sont fausses",
    fiches: ["biais:taux-de-base", "biais:procureur"], ateliers: ["#tests/depistage"],
    // [prévalence %, détection %, fausses alertes %] : probabilité calculée par le générateur
    nombres: [[1, 90, 5], [1, 80, 10], [2, 90, 10], [2, 95, 5], [0.5, 99, 2], [1, 95, 4], [5, 90, 15], [2, 80, 5], [1, 99, 5], [3, 90, 10]],
    surfaces: "SURFACES_DETECTION"
  },
  {
    id: "b-depistage-surcorrection", axe: "B", type: "qcm", generer: "tauxDeBase", prevalence: "elevee", difficulte: 2, mode: "note", aRelire: true, surCorrection: true,
    construit: "Sur-correction du taux de base : quand ce que l'on cherche est fréquent, une alerte est le plus souvent juste",
    fiches: ["biais:taux-de-base", "sophismes:sophisme-sophisme"], ateliers: ["#tests/depistage"],
    nombres: [[50, 90, 10], [40, 90, 5], [60, 80, 10], [50, 80, 20], [30, 90, 10], [70, 90, 20], [50, 95, 5], [40, 80, 10], [60, 90, 30], [45, 90, 10]],
    surfaces: "SURFACES_DETECTION", decalage: 10
  }
);

// Situations de détection, sans santé : [cadre, ce qui est cherché (au singulier), l'appareil, ce qui est signalé, l'élément]
const SURFACES_DETECTION = [
  ["Dans une usine de jouets", "une pièce défectueuse", "Un appareil de contrôle", "les pièces", "pièce"],
  ["Dans un centre de tri", "un colis endommagé", "Un capteur", "les colis", "colis"],
  ["Dans une banque", "un faux billet", "Une machine de vérification", "les billets", "billet"],
  ["Dans une verrerie", "une bouteille fêlée", "Une caméra de contrôle", "les bouteilles", "bouteille"],
  ["Dans une coopérative fruitière", "un fruit abîmé", "Une trieuse optique", "les fruits", "fruit"],
  ["Dans un aéroport", "une valise mal étiquetée", "Un lecteur automatique", "les valises", "valise"],
  ["Dans une scierie", "une planche fendue", "Un scanner", "les planches", "planche"],
  ["Dans un atelier de cartes électroniques", "une carte mal soudée", "Un testeur", "les cartes", "carte"],
  ["Dans une boutique en ligne", "une commande frauduleuse", "Un logiciel de contrôle", "les commandes", "commande"],
  ["Dans une imprimerie", "une page mal imprimée", "Une caméra", "les pages", "page"],
  ["Dans une laiterie", "un pot mal scellé", "Un détecteur", "les pots", "pot"],
  ["Dans un entrepôt", "une palette mal emballée", "Un capteur", "les palettes", "palette"],
  ["Dans une biscuiterie", "un biscuit cassé", "Une caméra de tri", "les biscuits", "biscuit"],
  ["Dans un réseau de distribution d'eau", "une fuite", "Un capteur acoustique", "les tronçons de canalisation", "tronçon"],
  ["Dans une fabrique de vélos", "un cadre mal soudé", "Un appareil à ultrasons", "les cadres", "cadre"],
  ["Dans une cave coopérative", "un bouchon défectueux", "Une machine de contrôle", "les bouchons", "bouchon"],
  ["Dans un parc de panneaux solaires", "un panneau en panne", "Un drone à caméra thermique", "les panneaux", "panneau"],
  ["Dans une fabrique de chaussures", "une semelle mal collée", "Un banc d'essai", "les semelles", "semelle"],
  ["Dans un service de messagerie", "un message frauduleux", "Un filtre automatique", "les messages", "message"],
  ["Dans une rizerie", "un sac trop léger", "Une balance automatique", "les sacs", "sac"]
];

FAMILLES_GT.push(
  {
    id: "b-conjonction", axe: "B", type: "qcm", generer: "conjonction", difficulte: 2, mode: "note", aRelire: true,
    construit: "Conjonction : « A et B » ne peut pas être plus probable que « A » seul, même si B colle au portrait",
    fiches: ["biais:conjonction"], ateliers: ["#tests/classiques"],
    // [portrait, fait A (neutre), trait B (représentatif du portrait), trait C (autre)]
    surfaces: [
      ["{p} a 35 ans. {Il} passe ses week-ends en forêt, photographie les oiseaux et milite pour la protection des haies.", "travaille dans une banque", "fait partie d'une association de protection de la nature", "joue au tennis"],
      ["{p} a 28 ans. {Il} lit trois romans par semaine et a étudié les lettres classiques.", "habite en ville", "anime un club de lecture", "possède une voiture"],
      ["{p} a 42 ans. {Il} répare tout {lui}-même et passe ses soirées dans son atelier.", "travaille dans une assurance", "construit ses propres meubles", "a deux enfants"],
      ["{p} a 31 ans. {Il} court tous les matins et suit de près les résultats d'athlétisme.", "est comptable", "participe à des marathons", "aime la cuisine italienne"],
      ["{p} a 50 ans. {Il} connaît le nom de toutes les étoiles visibles et possède un télescope.", "travaille dans une agence de voyages", "fait partie d'un club d'astronomie", "habite près de la mer"],
      ["{p} a 26 ans. {Il} joue du piano depuis l'enfance et va au concert chaque semaine.", "est infirmi{er}", "joue dans un orchestre amateur", "parle espagnol"],
      ["{p} a 38 ans. {Il} cultive un grand potager et fait ses propres conserves.", "travaille dans une administration", "vend ses légumes au marché le samedi", "a un chien"],
      ["{p} a 45 ans. {Il} collectionne les cartes anciennes et passe ses vacances à randonner.", "est professeur de mathématiques", "fait partie d'un club de randonnée", "joue aux échecs"],
      ["{p} a 33 ans. {Il} a appris trois langues seul{e} et voyage dès qu'{il} le peut.", "travaille dans un supermarché", "tient un blog de voyage", "a un vélo"],
      ["{p} a 29 ans. {Il} démonte des ordinateurs depuis l'adolescence et code le soir.", "est vendeu{r} dans une boutique de vêtements", "a créé une application", "aime le cinéma"],
      ["{p} a 47 ans. {Il} adore cuisiner pour ses amis et lit des livres de recettes comme des romans.", "travaille dans une banque", "a suivi des cours de pâtisserie", "habite à la campagne"],
      ["{p} a 36 ans. {Il} nage dans le lac été comme hiver et fait de la plongée.", "est secrétaire", "est membre d'un club de natation en eau froide", "joue de la guitare"],
      ["{p} a 41 ans. {Il} passe ses dimanches à chiner dans les brocantes.", "travaille dans une entreprise de transport", "revend des objets anciens en ligne", "a un jardin"],
      ["{p} a 27 ans. {Il} a toujours un carnet de croquis sur {lui} et visite chaque exposition.", "est employé{e} de banque", "suit des cours de dessin", "fait du vélo"],
      ["{p} a 39 ans. {Il} connaît tous les champignons de la région et cueille des plantes sauvages.", "est agent{e} immobili{er}", "anime des sorties nature", "aime le théâtre"],
      ["{p} a 44 ans. {Il} joue aux échecs en ligne chaque soir et lit des livres de stratégie.", "travaille dans un hôpital", "participe à des tournois d'échecs", "a un chat"],
      ["{p} a 32 ans. {Il} fait de l'escalade trois fois par semaine et part en montagne chaque été.", "est employé{e} de mairie", "est membre d'un club alpin", "aime le jazz"],
      ["{p} a 53 ans. {Il} élève des abeilles et connaît toutes les fleurs mellifères.", "travaille dans une compagnie d'assurance", "vend son miel au marché", "a trois petits-enfants"],
      ["{p} a 30 ans. {Il} ne rate aucun match de basket et entraîne les jeunes de son quartier.", "est pharmacien{ne}", "joue dans une équipe amateur de basket", "aime la photographie"],
      ["{p} a 37 ans. {Il} répare des vélos pour ses voisins et se déplace uniquement à bicyclette.", "travaille dans un bureau d'études", "est bénévole dans un atelier de réparation de vélos", "parle italien"]
    ]
  },
  {
    id: "b-echantillon", axe: "B", type: "qcm", generer: "echantillon", difficulte: 2, mode: "note", aRelire: true,
    construit: "Taille de l'échantillon : les petits échantillons s'écartent plus souvent de la moyenne",
    fiches: ["biais:taille-echantillon"], ateliers: ["#tests/classiques"],
    // [lieu au pluriel, grand / petit, ce qui est compté, événement à une chance sur deux]
    nombres: [[150, 15, 60], [200, 20, 60], [120, 12, 70], [300, 25, 60], [100, 10, 70], [250, 15, 65], [180, 18, 60], [400, 20, 65], [160, 16, 60], [220, 11, 70]],
    surfaces: [
      ["deux cafés", "Le grand café", "Le petit café", "clients", "choisit un thé plutôt qu'un café"],
      ["deux cantines", "La grande cantine", "La petite cantine", "élèves", "prend le dessert au chocolat plutôt que la tarte"],
      ["deux salles de sport", "La grande salle", "La petite salle", "inscrits venus", "choisit le vélo plutôt que le tapis"],
      ["deux bibliothèques", "La grande bibliothèque", "La petite bibliothèque", "lecteurs", "emprunte un roman plutôt qu'un documentaire"],
      ["deux boulangeries", "La grande boulangerie", "La petite boulangerie", "clients", "prend une baguette tradition plutôt qu'une classique"],
      ["deux cinémas", "Le grand cinéma", "Le petit cinéma", "spectateurs", "choisit la version originale plutôt que doublée"],
      ["deux piscines", "La grande piscine", "La petite piscine", "nageurs", "nage le crawl plutôt que la brasse"],
      ["deux marchés", "Le grand marché", "Le petit marché", "acheteurs", "paie par carte plutôt qu'en espèces"],
      ["deux parkings", "Le grand parking", "Le petit parking", "voitures", "se gare à gauche de l'allée plutôt qu'à droite"],
      ["deux musées", "Le grand musée", "Le petit musée", "visiteurs", "commence par l'aile est plutôt que l'aile ouest"],
      ["deux gares", "La grande gare", "La petite gare", "voyageurs", "prend l'escalier plutôt que l'escalator"],
      ["deux restaurants", "Le grand restaurant", "Le petit restaurant", "clients", "choisit le menu du jour plutôt que la carte"],
      ["deux laveries", "La grande laverie", "La petite laverie", "clients", "choisit la machine de gauche plutôt que celle de droite"],
      ["deux fromageries", "La grande fromagerie", "La petite fromagerie", "clients", "choisit un fromage de chèvre plutôt que de vache"],
      ["deux stations-service", "La grande station", "La petite station", "conducteurs", "paie à la pompe plutôt qu'à la caisse"],
      ["deux crèches", "La grande crèche", "La petite crèche", "parents", "arrive avant 8 heures plutôt qu'après"],
      ["deux écoles de danse", "La grande école", "La petite école", "élèves", "choisit le cours du soir plutôt que celui du matin"],
      ["deux librairies", "La grande librairie", "La petite librairie", "clients", "demande un paquet cadeau plutôt que non"],
      ["deux campings", "Le grand camping", "Le petit camping", "vacanciers", "choisit un emplacement à l'ombre plutôt qu'au soleil"],
      ["deux glaciers", "Le grand glacier", "Le petit glacier", "clients", "choisit un cornet plutôt qu'un pot"]
    ]
  },
  {
    id: "b-regression", axe: "B", type: "qcm", generer: "regression", difficulte: 2, mode: "note", aRelire: true,
    construit: "Régression vers la moyenne : les meilleurs d'une première mesure font en moyenne moins bien à la suivante",
    fiches: ["biais:regression-moyenne"], ateliers: ["#tests/classiques", "#chiffres/correlation"],
    // [épreuve, participants, mesure]
    nombres: [[86, 74, 58, 62], [92, 81, 60, 63], [78, 70, 52, 56], [88, 77, 61, 65], [95, 84, 63, 66], [82, 73, 55, 59], [90, 79, 58, 61], [84, 75, 57, 60], [87, 76, 59, 63], [93, 80, 62, 65]],
    surfaces: [
      ["un concours de fléchettes en deux manches", "joueurs", "score"], ["un jeu de culture générale en deux parties", "candidats", "score"],
      ["deux contrôles de calcul mental", "élèves", "note"], ["deux concours de tir à l'arc", "archers", "score"],
      ["deux épreuves de mots croisés chronométrés", "participants", "score"], ["deux séances de lancer franc au basket", "joueurs", "réussite"],
      ["deux dégustations à l'aveugle", "dégustateurs", "score"], ["deux manches d'un jeu vidéo de réflexes", "joueurs", "score"],
      ["deux concours de pétanque", "joueurs", "score"], ["deux tests d'orthographe", "élèves", "note"],
      ["deux rallyes-photos", "équipes", "score"], ["deux concours de pronostics", "parieurs", "score"],
      ["deux épreuves de quiz musical", "candidats", "score"], ["deux concours de mini-golf", "joueurs", "score"],
      ["deux séances de tirs au but", "joueurs", "réussite"], ["deux épreuves de mémoire de chiffres", "participants", "score"],
      ["deux concours d'estimation de poids", "visiteurs", "score"], ["deux épreuves de dictée", "élèves", "note"],
      ["deux concours de devinettes", "candidats", "score"], ["deux sessions de jeu de cartes", "joueurs", "score"]
    ]
  },
  {
    id: "b-risque-relatif", axe: "B", type: "qcm", generer: "risqueRelatif", difficulte: 2, mode: "note", aRelire: true,
    construit: "Risque relatif et risque absolu : « +50 % » d'un risque rare ajoute très peu de cas",
    fiches: ["biais:cadrage", "biais:taux-de-base"], ateliers: ["#chiffres/graphiques"],
    // [cas sur 10 000 sans le facteur, hausse relative %] : cas supplémentaires = cas × hausse / 100
    nombres: [[2, 50], [4, 25], [10, 30], [20, 15], [6, 50], [8, 25], [3, 100], [5, 40], [12, 25], [40, 10]],
    surfaces: [
      ["laisser son vélo dehors la nuit", "se le faire voler dans l'année", "cyclistes"], ["rouler avec des pneus usés", "crever dans le mois", "automobilistes"],
      ["laisser une fenêtre entrouverte en hiver", "avoir une canalisation gelée dans l'hiver", "logements"],
      ["ranger ses outils dans un abri non fermé", "s'en faire dérober un dans l'année", "jardiniers"],
      ["prendre le dernier train du soir", "manquer sa correspondance", "voyageurs"], ["installer une étagère sans cheville", "la voir tomber dans l'année", "logements"],
      ["laisser un appareil en veille", "subir une panne de l'appareil dans l'année", "foyers"], ["arroser son potager à midi", "perdre un plant dans la saison", "jardins"],
      ["planter une haie en été", "voir un arbuste mourir dans l'année", "jardins"], ["acheter un téléphone d'occasion", "avoir une panne d'écran dans l'année", "acheteurs"],
      ["oublier de purger un radiateur", "avoir un radiateur en panne dans l'hiver", "logements"], ["voyager avec une valise souple", "voir un objet cassé à l'arrivée", "voyageurs"],
      ["garer sa voiture dans la rue", "avoir un rétroviseur abîmé dans l'année", "voitures"], ["stocker ses pommes de terre à la lumière", "perdre une partie du stock", "foyers"],
      ["poster un colis sans suivi", "voir le colis perdu", "colis"], ["utiliser un mot de passe court", "voir son compte de jeu piraté dans l'année", "comptes"],
      ["laisser son chien sans médaille", "le voir fuguer sans être retrouvé le jour même", "chiens"], ["faire sécher le linge dehors", "voir un vêtement envolé", "foyers"],
      ["prendre une correspondance courte à l'aéroport", "voir son bagage arriver en retard", "voyageurs"], ["laisser son ordinateur sans sauvegarde", "perdre des fichiers dans l'année", "utilisateurs"]
    ]
  },
  {
    id: "b-esperance", axe: "B", type: "qcm", generer: "esperance", difficulte: 2, mode: "note", aRelire: true,
    construit: "Espérance : le gain moyen par partie tient compte de la mise et de la probabilité de gagner",
    fiches: ["biais:illusion-controle"], ateliers: ["#tests/classiques"],
    // [mise €, gain €, une chance sur k] : gain moyen = gain / k − mise
    nombres: [[3, 20, 5], [2, 30, 10], [4, 30, 10], [5, 60, 10], [1, 6, 6], [2, 12, 6], [3, 12, 6], [5, 100, 25], [4, 40, 8], [6, 40, 8], [5, 30, 6], [8, 60, 10]],
    surfaces: [
      "une loterie de kermesse", "une roue de la fortune à la fête du village", "un jeu de grattage de l'école", "une tombola du club de foot",
      "un jeu de dés à la brocante", "une pêche aux canards à la foire", "un jeu de fléchettes à la fête foraine", "une loterie d'association",
      "un jeu de cartes à la fête de quartier", "une roue à la fête de l'école", "un tirage au sort du marché de Noël", "un jeu de boules à la fête d'été",
      "une enveloppe surprise à la kermesse", "un jeu de pièces à la foire", "une loterie du comité des fêtes", "un jeu d'adresse au carnaval",
      "une roue du festival", "un chamboule-tout à la fête paroissiale", "un jeu de hasard au gala de l'association", "une tombola de la chorale"
    ]
  },
  {
    id: "b-simpson", axe: "B", type: "qcm", generer: "simpson", difficulte: 3, mode: "note", aRelire: true,
    construit: "Paradoxe de Simpson : une méthode peut faire mieux dans chaque groupe et moins bien au total",
    fiches: ["biais:simpson"], ateliers: ["#tests/classiques"],
    // [A facile réussis, A facile total, A difficile réussis, A difficile total, B facile réussis, B facile total, B difficile réussis, B difficile total]
    nombres: [[19, 20, 48, 80, 70, 80, 9, 20], [9, 10, 54, 90, 76, 90, 5, 10], [28, 30, 35, 70, 60, 70, 14, 30], [38, 40, 72, 120, 100, 120, 22, 40], [9, 10, 40, 90, 80, 90, 4, 10]],
    surfaces: [
      ["Deux méthodes de réparation de chaussures", "chaussures réparées", "réparations simples", "réparations difficiles"],
      ["Deux façons d'enseigner la nage", "élèves qui savent nager à la fin", "élèves à l'aise dans l'eau", "élèves craintifs"],
      ["Deux techniques de greffe de rosiers", "greffes réussies", "rosiers jeunes", "rosiers anciens"],
      ["Deux méthodes de dépannage informatique", "pannes résolues", "pannes simples", "pannes complexes"],
      ["Deux recettes de pain", "pains bien levés", "jours secs", "jours humides"],
      ["Deux méthodes de traduction", "textes jugés fidèles", "textes courts", "textes longs"],
      ["Deux techniques de pêche", "sorties avec prise", "sorties par beau temps", "sorties par mauvais temps"],
      ["Deux méthodes de révision", "examens réussis", "élèves déjà à l'aise", "élèves en difficulté"],
      ["Deux engrais", "plants qui fleurissent", "sols riches", "sols pauvres"],
      ["Deux méthodes de dressage", "chiens obéissants", "chiots", "chiens adultes"],
      ["Deux plans d'entraînement", "coureurs qui finissent la course", "débutants", "confirmés"],
      ["Deux techniques de vente", "ventes conclues", "clients habitués", "nouveaux clients"],
      ["Deux méthodes de semis", "graines qui germent", "semis de printemps", "semis d'automne"],
      ["Deux colles", "réparations qui tiennent", "objets légers", "objets lourds"],
      ["Deux méthodes de rangement d'entrepôt", "commandes prêtes à temps", "petites commandes", "grosses commandes"],
      ["Deux techniques de lavage", "taches enlevées", "taches récentes", "taches anciennes"],
      ["Deux méthodes d'apprentissage du code", "élèves reçus", "élèves qui conduisent déjà un deux-roues", "élèves sans expérience"],
      ["Deux façons de cuire le riz", "cuissons réussies", "petites quantités", "grandes quantités"],
      ["Deux méthodes de taille des arbres", "arbres qui donnent des fruits", "arbres jeunes", "arbres âgés"],
      ["Deux techniques de peinture", "murs sans traces", "murs lisses", "murs abîmés"]
    ]
  },
  {
    id: "b-joueur", axe: "B", type: "qcm", generer: "joueur", difficulte: 1, mode: "note", aRelire: true,
    construit: "Erreur du joueur : un tirage au hasard n'a pas de mémoire, une série ne change pas la probabilité suivante",
    fiches: ["biais:erreur-du-joueur"], ateliers: ["#chiffres/ecrire-hasard", "#chiffres/hasard"],
    // [objet, issue, k (une chance sur k), longueur de la série]
    surfaces: [
      ["Une pièce équilibrée", "pile", 2, 6], ["Un dé équilibré", "le 6", 6, 4], ["Une roue à quatre secteurs égaux", "le secteur rouge", 4, 5],
      ["Une pièce équilibrée", "face", 2, 8], ["Un dé équilibré", "le 1", 6, 3], ["Une roue à cinq secteurs égaux", "le secteur bleu", 5, 4],
      ["Une pièce équilibrée", "pile", 2, 5], ["Un dé à huit faces équilibré", "le 8", 8, 3], ["Une roue à trois secteurs égaux", "le secteur vert", 3, 5],
      ["Une pièce équilibrée", "face", 2, 7], ["Un dé équilibré", "le 3", 6, 4], ["Une roue à six secteurs égaux", "le secteur jaune", 6, 3],
      ["Une pièce équilibrée", "pile", 2, 9], ["Un dé à quatre faces équilibré", "le 2", 4, 4], ["Une roue à quatre secteurs égaux", "le secteur blanc", 4, 4],
      ["Une pièce équilibrée", "face", 2, 6], ["Un dé équilibré", "le 5", 6, 3], ["Une roue à deux secteurs égaux", "le secteur noir", 2, 7],
      ["Une pièce équilibrée", "pile", 2, 10], ["Un dé à dix faces équilibré", "le 10", 10, 3]
    ]
  },
  {
    id: "b-denominateur", axe: "B", type: "qcm", generer: "denominateur", difficulte: 2, mode: "note", aRelire: true,
    construit: "Dénominateur : une part des cas ne dit rien sans la part de ce groupe dans l'ensemble",
    fiches: ["biais:taux-de-base", "sophismes:cherry-picking"], ateliers: ["#chiffres/graphiques"],
    // [part %, événement, groupe, conclusion tentante, ensemble de référence]
    surfaces: [
      [65, "des pannes de voiture de la ville", "des voitures grises", "les voitures grises tombent plus souvent en panne", "voitures de la ville"],
      [70, "des vélos volés au campus", "des vélos noirs", "les voleurs préfèrent les vélos noirs", "vélos garés au campus"],
      [60, "des accidents de ski de la station", "des skieurs en tenue sombre", "les tenues sombres rendent le ski dangereux", "skieurs de la station"],
      [75, "des livres abîmés de la bibliothèque", "des romans", "les romans sont moins bien traités que les autres livres", "livres prêtés"],
      [55, "des retards de la ligne de bus", "des bus du matin", "les bus du matin sont moins ponctuels", "bus de la ligne"],
      [80, "des plants morts du jardin collectif", "des tomates", "les tomates résistent moins bien que les autres plants", "plants du jardin"],
      [62, "des réclamations du magasin", "des clients du samedi", "les clients du samedi sont plus exigeants", "clients du magasin"],
      [68, "des colis perdus par le transporteur", "des petits colis", "les petits colis se perdent plus souvent", "colis transportés"],
      [72, "des chutes à la patinoire", "des personnes en patins loués", "les patins loués font tomber", "patineurs"],
      [58, "des pannes d'ordinateur de l'entreprise", "des ordinateurs portables", "les portables sont moins fiables", "ordinateurs de l'entreprise"],
      [66, "des plaintes pour bruit dans l'immeuble", "des locataires du premier étage", "les locataires du premier sont plus bruyants", "locataires"],
      [77, "des fruits invendus du marché", "des pommes", "les pommes se vendent mal", "fruits proposés"],
      [64, "des contraventions de stationnement du quartier", "des voitures de livraison", "les livreurs se garent plus mal", "véhicules du quartier"],
      [70, "des retours de vêtements en ligne", "des pantalons", "les pantalons déçoivent davantage", "vêtements vendus"],
      [59, "des cartes de bibliothèque perdues", "des lycéens", "les lycéens perdent plus souvent leur carte", "inscrits"],
      [73, "des crevaisons du club cycliste", "des vélos de route", "les vélos de route crèvent plus souvent", "vélos du club"],
      [61, "des pannes d'ascenseur de la ville", "des ascenseurs de plus de vingt ans", "les ascenseurs anciens tombent plus souvent en panne", "ascenseurs de la ville"],
      [67, "des objets oubliés dans les trains", "des parapluies", "on oublie plus facilement un parapluie qu'autre chose", "objets transportés"],
      [76, "des factures payées en retard à l'association", "des adhérents de longue date", "les anciens adhérents paient moins bien", "adhérents"],
      [63, "des blessures du club de football", "des joueurs de plus de trente ans", "les joueurs de plus de trente ans se blessent davantage", "joueurs du club"]
    ]
  },
  {
    id: "b-unites", axe: "B", type: "qcm", generer: "unites", difficulte: 1, mode: "note", aRelire: true,
    construit: "Unités : comparer des quantités exprimées dans des unités différentes",
    fiches: ["biais:ancrage"], ateliers: ["#chiffres/grandeurs"],
    // [grandeur, [valeur, unité, facteur vers l'unité de base] × 4]
    surfaces: [
      ["bouteille", "contient le plus", [[0.5, "L", 1000], [45, "cL", 10], [480, "mL", 1], [4.7, "dL", 100]]],
      ["planche", "est la plus longue", [[1.2, "m", 100], [115, "cm", 1], [1180, "mm", 0.1], [11.9, "dm", 10]]],
      ["colis", "est le plus lourd", [[2.5, "kg", 1000], [2400, "g", 1], [2.45, "kg", 1000], [2300000, "mg", 0.001]]],
      ["trajet", "dure le plus longtemps", [[1.5, "h", 60], [85, "min", 1], [5000, "s", 1 / 60], [1.3, "h", 60]]],
      ["carafe", "contient le plus", [[1.35, "L", 1000], [120, "cL", 10], [1300, "mL", 1], [12.5, "dL", 100]]],
      ["câble", "est le plus long", [[3.7, "m", 100], [340, "cm", 1], [3600, "mm", 0.1], [33, "dm", 10]]],
      ["sac de farine", "est le plus lourd", [[1.5, "kg", 1000], [1450, "g", 1], [1.6, "kg", 1000], [1400000, "mg", 0.001]]],
      ["film", "dure le plus longtemps", [[2.4, "h", 60], [135, "min", 1], [7800, "s", 1 / 60], [2.1, "h", 60]]],
      ["seau", "contient le plus", [[10.8, "L", 1000], [950, "cL", 10], [10500, "mL", 1], [98, "dL", 100]]],
      ["ruban", "est le plus long", [[0.8, "m", 100], [72, "cm", 1], [780, "mm", 0.1], [7.4, "dm", 10]]],
      ["pot de miel", "est le plus lourd", [[0.5, "kg", 1000], [480, "g", 1], [0.52, "kg", 1000], [490000, "mg", 0.001]]],
      ["cours", "dure le plus longtemps", [[0.75, "h", 60], [50, "min", 1], [2820, "s", 1 / 60], [0.9, "h", 60]]],
      ["arrosoir", "contient le plus", [[5.5, "L", 1000], [520, "cL", 10], [4800, "mL", 1], [49, "dL", 100]]],
      ["tuyau", "est le plus long", [[15.5, "m", 100], [1450, "cm", 1], [15200, "mm", 0.1], [148, "dm", 10]]],
      ["valise", "est la plus lourde", [[18, "kg", 1000], [17500, "g", 1], [18.4, "kg", 1000], [18200000, "mg", 0.001]]],
      ["répétition", "dure le plus longtemps", [[2.5, "h", 60], [140, "min", 1], [8700, "s", 1 / 60], [2.4, "h", 60]]],
      ["gourde", "contient le plus", [[0.85, "L", 1000], [70, "cL", 10], [800, "mL", 1], [7.2, "dL", 100]]],
      ["corde", "est la plus longue", [[8.3, "m", 100], [790, "cm", 1], [8200, "mm", 0.1], [78, "dm", 10]]],
      ["paquet de café", "est le plus lourd", [[0.25, "kg", 1000], [240, "g", 1], [0.26, "kg", 1000], [255000, "mg", 0.001]]],
      ["trajet en bus", "dure le plus longtemps", [[1.3, "h", 60], [75, "min", 1], [4200, "s", 1 / 60], [1.1, "h", 60]]]
    ]
  },
  {
    id: "b-points-pourcents", axe: "B", type: "qcm", generer: "pointsPourcents", difficulte: 2, mode: "note", aRelire: true,
    construit: "« Deux fois moins », points et pourcentages : une baisse de 4 % à 2 % est une baisse de 2 points, soit de moitié",
    fiches: ["biais:cadrage"], ateliers: ["#chiffres/graphiques"],
    // [taux avant %, taux après %]
    nombres: [[4, 2], [10, 8], [6, 3], [20, 15], [8, 6], [5, 4], [12, 9], [25, 20], [40, 30], [16, 12]],
    surfaces: [
      "La part des trains en retard sur une ligne", "La part des colis abîmés chez un transporteur", "La part des œufs cassés à la livraison",
      "La part des vols retardés dans un petit aéroport", "La part des commandes erronées dans une pizzeria", "La part des machines en panne dans une laverie",
      "La part des places vides au théâtre", "La part des pièces rejetées dans un atelier", "La part des billets invendus d'un festival",
      "La part des abonnés qui résilient chaque année", "La part des lampes défectueuses d'un lot", "La part des plants qui ne germent pas",
      "La part des appels sans réponse d'un service client", "La part des vélos en libre-service hors d'usage", "La part des livres rendus en retard",
      "La part des repas jetés à la cantine", "La part des fruits abîmés à l'arrivée", "La part des réservations annulées d'un gîte",
      "La part des bus partis en avance", "La part des enveloppes mal adressées"
    ]
  },
  {
    id: "b-monty-surcorrection", axe: "B", type: "qcm", generer: "montyIgnorant", difficulte: 3, mode: "note", aRelire: true, surCorrection: true,
    construit: "Sur-correction de Monty Hall : si la porte est ouverte au hasard, changer ne donne plus d'avantage",
    fiches: ["sophismes:sophisme-sophisme", "biais:taux-de-base"], ateliers: ["#tests/monty-hall"],
    // [objets au pluriel, objet au singulier (féminin ?), ce qui les ouvre au hasard, nombre]
    surfaces: [
      ["portes", "porte", true, "Un coup de vent ouvre au hasard une des autres portes", 3], ["boîtes", "boîte", true, "Un enfant, qui ne sait rien, ouvre au hasard une des autres boîtes", 3],
      ["enveloppes", "enveloppe", true, "Votre voisin, qui ne sait rien, ouvre au hasard une des autres enveloppes", 3], ["coffres", "coffre", false, "Un visiteur distrait ouvre au hasard un des autres coffres", 3],
      ["gobelets", "gobelet", false, "Le chat renverse au hasard un des autres gobelets", 3], ["casiers", "casier", false, "Un employé qui ignore tout ouvre au hasard un des autres casiers", 4],
      ["portes", "porte", true, "Un technicien, qui ne sait pas où est le lot, ouvre au hasard une des autres portes", 4], ["boîtes", "boîte", true, "Une secousse ouvre au hasard une des autres boîtes", 4],
      ["enveloppes", "enveloppe", true, "Un passant ouvre au hasard une des autres enveloppes", 5], ["coffres", "coffre", false, "Un enfant ouvre au hasard un des autres coffres", 5],
      ["tiroirs", "tiroir", false, "Votre ami, qui ne sait rien, ouvre au hasard un des autres tiroirs", 3], ["valises", "valise", true, "Un douanier qui ignore tout ouvre au hasard une des autres valises", 3],
      ["paquets", "paquet", false, "Un livreur ouvre au hasard un des autres paquets", 3], ["cartes", "carte", true, "Un courant d'air retourne au hasard une des autres cartes", 3],
      ["portes", "porte", true, "Une panne ouvre au hasard une des autres portes", 5], ["sacs", "sac", false, "Le présentateur, qui ignore où est le lot, ouvre au hasard un des autres sacs", 3],
      ["coquilles", "coquille", true, "Un spectateur soulève au hasard une des autres coquilles", 3], ["urnes", "urne", true, "Un assistant qui ne sait rien ouvre au hasard une des autres urnes", 4],
      ["pots", "pot", false, "Un enfant soulève au hasard un des autres pots", 3], ["écrins", "écrin", false, "Un enfant ouvre au hasard un des autres écrins", 4]
    ]
  }
);

// ===================== Axe C : peser les preuves =====================
// Familles conceptuelles : la structure de la bonne réponse et des leurres est fixée par la famille (champ « choix »,
// avec {x} remplacés par les éléments de la surface) ; la position des choix est tirée. Études fictives.

FAMILLES_GT.push(
  {
    id: "c-temoin", axe: "C", type: "qcm", generer: "conceptuel", champs: ["cadre", "intervention", "part", "mesure"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Groupe témoin : une amélioration après une intervention ne dit rien sans comparaison",
    fiches: ["sophismes:post-hoc"], ateliers: ["#tests/etudes"],
    texte: "{cadre} essaie {intervention} pendant trois mois. À la fin, {part} % des participants ont amélioré {mesure}.",
    question: "Que manque-t-il surtout pour attribuer cette amélioration à la nouveauté essayée ?",
    choix: ["Un groupe comparable, qui n'a pas essayé cette nouveauté, suivi pendant les mêmes trois mois.", "Davantage de participants, pour un pourcentage plus précis.",
      "Les témoignages des participants les plus satisfaits.", "L'avis de la personne qui a conçu cette nouveauté."],
    leurre: 1,
    explication: "Beaucoup de choses s'améliorent d'elles-mêmes avec le temps, l'habitude ou la saison. Sans groupe comparable, on ne sait pas ce qui se serait passé sans l'intervention. Plus de participants rendraient le chiffre plus précis, pas plus probant.",
    surfaces: [
      ["Un club de course", "un nouveau plan d'étirements", 75, "leur temps sur 5 km"], ["Une école", "une nouvelle méthode de lecture", 80, "leur vitesse de lecture"],
      ["Une entreprise", "une pause de dix minutes l'après-midi", 70, "leur nombre de dossiers traités"], ["Un club d'échecs", "un logiciel d'entraînement", 65, "leur classement"],
      ["Une chorale", "des exercices de respiration", 78, "la tenue de leurs notes longues"], ["Un centre de langues", "une application de vocabulaire", 72, "leur score de vocabulaire"],
      ["Un club de natation", "des séances de musculation", 68, "leur temps sur 100 m"], ["Une équipe de vente", "un nouveau script d'appel", 74, "leur nombre de ventes"],
      ["Un atelier de poterie", "un nouveau type de tour", 66, "la régularité de leurs bols"], ["Un club de tir à l'arc", "des séances de concentration", 71, "leur score moyen"],
      ["Une association de jardiniers", "un nouvel engrais", 77, "leur récolte de courgettes"], ["Une classe de musique", "un métronome connecté", 73, "leur régularité rythmique"],
      ["Un club de randonnée", "des bâtons d'un nouveau modèle", 69, "leur vitesse en montée"], ["Une boulangerie", "un nouveau planning", 76, "le nombre de fournées réussies"],
      ["Un centre de formation", "des fiches de révision illustrées", 79, "leur note à l'examen blanc"], ["Un club de cyclisme", "une nouvelle selle", 67, "leur distance parcourue sans pause"],
      ["Une troupe de théâtre", "des exercices de mémoire", 75, "le nombre de répliques sues"], ["Un service client", "un nouveau logiciel de réponses", 70, "leur nombre de demandes traitées"],
      ["Une équipe de basket", "un programme de sommeil", 72, "leur réussite aux lancers francs"], ["Un club de dactylographie", "un clavier ergonomique", 81, "leur vitesse de frappe"]
    ]
  },
  {
    id: "c-confusion", axe: "C", type: "qcm", generer: "conceptuel", champs: ["a", "b", "unite", "z"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Facteur de confusion : un troisième facteur peut produire les deux phénomènes à la fois",
    fiches: ["sophismes:correlation", "sophismes:cause-unique"], ateliers: ["#chiffres/correlation"],
    texte: "Dans une ville, {a} et {b} varient ensemble : les {unite} où l'on observe le plus de l'un sont aussi celles où l'on observe le plus de l'autre.",
    question: "Avant de conclure, quelle explication faut-il examiner ?",
    choix: ["Un troisième facteur, comme {z}, pourrait faire augmenter les deux à la fois.", "Le premier phénomène cause le second : le lien est net.",
      "Le lien prouve que {a} et {b} n'ont rien à voir l'un avec l'autre.", "Il suffit de vérifier que le lien existe aussi l'année suivante."],
    leurre: 1,
    explication: "Deux mesures peuvent monter ensemble parce qu'une même cause les fait monter toutes les deux. Retrouver le lien l'année suivante ne règle rien : le troisième facteur serait toujours là. Il faut comparer des situations où ce facteur est le même.",
    surfaces: [
      ["les ventes de glaces", "les coups de soleil", "semaines", "la chaleur"], ["les ventes de parapluies", "les retards de bus", "journées", "la pluie"],
      ["le nombre de pompiers envoyés", "les dégâts d'un incendie", "interventions", "la taille de l'incendie"], ["les ventes de chocolat chaud", "les rhumes", "semaines", "le froid"],
      ["le nombre de livres à la maison", "les notes des enfants", "familles", "le temps que les parents consacrent à l'école"], ["les ventes de crème solaire", "la fréquentation des piscines", "semaines", "l'ensoleillement"],
      ["le nombre de restaurants", "le nombre de pharmacies", "quartiers", "le nombre d'habitants"], ["les ventes de bottes", "les accidents de vélo", "semaines", "les routes mouillées"],
      ["la consommation d'électricité", "les ventes de soupe", "semaines", "le froid"], ["le nombre de pistes cyclables", "le nombre de cafés", "quartiers", "la densité de population"],
      ["les ventes de ventilateurs", "les ventes de limonade", "semaines", "la chaleur"], ["la taille des pieds", "la qualité de l'écriture", "enfants d'une école", "l'âge"],
      ["le nombre de touristes", "les embouteillages", "mois", "les vacances scolaires"], ["les ventes de pelles à neige", "les retards de train", "journées", "la neige"],
      ["le nombre de magasins de vélos", "le nombre de musées", "villes", "la taille de la ville"], ["la vente de barbecues", "les feux de broussailles", "mois", "la sécheresse"],
      ["le nombre de ventes de lunettes de soleil", "les entrées au zoo", "week-ends", "le beau temps"], ["le prix des maisons", "le nombre de boulangeries bio", "quartiers", "le revenu moyen des habitants"],
      ["les heures de jeu dehors", "les genoux écorchés", "journées d'été", "les vacances"], ["le nombre d'arrosages", "les ventes de chapeaux", "semaines", "la chaleur"]
    ]
  },
  {
    id: "c-causalite-inverse", axe: "C", type: "qcm", generer: "conceptuel", champs: ["a", "inverse", "direct"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Causalité inverse : le lien peut aller dans l'autre sens",
    fiches: ["sophismes:correlation"], ateliers: ["#chiffres/correlation"],
    texte: "Une enquête montre que {a}, plus que les autres.",
    question: "Quelle explication l'enquête ne permet-elle pas d'écarter ?",
    choix: ["C'est peut-être {inverse}, et non l'inverse.", "{Direct}, sans autre explication possible.",
      "Le lien est dû au hasard, puisqu'il ne concerne pas tout le monde.", "Le lien disparaîtrait avec un questionnaire plus long."],
    leurre: 1,
    explication: "Un lien entre deux choses ne dit pas laquelle entraîne l'autre. Ici, le sens inverse est au moins aussi plausible. Il faudrait suivre les mêmes personnes dans le temps, ou mieux, faire une expérience.",
    surfaces: [
      ["les personnes qui ont beaucoup d'amis sortent", "parce qu'on sort beaucoup qu'on se fait des amis", "Avoir des amis fait sortir"],
      ["les entreprises qui recrutent des informaticiens vendent", "parce qu'elles vendent beaucoup qu'elles peuvent recruter", "Recruter des informaticiens fait vendre"],
      ["les élèves qui aiment les mathématiques y réussissent", "parce qu'on y réussit qu'on finit par les aimer", "Aimer les mathématiques fait réussir"],
      ["les musiciens qui ont un bon instrument jouent bien", "parce qu'ils jouent bien qu'ils ont acheté un bon instrument", "Un bon instrument fait bien jouer"],
      ["les clubs qui ont beaucoup de supporteurs gagnent", "parce qu'ils gagnent qu'ils ont des supporteurs", "Les supporteurs font gagner"],
      ["les coureurs qui ont des chaussures chères courent vite", "parce qu'ils courent vite qu'ils investissent dans des chaussures chères", "Les chaussures chères font courir vite"],
      ["les restaurants qui ont une longue file d'attente sont bien notés", "parce qu'ils sont bien notés qu'il y a la queue", "La file d'attente rend le restaurant meilleur"],
      ["les jardiniers qui ont un grand potager y passent du temps", "parce qu'ils aiment y passer du temps qu'ils ont agrandi leur potager", "Un grand potager fait passer du temps"],
      ["les personnes qui lisent la rubrique scientifique s'intéressent aux sciences", "parce qu'elles s'intéressent aux sciences qu'elles lisent cette rubrique", "Lire la rubrique donne de l'intérêt pour les sciences"],
      ["les magasins qui ont beaucoup de vendeurs ont beaucoup de clients", "parce qu'ils ont beaucoup de clients qu'ils emploient des vendeurs", "Les vendeurs attirent les clients"],
      ["les chanteurs qui ont un agent connu passent à la radio", "parce qu'ils passent à la radio qu'un agent connu s'intéresse à eux", "L'agent fait passer à la radio"],
      ["les joueurs d'échecs qui achètent des livres d'échecs gagnent", "parce qu'ils progressent qu'ils achètent des livres plus avancés", "Les livres font gagner"],
      ["les auteurs qui ont un éditeur réputé vendent", "parce qu'ils vendent bien qu'un éditeur réputé les publie", "L'éditeur fait vendre"],
      ["les villes qui ont beaucoup d'hôtels attirent des touristes", "parce qu'elles attirent des touristes qu'on y construit des hôtels", "Les hôtels attirent les touristes"],
      ["les étudiants assis au premier rang ont de bonnes notes", "parce qu'ils sont motivés et à l'aise qu'ils s'assoient devant", "Le premier rang donne de bonnes notes"],
      ["les nageurs qui possèdent une montre de natation nagent longtemps", "parce qu'ils nagent beaucoup qu'ils ont acheté une montre", "La montre fait nager plus longtemps"],
      ["les cafés qui ont une terrasse sont fréquentés", "parce qu'ils sont fréquentés qu'ils ont pu ouvrir une terrasse", "La terrasse attire la clientèle"],
      ["les associations qui ont un site soigné ont beaucoup de bénévoles", "parce qu'elles ont des bénévoles que l'une d'eux a pu soigner le site", "Le site attire des bénévoles"],
      ["les cuisiniers qui ont des couteaux chers cuisinent bien", "parce qu'ils cuisinent beaucoup qu'ils ont acheté de bons couteaux", "Les couteaux chers font bien cuisiner"],
      ["les quartiers qui ont une librairie ont beaucoup de lecteurs", "parce qu'il y a des lecteurs qu'une librairie s'y est installée", "La librairie crée des lecteurs"]
    ]
  },
  {
    id: "c-selection", axe: "C", type: "qcm", generer: "conceptuel", champs: ["source", "conclusion", "probleme", "n"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Biais de sélection : ceux que l'on voit ou qui répondent ne représentent pas tout le monde",
    fiches: ["biais:survivant", "sophismes:generalisation-hative"], ateliers: ["#tests/wald"],
    texte: "{source} Conclusion : « {conclusion} »",
    question: "Quel est le principal problème de ce raisonnement ?",
    choix: ["{probleme}", "{n} réponses, c'est assez pour conclure : le problème ne vient pas de là.",
      "Il faudrait poser la même question une deuxième fois aux mêmes personnes.", "La conclusion est fausse, puisque toute enquête se trompe."],
    leurre: 1,
    explication: "Le nombre de réponses ne corrige pas la façon dont elles ont été recueillies. Si l'on n'entend que ceux qui restent, qui réussissent ou qui ont envie de répondre, l'image est déformée. Il faut se demander qui manque.",
    surfaces: [
      ["Un magazine de jardinage demande à ses lecteurs de dire, en ligne, s'ils aiment jardiner. 1 200 répondent, dont 97 % de oui.", "La plupart des gens aiment jardiner.", "Seuls des lecteurs d'un magazine de jardinage, volontaires de surcroît, ont répondu.", 1200],
      ["Un club de sport interroge ses membres présents en janvier : 90 % se disent très motivés.", "Nos inscrits restent motivés toute l'année.", "Les membres qui ont abandonné ne sont plus là pour répondre.", 300],
      ["Un restaurant laisse des cartes d'avis sur ses tables ; les clients remplissent celles qu'ils veulent. 400 cartes, 92 % de très satisfaits.", "Nos clients sont presque tous ravis.", "Ce sont surtout les clients enthousiastes qui prennent la peine de remplir une carte.", 400],
      ["Une école de musique interroge ses élèves de cinquième année : 95 % adorent le solfège.", "Le solfège plaît à presque tous les élèves.", "Les élèves qui n'aimaient pas le solfège ont pu arrêter avant la cinquième année.", 200],
      ["Un site de voyage publie les avis de ses clients rentrés de vacances : 88 % recommandent l'agence.", "Presque tous les voyageurs sont contents de l'agence.", "Seuls les clients qui ont choisi de laisser un avis sont comptés.", 2500],
      ["Une émission de radio demande aux auditeurs d'appeler pour dire s'ils écoutent la radio chaque jour : 85 % de oui.", "La plupart des gens écoutent la radio chaque jour.", "Seuls des auditeurs de l'émission, en train d'écouter, peuvent appeler.", 600],
      ["Une marque de vélos interroge les propriétaires qui ont leur vélo depuis dix ans : 93 % le trouvent très solide.", "Nos vélos sont très solides.", "Les propriétaires dont le vélo a cassé ne l'ont plus depuis dix ans.", 800],
      ["Une entreprise interroge ses employés qui ont plus de quinze ans d'ancienneté : 90 % s'y plaisent.", "Presque tout le monde se plaît dans l'entreprise.", "Ceux qui ne s'y plaisaient pas sont partis avant quinze ans.", 350],
      ["Un club de randonnée sonde les participants à sa sortie de 30 km : 96 % trouvent la distance idéale.", "30 km est la distance idéale pour tous.", "Ceux qui trouvent 30 km trop long ne sont pas venus.", 150],
      ["Une application de méditation demande à ses utilisateurs actifs s'ils se sentent plus calmes : 89 % disent oui.", "L'application rend presque tout le monde plus calme.", "Ceux qui n'en tiraient rien ont désinstallé l'application.", 5000],
      ["Une librairie demande aux clients présents un samedi s'ils lisent plus de dix livres par an : 80 % de oui.", "La plupart des gens lisent plus de dix livres par an.", "Les clients d'une librairie un samedi lisent plus que la moyenne.", 250],
      ["Une plateforme de cours en ligne interroge ceux qui ont fini le cours : 94 % le jugent clair.", "Le cours est clair pour presque tous.", "Ceux qui l'ont trouvé obscur ont souvent abandonné avant la fin.", 1800],
      ["Un forum de passionnés de trains demande qui préfère le train à l'avion : 98 % le train.", "Presque tout le monde préfère le train.", "Les membres d'un forum de passionnés de trains ne représentent pas les voyageurs.", 700],
      ["Un salon de coiffure interroge les clients qui reviennent régulièrement : 95 % sont très satisfaits.", "Presque tous nos clients sont très satisfaits.", "Les clients mécontents ne reviennent pas et ne sont pas interrogés.", 220],
      ["Une compagnie de ferries interroge les passagers arrivés à bon port par mer calme : 91 % ont apprécié la traversée.", "La traversée plaît à presque tout le monde.", "Seuls les passagers d'une traversée calme ont été interrogés.", 640],
      ["Un club de théâtre amateur interroge les spectateurs restés jusqu'à la fin : 90 % ont aimé la pièce.", "La pièce a plu à presque tout le public.", "Les spectateurs partis à l'entracte n'ont pas été interrogés.", 180],
      ["Une jardinerie affiche les photos envoyées par des clients dont les plantes ont prospéré.", "Nos plantes prospèrent chez tous les clients.", "On ne voit que les photos des réussites, pas les plantes mortes.", 90],
      ["Une salle d'escalade interroge les grimpeurs présents à 21 heures : 85 % préfèrent grimper le soir.", "La plupart des grimpeurs préfèrent le soir.", "Ceux qui grimpent le matin ne sont pas là à 21 heures.", 120],
      ["Un fabricant de montres interroge les acheteurs qui ont fait réparer leur montre chez lui : 92 % sont satisfaits.", "Nos réparations satisfont presque tout le monde.", "Ceux qui ont fait réparer ailleurs ou jeté leur montre ne sont pas interrogés.", 430],
      ["Une ludothèque interroge les familles qui empruntent chaque semaine : 94 % jouent ensemble tous les jours.", "La plupart des familles jouent ensemble tous les jours.", "Les familles qui empruntent chaque semaine sont justement celles qui jouent le plus.", 160]
    ]
  },
  {
    id: "c-attente", axe: "C", type: "qcm", generer: "conceptuel", champs: ["objet", "effet", "faux"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Effet d'attente (placebo) : savoir ce que l'on reçoit peut suffire à changer ce que l'on ressent",
    fiches: ["biais:confirmation"], ateliers: ["#tests/etudes"],
    texte: "Des volontaires reçoivent {objet}, en sachant ce que c'est. Une semaine plus tard, la plupart déclarent {effet}.",
    question: "Quelle comparaison permettrait de savoir si ce produit y est pour quelque chose ?",
    choix: ["Donner à d'autres volontaires, tirés au sort, {faux}, sans que personne sache qui a reçu quoi.", "Interroger les mêmes volontaires une semaine de plus.",
      "Demander aux volontaires s'ils sont certains de leur réponse.", "Choisir des volontaires qui croient déjà à ce produit."],
    leurre: 1,
    explication: "Quand on sait ce que l'on reçoit, l'attente peut à elle seule changer ce que l'on ressent et ce que l'on déclare. Il faut comparer à un groupe qui reçoit une imitation, sans savoir laquelle des deux il a. Interroger plus longtemps ne sépare pas l'effet de l'attente.",
    surfaces: [
      ["un oreiller « ergonomique »", "mieux dormir", "un oreiller ordinaire d'apparence identique"], ["un bracelet « énergisant »", "se sentir plus en forme", "un bracelet identique sans propriété annoncée"],
      ["une musique « de concentration »", "mieux se concentrer", "une musique quelconque présentée de la même façon"], ["une tisane « relaxante »", "se sentir plus détendus", "une tisane ordinaire au même goût"],
      ["des lunettes « anti-fatigue »", "avoir moins mal aux yeux le soir", "des lunettes à verres neutres identiques"], ["une lampe « bien-être »", "avoir meilleur moral", "une lampe ordinaire de même forme"],
      ["des semelles « dynamisantes »", "avoir moins mal aux pieds", "des semelles ordinaires d'aspect identique"], ["un parfum d'ambiance « apaisant »", "se sentir plus calmes", "un parfum ordinaire présenté de la même façon"],
      ["une boisson « de récupération »", "se sentir moins fatigués après le sport", "une boisson ordinaire au même goût"], ["un coussin « posture »", "avoir moins mal au dos au bureau", "un coussin ordinaire d'aspect identique"],
      ["un tapis « d'éveil »", "se sentir plus énergiques le matin", "un tapis ordinaire identique"], ["une application de « sons apaisants »", "s'endormir plus vite", "une application de sons quelconques présentée pareil"],
      ["un stylo « mémoire »", "mieux retenir leurs cours", "un stylo ordinaire identique"], ["des bouchons d'oreilles « haute technologie »", "être moins gênés par le bruit", "des bouchons ordinaires d'aspect identique"],
      ["une couverture « lestée de luxe »", "mieux dormir", "une couverture ordinaire de même poids"], ["un gant « anti-stress »", "être moins tendus", "un gant ordinaire identique"],
      ["un diffuseur « vitalité »", "se sentir plus en forme", "un diffuseur ordinaire présenté pareil"], ["un bonnet « chauffant »", "avoir moins froid", "un bonnet ordinaire d'aspect identique"],
      ["une gourde « structurante »", "avoir moins soif", "une gourde ordinaire identique"], ["un clavier « anti-fatigue »", "avoir moins mal aux poignets", "un clavier ordinaire d'aspect identique"]
    ]
  },
  {
    id: "c-hypothese", axe: "C", type: "qcm", generer: "conceptuel", champs: ["argument", "hypothese", "leurre", "autre1", "autre2"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Hypothèse implicite : un raisonnement repose souvent sur une prémisse qu'il ne dit pas",
    fiches: ["sophismes:petition-principe", "sophismes:faux-dilemme"], ateliers: ["#tests/demonter"],
    texte: "« {argument} »",
    question: "Sur quelle hypothèse, non dite, ce raisonnement repose-t-il ?",
    choix: ["{hypothese}", "{leurre}", "{autre1}", "{autre2}"],
    leurre: 1,
    explication: "Une conclusion découle des raisons données seulement si une prémisse cachée est vraie. La repérer permet de la discuter. Les autres propositions ne sont pas nécessaires au raisonnement.",
    surfaces: [
      ["Ce restaurant est plein tous les soirs, donc la cuisine y est excellente.", "Un restaurant plein l'est à cause de la qualité de sa cuisine.", "Le restaurant est ouvert tous les soirs.", "Le restaurant est cher.", "Les clients viennent de loin."],
      ["Ce livre s'est vendu à un million d'exemplaires : il est donc bien écrit.", "Les ventes d'un livre reflètent la qualité de son écriture.", "Le livre a été traduit.", "L'auteur a écrit d'autres livres.", "Le livre est long."],
      ["Ce candidat a fait des études longues, il saura donc gérer l'équipe.", "Des études longues rendent capable de gérer une équipe.", "Le candidat a obtenu son diplôme.", "L'équipe est grande.", "Le candidat a postulé à temps."],
      ["Cette plante pousse dans la nature, elle est donc sans danger.", "Ce qui est naturel est sans danger.", "La plante est verte.", "La plante pousse vite.", "La plante est rare."],
      ["Mon voisin a arrêté le café et dort mieux : le café empêche de dormir.", "Rien d'autre n'a changé dans la vie de mon voisin à ce moment-là.", "Mon voisin buvait du café.", "Le café est une boisson chaude.", "Mon voisin dort la nuit."],
      ["Cette méthode est utilisée depuis cent ans, elle est donc efficace.", "Ce qui dure depuis longtemps a fait la preuve de son efficacité.", "La méthode a été inventée il y a cent ans.", "La méthode est connue.", "La méthode est simple."],
      ["L'équipe a gagné les trois matchs où l'entraîneur portait sa veste rouge : il doit la remettre.", "La veste a une influence sur le résultat des matchs.", "L'entraîneur possède une veste rouge.", "L'équipe a joué trois matchs.", "L'entraîneur assiste aux matchs."],
      ["Ce produit est le plus cher du rayon, c'est donc le meilleur.", "Le prix d'un produit reflète sa qualité.", "Le rayon compte plusieurs produits.", "Le produit est en stock.", "Le magasin est ouvert."],
      ["Tout le monde au bureau utilise ce logiciel : c'est le meilleur choix.", "Le choix de la majorité est forcément le meilleur.", "Le bureau a acheté des licences.", "Le logiciel fonctionne sur les ordinateurs du bureau.", "Les employés savent lire."],
      ["Cet expert en physique dit que ce régime est bon : il faut le suivre.", "Un expert d'un domaine est compétent dans un autre.", "L'expert existe vraiment.", "Le régime a un nom.", "L'expert parle français."],
      ["Il n'a pas répondu à mon message : il est fâché contre moi.", "Une absence de réponse ne peut s'expliquer que par la fâcherie.", "J'ai envoyé un message.", "Il a un téléphone.", "Nous nous connaissons."],
      ["La nouvelle route a été ouverte et les accidents ont baissé : la route a rendu la ville plus sûre.", "Aucune autre cause n'explique la baisse des accidents.", "La route a coûté cher.", "La route est longue.", "La ville a des habitants."],
      ["Cette pièce de théâtre a été écrite par un auteur célèbre, elle sera donc réussie.", "Tout ce qu'écrit un auteur célèbre est réussi.", "La pièce sera jouée.", "L'auteur est vivant.", "La pièce a un titre."],
      ["On n'a jamais prouvé que ce porte-bonheur ne marche pas, donc il marche.", "L'absence de preuve contraire suffit à prouver une chose.", "Le porte-bonheur existe.", "Quelqu'un l'a acheté.", "Il est petit."],
      ["Ce quartier a peu de commerces, donc ses habitants n'aiment pas faire les courses.", "Le nombre de commerces reflète ce qu'aiment les habitants.", "Le quartier a des habitants.", "Les commerces vendent des produits.", "Le quartier a des rues."],
      ["Cette école a les meilleurs résultats de la ville, ses professeurs sont donc les meilleurs.", "Les résultats d'une école ne dépendent que de ses professeurs.", "L'école a des élèves.", "Les résultats sont publiés.", "La ville a plusieurs écoles."],
      ["Ce vélo est italien, il est donc rapide.", "Tous les vélos italiens sont rapides.", "Le vélo a des roues.", "Le vélo est neuf.", "Le vélo a été acheté en Italie."],
      ["Le dernier film de ce réalisateur était mauvais, le prochain le sera aussi.", "La qualité d'un film prédit celle du suivant.", "Le réalisateur prépare un film.", "Le dernier film est sorti.", "Le réalisateur a une équipe."],
      ["Cette entreprise fait des bénéfices, elle traite donc bien ses employés.", "Une entreprise rentable traite forcément bien ses employés.", "L'entreprise a des employés.", "L'entreprise paie des impôts.", "L'entreprise a un siège."],
      ["Mon grand-père a fumé toute sa vie et a vécu vieux, donc fumer n'est pas dangereux.", "Un seul cas suffit à juger d'un risque pour tous.", "Mon grand-père a existé.", "Il a eu des enfants.", "Il habitait en ville."]
    ]
  },
  {
    id: "c-conclusion-excessive", axe: "C", type: "qcm", generer: "conceptuel", champs: ["qui", "resultat", "titre", "limite"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Conclusion excessive : une étude ne vaut que pour ce qu'elle a mesuré, et sur qui",
    fiches: ["sophismes:generalisation-hative"], ateliers: ["#tests/etudes"],
    texte: "Une étude (fictive) menée sur {qui} montre que {resultat}. Un article titre : « {titre} ».",
    question: "Que peut-on dire de ce titre ?",
    choix: ["Il va au-delà de l'étude : {limite}.", "Il est justifié, puisque l'étude est scientifique.", "Il est faux, puisqu'une seule étude ne prouve jamais rien.", "Il est justifié si l'étude a été publiée récemment."],
    leurre: 1,
    explication: "Une étude répond à une question précise, sur des participants précis, dans des conditions précises. Étendre la conclusion à d'autres personnes ou à d'autres situations demande d'autres preuves. Cela ne rend pas l'étude inutile pour autant.",
    surfaces: [
      ["30 souris", "un nouvel aliment ralentit leur prise de poids", "Cet aliment fait maigrir", "elle porte sur des souris, pas sur des humains"],
      ["20 étudiants d'une université", "écouter du piano améliore la mémorisation d'une liste de mots", "La musique rend plus intelligent", "elle porte sur une seule tâche et peu de participants"],
      ["des plants de tomates en serre", "un engrais augmente la récolte de 10 %", "Cet engrais double les récoltes de tous les potagers", "elle porte sur des tomates en serre, et la hausse est de 10 %"],
      ["40 cyclistes professionnels", "une boisson améliore leur récupération", "Cette boisson est bonne pour tout le monde", "elle porte sur des sportifs de haut niveau"],
      ["une classe de 25 élèves pendant un mois", "une méthode de lecture améliore la vitesse de lecture", "Cette méthode va transformer l'école", "elle porte sur une classe et une durée courte"],
      ["12 chiens d'un refuge", "une musique douce réduit leurs aboiements", "La musique douce calme tous les animaux", "elle porte sur douze chiens d'un seul refuge"],
      ["50 employés d'une entreprise", "le télétravail le vendredi améliore leur satisfaction", "Le télétravail rend tous les salariés heureux", "elle porte sur une entreprise et un seul jour par semaine"],
      ["des abeilles en laboratoire", "une odeur les attire davantage", "Cette odeur sauvera les abeilles", "elle porte sur une préférence en laboratoire"],
      ["15 joueurs d'échecs", "une sieste avant une partie réduit les erreurs", "La sieste rend plus intelligent", "elle porte sur peu de joueurs et une seule activité"],
      ["des cellules en culture", "une substance ralentit leur croissance", "Cette substance soigne les maladies", "elle porte sur des cellules en laboratoire, pas sur des personnes"],
      ["60 personnes âgées d'un village", "marcher chaque jour améliore leur équilibre", "La marche évite toutes les chutes", "elle porte sur l'équilibre, pas sur les chutes elles-mêmes"],
      ["une équipe de football pendant une saison", "un échauffement plus long réduit les blessures musculaires", "L'échauffement supprime les blessures", "elle porte sur une équipe et réduit, sans supprimer"],
      ["30 jeunes vignes", "une taille différente augmente le nombre de grappes", "Cette taille donne un meilleur vin", "elle mesure le nombre de grappes, pas la qualité du vin"],
      ["des volontaires pendant une semaine", "une lumière bleue le matin les rend plus alertes", "La lumière bleue améliore la santé", "elle porte sur la vigilance pendant une semaine"],
      ["25 poules d'un élevage", "un grain enrichi augmente la taille des œufs", "Ce grain rend les œufs plus nutritifs", "elle mesure la taille des œufs, pas leur valeur nutritive"],
      ["40 étudiants en musique", "répéter le matin améliore leur précision", "Le matin est le meilleur moment pour apprendre", "elle porte sur des musiciens et une seule compétence"],
      ["des poissons d'aquarium", "un éclairage différent change leur nage", "L'éclairage change le comportement de tous les animaux", "elle porte sur des poissons d'aquarium"],
      ["18 coureurs amateurs", "un nouveau modèle de chaussure réduit leur temps de 2 %", "Ces chaussures font gagner les courses", "elle porte sur peu de coureurs et un gain de 2 %"],
      ["une école pendant un trimestre", "un potager scolaire augmente la consommation de légumes à la cantine", "Les potagers rendent les enfants végétariens", "elle mesure une hausse de consommation, pas un changement de régime"],
      ["des plants de blé en pot", "un champignon du sol accélère la croissance des racines", "Ce champignon va nourrir le monde", "elle porte sur des racines de plants en pot"]
    ]
  },
  {
    id: "c-information-utile", axe: "C", type: "qcm", generer: "conceptuel", champs: ["situation", "utile", "leurre", "autre1", "autre2"], difficulte: 2, mode: "note", aRelire: true,
    construit: "Information manquante utile : savoir quelle donnée trancherait la question",
    fiches: ["sophismes:cherry-picking", "biais:survivant"], ateliers: ["#tests/laterale"],
    texte: "{situation}",
    question: "Quelle information vous aiderait le plus à en juger ?",
    choix: ["{utile}", "{leurre}", "{autre1}", "{autre2}"],
    leurre: 1,
    explication: "Une information utile est celle qui pourrait changer la conclusion. Les précisions qui rendent l'histoire plus vivante, ou qui confirment ce qu'on sait déjà, n'aident pas à trancher.",
    surfaces: [
      ["Un vendeur affirme que 300 clients ont amélioré leur sommeil grâce à son matelas.", "Combien de clients ont acheté ce matelas en tout.", "Les noms des 300 clients.", "La couleur du matelas.", "Le prix du matelas."],
      ["Une école affiche : « 15 de nos anciens élèves sont devenus ingénieurs. »", "Combien d'élèves sont passés par l'école en tout.", "Le nom de leurs entreprises.", "L'année de fondation de l'école.", "Le nombre de salles de classe."],
      ["Un club dit avoir gagné « la plupart de ses matchs à domicile ».", "Combien de matchs il a joués à domicile, et contre qui.", "Le nom de son stade.", "La couleur de son maillot.", "Le nombre de supporteurs présents."],
      ["Une application affirme que ses utilisateurs ont perdu « jusqu'à 10 kilos ».", "La perte moyenne de tous les utilisateurs.", "Le témoignage de celui qui a perdu 10 kilos.", "Le nombre de téléchargements.", "La note de l'application."],
      ["Un voisin dit que la nouvelle boulangerie est « toujours pleine ».", "À quelles heures il y est passé, et combien de fois.", "Le nom du boulanger.", "Les horaires d'ouverture affichés.", "Le prix de la baguette."],
      ["Un article dit que les vols de vélos ont « explosé » dans la ville.", "Le nombre de vols, d'une année sur l'autre, et le nombre de vélos.", "Le témoignage d'une victime.", "La marque des vélos volés.", "Le nom du journaliste."],
      ["Un fabricant annonce que son aspirateur est « le plus vendu de France ».", "Le classement de satisfaction et de pannes des aspirateurs.", "Le nombre de magasins qui le vendent.", "Sa couleur.", "Le nom de son inventeur."],
      ["Un ami affirme que ce raccourci fait gagner du temps.", "La durée des deux trajets, mesurée plusieurs fois.", "Le nombre de virages du raccourci.", "Le nom de la rue.", "Le souvenir d'un trajet rapide."],
      ["Un site dit que « 9 dentistes sur 10 » recommandent un dentifrice.", "Comment les dentistes ont été choisis et ce qu'on leur a demandé.", "Le goût du dentifrice.", "Le prix du dentifrice.", "Le nom du site."],
      ["Une ville affirme que sa nouvelle piste cyclable « est un succès ».", "Le nombre de cyclistes avant et après, aux mêmes saisons.", "Le coût de la piste.", "La couleur du marquage.", "Le nom de l'architecte."],
      ["Un professeur dit que sa méthode « marche avec tous les élèves ».", "Les résultats de ses élèves comparés à ceux d'une classe semblable.", "Le nombre d'années d'enseignement du professeur.", "Le titre de sa méthode.", "Le nombre d'élèves qui l'apprécient."],
      ["Une boutique affiche « prix cassés : jusqu'à −70 % ».", "La part des articles réellement soldés à −70 %.", "Le nombre de vitrines.", "Le nom de la marque.", "La date de création de la boutique."],
      ["Un horoscope a « parfaitement prédit » la semaine d'une collègue.", "Combien de prédictions ont échoué, chez elle et chez les autres.", "Le signe de la collègue.", "Le nom de l'astrologue.", "Le journal où il paraît."],
      ["Un fabricant dit que sa peinture « tient dix ans ».", "Des mesures de tenue sur des murs réels, dans des conditions variées.", "Le nombre de couleurs disponibles.", "Le prix du pot.", "La photo d'un mur fraîchement peint."],
      ["Un club de lecture affirme que ses membres lisent « beaucoup plus qu'avant ».", "Le nombre de livres lus avant et après l'inscription, pour tous les membres.", "Le titre du dernier livre lu.", "Le jour des réunions.", "Le nom de la présidente."],
      ["Un candidat à un poste affirme qu'il a « toujours atteint ses objectifs ».", "Quels étaient ces objectifs, et qui les a fixés.", "Le nom de ses anciens collègues.", "Sa tenue lors de l'entretien.", "Le nombre de pages de son CV."],
      ["Une marque de croquettes dit que les chiens « les préfèrent ».", "Ce qu'on proposait à côté, et à combien de chiens.", "La photo d'un chien qui mange.", "Le prix du sac.", "La couleur de l'emballage."],
      ["Une agence dit que ses voyages sont « les mieux notés ».", "Qui note, et combien de voyageurs ont noté.", "Le nombre de destinations.", "Le nom de l'agence.", "La photo d'une plage."],
      ["Un magazine affirme qu'un quartier est « devenu dangereux ».", "Les chiffres des incidents sur plusieurs années, rapportés au nombre d'habitants.", "Le témoignage d'un commerçant inquiet.", "Le nom des rues du quartier.", "La date de construction des immeubles."],
      ["Un coach affirme que ses élèves « progressent tous en un mois ».", "La progression moyenne, y compris de ceux qui ont abandonné.", "Le nombre de ses abonnés.", "Le prix de ses séances.", "La photo de son meilleur élève."]
    ]
  },
  {
    id: "c-causalite-surcorrection", axe: "C", type: "qcm", generer: "conceptuel", champs: ["intervention", "n", "qui", "mesure"], difficulte: 2, mode: "note", aRelire: true, surCorrection: true,
    construit: "Sur-correction : une expérience bien faite, avec tirage au sort, permet de conclure à un effet",
    fiches: ["sophismes:sophisme-sophisme", "sophismes:correlation"], ateliers: ["#tests/etudes"],
    texte: "Pour tester {intervention}, des chercheurs (fictifs) tirent au sort {n} {qui} : la moitié suit {intervention}, l'autre moitié non, pendant la même période. Les personnes qui mesurent {mesure} ne savent pas qui a suivi quoi. Le groupe qui en a bénéficié progresse nettement plus, et l'écart est bien au-delà de ce que le hasard expliquerait.",
    question: "Que peut-on conclure ?",
    choix: ["Que l'intervention testée a amélioré {mesure}, dans ces conditions.", "Rien : une corrélation n'est jamais une causalité.",
      "Que l'intervention testée marchera pour tout le monde, partout.", "Rien, tant que tous les {qui} n'ont pas essayé."],
    leurre: 1, preuveSuffisante: true,
    explication: "Le tirage au sort rend les deux groupes comparables : la seule différence systématique est l'intervention. C'est précisément ce qui permet de conclure à un effet, dans les conditions de l'expérience.",
    surfaces: [
      ["une méthode de révision", 400, "élèves", "les notes"], ["un programme d'étirements", 300, "coureurs", "la souplesse"], ["un engrais", 200, "parcelles", "la récolte"],
      ["une méthode de vocabulaire", 360, "apprenants", "le score de vocabulaire"], ["un horaire de cantine", 240, "écoliers", "les restes jetés"], ["une formation au tri", 500, "foyers", "la qualité du tri"],
      ["un éclairage de bureau", 180, "employés", "le nombre d'erreurs de saisie"], ["un exercice d'équilibre", 220, "danseurs", "l'équilibre"], ["une technique d'arrosage", 300, "jardins", "la consommation d'eau"],
      ["une méthode de lecture", 420, "enfants", "la vitesse de lecture"], ["un programme d'échauffement", 280, "footballeurs", "les blessures musculaires"], ["un rappel par message", 600, "patients d'un cabinet", "les rendez-vous manqués"],
      ["une fiche de sécurité", 340, "ouvriers", "les erreurs de manipulation"], ["un plan de rangement", 160, "entrepôts", "le temps de préparation"], ["une méthode de mémorisation", 260, "étudiants", "le rappel de listes"],
      ["un tutorat entre élèves", 380, "collégiens", "les résultats en mathématiques"], ["une alimentation de poules", 200, "poulaillers", "la ponte"], ["un conseil d'économie d'énergie", 700, "logements", "la consommation électrique"],
      ["un entraînement au calcul mental", 320, "élèves", "la vitesse de calcul"], ["un nouveau formulaire", 450, "usagers", "les erreurs de remplissage"]
    ]
  },
  {
    id: "c-preuve-surcorrection", axe: "C", type: "qcm", generer: "conceptuel", champs: ["nombre", "sujet", "resultat"], difficulte: 2, mode: "note", aRelire: true, surCorrection: true,
    construit: "Sur-correction : des preuves solides et convergentes justifient une conclusion, même révisable",
    fiches: ["sophismes:sophisme-sophisme", "sophismes:nirvana"], ateliers: ["#tests/qui-prouve"],
    texte: "Dans un pays imaginaire, {nombre} équipes indépendantes, avec des méthodes différentes, ont étudié {sujet}. Toutes trouvent que {resultat}. Les données sont publiques et les analyses ont été refaites par d'autres.",
    question: "Que peut-on raisonnablement conclure ?",
    choix: ["Que {resultat} : la conclusion est solide, même si elle peut être précisée.", "Rien : la science peut toujours se tromper, donc aucune conclusion n'est possible.",
      "Il faut attendre une seule grande étude définitive avant de conclure.", "Que la question est réglée pour toujours et ne sera jamais revue."],
    leurre: 1, preuveSuffisante: true,
    explication: "Plusieurs preuves indépendantes qui convergent rendent une conclusion bien plus fiable qu'une seule. Elle reste révisable si de nouvelles données la contredisent. Rejeter toute conclusion au nom du doute n'est pas de l'esprit critique.",
    surfaces: [
      [5, "l'effet d'une haie sur le vent dans les champs", "une haie réduit la force du vent derrière elle"], [4, "l'effet du sel sur le gel des routes", "le sel fait fondre la glace à des températures modérées"],
      [6, "la durée de vie des piles selon la température", "les piles se déchargent plus vite au froid"], [3, "l'effet de l'arrosage sur les tomates", "un arrosage régulier augmente la récolte"],
      [5, "l'usure des pneus selon la pression", "des pneus sous-gonflés s'usent plus vite"], [4, "le bruit en classe et la compréhension des consignes", "le bruit diminue la compréhension"],
      [6, "l'effet de la lumière sur la pousse du basilic", "le basilic pousse mieux avec plus de lumière"], [4, "le sommeil et la mémorisation", "une nuit de sommeil aide à retenir ce qu'on a appris la veille"],
      [5, "l'isolation des toits et le chauffage", "un toit isolé réduit la consommation de chauffage"], [3, "le vent et la vitesse des cyclistes", "le vent de face ralentit les cyclistes"],
      [5, "la répétition espacée et l'apprentissage du vocabulaire", "réviser à intervalles espacés aide à retenir"], [4, "la ventilation et l'humidité des salles de bain", "aérer réduit l'humidité"],
      [6, "l'ombre des arbres et la température des rues", "les rues ombragées sont plus fraîches en été"], [4, "le paillage et l'évaporation dans les jardins", "le paillage limite l'évaporation"],
      [5, "l'entraînement et la vitesse de frappe au clavier", "s'entraîner augmente la vitesse de frappe"], [3, "la taille des assiettes et les portions servies", "on se sert davantage dans de grandes assiettes"],
      [4, "la chaleur et la conservation du lait", "le lait se conserve moins longtemps à la chaleur"], [5, "les pauses et les erreurs au travail", "des pauses régulières réduisent les erreurs"],
      [6, "les ralentisseurs et la vitesse des voitures", "les ralentisseurs font baisser la vitesse"], [4, "l'éclairage des rues et les chutes de piétons la nuit", "un meilleur éclairage réduit les chutes"]
    ]
  }
);

// ===================== Démonstrations de mémoire (jamais notées) =====================
// Listes de mots associés (paradigme DRM, Roediger et McDermott, 1995) : listes ORIGINALES en français, sans normes
// françaises publiées connues ; la démonstration n'est pas normative. [mot critique (jamais présenté), mots étudiés,
// mots sans rapport pour la reconnaissance]
const LISTES_DRM_GT = [
  ["sommeil", ["lit", "repos", "nuit", "rêve", "oreiller", "fatigue", "couverture", "bâiller", "sieste", "ronfler"], ["fourchette", "planète"]],
  ["froid", ["neige", "glace", "hiver", "gel", "frisson", "givre", "bonnet", "écharpe", "grelotter", "pôle"], ["violon", "pinceau"]],
  ["musique", ["note", "chanson", "piano", "concert", "mélodie", "rythme", "orchestre", "chanteur", "guitare", "partition"], ["carotte", "tunnel"]],
  ["pain", ["beurre", "farine", "boulanger", "croûte", "mie", "baguette", "four", "levure", "tartine", "miette"], ["étoile", "ciseaux"]],
  ["montagne", ["sommet", "neige", "pente", "rocher", "col", "alpiniste", "vallée", "chalet", "altitude", "glacier"], ["cuillère", "trompette"]],
  ["mer", ["vague", "plage", "sel", "bateau", "marée", "sable", "océan", "écume", "phare", "rivage"], ["agrafe", "chaussette"]],
  ["fruit", ["pomme", "poire", "orange", "cerise", "banane", "fraise", "jus", "verger", "mûr", "noyau"], ["marteau", "nuage"]],
  ["livre", ["page", "lire", "roman", "auteur", "chapitre", "bibliothèque", "couverture", "histoire", "lecteur", "titre"], ["poivron", "escalier"]],
  ["voiture", ["moteur", "volant", "roue", "conduire", "route", "garage", "pneu", "frein", "essence", "permis"], ["violette", "tasse"]],
  ["jardin", ["fleur", "pelouse", "arroser", "potager", "graine", "bêche", "haie", "tondeuse", "massif", "brouette"], ["moustache", "radio"]],
  ["chat", ["miauler", "moustaches", "souris", "ronronner", "griffe", "félin", "chaton", "litière", "pelage", "gouttière"], ["camion", "dictionnaire"]],
  ["école", ["classe", "élève", "professeur", "cahier", "cartable", "récréation", "tableau", "leçon", "devoir", "cantine"], ["sapin", "aquarium"]],
  ["feu", ["flamme", "bois", "brûler", "fumée", "cheminée", "braise", "chaleur", "allumette", "étincelle", "bûche"], ["pantoufle", "trombone"]],
  ["argent", ["pièce", "billet", "banque", "payer", "porte-monnaie", "salaire", "dépense", "monnaie", "économie", "prix"], ["mouette", "lavande"]],
  ["fête", ["anniversaire", "gâteau", "danser", "invités", "ballon", "cadeau", "musique", "bougie", "rire", "célébrer"], ["boulon", "tondeuse"]],
  ["hôpital", ["médecin", "infirmière", "lit", "soin", "urgence", "chambre", "visite", "blouse", "brancard", "patient"], ["cerf-volant", "abricot"]],
  ["pluie", ["parapluie", "nuage", "goutte", "orage", "flaque", "mouillé", "averse", "bruine", "ciel", "imperméable"], ["clavier", "girafe"]],
  ["forêt", ["arbre", "feuille", "chêne", "sentier", "mousse", "champignon", "bûcheron", "clairière", "écorce", "sapin"], ["tasse", "saxophone"]],
  ["cuisine", ["casserole", "four", "recette", "couteau", "repas", "évier", "poêle", "chef", "ingrédient", "tablier"], ["comète", "sandale"]],
  ["sport", ["ballon", "match", "équipe", "courir", "stade", "entraînement", "joueur", "arbitre", "victoire", "maillot"], ["tulipe", "encrier"]]
];

// Récits pour la démonstration de désinformation : scènes neutres et sans enjeu. [scène, objet du détail, couleur vue,
// couleur suggérée ensuite par une question, deux autres couleurs]
const RECITS_GT = [
  ["{p} entre dans une boulangerie, pose {son} sac {c} sur le comptoir, achète deux croissants et ressort en saluant la vendeuse.", "sac", "bleu", "rouge", ["vert", "noir"]],
  ["{p} arrive à la bibliothèque, accroche {son} manteau {c} à la patère, emprunte un roman policier et repart.", "manteau", "gris", "marron", ["bleu", "vert"]],
  ["{p} traverse le marché, achète des pommes et les met dans un panier {c} avant de rentrer à pied.", "panier", "jaune", "rouge", ["bleu", "blanc"]],
  ["{p} gare {son} vélo {c} devant la piscine, l'attache à un poteau et entre se baigner.", "vélo", "vert", "bleu", ["noir", "rouge"]],
  ["{p} attend le bus en lisant un journal, assis{e} sur un banc {c}, puis monte dans le bus de 8 h 10.", "banc", "rouge", "vert", ["gris", "blanc"]],
  ["{p} déjeune au café, pose {son} parapluie {c} contre la table, commande une soupe et paie en espèces.", "parapluie", "noir", "bleu", ["rouge", "jaune"]],
  ["{p} entre à la poste, pose une enveloppe {c} sur le guichet, achète un carnet de timbres et repart.", "enveloppe", "blanche", "jaune", ["bleue", "verte"]],
  ["{p} sort son chien en laisse {c}, fait le tour du parc et s'arrête parler à un voisin.", "laisse", "rouge", "noire", ["bleue", "verte"]],
  ["{p} arrive au cinéma, met son bonnet {c} dans sa poche, achète un billet et choisit une place au milieu.", "bonnet", "vert", "rouge", ["gris", "jaune"]],
  ["{p} range sa voiture {c} dans le parking du supermarché, prend un caddie et fait ses courses.", "voiture", "grise", "blanche", ["rouge", "bleue"]],
  ["{p} entre dans la pharmacie avec un cabas {c}, achète une crème solaire et ressort.", "cabas", "orange", "vert", ["bleu", "noir"]],
  ["{p} monte dans le train avec une valise {c}, la range au-dessus du siège et s'endort.", "valise", "bleue", "noire", ["rouge", "verte"]],
  ["{p} arrive au club de tennis avec un sac {c}, change de chaussures et rejoint le court numéro 3.", "sac", "blanc", "bleu", ["rouge", "jaune"]],
  ["{p} va chez le fleuriste, choisit un bouquet et le fait emballer dans un papier {c}.", "papier", "rose", "blanc", ["jaune", "bleu"]],
  ["{p} sort de chez {lui} avec une écharpe {c}, ferme la porte à clé et part au travail en tram.", "écharpe", "jaune", "rouge", ["grise", "verte"]],
  ["{p} entre dans une quincaillerie, pose un seau {c} sur le comptoir, achète des clous et repart.", "seau", "vert", "jaune", ["rouge", "bleu"]],
  ["{p} s'installe au parc sur une couverture {c}, lit un magazine puis mange une pomme.", "couverture", "bleue", "verte", ["rouge", "jaune"]],
  ["{p} passe à la laverie avec un panier à linge {c}, lance une machine et attend en lisant.", "panier", "blanc", "bleu", ["vert", "rouge"]],
  ["{p} arrive à la gare avec un sac à dos {c}, achète un sandwich et monte dans le train de 14 h.", "sac à dos", "rouge", "noir", ["bleu", "vert"]],
  ["{p} entre dans le musée, dépose {son} casque de vélo {c} au vestiaire et visite la salle des sculptures.", "casque", "noir", "blanc", ["rouge", "bleu"]]
];

// Mémoire de source : deux sources fictives, six informations exactes dans ce monde fictif (horaires d'un village
// imaginaire). [source A, source B, informations]
const SOURCES_GT = [
  ["le panneau de la mairie", "la radio locale", ["Le marché ouvre à 8 heures.", "La piscine ferme le lundi.", "La fête du village a lieu le 14 juin.", "La bibliothèque prête des jeux.", "Le bus 3 passe toutes les vingt minutes.", "La déchetterie est fermée le dimanche."]],
  ["le journal du club", "le site de la commune", ["Le tournoi commence à 9 heures.", "Les vestiaires sont refaits à neuf.", "L'inscription coûte dix euros.", "La buvette ouvre à midi.", "La finale a lieu le samedi.", "Le parking est gratuit."]],
  ["l'affiche de la gare", "le guide du parc", ["Le sentier rouge fait six kilomètres.", "Le belvédère est accessible en poussette.", "Le lac est interdit à la baignade.", "Le refuge ouvre en mai.", "Les chiens sont admis en laisse.", "La navette part à 10 heures."]],
  ["la lettre de l'école", "la réunion des parents", ["La sortie au musée est en mars.", "La cantine propose un menu sans viande le jeudi.", "Les cours finissent à 16 h 30.", "La kermesse a lieu en juin.", "Le car part à 8 h 15.", "Les photos de classe sont en octobre."]],
  ["le programme du festival", "le bénévole à l'accueil", ["Le premier concert est à 18 heures.", "Les places assises sont limitées.", "La scène 2 est sous chapiteau.", "Le dernier bus part à minuit.", "Les verres sont consignés.", "Le festival dure trois jours."]]
];
