# Propositions 2 : 20 nouvelles paires pour « Avant ou après »

> **Bilan de la contre-vérification (agent `verificateur-sources`, 23 novembre 2026)** : 22 éléments examinés
> (section A, bloc d'événements B, 20 paires). **17 validés** (A ; paires 2, 3, 4, 6, 8, 9, 10, 12 à 20),
> **4 à corriger** (bloc B ; paires 1, 5, 7 : corrections reportées dans les blocs de code), **1 rejeté**
> (paire 11, Machu Picchu, déplacée dans « Écartés » ; l'événement `machu-picchu` est retiré du bloc B).
> Contrôle par script (`EVENEMENTS` et `PAIRES_CELEBRES` actuels + ajouts, `neptune` daté) : ids uniques, champs
> connus, chaque `date` commence par son `annee`, aucune date en double, les 65 paires existantes et les nouvelles
> gardent un ordre strict (`momentEvenement`), et sur les 2 476 paires admissibles au tirage au hasard (après retrait
> de `machu-picchu`) aucune n'a deux moments égaux. Seule remarque hors lot : la paire existante `wright`/`tour-de-france`
> a `a` plus récent que `b` (convention non suivie, sans effet sur la réponse). Fréquence : `wright` et `tour-de-france` entreraient chacun dans 3 paires célèbres
> (signalé, non bloquant). Aucun doublon avec `VRAI_FAUX`, `grand-test-donnees.js` ni les paires existantes.

Rédigé le 22 novembre 2026. Rien n'est modifié dans `static/` : ce fichier est une proposition, à faire
contre-vérifier par l'agent `verificateur-sources` avant tout collage.

Mode de lecture : pages téléchargées avec `curl -sL` puis lues en texte brut ; PDF lus en texte avec PDFKit (macOS).
WebFetch a servi pour quelques pages (Guinness World Records). Les citations ci-dessous sont copiées des pages
téléchargées. Wikipédia et Vikidia n'ont servi qu'à trouver des pistes, jamais comme source.

Convention reprise du lot 1 : `a` est l'événement le plus ancien. Lors du collage, ajouter `depuis:` (numéro du jour
de première apparition, le lendemain de la publication), comme l'exige `CLAUDE.md`, puis mettre à jour
`tests/rotation-manifeste.json`.

Événements à éviter (consigne) : `eiffel`, `mlk`, `lune`, `metro-londres`, `telephone`, `harvard` : aucun n'est utilisé.
Doublons : aucune des 20 paires n'existe dans `PAIRES_CELEBRES` (vérifié sur les 65 paires actuelles), et aucun des
faits retenus n'est déjà raconté par `VRAI_FAUX` ou `grand-test-donnees.js` (deux idées écartées pour cette raison,
voir « Écartés »).

Répartition : 12 paires de géopolitique et d'histoire des États (Afrique 2, Amérique latine 3, Moyen-Orient 1,
Océanie 2, Asie 3, empire colonial 1 ; dont 1 traité et 3 indépendances), 8 de sciences, arts, sport et inventions
du quotidien.

---

## A. Modifications proposées d'événements existants

