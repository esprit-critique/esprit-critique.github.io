# Refonte « Esprit critique, version 2 » : plan

Brief complet : `tests/refonte-brief.md` (copie du brief du 11 novembre 2026). Journal : `tests/refonte-journal.md`.
Un lot = une branche `refonte/lot-N` = une pull request, fusionnée quand l'intégration continue passe.

## Lot 0 — Filet de sécurité

Fichiers : `CLAUDE.md`, `tests/refonte-*.md`, `tests/navigateur.py` (chemin de Chrome commun), `tests/verdict.py`
(verdict d'un rapport), `tests/lancer.sh` (`node --check`, code de sortie, banc `recherche`), `tests/chrome.py`,
`csp.py`, `hors_ligne.py`, `capturer.py`, `tests/pages/{generer_apercu.sh,planches.py,planches_fiches.py,recadrer.py}`,
`tests/grand_test_commun.py`, `tests/pages/legendes_sources.py` (osascript → node), `package.json` et
`package-lock.json` (Playwright figé), `.github/workflows/verifier.yml`, `publier.yml` (`needs: verifier`), README.

Risques : polices et rendu différents sous Linux (bancs d'affichage) ; bac à sable de Chrome sur les machines
Ubuntu 24.04 ; durée des bancs (≈ 1 h en local : une tâche par configuration en parallèle).

## Lot 1 — Protéger le site

1. 81 `innerHTML = ""` → `replaceChildren()` (sed sur `static/*.js`, puis contrôle).
2. Message « Chargement incomplet » en DOM + `addEventListener` ; `PICTOS` (`ateliers.js`) et `TRAITS_ENTITE`
   (`grand-test-interface.js`) en données dessinées par `svg()` ; captures avant/après comparées octet à octet.
3. CSP : `require-trusted-types-for 'script'; trusted-types 'none'` dans les deux `index.html` et le générateur des pages.
4. `<meta name="referrer" content="no-referrer">` aux mêmes endroits.
5. Validateur profond par clé (`static/sauvegarde.js` ou dans `app.js`) : structure, bornes, identifiants existants,
   refus de `__proto__`/`constructor`/`prototype`, élément invalide écarté seul. Banc à données aléatoires
   (1 000 sauvegardes déformées, 1 000 adresses).
6. `ecrire()` : avertissement unique par visite en cas d'échec.
7. `tests/securite.py` : motifs interdits, empreintes CSP, CSP identiques hors empreinte, fichiers de `static/` dans `sw.js`.
8. Dependabot (`github-actions`), CodeQL, `SECURITY.md`, `static/.well-known/security.txt` (+ contrôle d'expiration,
   `include-hidden-files` dans `publier.yml`).
9. `SECURITE.md` (modèle de menace).

Risque principal : Trusted Types bloque tout `innerHTML` restant, y compris dans les bancs ; tous les bancs doivent
repasser.

## Lot 2 — Identité visuelle

`DESIGN.md` v2 d'abord, puis écran par écran (accueil, liste, fiche, quiz, bilan, ateliers, atelier, portrait,
guide, pages fixes). Nouveaux jetons (rayons, ombres, mouvement), filet du spectre, cartes, mise en page à deux
colonnes dès 1 040 px, point d'entrée unique des animations (`animer()`), réglage `reglages.animations`, illusion
du jour (≥ 8 illusions sourcées), glyphes de catégorie, transitions de vue, raccourcis du manifeste.
Risques : volume ; régressions d'affichage ; sources des illusions à vérifier.

## Lot 3 — Relancer le hasard

`sacTirage()` (sac mélangé, sans répétition à la jonction), bandeau de tirage sur la fiche (touche `R`,
`history.replaceState`), mode « Cartes », « Passer cette question » dans `melange.js` (sans marquer `vus`), carte
« Au hasard » sur l'accueil, atelier au hasard, `#defi/<graine>`. Banc dédié.

## Lot 4 — Maîtrise, grades, graphiques, points

`static/progression.js` (fonctions pures : `MAITRISE_JEUX`, maîtrise par jeu, domaines, globale, grades, barème des
points, plafonds, distinctions, rattrapage), `static/graphiques.js` (courbe, barres, toile, jauge, calendrier, tableau
des données), page `#profil`, codex, bilan de la semaine, mode sobre, deux articles du guide. Nouvelles clés :
`maitrise`, `lucidite`, `distinctions`, `fichesLues`, `objectif`, `profil`, `reglages`. Banc `tests/_progression.html`.

## Lot 5 — Parcours

`static/parcours.js`, pages `#parcours` et `#parcours/<id>`, quiz ciblé, carte de l'accueil, indexation par la
recherche. Clé `parcours`. Banc de bout en bout.

## Lot 6 — Synchronisation chiffrée

`static/coffre.js` (Web Crypto, HKDF, AES-GCM, IndexedDB, fusion par clé), dossier `serveur/` (Worker + D1), derrière
`SYNCHRO_URL` vide. Mise en service par le propriétaire (§7 du brief).

## Lot 7 — Cybersécurité

Section « Se protéger en ligne », ateliers « Vrai message ou hameçonnage ? » et « Lequel résiste le plus
longtemps ? », parcours, article du guide.

## Lot 8 — Finitions

Accueil du nouveau visiteur, cartes à partager (canvas), aide des raccourcis (`?`), installation, relectures,
mesures, documentation.
