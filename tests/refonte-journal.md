# Refonte « Esprit critique, version 2 » : journal

Pour reprendre dans une nouvelle session : lire `CLAUDE.md`, ce journal (section « État » d'abord), puis le lot en
cours dans `tests/refonte-plan.md` et `tests/refonte-brief.md`.

## État

| Lot | Branche | Pull request | État |
|---|---|---|---|
| 0 — Filet de sécurité | `refonte/lot-0` | #6 | fusionné |
| 1 — Protéger le site | `refonte/lot-1` | #7 | fusionné (alerte CodeQL « certitudes » classée faux positif par le propriétaire) |
| 2 — Identité visuelle | `refonte/lot-2` | #8 (brouillon) | en cours : voir « Lot 2 » plus bas |
| 3 à 8 | — | — | à faire |

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

Reste : états vides dessinés ; raccourcis du manifeste et image d'aperçu ; passes écran par écran (quiz, bilan,
ateliers, atelier, portrait, guide, pages fixes) en clair et en sombre ; captures pour la PR.

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