Une paire de même année (n° 17, Neptune / anesthésie) exige une date précise sur les deux événements
(`tirerPairesChronologie` et `momentEvenement` s'en servent). Ce champ `date` est à ajouter :

```js
  { id: "neptune", nom: "Découverte de la planète Neptune", annee: 1846, date: "1846-09-23" },
```

- Source : NASA, « 175 Years Ago: Astronomers Discover Neptune, the Eighth Planet » (John Uri, 22 septembre 2021),
  https://www.nasa.gov/history/175-years-ago-astronomers-discover-neptune-the-eighth-planet : « On the night of
  Sept. 23-24, 1846, astronomers discovered Neptune » ; « on the night of Sept. 23-24, 1846, astronomer Johann
  Gottfried Galle used the Fraunhofer telescope at the Berlin Observatory and made the first observations of the new
  planet ». Institutionnel.
- La découverte a eu lieu dans la nuit du 23 au 24 septembre : la date retenue est celle du début de la nuit.
  `dateEvenement` affichera « 23 septembre 1846 ».
- Effet sur l'existant : la seule paire avec `neptune` (`fax`/`neptune`, 1843/1846) garde son ordre. Le tirage au
  hasard pourra désormais opposer `neptune` à `anesthesie` (1846, toutes deux datées) : ordre juste.

Contre-vérification : VALIDÉ. Citation NASA relue mot pour mot. Source indépendante : American Physical Society,
APS News, « September 23, 1846: Neptune's Existence Observationally Confirmed » (1er août 2020),
https://www.aps.org/apsnews/2020/08/neptunes-existence-confirmed. Script : la paire `fax`/`neptune` garde son ordre,
aucune autre paire existante ne change, aucune égalité de moment dans le tirage au hasard.

---

## B. Nouveaux événements à ajouter à `EVENEMENTS` (à insérer à leur place chronologique)

```js
  { id: "locomotive", nom: "Premier trajet d'une locomotive à vapeur sur rails (Trevithick, pays de Galles)", annee: 1804, date: "1804-02-21" },
  { id: "draisienne", nom: "Première sortie de la draisienne, ancêtre du vélo (Karl Drais)", annee: 1817, date: "1817-06-12" },
  { id: "neuvieme", nom: "Création de la Neuvième Symphonie de Beethoven, à Vienne", annee: 1824, date: "1824-05-07" },
  { id: "mexique-esclavage", sujet: "esclavage", nom: "Décret d'abolition de l'esclavage au Mexique", annee: 1829, date: "1829-09-15" },
  { id: "waitangi", nom: "Signature du traité de Waitangi entre la Couronne britannique et des chefs maoris (Nouvelle-Zélande)", annee: 1840, date: "1840-02-06" },
  { id: "penny-black", nom: "Premier timbre-poste, le Penny Black, valable au Royaume-Uni", annee: 1840, date: "1840-05-06" },
  { id: "anesthesie", nom: "Première démonstration publique d'une opération sous anesthésie (éther, Boston)", annee: 1846, date: "1846-10-16" },
  { id: "liberia", nom: "Proclamation de l'indépendance du Liberia", annee: 1847, date: "1847-07-26" },
  { id: "feu-circulation", nom: "Premier feu de circulation, à Londres", annee: 1868 },
  { id: "basket", nom: "Invention du basket-ball (James Naismith, Springfield)", annee: 1891 },
  { id: "hawaii-royaume", nom: "Renversement de la reine Liliʻuokalani, dernière souveraine du royaume d'Hawaï", annee: 1893, date: "1893-01-17" },
  { id: "panama", nom: "Le Panama se sépare de la Colombie et proclame son indépendance", annee: 1903, date: "1903-11-03" },
  { id: "congo-belge", nom: "La Belgique annexe l'État indépendant du Congo, dont le roi Léopold II était le souverain", annee: 1908, date: "1908-11-15" },
  { id: "monet", nom: "Mort de Claude Monet", annee: 1926, date: "1926-12-05" },
  { id: "mickey", nom: "Sortie de « Steamboat Willie », premier dessin animé de Mickey sorti en salle", annee: 1928, date: "1928-11-18" },
  { id: "barbie", nom: "Présentation de la première poupée Barbie, à New York", annee: 1959, date: "1959-03-09" },
  { id: "brasilia", nom: "Inauguration de Brasília, nouvelle capitale du Brésil", annee: 1960, date: "1960-04-21" },
  { id: "disney-world", nom: "Ouverture de Walt Disney World (Floride)", annee: 1971, date: "1971-10-01" },
  { id: "emirats", nom: "Proclamation des Émirats arabes unis", annee: 1971, date: "1971-12-02" },
  { id: "google", sujet: "internet", nom: "Création de l'entreprise Google", annee: 1998 },
  { id: "bhoutan-tv", nom: "Lancement de la télévision nationale au Bhoutan", annee: 1999, date: "1999-06-02" },
  { id: "macao", nom: "Rétrocession de Macao par le Portugal à la Chine", annee: 1999, date: "1999-12-20" },
  { id: "nepal", nom: "Abolition de la monarchie au Népal, qui devient une république", annee: 2008, date: "2008-05-28" },
```

Remarques :
- 24 ids nouveaux, absents des 144 ids actuels d'`EVENEMENTS` (vérifié par `grep`). `hawaii-royaume` (1893) et
  `hawaii` (1959) restent distincts. Champs connus seulement (`id`, `nom`, `annee`, `date`, `sujet`, `vers`) ; chaque
  `date` commence par son `annee`.
- Mêmes années, toutes datées : `locomotive` avec `sacre` et `haiti` (1804) ; `neuvieme` avec `megalosaure` (1824) ;
  `waitangi` et `penny-black` (1840) ; `anesthesie` et `neptune` (1846, après la section A) ; `panama` avec `wright` et
  `tour-de-france` (1903) ; `monet` avec `elizabeth` (1926) ; `barbie` avec `hawaii` (1959) ; `disney-world` et
  `emirats` avec `suisse-vote` (1971) ; `bhoutan-tv` et `macao` (1999). Toutes les dates sont distinctes.
- Mêmes années sans date de l'un des deux (le tirage au hasard les refuse, ce qui est voulu) : `feu-circulation`
  et `meiji` (1868) ; `hawaii-royaume` et `nouvelle-zelande` (1893) ; `mickey` et `penicilline` (1928).
- Sans `date` volontairement : `feu-circulation` (9 ou 10 décembre 1868 selon les sources), `basket` (règles écrites
  en décembre 1891, jour non établi), `google` (« August 1998 » selon Google, incorporation souvent datée du
  4 septembre 1998), `machu-picchu` (`vers`).
- `sujet` : `mexique-esclavage` rejoint `esclavage` et `google` rejoint `internet`, pour ne pas être tirés au hasard
  contre un événement de la même famille.
- Ces 24 noms sont des textes nouveaux : passer `tests/en/extraire.py --manquants`, `ajouter.py`, `controle.py`.
  Écrire « Liliʻuokalani » avec l'ʻokina (U+02BB), graphie de l'État d'Hawaï ; « Liliuokalani » sans signe si le
  banc de typographie le refuse.

Contre-vérification : À CORRIGER. (1) `machu-picchu` retiré du bloc (paire 11 rejetée) : il reste 23 événements.
(2) Nom de `congo-belge` : « possession du roi Léopold II » remplacé par « dont le roi Léopold II était le souverain »
(Office of the Historian, https://history.state.gov/countries/congo-free-state : « King Leopold of Belgium in his
capacity as sovereign ruler of the Independent State of the Congo » ; « annexed as a colony by Belgium on November
15, 1908 »). Le reste est conforme, vérifié par script : 23 ids nouveaux et uniques, champs connus, dates valides et
distinctes, chaque année partagée avec un événement daté est datée des deux côtés (1804, 1824, 1840, 1846, 1903,
1926, 1959, 1971, 1999) ; `feu-circulation`/`meiji` (1868), `hawaii-royaume`/`nouvelle-zelande` (1893) et
`mickey`/`penicilline` (1928) sont refusés par le tirage au hasard, comme voulu.

---

## C. Les 20 paires

### Géopolitique et histoire des États

#### 1. Liberia / Abolition de l'esclavage dans les colonies françaises

```js
  // Bibliothèque du Congrès (blogs.loc.gov) : indépendance du Liberia le 26 juillet 1847 ; Office of the Historian (département d'État) : 1847
  { a: "liberia", b: "esclavage-france", note: "Le Liberia, fondé par d'anciens esclaves et des Noirs nés libres venus des États-Unis, a proclamé son indépendance le 26 juillet 1847 : la France n'a aboli définitivement l'esclavage dans ses colonies que l'année suivante, en 1848." },
```

Sources :
- https://blogs.loc.gov/international-collections/2016/07/liberia-africa-oldest-independent-and-democratic-republic-celebrates-its-169th-independence-anniversary/ :
  « On July 26, 1847 (twenty five years after the first successful colonization), the Americo-Liberians declared the
  independence of the Republic of Liberia. » Institutionnel (Bibliothèque du Congrès).
- https://history.state.gov/milestones/1830-1860/liberia : « in 1847, Liberia declared independence from the American
  Colonization Society in order to establish a sovereign state and create its own laws governing commerce. »
  Institutionnel (département d'État ; série « Milestones » archivée).
- Abolition française : date d'`EVENEMENTS` (1848), écart non serré.

Note : la colonie a été fondée par l'American Colonization Society pour installer des Noirs libres et d'anciens
esclaves américains (même page du département d'État) ; « fondé par d'anciens esclaves » simplifie : à relire.

Contre-vérification : À CORRIGER. « fondé par d'anciens esclaves » devient « fondé par d'anciens esclaves et des Noirs
nés libres venus des États-Unis » (correction reportée dans le bloc), formule de la Bibliothèque du Congrès (page
citée, relue) : « its founding in 1822 by former slaves and free-born Blacks from the United States under the
sponsorship of the American Colonization Society ». Date relue sur les deux pages citées. Sources indépendantes :
South African History Online, « Liberia is established » (https://sahistory.org.za/node/10971 : « On 26 July 1847
the Liberian Declaration of Independence was signed ») et Teachers College, Columbia University
(https://library.tc.columbia.edu/blog/content/2024/july/today-in-history-liberia-becomes-africas-first-republic.php).

#### 2. Tour de France / Indépendance du Panama

```js
  // Département d'État (Foreign Relations of the United States, 1903, doc. 229) : soulèvement de Panama le 3 novembre 1903
  { a: "tour-de-france", b: "panama", note: "Le Tour de France est plus ancien que le Panama : la course est partie le 1er juillet 1903, et le Panama ne s'est séparé de la Colombie que le 3 novembre 1903." },
```

Sources :
- https://history.state.gov/historicaldocuments/frus1903/d229 : télégramme de M. Ehrman à M. Hay, « Panama, November 3,
  1903. (Received 9.50 p.m.) Uprising occurred to-night, 6; no bloodshed. Army and navy officials taken prisoners.
  Government will be organized to-night ». Primaire (correspondance diplomatique publiée par le département d'État).
- https://history.state.gov/historicaldocuments/frus1903/d228 : même jour, quelques heures plus tôt : « Panama, November
  3, 1903. (Received 8.15 p.m.) No uprising yet. »
- Tour de France : date d'`EVENEMENTS` (1er juillet 1903), relue au lot 1 (Hérodote).

Écart : quatre mois. La Colombie n'a reconnu le Panama qu'en 1909 (point non lu sur source primaire, non affiché).

Contre-vérification : VALIDÉ. Télégramme relu (« Uprising occurred to-night »). Source indépendante : Office of the
Historian, « Building the Panama Canal, 1903–1914 » (https://history.state.gov/milestones/1899-1913/panama-canal :
« Panama declared independence on November 3, 1903 »). Signalé : `tour-de-france` entrerait dans 3 paires célèbres
(`wright`, `fifa`, `panama`).

#### 3. Tennis for Two / Brasília

```js
  // Sénat fédéral du Brésil (senado.leg.br) : Brasília inaugurée le 21 avril 1960 ; Laboratoire de Brookhaven : « Tennis for Two » le 18 octobre 1958
  { a: "tennis", b: "brasilia", note: "Brasília, la capitale du Brésil, est plus jeune que l'un des premiers jeux vidéo : « Tennis for Two » a été présenté en octobre 1958, la ville a été inaugurée le 21 avril 1960." },
```

Sources :
- https://www12.senado.leg.br/noticias/infomaterias/2020/05/brasilia-60-anos-2014-a-festa-de-inauguracao : « Ao inaugurar
  a sonhada nova capital do Brasil, em 21 de abril de 1960, o presidente Juscelino Kubitschek […] ». Institutionnel
  (Agência Senado).
- « Tennis for Two » : date d'`EVENEMENTS` (Brookhaven, déjà citée en commentaire dans `jeux-donnees.js`).

Écart : un an et demi. « l'un des premiers jeux vidéo » reprend le nom de l'événement.

Contre-vérification : VALIDÉ. Agência Senado relue. Source indépendante : Domus, « Brasilia celebrates its 60th
anniversary » (https://domusweb.it/en/speciali/brasilia/2020/brasilia-today-we-celebrate-its-60th-anniversary.html :
« On April 21, 1960 the new federal capital of Brazil was inaugurated »).

#### 4. Walt Disney World / Émirats arabes unis

```js
  // Ministère émirien des Affaires étrangères (mofa.gov.ae) : proclamation le 2 décembre 1971 ; Walt Disney Archives (d23.com) : ouverture le 1er octobre 1971
  { a: "disney-world", b: "emirats", note: "Les Émirats arabes unis sont plus jeunes que Walt Disney World : le parc de Floride a ouvert le 1er octobre 1971, la fédération a été proclamée le 2 décembre 1971." },
```

Sources :
- https://www.mofa.gov.ae/en/Missions/Panama-City/The-UAE/History : « The Rulers of the six Trucial States, Abu Dhabi,
  Dubai, Sharjah, Ajman, Umm Al Quwain and Fujairah, decided to form the United Arab Emirates in a meeting held in
  Dubai on July 18, 1971. The foundation of an independent, sovereign state was formally proclaimed on December 2,
  1971. A few months later, February 10, 1972, Ras Al Khaimah eventually joined the federation. » Primaire (État).
- https://d23.com/this-day/walt-disney-world-resort-opens/ : « Walt Disney World Resort Opens October 1, 1971 » ;
  « it's common knowledge that Walt Disney World Resort opened on this day in 1971, featuring the Magic Kingdom, two
  hotels […] ». Primaire (Walt Disney Archives).

Écart : deux mois. Seul piège : la décision de principe date du 18 juillet 1971, avant Disney World ; la note parle
de la proclamation, ce qui est exact. Le septième émirat a rejoint la fédération en février 1972.

Contre-vérification : VALIDÉ. Les deux citations relues. Sources indépendantes : HISTORY.com, « The United Arab
Emirates is formed » (« On December 2, 1971, the United Arab Emirates is formed ») ; National Park Service
(https://www.nps.gov/features/shen/2019/ccc/lesson-1/timeline/1971-2.html : « Magic Kingdom opened as the first part
of the Walt Disney World Resort on October 1, 1971 »).

#### 5. Traité de Waitangi / Penny Black

```js
  // Tribunal de Waitangi (waitangitribunal.govt.nz) : traité signé le 6 février 1840 ; The Postal Museum (Londres) : Penny Black valable le 6 mai 1840
  { a: "waitangi", b: "penny-black", note: "Le traité de Waitangi, entre la Couronne britannique et des chefs maoris, a été signé le 6 février 1840 ; le premier timbre-poste, le Penny Black, n'a été valable au Royaume-Uni que trois mois plus tard, le 6 mai 1840." },
```

Sources :
- https://www.waitangitribunal.govt.nz/en/about/the-treaty : « On 6 February 1840, te Tiriti o Waitangi was signed at
  Waitangi in the Bay of Islands by Captain William Hobson, several English residents, and between 43 and 46 Māori
  rangatira. » Institutionnel (tribunal néo-zélandais).
- https://www.postalmuseum.org/wp-content/uploads/2017/02/2-The-Penny-Black-Stamp.pdf (fiche pédagogique du Postal
  Museum, © Royal Mail Group) : « The Penny Black stamp became official postage on 6 May 1840. » Institutionnel.
- https://www.guinnessworldrecords.com/world-records/562001-first-postage-stamp (lu avec WebFetch) : « which was put on
  sale in major post offices in the UK on 1 May 1840 » ; « the stamps were not valid for use until 6 May 1840 ».

Écart : trois mois (le timbre était en vente dès le 1er mai : l'ordre ne change pas). « Acte fondateur » : formule
d'usage en Nouvelle-Zélande ; le vérificateur peut préférer « traité signé entre la Couronne britannique et des chefs
maoris ».

Contre-vérification : À CORRIGER. « acte fondateur de la Nouvelle-Zélande », formule d'interprétation, devient « entre
la Couronne britannique et des chefs maoris » (factuel, conforme au nom de l'événement ; correction reportée dans le
bloc). Dates relues (tribunal de Waitangi, fiche du Postal Museum, Guinness World Records). Sources indépendantes :
ministère néo-zélandais du Développement social (https://www.tehaorangahau.msd.govt.nz/chronology/1835-1899/list/4 :
« Te Tiriti o Waitangi is signed on 6 February 1840 at Waitangi, in the Bay of Islands ») ; Guinness World Records
(« the stamps were not valid for use until 6 May 1840 »).

#### 6. Statue de la Liberté / Fin du royaume d'Hawaï

```js
  // Service des parcs nationaux (nps.gov) : statue inaugurée le 28 octobre 1886 ; Congrès des États-Unis, résolution d'excuses (Public Law 103-150, 1993) : monarchie renversée le 17 janvier 1893
  { a: "liberte", b: "hawaii-royaume", note: "Hawaï était encore un royaume indépendant quand la statue de la Liberté a été inaugurée, en 1886 : sa reine a été renversée le 17 janvier 1893 par un comité soutenu par des militaires américains." },
```

Sources :
- https://www.govinfo.gov/content/pkg/STATUTE-107/pdf/STATUTE-107-Pg1510.pdf (Public Law 103-150, résolution d'excuses du
  Congrès, 1993) : « Whereas, from 1826 until 1893, the United States recognized the independence of the Kingdom of
  Hawaii » ; « Whereas, on the afternoon of January 17, 1893, a Committee of Safety that represented the American and
  European sugar planters, descendents of missionaries, and financiers deposed the Hawaiian monarchy and proclaimed
  the establishment of a Provisional Government » ; la loi date aussi du 16 janvier 1893 le débarquement de « armed naval forces of the United States ». Primaire (loi fédérale).
- https://www.nps.gov/stli/index.htm : « It was dedicated by President Grover Cleveland on October 28, 1886. »
  Institutionnel.

Écart : plus de six ans. « soutenu par des militaires américains » : la loi parle de « armed naval forces of the
United States » débarquées le 16 janvier 1893 ; formulation à garder sobre.

Contre-vérification : VALIDÉ. Loi 103-150 et page du NPS relues. Source indépendante : ABA Journal, « Jan. 17, 1893:
Hawaii's monarchy ends » (https://www.abajournal.com/magazine/article/jan._17_1893_hawaiis_monarchy_ends : « on Jan. 16,
Marines from the USS Boston landed in Honolulu. One day later, Queen Lili'uokalani was deposed »). « soutenu par des
militaires américains » reste dans les termes reconnus par le Congrès lui-même.

#### 7. Frères Wright / Congo belge

```js
  // Archives générales du Royaume de Belgique (agatha.arch.be), repères chronologiques : transfert effectif de souveraineté le 15 novembre 1908
  { a: "wright", b: "congo-belge", note: "Le Congo n'était pas encore une colonie belge quand les frères Wright ont volé, en 1903 : c'était un État dont le roi des Belges Léopold II était le souverain, et la Belgique ne l'a annexé que le 15 novembre 1908." },
```

Sources :
- https://agatha.arch.be/data/ead/BE-A0545_721454_802478/annexes/Annexe7.pdf (Archives générales du Royaume, inventaire,
  « G. Repères chronologiques ») : « 18 octobre 1908 Institution de la « Charte coloniale » » ; « 28 octobre 1908 Loi
  réalisant le transfert à la Belgique de l'État indépendant du Congo » ; « 15 novembre 1908 Transfert effectif de
  souveraineté entre l'ÉIC et la Belgique et création du Ministère des Colonies ». Primaire (archives d'État).
- Le même document date de 1885 l'autorisation donnée par les Chambres à Léopold II de devenir chef de l'État
  indépendant du Congo.
- Wright : date d'`EVENEMENTS` (17 décembre 1903).

Écart : près de cinq ans. « Possession personnelle » : l'État indépendant du Congo était un État dont Léopold II était
le souverain à titre personnel ; à garder, ou dire « État dont le roi des Belges était le souverain personnel ».

Contre-vérification : À CORRIGER. « possession personnelle » est juridiquement inexact (l'État indépendant du Congo
était un État souverain, dont Léopold II était le chef) : note réécrite dans le bloc. Repères chronologiques des
Archives générales du Royaume relus (15 novembre 1908 : « Transfert effectif de souveraineté entre l'ÉIC et la
Belgique » ; 1885 : « Autorisation donnée par les Chambres à Léopold II de devenir le chef d'état »). Source
indépendante : Office of the Historian (https://history.state.gov/countries/congo-free-state : « sovereign ruler of the
Independent State of the Congo » ; « annexed as a colony by Belgium on November 15, 1908 »). Signalé : `wright`
entrerait dans 3 paires célèbres (`tour-de-france`, `pole-sud`, `congo-belge`).

#### 8. Premier site web / Télévision au Bhoutan

```js
  // Bhutan Broadcasting Service, rapport annuel 2019 : télévision lancée le 2 juin 1999
  { a: "web", b: "bhoutan-tv", note: "Le web existait depuis huit ans quand le Bhoutan a lancé sa télévision nationale, le 2 juin 1999." },
```

Sources :
- https://bbs.bt/news/wp-content/uploads/2020/05/Annual-report-2019-pdf.pdf (Bhutan Broadcasting Service, rapport annuel
  2019) : « BBS Television service was launched on 2nd June 1999, coinciding with the Silver Jubilee celebration of the
  reign of His Majesty the 4th King. » Primaire (diffuseur public).
- Web : date d'`EVENEMENTS` (1991).

Écart : huit ans. Une diffusion d'essai de la Coupe du monde 1998 est signalée par des pages secondaires non
vérifiées : la note parle donc du lancement du service national, pas de la « première image ». L'interdiction
antérieure de la télévision, souvent citée, n'est pas affirmée faute de source lue.

Contre-vérification : VALIDÉ. Rapport annuel de BBS relu. Source indépendante : Deseret News (dépêche du 31 mai 1999,
https://www.deseret.com/1999/5/31/19448463/king-of-bhutan-giving-people-tv-internet-for-silver-jubilee/ : « On June 2,
when King Jigme completes 25 years as the ruler of Bhutan, […] television » annoncée ce jour-là) ; page de BBS
https://www.bbs.bt/189505 (« BBS television was introduced on 2nd June in 1999 »).

#### 9. Premier iPhone / Fin de la monarchie népalaise

```js
  // NPR, 28 mai 2008, et The Irish Times, 29 mai 2008 : l'Assemblée constituante abolit la monarchie le 28 mai 2008
  { a: "iphone", b: "nepal", note: "Le Népal était encore un royaume quand le premier iPhone a été présenté, en 2007 : l'Assemblée constituante n'a aboli la monarchie que le 28 mai 2008." },
```

Sources (source primaire népalaise non trouvée ; deux médias de référence concordants) :
- https://www.npr.org/2008/05/28/90907263/vote-in-nepal-rejects-monarchy (28 mai 2008) : « A special Nepalese assembly
  voted Wednesday to formally abolish the country's 239-year-old monarchy and turn Nepal into a republic. » Le mercredi
  est le 28 mai 2008.
- https://www.irishtimes.com/news/new-era-dawns-for-nepal-as-republic-replaces-monarchy-1.1215698 (29 mai 2008) : « New era
  dawns for Nepal as republic replaces monarchy ».
- iPhone : date d'`EVENEMENTS` (2007).

Écart : près d'un an et demi. Le vote a eu lieu tard le 28 mai, heure de Katmandou : la date est sûre à la journée.

Contre-vérification : VALIDÉ. NPR et Irish Times relus (deux médias de référence, règle des sources secondaires
respectée). Troisième source concordante : Al Jazeera, « Nepal abolishes monarchy » (29 mai 2008,
https://www.aljazeera.com/news/2008/5/29/nepal-abolishes-monarchy : vote du mercredi, « 239 years of royal rule »).
Nuance vérifiée : le Parlement intérimaire avait voté en décembre 2007 le principe de la république, appliqué par
l'Assemblée constituante le 28 mai 2008 ; le Népal restait un royaume lors de la présentation de l'iPhone (2007) :
la note reste exacte.

#### 10. Google / Rétrocession de Macao

```js
  // Google (about.google, « Our story ») : Google Inc. née en août 1998 ; Annuaire officiel de Macao 2023 (gcs.gov.mo) : souveraineté chinoise le 20 décembre 1999
  { a: "google", b: "macao", note: "Macao était encore administré par le Portugal quand Google a été créé, en 1998 : le territoire n'a été rendu à la Chine que le 20 décembre 1999." },
```

Sources :
- https://about.google/company-info/our-story/ : « In August 1998, Sun co-founder Andy Bechtolsheim wrote Larry and Sergey
  a check for $100,000, and Google Inc. was officially born. » Primaire (entreprise).
- https://yearbook.gcs.gov.mo/yearbook_pdf/2023/myb2023ePA01CH23.pdf (Annuaire de Macao 2023, bureau de la communication
  du gouvernement de la RAS) : « the Joint Declaration, which stated that China would resume the exercise of sovereignty
  over Macao from 20 December 1999 onwards » ; « appointing Edmund Ho Hau Wah as the first Chief Executive of the Macao
  Special Administrative Region […] to assume office on 20 December 1999 ». Primaire (gouvernement).
- https://www.wipo.int/pressroom/en/prdocs/1999/wipo_upd_1999_80.html (OMPI, 21 décembre 1999) : « attended on December
  20, 1999 the handover ceremony of Macau from Portugal to the People's Republic of China ». Institutionnel.

Écart : plus d'un an (août ou septembre 1998 selon la définition de la création ; écart net dans les deux cas).

Contre-vérification : VALIDÉ. Les trois citations relues (Google, annuaire de Macao, OMPI ; l'OMPI est indépendante
du gouvernement de Macao). `google` sans date et `macao` en 1999 : écart d'un an, refusé par le tirage au hasard.

#### 12. Mexique / Abolition britannique

```js
  // Journal officiel de la Fédération (DOF, sidof.segob.gob.mx) et Commission nationale des droits de l'homme du Mexique : décret de Vicente Guerrero du 15 septembre 1829
  { a: "mexique-esclavage", b: "esclavage-britannique", note: "Le Mexique a décrété l'abolition de l'esclavage le 15 septembre 1829, près de cinq ans avant son entrée en vigueur dans les colonies britanniques, le 1er août 1834." },
```

Sources :
- https://sidof.segob.gob.mx/notas/docFuente/5749309 (Diario Oficial de la Federación, décret de 2024) : « el general
  Vicente Guerrero Rodríguez, el 15 de septiembre de 1829 (4), emitió el decreto en el que se declaró que " Queda
  abolida la esclavitud en la República " y " Son por consiguiente libres los que hasta hoy se hubieren considerado como
  esclavos " ». Primaire (État).
- https://www.cndh.org.mx/sites/default/files/documentos/2024-09/FRN_SEP_15-1.pdf (CNDH) : « Abolición de la esclavitud
  en México 15 de septiembre de 1829 » ; « Vicente Guerrero expidió el decreto mediante el cual declaró la abolición de
  la esclavitud en México ». Institutionnel.
- Abolition britannique : date d'`EVENEMENTS` (1er août 1834, Archives nationales britanniques).

Note : « a décrété » plutôt que « a aboli » : l'application du décret a connu des exceptions (le Texas, alors
mexicain, est souvent cité), que je n'ai pas lues sur source sérieuse. `sujet: "esclavage"` sur les deux événements :
pas de tirage au hasard entre eux, mais la paire célèbre reste proposée (le filtre de `sujet` ne s'applique qu'au
hasard).

Contre-vérification : VALIDÉ. DOF et CNDH relus (15 septembre 1829, décret de Guerrero). « a décrété » est exact et
neutre : la CNDH précise que le décret ne s'appliquait pas au Texas, alors mexicain (« solo en Texas […] no se aplicaba
dicho decreto »), et qu'une loi du 5 avril 1837 a aboli l'esclavage « sin excepciones » ; la note ne dit pas plus que
le décret. Source indépendante : JSTOR Daily, « Black Mexico and the War of Independence » (abolition formalisée en
1829 par décret du président Guerrero). Écart relu : 4 ans et 11 mois, « près de cinq ans » juste.

