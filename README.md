# Esprit critique

Un site en français pour apprendre à repérer les **biais cognitifs** et les **sophismes**, et pour éprouver
son propre jugement dans des ateliers fondés sur des données réelles.

**Le site : https://esprit-critique.github.io/**

Il fonctionne sur ordinateur comme sur téléphone. Sur iPhone : Safari → Partager → « Sur l'écran d'accueil »
pour l'utiliser comme une application.

## Ce qu'on y trouve

- **90 fiches** : 51 biais cognitifs et 39 sophismes, avec définition, mécanisme, exemple, cas célèbre,
  « ne pas confondre avec », parade et sources. 37 fiches sont illustrées.
- **Un quiz** à révision espacée : les notions ratées reviennent après 1, 3, 7, 14 puis 30 jours. On y indique sa
  certitude (les erreurs commises en étant sûr reviennent dès le lendemain) ; un mode « Notions proches » oppose
  chaque notion à sa voisine ; un mode « Réponse libre » demande de retrouver le nom de mémoire ; les révisions
  prévues s'exportent dans un agenda (fichier .ics).
- **Un défi du jour** : dix questions difficiles, les mêmes pour tout le monde, une tentative par jour.
- **33 ateliers**, en six sections :
  - *le monde en chiffres* : état du monde, causes de décès, duels entre 155 pays (démographie, économie,
    géopolitique), cartes mentales, ordres de grandeur, chronologie ;
  - *mesurer sa confiance* : vrai ou faux avec degré de certitude, intervalles à 90 %, effet d'ancrage,
    et un carnet de prévisions personnelles (score de Brier, étalonnage, mémoire des prévisions) ;
  - *percevoir* : illusions d'optique, hasard, corrélations, graphiques trompeurs ;
  - *raisonner* : test de réflexion cognitive, tâche de Wason, Monty Hall, problèmes classiques, tests de dépistage,
    logique contre croyance, le moniteur de vol (régression vers la moyenne), deux études de même méthode,
    et un jeu à plusieurs sur un même téléphone ;
  - *débattre* : repérer les sophismes d'un débat (avec mesure des fausses alertes), réparer un argument,
    reformuler sans trahir, et un débat minuté à deux sur un même téléphone ;
  - *philosopher* : expériences de pensée, citations vraies ou fausses.
- **S'entraîner** : chaque fiche de sophisme propose trois mini-exercices tirés des débats.
- **Un portrait** qui rassemble ce que vos réponses révèlent : étalonnage, ancrage, perception du hasard…
- **Une progression** : les ateliers à questions ajustent leur difficulté (niveaux 1 à 3) à vos réponses ; on peut aussi
  choisir son niveau. Records par niveau, et tableau des niveaux dans le portrait.
  Au niveau 3 : classer quatre pays, villes ou événements (score par paires), deux fourchettes à 50 et 90 %
  avec un score de fourchette, et des estimations par la méthode de Fermi.
- **Un guide** : méthode pour examiner une affirmation, débattre honnêtement, outils philosophiques, lexique.

## Principes

- **Sources vérifiées** : chaque chiffre est accompagné de sa source ; les résultats discutés ou non répliqués
  sont signalés comme tels.
- **Aucun compte, aucune donnée envoyée** : la progression est enregistrée uniquement dans le navigateur du
  visiteur, qui peut l'exporter dans un fichier.
- **Aucune dépendance** : du HTML, du CSS et du JavaScript simples, sans bibliothèque ni étape de compilation.

## Utiliser le site sur son ordinateur

```
python3 app.py
```

puis ouvrir http://localhost:8000. Le script affiche aussi l'adresse à utiliser depuis un téléphone
connecté au même réseau Wi-Fi.

## Organisation des fichiers

| Fichier | Contenu |
|---|---|
| `static/index.html`, `static/style.css` | page et apparence |
| `static/donnees.js` | les 90 fiches |
| `static/schemas.js` | illustrations des fiches (SVG) |
| `static/app.js` | navigation, accueil, fiches, quiz, révisions |
| `static/ateliers.js` | page des ateliers, portrait, outils communs |
| `static/niveaux.js` | progression : niveaux, ajustement automatique, records par niveau |
| `static/chiffres.js`, `static/perception.js`, `static/experiences.js` | les ateliers |
| `static/raisonner.js` | logique contre croyance, moniteur de vol, deux études, résoudre à plusieurs, carnet de prévisions |
| `static/debattre.js` | section « Débattre » : débats, réparations, reformulations (contenus fictifs) |
| `static/jeux-donnees.js`, `static/pays.js` | contenus et données des ateliers |
| `app.py` | petit serveur local (Python, sans dépendance) |

La publication sur GitHub Pages est automatique : voir `.github/workflows/publier.yml`.

## Tests

Les bancs d'essai s'exécutent dans Chrome sans fenêtre (macOS, Chrome installé, aucune autre dépendance) :

```
tests/lancer.sh                        # tous les bancs, à 390 et 1 280 px, en clair et en sombre
tests/lancer.sh affichage              # un seul banc : affichage, ateliers ou test
CONFIGS="390 clair" tests/lancer.sh    # une seule configuration
```

| Fichier | Rôle |
|---|---|
| `tests/_test.html` | fiches, quiz, révisions, navigation, clavier, reprise des anciennes données |
| `tests/_ateliers.html` | joue chaque atelier jusqu'au bilan ; contrôle l'affichage à chaque étape |
| `tests/_niveaux.html` | moteur de progression : joueurs simulés, records par niveau, migration |
| `tests/niveaux.html` | nombre d'items par niveau, en rouge quand il en manque (`tests/lancer.sh items`) |
| `tests/_affichage.html` | contrôle l'affichage de chaque page et de toutes les variantes des dessins générés |
| `tests/controle-affichage.js` | détection des textes coupés ou superposés, des débordements, du défilement horizontal |
| `tests/capturer.py`, `tests/_visu.html` | captures d'écran de scénarios : `python3 tests/capturer.py 390,844 sombre accueil` |
| `tests/pays/` | `telecharger.sh` puis `generer_pays.py` : régénère `static/pays.js` (Banque mondiale, HCR) |

Les rapports et les captures vont dans `tests/rapports/`, qui n'est pas versionné.

## Licences

Code sous licence [MIT](LICENSE) ; textes sous licence [CC BY 4.0](LICENCE-CONTENU.md). Les données
d'organismes tiers restent soumises à leurs propres conditions, détaillées dans [LICENCE-CONTENU.md](LICENCE-CONTENU.md).
