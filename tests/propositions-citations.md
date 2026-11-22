# Propositions pour le stock `CITATIONS` (22 novembre 2026)

> **Bilan de la contre-vérification (22 novembre 2026)** : 20 éléments examinés ; **10 validés** (thatcher-societe,
> mitterrand-nationalisme, mao-fusil, king-arc, galilee-livre, deng-chat, gandhi-ignorer, orwell-verite, mandela-peur,
> aristote-habitude), **8 à corriger** (mandela-education, laozi-pas, planck-funerailles, sunzi, lenine-idiots,
> bismarck-saucisses, confucius-travail, churchill-electeur ; blocs de code déjà corrigés ci-dessous), **2 rejetés**,
> déplacés dans « Écartés » (wilde-soi : une seule source secondaire sérieuse lisible ; brioche : doublon de l'élément
> `brioche` de `VRAI_FAUX`). Après corrections, sunzi passe de « deformee » à « authentique » : le lot retenu compte
> 7 « authentique », 2 « deformee », 9 « apocryphe ». Les trois statuts
> employés (`authentique`, `deformee`, `apocryphe`) sont bien ceux qu'acceptent `static/experiences.js` (l. 1208) et
> `static/app.js` (l. 825). Aucun identifiant ne double un identifiant de `CITATIONS`. Règle appliquée : un fait que
> seul Quote Investigator (ou seul Wikipédia, Wikiquote, Popik) établit est retiré de l'explication.

Vingt citations nouvelles, absentes du stock actuel (`static/jeux-donnees.js`). Rien n'a été modifié dans `static/`.
Les blocs sont prêts à coller dans `CITATIONS` ; il reste à leur donner `depuis:` au moment de l'ajout, puis à
lancer la chaîne de traduction (`tests/en/extraire.py --manquants`, `ajouter.py`, `controle.py`).

Répartition : 7 « authentique », 3 « deformee », 10 « apocryphe ». Responsables politiques et figures de la
géopolitique des XXe et XXIe siècles : Thatcher, Mitterrand, Mao, Mandela (deux), King, Deng, Lénine, Churchill
(9), plus Bismarck et Marie-Antoinette. Scientifiques : Galilée, Planck. Écrivains : Orwell, Wilde. Philosophes :
Aristote, Lao-tseu, Confucius. Figures non européennes : Mao, Deng, Mandela, Gandhi, Sun Tzu, Lao-tseu, Confucius, King.

Les traductions françaises des passages anglais, chinois et italiens sont les miennes, faites sur le texte lu.

---

## Authentiques

### 1. Thatcher, la société

```js
  { id: "thatcher-societe", niveau: 3, texte: "La société, ça n'existe pas.", auteur: "Margaret Thatcher", statut: "authentique",
    explication: "Entretien au magazine « Woman's Own », à Downing Street, le 23 septembre 1987 : « There is no such thing as society. » Elle vise l'idée que l'État doit tout régler, et parle aussitôt d'une « tapisserie vivante d'hommes et de femmes » dont chacun doit aider les plus malheureux." },
```

Sources : https://www.margaretthatcher.org/document/106689 (Margaret Thatcher Foundation, transcription du COI,
Churchill Archive Centre, THCR5/2/262 ; lue avec curl, WebFetch refusé). Passage décisif : « If children have a
problem, it is society that is at fault. There is no such thing as society. There is living tapestry of men and women
and people and the beauty of that tapestry and the quality of our lives will depend upon how much each of us is
prepared to take responsibility for ourselves and each of us prepared to turn round and help by our own efforts those
who are unfortunate. » Plus haut : « who is society? There is no such thing! There are individual men and women and
there are families ». Fiche : « 1987 Sep 23 », « Venue: No.10 Downing Street », « Journalist: Douglas Keay », version
remaniée publiée le 31 octobre 1987. Mode : primaire.

