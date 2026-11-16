// piece-donnees.js : données de « La pièce du jour » (lot P1, moteur ; rien n'est affiché tant que PIECE_VISIBLE est faux).
// Mondes (univers fictifs, sans aucun nom propre réel), formats (genres de documents et leurs zones), procédés (façons de
// tromper, avec leurs seuils) et leurres. Le moteur est dans piece.js ; le catalogue complet et ses décisions sont dans
// tests/piece-a-relire.md et tests/piece-journal.md.

// Relecture des textes par le propriétaire (sur le modèle de RELECTURE_GT) : tant qu'elle n'est pas déclarée, rien n'est publié
const RELECTURE_PIECE = { relu: false };

// ===================== Mondes =====================
// Chaque monde fournit des groupes nominaux complets (articles et élisions compris) : les gabarits de piece.js les
// assemblent sans accorder. Un champ absent rend incompatibles les procédés qui en ont besoin (PIECE_PROCEDES.requiert).
// ordre : bornes de la valeur de départ de la série annuelle ; collectivite : le monde peut produire un bulletin municipal.
const PIECE_MONDES = [
  { id: "bus", couleur: "#2b7bb9", rubrique: "Transports", collectivite: true,
    sujet: "la ligne 7", mesure: "la fréquentation de la ligne 7", unite: "voyageurs par jour", ordre: [1800, 3200],
    intervention: "la gratuité", acteur: "la mairie", acteurDe: "de la mairie", population: "les habitants",
    autreChangement: "des bus toutes les dix minutes au lieu de vingt",
    taux: "la part des déplacements faits en bus", debutant: ["les réservations du bus de nuit", "réservations"],
    expert: ["une spécialiste des transports urbains", "un chef cuisinier"],
    dilemme: ["la gratuité", "un centre-ville asphyxié", "un tarif réduit pour les jeunes"],
    peur: "le centre-ville finira paralysé", sondage: "Êtes-vous favorable à la gratuité de la ligne 7 ?" },
  { id: "radar", couleur: "#c0601b", rubrique: "Vie locale", collectivite: true,
    sujet: "l'entrée du village", mesure: "le nombre de conducteurs en excès de vitesse à l'entrée du village", unite: "conducteurs par jour", ordre: [40, 90],
    intervention: "le radar pédagogique", acteur: "la commune", acteurDe: "de la commune", population: "les habitants",
    autreChangement: "un nouveau ralentisseur", taux: "la part des conducteurs en excès de vitesse",
    expert: ["un spécialiste de la sécurité routière", "une championne de natation"],
    dilemme: ["le radar", "des accidents à répétition", "un ralentisseur"],
    peur: "un drame finira par arriver", sondage: "Le radar pédagogique vous paraît-il utile ?" },
  { id: "revision", couleur: "#2f6db5", rubrique: "Éducation",
    sujet: "l'application de révision", mesure: "le nombre de lycéens inscrits sur l'application de révision", unite: "inscrits", ordre: [800, 2500],
    intervention: "le nouveau mode quiz", acteur: "l'éditeur de l'application", acteurDe: "de l'éditeur de l'application", population: "les lycéens",
    autreChangement: "une réforme du baccalauréat", taux: "la part des lycéens qui révisent en ligne",
    debutant: ["les inscriptions au mode hors ligne", "inscriptions"],
    risque: ["d'échouer à l'examen", "les utilisateurs de l'application"],
    etude: { participants: "lycéens", pratique: "réviser avec l'application chaque jour", resultat: "la note en mathématiques", unite: "points sur 20", base: [9, 12], financeur: "l'éditeur de l'application" },
    produit: { nom: "l'abonnement annuel", prix: [30, 60], clients: "lycéens" },
    expert: ["une professeure de mathématiques", "un footballeur"],
    dilemme: ["réviser avec l'application", "rater son année", "travailler avec un camarade"],
    peur: "vous risquez de tout perdre le jour de l'examen", sondage: "L'application vous aide-t-elle à réviser ?" },
  { id: "infusion", couleur: "#1f8a70", rubrique: "Consommation", naturel: true,
    sujet: "l'infusion du soir", mesure: "les ventes de l'infusion du soir", unite: "boîtes par mois", ordre: [3000, 8000],
    intervention: "la nouvelle recette", acteur: "le fabricant", acteurDe: "du fabricant", population: "les clients",
    autreChangement: "une campagne de publicité à la radio", taux: "la part des clients qui rachètent une boîte",
    debutant: ["les abonnements à la livraison mensuelle", "abonnements"],
    risque: ["de se réveiller plusieurs fois par nuit", "les buveurs d'infusion"],
    etude: { participants: "adultes", pratique: "boire l'infusion chaque soir", resultat: "la durée de sommeil déclarée", unite: "heures", base: [6, 7], financeur: "le fabricant de l'infusion" },
    produit: { nom: "la boîte de cinquante sachets", prix: [6, 16], clients: "clients" },
    expert: ["un chercheur spécialiste du sommeil", "un acteur de cinéma"],
    dilemme: ["l'infusion du soir", "des nuits blanches", "se coucher à heure fixe"],
    peur: "votre fatigue ne fera que s'aggraver", sondage: "Recommanderiez-vous l'infusion du soir ?" },
  { id: "course", couleur: "#a77a12", rubrique: "Sport",
    sujet: "le club de course", mesure: "le nombre d'adhérents du club de course", unite: "adhérents", ordre: [150, 400],
    intervention: "l'entraînement du samedi", acteur: "le club", acteurDe: "du club", population: "les adhérents",
    autreChangement: "l'ouverture d'une nouvelle piste", taux: "la part des adhérents qui terminent un semi-marathon",
    distribution: ["la distance courue chaque semaine", "km", "un adhérent type"],
    risque: ["de se blesser dans l'année", "les adhérents"],
    etude: { participants: "coureurs", pratique: "suivre le programme du club", resultat: "le temps au 10 km", unite: "minutes", base: [50, 60], financeur: "la marque de chaussures du club", baisseEstMieux: true },
    produit: { nom: "l'adhésion annuelle", prix: [60, 150], clients: "adhérents" },
    expert: ["une entraîneuse d'athlétisme", "un pianiste"],
    dilemme: ["rejoindre le club", "rester sur son canapé", "courir avec des amis"],
    peur: "votre forme va décliner", sondage: "Êtes-vous satisfait de l'entraînement du samedi ?" },
  { id: "rue", couleur: "#c23b5a", rubrique: "Vie locale", collectivite: true,
    sujet: "la rue piétonne", mesure: "le chiffre d'affaires des commerces de la rue", unite: "milliers d'euros par mois", ordre: [300, 600],
    intervention: "la piétonnisation", acteur: "la mairie", acteurDe: "de la mairie", population: "les riverains",
    autreChangement: "l'ouverture d'un grand parking", taux: "la part des passants qui font un achat",
    distribution: ["le chiffre d'affaires mensuel des commerces", "milliers d'euros", "un commerce type"],
    expert: ["une urbaniste", "un astronaute"],
    dilemme: ["la piétonnisation", "la mort du commerce", "une circulation réservée aux livraisons"],
    peur: "les commerces fermeront les uns après les autres", sondage: "Êtes-vous favorable à la piétonnisation de la rue ?" },
  { id: "cantine", couleur: "#2a8a5c", rubrique: "Éducation", collectivite: true, naturel: true,
    sujet: "la cantine du collège", mesure: "le gaspillage à la cantine du collège", unite: "kilos par semaine", ordre: [80, 200],
    intervention: "le nouveau menu", acteur: "le collège", acteurDe: "du collège", population: "les élèves",
    autreChangement: "des assiettes plus petites", taux: "la part des plateaux terminés",
    debutant: ["les inscriptions à l'atelier cuisine", "inscriptions"],
    expert: ["une diététicienne", "un champion d'échecs"],
    dilemme: ["le nouveau menu", "des poubelles pleines", "des portions servies à la demande"],
    peur: "la cantine deviendra une décharge", sondage: "Le nouveau menu vous plaît-il ?" },
  { id: "electricite", couleur: "#5b5bb5", rubrique: "Consommation",
    sujet: "le fournisseur d'électricité", mesure: "le nombre d'abonnés du fournisseur d'électricité", unite: "abonnés", ordre: [5000, 12000],
    intervention: "l'offre heures creuses", acteur: "le fournisseur", acteurDe: "du fournisseur", population: "les abonnés",
    autreChangement: "une hausse générale des tarifs", taux: "la part des abonnés satisfaits",
    debutant: ["les abonnés à l'offre verte", "abonnés"],
    distribution: ["la facture mensuelle", "euros", "un foyer type"],
    produit: { nom: "l'abonnement mensuel", prix: [12, 30], clients: "abonnés" },
    expert: ["un ingénieur en énergie", "une chanteuse"],
    dilemme: ["l'offre heures creuses", "des factures qui s'envolent", "réduire sa consommation"],
    peur: "vos factures vont exploser", sondage: "Êtes-vous satisfait de l'offre heures creuses ?" }
];

