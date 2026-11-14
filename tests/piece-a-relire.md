# « La pièce du jour » : à relire

Pour le propriétaire. Lot P0 : le catalogue (procédés, seuils, intensités, preuves, voisins, effets, formats,
mondes, leurres, noms inventés). Les gabarits de phrases et les phrases « ce qui sépare » s'ajoutent en P1 et P2,
avec leur traduction anglaise. Les décisions qui fondent ces tableaux sont dans `tests/piece-journal.md`.

## 1. Conventions

- **Formats** : B brève de presse · P publicité · E communiqué d'étude · S sondage · R publication de réseau fictif ·
  M bulletin municipal ou tract · D dossier (niveau 5).
- **Familles** : G graphique · C chiffres · M méthode · R rhétorique · S source.
- **Niveau min.** : premier niveau où le procédé peut être posé. Il dépend du tableau du brief (§ 4.7) : familles G
  et R dès 1, C dès 2, M et S dès 3 ; formats B et P dès 1, S et R dès 2, E et M dès 3. Il faut donc aussi un format
  permis à ce niveau. Trois procédés sont repoussés plus haut parce qu'ils demandent un calcul :
  `precision-illusoire` et `denominateur` au niveau 3, `taux-de-base` au niveau 4 (comme le dit le brief).
- **Intensité** : forte aux niveaux 1 et 2, moyenne au niveau 3, faible aux niveaux 4 et 5. Pour un procédé à
  paramètre, elle fixe le paramètre (colonnes F / M / f). Pour un procédé binaire, elle fixe la discrétion de la
  preuve. Forte : la preuve est dans la zone voisine. Moyenne : ailleurs dans le corps. Faible : dans les petites
  lignes, la méthode ou la fiche technique. La preuve reste toujours affichée et lisible.
- **Marge interdite** : valeurs entre le seuil de piège et le seuil de sûreté. Le générateur n'en produit jamais,
  ni sur une zone piégée, ni sur une zone saine.
- **Effet sur le verdict** : `aucun`, `non-etablie` ou `contredite`. Le verdict attendu est l'effet le plus fort des
  pièges posés (contredite > non établie) ; sans piège, ou avec seulement des effets `aucun`, la conclusion est
  établie.
- **Mondes** : numéros du § 5.

## 2. Procédés en service au lot P1 (34)

Sans paramètre, la colonne « Piège si » donne la condition, et la colonne « Sain si » la version honnête.

### G — Graphique (6)

| Id | Formats | Zone | Niv. | Preuve sur la page | Piège si | Sain si | F / M / f | Voisins | Effet | Incompatibles | Mondes | Fiche |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `axe-tronque` | B S M | figure-axe (barres) | 1 | graduations lisibles | rapport des hauteurs ≥ 1,5 × rapport des valeurs | axe à zéro (rapport 1) | ≥ 4 / ≥ 2,5 / ≥ 1,5 | `pictogramme`, `double-axe` | aucun | `pictogramme`, `axe-inverse` (même figure) | 1 5 6 8 10 11 | atelier `graphiques` |
| `fenetre` | B M R | figure-axe (période) | 1 | une phrase ou la source cite la période longue et son sens | période montrée ≤ 1/3 de la période citée, et sens de la période longue contraire à celui montré | période montrée = période citée | ≤ 1/6 / ≤ 1/4 / ≤ 1/3 | `post-hoc`, `regression`, `cumul` | contredite | `cumul` (même figure), `regression` | 1 2 6 7 10 11 | `sophismes:cherry-picking` |
| `double-axe` | B M | figure-axe (droit) | 1 | deux graduations lisibles, même unité | deux séries de même unité sur deux échelles ; le texte dit que l'une « a dépassé » l'autre, ce que les valeurs démentent ; rapport des échelles ≥ 2 | une seule échelle, ou deux panneaux | rapport ≥ 10 / ≥ 5 / ≥ 2 | `axe-tronque`, `correlation` | contredite | `axe-inverse` (même figure) | 1 10 | atelier `graphiques` |
| `cumul` | B R M | figure-legende | 1 | le mot « cumul » en légende, ou les valeurs annuelles dans le texte | courbe cumulée sous un titre de hausse, alors que la dernière valeur annuelle ≤ 0,9 × la précédente | valeurs annuelles tracées | baisse ≥ 30 % / ≥ 20 % / ≥ 10 % | `fenetre`, `axe-tronque` | contredite | `fenetre`, `axe-inverse` (même figure) | 1 7 10 | atelier `graphiques` |
| `pictogramme` | P R M | visuel | 1 | les deux valeurs écrites | image agrandie dans les deux dimensions d'un rapport r = v2 / v1 ≥ 1,5 (surface × r²) | icônes répétées, une par unité, ou barres | r ≥ 3 / ≥ 2 / ≥ 1,5 | `axe-tronque` | aucun | `axe-tronque` | 1 7 9 11 | atelier `graphiques` |
| `axe-inverse` | B M R | figure-axe (courbe) | 1 | graduations lisibles, croissantes vers le bas | axe vertical inversé sans mention, titre qui suit la lecture visuelle (sens contraire au réel) | axe dans le sens habituel | graduations : 5 / 3 / 2 (extrêmes) | `axe-tronque`, `double-axe` | contredite | `axe-tronque`, `cumul`, `double-axe` (même figure) | 2 9 11 | atelier `graphiques` |