### Sciences et inventions

#### 13. Locomotive / Draisienne

```js
  // Amgueddfa Cymru – Musée national du pays de Galles : locomotive de Trevithick le 21 février 1804 ; deutschland.de : draisienne le 12 juin 1817
  { a: "locomotive", b: "draisienne", note: "La locomotive à vapeur est plus ancienne que le vélo : celle de Trevithick a roulé sur des rails le 21 février 1804, plus de treize ans avant la première sortie de la draisienne de Karl Drais, le 12 juin 1817." },
```

Sources :
- https://museum.wales/blog/2189/Birth-of-the-Railway-Locomotive/ : « The railway revolution began in Merthyr Tydfil on 21
  February 1804 with the first recorded steam-hauled journey on rails. The key personalities were the talented Cornish
  engineer Richard Trevithick and Samuel Homfray, owner of the Penydarren Iron Works. » Institutionnel (musée national).
- https://deutschland.de/en/topic/life/sports-leisure/the-bicycle-is-200-years-old (portail du gouvernement fédéral
  allemand) : « During his first journey on 12 June 1817, which took Drais from his house in Mannheim to the Schwetzingen
  stage house, he achieved an average speed of roughly 15 km/h. »
- https://beteiligungsportal.baden-wuerttemberg.de/fileadmin/redaktion/m-mvi/intern/Dateien/PDF/PM_Anhang/161021_Fahrrad_Jubilaeum_Geschichtlicher_Hintergrund.pdf
  (ministère des Transports du Bade-Wurtemberg) : « erfand der gebürtige Karlsruher Karl Drais (1785-1851) im Jahr 1817
  die „Draisine", auch Laufmaschine genannt und Ur-Form des heutige Fahrrads ».

