# Le monde en chiffres, lot 2 : 20 questions proposées (22 novembre 2026)

**Bilan de la contre-vérification (23 novembre 2026) : 13 validés, 7 à corriger (blocs corrigés), 0 rejeté.**
Validés : `dette-japon`, `armee-allemagne`, `deplaces-soudan`, `ble-russie`, `age-median-afrique`, `ouzbekistan-peuple`,
`chine-deces`, `ue-langues`, `gaspillage-foyers`, `eau-souterraine`, `fonds-marins`, `troubles-mentaux`,
`aeroport-atlanta`. À corriger : `arctique-huit` (« environ » quatre millions), `kazakhstan-enclave` (plus vaste pays
sans littoral du monde), `canne-a-sucre` (« gorgées d'eau » retiré), `haute-mer` (1,45 % → « environ 1,5 % »),
`starlink` (date dans la question, second catalogue CelesTrak), `feminicides` (estimations), `cables-sous-marins`
(phrase des 500 câbles retirée). Les 20 identifiants sont absents de `static/` ; aucun doublon de `MONDE`.

Propositions pour le stock `MONDE` (`static/jeux-donnees.js`). Rien n'est intégré : chaque bloc est prêt à coller,
sans `depuis:` (à ajouter à l'intégration, avec le numéro du lendemain de la publication). Aucune question ne figure
dans l'enquête Gapminder de 2017, donc `public: null` partout ; le niveau suit la notoriété supposée de la donnée.
À faire contre-vérifier par l'agent `verificateur-sources` avant toute intégration.

Sources lues le 22 novembre 2026. « Primaire » : page, fichier ou base de l'institution qui produit la donnée. Quand un
pourcentage ou un classement est calculé à partir d'un tableau, le calcul est indiqué.

Doublons : les 20 identifiants sont absents de tous les fichiers `static/*.js` (grep). Aucun sujet ne recoupe une
question de `MONDE` ni une affirmation de `VRAI_FAUX`, `VF_GT` (`grand-test-donnees.js`), `ETALONNAGE`, `GRANDEURS`
ou `FERMI` (grep sur Japon/dette, Allemagne, Soudan, blé, Arctique, âge médian, Ouzbékistan, Kazakhstan, langues de
l'UE, canne à sucre, gaspillage, eau souterraine, fonds marins, haute mer, Starlink, trouble mental, féminicide,
aéroport, câble sous-marin). Proches mais distincts : `refugies` (total mondial) et `refugies-iran` (pays d'accueil)
pour `deplaces-soudan` (pays d'origine) ; `depenses-militaires`, `etats-unis-armee`, `militaire-pib` et
`armee-ukraine` pour `armee-allemagne` (rang d'un pays européen) ; `langues-onu` pour `ue-langues` ; `homicides` et
`suicides` pour `feminicides` (auteurs, pas taux) ; `eau-agriculture` pour `eau-souterraine`.

Répartition : géopolitique 10 (`dette-japon`, `armee-allemagne`, `deplaces-soudan`, `ble-russie`, `arctique-huit`,
`age-median-afrique`, `ouzbekistan-peuple`, `kazakhstan-enclave`, `chine-deces`, `ue-langues`), alimentation 2, eau 1,
océans 2, espace 1, santé mentale 1, criminalité 1, transports 1, internet 1.

---

## 1. `dette-japon` (géopolitique, dette publique)

```js
  { id: "dette-japon", niveau: 2, question: "Lequel de ces pays a la dette publique la plus élevée par rapport à la richesse qu'il produit ?",
    options: ["la Grèce", "les États-Unis", "le Japon"], juste: 2,
    explication: "Le Japon : environ 205 % de son PIB en 2025, l'un des taux les plus élevés du monde, devant la Grèce (147 %), l'Italie (137 %) et les États-Unis (124 %) (Fonds monétaire international, octobre 2026).", public: null },
```

Sources : API du FMI, indicateur GGXWDG_NGDP (« General government gross debt », « Percent of GDP »), métadonnées :
« 'source': 'World Economic Outlook (October 2026)' », « 'last-modified': '2026-10-08 14:43:40' » ;
https://www.imf.org/external/datamapper/api/v1/GGXWDG_NGDP (toutes séries), valeurs 2025 : « JPN 204.8 », « GRC 146.6 »,
« ITA 137.1 », « USA 124.4 » ; classement 2025 recalculé sur tous les pays : Japon 204,8, Soudan 204,4, Singapour
165,7, Libye 153,8, Grèce 146,6. Mode : primaire (FMI, Perspectives de l'économie mondiale d'octobre 2026).
Point douteux : le Japon et le Soudan sont à égalité à 0,4 point près, d'où « l'un des taux les plus élevés » et non
« le plus élevé ». Le chiffre du Japon a été révisé à la baisse par rapport aux éditions précédentes (environ 235 %
souvent cité) : à surveiller à la prochaine édition (avril 2027).

Contre-vérification : VALIDÉ. API du FMI relue le 23 novembre 2026 (GGXWDG_NGDP, 2025) : JPN 204.8, SDN 204.4, SGP 165.7,
LBY 153.8, GRC 146.6, ITA 137.1, USA 124.4. Parmi les trois options, le Japon l'emporte de 58 points : réponse sans
ambiguïté ; « l'un des taux les plus élevés du monde » reste exact malgré le Soudan. Source indépendante de l'édition
citée : FMI, consultation article IV de 2026 sur le Japon (avril 2026, vue en résultats de recherche) : dette brute
estimée à 207 % du PIB au 3e trimestre 2025, 206,8 % pour 2025 ; « environ 205 % » couvre les deux éditions.

## 2. `armee-allemagne` (géopolitique, dépenses militaires)

```js
  { id: "armee-allemagne", niveau: 3, question: "En 2025, lequel de ces pays a dépensé le plus pour ses armées ?",
    options: ["le Royaume-Uni", "la France", "l'Allemagne"], juste: 2,
    explication: "L'Allemagne, avec 114 milliards de dollars, au quatrième rang mondial, devant le Royaume-Uni (89 milliards) et la France (68 milliards). Ses dépenses ont augmenté de 24 % en un an et dépassent 2 % de son PIB pour la première fois depuis 1990 (Institut international de recherche sur la paix de Stockholm, SIPRI).", public: null },
```

Sources : https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf (SIPRI Fact Sheet, « Trends in world
military expenditure, 2025 », avril 2026), texte extrait du PDF, tableau 1 : « 4 5 Germany 114 24 118 2.3 1.1 3.9 »,
« 6 4 United Kingdom 89.0 –2.0 32 2.4 2.0 3.1 », « 9 9 France 68.0 1.5 21 2.0 1.9 2.4 » (rang 2025, rang 2024,
milliards de dollars, évolution 2024-2025 en %) ; texte : « In 2025 Germany was the fourth biggest spender globally as
its military expenditure reached $114 billion. The 24 per cent year-on-year increase in 2025 marked the third
consecutive year of double-digit percentage growth » ; « At 2.3 per cent of GDP in 2025, Germany's military burden
exceeded 2.0 per cent for the first time since 1990. » Mode : primaire.

Contre-vérification : VALIDÉ. PDF du SIPRI relu (texte extrait par PDFKit) : « In 2025 Germany was the fourth biggest
spender globally as its military expenditure reached $114 billion. The 24 per cent year-on-year increase… » ; « At 2.3
per cent of GDP in 2025, Germany's military burden exceeded 2.0 per cent for the first time since 1990 » ; « The UK's
military spending amounted to $89.0 billion in 2025 » ; « In 2025 France's military spending rose by 1.5 per cent to
$68.0 billion ». Le SIPRI est la référence mondiale sur ce sujet (déjà cité par `depenses-militaires`) ; pas de
seconde source cherchée, la source primaire lue suffisant.

## 3. `deplaces-soudan` (géopolitique, réfugiés)

```js
  { id: "deplaces-soudan", niveau: 3, question: "Fin 2025, de quel pays venait le plus grand nombre de personnes forcées de fuir (réfugiés et déplacés dans leur propre pays) ?",
    options: ["la Syrie", "l'Ukraine", "le Soudan"], juste: 2,
    explication: "Du Soudan : près de 13 millions de personnes, dont 9,1 millions déplacées à l'intérieur du pays et 3,8 millions réfugiées ou demandeuses d'asile à l'étranger. Suivaient la Syrie (10,6 millions) et l'Ukraine (9 millions) (Haut-Commissariat des Nations unies pour les réfugiés, HCR).", public: null },
```

Sources : API de statistiques du HCR (Refugee Data Finder),
https://api.unhcr.org/population/v1/population/?yearFrom=2025&yearTo=2025&coo_all=true&cf_type=ISO (11 pages lues), par
pays d'origine, 2025 : « "coo_name":"Sudan" … "refugees":2820737, "asylum_seekers":940297, "idps":9139309 » ;
Syrie : réfugiés 4 865 764, demandeurs d'asile 154 355, déplacés internes 5 542 227 ; Ukraine : 5 224 131, 26 583,
3 712 000 ; Venezuela : 417 010, 1 181 156, 0, « autres personnes ayant besoin d'une protection internationale »
6 042 706. Totaux calculés (réfugiés + demandeurs d'asile + déplacés internes + autres ayant besoin d'une protection) :
Soudan 12 900 343, Syrie 10 562 346, Ukraine 8 962 714, Venezuela 7 640 872, Colombie 7 540 658, Afghanistan
7 171 548. Mode : primaire (classement et sommes calculés).
Recoupement (résultats de recherche seulement ; unhcr.org refuse la lecture automatique, HTTP 403 et connexion
refusée) : aperçu de situation du HCR pour le Soudan (rapport mondial 2025, juin 2026), « 12.8 million people remained
forcibly displaced within and beyond Sudan at the end of 2025 », dont 9,1 millions de déplacés internes ; et « Sudan
remains the largest internal displacement crisis globally ». L'écart 12,8 / 12,9 tient au périmètre (demandeurs
d'asile) : « près de 13 millions » couvre les deux.

Contre-vérification : VALIDÉ. API du HCR relue le 23 novembre 2026 (208 pays d'origine, 2025) ; sommes recalculées
identiques : Soudan 12 900 343 (2 820 737 réfugiés + 940 297 demandeurs d'asile + 9 139 309 déplacés internes), Syrie
10 562 346, Ukraine 8 962 714, Venezuela 7 640 872. Les pages unhcr.org refusent toujours la lecture (403 en WebFetch,
connexion coupée en curl) ; recoupement en résultats de recherche : aperçu de situation du HCR pour le Soudan (juin 2026),
12,8 millions de personnes déplacées fin 2025, « plus grande crise de déplacement au monde », et une note explicative du
HCR donnant 12,9 millions (réfugiés, demandeurs d'asile et déplacés internes). Même institution, mais publication
distincte de l'API : concordant.

## 4. `ble-russie` (géopolitique, commerce)

```js
  { id: "ble-russie", niveau: 2, question: "Quel pays exporte le plus de blé ?",
    options: ["les États-Unis", "le Canada", "la Russie"], juste: 2,
    explication: "La Russie, avec 48 millions de tonnes sur la campagne 2025-2026, soit plus d'un cinquième du blé échangé dans le monde, devant l'Union européenne (32 millions), le Canada (30 millions) et les États-Unis (24 millions) (ministère de l'Agriculture des États-Unis).", public: null },
```

Sources : https://apps.fas.usda.gov/psdonline/circulars/grain.pdf (USDA, Foreign Agricultural Service, « Grain: World
Markets and Trade », novembre 2026), tableau « World Wheat, Flour, and Products Trade », « July/June Year, Thousand
Metric Tons », colonnes 2022/23 à 2026/27 ; texte extrait (colonnes restituées dans l'ordre inverse par l'extraction,
vérifié sur la ligne du total) : « 39,000 40,000 48,000 43,000 55,500 49,000 Russia » (2025/26 : 48 000) ;
« 31,715 » Union européenne, « 29,533 » Canada, « 23,183 » Australie, « 24,411 » États-Unis, « 226,320 » total mondial
pour 2025/26. Part de la Russie : 48 000 / 226 320 = 21,2 % (calcul). Mode : primaire.
Point douteux : la prévision 2026/27 (novembre) donne encore la Russie première (39 millions, contre 35 pour l'UE).

Contre-vérification : VALIDÉ. Circulaire de l'USDA de novembre 2026 relue (PDF, tableau « World Wheat, Flour, and
Products Trade ») : ligne 2025/26 « 48,000 31,715 29,533 23,183 … 24,411 226,320 » (Russie, UE, Canada, Australie…,
États-Unis, total) ; texte : « exports are down sharply from Russia (39.0 million tons in 2026/27 vs. 48.0 million in
2025/26) ». Source indépendante (résultats de recherche, Interfax, février 2026) : le Conseil international des céréales
estimait alors les exportations russes 2025/26 à 44,4 millions de tonnes et celles de l'UE à 31,3 millions : la Russie
reste première, l'écart sur le chiffre tient à la date et à la source, et l'explication attribue bien 48 millions à l'USDA.

## 5. `arctique-huit` (géopolitique, Arctique)

```js
  { id: "arctique-huit", niveau: 2, question: "Combien de pays ont une partie de leur territoire dans l'Arctique ?",
    options: ["3", "5", "8"], juste: 2,
    explication: "Huit : le Canada, le Danemark (par le Groenland), les États-Unis (par l'Alaska), la Finlande, l'Islande, la Norvège, la Russie et la Suède. Ils forment le Conseil de l'Arctique, et leurs régions arctiques comptent environ quatre millions d'habitants (Conseil de l'Arctique).", public: null },
```

Sources : https://arctic-council.org/about/states/ (Conseil de l'Arctique, « Arctic States ») : « The Arctic Council
consists of the eight Arctic States. » ; « The Arctic States have territories within the Arctic » ; « Canada The
Kingdom of Denmark Finland Iceland Norway The Russian Federation Sweden The United States » ; « The northern
provinces of the Arctic States offer a home to more than four million people ». https://arctic-council.org/about/ :
« The eight States have territories within the Arctic ». Mode : primaire.
Point douteux : « par le Groenland » et « par l'Alaska » ne sont pas écrits sur la page (évidence géographique) ;
à retirer si le vérificateur l'exige. Le distracteur « 5 » correspond aux pays riverains de l'océan Arctique : la
question parle bien de territoire dans l'Arctique, pas de côte.

Contre-vérification : À CORRIGER (bloc corrigé). Huit États et la liste : confirmés sur https://arctic-council.org/about/states/
(relue en curl). Mais la même page dit trois choses : « more than four million people », « Out of a total of 4 million
inhabitants of the Arctic » et « The Arctic is home to almost four million people today » : « plus de quatre millions »
devient « environ quatre millions ». Groenland et Alaska : sourcés sur les pages du Conseil de l'Arctique par pays,
https://arctic-council.org/about/states/the-kingdom-of-denmark/ (« The Kingdom consists of three parts – Greenland, the
Faroe Islands and Denmark – and, by virtue of Greenland, is centrally located as a coastal state in the Arctic ») et
https://arctic-council.org/about/states/the-united-states/ (« The United States became an Arctic nation upon the
purchase of Alaska in 1867 ») : les précisions restent. Attribution « (Conseil de l'Arctique) » ajoutée à l'explication.

## 6. `age-median-afrique` (géopolitique, Afrique, démographie)

```js
  { id: "age-median-afrique", niveau: 2, question: "En Afrique subsaharienne, la moitié des habitants a moins de…",
    options: ["18 ans", "28 ans", "38 ans"], juste: 0,
    explication: "18 ans (âge médian en 2025), contre 31 ans dans le monde et 43 ans en Europe. En 2050, il serait encore de 23 ans (ONU, World Population Prospects 2024).", public: null },
```

Sources : https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx
(ONU, Division de la population, World Population Prospects 2024), feuille « Medium variant », colonne « Median Age,
as of 1 July (years) » : « Sub-Saharan Africa 2025 18.386 », « World 2025 30.863 », « Europe 2025 42.794 »,
« Sub-Saharan Africa 2050 23.404 » ; feuille « Estimates » : « Sub-Saharan Africa 2023 18.078 ». Mode : primaire.
L'édition 2024 est la dernière (pas d'édition 2026 trouvée en recherche le 22 novembre 2026). Les valeurs de 2025
sont des projections de la variante moyenne.

Contre-vérification : VALIDÉ. Fichier WPP 2024 téléchargé et relu (feuille « Medium variant », « Median Age, as of 1 July
(years) ») : Sub-Saharan Africa 2025 18.386, World 2025 30.863, Europe 2025 42.794, Sub-Saharan Africa 2050 23.404.
Distracteurs 28 et 38 ans nettement faux. Source primaire lue ; pas de seconde source cherchée (la règle n'en exige pas).

## 7. `ouzbekistan-peuple` (géopolitique, Asie centrale)

```js
  { id: "ouzbekistan-peuple", niveau: 3, question: "Lequel de ces pays d'Asie centrale compte le plus d'habitants ?",
    options: ["le Kazakhstan", "l'Ouzbékistan", "le Turkménistan"], juste: 1,
    explication: "L'Ouzbékistan, avec 37 millions d'habitants en 2025, près du double du Kazakhstan (21 millions), pourtant six fois plus vaste. Le Turkménistan en compte 7,6 millions (Banque mondiale).", public: null },
```

Sources : API de la Banque mondiale, SP.POP.TOTL (population) et AG.SRF.TOTL.K2 (superficie) :
https://api.worldbank.org/v2/country/UZB/indicator/SP.POP.TOTL?format=json&mrv=1 → « Uzbekistan SP.POP.TOTL 2025
37053428 » ; KAZ → « Kazakhstan SP.POP.TOTL 2025 20843754 » ; TKM → « Turkmenistan SP.POP.TOTL 2025 7618847 » ;
superficie 2024 : « Uzbekistan 448923 », « Kazakhstan 2724902 » (rapport 6,07, calcul). Mode : primaire.

Contre-vérification : VALIDÉ. API de la Banque mondiale relue le 23 novembre 2026 : Uzbekistan 2025 37053428,
Kazakhstan 2025 20843754, Turkmenistan 2025 7618847 ; superficies 448923 et 2724902 km² (rapport 6,07). Source
primaire lue, chiffres identiques à ceux de `pays.js` (même base).

## 8. `kazakhstan-enclave` (géopolitique, Asie centrale)

```js
  { id: "kazakhstan-enclave", niveau: 2, question: "Lequel de ces pays, tous sans accès à l'océan, est le plus vaste ?",
    options: ["la Mongolie", "le Tchad", "le Kazakhstan"], juste: 2,
    explication: "Le Kazakhstan, avec 2,7 millions de km², devant la Mongolie (1,6 million) et le Tchad (1,3 million). C'est le plus vaste pays sans accès à l'océan du monde : il borde la Caspienne, mais c'est une mer fermée (Banque mondiale).", public: null },
```

Sources : API de la Banque mondiale, AG.SRF.TOTL.K2, 2024 : « Kazakhstan 2724902 », « Mongolia 1564115.746 »,
« Chad 1284000 », « Niger 1267000 », « Mali 1241238 », « Ethiopia 1129818.8 », « Bolivia 1098580 ».
https://www.un.org/ohrlls/content/list-lldcs (ONU, Bureau du Haut-Représentant, « List of LLDCs ») : 32 pays numérotés,
dont « 12. Kazakhstan », « 18. Mongolia », « 9. Chad * » ; le plus vaste de la liste est le Kazakhstan (comparaison
faite sur les superficies de la Banque mondiale des sept plus grands). Mode : primaire.
Point douteux : la liste de l'ONU ne compte que les pays en développement ; l'explication s'en tient donc à elle. Les
pays sans littoral hors liste (Biélorussie, Hongrie, Autriche…) sont bien plus petits, mais leurs superficies n'ont
pas été lues. Le Kazakhstan borde la Caspienne, mer fermée : d'où « sans accès à l'océan » dans la question.

Contre-vérification : À CORRIGER (bloc corrigé). Superficies 2024 de tous les pays relues sur l'API de la Banque mondiale
(AG.SRF.TOTL.K2, `country/all`) : les huit pays plus vastes que le Kazakhstan (Russie, Canada, États-Unis, Chine,
Brésil, Australie, Inde, Argentine) ont tous un littoral océanique ; le Kazakhstan est donc le plus vaste pays sans
littoral du monde, pas seulement de la liste des pays en développement. Mongolie 1 564 116, Tchad 1 284 000 : confirmés.
Source indépendante : Guinness World Records, « Largest landlocked country » (lu) : « The largest country with no
border-access to the open ocean is Kazakhstan », 2 724 900 km². L'explication dit désormais « le plus vaste pays sans
accès à l'océan du monde » et explique la Caspienne ; la mention de la liste de l'ONU (32 pays) est retirée.

## 9. `chine-deces` (géopolitique, démographie comparée)

```js
  { id: "chine-deces", niveau: 3, question: "En 2025, en Chine, y a-t-il eu plus de naissances ou plus de décès ?",
    options: ["nettement plus de naissances", "à peu près autant", "nettement plus de décès"], juste: 2,
    explication: "Nettement plus de décès : 11,3 millions, contre 7,9 millions de naissances. La population a perdu 3,4 millions d'habitants en un an, à 1,405 milliard ; elle baisse depuis 2022 (Bureau national des statistiques de Chine).", public: null },
```

Sources : https://www.stats.gov.cn/english/PressRelease//202602/t20260228_1962661.html (Bureau national des
statistiques de Chine, communiqué statistique sur 2025, 28 février 2026) : « By the end of 2025, the total number of
national population reached 1,404.89 million, a decrease of 3.39 million over that at the end of 2024. » ; « There were
7.92 million births in 2025 with a crude birth rate of 5.63 per thousand; and there were 11.31 million deaths with a
crude death rate of 8.04 per thousand. The natural growth rate was -2.41 per thousand. »
https://www.stats.gov.cn/english/PressRelease/202302/t20230227_1918979.html (communiqué sur 2022) : « By the end of
2022, the total number of national population reached 1,411.75 million, a decrease of 0.85 million over that at the
end of 2021. » Mode : primaire.
Point douteux : les baisses de 2023 et 2024 ne sont pas lues dans les communiqués de ces années ; « elle baisse depuis
2022 » s'appuie sur 2022 et 2025 lus, et sur la presse (« fourth straight year », NBC News, 19 janvier 2026, en
résultats de recherche). À défaut, réduire à « 3,4 millions d'habitants de moins qu'en 2024 ».

Contre-vérification : VALIDÉ. Communiqué de 2025 relu : « 1,404.89 million, a decrease of 3.39 million » ; « 7.92 million
births » ; « 11.31 million deaths ». « Elle baisse depuis 2022 » : la baisse de 2022 est sur la source primaire citée,
et celles de 2023 à 2025 sont confirmées par deux médias de référence concordants, lus :
https://www.nbcnews.com/world/asia/chinas-population-falls-fourth-straight-year-rcna254757 (18 janvier 2026 :
« China's population fell for a fourth consecutive year in 2025, dropping by 3.39 million to 1.405 billion ») et
https://www.pbs.org/newshour/world/chinas-population-falls (19 janvier 2026 : « marking the fourth straight year of
decrease »). Quatre années de baisse = 2022 à 2025 : la phrase tient. À noter en commentaire à l'intégration :
« vérifié via NBC News et PBS NewsHour, qui citent le Bureau national des statistiques ».

## 10. `ue-langues` (géopolitique, langues)

```js
  { id: "ue-langues", niveau: 2, question: "Combien de langues officielles l'Union européenne compte-t-elle ?",
    options: ["3", "12", "24"], juste: 2,
    explication: "24. Tout citoyen peut écrire aux institutions européennes dans l'une d'elles et doit recevoir une réponse dans la même langue. Les dernières ajoutées sont le bulgare, l'irlandais et le roumain (2007), puis le croate (2013) (Union européenne).", public: null },
```

Sources : https://european-union.europa.eu/principles-countries-history/languages_fr (Union européenne, « Langues ») :
« L'UE compte 24 langues officielles: allemand, anglais, bulgare, croate, danois, espagnol, estonien, finnois,
français, grec, hongrois, irlandais, italien, letton, lituanien, maltais, néerlandais, polonais, portugais, roumain,
slovaque, slovène, suédois et tchèque. » ; « 2007: bulgare, irlandais et roumain 2013: croate » ; « tout citoyen de
l'UE a le droit de communiquer avec les institutions européennes dans l'une des 24 langues officielles de l'UE, et
les institutions sont tenues de lui répondre dans la même langue. » Mode : primaire.

Contre-vérification : VALIDÉ. Page relue en curl : « L'UE compte 24 langues officielles » ; « 2007: bulgare, irlandais et
roumain 2013: croate » ; « tout citoyen de l'UE a le droit de communiquer avec les institutions européennes dans l'une
des 24 langues officielles de l'UE, et les institutions sont tenues de lui répondre dans la même langue ». La page cite
aussi le règlement n° 1, qui fixe les 24 langues. Distinct de `langues-onu` (6 langues de l'ONU). Source primaire lue.

## 11. `canne-a-sucre` (alimentation)

```js
  { id: "canne-a-sucre", niveau: 3, question: "Quelle plante cultivée est la plus récoltée au monde, en tonnes ?",
    options: ["le blé", "le riz", "la canne à sucre"], juste: 2,
    explication: "La canne à sucre : 1,94 milliard de tonnes en 2024, devant le maïs (1,22 milliard), le riz (0,82) et le blé (0,80) (Organisation des Nations unies pour l'alimentation et l'agriculture, FAO).", public: null },
```

Sources : https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data.zip (FAOSTAT, « Production :
Crops and livestock products », fichier du 23 décembre 2025, mis en ligne le 31 décembre 2025), lignes « World »,
élément « Production », unité « t », colonne Y2024 : « Sugar cane 1939782021.25 », « Maize (corn) 1218205573.82 »,
« Rice 820223277.89 », « Wheat 798481711.07 », « Potatoes 390428972.92 » ; aucun produit unique au-dessus de la canne
(seuls les agrégats « Cereals, primary » et « Sugar Crops Primary » la dépassent). Classement calculé. Mode : primaire.
Point douteux : « gorgées d'eau » n'est écrit dans aucune source lue (le riz et le blé sont comptés en grains secs,
la canne en tiges entières) ; à retirer si le vérificateur l'exige, la question tenant sans.

Contre-vérification : À CORRIGER (bloc corrigé). Fichier FAOSTAT téléchargé (25 Mo, Last-Modified 31 décembre 2025) et
classement recalculé, monde, production, 2024 : Sugar cane 1,940 Gt, Maize 1,218, Rice 0,820, Wheat 0,798 ; seuls les
agrégats (« Cereals, primary », « Sugar Crops Primary ») et des groupes (« Vegetables Primary ») sont devant. Réponse
juste. « Son poids tient surtout aux tiges, gorgées d'eau » : non sourcé, retiré. Recoupement (résultats de recherche) :
article de Bursa reprenant un classement FAO 2024 (canne 1,94 milliard, maïs 1,22) et FAO, faits saillants 2023 (« more
than 2 billion tonnes » de canne en 2023).

## 12. `gaspillage-foyers` (alimentation)

```js
  { id: "gaspillage-foyers", niveau: 2, question: "Où est jetée la plus grande partie de la nourriture gaspillée dans le monde (hors pertes à la production) ?",
    options: ["dans les magasins", "dans les restaurants et les cantines", "dans les foyers"], juste: 2,
    explication: "Dans les foyers : 60 % du gaspillage, contre 28 % pour la restauration et 12 % pour les commerces. En 2022, 1,05 milliard de tonnes ont été gaspillées, près d'un cinquième de la nourriture disponible pour les consommateurs, parties non comestibles comprises (Programme des Nations unies pour l'environnement).", public: null },
```

Sources : https://www.unep.org/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report (PNUE,
communiqué du 27 mars 2024 sur le Food Waste Index Report 2024, lu par curl, la page de publication refusant la lecture,
HTTP 403) : « In 2022 there were 1.05 billion tonnes of food waste generated (including inedible parts), amounting to
132 kilograms per capita and almost one-fifth of all food available to consumers. Out of the total food wasted in
2022, 60 per cent happened at the household level, with food services responsible for 28 per cent and retail
12 per cent. » Mode : primaire.
Point douteux : rapport de 2024 sur des données de 2022 ; aucune édition 2025 ou 2026 trouvée en recherche.

Contre-vérification : VALIDÉ. Communiqué du PNUE relu en curl : « In 2022 there were 1.05 billion tonnes of food waste
generated (including inedible parts), amounting to 132 kilograms per capita and almost one-fifth of all food available
to consumers » ; « 60 per cent happened at the household level, with food services responsible for 28 per cent and
retail 12 per cent ». Source primaire lue ; « hors pertes à la production » correspond bien au périmètre du gaspillage
(commerce, restauration, foyers) du rapport. Pas de seconde source cherchée.

## 13. `eau-souterraine` (eau)

```js
  { id: "eau-souterraine", niveau: 3, question: "En dehors des glaces, où se trouve l'essentiel de l'eau douce de la Terre ?",
    options: ["dans les lacs et les rivières", "sous terre, dans les nappes", "dans l'atmosphère"], juste: 1,
    explication: "Sous terre : environ 30 % de l'eau douce, contre 0,26 % pour les lacs et 0,006 % pour les rivières. Les glaces et neiges permanentes en retiennent 69 %. Et l'eau douce ne représente que 2,5 % de l'eau de la planète (Institut d'études géologiques des États-Unis, USGS, d'après Shiklomanov).", public: null },
```

Sources : https://www.usgs.gov/special-topics/water-science-school/science/where-earths-water (USGS, Water Science
School, « Where is Earth's Water? », lu par WebFetch, curl refusé, HTTP 403) : « of the total freshwater, over
68 percent is locked up in ice and glaciers. Another 30 percent of freshwater is in the ground. » ; « only 2.5% of
Earth's water is freshwater » ; tableau « One estimate of global water distribution » (Shiklomanov, « World fresh
water resources », dans Gleick, *Water in Crisis*, 1993), colonne « Percent of freshwater » : « Ice caps, Glaciers, &
Permanent Snow 68.7 », « Groundwater … Fresh 30.1 », « Lakes … Fresh 0.26 », « Atmosphere 0.04 », « Rivers 0.006 ».
Mode : primaire (USGS, qui reprend l'estimation de Shiklomanov, citée dans l'explication).
Point douteux : estimation ancienne (1993), toujours celle de l'USGS ; les ordres de grandeur suffisent à la question.

Contre-vérification : VALIDÉ. Page de l'USGS relue en curl : « Another 30 percent of freshwater is in the ground » ;
« only 2.5% of Earth's water is freshwater » ; tableau : glaces 68.7, eau souterraine douce 30.1, lacs d'eau douce 0.26,
atmosphère 0.04, rivières 0.006 (% de l'eau douce), source Shiklomanov 1993. L'explication nomme Shiklomanov : l'âge de
l'estimation est assumé. Réponse sans ambiguïté (30 % contre 0,27 % et 0,04 %).

## 14. `fonds-marins` (océans)

```js
  { id: "fonds-marins", niveau: 2, question: "Quelle part du fond des océans a été cartographiée à partir de mesures directes de profondeur ?",
    options: ["environ 5 %", "environ 30 %", "environ 90 %"], juste: 1,
    explication: "28,7 % en avril 2026, soit environ 104 millions de km², selon le projet international Seabed 2030. Ailleurs, les cartes reposent sur des profondeurs estimées, surtout d'après des mesures de la gravité par satellite (NOAA).", public: null },
```

Sources : https://iho.int/en/global-seabed-mapping-reaches-new-milestone-as-five-million-square-kilometres-added-in-a-year
(Organisation hydrographique internationale, publié le 28 avril 2026, lu par WebFetch, curl bloqué par une page
JavaScript) : « 28.7% of the world's ocean floor has now been mapped » ; « approximately 104 million square kilometres
of mapped seabed ». https://seabed2030.org/?p=3108 (Seabed 2030, communiqué « London, 20 April 2026 ») : même chiffre.
https://www.ncei.noaa.gov/node/231 (NOAA, NCEI, « Seabed 2030: Map the Gaps », mis à jour le 29 juin 2022) : « only
approximately twenty percent of the world's ocean depths have been measured with direct observation » ; « The rest of
the data used to compile seafloor maps are estimated depths largely derived from satellite gravity measurements ».
Mode : primaire (Seabed 2030 et OHI produisent le chiffre ; NOAA pour la méthode).
Point douteux : les pages de 2026 ne définissent pas « mapped » ; la NOAA (2022, 20 %) parle de mesure directe, d'où la
formulation. Le distracteur « 5 % » rappelle une idée reçue ancienne, non citée.

Contre-vérification : VALIDÉ. Seabed 2030 relu en curl (« London, 20 April 2026 ») : « 28.7% of the world's ocean floor
has now been mapped » ; « approximately 104 million square kilometres of mapped seabed ». OHI (WebFetch, publié le
28 avril 2026) : mêmes chiffres, sans définition de « mapped ». NOAA relue : « only approximately twenty percent of the
world's ocean depths have been measured with direct observation » (GEBCO_2021) ; « estimated depths largely derived from
satellite gravity measurements ». Définition de « cartographié », source indépendante lue : Niyazi et al., « Status of
global seafloor mapping effort and priority areas for future mapping », Frontiers in Marine Science, 12, 2025,
https://doi.org/10.3389/fmars.2025.1543885 : « 'mapped area' refers to all seabed areas mapped by direct depth
measurements (TID values from 1 to 17) » (grille GEBCO, d'après Wölfl et al., 2017) ; le reste est estimé. La
formulation « à partir de mesures directes de profondeur » est donc exacte.

## 15. `haute-mer` (océans)

```js
  { id: "haute-mer", niveau: 3, question: "Quelle part de l'océan mondial se trouve en haute mer, hors de la juridiction de tout pays ?",
    options: ["environ 10 %", "environ 35 %", "environ 60 %"], juste: 2,
    explication: "61 %, soit près de la moitié de la surface de la Terre. Environ 1,5 % de la haute mer est protégé, contre 23 % des eaux nationales, qui s'étendent jusqu'à 200 milles marins des côtes (Protected Planet, Programme des Nations unies pour l'environnement).", public: null },
```

Sources : https://www.protectedplanet.net/en/thematic-areas/marine-protected-areas (Protected Planet, PNUE-WCMC,
« Marine Protected and Conserved Areas », statistiques en ligne lues le 22 novembre 2026) : « National waters make up
39% of the global ocean. At present, 22.79% of this area is within protected areas and other effective area-based
conservation measures (OECMs). ABNJ make up 61% of the global marine area or nearly half of the Earth's surface.
Currently only 1.45% of this area is within protected areas and OECMs. » ; « National waters represent an area of
coastal water extending out to the limit of the Exclusive Economic Zone (EEZ) at 200 nautical miles from the
baseline of a coastal state. » Mode : primaire.
Point douteux : la page n'est pas datée (statistiques mises à jour en continu) ; « protégés » couvre aires protégées
et autres mesures de conservation (OECM).

Contre-vérification : À CORRIGER (bloc corrigé). Protected Planet relu en curl : « ABNJ make up 61% of the global marine
area or nearly half of the Earth's surface » ; « National waters make up 39% » ; « At present, 22.79% » ; « Currently
only 1.45% of this area is within protected areas and OECMs » ; « 200 nautical miles ». 1,45 arrondi à 1,4 est une
troncature : corrigé en « environ 1,5 % ». Source indépendante (résultats de recherche) : Convention sur les espèces
migratrices (cms.int) et IISD (Earth Negotiations Bulletin) donnent 61 % de l'océan hors juridiction nationale, la CMS
« only 1.5% » protégé ; LSE (Grantham) « nearly two-thirds ». Distracteur 35 % proche des 39 % d'eaux nationales mais
nettement faux pour la haute mer.

## 16. `starlink` (espace)

```js
  { id: "starlink", niveau: 2, question: "En novembre 2026, quelle part des satellites en activité autour de la Terre appartenait à une seule constellation, Starlink, de l'entreprise SpaceX ?",
    options: ["environ 5 %", "environ 25 %", "près des deux tiers"], juste: 2,
    explication: "Près des deux tiers : 11 195 satellites Starlink sur 17 246 satellites actifs au 18 novembre 2026, selon le catalogue de l'astrophysicien Jonathan McDowell ; 66 % selon le catalogue CelesTrak. Cette part change chaque mois, au fil des lancements et des retraits.", public: null },
```

Sources : https://planet4589.org/space/stats/active.html (Jonathan McDowell, Jonathan's Space Report, statistiques des
objets en orbite) : « Data as of 2026 Nov 18 Active satellites: 17247 », « Active Starlinks, orbit: 11195 », « Total all
active payloads, orbit: 17246 ». Part : 11 195 / 17 246 = 64,9 % (calcul). Mode : primaire (catalogue qui produit la
donnée). Recoupement (résultats de recherche seulement) : Aerospace Global News (2026), « over two-thirds of the
world's approximately 16,000 functioning satellites » ; l'Agence spatiale européenne (Space Environment Report 2026)
donne un autre périmètre (environ 11 300 « active payloads » au 1er février 2026, modèle MASTER), non comparable.
Point douteux : la proportion change chaque mois (lancements, désorbitations) ; l'explication est datée. Catalogue
tenu par un particulier (astronome reconnu, affiliation non lue) : le vérificateur jugera s'il vaut source primaire.

Contre-vérification : À CORRIGER (bloc corrigé). Page de McDowell relue en curl : « Data as of 2026 Nov 18 Active
satellites: 17247 », « Active Starlinks, orbit: 11195 », « Total all active payloads, orbit: 17246 » (64,9 %). Valeur
du catalogue : c'est la base de référence citée par la presse scientifique (Scientific American, 17 mars 2026, lu :
« statistics compiled by Jonathan McDowell, an astrophysicist who tracks global space launches », « about two thirds of
all satellites that are currently in orbit ») ; mais tenu par une seule personne, il ne suffit pas seul. Seconde source
indépendante, lue : catalogue CelesTrak (T. S. Kelso), groupe « active »,
https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=csv, téléchargé le 23 novembre 2026 : 16 904 objets
actifs, dont 11 199 nommés STARLINK, soit 66,3 % (calcul). Concordant. Corrections : date mise dans la question
(« En novembre 2026 », verbe au passé), date exacte et second catalogue dans l'explication, phrase sur la variation
mensuelle. Les distracteurs (5 %, 25 %) restent nettement faux à toute date de 2026.

## 17. `troubles-mentaux` (santé mentale)

```js
  { id: "troubles-mentaux", niveau: 2, question: "Dans le monde, combien de personnes vivent avec un trouble mental (anxiété, dépression…) ?",
    options: ["environ 1 sur 100", "environ 1 sur 30", "environ 1 sur 7"], juste: 2,
    explication: "Près d'une sur sept, soit 1,2 milliard de personnes en 2023. Les plus fréquents sont les troubles anxieux (470 millions de personnes) et la dépression (322 millions) (Organisation mondiale de la santé).", public: null },
```

Sources : https://www.who.int/news-room/fact-sheets/detail/mental-disorders (OMS, aide-mémoire « Mental disorders »,
daté du 11 septembre 2026) : « In 2023, nearly 1 in every 7 people (1.2 billion) around the world were living with a
mental disorder » ; « In 2023, 470 million people were living with an anxiety disorder » ; « In 2023, 322 million
people were living with depression ». https://www.who.int/news/item/02-09-2025-over-a-billion-people-living-with-mental-health-conditions-services-require-urgent-scale-up
(OMS, 2 septembre 2025) : « More than 1 billion people are living with mental health disorders » ; « Anxiety and
depressive disorders are the most common types of mental health disorders among both men and women. » Mode : primaire.