### C — Chiffres (8)

| Id | Formats | Zone | Niv. | Preuve sur la page | Piège si | Sain si | F / M / f | Voisins | Effet | Incompatibles | Mondes | Fiche |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `relatif-sans-absolu` | P E B | chiffre-cle | 2 | effectifs absolus ailleurs (« 2 cas sur 1 000 contre 1 ») | baisse relative ≥ 30 % affichée seule, écart absolu ≤ 1 point | relatif et absolu dans la même zone | écart ≤ 0,1 / ≤ 0,5 / ≤ 1 point | `pourcentage-sans-base`, `points-pourcentage`, `taux-de-base` | aucun | `pourcentage-sans-base` (même zone) | 3 4 12 | `biais:cadrage` |
| `pourcentage-sans-base` | P R B | chiffre-cle | 2 | la base ailleurs (« de 4 à 12 ») | hausse en % sur une base ≤ 20 | base ≥ 500, ou base dans la même zone | base ≤ 5 / ≤ 10 / ≤ 20 | `petit-echantillon`, `relatif-sans-absolu` | non-etablie | `relatif-sans-absolu` (même zone) | 1 3 7 10 | `biais:taille-echantillon` |
| `points-pourcentage` | B S E M | chiffre-cle, phrase | 2 | les deux taux écrits | écart en points annoncé en « % » (ou l'inverse) | unité juste | taux de départ ≤ 10 % / ≤ 25 % / ≤ 50 % | `relatif-sans-absolu` | aucun | `pourcentage-sans-base` (même zone) | 1 3 6 8 | atelier `graphiques` |
| `moyenne-mediane` | B R E M | chiffre-cle, phrase | 2 | la médiane ou la valeur extrême citée | moyenne ≥ 1,5 × médiane, présentée comme le cas typique (« un membre type ») | moyenne ≤ 1,1 × médiane, ou médiane donnée | ≥ 3 / ≥ 2 / ≥ 1,5 | `petit-echantillon` | contredite | — | 5 7 9 | atelier `graphiques` |
| `petit-echantillon` | E S R P | methode-effectif | 2 | effectif écrit | n ≤ 30, conclusion générale tirée | n ≥ 400 | n ≤ 8 / ≤ 15 / ≤ 30 | `pourcentage-sans-base`, `auto-selection`, `temoignage` | non-etablie | `precision-illusoire` | 3 4 5 6 | `biais:taille-echantillon` |
| `precision-illusoire` | S E | chiffre-cle, phrase | 3 | effectif écrit | un classement tiré d'un écart ≤ 1 point, avec 400 ≤ n ≤ 1 500 (marge d'erreur ≥ ± 2,5 points) | écart ≥ 10 points, ou aucun classement tiré | écart ≤ 0,2 / ≤ 0,5 / ≤ 1 point | `petit-echantillon` | non-etablie | `petit-echantillon` | 3 6 8 | — |
| `denominateur` | B M E | phrase, chiffre-cle | 3 | les deux bases nommées (« par habitant », « par usager ») | deux taux de bases différentes comparés comme s'ils étaient comparables | même base | discrétion de la preuve | `points-pourcentage` | non-etablie | — | 1 2 10 11 | — |
| `taux-de-base` | E P B | titre, phrase | 4 | fréquence réelle et fiabilité écrites | le texte laisse entendre qu'une alerte est presque toujours fondée (≥ 90 %) alors que le calcul sur la page donne ≤ 50 % | le texte donne la bonne probabilité | ≤ 10 % / ≤ 25 % / ≤ 50 % | `relatif-sans-absolu` | contredite | — | 12 | `biais:taux-de-base` |