Contre-vérification : VALIDÉ. Transcription de la Thatcher Foundation relue (curl) : « who is society? There is no
such thing! », « There is no such thing as society. There is living tapestry of men and women… », « 1987 Sep 23 »,
Douglas Keay, Downing Street. Source indépendante : Ipsos, « "No such thing as society"? »
(https://www.ipsos.com/en-uk/no-such-thing-society), qui cite l'entretien de « Woman's Own » (1987) et son contexte.

### 2. Mitterrand, le nationalisme

```js
  { id: "mitterrand-nationalisme", niveau: 2, texte: "Le nationalisme, c'est la guerre.", auteur: "François Mitterrand", statut: "authentique",
    explication: "Devant le Parlement européen, à Strasbourg, le 17 janvier 1995, après avoir raconté sa captivité en Allemagne : « il faut vaincre notre histoire et pourtant si on ne la vainc pas, il faut savoir qu'une règle s'imposera […] : le nationalisme, c'est la guerre ! »" },
```

Sources : https://www.elysee.fr/francois-mitterrand/1995/01/17/discours-de-m-francois-mitterrand-president-de-la-republique-sur-le-programme-de-la-presidence-francaise-de-lunion-europeenne-notamment-en-matiere-delargissement-dunion-economique-et-monetaire-dorganisation-de-leurope-sociale-didentite-cultu
(texte intégral, Élysée). Passage décisif : « Il faut vaincre ses préjugés. - Ce que je vous demande là est presque
impossible, car il faut vaincre notre histoire et pourtant si on ne la vainc pas, il faut savoir qu'une règle
s'imposera, mesdames et messieurs : le nationalisme, c'est la guerre ! La guerre ce n'est pas seulement le passé, cela
peut être notre avenir ». Plus haut : « lorsque j'étais prisonnier, en cours d'évasion. J'ai rencontré des Allemands
et puis j'ai vécu quelques temps en Bade-Wurtemberg dans une prison ». Mode : primaire.

Contre-vérification : VALIDÉ. Texte de l'Élysée relu (curl) : les deux passages cités y sont mot pour mot, avec
« Strasbourg » et « 17 janvier 1995 ». Source indépendante : VPRO, « François Mitterrand 17-01-1995 »
(https://www.vpro.nl/zomergasten/artikelen/francois-mitterrand-17-01-1995), qui rend le passage par « Nationalisme is
oorlog » ; le même texte figure sur vie-publique.fr.

### 3. Mao, le fusil

```js
  { id: "mao-fusil", niveau: 2, texte: "Le pouvoir est au bout du fusil.", auteur: "Mao Zedong", statut: "authentique",
    explication: "« Problèmes de la guerre et de la stratégie », 6 novembre 1938 : « Le pouvoir politique est au bout du fusil. » La phrase qui suit est moins citée : « Notre principe, c'est que le Parti commande au fusil, et que le fusil ne doit jamais commander au Parti. »" },
```

Sources : https://www.marxists.org/reference/archive/mao/selected-works/volume-2/mswv2_12.htm (Œuvres choisies,
tome II, traduction anglaise officielle). Passage décisif : « Every Communist must grasp the truth, "Political power
grows out of the barrel of a gun." Our principle is that the Party commands the gun, and the gun must never be allowed
to command the Party. » Date : « November 6, 1938 ». Mode : primaire (traduction officielle des Œuvres choisies).

Contre-vérification : VALIDÉ. Page marxists.org relue : passage et date exacts. Source indépendante :
Encyclopædia Universalis, article « Mao Zedong » (https://www.universalis.fr/encyclopedie/mao-zedong-mao-tse-toung/5-l-exercice-avant-la-conquete-du-pouvoir-1936-1945/),
qui date la formule de novembre 1938. Remarque sans incidence : Mao l'avait déjà employée en 1927 (selon Wikipédia
seulement) ; l'explication ne prétend pas que 1938 soit la première fois.

### 4. Mandela, l'éducation

```js
  { id: "mandela-education", niveau: 2, texte: "L'éducation est l'arme la plus puissante pour changer le monde.", auteur: "Nelson Mandela", statut: "authentique",
    explication: "Elle a tout d'une phrase de poster, mais elle est de lui : discours au lancement du réseau éducatif Mindset, à l'université du Witwatersrand, à Johannesburg, le 16 juillet 2003 : « L'éducation est l'arme la plus puissante que nous puissions utiliser pour changer le monde »." },
```

Sources :
- http://web.archive.org/web/20220706044626/http://db.nelsonmandela.org/speeches/pub_view.asp?pg=item&ItemID=NMS909
  (base des discours de la Fondation Nelson Mandela, archivée ; la page actuelle
  https://archive.nelsonmandela.org/index.php/za-com-mr-s-909 refuse la lecture automatique, 403). Fiche : « Lighting
  your way to a better future », « Occasion: Launch of Mindset Network Place: Planetarium, University of the
  Witwatersrand Johannesburg South Africa Date: 16 July 2003 ». Passage décisif : « Education is the most powerful
  weapon we can use to change the world and Mindset Network is a powerful part of that world changing arsenal. »
  Mode : primaire (copie archivée).
- 1990 : https://barrypopik.com/blog/education_is_the_most_powerful_weapon (cite l'Orange County Register du 24 juin
  1990, reprenant le Boston Globe : « Education is the most powerful weapon which you can use », devant des écoliers de
  Roxbury) et https://en.wikiquote.org/wiki/Nelson_Mandela (« education is the most powerful weapon which we can
  use. » ; « Speech, Madison Park High School, Boston, 23 June 1990 », renvoyant à WGBH et au Boston Globe, 2013).
  Mode : indirect, vérifié via Popik et Wikiquote, qui citent la presse de Boston.

Contre-vérification : À CORRIGER. Le discours de 2003 est confirmé sur la copie archivée de la base de la Fondation
(relue) : la phrase figure dans la partie « Verbatim speech » (Mandela s'est écarté de son texte préparé, et la phrase
est dans les deux versions), « Date: 16 July 2003 », « Planetarium, University of the Witwatersrand ». En revanche,
l'usage de 1990 ne repose que sur Popik (blog, qui cite l'Orange County Register et l'« Oxford Treasury of Sayings and
Quotations », OUP, 2011) et Wikiquote ; WGBH (https://www.wgbh.org/news/local/2013-12-06/madison-park-reacts-to-nelson-mandelas-death)
confirme la visite de 1990 à Madison Park et son message sur l'éducation, mais pas le mot « arme ». Correction : phrase
sur 1990 retirée, remplacée par la citation exacte de 2003 (bloc corrigé). Traduction fidèle de « the most powerful
weapon we can use to change the world ».

### 5. Martin Luther King, l'arc de l'univers moral

```js
  { id: "king-arc", niveau: 3, texte: "L'arc de l'univers moral est long, mais il penche vers la justice.", auteur: "Martin Luther King", statut: "authentique",
    explication: "King l'a bien dite, notamment à Montgomery, en Alabama, le 25 mars 1965 : « Combien de temps ? Pas longtemps, car l'arc de l'univers moral est long, mais il penche vers la justice. » Mais il citait : dès 1958, il la mettait entre guillemets. L'image vient d'un sermon du pasteur abolitionniste Theodore Parker, publié en 1853." },
```

Sources :
- https://kinginstitute.stanford.edu/our-god-marching (Martin Luther King, Jr. Research and Education Institute,
  Stanford) : « Our God is Marching On! », « 25 March 1965 », « Montgomery, Ala. » ; « How long? Not long, because the
  arc of the moral universe is long, but it bends toward justice. » Mode : primaire.
- https://quoteinvestigator.com/2012/11/15/arc-of-universe/ : Theodore Parker, « Of Justice and the Conscience »,
  *Ten Sermons of Religion*, Boston, Crosby, Nichols and Company, 1853 : « I do not pretend to understand the moral
  universe, the arc is a long one, my eye reaches but little ways […] But from what I see I am sure it bends towards
  justice. » ; King, « Out of the Long Night », *The Gospel Messenger*, 8 février 1958, avec la phrase entre
  guillemets. Mode : indirect via Quote Investigator, qui cite Parker et King.

