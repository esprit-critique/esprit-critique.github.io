# Brief pour Claude Code — Esprit critique, version 2

Tu travailles sur le dépôt `esprit-critique/esprit-critique.github.io` : un site statique en français (et en anglais sous `/en/`) sur les biais cognitifs et les sophismes, publié sur GitHub Pages depuis le dossier `static/`.

Ce brief décrit une refonte en neuf lots. Il a été écrit après lecture du dépôt au commit `8a86cf0` (8 novembre 2026) et après des essais dans Chromium sur la vraie page. Si un détail du brief contredit le code, le code fait foi : corrige le brief dans ta tête et note l'écart dans le journal (§4).

---

## 1. But

Le fond du site est solide (90 fiches sourcées, 49 ateliers, quiz à révision espacée, Grand test). Son propriétaire le trouve trop sobre, pas assez attirant, sans progression lisible. Il demande :

1. une identité visuelle plus vivante et plus créative ;
2. un système de points commun à tous les jeux, qui montre à quel point on est fort, avec des grades et des graphiques, et une progression qui donne l'impression d'un produit fini ;
3. pouvoir relancer un tirage au hasard (aujourd'hui, une fois la fiche tirée, il faut revenir à la liste) ;
4. pouvoir se connecter pour retrouver sa progression sur un autre appareil ;
5. protéger le site contre les attaques ;
6. la cybersécurité comme sujet traité par le site.

Une contrainte de fond guide tous les choix : ce site apprend à ne pas se laisser manipuler. Il ne doit donc pas manipuler ses visiteurs. Chaque mécanique de jeu doit récompenser ce que le site enseigne (douter, s'étalonner, réviser, repérer dans la vie courante), jamais le temps passé ni la peur de perdre.

---

## 2. Décisions déjà prises

Ces décisions modifient des règles écrites dans `README.md` et `DESIGN.md`. Elles priment sur ces fichiers, que tu mettras à jour. Ne les rediscute pas ; applique-les.

**D1 — La charte graphique change.** Dans `DESIGN.md`, la section « Proscrit » et la règle « Aucun jeton nouveau » sont levées pour : les animations, les ombres, les nouveaux jetons de couleur et de mouvement, un nuancier des couleurs de catégorie dans les limites du lot 2, la refonte de la mise en page de l'accueil, du profil et des écrans de jeu, une largeur de page supérieure à 680 px sur ordinateur. Restent en vigueur : les deux polices (Newsreader pour les titres, police système pour le texte), l'emblème et le motif de Müller-Lyer, le style des corrections (barré rouge, verdict en italique), la numérotation « B 10 / S 7 », l'ordre des groupes dans la page d'une fiche, les conventions de la version anglaise, le contraste de 4,5:1, l'absence de mascotte, d'illustration de banque d'images et de ressource chargée depuis un autre site.

**D2 — Le compte devient possible, mais facultatif.** Le principe « aucun compte, aucune donnée envoyée » devient : « sans compte par défaut ; synchronisation facultative, chiffrée sur l'appareil avant tout envoi ». Le site doit rester entièrement utilisable sans compte et sans réseau. La solution retenue est décrite au lot 6 ; pas de compte par courriel, pas de service d'authentification tiers, pas de classement public.

**D3 — « Aucune dépendance » reste vrai pour le site.** Aucune bibliothèque, aucun CDN, aucune étape de compilation dans `static/`. Exceptions admises : les outils de test et d'intégration continue (Playwright est déjà utilisé par `tests/recherche-melange.js`), et le petit serveur de synchronisation du lot 6, sans dépendance npm à l'exécution.

**D4 — Un score global existe désormais : la maîtrise** (lot 4). Elle couvre tous les jeux, Grand test compris : chaque axe du dernier Grand test complet compte comme un jeu dans le domaine le plus proche. La page du Grand test, ses calculs et ses cinq axes séparés ne changent pas, et il n'a toujours pas de total propre ; ajoute seulement à sa page de résultats une phrase disant que ses axes comptent dans la maîtrise. Il n'y a toujours aucun classement entre personnes. Les points de lucidité, eux, ne dépendent pas de ses résultats, seulement du fait de l'avoir terminé.

**D5 — Autonomie.** Tu fais les commits, les push et les pull requests sans demander d'accord. Ne pose une question que si tu es bloqué par une étape manuelle du §7. Pour tout le reste, décide, note ton hypothèse dans le journal et continue.

---

## 3. Règles du dépôt

À respecter dans tous les lots. La plupart sont déjà appliquées par le code existant ; lis-le avant d'écrire.

**Architecture**
- Scripts classiques, sans module ni compilation : tous les fichiers partagent un seul espace de noms global. `python3 tests/noms_globaux.py` doit passer. Préfixe les nouveaux noms globaux pour éviter les collisions.
- `el`, `lienVers`, `lire`, `ecrire`, `melanger`, `generateur`, `aujourdHui`, `annoncer` sont définis dans `static/app.js`, chargé presque en dernier. Un script chargé avant lui ne peut les appeler qu'à l'intérieur de fonctions, pas au chargement.
- Tout nouveau script s'ajoute à quatre endroits : `static/index.html`, `static/en/index.html` (chemin `../`), la liste `FICHIERS` de `static/sw.js` avec un nouveau numéro de `CACHE`, et la vérification `verifierChargement()` au début de `app.js`.
- Les pages fixes (`mentions-legales.html`, `confidentialite.html`, `cgu.html`, `404.html` et leurs équivalents anglais) sont générées par `tests/pages/generer_pages.py`. Modifie le générateur, jamais les pages.

**Données de l'utilisateur**
- Toute la progression passe par `lire(cle, defaut)` et `ecrire(cle, valeur)` (localStorage, JSON).
- Toute nouvelle clé de progression s'ajoute à `CLES_SAUVEGARDE` et à `FORMES_SAUVEGARDE` dans `app.js`, sinon elle échappe à l'export, à l'import, aux sauvegardes automatiques et à l'effacement.
- Ne change jamais la forme d'une clé existante sans migration testée. Des visiteurs ont déjà des données : aucune mise à jour ne doit leur faire perdre quoi que ce soit.

**Textes et langues**
- Le code est écrit en français, commentaires compris ; les commentaires expliquent le pourquoi.
- Une phrase assemblée par le code s'écrit `T("texte avec {0}", valeur)`. Après chaque lot : `python3 tests/en/extraire.py --manquants`, puis `tests/en/ajouter.py`, puis `python3 tests/en/controle.py`. Aucun texte ne doit rester sans traduction anglaise.
- La typographie française est appliquée par `typo()` ; les conventions anglaises sont dans `DESIGN.md`.
- Tout fait chiffré ou attribué porte sa source. Un fait non vérifié sur sa source primaire n'est pas affiché ; il va dans `tests/a-verifier.md`.

**Sécurité du code**
- Le DOM se construit avec `el()`, `lienVers()`, `svg()` et `textContent`. Aucun HTML inséré.
- La politique de sécurité du contenu est dans une balise `meta` : pas de style en ligne, pas de gestionnaire d'événement en ligne. Vérifié dans Chromium sur la page réelle : `setAttribute("style", …)` et une balise `<style>` créée par script sont bloqués ; `element.style.setProperty(…)`, `style.cssText`, `adoptedStyleSheets` et `element.animate(…)` sont permis. Les valeurs dynamiques passent donc par des variables CSS posées avec `style.setProperty`, et les styles par des classes de `style.css`.
- Si le script en ligne de `index.html` ou de `en/index.html` change, son empreinte `sha256-…` dans la CSP doit être recalculée.

**Affichage et accessibilité**
- Deux largeurs de référence : 390 px et 1 280 px, en clair et en sombre.
- Nom accessible sur chaque contrôle, focus visible, cibles d'au moins 44 px, aucune information portée par la couleur seule.
- `prefers-reduced-motion` est déjà traité par une règle globale de `style.css` (`animation: none`, `transition: none` sur tous les éléments). Attention : cette règle n'arrête ni `element.animate()` ni `document.startViewTransition()`. Toute animation lancée par script passe par un seul point d'entrée qui respecte ce réglage et celui du lot 2.
- Avant de toucher à la navigation fixe ou aux expressions régulières, lis les commentaires existants sur Safari.

**Tests**
- Sous macOS : `tests/lancer.sh` lance tous les bancs.
- Sous Linux (session Claude Code dans le cloud), `tests/lancer.sh` ne tourne pas aujourd'hui (il utilise `osascript` et le chemin macOS de Chrome). Tournent : `node --check static/*.js`, `python3 tests/noms_globaux.py`, `python3 tests/en/controle.py`, et `python3 app.py` puis `node tests/recherche-melange.js` (Playwright). Le lot 0 corrige cela.

---

## 4. Méthode de travail

1. Avant d'écrire une ligne : lis `README.md`, `DESIGN.md`, `static/app.js` en entier, `static/ateliers.js`, `static/niveaux.js`, `static/melange.js`, `static/style.css`, `static/sw.js`, `tests/lancer.sh`, `tests/pages/generer_pages.py`.
2. Écris `tests/refonte-plan.md` (plan détaillé par lot, fichiers touchés, risques) et tiens `tests/refonte-journal.md` (décisions, hypothèses, écarts avec ce brief, état d'avancement). C'est la méthode déjà suivie pour le Grand test (`tests/grand-test-plan.md`, `tests/grand-test-journal.md`). Le journal doit permettre à une nouvelle session de reprendre sans relire la conversation.
3. Un lot = une branche = une pull request. Commits atomiques, messages en français dans le style de l'historique. Chaque lot laisse le site publiable.
4. Chaque pull request contient : ce qui change, les résultats des bancs, et des captures d'écran à 390 et 1 280 px, en clair et en sombre, des écrans modifiés.
5. Fusionne dans `main` quand tous les contrôles passent (la fusion publie le site). Si tu n'en as pas le droit, laisse la pull request prête.
6. Si le contexte de la session s'épuise, arrête-toi à la fin d'un commit cohérent, journal à jour.
7. Ce brief cite des faits techniques vérifiés le 11 novembre 2026, avec leurs sources (§8). Revérifie ceux dont tu dépends au moment de coder. N'invente jamais une empreinte de commit, un numéro de version ni une référence d'étude : résous-les (`git ls-remote`, documentation officielle, source primaire) ou écris « à vérifier ».

---

## 5. Les lots

Ordre imposé : chaque lot s'appuie sur les précédents.

### Lot 0 — Filet de sécurité

But : pouvoir tout casser sans rien casser.

- **`CLAUDE.md`** à la racine : les règles du §3 corrigées d'après le code, les commandes de test, les conventions de commit. Il sera relu au début de chaque session.
- **Plan et journal** (§4).
- **Bancs portables.** Rends `tests/lancer.sh` exécutable sous Linux comme sous macOS. Trois choses le lient à macOS : le contrôle de syntaxe par `osascript` (à remplacer par `node --check`) ; le chemin de Chrome codé en dur dans huit fichiers (`tests/chrome.py`, `csp.py`, `hors_ligne.py`, `capturer.py`, et dans `tests/pages/` : `generer_apercu.sh`, `planches.py`, `planches_fiches.py`, `recadrer.py`), à lire dans une variable `CHROME`, sinon à chercher (`google-chrome`, `chromium`, chemin macOS) ; le moteur JavaScript de macOS utilisé par `tests/grand_test_commun.py`, `grand_test_calculs.py` et `tests/pages/legendes_sources.py`, à remplacer par `node`. `tests/safari.sh` reste propre à macOS. Vérifie que les résultats des bancs sont identiques avant et après.
- **Intégration continue.** `.github/workflows/verifier.yml`, déclenché sur `pull_request` et réutilisable (`workflow_call`) : syntaxe, noms globaux, contrôle de l'anglais, bancs dans Chrome sans fenêtre, banc Playwright. Dans `publier.yml`, la publication dépend de cette vérification (`needs`) : un site dont les contrôles échouent n'est plus publié. Actions désignées par l'empreinte de leur commit, version en commentaire, `permissions` minimales, comme dans `publier.yml`. Playwright en dépendance de développement à version figée, `node_modules` ignoré ; rien de cela n'est publié puisque seul `static/` l'est.
- **État des lieux** dans le journal : poids de chaque fichier de `static/`, résultats actuels de tous les bancs.

Terminé quand : tous les bancs passent sous Linux et dans l'intégration continue ; la section « Tests » du README est à jour.

### Lot 1 — Protéger le site

But : rendre l'injection de code impossible par construction, et outiller le dépôt contre les régressions.

Constats (vérifiés) :
- 84 affectations `innerHTML` dans `static/*.js`. 81 vident un élément (`x.innerHTML = ""`). 3 insèrent du HTML : `app.js` ligne 32 (message « Chargement incomplet »), `ateliers.js` ligne 393 (`PICTOS`), `grand-test-interface.js` ligne 1184 (`TRAITS_ENTITE`).
- Le message « Chargement incomplet » contient un bouton avec `onclick="location.reload()"`. La CSP bloque les gestionnaires en ligne : ce bouton ne fait rien aujourd'hui.
- En ajoutant `require-trusted-types-for 'script'; trusted-types 'none'` à la balise meta de la CSP, Chromium applique bien la directive : `x.innerHTML = ""` lève une erreur et le site ne s'affiche plus ; `x.replaceChildren()`, `x.textContent = ""` et la construction par `createElementNS` passent ; `DOMParser.parseFromString` est refusé.
- Aucune page n'a de balise `<meta name="referrer">`. `app.py` envoie `Referrer-Policy: no-referrer` en local, mais GitHub Pages ne permet pas de régler les en-têtes.
- Pour la même raison, la CSP est livrée par balise meta, où `frame-ancestors`, `report-uri` et `sandbox` sont ignorés. La protection contre l'affichage dans le cadre d'un autre site repose donc sur `refuserEncadrement()`, au début de `app.js` : à conserver.
- `formeValide()` ne contrôle que le type de premier niveau d'une clé importée (sauf `grandTest`, vérifié en profondeur).
- `ecrire()` ignore en silence un échec d'écriture (quota dépassé).
- `publier.yml` publie à chaque push sur `main`, sans aucun contrôle préalable (corrigé au lot 0).

Travaux :
1. Remplace les 81 vidages par `replaceChildren()`.
2. Réécris les 3 insertions : le message d'erreur en DOM avec `addEventListener` ; `PICTOS` et `TRAITS_ENTITE` convertis en données structurées (liste d'éléments SVG avec leurs attributs) dessinées avec `svg()`. Le rendu doit rester identique au pixel près : compare des captures.
3. Active Trusted Types (`require-trusted-types-for 'script'; trusted-types 'none'`) dans les CSP de `index.html`, de `en/index.html` et des pages générées. Les navigateurs qui ne connaissent pas la directive l'ignorent.
4. Ajoute `<meta name="referrer" content="no-referrer">` aux mêmes pages.
5. **Validation profonde des sauvegardes.** Un schéma par clé : structure attendue, bornes (longueur des tableaux et des textes, intervalles des nombres, identifiants de fiches et d'ateliers existants), refus des noms `__proto__`, `constructor`, `prototype`. Un élément invalide est écarté sans rejeter le reste. Ce validateur sert à l'import, à la restauration d'une sauvegarde automatique et, au lot 6, à tout ce qui vient du serveur. Ajoute un banc à données aléatoires : 1 000 sauvegardes déformées, puis 1 000 adresses aléatoires après le `#` ; le site doit toujours démarrer et s'afficher sans erreur.
6. `ecrire()` : prévenir l'utilisateur une fois par visite quand l'enregistrement échoue.
7. **Contrôle statique de sécurité** (`tests/securite.py` ou `.js`), dans l'intégration continue. Il échoue si le code contient : `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `setTimeout` ou `setInterval` avec une chaîne, `setAttribute` d'un attribut `on…` ou `style`, une adresse `javascript:`, une ressource chargée depuis une autre origine, un `target="_blank"` sans `rel="noopener"`. Il vérifie aussi que l'empreinte de chaque CSP correspond au script en ligne de sa page, que les CSP des trois gabarits sont identiques hors empreinte, et que chaque fichier de `static/` est dans la liste de `sw.js`.
8. **Chaîne de publication.** Dependabot pour l'écosystème `github-actions`, afin de tenir les empreintes à jour ; analyse CodeQL pour JavaScript ; `SECURITY.md` (signalement privé par GitHub) ; `static/.well-known/security.txt` conforme à la RFC 9116, avec un contrôle qui échoue 30 jours avant sa date d'expiration. Attention : `actions/upload-pages-artifact` exclut les fichiers cachés depuis sa version 4 ; l'entrée `include-hidden-files`, ajoutée en version 5.0.0, est nécessaire. Vérifie après publication que l'adresse répond.
9. **`SECURITE.md`** : modèle de menace du site (ce qu'on protège, contre qui, par quelles mesures, quels risques sont acceptés). Il sera complété au lot 6.

Terminé quand : le banc `csp` ne relève aucune violation ni erreur sur toutes ses adresses, en français et en anglais, Trusted Types actif ; le contrôle statique passe ; le banc à données aléatoires passe ; un test bloque le chargement d'un script et vérifie que « Recharger » recharge.

### Lot 2 — Identité visuelle : « le cabinet d'illusions »

But : un site qu'on a envie d'ouvrir, reconnaissable, sans ressembler à un produit générique.

**Idée directrice.** Le site montre ce qu'il enseigne : on ne peut pas se fier à ce que l'on voit. Chaque écran important porte une pièce visuelle qui trompe l'œil, puis se révèle au toucher. Papier chaud et encre pour le fond, comme aujourd'hui ; la seule couleur vive vient des 14 couleurs de catégorie, traitées comme un spectre.

Commence par réécrire `DESIGN.md` (version 2) : ce qui reste, ce qui change, les nouveaux jetons, les règles de mouvement. Puis applique-la.

**Ce qui change**
- **Les fiches deviennent des cartes à jouer.** Coins arrondis (de l'ordre de 12 à 16 px pour les cartes, 10 px pour les boutons), une élévation légère au repos et plus marquée au survol ou à l'appui (deux jetons d'ombre ; en sombre, des surfaces plus claires plutôt que des ombres), l'indice « B 10 » en coin comme sur une carte. La barre de couleur de catégorie à gauche reste.
- **Le filet du spectre.** Sous l'en-tête, un filet de 3 px découpé en 14 segments aux couleurs des catégories, chaque segment de largeur proportionnelle au nombre de fiches de sa catégorie. C'est un graphique, pas un dégradé : il dit la composition du catalogue. Le même filet, dans le profil, se remplit selon la maîtrise. C'est le seul usage de plusieurs couleurs vives côte à côte.
- **Une échelle typographique plus contrastée.** Titres de page de 40 à 56 px, grands nombres (score, points) de 64 à 80 px en Newsreader, plus d'air entre les blocs.
- **Une vraie mise en page sur ordinateur.** Aujourd'hui, une colonne de 680 px à toutes les largeurs. À partir d'environ 1 040 px : deux colonnes sur l'accueil et le profil (contenu principal, colonne latérale) ; sur une fiche, la colonne de lecture reste étroite (68 caractères au plus), avec un rail latéral collant (sommaire de la fiche, carte suivante, carte au hasard).
- **Un bouton de profil dans l'en-tête**, près du bouton de langue : le blason du visiteur (lot 4) dans un anneau de progression, avec l'insigne de son grade et sa maîtrise.
- **Un vocabulaire de graphiques** (lot 4), décrit dans `DESIGN.md` : courbe, barres, toile, jauge, calendrier. Le site a un atelier « Graphiques trompeurs » : ses propres graphiques doivent être irréprochables. Barres depuis zéro, pas de double axe, pas d'effet de relief, valeurs écrites, couleur jamais seule à porter l'information, tableau des données accessible pour chacun.
- **Trois mouvements signature**, et pas davantage, pour que l'ensemble reste cohérent :
  - *la révélation* : les ailettes de Müller-Lyer s'effacent et les repères apparaissent (une vérité dévoilée : correction, changement de grade) ;
  - *le retournement* : une carte pivote sur elle-même (tirages, cartes recto verso) ;
  - *la chute* : des billes tombent dans des colonnes, comme sur une planche de Galton (scores, hasard).
  S'y ajoutent des micro-interactions discrètes : appui, survol, compteur qui défile, anneau qui se remplit, pastille de l'onglet actif.
- **Transitions entre pages** avec `document.startViewTransition` quand il existe (disponible dans les trois moteurs depuis octobre 2025), en amélioration progressive ; sinon, le fondu actuel. Le titre d'une fiche dans la liste se prolonge en titre de la page de la fiche (`view-transition-name`).
- **L'illusion du jour.** Sur l'accueil, une illusion d'optique interactive, différente chaque jour (`generateur(aujourdHui())`), avec un bouton « Vérifier » qui la démonte par une animation (repères, superposition, fond qui s'efface) et un bouton « Une autre illusion ». Au moins huit, dessinées en SVG avec `svg()` : Müller-Lyer (existe), Ebbinghaus, Ponzo, Zöllner, Hering, mur du café, triangle de Kanizsa, Jastrow, contraste simultané, verticale-horizontale. Chacune a une légende d'une ou deux phrases et une source (auteur, année) vérifiée ; lien vers l'atelier `#chiffres/illusion`.
- **Quatorze glyphes de catégorie**, au trait, dans le vocabulaire de l'emblème (lignes et ailettes), pour les en-têtes de catégorie, le codex et les distinctions. Même grammaire que les personnages du Grand test.
- **Des états vides dessinés** (aucune révision, aucun résultat) au lieu d'une phrase seule.
- **L'accueil réorganisé** : (1) un bloc d'ouverture avec la date, l'action principale du moment et la série de jours ; (2) « le programme du jour », les trois cartes quotidiennes existantes (situation, défi, vrai ou faux) présentées côte à côte avec leur état fait ou à faire ; (3) l'illusion du jour ; (4) une carte au hasard (lot 3) ; (5) les révisions ; (6) les suggestions. Pour un nouveau visiteur : l'emblème en grand et un seul bouton pour commencer. Les lots 4 et 5 y ajouteront le grade, la courbe de maîtrise, l'anneau d'objectif, le codex et le parcours en cours.
- **La page d'une fiche** garde sa structure et son ordre, mais gagne un titre plus grand, l'indice en coin, une illustration mieux mise en valeur et, sur téléphone, une barre d'actions collante (marquer acquise, « Je l'ai repéré », carte suivante).
- **Un réglage « Animations »** dans le pied de page, à côté du thème : automatiques, réduites. Nouvelle clé `reglages`, à déclarer comme toute clé de progression (§3).
- **L'image d'aperçu** (`apercu.png`, `apercu-en.png`) et le manifeste sont régénérés ; ajoute au manifeste des raccourcis (`shortcuts`) vers le quiz, une carte au hasard et le défi du jour.

**Ce qu'il faut éviter**
Le dégradé violet, le verre dépoli, les ombres lourdes, les émojis en guise d'icônes, les illustrations de banque d'images, les confettis, une mascotte, les animations qui bloquent l'action ou volent le focus, tout ce qui bouge en boucle sans raison.

**Méthode pour ce lot**
Écran par écran : accueil, liste des fiches, fiche, quiz et correction, bilan, liste des ateliers, écran d'atelier, portrait, guide, pages fixes. Pour chacun, prends des captures aux deux largeurs et dans les deux thèmes, relis-les d'un œil critique (hiérarchie, alignements, densité, contraste, cohérence avec les autres écrans), corrige, recommence. Au moins deux passes par écran. Si un outil ou un skill de design d'interface est disponible dans ta session, sers-t'en.

**Budget.** Animations sur `transform` et `opacity` seulement. Aucune bibliothèque. Pas de régression du temps d'affichage de l'accueil ; mesure avant et après.

**Bancs.** `tests/controle-affichage.js` mesure des éléments immobiles (textes coupés, superpositions, contraste) : fais tourner les bancs d'affichage animations réduites, et ajoute un banc qui vérifie que chaque animation se termine et laisse l'écran dans son état final.

Terminé quand : `DESIGN.md` version 2 est écrit et respecté ; tous les bancs d'affichage passent (contraste, débordements, noms accessibles) ; les animations lancées par script s'arrêtent quand le réglage ou l'appareil demande de les réduire ; la version anglaise est complète.

### Lot 3 — Relancer le hasard

But : partout où le site tire au sort, on peut tirer de nouveau, sans retomber sur la même chose.

Constats : `tirerAuHasard()` dans `app.js` choisit une fiche avec `Math.random()` et change l'adresse ; la page de la fiche n'offre aucun moyen de tirer de nouveau, et la même fiche peut sortir deux fois de suite. Dans `melange.js` (« Planche de Galton »), il faut répondre à la question tirée pour en obtenir une autre.

Travaux :
1. **Un sac de tirage** réutilisable : les éléments sont mélangés, puis distribués un à un ; le sac se remélange quand il est vide ; jamais le même élément deux fois de suite, y compris à la jonction de deux cycles. État gardé en mémoire pour la session. Banc : sur deux cycles, chaque élément sort exactement deux fois.
2. **Fiches.** Quand une fiche a été tirée au hasard, sa page affiche un bandeau de tirage : « Tirer une autre carte » (touche `R`), « Carte précédente », le compte « 3 sur 51 », et le périmètre du tirage, modifiable : toutes les fiches, la catégorie en cours, les fiches non acquises, les fiches à réviser, biais et sophismes mêlés. Option « privilégier les cartes jamais ouvertes ». Un nouveau tirage remplace l'entrée d'historique au lieu d'en ajouter une, pour que « retour » ramène à la liste. Le bandeau disparaît quand on arrive sur une fiche autrement. Mouvement : le retournement.
3. **Cartes recto verso.** Depuis la liste des fiches, un mode « Cartes » : au recto une situation (`cas`, `cas2`, `casSup`), au verso le nom, la définition et le lien vers la fiche. Retourner (espace), suivante (→), une autre au hasard (`R`). Il utilise le sac et respecte les filtres. Il n'enregistre rien dans les boîtes de révision et ne rapporte pas de points : c'est une auto-évaluation.
4. **Planche de Galton.** Un bouton « Passer cette question » avant d'avoir répondu : nouvelle question d'un autre jeu, sans pénalité, avec le nombre de questions passées dans la ligne de session. Vérifie que passer une question ne la marque pas comme vue (`tirerSelonNiveau` enregistre dans `vus` dès le tirage).
5. **Accueil.** Une carte « Au hasard » : une fiche tirée, avec « Une autre ». La suggestion « Une fiche à découvrir » reçoit aussi un bouton pour en changer.
6. **Ateliers.** Sur la page des ateliers, « Un atelier au hasard », avec nouveau tirage.
7. **Défi libre.** Le défi du jour reste unique et identique pour tous. Ajoute l'adresse `#defi/<graine>` : dix questions tirées d'une graine, rejouables, avec « Un autre défi » et « Partager ce défi » (même mécanisme que `#bingo/<graine>` dans `pratiques.js`). C'est la manière de se mesurer à des amis sans serveur.

Terminé quand : un banc couvre le sac, le bandeau, la touche `R`, l'historique et le passage de question ; aucun tirage ne peut rendre deux fois de suite le même élément.

### Lot 4 — Maîtrise, grades, graphiques, points

But : un score global qui dit à quel point on est fort, des grades, des graphiques, et des points qui récompensent ce que le site enseigne.

Deux nombres, deux rôles, à ne jamais confondre dans l'interface :
- **la maîtrise** (0 à 1 000) : la force. Commune à tous les jeux, elle peut monter ou baisser. Elle donne le grade. C'est le nombre mis en avant partout.
- **les points de lucidité** : l'entraînement. Gagnés à chaque action, ils ne baissent jamais. Ils servent à l'objectif du jour, au calendrier et au bilan de la semaine. Ils ne donnent aucun grade.

#### 4.1 La maîtrise : un score commun à tous les jeux

Elle se calcule entièrement à partir des résultats déjà enregistrés (`resultatsAteliers`, `memoire`, `duels`, `confiance`, `fourchettes`, `certitudes`…). Elle est donc rétroactive : un visiteur qui a déjà joué reçoit sa maîtrise et son grade dès la mise à jour. Fonctions pures, dans `static/progression.js`.

**Maîtrise d'un jeu noté** (0 à 1 000). Pour chaque niveau L où le joueur a des parties (`resultatAtelier(id).niveaux[L]`) :
- réussite récente : moyenne des 5 dernières parties à ce niveau, divisée par le maximum ;
- correction du hasard : `q = max(0, (réussite − c) / (1 − c))`, où `c` est la part qu'on obtient en répondant au hasard (0,25 pour quatre réponses, 0,5 pour deux, 0 pour une estimation libre), déclarée jeu par jeu ;
- confiance : `f = min(1, parties / 3)`, pour qu'une seule partie chanceuse ne suffise pas ;
- valeur : `plafond × q × f`, avec un plafond de 500 au niveau 1, 750 au niveau 2, 1 000 au niveau 3.

La maîtrise du jeu est la plus grande de ces valeurs. Un jeu sans niveaux a un plafond de 1 000. Repères, pour quatre réponses : 85 % de réussite donne 400 au niveau 1, 600 au niveau 2, 800 au niveau 3. Ce calcul tient compte du fait que les ateliers ajustent leur difficulté : un taux de réussite brut ne dirait rien, puisque l'ajustement le ramène vers 79 %.

**Jeux à mesure particulière.** Certains ateliers enregistrent autre chose qu'un score : étalonnage (`confiance` : écart entre certitude annoncée et réussite), fourchettes à 90 % (`fourchettes`), certitude au quiz (`certitudes`), ancrage (`ancrages`), prévisions (`previsions`, score de Brier), débats (`debats`, sensibilité d′). Définis pour chacun une conversion vers 0 à 1 000, avec la même exigence d'un nombre minimal de mesures, et écris-la en clair.

**Jeux qui ne comptent pas.** Une expérience qui se fait une fois ou qui n'a pas de bonne réponse ne mesure pas une force (expériences de pensée, cécité au choix, faux souvenirs, fabriquer un résultat, bingo, débat à deux, décision guidée). Elle n'entre ni au numérateur ni au dénominateur. La Planche de Galton non plus : elle tire dans les autres jeux.

**Notions** (quiz et fiches) : 80 % pour les boîtes de révision (somme des boîtes des 90 fiches, divisée par 450, fois 1 000) et 20 % pour les duels entre notions proches (réussite corrigée du hasard, pleine confiance à partir de 20 duels).

**Domaines.** Six axes : les sections d'ateliers qui comptent au moins trois jeux mesurés (le monde en chiffres, mesurer sa confiance, percevoir, raisonner, débattre), plus les notions. Les jeux d'une section trop petite (philosopher) et les axes du Grand test sont rattachés à l'axe le plus proche. La maîtrise d'un domaine est la moyenne de ses jeux mesurés ; **un jeu jamais joué compte pour zéro**, ce qui empêche de gonfler son score en ne jouant qu'à ce qu'on réussit.

**Maîtrise globale** : la moyenne des six domaines, arrondie à l'entier.

**Table des jeux.** Écris une table `MAITRISE_JEUX` : pour chaque atelier, son domaine, son type (noté, mesure particulière, ne compte pas), sa part de hasard `c`, et une ligne de justification. Un banc échoue si un atelier de `tousLesAteliers()` n'y figure pas : tout jeu ajouté plus tard devra déclarer comment il compte. Relevé au commit `8a86cf0`, à revérifier : 29 ateliers affichent un score par `afficherScore()` ; 3 notent un score directement par `noterPartie()` (`faux-souvenirs`, `fabriquer`, `cecite`) ; 14 appellent `noterPartie()` sans score, dont plusieurs ont une mesure propre.

**Historique.** La maîtrise passée ne peut pas être recalculée (les historiques sont tronqués à 12 parties). Enregistre donc une photographie par jour : maîtrise globale et des six domaines, 400 jours, plus la meilleure maîtrise atteinte. La courbe commence le jour de la mise à jour ; dis-le dans l'interface. Nouvelle clé `maitrise`.

**Pas de baisse par absence.** La maîtrise ne diminue que si les résultats récents sont moins bons, jamais parce qu'on n'est pas venu.

**Après chaque partie**, le bilan montre : « Maîtrise de ce jeu : 540 (+35) », l'effet sur la maîtrise globale, et ce qui ferait monter le plafond (« Pour dépasser 500, jouez au niveau 2 »). Chaque carte d'atelier affiche une barre de maîtrise ; chaque section, la maîtrise de son domaine.

#### 4.2 Les grades

Dix grades, donnés par la maîtrise globale. Noms épicènes :

| Grade | Maîtrise |
|---|---|
| Novice | 0 |
| Élève | 5 |
| Sceptique | 25 |
| Détective | 60 |
| Analyste | 120 |
| Stratège | 220 |
| Philosophe | 350 |
| Virtuose | 500 |
| Maître | 650 |
| Esprit critique | 800 |

Seuils calés par simulation (une série de quiz et une à deux parties d'atelier par jour) : Élève le premier jour, Sceptique en trois jours, Détective en une à deux semaines, Analyste en deux à quatre semaines, Stratège en un à deux mois. Un joueur moyen plafonne vers Virtuose après six mois ; un joueur fort atteint Maître en six mois ; Esprit critique demande d'être très bon partout, notions comprises. Refais cette simulation dans le banc avec la vraie liste des jeux et ajuste les seuils si les délais s'écartent de ceux-ci.

- **Insigne.** Des galons faits des ailettes de l'emblème de Müller-Lyer : un chevron, deux, trois, puis barres et étoile pour les grades hauts. Dessin au trait, paramétrique, comme les personnages du Grand test. L'insigne figure dans l'en-tête, sur le profil et sur la carte à partager.
- **Un grade acquis ne se perd pas** : il suit la meilleure maîtrise atteinte. La maîtrise affichée, elle, est toujours la maîtrise actuelle.
- **Jauge vers le grade suivant**, avec le nombre de points manquants et le jeu qui rapporterait le plus (le jeu mesuré le plus faible ou jamais joué du domaine le plus faible).
- **Changement de grade** : un bandeau, avec le mouvement de la révélation. Jamais bloquant.
- Sous le grade, toujours cette phrase : « La maîtrise mesure votre réussite dans les jeux de ce site, pas votre intelligence. »

#### 4.3 Les graphiques

Un module `static/graphiques.js` : des fonctions réutilisables qui dessinent en SVG avec `svg()`, sans bibliothèque, dans les deux thèmes, lisibles à 390 px. Chaque graphique a un titre qui dit ce qu'il montre, ses valeurs écrites, et un bouton « Voir les données » qui affiche le tableau correspondant. Règles de `DESIGN.md` (lot 2).

| Graphique | Où | Ce qu'il montre |
|---|---|---|
| Courbe de maîtrise | profil, miniature sur l'accueil | la maîtrise globale dans le temps (4 semaines, 12 semaines, tout), les seuils de grade en bandes horizontales, les changements de grade marqués ; on peut y superposer un domaine |
| Toile des domaines | profil, carte à partager | les six domaines de 0 à 1 000, avec en pointillé la toile d'il y a quatre semaines. L'aire d'une toile trompe : affiche les valeurs et propose la même chose en barres |
| Barres par domaine | profil | les six domaines triés, lecture exacte |
| Barres par jeu | profil, onglet « Jeux » | tous les jeux mesurés, groupés par domaine, avec les repères 500, 750 et 1 000 et les jeux jamais joués en creux |
| Jauge de grade | en-tête du profil, accueil | la distance au grade suivant |
| Forces et points faibles | profil | les trois jeux les plus forts, les trois plus faibles, le plus gros progrès du mois |
| Avant et après | bilan de chaque partie | la maîtrise du jeu avant et après la partie |
| Score face au hasard | bilan du quiz | décrit plus bas |
| Calendrier d'activité | profil | décrit plus bas |
| Courbe d'étalonnage | profil, domaine « confiance » | `courbeEtalonnage()` existe dans `chiffres.js` : réutilise-la |

Aucune comparaison avec d'autres personnes : le site n'a pas ces données. Toutes les comparaisons sont avec soi-même, plus tôt.

Ajoute ces graphiques au banc d'affichage, dans toutes leurs variantes : aucune donnée, une seule donnée, données extrêmes.

#### 4.4 Les points de lucidité

Dans `static/progression.js` aussi : un moteur en fonctions pures (testable sans navigateur), et une seule fonction d'entrée appelée depuis les points du code où un événement se produit. Repère ces points : la fonction de rappel passée à `rendreQuestion()` dans `afficherQuiz()`, `enregistrerReponse()` (pour détecter une montée de boîte, compare `m.b` avant et après), `noterDuel()`, `noterPartie()` dans `ateliers.js`, `MELANGE.fin` dans `melange.js`, l'écriture de `defiJour`, de `jour` et de `vfJour`, `journalReperage()`, la fin d'un Grand test, la lecture d'une fiche. Un réaffichage d'une question déjà répondue ne doit jamais redonner de points.

**L'unité : la lucidité.**

**Le barème du quiz paie l'étalonnage.** Le quiz demande déjà la certitude (« Sûr », « Plutôt sûr », « Au hasard »). Les points en dépendent, de sorte que dire ce que l'on pense vraiment soit la meilleure stratégie :

| Question à 4 réponses | Juste | Faux |
|---|---|---|
| Sûr | +10 | −8 |
| Plutôt sûr | +8 | −2 |
| Au hasard | +4 | 0 |
| Certitude non demandée | +4 | 0 |

Vérifié par le calcul : « Au hasard » est le meilleur choix quand on pense avoir moins d'une chance sur trois d'avoir raison, « Plutôt sûr » entre un tiers et trois quarts, « Sûr » au-delà. Répondre sans indiquer sa certitude ne rapporte jamais plus que la meilleure déclaration.

| Duel entre notions proches (2 réponses) | Juste | Faux |
|---|---|---|
| Sûr | +5 | −9 |
| Plutôt sûr | +4 | −3 |
| Au hasard | +2 | 0 |

Seuils : 60 % et 6/7. Ajoute un banc qui vérifie ces seuils numériquement pour les deux tableaux. Le total d'une série ne peut pas être négatif : on ajoute `max(0, total)`.

**Les autres sources**

| Source | Points | Limite |
|---|---|---|
| Réponse libre juste | +12 | — |
| Montée de boîte d'une notion | 2 × numéro de la nouvelle boîte | — |
| Notion arrivée en boîte 5 | +10 | une fois par notion |
| Révision faite le jour prévu | +3 par notion | — |
| Quiz chrono | 2 × score, s'il est positif | 40 par partie |
| Situation du jour | +5, et +3 si juste | une fois par jour |
| Vrai ou faux du jour | +3, et +2 si juste | une fois par jour |
| Défi du jour | +2 par bonne réponse, +10 pour l'avoir terminé | une fois par jour |
| Les trois cartes du jour faites | +10 | une fois par jour |
| Défi libre | +2 par bonne réponse | 2 défis par jour |
| Atelier noté | 10 × score / maximum, multiplié par 1, 1,5 ou 2 selon le niveau | 3 parties par atelier et par jour |
| Atelier sans note | +8 | une fois par atelier et par jour |
| Atelier essayé pour la première fois | +15 | une fois par atelier |
| Atelier maîtrisé (`atelierMaitrise`) | +50 | une fois par atelier |
| Planche de Galton | +2 par bonne réponse | 20 par jour |
| Repérage noté (« Je l'ai repéré ») | +5 | 2 par jour |
| Fiche lue jusqu'au pied | +2 | une fois par fiche |
| Grand test terminé | +30 (express), +100 (complet) | une fois par 30 jours |
| Étape de parcours (lot 5) | +10 | une fois par étape |
| Parcours terminé (lot 5) | +50 | une fois par parcours |

Aucun point pour : marquer une fiche comme acquise (c'est déclaratif), le temps passé, le partage, la création d'un compte. La Planche de Galton affiche aujourd'hui « Les réponses ne sont pas enregistrées » : adapte la phrase.

Les points n'ont pas d'échelle de grades : une série de quiz et les cartes du jour rapportent environ 125 points. Le total cumulé s'affiche dans le profil comme une simple statistique.

**L'objectif du jour** : 30, 60 ou 100 points, au choix (60 par défaut), montré par un anneau sur l'accueil et dans l'en-tête.

**La série de jours** : `serieDeJours()` existe. Ajoute un jour de repos : un jour manqué par période de sept jours ne rompt pas la série. Aucun message de reproche, aucune notification.

**Le codex.** La pièce maîtresse du profil : une roue de 90 points, groupés en 14 arcs aux couleurs des catégories. Chaque point est une fiche, dans l'un de cinq états : jamais ouverte, lue, rencontrée au quiz, consolidée (boîte 3 ou plus), maîtrisée (boîte 5). Toucher un point ouvre la fiche. Fournis une version en liste pour les lecteurs d'écran. Une miniature figure sur l'accueil.

**Les distinctions.** Chacune a un nom, un glyphe au trait, une phrase qui dit pourquoi elle compte et un lien vers la fiche ou l'atelier concerné. Les conditions se calculent à partir des données enregistrées : elles sont donc rétroactives. Celles qui ne sont pas obtenues s'affichent en contour, avec leur condition ; deux seulement sont secrètes. Vérifie pour chacune la forme réelle des données avant de coder la condition.

| Distinction | Condition | Données |
|---|---|---|
| Premier doute | une série de quiz terminée | `memoire` |
| Régulier, Assidu | 7 jours, 30 jours de suite | `activite` |
| À l'heure | 20 révisions faites le jour prévu | nouveau compteur |
| Mémoire longue | 10 notions en boîte 5 | `memoire` |
| Cartographe | une fiche lue dans chacune des 14 catégories | `fichesLues` |
| Codex complet | les 90 fiches rencontrées au quiz | `memoire` |
| Bien étalonné | 50 réponses avec certitude, et au moins 85 % de réussite quand « Sûr » | `certitudes` |
| Je sais que je ne sais pas | 25 réponses déclarées « Au hasard » | `certitudes` |
| Leçon retenue | 10 erreurs commises en étant sûr, réussies à la révision suivante | `erreursSures`, nouveau compteur |
| Fourchettes honnêtes | 30 fourchettes à 90 %, dont 85 à 95 % justes | `fourchettes` |
| Prévisionniste | 10 prévisions résolues, score de Brier d'au plus 0,20 | `previsions` |
| Bayésien | « Tests positifs » réussi à 90 % au niveau 3 | `resultatsAteliers` |
| Porte numéro deux | avoir changé de porte 20 fois à Monty Hall | `montyHall` |
| Sans ancre | effet d'ancrage inférieur à 10 % sur trois parties | `ancrages` |
| p < 0,05 | « Fabriquer un résultat » terminé | `resultatsAteliers` |
| Oreille fine | sensibilité d′ d'au moins 2 sur trois débats | `debats`, `dPrime()` |
| Homme d'acier | « Reformuler sans trahir » terminé au niveau 2 ou plus | `resultatsAteliers` |
| Bingo | une ligne complète au bingo des sophismes | `bingo` |
| Sur le terrain | 10 repérages notés | `reperages` |
| Naturaliste | des repérages pour 10 notions différentes | `reperages` |
| Décision éclairée | une décision guidée dont le bilan a été fait | `decisions` |
| Explorateur, Tour complet | 25 ateliers essayés, tous les ateliers essayés | `resultatsAteliers` |
| Grand test | un Grand test complet terminé | `grandTest` |
| Spécialiste | 800 de maîtrise dans un domaine | `maitrise` |
| Polyvalent | au moins 300 dans chacun des six domaines | `maitrise` |
| Les apparences (secrète) | avoir révélé l'emblème de l'en-tête | nouveau drapeau |
| Démonteur d'illusions (secrète) | avoir vérifié huit illusions du jour différentes | nouveau compteur |

**Votre score face au hasard.** À la fin d'une série de quiz, sous le score : l'histogramme de la loi binomiale des scores qu'on obtiendrait en répondant au hasard (probabilité 1/4, ou 1/2 pour les duels ; rien pour la réponse libre), le score du joueur mis en évidence, et une phrase calculée, par exemple : « En répondant au hasard, on obtient 7 sur 10 ou mieux environ 4 fois sur 1 000. » Calcule la probabilité exactement dans le code (pour 7 sur 10 : 0,35 %). Mouvement : la chute. C'est une leçon de statistiques cachée dans une récompense.

**Les moments de récompense**, jamais bloquants : une pastille « +8 » qui rejoint l'anneau de l'objectif ; la variation de maîtrise après une partie ; au changement de grade, un bandeau avec le mouvement de la révélation ; pour une distinction, un message avec son glyphe ; l'anneau qui se ferme quand l'objectif est atteint. Tout est annoncé aux lecteurs d'écran par `annoncer()`.

**La page Profil** (`#profil`), ouverte par le bouton de l'en-tête. En tête : blason, pseudonyme, insigne du grade, maîtrise, jauge vers le grade suivant. Puis des onglets : « Vue d'ensemble » (courbe de maîtrise, toile des domaines, forces et points faibles, objectif, série, calendrier), « Jeux » (barres par jeu), « Notions » (codex), « Distinctions », « Parcours » (lot 5), « Réglages » (synchronisation au lot 6). Un lien mène au portrait. Le pseudonyme (24 caractères au plus) et le blason restent sur l'appareil ; le blason est un dessin au trait généré à partir du pseudonyme, dans le vocabulaire de l'emblème, avec l'une des 14 couleurs. Le calendrier d'activité montre les 16 dernières semaines, une case par jour, plus ou moins foncée selon les points du jour (`activite` et `lucidite`).

**Le bilan de la semaine.** Le premier jour de chaque semaine, une carte sur l'accueil résume la semaine écoulée : points, notions consolidées, réussite quand « Sûr », comparés à la semaine précédente. Elle remplace toute notification : le site ne relance jamais personne.

**Le rattrapage.** Au premier chargement après la mise à jour, convertis une seule fois la progression existante en points, pour que personne ne reparte de zéro : 6 par bonne réponse au quiz et 4 par boîte atteinte (`memoire`), 15 par atelier essayé et 8 par partie jusqu'à 20 parties par atelier (`resultatsAteliers`), 5 par jour d'activité (`activite`), 5 par repérage jusqu'à 60. Affiche une fois : « Votre progression passée vaut N points. » L'opération doit être idempotente.

**Le mode sobre.** Un réglage masque la maîtrise, les grades, les points, les distinctions et les moments de récompense, et rend le site tel qu'il était. Tout continue d'être compté.

**La transparence.** Un article du guide, « Comment votre maîtrise est calculée » : la formule en clair, un exemple chiffré, et ses limites (elle mesure la réussite dans les jeux du site ; elle dépend du nombre de jeux joués ; elle ne compare à personne ; un nombre visé cesse vite d'être une bonne mesure). Un second article, « Comment ce site essaie de vous motiver » : quelles mécaniques il emploie, sur quels biais elles s'appuient (avec les liens vers les fiches concernées, par exemple `biais:aversion-perte`, `biais:dotation`, `biais:couts-irrecuperables`), ce que dit la recherche, et ce que le site s'interdit : pas de notification, pas de série punitive, pas de point pour le temps passé, pas de classement, mode sobre disponible. Références candidates, à vérifier sur la source primaire avant affichage : Sailer et Homner (2020), « The gamification of learning: a meta-analysis », *Educational Psychology Review*, 32(1), 77-112 (effets faibles mais significatifs : g = 0,49 pour les apprentissages, 0,36 pour la motivation, 0,25 pour les comportements) ; Nunes et Drèze (2006), effet de progression dotée, *Journal of Consumer Research* ; Kivetz, Urminsky et Zheng (2006), gradient de but ; Deci, Koestner et Ryan (1999), récompenses et motivation intrinsèque.

**Nouvelles clés** (à ajouter à `CLES_SAUVEGARDE`, `FORMES_SAUVEGARDE` et au validateur du lot 1) : `maitrise` (photographies quotidiennes, meilleure maîtrise, grade atteint), `lucidite` (total, points par jour sur 120 jours, plafonds du jour, journal des 50 derniers gains, rattrapage), `distinctions`, `fichesLues`, `objectif`, `profil`, `reglages`.

Terminé quand : un banc `tests/_progression.html`, sur le modèle de `tests/_niveaux.html`, fait jouer des joueurs simulés (faible, moyen, fort) et vérifie la maîtrise de chaque type de jeu, la table des jeux, les domaines, les grades et leurs délais, la photographie quotidienne, le barème des points, les plafonds, les seuils d'étalonnage, chaque distinction, le jour de repos, l'idempotence du rattrapage et le mode sobre ; un visiteur qui a déjà des données retrouve tout, points en plus.

### Lot 5 — Parcours

But : donner un début, un chemin et une fin. Le site est aujourd'hui une boîte à outils.

Nouveau fichier `static/parcours.js`. Un parcours est une suite d'étapes faites de contenus existants. Rien n'est jamais verrouillé : un parcours propose un ordre, il n'interdit rien.

Types d'étapes et validation :
- lire une fiche : le pied de la fiche a été atteint (`fichesLues`) ;
- faire un atelier : une partie terminée (`resultatAtelier(id)` non nul). Certains ateliers n'ont pas de fin nette (bingo, carnet de prévisions, débat à deux) : définis pour chacun l'événement qui vaut « fait » ;
- quiz ciblé : une mini-série de cinq situations tirées des fiches du parcours, réussie à quatre sur cinq. C'est un nouveau mode de quiz.

Une étape déjà faite avant de commencer le parcours est validée d'emblée.

| Parcours | Fiches | Ateliers |
|---|---|---|
| Premiers pas | `biais:confirmation`, `sophismes:homme-de-paille` | `#chiffres/illusion`, `#tests/crt`, puis une première série de quiz |
| Les chiffres qui trompent | `biais:taux-de-base`, `biais:taille-echantillon`, `biais:regression-moyenne`, `biais:survivant`, `biais:simpson`, `sophismes:correlation`, `sophismes:cherry-picking` | `#tests/depistage`, `#chiffres/correlation`, `#chiffres/graphiques`, `#tests/wald`, `#tests/moniteur`, `#tests/fabriquer` |
| Le hasard n'a pas de mémoire | `biais:erreur-du-joueur`, `biais:apophenie`, `biais:illusion-controle`, `biais:conjonction`, `sophismes:tireur-elite`, `sophismes:post-hoc` | `#chiffres/hasard`, `#chiffres/ecrire-hasard`, `#tests/monty-hall`, `#tests/anniversaires`, `#tests/classiques` |
| Savoir ce que l'on sait | `biais:surprecision`, `biais:dunning-kruger`, `biais:retrospectif`, `biais:planification`, `biais:angle-mort` | `#chiffres/vrai-faux`, `#chiffres/intervalles`, `#tests/foule`, `#tests/comprendre`, `#chiffres/carnet` |
| Décider sans se piéger | `biais:ancrage`, `biais:cadrage`, `biais:aversion-perte`, `biais:couts-irrecuperables`, `biais:statu-quo`, `biais:resultat` | `#chiffres/ancre`, `#tests/decision`, `#tests/cecite` |
| Débattre sans tricher | `sophismes:homme-de-paille`, `sophismes:ad-hominem`, `sophismes:faux-dilemme`, `sophismes:pente-glissante`, `sophismes:popularite`, `sophismes:sophisme-sophisme` | `#tests/debat-truque`, `#tests/reparer`, `#tests/reformuler`, `#tests/qui-prouve`, `#tests/pyramide`, `#tests/demonter` |
| Info ou intox | `biais:verite-illusoire`, `biais:confirmation`, `biais:raisonnement-motive`, `biais:disponibilite`, `biais:halo`, `sophismes:hors-contexte`, `sophismes:generalisation-hative`, `sophismes:autorite` | `#tests/laterale`, `#tests/citations`, `#chiffres/monde`, `#tests/etudes` |
| Nous et les autres | `biais:conformisme`, `biais:pensee-groupe`, `biais:attribution`, `biais:endogroupe`, `biais:faux-consensus`, `biais:autorite` | `#tests/plusieurs`, `#tests/debat-a-deux` |

Ces identifiants ont été relevés dans le code ; un banc doit échouer si l'un d'eux n'existe plus. Ordonne les étapes de chaque parcours (alterne lecture et pratique, termine par le quiz ciblé) et rédige pour chacun un titre, une promesse en une phrase et une conclusion.

Interface : une page `#parcours` (tous les parcours, avec leur avancement) et `#parcours/<id>` (les étapes comme un chemin, l'étape suivante mise en avant) ; sur l'accueil, la carte « Votre parcours » avec l'étape suivante, qui devient l'action principale ; un nouveau visiteur est orienté vers « Premiers pas » ; un parcours terminé donne un sceau dans le profil et une conclusion qui renvoie vers la vie courante (« Je l'ai repéré »). La recherche globale (`recherche.js`) indexe les parcours.

Nouvelle clé : `parcours`.

Terminé quand : un banc parcourt chaque parcours de bout en bout avec un joueur simulé ; aucun contenu existant n'est devenu inaccessible.

### Lot 6 — Compte et synchronisation chiffrée

But : retrouver sa progression sur un autre appareil, sans que personne d'autre puisse la lire, pas même le propriétaire du site.

Ce lot est livré derrière un drapeau, comme le Grand test : tant que `SYNCHRO_URL` est vide, rien n'apparaît dans l'interface et le site n'envoie rien à aucune autre origine. Les étapes de mise en service sont au §7.

**Principe.** Pas d'adresse électronique, pas de mot de passe choisi par l'utilisateur. À la création du compte, le site génère un code de synchronisation : 16 caractères en base 32 de Crockford (80 bits tirés de `crypto.getRandomValues`), affichés par groupes de quatre. Ce code est le compte. « Se connecter » sur un autre appareil, c'est le saisir.

Pourquoi ce choix : un secret aléatoire de 80 bits ne se devine pas, ce qui dispense de hachage lent, de politique de mot de passe et de protection contre l'énumération des comptes ; aucune donnée personnelle n'est collectée ; le serveur ne voit que des données chiffrées. Contrepartie assumée : pas de récupération par courriel. Le code reste consultable, après confirmation, sur tout appareil déjà connecté, et le site propose de l'enregistrer dans le gestionnaire de mots de passe et d'imprimer une fiche de secours.

**Côté site (`static/coffre.js`), avec Web Crypto et rien d'autre**
- Du code, dérive par HKDF-SHA-256 (sel fixe `esprit-critique/synchro/v1`) trois valeurs indépendantes : l'identifiant du coffre (16 octets), le jeton d'accès (32 octets), la clé de chiffrement AES-256-GCM, non extractible.
- Le contenu en clair est la progression (les clés de `CLES_SAUVEGARDE`), avec ses horodatages. Il est compressé (`CompressionStream` si disponible), puis chiffré avec un vecteur d'initialisation aléatoire de 12 octets, jamais réutilisé, et l'identifiant du coffre comme donnée associée.
- La clé non extractible et le jeton sont gardés dans IndexedDB. Le code y est gardé aussi, uniquement pour pouvoir être réaffiché : c'est un compromis entre sécurité et récupération, à décrire dans `SECURITE.md`.
- **Fusion, jamais écrasement.** Deux appareils peuvent avoir avancé chacun de leur côté. Enveloppe `ecrire()` pour horodater chaque clé modifiée. Règle par défaut : pour chaque clé, la version la plus récente l'emporte. Règles particulières : union pour les ensembles (`acquis`, `activite`, `fichesLues`, `distinctions`) ; par notion, l'entrée qui compte le plus de réponses pour `memoire` ; maximum pour les records (`records`, `chrono`, records de `resultatsAteliers`) ; fusion à trois (les deux copies et la dernière version synchronisée) pour les compteurs cumulés (`confiance`, `fourchettes`, `certitudes`, `duels`, `lucidite`) ; pour `maitrise`, union des photographies par jour et maximum de la meilleure maîtrise, la valeur actuelle étant recalculée après fusion. Écris ces règles dans une table lisible, une ligne par clé, et un banc qui les éprouve une à une.
- Quand synchroniser : au chargement, quelques secondes après une modification (au plus une fois par minute), quand la page passe en arrière-plan, et sur demande. Hors ligne, la synchronisation attend.
- Tout ce qui revient du serveur est déchiffré, puis passe par le validateur du lot 1. Un contenu qui ne se déchiffre pas ou plus ancien que la dernière version connue est refusé, sans toucher aux données locales.
- Interface, dans le profil : « Synchroniser mes appareils » ; créer un compte ; se connecter avec un code ; état (à jour, en attente, hors ligne, erreur) ; « Afficher mon code » ; « Se déconnecter de cet appareil » ; « Supprimer la copie en ligne ». Un petit indicateur d'état dans l'en-tête.
- La CSP gagne l'origine du serveur dans `connect-src`, et rien d'autre. Le contrôle statique du lot 1 vérifie que `SYNCHRO_URL` et `connect-src` concordent.

**Côté serveur (dossier `serveur/`, non publié) : un Cloudflare Worker et une base D1**
- Table `coffres` : identifiant, empreinte SHA-256 du jeton, contenu chiffré, numéro de version, dates de création et de dernière écriture. Rien d'autre : ni adresse IP, ni pseudonyme.
- Routes : `GET /v1/coffres/:id` (lire), `PUT /v1/coffres/:id` (créer ou remplacer, avec contrôle de version : en cas de conflit, réponse 409, le site fusionne et recommence), `DELETE /v1/coffres/:id` (supprimer). Jeton dans l'en-tête `Authorization`, comparé en temps constant à l'empreinte stockée.
- Garde-fous : identifiant conforme à une expression régulière stricte ; contenu limité à 256 Ko ; CORS limité à `https://esprit-critique.github.io` (et à `http://localhost:8000` en développement) ; limitation des créations par l'API de limitation de débit des Workers, en sachant qu'elle est approximative et locale à chaque centre de données ; plafond du nombre total de coffres ; purge planifiée des coffres inactifs depuis 24 mois ; aucune donnée sensible dans les journaux ; réponses avec `Cache-Control: no-store` et `X-Content-Type-Options: nosniff`.
- Pas de hachage lent côté serveur : l'offre gratuite limite le temps de calcul à 10 ms par requête, et le secret de 80 bits le rend inutile.
- Base créée avec la juridiction européenne (`--jurisdiction=eu`), qui ne peut plus être changée ensuite.
- `serveur/README.md` : les commandes exactes de mise en service, à vérifier dans la documentation de Wrangler au moment d'écrire.
- Tests du serveur en local (`wrangler dev`) : accès sans jeton refusé, mauvais jeton refusé, taille dépassée refusée, conflit de version détecté, origine étrangère refusée.

**Textes à mettre à jour, dans le commit qui active le drapeau et pas avant** (tant que le drapeau est vide, ils restent vrais) : cherche dans tout le dépôt les formulations « aucun compte », « aucune donnée envoyée », « nulle part », « reste dans votre navigateur », « no account », et rends-les exactes : par défaut rien n'est envoyé ; si l'on active la synchronisation, une copie chiffrée est conservée chez un hébergeur. Emplacements repérés : `README.md` (Principes), `static/index.html` et `static/en/index.html` (message `noscript`, article « Vos données », pied de page), l'en-tête de `static/sw.js`, l'introduction du portrait dans `ateliers.js`, les textes du Grand test, et `tests/pages/generer_pages.py` (politique de confidentialité, conditions d'utilisation, leurs descriptions). La politique de confidentialité doit dire : ce qui est envoyé (un contenu chiffré illisible, sa taille, des dates), ce que voit l'hébergeur du serveur (l'adresse IP, comme tout hébergeur), où les données sont conservées, combien de temps, comment les supprimer. Rédige une proposition ; le propriétaire la relit avant activation.

Complète `SECURITE.md` : hypothèses, ce que peut faire un serveur compromis (effacer ou resservir une ancienne copie, mais ni lire ni forger), ce que peut faire un appareil compromis, pourquoi il n'y a pas de récupération.

Terminé quand : drapeau vide, un banc vérifie sur toutes les adresses qu'aucune requête ne part vers une autre origine ; drapeau pointé sur un serveur local, un banc crée un compte dans un navigateur, se connecte dans un second, modifie des deux côtés et vérifie la fusion ; un contenu altéré d'un seul bit est refusé proprement.

### Lot 7 — La cybersécurité comme sujet

But : appliquer l'esprit critique à l'endroit où il sert le plus souvent, les messages qu'on reçoit.

- **Nouvelle section d'ateliers « Se protéger en ligne ».**
- **Atelier « Vrai message ou hameçonnage ? »** Douze messages fictifs (courriels, SMS) sur trois niveaux : faux colis, faux conseiller bancaire, faux proche en détresse, faux support technique, et des messages légitimes qui leur ressemblent. Aucune marque réelle. Même mesure que « Le débat truqué » : détections et fausses alertes, sensibilité d′ (`dPrime()`), parce que crier à l'arnaque partout est aussi une erreur. Après chaque réponse, « Trouver l'indice » (mécanisme d'`indices.js`) : toucher le passage qui trahit le message (expéditeur, urgence, lien dont le domaine ne correspond pas, demande inhabituelle). Chaque message est relié au levier qu'il exploite et à sa fiche : `biais:autorite`, `biais:aversion-perte`, `biais:conformisme`, `sophismes:ad-baculum`, `sophismes:emotion`.
- **Atelier « Lequel résiste le plus longtemps ? »** Des paires de mots de passe inventés ; il faut désigner le plus solide, puis l'explication fait le calcul (taille de l'alphabet, longueur, nombre de mots) avec une hypothèse d'attaque explicite. Relie-le aux ordres de grandeur et au code de 80 bits du lot 6. Repère de la CNIL, vérifié sur son site : sans autre mesure, viser 80 bits, soit par exemple 12 caractères de quatre types, 14 caractères de trois types ou une phrase de sept mots.
- **Parcours « Ne pas se faire avoir en ligne »** : les cinq fiches ci-dessus, `#tests/laterale`, les deux nouveaux ateliers.
- **Article du guide « La sécurité de ce site »** : ce qui est protégé et comment, ce qui ne l'est pas, en langage courant, à partir de `SECURITE.md`.
- Sources à vérifier sur les sites officiels (CNIL, ANSSI, cybermalveillance.gouv.fr). Ce qui n'est pas vérifié n'est pas affiché.

Terminé quand : les deux ateliers ont trois niveaux, leurs bancs, leurs sources, leur traduction ; le parcours fonctionne.

### Lot 8 — Finitions

- Un accueil du nouveau visiteur en trois écrans au plus, qu'on peut passer : l'illusion, le choix de l'objectif du jour, le premier pas.
- **Carte à partager.** Sur une fiche, « Partager cette carte » produit une image (canvas vers PNG, format portrait) avec l'indice, le nom, la définition et l'adresse du site ; partage par `navigator.share` quand il accepte les fichiers, sinon téléchargement. Même chose pour le profil : « Partager mon grade » produit une image avec l'insigne, la maîtrise et la toile des domaines. Rien n'est envoyé à un serveur.
- **Raccourcis clavier.** La touche `?` affiche la liste des raccourcis existants (1 à 4, 7 à 9, Entrée, →) et nouveaux (`R`, espace).
- **Installation.** Quand le navigateur le permet, un bouton discret « Installer l'application » dans le profil.
- Relecture d'ensemble de chaque écran aux deux largeurs et dans les deux thèmes ; cohérence des mouvements ; aucun texte coupé.
- Contrôle d'accessibilité complet au clavier et avec un lecteur d'écran sur les parcours principaux.
- Mesure du poids et du temps d'affichage, comparée à l'état des lieux du lot 0.
- `README.md` et `DESIGN.md` à jour ; images d'aperçu régénérées ; version anglaise complète ; `tests/a-verifier.md` à jour avec tout ce que le propriétaire doit relire.
- Dans le journal : la liste de ce qui a été fait, de ce qui a été écarté et pourquoi, et de ce qui reste.

---

## 6. Définition de « terminé », pour chaque lot

- Tous les bancs passent, anciens et nouveaux, sous Linux et dans l'intégration continue.
- Aucune violation de la politique de sécurité, aucune erreur JavaScript, sur toutes les adresses, dans les deux langues.
- Aucune donnée existante perdue : le banc de reprise des anciennes données passe.
- Version anglaise complète.
- `sw.js` à jour (liste des fichiers, numéro de cache).
- Documentation à jour (`README.md`, `DESIGN.md`, `CLAUDE.md`, journal).
- Captures jointes à la pull request.

---

## 7. Étapes manuelles du propriétaire

Tu ne peux pas les faire. Prépare tout ce qui les précède, écris la marche à suivre exacte, puis continue sur ce qui n'en dépend pas.

1. **Réglages GitHub** (après le lot 1) : protection de la branche `main` avec le contrôle « vérifier » obligatoire ; signalement privé des vulnérabilités ; analyse des secrets avec blocage à l'envoi ; alertes Dependabot ; authentification à deux facteurs sur le compte propriétaire.
2. **Serveur de synchronisation** (lot 6) : créer un compte Cloudflare gratuit, puis suivre `serveur/README.md` (connexion de Wrangler, création de la base avec la juridiction européenne, application du schéma, déploiement). Reporter l'adresse obtenue dans `SYNCHRO_URL` et dans `connect-src`.
3. **Relectures** avant affichage : la politique de confidentialité et les conditions d'utilisation proposées au lot 6 ; les contenus nouveaux listés dans `tests/a-verifier.md` (illusions, article sur la motivation, ateliers de cybersécurité).

---

## 8. Sources des faits techniques cités

- Trusted Types, navigateurs pris en charge (Chrome et Edge 83, Firefox 148, Safari 26) : https://web.dev/articles/trusted-types
- Directives ignorées dans une CSP livrée par balise meta (`frame-ancestors`, `report-uri`, `sandbox`) : https://content-security-policy.com/examples/meta
- `actions/upload-pages-artifact` : fichiers cachés exclus depuis la v4.0.0, entrée `include-hidden-files` depuis la v5.0.0 : https://github.com/actions/upload-pages-artifact/releases
- Transitions de vue dans un même document, disponibles dans les trois moteurs depuis le 14 octobre 2025 : https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- Offre gratuite de Cloudflare Workers (100 000 requêtes par jour, 10 ms de calcul par requête ; D1 : 5 millions de lignes lues et 100 000 écrites par jour, 5 Go) : https://developers.cloudflare.com/workers/platform/pricing/
- Juridiction d'une base D1 (`--jurisdiction=eu`, non modifiable après création) : https://developers.cloudflare.com/d1/configuration/data-location/
- Limitation de débit des Workers (périodes de 10 ou 60 secondes, comptage approximatif par centre de données) : https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Recommandation de la CNIL sur les mots de passe : https://cnil.fr/fr/mots-de-passe-recommandations-pour-maitriser-sa-securite
- Méta-analyse de Sailer et Homner (2020) : https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/109056

---

## 9. Première action

Lis les fichiers du §4, écris `CLAUDE.md`, `tests/refonte-plan.md` et `tests/refonte-journal.md`, puis fais le lot 0 jusqu'à sa pull request. Enchaîne ensuite les lots dans l'ordre, sans attendre de validation.
