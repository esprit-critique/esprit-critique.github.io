# Propositions : 20 nouvelles paires célèbres pour « Lequel est venu avant ? »

## Bilan de la contre-vérification (22 novembre 2026)

- 20 paires : **15 validées**, **5 à corriger** (paires 5, 10, 12, 13, 14 ; blocs de code corrigés), **0 rejetée**.
- Section A (dates de `sacre`, `train`, `lune`) : validée ; aucune paire existante ni aucun tirage cassé (`chiffres.js` lu).
- Section B (19 événements) : à corriger, deux noms (`finlande`, `vatican`) ; format, ids et neutralité conformes.
- Appuis vus seulement en extrait de moteur de recherche : tous relus ou remplacés par une page lue (aph.gov.au lu ;
  vaticanstate.va remplacé par le texte des accords sur vatican.va ; Britannica Meiji remplacée par la Bibliothèque
  nationale de la Diète ; Britannica FIFA par le musée de la FIFA ; FIFA 1930 par une page FIFA lue ; Vikidia retiré,
  Hérodote lu).
- Dates d'`EVENEMENTS` relues pour les écarts serrés : tour Eiffel (31 mars 1889), MLK (15 janvier 1929), Tour de France
  (1er juillet 1903), train (15 septembre 1830). Corrections d'écarts arrondis vers le haut (« près de » huit, cinq et
  onze ans).
- Lecture : WebFetch refusé sur la plupart des sites ; pages téléchargées avec `curl` et lues en texte brut.

Rédigé le 22 novembre 2026. Rien n'est modifié dans `static/` : ce fichier est une proposition à relire avant collage.

Mode de lecture : l'outil WebFetch était refusé (HTTP 403) sur tous les sites ; les pages ont été téléchargées avec
`curl` puis lues en texte brut. Les citations ci-dessous sont copiées des pages téléchargées, sauf mention « extrait
de moteur de recherche » (page illisible hors navigateur ou refusée).

Convention reprise de l'existant : `a` est l'événement le plus ancien. Lors du collage, ajouter `depuis:` (numéro du
jour de première apparition, le lendemain de la publication), comme l'exige `CLAUDE.md`, puis mettre à jour
`tests/rotation-manifeste.json`.

Répartition : 13 paires de géopolitique et d'histoire des États (dont 1 organisation internationale), 2 de sciences et
techniques, 2 de culture, 2 de sport, 1 de santé.

---

## A. Modifications proposées d'événements existants

Trois paires de même année exigent une date précise sur les deux événements (`tirerPairesChronologie` et
`momentEvenement` s'en servent). Ces champs `date` sont à ajouter :

```js
  { id: "sacre", sujet: "napoleon", nom: "Sacre de Napoléon Ier", annee: 1804, date: "1804-12-02" },
  { id: "train", nom: "Première ligne de chemin de fer pour voyageurs (Liverpool–Manchester)", annee: 1830, date: "1830-09-15" },
  { id: "lune", sujet: "espace", nom: "Premiers pas sur la Lune", annee: 1969, date: "1969-07-21" },
```

- `sacre` : napoleon.org (Fondation Napoléon), dossier « Le Sacre de Napoléon Ier le 2 décembre 1804 à Notre-Dame »
  (titre de la page lue). Primaire institutionnel.
- `train` : date déjà relue le 19 novembre (Science and Industry Museum, voir `tests/a-verifier.md`).
- `lune` : NASA, NSSDC, fiche du module lunaire d'Apollo 11 : « Armstrong stepped onto the lunar surface at 02:56:15
  UT on 21 July (10:56:15 p.m. July 20 EDT) ». Le 21 juillet est la date en temps universel et en France ; le 20 juillet
  est la date aux États-Unis. Primaire.

Contre-vérification : VALIDÉ. Relu le 22 novembre 2026 : napoleon.org (titre et chapeau « Le Sacre de Napoléon Ier le
2 décembre 1804 à Notre-Dame ») ; NSSDC (« Armstrong stepped onto the lunar surface at 02:56:15 UT on 21 July (10:56:15
p.m. July 20 EDT) », mot pour mot) ; train, sources indépendantes lues : National Museums Liverpool (« The opening of
the Liverpool and Manchester Railway on 15 September 1830 », liverpoolmuseums.org.uk/stories/opening-of-liverpool-and-manchester-railway),
The London Gazette (« attended the opening on 15 September 1830 », thegazette.co.uk/all-notices/content/100741). La page
du Science and Industry Museum citée dans `tests/a-verifier.md` répond désormais 404/405 ; son blog le confirme
(« On 15 September 1830 the Liverpool and Manchester Railway was opened », blog.scienceandindustrymuseum.org.uk/1830-a-rebellious-year/).
Effet sur le code (`static/chiffres.js`, lu) : `momentEvenement` passe de `annee + 0,5` à la date exacte ; aucune
paire existante ne change d'ordre (`lune`/`picasso`, `lune`/`suisse-vote`, `train`/`esclavage-britannique` vérifiées
par script) ; le tirage au hasard (`tirerPairesChronologie`, `tirerClassementChronologie`) pourra désormais opposer
`sacre`/`haiti`, `train`/`belgique` et `lune`/`arpanet` (même année, toutes deux datées) : ordres justes. Point
d'attention : `dateEvenement` affichera « 21 juillet 1969 » (« 21 July 1969 » en anglais) dans la frise ; c'est la
date en temps universel et en France, mais un lecteur américain attend le 20 juillet. Acceptable tel quel.

---

## B. Nouveaux événements à ajouter à `EVENEMENTS` (à insérer à leur place chronologique)

