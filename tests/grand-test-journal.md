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

---

## Lot 1 — moteur de stockage et fondations (31 octobre 2026)

### Livrables

- `static/grand-test.js` : drapeaux `GRAND_TEST_VISIBLE = false`, `PERSONNAGES_VISIBLES = false` et
  `GRAND_TEST_ESSAI = false` en tête ; forme des données (`erreursGrandTest`, `grandTestValide`) ; migration
  pure version 1 → 2 (`migrerGrandTest`) ; opérations pures sur les passations (commencer, enregistrer une réponse
  non modifiable, terminer, abandonner).
- `static/grand-test-interface.js` : lecture et écriture de la clé `grandTest`, lecture seule et export du contenu
  brut si la clé est illisible, effacement isolé, page minimale. **L'expérience n'est inscrite dans `EXPERIENCES`
  que si `GRAND_TEST_VISIBLE` vaut true** : dans la version publiée, la route `#tests/grand-test` renvoie à la
  liste des ateliers.
- `static/app.js` : `grandTest` ajouté à `CLES_SAUVEGARDE` et à `FORMES_SAUVEGARDE.objet` ; `formeValide` vérifie
  en plus `grandTest` en profondeur (`grandTestImportable`), sans changer le contrat des autres clés.
- `static/index.html` : deux scripts ajoutés après `indices.js`, avant `app.js`. `static/sw.js` : les deux
  fichiers en cache, version `esprit-critique-v9`.
- Bancs : `tests/_grand-test.html` (banc « grand »), `tests/_hors-ligne.html` et `tests/hors_ligne.py` (banc
  « hors-ligne »), `tests/noms_globaux.py` (noms globaux en double, lancé avant tous les bancs). `tests/lancer.sh`
  fabrique la copie d'essai `_grand-test-essai.js` (drapeaux à true) et `_site-grand.html`, puis les supprime.

### Commandes et résultats réels

    tests/lancer.sh   (quatre configurations, 8 bancs)   → 32 / 32 rapports au vert, 12 min 24 s
      affichage 0 défaut sur 108 pages · ateliers 237 / 237 · test 131 / 131 · niveaux 24 / 24 · items 0 manque
      csp aucun blocage sur 18 adresses · grand 48 / 48 · hors-ligne 7 / 7

Premier passage (avant correction) : 31 / 32. Le banc « grand », à 1 280 px en clair, s'est bloqué au troisième
import de fichier consécutif (attente d'un rechargement qui n'est pas venu dans le temps virtuel de Chrome).
Correction : ce troisième aller-retour est remplacé par un contrôle direct de la règle d'import
(`formeValide("grandTest", …)`), l'import par fichier restant vérifié deux fois juste avant.

### Ce que vérifient les nouveaux bancs

- **grand** (48) : drapeaux à false dans le fichier publié et à l'exécution ; aucune expérience « grand-test »,
  toujours 45 ateliers ; route renvoyée vers les ateliers ; ni lien ni mention du test sur 7 pages ; clé déclarée ;
  tous les scripts de la page dans `FICHIERS` ; ordre de chargement. Dans la copie d'essai : passation, réponse non
  modifiable, 22 formes invalides rejetées, migration (graine, dates, réponses conservées ; fonction pure), version
  future et forme inconnue refusées, JSON invalide en lecture seule avec export brut, effacement isolé, espace plein
  sans perte, reprise après rechargement, aller-retour export → import identique, `grandTest` mal formé écarté sans
  rejeter les autres clés, effacement général, **aucune requête réseau** (fetch, XHR, beacon, WebSocket espionnés)
  ni ressource externe.
- **hors-ligne** (7) : un serveur à part (port 8011) sert le site ; la page installe le service worker ; le banc
  coupe le serveur ; les 27 fichiers se chargent depuis le cache ; aucune donnée de l'utilisateur ni page de banc
  dans le cache.

### Correctif hors mandat, demandé par le propriétaire

« La cécité au choix » en thème sombre : le texte saisi dans les zones de texte était noir sur fond sombre. La
règle `button, input { color: inherit }` oubliait `textarea` et `select` (même défaut dans le carnet de
prévisions). Corrigé dans `style.css` ; le contrôle `contraste-faible` vérifie désormais aussi le texte saisi dans
les champs, et le banc des ateliers contrôle cet écran. Commit séparé `327bad5`.

