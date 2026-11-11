# Modèle de menace d'Esprit critique

Ce document dit ce que le site protège, contre qui, par quelles mesures, et quels risques sont acceptés. Il est tenu à
jour à chaque changement qui touche à la sécurité (la synchronisation, au lot 6 de la refonte, le complétera).
Signalement d'une faille : [SECURITY.md](SECURITY.md).

## Ce qu'il y a à protéger

| Bien | Où il se trouve | Pourquoi il compte |
|---|---|---|
| La progression du visiteur (réponses, révisions, résultats, prévisions, décisions et repérages notés) | `localStorage` de son navigateur, et les fichiers de sauvegarde qu'il exporte | Elle peut contenir des notes personnelles en texte libre ; la perdre décourage |
| L'intégrité du site publié | dépôt GitHub, GitHub Pages | Un site modifié pourrait tromper ou piéger des visiteurs qui lui font confiance |
| La justesse des contenus | `static/donnees.js` et les autres fichiers de contenu | Un chiffre faux ruinerait la crédibilité d'un site d'esprit critique |

Aucune donnée n'est envoyée à un serveur : il n'existe ni compte, ni base de données, ni mesure d'audience. GitHub,
qui héberge le site, voit les adresses IP des visiteurs comme tout hébergeur (politique de confidentialité du site).

## Contre qui

1. **Un contenu piégé** qui arrive dans la page : un fichier de sauvegarde fabriqué et importé par le visiteur, une
   adresse forgée après le `#` (lien reçu), un texte libre saisi puis réaffiché.
2. **Un autre site** qui afficherait celui-ci dans un cadre invisible pour faire cliquer à l'insu du visiteur
   (« clickjacking »), ou qui recevrait l'adresse de la page consultée par l'en-tête Referer.
3. **Une compromission de la chaîne de publication** : action GitHub modifiée, dépendance piégée, envoi sur `main`
   d'une modification qui casse le site ou y introduit une faille.
4. **Une erreur de développement** qui rouvrirait l'une de ces portes (le site est modifié souvent, en partie par
   un agent de programmation).

Hors de portée : un appareil déjà compromis (logiciel espion, extension malveillante du navigateur), une
compromission de GitHub lui-même, une personne ayant un accès physique au navigateur déverrouillé.

## Mesures

### Dans la page

- **Aucun HTML inséré.** Le DOM est construit élément par élément (`el()`, `lienVers()`, `svg()`, `textContent`) ; les
  dessins fixes écrits en SVG sont recréés par `dessinerSvg()` (`ateliers.js`). Un texte venu de l'extérieur ne peut
  donc jamais devenir du code.
- **Trusted Types** (`require-trusted-types-for 'script'`) : le navigateur refuse toute affectation de HTML ou d'adresse
  de script qui ne passe pas par une règle déclarée. La seule règle permise, `esprit-critique`, n'accepte qu'une
  adresse : celle du service worker. Navigateurs : Chrome et Edge 83, Firefox 148, Safari 26 ; les autres ignorent la
  directive, et la première mesure reste vraie pour eux.
- **Politique de sécurité du contenu** (CSP, en balise `meta` car GitHub Pages ne permet pas les en-têtes) : seuls les
  fichiers du site se chargent ; aucun script en ligne sauf celui du thème, autorisé par son empreinte ; ni style ni
  gestionnaire d'événement en ligne ; `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`.
- **Aucun référent transmis** (`<meta name="referrer" content="no-referrer">`) aux sites vers lesquels pointent les
  sources.
- **Pas d'affichage dans le cadre d'un autre site** : `refuserEncadrement()`, au début de `app.js`, remplace l'en-tête
  `frame-ancestors`, ignoré dans une CSP livrée par balise `meta`.
- **Sauvegardes validées en profondeur** (`sauvegarde.js`) : un schéma par clé (structure, bornes des nombres, longueur
  des textes et des listes, identifiants de fiches et d'ateliers existants), noms `__proto__`, `constructor` et
  `prototype` refusés ; un élément invalide est écarté seul. Appliqué à l'import d'un fichier et à la restauration d'une
  sauvegarde automatique. Un fichier de plus de 5 Mo est refusé avant lecture.
- **Adresses tolérées** : toute adresse après le `#` mène à une page, au pire à la page « introuvable ».
- **Écriture qui échoue** (stockage plein ou bloqué) : le visiteur est prévenu une fois par visite, et invité à
  exporter sa progression.

### Dans le dépôt

- **Contrôles obligatoires avant publication** (`.github/workflows/verifier.yml`, appelé par `publier.yml`) : syntaxe,
  noms globaux, version anglaise, contrôle statique de sécurité, bancs dans Chrome, banc à données aléatoires
  (1 000 sauvegardes déformées et 1 000 adresses aléatoires).
- **Contrôle statique** (`tests/securite.py`) : échoue si le code insère du HTML, exécute du texte, pose un
  gestionnaire ou un style par `setAttribute`, emploie `javascript:`, charge une ressource d'une autre origine, ouvre
  un nouvel onglet sans `noopener` ; si une empreinte de CSP ne correspond plus à son script, si les CSP des pages
  diffèrent, si un fichier publié manque à la liste du service worker, ou si `security.txt` expire dans moins de 30 jours.
- **Actions GitHub désignées par l'empreinte de leur commit**, permissions minimales par tâche, jeton non conservé
  dans la copie du dépôt ; Dependabot propose les mises à jour ; CodeQL analyse le JavaScript.
- **Aucune dépendance publiée** : le site n'a ni bibliothèque, ni CDN, ni étape de compilation. Playwright, outil de
  test seulement, est figé à une version précise et n'est jamais publié.
- Réglages du dépôt à faire par le propriétaire (brief, §7) : protection de `main` avec le contrôle « Vérifier »
  obligatoire, signalement privé des failles, analyse des secrets avec blocage à l'envoi, alertes Dependabot,
  authentification à deux facteurs.

## Risques acceptés

- **`localStorage` est lisible par tout script de la même origine.** Le site n'en charge aucun autre que les siens ;
  une extension du navigateur, elle, peut tout lire. La progression n'est pas chiffrée sur l'appareil.
- **Navigateurs sans Trusted Types** : la protection repose alors sur la construction du DOM sans HTML et sur la CSP.
- **Un fichier de sauvegarde exporté est en clair** : il contient les notes saisies ; le visiteur en a la garde.
- **Les champs non décrits d'une sauvegarde sont gardés**, bornés (profondeur, tailles, types JSON simples), pour ne
  rien perdre d'une donnée légitime ; le code qui les lit doit rester prudent (le banc à données aléatoires le vérifie).
- **Pas de rapport de violation de la CSP** : `report-uri` est ignoré en balise `meta`, et le site n'a pas de serveur.