// Pseudonymes du réseau fictif et prénoms des témoins (épicènes), listés dans tests/piece-a-relire.md
const PIECE_COMPTES = ["Ruelle_Verte", "Quai_Nord", "Petit_Pont", "Lanterne_42", "Moulin_Bleu", "Pavé_Mouillé"];
const PIECE_PRENOMS = ["Camille", "Sacha", "Alix", "Lou", "Noa", "Charlie", "Dominique", "Claude"];

// ===================== Formats =====================
// Zones touchables de chaque format, dans l'ordre de lecture ; niveau : premier niveau où le format paraît ;
// conclusion : la zone qui porte l'affirmation de la pièce (tolérée pour un piège qui la rend non établie ou contredite) ;
// cle : zones toujours gardées (elles portent les chiffres de la pièce, et « Chiffrer » s'y appuie) ; requiert : champ du monde indispensable.
const PIECE_FORMATS = {
  breve: { nom: "Brève", niveau: 1, conclusion: "titre", cle: ["chapo"],
    zones: ["titre", "chapo", "figure-axe", "figure-trace", "figure-legende", "phrase-contexte", "phrase-chiffre", "phrase-changement", "phrase-citation", "source"] },
  publicite: { nom: "Publicité", niveau: 1, conclusion: "slogan", cle: ["prix", "petites-lignes"], requiert: "produit",
    zones: ["slogan", "chiffre-cle", "caution", "temoignage", "prix", "petites-lignes", "source"] },
  sondage: { nom: "Sondage", niveau: 2, conclusion: "commentaire", cle: ["barres"],
    zones: ["question", "barres", "commentaire", "fiche-effectif", "fiche-dates", "fiche-recueil", "source"] },
  reseau: { nom: "Publication", niveau: 2, conclusion: "texte", cle: ["image-legende"],
    zones: ["compte", "texte", "image-chiffre", "image-legende", "partages", "reponse", "reponse-2", "reponse-3", "date"] },
  etude: { nom: "Communiqué d'étude", niveau: 3, conclusion: "conclusion", cle: ["methode-effectif"], requiert: "etude",
    zones: ["titre", "resultat", "methode-effectif", "methode-comparaison", "methode-recrutement", "methode-financeur", "tableau", "conclusion", "source"] },
  bulletin: { nom: "Bulletin municipal", niveau: 3, conclusion: "citation", cle: ["chiffres"], requiert: "collectivite",
    zones: ["bandeau", "bilan-avant", "bilan-apres", "chiffres", "citation", "phrase-changement", "phrase-option", "objectif-initial", "objectif-verdict", "source"] }
};