### M — Méthode (8)

| Id | Formats | Zone | Niv. | Preuve sur la page | Piège si | Sain si | F / M / f | Voisins | Effet | Incompatibles | Mondes | Fiche |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `sans-temoin` | E P B | methode-comparaison | 3 | méthode décrite, sans groupe de comparaison | effet attribué à l'intervention sur un simple avant / après | groupe témoin décrit | discrétion | `post-hoc`, `regression`, `auto-selection` | non-etablie | `post-hoc`, `correlation` | 3 4 11 | — |
| `survivant` | E P R | methode, chiffre-cle | 3 | abandons ou non-réponses chiffrés | résultat calculé sur ceux qui sont restés, abandons ≥ 30 % | abandons ≤ 5 % | ≥ 60 % / ≥ 45 % / ≥ 30 % | `auto-selection`, `petit-echantillon` | non-etablie | — | 3 5 8 | `biais:survivant` |
| `auto-selection` | E S R | methode-recrutement | 3 | mode de recrutement écrit (volontaires, lecteurs qui ont répondu) | résultat généralisé à toute la population | tirage au sort décrit | discrétion | `survivant`, `petit-echantillon` | non-etablie | — | 3 4 5 6 | — |
| `correlation` | E B | titre | 3 | « association observée » ou « enquête » dans la méthode | verbe causal dans le titre | titre « est associé à » | discrétion | `post-hoc`, `sans-temoin` | non-etablie | `post-hoc`, `sans-temoin` | 3 4 5 8 | `sophismes:correlation` |
| `post-hoc` | B M R | titre, phrase | 3 | un autre changement daté sur la pièce | « depuis X, Y a changé : grâce à X » | la pièce écarte l'autre changement, ou ne conclut pas | discrétion | `correlation`, `regression`, `fenetre` | non-etablie | `correlation`, `sans-temoin`, `regression` | 1 2 6 10 11 | `sophismes:post-hoc` |
| `regression` | B M | phrase, methode | 3 | sélection sur une valeur extrême écrite, et moyenne habituelle | valeur de sélection ≥ 1,5 × la moyenne habituelle ; retour à la normale présenté comme un effet | valeur de départ ≤ 1,1 × la moyenne | ≥ 2 / ≥ 1,75 / ≥ 1,5 | `post-hoc`, `fenetre` | non-etablie | `post-hoc`, `fenetre` | 2 5 8 | `biais:regression-moyenne` |
| `comparaisons-multiples` | E | methode, resultat | 3 | nombre de critères testés écrit | k ≥ 10 critères, un seul retenu | k ≤ 2, annoncés d'avance | k ≥ 40 / ≥ 20 / ≥ 10 | `fenetre` | non-etablie | — | 3 4 | `sophismes:tireur-elite` |
| `critere-deplace` | M E P | bilan, conclusion | 3 | objectif initial cité | résultat ≤ 0,8 × l'objectif initial, réussite proclamée sur un nouvel objectif | objectif atteint et inchangé | ≤ 0,5 / ≤ 0,65 / ≤ 0,8 | `fenetre` | contredite | — | 1 6 7 11 | `sophismes:poteaux` |

### R — Rhétorique (9)

Tous binaires, posés seulement quand la phrase tire explicitement la conclusion.

