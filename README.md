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
  prévues s'exportent dans un agenda (fichier .ics). Après chaque réponse, « Trouver l'indice » demande de toucher le
  passage de la situation qui trahit la notion. Chaque fiche a quatre situations : les révisions utilisent en priorité
  les deux dernières, pour ne pas reconnaître un texte déjà lu.
- **Un défi du jour** : dix questions difficiles, les mêmes pour tout le monde, une tentative par jour.
- **45 ateliers**, en six sections :
  - *le monde en chiffres* : état du monde, causes de décès, duels entre 155 pays (démographie, économie,
    géopolitique), cartes mentales, ordres de grandeur, chronologie ;
  - *mesurer sa confiance* : vrai ou faux avec degré de certitude, intervalles à 90 %, effet d'ancrage,
    et un carnet de prévisions personnelles (score de Brier, étalonnage, mémoire des prévisions) ; la foule intérieure
    (deux estimations valent mieux qu'une), « Comprenez-vous vraiment ? » (illusion de profondeur explicative),
    une décision guidée avec date de bilan, et un bilan avant et après en deux formes parallèles (non validées) ;
  - *percevoir* : illusions d'optique, hasard, corrélations, graphiques trompeurs ;
  - *raisonner* : test de réflexion cognitive, tâche de Wason, Monty Hall, problèmes classiques, tests de dépistage,
    logique contre croyance, le moniteur de vol (régression vers la moyenne), deux études de même méthode,
    un jeu à plusieurs sur un même téléphone, les avions de Wald (biais du survivant) et « Fabriquer un résultat »
    (une tisane sans effet, jusqu'à p < 0,05) ;
  - *débattre* : repérer les sophismes d'un débat (avec mesure des fausses alertes), réparer un argument,
    reformuler sans trahir, un débat minuté à deux sur un même téléphone, qui doit prouver, la pyramide du désaccord,
    démonter un argument (rôle de chaque phrase, puis arbre de l'argument), la lecture latérale (sites fictifs) et
    un bingo des sophismes à imprimer (`#bingo/<graine>` : la même grille pour tous les joueurs) ;
  - *philosopher* : expériences de pensée, citations vraies ou fausses, la cécité au choix (à ne faire qu'une fois).
- **S'entraîner** : chaque fiche de sophisme propose trois mini-exercices tirés des débats.
- **Un portrait** qui rassemble ce que vos réponses révèlent : étalonnage, ancrage, perception du hasard…
- **Une progression** : les ateliers à questions ajustent leur difficulté (niveaux 1 à 3) à vos réponses ; on peut aussi
  choisir son niveau. Records par niveau, et tableau des niveaux dans le portrait.
  Au niveau 3 : classer quatre pays, villes ou événements (score par paires), deux fourchettes à 50 et 90 %
  avec un score de fourchette, et des estimations par la méthode de Fermi.
  Au niveau 3 encore : corrélations avec valeurs extrêmes, hasard plus difficile à repérer, nuages de points denses,
  graphiques à deux pièges, règle cachée plus fine avec 8 essais, deux tests de dépistage successifs, débats où
  certaines répliques contiennent deux sophismes, et prémisse cachée à trouver avant de réparer un argument.
- **Pour aller plus loin**, après le bilan : Monty Hall avec un présentateur distrait, variantes du paradoxe des
  anniversaires, problème THOG. **Modes chrono** (60 secondes) pour le quiz et le débat truqué ; cartes contrainte
  pour le débat à deux.
- **Un guide** : méthode pour examiner une affirmation, débattre honnêtement, outils philosophiques, lexique.
- **Un journal des repérages** : « Je l'ai repéré » sur chaque fiche, avec une note facultative ; le portrait en fait le bilan.
- **Thème clair ou sombre** au choix (en bas de page), et **lecture hors ligne** une fois le site visité (service worker).

## Principes

- **Sources vérifiées** : chaque chiffre est accompagné de sa source ; les résultats discutés ou non répliqués
  sont signalés comme tels.
- **Aucun compte, aucune donnée envoyée** : la progression est enregistrée uniquement dans le navigateur du
  visiteur, qui peut l'exporter dans un fichier.
- **Aucune dépendance** : du HTML, du CSS et du JavaScript simples, sans bibliothèque ni étape de compilation.
- **Sécurité** : politique de sécurité du contenu (CSP) stricte, le site ne charge que ses propres fichiers ; aucun
  texte n'est inséré comme HTML ; une sauvegarde importée est vérifiée clé par clé ; le serveur local n'écoute que
  l'ordinateur lui-même, sans liste des dossiers ; les actions de publication sont désignées par l'empreinte de leur commit.

## Utiliser le site sur son ordinateur

```
python3 app.py
```

puis ouvrir http://localhost:8000. Le serveur n'accepte que les connexions de l'ordinateur lui-même ;
`python3 app.py --wifi` l'ouvre aux appareils du même réseau (un téléphone, par exemple), à éviter sur un Wi-Fi public.

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
| `static/pratiques.js` | ateliers du lot 5 : Wald, fabriquer un résultat, foule intérieure, cécité au choix, bingo, qui doit prouver, pyramide, décision guidée, comprenez-vous, démonter, lecture latérale, bilan avant et après |
| `static/indices.js` | « Trouver l'indice » : le passage révélateur de chacune des 180 situations |
| `static/sw.js` | mode hors ligne ; à chaque nouveau fichier, l'ajouter à la liste et changer le numéro de version |
| `static/jeux-donnees.js`, `static/pays.js` | contenus et données des ateliers |
| `app.py` | petit serveur local (Python, sans dépendance) |

La publication sur GitHub Pages est automatique : voir `.github/workflows/publier.yml`.

## Tests

Les bancs d'essai s'exécutent dans Chrome sans fenêtre (macOS, Chrome installé, aucune autre dépendance) :

```
tests/lancer.sh                        # tous les bancs, à 390 et 1 280 px, en clair et en sombre
tests/lancer.sh affichage              # un seul banc : affichage, ateliers, test, niveaux, items ou csp
CONFIGS="390 clair" tests/lancer.sh    # une seule configuration
```

| Fichier | Rôle |
|---|---|
| `tests/_test.html` | fiches, quiz, révisions, navigation, clavier, reprise des anciennes données |
| `tests/_ateliers.html` | joue chaque atelier jusqu'au bilan ; contrôle l'affichage à chaque étape |
| `tests/_niveaux.html` | moteur de progression : joueurs simulés, records par niveau, migration |
| `tests/niveaux.html` | nombre d'items par niveau, en rouge quand il en manque (`tests/lancer.sh items`) |
| `tests/_affichage.html` | contrôle l'affichage de chaque page et de toutes les variantes des dessins générés |
| `tests/controle-affichage.js` | détection des textes coupés ou superposés, des débordements, du défilement horizontal, des boutons et champs sans nom accessible, des identifiants en double |
| `tests/csp.py` | ouvre la vraie page, hors cadre, sur 14 adresses : aucun blocage de la CSP ni erreur JavaScript (les autres bancs utilisent une copie sans CSP, `_site.html`, car ils lisent l'état du site avec `eval`) |
| `tests/capturer.py`, `tests/_visu.html` | captures d'écran de scénarios : `python3 tests/capturer.py 390,844 sombre accueil` |
| `tests/pays/` | `telecharger.sh` puis `generer_pays.py` : régénère `static/pays.js` (Banque mondiale, HCR) |

Les rapports et les captures vont dans `tests/rapports/`, qui n'est pas versionné.

À relire : `tests/indices-a-relire.md`, `tests/situations-sup-a-relire.md`, `tests/sources-completees.md`,
`tests/niveaux-a-relire.md`, `tests/paires-douteuses.md` et `tests/a-verifier.md`.

## Licences

Code sous licence [MIT](LICENSE) ; textes sous licence [CC BY 4.0](LICENCE-CONTENU.md). Les données
d'organismes tiers restent soumises à leurs propres conditions, détaillées dans [LICENCE-CONTENU.md](LICENCE-CONTENU.md).