```js
  { id: "haiti", nom: "Proclamation de l'indépendance d'Haïti", annee: 1804, date: "1804-01-01" },
  { id: "belgique", nom: "Le gouvernement provisoire proclame l'indépendance de la Belgique", annee: 1830, date: "1830-10-04" },
  { id: "sheffield", nom: "Fondation du Sheffield FC, plus ancien club de football encore en activité", annee: 1857 },
  { id: "uit", nom: "Fondation de l'Union télégraphique internationale (aujourd'hui l'UIT), à Paris", annee: 1865, date: "1865-05-17" },
  { id: "meiji", nom: "Fin du shogunat au Japon : restauration du pouvoir impérial (ère Meiji)", annee: 1868 },
  { id: "sherlock", nom: "Première aventure de Sherlock Holmes (« Une étude en rouge »)", annee: 1887 },
  { id: "eventreur", nom: "Meurtres de « Jack l'Éventreur » à Whitechapel (Londres)", annee: 1888 },
  { id: "bresil-republique", nom: "Proclamation de la République au Brésil, qui met fin à l'Empire", annee: 1889, date: "1889-11-15" },
  { id: "australie", nom: "Naissance du Commonwealth d'Australie (fédération des six colonies)", annee: 1901, date: "1901-01-01" },
  { id: "fifa", nom: "Fondation de la FIFA, à Paris", annee: 1904 },
  { id: "norvege", nom: "Le Parlement norvégien rompt l'union avec la Suède", annee: 1905, date: "1905-06-07" },
  { id: "pole-sud", nom: "Amundsen atteint le pôle Sud", annee: 1911, date: "1911-12-14" },
  { id: "finlande", nom: "Le Parlement finlandais approuve la déclaration d'indépendance", annee: 1917, date: "1917-12-06" },
  { id: "tintin", nom: "Première apparition de Tintin (« Le Petit Vingtième »)", annee: 1929, date: "1929-01-10" },
  { id: "vatican", nom: "Signature des accords du Latran, qui créent l'État de la Cité du Vatican", annee: 1929, date: "1929-02-11" },
  { id: "arabie-saoudite", nom: "Proclamation du royaume d'Arabie saoudite", annee: 1932, date: "1932-09-23" },
  { id: "hawaii", nom: "Hawaï devient le 50e État des États-Unis", annee: 1959, date: "1959-08-21" },
  { id: "arpanet", sujet: "internet", nom: "Premier message envoyé sur ARPANET, l'ancêtre d'Internet", annee: 1969, date: "1969-10-29" },
  { id: "soudan-sud", nom: "Indépendance du Soudan du Sud", annee: 2011, date: "2011-07-09" },
```

Remarques :
- `arpanet` reçoit `sujet: "internet"` pour ne pas être tiré au hasard contre `web`, `wikipedia`, `facebook` ou `iphone`.
- `meiji` n'a pas de `date` : la passation du pouvoir est de novembre 1867 (taisei hōkan), l'édit de restauration de
  janvier 1868 (ōsei fukko) ; l'année 1868 suit l'usage. La paire retenue garde un écart net (1863).
- Ajouter ces 19 événements change `EVENEMENTS.length`, affiché par `chiffres.js` (texte calculé, pas de traduction
  à reprendre). Les noms sont des textes nouveaux : passer `tests/en/extraire.py --manquants`, `ajouter.py`, `controle.py`.

Contre-vérification : À CORRIGER (bloc corrigé ci-dessus). Format contrôlé par script (Node, sur `static/jeux-donnees.js`
et ce fichier) : 19 ids nouveaux, aucun doublon avec les 125 ids existants (`bresil` et `bresil-republique` restent
distincts), champs connus seulement (`id`, `nom`, `annee`, `date`, `sujet`), chaque `date` commence par son `annee`.
Libellés neutres. Deux noms corrigés :
- `finlande` : la déclaration a été lue devant la Diète le 4 décembre 1917 et approuvée le 6 (um.fi, lu : « On 4
  December 1917 [...] Svinhufvud read out the Declaration of Independence to the Diet » ; « December the 6th, 1917 came
  to be the date of Finland's independence »). « Déclaration d'indépendance » daté du 6 était inexact ; nouveau nom :
  « Le Parlement finlandais approuve la déclaration d'indépendance ».
- `vatican` : le traité est signé le 11 février 1929 mais n'entre en vigueur qu'à l'échange des ratifications, le 7 juin
  1929 (texte des accords sur vatican.va, lu : « Il Trattato fra la Santa Sede e l'Italia sottoscritto l'11 febbraio 1929
  fu pubblicato negli Acta Apostolicae Sedis n. 6 del 7 giugno 1929 » ; « Processo verbale dello scambio delle ratifiche,
  7 giugno 1929 »). Le nom désigne désormais la signature, ce qui rend la date du 11 février exacte sans débat.
- Tirage au hasard : `meiji` (1868, sans date) ne peut pas être opposé à `capital` (1867) ni à `suez`/`mendeleiev`
  (1869) : écart inférieur à 2 ans sans deux dates, rejeté par `tirerPairesChronologie`. Les événements datés de 1929
  (`tintin`, `mlk`, `vatican`, `anne-frank`, `krach`) ont des dates toutes distinctes et vérifiées.

---

## C. Les 20 paires

### Géopolitique et histoire des États

#### 1. Métro de Londres / Empire allemand

```js
  // London Transport Museum : métro ouvert le 10 janvier 1863 ; Deutsches Historisches Museum (LeMO) : proclamation de l'Empire le 18 janvier 1871
  { a: "metro-londres", b: "empire-allemand", note: "Le métro de Londres circulait depuis huit ans quand l'Allemagne unifiée est née, avec la proclamation de l'Empire allemand le 18 janvier 1871." },
```

Sources :
- https://ltmuseum.co.uk/visit/museum-guide/worlds-first-underground : « The first section of the Metropolitan opened from
  Paddington to Farringdon on 10 January 1863. » Institutionnel (musée).
- https://www.dhm.de/lemo/kapitel/kaiserreich/innenpolitik/reichsgruendung : « genau einen Monat später - auf Wunsch
  Wilhelms I. am 170. Jahrestag der Erhebung des Kurfürsten von Brandenburg zum König in Preußen vom 18. Januar 1701 -
  riefen die versammelten deutschen Fürsten und hohe Militärs im Spiegelsaal von Versailles Wilhelm I. zum "Deutschen
  Kaiser" aus. » (un mois après le 18 décembre 1870, soit le 18 janvier 1871). Institutionnel (musée).

Contre-vérification : VALIDÉ. Les deux citations sont sur les pages (relues mot pour mot). Source indépendante lue :
Agence fédérale allemande pour l'éducation civique (bpb.de, « Vor 150 Jahren: Proklamation des Deutschen Kaiserreichs »,
2021) : « Am 18. Januar 1871 wurde im Schloss Versailles das Deutsche Kaiserreich ausgerufen ». Écart : 8 ans et 8 jours.