### Décisions

1. **Révision de DEC-02** : plutôt qu'inscrire l'expérience et la cacher de `tousLesAteliers()`, on ne l'inscrit
   pas du tout tant que le drapeau est à false. Le comportement du site publié est ainsi strictement inchangé ; le
   banc teste l'état « visible » par une copie d'essai, sans jamais modifier le fichier publié.
2. **Troisième drapeau `GRAND_TEST_ESSAI`** (false) : il admet les contenus `aRelire: true`, pour les seuls bancs.
   Sans lui, la version publiée ne tire aucun item tant qu'aucune relecture humaine n'a eu lieu.
3. **Forme de la version 1** : la forme de départ du cahier des charges (§10.1 : `parcours`, `historiqueVus`) est
   traitée comme la version 1 du schéma, migrée vers la version 2 (§10.3).
4. **Trois fichiers au lieu de deux** : `grand-test-donnees.js` (données), `grand-test.js` (fonctions pures,
   testables hors navigateur), `grand-test-interface.js` (DOM). La séparation rend le moteur testable par le
   moteur JavaScript de macOS, sans Node.js.

### Lot suivant

Lot 2 — calculs purs : Wilson, rééchantillonnage, d′ et c, Brier et Murphy, fourchettes, comparaisons.

---

## Lot 2 — moteur de score et plages (31 octobre 2026)

### Livrables

Section « Calculs » de `static/grand-test.js`, fonctions pures sans DOM :
`wilsonCorrige`, `interpreterProportion`, `precisionDe`, `hasardConventionnel`, `partLeurre`, `graineDe`,
`percentileTrie`, `reechantillonner`, `reechantillonnerStrates`, `detectionSignal`, `discernement`, `brier`,
`murphy`, `surconfiancePlage`, `bilanFourchettes` (réutilise `scoreFourchette()` du site, α = 0,1),
`rapprochement`, `veriteIllusoire`, `angleMort`, `surestimation`, `indiceCamp`, `sensibiliteQualite`,
`biaisCroyance`, `surCorrection`, `comparerPassations`, `pente`, `tendance`, `entiteAffaiblie`.