// ===================== Niveaux (brief, § 4.7) =====================
// zones [min, max] ; pieges [min, max] ; saines : part de pièces sans piège sur 20 jours ; leurres [min, max] ;
// familles permises ; intensite ; choix : nombre de procédés proposés pour « Nommer », dont voisins ; chiffrer : mode
const PIECE_NIVEAUX = {
  1: { zones: [4, 5], pieges: [1, 1], saines: 0, leurres: [0, 0], familles: ["G", "R"], intensite: "forte", choix: 3, voisins: 0, chiffrer: null, annonce: true },
  2: { zones: [5, 7], pieges: [1, 1], saines: 5, leurres: [1, 1], familles: ["G", "C", "R"], intensite: "forte", choix: 4, voisins: 0, chiffrer: null },
  3: { zones: [7, 9], pieges: [1, 2], saines: 4, leurres: [2, 2], familles: ["G", "C", "M", "R", "S"], intensite: "moyenne", choix: 5, voisins: 1, chiffrer: "choix" },
  4: { zones: [9, 12], pieges: [1, 3], saines: 3, leurres: [2, 3], familles: ["G", "C", "M", "R", "S"], intensite: "faible", choix: 6, voisins: 2, chiffrer: "libre" }
};

// ===================== Procédés en service (lot P1) =====================
// formats : { format: [zone du piège, zones de preuve…] } ; niveau : premier niveau ; requiert : champ du monde ;
// effet : sur le verdict (aucun, non-etablie, contredite) ; seuils : [piège si, sain si] et intensités, repris de
// tests/piece-a-relire.md ; fiche : notion liée (vérifiée contre INDEX par le banc) ou atelier.
const PIECE_PROCEDES = {
  "axe-tronque": { nom: "Axe qui ne part pas de zéro", famille: "G", niveau: 1, effet: "aucun", fiche: "atelier:graphiques",
    formats: { breve: ["figure-axe", "figure-trace"], sondage: ["barres"] }, voisins: ["axe-inverse", "fenetre"], incompatibles: ["axe-inverse"],
    intensites: { forte: 4, moyenne: 2.5, faible: 1.5 },
    trompe: "L'axe commence au-dessus de zéro : les barres paraissent bien plus inégales que les valeurs." },
  "fenetre": { nom: "Période choisie", famille: "G", niveau: 1, effet: "contredite", fiche: "sophismes:cherry-picking",
    formats: { breve: ["figure-trace", "phrase-contexte"] }, voisins: ["cumul", "axe-tronque"], incompatibles: ["cumul", "regression"],
    intensites: { forte: 1 / 6, moyenne: 1 / 4, faible: 1 / 3 },
    trompe: "La période montrée est choisie : sur toute la période que cite la pièce, la tendance va dans l'autre sens." },
  "cumul": { nom: "Valeurs cumulées présentées comme une hausse", famille: "G", niveau: 1, effet: "contredite", fiche: "atelier:graphiques",
    formats: { breve: ["figure-trace", "figure-legende"] }, voisins: ["fenetre", "axe-tronque"], incompatibles: ["fenetre", "axe-inverse"],
    intensites: { forte: 0.7, moyenne: 0.8, faible: 0.9 },
    trompe: "Un total cumulé ne peut que monter ; les valeurs de chaque année, elles, baissent." },
  "axe-inverse": { nom: "Axe inversé", famille: "G", niveau: 1, effet: "contredite", fiche: "atelier:graphiques",
    formats: { breve: ["figure-axe"] }, voisins: ["axe-tronque", "cumul"], incompatibles: ["axe-tronque", "cumul", "fenetre"],
    trompe: "L'axe est gradué de haut en bas : ce qui semble monter descend." },
  "relatif-sans-absolu": { nom: "Risque relatif sans le risque absolu", famille: "C", niveau: 2, effet: "aucun", fiche: "biais:cadrage", requiert: "risque",
    formats: { publicite: ["chiffre-cle", "petites-lignes"] }, voisins: ["pourcentage-sans-base", "points-pourcentage"], incompatibles: ["pourcentage-sans-base"],
    intensites: { forte: 0.1, moyenne: 0.5, faible: 1 },
    trompe: "Une baisse de moitié d'un risque minuscule reste minuscule : l'écart réel est donné ailleurs." },
  "pourcentage-sans-base": { nom: "Pourcentage sur une base minuscule", famille: "C", niveau: 2, effet: "non-etablie", fiche: "biais:taille-echantillon", requiert: "debutant",
    formats: { publicite: ["chiffre-cle", "petites-lignes"], reseau: ["image-chiffre", "reponse"] }, voisins: ["relatif-sans-absolu", "petit-echantillon"], incompatibles: ["relatif-sans-absolu"],
    intensites: { forte: 5, moyenne: 10, faible: 20 },
    trompe: "Un pourcentage spectaculaire calculé sur quelques unités ne dit presque rien." },
  "points-pourcentage": { nom: "Pour cent et points de pourcentage confondus", famille: "C", niveau: 2, effet: "aucun", fiche: "atelier:graphiques",
    formats: { sondage: ["commentaire"], breve: ["phrase-chiffre"] }, voisins: ["relatif-sans-absolu", "moyenne-mediane"], incompatibles: [],
    trompe: "Passer de 10 % à 15 %, c'est 5 points de plus, mais une hausse de 50 %." },
  "moyenne-mediane": { nom: "Moyenne tirée par une valeur extrême", famille: "C", niveau: 2, effet: "contredite", fiche: "atelier:graphiques", requiert: "distribution",
    formats: { breve: ["phrase-chiffre", "phrase-contexte"], reseau: ["texte", "reponse"] }, voisins: ["points-pourcentage", "petit-echantillon"], incompatibles: ["points-pourcentage"],
    intensites: { forte: 3, moyenne: 2, faible: 1.5 },
    trompe: "Quelques valeurs extrêmes tirent la moyenne ; le cas typique est la médiane, citée sur la pièce." },
  "petit-echantillon": { nom: "Échantillon trop petit pour conclure", famille: "C", niveau: 2, effet: "non-etablie", fiche: "biais:taille-echantillon",
    formats: { sondage: ["fiche-effectif"], etude: ["methode-effectif"] }, voisins: ["pourcentage-sans-base", "auto-selection"], incompatibles: ["survivant"],
    intensites: { forte: 8, moyenne: 15, faible: 30 },
    trompe: "Sur si peu de personnes, le hasard suffit à produire l'écart observé." },
  "sans-temoin": { nom: "Aucun groupe de comparaison", famille: "M", niveau: 3, effet: "non-etablie", fiche: null,
    formats: { etude: ["methode-comparaison"] }, voisins: ["correlation", "auto-selection"], incompatibles: ["correlation"],
    trompe: "Sans groupe de comparaison, rien ne dit que le changement ne serait pas arrivé de toute façon." },
  "survivant": { nom: "Seuls ceux qui sont restés sont comptés", famille: "M", niveau: 3, effet: "non-etablie", fiche: "biais:survivant",
    formats: { etude: ["resultat", "methode-effectif"] }, voisins: ["auto-selection", "petit-echantillon"], incompatibles: ["petit-echantillon"],
    intensites: { forte: 0.6, moyenne: 0.45, faible: 0.3 },
    trompe: "Seuls ceux qui sont restés sont comptés ; ceux qui ont abandonné auraient changé le résultat." },
  "auto-selection": { nom: "Volontaires non représentatifs", famille: "M", niveau: 3, effet: "non-etablie", fiche: null,
    formats: { sondage: ["fiche-recueil"], etude: ["methode-recrutement"] }, voisins: ["survivant", "petit-echantillon"], incompatibles: [],
    trompe: "Des volontaires ne ressemblent pas à l'ensemble de la population." },
  "correlation": { nom: "Corrélation présentée comme une cause", famille: "M", niveau: 3, effet: "non-etablie", fiche: "sophismes:correlation",
    formats: { etude: ["titre", "methode-comparaison"] }, voisins: ["post-hoc", "sans-temoin"], incompatibles: ["sans-temoin"],
    trompe: "La méthode n'observe qu'une association ; le titre en fait une cause." },
  "post-hoc": { nom: "« Après, donc à cause de »", famille: "M", niveau: 3, effet: "non-etablie", fiche: "sophismes:post-hoc", requiert: "autreChangement",
    formats: { breve: ["titre", "phrase-changement"], bulletin: ["citation", "phrase-changement"], reseau: ["texte", "reponse"] }, voisins: ["correlation", "regression"], incompatibles: ["regression"],
    trompe: "Un autre changement est arrivé au même moment : l'ordre des dates ne désigne pas la cause." },
  "regression": { nom: "Retour à la normale pris pour un effet", famille: "M", niveau: 3, effet: "non-etablie", fiche: "biais:regression-moyenne",
    formats: { bulletin: ["bilan-avant", "chiffres"] }, voisins: ["post-hoc", "fenetre"], incompatibles: ["post-hoc", "fenetre", "critere-deplace"],
    intensites: { forte: 2, moyenne: 1.75, faible: 1.5 },
    trompe: "On a agi après une valeur exceptionnelle : un retour à la normale était attendu de toute façon." },
  "critere-deplace": { nom: "Objectif changé après coup", famille: "M", niveau: 3, effet: "contredite", fiche: "sophismes:poteaux",
    formats: { bulletin: ["objectif-verdict", "objectif-initial"] }, voisins: ["fenetre", "regression"], incompatibles: ["regression"],
    intensites: { forte: 0.5, moyenne: 0.65, faible: 0.8 },
    trompe: "L'objectif annoncé au départ n'est pas atteint ; la réussite est mesurée à un objectif choisi après coup." },
  "autorite": { nom: "Autorité hors de son domaine", famille: "R", niveau: 1, effet: "non-etablie", fiche: "sophismes:autorite",
    formats: { breve: ["phrase-citation"], publicite: ["caution"], bulletin: ["citation"] }, voisins: ["popularite", "faux-dilemme"], incompatibles: [],
    trompe: "La personne est compétente, mais dans un autre domaine." },
  "popularite": { nom: "« Tout le monde le fait »", famille: "R", niveau: 1, effet: "non-etablie", fiche: "sophismes:popularite", requiert: "produit",
    formats: { publicite: ["slogan"], reseau: ["texte"] }, voisins: ["autorite", "nature"], incompatibles: ["nature", "peur", "faux-dilemme"],
    trompe: "Qu'un produit soit très utilisé ne prouve pas qu'il fasse ce qu'il promet." },
  "faux-dilemme": { nom: "Deux options, comme s'il n'y en avait pas d'autres", famille: "R", niveau: 1, effet: "non-etablie", fiche: "sophismes:faux-dilemme",
    formats: { publicite: ["slogan", "petites-lignes"], reseau: ["texte", "reponse"], bulletin: ["citation", "phrase-option"] }, voisins: ["peur", "popularite"], incompatibles: ["popularite", "nature", "peur"],
    trompe: "La pièce elle-même cite une troisième possibilité." },
  "nature": { nom: "« Naturel, donc bon »", famille: "R", niveau: 1, effet: "non-etablie", fiche: "sophismes:nature", requiert: "naturel",
    formats: { publicite: ["slogan"], reseau: ["texte"] }, voisins: ["popularite", "peur"], incompatibles: ["popularite", "peur", "faux-dilemme"],
    trompe: "« Naturel » ne veut dire ni sans risque, ni efficace." },
  "peur": { nom: "Appel à la peur", famille: "R", niveau: 1, effet: "non-etablie", fiche: "sophismes:emotion",
    formats: { publicite: ["slogan"], reseau: ["texte"], bulletin: ["citation"] }, voisins: ["faux-dilemme", "nature"], incompatibles: ["popularite", "nature", "faux-dilemme"],
    trompe: "La menace n'est appuyée sur aucune donnée, et la conclusion en est tirée quand même." },
  "prix-barre": { nom: "Prix de référence gonflé", famille: "R", niveau: 1, effet: "contredite", fiche: "biais:ancrage", requiert: "produit",
    formats: { publicite: ["prix", "petites-lignes"] }, voisins: ["relatif-sans-absolu", "popularite"], incompatibles: [],
    intensites: { forte: 2, moyenne: 1.6, faible: 1.3 },
    trompe: "Le prix barré n'a jamais été pratiqué : l'ancien prix réel est dans les petites lignes." },
  "source-absente": { nom: "Chiffre sans source vérifiable", famille: "S", niveau: 3, effet: "non-etablie", fiche: null,
    formats: { breve: ["source"], publicite: ["source"], bulletin: ["source"] }, voisins: ["perime", "conflit"], incompatibles: ["perime"],
    trompe: "« Des experts » ou « une étude récente » : impossible de vérifier." },
  "conflit": { nom: "Étude financée par celui qu'elle avantage", famille: "S", niveau: 3, effet: "aucun", fiche: null,
    formats: { etude: ["methode-financeur"] }, voisins: ["source-absente", "auto-selection"], incompatibles: [],
    trompe: "L'étude se dit indépendante, mais son financeur vend le produit étudié." },
  "perime": { nom: "Donnée ancienne présentée comme actuelle", famille: "S", niveau: 3, effet: "non-etablie", fiche: null,
    formats: { breve: ["source"], publicite: ["source"], bulletin: ["source"] }, voisins: ["source-absente", "fenetre"], incompatibles: ["source-absente"],
    intensites: { forte: 10, moyenne: 7, faible: 5 },
    trompe: "La donnée date de plusieurs années, et elle est présentée comme actuelle." }
};

