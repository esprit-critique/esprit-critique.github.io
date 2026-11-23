# Propositions pour le stock `CITATIONS`, lot 2 (23 novembre 2026)

> **Bilan de la contre-vérification (23 novembre 2026)** : 16 éléments examinés. 5 VALIDÉS (Hirohito, Chávez,
> Bolívar, Ford, Lincoln), 9 À CORRIGER, blocs de code déjà corrigés (Sankara, Arafat, Roosevelt, Poutine, Sélassié,
> Coubertin, Watson, Hemingway, Monroe), 2 REJETÉS et déplacés dans « Écartés » (Gorbatchev, Hugo). Aucun doublon avec
> `CITATIONS`, `VRAI_FAUX` ni `grand-test-donnees.js` (identifiants `ford-noir` et `watson-ordinateurs` distincts de
> `ford` et `watson`). Wikipédia et Wikiquote non comptés.

Seize citations nouvelles, absentes du stock actuel (`static/jeux-donnees.js`, vérifié sur les textes et les
identifiants) et sans doublon dans `static/grand-test-donnees.js` ni dans `VRAI_FAUX` (la seule citation de `VRAI_FAUX`
est `brioche`). Rien n'a été modifié dans `static/`. Les blocs sont prêts à coller dans `CITATIONS` ; il reste à leur
donner `depuis:` au moment de l'ajout, puis à lancer la chaîne de traduction. **À contre-vérifier par l'agent
`verificateur-sources` avant toute intégration.**

Répartition : 8 « authentique », 4 « deformee », 4 « apocryphe ». Figures politiques et géopolitiques (10) : Hirohito
(Asie), Chávez et Bolívar (Amérique latine), Sankara et Hailé Sélassié (Afrique), Arafat (Moyen-Orient), Poutine,
Gorbatchev, Theodore Roosevelt, Lincoln. Autres : Ford et Watson (entrepreneurs), Coubertin (sport), Hugo et Hemingway
(écrivains), Marilyn Monroe (artiste). Aucun scientifique : les pistes examinées (Laplace, Kelvin) n'ont pas pu être
sourcées à temps (voir « Écartés »). Authentiques qui paraissent fausses : Hirohito, Chávez, Sankara, Bolívar,
Roosevelt, Ford, Arafat, Poutine.

Les traductions françaises sont les miennes, faites sur le texte lu, sauf mention (versions françaises officielles de
l'ONU).

---

## Authentiques

### 1. Hirohito, la guerre qui n'a « pas nécessairement » bien tourné

```js
  { id: "hirohito-guerre", niveau: 3, texte: "La situation de la guerre n'a pas nécessairement évolué en notre faveur.", auteur: "L'empereur Hirohito, annonçant la capitulation du Japon (1945)", statut: "authentique",
    explication: "Rescrit impérial daté du 14 août 1945, lu à la radio par l'empereur le 15 août à midi : « la situation de la guerre n'a pas nécessairement évolué en notre faveur, et la tendance générale du monde ne nous est pas favorable non plus ». Le même texte dit que l'ennemi emploie « une bombe nouvelle et cruelle ». Selon les Archives nationales du Japon, ce passage a été corrigé au conseil des ministres après une forte opposition, venue surtout de l'armée." },
```

Sources :
- https://www.ndl.go.jp/constitution/shiryo/01/017/017tx.html (Bibliothèque nationale de la Diète, texte du rescrit, lu
  avec curl). Passage décisif : « 戦局必スシモ好転セス世界ノ大勢亦我ニ利アラス加之敵ハ新ニ残虐ナル爆弾ヲ使用シテ頻ニ無辜ヲ殺傷シ » ;
  date : « 昭和二十年八月十四日 » (14 août 1945). Mode : primaire.
- https://www.archives.go.jp/exhibition/digital/s20/contents/5_02.html (Archives nationales du Japon) : « 8月15日正午、いわゆる「玉音放送」が行われ » (diffusion le 15 août à midi).
- https://www.archives.go.jp/exhibition/jousetsu_08_08.html (Archives nationales du Japon, exposition de l'original) :
  « 修正箇所の「戦局必スシモ好転セス」は、陸軍を中心に強い反対を受けて修正されたことが知られています。 » Mode : primaire (archive).

Contre-vérification : VALIDÉ. Texte du rescrit relu sur ndl.go.jp (passage, date du 14 août 1945) ; source indépendante
lue : Archives nationales du Japon, archives.go.jp/exhibition/jousetsu_08_08.html (diffusion le 15 août à midi, passage
modifié au conseil des ministres du 14 août « 陸軍を中心に強い反対を受けて »). Traduction fidèle. Texte factuel.

### 2. Chávez, l'odeur de soufre

```js
  { id: "chavez-soufre", niveau: 3, texte: "Hier, le diable est venu ici, et ça sent encore le soufre.", auteur: "Hugo Chávez", statut: "authentique",
    explication: "Devant l'Assemblée générale des Nations unies, à New York, le 20 septembre 2006, au lendemain du discours de George W. Bush à la même tribune : « Hier, le diable est venu ici, […] ça sent encore le soufre, à cette table où il me revient de parler. » Il conclut : « Ça sent le soufre, mais Dieu est avec nous ! » Le compte rendu officiel de l'ONU a tout consigné." },
```