#### 2. Premiers prix Nobel / Norvège indépendante

```js
  // Fondation Nobel (nobelprize.org) : premier prix de la paix en 1901, Norvège et Suède alors unies ; Store norske leksikon : union rompue par le Storting le 7 juin 1905
  { a: "nobel", b: "norvege", note: "Le prix Nobel de la paix est décerné en Norvège depuis 1901 ; le pays était pourtant encore uni à la Suède : son Parlement n'a rompu l'union que le 7 juin 1905." },
```

Sources :
- https://www.nobelprize.org/prizes/themes/the-nobel-peace-prize-from-peace-negotiations-to-human-rights/ : « We need to
  remember, however, that Norway and Sweden were joined in a union at the time » et « The first Peace Prize, awarded in
  1901, was accordingly shared between [...] Henry Dunant, and [...] Frédéric Passy ». Institutionnel.
- https://snl.no/unionsoppløsningen_i_1905 (Store norske leksikon ; page lue via le résumé affiché par snl.no) :
  « Oppløsningen av unionen ble vedtatt av Stortinget 7. juni 1905. I Sverige regnes 26. oktober som dagen for
  unionsoppløsningen. » Encyclopédie savante.
- https://history.state.gov/historicaldocuments/frus1905/d942 (archives diplomatiques américaines) : « American Legation,
  Stockholm, June 7, 1905. (Mr. Graves reports that the cabinet of Norway has been unanimously authorized by the
  Norwegian Storthing to conduct the administration of the Kingdom of Norway with regent authority. » Primaire.
- Point d'attention : la Suède n'a reconnu la rupture que le 26 octobre 1905 ; l'année 1905 vaut dans les deux cas.

Contre-vérification : VALIDÉ. Citations Nobel et FRUS relues mot pour mot. L'adresse SNL citée répond 404 ; la bonne
adresse est https://snl.no/Unionsoppløsningen_i_1905 (majuscule), où le passage cité figure mot pour mot, avec la
chronologie : « 26. oktober Karlstad-konvensjonen undertegnes i Stockholm. Oscar 2 frasier seg den norske tronen, og
unionen oppløses formelt. » La note (« son Parlement n'a rompu l'union que le 7 juin 1905 ») reste vraie quelle que
soit la date retenue.

#### 3. Tour Eiffel / Australie

```js
  // Parliamentary Education Office (Parlement australien) : Commonwealth d'Australie formé le 1er janvier 1901
  { a: "eiffel", b: "australie", note: "La tour Eiffel est plus ancienne que l'Australie en tant que pays : les six colonies britanniques se sont fédérées en Commonwealth d'Australie le 1er janvier 1901." },
```

Sources :
- https://peo.gov.au/understand-our-parliament/history-of-parliament/federation/federation : « The Commonwealth of
  Australia was officially formed on 1 January 1901 when 6 British colonies – New South Wales, Victoria, Queensland,
  South Australia, Western Australia and Tasmania – agreed to unite under the Australian Constitution. » Institutionnel.
- https://www.aph.gov.au/Visit_Parliament/Art/Stories/The_Inauguration_of_the_Commonwealth_1901 : refusée (403) ;
  extrait de moteur de recherche concordant (« The Commonwealth of Australia was established on 1 January 1901 »).
- Tour Eiffel : date d'`EVENEMENTS` (31 mars 1889), non relue.

Contre-vérification : VALIDÉ. PEO relu mot pour mot. La page aph.gov.au, cette fois lue en entier (curl, HTTP 200) :
« Australia became a nation on 1 January 1901 » et « On 17 September 1900, Her Majesty proclaimed that the Commonwealth
of Australia would come into existence on 1 January 1901 ». Tour Eiffel relue : toureiffel.paris, « 1889-2019, 130 ans
d'émerveillement » (version anglaise) : « The construction of the Eiffel Tower structure was completed on Sunday, March
31, 1889. On that day, it was inaugurated at 1:30 p.m. ».

#### 4. Facebook / Soudan du Sud

```js
  // Nations unies (maintien de la paix, UNMIS) : Soudan du Sud indépendant le 9 juillet 2011 ; Meta : Facebook lancé en 2004
  { a: "facebook", b: "soudan-sud", note: "Le Soudan du Sud, devenu indépendant le 9 juillet 2011, est plus jeune que Facebook, lancé en 2004." },
```

Sources :
- https://peacekeeping.un.org/sites/default/files/past/unmis/referendum.shtml : « On 9 July 2011 South Sudan became the
  newest country in the world. » Institutionnel.
- https://about.fb.com/company-info/ : « When Facebook launched in 2004, it changed the way that people connect. »
  Primaire (entreprise).
- Point d'attention : la note ne dit pas « plus jeune pays du monde » (vrai en 2011 selon l'ONU, à ne pas figer).