Contre-vérification : VALIDÉ. Aide-mémoire de l'OMS relu en curl : « In 2023, nearly 1 in every 7 people (1.2 billion)
around the world were living with a mental disorder, with anxiety and depressive disorders the most common » ; « 470
million people were living with an anxiety disorder » ; « 322 million people were living with depression ». Source
indépendante (résultats de recherche, résumés de dépôts universitaires) : GBD 2023 Mental Disorder Collaborators, The
Lancet, 2026, doi 10.1016/S0140-6736(26)00519-2 : environ 1,17 milliard de cas en 2023 (IC 95 % 1,06-1,31). Formulation
neutre (« vivent avec un trouble mental », le vocabulaire de l'OMS) ; les exemples entre parenthèses sont bien les deux
plus fréquents. Distracteurs nettement faux.

## 18. `feminicides` (criminalité)

```js
  { id: "feminicides", niveau: 3, question: "Dans le monde, quand une femme est tuée volontairement, qui est le plus souvent l'auteur ?",
    options: ["un inconnu", "une connaissance hors de la famille", "son partenaire ou un membre de sa famille"], juste: 2,
    explication: "Son partenaire ou un membre de sa famille, dans 60 % des cas : environ 50 000 femmes et filles sur 83 000 tuées volontairement en 2024 (estimations). Chez les hommes, qui représentent 80 % des victimes d'homicide, cette part n'est que de 11 % (Office des Nations unies contre la drogue et le crime ; ONU Femmes).", public: null },
```

Sources : https://www.unwomen.org/en/news-stories/press-release/2025/11/every-day-137-women-and-girls-are-killed-by-intimate-partners-or-family-members
(ONU Femmes, 24 novembre 2025) : « Last year, 83,000 women and girls were killed intentionally. Of them, 60 per cent –
50,000 women and girls – were killed at the hands of intimate partners or family members. » ; « In contrast, just
11 per cent of male homicides were perpetrated by intimate partners or family members. »
https://internetcontenidos.inegi.org.mx/contenidos/unodc/wp-content/uploads/2025/11/Femicide_Brief_2025_compressed.pdf
(ONUDC et ONU Femmes, « Femicides in 2024: Global estimates of intimate partner/family member femicides », copie
hébergée par le centre d'excellence ONUDC-INEGI ; la page de l'ONUDC renvoie une erreur 404), p. 17 : « An estimated
80 per cent of all homicide victims in 2024 were men while 20 per cent were women, but lethal violence within the
family takes a much higher toll on women than men, with almost 60 per cent of all women who were intentionally killed
in 2024 being victims of intimate partner/family member homicide. » Mode : primaire.

Contre-vérification : À CORRIGER (bloc corrigé). ONU Femmes relu en curl : « Last year, 83,000 women and girls were
killed intentionally. Of them, 60 per cent – 50,000 women and girls – were killed at the hands of intimate partners or
family members » ; « just 11 per cent of male homicides ». Note ONUDC-ONU Femmes relue (PDF, copie INEGI) : « Approximately
50,000 (44,400–55,500) women and girls » ; « roughly 83,000 » ; « An estimated 80 per cent of all homicide victims in
2024 were men » ; « just 11 per cent of all male homicides in 2024 ». Les deux sources sont concordantes (la note est le
document primaire). Correction d'exactitude : ce sont des estimations (intervalle 44 400-55 500), d'où « environ
50 000 … (estimations) » et « tuées volontairement ». Formulation neutre : question et réponse reprennent les termes de
l'ONU, sans adjectif ; 60 % contre 40 % pour tous les autres auteurs réunis : la réponse juste l'est sans ambiguïté.

## 19. `aeroport-atlanta` (transports)

```js
  { id: "aeroport-atlanta", niveau: 2, question: "Quel est l'aéroport le plus fréquenté du monde, en nombre de passagers ?",
    options: ["Londres-Heathrow", "Dubaï", "Atlanta"], juste: 2,
    explication: "Atlanta, aux États-Unis, avec 106 millions de passagers en 2025, devant Dubaï (95 millions) et Tokyo-Haneda (92 millions) ; Londres-Heathrow est septième (84 millions). En tout, 9,8 milliards de passagers ont été comptés dans les aéroports du monde (Conseil international des aéroports).", public: null },
```

Sources : https://aci.aero/2026/07/15/worlds-busiest-airports-atlanta-holds-asia-climbs-strong-demand-while-asia-pacific-growth-reshape-the-rankings/
(ACI World, 15 juillet 2026, classement définitif 2025) : « In 2025, global air travel reached 9.8 billion
passengers » ; tableau : « 1 Atlanta GA, US (ATL) 106,302,208 », « 2 Dubai, AE (DXB) 95,192,160 », « 3 Tokyo, JP (HND)
91,679,814 », « 7 London, GB (LHR) 84,482,126 ». Mode : primaire.
Point douteux : « 9.8 billion passengers » compte les passagers d'aéroport (un voyageur est compté au départ et à
l'arrivée) ; l'explication dit « comptés dans les aéroports » pour ne pas laisser croire à 9,8 milliards de voyageurs.

Contre-vérification : VALIDÉ. Page de l'ACI relue en curl (« Montreal, 15 July 2026 ») : « In 2025, global air travel
reached 9.8 billion passengers » ; tableau : « 1 … Atlanta GA, US (ATL) 106,302,208 », « 2 … Dubai, AE (DXB)
95,192,160 », « 3 … Tokyo, JP (HND) 91,679,814 », « 7 … London, GB (LHR) 84,482,126 ». Source indépendante (résultats
de recherche) : Euronews (14 avril 2026, classement préliminaire) et Newsweek reprennent Atlanta premier, Dubaï second.

## 20. `cables-sous-marins` (internet)

```js
  { id: "cables-sous-marins", niveau: 2, question: "Comment voyagent l'essentiel des données d'Internet entre les pays ?",
    options: ["par satellite", "par des câbles posés au fond de la mer", "par des antennes relais"], juste: 1,
    explication: "Par des câbles sous-marins, qui transportent plus de 99 % du trafic international de données (Union internationale des télécommunications).", public: null },
```

Sources : https://www.itu.int/en/mediacentre/Pages/PR-2026-02-03-Porto-Submarine-Cable-Resilience-Summit.aspx (UIT,
communiqué, « Porto, Portugal, 03 February 2026 ») : « More than 99 per cent of international data traffic is carried
by subsea cables. » ; « About 500 of the cables extending more than 1.7 million kilometres serve as the backbone of
global connectivity, economic and social development, and digital access for people, institutions and businesses on
every continent. » https://resources.telegeography.com/2023-mythbusting-part-3 (TeleGeography, 4 mai 2023, source
indépendante) : « Submarine cables account for over 99% of intercontinental data traffic » : « We can confirm that
this is true. However, we can't do precise calculations without data for intercontinental satellite traffic. »
Mode : primaire (UIT), confirmé par TeleGeography.
Point douteux : la phrase de l'UIT est ambiguë (« About 500 of the cables… » : environ 500 câbles en tout, ou 500
parmi d'autres ?) ; l'explication la lit comme un total. À défaut, retirer la seconde phrase de l'explication.

