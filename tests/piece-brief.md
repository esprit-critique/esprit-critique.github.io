# Brief pour Claude Code — « La pièce du jour »

Tu travailles sur le dépôt `esprit-critique/esprit-critique.github.io` : un site statique en français (et en anglais sous `/en/`) sur les biais cognitifs et les sophismes, publié sur GitHub Pages depuis `static/`.

Ce brief a été écrit après lecture du dépôt au commit `f6a618c` (13 novembre 2026). Si un détail contredit le code, le code fait foi : applique le code et note l'écart dans le journal (§ 8).

---

## 1. But

**Constat, mesuré sur le code.** `questionsDuDefi()` (`static/app.js`) tire chaque jour 10 questions, sans mémoire d'un jour à l'autre, dans un stock de 155 (40 + 68 + 32 + 15). Simulé avec `generateur()` à partir du 14 novembre 2026 : 5 questions sur 10 déjà vues au 7e jour, 7,4 en moyenne du 15e au 30e. Le défi interroge la culture générale et ne demande pas la certitude.

**Ce qu'on construit.** « La pièce du jour » remplace la carte « Défi du jour » de l'accueil. Chaque jour, un **document fictif généré** (brève de presse, publicité, communiqué d'étude, sondage…), le même pour tous les visiteurs d'un même niveau. Le visiteur l'expertise :

1. **Repérer** : toucher les zones qui trompent, ou déclarer « Rien à signaler » ;
2. **Nommer** : dire quel procédé est à l'œuvre ;
3. **Chiffrer** (niveaux 3 à 5) : répondre à une question de lecture chiffrée ;
4. **Conclure** (niveaux 3 à 5) : la conclusion de la pièce est-elle établie, non établie, ou contredite par la pièce elle-même ?

Puis le site rend sa **contre-expertise** : la pièce annotée comme une copie corrigée, et la **pièce rectifiée**, version honnête du même document.

**Quatre exigences, par ordre de priorité.**

1. **Exactitude.** Aucune pièce ambiguë : un piège est décidable à partir de ce que la page montre, une zone saine est saine sans discussion. C'est vérifié par un banc, pas par relecture.
2. **Profondeur.** Cinq niveaux réellement différents (§ 4.7), un catalogue d'au moins 24 procédés, des pièces saines et des leurres pour mesurer les fausses alertes.
3. **Qualité graphique**, du jeu comme de la correction (§ 6). La correction est le moment le plus soigné du parcours.
4. **Cohérence.** Mêmes règles, mêmes briques, même charte que le reste du site (`CLAUDE.md`, `DESIGN.md`). Rien qui ressemble à un module rapporté.

Contrainte de fond, inchangée : ce site apprend à ne pas se laisser manipuler, il ne manipule donc pas. La retenue (ne pas crier au piège) est récompensée autant que la détection.

---

## 2. Décisions déjà prises

Ne les rediscute pas ; applique-les. Si l'une se révèle impraticable, choisis la variante la plus proche et note-la dans le journal.

- **D1 — Remplacement.** La carte « Défi du jour » de l'accueil laisse la place à « La pièce du jour ». Le quiz de dix questions reste disponible tel quel en « Défi libre » (`#defi/<graine>`, `static/tirage.js`). La clé `defiJour` n'est ni supprimée ni modifiée.
- **D2 — Drapeau.** Tout est derrière `const PIECE_VISIBLE = false;` et `RELECTURE_PIECE = { relu: false }`, sur le modèle de `GRAND_TEST_VISIBLE` (`static/grand-test.js`) et `RELECTURE_GT`. Drapeau à `false` : l'accueil garde le défi actuel, aucune carte, aucun lien, aucune route n'expose la pièce. Les bancs tournent sur une copie d'essai drapeau à `true`, comme `tests/lancer.sh` le fait pour le Grand test. Le propriétaire bascule le drapeau après relecture (§ 12).
- **D3 — Fictif et étiqueté.** Chaque pièce affiche « Document fictif » dans son étiquette, y compris sur l'image à partager. Aucun nom réel : ni personne, ni marque, ni média, ni parti, ni commune, ni plateforme ; aucune imitation de l'interface d'un service existant. Sujets exclus : politique partisane, religion, maladies et traitements, origines, criminalité.
- **D4 — Niveaux.** Cinq niveaux, avec les noms de `NOMS_NIVEAUX` (découverte, confirmé, expert, maître, virtuose) et le moteur de `static/niveaux.js` (`NIVEAUX_MAX.piece = 5`, mode auto ou choisi, `choixNiveau()`).
- **D5 — Une pièce par jour et par niveau.** La graine dépend du jour, du niveau et de `PIECE_VERSION`. Une seule tentative par jour, tous niveaux confondus ; le niveau est figé à l'ouverture de la pièce.
- **D6 — Vérité d'abord** (§ 4.1). Aucune correction n'est écrite à la main pour une pièce donnée : elle est calculée.
- **D7 — Français et anglais dans chaque lot** (`python3 tests/en/controle.py` doit passer).
- **D8 — Aucun serveur, aucune dépendance, aucune ressource extérieure.** Toutes les règles de `CLAUDE.md` s'appliquent.
- **D9 — Rattachement.** Identifiant d'atelier `piece`, section « Débattre », domaine de maîtrise `debattre`.
- **D10 — Git.** Un lot = une branche = une pull request ; commits et push sans demander ; fusion dans `main` quand l'intégration continue passe.

---

## 3. Vocabulaire

À tenir partout : interface, code, commentaires, documents.

| Terme | Sens |
|---|---|
| **pièce** | le document fictif à expertiser |
| **dossier** | deux pièces liées, au niveau 5 |
| **monde** | l'univers fictif d'où viennent les données (une ligne de bus, un lycée…) |
| **format** | le genre du document (brève, publicité…) |
| **zone** | une partie touchable de la pièce (titre, axe du graphique, encadré « Méthode »…) |
| **procédé** | une façon de tromper ; un **piège** est un procédé posé sur une zone |
| **leurre** | une zone qui a l'air suspecte et ne l'est pas |
| **manque** | une information que le format exige et que la pièce ne donne pas (niveaux 4 et 5) |
| **marque** | ce que le visiteur pose sur une zone |
| **relevé** | l'ensemble des marques, verrouillé avant la correction |
| **contre-expertise** | la correction |
| **pièce rectifiée** | la version honnête de la même pièce |

---

## 4. Le moteur

### 4.1 Principe : la vérité d'abord

Une pièce se fabrique dans cet ordre, jamais dans l'autre :

1. **La vérité** : le monde produit des données cachées (séries, effectifs, groupes, dates, effet réel).
2. **La présentation honnête** : le format met ces données en page. C'est la pièce rectifiée.
3. **Les pièges** : chaque procédé est une transformation déclarée d'une zone honnête. Il sait dire où il est, ce qui le prouve sur la page, et comment revenir à la version honnête.
4. **Les leurres** : des zones honnêtes rédigées pour paraître suspectes.

Conséquences : la correction, la question chiffrée et le verdict sont calculés à partir de la vérité ; la pièce rectifiée existe toujours.

**Décidabilité.** Un procédé n'est posé que si la page porte sa preuve (colonne « Preuve exigée » du catalogue). Chaque procédé fournit trois fonctions pures :

- `poser(piece, zone, intensite, alea)` : applique la transformation ;
- `detecte(piece, zone)` : vrai si la zone présente objectivement ce procédé ;
- `preuves(piece, zone)` : les zones qui permettent de le constater.

**Marge interdite.** Chaque procédé à paramètre définit un seuil de décidabilité (au-delà : piège) et un seuil de sûreté (en deçà : sain), avec un intervalle vide entre les deux que le générateur ne produit jamais. Exemple : « échantillon trop petit » si n ≤ 30, sain si n ≥ 400, rien entre les deux. Trois intensités (forte, moyenne, faible), toutes au-delà du seuil de décidabilité.

**Procédés de rhétorique.** Posés seulement quand la phrase tire explicitement la conclusion (« donc », « c'est bien la preuve que »). Leur leurre cite le même élément sans rien en conclure.

**Aucun hasard libre.** Tout tirage passe par `generateur(graine)`. Attention : les pièges de `static/perception.js` tirent avec `Math.random()` (`entier()`), donc ne sont pas reproductibles tels quels. Réutilise `grapheBarres()` et `grapheCourbe()` pour dessiner, mais tire les données avec un générateur à graine ; ne change pas le comportement de l'atelier « Graphiques trompeurs ».

### 4.2 Forme d'une pièce

Indicative ; garde l'esprit, ajuste les noms.

```js
{
  version, graine, jour, niveau, numero,
  monde, format, couleur,          // la couleur vient du monde, jamais des procédés
  verite: { … },                   // jamais affichée avant la correction
  zones: [{
    id, role,                      // "titre", "chapo", "chiffre-cle", "figure-axe", "methode", "source"…
    contenu,                       // ce que la page montre
    etat,                          // "saine" | "piegee" | "leurre"
    procede, intensite,            // si piégée
    toleres,                       // procédés qu'on ne compte ni justes ni faux s'ils sont nommés ici
    rectifie,                      // contenu honnête
    preuves                        // identifiants des zones qui prouvent le piège
  }],
  manques: [ … ],                  // niveaux 4 et 5
  chiffrer: [{ question, reponse, tolerance, options }],
  verdict                          // "etablie" | "non-etablie" | "contredite"
}
```

Avant la correction, le DOM ne porte aucune trace de l'état des zones : ni classe, ni attribut, ni ordre, ni couleur, ni taille qui distingue une zone piégée d'une zone saine.

### 4.3 Mondes (au moins 8)

Chacun est un petit modèle génératif : entités aux noms inventés, grandeurs, relations vraies, procédés qu'il supporte. Vivier :

1. une ligne de bus devenue gratuite (fréquentation, saisons) ;
2. un radar pédagogique à l'entrée d'un village (petits nombres, retour à la normale) ;
3. une application de révision (volontaires, abandons) ;
4. une infusion du soir et le sommeil déclaré (pas de témoin, financeur) — même veine que « Fabriquer un résultat » ;
5. un club de course à pied (temps au 10 km, moyenne et médiane) ;
6. la piétonnisation d'une rue commerçante (sondage, période choisie) ;
7. une jeune entreprise et son application (cumul, pourcentages sans base) ;
8. un lycée et son taux de réussite (sélection, total contre groupes) ;
9. un fournisseur d'électricité (prix barré, offre leurre) ;
10. une médiathèque municipale (prêts, double axe) ;
11. une cantine et le gaspillage (mesure changée en cours de route) ;
12. le portique antivol d'une librairie (taux de base).

### 4.4 Formats (au moins 6, plus le dossier)

| Format | Zones (rôles) | Mentions exigées |
|---|---|---|
| Brève de presse | rubrique, titre, chapô, figure (titre, axe, tracé, légende), 2 ou 3 phrases, source | source, période |
| Publicité | slogan, chiffre-clé, visuel, témoignage, astérisque, petites lignes | base du chiffre |
| Communiqué d'étude | titre, résultat, encadré « Méthode » (effectif, durée, comparaison, financeur), tableau, conclusion | effectif, comparaison, financeur |
| Sondage | question posée, barres, fiche technique (effectif, dates, mode de recueil), commentaire | question exacte, effectif, dates |
| Publication de réseau fictif | compte, texte, image-chiffre, compteur de partages, réponse d'un autre compte | — |
| Bulletin municipal ou tract | bandeau, bilan « avant / après », citation, encadré chiffres, source | période, source |
| Dossier (niveau 5) | deux pièces de formats différents sur la même vérité | — |

Les « mentions exigées » fondent les manques : une pièce saine les porte toutes.

### 4.5 Procédés

Vivier de 38. **Au moins 24 en service à la fin du lot P1, dont 3 au moins par famille.** Retire sans hésiter un procédé que tu ne sais pas rendre décidable, et note-le. Vérifie chaque identifiant de fiche contre `INDEX` (un banc échoue sinon).

| Id | Nom affiché | Preuve exigée sur la page | Fiche liée |
|---|---|---|---|
| **G — Graphique** | | | |
| `axe-tronque` | Axe qui ne part pas de zéro (barres seulement) | graduations lisibles ; rapport des hauteurs ≥ 1,5 fois celui des valeurs | atelier `graphiques` |
| `fenetre` | Période choisie | la pièce cite ailleurs une période plus longue | `sophismes:cherry-picking` |
| `double-axe` | Deux axes d'échelles différentes | deux graduations lisibles | atelier `graphiques` |
| `cumul` | Valeurs cumulées présentées comme une hausse | le mot « cumul » en légende, ou les valeurs annuelles dans le texte | atelier `graphiques` |
| `pictogramme` | Image agrandie dans les deux dimensions | valeurs écrites | atelier `graphiques` |
| `axe-inverse` | Axe inversé | graduations lisibles | atelier `graphiques` |
| **C — Chiffres** | | | |
| `relatif-sans-absolu` | Risque relatif sans le risque absolu | effectifs absolus ailleurs sur la pièce | `biais:cadrage` |
| `pourcentage-sans-base` | Pourcentage sur une base minuscule | la base figure ailleurs sur la pièce | `biais:taille-echantillon` |
| `points-pourcentage` | Pour cent et points de pourcentage confondus | les deux taux sont écrits | atelier `graphiques` |
| `moyenne-mediane` | Moyenne tirée par une valeur extrême | la valeur extrême ou la médiane est citée | atelier `graphiques` |
| `petit-echantillon` | Échantillon trop petit pour conclure | effectif écrit, sous le seuil | `biais:taille-echantillon` |
| `precision-illusoire` | Précision que l'effectif ne permet pas | effectif écrit | — |
| `denominateur` | Deux taux calculés sur des bases différentes | les deux bases sont nommées | — |
| `taux-de-base` | Taux de base oublié (niveaux 4 et 5) | fréquence réelle écrite | `biais:taux-de-base` |
| `simpson` | Total qui contredit chaque groupe (dossier) | tableau par groupe dans la seconde pièce | `biais:simpson` |
| **M — Méthode** | | | |
| `sans-temoin` | Aucun groupe de comparaison | méthode décrite, sans comparaison | — |
| `survivant` | Seuls ceux qui sont restés sont comptés | abandons ou non-réponses chiffrés | `biais:survivant` |
| `auto-selection` | Volontaires non représentatifs | mode de recrutement écrit | — |
| `correlation` | Corrélation présentée comme une cause | verbe causal dans le titre, simple association dans la méthode | `sophismes:correlation` |
| `post-hoc` | « Après, donc à cause de » | un autre changement daté sur la pièce | `sophismes:post-hoc` |
| `regression` | Retour à la normale pris pour un effet | sélection sur une valeur extrême écrite | `biais:regression-moyenne` |
| `comparaisons-multiples` | Un résultat retenu parmi beaucoup de tests | nombre de critères testés écrit | `sophismes:tireur-elite` |
| `critere-deplace` | Objectif changé après coup | objectif initial cité | `sophismes:poteaux` |
| **R — Rhétorique** | | | |
| `temoignage` | Un témoignage pour toute preuve | aucune donnée d'ensemble sur la pièce | `sophismes:generalisation-hative` |
| `autorite` | Autorité hors de son domaine | domaine de la personne écrit | `sophismes:autorite` |
| `popularite` | « Tout le monde le fait » | conclusion tirée explicitement | `sophismes:popularite` |
| `faux-dilemme` | Deux options, comme s'il n'y en avait pas d'autres | une troisième option citée ailleurs | `sophismes:faux-dilemme` |
| `nature` | « Naturel, donc bon » | conclusion tirée explicitement | `sophismes:nature` |
| `pente` | Pente glissante | enchaînement affirmé sans appui | `sophismes:pente-glissante` |
| `peur` | Appel à la peur | conclusion tirée explicitement | `sophismes:emotion` |
| `question-orientee` | Question de sondage orientée | libellé exact de la question affiché | `sophismes:question-piege` |
| `prix-barre` | Prix de référence gonflé | l'ancien prix réel en petites lignes | `biais:ancrage` |
| `offre-leurre` | Offre placée là pour en avantager une autre | trois offres chiffrées | `biais:leurre` |
| **S — Source** | | | |
| `source-absente` | Chiffre sans source vérifiable | zone source présente, vide ou vague (« des experts ») | — |
| `conflit` | Étude financée par celui qu'elle avantage | financeur écrit | — |
| `perime` | Donnée ancienne présentée comme actuelle | date de la donnée écrite | — |
| `citation-tronquee` | Citation coupée de son contexte (dossier) | citation complète dans la seconde pièce | `sophismes:hors-contexte` |
| `circulaire` | Deux sources qui se citent l'une l'autre (dossier) | visible en recoupant les deux pièces | — |

Chaque procédé porte aussi : sa famille, les formats et rôles de zone compatibles, ses seuils et intensités, ses **voisins** (procédés qu'on confond avec lui, pour l'étape « Nommer »), son **effet sur le verdict** (`aucun`, `non-etablie`, `contredite`), deux phrases de correction (ce qui trompe ; ce qui sépare de chaque voisin), et la liste des procédés incompatibles sur une même pièce.

### 4.6 Leurres (au moins 10)

Chacun a sa phrase « pourquoi ce n'est pas un piège ». Vivier : ton vif sur un fait exact ; chiffre rond et exact ; expert cité dans son domaine ; courbe dont l'axe ne part pas de zéro (toléré pour une courbe, comme dans `perception.js`) ; pourcentage accompagné de sa base ; grand échantillon avec groupe de comparaison ; corrélation présentée comme telle (« est associé à ») ; témoignage en illustration d'une donnée solide ; popularité citée comme un fait, sans conclusion ; petites lignes complètes et cohérentes avec le slogan ; source nommée, datée, récente ; hausse spectaculaire et réelle sur un axe partant de zéro.

### 4.7 Niveaux

| | 1 découverte | 2 confirmé | 3 expert | 4 maître | 5 virtuose |
|---|---|---|---|---|---|
| Formats | brève, publicité | + sondage, réseau | + étude, bulletin | tous | dossier de deux pièces |
| Zones touchables | 4 à 5 | 5 à 7 | 7 à 9 | 9 à 12 | 12 à 16 |
| Pièges | 1, annoncé | 0 ou 1 | 0 à 2 | 0 à 3 | 0 à 4 |
| Part de pièces saines | 0 % | 25 % | 20 % | 15 % | 10 % |
| Nombre de pièges annoncé | oui | non | non | non | non |
| Leurres | 0 | 1 | 2 | 2 à 3 | 3 à 4 |
| Familles | G, R | G, C, R | toutes | toutes ; deux procédés possibles sur une figure | toutes, plus les procédés « dossier » |
| Intensité | forte | forte | moyenne | faible | faible |
| Manques | — | — | — | 0 ou 1 | 0 à 2 |
| Nommer | 3 choix | 4 choix | 5, dont 1 voisin | 6, dont 2 voisins | toute la famille |
| Chiffrer | — | — | 1 question, 4 choix | 1 question, saisie libre | 2 questions, dont 1 libre |
| Conclure | — | — | oui | oui | oui |
| Durée visée | 1 min | 2 min | 3 min | 4 min | 6 min |

Au niveau 5, un piège au moins n'est décidable qu'en recoupant les deux pièces. Aucun chronomètre, à aucun niveau.

Garantie de composition, à tous les niveaux : au moins deux zones saines ou leurres, non tolérées, par piège posé. Sans elle, tout marquer pourrait rapporter des points (§ 5.2).

### 4.8 Graines, rotation, versions

- `grainePiece(jour, niveau)` mêle le jour, le niveau et `PIECE_VERSION` ; deux jours consécutifs et deux niveaux voisins donnent des pièces sans parenté.
- Numéro de pièce : `jour − PIECE_JOUR_UN + 1`, affiché « Pièce n° 12 ».
- **Rotation** : le format, le monde et les procédés tournent par cycles mélangés (permutation tirée par le numéro de cycle), pas par tirage indépendant chaque jour. C'est ce qui manque au défi actuel.
- Toute modification du générateur qui change une pièce existante incrémente `PIECE_VERSION` ; chaque résultat enregistré garde sa version.
- **Archives** : les 30 derniers jours se rejouent (`#piece/j-<jour>`), sans point ni effet sur la série de jours. **Pièce libre** : `#piece/<niveau>-<graine>`, partageable.
- La pièce du jour n'est générée qu'à l'ouverture de sa carte ou de sa page, jamais au chargement du site.

---

## 5. Le jeu

### 5.1 Déroulé

0. **Carte de l'accueil** : étiquette de pièce, format du jour, niveau, durée, bouton « Examiner la pièce » (ouvre `#piece`). Une fois jouée : note, relevé, « Revoir la contre-expertise », « Partager ».
1. **Repérer.** Toucher une zone pose une marque numérotée, la retoucher l'enlève. « Rien à signaler » exclut toute marque. Niveaux 4 et 5 : « Il manque quelque chose » ouvre la liste des mentions absentes.
2. **Nommer.** Pour chaque marque, choisir le procédé (§ 4.7).
3. **Certitude, puis verrouillage.** « Votre relevé est-il exact ? » avec les trois degrés de `NIVEAUX_CERTITUDE`, puis « Verrouiller mon relevé ». Avant ce point tout est modifiable, après rien ne l'est.
4. **Chiffrer** (niveaux 3 à 5). Posée après le verrouillage, parce qu'elle peut trahir un piège. Elle existe aussi pour une pièce saine (simple lecture chiffrée).
5. **Conclure** (niveaux 3 à 5). « La conclusion de la pièce est : établie par ce qu'elle montre / non établie, mais peut-être vraie / contredite par la pièce elle-même. » Le verdict attendu est le plus fort des effets des pièges posés. Relie la correction à la fiche `sophismes:sophisme-sophisme` : une preuve fautive ne rend pas la conclusion fausse.
6. **Contre-expertise** (§ 6.4), reconstruite à tout moment depuis la réponse enregistrée : elle reste consultable toute la journée et dans les archives. Une fiche ouverte depuis la correction propose « Revenir à la partie » (`partieMiseDeCote`).

### 5.2 Notation

Note sur 10, arrondie à l'entier le plus proche (0,5 arrondi vers le haut). P = pièges et manques posés, F = trouvés, A = fausses alertes (marque sur une zone saine ou un leurre ; une zone tolérée ne compte ni dans F ni dans A).

| Part | Niveaux 1 et 2 | Niveaux 3 à 5 |
|---|---|---|
| Repérage | 7 | 5 |
| Nom | 3 | 2 |
| Chiffre | — | 2 |
| Verdict | — | 1 |

- **Repérage**, sur R points. Pièce piégée : `R × max(0, F/P − A/(2P))` ; « Rien à signaler » vaut 0. Pièce saine : R pour « Rien à signaler », sinon `R × max(0, 1 − A/2)`.
- **Nom**, sur N points : `N × (exacts + 0,5 × voisins) / P`. Un voisin vaut la moitié et reçoit la phrase « ce qui sépare ». Pièce saine : N multiplié par la part de repérage obtenue.
- **Chiffre** : parts égales entre les questions ; saisie libre : tout dans la tolérance, moitié dans le double de la tolérance.
- **Verdict** : 1 ou 0.

Propriétés à vérifier par le banc : note dans [0, 10] ; une fausse alerte de plus ne l'augmente jamais ; un piège trouvé de plus ne la diminue jamais ; tout marquer vaut 0 au repérage.

**Mesures au long cours** (profil) : par procédé, rencontres, trouvés, manqués, manqués en étant sûr ; par leurre, rencontres et touchés ; taux de détection H et de fausses alertes F avec la correction de 0,5 déjà employée par le débat truqué (`static/debattre.js`). Factorise plutôt que de recopier.

### 5.3 Points, maîtrise, niveau

- `SOURCES_LUCIDITE` (`static/progression.js`) : `"piece-jour": 2 × note + 10`, une fois par jour (même économie que `"defi-jour"`) ; `"piece-libre": 2 × note`, deux fois par jour. Archives : rien.
- **Étalonnage** : en plus, `pointsReponse(BAREME_QUIZ, certitude, releveExact)`. Le relevé est exact si F = P et A = 0.
- `gagnerTroisCartes()` et `programmeDuJour()` lisent `pieceJour` quand le drapeau est à `true`.
- **Maîtrise** : `MAITRISE_JEUX.piece = ["debattre", "note", c]`, résultat enregistré par `noterPartie("piece", note, 10, niveau)`. Calcule la part de hasard `c` par simulation (joueur au hasard, joueur qui répond toujours « Rien à signaler »), prends le pire des deux, écris le calcul dans le journal.
- **Niveau** (mode auto) : il monte si la moyenne des trois dernières pièces jouées à ce niveau atteint 8, descend sous 5 (mêmes seuils que `suivrePartie()`).
- **Atelier « Pièces à expertiser »** (`#tests/piece`) : parties libres de trois pièces au niveau du joueur, records par niveau, lien vers les archives et le tableau des procédés.
- **Quatre distinctions**, calculées sur les données comme les autres : « Contre-expert » (dix relevés exacts au niveau 3 ou plus), « Sang-froid » (cinq pièces saines reconnues sans fausse alerte), « Angle mort comblé » (un procédé manqué trois fois, puis trouvé trois fois de suite), « Tour du cabinet » (chaque famille repérée trois fois).
- **Mode sobre** : même traitement que le défi actuel.

### 5.4 Données enregistrées

Trois clés nouvelles, 24 Ko au plus à elles trois dans le pire cas (le coffre de synchronisation est limité à 256 Ko, `serveur/README.md`) :

- `pieceJour` : `{ jour, niveau, v, note, reponse }`, où `reponse` suffit à reconstruire la correction (marques, noms, manques, chiffres, verdict, certitude) ;
- `pieces` : les 120 derniers résultats, compacts (jour, niveau, version, origine, note, exact, certitude, procédés présents, trouvés, leurres touchés) ;
- `pieceBilan` : compteurs cumulés par procédé et par leurre.

Pour chacune : `CLES_SAUVEGARDE` et `FORMES_SAUVEGARDE` (`static/app.js`), schéma dans `SCHEMAS_SAUVEGARDE` (`static/sauvegarde.js`), règle dans `REGLES_FUSION` (`static/coffre.js` : `pieceJour`, le jour le plus récent, et à jour égal l'entrée qui a une note ; `pieces`, union puis les 120 derniers ; `pieceBilan`, fusion à trois voies comme `certitudes`), et le banc `aleatoire`.

---

## 6. Le graphisme

Lis `DESIGN.md` en entier avant d'écrire une ligne de CSS. Tout ce qui suit s'y conforme ; ajoute-lui une section « La pièce du jour » à la fin du lot P2. Trois jetons nouveaux au plus.

### 6.1 La pièce comme objet

`DESIGN.md` décrit le site comme un cabinet d'illusions où « chaque écran important porte une pièce visuelle qui trompe l'œil, puis se révèle au toucher ». La pièce du jour est l'objet exposé de ce cabinet.

- Une **feuille posée sur la page** : surface propre, filet d'encre de 1 px, `--ombre-2`, coins de `--rayon-carte`. Pas de rotation, pas de texture, pas de faux papier froissé.
- Une **étiquette de pièce**, en haut, dans le style des étiquettes du site (capitales Newsreader 13 px, graisse 650, espacement 0,07 em) : « PIÈCE N° 12 · NIVEAU 3, EXPERT · DOCUMENT FICTIF ».
- Une seule couleur de catégorie par pièce (`--c`), tirée du monde.
- Largeur de lecture de 680 px ; dès 1 040 px, deux colonnes : la pièce à gauche, le rail d'expertise à droite.

### 6.2 Les six habillages

Chaque format se reconnaît au premier regard, avec les seules polices et les seuls jetons du site :

- **Brève** : rubrique en étiquette, titre Newsreader, chapô en romain 21 px, figure, signature d'une rédaction fictive.
- **Publicité** : aplat `--c-clair`, chiffre-clé en grand nombre (64 à 80 px, chiffres elzéviriens), astérisque, petites lignes. « Petites » par leur place, jamais illisibles : 13 px au moins, contraste 4,5:1.
- **Communiqué d'étude** : encadré « Méthode » sur fond `--encadre`, tableau de résultats, conclusion en exergue.
- **Sondage** : la question en exergue entre guillemets, barres horizontales avec valeurs écrites, fiche technique.
- **Réseau fictif** : carte, avatar fait d'un glyphe géométrique (aucun visage), compteur de partages. Ne rappelle aucun service réel.
- **Bulletin municipal** : bandeau, deux colonnes « avant / après », blason géométrique.

Les figures trompeuses se dessinent avec `grapheBarres()` et `grapheCourbe()` ; les figures rectifiées suivent la section « Graphiques » de `DESIGN.md` (barres depuis zéro, valeurs écrites, bouton « Voir les données »).

### 6.3 Zones et marques

- Chaque zone est un vrai contrôle, dans l'ordre de lecture, cible de 44 px, focus visible. Les sous-zones d'une figure (axe, tracé, légende, titre) aussi.
- Au repos, une zone ne se signale que par le curseur et le focus : pas de cadre permanent qui transformerait la pièce en formulaire. Au survol ou au focus, un fond `--c-clair` discret.
- **La marque** : un trait d'encre sous le texte ou autour de la sous-zone, avec une pastille numérotée (le numéro porte l'information, pas la couleur). Elle se pose par `transform` et `opacity` seulement, via `animer()`.
- **Barre d'étapes** « Repérer · Nommer · Chiffrer · Conclure », collante sous l'en-tête sur téléphone, dans le rail sur ordinateur. Jamais une seconde barre fixe en bas : la navigation fixe l'occupe (`--hauteur-nav`) ; lis les commentaires sur Safari avant d'y toucher.
- Compteur en clair : « 2 marques posées ».

### 6.4 La contre-expertise

Le site « corrige comme un correcteur » (`DESIGN.md`, « Corrections ») : barré rouge, verdict en italique Newsreader 19 px, et le texte attendu toujours présent. La contre-expertise pousse ce principe à l'échelle d'un document entier.

- **Les trois mouvements signature, et eux seuls.** *La révélation* à l'ouverture de la correction ; *le retournement* pour passer de la pièce d'origine (recto, annotée) à la pièce rectifiée (verso) ; *la chute* pour la note. L'état final est posé sans attendre la fin de l'animation.
- **La pièce annotée.** Chaque zone concernée reçoit une pastille numérotée et une annotation : en marge droite dès 1 040 px, reliée par un filet fin ; sous la zone, dépliée, sur téléphone.
- **Quatre états**, chacun avec un glyphe au trait, un mot et une couleur (jamais la couleur seule) : « Trouvé », « Manqué », « Fausse alerte », « Leurre évité ».
- **Une annotation contient**, dans cet ordre : l'état ; le nom du procédé en italique ; une phrase « ce qui trompe » ; « la preuve est ici », avec renvoi visible vers la zone de preuve ; la version honnête (l'original barré, puis la réécriture) ; pour un voisin choisi à tort, « ce qui sépare » ; le lien vers la fiche avec son numéro (« B 10 ») ou vers l'atelier.
- **Une fausse alerte** se corrige avec le même soin qu'un piège manqué : la marque est barrée, et l'annotation dit pourquoi la zone est saine.
- **Figures** : trompeuse et honnête côte à côte sur ordinateur, par retournement sur téléphone, avec une phrase calculée sur la vérité et affichée par `messageGraphique()` (« Sur un axe partant de zéro, l'écart est de 3 %, pas du simple au triple »).
- **Bouton à bascule** « Voir la pièce rectifiée / Voir la pièce d'origine » (`aria-pressed`).

### 6.5 Rapport d'expertise et partage

- Carte finale : la note en grand nombre, le détail par part en barres (conventions de `static/graphiques.js`), une phrase d'étalonnage (« Vous étiez sûr, et votre relevé était exact »), puis trois suites : tableau des procédés, archives, pièce libre.
- **Relevé à partager**, en texte : « Pièce n° 12 · niveau 3 · 8/10 » puis des signes typographiques triés, non positionnels (la position trahirait la réponse) : ● trouvé, ○ manqué, × fausse alerte. Pas d'émoji.
- **Image à partager** : 1 080 × 1 350, sur le modèle de `partagerFiche()` (`static/profil.js`) : étiquette, note, relevé. Rien du contenu de la pièce.

### 6.6 Tableau des procédés

Dans le profil (nouvel onglet de `ONGLETS_PROFIL`) : le catalogue par famille, un point par procédé dont la forme dit l'état (jamais rencontré, rencontré, repéré k fois sur n), dans la grammaire du codex. En tête : « Votre angle mort », le procédé le plus manqué parmi ceux rencontrés trois fois au moins, avec H et F. État vide dessiné, selon « États vides ».

### 6.7 Accessibilité

- Toute la pièce se joue au clavier et au lecteur d'écran. Le nom accessible d'une zone donne l'information utile au jugement (« Axe vertical, gradué de 96 à 100 »), jamais son état.
- 390 px et 1 280 px, clair et sombre ; contraste 4,5:1 ; cibles de 44 px ; `prefers-reduced-motion` et le réglage « Animations : réduites » remplacent le retournement par un échange simple.
- Raccourcis ajoutés à `RACCOURCIS` et à l'aide (touche `?`).

### 6.8 Contrôle visuel par toi-même

Avant de clore P2 puis P3 : capture chaque format, à chaque étape et en correction, aux quatre configurations (`tests/capturer.py`, scénarios dans `tests/_visu.html`), **regarde les images**, et corrige ce qui ferait dire « gabarit générique » : alignements, rythme vertical, hiérarchie, densité, cohérence des six habillages entre eux. Pousse les captures sur la branche `captures`, dossier `piece-lot-N`.

---

## 7. Fichiers

Sur le modèle du Grand test (données, fonctions pures, interface). Préfixe des noms globaux : `PIECE_` et `piece`.

| Fichier | Contenu |
|---|---|
| `static/piece-donnees.js` | mondes, formats, procédés, leurres, gabarits de phrases, `RELECTURE_PIECE` |
| `static/piece.js` | drapeau, graines, rotation, génération, `detecte`, notation : fonctions pures, testables sous Node |
| `static/piece-interface.js` | rendu des formats, jeu, contre-expertise, carte de l'accueil, atelier, archives, tableau des procédés |
| `static/en/dico-piece*.js` | traductions |
| `tests/piece_moteur.py`, `tests/_piece.html` | bancs (§ 10) |
| `tests/piece-brief.md`, `piece-plan.md`, `piece-journal.md`, `piece-a-relire.md` | brief, plan, journal, textes à relire |

Chaque script nouveau : les deux `index.html`, `FICHIERS` et `CACHE` de `static/sw.js`, `verifierChargement()`. Charge-les après `perception.js`, `niveaux.js`, `progression.js` et `graphiques.js`, avant `app.js` ; les outils de `app.js` ne s'appellent que dans des fonctions.

Phrases générées : gabarits entiers passés par `T("… {0} …", valeur)`, nombres par `fr()`. Pour les élisions et les accords, regarde comment `static/grand-test.js` s'y prend (`elisions()`, `GENERATEURS_GT_EN`).

Budget : 150 Ko au plus pour les trois scripts français ; génération d'une pièce en moins de 50 ms avec un processeur ralenti quatre fois ; premier affichage de l'accueil inchangé (mesure avant et après, dans le journal).

---

## 8. Méthode de travail

- Lis d'abord : `CLAUDE.md`, `DESIGN.md`, `tests/refonte-journal.md` (section « État »), puis `static/niveaux.js`, `static/progression.js`, `static/perception.js` (graphiques trompeurs), `static/debattre.js` (débat truqué), `static/grand-test.js`, `static/coffre.js`, `static/sauvegarde.js`, et dans `static/app.js` : `carteDefiDuJour()`, `afficherAccueil()`, `afficherPage()`.
- Copie ce brief dans `tests/piece-brief.md`. Tiens `tests/piece-journal.md` : tableau d'état des lots, écarts entre le brief et le code, décisions et hypothèses, mesures.
- Ne pose pas de question, sauf blocage réel : décide, et note la décision.
- Textes : français d'abord, puis `tests/en/extraire.py --manquants`, `ajouter.py`, `controle.py`.
- Aucun fait réel chiffré ou attribué sans source primaire vérifiée ; sinon `tests/a-verifier.md`, et rien n'est affiché. Les corrections expliquent par la logique et renvoient aux fiches.
- `tests/piece-a-relire.md` liste, pour le propriétaire : chaque gabarit de phrase (français et anglais), chaque phrase de correction, chaque nom inventé, chaque seuil du catalogue.

---

## 9. Les lots

- **P0 — Cadrage.** Brief copié, plan, journal. Le catalogue complet en tableau dans `tests/piece-a-relire.md` : procédés × formats × mondes × niveaux, seuils, intensités, preuves, voisins, effets sur le verdict. Aucun code du site.
- **P1 — Moteur**, niveaux 1 à 4. `piece-donnees.js`, `piece.js`, banc `piece-moteur`. Rien de visible.
- **P2 — Jeu et contre-expertise.** `piece-interface.js`, CSS, route `#piece` (`ONGLET_DE`, `SECTION_DE`, `afficherPage()`) active sur la seule copie d'essai, banc `piece`, captures, section de `DESIGN.md`.
- **P3 — Intégration.** Accueil et programme du jour, points, maîtrise, niveaux, sauvegarde et synchronisation, atelier, archives, pièce libre, recherche (`static/recherche.js`), raccourcis, article du guide « Lire une pièce » (la méthode et la notation, en clair), README, décompte des ateliers (y compris le générateur des pages fixes).
- **P4 — Profondeur.** Dossier du niveau 5 et ses procédés, manques, tableau des procédés, distinctions, étapes dans les parcours « Info ou intox » et « Les chiffres qui trompent ».
- **P5 — Finitions.** Relecture de l'anglais, mesures, contrôle visuel final, `tests/piece-a-relire.md` complet, mise à jour de `CLAUDE.md` (architecture, ordre de chargement). Puis arrêt : la bascule du drapeau appartient au propriétaire.

---

## 10. Bancs et critères d'acceptation

Ajoute les deux bancs à `BANCS` (`tests/lancer.sh`) et à `.github/workflows/verifier.yml`.

**`piece-moteur`** (Node, hors navigateur, sur le modèle de `tests/grand_test_*.py`) :

1. **Déterminisme** : même jour et même niveau, même pièce, deux fois ; même structure en français et en anglais.
2. **Non-ambiguïté** : 5 niveaux × 3 000 graines. Toute zone piégée satisfait `detecte()` pour son procédé ; aucune zone saine ou leurre ne satisfait `detecte()` pour un procédé du catalogue, hors tolérés ; toutes les preuves désignent des zones affichées ; aucune valeur dans une marge interdite ; aucune paire de procédés incompatibles.
3. **Niveaux** : chaque ligne du tableau du § 4.7 tenue ; part de pièces saines à ± 5 points.
4. **Variété** : 365 jours consécutifs par niveau. Aucune pièce en double ; jamais le même format et le même monde deux jours de suite ; jamais le même ensemble de procédés à moins de 7 jours ; chaque procédé permis vu au moins une fois par 60 jours ; chaque format au moins une fois par 14 jours.
5. **Calculs** : réponses de « Chiffrer » et verdicts recalculés par un oracle Python indépendant à partir de la vérité.
6. **Notation** : table de cas (parfait, tout manqué, fausses alertes, pièce saine reconnue ou non, voisin) et propriétés du § 5.2.
7. **Part de hasard** par niveau.
8. **Fiches** : chaque identifiant lié existe dans `INDEX`.

**`piece`** (navigateur, quatre configurations) : une pièce jouée jusqu'à la contre-expertise à chaque niveau, au clavier seul puis au pointeur ; contrôle d'affichage (`tests/controle-affichage.js`) à chaque étape, sur les six formats, recto et verso ; aucune trace de l'état des zones dans le DOM avant la correction ; état final posé avec animations réduites ; une seule tentative par jour ; correction reconstruite après rechargement ; texte de partage sans position ; schémas des trois clés.

**Bancs existants à adapter** : `test` (défi du jour avec le drapeau à `false`, pièce avec la copie d'essai), `ateliers` et `progression` (atelier de plus, `MAITRISE_JEUX`), `aleatoire` (trois clés), `csp` (adresses `#piece`), `synchro` (fusion), `_visu.html` (scénarios de capture).

---

## 11. Terminé, pour chaque lot

Intégration continue au vert ; `node --check static/*.js`, `python3 tests/noms_globaux.py`, `python3 tests/en/controle.py`, `python3 tests/securite.py` passent ; journal à jour ; captures poussées (P2 à P5) ; aucun « à faire » laissé dans le code ; drapeau toujours à `false` dans `main`.

## 12. Interdits

- Un nom réel, ou une interface qui en évoque une vraie.
- Une correction écrite à la main pour une pièce ; un piège sans preuve sur la page.
- `Math.random()` dans la génération ; `innerHTML` ; un style en ligne ; une ressource extérieure.
- Un chronomètre, un message qui joue sur la peur de perdre sa série, des points pour le temps passé.
- Une différence visible ou lisible dans le DOM entre zone saine et zone piégée avant la correction.
- Changer la forme d'une clé existante (`defiJour`, `niveaux`, `resultatsAteliers`…) sans migration testée.
- Une seconde barre fixe en bas d'écran ; un quatrième mouvement d'animation.
- Basculer `PIECE_VISIBLE` à `true` dans `main`.

## 13. Étapes du propriétaire

1. Relire `tests/piece-a-relire.md` (gabarits, corrections, noms inventés, seuils) et les captures de la branche `captures`.
2. Jouer une semaine de pièces sur la copie d'essai, aux cinq niveaux.
3. Déclarer la relecture (`RELECTURE_PIECE`) et demander la bascule du drapeau.

## 14. Première action

Lis les fichiers du § 8, puis ouvre le lot P0. Dans le journal, commence par la liste des écarts entre ce brief et le code que ta lecture a révélés.
