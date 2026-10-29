# Esprit critique

Un site en français pour apprendre à repérer les **biais cognitifs** et les **sophismes**, et pour éprouver
son propre jugement dans des ateliers fondés sur des données réelles.

**Le site : https://goatier-project.github.io/esprit-critique/**

Il fonctionne sur ordinateur comme sur téléphone. Sur iPhone : Safari → Partager → « Sur l'écran d'accueil »
pour l'utiliser comme une application.

## Ce qu'on y trouve

- **90 fiches** : 51 biais cognitifs et 39 sophismes, avec définition, mécanisme, exemple, cas célèbre,
  « ne pas confondre avec », parade et sources. 37 fiches sont illustrées.
- **Un quiz** à révision espacée : les notions ratées reviennent après 1, 3, 7, 14 puis 30 jours.
- **24 ateliers** :
  - *le monde en chiffres* : état du monde, causes de décès, duels entre 155 pays (démographie, économie,
    géopolitique), cartes mentales, ordres de grandeur, chronologie ;
  - *mesurer sa confiance* : vrai ou faux avec degré de certitude, intervalles à 90 %, effet d'ancrage ;
  - *percevoir* : illusions d'optique, hasard, corrélations, graphiques trompeurs ;
  - *raisonner* : test de réflexion cognitive, tâche de Wason, Monty Hall, problèmes classiques, tests de dépistage ;
  - *philosopher* : expériences de pensée, citations vraies ou fausses.
- **Un portrait** qui rassemble ce que vos réponses révèlent : étalonnage, ancrage, perception du hasard…
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
| `static/chiffres.js`, `static/perception.js`, `static/experiences.js` | les ateliers |
| `static/jeux-donnees.js`, `static/pays.js` | contenus et données des ateliers |
| `app.py` | petit serveur local (Python, sans dépendance) |

La publication sur GitHub Pages est automatique : voir `.github/workflows/publier.yml`.

## Licences

Code sous licence [MIT](LICENSE) ; textes sous licence [CC BY 4.0](LICENCE-CONTENU.md). Les données
d'organismes tiers restent soumises à leurs propres conditions, détaillées dans [LICENCE-CONTENU.md](LICENCE-CONTENU.md).