Banc « calculs » : `tests/grand_test_calculs.py`, avec `tests/grand_test_commun.py`. Il exécute le moteur dans le
moteur JavaScript de macOS (`osascript -l JavaScript`, sans Node.js) et compare chaque résultat à un **oracle écrit
séparément en Python** (formule de Newcombe réécrite, loi normale de `statistics.NormalDist`, couverture binomiale
exacte, décomposition de Murphy, score d'intervalle, rapprochement). Les outils d'autres fichiers (`generateur`,
`melanger`, `phiInverse`, `scoreFourchette`…) sont recopiés depuis leur fichier, pas réécrits.

### Commandes et résultats réels

    python3 tests/grand_test_calculs.py           → 44 / 44, 2,1 s
    tests/lancer.sh calculs grand csp test        → quatre configurations : calculs 44 / 44, grand 48 / 48,
                                                    csp aucun blocage (18 adresses), test 131 / 131

### Vérifications marquantes

- Wilson corrigé : 860 cas (n de 1 à 40) identiques à l'oracle à 10⁻¹² ; valeurs de contrôle du mandat
  confirmées : 8/16 → [0,3194 ; 0,6806], 16/16 → [0,8564 ; 1], 9/10 → [0,6577 ; 0,9901].
- **Couverture exacte recalculée, pas recopiée** : 0,924 (p = 0,3, n = 10), 0,900 (0,3 ; 16), 0,899 (0,6 ; 10),
  0,877 (0,6 ; 16), 0,950 (0,85 ; 10), 0,847 (0,85 ; 16). Toutes entre 0,80 et 0,97 : l'attente du mandat tient.
- d′ et c : 169 cas comparés à la loi normale de Python à 10⁻⁶ ; parfait 3,54, toujours « vrai » d′ = 0 et
  c = −1,77, toujours « faux » c = +1,77.
- Brier : certitude 99 % et 60 % de justesse → surconfiance 0,39, Brier = 0,4 × 0,99² + 0,6 × 0,01². Murphy :
  identité vérifiée à 10⁻⁹ sur 200 cas aléatoires.
- Répondants au hasard (500 simulations) : QCM moyenne à ±0,03 de 0,25 ; vrai-faux d′ moyen à ±0,1 de 0. Vérité
  illusoire sans effet injecté (1 000 simulations) : moyenne compatible avec zéro.
- Comparaisons, tendances et entités affaiblies : verdicts conformes à la règle préenregistrée (plage à 80 %
  excluant zéro ; rien avant trois tests ; au moins trois items par test, aucun item répété).

### Décisions

1. **Classes de Murphy** : une classe par niveau de certitude annoncé (25, 50, 70, 90, 99 %), sans regroupement.
   L'identité est alors exacte.
2. **Hasard conventionnel de l'axe A** : moyenne des chances de chaque item (0 pour un calcul, 0,25 pour un QCM,
   0,5 pour un jugement de validité). Avec la composition complète, 0,3125. C'est une convention, généralisant
   celle du mandat (qui ne prévoyait pas de QCM dans l'axe A), pas une performance mesurée.
3. **Libellés** : « trop peu d'items pour estimer » en dessous de 3 items (aucune plage) ; « précision faible »
   en dessous de 8 ; « presque sans faute » seulement si la borne basse dépasse 0,75 avec au moins 8 items ; ajout
   de « en dessous du hasard » (cas où le leurre attire), que le mandat ne nommait pas.
4. **Fourchettes** : `scoreFourchette()` mesure les années en siècles (x / 100), linéaire : conforme à « valeurs
   brutes pour les années » à un facteur constant près, ce qui ne change aucune comparaison.
5. **Percentiles** : interpolation linéaire entre rangs (type 7 de Hyndman et Fan) ; les tirages qui donnent une
   valeur non définie sont écartés et comptés (`indefinis`).

### Lot suivant

Lot 3 — générateurs de familles : instances isomorphes, tirage stratifié, anti-répétition.

---

## Lot 3 — générateurs de familles (31 octobre 2026)

### Livrables

- `static/grand-test-donnees.js` (nouveau) : 34 familles d'items. Axe A : 4 réponses calculées (vitesse moyenne,
  hausse puis baisse, intervalles, moyenne pondérée), 4 lectures fines (portée de la négation, présupposé,
  relations inversées, « seulement si »), 8 raisonnements (4 formes × crédible / non crédible). Axe B : 13 familles
  (taux de base, sur-correction du dépistage, conjonction, échantillon, régression, risque relatif, espérance,
  Simpson, erreur du joueur, dénominateur, unités, points et pourcents, sur-correction de Monty Hall). Axe C :
  10 familles conceptuelles (témoin, confusion, causalité inverse, sélection, attente, hypothèse implicite,
  conclusion excessive, information utile, sur-correction causale, sur-correction de la preuve). Plus les données
  des démonstrations de mémoire (20 listes de mots, 20 récits, 5 jeux de sources). Toutes les situations sont
  fictives et toutes les familles portent `aRelire: true`.
- `static/grand-test.js` : table fermée `GENERATEURS_GT` (aucun code ne vient des données), `instanceGT` (ordre des
  choix tiré par la graine), élisions automatiques, tirage stratifié `tirerPassation` (une famille par test, pas de
  répétition avant trois tests terminés, réutilisation signalée, déjà-vu exact, équilibre des formes valides et
  non valides, entrelacement des strates).
- Banc « familles » : `tests/grand_test_familles.py`.
- `index.html` charge `grand-test-donnees.js` avant le moteur ; `sw.js` le met en cache, version `v10`.

### Commandes et résultats réels

    python3 tests/grand_test_familles.py   → 89 / 89 (≈ 15 s)
    python3 tests/grand_test_calculs.py    → 44 / 44
    tests/lancer.sh                        → 40 / 40 rapports au vert (10 bancs × 4 configurations), 23 min 32 s

### Ce que vérifie le banc « familles »

- **Toutes** les instances de toutes les familles (au moins 20 chacune) : aucun reste de gabarit, choix distincts,
  bonne réponse unique et différente du leurre, ordre affiché cohérent, explications de trois phrases au plus,
  textes distincts dans chaque famille, fiches et ateliers réels (90 fiches, 45 ateliers relevés dans le code).
