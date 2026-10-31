# Le Grand test — plan de travail

Plan de référence de la mission « Grand test » : modèle de données, signatures de calcul, graines, quotas,
liens vers le site existant et matrice des bancs. Le journal d'exécution est dans
[grand-test-journal.md](grand-test-journal.md) ; les points à relire par une personne dans
[grand-test-a-relire.md](grand-test-a-relire.md).

**Deux drapeaux restent à `false` pendant tout le travail et dans la version publiée** :
`GRAND_TEST_VISIBLE` et `PERSONNAGES_VISIBLES`. Aucune carte, aucun lien, aucun bloc de portrait, aucun
personnage ne doit apparaître sur le site publié.

## 1. Ce que le dépôt contient déjà (audit du lot 0)

### Fichiers du site

`static/` : `index.html`, `style.css`, `manifest.webmanifest`, `sw.js`, puis les scripts, chargés dans cet
ordre par `index.html` (données d'abord, moteur ensuite, `app.js` en dernier) :

    donnees.js  schemas.js  pays.js  jeux-donnees.js  ateliers.js  niveaux.js  experiences.js
    chiffres.js  perception.js  debattre.js  raisonner.js  pratiques.js  indices.js  app.js

`app.js` est chargé en dernier mais définit les outils de base (`el`, `lire`, `ecrire`…) : les autres fichiers
ne s'en servent qu'au moment de l'appel, jamais au chargement. **Tout nouveau fichier du Grand test doit donc
lui aussi n'appeler aucun outil d'`app.js` à son chargement**, et se placer avant `app.js`
(`grand-test-donnees.js` puis `grand-test.js`, après `indices.js`).

Pages fixes : `mentions-legales.html`, `confidentialite.html`, `cgu.html`, `404.html`,
`google94b657f6d0442a2f.html` (vérification Search Console, à ne jamais supprimer), `robots.txt`,
`sitemap.xml`, `polices/`.

### Bancs d'essai

| Script | Rôle |
|---|---|
| `tests/lancer.sh` | Lance tout : contrôle de syntaxe (JXA) de `tests/_*.html` et de `static/*.js`, puis les six bancs dans quatre configurations (390/1280 px × clair/sombre) |
| `tests/chrome.py` | Ouvre une page de banc dans Chrome sans fenêtre, lit son rapport dans la console |
| `tests/csp.py` | Ouvre la **vraie** page (avec sa CSP) sur 18 adresses, relève blocages et erreurs |
| `tests/_affichage.html` | Banc « affichage » : 108 pages, défauts de mise en page, erreurs JavaScript |
| `tests/_ateliers.html` | Banc « ateliers » : 236 vérifications, parcours des 45 ateliers |
| `tests/_test.html` | Banc « test » : 131 vérifications (fiches, quiz, révisions, navigation, sauvegarde) |
| `tests/_niveaux.html` | Banc « niveaux » : 24 vérifications |
| `tests/niveaux.html` | Banc « items » : décompte des items par niveau |
| `tests/controle-affichage.js` | Contrôles communs : `a11y-sans-nom`, `id-double`, `contraste-faible`, `image-sans-texte` |
| `tests/_visu.html` | Scénarios de capture d'écran |
| `tests/safari.sh` | Contrôle du site dans Safari (AppleScript) |

Les bancs chargent `static/_site.html`, copie d'`index.html` sans la balise CSP (ils se servent d'`eval`).
`lancer.sh` les copie dans `static/` le temps du test, puis les enlève. **Le banc du Grand test suivra la
même convention** : `tests/_grand-test.html`, ajouté à `COPIES` et à la liste des bancs de `lancer.sh`.

### Outils réutilisables, signatures vérifiées

