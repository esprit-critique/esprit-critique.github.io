# Charte graphique d'Esprit critique (version 2)

Une page de règles, pour que les prochaines modifications gardent l'identité du site. Version 2 (refonte de
novembre 2026, lot 2) : **le cabinet d'illusions**. Le site montre ce qu'il enseigne : on ne peut pas se fier à ce que
l'on voit. Chaque écran important porte une pièce visuelle qui trompe l'œil, puis se révèle au toucher. Papier chaud
et encre pour le fond ; la seule couleur vive vient des 14 couleurs de catégorie, traitées comme un spectre.

**Ce qui reste de la version 1** : les deux polices, l'emblème et le trait de Müller-Lyer, le style des corrections
(barré rouge, verdict en italique), la numérotation « B 10 / S 7 », l'ordre des groupes de la page d'une fiche, les
conventions de la version anglaise, le contraste de 4,5:1, l'absence de mascotte, d'image de banque d'images et de
ressource chargée depuis un autre site.

**Ce qui change** : les cartes deviennent des cartes à jouer (coins arrondis, élévation, indice en coin) ; le filet du
spectre sous l'en-tête ; une échelle typographique plus contrastée ; deux colonnes sur ordinateur ; trois mouvements
signature ; l'illusion du jour ; quatorze glyphes de catégorie ; des états vides dessinés ; un vocabulaire de graphiques.

## Polices

- **`--titre`** : Newsreader (Production Type, licence SIL OFL 1.1), hébergée dans `static/polices/`, sous-ensemble
  latin. Pour les titres, les situations du quiz, les citations, les étiquettes et les verdicts.
  Taille optique automatique (`font-optical-sizing: auto`) sur les titres.
- **`--police`** : police système, pour tout le texte courant, les boutons et les champs.
- **Étiquettes** (surtitres, étiquettes de catégorie, intertitres de fiche, consignes) : casse normale (première
  lettre en capitale, posée par `::first-letter`), 14 px, graisse 600, sans espacement ajouté, couleur `--discret` ou
  de catégorie. Pas de capitales espacées : elles crient et se lisent moins bien (passe « unslop », novembre 2026).
- **Graisses** : 400, 500 et 600, jamais au-delà. Les titres (`h1` à `h4`) sont à 600 ; les grands titres et grands
  nombres en Newsreader (21 px et plus) à 500 : la hiérarchie vient de la taille et de la couleur, pas de la graisse.
- **Pas d'italique d'emphase** : l'italique reste aux verdicts, à la phrase de l'accueil, aux variables et aux titres
  d'œuvres.
- **Chiffres elzéviriens** (`oldstyle-nums`) pour les scores, les nombres des tuiles et les numéros de fiche.
- Un caractère absent du sous-ensemble latin (≈, →, exposants ⁴ à ⁹…) est pris dans la police suivante de `--titre`.
  Contrôle : `python3 tests/pages/couverture_police.py`.

## Couleurs