Écart : 13 ans et 4 mois. « Ancêtre du vélo » : la draisienne n'a pas de pédales (même source).

Contre-vérification : VALIDÉ. Musée national du pays de Galles et deutschland.de relus. Sources indépendantes :
Guinness World Records, « First steam locomotive to run on rails » (« first ran on 21 February 1804 ») ; Ville de
Mannheim, dépliant « Drais » (https://www.mannheim.de/sites/default/files/page/220/drais_flyer_web.pdf : « am 12. Juni
1817 eine Fahrt von seinem Wohnhaus »).

#### 14. Neptune / Anesthésie

```js
  // NASA : Neptune observée dans la nuit du 23 au 24 septembre 1846 ; Linda Hall Library et PMC (Bigelow) : démonstration de l'éther le 16 octobre 1846
  { a: "neptune", b: "anesthesie", note: "Même année : Neptune a été découverte en septembre 1846, trois semaines avant la première opération publique sous anesthésie, le 16 octobre 1846 à Boston." },
```

Sources :
- Neptune : voir section A (NASA, « On the night of Sept. 23-24, 1846 »).
- https://www.lindahall.org/about/news/scientist-of-the-day/ether-dome : « On October 16, 1846, the first successful public
  demonstration of surgical anesthesia took place in the operating theater of Massachusetts General Hospital. »
  Institutionnel (bibliothèque scientifique).
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10431324 (article revu, sur Henry Jacob Bigelow) : « October 16, 1846,
  subsequently referred to as Ether Day, marked a new era in the surgical treatment of disease. On this momentous day,
  William Thomas Green Morton (1819–1868) conducted the first successful public demonstration of surgical anesthesia at
  Boston's Mass[achusetts General Hospital] ».

