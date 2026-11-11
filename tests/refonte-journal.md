# Refonte « Esprit critique, version 2 » : journal

Pour reprendre dans une nouvelle session : lire `CLAUDE.md`, ce journal (section « État » d'abord), puis le lot en
cours dans `tests/refonte-plan.md` et `tests/refonte-brief.md`.

## État

| Lot | Branche | Pull request | État |
|---|---|---|---|
| 0 — Filet de sécurité | `refonte/lot-0` | #6 | fusionné |
| 1 à 8 | — | — | à faire |

## Écarts entre le brief et le code

- `svg()` est défini dans `ateliers.js`, pas dans `app.js` (chargé avant `app.js` : utilisable au chargement par les
  scripts qui suivent `ateliers.js`).
- `recherche.js` est chargé après `app.js` (le brief dit `app.js` « presque en dernier » : exact).
- Le brief cite 8 fichiers liés au chemin macOS de Chrome ; `tests/pages/recadrer.py` employait en plus `sips`
  (macOS) pour lire la largeur d'une image : remplacé par la lecture de l'en-tête PNG.
- `main` n'était pas au vert au commit `cb90ed8` : les bancs `test`, `grand` et `hors-ligne` échouaient tous les trois
  sur `JSON.parse` de la liste `FICHIERS` de `sw.js`, où un commentaire avait été ajouté le 6 novembre (c991b73).
  Corrigé au lot 0 (commentaire sorti du tableau).

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