| Outil | Fichier | Signature réelle |
|---|---|---|
| `el(balise, classe, texte)` | app.js | `textContent` typographié ; aucun HTML |
| `texteNoeud(texte)` | app.js | nœud de texte typographié |
| `lienVers(adresse, texte, classe)` | app.js | `<a href>` |
| `typo(texte)` | app.js | espaces fines insécables |
| `melanger(tableau, alea = Math.random)` | app.js | Fisher-Yates, aléa injectable |
| `generateur(graine)` | app.js | mulberry32, reproductible |
| `aujourdHui()` | app.js | jours depuis 1970, heure locale |
| `lire(cle, defaut)` / `ecrire(cle, valeur)` / `effacer(cle)` | app.js | `localStorage` protégé par `try` |
| `CLES_SAUVEGARDE`, `FORMES_SAUVEGARDE`, `formeDe`, `formeValide` | app.js | export/import et validation |
| `cleFiche(type, fiche)`, `trouverFiche(type, id)`, `INDEX`, `TYPES` | app.js | index des 90 fiches |
| `svg(balise, attributs)`, `texteSvg(x, y, contenu, attributs)` | ateliers.js | SVG sans style en ligne |
| `derouler(zone, elements, afficher, bilan, libelle)` | ateliers.js | série de questions |
| `entete(zone, numero, total, libelle, niveau)` | ateliers.js | « Question 3 / 10 » et jauge |
| `boutonChoix(texte, k)`, `boutonSuivant(texte, action)`, `montrer(retour)` | ateliers.js | boutons de réponse |
| `ajouterExplication(zone, titre, paragraphes, liens)` | ateliers.js | bloc d'explication |
| `calculEnDetail(lignes, titre)` | ateliers.js | bloc repliable ; `=` en tête = formule |
| `paragraphe(texte, classe)` | ateliers.js | `<p>` |
| `fichierAgenda(nomFichier, evenements)` | ateliers.js | fichier `.ics` local, RFC 5545 |
| `tirerNouveaux(cle, elements, n, idDe)` | ateliers.js | tirage qui évite le déjà-vu (clé `vus`) |
| `ATELIERS_DES_FICHES`, `ateliersDeLaFiche(cle)`, `tousLesAteliers()` | ateliers.js | liens fiche → atelier |
| `fr(n)`, `lireNombre(texte)` | ateliers.js | nombres à la française |
| `NIVEAUX_CONFIANCE = [50, 70, 90, 99]` | ateliers.js | niveaux de certitude du site |
| `courbeEtalonnage(cumul, partie)` | chiffres.js | **axe de 50 à 100 %** : voir §4.4 |
| `scoreFourchette(q, bas, haut, alpha)`, `echelleFourchette(q)`, `estAnnee(q)` | chiffres.js | score d'intervalle (Gneiting et Raftery) |
| `ligneIntervalle(q, bas, haut, ok)` | chiffres.js | une fourchette dessinée |
| `pointsConfiance(niveau, juste)` | chiffres.js | barème logarithmique du site |
| `phiInverse(p)` | debattre.js | Φ⁻¹, approximation d'Acklam |
| `dPrime(detections, sophismes, faussesAlertes, recevables)` | debattre.js | d′ avec correction de ½ |
| `echelleNeuf(surChoix)` | pratiques.js | échelle d'accord de 1 à 9 |
| `echelleSept(gauche, droite, surChoix)` | raisonner.js | échelle de 1 à 7 |
| `grapheBarres`, `grapheCourbe` | perception.js | graphiques SVG du site |
| `niveauAtelier(id)`, `tirerSelonNiveau(...)`, `noterPartieEntiere(...)` | niveaux.js | niveaux 1–3 des ateliers |

### Banques de contenu existantes, à ne pas dupliquer