Écart : trois semaines. La Linda Hall Library rappelle que Crawford Long avait opéré sous éther dès 1842, sans le
publier : d'où « première opération publique », et non « première anesthésie ». Exige la section A.

Contre-vérification : VALIDÉ. Linda Hall Library et article de PMC relus (deux sources indépendantes l'une de l'autre,
dont un article revu) ; Neptune : NASA et APS (section A). Écart : 23 jours, « trois semaines » juste.

#### 15. Premier feu de circulation / Automobile

```js
  // Smithsonian Magazine et NBC News (2018) : feu installé devant le Parlement, à Londres, en décembre 1868 ; plaque de la Ville de Westminster : « 9th Dec. 1868 »
  { a: "feu-circulation", b: "automobile", note: "Le feu de circulation est plus ancien que l'automobile : le premier a été installé à Londres en décembre 1868, pour les voitures à cheval, dix-sept ans avant le brevet de Carl Benz, en 1886." },
```

Sources (source primaire non lue : le Times du 9 décembre 1868 est cité par Smithsonian) :
- https://www.smithsonianmag.com/smart-news/chaotic-traffic-from-horse-drawn-carriages-inspired-the-worlds-first-traffic-lights-180985558 :
  « Initial reactions to the signal, installed in London on this day in 1868 » (article du 9 décembre 2024) ; « the
  London Times wrote on December 9, 1868. That same day, however, the Times proudly reported on a sparkling innovation
  newly installed at the intersection outside of Parliament ».
