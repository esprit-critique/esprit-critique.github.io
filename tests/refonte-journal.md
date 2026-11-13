# Refonte « Esprit critique, version 2 » : journal

Pour reprendre dans une nouvelle session : lire `CLAUDE.md`, ce journal (section « État » d'abord), puis le lot en
cours dans `tests/refonte-plan.md` et `tests/refonte-brief.md`.

## État

| Lot | Branche | Pull request | État |
|---|---|---|---|
| 0 — Filet de sécurité | `refonte/lot-0` | #6 | fusionné |
| 1 — Protéger le site | `refonte/lot-1` | #7 | fusionné (alerte CodeQL « certitudes » classée faux positif par le propriétaire) |
| 2 — Identité visuelle | `refonte/lot-2` | #8 | fusionné (captures : branche `captures`, dossier `lot-2`) |
| 3 — Relancer le hasard | `refonte/lot-3` | #9 | fusionné (captures : branche `captures`, dossier `lot-3`) |
| Planche de Galton (demande du propriétaire) | `galton-20` | #10 | fusionné : 20 questions, jauge qui suit la partie |
| 4 — Maîtrise, grades, points | `refonte/lot-4` | #11 | fusionné (captures : branche `captures`, dossier `lot-4`) |
| 5 — Parcours | `refonte/lot-5` | #12 | fusionné |
| 6 — Synchronisation chiffrée | `refonte/lot-6` | #13 | fusionné, drapeau vide ; mise en service : étape manuelle du propriétaire (serveur/README.md) |
| 7 — Cybersécurité | `refonte/lot-7` | #14 | fusionné |
| 8 — Finitions (1re partie) | `refonte/lot-8` | #15 | fusionné |
| 8 — Finitions (fin) | `refonte/lot-8b` | #16 | fusionné : la refonte est terminée, voir « Bilan » |

## Écarts entre le brief et le code

- `svg()` est défini dans `ateliers.js`, pas dans `app.js` (chargé avant `app.js` : utilisable au chargement par les
  scripts qui suivent `ateliers.js`).
- `recherche.js` est chargé après `app.js` (le brief dit `app.js` « presque en dernier » : exact).
- Le brief cite 8 fichiers liés au chemin macOS de Chrome ; `tests/pages/recadrer.py` employait en plus `sips`
  (macOS) pour lire la largeur d'une image : remplacé par la lecture de l'en-tête PNG.
- `main` n'était pas au vert au commit `cb90ed8` : les bancs `test`, `grand` et `hors-ligne` échouaient tous les trois
  sur `JSON.parse` de la liste `FICHIERS` de `sw.js`, où un commentaire avait été ajouté le 6 novembre (c991b73).
  Corrigé au lot 0 (commentaire sorti du tableau). Le `main` local était en retard d'un commit sur GitHub : `8a86cf0`
  (commit de référence du brief) contenait déjà e70eacc, qui corrigeait autrement la lecture dans les bancs et le
  compte des ateliers (49). La fusion du lot 0 réunit les deux ; les mesures « avant » ci-dessous sont à `cb90ed8`.
- Lot 1 : le brief prescrit `trusted-types 'none'`. Or `navigator.serviceWorker.register()` est un point d'injection
  « TrustedScriptURL » : avec `'none'`, le service worker ne s'enregistrait plus (mode hors ligne cassé), et le banc
  `csp` ne le voyait pas (message « This document requires 'TrustedScriptURL' assignment » non reconnu). Choix :
  `trusted-types esprit-critique`, une seule règle, qui n'accepte que l'adresse du service worker ; le banc `csp`
  reconnaît désormais ces messages ; le banc Playwright vérifie l'enregistrement du service worker sur la vraie page.
- Lot 1 : `PICTOS` et `TRAITS_ENTITE` ne sont pas réécrits en listes d'objets : les chaînes SVG (fixes, internes) sont
  gardées et lues par `dessinerSvg()`, qui recrée chaque élément par `svg()`. Même résultat (aucun HTML inséré), diff
  bien plus court, dessins toujours lisibles. Contrôle : arbre SVG identique à l'ancienne insertion pour les 35 dessins
  (banc `test`), plus strict qu'une comparaison de captures.
- Lot 1, défaut ancien trouvé par le nouveau test : si `pays.js` manque, `chiffres.js` plante au milieu de la
  déclaration de `JEUX`, et `typeof JEUX` lève alors une erreur (zone morte temporelle) : `verifierChargement()`
  plantait elle-même et le message « Chargement incomplet » n'apparaissait jamais. Chaque `typeof` est maintenant protégé.
- Lot 1 : la page 404 générée annonçait « 48 ateliers » (le générateur avait 48 en dur, la page avait été corrigée à la
  main à 49) : générateur corrigé.
- Lot 1 : deux ateliers (`demonter`, `laterale`) écrivent `null` dans `vus` (identifiant absent) ; le schéma de `vus`
  admet donc toute valeur simple, pour ne rien perdre.

## Décisions et hypothèses

### Lot 0

- Chemin de Chrome : un seul module, `tests/navigateur.py` (variable `CHROME`, sinon `google-chrome`,
  `google-chrome-stable`, `chromium`, `chromium-browser`, sinon le chemin macOS). Les scripts shell l'appellent.
- Moteur JavaScript hors navigateur : `node`, avec `vm.runInThisContext` pour garder la sémantique d'osascript
  (la valeur de la dernière expression du pilote est le résultat). Mêmes résultats que sous osascript
  (calculs 44/44, familles 93/93, banques 45/45 ; `grand_test_relire.py` réécrit `grand-test-a-relire.md` à
  l'identique).
- `tests/lancer.sh` : syntaxe par `node --check` (y compris `static/en/*.js`, absents du contrôle précédent) ; boucle
  sans sous-shell pour garder la liste des échecs ; code de sortie 1 si un rapport échoue (`tests/verdict.py`, qui
  se contrôle lui-même sans argument).
- Bancs indépendants de la taille et du thème (`calculs`, `familles`, `banques`, `recherche`) : une seule fois, dans la
  première configuration (auparavant quatre fois ; `familles` dure ≈ 4 min 30 sous Node).
- Playwright : dépendance de développement figée en 1.64.1 (publiée le 14 octobre 2026 ; 1.65.0, du 5 novembre,
  jugée trop récente). Il lance le Chrome du système (`executablePath` = `CHROME`) : aucun navigateur à télécharger,
  ni en local ni dans l'intégration continue.
- Intégration continue : trois tâches (syntaxe et contrôles rapides ; bancs hors configuration ; bancs dans Chrome,
  une tâche par configuration en parallèle). Node, Python et Chrome préinstallés sur `ubuntu-latest` : pas
  d'action `setup-*`. Rapports joints en cas d'échec (`actions/upload-artifact` v7.0.2).
- `publier.yml` : permissions au niveau de la tâche (`pages: write`, `id-token: write` seulement pour la publication),
  `needs: verifier`.
- Le brief est copié dans `tests/refonte-brief.md` pour qu'une nouvelle session le retrouve.

### Lot 1

- Validation profonde dans un nouveau fichier, `static/sauvegarde.js` (chargé avant `app.js`) : `SCHEMAS_SAUVEGARDE`,
  une petite grammaire (entier, jour, nombre, texte, paire, fiche, liste, dico, objet à champs nommés avec champs
  obligatoires `"!"`). Les champs non décrits sont gardés comme valeurs « libres » bornées : écarter un champ inconnu
  ferait perdre des données légitimes. La forme de premier niveau (`FORMES_SAUVEGARDE`, `formeValide`) reste exigée.
- Champs obligatoires trouvés par le banc à données aléatoires (plantages du portrait) : `montyHall` exige ses
  tableaux à 3 et 10 portes, chacun avec `garder` et `changer` ; un niveau de `resultatsAteliers` exige `historique`.
- Bancs : `_aleatoire.html` (nouveau, une fois, hors configuration : 1 000 sauvegardes, 1 000 adresses, graine fixe) ;
  `_test` et `_ateliers` vérifient que la progression réellement écrite par le site passe la validation sans perte ;
  le banc Playwright vérifie Trusted Types, le référent, le service worker et « Recharger » sur la vraie page.
- `ecrire()` : un échec (stockage plein ou bloqué) est annoncé une fois par visite (`annoncer()`, différé car défini
  plus bas dans `app.js`).
- `tests/securite.py` : éprouvé sur un fichier piégé (14 problèmes relevés sur 14) et sur une CSP faussée.
- `security.txt` expire le 1er novembre 2027 ; le contrôle échoue à partir du 2 octobre 2027.
- CodeQL v4.39.3, Dependabot (actions chaque semaine, npm chaque mois).

### Lot 2

Fait (branche `refonte/lot-2`, PR #8) :
- `DESIGN.md` version 2 ; jetons (`--rayon-bouton` 10 px, `--rayon-carte` 12 px, le bas de la fourchette du brief,
  car le propriétaire avait demandé fin octobre « pas de coins très arrondis » ; `--ombre-1/2`, `--carte-haute`,
  durées, `--courbe`, largeurs) ; cartes à jouer ; titres 40 à 56 px ; grands nombres 64 à 80 px.
- Filet du spectre (app.js, `dessinerSpectre`) ; en-tête sur une ligne dès 1 040 px ; page de 1 120 px.
- Accueil : ouverture (date, série, action principale ; nouveau visiteur : emblème et un seul bouton), « Le programme
  du jour » (trois cases fait / à faire), deux colonnes dès 1 040 px. Écart : l'illusion du jour est en tête de la colonne
  latérale ; sur téléphone elle vient donc après les cartes du jour (le brief la place juste après le programme).
- L'illusion du jour (`static/illusions.js`, `dico-illusions.js`) : 9 illusions, sources vérifiées le 11 novembre
  (Gregory et Heard 1979 sur richardgregory.org ; Kanizsa 1955, Rivista di Psicologia 49:7-30 ; Zöllner 1860,
  Annalen der Physik, DOI 10.1002/andp.18601860712 ; Hering 1861, Beiträge zur Physiologie ; Jastrow 1892, American
  Journal of Psychology 4(3) — et non 1889, date de Müller-Lyer ; Chevreul 1839, Pitois-Levrault). Ponzo écarté
  (`tests/a-verifier.md`). Scénario de capture `illusions` dans `_visu.html`.
- Fiche : indice en coin, rail collant (sommaire, carte suivante, carte au hasard) dès 1 040 px, barre d'actions
  collante sous 760 px.
- Transitions de vue (`transitionDeVue`, pas dans un cadre), `view-transition-name: titre-fiche` entre liste et fiche.
- Glyphes des 14 catégories (`GLYPHES_CATEGORIE`, champ `glyphe` ajouté aux catégories de `donnees.js`, car
  `en/fiches.js` remplace leur nom).
- Réglage « Animations » (clé `reglages`), `animer()`, `data-animations="reduites"` ; banc du mouvement dans `_test`.

Aussi : états vides dessinés (`dessinVide`), raccourcis du manifeste (`#hasard`, `#defi`), images d'aperçu (FR et EN,
`generer_apercu.sh` fait les deux), ateliers sur deux colonnes, suggestions de l'accueil sous les deux colonnes.
Captures des PR : branche orpheline `captures` (dossier par lot), liées depuis la PR, pour ne pas alourdir `main`.
Bancs rendus déterministes : la révélation est menée à sa fin (`finish()`) avant lecture ; la Planche de Galton du banc
Playwright joue jusqu'à dix questions comptées (échec intermittent ancien, dépendant du tirage).
Reporté aux lots 3 et 4 : bouton de profil et graphiques (lot 4), carte « Au hasard » de l'accueil (lot 3).

### Lot 3

- `static/tirage.js` : `sacDeTirage()` (tire par la fin ; au remélange, échange si le premier tiré est le dernier du
  cycle précédent) ; `TIRAGE` (session) ; un sac par contenu de périmètre (`cles.join()`), pour que le compte
  « 3 sur 51 » continue d'une carte à l'autre (défaut trouvé par le banc : le sac était recréé à chaque carte).
- Périmètres : toutes, même type, même catégorie, non acquises, à réviser ; « Privilégier les cartes jamais lues ».
  Écart : le brief dit « jamais ouvertes » ; le site ne retenait pas les fiches ouvertes. Nouvelle clé `fichesLues`
  (pied de fiche atteint, IntersectionObserver), dont le lot 4 a besoin (points, distinction « Cartographe ») ; le
  tirage privilégie les fiches jamais lues.
- Historique : premier tirage = nouvelle entrée (`location.hash`), suivants = `location.replace` ; vérifié par
  « retour » qui ramène à la liste (`history.length` est plafonné à 50 par Chrome, inutilisable dans le banc).
- Touches : R pour tout bouton `[data-tirer]`, espace pour `[data-retourner]` (app.js, gestionnaire global).
- Mode « Cartes » : `#cartes/<type>`, respecte les filtres de la liste, n'enregistre rien.
- Défi libre : `#defi/<graine>` (1 à 9 chiffres ; une graine invalide est remplacée), `questionsDuDefi(jour, graine)`,
  `questionDeDefi()` extraite du défi du jour. Le lot 4 y ajoutera les points (2 défis par jour).
- Planche de Galton : « Passer cette question » rétablit `vus` tel qu'avant le tirage, désactivé dès qu'on répond.
- Limite des bancs : l'observateur de visibilité, comme les transitions de vue, dépend du rendu, que le cadre sans
  fenêtre ne produit pas toujours ; le banc vérifie `noterFicheLue()` directement.

### Planche de Galton (hors lots, demandes du propriétaire du 11 novembre)

Partie de 12 puis 20 questions répondues (les passées ne comptent pas), bilan avec un anneau par catégorie jouée
(part de bonnes réponses, valeurs écrites ; un anneau par catégorie plutôt qu'un camembert, qui montrerait la
répartition des questions et non la réussite). La jauge de l'en-tête de question suivait le jeu (une question,
donc toujours vide) : `entete()` (ateliers.js) suit la partie quand `MELANGE.actif`.

### Lot 4

- `static/progression.js` (pur), `static/graphiques.js`, `static/profil.js` (interface). Noms globaux en double
  évités : `majMaitrise` (et non `majProgression`, déjà dans app.js), `afficherPageProfil` (`afficherProfil` existe
  dans le Grand test).
- Parts de hasard de `MAITRISE_JEUX` : déduites de la forme des questions de chaque jeu (commentaire par ligne), sans
  relecture jeu par jeu de chaque banque : à affiner si un jeu paraît trop sévère ou trop généreux.
- Grand test : axes A à D (proportion p) corrigés d'un hasard estimé à 1/4, pleine confiance à 10 items ; E (excès de
  confiance) : 30 points d'écart → 0 ; F exclu (exploratoire). A et C → raisonner, B → perception, D → débattre,
  E → confiance.