`VRAI_FAUX` (97 items), `MONDE`, `CAUSES`, `ETALONNAGE`, `ANCRES`, `EVENEMENTS`, `PAIRES_CELEBRES`,
`GRANDEURS`, `FERMI`, `VILLES`, `PAIRES_VILLES`, `CITATIONS` (jeux-donnees.js) ; `QUESTIONS_CRT`,
`WASON_ABSTRAITES`, `WASON_CONCRETES`, `REGLES_246`, `PROBLEMES`, `SCENARIOS_DEPISTAGE`,
`EXPERIENCES_PENSEE` (experiences.js) ; `SYLLOGISMES`, `SUJETS_ETUDES`, `PROBLEMES_GROUPE`,
`MODELES_PREVISION` (raisonner.js) ; `DEBATS`, `REPARATIONS`, `REFORMULATIONS`, `SUJETS_DEBAT`,
`PREMISSES`, `CARTES_CONTRAINTE` (debattre.js) ; `AFFIRMATIONS_CECITE`, `QUI_PROUVE`, `PYRAMIDES`,
`VERIFICATIONS_DECISION`, `MECANISMES`, `ARGUMENTS_A_DEMONTER`, `SITES_FICTIFS` (pratiques.js) ;
`PAYS` (pays.js) ; les 90 fiches de `donnees.js`.

### Écarts entre le mandat et le dépôt

1. **Les titres du répertoire des ateliers du mandat ne sont pas ceux du code.** Le code fait foi. Titres
   réels : `vrai-faux` « Vrai ou faux ? », `ancre` « L'ancre », `regle-246` « Trouver la règle »,
   `monty-hall` « Le problème de Monty Hall », `classiques` « Problèmes classiques », `anniversaires`
   « Le paradoxe des anniversaires », `plusieurs` « Résoudre à plusieurs », `qui-prouve` « Qui doit
   prouver ? », `pyramide` « La pyramide du désaccord », `demonter` « Démonter un argument »,
   `debat-truque` « Le débat truqué », `reparer` « Réparer l'argument », `reformuler` « Reformuler sans
   trahir », `debat-a-deux` « Le débat à deux », `monde` « Le monde en chiffres », `mortalite` « Qu'est-ce
   qui tue le plus ? », `pays` « Plus ou moins ? », `points` « Combien de points ? », `intervalles`
   « Êtes-vous sûr à 90 % ? », `hasard` « Le vrai hasard », `laterale` « Lecture latérale ».
2. **L'identifiant de la section « débattre » est `debattre`**, sans accent (inséré par `debattre.js`).
3. **Il n'existe pas d'atelier `mémoire`** (le mandat le cite en §7.2 comme existant). La mémoire est donc
   un vrai manque, traité au lot 8.
4. **45 ateliers et 90 fiches confirmés** (B 1–51, S 1–39), conformes au mandat.
5. `courbeEtalonnage()` dessine un axe **de 50 à 100 %** : un niveau « au hasard (25 %) » en sortirait.
   Voir la décision en §4.4.

## 2. Modèle de données

Une seule clé : `localStorage["grandTest"]`, déclarée dans `CLES_SAUVEGARDE` et dans
`FORMES_SAUVEGARDE.objet`. Schéma intégral (§10.3 du mandat) :

```js
{
  versionSchema: 2,
  versionBanque: "grand-test-2026-10",
  historiqueTests: [{
    id, mode: "express" | "complet", graine,
    dateDebut, dateFin,
    progression: { etape, item, reprise },
    instances: [{ instanceId, itemId, famille, valeurs, dejaVu, compteurTestsAvant }],
    reponses: [{ itemId, valeur, certitude, debut, valideeLe, dureeMs }],
    scores: { A: { valeur, plage, n }, …, F: { valeur, plage, n, statut: "exploratoire" } },
    estimationsEtape: {}, ideesFaussesCorrigees: [], entitesAffaiblies: [],
    niveau: { id, statut, calculeLe }, rappels: { j7, j30 }, issues: []
  }],
  historiqueItemsVus: [{ instanceId, itemId, famille, runId, date, compteurTests }],
  rappelsEnAttente: [],
  preferences: { cartesSensibilisation: true }
}
```

`plage` vaut `{ bas, haut, niveau: 0.8, methode }` ou `null`. Aucun score ni plage par défaut pour un axe
trop peu mesuré. Les réponses brutes sont conservées pour recalculer si les formules changent. Aucune donnée
personnelle, aucun identifiant entre sessions.