- **Oracle indépendant, en Python**, pour chaque famille : moyenne harmonique, pourcentages successifs, bornes,
  moyenne pondérée ; Bayes pour les deux familles de dépistage ; queue binomiale exacte pour l'échantillon ;
  Simpson recalculé groupe par groupe ; Monty Hall par énumération exacte (fractions) ; unités converties. Pour
  les raisonnements, l'oracle **relit le texte produit** et juge sa validité en énumérant tous les modèles de trois
  ensembles non vides (256 répartitions) ; il juge la crédibilité de la conclusion d'après la taxonomie.
- **Non-reprise** : aucune instance au-delà de 0,5 de similarité de Jaccard (trigrammes de mots) avec 4 468 textes
  des banques du site (`jeux-donnees.js`, `experiences.js`, `raisonner.js`, `pratiques.js`, `debattre.js`,
  `donnees.js`, `perception.js`, `chiffres.js`) ; aucune paire de familles différentes trop proche.
- **Tirage** : 20 tests consécutifs pour quatre graines (deux en complet, deux en express) ; aucune répétition
  avant trois tests, une instance par famille, quotas exacts, autant de raisonnements valides que non valides,
  déjà-vu et compteur recalculés depuis l'historique, entrelacement, difficulté visée stable, aucune position de
  bonne réponse au-delà de 40 % ; reproductibilité (même graine, même tirage) ; **la version publiée ne tire rien**
  (déficit signalé), puisque tout est à relire.

### Problèmes rencontrés et corrections

1. Six lignes de la famille « unités » plaçaient la bonne réponse sur le plus grand nombre affiché, ou avaient
   deux quantités égales : corrigées, et vérifiées ligne à ligne.
2. Une explication de la famille « sur-correction causale » faisait quatre phrases : le message fixe sur la
   sur-correction (« L'esprit critique n'est pas le contre-pied systématique… ») est affiché à part.
3. Premier entrelacement trop naïf (suites évitables en fin d'étape) : remplacé par un choix de la strate la plus
   nombreuse parmi celles qui diffèrent de la précédente.
4. Relecture du français d'un échantillon (une instance par famille) : élisions manquantes (« que une »,
   « que Adam »), milliers non séparés, « Toutes les coffres », articles indéfinis repris dans les questions de
   l'axe C. Tout corrigé ; les élisions sont désormais faites automatiquement.
5. L'inventaire des ateliers du banc en comptait 44 : `carnet` est déclaré dans `raisonner.js` mais dans `JEUX`
   (`#chiffres/carnet`). Le banc lit désormais le tableau qui reçoit chaque atelier.

### Décisions

1. **Identifiant d'instance stable** : `famille@i`, sans la graine, pour que l'anti-répétition reconnaisse une
   instance d'un test à l'autre ; la graine ne fixe que l'ordre des choix.
2. **Huit familles de raisonnements** (deux formes par case validité × crédibilité), pour respecter à la fois
   « deux items par case » et « une famille au plus par test ».
3. **Hasard de l'axe A** : les lectures fines sont des QCM à quatre choix (chance 0,25).
4. Les 12 familles de pièges avancés du mandat : sur-correction de Monty Hall, du dépistage, de la causalité et de
   la preuve ; portée des quantificateurs ; présupposés ; dénominateur ; unités ; points et pourcents ; et les
   trois démonstrations de mémoire (lot 5).

### Lot suivant

Lot 4 — réservoirs de faits : vrai-faux, expositions, grandeurs, angle mort, questions de société.

---

## Lot 4 — réservoirs de faits (31 octobre 2026)

### Livrables

- `static/grand-test-donnees.js` : 140 vrai-faux (70 vrais, 70 faux, 10 domaines, groupes d'affirmations qui se
  dévoileraient l'une l'autre), 100 affirmations d'exposition anodines (50/50 : mots, lieux, animaux), 80 grandeurs
  construites depuis `pays.js` (Banque mondiale, aucun chiffre recopié), 13 descriptions d'angle mort (vérité
  illusoire exclue), 10 questions de société à quatre arguments (faibles rattachés à une fiche de sophisme).