Sources : compte rendu officiel A/61/PV.12 (« 12th plenary meeting, Wednesday, 20 September 2006, 10 a.m., New York »),
https://documents.un.org/api/symbol/access?s=A/61/PV.12&l=es&t=pdf (version espagnole, texte original) : « Ayer vino el
diablo aquí, ayer estuvo el diablo aquí, en este mismo lugar, huele a azufre todavía, en esta mesa, donde me ha tocado
hablar. » ; fin : « ¡Huele a azufre, pero Dios está con nosotros! » Versions anglaise et française lues aussi (l=en :
« The Devil came here yesterday, right here. It still smells of sulphur today. » ; l=fr : « Et cela sent encore le
soufre aujourd'hui. »). Mode : primaire.

Contre-vérification : VALIDÉ. A/61/PV.12 relu (espagnol et français : « Et hier, le Diable est venu jusqu'ici. Et cela
sent encore le soufre aujourd'hui », « Cela sent le soufre ici, mais Dieu est avec nous »). Source indépendante lue :
Al Jazeera, 20 septembre 2006 (https://www.aljazeera.com/news/2006/9/20/chavez-calls-bush-the-devil : « The devil came
here yesterday », à propos du discours de Bush du mardi). Le texte rapporte la citation sans commentaire.

### 3. Sankara, la dette

```js
  { id: "sankara-dette", niveau: 3, texte: "La dette ne peut pas être remboursée parce que si nous ne payons pas, nos bailleurs de fonds ne mourront pas.", auteur: "Thomas Sankara", statut: "authentique",
    explication: "Addis-Abeba, 29 juillet 1987, au sommet de l'Organisation de l'unité africaine, le président du Burkina Faso appelle à un front uni contre la dette : « si nous ne payons pas, nos bailleurs de fonds ne mourront pas. Soyons-en sûrs. Par contre si nous payons, c'est nous qui allons mourir. »" },
```

Sources :
- https://thomassankara.net/wp-content/uploads/2005/09/La_dette-1.pdf (transcription « retranscrit à partir d'un
  enregistrement », titre « Un front uni contre la dette », « 29 juillet 1987, Thomas Sankara assiste à Addis-Abeba aux
  travaux de la vingt-cinquième Conférence au sommet des pays membres de l'OUA »). Passage décisif : « La dette ne peut
  pas être remboursée parce que d'abord si nous ne payons pas, nos bailleurs de fonds ne mourront pas. Soyons-en surs.
  Par contre si nous payons, c'est nous qui allons mourir. » Mode : primaire (transcription d'enregistrement).
- https://burkina24.com/2016/07/29/29-juillet-1987-le-discours-sur-la-dette-de-thomas-sankara-il-y-a-29-ans/ : même
  passage, « front uni contre la dette », « Trois mois plus tard, il est assassiné. »
- https://www.marxists.org/archive/sankara/1987/july/29.htm (traduction anglaise) : « if we dont repay, lenders will not
  die. That is for sure. But if we repay, we are going to die. »
Point douteux : le numéro du sommet (25e selon thomassankara.net, 23e selon Africa Check, page refusée en 403) ; il
n'est pas dans l'explication.

Contre-vérification : À CORRIGER (bloc corrigé). Transcription relue sur thomassankara.net (« La dette ne peut pas être
remboursée parce que d'abord si nous ne payons pas… », 29 juillet 1987) ; source indépendante lue : Burkina24,
29 juillet 2016 (même passage, « parce que si nous ne payons pas »). Corrections : 1) `texte` rendu fidèle (« parce
que » au lieu des deux-points, comme dans Burkina24) ; 2) phrase « Il est assassiné trois mois plus tard » retirée :
accolée au discours, elle suggère un lien de cause non établi (neutralité), et elle est approximative (15 octobre 1987).

### 4. Arafat, le rameau d'olivier

```js
  { id: "arafat-olivier", niveau: 2, texte: "Aujourd'hui, je suis venu porteur d'un rameau d'olivier et d'un fusil de combattant de la liberté. Ne laissez pas le rameau d'olivier tomber de ma main.", auteur: "Yasser Arafat", statut: "authentique",
    explication: "Devant l'Assemblée générale des Nations unies, à New York, le 13 novembre 1974 : l'Organisation de libération de la Palestine, qu'il préside, vient d'y être invitée à débattre de la question de Palestine. Il termine par cette phrase et insiste : « Je le répète : ne laissez pas le rameau d'olivier tomber de ma main. » (version française officielle du compte rendu de l'ONU)" },
```

Sources : compte rendu officiel A/PV.2282, https://documents.un.org/api/symbol/access?s=A/PV.2282&l=en&t=pdf (« 2282nd
plenary meeting, Wednesday, 13 November 1974 », « resolution 3210 (XXIX), adopted on 14 October 1974, decided to invite
the Palestine Liberation Organization »). Passage décisif, § 82 : « Today I have come bearing an olive branch and a
freedom-fighter's gun. Do not let the olive branch fall from my hand. I repeat: do not let the olive branch fall from
my hand. » Mode : primaire. Point douteux : la version française du compte rendu est illisible à cet endroit (OCR) ; la
traduction est faite sur la version anglaise, elle-même interprétation d'un discours probablement prononcé en arabe
(langue non vérifiée, donc non affichée).

