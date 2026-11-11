# Esprit critique : consignes pour Claude Code

Site statique en français (et en anglais sous `static/en/`) sur les biais cognitifs et les sophismes, publié sur
GitHub Pages depuis `static/` par `.github/workflows/publier.yml`, seulement si `.github/workflows/verifier.yml`
passe. Refonte en cours : brief dans `tests/refonte-brief.md`, plan dans `tests/refonte-plan.md`, état et décisions dans `tests/refonte-journal.md`
(à lire en début de session).

## Architecture

- Scripts classiques, sans module, sans compilation, sans dépendance ni CDN : un seul espace de noms global.
  `python3 tests/noms_globaux.py` doit passer ; préfixer les nouveaux noms globaux.
- Ordre de chargement (`static/index.html`) : `langue.js` (`T()`), `donnees.js`, `schemas.js`, `pays.js`,
  `jeux-donnees.js`, `ateliers.js` (`svg()`), `niveaux.js`, … `grand-test-interface.js`, `app.js`, `recherche.js`.
- `el`, `lienVers`, `lire`, `ecrire`, `melanger`, `generateur`, `aujourdHui`, `annoncer` sont dans `app.js` : un script
  chargé avant lui ne les appelle que dans des fonctions, jamais au chargement. `svg()` est dans `ateliers.js`.
- Nouveau script : l'ajouter à `static/index.html`, `static/en/index.html` (chemin `../`), à `FICHIERS` dans
  `static/sw.js` en changeant le numéro de `CACHE`, et à `verifierChargement()` au début de `app.js`.
- Pages fixes (`mentions-legales`, `confidentialite`, `cgu`, `404` et leurs versions anglaises) : générées par
  `tests/pages/generer_pages.py`. Modifier le générateur, jamais les pages.

## Données de l'utilisateur

- Toute la progression passe par `lire(cle, defaut)` / `ecrire(cle, valeur)` (localStorage, JSON).
- Nouvelle clé : l'ajouter à `CLES_SAUVEGARDE` et à `FORMES_SAUVEGARDE` (`app.js`), sinon elle échappe à l'export,
  à l'import, aux sauvegardes automatiques et à l'effacement ; et lui donner son schéma dans `SCHEMAS_SAUVEGARDE`
  (`static/sauvegarde.js`, validation profonde de tout ce qui vient de l'extérieur ; le banc `aleatoire` échoue sinon).
- Ne jamais changer la forme d'une clé existante sans migration testée : des visiteurs ont déjà des données.

## Textes et langues

- Code, commentaires et messages de commit en français ; les commentaires disent le pourquoi.
- Phrase assemblée par le code : `T("texte avec {0}", valeur)`. Après chaque modification de texte :
  `python3 tests/en/extraire.py --manquants`, puis `tests/en/ajouter.py`, puis `python3 tests/en/controle.py`.
- Typographie française par `typo()` ; conventions anglaises dans `DESIGN.md`.
- Tout fait chiffré ou attribué porte sa source vérifiée sur la source primaire ; sinon il va dans
  `tests/a-verifier.md` et n'est pas affiché.

## Sécurité du code

- DOM construit avec `el()`, `lienVers()`, `svg()`, `dessinerSvg()`, `textContent`. Aucun HTML inséré : Trusted Types
  est actif (`require-trusted-types-for 'script'`), et `innerHTML` lève une erreur. Vider un élément : `replaceChildren()`.
- Seule règle Trusted Types permise : `esprit-critique` (`app.js`), qui n'accepte que l'adresse du service worker.
- `python3 tests/securite.py` (contrôle statique : motifs interdits, empreintes et concordance des CSP, liste du
  service worker, expiration de `static/.well-known/security.txt`) doit passer. Modèle de menace : `SECURITE.md`.
- CSP en balise `meta` : ni style ni gestionnaire d'événement en ligne. Valeurs dynamiques : variables CSS posées par
  `element.style.setProperty()` ; styles par des classes de `style.css`.
- Script en ligne de `index.html` ou `en/index.html` modifié : recalculer son empreinte `sha256-…` dans la CSP
  (le banc `csp` le signale).
- `refuserEncadrement()` (début de `app.js`) remplace l'en-tête `frame-ancestors`, que GitHub Pages ne permet pas : à garder.

## Affichage et accessibilité

- Références : 390 px et 1 280 px, clair et sombre. Contraste 4,5:1, nom accessible sur chaque contrôle, focus
  visible, cibles de 44 px, aucune information portée par la couleur seule.
- `prefers-reduced-motion` : règle globale de `style.css`, qui n'arrête ni `element.animate()` ni
  `document.startViewTransition()` ; toute animation lancée par script passe par un point d'entrée unique qui la respecte.
- Avant de toucher à la navigation fixe ou aux expressions régulières : lire les commentaires sur Safari.

## Tests

macOS ou Linux, avec Chrome (variable `CHROME`, sinon cherché par `tests/navigateur.py`), Python 3 et Node.js :

```
npm ci                                  # Playwright, outil de test seulement (jamais publié)
tests/lancer.sh                         # tous les bancs (≈ 1 h : le lancer en arrière-plan)
tests/lancer.sh csp test                # quelques bancs
CONFIGS="390 clair" tests/lancer.sh     # une seule configuration
```

- Code de sortie 1 si un banc échoue (`tests/verdict.py` lit la ligne « RÉSUMÉ » de chaque rapport).
- Ne jamais lancer deux `tests/lancer.sh` en même temps : même port 8000, bancs copiés puis retirés de `static/`.
- Vérifications rapides : `node --check static/*.js`, `python3 tests/noms_globaux.py`, `python3 tests/en/controle.py`,
  `python3 tests/securite.py`.
- L'intégration continue est rapide (≈ 3 min) : pousser la branche et lire `gh pr checks` vaut souvent mieux que la
  suite locale (≈ 1 h sur le Mac du propriétaire).
- `tests/safari.sh` reste propre à macOS.

## Git

- Messages de commit en français, au présent de l'indicatif, sans point final, comme l'historique
  (« Renomme le mélange en « Planche de Galton » »).
- Un lot de la refonte = une branche = une pull request ; fusion dans `main` quand l'intégration continue passe
  (la fusion publie le site).