| Id | Formats | Zone | Niv. | Preuve sur la page | Piège si | Sain (leurre) si | Voisins | Effet | Incompatibles | Mondes | Fiche |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `temoignage` | P R | temoignage, texte | 1 | aucune donnée d'ensemble sur la pièce | conclusion générale tirée d'un seul témoignage | le témoignage illustre une donnée d'ensemble | `petit-echantillon`, `popularite`, `autorite` | non-etablie | toute pièce portant une figure, un tableau ou un chiffre-clé (familles G et C, `survivant`, `regression`…) | 3 4 5 7 | `sophismes:generalisation-hative` |
| `autorite` | P R B E | citation | 1 | domaine de la personne écrit | la personne parle hors de son domaine, et la conclusion s'appuie sur elle seule | personne citée dans son domaine | `popularite`, `temoignage` | non-etablie | — | 3 4 5 9 | `sophismes:autorite` |
| `popularite` | P R | slogan, texte | 1 | conclusion explicite | « déjà 50 000 abonnés : c'est bien la preuve que ça marche » | la popularité citée comme un fait, sans conclusion | `autorite`, `temoignage` | non-etablie | — | 3 4 7 9 | `sophismes:popularite` |
| `faux-dilemme` | P R M | slogan, citation | 1 | une troisième option citée ailleurs | « soit X, soit Y » | les options présentées comme des exemples | `pente`, `peur` | non-etablie | — | 1 6 9 11 | `sophismes:faux-dilemme` |
| `nature` | P R | slogan | 1 | conclusion explicite | « naturel, donc sans risque » | « naturel » comme simple description | `popularite` | non-etablie | — | 4 | `sophismes:nature` |
| `pente` | R M | citation, texte | 1 | enchaînement d'au moins trois étapes, affirmé sans appui | « si X, alors forcément Y, puis Z » | une seule conséquence, appuyée | `peur`, `faux-dilemme` | non-etablie | — | 1 6 11 | `sophismes:pente-glissante` |
| `peur` | P R M | slogan, texte | 1 | conclusion explicite | une menace sans donnée, puis « donc » | ton vif sur un fait exact (leurre) | `pente`, `faux-dilemme` | non-etablie | — | 2 9 12 | `sophismes:emotion` |
| `question-orientee` | S | question | 2 | libellé exact affiché | présupposé ou qualificatif chargé, pris dans une liste fermée de gabarits | libellé neutre | `faux-dilemme`, `auto-selection` | non-etablie | — | 1 6 10 11 | `sophismes:question-piege` |
| `prix-barre` | P | chiffre-cle (prix) | 1 | l'ancien prix réel dans les petites lignes | prix barré ≥ 1,3 × l'ancien prix réel | prix barré = ancien prix réel | `relatif-sans-absolu` | contredite | — | 4 7 9 | `biais:ancrage` |

Intensité de `prix-barre` (seul procédé R à paramètre) : ≥ 2 / ≥ 1,6 / ≥ 1,3.

### S — Source (3)

| Id | Formats | Zone | Niv. | Preuve sur la page | Piège si | Sain si | F / M / f | Voisins | Effet | Incompatibles | Mondes | Fiche |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `source-absente` | B P R M | source | 3 | zone source présente, vide ou vague (« selon des experts ») | chiffre attribué à une source qu'on ne peut pas retrouver | source nommée et datée | discrétion | `perime`, `conflit` | non-etablie | manque « source » | tous | — |
| `conflit` | E P | methode-financeur | 3 | financeur écrit | la pièce se dit « indépendante » alors que le financeur vend le produit étudié | financeur sans intérêt, ou lien déclaré | discrétion | `source-absente`, `autorite` | aucun | — | 3 4 9 | — |
| `perime` | B P M | source (date) | 3 | date de la donnée écrite | donnée vieille de 5 ans ou plus, présentée comme actuelle | donnée de moins d'un an | ≥ 10 / ≥ 7 / ≥ 5 ans | `fenetre`, `source-absente` | non-etablie | — | 1 8 9 10 | — |

## 3. Procédés réservés au niveau 5 (lot P4)

| Id | Famille | Preuve | Effet | Fiche |
|---|---|---|---|---|
| `simpson` | C | tableau par groupe dans la seconde pièce, total dans la première | contredite | `biais:simpson` |
| `citation-tronquee` | S | citation complète dans la seconde pièce | contredite | `sophismes:hors-contexte` |
| `circulaire` | S | chaque pièce cite l'autre comme source | non-etablie | — |

## 4. Procédé retiré

| Id | Raison |
|---|---|
| `offre-leurre` | Qu'une offre soit dominée se constate sur la page ; qu'elle ait été « placée là » pour en avantager une autre est une intention, qu'on ne peut pas décider. Remplacé par le leurre « trois offres honnêtes » (`biais:leurre`). |

Décompte : G 6, C 8, M 8, R 9, S 3, soit 34 en service (au moins 3 par famille), plus 3 au niveau 5.

## 5. Mondes (12)

Aucun nom propre de lieu, de produit ou d'organisme (journal, « Décisions »).

