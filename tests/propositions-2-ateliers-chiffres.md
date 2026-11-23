# Propositions 2 : ateliers chiffrés

> **Bilan de la contre-vérification (23 novembre 2026)** : 24 éléments. **19 VALIDÉS**, **5 À CORRIGER** (corrections
> déjà portées dans les blocs de code : `dette-usa`, `cables-sous-marins`, `premier-chiffres`, `oiseaux-sauvages`,
> `taiwan-allies`), **0 REJETÉ**. La correction proposée pour l'élément existant `GRANDEURS` « oceans »
> (`v: 1.332e9`) est confirmée sur l'article. Les trois produits de Fermi ont été recalculés : écarts de −0,01 %,
> −0,02 % et +0,02 %. Aucun doublon dans `static/*.js`, `static/grand-test-donnees.js` ni dans les autres
> propositions. Les sujets voisins (`vf-cellules-sept-ans`, `bacteries-cellules`, `terre-vitesse`,
> `oceans-profondeur`) portent sur une autre quantité ou sont joués dans un autre atelier.
> Cas les plus délicats : `oiseaux-sauvages` (l'article ne dit pas en toutes lettres que la volaille est exclue ;
> National Geographic et Smithsonian le confirment), `taiwan-allies` (reformulé), `cables-sous-marins` (ce sont
> TeleGeography et Prysmian qui donnent environ 1,5 million de km ; le chiffre d'environ 1,7 million attribué à l'UIT
> et à l'ICPC n'a été lu que de seconde main), `terres-rares-chine` (69 % selon l'USGS pour l'ensemble des terres
> rares, 60 % selon l'AIE pour les seules terres rares des aimants : périmètres différents).

Propositions pour quatre banques de `static/jeux-donnees.js` : `GRANDEURS` (8), `ETALONNAGE` (8), `ANCRES` (5) et
`FERMI` (3). Toutes les valeurs ont été relues le 22 novembre 2026 sur les pages citées. Elles restent à
contre-vérifier par l'agent `verificateur-sources`.

Répartition par thème : géopolitique 9 (Ormuz, dette américaine, câbles sous-marins, terres rares, Taïwan, dollar,
frontière Canada–États-Unis, Groenland, canal de Suez) ; histoire 3 (traite transatlantique, Bandung, Westphalie) ;
sciences 4 ; nature 3 ; corps humain 3 ; économie : dette, dollar et terres rares.

Recherche de doublons (grep sur `static/*.js`, dont `grand-test-donnees.js`, `static/en/*.js` et
`tests/propositions-*.md`) : aucun mot-clé repris (Ormuz, Mersenne, nombre premier, câbles, négriers, terres rares,
Taïwan, réserves de change, Bandung, Westphalie, mille-pattes). Les sujets voisins déjà présents portent sur une autre
quantité : `VRAI_FAUX` « groenland » et « groenland-ue » (superficie, Union européenne), `ANCRES` « suez » (année
d'ouverture), `GRANDEURS` « oiseaux » (nombre d'espèces) et « bacteries » (nombre), `ETALONNAGE` « terre-vitesse ».

Remarques sur le code, à garder en tête pour l'intégration :
- Ces banques ne sont pas tirées chaque jour (`tirerSelonNiveau`, `tirerNouveaux`) : pas de `depuis:`, et elles ne
  figurent pas dans `tests/rotation-manifeste.json`.
- `FERMI` : l'`id` doit être celui d'une entrée de `GRANDEURS`, et le produit des facteurs doit retrouver `v` à 2 %
  près (banc `ateliers`, « Fermi : … à 2 % près »). Les trois produits ont été recalculés (voir plus bas).
- `ANCRES` : l'ancre vaut `v` × 2 à 4 (haute) ou `v` × 0,25 à 0,5 (basse), arrondie à deux chiffres significatifs
  par `arrondir2` ; pour une année, `v` ± 80 à 200 ans ; pour un pourcentage, l'ancre est plafonnée à 99. La réponse
  doit être strictement positive. Toutes les valeurs proposées sont des nombres positifs.
- `GRANDEURS` : les questions qui commencent par « Nombre » ou « Population » entrent dans les classements des niveaux
  4 et 5 (`tirerClassementGrandeurs`). Quatre propositions en font partie : `traite`, `premier-chiffres`,
  `oiseaux-sauvages` et `cellules-jour`.
- **Correction d'une valeur existante** : `GRANDEURS` « oceans » donne `v: 1.335e9` en citant Charette et Smith
  (2010). L'article donne 1,3324 × 10⁹ km³ (tableau 1 : « 3682.2 361.84 1.3324 This study ») ; 1,335 est une autre
  estimation. Proposition : `v: 1.332e9`. Le Fermi `oceans` ci-dessous retrouve les deux valeurs à 2 % près.
- `ANCRES` « oceans-profondeur » (3 682 m) et `ETALONNAGE` « terre-vitesse » (29,8 km/s) apparaissent comme facteurs
  dans les Fermi `oceans` et `terre-orbite`, affichés seulement après la réponse : pas de fuite pendant le jeu.
- Tous les textes passent par `T()` : lancer ensuite `tests/en/extraire.py --manquants`, `ajouter.py`, `controle.py`.

Calculs exécutés (Python) :

```
ormuz         20e6 × 158,987 × 366           = 1,16378e12 L   ; facteurs arrondis 20e6 × 159 × 366 : écart −0,01 % avec v = 1.164e12
terre-orbite  2π × 149,598e6 km              = 9,39952e8 km   ; Fermi 29,78 × 31 557 600 = 9,39785e8 : écart −0,02 % avec v = 9.4e8
oceans        3,6184e8 km² × 3,682 km        = 1,33229e9 km³  ; écart −0,20 % avec 1.335e9 (actuel), +0,02 % avec 1.332e9
terres rares  270 000 / 390 000              = 0,6923, soit 69 %
dette         40 709 780 700 317,02 $        → v = 4.071e13
```

---

## GRANDEURS

Format : `{ id, niveau, q, v, source }`. `q` porte l'unité quand ce n'est pas un effectif ; `v` est placé sur une
échelle logarithmique (3 points à moins d'un facteur 2). Niveaux : 1, quantités familières ; 2, quantités qu'on peut
reconstituer par un raisonnement ; 3, très grands nombres sans repère quotidien.

### 1. `ormuz` (géopolitique)

```js
  { id: "ormuz", niveau: 3, q: "Volume de pétrole (brut et produits pétroliers) passé par le détroit d'Ormuz en 2024, en litres", v: 1.164e12, source: "calcul : 20 millions de barils par jour en 2024, environ 20 % de la consommation mondiale de pétrole (EIA), à 159 litres le baril" },
```

Sources :
- https://www.eia.gov/todayinenergy/detail.php?id=65504 (EIA, « Amid regional conflict, the Strait of Hormuz remains
  critical oil chokepoint », 16 juin 2025) : « In 2024, oil flow through the strait averaged 20 million barrels per
  day (b/d), or the equivalent of about 20% of global petroleum liquids consumption. » La page distingue ensuite le
  brut et le condensat des produits pétroliers : le chiffre de 20 millions couvre les deux (« total oil flows »).
- https://www.eia.gov/energyexplained/oil-and-petroleum-products/ : « A U.S. 42-gallon barrel of crude oil yields
  about 45 gallons of petroleum products » (baril de 42 gallons américains). Conversion : 42 × 3,785411784 L
  (gallon américain légal de 231 pouces cubes) = 158,987 L.
- Calcul : 20e6 × 158,987 × 366 (2024 est bissextile) = 1,164 × 10¹² L.
- Mode : primaire.
- Point à vérifier : aucune donnée 2025 complète publiée par l'EIA n'a été trouvée ; l'article indique seulement
  des flux « relativement stables » au premier trimestre 2025.

Contre-vérification : VALIDÉ. Page de l'EIA relue : « In 2024, oil flow through the strait averaged 20 million barrels
per day » ; elle distingue ensuite le brut et le condensat des produits, donc le chiffre couvre bien les deux. Source
indépendante : l'AIE, https://www.iea.org/about/oil-security-and-emergency-response/strait-of-hormuz : « an average of
20 million barrels per day (mb/d) of crude oil and oil products were shipped in 2025 ». Calcul refait : 20e6 × 159 × 366
= 1,1639 × 10¹² L, et 1,1638 × 10¹² L avec 158,987 L. À noter : selon l'AIE (commentaire du 22 juin 2026), le flux est
tombé à 2,7 millions de barils par jour en moyenne de mars à mai 2026. La question est datée de 2024, donc elle reste
juste, mais elle ne décrit pas la situation de 2026.

### 2. `dette-usa` (géopolitique, économie)

```js
  // Trésor américain, API « Debt to the Penny », lue le 22 novembre 2026 : tot_pub_debt_out_amt = 40709780700317.02 au 2026-11-19
  { id: "dette-usa", niveau: 2, q: "Dette publique fédérale des États-Unis au 19 novembre 2026, en dollars", v: 4.071e13, source: "40 710 milliards de dollars au 19 novembre 2026, y compris 7 808 milliards détenus par des organismes fédéraux (Trésor américain, « Debt to the Penny »)" },
```

Sources :
- https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny et l'API du même jeu de données,
  https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date :
  `"record_date":"2026-11-19"`, `"tot_pub_debt_out_amt":"40709780700317.02"` (« Total Public Debt Outstanding » ;
  dont 32 901 milliards détenus par le public et 7 808 milliards par des organismes fédéraux).
- Mode : primaire.
- Point d'attention : la valeur augmente chaque jour (+19 milliards entre le 18 et le 19 novembre 2026). Sur une
  échelle logarithmique, l'écart restera négligeable pendant des années, mais la date doit rester dans la source.

Contre-vérification : À CORRIGER (bloc de code corrigé). L'API relue donne `"record_date":"2026-11-19"`,
`"tot_pub_debt_out_amt":"40709780700317.02"`, dont `"intragov_hold_amt":"7808320725227.76"`. La valeur bouge chaque jour :
la date passe dans la question elle-même, affichée avant la réponse (la source ne s'affiche qu'après). La source précise
que ce total brut comprend la dette détenue par des organismes fédéraux. Source indépendante : la presse (Al Jazeera,
Irish Times, NPR, 19 août 2026) rapporte le passage du seuil de 40 000 milliards le 18 août 2026, ce qui concorde.

### 3. `cables-sous-marins` (géopolitique)

```js
  { id: "cables-sous-marins", niveau: 3, q: "Longueur totale des câbles sous-marins de télécommunication en service début 2026, en kilomètres", v: 1.5e6, source: "plus de 1,5 million de km début 2026 (TeleGeography)" },
```

Sources :
- https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions : « As of early 2026, we believe there
  are over 1.5 million kilometers of submarine cables in service globally. » et « As of 2026, we track more than 600
  active and planned submarine cables. »
- Mode : primaire (TeleGeography tient la carte de référence des câbles sous-marins).

Contre-vérification : À CORRIGER (bloc de code corrigé). La page de TeleGeography relue donne bien « As of early 2026,
we believe there are over 1.5 million kilometers of submarine cables in service globally ». La valeur augmente
(l'UIT compte près de 200 000 km posés en 2024), donc la date passe dans la question. Source indépendante : l'UIT
(https://www.itu.int/en/mediacentre/backgrounders/Pages/submarine-cable-resilience.aspx) confirme l'ampleur du réseau
(plus de 500 systèmes, 200 000 km posés en 2024), mais pas la longueur totale. Un chiffre d'environ 1,7 million de km
est attribué à l'UIT et à l'ICPC, mais je ne l'ai lu que de seconde main. L'écart est bien inférieur au facteur 2 de
l'échelle, et « plus de 1,5 million » reste juste.

### 4. `traite` (histoire, géopolitique)

```js
  { id: "traite", niveau: 2, q: "Nombre d'Africains embarqués de force sur les navires de la traite transatlantique, de 1501 à 1866", v: 1.25e7, source: "estimation : 12,5 millions (base de données Slave Voyages)" },
```

Sources :
- https://legacy.slavevoyages.org/assessment/estimates (tableau des estimations, par pavillon et par période de
  25 ans, de 1501-1525 à 1851-1875) : ligne « Totals », dernière colonne : « 12,521,337 » (Espagne et Uruguay
  1 061 524 ; Portugal et Brésil 5 848 266 ; Grande-Bretagne 3 259 441 ; Pays-Bas 554 336 ; États-Unis 305 326 ;
  France 1 381 404 ; Danemark et Baltique 111 040).
- https://www.neh.gov/humanities/2010/septemberoctober/feature/gross-injustice (Humanities, revue du National
  Endowment for the Humanities, 2010) : « 350 years. 43,600 voyages. 12.5 million Africans forced aboard European and
  American slave ships. »
- Mode : primaire (base Slave Voyages), confirmée par la revue du NEH.
- Point à vérifier : la page ne dit pas en clair que le tableau par défaut compte les captifs embarqués (et non
  débarqués) ; le total concorde avec le chiffre « forced aboard » du NEH. Les bornes 1501-1866 sont celles du projet.

Contre-vérification : VALIDÉ. Le code HTML de la page relue montre que le tableau par défaut est réglé sur
« Cells: Only embarked » (`<option value="1" selected>Only embarked</option>`) : ce sont donc bien les captifs embarqués.
Total « 12,521,337 » ; « Full extent of coverage by estimates is 1501 - 1866 ». Source indépendante : la revue du NEH :
« 12.5 million Africans forced aboard European and American slave ships ».

### 5. `premier-chiffres` (sciences)

```js
  { id: "premier-chiffres", niveau: 3, q: "Nombre de chiffres du plus grand nombre premier connu en novembre 2026", v: 41024320, source: "2 puissance 136 279 841, moins 1, découvert le 12 octobre 2024 : 41 024 320 chiffres (GIMPS)" },
```

Sources :
- https://www.mersenne.org/primes/?press=M136279841 : « has discovered the largest known prime number,
  2^136,279,841-1, having 41,024,320 decimal digits » ; « Luke Durant, from San Jose, California, found the prime on
  October 12th. »
- https://www.mersenne.org/ (lu le 22 novembre 2026) : le record annoncé est toujours 2^136279841 − 1 ; la dernière
  actualité (4 septembre 2026) porte sur M82589933, pas sur un nouveau record.
- Mode : primaire.

Contre-vérification : À CORRIGER (bloc de code corrigé). Le communiqué du GIMPS relu dit : « 2^136,279,841-1, having
41,024,320 decimal digits », trouvé le 12 octobre (2024). La page d'accueil n'annonce aucun nouveau record en 2025-2026.
Source indépendante : les Prime Pages (https://t5k.org/primes/lists/all.txt, liste du 23 novembre 2026), où il figure au
rang 1 : 2^136279841 − 1, 41 024 320 chiffres, 2024. Un record peut tomber à tout moment : la question porte donc la date.

### 6. `oiseaux-sauvages` (nature)

```js
  // Volaille exclue : vérifié via National Geographic (« this study only looked at wild birds », poulets ≈ 25 milliards à part)
  // et Smithsonian (« 50 billion total wild birds »), qui citent Callaghan et al. (2021) ; l'étude repose sur les observations eBird
  { id: "oiseaux-sauvages", niveau: 2, q: "Nombre d'oiseaux sauvages sur Terre", v: 5e10, source: "environ 50 milliards, à peu près six par être humain, volailles d'élevage non comptées ; estimation très incertaine (Callaghan, Nakagawa et Cornwell, PNAS, 2021)" },
```

Sources :
- https://www.pnas.org/doi/10.1073/pnas.2023170118 (403 ; résumé lu sur Europe PMC,
  https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1073/pnas.2023170118&resultType=core&format=json,
  et texte intégral sur https://pmc.ncbi.nlm.nih.gov/articles/PMC8166167/) : « By aggregating the species-level
  estimates, we find that there are ∼50 billion individual birds in the world at present. » et « We calculate that
  there are likely to be ∼50 billion individual birds in the world at present: about six birds for every human on the
  planet. »
- Mode : primaire.
- Point à vérifier : l'article estime l'abondance de 9 700 espèces à partir d'observations (eBird) ; il ne dit pas en
  toutes lettres que la volaille domestique est exclue. Si le vérificateur ne peut pas le confirmer, remplacer
  « oiseaux sauvages » par « oiseaux de 9 700 espèces » ou écarter l'élément.

Contre-vérification : À CORRIGER (bloc de code corrigé). J'ai relu le texte intégral sur PMC : « ∼50 billion individual
birds in the world at present », pour 9 700 espèces (environ 92 % des espèces actuelles). L'article ne parle nulle part
de volaille ni de poulet. Deux sources secondaires sérieuses et concordantes disent que seuls les oiseaux sauvages sont
comptés. National Geographic : « the estimated world population of domestic chickens is somewhere around 25 billion »,
« But this study only looked at wild birds ». Smithsonian (19 mai 2021) : « at least 50 billion total wild birds ».
L'énoncé « oiseaux sauvages » est donc juste. La source affichée précise maintenant que les volailles ne sont pas
comptées. National Geographic insiste sur la forte incertitude (fourchette jusqu'à environ 428 milliards), d'où
« très incertaine ».

### 7. `cellules-jour` (corps humain)

```js
  { id: "cellules-jour", niveau: 3, q: "Nombre de cellules que le corps d'un adulte remplace chaque jour", v: 3.3e11, source: "environ 330 milliards, dont près de 90 % de cellules sanguines (Sender et Milo, Nature Medicine, 2021)" },
```

Sources :
- Sender et Milo, « The distribution of cellular turnover in the human body », Nature Medicine, 2021,
  doi:10.1038/s41591-020-01182-9 ; résumé lu sur
  https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1038/s41591-020-01182-9&resultType=core&format=json :
  « We found a total cellular mass turnover of 80 ± 20 grams per day, dominated by blood cells and gut epithelial
  cells. In terms of cell numbers, close to 90% of the (0.33 ± 0.02) × 10^12 cells per day turnover was blood cells. »
- Mode : primaire.
- Point d'attention : l'adulte de référence des auteurs est l'« homme de référence » de 70 kg, comme dans
  `cellules` et `bacteries` (Sender, Fuchs et Milo, 2016).

Contre-vérification : VALIDÉ. Résumé relu (Europe PMC) : « close to 90% of the (0.33 ± 0.02) × 10^12 cells per day
turnover was blood cells ». Source indépendante : Scientific American, « Our Bodies Replace Billions of Cells Every
Day » : « About 330 billion cells are replaced daily, equivalent to about 1 percent of all our cells ». Pas de doublon
avec `vf-cellules-sept-ans` (grand test), qui porte sur un autre point.

### 8. `terre-orbite` (sciences)

```js
  { id: "terre-orbite", niveau: 2, q: "Distance parcourue en un an par la Terre sur son orbite autour du Soleil, en kilomètres", v: 9.4e8, source: "calcul : une orbite presque circulaire de 149,6 millions de km de rayon moyen, soit environ 940 millions de km (NASA)" },
```

Sources :
- https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html (fiche Terre de la NASA) : « Semimajor axis
  (10^6 km) 149.598 », « Sidereal orbit period (days) 365.256 », « Mean orbital velocity (km/s) 29.78 ».
- Calcul : 2π × 149,598 × 10⁶ = 9,3995 × 10⁸ km (l'excentricité de l'orbite, 0,0167, change le périmètre de moins de
  0,01 %) ; contrôle : 29,78 km/s × 365,256 × 86 400 s = 9,398 × 10⁸ km.
- Mode : primaire.

Contre-vérification : VALIDÉ. Fiche de la NASA relue : « Semimajor axis (10^6 km) 149.598 », « Mean orbital velocity
(km/s) 29.78 », « Orbit eccentricity 0.0167 ». Calculs refaits : 2π × 149,598e6 = 9,3995 × 10⁸ km, et 29,78 × 31 557 600
= 9,3979 × 10⁸ km. Les deux calculs concordent et retrouvent 9,4 × 10⁸. Le recoupement tient lieu de seconde source.

---

## ETALONNAGE

Format : `{ id, niveau, q, unite, v, note }`. `unite: ""` pour une année. Le joueur donne une fourchette à 90 % ; le
score de fourchette mesure les écarts en ordres de grandeur (les années, en siècles). Niveaux : 1, quantités et dates
très connues ; 2, culture générale précise ; 3, quantités rarement rencontrées.

### 1. `terres-rares-chine` (géopolitique, économie)

```js
  { id: "terres-rares-chine", niveau: 3, q: "Part de la Chine dans la production minière mondiale de terres rares en 2025", unite: "%", v: 69, note: "270 000 tonnes sur 390 000, estimation de l'USGS (Mineral Commodity Summaries 2026)" },
```

Sources :
- https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-rare-earths.pdf (USGS, Mineral Commodity Summaries, février 2026,
  « Rare earths », données en tonnes d'équivalent oxydes) : tableau « World Mine Production and Reserves », colonne
  2025 : « China 270,000 », « World total (rounded) 390,000 ». Même page : « In April 2025, China tightened its export
  controls on rare-earth elements ».
- Calcul : 270 000 / 390 000 = 69,2 %.
- Mode : primaire.

Contre-vérification : VALIDÉ. PDF de l'USGS relu (texte extrait) : « China 270,000 270,000 » (2024 et 2025, estimés),
« World total (rounded) 380,000 390,000 », et « In April 2025, China tightened its export controls ». 270/390 = 69,2 %.
Source indépendante : l'AIE (https://www.iea.org/reports/rare-earth-elements/executive-summary) indique que la Chine
« accounted for 60% of global mined production of magnet rare earths » en 2024. Le périmètre est plus étroit (néodyme,
praséodyme, dysprosium, terbium), mais l'ordre de grandeur concorde. La note cite l'USGS et dit « estimation » :
c'est suffisant.

### 2. `taiwan-allies` (géopolitique)

```js
  // Liste du ministère des Affaires étrangères de la République de Chine (mise à jour le 2 novembre 2026), concordante avec
  // la liste de Reuters du 2 mai 2026 (« Factbox-Taiwan's 12 remaining diplomatic allies »)
  { id: "taiwan-allies", niveau: 3, q: "Nombre d'États qui entretiennent des relations diplomatiques officielles avec la République de Chine (Taïwan), en novembre 2026", unite: "États", v: 12, note: "sept en Amérique latine et dans les Caraïbes, trois dans le Pacifique, l'Eswatini et le Saint-Siège (ministère des Affaires étrangères de la République de Chine, liste du 2 novembre 2026 ; Reuters)" },
```

Sources :
- https://en.mofa.gov.tw/AlliesIndex.aspx?n=1294&sms=1007 (liste des « Diplomatic Allies », lue le 22 novembre 2026) :
  Asie de l'Est et Pacifique : Marshall Islands, Republic of Palau, Tuvalu ; Afrique : Eswatini ; Europe : Holy See ;
  Amérique latine et Caraïbes : Belize, Republic of Guatemala, Haiti, Republic of Paraguay, St. Kitts and Nevis,
  Saint Lucia, St. Vincent & the Grenadines. Total : 12.
- Mode : primaire.
- Point d'attention : la valeur peut changer (rupture d'un allié) ; la question porte donc la date.

Contre-vérification : À CORRIGER (bloc de code corrigé). La page du ministère, relue avec WebFetch (« Last Updated:
2026-11-02 »), liste 12 États : Marshall Islands, Palau, Tuvalu ; Eswatini ; Holy See ; Belize, Guatemala, Haiti,
Paraguay, St. Kitts and Nevis, Saint Lucia, St. Vincent & the Grenadines. Source indépendante : Reuters, « Factbox-Taiwan's
12 remaining diplomatic allies » (2 mai 2026, republié par ThePrint), qui donne la même liste. Pour la neutralité,
« reconnaissent officiellement Taïwan » devient la formulation factuelle demandée : « entretiennent des relations
diplomatiques officielles avec la République de Chine (Taïwan) ». La note dit maintenant « ministère des Affaires
étrangères de la République de Chine », date la liste et cite Reuters. Le Saint-Siège n'est pas membre de l'ONU, mais
Reuters et le ministère le comptent parmi les 12.

### 3. `dollar-reserves` (géopolitique, économie)

```js
  { id: "dollar-reserves", niveau: 2, q: "Part du dollar américain dans les réserves de change officielles du monde (2e trimestre 2026)", unite: "%", v: 56.7, note: "56,70 % ; euro : 20,60 % (FMI, enquête COFER)" },
```

Sources :
- https://data.imf.org/en/news/imf-data-brief-september-30 (« IMF Data Brief: Currency Composition of Official
  Foreign Exchange Reserves », 30 septembre 2026) : « the dollar's share of global foreign exchange reserves declined
  to 56.70 percent », « from 57.18 percent in the previous quarter ». La part de l'euro, 20,60 %, est donnée par la même
  note (relevée via la recherche ; à relire sur la page).
- Mode : primaire.
- Point d'attention : le FMI a changé de méthode au 3e trimestre 2025 (toutes les réserves sont désormais réparties
  par monnaie) ; ne pas comparer avec les 56,32 % du 2e trimestre 2025.

Contre-vérification : VALIDÉ. Note du FMI relue avec WebFetch (curl reçoit un refus d'accès) : « the dollar's share of
global foreign exchange reserves declined to 56.70 percent, from 57.18 percent in the previous quarter ». La part de
l'euro figure bien sur la même page : « The euro's share of global foreign exchange reserves increased to 20.60 percent
in 2026Q2, from 20.04 percent in 2026Q1 ». La note peut donc la garder. Source indépendante : Central Banking (1er octobre
2026), « Dollar's share of foreign reserves fell slightly in Q2 – IMF » : « 56.7% at the end of June ».

### 4. `frontiere-canada` (géopolitique, géographie)

```js
  { id: "frontiere-canada", niveau: 2, q: "Longueur de la frontière entre le Canada et les États-Unis, Alaska compris", unite: "km", v: 8891, note: "dont 2 475 km avec l'Alaska (Commission de la frontière internationale)" },
```

Sources :
- https://www.internationalboundarycommission.org/en/about/the-boundary.php : « the line snakes 8,891 kilometres or
  5,525 miles across North America ».
- https://www.internationalboundarycommission.org/en/the-boundary-and-you/interesting-facts.php : « The International
  Boundary Commission, under International Treaty, maintains the 8,891 km (5,525 miles) boundary shown on 256 official
  boundary maps. » ; « Alaska - 1,538 miles or 2,475 km » ; « Boundary on Land 5,061 km », « Boundary on Water 3,830 km ».
- Mode : primaire (commission binationale chargée de la frontière).

Contre-vérification : VALIDÉ. Les deux pages de la Commission ont été relues : « 8,891 kilometres or 5,525 miles »,
« Alaska - 1,538 miles or 2,475 km », « Boundary on Land 5,061 km », « Boundary on Water 3,830 km ». La Commission est
l'autorité binationale chargée de la frontière : sa page fait foi, et je n'ai pas cherché d'autre source.

### 5. `bandung` (histoire, géopolitique)

```js
  { id: "bandung", niveau: 3, q: "Année de la conférence de Bandung (Indonésie), qui réunit vingt-neuf pays d'Asie et d'Afrique", unite: "", v: 1955, note: "avril 1955 (Office of the Historian, département d'État des États-Unis ; musée de la Conférence asiatique-africaine, Bandung)" },
```

Sources :
- https://history.state.gov/milestones/1953-1960/bandung-conf : « In April, 1955, representatives from twenty-nine
  governments of Asian and African nations gathered in Bandung, Indonesia ».
- https://asianafricanmuseum.org/en/sejarah-konferensi-asia-afrika/ (musée de la Conférence, à Bandung) :
  « Berlokasi di Bandung, Museum KAA memiliki sejarah sebagai tempat Konferensi Asia Afrika tahun 1955. »
- Mode : indirect, vérifié via l'Office of the Historian du département d'État et le musée de la Conférence
  asiatique-africaine, qui citent tous deux la conférence d'avril 1955 (les actes de la conférence n'ont pas été lus).

Contre-vérification : VALIDÉ. Office of the Historian relu : « In April, 1955, representatives from twenty-nine
governments of Asian and African nations gathered in Bandung, Indonesia ». Musée de la Conférence relu : « tempat
Konferensi Asia Afrika tahun 1955 ». Ce sont deux sources sérieuses, indépendantes et concordantes.

### 6. `liberation` (sciences)

```js
  { id: "liberation", niveau: 2, q: "Vitesse de libération de la Terre : vitesse minimale, au départ de sa surface, pour échapper à son attraction sans propulsion", unite: "km/s", v: 11.2, note: "11,186 km/s (NASA)" },
```

Sources :
- https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html : « Escape velocity (km/s) 11.186 ».
- Mode : primaire.
- Remplace une première idée (température de surface du Soleil), écartée parce que `VRAI_FAUX` « eclair » donne
  déjà « environ 5 500 °C à la surface du Soleil ».

Contre-vérification : VALIDÉ. Fiche de la NASA relue : « Escape velocity (km/s) 11.186 ». C'est une constante physique
publiée par la NASA, et cette fiche primaire suffit. Pas de doublon : « libération » n'apparaît ailleurs que dans
d'autres sens.

### 7. `baleine-cuvier` (nature)

```js
  { id: "baleine-cuvier", niveau: 3, q: "Profondeur de la plus profonde plongée mesurée chez une baleine à bec de Cuvier", unite: "m", v: 2992, note: "plongée de 137,5 minutes, deux records pour un mammifère à leur publication (Schorr et al., PLoS ONE, 2014)" },
```

Sources :
- Schorr et al., « First long-term behavioral records from Cuvier's beaked whales (Ziphius cavirostris) reveal
  record-breaking dives », PLoS ONE, 2014, doi:10.1371/journal.pone.0092633 ; résumé lu sur
  https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1371/journal.pone.0092633&resultType=core&format=json :
  « included dives to 2992 m depth and lasting 137.5 min, both new mammalian dive records ».
- Mode : primaire.
- Point à vérifier : aucune recherche n'a été faite sur des records publiés après 2014. La note dit donc « à leur
  publication », et la question porte sur la baleine à bec de Cuvier seule, pas sur « le record des mammifères ». Le
  vérificateur doit confirmer qu'aucune plongée plus profonde de cette espèce n'a été publiée depuis.

Contre-vérification : VALIDÉ. Résumé relu : « included dives to 2992 m depth and lasting 137.5 min, both new mammalian
dive records ». Recherche de records publiés depuis 2014 (Europe PMC, publications de 2015 à 2026) : aucune plongée de
baleine à bec de Cuvier plus profonde. Shearer et al. (R. Soc. Open Sci., 2019, Cap Hatteras) donnent une médiane de
1 456 m pour les plongées profondes. Une étude de 2025 sur l'hyperoodon boréal (autre espèce) atteint 2 288 m. Sources
indépendantes : Guinness World Records, « Deepest dive by a mammal », 2 992 m ; le Natural History Museum de Londres :
« The deepest recorded dive was 2,992 metres », sans record plus profond. Le record de durée a été dépassé depuis
(plongées de 173 et 222 minutes selon le NHM). La note dit « à leur publication » : elle reste juste.

### 8. `genes` (corps humain)

```js
  { id: "genes", niveau: 3, q: "Nombre de gènes codant des protéines dans le génome humain", unite: "gènes", v: 19442, note: "GENCODE, version 50 (juin 2026) ; s'y ajoutent près de 36 000 gènes d'ARN longs non codants" },
```

Sources :
- https://www.gencodegenes.org/human/stats.html : « Statistics about the current GENCODE Release (version 50) » ;
  « Protein-coding genes 19442 » ; « Long non-coding RNA genes 35885 ».
- https://www.gencodegenes.org/human/releases.html : version 50, « 06.2026 », GRCh38.p14, Ensembl 116.
- Mode : primaire.
- Point d'attention : le décompte varie légèrement d'une version à l'autre (quelques dizaines de gènes) ; la note
  date la version.

Contre-vérification : VALIDÉ. Pages de GENCODE relues : « current GENCODE Release (version 50) », « Protein-coding
genes 19442 », « Long non-coding RNA genes 35885 », version 50 datée « 06.2026 ». Source indépendante : Amaral et al.,
« The status of the human gene catalogue », Nature, 2023 (résumé sur Europe PMC) : gènes codants « currently estimated
to number fewer than 20,000 ». Les deux concordent. La valeur exacte dépend de la base, et la note date la version.

---

## ANCRES

Format : `{ id, q, unite, v, note, [annee: true | pourcent: true] }`. Pas de niveau. Le jeu affiche « {q} : plus ou
moins de {ancre} {unite} ? », puis demande une estimation positive.

### 1. `groenland-pop` (géopolitique)

```js
  { id: "groenland-pop", q: "Population du Groenland au 1er janvier 2026", unite: "habitants", v: 56740, note: "Statistique Groenland" },
```

Ancre : haute de 110 000 à 230 000, basse de 14 000 à 28 000 habitants.

Sources :
- https://stat.gl/publ/en/BE/202601/contents/Population%20estimates.htm : « On 1 January 2026, there were 56,740 people
  living in Greenland. »
- Mode : primaire.
- Point à vérifier : le titre de la page dit « Population increased by 198 in 2025 », mais son texte dit que la
  population « has thus decreased by 198 » ; la note ne mentionne donc pas l'évolution. Des chiffres trimestriels plus
  récents existent (56 945 au 1er juillet 2026), mais la publication suivante est incohérente (date manifestement
  erronée) : le chiffre annuel au 1er janvier est le plus sûr.

Contre-vérification : VALIDÉ. Page de Statistique Groenland relue : « On 1 January 2026, there were 56,740 people
living in Greenland ». Son tableau donne 56 542 (2025) puis 56 740 (2026), soit +198 : c'est le titre (« increased »)
qui est juste, et la phrase « decreased » qui se trompe. La note, qui ne parle pas de l'évolution, est prudente.
L'institut statistique national est la source primaire, et je n'ai pas cherché d'autre source. Ancres : 56 740 × 2 à 4
et × 0,25 à 0,5, arrondies par `arrondir2`, donnent bien 110 000 à 230 000 et 14 000 à 28 000.

### 2. `westphalie` (histoire, géopolitique)

```js
  { id: "westphalie", q: "Année des traités de Westphalie, qui mettent fin à la guerre de Trente Ans", unite: "", v: 1648, annee: true, note: "traité de Münster, conclu le 24 octobre 1648 (texte publié par l'Avalon Project, université Yale)" },
```

Ancre : de 1728 à 1848 (haute) ou de 1448 à 1568 (basse).

Sources :
- https://avalon.law.yale.edu/17th_century/westphal.asp (« Treaty of Westphalia. Peace Treaty between the Holy Roman
  Emperor and the King of France and their respective Allies ») : « Done, pass'd and concluded at Munster in
  Westphalia, the 24th Day of October, 1648. » Le préambule évoque « the Disorders of a long and cruel War ».