Contre-vérification : VALIDÉ. UNMIS relu mot pour mot. about.fb.com redirige désormais vers
https://www.meta.com/about/company-info/ (lu : « When Facebook launched in 2004, it changed the way people connect »,
sans « that ») ; mettre cette adresse en commentaire. Écart de 7 ans, sans ambiguïté.

#### 5. Nokia / Finlande indépendante

```js
  // Nokia (nokia.com) : « founded in Tampere in 1865 » ; ministère finlandais des Affaires étrangères (um.fi) : indépendance le 6 décembre 1917
  { a: "nokia", b: "finlande", note: "Nokia est plus ancienne que la Finlande indépendante : l'entreprise est née en 1865, le Parlement finlandais a approuvé la déclaration d'indépendance le 6 décembre 1917." },
```

Sources :
- https://www.nokia.com/about-us/newsroom/media-resources/media-library/nokia-history/ : « Nokia Company, founded in
  Tampere in 1865 ». Primaire (entreprise). Lève la réserve de `tests/a-verifier.md` sur Nokia (lu cette fois sur la page).
- https://um.fi/news/-/asset_publisher/GRSnUwaHDPv5/content/itsenaisyysjulistus-nosti-suomen : « December the 6th,
  1917 came to be the date of Finland's independence. » Institutionnel.

Contre-vérification : À CORRIGER (bloc corrigé). Nokia relu (« Nokia Company, founded in Tampere in 1865 »), um.fi relu.
La page du ministère précise que la déclaration a été lue le 4 décembre 1917 et que le 6 décembre est la date retenue
après approbation par la Diète : « le pays a déclaré son indépendance le 6 décembre » devient « le Parlement finlandais
a approuvé la déclaration d'indépendance le 6 décembre 1917 » (vrai quelle que soit la date retenue, 4 ou 6 décembre).
Source indépendante : la même page est celle de l'État finlandais ; la paire (1865/1917) ne dépend pas du jour.

#### 6. Première Coupe du monde / Arabie saoudite

```js
  // FIFA : première Coupe du monde du 13 au 30 juillet 1930 ; Autorité générale saoudienne de la statistique (stats.gov.sa) : royaume proclamé le 23 septembre 1932
  { a: "coupe-du-monde", b: "arabie-saoudite", note: "La première Coupe du monde de football (juillet 1930) a précédé de deux ans la proclamation du royaume d'Arabie saoudite sous ce nom, le 23 septembre 1932." },
```

Sources :
- https://stats.gov.sa/en/saudi-national-day : « On 17 Jumada Al-Awwal 1351 AH, a Royal Decree was issued unifying all
  regions of the modern Saudi state under the name of the Kingdom of Saudi Arabia. King Abdulaziz subsequently designated
  Thursday, 21 Jumada Al-Awwal 1351 AH, corresponding to September 23, 1932, as the day [...] ». Institutionnel.
- https://saudipedia.com/en/when-was-the-unification-of-saudi-arabia-officially-announced : « A Royal Order was issued
  announcing the unification of the country and naming it the Kingdom of Saudi Arabia on September 18, 1932, to take
  effect starting Thursday, September 23, 1932. » Encyclopédie saoudienne officielle.
- Coupe du monde 1930 : date d'`EVENEMENTS` ; FIFA, page des résultats (« 13 Jul-30 Jul 1930 »), extrait de moteur de
  recherche seulement (pages fifa.com rendues par script).
- Point d'attention : le jour du décret varie selon les sources (17, 18 ou 19 septembre) ; le 23 septembre est la date
  d'effet et la fête nationale. L'écart avec 1930 reste net. Le mot « sous ce nom » évite de dater l'État saoudien
  lui-même (royaume du Hedjaz et du Nejd auparavant).

Contre-vérification : VALIDÉ. stats.gov.sa et Saudipedia relus mot pour mot. Source indépendante lue : Office of the
Historian du département d'État (history.state.gov/countries/saudi-arabia) : « The name of the state was changed to the
Kingdom of Saudi Arabia by a decree of September 18, 1932 ». La note (« sous ce nom », « deux ans ») reste vraie pour le
17, 18, 19 ou 23 septembre. Coupe du monde 1930 : l'extrait de moteur de recherche est remplacé par une page FIFA lue,
https://inside.fifa.com/news/world-first-for-uruguay-2053846 (30 juillet 2020) : « On This Day in 1930 Uruguay became
winners of the very first FIFA World Cup », ce qui date le tournoi de juillet 1930.

#### 7. Indépendance d'Haïti / Sacre de Napoléon

```js
  // Université Duke (découverte de la déclaration par Julia Gaffield) : indépendance le 1er janvier 1804 ; Fondation Napoléon : sacre le 2 décembre 1804
  { a: "haiti", b: "sacre", note: "Haïti a proclamé son indépendance vis-à-vis de la France le 1er janvier 1804, onze mois avant le sacre de Napoléon, le 2 décembre 1804." },
```

Sources :
- https://today.duke.edu/showcase/haitideclaration/documentorigins.html : « Haiti declared its independence from France
  on Jan. 1, 1804. » Institutionnel (université, à propos de l'exemplaire imprimé conservé aux Archives nationales
  britanniques).
- https://history.state.gov/countries/haiti (Office of the Historian, département d'État) : « Though it won independence
  from France in 1804, Haiti did not receive U.S. recognition until 1862. » Institutionnel.
- https://www.napoleon.org/histoire-des-2-empires/dossiers-thematiques/le-sacre-de-napoleon-ier-le-2-decembre-1804-a-notre-dame/ :
  titre « Le Sacre de Napoléon Ier le 2 décembre 1804 à Notre-Dame ». Institutionnel.