Les **instances** d'items ne sont pas gardées en clair dans la clé : seules les valeurs tirées et la graine
le sont, pour que le texte puisse être reconstruit par la même fonction pure.

## 3. Noms de fichiers

| Fichier | Contenu |
|---|---|
| `static/grand-test-donnees.js` | banques et familles (données seulement, aucun appel) |
| `static/grand-test.js` | moteur : calculs purs, tirage, stockage, interface, graphiques |
| `tests/_grand-test.html` | banc du Grand test (parcours, calculs, tirage, stockage, graphiques) |

Chacun est ajouté à `FICHIERS` de `sw.js`, avec le numéro de cache augmenté.

## 4. Signatures de calcul (section « Calculs » de `grand-test.js`, fonctions pures, sans DOM)

### 4.1 Proportion et plage

    wilson(k, n, z = 1.2816) → { p, bas, haut }

Wilson avec correction de continuité. `n = 0` → `{ p: null, bas: null, haut: null }`.
Contrôles : `k=8,n=16` → [0,319 ; 0,681] ; `k=16,n=16` → [0,856 ; 1] ; `k=9,n=10` → [0,658 ; 0,990],
à 10⁻³.

    interpretation(plage, hasard, n) → "trop peu d'items" | "au niveau du hasard"
                                     | "nettement au-dessus du hasard" | "presque sans faute"

« Presque sans faute » seulement si `bas > 0,75` et `n ≥ 8`.

### 4.2 Rééchantillonnage

    reechantillonner(donnees, statistique, tirages, alea) → { bas, haut, tirages }

Percentiles 10 et 90. `tirages` validé (entier, de 200 à 5 000). `alea` vient de `generateur(graine)` ;
la graine est dérivée des réponses, donc déterministe.

### 4.3 Détection du signal

    detectionSignal(vraisJugesVrais, nVrais, fauxJugesVrais, nFaux) → { d, c, h, f }

Correction de ½ : `H = (vraisJugesVrais + 0,5) / (nVrais + 1)`. Réutilise `phiInverse()` de `debattre.js`.
`c = -(z(H) + z(F)) / 2`. Avec 12 vrais et 12 faux : bornes ±3,54 ; « toujours vrai » → `d = 0`,
`c = -1,77`. Plages : rééchantillonnage séparé des vrais et des faux, 2 000 tirages.

### 4.4 Étalonnage

    brier(reponses) → { score, surconfiance, parNiveau }
    murphy(reponses) → { fiabilite, resolution, incertitude, somme }

Identité `fiabilite − resolution + incertitude = score` vérifiée à 10⁻⁹. Les niveaux de certitude sont les
classes de binning (pas de regroupement automatique).

**Décision sur `courbeEtalonnage()`** : sa signature `(cumul, partie)` attend un objet
`{ niveau: [n, justes] }` sur les niveaux `NIVEAUX_CONFIANCE = [50, 70, 90, 99]`, et son axe horizontal va
de 50 à 100 %. Les QCM du Grand test ajoutent un niveau « au hasard (25 %) », hors de cet axe.
→ **On réutilise `courbeEtalonnage()` sans la modifier** pour les niveaux 50 à 99, et le niveau 25 % est
restitué à part, en texte et dans le tableau équivalent. Aucune modification d'une fonction partagée.

Le barème logarithmique `pointsConfiance()` du site est conservé **pour la seule étape vrai-faux**, afin que
les scores restent comparables à ceux de l'atelier « Vrai ou faux ? ».

### 4.5 Fourchettes

`scoreFourchette(q, bas, haut, alpha)` est réutilisé tel quel, α = 0,1 ; `echelleFourchette()` mesure en
log₁₀, sauf les années (en siècles). Couverture observée affichée en `k/n`.

### 4.6 Impartialité (axe F, exploratoire)

    indiceCamp(reponses) → { indice, n } | { indice: null, raison: "aucune position choisie" }
    sensibiliteQualite(reponses) → moyenne(solides) − moyenne(faibles)
    biaisCroyance(reponses) → taux("valide" | conclusion crédible) − taux("valide" | non crédible)