- Mode : primaire (texte du traité) pour la date. Le nom « guerre de Trente Ans » ne figure pas dans le traité :
  le vérificateur doit le confirmer par une seconde source, ou la question se réduit à « Année des traités de
  Westphalie ».

Contre-vérification : VALIDÉ. Texte de l'Avalon Project relu : « concluded at Munster in Westphalia, the 24th Day of
October, 1648 ». La fin de la guerre de Trente Ans est confirmée par deux sources sérieuses. Le Dictionnaire historique
de la Suisse (Marco Jorio, 2013) : « La paix de Westphalie, signée le 24 octobre 1648 après quatre ans de négociations à
Münster et Osnabrück, mit fin à la guerre de Trente Ans ». L'Encyclopædia Universalis (« Westphalie, traités de ») :
« mettent fin, dans l'espace germanique, à la complexe guerre de Trente Ans ». Nuance sans effet sur la réponse : la
guerre entre la France et l'Espagne continue jusqu'en 1659. Ancre : v ± 80 à 200 ans, comme le dit le code (`q.annee`).

### 3. `suez-longueur` (géopolitique, géographie)

```js
  { id: "suez-longueur", q: "Longueur du canal de Suez", unite: "km", v: 193, note: "193,3 km depuis 2010, contre 164 km à l'ouverture en 1869 (Autorité du canal de Suez)" },
```