- https://www.nbcnews.com/news/world/150-years-seeing-red-traffic-light-marks-milestone-n943461 : « The world's first
  traffic light was put up on Dec. 10, 1868. » ; « placed at the busy intersection outside the Houses of Parliament ».
- https://www.hmdb.org/m.asp?m=128352 (photo et transcription de la plaque de la Ville de Westminster) : « John Peake
  Knight 1828 – 86 Inventor of the World's First Traffic Lights Which Were Erected Here 9th Dec. 1868 ».
- Automobile : date d'`EVENEMENTS` (1886).

Le jour (9 ou 10 décembre) est discuté, l'année et l'écart (17 ans) ne le sont pas : `feu-circulation` n'a pas de
`date`. « Pour les voitures à cheval » : Smithsonian (« horse-drawn carriages »).

Contre-vérification : VALIDÉ. Smithsonian (2024), NBC News et plaque de Westminster relus : décembre 1868 concordant,
jour discuté (9 ou 10), d'où l'absence de `date`, justifiée. Source indépendante supplémentaire : Smithsonian
Magazine, « When the Street Light First Came to London, Disaster Ensued » (6 décembre 2018 : « On December 9, 1868,
London became the first city to have a traffic light »). Deux sources secondaires sérieuses au moins (Smithsonian,
NBC News) : règle respectée. Écart : décembre 1868 à janvier 1886, « dix-sept ans » juste.

### Arts

#### 16. Elizabeth II / Mort de Monet

```js
  // Famille royale britannique : naissance le 21 avril 1926 ; National Gallery of Victoria et Visit Paris Region (centenaire Monet) : mort à Giverny le 5 décembre 1926
  { a: "elizabeth", b: "monet", note: "Claude Monet, le peintre des « Nymphéas », était encore vivant à la naissance d'Elizabeth II, le 21 avril 1926 : il est mort à Giverny le 5 décembre 1926." },
```