// ===================== Leurres =====================
// Zones honnêtes rédigées pour paraître suspectes : format → zone ; imite : le procédé qu'elles rappellent ; requiert : champ du monde
const PIECE_LEURRES = {
  "ton-vif": { formats: { publicite: "slogan", reseau: "texte", bulletin: "bandeau" }, imite: "peur",
    pourquoi: "Le ton est vif, mais le fait est exact et aucune conclusion n'en est tirée." },
  "chiffre-rond": { formats: { breve: "phrase-chiffre" }, imite: "source-absente",
    pourquoi: "Un chiffre rond n'est pas suspect en soi : celui-ci est exact et sa source est donnée." },
  "expert-domaine": { formats: { breve: "phrase-citation", publicite: "caution", bulletin: "citation", reseau: "reponse-3" }, imite: "autorite",
    pourquoi: "La personne parle de son propre domaine : son avis compte, sans suffire à prouver." },
  "courbe-non-nulle": { formats: { breve: "figure-axe" }, imite: "axe-tronque",
    pourquoi: "Pour une courbe, un axe qui ne part pas de zéro est l'usage : on lit une évolution, pas une proportion." },
  "pourcentage-base": { formats: { publicite: "chiffre-cle", reseau: "image-chiffre" }, imite: "pourcentage-sans-base", requiert: "debutant",
    pourquoi: "Le pourcentage est accompagné de sa base, et la base est grande." },
  "grand-echantillon": { formats: { sondage: "fiche-effectif", etude: "methode-effectif" }, imite: "petit-echantillon",
    pourquoi: "Un grand effectif, tiré au sort : la méthode permet la conclusion." },
  "associe": { formats: { etude: "titre" }, imite: "correlation",
    pourquoi: "Le titre parle d'un lien observé : il ne prétend pas à une cause." },
  "popularite-fait": { formats: { publicite: "slogan", reseau: "texte" }, imite: "popularite", requiert: "produit",
    pourquoi: "Le nombre d'utilisateurs est cité comme un fait ; rien n'en est conclu sur la qualité." },
  "source-datee": { formats: { breve: "source", publicite: "source", bulletin: "source", sondage: "source", etude: "source", reseau: "reponse-2" }, imite: "source-absente",
    pourquoi: "La source est nommée, datée, et récente." },
  "hausse-reelle": { formats: { breve: "figure-axe" }, imite: "axe-tronque",
    pourquoi: "La hausse est spectaculaire, mais l'axe part de zéro : elle est réelle." }
};
