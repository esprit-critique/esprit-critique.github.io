# Le monde en chiffres : 20 questions proposées (22 novembre 2026)

**Bilan de la contre-vérification (22 novembre 2026)** : 20 éléments examinés ; 13 VALIDÉS (`casques-bleus`,
`diaspora-inde`, `conflits`, `algerie-vaste`, `euro-21`, `langues-onu`, `cobalt-congo`, `commerce-maritime`,
`chine-ppa`, `riz-inde`, `polio`, `surpoids`, `plastique`), 7 À CORRIGER, blocs de code déjà corrigés (`jakarta`,
`petrole-etats-unis`, `reserves-venezuela`, `onu-budget`, `paludisme`, `ozone`, `voitures-electriques`), 0 REJETÉ.
Cas les plus délicats : `reserves-venezuela` (chiffre déclaré par le Venezuela et retenu par l'OPEP, jugé très
surestimé par des spécialistes selon l'AP : désormais signalé comme contesté), `onu-budget` (les États-Unis ne
« paient » pas leurs 22 % : arriérés), `voitures-electriques` (hybrides rechargeables comptés : précisé dans la
question), `ozone` (dates de l'évaluation de 2022, à revoir à la sortie de celle de 2026). Identifiants tous absents
de `static/jeux-donnees.js` ; aucun doublon de `MONDE`.

Propositions pour le stock `MONDE` (`static/jeux-donnees.js`). Rien n'est intégré : chaque bloc est prêt à coller,
sans `depuis:` (à ajouter à l'intégration, avec le numéro du lendemain de la publication). Aucune question ne figure
dans l'enquête Gapminder de 2017, donc `public: null` partout ; le niveau suit la notoriété supposée de la donnée.

Sources lues le 22 novembre 2026. « Primaire » : page ou fichier de l'institution qui produit la donnée. Quand un
pourcentage est calculé à partir d'un tableau, le calcul est indiqué.

Répartition : géopolitique 12 (`jakarta`, `petrole-etats-unis`, `reserves-venezuela`, `casques-bleus`, `onu-budget`,
`diaspora-inde`, `conflits`, `algerie-vaste`, `euro-21`, `langues-onu`, `cobalt-congo`, `commerce-maritime`),
économie 2, santé 3, environnement 2, technologie 1.

---

## 1. `jakarta` (géopolitique, urbanisation)

```js
  { id: "jakarta", niveau: 3, question: "Quelle est la ville la plus peuplée du monde ?",
    options: ["Tokyo", "Jakarta", "Shanghai"], juste: 1,
    explication: "Jakarta, avec près de 42 millions d'habitants, devant Dacca et Tokyo (33 millions), selon les estimations de l'ONU publiées en novembre 2025. Le classement dépend de la façon de délimiter une ville : l'ONU applique désormais la même méthode à tous les pays.", public: null },
```

Sources : https://desapublications.un.org/un-desa-voice/feature/december-2025/latest-urbanization-data-reveal-worlds-most-populous-cities
(UN DESA Voice, vol. 29, n° 12, décembre 2025) : « Jakarta (Indonesia) is now the world's most populous city, with
nearly 42 million residents », « followed by Dhaka (Bangladesh) with almost 40 million, and Tokyo (Japan) with
33 million » ; l'édition 2025 « integrates the Degree of Urbanization, a harmonized geospatial approach ». Mode : primaire (ONU, World Urbanization Prospects 2025).
Point douteux : le classement dépend de la définition de la ville (l'explication le dit) ; Tokyo premier dans l'édition
de 2018 n'est lu que dans des résultats de recherche (NBC News, Al Jazeera, Axios), d'où son absence de l'explication.

Contre-vérification : À CORRIGER. Passage de l'ONU relu mot pour mot (DESA Voice, et communiqué https://www.un.org/en/node/236908 :
« Jakarta (Indonesia) is now the world's most populous city, with nearly 42 million residents, followed by Dhaka
(Bangladesh) with almost 40 million, and Tokyo (Japan) with 33 million »). Source indépendante lue :
https://www.aljazeera.com/news/2025/11/26/indonesias-jakarta-now-the-worlds-largest-city-tokyo-falls-to-third-un
(26 novembre 2025) : même classement, Jakarta 41,9 millions, Tokyo 33,4 millions, nouvelle définition de la ville
(« contiguous agglomeration » de carrés de 1 km² à 1 500 hab./km² au moins), mais Dacca à « 36.6 million » (de même
UNB, Bangladesh). Le chiffre de Dacca diverge selon les sources et n'est pas utile à la question : retiré du bloc
(« devant Dacca (près de 40 millions) et Tokyo » devient « devant Dacca et Tokyo »). Al Jazeera ne dit rien de
l'édition 2018 (elle cite celle de 2000 pour Tokyo premier) : l'explication a raison de ne pas en parler.

## 2. `petrole-etats-unis` (géopolitique, énergie)

```js
  { id: "petrole-etats-unis", niveau: 2, question: "Quel pays produit le plus de pétrole brut ?",
    options: ["l'Arabie saoudite", "la Russie", "les États-Unis"], juste: 2,
    explication: "Les États-Unis, avec un record de 13,6 millions de barils par jour en 2025, environ 40 % de plus que la Russie ou l'Arabie saoudite (9,6 millions pour cette dernière). Ils sont premiers depuis 2018 (Energy Information Administration).", public: null },
```

Sources : https://www.eia.gov/todayinenergy/detail.php?id=67844 (EIA, « The United States produced more crude oil than
any other country in 2025 », 9 juillet 2026) : « The United States remained the world's largest crude oil producer in
2025, […] extending a streak that began in 2018 when the United States overtook Russia » ; « averaged a record-high
13.6 million barrels per day (b/d) in 2025 » ; « about 40% higher on average in 2025 than that from the next two largest
global crude oil producers, Russia and Saudi Arabia » ; Arabie saoudite « increased from 9.2 million b/d in 2024 to
9.6 million b/d in 2025 ». Mode : primaire (EIA, International Energy Statistics).

Contre-vérification : À CORRIGER. Page de l'EIA relue (9 juillet 2026) : toutes les citations y sont. Mais la page
donne pour la Russie « 9.9 million b/d in 2024 », « largely unchanged in 2025 » : la parenthèse « (9,6 millions) »
placée après « la Russie et l'Arabie saoudite » attribuait 9,6 millions aux deux. Correction dans le bloc : « que la
Russie ou l'Arabie saoudite (9,6 millions pour cette dernière) ». Recoupement : seulement des reprises de l'EIA
vues en résultats de recherche (Enerdata, « US remained world's largest crude oil producer in 2025, EIA reports » ;
Russie 9,89 et Arabie saoudite 9,56 millions de b/j en 2025), pas de source indépendante de l'EIA ; source primaire
lue, suffisante selon la règle.

## 3. `reserves-venezuela` (géopolitique, énergie)

```js
  { id: "reserves-venezuela", niveau: 3, question: "Quel pays possède les plus grandes réserves prouvées de pétrole ?",
    options: ["l'Arabie saoudite", "le Venezuela", "la Russie"], juste: 1,
    explication: "Le Venezuela, avec environ 303 milliards de barils selon l'OPEP, soit 17 % des réserves mondiales, devant l'Arabie saoudite (environ 267 milliards). Ce chiffre, fourni par le Venezuela, est contesté : des spécialistes le jugent très surestimé. L'essentiel est un pétrole extra-lourd, difficile à exploiter, et le pays ne produisait que 0,8 % du pétrole brut mondial en 2023 (Energy Information Administration ; Associated Press).", public: null },
```

Sources : https://www.eia.gov/international/analysis/country/VEN (EIA, analyse pays, mise à jour du 8 février 2024) :
« Venezuela had the world's largest proven crude oil reserves in 2023 with approximately 303 billion barrels (Figure 5),
accounting for approximately 17% of global reserves (Figure 6). Despite the sizeable reserves, Venezuela produced 0.8%
of total global crude oil in 2023. Most of Venezuela's proven oil reserves are extra-heavy crude oi[l] ».
https://gulfnews.com/business/energy/list-top-10-countries-with-biggest-confirmed-oil-reserves-1.500399201 (Gulf News,
mis à jour le 5 janvier 2026) : « the Latin America country's 303 billion barrels remains the planet's largest proven
reserves » ; « Saudi Arabia, second in reserves at 267 billion barrels ». Mode : indirect via EIA et Gulf News, qui
renvoient aux données de l'OPEP (Annual Statistical Bulletin) ; le tableau par pays de l'OPEP est payant (HTTP 402) et
son communiqué de 2025 ne donne que les totaux (monde : 1 567 milliards de barils fin 2024,
https://www.opec.org/pr-detail/1484568-2-july-2025.html).
Point douteux : les données de l'EIA datent de 2023 ; aucune source lue ne donne les réserves par pays fin 2025.

Contre-vérification : À CORRIGER. Page de l'EIA relue (« Last Updated: February 8, 2024 ») : 303 milliards, 17 %,
0,8 % en 2023 et « extra-heavy crude oil from the Orinoco Belt » y sont ; la page ne cite pas l'OPEP. Les pages de
l'OPEP refusent toujours la lecture (HTTP 402). Seconde source sérieuse lue : Associated Press, « Venezuela claims to
have 300 billion barrels of oil in the ground, but experts say that's a stretch », 22 octobre 2026
(https://www.bnnbloomberg.ca/markets/oil/2026/10/22/venezuela-claims-to-have-300-billion-barrels-of-oil-in-the-ground-but-experts-say-thats-a-stretch/) :
d'après le rapport 2026 de l'OPEP, l'Arabie saoudite est « No. 2, with 267 billion barrels » ; l'OPEP « has accepted
the country's proven reserves calculations » et le classe premier chaque année depuis 2011 ; le chiffre est jugé
« inherently problematic and far from proven » ; Francisco Monaldi (université Rice) estime que « 10 billion to 15
billion barrels would be classified as proven reserves in the short term ». Deux sources sérieuses concordantes
(EIA, AP) sur 303 / 267 : la question tient, au sens des réserves déclarées. Mais le chiffre est discuté et doit être
signalé : explication corrigée dans le bloc (« selon l'OPEP », « Ce chiffre, fourni par le Venezuela, est contesté :
des spécialistes le jugent très surestimé », sources EIA et Associated Press). Gulf News, moins solide, n'est plus
nécessaire.

## 4. `casques-bleus` (géopolitique, institutions internationales)

```js
  { id: "casques-bleus", niveau: 2, question: "Quels pays fournissent le plus de casques bleus aux opérations de l'ONU ?",
    options: ["les cinq membres permanents du Conseil de sécurité", "des pays d'Asie du Sud et d'Afrique", "les pays de l'Union européenne"], juste: 1,
    explication: "Fin février 2026, le Rwanda (4 405 militaires et policiers), le Népal (4 340), l'Inde (4 278) et le Bangladesh (4 148) arrivaient en tête, sur 47 298 au total. La Chine en fournissait 1 661, la France 609, le Royaume-Uni 251 et les États-Unis 20 (ONU).", public: null },
```

Sources : https://unsco.unmissions.org/sites/default/files/2026-03/03_country_and_mission_95_february_2026.pdf (ONU,
« Contribution of Uniformed Personnel to UN by Country, Mission, and Personnel Type », « As of: 28/02/2026 »), texte
extrait du PDF : « Total Rwanda 4405 », « Total Nepal 4340 », « Total India 4278 », « Total Bangladesh 3877 271 4148 »
(hommes, femmes, total), « Total China 1661 », « Total France 609 », « Total United Kingdom 222 29 251 », « Total United
States of America 19 1 20 », « Grand Total 42585 4713 47298 ». Mode : primaire (rapport mensuel du département des
opérations de paix, trouvé sur le site d'une mission de l'ONU ; peacekeeping.un.org le liste mais refuse le
téléchargement automatique).
Point douteux : l'ordre des quatre premiers change d'un mois à l'autre (Bangladesh à 5 146 en novembre 2025 selon la
recherche) ; la question porte sur le groupe, pas sur le premier.

