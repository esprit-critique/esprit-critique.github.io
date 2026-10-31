# Charte graphique d'Esprit critique

Une page de règles, pour que les prochaines modifications gardent l'identité du site. La mise en page (cartes, barre
de couleur de catégorie à gauche, navigation, espacements) ne change pas : l'identité tient à six touches.

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

Les jetons existants de `static/style.css` (`--fond`, `--carte`, `--texte`, `--discret`, `--trait`, `--accent`,
`--vert`, `--rouge`, `--orange`, `--encadre`, et `--c` avec ses dérivés `--c-fort`, `--c-texte`, `--c-clair`,
`--sur-c` pour la couleur de catégorie), en clair et en sombre. **Aucun jeton nouveau.** Contraste : 4,5:1 pour le
texte (3:1 en grands caractères), vérifié par le contrôle d'affichage (`contraste-faible`).

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

## Proscrit

Refonte de la mise en page, nouvelle palette, dégradés, ombres portées, illustrations décoratives, mascotte,
animations nouvelles, bibliothèque externe, police chargée depuis un service tiers. Aucun style dans
un attribut `style=""` ni dans une balise `<style>` du HTML (politique de sécurité du contenu).