- Nécessite le champ `date` sur `sacre` (section A).

Contre-vérification : VALIDÉ. Duke et history.state.gov relus mot pour mot (deux sources indépendantes l'une de
l'autre) ; napoleon.org relu (« Le Sacre de Napoléon Ier le 2 décembre 1804 à Notre-Dame »). « Onze mois » exact.

#### 8. Tour Eiffel / Fin de l'Empire du Brésil

```js
  // Présidence de la République du Brésil (planalto.gov.br) : décret no 1 du 15 novembre 1889 proclamant la République
  { a: "eiffel", b: "bresil-republique", note: "Le Brésil était encore un empire quand la tour Eiffel a été inaugurée, le 31 mars 1889 : la République n'y a été proclamée que le 15 novembre 1889." },
```

Sources :
- https://www.planalto.gov.br/ccivil_03/decreto/1851-1899/d0001.htm : « DECRETO Nº 1, DE 15 DE NOVEMBRO DE 1889.
  Proclama provisoriamente e decreta como a fórma de governo da Nação Brazileira a Republica Federativa ». Primaire
  (texte du décret).
- Tour Eiffel : date d'`EVENEMENTS` (31 mars 1889), non relue.

Contre-vérification : VALIDÉ. Décret no 1 relu sur planalto.gov.br (« DECRETO Nº 1, DE 15 DE NOVEMBRO DE 1889 »).
Source indépendante lue : Assemblée législative de l'État de São Paulo (al.sp.gov.br/noticia/?id=368572, « 15 de novembro
de 1889 - A Proclamação da República no Brasil »). Tour Eiffel : inauguration du 31 mars 1889 relue sur toureiffel.paris
(voir paire 3) ; l'ouverture au public (15 mai 1889) serait aussi antérieure, la note tient.

#### 9. Train de voyageurs / Belgique

```js
  // Science and Industry Museum : ligne ouverte le 15 septembre 1830 ; déclaration du gouvernement provisoire belge du 4 octobre 1830 (Huyttens, 1844)
  { a: "train", b: "belgique", note: "La Belgique est plus jeune que le train de voyageurs : la ligne Liverpool–Manchester a ouvert le 15 septembre 1830, et le gouvernement provisoire belge a proclamé l'indépendance le 4 octobre 1830." },
```

Sources :
- https://fr.wikisource.org/wiki/Déclaration_d'indépendance_de_la_Belgique : « Déclaration d'indépendance de la Belgique
  — Adopté le 4 octobre 1830. Texte établi par Emile Huyttens, Société typographique belge, 1844 ». Primaire
  (transcription des *Discussions du Congrès national de Belgique*).
- Extrait de moteur de recherche concordant (Vikidia, Hérodote) : « les patriotes belges ont formé un gouvernement
  provisoire qui le 4 octobre proclame l'indépendance de la Belgique ». Le site belgium.be a répondu sans texte lisible.
- Point d'attention : le Congrès national a confirmé l'indépendance en novembre 1830, et la reconnaissance par les
  puissances est de 1831 ; toutes ces dates sont postérieures au 15 septembre 1830, la paire tient donc.
- Nécessite le champ `date` sur `train` (section A).

Contre-vérification : VALIDÉ. Wikisource relu : « Déclaration d'indépendance de la Belgique — Adopté le 4 octobre 1830
[...] Art. 1er. Les Provinces de la Belgique, violemment détachées de la Hollande, constitueront un État indépendant ».
Vikidia retiré (pas une source sérieuse). Hérodote lu (herodote.net/4_octobre_1830-evenement-18301004.php) : « la
Belgique proclame son indépendance le 4 octobre 1830 ». Train : 15 septembre 1830 relu (voir section A). Toutes les
dates possibles de naissance de l'État belge (4 octobre, 18 novembre 1830, 1831) sont postérieures au 15 septembre 1830 ;
la note, qui nomme le gouvernement provisoire, reste vraie.

#### 10. Martin Luther King / Vatican

```js
  // Vatican News et texte des accords (vatican.va) : signés le 11 février 1929, ratifications échangées le 7 juin 1929 ; Fondation Nobel : MLK né le 15 janvier 1929
  { a: "mlk", b: "vatican", note: "L'État de la Cité du Vatican a été créé par les accords du Latran, signés le 11 février 1929 et entrés en vigueur le 7 juin : il est plus jeune que Martin Luther King, né le 15 janvier 1929." },
```

Sources :
- https://www.vaticannews.va/en/vatican-city/news/2020-02/vatican-city-lateran-treaty-holy-see-pope.html : « The world's
  smallest sovereign state was born on February 11, 1929, with the signing of the Lateran Treaty between the Holy See and
  the Kingdom of Italy. » Institutionnel.
- https://vaticanstate.va/en/state-and-government/general-informations/origins-and-characteristic.html : 404 lors du
  téléchargement ; extrait de moteur de recherche concordant (« created by the Lateran Treaty [...] on 11 February 1929
  and ratified on 7 June 1929 »).
- MLK : date d'`EVENEMENTS` (15 janvier 1929). Les deux dates (signature et ratification) sont postérieures.
- Point d'attention : `mlk` figurerait alors dans trois paires (avec `anne-frank` et la paire 16).