Contre-vérification : À CORRIGER (bloc corrigé). La version française officielle A/PV.2282 (l=fr) se lit en extrayant le
texte du PDF ; § 82 : « Aujourd'hui, je suis venu porteur d'un rameau d'olivier et d'un fusil de combattant de la
liberté. Ne laissez pas le rameau d'olivier tomber de ma main. Je le répète : ne laissez pas le rameau d'olivier tomber
de ma main. » Version anglaise relue, concordante (« Today I have come bearing… »). Correction : `texte` remplacé par le
texte officiel de l'ONU (le « Aujourd'hui » manquait), mention de la version officielle dans l'explication. Source
secondaire repérée : Dawn, « 1974: Fifty years ago: Triumphant Arafat » (https://dawn.com/news/1872306). Neutralité :
la formule « combattant de la liberté » est celle de l'orateur, entre guillemets ; l'explication est factuelle.

### 5. Bolívar, labourer la mer

```js
  { id: "bolivar-mer", niveau: 3, texte: "Celui qui sert une révolution laboure la mer.", auteur: "Simón Bolívar", statut: "authentique",
    explication: "Lettre au général Juan José Flores, Barranquilla, 9 novembre 1830. Bolívar y tire les leçons de vingt ans de pouvoir : « 1°. L'Amérique est ingouvernable pour nous. 2°. Celui qui sert une révolution laboure la mer. 3°. La seule chose à faire en Amérique est d'émigrer. »" },
```

Sources :
- https://es.wikisource.org/wiki/Carta_de_Bol%C3%ADvar_al_general_Juan_Jos%C3%A9_Flores_(1830) (texte brut lu) :
  « Barranquilla, 9 de noviembre de 1830 », « A S. E. el General J. J. Flores » ; « V. sabe que yo he mandado 20 años y
  de ellos no he sacado más que pocos resultados ciertos. 1°. La América es ingobernable para nosotros. 2°. El que sirve
  una revolución ara en el mar. 3°. La única cosa que se puede hacer en América es emigrar. » Mode : primaire
  (transcription).
- https://academic.oup.com/book/48662 (David Bushnell, éd., *El Libertador: Writings of Simón Bolívar*, Oxford
  University Press, 2003), sommaire : « Letter to General Juan José Flores: "Ploughing the Sea" ». Concordant ; texte
  du livre non lu (PDF du musée bolivarien refusé : certificat expiré).

Contre-vérification : VALIDÉ. Sources indépendantes lues (archive.org, texte OCR) : Vicente Lecuna, *Cartas del
Libertador*, t. IX (« Barranquilla, 9 de noviembre de 1830. A S. E. el general Juan José Flores. […] 2°, el que sirve
una revolución ara en el mar ») ; John Lynch, *Simón Bolívar* (éd. espagnole, même passage). Traduction fidèle.

### 6. Theodore Roosevelt, le gros bâton

```js
  { id: "roosevelt-baton", niveau: 2, texte: "Parle doucement et porte un gros bâton : tu iras loin.", auteur: "Theodore Roosevelt", statut: "authentique",
    explication: "Il la prononce le 2 septembre 1901, à la foire de l'État du Minnesota, et la présente lui-même comme un proverbe : « Beaucoup d'entre vous connaissent sans doute le vieux proverbe : “Parle doucement et porte un gros bâton ; tu iras loin.” »" },
```

