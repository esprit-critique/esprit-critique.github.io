# « La pièce du jour » : journal

Pour reprendre dans une nouvelle session : lire `CLAUDE.md`, ce journal (« État » d'abord), puis le lot en cours dans
`tests/piece-plan.md` et `tests/piece-brief.md`. Catalogue et seuils : `tests/piece-a-relire.md`.

## État

| Lot | Branche | Pull request | État |
|---|---|---|---|
| P0 — Cadrage | `piece/p0` | #26 | brief, plan, journal, catalogue |
| P1 — Moteur (niveaux 1 à 4) | `piece/p1` | — | à faire |
| P2 — Jeu et contre-expertise | `piece/p2` | — | à faire |
| P3 — Intégration | `piece/p3` | — | à faire |
| P4 — Profondeur (niveau 5, manques, tableau, distinctions) | `piece/p4` | — | à faire |
| P5 — Finitions | `piece/p5` | — | à faire |

## Écarts entre le brief et le code (lecture au commit `f6a618c`, 14 novembre 2026)

1. **Grand test déjà publié.** `GRAND_TEST_VISIBLE = true` (`static/grand-test.js:12`) et `RELECTURE_GT.relu = true`
   (`static/grand-test-donnees.js:20`, relecture du 1er novembre). Le modèle du drapeau reste valable, mais la ligne
   `sed` de `tests/lancer.sh` qui passe `GRAND_TEST_VISIBLE` de `false` à `true` ne change plus rien. Pour la pièce,
   même mécanisme : `sed` sur la ligne exacte `const PIECE_VISIBLE = false;` vers une copie `static/_piece-essai.js`,
   et un banc qui vérifie que la version publiée garde `false`.
2. **`fr()` est dans `ateliers.js`**, pas dans `app.js` : chargé avant les scripts de la pièce, utilisable au chargement.
3. **`elisions()` et `elision()` sont des constantes de `grand-test.js`** (lignes 581 et 584), pas des outils
   partagés. Les scripts de la pièce, chargés après, pourraient les appeler, mais cela lierait la pièce au Grand
   test. Décision au lot P1 : les déplacer dans `ateliers.js` (à côté de `fr()`) si la pièce en a besoin, plutôt que
   les recopier.
4. **`grapheBarres()` et `grapheCourbe()`** (`static/perception.js:773` et `796`) rendent un seul `<svg role="img">`
   avec un nom accessible fixe. On ne peut pas y poser de contrôles (axe, tracé, légende). Décision pour P2 : le
   dessin reste une image, et les sous-zones sont des boutons HTML superposés dans l'ordre de lecture, placés par
   variables CSS (`setProperty`). Aucune fonction de dessin pour le pictogramme : à écrire en P2 avec `svg()`.
   `grapheCourbe()` sait déjà tracer un axe droit (`options.axeDroit`) et un axe inversé (`options.inverse`).
5. **`entier()` de `perception.js`** (ligne 823) est une constante globale qui tire avec `Math.random()`. Elle n'est
   pas réutilisée : la pièce tire ses valeurs avec `generateur(graine)`.
6. **Niveau automatique.** `suivrePartie()` (`static/niveaux.js:49`) juge une seule partie (≥ 80 % : monte ; < 50 % :
   descend). Le brief demande la moyenne des trois dernières pièces jouées à ce niveau, avec les mêmes seuils. C'est
   une règle propre à la pièce, une par jour (une seule partie serait trop sensible au hasard). Elle sera écrite dans
   `piece.js` et enregistrée par `enregistrerNiveau()`, sans toucher à `suivrePartie()`.
7. **Correction de 0,5 du débat truqué** : écrite directement dans `debattre.js:861`, pas dans une fonction. Elle sera
   factorisée (P3) en une fonction `tauxCorriges(detections, n, faussesAlertes, m)` appelée par les deux jeux.
8. **`defiJour` n'a pas de règle dans `REGLES_FUSION`** (`static/coffre.js:94`) : la valeur la plus récente gagne.
   Les trois clés de la pièce auront chacune leur règle, comme le brief le demande.
9. **Bancs hors navigateur.** `tests/lancer.sh` lance `tests/grand_test_<banc>.py` pour les bancs `calculs`,
   `familles` et `banques`. Le banc `piece-moteur` (`tests/piece_moteur.py`) demande sa propre ligne. Dans
   `verifier.yml`, il ira dans le travail rapide (hors navigateur) et `piece` dans celui des navigateurs.
10. **Classe CSS `piece` déjà prise** (`perception.js:263`, pile ou face) ; `rangee-pieces` existe aussi dans
    `style.css`. Les classes de la pièce du jour porteront le préfixe `pdj-`, pour éviter tout conflit avec ces
    deux noms.
11. **`--c-clair`** n'est pas un jeton de `:root`. C'est une couleur dérivée de `--c` par `color-mix`
    (`style.css:495`), déjà employée par les cartes. On l'utilise telle quelle, sans compter de jeton nouveau.
12. **`DESIGN.md`, « Graphiques »** interdit le double axe et les barres qui ne partent pas de zéro dans les
    graphiques du site. Les figures trompeuses de la pièce sont des pièces à conviction, comme celles de l'atelier
    « Graphiques trompeurs », et sont toujours étiquetées « Document fictif ». Leur version rectifiée suit la règle.
    La section « La pièce du jour » de `DESIGN.md` (P2) le dira explicitement.
13. **Stock du défi vérifié** : 40 + 68 + 32 + 15 = 155 questions de niveau 2 ou plus (chargement de `donnees.js` et
    `jeux-donnees.js` sous Node). La simulation de répétition (5 sur 10 au 7e jour) n'a pas été refaite.
14. **Ordre de chargement** : `grand-test*.js`, `illusions.js` et `tirage.js` sont chargés avant `progression.js` et
    `graphiques.js`. Les trois scripts de la pièce iront juste après `graphiques.js`, avant `profil.js`. `profil.js`
    pourra alors appeler la pièce dans ses fonctions pour l'onglet du tableau des procédés.
15. **`MAITRISE_JEUX`** : un banc échoue si un atelier de `tousLesAteliers()` n'y figure pas. L'atelier `piece` et son
    entrée `MAITRISE_JEUX.piece` entreront donc dans le même commit (P3).
16. **Fiches liées** : les 23 identifiants du catalogue existent dans `INDEX`, avec le bon type (`biais:` pour les
    lignes < 1024 de `donnees.js`, `sophismes:` au-delà). L'atelier `graphiques` existe (`ateliers.js`).

## Décisions et hypothèses

- **Procédé retiré : `offre-leurre`.** On peut constater sur la page qu'une offre est dominée par une autre, mais pas
  qu'elle a été « placée là pour en avantager une autre » : c'est une intention, non décidable. Le procédé est retiré
  du service ; la fiche `biais:leurre` reste liée à un leurre du catalogue (« trois offres honnêtes »).
- **`precision-illusoire` ne vit qu'entre n = 400 et n = 1 500.** Plus bas, il entrerait dans la marge interdite de
  `petit-echantillon` (30 < n < 400) et les deux procédés seraient confondus. À ces effectifs, l'échantillon est
  suffisant, mais la marge d'erreur (± 2,5 à ± 5 points) rend absurde un pourcentage au centième.
- **Procédés sans paramètre** (rhétorique, `sans-temoin`, `post-hoc`…) : l'intensité règle la discrétion de la preuve
  (forte : dans la même zone ou la zone voisine ; moyenne : ailleurs dans le corps ; faible : dans les petites lignes,
  la méthode ou la fiche technique). La preuve reste toujours affichée, lisible et dans le nom accessible.
- **Une zone porte au plus un procédé**, sauf la figure au niveau 4 et plus (deux procédés, sur deux sous-zones
  différentes). Les paires de procédés qui se disputent la même zone (le titre causal, par exemple) sont déclarées
  incompatibles.
- **`temoignage`** exige qu'aucune donnée d'ensemble ne figure sur la pièce : il est incompatible avec toute figure,
  tout tableau et tout chiffre-clé. Il ne se pose donc que sur une publicité ou une publication de réseau sans visuel
  chiffré.
- **`source-absente` et le manque « source »** s'excluent sur une même pièce : vague, la zone existe ; manquante, elle
  n'existe pas.
- **Effet sur le verdict.** Une exagération graphique dont le sens est exact (`axe-tronque`, `pictogramme`) n'a aucun
  effet : la conclusion « a augmenté » reste établie. Les gabarits de conclusion n'emploient donc jamais d'adjectif
  d'ampleur (« explose ») quand une figure porte un de ces deux procédés. C'est le titre qui l'emploie, et c'est lui
  qu'on marque.
- **Noms inventés.** Pour éviter toute homonymie avec une commune, une marque ou un média réels : aucun nom propre de
  lieu, de produit, d'entreprise ni de rédaction (« la ligne 7 », « l'application de révision », « la rédaction »).
  Seuls les comptes du réseau fictif et les témoins portent un nom : un prénom seul, ou un pseudonyme fait de deux
  noms communs (« Ruelle_Verte »). Tous sont listés dans `tests/piece-a-relire.md`.
- **Mondes retenus pour P1** : les douze du vivier. `simpson` et `circulaire` n'apparaissent qu'au niveau 5 (P4).
- **Part de hasard `c`** : calculée en P3, par simulation sur le moteur (joueur au hasard ; joueur qui répond toujours
  « Rien à signaler »).

## Mesures

À faire en P1 (génération, taille des scripts) et en P3 (premier affichage de l'accueil, avant et après).