| N° | Monde | Vérité cachée | Formats naturels |
|---|---|---|---|
| 1 | La ligne 7, devenue gratuite | fréquentation mensuelle sur 5 ans, saisons, date de la gratuité, nouveaux horaires datés | B M S R |
| 2 | Le radar pédagogique à l'entrée du village | vitesses moyennes et excès par mois, petits nombres, mois de l'installation | B M R |
| 3 | L'application de révision | inscrits, abandons, notes avant et après, recrutement, groupe témoin ou non | E P R S |
| 4 | L'infusion du soir | durée de sommeil déclarée, effectif, témoin, financeur, prix | E P R |
| 5 | Le club de course | temps au 10 km, kilomètres par semaine (moyenne et médiane), membres partis | B R E |
| 6 | La rue piétonne | chiffre d'affaires des commerces par mois sur 3 ans, sondage des riverains | S M B R |
| 7 | La jeune entreprise et son application | téléchargements annuels et cumulés, abonnés, prix | P R B |
| 8 | Le lycée | candidats, admis par filière, sélection à l'entrée, taux par année | B M E |
| 9 | Le fournisseur d'électricité | prix au kWh, ancien prix réel, factures (moyenne et médiane), trois offres | P R |
| 10 | La médiathèque | prêts papier et numériques par an, inscrits, horaires élargis datés | B M S |
| 11 | La cantine et le gaspillage | kilos jetés par semaine, changement de pesée daté, objectif initial | M B S |
| 12 | Le portique antivol de la librairie | visiteurs, fréquence réelle des vols, fiabilité du portique, alertes | B P E |

Couleur de chaque monde : une couleur de catégorie existante de `donnees.js`, fixée en P1.

## 6. Formats

| Code | Format | Niv. | Zones (rôles) | Mentions exigées (manques, niveaux 4 et 5) |
|---|---|---|---|---|
| B | Brève de presse | 1 | rubrique, titre, chapô, figure (titre, axe, tracé, légende), 2 ou 3 phrases, source | source, période |
| P | Publicité | 1 | slogan, chiffre-clé, visuel, témoignage, astérisque, petites lignes | base du chiffre |
| S | Sondage | 2 | question, barres, fiche technique (effectif, dates, mode de recueil), commentaire | question exacte, effectif, dates |
| R | Publication de réseau fictif | 2 | compte, texte, image-chiffre, compteur de partages, réponse d'un autre compte | — |
| E | Communiqué d'étude | 3 | titre, résultat, Méthode (effectif, durée, comparaison, financeur), tableau, conclusion | effectif, comparaison, financeur |
| M | Bulletin municipal ou tract | 3 | bandeau, bilan avant / après, citation, encadré chiffres, source | période, source |
| D | Dossier | 5 | deux pièces de formats différents sur la même vérité | — |

## 7. Leurres (13)

| Id | Imite | Formats | Pourquoi ce n'est pas un piège |
|---|---|---|---|
| `ton-vif` | `peur` | P R M | Le ton est vif, mais le fait est exact et aucune conclusion n'en est tirée. |
| `chiffre-rond` | `precision-illusoire`, `source-absente` | tous | Un chiffre rond n'est pas suspect en soi : celui-ci est exact et sourcé sur la pièce. |
| `expert-domaine` | `autorite` | P R B E | La personne parle de son propre domaine : son avis compte, sans suffire à prouver. |
| `courbe-non-nulle` | `axe-tronque` | B M R | Pour une courbe, un axe qui ne part pas de zéro est l'usage : on lit une évolution, pas une proportion. |
| `pourcentage-base` | `pourcentage-sans-base` | P R B | Le pourcentage est accompagné de sa base, et la base est grande. |
| `grand-echantillon` | `petit-echantillon`, `sans-temoin` | E S | Grand effectif et groupe de comparaison : la méthode permet la conclusion. |
| `associe` | `correlation` | E B | Le titre dit « est associé à » : il ne prétend pas à une cause. |
| `temoignage-illustration` | `temoignage` | P R | Le témoignage illustre une donnée d'ensemble présente sur la pièce ; il ne la remplace pas. |
| `popularite-fait` | `popularite` | P R | Le nombre d'utilisateurs est cité comme un fait ; rien n'en est conclu sur la qualité. |
| `petites-lignes` | `prix-barre`, `relatif-sans-absolu` | P | Les petites lignes sont complètes et confirment le slogan. |
| `source-datee` | `source-absente`, `perime` | B P M | La source est nommée, datée, et récente. |
| `hausse-reelle` | `axe-tronque`, `pictogramme` | B M | La hausse est spectaculaire, mais l'axe part de zéro : elle est réelle. |
| `trois-offres` | (ancien `offre-leurre`) | P | Trois offres honnêtes : aucune n'est dominée par une autre. |