Sources :
- Discours de 1901 : Theodore Roosevelt, *The Strenuous Life*, The Century Company, éd. de 1903, chap. XVII, « National
  Duties. Address at Minnesota State Fair, September 2, 1901 », p. 273, texte OCR lu
  (https://archive.org/download/strenuouslifees00roosgoog/strenuouslifees00roosgoog_djvu.txt) : « A good many of you
  are probably acquainted with the old proverb: "Speak softly and carry a big stick — you will go far." » Mode : primaire.
- Lettre de 1900 : Associated Press, 5 avril 2007, reprise par HNN (https://www.hnn.us/article/37338) et par Insurance
  Journal (https://amp.insurancejournal.com/news/national/2007/04/05/78483.htm) : lettre « dated Jan. 26, 1900 », « I
  have always been fond of the West African proverb: 'Speak softly and carry a big stick; you will go far.' », copie
  carbone à la bibliothèque du Congrès. Mode : indirect. **Point douteux** : les deux reprises viennent de la même
  dépêche AP ; la page de la bibliothèque du Congrès (exposition « American Treasures ») n'a pas pu être lue (404, copie
  archivée vide). Si la contre-vérification ne trouve pas de seconde source indépendante, retirer la phrase sur la
  lettre et le « proverbe d'Afrique de l'Ouest ».

Contre-vérification : À CORRIGER (bloc corrigé). Discours de 1901 relu sur archive.org (*The Strenuous Life*, chap. XVII
« Address at Minnesota State Fair, September 2, 1901 » : « A good many of you are probably acquainted with the old
proverb: "Speak softly and carry a big stick — you will go far." ») : source primaire, suffisante. Lettre de 1900 :
aucune seconde source indépendante de la dépêche AP n'a pu être lue (loc.gov 404, copies archivées de la Bibliothèque du
Congrès inaccessibles, Wayback Machine bloquée ; restent un marchand d'autographes et des sites de citations) ; phrase
sur la lettre et sur le « proverbe d'Afrique de l'Ouest » retirée, comme demandé.

### 7. Ford, n'importe quelle couleur

```js
  { id: "ford-noir", niveau: 2, texte: "Le client peut avoir une voiture de la couleur qu'il veut, pourvu qu'elle soit noire.", auteur: "Henry Ford", statut: "authentique",
    explication: "Ford le raconte lui-même dans « My Life and Work » (1922), écrit avec le journaliste Samuel Crowther : en 1909, en annonçant qu'il ne construirait plus qu'un modèle, la Ford T, il dit avoir lancé : « N'importe quel client peut avoir une voiture peinte de la couleur qu'il veut, pourvu qu'elle soit noire. » Il ajoute que personne ne fut d'accord avec lui." },
```

Sources : Henry Ford, en collaboration avec Samuel Crowther, *My Life and Work*, Garden City Publishing, « Copyright,
1922, by Doubleday, Page & Company », chap. IV, vers la p. 72, texte OCR lu
(https://archive.org/download/mylifework00ford/mylifework00ford_djvu.txt). Passage décisif : « Therefore in 1909 I
announced one morning, without any previous warning, that in the future we were going to build only one model, that
the model was going to be "Model T," […] and I remarked: "Any customer can have a car painted any colour that he wants
so long as it is black." I cannot say that any one agreed with me. » Mode : primaire.

Contre-vérification : VALIDÉ. Passage relu mot pour mot sur archive.org (`mylifework00ford`, copyright 1922, Doubleday,
Page & Company) : source primaire, suffisante. L'explication dit bien « il dit avoir lancé » : la scène de 1909 n'est
attestée que par le livre (des sources secondaires notent que la Ford T n'a été vendue qu'en noir qu'à partir de 1914 ;
non affiché, sans incidence sur le statut : la phrase est bien de Ford).

### 8. Poutine, la catastrophe géopolitique

```js
  { id: "poutine-urss", niveau: 2, texte: "L'effondrement de l'Union soviétique a été la plus grande catastrophe géopolitique du siècle.", auteur: "Vladimir Poutine", statut: "authentique",
    explication: "Message annuel à l'Assemblée fédérale, au Kremlin, le 25 avril 2005. Il ajoute que ce fut « un véritable drame » pour le peuple russe : des dizaines de millions de concitoyens et de compatriotes se sont retrouvés hors du territoire russe." },
```

Sources : http://kremlin.ru/events/president/transcripts/22931 (site de la présidence russe, lu avec curl) :
« Послание Федеральному Собранию Российской Федерации 25 апреля 2005 года 12:23 Москва, Кремль ». Passage décisif :
« Прежде всего следует признать, что крушение Советского Союза было крупнейшей геополитической катастрофой века. Для
российского же народа оно стало настоящей драмой. Десятки миллионов наших сограждан и соотечественников оказались за
пределами российской территории. » Mode : primaire. Remarque : la forme « du XXe siècle » qui circule n'a pas été
datée ; l'explication dit seulement qu'on la cite souvent, ce qui est à confirmer ou à retirer.

Contre-vérification : À CORRIGER (bloc corrigé). Texte russe relu sur kremlin.ru (curl) : « крушение Советского Союза
было крупнейшей геополитической катастрофой века. Для российского же народа оно стало настоящей драмой. Десятки
миллионов наших сограждан и соотечественников оказались за пределами российской территории », « 25 апреля 2005 года ».
Traduction fidèle (« крупнейшей… века » = « la plus grande… du siècle »). Source indépendante lue : RFE/RL, 29 avril
2005 (https://www.rferl.org/a/1058688.html : « The collapse of the Soviet Union was the biggest geopolitical catastrophe
of the century », même suite). Correction : phrase « On cite souvent « du XXe siècle » ; il a dit « du siècle » »
retirée, faute de source. Le reste est une citation, sans jugement.

---

## Déformées

### 9. Hailé Sélassié, « partout, c'est la guerre »

```js
  { id: "selassie-guerre", niveau: 3, texte: "Tant que la philosophie qui tient une race pour supérieure et une autre pour inférieure ne sera pas définitivement discréditée et abandonnée, partout, c'est la guerre.", auteur: "Hailé Sélassié", statut: "deformee",
    explication: "« Partout, c'est la guerre » vient de la chanson « War », enregistrée par Bob Marley en 1976, qui reprend le discours de l'empereur d'Éthiopie aux Nations unies, le 4 octobre 1963. Hailé Sélassié concluait autrement : tant que ces conditions ne seront pas remplies, « les idéaux de paix durable, de citoyenneté du monde et de primauté de la morale internationale resteront des illusions fugaces, que l'on poursuit sans jamais les atteindre »." },
```

Sources :
- Compte rendu officiel A/PV.1229 (« 1229th meeting - 4 October 1963 »),
  https://documents.un.org/api/symbol/access?s=A/PV.1229&l=fr&t=pdf : note « L'empereur s'est exprimé en amharique. La
  version française de son allocution a été fournie par la délégation éthiopienne. » ; § 27 : « tant que la doctrine qui
  soutient qu'une race est supérieure et une autre inférieure ne sera pas définitivement et à jamais discréditée et
  rejetée ; […] tant que ces conditions ne seront pas remplies, les idéaux de paix durable, de citoyenneté du monde et
  de primauté de la morale internationale resteront des illusions fugaces, que l'on poursuit sans jamais les
  atteindre ». Version anglaise (l=en) : « until the philosophy which holds one race superior and another inferior is
  finally and permanently discredited and abandoned […] the dream of lasting peace […] will remain but a fleeting
  illusion ». Mode : primaire.
- https://jamaica-gleaner.com/article/entertainment/20150201/plea-peace-war (*The Gleaner*, 1er février 2015) : « the
  lyrics to War are not Bob Marley's, but from a speech given by HIM Haile Selassie at the United Nations General
  Assembly in New York City, October 1963 », « Rastaman Vibration album (1976) », « the refrain "everywhere will be war"
  (or a variation of it) is inserted after each point ».
- https://www.boeckler.de/de/magazin-mitbestimmung-2744-des-kaisers-rede-als-reggae-19088.htm (*Magazin Mitbestimmung*,
  fondation Hans-Böckler, 04/2019) : « 1976 griff Bob Marley in seinem Song "War" die Rede von Haile Selassie vor der
  UN-Vollversammlung auf », avec « Everywhere is war » ; « Am 4. Oktober 1963 ».
Mode : primaire pour le discours, indirect concordant pour la chanson. Le `texte` traduit la forme de Marley, que l'on
prête à l'empereur.

Contre-vérification : À CORRIGER (bloc corrigé, détail). A/PV.1229 relu en français et en anglais (note sur l'amharique,
§ 27, « illusions fugaces », 4 octobre 1963) ; Gleaner et Magazin Mitbestimmung relus, concordants. Correction : le
Gleaner indique que « War » est créditée à Allan Cole et Carlton Barrett ; « est de Bob Marley » devient « vient de la
chanson « War », enregistrée par Bob Marley en 1976 ».

### 11. Coubertin, « l'important, c'est de participer »

```js
  { id: "coubertin-participer", niveau: 1, texte: "L'important, c'est de participer.", auteur: "Pierre de Coubertin", statut: "deformee",
    explication: "C'est le raccourci d'une idée plus longue, qui n'est pas née chez lui. Pendant les Jeux de Londres, le 19 juillet 1908, l'évêque américain Ethelbert Talbot prêche aux athlètes, à la cathédrale Saint-Paul, que seul un concurrent peut porter la couronne de laurier, mais que tous peuvent partager la joie de la compétition. Coubertin reprend l'idée : l'important est moins de gagner que de prendre part, car « l'important dans la vie, ce n'est point le triomphe, mais le combat ; l'essentiel, ce n'est pas d'avoir vaincu, mais de s'être bien battu ». La date et les mots exacts de sa première reprise varient selon les sources." },
```

Sources :
- https://www.universalis.fr/encyclopedie/jeux-olympiques-les-symboles-olympiques/4-le-credo-olympique/ (Pierre
  Lagrue, *Encyclopædia Universalis*) : « Le 19 juillet 1908, Mgr Ethelbert Talbot, évêque de Pennsylvanie […] prêche
  en la cathédrale Saint-Paul » ; « même si seule une personne peut porter la couronne de lauriers, tout le monde peut
  partager la même joie de la compétition » ; « Pierre de Coubertin reprend la phrase de Mgr Talbot en l'adaptant » ;
  « l'important dans la vie ce n'est point le triomphe mais le combat ; l'essentiel, ce n'est pas d'avoir vaincu mais de
  s'être bien battu ».
- https://www.olympedia.org/definitions/117 (Olympedia, « Olympic Creed ») : Talbot, « St. Paul's Cathedral on 19 July
  1908 », « though only one may wear the laurel wreath, all may share the equal joy of the contest » ; Coubertin :
  « L'important dans la vie ce n'est point le triomphe mais le combat. L'essentiel ce n'est pas d'avoir vaincu mais de
  s'être bien battu. »
Mode : indirect, deux sources concordantes. Points douteux, laissés hors de l'explication : la date du discours de
Coubertin (banquet du 24 juillet 1908 selon Olympedia et paris.fr ; « semble-t-il » en 1912 à Stockholm selon
Universalis) ; l'auteur de la phrase « L'important dans ces olympiades, c'est moins d'y gagner que d'y prendre part »
(Coubertin citant l'évêque selon Olympedia, l'évêque rapporté par des fidèles selon Universalis) ; Olympedia signale
aussi que, selon David C. Young, Coubertin avait l'idée avant 1908 (Ovide).

Contre-vérification : À CORRIGER (bloc corrigé). Olympedia et Universalis relus (curl). Ils contredisent « La formule
courte n'est pas de lui » : selon Olympedia, Coubertin dit le 24 juillet 1908 « L'important dans ces Olympiades, c'est
moins d'y gagner que d'y prendre part » ; selon Universalis, il dit « semble-t-il » en 1912 « Le plus important aux jeux
Olympiques n'est pas de gagner mais de participer ». Le statut « deformee » tient (la forme courte tronque une phrase
plus longue), mais l'explication est réécrite : idée reprise de Talbot, sens de la phrase longue, et incertitude sur la
date et les mots de la première reprise, signalée sans afficher de date douteuse.