### 4.7 Comparaisons

    comparer(a, b) → { difference, plage, verdict }

`verdict` vaut « progrès net », « recul net » ou « pas de changement net mesurable » ; les deux premiers
seulement si la plage de la différence exclut zéro. Un express ne se compare jamais à un complet.

## 5. Graines et reproductibilité

Une graine par exécution, enregistrée dans `grandTest`. Elle sert au tirage, au rendu des instances et aux
diagnostics ; jamais de sécurité. Même graine → mêmes instances, même ordre, mêmes scores. Les graines des
rééchantillonnages sont dérivées des réponses, pour que le même profil donne les mêmes plages.

## 6. Quotas de composition

| Étape | Complet | Express |
|---|---|---|
| 0. Avant de commencer | 4 descriptions d'angle mort, 8 affirmations d'exposition | idem, sans rappel différé |
| 1. Ce que vous croyez savoir | 24 vrai-faux (12 vrais, 12 faux) | 8 |
| 2. Raisonner | 8 réponses construites + 8 raisonnements (2 par case validité × crédibilité) | 4 |
| 3. Chiffres et hasard | 10 QCM + 6 fourchettes | 4 QCM + 3 fourchettes |
| 4. Peser les preuves | 10 QCM + 2 questions à 4 arguments | 4 QCM |
| 5. Retour et mémoire | 16 expositions (8 vues, 8 nouvelles) + rappel des estimations | démonstration seule |

Réservoirs minimaux : 140 vrai-faux (70/70), 100 affirmations d'exposition anodines, 80 grandeurs,
10 questions de société (4 arguments chacune), 12 descriptions d'angle mort, 40 cartes de sensibilisation,
au moins 12 familles de pièges avancés × 20 instances.

## 7. Anti-répétition

Une famille au plus une fois par test. Une instance déjà vue ne revient pas avant trois tests terminés
distincts ; les trois exécutions récentes sont conservées. Réservoir de strate épuisé → la plus ancienne
instance revient, marquée réutilisée. Le profil affiche le nombre et la part d'items déjà vus.

## 8. Matrice des bancs

| N° | Banc | Vérifie |
|---|---|---|
| 1 | Intégrité des items | schéma, identifiants uniques, sources ouvertes, `aRelire`, fiches et ateliers réels, non-reprise (Jaccard trigrammes contre les banques du site) |
| 2 | Générateurs | ≥ 20 instances par famille, résolution par oracle indépendant, réponse unique, distracteurs distincts, bornes, unités |
| 3 | Tirage | 20 tests consécutifs × plusieurs graines, pas de répétition avant trois tests, une instance par famille, quotas, épuisement marqué |
| 4 | Répondants simulés | parfait, toujours faux, toujours « vrai », hasard (500 simulations), certitude 99 % / 60 % juste, non-réponse |
| 5 | Stockage | reprise à chaque frontière, import/export, migration, clé absente, JSON invalide, quota, effacement isolé |
| 6 | Graphiques | 0/1/3/20 tests × clair/sombre × 390/1280 px, états dégénérés, alternative textuelle |
| 7 | CSP et sécurité | banc `csp` réel, aucun style ni script en ligne, aucune requête réseau |
| 8 | Service worker | cache versionné, installation, hors ligne, aucune donnée utilisateur en cache |
| 9 | Régression | la suite existante (affichage, ateliers, test, niveaux, items, csp) reste au vert |
| 10 | Accessibilité | clavier, noms accessibles, focus, contraste, 390 px, quatre configurations |
| 11 | Publication | les deux drapeaux valent `false` ; aucun lien, carte ni personnage exposé |

## 9. Ordonnancement

Lots 0 à 12 de la section 15 du mandat, dans l'ordre. Chaque lot : bancs, commit en français, push, journal,
puis le lot suivant sans attendre.