Sources :
- https://ngv.vic.gov.au/monet-timeline/lightboxesweb/29-2.php (National Gallery of Victoria, chronologie de Monet) :
  « 1926 […] Monet dies on 5 December probably from a tumour on his lung and pulmonary sclerosis. At Monet's funeral on
  8 December, Clemenceau sees the dark drape across the painter's casket ». Institutionnel (musée).
- https://pro.visitparisregion.com/content/download/60206/file/VI-CentenaireMonet-dossierpresse-FR-web.pdf (dossier de
  presse du centenaire, Paris Région) : « 2026 marque le centenaire de la disparition de Claude Monet, le maître de
  l'Impressionnisme, qui s'est éteint le 5 décembre 1926 à Giverny » ; « Le 5 décembre 1926, Claude Monet rend son
  dernier souffle dans sa chambre de Giverny ».
- Elizabeth II : date d'`EVENEMENTS` (royal.uk, déjà citée).

Écart : sept mois et demi. Le centenaire de 2026 rend la paire d'actualité.

Contre-vérification : VALIDÉ. NGV et dossier de presse de Paris Région relus (« s'est éteint le 5 décembre 1926 à
Giverny »), deux sources indépendantes l'une de l'autre.

#### 17. Mickey / Tintin

```js
  // Walt Disney Archives (d23.com) : « Steamboat Willie » sorti le 18 novembre 1928 ; Tintin : 10 janvier 1929
  { a: "mickey", b: "tintin", note: "Mickey est un peu plus âgé que Tintin : « Steamboat Willie » est sorti à New York le 18 novembre 1928, moins de deux mois avant la première apparition de Tintin, le 10 janvier 1929." },
```

Sources :
- https://d23.com/this-day/steamboat-willie-premieres/ : « Steamboat Willie Premieres November 18, 1928 » ; « It was on
  this day in 1928 that the first Mickey Mouse cartoon short was released at the Colony Theatre in New York. »
  Primaire (Walt Disney Archives).
- Tintin : date d'`EVENEMENTS` (10 janvier 1929, Encyclopædia Universalis et DPMA, relue au lot 1).

Écart : 53 jours. Un autre dessin animé de Mickey (« Plane Crazy ») avait été projeté à l'essai en mai 1928 : cela
ne fait que renforcer l'ordre. Le nom de l'événement dit « sorti en salle » pour rester exact.

Contre-vérification : VALIDÉ. Page des Walt Disney Archives relue. Source indépendante : MoMA
(https://www.moma.org/collection/works/302797 : « The movie opened at New York's Colony Theater on November 18,
1928 »).

#### 18. Mégalosaure / Neuvième Symphonie

```js
  // Natural History Museum de Londres : mégalosaure présenté le 20 février 1824 ; Orchestre philharmonique de Vienne : Neuvième créée le 7 mai 1824
  { a: "megalosaure", b: "neuvieme", note: "Même année : le premier dinosaure nommé, le mégalosaure, a été présenté le 20 février 1824, deux mois et demi avant la création de la Neuvième Symphonie de Beethoven, le 7 mai 1824 à Vienne." },
```

Sources :
- https://www.wienerphilharmoniker.at/en/orchestra/exhibitions/exhibition1 : « The world premiere performance of this
  masterpiece took place in the Kärntnertor Theater - the Vienna Court Opera - on May 7, 1824. Ludwig van Beethoven
  took part in the production. » Institutionnel (orchestre).
- Mégalosaure : date d'`EVENEMENTS` (Natural History Museum, déjà citée).

Écart : 77 jours.

