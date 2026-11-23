# Vrai ou faux : lot 2, 20 propositions (22 novembre 2026)

**Bilan de la contre-vérification (23 novembre 2026)** : 20 éléments ; 16 validés, 2 à corriger (`suez-fermeture`, `statues-couleurs`, blocs corrigés), 2 rejetés (`coree-armistice`, doublon de sens avec `japon-russie` ; `huit-verres`, réponse dépendant d'une définition), déplacés dans « Écartés ». Doublons de sens cherchés dans `VRAI_FAUX`, `MONDE`, ordres de grandeur, `EVENEMENTS`, `PAIRES_CELEBRES`, `CITATIONS` et toute la banque `vf-`/`ex-` de `grand-test-donnees.js` : un seul trouvé. Toutes les URL rouvertes ; tous les passages cités retrouvés.

Propositions pour `VRAI_FAUX` (`static/jeux-donnees.js`), à faire contre-vérifier par l'agent `verificateur-sources`
avant tout ajout. Aucune n'a de champ `depuis:` : le lui donner au moment de l'ajout (numéro du jour suivant la
publication), puis mettre à jour `tests/rotation-manifeste.json`.

Répartition : 8 géopolitique et histoire contemporaine, 1 histoire ancienne, 1 calendrier, 3 sciences, 1 géographie
physique, 3 médecine et nutrition, 2 technologie, 2 arts. 11 vraies, 9 fausses ; parmi les vraies, au moins sept
paraissent fausses (`bolivie-marine`, `commonwealth`, `antarctique-traite`, `suez-fermeture`, `islande-armee`,
`onu-ukraine`, `an-zero`, `glaciers-afrique`, `seismes-lune`).

Doublons cherchés par grep (mots clés de chaque sujet) dans `static/*.js` et `static/en/*.js` : `VRAI_FAUX`, banque
`vf-…` et exemples `ex-…` de `grand-test-donnees.js`, quiz, ordres de grandeur, `EVENEMENTS`, `PAIRES_CELEBRES`,
`MONDE`. Aucun sujet repris. Identifiants absents de `static/`. Sujets voisins sans doublon : `ex-panama-suez`
(géographie du canal, pas sa fermeture), `vf-saturne-flotterait` (densité, pas les lunes), `ex-kilimandjaro` (pays,
pas les glaciers).

Remarque hors lot : six affirmations du lot 1 déjà intégrées doublent la banque du Grand test : `lemmings`
(`vf-lemmings`), `salem` (`vf-salem-buchers`), `bistrot` (`vf-bistrot-russe`), `chats-sucre` (`vf-chat-sucre`),
`iss-gravite` (`vf-apesanteur-orbite`) et `mercure-chaude` (`vf-venus-plus-chaude`). À trancher par le propriétaire.

Pages lues le 22 novembre 2026, avec l'outil de lecture web ou `curl -sL` quand il était refusé. Sites refusant la
lecture : britannica.com, metmuseum.org (429), icj-cij.org (PDF), nga.gov, pubmed.ncbi.nlm.nih.gov (résumé lu via
l'API d'Europe PMC).

---

## Géopolitique et histoire contemporaine

### 2. telephone-rouge (faux)

```js
  { id: "telephone-rouge", niveau: 2, texte: "Pendant la guerre froide, le « téléphone rouge » permettait aux dirigeants américain et soviétique de se parler de vive voix.", vrai: false,
    explication: "Ce n'était pas un téléphone. L'accord du 20 juin 1963, conclu après la crise des missiles de Cuba, prévoyait des téléscripteurs reliés par télégraphe et par radiotélégraphe : on y échangeait des messages écrits. Le terminal américain était au Pentagone, pas à la Maison-Blanche. Le télécopieur a remplacé les téléscripteurs dans les années 1980.", source: "Département d'État américain, « Memorandum of Understanding… Regarding the Establishment of a Direct Communications Link » (1963) ; Smithsonian Magazine, 2013" },
```

Sources :
- https://2009-2017.state.gov/t/isn/4785.htm (texte et historique officiels) : « Signed at Geneva June 20, 1963 » ; « The Cuban missile crisis of October 1962 compellingly underscored the importance of prompt, direct communication between heads of state. » ; « The direct communications link would comprise: (1) two terminal points with teletype equipment; (2) a full-time duplex wire telegraph circuit (Washington-London-Copenhagen-Stockholm-Helsinki-Moscow); and (3) a full-time duplex radiotelegraph circuit (Washington-Tangier-Moscow). »
- https://www.smithsonianmag.com/history/there-never-was-such-a-thing-as-a-red-phone-in-the-white-house-1129598/ (Tom Clavin, 18 juin 2013, lu par `curl`) : « there was no red phone involved » ; « They were delivered not to the White House but to the Pentagon, which has remained home to the “hotline” ever since. » ; « In 1983, he initiated negotiations that resulted in upgrades to the system that included high-speed fax capability; the ’60s-era teletype circuits were discontinued five years later. »
- Mode : primaire (département d'État) pour l'accord et le matériel ; Smithsonian pour le Pentagone et le télécopieur.

Contre-vérification : VALIDÉ. Relu le 23 novembre 2026 : texte et historique du département d'État (date, crise de Cuba, téléscripteurs, circuits télégraphique et radiotélégraphique) et Smithsonian Magazine (pas de téléphone rouge, Pentagone, télécopieur négocié en 1983, téléscripteurs arrêtés cinq ans plus tard), concordants. Aucun doublon de sens trouvé.

### 3. bolivie-marine (vrai)

```js
  { id: "bolivie-marine", niveau: 2, texte: "La Bolivie, qui n'a aucun accès à la mer, possède une marine militaire.", vrai: true,
    explication: "Sa Constitution de 2009 compte l'Armada boliviana parmi les armes des forces armées, avec l'armée de terre et l'armée de l'air. Elle lui confie l'administration et la protection des intérêts « maritimes, fluviaux et lacustres » du pays et de sa marine marchande.", source: "Constitution de l'État plurinational de Bolivie (2009), articles 243 et 268 ; Cour internationale de justice, affaire Bolivie c. Chili" },
```

Sources :
- https://www.constituteproject.org/constitution/Bolivia_2009?lang=es (texte espagnol, lu par `curl`) : article 243, « Las Fuerzas Armadas del Estado están orgánicamente constituidas por el Comando en Jefe, Ejército, la Fuerza Aérea y la Armada Boliviana » ; article 268, « El desarrollo de los intereses marítimos, fluviales y lacustres, y de la marina mercante será prioridad del Estado, y su administración y protección será ejercida por la Armada Boliviana, de acuerdo con la ley. »
- https://www.icj-cij.org/case/153 (Obligation de négocier un accès à l'océan Pacifique, arrêt du 1er octobre 2018) : « Bolivia's landlocked situation ».
- Mode : primaire. La perte du littoral lors de la guerre du Pacifique (1879-1884) n'a pas été lue sur une source primaire (résumé de l'arrêt de la CIJ refusé) : retirée de l'explication. L'article 267 (revendication maritime) est volontairement laissé de côté : sujet politique.

Contre-vérification : VALIDÉ. Articles 243 et 268 relus mot pour mot (constituteproject.org). Source indépendante lue : Foreign Policy, Joshua Keating, « A navy without an ocean », 28 août 2008 (marine bolivienne « landlocked at Lake Titicaca »). Neutre : la revendication maritime (art. 267) n'est pas évoquée. Ne dépend pas d'une définition (l'Armada est une arme des forces armées selon la Constitution). Pas de doublon avec `ex-titicaca` (frontière du lac) ni `ex-nepal-mer`.

### 4. commonwealth (vrai)

```js
  { id: "commonwealth", niveau: 3, texte: "Le Mozambique et le Rwanda, qui n'ont jamais été des colonies britanniques, sont membres du Commonwealth.", vrai: true,
    explication: "Le Mozambique y est entré en 1995, le Rwanda en 2009, puis le Gabon et le Togo en 2022. Le Commonwealth lui-même dit de ces quatre pays qu'ils n'ont « aucun lien historique avec l'Empire britannique ».", source: "Commonwealth, « Our history »" },
```

Sources :
- https://thecommonwealth.org/history : « The last four countries to join the Commonwealth - Mozambique, Rwanda, Gabon and Togo - have no historical ties to the British Empire. » ; « 13 November 1995. Mozambique becomes the 54th country to join the Commonwealth. » ; « 29 November 2009. Rwanda becomes the 55th country to join the Commonwealth. » ; Gabon et Togo, juin 2022.
- Mode : primaire. Le Togo n'est pas dans l'affirmation : une partie du Togo allemand a été sous mandat britannique (puis rattachée au Ghana), nuance non lue sur une source primaire. La page donne le rang de 55e à la fois au Rwanda et au Gabon : rangs non repris.

Contre-vérification : VALIDÉ. thecommonwealth.org/history relu : « The last four countries to join the Commonwealth - Mozambique, Rwanda, Gabon and Togo - have no historical ties to the British Empire », Mozambique 13 novembre 1995, Rwanda 29 novembre 2009, Gabon juin 2022. Primaire (l'organisation elle-même) ; l'explication attribue bien la formule au Commonwealth. Neutre.

### 5. antarctique-traite (vrai)

```js
  { id: "antarctique-traite", niveau: 2, texte: "En pleine guerre froide, les États-Unis et l'URSS ont signé ensemble un traité qui démilitarise tout un continent.", vrai: true,
    explication: "Le traité sur l'Antarctique, signé à Washington le 1er décembre 1959 par douze pays, dont les deux superpuissances, réserve le continent aux activités pacifiques. Il y interdit les bases militaires, les manœuvres et les essais d'armes, ainsi que les explosions nucléaires. Le département d'État américain le présente comme le premier des accords de limitation des armements de l'après-guerre.", source: "Département d'État américain, « Antarctic Treaty » (texte et historique)" },
```

Sources :
- https://2009-2017.state.gov/t/avc/trty/193967.htm (lu par `curl`) : « Signed at Washington December 1, 1959 » ; « The Antarctic Treaty, the earliest of the post-World War II arms limitation agreements » ; « It demilitarized the Antarctic Continent » ; préambule : « The Governments of Argentina, Australia, Belgium, Chile, the French Republic, Japan, New Zealand, Norway, the Union of South Africa, the Union of Soviet Socialist Republics, the United Kingdom of Great Britain and Northern Ireland, and the United States of America » ; article I : « Antarctica shall be used for peaceful purposes only. There shall be prohibited, inter alia, any measures of a military nature, such as the establishment of military bases and fortifications, the carrying out of military maneuvers, as well as the testing of any type of weapons. » ; « Nuclear explosions and the disposal of radioactive waste material in Antarctica are prohibited. »
- https://www.ats.aq/e/antarctictreaty.html (Secrétariat du traité) : « signed in Washington on 1 December 1959 » ; « Antarctica shall be used for peaceful purposes only ».
- Mode : primaire. Le traité permet des militaires pour la recherche (« does not prohibit the use of military personnel or equipment, however, for scientific research ») : l'explication parle de bases, manœuvres et essais, pas de « toute présence militaire ».

Contre-vérification : VALIDÉ. Texte du traité et historique (département d'État) relus ; source indépendante lue : Secrétariat du traité sur l'Antarctique (ats.aq), « signed in Washington on 1 December 1959 », « peaceful purposes only ». Aucun doublon (l'élément `desert` parle du climat de l'Antarctique).

### 6. suez-fermeture (vrai)

```js
  { id: "suez-fermeture", niveau: 2, texte: "Le canal de Suez est resté fermé à la navigation pendant huit ans, de 1967 à 1975.", vrai: true,
    explication: "La navigation s'est arrêtée avec la guerre de juin 1967. Le canal n'a rouvert que le 5 juin 1975, après avoir été débarrassé des épaves et des restes de la guerre. Une quinzaine de cargos y ont été pris au piège en 1967, et la plupart y sont restés jusqu'à la réouverture ; le sable qui les recouvrait leur a valu le surnom de « flotte jaune ».", source: "Autorité du canal de Suez, « Canal History » ; IMarEST, « The Suez Great Bitter Lake saga », 2021 ; Al Jazeera, 2019" },
```

Sources :
- https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalHistory.aspx (lu par `curl`) : « its closure after the 1967 war followed by its reopening in June of 1975 » ; « The Re-opening of the Suez Canal (June 5th, 1975): Navigation through the Canal stopped after the Israeli aggression that started on June 5th, 1967 » ; « the canal was reopened for world navigation in June 1975 after cleaning the canal from the remnants of the war and picking up the sinking ships ».
- https://www.imarest.org/resource/the-suez-great-bitter-lake-saga.html (Institute of Marine Engineering, Science & Technology, 14 mai 2021) : « a Suez Canal blockage that trapped 15 ships for eight years » ; « 14 ships being stuck for eight years in the Great Bitter Lake, with one vessel stuck in Lake Timsah » ; « the entire fleet had a yellowish appearance ».
- https://www.aljazeera.com/programmes/aljazeeraworld/2019/11/suez-yellow-fleet-191119110234435.html : « fourteen cargo ships accidentally caught up in the June 1967 Arab-Israeli war, and stuck in the Suez Canal while it remained closed for eight years » ; « nicknamed “The Yellow Fleet” ».
- Mode : primaire (Autorité du canal) pour les dates ; indirect pour la « flotte jaune », vérifié via IMarEST et Al Jazeera, concordants (14 ou 15 navires selon le décompte : « une quinzaine »). La formulation « Israeli aggression » de l'Autorité n'est pas reprise : « guerre de juin 1967 ».

Contre-vérification : À CORRIGER. Dates relues sur la page de l'Autorité du canal (« Navigation through the Canal stopped », « June 5th, 1975 »). « Flotte jaune » : deux sources secondaires sérieuses et concordantes relues, IMarEST (14 mai 2021 : « trapped 15 ships for eight years », sable du désert, « yellowish appearance ») et Al Jazeera (2019 : « fourteen cargo ships », « covered in sand for 8 years », « The Yellow Fleet ») ; Quartz concorde (« stranded there for the next eight years »). Correction : la liste des navires de l'IMarEST note un navire « Sunk in 1973 during the ‘Yom Kippur’ War », donc tous ne sont pas restés huit ans. Phrase remplacée dans le bloc par « Une quinzaine de cargos y ont été pris au piège en 1967, et la plupart y sont restés jusqu'à la réouverture ». Pas de doublon avec `ex-panama-suez`, `suez` (ordre de grandeur et frise : ouverture de 1869) ni la paire `nokia`/`suez`.

### 7. islande-armee (vrai)

```js
  { id: "islande-armee", niveau: 2, texte: "L'Islande, membre fondateur de l'OTAN, n'a pas d'armée.", vrai: true,
    explication: "C'est le seul pays de l'Alliance sans forces militaires propres. Elle a fourni des terrains et des installations, ainsi que ses garde-côtes ; une force américaine y a stationné en permanence jusqu'en 2006, en vertu d'un accord de défense de 1951. Le jour du vote de l'adhésion, en 1949, une émeute a éclaté à Reykjavik.", source: "OTAN, « Iceland and NATO »" },
```

Sources :
- https://nato.int/en/about-us/nato-history/history-by-theme/my-country-and-nato/iceland-and-nato : « Iceland, unique among NATO Allies, does not have a military. » ; « Iceland is the only Ally that does not have its own military forces. » ; « the decision to join the Alliance as a founding member in 1949 was controversial » ; « signs a bilateral defence agreement with the United States » (1951) ; « a permanent US defence force was hosted until 2006 » ; « facilities and land for NATO installations » ; « volunteered the Icelandic Coast Guard to assist the Organization » ; « the only Ally to have a riot in its capital city » ; « As the Althingi voted by a large majority to join NATO, chaos erupted outside. »
- Mode : primaire. La page du gouvernement islandais (government.is) n'a pas pu être lue (402, puis page sans le texte par `curl`).

Contre-vérification : VALIDÉ. Page de l'OTAN relue, toutes les citations présentes (« does not have a military », « founding member in 1949 was controversial », accord de 1951, force américaine jusqu'en 2006, garde-côtes, émeute). Neutre : faits datés, sans jugement sur l'adhésion. Pas de doublon avec `ex-islande-dorsale` ni `islande` (population). Réserve mineure : seule la page de l'OTAN a pu être lue (government.is muet par `curl`) ; elle est primaire.

### 8. onu-ukraine (vrai)

```js
  { id: "onu-ukraine", niveau: 3, texte: "L'Ukraine et la Biélorussie sont membres fondateurs de l'ONU, alors qu'elles faisaient partie de l'URSS en 1945.", vrai: true,
    explication: "La liste des 51 membres d'origine, en 1945, compte la république socialiste soviétique d'Ukraine et celle de Biélorussie, à côté de l'Union soviétique elle-même. Elles ont pris leur nom actuel en 1991.", source: "ONU, « Growth in United Nations membership » et fiches des États membres" },
```

Sources :
- https://www.un.org/en/about-us/growth-in-un-membership (lu par `curl`) : « Original 51 Members (1945) » ; la liste comprend « Byelorussian Soviet Socialist Republic », « Ukrainian Soviet Socialist Republic » et « Union of Soviet Socialist Republics ».
- https://www.un.org/en/about-us/member-states/ukraine : « On 24 August 1991, the Ukrainian Soviet Socialist Republic changed its name to Ukraine. »
- https://www.un.org/en/about-us/member-states/belarus : « On 19 September 1991, the Byelorussian Soviet Socialist Republic informed the United Nations that it had changed its name to Belarus. »
- Mode : primaire. Les pages de l'ONU ne datent que le changement de nom, pas l'indépendance : celle-ci n'est pas écrite. Pourquoi l'URSS a obtenu trois sièges : non lu, non écrit.

Contre-vérification : VALIDÉ. ONU relue : liste « Original 51 Members (1945) » avec les RSS de Biélorussie et d'Ukraine et l'URSS ; changements de nom du 24 août et du 19 septembre 1991. Neutre (« faisaient partie de l'URSS » est un fait ; aucune explication politique du triple siège). Pas de doublon de sens avec `suisse-onu` (adhésion tardive) : ressort différent.

## Histoire ancienne et calendrier

### 9. thermopyles (faux)

```js
  { id: "thermopyles", niveau: 2, texte: "Aux Thermopyles, face à l'armée perse, les Grecs n'étaient que 300 Spartiates.", vrai: false,
    explication: "Selon Hérodote, les 300 Spartiates de Léonidas n'étaient qu'une partie des troupes : il énumère aussi des contingents d'Arcadie, de Corinthe, de Phlionte et de Mycènes, 700 Thespiens, 400 Thébains, des Locriens et un millier de Phocidiens. Une inscription sur place parlait de « quatre mille » Péloponnésiens. Avant le dernier combat, Léonidas renvoya la plupart des alliés ; les Thespiens et les Thébains restèrent avec les Spartiates.", source: "Hérodote, Histoires, VII, 202-203, 220-222 et 228 (trad. Godley, Perseus)" },
```

Sources :
- https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0126:book=7:chapter=202 (lu par `curl`) : « The Hellenes who awaited the Persians in that place were these: three hundred Spartan armed men; one thousand from Tegea and Mantinea, half from each place; one hundred and twenty from Orchomenus in Arcadia and one thousand from the rest of Arcadia; that many Arcadians, four hundred from Corinth, two hundred from Phlius, and eighty Mycenaeans. These were the Peloponnesians present; from Boeotia there were seven hundred Thespians and four hundred Thebans. »
- …chapter=203 : « In addition, the Opuntian Locrians in full force and one thousand Phocians came at the summons. »
- …chapter=220 : « he sent away the allies » ; chapter=222 : « Those allies who were dismissed went off in obedience to Leonidas, only the Thespians and Thebans remaining with the Lacedaemonians. »
- …chapter=228 : « Here four thousand from the Peloponnese once fought three million. »
- Mode : primaire (Hérodote). Les effectifs perses (« trois millions ») ne sont pas repris : chiffre de l'inscription, jugé exagéré par les historiens, non lu ici. Hérodote est lui-même une source antique : l'explication le dit (« Selon Hérodote »).

Contre-vérification : VALIDÉ. Hérodote, VII, 202, 203, 220, 222 et 228 relus sur Perseus (trad. Godley) : chaque passage cité y figure. Le « Selon Hérodote » signale bien la nature de la source. Aucun doublon.

### 10. an-zero (vrai)

```js
  { id: "an-zero", niveau: 3, texte: "Dans notre calendrier, l'an 1 avant J.-C. est immédiatement suivi de l'an 1 après J.-C.", vrai: true,
    explication: "Il n'y a pas d'année zéro dans la numérotation historique des années. C'est pourquoi le troisième millénaire a commencé en 2001, et non en 2000. Les astronomes, eux, comptent une année 0 juste avant l'an 1.", source: "United States Naval Observatory, « The Start of the 21st Century and the 3rd Millennium »" },
```

Sources :
- https://aa.usno.navy.mil/faq/millennium : « In the historical system of dating, AD 1 is preceded by 1 BC. That is, there is no year 0. In the astronomical system, AD 1 is designated +1 and is preceded by year 0. » ; « The 3rd millennium began with AD 2001 and will continue through AD 3000. »
- Mode : primaire.

Contre-vérification : VALIDÉ. USNO relu : « there is no year 0 », « AD 1 is designated +1 and is preceded by year 0 », « began with AD 2001 ». Ne dépend pas d'une définition : même dans le système astronomique, l'an 1 av. J.-C. (année 0) est immédiatement suivi de l'an 1. Seul voisin : un commentaire de code de `chiffres.js`, non affiché.

## Sciences et géographie physique

### 11. saturne-lunes (faux)

```js
  { id: "saturne-lunes", niveau: 2, texte: "Jupiter est la planète du Système solaire qui compte le plus de lunes connues.", vrai: false,
    explication: "C'est Saturne, et de loin : en août 2026, la NASA lui comptait 293 lunes confirmées, bien plus qu'à toute autre planète. Ce nombre augmente au fil des découvertes.", source: "NASA Science, « Saturn Moons »" },
```

Sources :
- https://science.nasa.gov/saturn/moons/ : « Saturn has 293 confirmed moons in its orbit as of August 2026, far more than any other planet in our solar system. »
- Mode : primaire. Chiffre daté, qui change : le relire avant ajout. Le nombre de lunes de Jupiter n'a pas été lu : non cité.

Contre-vérification : VALIDÉ. NASA relue : « Saturn has 293 confirmed moons in its orbit as of August 2026, far more than any other planet ». Sources indépendantes lues : EarthSky (20 mars 2026) et Space.com : annonce du Minor Planet Center du 16 mars 2026, Saturne 285, Jupiter 101 (la page Jupiter de la NASA dit 115 reconnues par l'UAI : écart sans effet sur la réponse). L'explication porte bien sa date (« en août 2026 »). Pas de doublon avec `vf-saturne-flotterait` (densité). À l'intégration, ajouter « (chiffre d'août 2026) » au champ `source` pour la relecture future.

### 12. seismes-lune (vrai)

```js
  { id: "seismes-lune", niveau: 2, texte: "Il y a des séismes sur la Lune.", vrai: true,
    explication: "Les sismomètres déposés par les astronautes d'Apollo l'ont montré. Les plus profonds, à des centaines de kilomètres sous la surface, sont dus aux marées causées par la Terre. D'autres, moins profonds, viennent de ce que la Lune rétrécit en refroidissant : ils peuvent atteindre une magnitude de 5,5 et durer plus de dix minutes.", source: "NASA Science, « Moonquakes »" },
```

Sources :
- https://science.nasa.gov/moon/moonquakes/ : « Seismometers that Apollo astronauts placed on the surface of the Moon have revealed that the Moon experiences moonquakes. » ; « Deep moonquakes, occurring hundreds of miles beneath the lunar surface, are tidal events. » ; « Another type of moonquake is caused by the Moon shrinking as it cools. » (à profondeur « moderately shallow ») ; « can register up to a startling 5.5 on the Richter scale » ; « can last for over 10 minutes ».
- Mode : primaire. « des centaines de miles » rendu par « des centaines de kilomètres » (un ordre de grandeur inférieur, donc exact).

Contre-vérification : VALIDÉ. NASA relue : séismes profonds « tidal events » dus à l'attraction de la Terre ; séismes liés au rétrécissement, à 20-30 km, « up to a startling 5.5 on the Richter scale », « over 10 minutes ». « Moins profonds » est exact (20-30 km contre des centaines de miles). Aucun doublon.

### 13. glaciers-afrique (vrai)

```js
  { id: "glaciers-afrique", niveau: 2, texte: "Il existe des glaciers en Afrique.", vrai: true,
    explication: "En 2021, l'Organisation météorologique mondiale en recensait sur trois montagnes : le massif du mont Kenya, les monts Rwenzori, en Ouganda, et le Kilimandjaro, en Tanzanie. Ils reculent plus vite que la moyenne mondiale : à ce rythme, ils auront disparu dans les années 2040, ceux du mont Kenya dix ans plus tôt.", source: "Organisation météorologique mondiale, communiqué du 19 octobre 2021 (State of the Climate in Africa 2020)" },
```

Sources :
- https://wmo.int/media/news/climate-change-triggers-mounting-food-insecurity-poverty-and-displacement-africa (Genève, 19 octobre 2021) : « Presently, only three mountains in Africa are covered by glaciers, the Mount Kenya massif (Kenya), the Rwenzori Mountains (Uganda) and Mount Kilimanjaro (United Republic of Tanzania). » ; « Their current retreat rates are higher than the global average. » ; « If this continues, it will lead to total deglaciation by the 2040s. » ; « Mount Kenya is expected to be deglaciated a decade sooner ».
- Mode : primaire. Affirmation à durée limitée : à revoir vers 2030 (mont Kenya) et 2040.

Contre-vérification : VALIDÉ. Communiqué de l'OMM du 19 octobre 2021 relu, citations exactes. L'explication porte sa date (« En 2021 »). Affirmation à durée limitée : à revoir avant 2030. Pas de doublon avec `ex-kilimandjaro` ni `kilimandjaro` (altitude).

## Médecine et nutrition

### 14. ulcere-bacterie (vrai)

```js
  { id: "ulcere-bacterie", niveau: 2, texte: "Une bactérie est l'une des principales causes des ulcères de l'estomac.", vrai: true,
    explication: "Quand Robin Warren et Barry Marshall ont découvert Helicobacter pylori, en 1982, on attribuait surtout les ulcères au stress et au mode de vie. Ils ont montré le rôle de cette bactérie, ce qui leur a valu le prix Nobel de médecine 2005. Aujourd'hui, l'infection par H. pylori et les anti-inflammatoires comme l'aspirine ou l'ibuprofène en sont les deux causes les plus fréquentes.", source: "Assemblée Nobel de l'Institut Karolinska, communiqué du 3 octobre 2005 ; NIH (NIDDK), « Symptoms & Causes of Peptic Ulcers »" },
```

Sources :
- https://www.nobelprize.org/prizes/medicine/2005/press-release/ (lu par `curl`) : « for their discovery of “the bacterium Helicobacter pylori and its role in gastritis and peptic ulcer disease” » ; « In 1982, when this bacterium was discovered by Marshall and Warren, stress and lifestyle were considered the major causes of peptic ulcer disease. » ; « It is now firmly established that Helicobacter pylori causes more than 90% of duodenal ulcers and up to 80% of gastric ulcers. »
- https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers/symptoms-causes : « The most common causes of peptic ulcers are Helicobacter pylori (H. pylori) infection and long-term use of nonsteroidal anti-inflammatory drugs (NSAIDs) » ; AINS cités : aspirine, ibuprofène, naproxène.
- Mode : primaire. Les pourcentages du communiqué de 2005 (90 % et 80 %) ne sont pas repris : la part de H. pylori a pu baisser depuis, d'où « l'une des principales causes ».

Contre-vérification : VALIDÉ. Communiqué Nobel 2005 relu ; source indépendante lue : NIH (NIDDK), « The most common causes of peptic ulcers are Helicobacter pylori (H. pylori) infection and long-term use of nonsteroidal anti-inflammatory drugs ». Formulation prudente (« l'une des principales causes ») justifiée. Aucun doublon.

### 16. baignade (faux)

```js
  { id: "baignade", niveau: 1, texte: "Se baigner juste après avoir mangé augmente le risque de noyade.", vrai: false,
    explication: "Selon le conseil scientifique de la Croix-Rouge américaine, manger avant de nager n'a eu aucun effet sur les performances et presque aucun effet indésirable, quel que soit le délai après le repas. Se baigner moins d'une heure après avoir mangé n'augmente pas le risque de noyade, et aucune grande organisation médicale ou de sécurité ne recommande d'attendre.", source: "Croix-Rouge américaine, Scientific Advisory Council, « Does eating right before swimming have health risks or increase the risk of drowning? », 2024" },
```

Sources :
- https://www.redcross.org/take-a-class/resources/articles/eating-before-swimming-myth (8 juillet 2024, lu par `curl`) : « There is a persistent belief in the United States that swimming immediately after eating will cause stomach cramps, which could lead to drowning. However, eating before swimming had no effect on swimming performance and minimal side effects at several different time intervals after a meal. No major medical or safety organizations make any current recommendations to wait before swimming after eating. Swimming within one hour of eating food in adult and child recreational or competitive swimmers does not increase the risk of drowning. » ; « Information provided by members of the American Red Cross Scientific Advisory Council. »
- Mode : primaire (synthèse du conseil scientifique, références citées : Singer et Neeves 1968, Asprey et al., etc.). « presque aucun » traduit « minimal ».

Contre-vérification : VALIDÉ. Page de la Croix-Rouge américaine relue (8 juillet 2024) : « Swimming within one hour of eating food […] does not increase the risk of drowning », « No major medical or safety organizations make any current recommendations to wait », « Scientific Advisory Council ». Synthèse d'un conseil scientifique qui cite ses références : primaire suffisante. Aucun doublon (les noyades n'apparaissent ailleurs que comme exemple de corrélation).

## Technologie

### 17. micro-ondes (faux)

```js
  { id: "micro-ondes", niveau: 1, texte: "Les aliments chauffés au four à micro-ondes deviennent légèrement radioactifs.", vrai: false,
    explication: "Les micro-ondes font vibrer les molécules d'eau des aliments, ce qui produit la chaleur qui les cuit. Absorbée par l'aliment, cette énergie se change en chaleur et ne le rend ni « radioactif » ni « contaminé ».", source: "Food and Drug Administration (États-Unis), « Microwave Ovens »" },
```

Sources :
- https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens : « Microwaves cause water molecules in food to vibrate, producing heat that cooks the food. » ; « The microwave energy is changed to heat as it is absorbed by food, and does not make food "radioactive" or "contaminated." »
- Mode : primaire.

Contre-vérification : VALIDÉ. L'URL de la FDA renvoie 404 à `curl` (filtre anti-robots) mais s'ouvre avec l'outil de lecture : les deux phrases citées y sont mot pour mot. Source indépendante lue : EPA RadTown, « Microwaves do not make food radioactive ». Pas de doublon avec `banane` (radioactivité naturelle) : ressort différent.

### 18. bug-1947 (faux)

```js
  { id: "bug-1947", niveau: 2, texte: "Le mot « bug » est né en 1947, quand des ingénieurs ont trouvé un papillon de nuit coincé dans un ordinateur.", vrai: false,
    explication: "Le papillon a bien existé : en 1947, l'équipe de l'ordinateur Mark II, à Harvard, l'a collé dans son cahier avec la mention « premier cas réel de bug trouvé ». Mais le mot était déjà en usage : les ingénieurs américains appelaient « bugs » les petits défauts des machines, et Thomas Edison en parlait dès les années 1870.", source: "Smithsonian, National Museum of American History, « Log Book With Computer Bug »" },
```

Sources :
- https://americanhistory.si.edu/collections/object/nmah_334663 (lu par `curl`) : « American engineers have been calling small flaws in machines "bugs" for over a century. Thomas Edison talked about bugs in electrical circuits in the 1870s. » ; « In 1947, engineers working on the Mark II computer at Harvard University found a moth stuck in one of the components. They taped the insect in their logbook and labeled it "first actual case of bug being found." » ; « This log book was probably not Hopper's, but she and the rest of the Mark II team helped popularize the use of the term computer bug ».
- Mode : primaire (le musée qui conserve le cahier). Grace Hopper, souvent créditée, est volontairement absente de l'explication (la page dit que le cahier n'était probablement pas le sien).

Contre-vérification : VALIDÉ. Notice du National Museum of American History relue : « calling small flaws in machines "bugs" for over a century », Edison « in the 1870s », « first actual case of bug being found », « probably not Hopper's ». Primaire (le musée qui conserve le cahier). Aucun doublon d'étymologie dans la banque `vf-`/`ex-` (pas de « bug »).

## Arts

### 19. penseur-dante (vrai)

```js
  { id: "penseur-dante", niveau: 2, texte: "Le Penseur de Rodin représentait, à l'origine, le poète Dante.", vrai: true,
    explication: "Créé vers 1880 pour couronner La Porte de l'Enfer, inspirée de la Divine Comédie, il s'appelait alors Le Poète : c'était Dante, penché pour observer les cercles de l'Enfer en méditant sur son œuvre. Il n'a reçu son titre actuel qu'ensuite.", source: "Musée Rodin, notice « Le Penseur » ; Musées du Vatican, « Auguste Rodin, Le Penseur »" },
```

Sources :
- https://www.musee-rodin.fr/musee/collections/oeuvres/penseur (lu par `curl`) : « Créé dès 1880 dans sa taille d'origine, environ 70 cm, pour orner le tympan de La Porte de l'Enfer, Le Penseur était alors intitulé Le Poète : il représentait Dante, l'auteur de La Divine Comédie qui avait inspiré La Porte, penché en avant pour observer les cercles de l'Enfer en méditant sur son œuvre. »
- https://www.museivaticani.va/content/museivaticani/fr/collezioni/musei/collezione-d_arte-contemporanea/sala-2--van-gogh--gauguin--medardo-rosso/auguste-rodin--le-penseur.html : « Intitulée initialement Dante ou Poète », modelée « entre 1880 et 1882 » pour le « tympan de la célèbre Porte de l'Enfer ».
- Mode : primaire. Le moment où la statue a été détachée de la porte n'a été lu que dans un extrait d'Universalis : non écrit.

Contre-vérification : VALIDÉ. Musée Rodin relu (« intitulé Le Poète : il représentait Dante ») ; source indépendante lue : Musées du Vatican, « Intitulée initialement Dante ou Poète », « modelée par l'artiste entre 1880 et 1882 ». Aucun doublon.

### 20. statues-couleurs (faux)

```js
  { id: "statues-couleurs", niveau: 2, texte: "Les sculptures de la Grèce antique étaient laissées en marbre blanc, sans peinture.", vrai: false,
    explication: "Depuis 1900 environ, de nombreux spécialistes savent que la sculpture antique était polychrome, c'est-à-dire peinte de plusieurs couleurs. Le temps et les intempéries ont effacé la plupart de ces couleurs ; pour le grand public, ces statues sont pourtant restées blanches.", source: "Ny Carlsberg Glyptotek, projet de recherche Tracking Colour ; Smithsonian Magazine, « True Colors », 2008" },
```

Sources :
- https://trackingcolour.com/about (projet de recherche de la Ny Carlsberg Glyptotek, Copenhague) : « Since about 1900, many scholars have known that ancient sculpture was polychrome, 'multicoloured'. However, in the minds of a very large majority, it has remained marble white to this day. »
- https://www.smithsonianmag.com/arts-culture/true-colors-17888/ (Matthew Gurewitsch, juillet 2008, lu par `curl`) : « To us, classical antiquity means white marble. Not so to the Greeks, who thought of their gods in living color and portrayed them that way too. » ; « Time and weather have stripped most of the hues away. » ; « White marble has been the norm ever since the Renaissance, when classical antiquities first began to emerge from the earth. » ; « Knowing no better, artists in the 16th century took the bare stone at face value. »
- Mode : indirect, vérifié via la Glyptotek (musée, projet de recherche sur ses propres sculptures) et Smithsonian Magazine, concordants. Les pages du Metropolitan Museum (exposition « Chroma ») refusent la lecture (429). Réserve à signaler : toutes les statues n'étaient pas entièrement peintes (certaines seulement par endroits, selon le Met, lu seulement en extrait de moteur de recherche) ; l'affirmation porte sur « laissées en marbre blanc, sans peinture », qui reste faux.

Contre-vérification : À CORRIGER. Fait central confirmé par deux sources sérieuses et concordantes relues : Ny Carlsberg Glyptotek, Tracking Colour (« Since about 1900, many scholars have known that ancient sculpture was polychrome […] in the minds of a very large majority, it has remained marble white to this day ») et Smithsonian Magazine, 2008 (« Time and weather have stripped most of the hues away »). Correction : la phrase sur la Renaissance ne repose que sur Smithsonian, et l'histoire du goût pour le marbre blanc est plus nuancée (d'autres sources mettent en avant Winckelmann et le néoclassicisme du XVIIIe siècle) : retirée. « Depuis le début du XXe siècle » ramené à la formule de la Glyptotek (« Depuis 1900 environ, de nombreux spécialistes »). Bloc corrigé. Pages du Met toujours refusées (429).

---

## Écartés

### 1. coree-armistice (faux)

```js
  { id: "coree-armistice", niveau: 2, texte: "La guerre de Corée (1950-1953) s'est terminée par un traité de paix.", vrai: false,
    explication: "Les combats ont cessé le 27 juillet 1953 avec un armistice, document purement militaire qu'aucun État n'a signé en tant que tel : ce n'est pas un traité de paix. La Corée du Sud ne l'a pas accepté, et aucun traité de paix n'a été signé depuis.", source: "National Archives (États-Unis), « Armistice Agreement for the Restoration of the South Korean State (1953) » et revue Prologue ; National Geographic, 2020" },
```

Sources :
- https://www.archives.gov/milestone-documents/armistice-agreement-restoration-south-korean-state : « This armistice signed on July 27, 1953, formally ended the war in Korea. » ; « The armistice, while it stopped hostilities, was not a permanent peace treaty between nations. »
- https://www.archives.gov/publications/prologue/2003/summer/korean-war-armistice : « It is somewhat exceptional in that it is purely a military document—no nation is a signatory to the agreement. » ; « That evening at 10 p.m. the truce went into effect. »
- https://www.nationalgeographic.com/history/article/why-korean-war-never-technically-ended (Erin Blakemore, 24 juin 2020) : « Fought between 1950 and 1953 » ; « Fighting would last for three years—and a peace treaty was never signed. » ; « South Korea, however, objected to the continued division of Korea and did not agree to the armistice or sign a formal peace treaty. »
- Mode : primaire (National Archives) pour l'armistice et sa nature ; indirect pour « aucun traité depuis » (National Geographic, 2020 ; aucune page officielle récente lue qui le dise). À relire si un traité intervenait.

Contre-vérification : REJETÉ. Doublon de sens avec `japon-russie` (VRAI_FAUX, déjà intégré) : même ressort, une guerre terminée sans traité de paix ; le lot 1 a écarté pour la même raison le Saint-Siège (`suisse-onu`) et Saint-Martin (`vf-france-bresil`). Sources sinon correctes : National Archives relues ; « aucun traité depuis » désormais confirmé par deux sources récentes lues, The Korea Times, 27 juillet 2026 (le commandant du Commandement des Nations unies : « The Armistice Agreement is not a peace treaty » ; « leaving the two Koreas technically at war to this day ») et UPI, 28 juillet 2026 (« rather than a peace treaty, meaning the two Koreas remain technically at war »). Récupérable si le propriétaire juge le ressort assez différent, avec ces deux sources à la place de National Geographic 2020.

### 15. huit-verres (faux)

```js
  { id: "huit-verres", niveau: 2, texte: "Pour être bien hydraté, un adulte en bonne santé doit boire au moins huit verres d'eau par jour.", vrai: false,
    explication: "Une revue de 2002 n'a trouvé aucune étude à l'appui de ce conseil. Les enquêtes sur l'alimentation de milliers d'adultes suggèrent qu'il n'en faut pas tant, et les boissons contenant de la caféine comptent aussi. Le conseil viendrait peut-être d'une recommandation dont on aurait oublié la phrase suivante : « la plus grande partie de cette quantité est contenue dans les aliments ». Boire davantage reste utile en cas d'effort, de chaleur ou de certaines maladies.", source: "Valtin, « “Drink at least eight glasses of water a day.” Really? », American Journal of Physiology, 2002 ; Dartmouth Medical School, communiqué du 8 août 2002" },
```

Sources :
- Résumé de Valtin, Am. J. Physiol. Regul. Integr. Comp. Physiol., 2002, PMID 12376390, lu via l'API d'Europe PMC (https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:12376390%20AND%20SRC:MED&resultType=core&format=json ; PubMed exige des cookies) : « No scientific studies were found in support of 8 x 8. » ; « surveys of food and fluid intake on thousands of adults […] strongly suggest that such large amounts are not needed » ; « caffeinated drinks (and, to a lesser extent, mild alcoholic beverages like beer in moderation) may indeed be counted toward the daily total » ; « the conclusion is limited to healthy adults in a temperate climate leading a largely sedentary existence » ; « large intakes of fluid […] are advisable for the treatment or prevention of some diseases and certainly are called for under special circumstances, such as vigorous work and exercise, especially in hot climates ».
- https://geiselmed.dartmouth.edu/news/2002_h2/08aug2002_water.shtml : recommandation du Food and Nutrition Board, « 1 milliliter of water for each calorie of food », dont la phrase suivante, peut-être négligée : « most of this quantity is contained in prepared foods ».
- Mode : primaire (résumé de l'article ; communiqué de l'université de l'auteur). Réserve : la revue vaut pour des adultes sédentaires en climat tempéré, ce que l'affirmation (« adulte en bonne santé ») ne précise pas ; l'explication mentionne les exceptions.

Contre-vérification : REJETÉ. La réponse dépend d'une définition (taille du verre, « eau » seule ou toutes boissons). L'EFSA retient pour l'adulte un apport adéquat de 2,0 L (femmes) et 2,5 L (hommes) d'eau totale, dont environ 80 % par les boissons, soit environ 1,6 et 2,0 L : à peu près huit verres de 200 à 250 mL (communiqué de l'EFSA « EFSA sets European dietary reference values for nutrient intakes » et avis EFSA Journal 2010;8(3):1459, vus en résultats de recherche, avis non ouvert : 403). « Faux » n'est donc pas sans ambiguïté ; Valtin (2002) reste une revue unique, ancienne, limitée aux sédentaires en climat tempéré. Citations de Valtin et de Dartmouth relues et exactes.


- **Le gouvernement et le Parlement des Pays-Bas ne siègent pas dans la capitale, Amsterdam** : la Constitution (article 32, lu sur wetten.overheid.nl : « in de hoofdstad Amsterdam ») est vérifiée, mais aucune source lisible n'a confirmé le siège à La Haye (britannica.com refusé, pages du gouvernement et de la Chambre introuvables ou muettes, PDF des archives de La Haye non lisible). Non proposé.
- **Le Pacifique est plus vaste que toutes les terres émergées** : déjà dans le quiz (`pacifique-terres`). Doublon.
- **Le premier message d'ARPANET se résumait à « LO »** : ARPANET est déjà dans `EVENEMENTS` et `PAIRES_CELEBRES`. Doublon thématique.
- **La France et les Pays-Bas ont une frontière terrestre (Saint-Martin)** : même ressort que `vf-france-bresil` (Grand test). Écarté.
- **Le Soudan compte plus de pyramides que l'Égypte** : les décomptes varient selon ce qu'on appelle une pyramide. Écarté (définition).
- **L'Ouzbékistan est doublement enclavé** : dépend du statut de la Caspienne (mer ou lac). Écarté (définition).
- **La Bolivie a perdu son accès à la mer pendant la guerre du Pacifique** : résumé de l'arrêt de la CIJ refusé (403), aucune autre source primaire lue. Retiré de `bolivie-marine`.
- **Togo dans `commonwealth`** : une partie du Togo allemand a été sous mandat britannique ; nuance non vérifiée, Togo retiré de l'affirmation (gardé dans l'explication, où le Commonwealth le cite lui-même).
- **Le Saint-Siège n'est pas membre de l'ONU** : déjà écarté au lot 1 (même ressort que `suisse-onu`).
- Idées abandonnées sans recherche approfondie : le mont Blanc (frontière discutée, sujet politique), les épinards et la virgule mal placée (le démenti du mythe est lui-même discuté), Van Gogh n'aurait vendu qu'un tableau (non vérifié), le QWERTY conçu pour ralentir les dactylos (débat d'historiens), la Joconde hors du Louvre (pages du Louvre non lues).