Ancre : haute de 390 à 770 km, basse de 48 à 97 km.

Sources :
- https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalCharacteristics.aspx (Autorité du canal de Suez,
  « Stages of developing the Suez Canal ») : « Overall Length Km 164 175 175 189.80 189.80 189.80 191.80 193.30
  193.30 » pour les années « 1869 1956 1962 1980 1994 1996 2001 2010 2015 ».
- Mode : primaire.

Contre-vérification : VALIDÉ. Page de l'Autorité du canal de Suez relue : « Overall Length Km 164 175 175 189.80 189.80
189.80 191.80 193.30 193.30 ». Source indépendante : Guinness World Records, « Longest big ship canal » : « The canal is
193.3 km (120.11 miles) long ». Pas de doublon avec `ANCRES` « suez » (année d'ouverture) ni avec la frise
chronologique. Un résumé de Britannica attribue l'allongement au projet de 2015, mais le tableau de l'Autorité donne déjà
193,30 km en 2010 (le chantier de 2015 a surtout allongé les dérivations) : la source primaire l'emporte.

### 4. `bacteries-masse` (corps humain)

```js
  { id: "bacteries-masse", q: "Masse totale des bactéries hébergées par le corps d'un homme de 70 kg", unite: "g", v: 200, note: "environ 0,2 kg (Sender, Fuchs et Milo, PLoS Biology, 2016)" },
```

Ancre : haute de 400 à 800 g, basse de 50 à 100 g.

Sources :
- Sender, Fuchs et Milo, « Revised Estimates for the Number of Human and Bacteria Cells in the Body », PLoS Biology,
  2016, doi:10.1371/journal.pbio.1002533 ; résumé lu sur
  https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1371/journal.pbio.1002533&resultType=core&format=json :
  « We estimate the total number of bacteria in the 70 kg "reference man" to be 3.8·10^13. […] the number of bacteria
  in the body is actually of the same order as the number of human cells, and their total mass is about 0.2 kg. »
- Mode : primaire.
- La même étude fournit `GRANDEURS` « bacteries » (le nombre) : quantité différente, pas de doublon.

Contre-vérification : VALIDÉ. Résumé relu : « their total mass is about 0.2 kg ». Source indépendante : BioNumbers
(Harvard), fiche 113003, « Overall mass of bacteria in the body » : « ~0.2 (~0.3% of overall body weight) kg ». Il s'agit
de masse humide (la masse sèche serait d'environ 50 à 100 g selon BioNumbers), ce qui correspond au « 0,2 kg » de la note.

### 5. `mille-pattes` (nature)

```js
  { id: "mille-pattes", q: "Nombre de pattes du mille-pattes qui en a le plus (Eumillipes persephone, Australie)", unite: "pattes", v: 1306, note: "spécimen décrit en 2021 ; aucun mille-pattes connu n'en avait jusque-là plus de 750 (Marek et al., Scientific Reports, 2021)" },
```

Ancre : haute de 2 600 à 5 200, basse de 330 à 650 pattes.

Sources :
- Marek et al., « The first true millipede—1306 legs long », Scientific Reports, 2021, doi:10.1038/s41598-021-02447-0 ;
  résumé lu sur
  https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1038/s41598-021-02447-0&resultType=core&format=json :
  « no millipede has ever been described with more than 750 legs. We discovered a new record-setting species of
  millipede with 1,306 legs, Eumillipes persephone, from Western Australia. »
- Mode : primaire.

Contre-vérification : VALIDÉ. Résumé relu : « no millipede has ever been described with more than 750 legs » et
« 1,306 legs, Eumillipes persephone ». Source indépendante : Scientific American, « Newfound Millipede Breaks World
Record for the Most Legs » : « 1,306 legs », précédent record d'Illacme plenipes : « as many as 750 legs ». Les
1 306 pattes sont celles d'un spécimen femelle, ce que la note dit bien (« spécimen »).

---

## FERMI

Format : `{ id, facteurs: [[libellé, valeur, source, diviser?]] }`. L'`id` est celui d'une entrée de `GRANDEURS` ; le
joueur estime chaque facteur, le site multiplie (ou divise si `diviser` est vrai) et compare au `v` de la grandeur.

### 1. `ormuz` (géopolitique)

```js
  { id: "ormuz", facteurs: [
    ["Barils de pétrole passant chaque jour par le détroit d'Ormuz", 20e6, "EIA, moyenne de 2024"],
    ["Litres dans un baril de pétrole", 159, "42 gallons américains de 3,785 litres"],
    ["Jours dans l'année 2024", 366, "année bissextile"]] },
```

Calcul : 20 × 10⁶ × 159 × 366 = 1,1639 × 10¹² ; `v` = 1,164 × 10¹² : écart −0,01 %.

Sources : celles de `GRANDEURS` « ormuz » (EIA, 16 juin 2025 : « oil flow through the strait averaged 20 million
barrels per day (b/d) » ; EIA, « A U.S. 42-gallon barrel »). Mode : primaire.

Contre-vérification : VALIDÉ. Produit refait : 20e6 × 159 × 366 = 1,16388 × 10¹² ; écart −0,01 % avec 1.164e12,
donc bien sous les 2 % du banc. La page de l'EIA donne bien « A U.S. 42-gallon barrel », et 42 × 3,785411784 = 158,987 L.

### 2. `terre-orbite` (sciences)

```js
  { id: "terre-orbite", facteurs: [
    ["Vitesse moyenne de la Terre sur son orbite, en km par seconde", 29.78, "NASA"],
    ["Secondes dans une année", 31557600, "calcul : 365,25 jours de 86 400 secondes"]] },
```

Calcul : 29,78 × 31 557 600 = 9,3978 × 10⁸ ; `v` = 9,4 × 10⁸ : écart −0,02 %.

Sources : https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html : « Mean orbital velocity (km/s) 29.78 ».
Mode : primaire.

Contre-vérification : VALIDÉ. Produit refait : 29,78 × 31 557 600 = 9,39785 × 10⁸ ; écart −0,02 % avec 9.4e8. Le
facteur de 31 557 600 s est déjà utilisé par le Fermi existant « lumiere-an ».

### 3. `oceans` (géographie ; grandeur déjà présente)

```js
  { id: "oceans", facteurs: [
    ["Surface des océans, en km²", 3.6184e8, "Charette et Smith, Oceanography, 2010 : 361,84 millions de km²"],
    ["Profondeur moyenne des océans, en km", 3.682, "Charette et Smith, Oceanography, 2010 : 3 682 m"]] },
```

Calcul : 3,6184 × 10⁸ × 3,682 = 1,3323 × 10⁹ km³ ; écart −0,20 % avec le `v` actuel (1.335e9), +0,02 % avec le `v`
corrigé proposé (1.332e9).

Sources :
- https://tos.org/oceanography/assets/docs/23-2_charette.pdf (Charette et Smith, « The Volume of Earth's Ocean »,
  Oceanography, 23(2), 2010) : « This analysis resulted in a mean ocean depth value of 3682 m. » ; « our estimate of
  1.332 x 10^9 km3 » ; tableau 1 : « 3682.2 361.84 1.3324 This study » (profondeur moyenne en m, surface en millions
  de km², volume en milliards de km³) ; tableau 2 : « Mean or Total 3682.22 361.841 1.33238 ».
- Mode : primaire.
- Intérêt pédagogique : l'article rappelle que « Historically, ocean volume has been calculated as the product of
  ocean area and mean ocean depth », exactement la décomposition proposée.

Contre-vérification : VALIDÉ, ainsi que la correction de l'élément existant « oceans » (`v: 1.335e9` → `v: 1.332e9`).
J'ai extrait et relu le texte du PDF (Oceanography, vol. 23, n° 2) : « This analysis resulted in a mean ocean depth value
of 3682 m », « our estimate of 1.332 x 10 9 km 3 is 6–18 x 10 6 km 3 less » que les estimations antérieures. Tableau 1,
ligne de l'étude : « 3682.2 361.84 1.3324 » ; tableau 2 : « Mean or Total 3682.22 361.841 1.33238 ». La valeur 1,335
n'est pas celle de l'article cité, qui donne 1,332. Produit refait : 3,6184e8 × 3,682 = 1,33229 × 10⁹ ; écart +0,02 %
avec 1.332e9, et −0,20 % avec l'ancien 1.335e9. Le banc passe dans les deux cas.

---

## Écartés

- **Longueur des côtes de la Norvège** (≈ 100 000 km, plus de deux fois le tour de la Terre) : très surprenante, mais
  les chiffres divergent selon la date et la méthode (100 915 km dans l'annuaire statistique norvégien de 2013,
  102 936 km « (2024) » dans Store norske leksikon, 104 600 km selon un article de presse). Aucune page de Kartverket
  (la source primaire) n'a été trouvée. La longueur d'une côte dépend en outre de l'échelle de mesure.
- **Abolition du servage en Russie (1861)**, pour `ETALONNAGE` : la page de la Bibliothèque présidentielle russe
  (prlib.ru) n'a pas pu être lue (contrôle anti-robot), Britannica a refusé l'accès (403), et rg.ru était
  injoignable. Moins de deux sources lues : écarté.
- **Température de surface du Soleil** (température effective nominale de 5 772 K, soit 5 499 °C, résolution B3 de
  l'UAI, 2015, lue sur https://www.pas.rochester.edu/~emamajek/IAU/IAUres_B3.pdf) : vérifiée, mais `VRAI_FAUX`
  « eclair » affiche déjà « environ 5 500 °C à la surface du Soleil ». Remplacée par la vitesse de libération.
- **Globules rouges produits par seconde** (Fermi : 25 000 milliards ÷ 120 jours de vie) : la durée de vie de 120 jours
  n'a pas trouvé de source primaire lue, et le résultat (≈ 2,1 × 10¹¹ par jour) ne concorde pas simplement avec les
  0,33 × 10¹² cellules par jour de Sender et Milo (2021), dont près de 90 % de cellules sanguines. Écarté pour ne pas
  afficher deux chiffres en apparence contradictoires.
- **Volume de sang pompé par le cœur en un jour** (≈ 7 000 litres) : dépend d'un débit cardiaque « typique » de
  5 L/min sans source primaire lue ; écarté.
- **Pétrole d'Ormuz décomposé en consommation mondiale × 20 % × 365** : la consommation mondiale exacte de 2024 n'a pas
  été lue, et un arrondi à 100 millions de barils par jour aurait été inventé. Remplacé par la décomposition barils ×
  litres × jours.
- **Nombre d'États parties au Statut de Rome** : retraits en cours (Hongrie, Burkina Faso, Mali, Niger) dont les dates
  d'effet n'ont pas été vérifiées ; trop instable.
