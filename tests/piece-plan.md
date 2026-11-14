# « La pièce du jour » : plan

Brief : `tests/piece-brief.md`. Journal : `tests/piece-journal.md`. Catalogue : `tests/piece-a-relire.md`.
Un lot = une branche `piece/pN` = une pull request, fusionnée quand l'intégration continue passe. `PIECE_VISIBLE`
reste à `false` dans `main` jusqu'à la bascule par le propriétaire.

## P0 — Cadrage (aucun code du site)

Brief copié, journal (écarts, décisions), plan, catalogue complet dans `tests/piece-a-relire.md`.

## P1 — Moteur, niveaux 1 à 4 (rien de visible)

1. `static/piece-donnees.js` : `RELECTURE_PIECE`, mondes, formats, procédés (seuils, intensités, voisins, effets,
   incompatibles, fiche), leurres, gabarits. Les données suivent les tableaux de `tests/piece-a-relire.md`.
2. `static/piece.js` : `PIECE_VISIBLE`, `PIECE_VERSION`, `PIECE_JOUR_UN`, `grainePiece()`, rotation par cycles
   mélangés, `genererPiece(jour, niveau)`, puis pour chaque procédé `poser`, `detecte` et `preuves`. Viennent ensuite
   les fonctions de calcul (verdict, « Chiffrer ») et `noterPiece(piece, reponse)`. Tout est pur, sans DOM, et
   chargeable sous Node.
3. Branchement : les deux `index.html` (après `graphiques.js`), `sw.js` (`FICHIERS` et `CACHE`),
   `verifierChargement()`. Dictionnaire anglais `static/en/dico-piece.js`, dans la même branche.
4. Banc `piece-moteur` (`tests/piece_moteur.py`, qui lance Node) : déterminisme, non-ambiguïté (4 niveaux × 3 000
   graines), niveaux, variété (365 jours), calculs (oracle Python), notation, fiches. Il entre dans `tests/lancer.sh`
   et dans le travail rapide de `verifier.yml`.
5. Mesures : temps de génération (processeur ralenti quatre fois, par Chrome) et taille des scripts, dans le journal.

## P2 — Jeu et contre-expertise

`static/piece-interface.js` et CSS (`pdj-`), six habillages, zones et marques, barre d'étapes, contre-expertise,
retournement, rapport et partage. Route `#piece` active seulement avec la copie d'essai `_piece-essai.js`
(`tests/lancer.sh`). Banc `piece` (`tests/_piece.html`), captures sur la branche `captures` (`piece-lot-2`), section
« La pièce du jour » de `DESIGN.md`.

## P3 — Intégration

La carte de l'accueil remplace le défi quand le drapeau est à `true`. Il faut aussi : programme du jour,
`gagnerTroisCartes()`, `SOURCES_LUCIDITE` (`piece-jour`, `piece-libre`) et l'étalonnage, `MAITRISE_JEUX.piece` (part
de hasard calculée), le niveau automatique sur trois pièces, les clés `pieceJour`, `pieces` et `pieceBilan` (sauvegarde,
schémas, `REGLES_FUSION`, bancs `aleatoire` et `synchro`). Puis l'atelier `#tests/piece`, les archives, la pièce libre,
la recherche, les raccourcis, l'article « Lire une pièce », le README et le décompte des ateliers (pages fixes
comprises). Factoriser la correction de 0,5 de `debattre.js`. Captures `piece-lot-3`.

## P4 — Profondeur

Dossier du niveau 5 (`simpson`, `citation-tronquee`, `circulaire`), manques (niveaux 4 et 5), tableau des procédés
(onglet du profil), quatre distinctions, étapes dans les parcours « Info ou intox » et « Les chiffres qui trompent ».
Banc `piece-moteur` étendu au niveau 5.

## P5 — Finitions

Relecture de l'anglais, mesures finales, contrôle visuel, `tests/piece-a-relire.md` complet (tous les gabarits en
français et en anglais), mise à jour de `CLAUDE.md`. Arrêt : la bascule appartient au propriétaire.