Contre-vérification : À CORRIGER (bloc corrigé, et nom de l'événement en section B). Vatican News relu mot pour mot.
vaticanstate.va répond toujours 404 ; remplacé par le texte des accords sur vatican.va, lu :
https://www.vatican.va/roman_curia/secretariat_state/archivio/documents/rc_seg-st_19290211_patti-lateranensi_it.html
(signature le 11 février 1929, échange des ratifications le 7 juin 1929). L'État n'existe juridiquement qu'à l'entrée en
vigueur : la note dit désormais « créé par les accords du Latran, signés le 11 février 1929 et entrés en vigueur le
7 juin », vraie dans les deux lectures. MLK relu : Fondation Nobel (nobelprize.org/prizes/peace/1964/king/biographical/) :
« Martin Luther King, Jr., (January 15, 1929-April 4, 1968) ».

#### 11. Spoutnik / Hawaï

```js
  // Archives nationales des États-Unis : Hawaï admis comme 50e État le 21 août 1959 ; NASA : Spoutnik lancé le 4 octobre 1957
  { a: "spoutnik", b: "hawaii", note: "Le premier satellite artificiel, Spoutnik, a été lancé près de deux ans avant que Hawaï devienne le 50e État des États-Unis, le 21 août 1959." },
```

Sources :
- https://www.archives.gov/education/lessons/hawaii-petition : « On August 21, 1959, President Eisenhower signed the
  official proclamation admitting Hawaii as the 50th state ». Institutionnel.
- https://history.nasa.gov/sputnik/sputorig.html (R. D. Launius, historien en chef de la NASA) : « Few Americans
  considered the reception on Friday, 4 October 1957, at the Soviet Union's Embassy in Washington, DC [...] » (texte qui
  ouvre sur le soir du lancement). Institutionnel ; la date est aussi celle d'`EVENEMENTS` (1957).

Contre-vérification : VALIDÉ. archives.gov et history.nasa.gov relus mot pour mot. Source indépendante lue :
bibliothèque présidentielle Eisenhower (eisenhowerlibrary.gov/research/online-documents/hawaii-statehood) : « on August
21, 1959, President Eisenhower signed the official proclamation admitting Hawaii as the 50th state ».

#### 12. Métro de Londres / Fin du shogunat

```js
  // London Transport Museum : 10 janvier 1863 ; nippon.com (Kawai Atsushi) : édit de restauration du pouvoir impérial en janvier 1868
  { a: "metro-londres", b: "meiji", note: "Le métro de Londres circulait depuis près de cinq ans quand le Japon a mis fin au shogunat, à la fin de 1867 et au début de 1868 : le pouvoir est revenu à l'empereur, ce qui ouvre l'ère Meiji." },
```

Sources :
- https://www.nippon.com/en/views/b06902/the-meiji-restoration-the-end-of-the-shogunate-and-the-building-of-a-modern-japanese-state.html :
  « In January 1868, they took control of the Imperial Palace in Kyoto, issuing an edict restoring imperial rule (ōsei
  fukko). » et chronologie : « 1867 Shōgun Tokugawa Yoshinobu relinquishes power (taisei hōkan) to Emperor Meiji. 1868
  Edict issued restoring imperial rule ». Article d'historien, publication institutionnelle japonaise (Nippon
  Communications Foundation).
- Britannica (« Meiji Restoration ») : refusée (403) ; extrait de moteur de recherche concordant (« in January 1868 they
  announced the restoration of the emperor to power »).
- Métro : voir paire 1.
- Point d'attention : date discutée (novembre 1867 ou janvier 1868, fin des combats en 1869) ; l'écart avec 1863 reste
  net dans tous les cas, ce que dit la note.

Contre-vérification : À CORRIGER (bloc corrigé). nippon.com relu mot pour mot. Britannica toujours refusée (403, curl et
WebFetch) ; remplacée par la Bibliothèque nationale de la Diète du Japon (ndl.go.jp/modern/e/cha1/description03.html et
description04.html), lue : « the Taisei Hokan (restoration of political power to the Emperor) that took place on
November 9, 1867 » et nouveau gouvernement « set up on January 11, 1868 ». Du 10 janvier 1863 au 9 novembre 1867, il y a
4 ans et 10 mois : « depuis cinq ans » devient « depuis près de cinq ans », vrai pour 1867 comme pour 1868.

#### 13. Union télégraphique internationale / Téléphone

```js
  // UIT (itu.int) : convention télégraphique internationale signée à Paris le 17 mai 1865
  { a: "uit", b: "telephone", note: "L'Union internationale des télécommunications est plus ancienne que le téléphone : fondée pour le télégraphe à Paris, le 17 mai 1865, elle précède de près de onze ans le brevet de Graham Bell." },
```

Sources :
- https://www.itu.int/en/history/Pages/ITUsHistory.aspx : « On 17 May 1865, the first International Telegraph
  Convention was signed in Paris by its twenty founding members, and the International Telegraph Union (the first
  incarnation of ITU) was established ». Primaire (organisation).
- Téléphone : date d'`EVENEMENTS` (1876).

Contre-vérification : À CORRIGER (bloc corrigé). itu.int relu mot pour mot. Du 17 mai 1865 au brevet de Bell (1876,
délivré en mars) il y a moins de onze ans : « précède de onze ans » devient « précède de près de onze ans ».

### Sciences et techniques

#### 14. Frères Wright / Pôle Sud

```js
  // Royal Museums Greenwich et American Museum of Natural History : Amundsen au pôle Sud le 14 décembre 1911
  { a: "wright", b: "pole-sud", note: "On volait déjà en avion depuis près de huit ans quand Amundsen a atteint le pôle Sud, le 14 décembre 1911." },
```

Sources :
- https://www.rmg.co.uk/stories/topics/race-south-pole-scott-amundsen : « At around 3pm on 14 December 1911, Amundsen
  raised the flag of Norway at the South Pole. » Institutionnel (musée).
- https://www.amnh.org/explore/ology/earth/race-to-the-south-pole/to-the-pole-who-won : « On December 14, 1911, Amundsen
  claimed victory: the Norwegians were first at the South Pole. » Institutionnel (musée).