- Points : le quiz donne le total de la série (barème par réponse, `totalSerie`, jamais négatif) une fois, au bilan ;
  la réponse libre juste vaut 12 dans ce total. Une erreur qui place une notion nouvelle en boîte 1 n'est pas une
  « montée de boîte » (défaut trouvé à l'essai). Seuils vérifiés par le calcul (banc) : quiz 1/3 et 3/4, duels 60 % et 6/7.
- Distinctions : calculées à la volée (rétroactives) ; `distinctions.obtenues` sert seulement à annoncer les nouvelles ;
  drapeaux des secrètes dans `distinctions.drapeaux` ; compteurs « À l'heure » et « Leçon retenue » dans
  `lucidite.cumuls`. « Bingo » lit `bingo.ligne` : à vérifier quand l'atelier enregistrera une ligne complète (il ne le
  fait pas encore : distinction pour l'instant inaccessible).
- Série avec repos : un jour manqué est pardonné si aucun autre ne l'a été dans les sept jours suivants.
- Simulation (banc, joueurs à 45, 70 et 92 % ; quiz et jeux notés seulement) : moyen — Élève j1, Sceptique j4,
  Détective j7, Analyste j16, Stratège j35, Philosophe j107, 360 à six mois ; fort — Maître j92, 710 à six mois.
  Le joueur moyen plafonne à Philosophe et non à Virtuose (brief) ; seuils non modifiés : la simulation n'inclut pas
  les mesures particulières ni le Grand test, qui le feraient monter.
- Références de l'article sur la motivation vérifiées (DOI, revue, pages, résultats) : Sailer et Homner 2020
  (10.1007/s10648-019-09498-w), Deci, Koestner et Ryan 1999 (10.1037/0033-2909.125.6.627), Nunes et Drèze 2006
  (10.1086/500480), Kivetz, Urminsky et Zheng 2006 (JMR 43, 39-58).
- Reporté : onglet « Parcours » du profil (lot 5) ; carte à partager du grade (lot 8).

### Lot 5

- `static/parcours.js` : huit parcours (identifiants du brief, tous vérifiés), étapes ordonnées en alternant lecture
  et pratique, terminées par le quiz ciblé (Premiers pas : puis la première série). Titre, promesse, conclusion
  rédigés ; la conclusion renvoie vers « Je l'ai repéré ».
- Étapes : fiche lue (`fichesLues`), atelier = une partie enregistrée (le carnet et le débat à deux enregistrent une
  partie : aucun cas particulier nécessaire ; le bingo n'est dans aucun parcours), série = 10 notions rencontrées,
  quiz ciblé = 4/5 (`parcours.quiz[id]`). Le quiz ciblé n'écrit pas dans la mémoire du quiz (pas d'effet de bord).
- Accueil : nouveau visiteur → « Commencer : Premiers pas » ; parcours suivi → sa prochaine étape est l'action
  principale ; sinon « Suivre un parcours ». Profil : onglet « Parcours » avec les sceaux. Recherche : les parcours
  sont indexés.
- Points : 10 par étape faite et 50 par parcours terminé, une seule fois, crédités à la visite du parcours
  (une étape faite ailleurs est créditée à la visite suivante de sa page).
- `avancement` existait (Grand test) : `avancementParcours`.

### Lot 6

- `static/coffre.js` (drapeau `SYNCHRO_URL = ""`), `serveur/` (worker.js, schema.sql, wrangler.toml, README),
  `serveur/essai.mjs` (17 essais du Worker sur une base D1 simulée), `serveur/serveur-local.mjs`, `tests/synchro.js`
  (banc « synchro » : drapeau vide sur 18 adresses, deux navigateurs, fusion, contenu altéré d'un bit).
- Écart : les essais du serveur ne passent pas par `wrangler dev` (il faudrait installer Wrangler) mais appellent
  directement `traiter()` du Worker avec une base simulée qui ne comprend que ses requêtes ; même couverture (jeton
  absent ou faux, taille, conflit, origine étrangère, purge, plafond), sans dépendance.
- Horodatages : `ecrire()` appelle `noterModification()`, qui n'écrit la clé `horodatages` (hors CLES_SAUVEGARDE :
  métadonnée, non exportée) que si un compte est actif sur l'appareil.
- Table `REGLES_FUSION` (coffre.js) : union (acquis, activite, fichesLues, distinctions), entrée la plus jouée
  (memoire, resultatsAteliers avec record maximal), maximum (records, chrono), fusion à trois (confiance, fourchettes,
  certitudes, duels, lucidite : total, jours, cumuls), maitrise (union des jours, meilleure maximale) ; sinon la
  version la plus récente.
- Limitation de débit : syntaxe `[[ratelimits]]` vérifiée dans la documentation (période 10 ou 60 s).
  `wrangler d1 create … --jurisdiction=eu` vérifié (non modifiable ensuite).
- Textes « aucune donnée envoyée » : inchangés tant que le drapeau est vide ; proposition à relire dans
  `tests/a-verifier.md`. `sw.js` : son en-tête ne dit plus « aucune donnée envoyée » mais « seuls les fichiers du site
  sont mis en cache » (vrai dans les deux cas).
- Étape manuelle (brief §7, point 2) : compte Cloudflare, puis serveur/README.md.
- CodeQL : la règle js/clear-text-storage-of-sensitive-data est désactivée (`.github/codeql/codeql-config.yml`), à la
  demande du propriétaire : faux positif « certitudes » récurrent (il revenait à chaque déplacement de `ecrire()`).

### Lot 7

- `static/enligne.js` : section « Se protéger en ligne » (8e section ; 51 ateliers) ; « Vrai message ou hameçonnage ? »
  (15 messages fictifs, domaines en .example, d′, « Trouver l'indice » par boutons `.segment-indice`, ignorés du joueur
  générique) ; « Lequel résiste le plus longtemps ? » (9 paires ; hypothèse de calcul : 10¹⁰ essais/s, écrite ;
  CNIL vérifiée : délibération 2022-100 du 21 juillet 2022, 80 bits, 12/14 caractères, 7 mots).
- Parcours « Ne pas se faire avoir en ligne » (9 parcours) ; article « La sécurité de ce site » (`#guide/securite`).
- Unités courtes (`an`, `heure`, `seconde`) ajoutées au dictionnaire par `=texte` (l'extracteur ne les voit pas).
- Comptes en dur mis à jour : `_ateliers` (8 sections), `_grand-test` (51), `_test` (51 cartes), Playwright (8).
- Captures du lot 7 non publiées sur la branche `captures` (manque de temps) : à faire au lot 8.

### Lot 8

Fait (PR #15) : courbe de maîtrise, noms des grades au-dessus du tracé avec un liseré de la couleur du fond (signalé par
le propriétaire) ; aide des raccourcis (touche `?`, `<dialog>` natif) ; bouton « Installer l'application »
(`beforeinstallprompt`, réglages du profil) ; images à partager (canvas 1 080 × 1 350, fiche et grade ; partage natif
sinon téléchargement). Chromium sans fenêtre déclare savoir partager des fichiers : pour vérifier l'image, le banc
manuel remplace `navigator.canShare` (scratchpad, non versionné).

Fin (PR #16) : accueil du nouveau visiteur en trois écrans (l'illusion, l'objectif du jour, le premier pas), qu'on peut
passer, jamais bloquant (`profil.accueilFait`) ; captures des lots 7 et 8 ajoutées aux PR #14 et #15 ; README et
DESIGN.md à jour ; banc `progression` 63/63.

Mesures (Mac du propriétaire, serveur Python local, médiane de 5 chargements de l'accueil dans Chromium) :
- poids de `static/` : 3 217 282 octets au lot 0 → 3 509 461 (+9 %) ;
- chargement de l'accueil : 802 ms à `cb90ed8` → 1 204 ms. Le calcul de l'accueil coûte ≈ 11 ms (maîtrise 2 ms, codex
  6 ms, illusion 7 ms) : l'écart vient des 9 scripts ajoutés (29 au total, 1,78 Mo), servis un par un par le serveur
  Python de mesure. Non mesuré sur GitHub Pages (HTTP/2, cache, service worker). **Régression à traiter** si elle se
  confirme en ligne : regrouper les petits scripts de la refonte, ou charger graphiques/profil/coffre seulement à la
  demande.

## Mise en service de la synchronisation (11 novembre 2026)

Compte Cloudflare du propriétaire ; base D1 `esprit-critique-synchro` créée avec `--jurisdiction=eu`
(5178d7d8-15e4-465d-a837-013b0c5729a3), table créée, Worker déployé :
https://esprit-critique-synchro.esprit-critique-synchro.workers.dev (vérifié en ligne : 401 sans jeton, 403 pour une
autre origine, `no-store`, `nosniff`). `SYNCHRO_URL` et `connect-src` renseignés ; textes validés par le propriétaire :
confidentialité (section « Synchronisation »), conditions d'utilisation, mentions légales (Cloudflare, Inc., 101
Townsend Street, San Francisco, CA 94107, +1 888 993 5273 : adresse et téléphone des documents déposés à la SEC),
« Vos données », `noscript`, pied de page, Grand test, README, SECURITE.md.

## Bilan de la refonte (11 novembre 2026)

**Fait** : les neuf lots (0 à 8), chacun en pull request vérifiée par l'intégration continue et fusionnée ; plus les
demandes du propriétaire en cours de route (Planche de Galton : 20 questions, bilan en anneaux, jauge qui avance ;
courbe de maîtrise lisible).

**Écarté, et pourquoi** :
- `trusted-types 'none'` → une règle nommée `esprit-critique` (sinon le service worker ne s'enregistre plus).
- PICTOS et TRAITS_ENTITE non réécrits en listes d'objets : `dessinerSvg()` lit les chaînes fixes (même résultat).
- Ponzo absent de l'illusion du jour (source primaire incertaine).
- « Cartes jamais ouvertes » → « jamais lues » (`fichesLues`).
- Essais du serveur sans `wrangler dev` (base D1 simulée, sans dépendance).
- Règle CodeQL `js/clear-text-storage-of-sensitive-data` désactivée à la demande du propriétaire (faux positif récurrent).

**Reste** :
- ~~Mise en service de la synchronisation~~ : faite le 11 novembre (voir plus haut).
- Réglages GitHub du brief §7 (protection de `main` avec « Vérifier » obligatoire, etc.), à faire par le propriétaire.
- Temps de chargement de l'accueil (voir Lot 8) ; parts de hasard de `MAITRISE_JEUX` à affiner jeu par jeu ; la
  distinction « Bingo » attend que l'atelier enregistre une ligne complète.
- Contrôle avec un vrai lecteur d'écran (VoiceOver) des parcours principaux : non fait (les bancs vérifient noms
  accessibles, focus et contraste, pas l'écoute réelle) ; partage natif des images sur un vrai téléphone : non vérifié.

## Corrections de l'audit d'affichage (12 novembre 2026, branche `corrections-audit`)

Audit du site rendu (Chrome, 375 / 768 / 1 440 px) : 13 corrections, un commit chacune. Décisions et limites :

- Espacement (4) : règle commune en fin de `style.css` (12 px entre un contrôle et le bloc voisin) et nouveau type de
  défaut `controle-colle` dans `tests/controle-affichage.js` (échoue sous 8 px). Il ignore les barres collantes, les
  groupes de puces, les liens dans une phrase, le contenu d'un `details` replié et les éléments en cours d'animation.
- En-tête (5, 6) : onglets sans icône dès 1 040 px pour laisser 260 px à la recherche ; de 760 à 1 039 px, profil et
  langue dans le flux (plus de position absolue). Bouton de profil et ses dessins en `flex: none` : Safari les
  réduisait à presque rien.
- Cibles tactiles (10) : échelles à 7 et 9 points sur deux rangées sous 760 px (44 px de large par bouton).
- Service worker (11) : préchargement de la seule langue de la page qui l'installe (`clients.matchAll`), l'autre langue
  complétée à sa première navigation. Banc hors ligne adapté (cadre `en/`).
- Tailles de texte (13l) : 22 → 17 tailles ; l'objectif de dix demandait de toucher à la hiérarchie des titres.
- Échec aléatoire connu du banc `ateliers` (« énoncés visibles après Suivant ») : vu deux fois, non reproduit ensuite.

## Demandes du 13 novembre 2026 (branche `claude/dazzling-mccarthy-k55yr5`, pull request #24)

- Retour à la partie : une carte ouverte pendant un atelier propose « Revenir à la partie » ; la partie reste dans sa
  section masquée (`partieMiseDeCote`, `app.js`) et n'est plus relancée, tant qu'on ne va que sur des cartes.
- Message des graphiques : `messageGraphique()` (`graphiques.js`), une phrase calculée sur les données, avant chaque
  graphique de données. Non concernés : schémas des fiches, illusions, frise, planisphère, insignes, codex.
- Niveaux 4 et 5 (`NIVEAUX_MAX`, `niveaux.js`) : hasard, corrélation, graphiques trompeurs, CRT, problèmes classiques,
  dépistage, mots de passe, règle 2-4-6, pays, nord, chronologie, mortalité, grandeurs, hameçonnage. Contenu nouveau
  original (calculs vérifiés, messages fictifs) ou mécanique plus exigeante sur les données sourcées existantes
  (classements de 5 et 6 éléments) : aucun nouveau fait sourcé.
- Laissés à trois niveaux, et pourquoi : « Le monde en chiffres », « Vrai ou faux », « Citations » (nouveaux contenus
  à vérifier sur leur source primaire) ; « Fourchettes » ; les expériences de mesure (Wason, logique contre croyance,
  illusions, écrire le hasard, foule, comprendre, Wald), qu'une difficulté ajoutée fausserait ; les jeux de Débattre
  sans niveaux (pyramide, démonter, lecture latérale, qui doit prouver, reformuler).
- Lot suivant (même jour) : débat truqué, niveaux 4 (« Des panneaux solaires sur le gymnase », sophismes discrets) et 5
  (« Les téléphones au collège », nombre de sophismes non annoncé, une catégorie de plus que celles en jeu) ; réparer,
  niveaux 4 (reconnaître le sophisme, non annoncé, puis réparer) et 5 (le reconnaître, prémisse cachée, réparer).
  Banc `ateliers` : 12 débats attendus au lieu de 10.
- Contrôle qualité et précision des jeux (même jour). Recalculés et justes : problèmes classiques (maternités 55 et
  25 jours, taxis, Méré, Bertrand…), CRT, dépistage, syllogismes (16), Wason (5 versions et THOG), 97 affirmations de
  « Vrai ou faux », valeurs calculées des grandeurs ; faits cités à plusieurs endroits concordants. Corrigé : citation
  de Russell (théière), « presque toutes nos cellules » (Thésée), globules rouges 84 % et non 70 % (Sender et al. 2016),
  Paris arrondi à 2,1 millions (voir `a-verifier.md`), étude de Hall et al. (2012) sur des opinions morales et non
  politiques, périodes des chiffres de mortalité (2019 à 2025 ; 2020 à 2025 pour le schéma). Non vérifiable d'ici :
  les 60 questions du « Monde en chiffres » sur leurs sources primaires (sites externes bloqués dans la session).
- Débattre : précision relue ; « toi aussi » accepté sous le nom « attaque personnelle » (`FORMES_PARTICULIERES`) ;
  le retour explique ce qui sépare la bonne réponse de l'option proche.
- Bancs : l'illusion du jour peut n'avoir aucun leurre (Kanizsa, Jastrow) ; le banc `test` levait une exception ces
  jours-là, et s'arrêtait à 85 vérifications au lieu de 160. Échec aléatoire vu une fois : `recherche` (non reproduit
  en local en trois essais, passé ensuite en intégration continue).
- En local dans un conteneur Linux lancé en root, Chrome ne démarre qu'avec `--no-sandbox` : passer par un petit
  lanceur dans `CHROME` (les bancs ne sont pas modifiés).

## État des lieux (lot 0, commit cb90ed8)

### Poids de `static/`

| Fichier | Octets |
|---|---|
| `404.html` | 2931 |
| `apercu-en.png` | 18866 |
| `apercu.png` | 17398 |
| `app.js` | 85789 |
| `ateliers.js` | 51745 |
| `cgu.html` | 4699 |
| `chiffres.js` | 92682 |
| `confidentialite.html` | 5381 |
| `debattre.js` | 127492 |
| `donnees.js` | 203647 |
| `en/dico-app.js` | 15045 |
| `en/dico-ateliers.js` | 12790 |
| `en/dico-chiffres.js` | 39029 |
| `en/dico-debattre.js` | 157488 |
| `en/dico-experiences.js` | 121113 |
| `en/dico-grand-test-interface.js` | 35362 |
| `en/dico-grand-test.js` | 2096 |
| `en/dico-jeux-donnees.js` | 139657 |
| `en/dico-niveaux.js` | 1967 |
| `en/dico-nombres.js` | 1187 |
| `en/dico-perception.js` | 34334 |
| `en/dico-pratiques.js` | 70135 |
| `en/dico-raisonner.js` | 35171 |
| `en/dico-schemas.js` | 28402 |
| `en/fiches.js` | 188281 |
| `en/grand-test-donnees.js` | 314003 |
| `en/grand-test.js` | 25371 |
| `en/index.html` | 31417 |
| `en/legal-notice.html` | 4584 |
| `en/pays.js` | 3584 |
| `en/privacy.html` | 5061 |
| `en/terms.html` | 4437 |
| `experiences.js` | 119844 |
| `favicon.svg` | 625 |
| `google94b657f6d0442a2f.html` | 53 |
| `grand-test-donnees.js` | 236968 |
| `grand-test-interface.js` | 87341 |
| `grand-test.js` | 90240 |
| `icone-32.png` | 255 |
| `icone-512.png` | 2623 |
| `icone.png` | 1017 |
| `index.html` | 32062 |
| `indices.js` | 15488 |
| `jeux-donnees.js` | 116755 |
| `langue.js` | 5200 |
| `manifest.webmanifest` | 626 |
| `melange.js` | 3542 |
| `mentions-legales.html` | 4742 |
| `niveaux.js` | 16628 |
| `pays.js` | 62400 |
| `perception.js` | 64045 |
| `polices/OFL.txt` | 4520 |
| `polices/newsreader-latin-opsz-normal.woff2` | 132000 |
| `polices/newsreader-latin-wght-italic.woff2` | 64520 |
| `pratiques.js` | 86624 |
| `raisonner.js` | 57915 |
| `recherche.js` | 8402 |
| `robots.txt` | 132 |
| `schemas.js` | 49314 |
| `sitemap.xml` | 1144 |
| `style.css` | 68278 |
| `sw.js` | 2835 |
| **Total** | 3217282 |

### Bancs à `cb90ed8`, sous macOS (avant le lot 0)

Identiques dans les quatre configurations (relevés à 390 px clair et sombre, 1 280 px clair ; arrêté ensuite) :

| Banc | Résultat |
|---|---|
| affichage | 0 défaut, 108 pages, 0 erreur JavaScript |
| ateliers | 237 / 237 |
| test | **64 / 65** (exception : `JSON.parse` de la liste de `sw.js`) |
| niveaux | 24 / 24 |
| items | 0 niveau sans assez d'items, sur 36 |
| csp | aucun blocage ni erreur sur 18 adresses |
| grand | **12 / 13** (même exception) |
| hors-ligne | **0 / 1** (même cause) |
| calculs, familles, banques | 44 / 44, 93 / 93, 45 / 45 (osascript) |

### Bancs après le lot 0

Intégration continue, Ubuntu (`ubuntu-latest`), pull request #6, les quatre configurations : tout passe, avec le
même nombre de contrôles que les derniers rapports sains (1er novembre).

| Banc | Résultat |
|---|---|
| affichage | 0 défaut, 108 pages, 0 erreur JavaScript |
| ateliers | 237 / 237 |
| test | 131 / 131 |
| niveaux | 24 / 24 |
| items | 0 niveau sans assez d'items, sur 36 |
| csp | aucun blocage ni erreur sur 18 adresses |
| grand | 107 / 107 |
| hors-ligne | 7 / 7 |
| calculs, familles, banques (Node.js) | 44 / 44, 93 / 93, 45 / 45 |
| recherche (Playwright) | 27 contrôles réussis |

Durée : ≈ 2 min 30 dans l'intégration continue (quatre tâches en parallèle), contre ≈ 1 h sur le Mac du propriétaire
(le temps virtuel de Chrome avance plus vite sur les machines de GitHub). Les polices de Linux n'ont fait apparaître
aucun défaut d'affichage. La suite complète sous macOS est relancée après le lot 0 (résultat ci-dessous quand il
arrive).