Les jetons de `static/style.css` (`--fond`, `--carte`, `--texte`, `--discret`, `--trait`, `--accent`, `--vert`,
`--rouge`, `--orange`, `--encadre`, et `--c` avec ses dérivés `--c-fort`, `--c-texte`, `--c-clair`, `--sur-c` pour la
couleur de catégorie), en clair et en sombre. Version 2 : `--carte-haute` (surface d'une carte survolée ou levée, plus
claire en sombre, où l'ombre ne se voit pas). Contraste : 4,5:1 pour le texte (3:1 en grands caractères), vérifié par
le contrôle d'affichage (`contraste-faible`).

- **Le spectre** : les 14 couleurs de catégorie (`donnees.js`), dans l'ordre des catégories, biais puis sophismes.
  Elles ne se côtoient que dans le filet du spectre et dans le codex ; partout ailleurs, une seule couleur de
  catégorie par carte.
- Le bleu `--accent` est **la seule couleur des boutons**, partout, y compris dans une carte de catégorie : une
  seule couleur d'action par écran. La couleur de catégorie reste à la barre de la carte, à l'étiquette, aux liens et
  aux puces de filtre actives.

## Jetons de forme, d'élévation, de mouvement et de mise en page

| Jeton | Valeur | Usage |
|---|---|---|
| `--rayon` | 4 px | petites boîtes (encadré de l'exemple, pastilles, champs) |
| `--rayon-bouton` | 10 px | boutons et choix du quiz |
| `--rayon-carte` | 12 px | cartes (le bas de la fourchette du brief : rester sobre) |
| `--ombre-1` | deux ombres très douces | carte au repos |
| `--ombre-2` | ombre plus marquée | carte survolée ou appuyée ; en sombre, `--carte-haute` à la place |
| `--duree-courte`, `--duree`, `--duree-longue` | 160, 280, 560 ms | micro-interactions, mouvements, révélation |
| `--courbe` | `cubic-bezier(.2, .7, .2, 1)` | toutes les animations (départ franc, arrivée douce) |
| `--largeur-lecture` | 680 px | colonne de lecture (68 caractères au plus) |
| `--largeur-page` | 1 120 px | page sur ordinateur, à partir de 1 040 px de large |

## Échelle typographique

Titre de page (h1 des vues) : Newsreader 40 px sur téléphone, jusqu'à 56 px sur ordinateur, interligne 1,05, graisse 500.
Grands nombres (score, maîtrise, points) : Newsreader, 64 à 80 px, chiffres elzéviriens. Titres de carte : 21 px.
Entre deux blocs d'une page : 28 px au moins (40 px sur ordinateur).

**Échelle des tailles** (texte HTML) : 13, 14, 15, 16, 18, 19, 21, 24, 28, 34, 40, 56, 64 px, et les `clamp()` des
grands titres. Le texte des dessins SVG est en unités du dessin, mis à l'échelle avec lui : il n'entre pas dans
l'échelle.

**Grille de 4 px** : marges, retraits et écarts sont des multiples de 4 (1 et 2 px permis pour les filets et les
ajustements dans un petit contrôle ; un centrage calculé, comme les 59 px de l'échelle logarithmique, reste).
Rayons : seulement `--rayon`, `--rayon-bouton`, `--rayon-carte`, `50 %` pour un rond et une demi-hauteur pour une
pastille.

## Cartes à jouer

- Coins de `--rayon-carte`, élévation `--ombre-1`, plus marquée au survol (`--ombre-2`, et léger soulèvement de 2 px).
- La barre de couleur de catégorie, à gauche, reste.
- L'indice « B 10 » en coin, en haut à droite, comme sur une carte à jouer.

## Filet du spectre

Sous l'en-tête, un filet de 3 px découpé en 14 segments aux couleurs des catégories ; la largeur de chaque segment
est proportionnelle au nombre de fiches de sa catégorie. C'est un graphique, pas un dégradé : il dit la composition
du catalogue (nom accessible : « Composition du catalogue : … »). Dans le profil (lot 4), le même filet se remplit selon
la maîtrise. C'est le seul usage de plusieurs couleurs vives côte à côte.

## Mise en page

Une colonne de 680 px au plus sur téléphone et tablette. À partir de 1 040 px : page de 1 120 px ; deux colonnes sur
l'accueil (contenu principal, colonne latérale) ; sur une fiche, la colonne de lecture reste étroite, à côté d'un rail
collant (sommaire de la fiche, carte suivante, carte au hasard).

## Motif

Le **trait de Müller-Lyer** (le trait du haut de l'emblème, ailettes ouvertes) sert de séparateur entre les sections
des fiches et des explications (`.section::before`), et entre les blocs des onglets du profil. Il est décoratif. **Réservé aux séparateurs** : ni les bordures
des cartes, ni les listes. L'emblème lui-même apparaît dans l'en-tête et, pour un nouveau visiteur, dans
l'ouverture de l'accueil ; toucher l'un ou l'autre révèle les repères verticaux.

## Textes de l'interface

- Pas de point d'exclamation dans la voix du site (records, salutations, objectifs) ; les citations et les faux
  messages des exercices gardent les leurs : ils sont le contenu étudié.
- Un titre, une étiquette, un bouton ne prennent pas de point final (« Bonne soirée », pas « Bonne soirée. »).
- Libellés courts : « Chercher », pas « Chercher partout… ».
- Réglages du pied de page (thème, animations, langue) : contrôles segmentés discrets, le choix actif sur `--encadre`
  avec un filet et la graisse 600.

## Corrections

Le site corrige comme un correcteur : une réponse fausse est **barrée en rouge** (`.choix.faux`), le verdict est une
**annotation en italique** du caractère de titre (19 px, 17 px au-delà d'une ligne). Le barré ne remplace jamais
l'information : le texte « Réponse attendue : … » reste présent.

## Numérotation des fiches

Chaque fiche a un numéro de catalogue (champ `num` de `static/donnees.js`), affiché « B 10 » (biais) ou « S 7 »
(sophisme), lu « Biais numéro 10 » par les lecteurs d'écran. **Stable** : une nouvelle fiche prend le numéro suivant
libre de son type, et un numéro n'est jamais réattribué. La recherche accepte « B 10 », « b10 », « S7 ».

## Page d'une fiche

- **La définition est le chapô** : Newsreader romain, 21 px (23 px dès 760 px de large). C'est le seul texte courant
  en serif de la fiche ; l'en-tête (étiquette, numéro, titre, autres noms, définition) se ferme par le trait.
- **Quatre groupes, dans cet ordre**, après un groupe de tête sans intertitre (schéma de l'argument, illustration,
  mécanisme) : *En pratique* (exemple, cas célèbre), *Se défendre* (parade, ne pas confondre), *S'entraîner*
  (exercices, ateliers), *Aller plus loin* (source, voir aussi). Intertitres h2 en Newsreader 19 px ; sections en h3.
  Un groupe vide ne s'affiche pas.
- **Le trait sépare l'en-tête et les groupes, pas les sections** : dans un groupe, un simple espace de 18 px. Le pied
  de fiche (acquise, mémorisation, repérages) est séparé par un filet, sans trait.
- **Une seule boîte, réservée à l'exemple** (fond `--encadre`, coins de 4 px). Le cas célèbre et « Ne pas confondre »
  sont du texte simple ; la distinction s'ouvre par « ≠ » et le nom de la notion voisine.
- **La couleur de catégorie est réservée** à la barre de la carte, à l'étiquette et aux liens.
- **Le schéma de l'argument est composé en lignes** (`forme`, tableau de lignes) : les prémisses, un trait, puis la
  conclusion (« Donc », « Alors ») ; les variables (A, P, P′…) en italique ; filet gris à gauche, sans fond.
- **Une légende d'illustration décrit le dessin**, sans répéter la source (`tests/pages/legendes_sources.py`).

## Personnages du Grand test

**Personnages pédagogiques du Grand test (option désactivée par défaut)** — Les personnages sont des repères éditoriaux sobres, jamais des mascottes ni des portraits psychologiques. Leur dessin au trait, façon plume, emploie uniquement des lignes et ailettes issues du vocabulaire de l'emblème Müller-Lyer et la couleur existante de la catégorie. Les figures sont des SVG paramétriques générés à partir d'un corps commun et de quelques attributs distinctifs; elles n'utilisent ni dégradé, ni ombre, ni animation, ni image externe. Chaque figure reçoit un nom accessible qui décrit son rôle pédagogique. L'ensemble du site doit rester pleinement utilisable avec `PERSONNAGES_VISIBLES = false`.

## Version anglaise

La version anglaise (`/en/`) garde la mise en page, les polices et les couleurs ; seul le texte change (voir « Version anglaise » dans le README).
Elle suit les usages de l'anglais, non ceux du français :

- guillemets anglais « “ ” » (les guillemets français « » sont traduits à l'affichage), apostrophe typographique « ’ » ;
- pas d'espace avant « : », « ; », « ! », « ? » (la typographie française les sépare par une espace fine insécable) ;
- nombres à l'anglaise (`1,200.5`), pourcentage collé (`75%`), dates britanniques (`6 November 2026`), euro devant le nombre (`€1.10`) ;
- titres en minuscules sauf le premier mot et les noms propres ; « the », « a » conservés (le français s'en passe parfois) ;
- les phrases sont traduites pour leur ton et leur registre, non mot à mot : une explication reste aussi nette et aussi sourcée qu'en français.

## Mouvement

**Trois mouvements signature, et pas davantage :**

- *la révélation* : les ailettes de Müller-Lyer s'effacent et les repères apparaissent. Pour une vérité dévoilée :
  correction, illusion démontée, changement de grade.
- *le retournement* : une carte pivote sur elle-même (tirages, cartes recto verso).
- *la chute* : des billes tombent dans des colonnes, comme sur une planche de Galton (scores, hasard).

S'y ajoutent des micro-interactions discrètes : appui (enfoncement de 1 px), survol (élévation), compteur qui défile,
anneau qui se remplit, pastille de l'onglet actif.

**Règles**

- Seulement `transform` et `opacity`. Jamais d'animation qui bloque l'action, vole le focus ou tourne en boucle.
- Toute animation lancée par script passe par `animer()` (`app.js`), qui ne fait rien quand l'appareil demande moins
  de mouvement (`prefers-reduced-motion`) ou quand le réglage « Animations : réduites » est choisi (clé `reglages`).
  L'état final est toujours posé sans attendre la fin de l'animation : un banc vérifie que chaque animation se termine
  et laisse l'écran dans son état final. Le réglage réduit pose aussi `data-animations="reduites"` sur `<html>`, que la
  règle CSS globale traite comme `prefers-reduced-motion`.
- Transitions entre pages : `document.startViewTransition` quand il existe, en amélioration progressive, et seulement
  si les animations ne sont pas réduites ; sinon, le fondu d'entrée de `.vue`.

## Graphiques

Le site a un atelier « Graphiques trompeurs » : ses propres graphiques doivent être irréprochables.

- Vocabulaire : courbe, barres, toile, jauge, calendrier (`graphiques.js`, lot 4), dessinés en SVG avec `svg()`.
- Barres depuis zéro ; pas de double axe ; pas d'effet de relief ; valeurs écrites ; la couleur n'est jamais seule à
  porter l'information (motif, libellé ou position aussi) ; un titre qui dit ce que le graphique montre ; un bouton
  « Voir les données » qui affiche le tableau correspondant.
- Une toile trompe par son aire : ses valeurs sont écrites, et la même chose est proposée en barres.

## Glyphes de catégorie

Quatorze glyphes au trait, un par catégorie, dans le vocabulaire de l'emblème (lignes et ailettes), même grammaire que
les personnages du Grand test : trait de 2 px, extrémités arrondies, couleur de la catégorie, sans remplissage
dégradé. Pour les en-têtes de catégorie, le codex et les distinctions.

## États vides

Une page ou un bloc sans contenu (aucune révision, aucun résultat) montre un petit dessin au trait de la même
grammaire, une phrase qui dit pourquoi c'est vide, et l'action qui le remplira. Jamais de graphique dessiné vide : le
profil sans aucune mesure montre un seul état vide à la place de ses quatre graphiques, et la roue du codex de
l'accueil n'apparaît qu'après la première fiche lue.

## L'illusion du jour

Sur l'accueil, une illusion d'optique dessinée en SVG, différente chaque jour (`generateur(aujourdHui())`), avec
« Vérifier » (le mouvement de la révélation démonte l'illusion : repères, superposition, fond qui s'efface) et « Une
autre illusion ». Chaque illusion a une légende d'une ou deux phrases et une source (auteur, année) vérifiée.

## Écrans ajoutés par la refonte (lots 3 à 8)

- **Profil** (`#profil`) : en tête, le personnage (figure au trait de l'emblème, bras en segment de Müller-Lyer, qui
  s'équipe à chaque grade, tient l'objet de son meilleur domaine et en prend la couleur ; autour, six arcs, un par
  domaine, de longueur proportionnelle à sa maîtrise ; jamais de visage expressif ni d'animation). Quatre formes
  (humain, hibou, chat, robot : aigrettes et moustaches en ailettes), genre neutre, féminin ou masculin pour l'humain,
  et quatre équipements ; les formes et équipements autres que les premiers se gagnent par une distinction difficile.
  Le même dessin (chemins SVG, rejoués par `Path2D`) figure sur l'image « Partager mon grade ». Puis l'insigne du grade (galons faits des
  ailettes de l'emblème), maîtrise en grand nombre, jauge vers le grade suivant et la phrase « La maîtrise mesure votre
  réussite dans les jeux de ce site, pas votre intelligence. » ; onglets. Graphiques selon « Graphiques ».
- **Accueil** : le titre est une salutation, sans point final (formule selon l'heure et la date, pseudonyme s'il existe) ; l'avatar du
  joueur (88 px, 52 px sur téléphone) à gauche de la date, du titre et de la phrase, mène au choix du personnage. L'avatar
  est le même partout, mode sobre compris ; dessous, une phrase en italique selon la situation (retour, révisions, série, parcours), sinon une
  idée du jour (jamais un fait chiffré). Le personnage revient, avec un mot selon la réussite, aux bilans des ateliers,
  du quiz et des parcours.
- **Bouton de profil** dans l'en-tête : anneau de l'objectif du jour, insigne ; sur ordinateur, personnage et maîtrise.
- **Codex** : une roue de 90 points en 14 arcs aux couleurs des catégories, la taille dit l'état de la fiche.
- **Parcours** : un chemin vertical, une pastille par étape (pleine et verte : fait ; bleue : prochaine étape).
- **Moments de récompense** : une pastille « +8 » près du bouton de profil, une carte en bas d'écran pour un grade ou
  une distinction ; jamais bloquants, fermés seuls.
- **Images à partager** : 1 080 × 1 350, papier clair, barre de couleur de catégorie, Newsreader.

## La pièce du jour

Écran `#piece` (`static/piece-interface.js`, classes `pdj-`), derrière le drapeau `PIECE_VISIBLE`.

- **La feuille** : surface `--carte`, filet de 1 px, `--ombre-2`, coins de `--rayon-carte`, 680 px au plus ; une seule
  couleur de catégorie, celle du monde (`--c`). Étiquette en tête, au style des étiquettes : « Pièce n° 12 · Niveau 3,
  expert · Document fictif ». Dès 1 040 px : la feuille à gauche, la barre d'étapes et le rail d'expertise à droite
  (rail collant) ; sur téléphone, la barre d'étapes colle en haut de l'écran, avec le seul nom de l'étape courante.
- **Six habillages**, avec les seules polices et les seuls jetons du site : brève (rubrique, titre Newsreader, chapô
  21 px, figure en trois parties touchables, signature), publicité (aplat `--c-clair`, chiffre-clé en grand,
  petites lignes de 13 px), communiqué d'étude (encadré « Méthode » sur `--encadre`, conclusion en exergue), sondage
  (question en exergue, barres horizontales à valeurs et axe écrits, fiche technique), réseau fictif (avatar fait
  d'un triangle, jamais un visage), bulletin municipal (blason aux ailettes de l'emblème, bandeau à double filet,
  colonnes avant / après).
- **Zones** : de vrais boutons, cibles de 44 px, 8 px d'écart ; au repos rien ne les signale, au survol et au focus
  un fond `--c-clair`. Leur classe dit leur rôle (`pdj-r-titre`), jamais leur état. **La marque** : trait d'encre
  sous le texte, filet autour de la zone, pastille numérotée (le numéro porte l'information).
- **Contre-expertise** : quatre états, chacun glyphe au trait, mot et couleur — « Trouvé » (vert, coche),
  « Manqué » (rouge, filet tireté), « Fausse alerte » (rouge, texte barré), « Leurre évité » (gris, filet pointillé) ;
  plus « Ni juste ni faux » pour une conclusion tolérée. L'annotation suit la zone (sous la figure entière pour une
  partie de figure) : état, procédé en italique Newsreader 19 px, ce qui trompe, la preuve (lien qui mène à la zone),
  l'original barré puis la version honnête, « ≠ » et le procédé confondu, la fiche. Rapport dans le rail : note en
  grand nombre, parts en barres, phrase d'étalonnage en italique, chiffre et verdict corrigés comme au quiz.
- **Mouvements** : la révélation (annotations l'une après l'autre), le retournement (pièce rectifiée, bouton à
  `aria-pressed`), la chute (la note) ; tous par `animer()`, état final posé d'abord.

## Proscrit

Le dégradé violet, le verre dépoli, les ombres lourdes, les émojis en guise d'icônes, les illustrations de banque
d'images, les confettis, une mascotte, les animations qui bloquent l'action ou volent le focus, tout ce qui bouge en
boucle sans raison, une bibliothèque externe, une police chargée depuis un service tiers. Aucun style dans un attribut
`style=""` ni dans une balise `<style>` du HTML (politique de sécurité du contenu) : les valeurs dynamiques passent
par des variables CSS posées avec `style.setProperty()`.
