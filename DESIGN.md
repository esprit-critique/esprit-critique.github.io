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
- **Étiquettes** (surtitres, étiquettes de catégorie, intertitres de fiche, consignes) : capitales du caractère de
  titre, 12,5 px, graisse 650, espacement 0,07 em. Newsreader n'a pas de glyphes de petites capitales : ne pas
  utiliser `font-variant-caps: all-small-caps`, que chaque navigateur fabriquerait différemment.
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
- Le bleu `--accent` reste la couleur des actions et des liens hors catégorie.

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

Titre de page (h1 des vues) : Newsreader 40 px sur téléphone, jusqu'à 56 px sur ordinateur, interligne 1,05.
Grands nombres (score, maîtrise, points) : Newsreader, 64 à 80 px, chiffres elzéviriens. Titres de carte : 21 px.
Entre deux blocs d'une page : 28 px au moins (40 px sur ordinateur).

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
des fiches et des explications (`.section::before`). Il est décoratif. **Réservé aux séparateurs** : ni les bordures
des cartes, ni les listes. L'emblème lui-même apparaît dans l'en-tête et, pour un nouveau visiteur, dans
l'ouverture de l'accueil ; toucher l'un ou l'autre révèle les repères verticaux.

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
grammaire, une phrase qui dit pourquoi c'est vide, et l'action qui le remplira.

## L'illusion du jour

Sur l'accueil, une illusion d'optique dessinée en SVG, différente chaque jour (`generateur(aujourdHui())`), avec
« Vérifier » (le mouvement de la révélation démonte l'illusion : repères, superposition, fond qui s'efface) et « Une
autre illusion ». Chaque illusion a une légende d'une ou deux phrases et une source (auteur, année) vérifiée.

## Proscrit

Le dégradé violet, le verre dépoli, les ombres lourdes, les émojis en guise d'icônes, les illustrations de banque
d'images, les confettis, une mascotte, les animations qui bloquent l'action ou volent le focus, tout ce qui bouge en
boucle sans raison, une bibliothèque externe, une police chargée depuis un service tiers. Aucun style dans un attribut
`style=""` ni dans une balise `<style>` du HTML (politique de sécurité du contenu) : les valeurs dynamiques passent
par des variables CSS posées avec `style.setProperty()`.