Contre-vérification : VALIDÉ. Page de l'Orchestre philharmonique de Vienne relue. Source indépendante : Beethoven-Haus
Bonn, communiqué « RESOUND Beethoven 9 » (« Beethoven's Symphony No. 9 was premiered in Vienna on 7 May 1824 »).

### Sport et objets du quotidien

#### 19. Mort de Van Gogh / Basket-ball

```js
  // Springfield College : règles du basket-ball écrites par James Naismith en décembre 1891 ; Naismith Basketball Hall of Fame : hiver 1891 ; musée Van Gogh : mort le 29 juillet 1890
  { a: "van-gogh", b: "basket", note: "Van Gogh est mort avant l'invention du basket-ball : il est mort le 29 juillet 1890, et James Naismith a écrit les règles du jeu en décembre 1891." },
```

Sources :
- https://springfield.edu/where-basketball-was-invented-the-birthplace-of-basketball : « The original rules of basket ball
  were written by Springfield College graduate instructor James Naismith in December 1891 and published in January 1892
  in the Springfield College school magazine, The Triangle. » Primaire (établissement où le jeu est né).
- https://www.hoophall.com/hall-of-famers/james-naismith/ : « In the winter of 1891, when a 30-year-old physical education
  instructor from the International YMCA Training School in Springfield, Massachusetts invented an indoor game ».
  Institutionnel (Hall of Fame).
- Van Gogh : date d'`EVENEMENTS` (musée Van Gogh, déjà citée).

Écart : près d'un an et demi.

Contre-vérification : VALIDÉ. Springfield College et Naismith Hall of Fame relus, deux institutions distinctes et
concordantes (décembre 1891, « winter of 1891 »).

#### 20. Barbie / Hawaï, 50e État

```js
  // Time (« Barbie Turns 50 », 2009) et CBS News (2023) : Barbie présentée le 9 mars 1959 ; Archives nationales des États-Unis : Hawaï 50e État le 21 août 1959
  { a: "barbie", b: "hawaii", note: "La poupée Barbie est plus âgée que l'État d'Hawaï : elle a été présentée à New York le 9 mars 1959, plus de cinq mois avant que Hawaï devienne le 50e État des États-Unis, le 21 août." },
```

Sources (page de Mattel introuvable, 404 ; deux médias de référence concordants) :
- https://content.time.com/time/photogallery/0,29307,1883083_1852824,00.html (Time, 4 mars 2009) : « Barbie Millicent
  Roberts made her first appearance in public on March 9, 1959 at the New York Toy Fair. »
- https://www.cbsnews.com/detroit/news/this-day-in-history-barbie-doll-makes-her-debut-in-1959 (CBS News, 9 mars 2023) :
  « On March 9, 1959, the Barbie doll debuted for the first time. The first doll was displayed at the American Toy Fair
  in New Yor[k] ».
- Hawaï : date d'`EVENEMENTS` (Archives nationales des États-Unis, déjà citée).

Écart : cinq mois et demi. Une notice d'EBSCO dit « février 1959 » : l'ordre et l'écart restent nets ; la date du
9 mars est celle de Time et de CBS.

Contre-vérification : VALIDÉ. Time et CBS News relus (9 mars 1959, Toy Fair de New York). Sources indépendantes
concordantes : HISTORY.com (« On March 9, 1959, the first Barbie doll goes on display at the American Toy Fair in New
York City ») ; Smithsonian Magazine, juin 2023 (« The first model went on display in March 1959 at the annual Toy Fair
in New York City »). La date de février 1959 (EBSCO) est isolée ; l'ordre avec Hawaï (21 août) ne dépend pas de ce
point.

---

## Écartés

#### (ex-11) Machu Picchu / Colomb

```js
  // Université Yale (news.yale.edu, 2021) et Smithsonian Magazine : occupation du Machu Picchu d'environ 1420 à 1530 (Burger et al., Antiquity, 2021)
  { a: "machu-picchu", b: "colomb", note: "Le Machu Picchu n'est pas une ruine antique : ce domaine inca n'était occupé que depuis quelques décennies quand Colomb a atteint l'Amérique, en 1492. Une datation de 2021 place ses débuts vers 1420 ; les chroniques espagnoles suggéraient plutôt après 1440." },
```

Sources :
- https://news.yale.edu/2021/08/04/machu-picchu-older-expected-study-reveals : « Machu Picchu was in use from about A.D.
  1420 to A.D. 1530 — ending around the time of the Spanish conquest — making the site at least 20 years older than
  the accepted historical record suggests » ; « scholars have estimated that the site was built after A.D. 1440, and
  perhaps as late as A.D. 1450 ». Institutionnel (université de l'auteur principal).
- https://www.smithsonianmag.com/smart-news/radiocarbon-dating-reveals-machu-picchu-older-previously-thought-180978360/ :
  « the Inca settlement was in continuous use from at least 1420 to 1530 ».
- https://archaeology.org/news/2021/08/05/210805-machu-picchu-date/ : « Machu Picchu was in use as early as A.D. 1420 and
  was occupied until 1530 ».

Date discutée (1420 ou après 1440) : paire gardée parce que l'écart reste net (environ 50 à 70 ans) et que la note
le dit. L'article d'Antiquity lui-même n'a pas pu être lu (page Cambridge en erreur 500).

Contre-vérification : REJETÉ. La note de la paire reste vraie avec les deux datations (1420 ou après 1440 : quelques
décennies avant 1492). Mais l'événement `machu-picchu` (annee: 1420, vers: true) entrerait dans le tirage au hasard,
qui n'exclut que les paires de deux `vers` : il serait opposé à `jeanne` (1431) ou `constantinople` (1453), ce que le
script confirme (voisins admis : `tenochtitlan`, `peste`, `jeanne`, `constantinople`, `colomb`, `luther`, `vinci`,
`copernic`). Face à Jeanne d'Arc, la bonne réponse dépend de la datation retenue (1420 selon Burger et al., 2021 ;
après 1440 selon les chroniques), et aucune valeur d'`annee` n'évite à la fois 1431 et 1453. L'article d'Antiquity
n'a pas été lu. Doute non levé : rejet.



- **Cléopâtre / grande pyramide** (« Cléopâtre est plus proche de nous que de Khéops ») : fait déjà raconté par la
  question `cleopatre` de `VRAI_FAUX` ; doublon.
- **Jikji (1377) / Bible de Gutenberg** : la BnF le confirme (« Son impression en 1377 à Cheongju […] est antérieure
  de 78 ans à celle de la Bible de Gutenberg », bnf.fr), mais `grand-test-donnees.js` (`vf-imprimerie-asie`) raconte
  déjà ce fait ; doublon.
- **Boîte de conserve (1810) / ouvre-boîte** : le « premier ouvre-boîte » est daté de 1855 (Robert Yates, Royaume-Uni)
  ou de 1858 (Ezra Warner, brevet US 19063 du 5 janvier 1858, lu sur Google Patents) ; le brevet de Peter Durand
  (1810) n'est cité que de seconde main (Smithsonian cite Today I Found Out). Écarté.
- **Wimbledon (juillet 1877) / rébellion de Satsuma** : la rébellion s'étend de février au 24 septembre 1877
  (Bibliothèque nationale de la Diète : « SAIGO's forces were crushed on September 24, 1877 ») ; le premier tournoi
  (9 juillet 1877, Harrow School) a lieu pendant la rébellion : l'ordre n'a pas de sens.
- **Microprocesseur Intel 4004 / Émirats arabes unis** : la date de sortie du 4004 varie (livraison en mars 1971,
  publicité du 15 novembre, vente en décembre), son titre de « premier microprocesseur » est discuté (Computer History
  Museum : MP944, Four-Phase), et les pages d'Intel répondent 404. Remplacé par Walt Disney World.
- **Starbucks / Émirats arabes unis** : premier café ouvert le 30 mars 1971 (HistoryLink) ou en avril 1971 (Starbucks) ;
  page de Starbucks refusée (403). Remplacé.
- **Disneyland / Brasília** : Disneyland a ouvert au public le 18 juillet 1955 (d23.com : « Disneyland Opens to the
  Public for the First Time July 18, 1955 », après l'avant-première du 17) ; paire valable, mais écartée pour ne pas
  avoir deux paires Disney ; Brasília est opposée à « Tennis for Two ».
- **Abolition du sultanat ottoman (1er novembre 1922) / découverte de la tombe de Toutânkhamon (4 novembre 1922)** : la
  fin de l'Empire ottoman se date de plusieurs façons (1922 ou 1923), et l'écart serait de trois jours. Non retenue.

## Points à relire

- Dates reprises d'`EVENEMENTS` sans nouvelle lecture : abolition française (1848), Tour de France, Tennis for Two,
  statue de la Liberté (relue : nps.gov), Wright, web, iPhone, Colomb, abolition britannique, automobile, Elizabeth II,
  Tintin, mégalosaure, Van Gogh, Hawaï (1959).
- Sources indirectes à la place d'une source primaire inaccessible : Népal (NPR, Irish Times), Barbie (Time, CBS),
  feu de circulation (Smithsonian, NBC, plaque de Westminster).
- Appariements répétés : `wright` apparaîtrait dans trois paires (`tour-de-france`, `pole-sud`, `congo-belge`),
  `hawaii` dans deux (`spoutnik`, `barbie`), `tour-de-france` dans trois (`wright`, `fifa`, `panama`).