---

## Apocryphes

### 13. Lincoln, tromper tout le monde

```js
  { id: "lincoln-tromper", niveau: 2, texte: "On peut tromper tout le monde un certain temps, et certains tout le temps, mais on ne peut pas tromper tout le monde tout le temps.", auteur: "Abraham Lincoln", statut: "apocryphe",
    explication: "Aucun texte de Lincoln, mort en 1865, ne la contient. Les témoins qui la placent dans un discours de 1856 ou de 1858 se sont manifestés près d'un demi-siècle plus tard ; les historiens Don et Virginia Fehrenbacher jugent leur témoignage peu fiable. La plus ancienne attribution connue date des années 1880, dans les milieux qui militaient pour la prohibition de l'alcool." },
```

Sources :
- https://www.historynewsnetwork.org/article/you-can-fool-all-the-people-did-lincoln-say-it (David B. Parker,
  professeur d'histoire à Kennesaw State University, HNN, 14 février 2016) : « The above attributions were offered nearly
  a half century after the fact, and are generally considered unreliable. (Thomas Schwartz […] called the claims
  "tenuous," and Don and Virginia Fehrenbacher, authors of Recollected Words of Abraham Lincoln, gave the claims a grade
  of "D.") » ; plus ancienne trace trouvée par lui : « August 26, 1887, when the New York Times reported a speech by Fred
  Wheeler at a Prohibition party convention ».