- Wright : date d'`EVENEMENTS` (17 décembre 1903).

Contre-vérification : À CORRIGER (bloc corrigé). RMG et AMNH relus mot pour mot (deux musées indépendants). Du
17 décembre 1903 au 14 décembre 1911 il y a 7 ans et 362 jours : « depuis huit ans » devient « depuis près de huit ans ».

#### 15. Premiers pas sur la Lune / ARPANET

```js
  // NASA (NSSDC) : premier pas le 21 juillet 1969 à 2 h 56 TU ; Leonard Kleinrock (UCLA) : premier message ARPANET le 29 octobre 1969
  { a: "lune", b: "arpanet", note: "Même année : on a marché sur la Lune en juillet 1969, trois mois avant le premier message envoyé sur ARPANET, l'ancêtre d'Internet, le 29 octobre." },
```

Sources :
- https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C : « Armstrong stepped onto the lunar surface at
  02:56:15 UT on 21 July (10:56:15 p.m. July 20 EDT) ». Primaire.
- https://www.lk.cs.ucla.edu/internet_first_words.html : « Below is a record of the first message ever sent over the
  ARPANET. It took place at 22:30 hours on October 29, 1969. This record is an excerpt from the "IMP Log" that was kept
  at UCLA. » Primaire (page du chercheur, avec le registre).
- Nécessite le champ `date` sur `lune` (section A).

Contre-vérification : VALIDÉ. NSSDC et page de L. Kleinrock relues mot pour mot. Source indépendante lue : NPR,
29 octobre 2009 (npr.org/2009/10/29/114280698/lo-and-behold-a-communication-revolution) : « 40 years ago Thursday, the
first communication over a computer network called ARPANET was sent — a message that said simply "lo." ». Kleinrock
(icann.org, 2019) écrit lui-même : « First a human being set foot on the moon, then three months later a simple message
between two computers ». « Trois mois » exact quel que soit le jour retenu pour la Lune (20 ou 21 juillet).

### Culture

#### 16. Tintin / Martin Luther King

```js
  // Encyclopædia Universalis et Office allemand des brevets (DPMA) : premier épisode de Tintin le 10 janvier 1929
  { a: "tintin", b: "mlk", note: "Tintin est plus âgé que Martin Luther King : il est apparu le 10 janvier 1929 dans « Le Petit Vingtième », cinq jours avant la naissance du pasteur." },
```

Sources :
- https://www.universalis.fr/encyclopedie/tintin-reperes-chronologiques/ : « 10 janvier 1929 Début de la publication de
  Tintin au pays des Soviets sous la forme de feuilleton dans Le Petit Vingtième, supplément hebdomadaire pour la
  jeunesse du quotidien bruxellois Le XXe Siècle. » Encyclopédie savante.
- https://www.dpma.de/en/explore/milestones/comic-ip/tintin : « On January 10, 1929, the magazine "Le Petit Vingtième"
  published the first episode of "Tintin" ». Institutionnel.
- MLK : date d'`EVENEMENTS` (15 janvier 1929).

Contre-vérification : VALIDÉ. Universalis et DPMA relus mot pour mot. Sources indépendantes lues : La Libre Belgique,
10 janvier 2019 (« C'est le 10 janvier 1929 que les lecteurs du magazine Le Petit Vingtième font connaissance pour la
première fois avec Tintin ») ; Fondation Nobel pour MLK (voir paire 10). Écart de cinq jours, les deux dates confirmées.

#### 17. Sherlock Holmes / Jack l'Éventreur

```js
  // Grolier Club : « Beeton's Christmas Annual » de 1887 paru en novembre ; Archives nationales britanniques : meurtres de l'automne 1888
  { a: "sherlock", b: "eventreur", note: "Sherlock Holmes est plus ancien que Jack l'Éventreur : sa première enquête a paru en novembre 1887, un an avant les meurtres de Whitechapel, à l'automne 1888." },
```

Sources :
- https://grolierclub.omeka.net/exhibits/show/sherlock-holmes/a-study-in-scarlet : « Beeton's Christmas Annual for 1887
  appeared in November of that year and sold out before Christmas. » Institutionnel (exposition du Grolier Club).
- https://www.arthur-conan-doyle.com/index.php/A_Study_in_Scarlet : « A Study in Scarlet (STUD) is the first Sherlock
  Holmes novel written by Arthur Conan Doyle first published in the Beeton's Christmas Annual in 1887. » Encyclopédie
  spécialisée.
- https://www.nationalarchives.gov.uk/explore-the-collection/stories/hoax-letter-signed-by-jack-the-ripper/ : « In the
  autumn of 1888 a series of brutal murders was committed by a serial killer in the Whitechapel area of east London. »
  Institutionnel.
- https://www.londonmuseum.org.uk/collections/london-stories/jack-ripper/ : « In the autumn of 1888, a serial killer
  murdered five women in Whitechapel in the East End of London. » Institutionnel (musée).

Contre-vérification : VALIDÉ. Grolier Club, arthur-conan-doyle.com (qui date aussi le numéro : « 21 november 1887 »),
Archives nationales et London Museum relus mot pour mot. Les deux événements restent sans `date` (années distinctes).

### Sport

#### 18. Tour de France / FIFA

```js
  // FIFA (inside.fifa.com) : FIFA fondée en 1904 au 229, rue Saint-Honoré, à Paris ; premier Tour de France en juillet 1903
  { a: "tour-de-france", b: "fifa", note: "Le Tour de France est plus ancien que la FIFA : il est parti en juillet 1903, la fédération internationale de football a été fondée à Paris en 1904." },
```