Contre-vérification : VALIDÉ. Page du King Institute relue (« 25 March 1965 », « Montgomery, Ala. », phrase exacte).
1958 relu sur la source primaire : *The Gospel Messenger*, volume 1958 numérisé
(https://archive.org/details/gospelmessengerv107mors, texte OCR), numéro du « FEBRUARY 8, 1958 », sommaire « Out of
the Long Night. Martin Luther King, Jr. », et dans l'article : « Yes, "the arc of the moral universe is long, but it
bends toward justice." » (entre guillemets). Parker, 1853, confirmé par deux sources indépendantes : NPR, « Theodore
Parker And The 'Moral Universe' », 2 septembre 2010 (Clayborne Carson, directeur du King Institute, lit « the 1853
sermon by Theodore Parker »), https://www.npr.org/2010/09/02/129609461/theodore-parker-and-the-moral-universe ; National
Park Service, « King and Longfellow » (« an 1853 sermon by Parker »), https://www.nps.gov/articles/king-and-longfellow-power-of-words.htm.

### 6. Galilée, le livre de l'univers

```js
  { id: "galilee-livre", niveau: 3, texte: "Le grand livre de l'univers est écrit en langue mathématique.", auteur: "Galilée", statut: "authentique",
    explication: "« L'Essayeur » (« Il Saggiatore », 1623) : la philosophie « est écrite dans ce très grand livre continuellement ouvert devant nos yeux (je veux dire l'univers) », et « il est écrit en langue mathématique ». Galilée répond à un adversaire qui croit qu'il faut toujours s'appuyer sur l'opinion d'un auteur célèbre." },
```

Sources : https://it.wikisource.org/wiki/Il_Saggiatore/6 (texte lu en source brute, chapitre 6). Passage décisif :
« La filosofia è scritta in questo grandissimo libro che continuamente ci sta aperto innanzi a gli occhi (io dico
l'universo), ma non si può intendere se prima non s'impara a intender la lingua, e conoscer i caratteri, ne' quali è
scritto. Egli è scritto in lingua matematica, e i caratteri son triangoli, cerchi, ed altre figure geometriche ».
Juste avant : « Parmi […] di scorgere nel Sarsi ferma credenza, che nel filosofare sia necessario appoggiarsi
all'opinioni di qualche celebre autore ». La date de 1623 figure dans la notice Wikisource (« Il Saggiatore - Capitolo
VI Galileo Galilei 1623 »). Mode : primaire.

Contre-vérification : VALIDÉ. Texte source de Wikisource relu : les deux passages y sont mot pour mot. La forme
courte du `texte` condense fidèlement « questo grandissimo libro […] (io dico l'universo) […] è scritto in lingua
matematica ». Source indépendante : Stanford Encyclopedia of Philosophy, « Galileo Galilei »
(https://plato.stanford.edu/entries/galileo/) : « In 1623, Galileo published The Assayer […] This book includes some of
Galileo's most famous methodological pronouncements ».

### 7. Lao-tseu, le voyage de mille lieues

```js
  { id: "laozi-pas", niveau: 2, texte: "Un voyage de mille lieues commence par un premier pas.", auteur: "Lao-tseu", statut: "authentique",
    explication: "« Tao-tö-king », le livre que la tradition lui attribue, chapitre 64, mot à mot : « Le voyage de mille li commence sous les pieds. » Stanislas Julien traduisait en 1842 : « un voyage de mille lis a commencé par un pas ». Le passage conseille d'agir sur les choses avant qu'elles n'existent, de mettre en ordre avant le désordre : l'arbre le plus large est né d'une pousse fine comme un poil." },
```

Sources : https://zh.wikisource.org/wiki/道德經_(王弼本) (édition de Wang Bi, source brute lue, section
« 六十四章 »). Passage décisif : « 為之於未有，治之於未亂。合抱之木，生於毫末；九層之臺，起於累土；千里之行，始於足下。 »
Mode : primaire. Remarque : l'attribution du livre à Lao-tseu est traditionnelle ; si on veut l'éviter, mettre
`auteur: "Lao-tseu, « Tao-tö-king »"`.

Contre-vérification : À CORRIGER. Texte chinois de Wang Bi relu sur zh.wikisource : « 合抱之木，生於毫末；九層之臺，起於累土；千
里之行，始於足下。 » ; le mot à mot « commence sous les pieds » est juste. Traduction française publiée comparée :
Stanislas Julien, *Le Livre de la voie et de la vertu*, Imprimerie nationale, 1842, chapitre 64
(https://fr.wikisource.org/wiki/Tao_Te_King_(Stanislas_Julien)/Chapitre_64) : « Un arbre d'une grande circonférence est
né d'une racine aussi déliée qu'un cheveu ; une tour de neuf étages est sortie d'une poignée de terre ; un voyage de
mille lis a commencé par un pas ». La forme populaire est donc fidèle à la traduction française de référence, et le
statut « authentique » tient. Corrections : (1) l'attribution du livre à Lao-tseu est discutée — Stanford Encyclopedia
of Philosophy, « Laozi » (https://plato.stanford.edu/entries/laozi/) : « According to some modern scholars, however,
Laozi is entirely legendary » — d'où « le livre que la tradition lui attribue » ; (2) « l'arbre qu'on embrasse à
peine » rend mal 合抱 (un arbre si gros qu'il faut les deux bras pour l'entourer ; Julien : « d'une grande
circonférence ») : remplacé par « l'arbre le plus large » ; (3) la traduction de Julien est ajoutée pour montrer que le
« premier pas » n'est pas une déformation moderne. Bloc corrigé.

---

## Déformées

### 8. Deng Xiaoping, le chat

```js
  { id: "deng-chat", niveau: 2, texte: "Peu importe que le chat soit blanc ou noir, pourvu qu'il attrape les souris.", auteur: "Deng Xiaoping", statut: "deformee",
    explication: "Le 7 juillet 1962, devant la Ligue de la jeunesse communiste, Deng reprend un proverbe du Sichuan que citait souvent Liu Bocheng : « Peu importe que le chat soit jaune ou noir, pourvu qu'il attrape les souris. » Le chat jaune est devenu blanc en route ; l'idée reste : juger une organisation agricole à ses résultats." },
```

Sources : https://www.marxists.org/reference/archive/deng-xiaoping/1962/190.htm (« Restore Agricultural
Production », Œuvres choisies de Deng Xiaoping, tome I, traduction anglaise). Passage décisif : « Comrade Liu Bocheng
often quotes a Sichuan proverb: "It does not matter if it is a yellow cat or a black cat, as long as it catches
mice." » ; « July 7, 1962 », « talk to all the comrades attending the Seventh Plenary Session of the Third Central
Committee of the Chinese Communist Youth League ». Mode : primaire (traduction officielle).

Contre-vérification : VALIDÉ. Page marxists.org relue (passage et date exacts). Source indépendante, texte chinois
officiel : Qiushi, *Œuvres choisies de Deng Xiaoping*, tome I, « 怎样恢复农业生产 (一九六二年七月七日) »
(https://www.qstheory.cn/books/2019-07/31/c_1119483619_40.htm) : « 刘伯承同志经常讲一句四川话：“黄猫、黑猫，只要捉住老鼠就是好猫。” » ;
et le site du Quotidien du peuple (https://cpc.people.com.cn/n/2013/0819/c69710-22616439.html), qui titre sur la
forme populaire « 不管白猫黑猫 » et précise que l'original de 1962 dit « 黄猫、黑猫 ». Le statut « deformee » est justifié.

### 9. Planck, d'enterrement en enterrement

```js
  { id: "planck-funerailles", niveau: 3, texte: "La science progresse d'enterrement en enterrement.", auteur: "Max Planck", statut: "deformee",
    explication: "Planck écrit, dans son autobiographie scientifique, qu'une vérité scientifique nouvelle ne triomphe pas en convainquant ses adversaires, mais parce que ceux-ci finissent par mourir et qu'une nouvelle génération grandit en la connaissant. La formule courte, plus frappante, est une reprise plus tardive." },
```

Sources :
- https://quoteinvestigator.com/2017/09/25/progress/ : Planck, « Persönliche Erinnerungen aus alten Zeiten », *Die
  Naturwissenschaften*, 1946, vol. 33, n° 8, p. 235 (« Eine neue wissenschaftliche Wahrheit pflegt sich nicht in der
  Weise durchzusetzen… ») ; traduction de Frank Gaynor, *Scientific Autobiography and Other Papers*, 1949, p. 33-34 :
  « a new scientific truth does not triumph by convincing its opponents and making them see the light » ; Paul A.
  Samuelson, *Newsweek*, 16 juin 1975, premier emploi de « funeral by funeral ». Conclusion : l'idée à Planck, la
  formule à Samuelson.
- https://en.wikipedia.org/wiki/Planck%27s_principle (source brute lue) : même passage, « A new scientific truth does
  not triumph by convincing its opponents and making them see the light, but rather because its opponents eventually
  die and a new generation grows up that is familiar with it », renvoyant au livre (exemplaire archive.org en prêt
  contrôlé, non lisible) et à Quote Investigator pour Samuelson.
Mode : indirect, vérifié via Quote Investigator et Wikipédia, qui citent Planck (1946, 1949).

Contre-vérification : À CORRIGER. Quote Investigator relu (passages conformes ; sa conclusion est prudente :
« evidence suggests that it was Samuelson who first expressed the notion concisely », et Samuelson lui-même renvoyait à
Planck, Kuhn et un « anonymous sage »). Seconde source sérieuse et indépendante pour le texte de Planck : Pierre
Azoulay, Christian Fons-Rosen et Joshua S. Graff Zivin, « Does Science Advance One Funeral at a Time? », NBER Working
Paper 21788 (2015), publié dans l'*American Economic Review* en 2019
(https://www.nber.org/system/files/working_papers/w21788/w21788.pdf, lu) : épigraphe « …but rather because its
opponents eventually die, and a new generation grows up that is familiar with it. » Max Planck, *Scientific
Autobiography and Other Papers*. Le statut « deformee » tient. Mais l'article de 1946 et l'attribution de la formule
courte à Samuelson (1975) ne reposent que sur Quote Investigator (aucune autre source trouvée pour Samuelson) :
retirés. Traduction de « grows up that is familiar with it » ajustée (« grandit en la connaissant »). Bloc corrigé.

### 10. Sun Tzu, connaître l'ennemi

```js
  { id: "sunzi", niveau: 2, texte: "Connais ton ennemi et connais-toi toi-même.", auteur: "Sun Tzu", statut: "authentique",
    explication: "« L'Art de la guerre », chapitre III. La suite varie selon les traductions : celle du jésuite Amiot, qui a fait connaître le livre en France au XVIIIe siècle, promet « cent fois vous serez victorieux », alors que le texte chinois dit seulement qu'on « ne sera pas en péril en cent combats ». Qui se connaît sans connaître l'autre gagne une fois sur deux ; qui ne connaît ni l'un ni l'autre est en péril à chaque combat." },
```

Sources : https://zh.wikisource.org/wiki/孫子兵法 (source brute lue, section « 謀攻第三 »). Passage décisif :
« 故曰：知彼知己，百戰不殆；不知彼而知己，一勝一負；不知彼不知己，每戰必殆。 » (殆 : « péril », pas « victoire »).
Mode : primaire. Point à surveiller : le statut « deformee » repose sur l'écart entre « sans péril » et « cent
victoires » ; la forme populaire varie selon les traductions (je n'ai pas lu celle d'Amiot). Si l'on préfère,
remplacer le texte par « Connais ton ennemi et connais-toi toi-même. » et passer le statut à « authentique ».

Contre-vérification : À CORRIGER (repli appliqué). Texte chinois relu sur zh.wikisource (謀攻第三) : « 知彼知己，百戰不殆；
不知彼而知己，一勝一負；不知彼不知己，每戰必殆。 ». Mais la traduction d'Amiot, la plus diffusée en France, dit bien la
victoire : Sun Tzu, *L'Art de la guerre, les treize articles*, traduction de Joseph-Marie Amiot, Mille et une nuits,
1996, sur Wikisource (https://fr.wikisource.org/wiki/L%E2%80%99Art_de_la_guerre) : « Connais ton ennemi et connais-toi
toi-même ; eussiez-vous cent guerres à soutenir, cent fois vous serez victorieux. Si tu ignores ton ennemi et que tu te
connais toi-même, tes chances de perdre et de gagner seront égales. » Un joueur qui a lu Amiot répondrait
« authentique » : la réponse « deformee » serait ambiguë. Repli : texte réduit à la partie qui ne fait pas débat,
statut « authentique », et l'écart Amiot / texte chinois expliqué (bloc corrigé). La date d'Amiot n'est pas donnée au
mot près (l'édition lue est de 1996 ; l'édition de 1772 n'a pas été lue), d'où « au XVIIIe siècle ».

---

## Apocryphes

### 11. Gandhi, « d'abord ils vous ignorent »

```js
  { id: "gandhi-ignorer", niveau: 2, texte: "D'abord ils vous ignorent, puis ils se moquent de vous, puis ils vous combattent, et puis vous gagnez.", auteur: "Gandhi", statut: "apocryphe",
    explication: "Rien ne l'atteste chez Gandhi : le lien avec lui n'apparaît qu'en 1982. La gradation vient d'un syndicaliste américain, Nicholas Klein, en 1918 : « D'abord ils vous ignorent. Puis ils vous ridiculisent. Puis ils vous attaquent et veulent vous brûler. Et puis ils vous élèvent des monuments. »" },
```

Sources : https://quoteinvestigator.com/2017/08/13/stages/ . Passages décisifs : « In conclusion, QI has located no
substantive support for ascribing the saying to Mohandas Gandhi. » ; Nicholas Klein, Third Biennial Convention of the
Amalgamated Clothing Workers of America, Baltimore, 15 mai 1918 : « First they ignore you. Then they ridicule you. And
then they attack you and want to burn you. […] And then they build monuments to you. » ; première attribution à
Gandhi : article de Peter D. Jones, revue *WIN*, 1982. Mode : source de référence (Quote Investigator).

Contre-vérification : VALIDÉ. Quote Investigator relu (conclusion, discours de Klein du 15 mai 1918 et citation de
1982 conformes). Source indépendante : PolitiFact, « Donald Trump falls for phony Gandhi quote », 4 mars 2016
(https://www.politifact.com/factchecks/2016/mar/04/donald-trump/donald-trump-falls-phony-gandhi-quote/, lu) : discours
de Nicholas Klein du « May 15, 1918 » (« First they ignore you. Then they ridicule you… ») et, selon Barry Popik, première
attribution à Gandhi dans des actes de 1982 (« We have 1918 […] and 1982 […] and just about nothing in between »).
Traduction de Klein fidèle.

### 12. Orwell, dire la vérité

```js
  { id: "orwell-verite", niveau: 3, texte: "En des temps de tromperie universelle, dire la vérité est un acte révolutionnaire.", auteur: "George Orwell", statut: "apocryphe",
    explication: "Personne ne l'a trouvée dans son œuvre. La plus ancienne trace connue est une épigraphe de 1982, sans le mot « universelle », dans un livre australien sur le commerce de l'uranium ; Orwell était mort en 1950." },
```

Sources : https://quoteinvestigator.com/2013/02/24/truth-revolutionary/ . Passages décisifs : « In conclusion, based
on current evidence George Orwell probably did not employ this saying. » ; « Several researchers have attempted to
find these words in George Orwell's oeuvre and have not succeeded. » ; V. G. Venturini, *Partners in Ecocide:
Australia's Complicity in the Uranium Cartel*, 1982, épigraphe : « In a time of deceit, telling the truth is a
revolutionary act. » Mode : source de référence (Quote Investigator).

Contre-vérification : VALIDÉ. Quote Investigator relu (passages conformes). Source indépendante : *The Independent*,
« Voices: The Top 10 fake George Orwell quotations », liste établie par Benedict Cooper, administrateur de l'Orwell
Society (reprise sur https://sg.news.yahoo.com/voices-top-10-fake-george-080357042.html, lu) : « Appears to have been
first used, without the "universal", and mistakenly attributed to Orwell, in Partners in Ecocide: Australia's
Complicity in the Uranium Cartel, by Venturino Giorgio Venturini in 1982. »

### 13. Mandela, « notre peur la plus profonde »

```js
  { id: "mandela-peur", niveau: 3, texte: "Notre peur la plus profonde n'est pas d'être insuffisants, c'est d'être puissants au-delà de toute mesure.", auteur: "Nelson Mandela, discours d'investiture (1994)", statut: "apocryphe",
    explication: "Le passage vient d'un livre de l'Américaine Marianne Williamson, « A Return to Love » (1992). La Fondation Nelson Mandela a précisé en 2007 qu'il ne figure dans aucun des trois discours prononcés lors de son investiture." },
```

Sources :
- http://web.archive.org/web/20260628173441/https://www.nelsonmandela.org/news/entry/deepest-fear-quote-not-mr-mandelas/
  (communiqué de la Fondation Nelson Mandela, 9 novembre 2007, copie archivée) : « a quote commonly attributed to Mr
  Mandela was in fact never uttered by him. In her book A return to love: Reflections on the principles of a course in
  miracles, Ms Marianne Williamson writes "Our deepest fear is not that we are inadequate. Our deepest fear is that we
  are powerful beyond measure." […] Mr Mandela did not use the quotation in any of the three public addresses at the
  time of his inauguration. » Mode : primaire (archive de la fondation).
- https://quoteinvestigator.com/2019/06/30/deepest/ : HarperCollins, 1992, chapitre 7, p. 165 ; première attribution
  à Mandela, *The Tennessean*, 16 février 1996. Concordant.

Contre-vérification : VALIDÉ. Communiqué archivé de la Fondation Nelson Mandela relu : « Nov 9, 2007 », « never
uttered by him », citation de Williamson et « did not use the quotation in any of the three public addresses at the time
of his inauguration ». Quote Investigator relu, concordant (« The attribution of the words to Nelson Mandela is
incorrect », Williamson, 1992). Traduction fidèle ; le champ `auteur` suit le modèle de `galilee`.

### 14. Lénine, les « idiots utiles »

```js
  { id: "lenine-idiots", niveau: 2, texte: "Les idiots utiles de l'Occident.", auteur: "Lénine", statut: "apocryphe",
    explication: "On ne la trouve dans aucun texte connu de Lénine. L'expression circule dans les années 1940 pour désigner les démocrates qui font le jeu des communistes ; elle n'est prêtée à Lénine, mort en 1924, que plus tard." },
```

Sources :
- https://quoteinvestigator.com/?p=436269 (« Phrase Origin: Useful Idiot ») : « The ascriptions to Vladimir Lenin and
  Joseph Stalin are currently unsupported. » ; *San Francisco Examiner*, 6 avril 1948 : Mario Scelba appelle Pietro
  Nenni le « No. 1 useful idiot » ; attribution à Lénine vérifiée en 1959 (*Congressional Record*, Edward Derwinski),
  une de 1951 non vérifiée.
- https://barrypopik.com/blog/useful_idiot : Grant Harris, Library of Congress, printemps 1987 : « We have not been able
  to identify this phrase [useful idiots of the West] among [Lenin's] published works. »
Mode : sources de référence concordantes (Quote Investigator, Popik citant la bibliothèque du Congrès).

Contre-vérification : À CORRIGER. (1) La phrase sur la bibliothèque du Congrès vient de la chronique de William Safire
(*New York Times*, 12 avril 1987), illisible ici (site bloqué) ; Popik ne fait que reprendre mot pour mot Wikipédia :
retirée. (2) « On la relève en 1948 » est inexact : Quote Investigator relève d'abord, en octobre 1946 (Bogdan
Raditsa, *Reader's Digest*), l'expression serbo-croate « Koristne Budale », que les communistes yougoslaves
appliquaient aux « true democrats who consent to collaborate with them » ; Scelba (1948) vient ensuite. Ces deux dates
ne reposent que sur Quote Investigator (Popik confirme seulement 1948) : remplacées par « dans les années 1940 ».
Statut « apocryphe » confirmé par deux sources : Quote Investigator (« The ascriptions to Vladimir Lenin and Joseph
Stalin are currently unsupported ») et le *Yale Book of Quotations* de Fred Shapiro, cité sur la liste de l'American
Dialect Society (https://listserv.linguistlist.org/pipermail/ads-l/2010-August/101794.html : « Like many other
putative Leninisms, it seems to be a myth »). Formulation prudente retenue : « On ne la trouve dans aucun texte connu de Lénine ». Bloc corrigé.

### 16. Bismarck, les lois et les saucisses

```js
  { id: "bismarck-saucisses", niveau: 3, texte: "Les lois, c'est comme les saucisses : mieux vaut ne pas voir comment on les fait.", auteur: "Otto von Bismarck", statut: "apocryphe",
    explication: "Elle est attribuée en 1869 au poète américain John Godfrey Saxe : « Les lois, comme les saucisses, cessent d'inspirer le respect à mesure qu'on sait comment elles sont faites. » Le nom de Bismarck n'y est accolé que dans les années 1930." },
```

Sources : https://quoteinvestigator.com/2010/07/08/laws-sausages/ . Passages décisifs : *University Chronicle*, Ann
Arbor, 27 mars 1869 : « Laws, like sausages, cease to inspire respect in proportion as we know how they are made. »
(attribuée à Saxe) ; première attribution à Bismarck : Claudius O. Johnson, *Government in the United States*, 1933,
« Johnson expressed uncertainty about the attribution ». Mode : source de référence (Quote Investigator). Le résultat
de recherche signale aussi que l'Oxford Dictionary of Quotations la range parmi les « misquotations » (non lu).

Contre-vérification : À CORRIGER. Quote Investigator relu (University Chronicle du 27 mars 1869, Saxe ; Claudius O.
Johnson, 1933, « expresses uncertainty about the attribution »). Source indépendante : Fred Shapiro, rédacteur du *Yale
Book of Quotations*, blog Freakonomics du *New York Times*, 5 mars 2009
(https://freakonomics.com/2009/03/our-daily-bleg-uncovering-more-quote-authors/, lu) : « the Iron Chancellor was not
associated with that quip until the 1930's. The Daily Cleveland Herald, March 29, 1869, quoted lawyer-poet John Godfrey
Saxe that "Laws, like sausages, cease to inspire respect in proportion as we know how they are made" ». Saxe 1869 et la
traduction sont confirmés. L'année exacte 1933, le « manuel américain » et le « doute » ne reposent que sur Quote
Investigator : remplacés par « dans les années 1930 », formulation de Shapiro. Bloc corrigé.

### 17. Confucius, le travail qu'on aime

```js
  { id: "confucius-travail", niveau: 2, texte: "Choisis un travail que tu aimes, et tu n'auras pas à travailler un seul jour de ta vie.", auteur: "Confucius", statut: "apocryphe",
    explication: "Rien de tel chez Confucius. La plus ancienne trace connue date de 1982, dans le magazine des anciens élèves de Princeton : un professeur de philosophie la tenait d'« un ancien ». Elle n'est prêtée à Confucius que plus tard." },
```

Sources : https://quoteinvestigator.com/2014/09/02/job-love/ . Passages décisifs : « The linkage to Confucius appears
to be spurious. » ; *Princeton Alumni Weekly*, 1982, Arthur Szathmary, qui l'attribue à un « old-timer » ;
*Computerworld*, 3 juin 1985, Glenn Rifkin, épigraphe attribuée à Confucius. Mode : source de référence (Quote
Investigator).

Contre-vérification : À CORRIGER. Quote Investigator relu (conclusion, 1982, Szathmary et « old-timer », 1985
conformes). Source indépendante : *The Saturday Evening Post*, « Don't Love Your Job », Nicholas Gilmore, mai-juin 2021
(https://www.saturdayeveningpost.com/2021/06/dont-love-your-job/, lu) : « it was neither Mark Twain nor Confucius », « the
earliest known reference is in a 1982 Princeton alumni magazine. Confucius never said anything of the kind ». La date de
1985 et le magazine d'informatique ne reposent que sur Quote Investigator : remplacés par « que plus tard », et la
mention du magazine de Princeton est précisée. Bloc corrigé.

### 18. Churchill, l'électeur moyen

```js
  { id: "churchill-electeur", niveau: 3, texte: "Le meilleur argument contre la démocratie, c'est une conversation de cinq minutes avec l'électeur moyen.", auteur: "Winston Churchill", statut: "apocryphe",
    explication: "Introuvable dans ses discours et ses écrits : Richard Langworth, spécialiste de ses citations, la classe parmi les fausses attributions. Churchill disait plutôt, aux Communes en octobre 1944, qu'à la base de tous les hommages rendus à la démocratie il y a « le petit homme qui entre dans le petit isoloir, avec un petit crayon, et trace une petite croix sur un petit bout de papier », et qu'aucun discours ne saurait atténuer l'importance de ce geste." },
```

Sources :
- https://quoteinvestigator.com/2026/07/10/democracy-five/ : « In conclusion, the attribution to Winston Churchill is
  incorrect. » ; « the earliest known matches occurred in 1992. That was more than 25 years after the death of
  Churchill. » (message Usenet d'août 1992).
- https://richardlangworth.com/voter (Richard Langworth, spécialiste des citations de Churchill) : « an ever-popular
  red-herring quote that Churchill never said » ; Chambre des communes, 31 octobre 1944 : « At the bottom of all the
  tributes paid to democracy is the little man, walking into the little booth, with a little pencil, making a little
  cross on a little bit of paper—no amount of rhetoric or voluminous discussion can possibly diminish the overwhelming
  importance of that point. »
Mode : sources de référence concordantes ; la phrase de 1944 est indirecte via Langworth.

Contre-vérification : À CORRIGER. Quote Investigator et Langworth relus (conformes). La phrase de 1944 a été relue sur
la source primaire, le Hansard (https://api.parliament.uk/historic-hansard/commons/1944/oct/31/prolongation-of-parliament-bill,
débat sur le « Prolongation of Parliament Bill », 31 octobre 1944) : « At the bottom of all the tributes paid to
democracy, is the little man, walking into the little booth, with a little pencil, making a little cross on a little
bit of paper—no amount of rhetoric or voluminous discussion can possibly palliate the overwhelming importance of that
point. » Le Hansard dit « palliate » (atténuer), pas « diminish » comme Langworth. Corrections : (1) traduction alignée
sur le Hansard ; (2) la date de 1992 ne repose que sur Quote Investigator (Langworth ne date pas) : remplacée par le
jugement de Langworth, deuxième source lue. Bloc corrigé.

### 19. Aristote, l'excellence est une habitude

```js
  { id: "aristote-habitude", niveau: 3, texte: "Nous sommes ce que nous faisons de manière répétée. L'excellence n'est donc pas un acte, mais une habitude.", auteur: "Aristote", statut: "apocryphe",
    explication: "La phrase est de l'historien américain Will Durant, dans « The Story of Philosophy » (1926), qui résume l'« Éthique à Nicomaque » : il y met les mots d'Aristote entre guillemets, pas ceux-là. L'idée est bien d'Aristote : on devient vertueux en agissant vertueusement." },
```

Sources : https://archive.org/details/in.ernet.dli.2015.264687 (Will Durant, *The Story of Philosophy*, Simon and
Schuster, copyright 1926, texte OCR lu : `2015.264687.The-Story_djvu.txt`). Passage décisif, chapitre sur Aristote :
« Excellence is an art won by training and habituation: we do not act rightly because we have virtue or excellence,
but we rather have these because we have acted rightly; "these virtues are formed in man by his doing the actions";
we are what we repeatedly do. Excellence, then, is not an act but a habit: "the good of man is a working of the soul in
the way of excellence…" » (les guillemets entourent les seules citations de l'*Éthique*, renvoyées en note à
« Ethics, ii »). Mode : primaire (origine réelle). Pas de page de Quote Investigator trouvée ; l'attribution erronée
elle-même n'est datée par aucune source lue, d'où l'absence de date dans l'explication.

Contre-vérification : VALIDÉ. Texte OCR de Durant relu (archive.org, « COPYRIGHT, 1926, by SIMON AND SCHUSTER ») :
passage conforme, les guillemets n'entourent que les citations de l'*Éthique*. La source primaire lue suffit.
Source indépendante cherchée : le fact-check de Check Your Fact (26 juin 2019,
https://checkyourfact.com/2019/06/26/fact-check-aristotle-excellence-habit-repeatedly-do/) va dans le même sens d'après
le moteur de recherche, mais son corps de texte ne s'affiche pas (page chargée par script) : non compté. Le statut « apocryphe »
pour une paraphrase écrite par un autre suit le précédent de `darwin` (paraphrase de Megginson) dans le stock.
Traduction fidèle.

---

## Écartés

### Wilde, « soyez vous-même »

```js
  { id: "wilde-soi", niveau: 2, texte: "Soyez vous-même, les autres sont déjà pris.", auteur: "Oscar Wilde", statut: "apocryphe",
    explication: "Aucune trace chez Wilde, mort en 1900. Le passage le plus proche, dans « De profundis », va dans le même sens, sans la boutade : « La plupart des gens sont d'autres gens. Leurs pensées sont les opinions de quelqu'un d'autre, leur vie une imitation. »" },
```

Sources : https://quoteinvestigator.com/2014/01/20/be-yourself/ . Passages décisifs : « Oscar Wilde did compose
several witticisms about identity and dissimulation, but none was a strong match to the quotation. » ; première
correspondance exacte : message Usenet du 27 décembre 1999, sans attribution ; *De Profundis* (publié en 1905, G. P.
Putnam's Sons, p. 63) : « Most people are other people. Their thoughts are some one else's opinions, their lives a
mimicry… » Mode : source de référence (Quote Investigator).

Contre-vérification : REJETÉ. Motif : une seule source secondaire sérieuse lue. Quote Investigator, relu, est
conforme (aucune correspondance chez Wilde ; première correspondance exacte : Usenet, décembre 1999). Le passage de
*De Profundis* est confirmé sur Wikisource, édition de 1915 (https://en.wikisource.org/wiki/De_Profundis_(Wilde,_1915)/De_Profundis).
Mais les autres sources sont illisibles (San Diego Reader, 403 ; Check Your Fact, 27 août 2019, texte non affiché ;
Professor Buzzkill, AOL) ou sans preuve propre (The Phrase Finder) ; Penguin UK la donne même comme de Wilde, sans
source. Une liste d'AOL citée par le moteur de recherche fait remonter la phrase à une brochure des Narcotiques anonymes
de 1981, ce qui contredit la date de 1999. Deux erreurs dans l'explication, si l'élément revient : « Il a même écrit
l'inverse » est faux (déplorer que les gens soient des copies va dans le même sens que « soyez vous-même ») ; la date
de 1999 est contestée. Le bloc ci-dessus contient déjà la reformulation sur *De Profundis* et ne donne plus de date.
À reproposer avec une seconde source lue.

### Marie-Antoinette, la brioche

```js
  { id: "brioche", niveau: 1, texte: "S'ils n'ont pas de pain, qu'ils mangent de la brioche !", auteur: "Marie-Antoinette", statut: "apocryphe",
    explication: "Rousseau rapporte, au livre VI des « Confessions », s'être souvenu du mot d'« une grande princesse » quand il était précepteur à Lyon. Il l'écrit vers 1765 : Marie-Antoinette, née en 1755, n'arrive en France qu'en 1770. Aucun texte de son vivant ne lui prête la phrase." },
```

Sources :
- https://fr.wikisource.org/wiki/Les_Confessions_(Rousseau)/Livre_VI (texte lu) : « Enfin je me rappelai le pis-aller
  d'une grande princesse à qui l'on disait que les paysans n'avaient pas de pain, et qui répondit : Qu'ils mangent de
  la brioche. J'achetai de la brioche. » ; plus haut : « M. Deybens me proposa l'éducation des enfants de M. de Mably :
  j'acceptai, et je partis pour Lyon ». Mode : primaire (origine réelle).
- https://fr.wikipedia.org/wiki/Qu%27ils_mangent_de_la_brioche_! (source brute lue) : « Confessions écrites en 1765 et
  publiées en 1782 » ; « La princesse à laquelle il fait référence ne peut pas être Marie-Antoinette, puisqu'elle est
  née en 1755 et ne serait arrivée en France qu'en 1770. » ; première attribution connue à la reine : Alphonse Karr,
  *Les Guêpes*, novembre 1841 et avril 1843. Mode : indirect.
Point douteux : « Aucun texte de son vivant ne lui prête la phrase » repose sur Wikipédia (Karr, 1841, premier témoin
connu) et sur l'article de Campion-Vincent et Shojaei Kawan (*Annales historiques de la Révolution française*, n° 327,
2002, https://journals.openedition.org/ahrf/551), illisible ici (filtre anti-robots). L'article de Britannica,
concordant d'après le moteur de recherche, est refusé (403). À relire, ou retirer cette dernière phrase.

Contre-vérification : REJETÉ. Motif : doublon. `VRAI_FAUX` contient déjà l'élément `brioche` (static/jeux-donnees.js,
l. 637 : « Marie-Antoinette a dit : « Qu'ils mangent de la brioche ! » », faux, même explication par Rousseau) ; le même
fait servirait deux fois. Les sources, elles, tiennent après correction, si le propriétaire préfère retirer l'élément de
`VRAI_FAUX` et garder celui-ci :
- Rousseau relu sur Wikisource (passage et départ pour Lyon conformes) ;
- Encyclopædia Britannica, « Did Marie-Antoinette Really Say "Let Them Eat Cake"? » (page refusée en direct, lue sur
  la copie de la Wayback Machine, https://web.archive.org/web/2025/https://www.britannica.com/story/did-marie-antoinette-really-say-let-them-eat-cake) :
  « there is absolutely no historical evidence that Marie-Antoinette ever said "Qu'ils mangent de la brioche" or
  anything like it », « Book VI of Rousseau's Confessions (written about 1767) », « she was still a child », chercheurs
  n'ayant trouvé la phrase dans aucun journal ni pamphlet révolutionnaire, « the earliest known source connecting the
  quote with the queen was published more than 50 years after the French Revolution », *Les Guêpes*, 1843 ;
- Live Science, « Did Marie Antoinette really say "Let them eat cake"? » (https://www.livescience.com/let-the-eat-cake.html,
  lu) : « there's no reliable evidence that the queen ever said it », Rousseau « in 1767 ».
Corrections qu'il faudrait alors : « vers 1765 » → « vers 1767 » (Britannica, Live Science ; Wikipédia seule dit 1765) ;
« née en 1755, n'arrive en France qu'en 1770 » → « n'est alors qu'une enfant » (seule Wikipédia donne ces dates parmi
les sources lues) ; « Aucun texte de son vivant ne lui prête la phrase » → « La plus ancienne source connue qui la lui
prête date des années 1840, un demi-siècle après la Révolution. » Bloc corrigé possible :

```js
  { id: "brioche", niveau: 1, texte: "S'ils n'ont pas de pain, qu'ils mangent de la brioche !", auteur: "Marie-Antoinette", statut: "apocryphe",
    explication: "Rousseau rapporte, au livre VI des « Confessions », écrit vers 1767, le mot d'« une grande princesse » : Marie-Antoinette n'est alors qu'une enfant. Aucun journal ni pamphlet révolutionnaire ne le lui prête ; la plus ancienne source connue qui le fait date des années 1840, un demi-siècle après la Révolution." },
```

Remarque pour le propriétaire (hors de ce fichier) : l'élément `brioche` de `VRAI_FAUX` dit les « Confessions »
« écrites quand Marie-Antoinette avait neuf ans », soit vers 1764-1765 ; Britannica et Live Science disent 1767 (elle
avait onze ou douze ans). À revoir.

### Écartés par l'auteur des propositions


- **Staline, « La mort d'un homme est une tragédie, la mort d'un million, une statistique »** : Quote Investigator
  (https://quoteinvestigator.com/2010/05/21/death-statistic/) ne conclut pas : attribution à Staline seulement à partir
  de Leonard Lyons, *Washington Post*, 30 janvier 1947, sans source ; formule proche chez Kurt Tucholsky en 1925 (« Der
  Tod eines Menschen: das ist eine Katastrophe. Hunderttausend Tote: das ist eine Statistik! »). Incertain.
- **Zhou Enlai, « Il est trop tôt pour le dire » (sur la Révolution française)** : la correction « il parlait de Mai
  68 » repose sur le souvenir de l'interprète Chas Freeman (2011) ; Quote Investigator (2025) juge l'anecdote mal
  sourcée. Débattu.
- **Niels Bohr, « Il est difficile de faire des prédictions, surtout sur l'avenir »** : proverbe danois (Steincke,
  1948), mais Quote Investigator (https://quoteinvestigator.com/2013/10/20/no-predict/) relève « substantive evidence
  that Bohr employed the saying in 1962 or earlier ». Ni apocryphe ni authentique au sens du jeu.
- **Bill Gates, « 640 Ko devraient suffire à tout le monde »** : Gates l'a démentie (1996), mais Quote Investigator
  juge les indices mitigés (propos de 1985 sur la limite de 640 Ko). Incertain.
- **Chef Seattle, « La Terre n'appartient pas à l'homme, c'est l'homme qui appartient à la Terre »** : le discours ne
  repose que sur la reconstitution du docteur Henry A. Smith en 1887 (Jerry L. Clark, *Prologue*, Archives nationales
  des États-Unis, 1985, lu : verdict « Not proven ») ; la phrase viendrait du scénariste Ted Perry (film *Home*,
  1971-1972), mais seuls Wikipédia et un article de presse d'Andy Kerr (1997) le disent dans ce que j'ai pu lire
  (Snopes et le Skeptical Inquirer illisibles). Origine de la phrase précise non établie sur une source de référence.
- **John F. Kennedy, « Ich bin ein Berliner »** (authentique, avec la légende du « beignet ») : transcription de la
  JFK Library refusée (403) ; pas de seconde source lue.