- https://quoteinvestigator.com/2013/12/11/cannot-fool/ : « QI believes based on current evidence that Abraham Lincoln
  probably did not employ this well-known adage » ; plus ancienne attribution : lettre de H. Clay Bascom du 24 août 1885
  au journal prohibitionniste *The Voice* (trouvée par Fred R. Shapiro, *Yale Book of Quotations*) ; « no contemporaneous
  written evidence from the 1850s has ever been discovered ».
Mode : sources de référence concordantes (1885 et 1887, d'où « années 1880 »).

Contre-vérification : VALIDÉ. HNN (David B. Parker) et Quote Investigator relus : témoignages « nearly a half century
after the fact », note « D » des Fehrenbacher, 1887 (NYT, convention prohibitionniste) et 1885 (lettre de Bascom à *The
Voice*, journal prohibitionniste) ; « no contemporaneous written evidence from the 1850s ». Deux sources indépendantes.

### 14. Watson, cinq ordinateurs

```js
  { id: "watson-ordinateurs", niveau: 2, texte: "Je pense qu'il y a un marché mondial pour peut-être cinq ordinateurs.", auteur: "Thomas J. Watson, président d'IBM (1943)", statut: "apocryphe",
    explication: "On ne la trouve ni dans ses discours, ni dans ses lettres, ni dans la presse de l'époque. Cette formulation apparaît pour la première fois dans un livre de 1981 sur les prédictions ratées. Selon IBM, elle déforme une phrase de Thomas J. Watson Jr. aux actionnaires, le 28 avril 1953, sur la machine IBM 701 : la tournée de présentation devait rapporter cinq commandes, elle en avait rapporté dix-huit." },
```

Sources :
- https://freakonomics.com/2008/04/17/our-daily-bleg-did-ibm-really-see-a-world-market-for-about-five-computers/ (Fred
  R. Shapiro, rédacteur du *Yale Book of Quotations*, 17 avril 2008) : « The Yale Book of Quotations quotes an I.B.M.
  source that this "… is a misunderstanding of remarks made at I.B.M.'s annual stockholders meeting on April 28, 1953.
  […] As a result of our trip, on which we expected to get orders for five machines, we came home with orders for
  18." » ; « The earliest attested record […] was in a 1981 book, Facts and Fallacies ».
- https://quoteinvestigator.com/2026/08/29/market-five/ : « there is no substantive evidence that Thomas J. Watson Sr.
  or Jr. employed the quotation » ; « It's not in any of his surviving speeches, nor in any stories about IBM in major
  magazines and newspapers. He says nothing like it in surviving meeting notes or letters » (d'après Kevin Maney,
  biographe de Watson) ; 1981, *Facts and Fallacies*, Chris Morgan et David Langford.
Mode : sources de référence concordantes.

Contre-vérification : À CORRIGER (bloc corrigé). Freakonomics (Shapiro) et Quote Investigator relus. QI cite *Der
Spiegel* (1965), qui prêtait déjà à Watson Jr. une estimation de « no more than five » machines pour l'économie
américaine : « la plus ancienne attribution connue » date donc d'avant 1981. Correction : « Cette formulation apparaît
pour la première fois dans un livre de 1981 » (Shapiro : « earliest attested record of the alleged "world market"
quote »). Statut « apocryphe » confirmé (QI : « no substantive evidence that Thomas J. Watson Sr. or Jr. employed the
quotation »).

### 15. Hemingway, les chaussures de bébé

```js
  { id: "hemingway-chaussures", niveau: 3, texte: "À vendre : chaussures de bébé, jamais portées.", auteur: "Ernest Hemingway", statut: "apocryphe",
    explication: "Aucun écrit de Hemingway, mort en 1961, ne la contient. L'anecdote du pari, où il aurait écrit cette histoire en six mots pour prouver qu'il le pouvait, n'apparaît dans des publications que près de trente ans après sa mort ; l'agent littéraire Peter Miller la publie en 1991, en disant la tenir d'un diffuseur d'articles de presse." },
```

Sources :
- https://quoteinvestigator.com/2013/01/28/baby-shoes/ : « QI has located no substantive evidence that Ernest Hemingway
  composed a six or seven word story about an unworn pair of baby shoes » ; anecdote racontée par Peter Miller en 1991
  (puis 2006) ; Frederick A. Wright, *Journal of Popular Culture* (DOI 10.1111/j.1540-5931.2012.00935.x, vérifié sur
  Crossref ; résumé non disponible), juge l'attribution « spurious ».
- https://www.snopes.com/fact-check/baby-shoes/ (David Mikkelson, 2008, « Rating: False ») : « no one seems to have been
  able to locate an original source or publication that establishes Hemingway's authorship », « apparently doesn't go
  back much further than the 1990s ».
- https://www.mentalfloss.com/literature/authors/ernest-hemingway-did-not-write-six-word-baby-shoes-story : « It first
  appeared in print in the 1991 book Get Published! Get Produced! […] by agent Peter Miller […] he first heard the tale
  from an unnamed newspaper syndicator in 1974 ». « Hemingway's 1961 death ».