## 8. Ce qui trompe (une phrase par procédé)

- `axe-tronque` : l'axe commence au-dessus de zéro, et les barres paraissent bien plus inégales que les valeurs.
- `fenetre` : la période montrée est choisie ; sur la période entière que cite la pièce, la tendance va dans l'autre sens.
- `double-axe` : deux échelles différentes font croiser deux courbes qui, dans la même unité, ne se croisent pas.
- `cumul` : un total cumulé ne peut que monter ; les valeurs de chaque année, elles, baissent.
- `pictogramme` : l'image grandit en largeur et en hauteur, et sa surface exagère le rapport des valeurs.
- `axe-inverse` : l'axe est gradué de haut en bas ; ce qui semble monter descend.
- `relatif-sans-absolu` : une baisse de moitié d'un risque minuscule reste minuscule ; l'écart réel est donné ailleurs.
- `pourcentage-sans-base` : un pourcentage spectaculaire calculé sur quelques unités ne dit presque rien.
- `points-pourcentage` : passer de 10 % à 15 %, c'est 5 points de plus, mais une hausse de 50 %.
- `moyenne-mediane` : quelques valeurs extrêmes tirent la moyenne ; le cas typique est la médiane, citée sur la pièce.
- `petit-echantillon` : sur si peu de personnes, le hasard suffit à produire l'écart observé.
- `precision-illusoire` : l'écart est plus petit que la marge d'erreur du sondage ; le classement n'est pas établi.
- `denominateur` : les deux taux ne sont pas rapportés à la même base ; les comparer n'a pas de sens.
- `taux-de-base` : l'événement est rare ; la plupart des alertes sont donc fausses, malgré un test fiable.
- `sans-temoin` : sans groupe de comparaison, rien ne dit que le changement ne serait pas arrivé de toute façon.
- `survivant` : seuls ceux qui sont restés sont comptés ; ceux qui ont abandonné auraient changé le résultat.
- `auto-selection` : des volontaires ne ressemblent pas à l'ensemble de la population.
- `correlation` : la méthode n'observe qu'une association ; le titre en fait une cause.
- `post-hoc` : un autre changement est arrivé au même moment ; l'ordre des dates ne désigne pas la cause.
- `regression` : on a agi après une valeur exceptionnelle ; un retour à la normale était attendu de toute façon.
- `comparaisons-multiples` : sur tant de critères testés, un résultat favorable par hasard était probable.
- `critere-deplace` : l'objectif annoncé au départ n'est pas atteint ; la réussite est mesurée à un objectif choisi après coup.
- `temoignage` : une expérience individuelle ne dit pas ce qui arrive à la plupart des gens.
- `autorite` : la personne est compétente, mais dans un autre domaine.
- `popularite` : qu'un produit soit très utilisé ne prouve pas qu'il fasse ce qu'il promet.
- `faux-dilemme` : la pièce elle-même cite une troisième possibilité.
- `nature` : « naturel » ne veut dire ni sans risque, ni efficace.
- `pente` : chaque étape de l'enchaînement est affirmée, aucune n'est montrée.
- `peur` : la menace n'est appuyée sur aucune donnée, et la conclusion en est tirée quand même.
- `question-orientee` : la question suggère sa réponse ; le résultat mesure le libellé autant que l'opinion.
- `prix-barre` : le prix barré n'a jamais été pratiqué ; l'ancien prix réel est dans les petites lignes.
- `source-absente` : « des experts » ou « une étude récente » : impossible de vérifier.
- `conflit` : l'étude se dit indépendante, mais le financeur vend le produit.
- `perime` : la donnée date de plusieurs années et elle est présentée comme actuelle.

## 9. Noms inventés

- Comptes du réseau fictif : `Ruelle_Verte`, `Quai_Nord`, `Petit_Pont`, `Lanterne_42`, `Moulin_Bleu`, `Pavé_Mouillé`.
- Prénoms des témoins (épicènes, sans nom de famille) : Camille, Sacha, Alix, Lou, Noa, Charlie, Dominique, Claude.
- Rubriques de brève : « Vie locale », « Transports », « Éducation », « Consommation », « Sport ».
- Signature : « La rédaction » ; organismes : « l'observatoire de la ligne », « le service des sports », sans nom propre.