Contre-vérification : VALIDÉ. PDF téléchargé et lu en entier (43 pages, « As of: 28/02/2026 », « Report Generated On:
3/25/2026 ») : Rwanda 4405, Nepal 4340, India 4278, Bangladesh 4148, puis Pakistan 2413, Indonesia 1961, Ghana 1935,
China 1661 ; France 609, United Kingdom 251, United States 20 ; Grand Total 47298. Tous les chiffres concordent ; les
cinq premiers sont bien d'Asie du Sud et d'Afrique, la Chine n'est que huitième, les deux distracteurs sont faux.
Source indépendante : résultats de recherche seulement (Dhaka Tribune, classement de l'ONU de mars 2026 : Népal, Inde,
Rwanda, Bangladesh ; page refusée, HTTP 403), qui confirment le groupe de tête et la variation mensuelle. Le rapport
du SIPRI de mai 2026 qui place l'Ouganda en tête compte aussi les opérations non onusiennes (Union africaine) : il ne
contredit pas la question, qui porte sur l'ONU.

## 5. `onu-budget` (géopolitique, institutions internationales)

```js
  { id: "onu-budget", niveau: 3, question: "La quote-part des États-Unis dans le budget ordinaire de l'ONU est de 22 %. Quel pays vient ensuite ?",
    options: ["le Japon", "l'Allemagne", "la Chine"], juste: 2,
    explication: "La Chine, avec 20 % pour 2025 à 2027, loin devant le Japon (6,9 %), l'Allemagne (5,7 %), le Royaume-Uni (4,0 %) et la France (3,9 %). La quote-part de chaque pays suit son revenu national, et aucun ne peut payer plus de 22 % (résolution 79/249 de l'Assemblée générale).", public: null },
```