Mode : sources de référence concordantes.

Contre-vérification : À CORRIGER (bloc corrigé). QI, Snopes et Mental Floss relus. QI (page mise à jour) donne une trace
imprimée plus ancienne que Miller : la pièce de John De Groot, *Papa*, 1989 (« the earliest instance in print known to
QI »). « n'apparaît qu'en 1991 » est donc inexact. Correction : « n'apparaît dans des publications que près de trente
ans après sa mort » (1989 ou 1991 selon la source), Miller 1991 gardé comme fait (QI et Mental Floss concordent).

### 16. Marilyn Monroe, les femmes sages

```js
  { id: "monroe-sages", niveau: 3, texte: "Les femmes bien sages font rarement l'histoire.", auteur: "Marilyn Monroe", statut: "apocryphe",
    explication: "La phrase est d'une historienne américaine, Laurel Thatcher Ulrich, dans un article savant des années 1970 sur les sermons funèbres de femmes pieuses de Nouvelle-Angleterre (1668-1735), ces femmes ordinaires que l'histoire oublie. Devenue slogan sur des tee-shirts et des tasses, elle a fini par donner son titre à un livre d'Ulrich, en 2007." },
```

Sources :
- https://news.harvard.edu/gazette/?p=6870 (*Harvard Gazette*, 20 septembre 2007, lu par l'API du site) : « in the
  1970s, Laurel Thatcher Ulrich penned in a scholarly article about the funeral sermons of Christian women that
  "Well-behaved women seldom make history." The phrase subsequently gained wide popularity, appearing on T-shirts,
  coffee mugs, and other items — and it's now the title of Ulrich's latest book. »
- https://quoteinvestigator.com/2012/11/03/well-behaved-women/ : plus ancienne trace, Ulrich, « Vertuous Women Found:
  New England Ministerial Literature, 1668-1735 », *American Quarterly*, 1976 ; attributions à Monroe, Eleanor
  Roosevelt et Anne Boleyn relevées sur les réseaux sociaux.
Mode : sources de référence concordantes. Remarques : l'année 1976 ne repose que sur Quote Investigator (Crossref ne
trouve que la réédition de l'article dans *Women in American Religion*, 1980), d'où « des années 1970 » ; la date de la
première attribution à Monroe n'est pas affichée (Quote Investigator seul). Traduction : « seldom » rendu par
« rarement », « well-behaved » par « bien sages ».

Contre-vérification : À CORRIGER (bloc corrigé, détail). *Harvard Gazette* et Quote Investigator relus, concordants
(article des années 1970, tee-shirts et tasses, livre de 2007). « puritaines » n'est dans aucune des deux sources
(« Christian women », « pious matrons », « New England Ministerial Literature, 1668-1735 ») : remplacé par « pieuses de
Nouvelle-Angleterre (1668-1735) ». Traduction fidèle.

---

## Écartés

- **Henry Kissinger, « Qui dois-je appeler si je veux appeler l'Europe ? »** : Kissinger a dit en 2012 à Varsovie
  « I am not sure I actually said it », en l'attribuant à un ministre irlandais (AP, 27 juin 2012, lu sur
  https://www.foxnews.com/world/kissinger-says-calling-europe-quote-not-likely-his). La chronique de Gideon Rachman
  citant Peter Rodman (« the saying is apocryphal ») n'a pas pu être lue (thejc.com, 429) ; l'article d'EUobserver
  (Bernd Halling, 2003, « This story is apocryphal ») est une tribune. Aucune première trace établie : incertain.
- **Picasso, « Les bons artistes copient, les grands artistes volent »** : Quote Investigator
  (https://quoteinvestigator.com/2013/03/06/artists-steal/) : « QI has not yet located substantive evidence for the
  attribution to Picasso » ; Steve Jobs l'attribue à Picasso en 1996 (PBS, page refusée en 403). Formule proche,
  vérifiée sur la source primaire : T. S. Eliot, *The Sacred Wood*, Methuen, 1920 (archive.org,
  `sacredwoodessays00eliorich`) : « Immature poets imitate; mature poets steal ». Seule seconde source trouvée : un
  essai de Kirby Ferguson (everythingisaremix.info), pas une source de référence. À reproposer avec une seconde source.
- **Senghor, « L'émotion est nègre, comme la raison hellène »** (authentique, 1939, « Ce que l'homme noir apporte ») :
  une seule source sérieuse lue, la Stanford Encyclopedia of Philosophy, « Négritude »
  (https://plato.stanford.edu/entries/negritude/ : « “L'émotion est nègre, comme la raison héllène” (Senghor 1964,
  288) », dans « the same 1939 essay »). Autres sources (Érudit, CORE, Masaryk) refusées. À reproposer.
- **Laplace, « Ce que nous connaissons est peu de chose, ce que nous ignorons est immense »** (derniers mots rapportés
  par Fourier dans son éloge) : éloge de Fourier non trouvé en ligne dans le temps imparti. Non vérifié.
