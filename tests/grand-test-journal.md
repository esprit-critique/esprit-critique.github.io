# Le Grand test — journal d'exécution

Mémoire durable du travail. À relire intégralement au début de chaque lot, et après toute perte de contexte.
Plan : [grand-test-plan.md](grand-test-plan.md). Points humains : [grand-test-a-relire.md](grand-test-a-relire.md).

**État des drapeaux à ce jour : `GRAND_TEST_VISIBLE = false`, `PERSONNAGES_VISIBLES = false`.**

---

## Lot 0 — fondations, audit et journal (31 octobre 2026)

### Livrables

- Audit du dépôt réellement présent, consigné dans `grand-test-plan.md` §1 : fichiers du site, ordre de
  chargement des scripts, bancs d'essai, 32 outils réutilisables avec leur **signature réelle vérifiée dans
  le code**, banques de contenu existantes.
- Inventaire confirmé : **45 ateliers** (identifiants et sections relevés dans le code) et **90 fiches**
  (B 1–51, S 1–39, champ `num` de `donnees.js`).
- `tests/grand-test-plan.md`, `tests/grand-test-journal.md`, `tests/grand-test-a-relire.md` créés.
- Modèle de données, signatures de calcul, graines, quotas, anti-répétition et matrice des bancs documentés.

### Commandes réellement exécutées

    python3 - (extraction des 90 fiches : type, num, id, nom, catégorie)   → 90 lignes, 51 numéros de biais
    python3 - (extraction des ateliers : section, id, titre)               → 45 ateliers
    python3 - (extraction de VRAI_FAUX)                                    → 97 items existants
    grep / sed sur static/*.js, tests/*                                    → signatures des outils
    tests/lancer.sh                                                        → état initial de la suite

État initial de la suite (quatre configurations, 390 et 1 280 px, clair et sombre), avant toute
modification :

    affichage : 0 défaut, 108 pages, 0 erreur JavaScript
    ateliers  : 236 / 236
    test      : 131 / 131
    niveaux   : 24 / 24
    items     : 0 niveau sans assez d'items, sur 36
    csp       : aucun blocage ni erreur sur 18 adresses

Branche `main`, arbre propre, dernier commit `f4d9960`.

### Décisions, avec leur raison

1. **Les titres d'ateliers du mandat ne correspondent pas au code.** Le code fait foi (règle du mandat §0).
   Les vrais titres sont relevés dans le plan §1. Aucun identifiant n'a été inventé.
2. **L'identifiant de la section « débattre » est `debattre`**, sans accent ; il est inséré dans
   `SECTIONS_ATELIERS` par `debattre.js`, pas déclaré dans `ateliers.js`.
3. **Il n'existe aucun atelier `mémoire`**, contrairement à ce que suppose le mandat §7.2. La mémoire est
   donc un manque réel, à combler au lot 8 ; les ateliers existants `citations` (faux souvenirs de
   citations) et `carnet` (rappel de ses propres prévisions) en approchent sans le couvrir.
4. **`courbeEtalonnage()` est réutilisée sans modification.** Son axe horizontal va de 50 à 100 % et ses
   classes sont `NIVEAUX_CONFIANCE = [50, 70, 90, 99]`. Le niveau « au hasard (25 %) » des QCM du Grand test
   en sortirait : il sera restitué à part, en texte et dans le tableau équivalent. Modifier une fonction
   partagée aurait changé l'affichage du portrait et de deux ateliers.
5. **Placement des scripts** : `grand-test-donnees.js` puis `grand-test.js`, après `indices.js` et **avant
   `app.js`**, car `app.js` lance la navigation à son chargement et doit déjà connaître l'expérience. Les
   deux nouveaux fichiers ne doivent appeler aucun outil d'`app.js` au chargement — c'est la convention de
   tous les autres fichiers du site, qui n'utilisent `el()`, `lire()`… qu'au moment de l'appel.
6. **Route cachée** : l'expérience `grand-test` sera inscrite dans `EXPERIENCES` (sinon `afficherPage()`
   renvoie `#tests/grand-test` vers la liste des ateliers) mais marquée cachée et retirée de
   `tousLesAteliers()` quand `GRAND_TEST_VISIBLE` est `false`. Le décompte d'ateliers de la page et des
   bancs reste donc à 45.
7. **Aucune source n'est déclarée vérifiée au lot 0.** Les 30 références du tableau §11.1 du mandat et les
   pistes du §11.2 sont toutes inscrites « à vérifier » dans `grand-test-a-relire.md`. Aucun de leurs
   chiffres n'entre dans le site avant d'avoir été ouvert sur sa source primaire.

### Problèmes

Aucun. La suite est au vert avant modification.

### Vérifications humaines restantes

Voir `grand-test-a-relire.md` : à ce stade, les 30 références du mandat et les 15 pistes complémentaires.

### Lot suivant

Lot 1 — moteur de stockage et fondations : route interne cachée, constantes à `false`, schéma versionné,
reprise, validation, import/export, migration, mise à jour de `sw.js`.