Sources : https://digitallibrary.un.org/record/4071844/files/A_RES_79_249-EN.pdf (Assemblée générale, résolution 79/249,
barème des quotes-parts pour 2025, 2026 et 2027), texte extrait : « China 20.004 », « Japan 6.930 », « Germany 5.692 »,
« United Kingdom of Great Britain and Northern Ireland 3.991 », « France 3.858 », « United States of America 22.000 ».
Même résolution : « (a) Estimates of gross national income; » et « (h) A maximum assessment rate of 22 per cent; ».
Mode : primaire.

Contre-vérification : À CORRIGER. Résolution téléchargée et lue (adoptée le 24 décembre 2024) : les lignes (a) et (h)
y sont mot pour mot, et les taux 20.004, 6.930, 5.692, 3.991, 3.858 et 22.000 figurent dans le barème. Source
indépendante lue : Pew Research Center, « How the United Nations is funded and who pays the most », 31 juillet 2025
(https://www.pewresearch.org/short-reads/2025/07/31/how-the-united-nations-is-funded-and-who-pays-the-most/markdown) :
États-Unis « responsible for 22% », Chine « next-largest share (20.004%) ». Mais Pew ajoute qu'au 30 avril 2025 les
États-Unis avaient le plus gros arriéré du budget ordinaire (« $1.5 billion ») : « paient 22 % » est inexact. Question
corrigée dans le bloc : « La quote-part des États-Unis dans le budget ordinaire de l'ONU est de 22 %. Quel pays vient
ensuite ? ». Le reste est juste.

## 6. `diaspora-inde` (géopolitique, migrations)

```js
  { id: "diaspora-inde", niveau: 2, question: "De quel pays viennent le plus de migrants internationaux (personnes qui vivent hors de leur pays de naissance) ?",
    options: ["le Mexique", "l'Inde", "la Syrie"], juste: 1,
    explication: "L'Inde : 18,5 millions de personnes nées en Inde vivaient dans un autre pays en 2024, devant la Chine (11,7 millions) et le Mexique (11,6 millions), sur 304 millions de migrants dans le monde (ONU, International Migrant Stock 2024).", public: null },
```

Sources : https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2024_ims_stock_by_sex_and_origin.xlsx
(ONU, Division de la population, International Migrant Stock 2024, par pays d'origine, feuille « Table 1 », colonne
2024, deux sexes) : « World 304021813 » ; « India 18533845 » ; « China 11701619 » ; « Mexico 11596529 » ; suivent
« Ukraine* 9769216 », « Russian Federation 9134094 », « Syrian Arab Republic 8927523 ». Mode : primaire (classement
calculé sur le fichier). Concorde avec le Migration Policy Institute (18,5 millions, résultats de recherche).

Contre-vérification : VALIDÉ. Fichier xlsx téléchargé et relu (feuille « Table 1 », colonne 2024, deux sexes) :
World 304021813, India 18533845, China 11701619, Mexico 11596529 ; classement recalculé sur tous les pays : Inde,
Chine, Mexique, Ukraine, Russie (la Syrie est sixième). Recoupement : l'Organisation internationale pour les
migrations (World Migration Report 2024, vu en résultats de recherche seulement, qui reprend les données de l'ONU de
2020) place aussi l'Inde au premier rang (« nearly 18 million »). Ne double pas `migrants` (part de la population
mondiale, pas pays d'origine).

## 7. `conflits` (géopolitique, conflits)

```js
  { id: "conflits", niveau: 2, question: "En 2025, le nombre de conflits armés impliquant au moins un État a été…",
    options: ["le plus bas depuis 1946", "dans la moyenne depuis la fin de la guerre froide", "le plus élevé depuis 1946"], juste: 2,
    explication: "65 conflits, le plus haut depuis le début des relevés en 1946, dont 13 guerres (au moins 1 000 morts au combat dans l'année) et 8 entre États, deux fois plus qu'en 2024 (Uppsala Conflict Data Program ; Institut de recherche sur la paix d'Oslo).", public: null },
```

Sources : https://www.uu.se/en/press/press-releases/2026/2026-06-09-ucdp-record-number-of-conflicts-between-states
(université d'Uppsala, 9 juin 2026) : « UCDP registered 65 conflicts in which states were involved on one or both sides
during 2025 » ; « Thirteen of these conflicts were classified as wars, which means that they had caused at least 1,000
battle-related deaths in a calendar year » ; « the number of interstate conflicts doubled for the second year in a row,
from two in 2023 to eight in 2025 ». Référence : Davies, Pettersson et Öberg, « Organized violence 1989–2025… »,
*Journal of Peace Research*, 2026, DOI 10.1093/jopres/xjag046.
https://www.prio.org/resolve/PrioPublication/d81ccf0a-03e0-4579-8dd2-b0b2fe845d60 (PRIO, Rustad, « Conflict trends: A
global overview, 1946–2025 ») : « 65 active conflicts across 35 countries – the highest number recorded since 1946 » ;
« a doubling from four in 2024, to eight in 2025 ». Mode : primaire (UCDP et PRIO, qui produisent la donnée).
Point douteux : « depuis 1946 » est lu chez PRIO ; le communiqué d'Uppsala le dit aussi selon la recherche, mais la
lecture automatique ne l'a pas restitué mot pour mot.

Contre-vérification : VALIDÉ. Communiqué d'Uppsala relu : 65 conflits, « the highest number since statistics began
to be recorded in 1946 », 13 guerres (« at least 1,000 battle-related deaths »), conflits entre États « from two in
2023 to eight in 2025 » ; référence Davies, Pettersson et Öberg, *Journal of Peace Research*, DOI 10.1093/jopres/xjag046.
Page du PRIO relue (Rustad, 2026) : « 65 active conflicts across 35 countries – the highest number recorded since
1946 », « a doubling from four in 2024, to eight in 2025 ». Le point douteux est levé : Uppsala dit bien « depuis
1946 ». Les deux distracteurs sont faux. Ne double pas l'entrée `guerres` (nombre de morts, autre jeu).

## 8. `algerie-vaste` (géopolitique, frontières)

```js
  { id: "algerie-vaste", niveau: 2, question: "Quel est le pays le plus vaste d'Afrique ?",
    options: ["la République démocratique du Congo", "l'Algérie", "le Soudan"], juste: 1,
    explication: "L'Algérie, avec 2,38 millions de km², devant la République démocratique du Congo (2,35 millions) et le Soudan (1,88 million).", public: null },
```

Sources : API de la Banque mondiale, indicateur AG.SRF.TOTL.K2 (superficie), 2024 :
https://api.worldbank.org/v2/country/DZA/indicator/AG.SRF.TOTL.K2?format=json&mrv=1 → « Algeria 2024 2381740 » ;
COD → « Congo, Dem. Rep. 2024 2345410 » ; SDN → « Sudan 2024 1878000 » ; LBY → « Libya 2024 1759540 ». Mode :
primaire (Banque mondiale, d'après la FAO).

Contre-vérification : VALIDÉ. API de la Banque mondiale réinterrogée : mêmes quatre valeurs (2024). Recoupement
(résultats de recherche ; Britannica refuse la lecture, HTTP 403) : Algérie première d'Afrique depuis la partition du
Soudan en 2011, environ 2 381 741 km², RDC deuxième. Le Soudan est donné à 1 861 484 km² par d'autres sources
(écart de délimitation) : « 1,88 million » reste la valeur de la Banque mondiale citée, sans incidence sur la réponse.

## 9. `euro-21` (géopolitique, institutions, économie)

```js
  { id: "euro-21", niveau: 2, question: "Combien des 27 pays de l'Union européenne utilisent l'euro ?",
    options: ["12", "21", "27"], juste: 1,
    explication: "21 depuis l'arrivée de la Bulgarie, le 1er janvier 2026. Les six autres gardent leur propre monnaie (Banque centrale européenne).", public: null },
```

Sources : https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260101~c830245e42.en.html (BCE, « Bulgaria introduces
the euro », 1er janvier 2026) : « Bulgaria becomes 21st euro area member » ; « bring[s] the number of European Union
(EU) Member States using the single European currency to 21 ». Mode : primaire.

Contre-vérification : VALIDÉ. Communiqué de la BCE relu (1er janvier 2026) : « Bulgaria becomes 21st euro area
member », « bringing the number of European Union (EU) Member States using the single European currency to 21 ».
Recoupement (résultats de recherche) : Banque de France, « 21st member euro area 2026: Bulgaria », et bne IntelliNews
(« just six of the bloc's 27 members outside the euro area »). Ne double pas `ue-27`, qui porte sur le nombre d'États.

## 10. `langues-onu` (géopolitique, langues)

```js
  { id: "langues-onu", niveau: 2, question: "Laquelle de ces langues est une langue officielle de l'ONU ?",
    options: ["l'hindi", "l'allemand", "l'arabe"], juste: 2,
    explication: "L'arabe. L'ONU a six langues officielles : l'anglais, l'arabe, le chinois, l'espagnol, le français et le russe.", public: null },
```

Sources : https://www.un.org/en/our-work/official-languages (ONU, « Official Languages ») : « There are six official
languages of the UN. These are Arabic, Chinese, English, French, Russian and Spanish. » Mode : primaire.

Contre-vérification : VALIDÉ. Page relue (WebFetch refusé, lue par curl) : phrase mot pour mot ; la version française
https://www.un.org/fr/our-work/official-languages dit « six langues officielles : l'anglais, l'arabe, le chinois,
l'espagnol, le français et le russe », ordre repris dans l'explication. Pas de source indépendante lue : fait
institutionnel, source primaire suffisante. Niveau 2 discutable (plutôt 1) mais conforme à la règle de notoriété.

## 11. `cobalt-congo` (géopolitique, matières premières)

```js
  { id: "cobalt-congo", niveau: 2, question: "Quelle part du cobalt extrait dans le monde (un métal des batteries) vient de la République démocratique du Congo ?",
    options: ["environ 15 %", "environ 40 %", "environ 75 %"], juste: 2,
    explication: "73 % en 2025 (230 000 tonnes sur 310 000), loin devant l'Indonésie (14 %). Le pays détient aussi la moitié des réserves connues (Institut d'études géologiques des États-Unis, USGS).", public: null },
```

Sources : https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-cobalt.pdf (USGS, Mineral Commodity Summaries 2026,
« Cobalt »), texte extrait : « Congo (Kinshasa) was the world's leading source of mined cobalt and accounted for an
estimated 73% of world total, followed by Indonesia, which accounted for 14% » ; tableau : « Congo (Kinshasa) 226,000
230,000 6,000,000 » (production 2024, 2025 estimée, réserves) ; « World total (rounded) 302,000 310,000 12,000,000 ».
Mode : primaire (moitié des réserves : 6 sur 12 millions de tonnes, calcul).

Contre-vérification : VALIDÉ. PDF de l'USGS téléchargé et lu : « accounted for an estimated 73% of world total,
followed by Indonesia, which accounted for 14% » ; production 2025 estimée 230,000 sur 310,000 ; réserves 6,000,000
sur 12,000,000. Recoupement qualitatif seulement (AIE, Global Critical Minerals Outlook 2025 et 2026, en résultats
de recherche : RDC principal producteur, quotas d'exportation depuis octobre 2025) ; aucune seconde source chiffrée
lue, source primaire suffisante. À noter : les quotas d'exportation de la RDC (96 600 t par an en 2026 et 2027,
d'après le même PDF) pourraient faire baisser sa part ; l'explication est datée de 2025, donc juste.

## 12. `commerce-maritime` (géopolitique, commerce)

```js
  { id: "commerce-maritime", niveau: 2, question: "Quelle part des marchandises échangées entre pays (en volume) voyage par la mer ?",
    options: ["environ 20 %", "environ 50 %", "environ 80 %"], juste: 2,
    explication: "Environ 80 %, et plus encore pour la plupart des pays en développement. D'où l'effet mondial des blocages de détroits ou de canaux, qui allongent les routes et renchérissent le transport (CNUCED, Étude sur les transports maritimes).", public: null },
```

Sources : https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport (CNUCED) : « Around 80% of
the volume of international trade in goods is carried by sea, and the percentage is even higher for most developing
countries ». https://unctad.org/publication/review-maritime-transport-2024 (CNUCED, édition 2024) : « These disruptions
are extending shipping routes, straining supply chains and raising costs […] as over 80% of world trade volume is
carried by sea. » Mode : primaire.
Point douteux : chiffre arrondi et ancien (repris d'édition en édition depuis au moins 2011) ; pas d'année précise.

Contre-vérification : VALIDÉ. Les deux pages de la CNUCED relues : « Around 80% of the volume of international trade
in goods is carried by sea » (page thématique, qui annonce l'édition 2025 du 24 septembre 2025) et « as over 80% of
world trade volume is carried by sea » (édition 2024). Source indépendante de la page citée : ONU Info, 24 septembre
2025 (https://news.un.org/en/story/2025/09/1165939) : « Shipping carries over 80 per cent of the world's merchandise
for export and import ». Le chiffre est une estimation arrondie sans année, mais toujours repris en 2025 ; l'explication
ne lui donne pas d'année, ce qui est honnête. Les distracteurs (20 %, 50 %) sont nettement faux.

## 13. `chine-ppa` (économie)

```js
  { id: "chine-ppa", niveau: 2, question: "Quand on corrige les écarts de prix entre pays (parité de pouvoir d'achat), quel pays produit le plus de richesse ?",
    options: ["les États-Unis", "la Chine", "l'Inde"], juste: 1,
    explication: "La Chine, avec 19,5 % du PIB mondial en 2025, devant les États-Unis (14,6 %) et l'Inde (8,1 %). Aux taux de change du marché, les États-Unis restent premiers (26 %, contre 16 % pour la Chine).", public: null },
```

Sources : API de la Banque mondiale, NY.GDP.MKTP.PP.CD (PIB en PPA, dollars internationaux courants), 2025 :
« China 2025 41259823532528 », « United States 2025 30769700000000 », « India 2025 17197369286822 »,
« World 2025 211167158659272 » ; NY.GDP.MKTP.CD (dollars courants), 2025 : « China 2025 19498039388042.6 »,
« United States 2025 30769700000000 », « World 2025 118350166039396 ». URL :
https://api.worldbank.org/v2/country/CHN;USA;IND;WLD/indicator/NY.GDP.MKTP.PP.CD?format=json&mrv=1 (lu pays par pays).
Mode : primaire (Banque mondiale, d'après le Programme de comparaison internationale) ; parts calculées.

Contre-vérification : VALIDÉ. API réinterrogée : mêmes valeurs. Calculs refaits : PPA, Chine 19,5 %, États-Unis
14,6 %, Inde 8,1 % ; dollars courants, États-Unis 26,0 %, Chine 16,5 % (arrondi à « 16 % » : acceptable, « 16,5 % »
serait plus exact). Recoupement (résultats de recherche) : Conseil économique du Premier ministre indien, « The World
in PPP » (juillet 2026), d'après le FMI : Chine « almost 20% », États-Unis 14,6 % en 2025, Inde 8,5 % ; ordre identique.

## 14. `riz-inde` (économie, commerce)

```js
  { id: "riz-inde", niveau: 2, question: "Quel pays exporte le plus de riz ?",
    options: ["la Chine", "la Thaïlande", "l'Inde"], juste: 2,
    explication: "L'Inde, avec environ 23 millions de tonnes sur la campagne 2024-2025, soit plus du tiers des exportations mondiales, devant le Viêt Nam et la Thaïlande (environ 8 millions chacun). L'Inde est aussi devenue le premier producteur, devant la Chine, qui importe plus de riz qu'elle n'en exporte (ministère de l'Agriculture des États-Unis).", public: null },
```

Sources : https://apps.fas.usda.gov/psdonline/downloads/psd_grains_pulses_csv.zip (USDA, Production, Supply and
Distribution, fichier du 10 novembre 2026), lignes « Rice, Milled », attribut « Exports », année commerciale 2024 :
India 22 827, Vietnam 8 063, Thailand 7 859, Pakistan 5 133 (milliers de tonnes) ; somme des pays 61 431, d'où
37,2 % pour l'Inde (calcul). Mode : primaire.
Même fichier, même campagne : India Production 150 184, China Production 145 275, China Imports 2 335, China Exports
1 153 (milliers de tonnes).

Contre-vérification : VALIDÉ. Fichier de l'USDA téléchargé (CSV daté du 10 novembre 2026) et recalculé : exportations
2024 Inde 22 827, Viêt Nam 8 063, Thaïlande 7 859, Pakistan 5 133 ; somme 61 431 ; part de l'Inde 37,2 % ; production
Inde 150 184, Chine 145 275 ; Chine importations 2 335, exportations 1 153. Tout concorde. Source indépendante lue :
All India Radio (newsonair.gov.in, 5 janvier 2026), d'après le ministre indien de l'Agriculture : « India has become
the world's largest producer of rice, surpassing China », 150,18 contre 145,28 millions de tonnes. Pour les
exportations, plusieurs articles (résultats de recherche) donnent à l'Inde 38 à 40 % du commerce mondial, cohérent
avec « plus du tiers ». Campagne suivante (2025) déjà dans le fichier : Inde 21 921 sur 58 198, même ordre.

## 15. `polio` (santé)

```js
  { id: "polio", niveau: 2, question: "Dans combien de pays la poliomyélite sauvage circule-t-elle encore en permanence ?",
    options: ["2", "25", "plus de 100"], juste: 0,
    explication: "Deux, l'Afghanistan et le Pakistan, contre plus de 125 en 1988, quand on estimait les cas à 350 000 par an. Ils ont baissé de plus de 99 % depuis (OMS).", public: null },
```

Sources : https://www.who.int/news-room/fact-sheets/detail/poliomyelitis (OMS, aide-mémoire du 2 avril 2025) : « Cases
due to wild poliovirus have decreased by over 99% since 1988, from an estimated 350 000 cases in more than 125 endemic
countries, to two endemic countries » ; « Endemic transmission of wild poliovirus is continuing in areas of Afghanistan
and Pakistan ». https://www.who.int/news/item/13-11-2026-statement-of-the-forty-sixth-meeting-of-the-polio-ihr-emergency-committee
(OMS, 13 novembre 2026) : « 25 new WPV1 cases have been reported from the two endemic countries, Afghanistan (22) and
Pakistan (3) ». Mode : primaire.

Contre-vérification : VALIDÉ. Aide-mémoire de l'OMS relu (2 avril 2025) : baisse de plus de 99 % depuis 1988,
350 000 cas, plus de 125 pays, deux pays d'endémie (Afghanistan, Pakistan). Déclaration du comité d'urgence relue
(13 novembre 2026) : « global WPV1 transmission remains geographically confined to the two endemic countries » ;
29 cas en 2026 à ce jour, 52 en 2025. Le statut est donc à jour en novembre 2026. Pas de source hors OMS lue (l'OMS
produit la donnée ; source primaire suffisante). Le mot « sauvage » écarte bien les poliovirus dérivés de vaccins,
présents dans d'autres pays.

## 16. `paludisme` (santé)

```js
  { id: "paludisme", niveau: 3, question: "Combien de personnes le paludisme tue-t-il chaque année ?",
    options: ["environ 60 000", "environ 600 000", "environ 6 millions"], juste: 1,
    explication: "Environ 610 000 en 2024, pour 282 millions de cas. 95 % des décès surviennent dans la région africaine de l'OMS, et les trois quarts de ces morts sont des enfants de moins de 5 ans (OMS).", public: null },
```

Sources : https://www.who.int/news-room/fact-sheets/detail/malaria (OMS, aide-mémoire du 4 décembre 2025) : « Globally in
2024, there were an estimated 282 million malaria cases and 610 000 malaria deaths in 80 countries » ; « In 2024, the
WHO African Region was home to 95% of malaria cases (265 million) and 95% (579 000) of malaria deaths. Children under 5
accounted for about 75% of all malaria deaths in the Region. » Mode : primaire.
Remarque : « Afrique » désigne la région africaine de l'OMS (sans l'Égypte, le Maroc, la Tunisie, la Libye, la Somalie,
Djibouti ni le Soudan) ; écrire « dans la région africaine de l'OMS » si l'on veut être exact.

Contre-vérification : À CORRIGER. Aide-mémoire relu (4 décembre 2025) : 282 millions de cas, 610 000 décès en 2024 ;
« the WHO African Region was home to […] 95% (579 000) of malaria deaths » ; « Children under 5 accounted for about
75% of all malaria deaths in the Region » (une autre phrase de la page dit « about 76% » : « les trois quarts »
couvre les deux). « En Afrique » est inexact (la région de l'OMS n'est pas le continent) : bloc corrigé en « dans la
région africaine de l'OMS », et « ces morts africains » en « ces morts ». Recoupement : le même chiffre de 610 000
(World Malaria Report 2025) figure déjà dans le stock des causes de décès de `jeux-donnees.js` (entrée `paludisme`, source
« 2024 (OMS, World Malaria Report 2025) ») ; ce n'est pas un doublon de `MONDE`, mais les deux doivent rester d'accord.

## 17. `surpoids` (santé)

```js
  { id: "surpoids", niveau: 2, question: "Dans le monde, quelle part des adultes est en surpoids (obésité comprise) ?",
    options: ["15 %", "30 %", "45 %"], juste: 2,
    explication: "45 % en 2024, soit 2,6 milliards d'adultes, dont 940 millions obèses. L'obésité des adultes a plus que doublé depuis 1990 (OMS).", public: null },
```

Sources : https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight (OMS, aide-mémoire du 7 octobre 2026) :
« In 2024, 45% of adults 18 years and over (2.6 billion) were overweight. Of these, 940 million were living with obesity
(16% of all adults). » ; « Worldwide adult obesity has more than doubled since 1990 ». Mode : primaire.

Contre-vérification : VALIDÉ. Aide-mémoire relu (7 octobre 2026) : les trois phrases y sont mot pour mot. Pas de
source hors OMS lue ; source primaire suffisante. Ne double pas `maigreur-surpoids`, qui porte sur les enfants de
moins de 5 ans. Les distracteurs (15 %, 30 %) sont nettement faux.

## 18. `plastique` (environnement)

```js
  { id: "plastique", niveau: 2, question: "Quelle part des déchets plastiques est finalement recyclée dans le monde ?",
    options: ["environ 9 %", "environ 30 %", "environ 50 %"], juste: 0,
    explication: "Environ 9 % en 2019, pertes du recyclage déduites. Près de la moitié finit en décharge, 19 % est incinérée et 22 % est mal gérée (décharges sauvages, brûlage à l'air libre, rejets dans la nature) (OCDE, Global Plastics Outlook).", public: null },
```

Sources : https://ourworldindata.org/grapher/share-plastic-fate.csv (Our World in Data, d'après « OECD, Global Plastics
Outlook – Plastics waste by region and end-of-life fate », métadonnées lues sur
https://ourworldindata.org/grapher/share-plastic-fate.metadata.json) : « World,OWID_WRL,2019,9.292344,19.048033,22.45448,49.205143 »
(colonnes Recycled, Incinerated, Mismanaged, Landfilled). https://www.voanews.com/a/percent-of-plastic-worldwide-is-recycled-oecd-says-/6455012.html
(VOA, 22 février 2022) : « only 9% of plastic waste was ultimately recycled », « 19% was incinerated », « almost 50% went
to sanitary landfills ». Mode : indirect via Our World in Data et VOA, qui citent l'OCDE (le communiqué et le rapport
de l'OCDE refusent la lecture automatique, HTTP 403).
Point douteux : donnée de 2019, la plus récente de l'OCDE trouvée.

Contre-vérification : VALIDÉ. Communiqué de l'OCDE lu (curl ; WebFetch refusé), 22 février 2022,
https://www.oecd.org/en/about/news/press-releases/2022/02/plastic-pollution-is-growing-relentlessly-as-waste-management-and-recycling-fall-short.html :
« Only 9% of plastic waste is recycled (15% is collected for recycling but 40% of that is disposed of as residues).
Another 19% is incinerated, 50% ends up in landfill and 22% evades waste management systems and goes into
uncontrolled dumpsites, is burned in open pits or ends up in terrestrial or aquatic environments », données de 2019.
La source primaire est donc lue ; Our World in Data (49,2 % en décharge) et VOA concordent. « Près de la moitié »
pour 50 % (49,2 % chez OWID) est juste. Mode à corriger dans la note de l'auteur : primaire, plus indirect.

## 19. `ozone` (environnement)

```js
  { id: "ozone", niveau: 2, question: "La couche d'ozone, qui nous protège des ultraviolets…",
    options: ["continue de s'amincir", "ne change plus", "se reconstitue"], juste: 2,
    explication: "Elle se reconstitue depuis l'abandon de près de 99 % des substances interdites qui la détruisaient (protocole de Montréal). Selon l'évaluation scientifique de 2022, elle devrait retrouver son état de 1980 vers 2040 dans la plupart du monde, 2045 au-dessus de l'Arctique et 2066 au-dessus de l'Antarctique (Organisation météorologique mondiale et Programme des Nations unies pour l'environnement).", public: null },
```

Sources : https://wmo.int/news/media-centre/ozone-layer-recovery-track-helping-avoid-global-warming-05degc (OMM et PNUE,
janvier 2023) : « confirms the phase out of nearly 99% of banned ozone-depleting substances has succeeded in
safeguarding the ozone layer » ; « If current policies remain in place, the ozone layer is expected to recover to 1980
values (before the appearance of the ozone hole) by around 2066 over the Antarctic, by 2045 over the Arctic and by 2040
for the rest of the world. » https://wmo.int/media/news/small-and-short-lived-2025-ozone-hole-confirms-long-term-recovery-trend
(OMM, 2025) : mêmes dates, « according to the most recent assessment in 2022. The next assessment will be in 2026. »
Mode : primaire.
Point douteux : l'évaluation de 2026 pourrait modifier les dates.

Contre-vérification : À CORRIGER. Communiqué de l'OMM relu (9 janvier 2023) : « phase out of nearly 99% of banned
ozone-depleting substances », dates 2066 / 2045 / 2040. Page de l'OMM relue (12 décembre 2025, mise à jour le
16 septembre 2026) : mêmes dates « according to the most recent assessment in 2022. The next assessment will be in
2026. » Page du projet d'évaluation 2026 (https://csl.noaa.gov/assessments/ozone/2026, NOAA, coauteur) : le rapport
« will be released at the end of 2026 » ; aucune date de reconstitution nouvelle publiée à ce jour. Recoupement
(résultats de recherche) : Scientific American reprend 2066 / 2045 / 2040. Corrections dans le bloc : dater les
projections (« Selon l'évaluation scientifique de 2022 »), car l'évaluation de 2026 est imminente ; « l'interdiction de
près de 99 % des substances » devient « l'abandon de près de 99 % des substances interdites », plus fidèle à
« phase out of nearly 99% of banned » ; source « (Organisation météorologique mondiale et Programme des Nations unies
pour l'environnement) » au lieu de « (ONU, Organisation météorologique mondiale) ». À revoir à la sortie du rapport 2026.

## 20. `voitures-electriques` (technologie)

```js
  { id: "voitures-electriques", niveau: 2, question: "Quelle part des voitures neuves vendues dans le monde en 2025 était électrique (hybrides rechargeables compris) ?",
    options: ["5 %", "un quart", "la moitié"], juste: 1,
    explication: "Un quart : plus de 20 millions de voitures, dont 65 % entièrement électriques et le reste hybrides rechargeables. Près de 55 % en Chine, 28 % en Europe, mais un peu moins de 10 % aux États-Unis (Agence internationale de l'énergie).", public: null },
```

Sources : https://www.iea.org/reports/global-ev-outlook-2026/executive-summary (AIE, Global EV Outlook 2026) : « Electric
car sales grew by 20% globally to exceed 20 million in 2025, meaning one-quarter of all new cars sold were electric » ;
Europe « rising by more than 30% to reach 28% of total sales » ; Chine « EVs still accounted for nearly 55% of all car
sales » ; « In the United States, electric car sales remained relatively stable at just under 10% of car sales ».
Mode : primaire.
Remarque : l'AIE compte les hybrides rechargeables parmi les voitures électriques (convention connue, non relue ici).

Contre-vérification : À CORRIGER. Résumé de l'AIE relu : toutes les citations y sont. Convention vérifiée sur
https://www.iea.org/reports/global-ev-outlook-2026/trends-in-electric-cars : « Electric cars include battery electric
and plug-in hybrid electric vehicles » et « The share of battery electric cars in total electric car sales increased to
65% ». Sans cette précision, « électrique » serait compris comme « 100 % électrique » (environ 16 % des ventes, calcul : 65 % d'un quart) et la
réponse deviendrait trompeuse. Bloc corrigé : question « … était électrique (hybrides rechargeables compris) ? » et
explication « dont 65 % entièrement électriques et le reste hybrides rechargeables ». Source indépendante (résultats
de recherche) : Rho Motion / Benchmark, 20,7 millions de voitures électriques et hybrides rechargeables vendues en
2025 (+20 %), Chine 12,9 millions, Europe 4,3 millions, Amérique du Nord 1,8 million (en baisse).

---

## Vérifiés mais non retenus (en réserve)

- **OTAN, 32 membres** : https://www.nato.int/cps/en/natohq/topics_52044.htm : « At present, NATO has 32 member
  countries » ; « 1949 - The 12 founding members » ; « Sweden 2024 ». Écarté : trop proche de `ue-27`.
- **ONU, 193 États membres** : https://www.un.org/en/about-us/member-states : 193 États listés avec leur date d'admission
  (le dernier, le Soudan du Sud, le 14-07-2011) ; la page ne l'écrit pas en toutes lettres. Écarté : donnée connue,
  proche de `ue-27`.
- **Charbon, Chine** : https://www.iea.org/reports/coal-mid-year-update-2026/demand : « accounting for more than 56% of
  consumption » ; https://www.iea.org/reports/global-energy-review-2026/coal : « China consumes 30% more coal than the
  rest of the world put together ». Écarté : recoupe `chine-co2`.

## Écartés

- **Nombre de langues vivantes et part des langues menacées (Ethnologue)** : ethnologue.com refuse la lecture
  automatique (HTTP 403) ; aucune seconde source primaire lue.
- **Enfants non scolarisés (272 ou 273 millions, Unesco)** : chiffres seulement lus dans des résultats de recherche et
  des articles de presse (deux estimations qui diffèrent, 2025 et 2026) ; recoupe aussi `filles` et `college`.
- **Réserves de pétrole par pays fin 2025 (OPEP, bulletin 2026)** : tableau payant ; la question `reserves-venezuela`
  s'en tient aux données de l'EIA (2023).
- **Classement exact des contributeurs de casques bleus** : trop variable d'un mois à l'autre ; la question porte sur le
  groupe de tête.