- **Kelvin, « Il n'y a plus rien à découvrir en physique »** : aucune source de référence trouvée pour Kelvin ; Quote
  Investigator (https://quoteinvestigator.com/2026/05/20/physics-holes/) traite d'une phrase voisine prêtée par Planck
  à Philipp von Jolly. Non retenu.

### Gorbatchev, « celui qui arrive trop tard »

```js
  { id: "gorbatchev-retard", niveau: 3, texte: "Celui qui arrive trop tard est puni par la vie.", auteur: "Mikhaïl Gorbatchev", statut: "deformee",
    explication: "À Berlin-Est, en octobre 1989, pendant les fêtes des 40 ans de la RDA, il dit devant les caméras : « Je crois que les dangers ne guettent que ceux qui ne réagissent pas à la vie. » La formule ramassée apparaît dans les dépêches du 7 octobre, d'après une déclaration de son porte-parole, Guennadi Guerassimov. Gorbatchev l'a ensuite reprise à son compte, et écrit dans ses mémoires l'avoir dite à Erich Honecker en tête à tête." },
```

Sources :
- https://www.t-online.de/nachrichten/deutschland/id_71515534/-wer-zu-spaet-kommt-ein-legendaerer-satz-und-seine-geschichte-.html
  (article d'après la dpa) : le reporter de la dpa Heinz Joachim Schöttes : « Er sagte vor der Neuen Wache: 'Ich glaube,
  Gefahren lauern nur auf jene, die nicht auf das Leben reagieren.' » ; « Gorbatschow schrieb später in seinen Memoiren,
  es sei in einem Vier-Augen-Gespräch mit Honecker gefallen » ; première apparition « am 7. Oktober gegen 18.30 Uhr […]
  in zwei Tickermeldungen der Nachrichtenagenturen dpa und Associated Press » ; « der Sprecher von Gorbatschow, Gennadi
  Gerassimow, […] gab ein Statement seines Chefs ab » ; « Was Gerassimow tatsächlich gesagt hatte, ist nicht mehr zu
  klären. Gorbatschow fühlte sich aber offenbar so gut interpretiert, dass er "Wer zu spät kommt, den bestraft das
  Leben" später als eigenen Ausspruch übernahm. »
- https://www.srf.ch/kultur/der-archivar-ein-jahrhundertsatz-wer-zu-spaet-kommt-den-bestraft-das-leben (SRF) : « die
  Wendung, die Gorbatschow tatsächlich sagte «Gefahren lauern auf diejenigen, die nicht auf das Leben reagieren» » ;
  mémoires (« Alles zu seiner Zeit », Hoffmann und Campe, 2013) : « Vier-Augen-Gespräch zu Erich Honecker » ;
  Gerassimow, conférence de presse du 7 octobre : « Those who are late will be punished by life itself. »
Mode : indirect, deux sources concordantes. Points douteux : t-online date la scène de la Neue Wache du 6 octobre, une
autre source (Wikiquote, non comptée) du 7 : d'où « en octobre 1989 ». Les deux sources divergent sur la naissance
exacte de la formule (traduction concertée de deux journalistes selon t-online, citation en anglais de Guerassimov selon
SRF) : l'explication s'en tient à « d'après une déclaration de son porte-parole ».

Contre-vérification : REJETÉ. t-online (dpa) et SRF relus : la phrase publique devant la Neue Wache (6 octobre selon
les deux) est bien différente, mais Gorbatchev affirme dans ses mémoires avoir dit la formule à Honecker en tête à tête,
et Guerassimov l'a donnée le 7 octobre comme citation littérale ; t-online : « Was er damals wirklich zu Honecker sagte,
lässt sich heute nicht mehr nachvollziehen. » Le statut « deformee » n'est donc pas sûr (« authentique » se défend
aussi) : la réponse juste est ambiguë.

### Hugo, l'idée dont l'heure est venue

```js
  { id: "hugo-idees", niveau: 2, texte: "Rien n'est plus puissant qu'une idée dont l'heure est venue.", auteur: "Victor Hugo", statut: "deformee",
    explication: "Hugo a écrit autre chose, dans la conclusion d'« Histoire d'un crime » (1877-1878) : « On résiste à l'invasion des armées ; on ne résiste pas à l'invasion des idées. » La version sur « l'idée dont l'heure est venue », plus frappante, lui a été prêtée ensuite." },
```

Sources :
- Victor Hugo, *Histoire d'un crime*, t. II, Calmann Lévy, 1878, « Conclusion. La chute », p. 331, texte OCR lu
  (https://archive.org/download/histoireduncrim03hugogoog/histoireduncrim03hugogoog_djvu.txt) : « Tout le phénomène
  actuel est dans ces quelques mots. On résiste à l'invasion des armées ; on ne résiste pas à l'invasion des idées. »
  Mode : primaire.
- https://quoteinvestigator.com/2023/11/05/powerful-idea/ : « in 1877 Victor Hugo published "Histoire d'un crime" […]
  "An invasion of armies can be resisted; an invasion of ideas cannot be resisted." In the twentieth and twenty-first
  centuries many variations of this notion have proliferated ». Concordant.
Remarque : Quote Investigator relève une formule plus proche chez Émile Souvestre (1848) ; source unique, non affichée.

Contre-vérification : REJETÉ. Phrase de Hugo relue (archive.org, *Histoire d'un crime*, p. 331, « On résiste à
l'invasion des armées ; on ne résiste pas à l'invasion des idées »). Mais la conclusion de Quote Investigator, relue,
fait remonter la forme « l'idée dont le temps est venu » à Émile Souvestre (*Revue des deux mondes*, 1848) et à Gustave
Aimard (1861), avant Hugo : la version populaire ne déforme pas forcément la phrase de Hugo, et « apocryphe » se défend
autant que « deformee ». L'explication, qui la présente comme dérivée de Hugo, serait trompeuse ; Souvestre ne repose
que sur une source.
