# Vrai ou faux : 20 propositions (22 novembre 2026)

> **Bilan de la contre-vérification (22 novembre 2026)** : 20 éléments examinés ; **14 validés**, **6 à corriger**
> (japon-russie, salem, neron-violon, lemmings, sincere-cire, monopoly ; blocs de code déjà corrigés), **0 rejeté**.
> Aucun identifiant en double dans `jeux-donnees.js`, aucun sujet déjà présent dans `VRAI_FAUX` (l'élément existant
> `groenland` porte sur la superficie, pas sur l'Union européenne). Doublon thématique signalé, sans rejet :
> `suisse-onu` et `suissesses-vote` (deux « retards » suisses, même pays, même ressort de surprise) ; éviter de les
> publier le même jour ou à quelques jours d'intervalle.

Propositions pour `VRAI_FAUX` (`static/jeux-donnees.js`), à relire avant ajout. Aucune n'a de champ `depuis:` :
le lui donner au moment de l'ajout (numéro du jour suivant la publication), puis mettre à jour
`tests/rotation-manifeste.json`.

Répartition : 8 géopolitique et histoire contemporaine, 2 histoire, 3 sciences, 2 corps humain, 2 animaux,
2 langue, 1 économie (plus l'Équateur, compté en géopolitique). 9 vraies, 11 fausses. Aucun sujet déjà présent
dans le stock (106 affirmations relues).

Pages lues avec l'outil de lecture web le 22 novembre 2026. Plusieurs sites officiels refusent la lecture
automatique (nobelprize.org, mofa.go.jp, un.org, eur-lex en partie, britannica.com, metmuseum.org) : le mode
« indirect » le signale.

---

## Géopolitique et histoire contemporaine

### 1. suisse-onu (faux)

```js
  { id: "suisse-onu", niveau: 2, texte: "La Suisse est membre de l'ONU depuis la création de l'organisation.", vrai: false,
    explication: "Elle n'y est entrée que le 10 septembre 2002, comme 190e État membre, après un vote populaire du 3 mars 2002 (environ 55 % de oui). En 1986, les trois quarts des votants avaient refusé l'adhésion.", source: "swissinfo.ch (SSR), « Moving towards the UN in slow motion » et « How the UN “Swiss paradox” was resolved » ; ONU Info, mars 2002" },
```

Sources :
- https://www.swissinfo.ch/eng/swiss-politics/moving-towards-the-un-in-slow-motion/291972 : « On September 10, 2002, the UN General Assembly in New York accepted Switzerland as the 190th member state. » ; « three-quarters of voters rejecting membership in 1986 » ; « some 55 per cent voted in favour ».
- https://www.swissinfo.ch/eng/how-the-un--swiss-paradox--was-resolved/32213762 : « 54.6% vote in favour of joining the UN in a national ballot on March 3; Switzerland becomes 190th UN member on September 10. » ; « 75.7% Swiss rejecting joining the UN. »
- http://www.upi.com/Defense-News/2002/09/10/57th-UN-assembly-opens-Switz-made-member/91601031687980/ (dépêche UPI du 10 septembre 2002) : « Switzerland became the 190th U.N. member. »
- https://news.un.org/en/story/2002/03/28822 : Annan « hailed the results of a referendum in Switzerland, which voted in favour of membership in the world body ».
- Mode : indirect via swissinfo.ch (service international de la SSR) et UPI, qui rapportent la résolution de l'Assemblée générale du 10 septembre 2002 ; la page de l'ONU (liste des États membres) et celle du DFAE n'ont pas pu être lues (403, contenu absent).

Contre-vérification : VALIDÉ. Source primaire toujours inaccessible (résolution A/RES/57/1 et déclaration du président
de l'Assemblée générale sur digitallibrary.un.org et un.org : 403 ; press.un.org ne se charge pas). Deux sources
secondaires indépendantes concordantes pour le 10 septembre 2002 et le rang de 190e membre : swissinfo.ch (relu, deux
pages) et la dépêche UPI (relue : « Switzerland became the 190th U.N. member »). Les deux votes sont confirmés par une
source indépendante, Swissvotes (base de l'Université de Berne, données de la Chancellerie fédérale) :
https://swissvotes.ch/vote/485.00 (3 mars 2002, accepté, 54,61 % de oui) et https://swissvotes.ch/vote/338.00
(16 mars 1986, rejeté, 24,33 % de oui, soit 75,67 % de non). « Environ 55 % » et « les trois quarts » sont exacts.
Doublon thématique avec `suissesses-vote` : signalé dans le bilan, non rejeté.

### 2. diomede (vrai)

```js
  { id: "diomede", niveau: 3, texte: "Au plus près, la Russie et les États-Unis sont séparés par moins de 5 km.", vrai: true,
    explication: "Dans le détroit de Béring, la Grande Diomède, russe, et la Petite Diomède, américaine, ne sont distantes que d'environ 4 km. La frontière maritime passe entre les deux îles, tout comme la ligne de changement de date. Entre les deux continents, il y a environ 90 km.", source: "NASA Earth Observatory, « Yesterday and Tomorrow Islands » ; National Park Service, « How close is Alaska to Russia? »" },
```

Sources :
- https://science.nasa.gov/earth/earth-observatory/yesterday-and-tomorrow-islands-91638/ : « Just 3.8 kilometers (2.4 miles) separate Big Diomede Island (Russia) and Little Diomede Island (U.S.). » ; « The water between the two islands is bisected by the maritime border of the two countries. » ; « Big Diomede and Little Diomede sit on opposite sides of the International Date Line. »
- https://www.nps.gov/anch/learn/historyculture/how-close-is-alaska-to-russia.htm : « The stretch of water between these two islands is only about 2.5 miles wide » ; « The narrowest distance between mainland Russia and mainland Alaska is approximately 55 miles. » (55 milles ≈ 88,5 km, d'où « environ 90 km »).
- Mode : primaire (NASA, NPS). Les deux chiffres diffèrent un peu (3,8 km et 4 km) : « environ 4 km ».

Contre-vérification : VALIDÉ. Les deux pages relues : NASA (« Just 3.8 kilometers (2.4 miles) separate… », frontière
maritime et ligne de changement de date) et NPS (« only about 2.5 miles wide », « approximately 55 miles » entre les
continents), deux organismes indépendants l'un de l'autre et concordants. « Moins de 5 km » est vrai quelle que soit
la mesure retenue.

### 3. ue-nobel (vrai)

```js
  { id: "ue-nobel", niveau: 2, texte: "L'Union européenne a reçu le prix Nobel de la paix.", vrai: true,
    explication: "Elle l'a reçu en 2012, au cours d'une cérémonie à Oslo, pour sa contribution pendant plus de six décennies à la paix et à la réconciliation, à la démocratie et aux droits de l'homme en Europe.", source: "Union européenne, « Histoire de l'UE, 2010-2019 » ; Comité Nobel norvégien, 2012" },
```

Sources :
- https://european-union.europa.eu/principles-countries-history/history-eu/2010-19_en : « In 2012, the European Union is awarded the Nobel Peace Prize. » ; « The European Union receives the Nobel Peace Prize at a ceremony in Oslo. » ; « The prize recognises the EU's contribution over 6 decades to promoting peace, reconciliation, democracy and human rights. »
- https://www.upi.com/Top_News/World-News/2012/10/12/European-Union-wins-Nobel-Peace-Prize/UPI-48041350039373/ : « The European Union was awarded the 2012 Nobel Peace Prize for its work in promoting peace and democracy » ; motivation du comité : « to the advancement of peace and reconciliation, democracy and human rights in Europe ».
- Mode : primaire (site officiel de l'UE) ; nobelprize.org refuse la lecture (403), d'où la dépêche UPI en second.

Contre-vérification : VALIDÉ. Page de l'UE relue (2012, cérémonie à Oslo, « over 6 decades… peace, reconciliation,
democracy and human rights ») ; source indépendante relue : dépêche UPI du 12 octobre 2012, qui cite la motivation du
comité Nobel norvégien (« to the advancement of peace and reconciliation, democracy and human rights in Europe »).

### 4. groenland-ue (faux)

```js
  { id: "groenland-ue", niveau: 2, texte: "Le Groenland, territoire du Danemark, fait partie de l'Union européenne.", vrai: false,
    explication: "Entré dans la Communauté avec le Danemark, il a voté pour en sortir lors d'un référendum en 1982. Depuis le 1er février 1985, les traités ne s'y appliquent plus : il n'est qu'associé à l'Union, comme pays et territoire d'outre-mer.", source: "Décision 2006/526/CE du Conseil (considérant 1) ; Chambre des communes, réponse écrite du 1er mars 1982" },
```

Sources :
- https://eur-lex.europa.eu/eli/dec/2006/526/oj/eng (considérant 1) : « The Treaty amending, with regard to Greenland, the Treaties establishing the European Communities […] which entered into force on 1 February 1985 […] provides that the Treaty establishing the European Community (EC Treaty) shall no longer apply to Greenland » ; Greenland, « being a part of a Member State shall be associated to the European Community […] as one of the overseas countries and territories (OCTs) ».
- https://api.parliament.uk/historic-hansard/written-answers/1982/mar/01/greenland : « a majority of those voting in the Greenland referendum have expressed a wish to leave the Community. »
- Mode : primaire (EUR-Lex, Hansard). La date exacte du référendum (23 février 1982) n'a été lue que dans des résumés de recherche : non affichée, seulement l'année.

Contre-vérification : VALIDÉ. Considérant 1 de la décision 2006/526/CE relu sur EUR-Lex (traité entré en vigueur le
1er février 1985, traité CE « shall no longer apply to Greenland », association comme PTOM) ; réponse écrite de la
Chambre des communes du 1er mars 1982 relue (« a majority of those voting in the Greenland referendum have expressed a
wish to leave the Community »). Deux sources primaires indépendantes l'une de l'autre. Remarque de neutralité, sans
correction exigée : « territoire du Danemark » est exact (EUR-Lex : « being a part of a Member State ») ; sur un sujet
devenu sensible, « qui fait partie du royaume de Danemark » serait plus proche de la source.

### 5. ile-hans (vrai)

```js
  { id: "ile-hans", niveau: 2, texte: "Le Canada et le Danemark se sont disputé une île de l'Arctique jusqu'en 2022.", vrai: true,
    explication: "Le traité de 1973 sur leur frontière maritime avait laissé de côté l'île de Hans, un rocher inhabité. Des militaires des deux pays y ont longtemps planté leur drapeau en laissant une bouteille de whisky canadien ou d'aquavit : la « guerre du whisky ». L'accord du 14 juin 2022 partage l'île le long d'un ravin naturel.", source: "Affaires mondiales Canada, communiqués du 14 juin 2022 ; Bibliothèque du Congrès, « The Hans Island Peace Agreement… » (2022)" },
```

Sources :
- https://www.canada.ca/en/global-affairs/news/2022/06/canada-and-the-kingdom-of-denmark-together-with-greenland-reach-historic-agreement-on-long-standing-boundary-disputes.html : « resolving outstanding boundary issues over Tartupaluk (Hans Island) » ; accord signé le 14 juin 2022.
- https://www.canada.ca/en/global-affairs/news/2022/06/boundary-dispute.html : la frontière terrestre « follows the natural ravine that runs the length of the island, generally in a direction from north to south » ; « the long-standing dispute over sovereignty of Tartupaluk/Hans Island ».
- https://blogs.loc.gov/law/2022/06/the-hans-island-peace-agreement-between-canada-denmark-and-greenland/ : « The 1973 treaty deliberately left the border undefined through tiny, uninhabited Hans Island. » ; « raised the Maple Leaf or the Dannebrog flag, and left a bottle of Canadian Club whiskey or aquavit ».
- Mode : primaire (gouvernement du Canada) pour l'accord ; Bibliothèque du Congrès (Law Library) pour l'historique. Le partage « environ 60 % au Danemark » (LOC) n'est pas affiché, le gouvernement canadien ne le disant pas.

Contre-vérification : VALIDÉ. Relus : les deux communiqués d'Affaires mondiales Canada (accord du 14 juin 2022 sur
Tartupaluk/île de Hans ; frontière qui « follows the natural ravine that runs the length of the island » ; traité de
1973) et le billet de la Law Library du Congrès (traité de 1973 qui « deliberately left the border undefined through
tiny, uninhabited Hans Island » ; drapeaux et bouteilles de Canadian Club ou d'aquavit ; « Whisky War »). Sources
indépendantes l'une de l'autre et concordantes.

### 6. japon-russie (vrai)

```js
  { id: "japon-russie", niveau: 3, texte: "Le Japon et la Russie n'ont jamais signé de traité de paix mettant fin à la Seconde Guerre mondiale.", vrai: true,
    explication: "En 1956, une déclaration commune a mis fin à l'état de guerre et rétabli les relations diplomatiques, mais le traité de paix prévu n'a jamais été conclu. La déclaration promettait au Japon l'île de Shikotan et les îles Habomai, une fois ce traité signé.", source: "Déclaration commune soviéto-japonaise du 19 octobre 1956, articles 1, 2 et 9 (base « The World and Japan », GRIPS et Université de Tokyo) ; nippon.com, « Japan Data » ; Lowy Institute, The Interpreter" },
```

Sources :
- https://www.nippon.com/en/features/h00338/ : la déclaration de 1956 « ended the state of war between Japan and the Soviet Union (now Russia) after World War II » et a rétabli les relations ; les deux pays sont « still yet to sign a formal peace treaty to officially end World War II hostilities » ; Habomai et Shikotan devaient revenir au Japon après la signature d'un traité de paix.
- https://www.lowyinstitute.org/the-interpreter/ending-60-year-stalemate-japans-push-get-peace-treaty-russia : « It's been more than 70 years since World War II ended but there is still no peace treaty between Japan and Russia. »
- https://www.nationthailand.com/news/world/40072494 (octobre 2026) : le transfert reste lié à « a peace treaty that has never been signed ».
- Mode : indirect via nippon.com (Nippon Communications Foundation) et le Lowy Institute, qui citent la déclaration commune de 1956 ; les pages du ministère japonais des Affaires étrangères refusent la lecture (403) et celles du Cabinet sont introuvables (404).

Contre-vérification : À CORRIGER (corrigé dans le bloc). Source primaire lue :
https://worldjpn.net/documents/texts/docs/19561019.D1E.html (texte de la déclaration commune du 19 octobre 1956, base
« The World and Japan » du GRIPS et de l'Institut d'études avancées sur l'Asie de l'Université de Tokyo) : art. 1,
« The state of war between the Union of Soviet Socialist Republics and Japan shall cease » ; art. 2, « Diplomatic and
consular relations shall be restored » ; art. 9, poursuite des négociations sur un traité de paix et remise des
« Habomai Islands and the island of Shikotan » après sa conclusion. L'absence de traité est confirmée par nippon.com
et le Lowy Institute (relus). Deux corrections : « deux groupes d'îles » est inexact, Shikotan étant une seule île
(texte du traité : « the Habomai Islands and the island of Shikotan ») → « l'île de Shikotan et les îles Habomai » ;
la source primaire est ajoutée au champ `source`.

### 7. suissesses-vote (faux)

```js
  { id: "suissesses-vote", niveau: 2, texte: "En Suisse, les femmes votent aux élections fédérales depuis la fin de la Seconde Guerre mondiale.", vrai: false,
    explication: "Elles n'ont obtenu le droit de vote et d'éligibilité au niveau fédéral que le 7 février 1971, par un vote des seuls hommes. En 1959, ceux-ci l'avaient refusé à 66,9 %.", source: "Parlement suisse, « Women suffrage »" },
```

Sources :
- https://www.parlament.ch/en/über-das-parlament/political-women/conquest-of-equal-rights/women-suffrage : « on 7 February 1971 Swiss women won the right to vote and stand for election » ; « On 1 February 1959, voters (all male of course) refused women the right to vote by 654,939 votes (66.9%) to 323,727 (33%). »
- Mode : primaire. Appenzell Rhodes-Intérieures (1990, cantonal) n'est pas sur la page : non affiché.

Contre-vérification : VALIDÉ. Page du Parlement relue (7 février 1971 ; 1er février 1959, 654 939 non, soit 66,9 %).
Source indépendante relue : Archives fédérales suisses, https://www.bar.admin.ch/en/womens-suffrage-in-switzerland
(« On 7 February 1971, Switzerland's all-male electorate granted the vote… » ; 1959 : « 67% of those who cast their
ballots against »), qui confirme aussi « par un vote des seuls hommes ». Doublon thématique avec `suisse-onu` : voir le
bilan.

### 8. equateur-dollar (vrai)

```js
  { id: "equateur-dollar", niveau: 2, texte: "La monnaie officielle de l'Équateur est le dollar américain.", vrai: true,
    explication: "Le sucre, la monnaie nationale, avait perdu près de 80 % de sa valeur face au dollar en seize mois. Le 9 janvier 2000, le président Jamil Mahuad a annoncé la dollarisation, toujours en vigueur ; un décret l'a confirmée en 2025.", source: "FMI, discours de Stanley Fischer, 19 mai 2000 ; Portafolio, 18 mars 2025" },
```

Sources :
- https://www.imf.org/external/np/speeches/2000/051900.htm : « Ecuador's decision to dollarize was taken in January 2000 by then President Jamil Mahuad. » ; « President Mahuad announced dollarization on January 9; he was ousted on January 21. » ; « The sucre lost almost 80 percent of its dollar value in the 16 months since Mr. Mahuad had taken office. »
- https://www.portafolio.co/internacional/presidente-de-ecuador-ratifica-que-el-dolar-es-el-unico-medio-de-pago-626054 : « El dólar estadounidense es la única moneda de curso legal en Ecuador desde el 9 de enero de 2000 » ; Daniel Noboa « ratificó […] por decreto, al dólar estadounidense como unidad monetaria » (décret 565).
- https://www.larepublica.co/globoeconomia/ecuador-conmemora-25-anos-de-la-dolarizacion-en-busqueda-de-estabilizar-la-economia-4033457 : « Fue el 9 de enero del año 2000 cuando Ecuador adoptó al dólar como su moneda oficial. »
- Mode : primaire (FMI) pour 2000 ; indirect via deux journaux économiques (Portafolio, La República), concordants, pour la situation actuelle.

Contre-vérification : VALIDÉ. Discours du FMI relu (annonce du 9 janvier, « The sucre lost almost 80 percent of its
dollar value in the 16 months since Mr. Mahuad had taken office ») ; Portafolio relu (décret 565). Source indépendante
relue : Primicias (Équateur), https://www.primicias.ec/politica/presidente-daniel-noboa-anuncia-decreto-ejecutivo-dolarizacion-dolar-ecuador-91992
(décret exécutif 565 du 18 mars 2025, qui « ratifica como unidad monetaria y único medio de pago oficial […] al
dólar »). Remarque de neutralité : ce décret a été pris pendant la campagne présidentielle de 2025, en réponse à un
débat entre candidats ; la phrase reste factuelle et ne prend pas parti, mais on peut la couper sans perte (« …la
dollarisation, toujours en vigueur. ») si l'on préfère éviter toute résonance électorale.

---

## Histoire

### 9. salem (faux)

```js
  { id: "salem", niveau: 1, texte: "Lors des procès des sorcières de Salem, en 1692, les condamnés ont été brûlés vifs.", vrai: false,
    explication: "Dix-neuf personnes ont été pendues, et un homme, Giles Corey, est mort écrasé sous des poids pour avoir refusé d'être jugé. Personne n'a été brûlé.", source: "Bibliothèque du Congrès, « The Crushing Death of Giles Corey of Salem, 1692 » ; Northeastern University (Jessica Parr), 2023" },
```

Sources :
- https://blogs.loc.gov/law/2020/10/the-crushing-death-of-giles-corey-of-salem-1692/ : « 19 people died by hanging, and one person died from being crushed to death. »
- https://news.northeastern.edu/2023/10/18/salem-witch-trials-history-truth : « There were no witch bonfires in this particular case » ; « Most of the accused were hanged (with the exception of Giles Corey who was crushed to death). »
- Mode : indirect via la Bibliothèque du Congrès (Law Library) et une historienne de Northeastern University, concordantes ; archives judiciaires de 1692 non lues. « Bûchers en Europe » : l'idée est dans les deux, mais seule la mention négative (« no witch bonfires ») est lue mot à mot ; si un doute subsiste, couper la seconde moitié de la dernière phrase.

Contre-vérification : À CORRIGER (corrigé dans le bloc). Relus : Law Library du Congrès (« 19 people died by hanging,
and one person died from being crushed to death » ; Corey « pressed to death », procédé décrit comme « pressing the
accused with weights » ; il avait refusé d'être jugé) et Northeastern University (« There were no witch bonfires in
this particular case » ; « Giles Corey was crushed to death after he refused to be put on trial »), deux sources
indépendantes concordantes ; archives judiciaires de 1692 non lues. Corrections : 1) « bûchers de sorcières en
Europe » coupé : seule Northeastern dit que les bûchers ont eu lieu « mostly […] over in Europe », et aucune source lue
n'établit que l'image de Salem en vient (lien de cause seulement trouvé dans des résumés de recherche) ; 2) « sous des
pierres » → « sous des poids » : la Law Library parle de « weights », les pierres n'apparaissent que dans la légende
d'une gravure ; 3) ajout de « pour avoir refusé d'être jugé » (les deux sources), puisque Corey n'a pas été condamné.

### 10. neron-violon (faux)

```js
  { id: "neron-violon", niveau: 1, texte: "Néron jouait du violon pendant que Rome brûlait.", vrai: false,
    explication: "Le violon n'existait pas : il n'est apparu que plus d'un millénaire plus tard. Selon Tacite, Néron était à Antium quand l'incendie a éclaté, et une rumeur disait qu'il avait chanté la destruction de Troie sur sa scène privée pendant que la ville brûlait.", source: "Tacite, Annales, XV, 39 ; Gyles, « Nero Fiddled While Rome Burned », The Classical Journal, 1947" },
```

Sources :
- https://penelope.uchicago.edu/Thayer/E/roman/Texts/Tacitus/Annals/15B*.html (Annales, XV, 39, trad. Loeb) : « Nero, who at the time was staying in Antium, did not return to the capital until the fire was nearing the house » ; « the report had spread that, at the very moment when Rome was aflame, he had mounted his private stage and, typifying the ills of the present by the calamities of the past, had sung the destruction of Troy. »
- https://penelope.uchicago.edu/Thayer/E/Journals/CJ/42/4/Nero_Fiddled*.html (Mary Francis Gyles, The Classical Journal, 42, 1947, p. 211-217) : « Since musical historians agree that the viol class of instruments did not develop until about the eleventh century, it is conclusive that Nero could not have fiddled in this sense of the word while Rome burned. » ; « the violin which developed over a millennium later ».
- Mode : primaire (Tacite) ; article savant pour la date des violes. La date d'apparition du violon (vers 1550 selon le Metropolitan Museum) n'a pu être lue (429) : non affichée.

Contre-vérification : À CORRIGER (corrigé dans le bloc). Tacite, Annales, XV, 39, relu (Néron « staying in Antium » ;
rumeur du chant de la destruction de Troie sur sa scène privée) ; Gyles relue (The Classical Journal, 42, n° 4,
janvier 1947, p. 211-217). Source indépendante relue : Suétone, Vie de Néron, 38
(https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Nero*.html) : Néron, depuis la tour de
Mécène, « sang the whole of the "Sack of Ilium," in his regular stage costume » ; Suétone présente comme un fait ce
que Tacite donne pour une rumeur, ce qui ne change pas la réponse (il chantait, il ne jouait pas du violon) et que
l'explication respecte en attribuant la rumeur à Tacite. Correction : « la famille des violes […] vers le XIe siècle »
est trompeur en français, où « violes » désigne la famille de la viole de gambe, bien plus tardive ; Gyles parle de la
« viol class of instruments » au sens large des instruments à archet. Remplacé par ce que Gyles dit mot pour mot du
violon : « the violin which developed over a millennium later » → « il n'est apparu que plus d'un millénaire plus
tard ».

---

## Sciences

### 11. mercure-chaude (faux)

```js
  { id: "mercure-chaude", niveau: 1, texte: "Mercure, la planète la plus proche du Soleil, est la plus chaude du Système solaire.", vrai: false,
    explication: "La plus chaude est Vénus, deuxième planète à partir du Soleil, avec environ 467 °C en surface : elle est plus chaude encore que Mercure.", source: "NASA Science, « Venus: Facts »" },
```

Sources :
- https://science.nasa.gov/venus/venus-facts/ : « Venus is the hottest planet in our solar system, with surface temperatures about 872 degrees Fahrenheit (467 Celsius). » ; « Venus is hotter even than the innermost planet, charbroiled Mercury. »
- Mode : primaire. L'explication par l'effet de serre de l'atmosphère n'a pas été lue sur la page : non affichée (à ajouter seulement après lecture de la section « Atmosphere »).

Contre-vérification : VALIDÉ. Page de la NASA relue (« hottest planet in our solar system », 467 °C, « hotter even
than the innermost planet, charbroiled Mercury »). Source indépendante relue : ESA, « Earth's evil twin »
(https://www.esa.int/ESA_Multimedia/Images/2019/05/Earth_s_evil_twin) : « Thanks to its dense atmosphere, it is even
hotter than planet Mercury, which orbits closer to the Sun. » La cause est désormais lue sur la page de la NASA (« Its
thick atmosphere traps heat in a runaway greenhouse effect ») et chez l'ESA : on peut l'ajouter si on le souhaite
(« …à cause de l'effet de serre de son atmosphère épaisse »), ce n'est pas exigé.

### 12. mercure-voisine (vrai)

```js
  { id: "mercure-voisine", niveau: 3, texte: "En moyenne dans le temps, la planète la plus proche de la Terre est Mercure, et non Vénus.", vrai: true,
    explication: "Vénus est celle qui s'approche le plus de nous, mais elle passe aussi de longues périodes de l'autre côté du Soleil. Mercure, sur une orbite bien plus petite, ne s'éloigne jamais autant : sa distance moyenne à la Terre est d'environ 1,04 unité astronomique, contre 1,14 pour Vénus. Le calcul suppose des orbites circulaires dans un même plan.", source: "Stockman, Monroe et Cordner, « Venus is not Earth's closest neighbor », Physics Today, 2019" },
```

Sources :
- https://physicstoday.aip.org/opinion/venus-is-not-earths-closest-neighbor : « Mercury (average orbital radius of 0.39 AU), not Venus (average radius of 0.72 AU), is the closest planet to Earth on average » ; « Venus is on average 1.14 AU from Earth, but Mercury is a much closer 1.04 AU. »
- Mode : primaire. C'est une tribune (rubrique « Commentary ») et non un article revu ; le calcul est simple et repris partout, mais l'hypothèse des orbites circulaires est dite dans l'explication.

Contre-vérification : VALIDÉ. Tribune relue (Stockman, Monroe et Cordner, Physics Today, 12 mars 2019, rubrique
d'opinion, non revue par les pairs) : 1,14 UA pour Vénus, 1,04 UA pour Mercure ; orbites « circular, concentric, and
coplanar » ; les auteurs ont aussi simulé les positions des planètes sur 10 000 ans (PyEphem) et trouvent un écart de
moins de 1 % avec ce calcul. Aucun article revu trouvé (la recherche ne renvoie que des reprises de presse et une
démonstration Wolfram, illisible). Calcul refait indépendamment (moyenne de √(1 + r² − 2r cos θ) sur θ, orbites
circulaires, r = 0,387 et 0,723 UA) : 1,038 UA pour Mercure, 1,136 UA pour Vénus (1,693 pour Mars). Le résultat est
une conséquence mathématique élémentaire, vérifiable sans source : la tribune suffit comme référence. Remarque
facultative : l'explication pourrait ajouter que la simulation sur 10 000 ans confirme le calcul, ce qui lève
l'objection des orbites idéalisées.

### 13. iss-gravite (faux)

```js
  { id: "iss-gravite", niveau: 2, texte: "Les astronautes flottent dans la Station spatiale internationale parce qu'il n'y a plus de gravité à cette altitude.", vrai: false,
    explication: "À l'altitude de la station, la gravité terrestre vaut encore environ 90 % de sa valeur au sol. Les astronautes flottent parce qu'ils sont en chute libre, comme la station et tout ce qu'elle contient.", source: "NASA, « What Is Microgravity? »" },
```

Sources :
- https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-microgravity-grades-5-8/ : « At that altitude, Earth's gravity is about 90 percent of what it is on the planet's surface. » ; « The answer is because they are in free fall. »
- Mode : primaire.

Contre-vérification : VALIDÉ. Page de la NASA relue (« about 90 percent », « because they are in free fall »). Source
indépendante relue : JAXA, https://iss.jaxa.jp/kids/en/space/101.html (« a strong force of gravity, about 90 percent
of the gravity on Earth » ; le flottement vient du mouvement de la station). Contrôle par le calcul : à 400 km
d'altitude, (6 371 / 6 771)² ≈ 0,89.

---

## Corps humain

### 14. bacteries-cellules (faux)

```js
  { id: "bacteries-cellules", niveau: 2, texte: "Le corps humain contient dix fois plus de bactéries que de cellules humaines.", vrai: false,
    explication: "Ce rapport de dix pour un, très cité, venait d'une estimation ancienne. Une réévaluation de 2016 compte, pour un homme de 70 kg, environ 38 000 milliards de bactéries pour 30 000 milliards de cellules humaines : à peu près autant.", source: "Sender, Fuchs et Milo, « Revised Estimates for the Number of Human and Bacteria Cells in the Body », PLoS Biology, 2016" },
```

Sources :
- https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1002533 : « Our analysis also updates the widely-cited 10:1 ratio, showing that the number of bacteria in the body is actually of the same order as the number of human cells » ; « We estimate the total number of bacteria in the 70 kg "reference man" to be 3.8·10^13. » ; « revise past estimates to 3.0·10^13 human cells » ; « we can give an updated estimate of B/H = 1.3 ».
- Mode : primaire.

Contre-vérification : VALIDÉ. Article relu (3,8·10¹³ bactéries, 3,0·10¹³ cellules humaines, homme de référence de
70 kg, B/H = 1,3 « with an uncertainty of 25% »). Source indépendante relue : Science News,
https://www.sciencenews.org/article/body%E2%80%99s-bacteria-don%E2%80%99t-outnumber-human-cells-so-much-after-all
(« about 40 trillion bacteria and 30 trillion human cells », ratio de 1,3, chiffre de dix pour un tiré d'un calcul
approximatif publié en 1972). « Une estimation ancienne » est exact.

### 15. adn-longueur (vrai)

```js
  { id: "adn-longueur", niveau: 2, texte: "Déroulé bout à bout, l'ADN d'une seule de nos cellules mesurerait environ deux mètres.", vrai: true,
    explication: "Cette longue molécule tient pourtant dans le noyau de la cellule, invisible à l'œil nu, grâce à un repliement très compact autour de protéines.", source: "Salk Institute, 2017 (étude ChromEMT, Science) ; Science News, « The art of DNA folding »" },
```

Sources :
- https://www.sciencedaily.com/releases/2017/07/170727141510.htm (communiqué du Salk Institute sur Ou et al., « ChromEMT », Science, 27 juillet 2017) : « So how does each tiny cell pack a two-meter length of DNA into its nucleus »
- https://sciencenews.org/article/art-dna-folding : « When stretched out, the DNA would extend about two meters. »
- Mode : indirect via le Salk Institute (repris par ScienceDaily) et Science News, concordants ; aucune page d'institution de référence (NIH, NHGRI) trouvée. « Autour de protéines » : formulation générale (chromatine) non citée mot à mot ; à couper si l'on veut s'en tenir aux citations.

Contre-vérification : VALIDÉ. Source primaire (Ou et al., Science, 2017) non consultée en texte intégral ; la page de
référence du NIH (NCBI Bookshelf, Alberts) bloque la lecture automatique. Deux sources secondaires sérieuses,
indépendantes et concordantes, relues : le communiqué du Salk Institute repris par ScienceDaily (« a two-meter length
of DNA into its nucleus ») et Science News (Tina Hesman Saey, 29 décembre 2014 : « When stretched out, the DNA would
extend about two meters »). « Autour de protéines » est désormais sourcé : communiqué du Salk (« 147 bases of DNA
spooling around proteins » ; noyau d'environ un millième de millimètre, ce qui couvre « invisible à l'œil nu ») et
glossaire du NHGRI, https://www.genome.gov/genetics-glossary/histone (« the DNA wraps around complexes of histone
proteins, giving the chromosome a more compact shape »). Le bloc peut rester tel quel ; ajouter « NHGRI, glossaire,
« Histone » » au champ `source` est facultatif.

---

## Animaux

### 16. chats-sucre (vrai)

```js
  { id: "chats-sucre", niveau: 2, texte: "Les chats ne sentent pas le goût sucré.", vrai: true,
    explication: "Chez eux, le gène d'une des deux protéines du récepteur du sucré est inactif ; le même défaut se retrouve chez le tigre et le guépard. Les chats ne préfèrent pas les sucres et ne peuvent probablement pas les détecter.", source: "Li et al., « Pseudogenization of a sweet-receptor gene accounts for cats' indifference toward sugar », PLoS Genetics, 2005" },
```

Sources :
- https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.0010003 : les chats « do not prefer and may be unable to detect the sweetness of sugars » ; « cat Tas1r2 is an unexpressed pseudogene » ; « Tas1r2 in tiger and cheetah and in six healthy adult domestic cats all show the similar deletion and stop codons ».
- Mode : primaire. Le résumé dit « may be unable » : l'explication garde le « probablement ».

Contre-vérification : VALIDÉ, résultat nuancé signalé. Article relu (« do not prefer and may be unable to detect the
sweetness of sugars » ; « cat Tas1r2 is an unexpressed pseudogene » ; même délétion de 247 paires de bases chez le
tigre et le guépard). Source indépendante relue : Nature News, 25 juillet 2005,
https://www.nature.com/news/2005/050718/full/news050718-16.html (« lack functioning taste receptors for sugar »). La
nuance est réelle : l'auteur principal (Brand) évoquait la possibilité que le récepteur restant (Tas1r3) perçoive de
fortes concentrations. L'affirmation « ne sentent pas » est donc un peu plus catégorique que la source ; le
« probablement » de l'explication suffit à signaler le doute, et la réponse « vrai » reste la seule défendable.

### 17. lemmings (faux)

```js
  { id: "lemmings", niveau: 1, texte: "Les lemmings se suicident en masse en se jetant du haut des falaises.", vrai: false,
    explication: "C'est un mythe, popularisé par le documentaire de Disney White Wilderness (1958) : les lemmings y avaient été jetés d'une falaise par l'équipe de tournage. Quand la nourriture manque, ils se dispersent et traversent des étendues d'eau à la nage ; certains se noient.", source: "Riley Woodford, « Lemming Suicide Myth », Alaska Fish & Wildlife News, Alaska Department of Fish and Game, septembre 2003" },
```

Sources :
- https://www.adfg.alaska.gov/index.cfm?adfg=wildlifenews.view_article&articles_id=56 : « Lemmings do not commit mass suicide. It's a myth, but it's remarkable how many people believe it. » ; « White Wilderness » « featured a segment on lemmings, detailing their strange compulsion to commit mass suicide » ; les lemmings « were actually thrown off a cliff by the Disney filmmakers » ; « Lemmings can swim and will cross bodies of water in their quest for greener pastures. Sometimes they drown. »
- Mode : primaire (service de la faune de l'Alaska). Titre exact de l'article non relevé : la source courte est à ajuster (« Alaska Fish & Wildlife News », 2003, Riley Woodford, selon les résultats de recherche).

Contre-vérification : À CORRIGER (corrigé dans le bloc). Page relue : titre exact « Lemming Suicide Myth » (sous-titre
« Disney Film Faked Bogus Behavior »), par Riley Woodford, Alaska Fish & Wildlife News, septembre 2003 ; toutes les
citations s'y trouvent, y compris « When they've exhausted the local food supply, they disperse ». Le titre proposé
(« Lemmings: Suicide Myth ») était faux : champ `source` corrigé. Source indépendante relue : McGill University, Office
for Science and Society, Ada McVean, « Lies of Leaping Lemmings », 2 août 2017 (https://www.mcgill.ca/oss/node/2587) :
mythe « completely fabricated », scène de White Wilderness mise en scène (enquête de la CBC de 1982), dispersion quand
la population est trop forte. Nuance sans effet sur la réponse : selon McGill, les lemmings ont été poussés « into a
river » depuis une plaque tournante, l'ADFG dit « thrown off a cliff » ; l'explication suit la source citée.

---

## Langue

### 18. sincere-cire (faux)

```js
  { id: "sincere-cire", niveau: 2, texte: "Le mot « sincère » vient du latin « sine cera », « sans cire ».", vrai: false,
    explication: "Il vient du latin sincerus, « pur, intact, non fardé ». L'histoire d'artisans qui auraient masqué des défauts avec de la cire, racontée sous plusieurs versions, est une étymologie populaire, sans preuve.", source: "Trésor de la langue française (CNRTL) ; Oxford English Dictionary, cité par Grammarphobia ; Merriam-Webster" },
```

Sources :
- https://www.cnrtl.fr/etymologie/sinc%C3%A8re : « Empr. au lat. class. sincerus « pur, intact, non fardé, non corrompu ». »
- https://grammarphobia.com/blog/2012/03/sincere.html : « The word “sincere” has no such origin » ; citation de l'OED : « There is no probability in the old explanation [from] sine cera ‘without wax.’ »
- https://alt-usage-english.org/excerpts/fxsincer.html (réponse du service éditorial de Merriam-Webster) : « The theory that 'sincere' ultimately derives from Latin sine cera, meaning 'without wax', is a popular one » ; « unfortunately, there is no evidence to support it. »
- Mode : primaire pour l'étymologie (TLFi) ; indirect via Grammarphobia, qui cite l'OED, et via Merriam-Webster pour le rejet de « sine cera ». L'origine de sincerus lui-même reste incertaine : l'explication ne s'avance pas au-delà. Le détail des « sculpteurs » est la forme courante de la légende, non lue dans ces pages : à couper si besoin (« est une étymologie populaire, sans preuve »).

Contre-vérification : À CORRIGER (corrigé dans le bloc). TLFi relu : « Empr. au lat. class. sincerus « pur, intact,
non fardé, non corrompu » », sans mention de sine cera (source primaire pour la réponse « faux »). Rejet de sine cera :
Grammarphobia relu (cite l'OED : « There is no probability in the old explanation [from] sine cera ‘without wax.’ ») et
alt-usage-english.org relu (cite le service éditorial de Merriam-Webster : « there is no evidence to support it ») ;
deux reprises de deux dictionnaires de référence, concordantes ; les pages de Merriam-Webster et d'Etymonline
refusent la lecture (403). Correction : la légende existe en plusieurs versions et les sculpteurs ne sont qu'une
d'elles (Grammarphobia cite des sculpteurs, des carriers grecs, des bâtisseurs romains, des potiers, des ébénistes et,
pour la plus ancienne, des marchands de miel romains ; la FAQ cite des carriers romains). « Sculpteurs » remplacé par
« artisans […] racontée sous plusieurs versions » ; « sans aucune preuve » ramené à « sans preuve » (« no
evidence »).

### 19. bistrot (faux)

```js
  { id: "bistrot", niveau: 2, texte: "Le mot « bistrot » vient des soldats russes qui criaient « bystro ! » (« vite ! ») dans les cafés parisiens.", vrai: false,
    explication: "Le mot n'est attesté qu'à partir de 1884, et la forme « bistrot » en 1892, bien après le passage des troupes russes à Paris. Le Trésor de la langue française juge l'hypothèse russe insuffisamment fondée ; l'origine du mot reste obscure.", source: "Trésor de la langue française (CNRTL), « bistro, bistrot », étymologie" },
```

Sources :
- https://www.cnrtl.fr/etymologie/bistrot : « 1884 arg. pop. bistro « cabaretier » » ; « 1892 bistrot (Timm.) » ; l'hypothèse d'une adaptation du russe « n'est pas suffisamment fondée » ; « Orig. obsc. »
- Mode : primaire. « Bien après le passage des troupes russes » suppose la date de l'occupation de Paris (1814), non lue ici ; pour s'en tenir à la source, écrire « Le mot n'est attesté qu'à partir de 1884 ».

Contre-vérification : VALIDÉ. TLFi relu : 1884, 1892 ; « l'hyp. qui voit dans le mot, l'adaptation du russe bistro
« vite » remontant aux cosaques assoiffés occupant Paris en 1814 » « n'est pas suffisamment fondée » ; « Orig.
obsc. ». « Après le passage des troupes russes à Paris » est donc sourcé par le TLFi lui-même (1814) : rien à couper.
Sources indépendantes relues : Dictionnaire de l'Académie française, 9e édition, « bistro ou, mieux, bistrot »
(https://www.dictionnaire-academie.fr/article/A9B1261) : « xixe siècle, bistro, « cabaretier » », origine possible
dans le poitevin bistraud ou dans bistrouille, aucune mention du russe ; Anatoly Liberman, OUPblog, 3 juin 2009
(https://blog.oup.com/2009/06/french-2/), qui rejette la thèse cosaque (« The real story behind French bistro remains
unknown »). Liberman date la première attestation de 1789, sans doute une coquille (un lecteur la relève) : écart à
ne pas reprendre, le TLFi faisant foi pour la date.

---

## Économie

### 20. monopoly (vrai)

```js
  { id: "monopoly", niveau: 2, texte: "L'ancêtre du Monopoly a été inventé pour mettre en garde contre les monopoles.", vrai: true,
    explication: "Lizzie Magie, adepte des idées de l'économiste Henry George, fait breveter en 1904 The Landlord's Game, « le jeu du propriétaire », pour enseigner ces idées. Le jeu reçoit deux séries de règles, dont une « antimonopole », qu'elle juge moralement préférable. Copié de main en main, le jeu a pris le nom de « Monopoly », et c'est la variante où l'on ruine les autres qui l'a emporté.", source: "Brevet américain n° 748 626 (1904) ; British Library, « Lizzie Magie and the history of Monopoly » ; The Public Domain Review" },
```

Sources :
- https://patents.google.com/patent/US748626A/en : brevet « Game-board », Lizzie J. Magie, accordé le 5 janvier 1904 ; « The object of the game is to obtain as much Wealth or money as possible ».
- https://www.bl.uk/stories/blogs/posts/lizzie-magie-and-the-history-of-monopoly : « US patent no. 748,626 was granted on the 5th January 1904 » ; Magie ajoute une règle antimonopole et « believed this approach would demonstrate to the players that the anti-monopoly version was the morally correct choice » ; « the game became increasingly known as 'The Monopoly Game' or just 'Monopoly' ».
- https://publicdomainreview.org/collection/the-landlords-game : Magie et son père étaient « devout followers of the teachings of economist Henry George » ; « Magie designed The Landlord's Game to teach and proselytize the principles of Georgism. »
- Mode : primaire (brevet) ; British Library et Public Domain Review, concordantes, pour l'intention. Point à surveiller : selon la British Library, la règle antimonopole a été ajoutée « later » ; le brevet de 1904 ne donne que l'objectif d'enrichissement. L'explication dit « elle y ajoute », sans date.

Contre-vérification : À CORRIGER (corrigé dans le bloc). Brevet relu (US 748 626, 5 janvier 1904). British Library
relue (Steven Campion, 6 mars 2023) : « Magie would later refine the game to have two sets of rules », sans année.
Public Domain Review relue : les « two sets of rules representing the difference between a Georgist and capitalist
economy » font partie du « Magie's original concept » ; « Magie designed The Landlord's Game to teach and proselytize
the principles of Georgism » ; « What Magie intended as a forecast of disaster became Monopoly's sole objective ». Les
deux sources se contredisent sur la date des règles antimonopole (dès l'origine ou plus tard) et aucune ne donne
d'année : « elle y ajoute », placé juste après le brevet de 1904, laissait croire à une date. Reformulé sans date
(« Le jeu reçoit deux séries de règles, dont une « antimonopole » ») ; ajout de « pour enseigner ces idées » (Public
Domain Review), qui justifie la réponse « vrai ». Le reste (Henry George, nom de « Monopoly », victoire de la variante
monopoliste) est confirmé par les deux sources.

---

## Écartés

- **Premiers billets de banque d'Europe (Stockholms Banco, 1661)** : la page de la Riksbank dit « the first real banknotes in Europe » ; la réponse dépend de ce qu'on appelle un « vrai » billet, et la date 1661 n'est que dans le titre de la page. Écarté (ambiguïté de définition).
- **Le Saint-Siège n'est pas membre de l'ONU** : la liste des États membres de l'ONU refuse la lecture (403) ; même thème que `suisse-onu`. Non vérifié, non proposé.
- **Ongles des mains deux fois plus rapides que ceux des pieds** (Yaemsiri et al., 2010) : chiffres lus seulement dans un résumé de recherche (PubMed demande des cookies) ; peu surprenant. Écarté.
- **Date d'apparition du violon (vers 1550, Metropolitan Museum)** : page refusée (429) ; remplacée dans `neron-violon` par la date des violes, lue chez Gyles (1947).
- **Effet de serre de Vénus** et **taille du noyau cellulaire (5 µm)** : lus seulement dans des résumés de recherche, retirés des explications.
- Idées envisagées puis abandonnées sans recherche approfondie : fin du remboursement des réparations allemandes en 2010 (il s'agit d'obligations, pas des réparations elles-mêmes : ambigu), pyramides construites par des esclaves (débat d'historiens), effet Mpemba (résultat discuté), espérance de vie au Moyen Âge (dépend de la définition).