Contre-vérification : À CORRIGER (bloc corrigé). Communiqué de l'UIT relu (WebFetch) : « More than 99 per cent of
international data traffic is carried by subsea cables » ; « About 500 of the cables extending more than 1.7 million
kilometres serve as the backbone… ». Cette seconde phrase ne dit pas si 500 est le total : seconde phrase de
l'explication retirée. Source indépendante relue en curl : TeleGeography (Alan Mauldin, 4 mai 2023) : « do submarine
cables account for over 99% of intercontinental data traffic? We can confirm that this is true » (périmètre
intercontinental, plus étroit que « international », mais concordant ; TeleGeography précise ne pas pouvoir faire de
calcul exact faute de données sur le trafic satellite). Distracteurs nettement faux.

---

## Écartés

- **Part des francophones vivant en Afrique (OIF)** : déjà dans `VF_GT` (`grand-test-donnees.js`, « La majorité des
  francophones vivront bientôt en Afrique »).
- **22 langues de la huitième annexe de la Constitution indienne** : pages officielles indiennes illisibles (mea.gov.in
  et rajbhasha.gov.in en 404 ; eparlib.sansad.in sans réponse) ; seule source lue, constitutionofindia.net (liste des
  22 langues), non officielle. Remplacé par `ue-langues`.
- **Part de l'aviation dans les émissions mondiales de CO₂ (environ 2,5 %, AIE)** : la phrase a disparu des pages de
  l'AIE (« Aviation », « Transport », mises à jour en juin 2026) et les données du graphique ne sont pas
  téléchargeables ; seulement Our World in Data et Climate Action Tracker, sur des années différentes. Remplacé par
  `aeroport-atlanta`.
- **Part des hommes parmi les victimes d'homicide (80 %, ONUDC)** : vérifiée (note de l'ONUDC de 2025, p. 17), mais
  trop proche de `homicides` et `suicides` : intégrée à l'explication de `feminicides`.
- **Grande vitesse ferroviaire en Chine** : aucun chiffre trouvé dans le communiqué statistique chinois de 2025, ni
  total mondial de l'UIC lu.
- **Réchauffement de l'Arctique (« près de quatre fois plus vite », Rantanen et al., 2022)** : l'AMAP (2021) dit
  « trois fois » sur une autre période ; distracteurs impossibles à rendre non ambigus.