- `static/grand-test.js` : tirage des banques (équilibre vrai/faux, domaines répartis, items dérivés de l'étape 5 :
  note des affirmations lues et rappel des estimations ; moitié des fourchettes du complet corrigée seulement après
  le rappel, pour la démonstration du biais rétrospectif), `grandeurGT`.
- Bancs : `tests/grand_test_banques.py` (« banques », 33 vérifications) ; le banc « familles » vérifie aussi les
  banques dans les simulations de 20 tests (93 vérifications). `tests/grand_test_relire.py` recopie les 305 lignes
  à relire dans `grand-test-a-relire.md`.

### Sources réellement ouvertes le 31 octobre 2026

- Simons et Chabris (2011), PLOS ONE : 1 838 adultes des États-Unis pondérés à 1 500, juin 2009 ; amnésie 82,7 %,
  témoin sûr 37,1 %, caméra 63,0 %, mémoire permanente 47,6 %, hypnose 55,4 %, inattendu 77,5 %. **REF-09 confirmée.**
- Dekker et al. (2012) : 137 + 105 enseignants, 49 % de neuromythes en moyenne ; styles 93/96 %. **REF-08 confirmée.**
- Macdonald et al. (2017) : n = 3 045 / 598 / 234 ; les 18 pourcentages du mandat confirmés. **REF-07 confirmée.**
- Gapminder 2017 : 14 pays, 1 221 + 1 000 + 10 024 répondants, 2,2 / 12, hasard 4, 10 %, 15 %. **REF-11 confirmée**
  (les réponses par question ne sont pas sur la page : à vérifier dans *Factfulness*).
- Ipsos 2017 (PDF lu localement) : 29 133 entretiens, 38 pays, 28 septembre – 19 octobre 2017, ≈ 1 000 en France ;
  naissances adolescentes « moins de 1 % au Canada et en France, une sur cinq en moyenne estimée ». Valeurs exactes
  pour la France illisibles dans l'extraction : **REF-10 partiellement confirmée.**
- Eurobaromètre résistance antimicrobienne : seulement des citations de seconde main contradictoires (43 % / 50 % ;
  35 % en France). **REF-12 reste à vérifier** sur le rapport spécial 478.

### Commandes et résultats

    python3 tests/grand_test_banques.py → 33 / 33   (premier passage 32 / 33 : deux affirmations trop proches de
                                                     l'atelier « Vrai ou faux ? », reformulées)
    python3 tests/grand_test_familles.py → 93 / 93
    python3 tests/grand_test_calculs.py → 44 / 44
    CONFIGS="390 sombre" tests/lancer.sh grand csp hors-ligne test → 48 / 48, aucun blocage, 7 / 7, 131 / 131

La suite complète des quatre configurations n'a pas été relancée pour ce lot (quota de l'abonnement presque
épuisé) : le lot ne change que des données et des fonctions pures non appelées par le site publié.

---

## ARRÊT TEMPORAIRE — point de reprise (31 octobre 2026, soir)

Le propriétaire a signalé qu'il restait 6 % du quota d'abonnement. Travail interrompu proprement après le lot 4.
Drapeaux toujours à false. Site publié intact (bancs ci-dessus).

**Brouillons prêts, non intégrés**, dans `tests/grand-test-brouillons/` (à vérifier avant usage) :
- `memoire.js` (lot 5) : générateurs des trois démonstrations de mémoire, bilans, indice de sur-correction ;
- `scores.js` (lot 6) : `resoudreItem`, `reponseJuste`, `lignesPassation`, `calculerScores` (axes A à F) ;
- `interface-parcours.js` (lot 6) : plan d'écrans, reprise au premier écran inachevé, items, corrections
  (différées pour vrai-faux et raisonnements du complet), démonstrations, consentement ;
- `profil.js` (lot 6, version texte) : page de résultats par axe.

**Reprise** : intégrer `memoire.js` et `scores.js` à la fin de `static/grand-test.js`, `interface-parcours.js` et
`profil.js` dans `static/grand-test-interface.js` (en remplaçant la page minimale du lot 1 : garder chargement,
enregistrement, export brut et effacement), ajouter des styles `.gt-*` dans `style.css` sans nouveau jeton,
étendre `tests/_grand-test.html` (parcours express et complet simulés, reprise à chaque frontière), puis lots 5 à 12.