Sources :
- https://inside.fifa.com/fr/about-fifa/organisation/media-releases/la-fifa-celebre-le120e-anniversaire-de-sa-creation-a-paris :
  communiqué daté du « mardi 21 mai 2024 » : « une plaque commémorative non loin de la modeste pièce à l'arrière du
  bâtiment au 229, rue Saint Honoré, dans le 1er arrondissement de Paris où la FIFA a été créée » et « le document rédigé
  par les membres fondateurs en 1904 ». Primaire (organisation).
- Britannica : refusée (403) ; extrait de moteur de recherche concordant (« founded FIFA in Paris in 1904 »).
- Tour de France : date d'`EVENEMENTS` (1er juillet 1903).

Contre-vérification : VALIDÉ. Communiqué FIFA relu (« le samedi 21 mai 1904 », « 229, rue Saint Honoré »). Britannica
toujours refusée ; remplacée par le musée de la FIFA (editorial.fifamuseum.com/en/read/1904-the-foundation-of-fifa/), lu :
« The foundation of the Fédération Internationale de Football Association took place on 21 May 1904 at 229 rue
Saint-Honoré ». Tour de France relu : Hérodote (herodote.net/1er_19_juillet_1903-evenement-19030719.php) : « Les 60
concurrents officiels partent le 1er juillet suivant de Montgeron ». Facultatif : `fifa` peut recevoir `date: "1904-05-21"`.

#### 19. Sheffield FC / Darwin

```js
  // Fédération anglaise de football (thefa.com) et Sheffield FC : premier club fondé en 1857
  { a: "sheffield", b: "darwin", note: "Le plus ancien club de football encore en activité, le Sheffield FC, a été fondé en 1857, deux ans avant la publication de « L'Origine des espèces »." },
```

Sources :
- https://www.thefa.com/competitions/uefa-womens-euro-2022/heritage/sheffield-heritage : « the first football club –
  Sheffield FC – was formed there in 1857. » Institutionnel (fédération).
- https://www.sheffieldfc.com/ : « Sheffield FC | The World's First Football Club | Est. 1857 ». Primaire (club).
- Darwin : date d'`EVENEMENTS` (1859).
- Point d'attention : « plus ancien club de football » s'entend du football association ; un club de rugby de Dublin
  (1854) est plus ancien. Le nom de l'événement dit « football » au sens de la FIFA ; préciser « de football (soccer) »
  dans la version anglaise.

Contre-vérification : VALIDÉ. thefa.com et sheffieldfc.com relus. Source indépendante lue : FIFA, 3 novembre 2019
(inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/qatar-2022-legacy-project-kicks-off-link-up-with-leeds-united-and-sheffield-fc) :
« Sheffield FC – the oldest club in world football – will celebrated their 162nd anniversary on 24 October » (soit le
24 octobre 1857). La précision « encore en activité » et la réserve sur le rugby (Dublin, 1854) suffisent.

### Santé

#### 20. Apple / Éradication de la variole

```js
  // OMS : dernier cas naturel en Somalie en 1977, éradication déclarée en 1980 ; Computer History Museum : Apple fondée en 1976
  { a: "apple", b: "variole", note: "Apple existait déjà quand la variole circulait encore : l'entreprise est fondée en 1976, le dernier cas naturel connu date de 1977 et l'OMS a déclaré la maladie éradiquée en 1980." },
```

Sources :
- https://www.who.int/health-topics/smallpox : « The last known natural case was in Somalia in 1977. In 1980 WHO
  declared smallpox eradicated – the only infectious disease to achieve this distinction. » Institutionnel.
- Apple : date d'`EVENEMENTS` (1976, Computer History Museum, cité dans `jeux-donnees.js`).

Contre-vérification : VALIDÉ. OMS relue mot pour mot. Source indépendante lue : CDC (cdc.gov/smallpox/about/history.html) :
dernier cas naturel, Ali Maow Maalin, Merca (Somalie), octobre 1977 ; « the 33rd World Health Assembly declared the world
free of this disease on May 8, 1980 ». Apple (1976) : date d'`EVENEMENTS`, écart non serré.

---

## Écartés

- **Harry Potter / rétrocession de Hong Kong (1997)** : Hong Kong rétrocédée le 1er juillet 1997 (gov.hk : « On 1 July
  1997, Hong Kong became a Special Administrative Region of the People's Republic of China »), mais la date de parution
  du premier Harry Potter varie : 26 juin 1997 (Sotheby's, Wikipédia) ou 1er juillet 1997 (HP Lexicon, première
  impression britannique). Écart de cinq jours, ou nul : paire écartée.
- **Mort de Shakespeare / mort de Cervantes (1616)** : envisagée, non retenue : les deux dates relèvent de calendriers
  différents (julien en Angleterre, grégorien en Espagne), ce qui rend l'ordre discutable.
- **Mort de Galilée / naissance de Newton (1642)** : même problème de calendrier (25 décembre 1642 julien, 4 janvier
  1643 grégorien).
- **Norvège : 7 juin ou 26 octobre 1905** : non écartée (paire 2), mais la date retenue est celle du Storting ; la
  reconnaissance suédoise est du 26 octobre.

## Points à relire

Contre-vérification : les points ci-dessous sont traités sous chaque élément (voir le bilan en tête).

- Pages lues seulement par extraits de moteur de recherche, en appui d'une source lue : Parlement australien (aph.gov.au),
  vaticanstate.va, Britannica (Meiji, FIFA), FIFA 1930, Vikidia et Hérodote (Belgique).
- Dates reprises d'`EVENEMENTS` sans nouvelle lecture : tour Eiffel, MLK, Wright, Tour de France, téléphone, Darwin,
  Apple, Coupe du monde 1930.
- `mlk`, `eiffel` et `metro-londres` apparaîtraient chacun dans deux paires nouvelles ; `mlk` dans trois au total.
