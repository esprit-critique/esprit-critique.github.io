# Propositions 2 : ateliers de raisonnement

> **Bilan de la contre-vérification (22 novembre 2026)** : 23 éléments examinés ; **14 VALIDÉS**, **7 À CORRIGER**
> (corrections reportées dans les blocs de code), **2 REJETÉS** (déplacés dans « Écartés »).
> - CRT : 5 validés (`pliage`, `tunnel`, `pizzas`, `citerne`, `saumure`), 1 à corriger (`demi`, correctif de code préalable).
> - PROBLEMES : 1 validé (`berkson`), 5 à corriger (`urnes`, `sondages`, `taille-cours`, `projet`, `will-rogers`).
> - SYLLOGISMES : 6 validés (validité recalculée par énumération de Venn indépendante).
> - QUI_PROUVE : 2 validés (`etang`, `seisme`), 1 à corriger (`video-inondations`), 2 rejetés (`cyberattaque`, `caution`).
>
> Calculs refaits par `python3 -c` et correction CRT rejouée avec les fonctions extraites telles quelles de
> `static/ateliers.js` (`lireNombre`), `static/app.js` (`normaliser`) et `static/experiences.js` (`corrigerCRT`).
> Références d'études vérifiées : Crossref (auteurs, revue, volume, pages), Europe PMC (résumés de Feinstein et al.
> et de Berkson), OpenAlex (résumés de Denes-Raj et Epstein, Feld et Grofman), texte intégral de Tversky et
> Kahneman (1974) lu dans une copie PDF de l'article de Science.
>
> À faire à l'intégration : mettre à jour les commentaires de banque (« 32 syllogismes : 8 dans chaque case »,
> « Dix situations sur vingt » dans `pratiques.js`) ; aucun id proposé n'existe déjà dans sa banque (grep sur
> `static/*.js`) ; aucun doublon de contenu trouvé dans `grand-test-donnees.js` (familles `b-echantillon`,
> `b-denominateur`, `a-moyenne-ponderee`, `a-syl-*` lues).

Propositions pour quatre banques : `QUESTIONS_CRT`, `PROBLEMES`, `SYLLOGISMES` et `QUI_PROUVE`. Tous les éléments
sont écrits pour le site. Aucun n'est repris d'un instrument publié (CRT, CRT-2, items de Toplak et al., 2014…).
Les données sont fictives, sauf les références d'études, à contre-vérifier par l'agent `verificateur-sources`.

Calculs exécutés : scripts `calc.py` (nombres), `syl.py` (validité des syllogismes par énumération de tous les
modèles de Venn à trois ensembles, individus compris) et `crt.js` (correction par une copie exacte de `corrigerCRT`,
`lireNombre` et `normaliser`), dans le dossier de travail de la session. Les sorties sont reproduites ci-dessous.

Recherche de doublons (grep sur `static/*.js`, dont `grand-test-donnees.js`) : voir « Écartés » pour les idées
abandonnées parce qu'elles existaient déjà.

Remarques sur le code, à garder en tête pour l'intégration :
- `corrigerCRT` : quand la réponse donnée est la réponse intuitive, le site n'affiche pas la réponse attendue,
  seulement « C'est la réponse intuitive, mais elle est fausse. » suivi de l'explication. Chaque explication
  ci-dessous donne donc la bonne réponse en toutes lettres.
- `texteLibre` n'est pas utilisable pour une nouvelle question : la réponse attendue « Émilie » est écrite en dur
  dans `experiences.js`. Toutes les propositions attendent un nombre.
- Tous les textes passent par `T()` : il faudra lancer ensuite `tests/en/extraire.py --manquants`, `ajouter.py`
  et `controle.py`.

---

## 1. `QUESTIONS_CRT` (static/experiences.js)

Format : `{ id, niveau, texte, unite, juste, intuitive, [mots], [euros], explication }`. Niveaux, d'après le
commentaire de la banque : 2, lecture attentive ou variantes ; 3, deux étapes ; 4 et 5, problèmes originaux en
deux ou trois étapes. Aucun `reussite` : il n'existe pas de taux publié pour ces questions.

Sortie de `crt.js` (correction réelle du site) :

```
demi     "70" → juste ; "25" → intuitive ; "soixante-dix" → fausse ; " 70 " → juste
pliage   "32" → juste ; "10" → intuitive ; "32 épaisseurs" → juste
tunnel   "2" → juste ; "1" → intuitive ; "deux minutes" → juste ; "une minute" → intuitive ; "2 min" → juste
pizzas   "4" → juste ; "2" → intuitive ; "quatre" → juste ; "deux pizzas" → intuitive
citerne  "3" → juste ; "8" → intuitive ; "trois heures" → juste ; "3h" → juste ; "2,5" → fausse
saumure  "50" → juste ; "99" → intuitive ; "50 kg" → juste ; "99kg" → intuitive ; "98" → fausse
```

### 1. `demi`

```js
  { id: "demi", niveau: 2, texte: "Divisez 30 par un demi, puis ajoutez 10. Quel nombre obtenez-vous ?", unite: "", juste: 70, intuitive: 25,
    explication: "On obtient 70. Diviser par un demi, c'est multiplier par 2 : 30 ÷ 0,5 = 60, puis 60 + 10 = 70. On lit « diviser par deux », d'où 15 + 10 = 25." },
```

Vérification :
- Calcul : `30 / (1/2) + 10 = 70` ; réponse intuitive `30 / 2 + 10 = 25.0`.
- Lectures : « diviser par un demi » n'a qu'un sens mathématique (diviser par 0,5). « Diviser en deux » serait une
  autre phrase : c'est justement le piège de lecture, comme pour `moutons` (« tous sauf 8 »). « Puis ajoutez 10 »
  porte sur le résultat de la division, aucune autre lecture.
- Point douteux : `unite` vide. `corrigerCRT` affiche alors « Réponse attendue : 70 . » (espace avant le point).
  Soit on accepte un petit correctif du message (n'ajouter l'unité que si elle existe), soit on écarte la question.

Contre-vérification : À CORRIGER. Calcul refait (`30 / (1/2) + 10 = 70`, intuitive `25`) ; correction rejouée :
« 70 », « 70,0 », « 70 » entouré d'espaces → juste ; « 25 » → intuitive. Défaut confirmé dans `corrigerCRT`
(`experiences.js`) : `q.juste + " " + T(q.unite)` donne « Réponse attendue : 70 . », et `typo()` ne retire pas
cette espace. Condition d'intégration : changer d'abord cette expression en
`q.juste + (q.unite ? " " + T(q.unite) : "")`. Traduction : écrire « Divide 30 by one half » (en anglais,
« divide by half » se lit couramment « divide in half », ce qui rendrait 25 défendable). Énoncé, niveau 2 (lecture
attentive) et neutralité : conformes. Source indépendante : sans objet (calcul pur).

### 2. `pliage`

```js
  { id: "pliage", niveau: 2, texte: "On plie une feuille de papier en deux, puis on replie le tout en deux, et ainsi de suite : cinq pliages en tout. Combien d'épaisseurs de papier obtient-on ?", unite: "épaisseurs", juste: 32, intuitive: 10,
    explication: "On obtient 32 épaisseurs. Chaque pliage double le nombre d'épaisseurs : 2, 4, 8, 16, 32. Compter « deux de plus » par pliage (5 × 2 = 10) traite un doublement comme une addition." },
```

Vérification :
- Calcul : `2**5 = 32` ; réponse intuitive `2 × 5 = 10`.
- Lectures : « replier le tout » exclut de plier une seule partie. « Épaisseurs » = couches de papier superposées
  (et non plis ou faces). Cinq pliages réels sont faisables avec une feuille ordinaire : l'énoncé est concret.
- Ce n'est pas l'habillage des nénuphars : on ne remonte pas le temps depuis la fin, on oppose doublement et
  addition.

Contre-vérification : VALIDÉ. `2**5 = 32`, intuitive `10` ; « 32 », « 32 épaisseurs » → juste ; « 10 » → intuitive
(« trente-deux » → fausse, comme pour les autres questions sans `mots`). Aucune autre lecture : le premier pliage
compte dans les cinq. Pas de doublon (grep « pli », « épaisseur »). Réserve : 10 comme réponse intuitive la plus
fréquente n'est pas mesuré ; d'autres réponses fausses sont simplement comptées « fausses ».

### 3. `tunnel`

```js
  { id: "tunnel", niveau: 3, texte: "Un train de 1 km de long roule à 1 km par minute et traverse un tunnel de 1 km. Combien de minutes s'écoulent entre l'entrée de l'avant du train dans le tunnel et la sortie de l'arrière ?", unite: "minutes", juste: 2, intuitive: 1, mots: { 2: ["deux"], 1: ["une", "un"] },
    explication: "Il s'écoule 2 minutes. L'avant doit parcourir le tunnel (1 km), puis encore la longueur du train (1 km) pour que l'arrière en sorte : 2 km à 1 km par minute. On oublie que le train lui-même a une longueur." },
```

Vérification :
- Calcul : distance parcourue par l'avant entre les deux instants = tunnel + train = 2 km ; 2 / 1 = `2.0` min ;
  réponse intuitive `1 / 1 = 1.0`.
- Lectures : les deux instants sont nommés précisément (entrée de l'avant, sortie de l'arrière) : il n'y a pas
  d'autre durée possible. Une lecture « traverser = le train entier dans le tunnel » est exclue par la question.
  Vitesse constante, implicite et sans effet sur la réponse si l'on parle de distance.

Contre-vérification : VALIDÉ. (1 + 1) / 1 = 2 min ; « 2 », « deux minutes », « 2 min » → juste ; « 1 », « une minute »
→ intuitive. Les deux instants nommés ferment toute autre lecture. Pas de doublon (les « tunnel » de
`jeux-donnees.js` sont un autre stock, sans rapport). Effet de bord connu et commun à la banque : une saisie qui
contient les deux mots (« une à deux ») est lue comme « une », la clé 1 étant parcourue avant la clé 2.

### 4. `pizzas`

```js
  { id: "pizzas", niveau: 3, texte: "Combien de pizzas de 15 cm de diamètre faut-il pour avoir autant à manger qu'avec une pizza de 30 cm de diamètre, de même épaisseur et de même garniture ?", unite: "pizzas", juste: 4, intuitive: 2, mots: { 4: ["quatre"], 2: ["deux"] },
    explication: "Il en faut 4. La quantité dépend de la surface, qui varie comme le carré du diamètre : doubler le diamètre multiplie la surface par 2 × 2 = 4. On compare les diamètres au lieu des surfaces." },
```

Vérification :
- Calcul : `π × 15² / (π × 7,5²) = 4.0` ; réponse intuitive `30 / 15 = 2.0`.
- Lectures : « autant à manger » à épaisseur et garniture égales = même surface, donc même volume. Le bord (croûte)
  pourrait faire chicaner : il est proportionnellement plus large sur une petite pizza, ce qui ne ferait qu'ajouter
  de la pâte sans changer l'ordre de grandeur ; « de même épaisseur » ferme cette lecture. Réponse entière, unique.

Contre-vérification : VALIDÉ. 15² / 7,5² = 4,0 ; « 4 », « quatre », « 4 pizzas » → juste ; « 2 », « deux pizzas » →
intuitive. Aucune question sur l'aire ou le diamètre dans `grand-test-donnees.js` ni dans les autres banques (grep
« pizza », « diamètre »). Niveau 3 (deux étapes : surface, puis rapport) conforme.

### 5. `citerne`

```js
  { id: "citerne", niveau: 4, texte: "Un tuyau seul remplit une citerne en 4 heures ; un second tuyau seul la remplit en 12 heures. Ouverts ensemble, en combien d'heures la remplissent-ils ?", unite: "heures", juste: 3, intuitive: 8, mots: { 3: ["trois"], 8: ["huit"] },
    explication: "Il faut 3 heures. En une heure, le premier tuyau remplit 1/4 de la citerne et le second 1/12 : ensemble, 1/4 + 1/12 = 1/3 de la citerne par heure. Faire la moyenne de 4 et 12 (8 heures) donne plus de temps qu'au premier tuyau seul : c'est absurde, puisque le second ne peut qu'aider." },
```

Vérification :
- Calcul : `1 / (1/4 + 1/12) = 3` ; réponse intuitive (moyenne) `(4 + 12) / 2 = 8.0`.
- Lectures : débits constants, citerne vide au départ, sans fuite : c'est l'usage scolaire (« problème des
  robinets »), et toute autre lecture rendrait le problème insoluble. « Ensemble » = ouverts en même temps.
- Point douteux : la réponse intuitive la plus fréquente n'est pas mesurée ; 8 (moyenne) est probable, mais
  certains répondront 16 (somme) ou 6. Ces réponses sont comptées « fausses », sans dommage.
- Structure voisine d'un item de Toplak, West et Stanovich (2014) (un tonneau bu par deux personnes, 6 et 12 jours).
  Le problème des robinets est un classique scolaire bien plus ancien ; nombres, contexte et texte sont différents.

Contre-vérification : VALIDÉ. `1 / (1/4 + 1/12) = 3` exactement (fractions) ; « 3 », « trois heures », « 3h » →
juste ; « 8 » → intuitive ; « 2,5 » → fausse. Attention : « 3h00 » et « 3 h 00 » sont lus 300 et comptés faux
(comportement général de `lireNombre`, sans incidence propre à cette question). Remarque pour le propriétaire : la
structure est exactement celle de l'item du tonneau de Toplak, West et Stanovich (2014), que l'auteur écarte
pourtant plus bas ; garder l'un et écarter l'autre est un choix éditorial, pas une erreur. Pas de doublon (grep
« citerne », « robinet », « tuyau » : seulement des contextes sans rapport).

### 6. `saumure`

```js
  { id: "saumure", niveau: 5, texte: "Une cuve contient 100 kg d'eau salée, dont 99 % d'eau en poids. On laisse l'eau s'évaporer jusqu'à ce qu'elle ne représente plus que 98 % du poids. Combien pèse alors le contenu de la cuve ?", unite: "kg", juste: 50, intuitive: 99,
    explication: "Il pèse 50 kg. Le sel ne s'évapore pas : il reste 1 kg de sel, qui représentait 1 % du poids et en représente maintenant 2 %. Le total est donc de 1 ÷ 0,02 = 50 kg. Passer de 99 % à 98 % d'eau semble un changement d'un point, mais la part du sel, elle, double." },
```

Vérification :
- Calcul : sel = `100 × 1/100 = 1` kg ; total = `1 / (2/100) = 50` kg ; réponse intuitive `100 − 1 = 99`.
- Lectures : « en poids » fixe la nature du pourcentage (pas en volume). « Le contenu de la cuve » = eau + sel.
  Le sel reste dissous (2 % de sel, bien en dessous de la saturation, environ 26 %) : rien ne se dépose.
- C'est le « paradoxe des pommes de terre », énigme de tradition orale ; habillage, nombres et texte originaux.
- Point douteux : 98 est aussi une réponse intuitive fréquente probable ; elle est comptée « fausse ».

Contre-vérification : VALIDÉ. Sel = 1 kg ; 1 / 0,02 = 50 kg (fractions exactes) ; « 50 », « 50 kg », « 50kg » →
juste ; « 99 », « 99kg » → intuitive ; « 98 » → fausse. « En poids » et « le contenu de la cuve » ferment les autres
lectures. Pas de doublon (la seule occurrence de « pommes de terre » dans `grand-test-donnees.js` est une
situation de risque sans rapport). Niveau 5 conforme.

---

## 2. `PROBLEMES` (static/experiences.js)

Format : `{ id, niveau, titre, type, enonce, options|unite+reponse+tolerance, juste, resultat, explication, [liens] }`.
Niveaux, d'après le commentaire : 2, comparer ou combiner ; 3, probabilité conditionnelle ou variable cachée ;
4 et 5, problèmes originaux du site (données fictives, calcul exact dans `resultat`). Les options des problèmes
« choix » sont mélangées à l'affichage : chacune se comprend seule. Les liens visent des fiches qui existent
(`donnees.js`).

Sortie de `calc.py` (partie Problèmes) :

```
Urnes: A 0.1 B 0.08
Sondage pays: 3.10 pts ; ville: 3.07 pts ; part ville 2.0 %
Taille cours: moyenne des cours 50.0 ; vécue 82.0
Projet: 0.5987
Berkson: corr candidats 0.000 ; corr admis -0.528 ; part admis 0.49
  technique moyenne des admis forts en écriture 10.0 ; des admis faibles en écriture 17.5
Will Rogers avant: précoce 7.0 avancé 2.0
Will Rogers après: précoce 7.6 avancé 2.5 ; ensemble inchangé 5.333333333333333 5.333333333333333
```

### 1. `urnes`

```js
  { id: "urnes", niveau: 2, titre: "Deux urnes", type: "choix",
    enonce: "Vous gagnez 10 € si vous tirez une bille rouge, les yeux fermés. L'urne A contient 10 billes, dont 1 rouge. L'urne B contient 100 billes, dont 8 rouges. Dans laquelle tirez-vous ?",
    options: ["L'urne A, avec 1 bille rouge sur 10", "L'urne B, avec 8 billes rouges sur 100", "Les deux se valent"], juste: 0,
    resultat: "Denes-Raj et Epstein (1994) ont proposé ce choix avec des bonbons : les participants choisissaient souvent le grand bol, plus riche en bonbons gagnants mais moins favorable, et disaient s'y sentir plus de chances tout en sachant que les probabilités étaient contre eux.",
    explication: "L'urne A donne 10 chances sur 100, l'urne B seulement 8. Le nombre de billes rouges attire l'œil, mais c'est leur proportion qui compte : il faut regarder le dénominateur autant que le numérateur." },
```

Vérification :
- Calcul : A `1/10 = 0.1`, B `8/100 = 0.08` : A est strictement meilleure.
- Lectures : un seul tirage, billes indiscernables au toucher (« les yeux fermés »). « Se valent » est faux à
  coup sûr. Pas d'autre critère de choix possible (le gain est le même).
- Le `resultat` reste qualitatif : je n'ai pas lu les pourcentages de l'article (seulement son résumé). Ne pas
  ajouter de chiffre sans lecture de l'article.

Sources : Denes-Raj, V. et Epstein, S. (1994). « Conflict between intuitive and rational processing: When people
behave against their better judgment ». Journal of Personality and Social Psychology, 66(5), 819-829
(doi 10.1037/0022-3514.66.5.819). Résumé consulté : choix fréquents du bol au plus grand nombre absolu de bonbons
rouges malgré de moins bonnes chances, participants disant savoir que les probabilités étaient contre eux.
Paires étudiées : 1 sur 10 contre 9 sur 100 (et d'autres, jusqu'à 5 sur 100) selon des articles de reprise.

Contre-vérification : À CORRIGER (`resultat`, corrigé dans le bloc). Référence confirmée par Crossref : Denes-Raj, V.
et Epstein, S., Journal of Personality and Social Psychology, 1994, 66(5), 819-829, doi 10.1037/0022-3514.66.5.819.
Résumé lu (OpenAlex, texte de l'éditeur) : « subjects frequently elected to draw from a bowl that contained a greater
absolute number, but a smaller proportion, of red beans (e.g., 7 in 100) than from a bowl with fewer red beans but
better odds (e.g., 1 in 10). Subjects reported that although they knew the probabilities were against them, they
felt they had a better chance when there were more red beans. » Le résumé dit « frequently » (des choix
fréquents) et non « beaucoup de participants » ; « tout en sachant que c'était faux » est remplacé par la formule
du résumé. Pour la note interne : l'exemple du résumé est 7 sur 100, et non 9 sur 100. Calcul : 0,10 contre 0,08,
A strictement meilleure. Pas de doublon : `b-denominateur` (grand test) porte sur l'oubli d'un taux de base dans un
pourcentage de cas, pas sur le biais du ratio. Niveau 2 conforme.

### 2. `sondages`

```js
  { id: "sondages", niveau: 2, titre: "Deux sondages", type: "choix",
    enonce: "Deux instituts interrogent chacun 1 000 personnes tirées au hasard : l'un dans un pays de 60 millions d'habitants, l'autre dans une ville de 50 000 habitants. Que peut-on dire de la précision de leurs estimations ?",
    options: ["Celle de la ville est nettement meilleure, car elle interroge 2 % des habitants", "Celle du pays est nettement meilleure, car elle porte sur bien plus de monde", "Elles sont à peu près aussi précises l'une que l'autre"], juste: 2,
    resultat: "Calcul : pour une opinion partagée à 50 %, la marge d'erreur à 95 % est d'environ 3,10 points dans le pays et 3,07 points dans la ville.",
    explication: "La précision d'un sondage tiré au hasard dépend surtout du nombre de personnes interrogées, presque pas de la taille de la population : une cuillère suffit à goûter une soupe, que la marmite soit petite ou grande, pourvu qu'elle soit bien mélangée. La part interrogée ne commence à compter que lorsqu'elle devient importante.",
    liens: [["#biais/taille-echantillon", "Négligence de la taille de l'échantillon"]] },
```

Vérification :
- Calcul : marge = 1,96 × √(0,25 / 1 000) = `3.10` points ; avec correction de population finie
  √((N − n)/(N − 1)) pour N = 50 000 : `3.07` points. Part interrogée dans la ville : `2.0 %`.
- Lectures : « précise » = marge d'erreur d'échantillonnage. Tirage au hasard posé dans l'énoncé (pas de biais de
  sélection). Écart de 1 % entre les deux marges : « à peu près autant » est la seule option juste ; la ville est
  à peine plus précise, ce que l'explication dit (« presque pas »).
- Pas de doublon : le grand test traite la taille de l'échantillon (petits échantillons plus variables), pas
  l'indifférence à la taille de la population.

Contre-vérification : À CORRIGER (corrigé dans le bloc). Calcul refait : 1,96 × √(0,25 / 1 000) = 3,099 points ;
avec la correction de population finie (N = 50 000) : 3,068 points ; part interrogée 2,0 %. Lecture ambiguë qui
changeait la réponse : la question « Lequel obtient l'estimation la plus précise ? » appelle strictement « celui de
la ville » (3,07 < 3,10), soit l'option 0, comptée fausse. Corrections : question reformulée (« Que peut-on dire de
la précision de leurs estimations ? »), options 0 et 1 rendues fausses sans ambiguïté par « nettement meilleure »,
option juste réécrite ; `resultat` harmonisé (3,10 et 3,07) ; niveau 3 → 2, car l'en-tête réserve le niveau 3 à la
probabilité conditionnelle et aux variables cachées, et ce problème demande de comparer. Pas de doublon :
`b-echantillon` traite de la variabilité des petits échantillons, pas de la taille de la population. Lien
`#biais/taille-echantillon` : la fiche existe.

### 3. `taille-cours`

```js
  { id: "taille-cours", niveau: 4, titre: "La taille des cours", type: "nombre",
    enonce: "Un lycée propose deux cours d'option : l'un compte 10 élèves, l'autre 90. Chaque élève suit un seul des deux. On demande à chaque élève combien d'élèves compte son cours, puis l'on fait la moyenne des 100 réponses. Quelle moyenne obtient-on ?",
    unite: "élèves", reponse: 82, tolerance: 0.5,
    resultat: "Calcul : 10 élèves répondent 10 et 90 élèves répondent 90 ; (10 × 10 + 90 × 90) / 100 = 82.",
    explication: "La réponse intuitive, 50, est la taille moyenne des cours, vue par le lycée. Mais la plupart des élèves sont dans le grand cours : vue par les élèves, la taille moyenne est bien plus grande. Feld et Grofman (1977) ont appelé cet écart le paradoxe de la taille des classes." },
```

Vérification :
- Calcul : moyenne des cours `(10 + 90) / 2 = 50.0` ; moyenne vécue `(10×10 + 90×90) / 100 = 82.0`.
- Lectures : « combien d'élèves compte son cours » inclut l'élève lui-même (10 ou 90) : c'est l'effectif du cours.
  Si quelqu'un comptait « les autres » (9 ou 89), la moyenne serait 81 : hors tolérance, mais cette lecture est
  forcée. Moyenne arithmétique simple des 100 réponses, écrite dans l'énoncé.
- Pas de doublon : `a-moyenne-ponderee` (grand test) pondère deux moyennes par les effectifs ; ici le piège est le
  point de vue (moyenne par cours ou par élève).
- Phrase sur le bus : affirmation qualitative du même mécanisme, sans chiffre ; à retirer si le vérificateur la
  juge non sourcée.

Sources : Feld, S. L. et Grofman, B. (1977). « Variation in class size, the class size paradox, and some
consequences for students ». Research in Higher Education, 6(3), 215-222 (Springer, en libre accès). L'article
définit l'écart entre la taille moyenne vue par les enseignants et celle, plus grande, vécue par les étudiants.

Contre-vérification : À CORRIGER (phrase sur le bus retirée du bloc). Calcul refait : (10 + 90) / 2 = 50 ;
(10 × 10 + 90 × 90) / 100 = 82 ; la lecture « les autres élèves » donne 81, hors tolérance (0,5), lecture forcée.
Référence confirmée par Crossref : Feld, S. L. et Grofman, B., Research in Higher Education, 1977, 6(3), 215-222,
doi 10.1007/BF00991287. Résumé lu (OpenAlex) : « The average class size experienced by students is directly related
to the amount of variation in class size » et « the nature and extent of the class size paradox » ; le nom figure
dans le titre. Note : l'article n'est pas en libre accès (Springer redirige vers une authentification). La phrase
sur le bus n'est ni dans le résumé ni sourcée, et sa formulation (« nous semble… qu'il ne l'est ») présente comme
une illusion ce qui est un écart réel entre deux moyennes : retirée. Pas de doublon (`a-moyenne-ponderee` pondère
deux moyennes de groupes ; aucune occurrence de « Feld » ni du paradoxe de l'amitié dans `static/`).

### 4. `projet`

```js
  { id: "projet", niveau: 4, titre: "Dix étapes sans accroc", type: "nombre",
    enonce: "Un projet comporte 10 étapes indépendantes les unes des autres. Chacune a 95 % de chances de se dérouler sans accroc. Quelle est la probabilité que les 10 étapes se déroulent toutes sans accroc ?",
    unite: "%", reponse: 60, tolerance: 1.5,
    resultat: "Calcul : 0,95¹⁰ ≈ 0,599, soit environ 60 %.",
    explication: "Chaque étape paraît presque sûre, mais il faut que toutes réussissent : les probabilités se multiplient. Il y a donc 4 chances sur 10 qu'au moins une étape connaisse un accroc. Dans une étude de Bar-Hillel (1973), la plupart des participants préféraient parier sur un tel événement « conjonctif » plutôt que sur un événement simple, pourtant un peu plus probable. Tversky et Kahneman (1974) voient dans cette surestimation des événements conjonctifs une source d'optimisme injustifié sur les chances qu'un plan réussisse ou qu'un projet soit terminé à temps.",
    liens: [["#biais/planification", "Erreur de planification"], ["#biais/conjonction", "Erreur de conjonction"]] },
```

Vérification :
- Calcul : `0.95**10 = 0.5987` → 60 % (tolérance 1,5 : 59 ou 60 acceptés, 95 ou 90 refusés). Complément :
  1 − 0,599 ≈ 0,40, d'où « 4 chances sur 10 ».
- Lectures : « indépendantes » est écrit, sans quoi le produit ne vaudrait pas. « Toutes sans accroc » = les dix à
  la fois. Réponse en % ; une saisie « 0,6 » serait refusée, comme pour les autres problèmes en %.

Sources : Bar-Hillel, M. (1973). « On the subjective probability of compound events ». Organizational Behavior
and Human Performance, 9(3), 396-406 (doi 10.1016/0030-5073(73)90061-5) : surestimation des événements conjonctifs,
sous-estimation des disjonctifs. Tversky, A. et Kahneman, D. (1974), « Judgment under uncertainty: Heuristics and
biases », Science, 185, 1124-1131, section « Biases in the evaluation of conjunctive and disjunctive events », qui
cite Bar-Hillel et applique l'idée à la planification (à vérifier mot pour mot par le vérificateur).

Contre-vérification : À CORRIGER (fin de l'explication réécrite dans le bloc). Calcul refait : 0,95¹⁰ = 0,5987 ;
complément 0,4013. Références confirmées par Crossref : Bar-Hillel, M., Organizational Behavior and Human Performance,
1973, 9(3), 396-406, doi 10.1016/0030-5073(73)90061-5 ; Tversky, A. et Kahneman, D., Science, 1974, 185(4157),
1124-1131. Texte intégral de 1974 lu (copie PDF de l'article, section « Biases in the evaluation of conjunctive
and disjunctive events ») : « In a recent study by Bar-Hillel (9) […] a significant majority of subjects preferred
to bet on the conjunctive event (the probability of which is .48) rather than on the simple event (the probability
of which is .50) » ; puis « people tend to overestimate the probability of conjunctive events (10) », appel de note
qui renvoie à Cohen, Chesnick et Haran (1972), et non à Bar-Hillel ; enfin « The general tendency to overestimate
the probability of conjunctive events leads to unwarranted optimism in the evaluation of the likelihood that a plan
will succeed or that a project will be completed on time. » « Bar-Hillel a montré que l'on surestime » lui
attribuait la conclusion générale : la nouvelle formulation s'en tient à son résultat (un pari) et cite Tversky et
Kahneman pour la planification. Pas de doublon : `quatre-lancers` et `mere` emploient le même calcul de complément,
mais sur des dés, sans l'enjeu de planification. Liens : les fiches `planification` et `conjonction` existent.

### 5. `berkson`

```js
  { id: "berkson", niveau: 5, titre: "L'école de cinéma", type: "choix",
    enonce: "Une école de cinéma admet tout candidat qui obtient au moins 15 sur 20 à l'épreuve d'écriture, ou à l'épreuve technique, ou aux deux. Chez les candidats, les deux notes n'ont aucun lien entre elles. Parmi les élèves admis, pourtant, les meilleurs en écriture sont souvent les moins bons en technique. Que peut-on en conclure ?",
    options: ["Les deux talents s'opposent : on développe rarement les deux à la fois", "Rien sur les talents : la sélection suffit à créer ce lien", "Les épreuves sont mal conçues : elles mesurent mal les talents"], juste: 1,
    resultat: "Calcul (notes entières de 0 à 20, indépendantes et toutes aussi probables) : corrélation nulle chez les candidats, d'environ −0,53 chez les admis. Un admis qui a moins de 15 en écriture a en moyenne 17,5 en technique ; un admis qui a 15 ou plus en écriture, 10.",
    explication: "Un admis faible dans une épreuve est forcément fort dans l'autre, sinon il n'aurait pas été admis. En ne regardant que les admis, on fabrique un lien qui n'existe pas chez les candidats. Joseph Berkson (1946) a décrit ce piège à propos des malades hospitalisés : deux maladies sans lien peuvent sembler liées quand on n'étudie que les patients d'un hôpital.",
    liens: [["#sophismes/correlation", "Corrélation prise pour causalité"]] },
```

Vérification :
- Calcul exhaustif sur les 441 couples de notes : corrélation `0.000` chez les candidats, `-0.528` chez les admis
  (49 % admis) ; technique moyenne `17.5` chez les admis à moins de 15 en écriture, `10.0` chez les autres.
- Lectures : « ou aux deux » lève l'ambiguïté du « ou ». L'énoncé pose l'absence de lien chez les candidats : la
  première option est donc contredite, et la troisième n'est pas impliquée (des épreuves parfaites donneraient
  le même lien). Seule la deuxième découle de l'énoncé.
- Pas de doublon : aucune occurrence de Berkson ou de « collisionneur » dans `static/`.

Sources : Berkson, J. (1946). « Limitations of the application of fourfold table analysis to hospital data ».
Biometrics Bulletin, 2(3), 47-53 (PubMed 21001024 ; réimprimé dans International Journal of Epidemiology, 2014,
43(2), 511-515). Exemple d'origine : cholécystite et diabète dans une population hospitalière.

Contre-vérification : VALIDÉ. Calcul exhaustif refait sur les 441 couples : corrélation 0,000 chez les candidats,
−0,528 chez les admis (216 admis sur 441, soit 49 %) ; technique moyenne 17,5 chez les admis à moins de 15 en
écriture, 10,0 chez les autres. L'énoncé pose l'indépendance chez les candidats : la première option est
contredite, la troisième n'est pas impliquée. Référence confirmée : Crossref (Biometrics Bulletin, 1946, 2(3), 47,
doi 10.2307/3002000 ; réimpression International Journal of Epidemiology, 2014, 43(2), 511-515, doi
10.1093/ije/dyu022) et Europe PMC (PMID 21001024, pages 47-53). Source indépendante lue : Catalogue of Bias (Oxford
CEBM, fiche « Admission rate bias »), qui décrit l'exemple de Berkson (maladie de la vésicule biliaire et diabète,
chez des patients hospitalisés) et l'association factice créée par l'admission. Lien
`#sophismes/correlation` : la fiche existe. Aucune occurrence de Berkson dans `static/`.

### 6. `will-rogers`

```js
  { id: "will-rogers", niveau: 5, titre: "Un examen plus fin", type: "choix",
    enonce: "Dans un hôpital, les patients atteints d'un cancer vivent en moyenne 7 ans au stade précoce et 2 ans au stade avancé. Un nouvel examen détecte des métastases jusque-là invisibles : certains patients classés au stade précoce passent au stade avancé. Ensuite, la survie moyenne augmente dans les deux stades. Que peut-on en conclure ?",
    options: ["Les traitements se sont améliorés dans les deux stades", "Rien sur les traitements : le seul reclassement peut faire monter les deux moyennes", "Les chiffres sont faux : les deux moyennes ne peuvent pas monter ensemble"], juste: 1,
    resultat: "Calcul (données fictives) : au stade précoce, six patients vivent 12, 10, 8, 6, 4 et 2 ans (moyenne 7) ; au stade avancé, trois vivent 3, 2 et 1 an (moyenne 2). Le patient à 4 ans passe au stade avancé : les moyennes deviennent 7,6 et 2,5 ans, et aucun patient ne vit plus longtemps.",
    explication: "Les patients reclassés vivent moins longtemps que la moyenne du stade précoce, mais plus longtemps que la moyenne du stade avancé : leur départ relève la première moyenne, leur arrivée relève la seconde. Feinstein, Sosin et Wells (1985) ont nommé ce piège « phénomène Will Rogers » : avant de comparer des survies, il faut vérifier que les groupes sont définis de la même façon.",
    liens: [["#biais/simpson", "Paradoxe de Simpson"]] },
```

Vérification :
- Calcul : avant `7.0` et `2.0` ; après `7.6` et `2.5` ; moyenne de l'ensemble inchangée (`5.33` avant et après).
- Lectures : « en moyenne » = moyenne arithmétique, celle du calcul. Les options 1 et 3 sont toutes deux
  réfutées par le contre-exemple numérique : l'option 1 « peut » être vraie dans le monde, mais rien ne permet de
  la conclure, ce que dit la question (« que peut-on en conclure »). Formulation de l'option juste : « peut ».
- Lien vers Simpson : fiche voisine (un chiffre agrégé trompe parce que la composition des groupes change) ; pas
  de fiche « Will Rogers ». Lien à retirer si on le juge trop lâche.

Sources : Feinstein, A. R., Sosin, D. M. et Wells, C. K. (1985). « The Will Rogers phenomenon: stage migration and
new diagnostic techniques as a source of misleading statistics for survival in cancer ». New England Journal of
Medicine, 312(25), 1604-1608. Volume et numéro confirmés par plusieurs notices ; pages citées de mémoire, à
vérifier sur PubMed.

Contre-vérification : À CORRIGER (première phrase de l'explication corrigée dans le bloc). Calcul refait : avant 7 et
2 ; après 7,6 et 2,5 ; moyenne d'ensemble 5,33 inchangée. Défaut : l'explication disait que les reclassés sont
« les plus malades du stade précoce », alors que dans l'exemple chiffré le patient déplacé (4 ans) n'est pas le plus
malade (celui à 2 ans reste au stade précoce). Le déplacer, lui, laisserait la moyenne du stade avancé à 2 : la
phrase était donc fausse pour l'exemple. Nouvelle formulation, conforme au résumé de l'article : « the prognosis of
those who migrated, although worse than that for other members of the good-stage group, was better than that for
other members of the bad-stage group, survival rates rose in each group without any change in individual
outcomes ». Référence confirmée par Europe PMC (PMID 4000199) : Feinstein, A. R., Sosin, D. M. et Wells, C. K.,
NEJM, 1985, 312(25), 1604-1608. Source indépendante pour le nom : Wikipédia anglaise, « Will Rogers phenomenon »
(« led clinician Alvan Feinstein to coin the term Will Rogers phenomenon in 1985 »), qui cite le même article. Lien
vers Simpson : voisin (effet de composition des groupes), acceptable en « voir aussi ».

---

## 3. `SYLLOGISMES` (static/raisonner.js)

Format : `{ id, p: [prémisse, prémisse], c, valide, credible, [justifications] }`. La conclusion s'affiche
« Donc » + `minuscule1(c)` : aucune conclusion ne commence par un nom propre. Une partie tire 4 syllogismes par
case ; la banque passe de 8 par case à 9 (VC), 10 (VI), 10 (IC) et 9 (II). Le code le supporte ; le commentaire
« 32 syllogismes : 8 dans chaque case » serait à mettre à jour. Pour garder l'égalité, n'intégrer que 4 éléments
(un par case : `quinze`, `requins-branchies`, `medecins-meres`, `chats-poissons`).

Sortie de `syl.py` (toutes les répartitions possibles des éléments dans les régions d'un diagramme de Venn à trois
ensembles, chaque individu nommé placé dans une région non vide ; « valide » = aucun contre-modèle) :

```
VALIDE     quinze (Si divisible par 4 alors pair ; 15 pas pair ⊢ 15 pas div. par 4)
VALIDE     requins-branchies (Tous poissons ont branchies ; aucun requin n'a de branchies ⊢ aucun requin n'est poisson)
VALIDE     allumettes (Tout bois coule ; allumettes en bois ⊢ allumettes coulent)
NON VALIDE medecins-meres (Certains médecins femmes ; certaines femmes mères ⊢ certains médecins mères) | contre-modèle : régions non vides [(0, 1, 1), (1, 1, 0)]
NON VALIDE dauphins-requins (Tous requins poissons ; aucun dauphin requin ⊢ aucun dauphin poisson) | contre-modèle : régions non vides [(0, 1, 1)]
NON VALIDE chats-poissons (Certains chats animaux de compagnie ; certains a.d.c. poissons ⊢ certains chats poissons) | contre-modèle : régions non vides [(0, 1, 1), (1, 1, 0)]
NON VALIDE pianistes (Tous pianistes lisent ; certains enfants lisent ⊢ certains enfants pianistes) | contre-modèle : régions non vides [(0, 1, 1)]
```

### 1. `quinze` (valide, crédible)

```js
  { id: "quinze", p: ["Si un nombre est divisible par 4, il est pair.", "15 n'est pas un nombre pair."], c: "15 n'est pas divisible par 4.", valide: true, credible: true },
```

Vérification :
- Forme : modus tollens (si P alors Q ; non Q ; donc non P). Valide (`syl.py`). C'est la seule forme
  conditionnelle valide absente de la banque : les trois conditionnels existants (`vaches`, `soleil`, `tortues`)
  sont des formes non valides.
- Crédibilité : 15 = 4 × 3 + 3, la conclusion est vraie. Prémisses vraies aussi.
- Lectures : « Si un nombre… » = « tout nombre divisible par 4 est pair », lecture unique. Pas de double négation :
  deux négations simples, dans des phrases différentes. Affichage : « Donc 15 n'est pas divisible par 4. »

Contre-vérification : VALIDÉ. Table de vérité refaite : modus tollens valide. Étiquettes justes (valide, crédible :
15 = 4 × 3 + 3). Pas de doublon : aucune forme modus tollens dans la banque (`vaches`, `soleil` : négation de
l'antécédent ; `tortues` : affirmation du conséquent). `minuscule1("15…")` laisse le texte intact.

### 2. `requins-branchies` (valide, non crédible)

```js
  { id: "requins-branchies", p: ["Tous les poissons ont des branchies.", "Les requins n'ont pas de branchies."], c: "Les requins ne sont pas des poissons.", valide: true, credible: false,
    justifications: [
      ["Valide : si tous les poissons avaient des branchies et que les requins n'en avaient pas, les requins ne pourraient pas être des poissons.", true],
      ["Non valide : les requins sont des poissons, donc la conclusion est fausse et le raisonnement ne tient pas.", false],
      ["Non valide : la seconde prémisse est fausse, puisque les requins ont des branchies, donc la conclusion ne découle pas des prémisses.", false]
    ] },
```

Vérification :
- Forme : tous les P sont M ; aucun S n'est M ; donc aucun S n'est P (Camestres). Valide (`syl.py`).
- Crédibilité : les requins sont des poissons (cartilagineux) et ont des branchies : seconde prémisse fausse,
  conclusion fausse. C'est le cas « incroyable mais valide ».
- Lectures : « Les requins » = tous les requins (lecture générique, comme `baleines`, `manchots`). Les
  justifications reprennent la construction de `fourmis` et `manchots` : une juste, une qui juge la conclusion,
  une qui juge une prémisse.

Contre-vérification : VALIDÉ. Énumération indépendante (toutes les combinaisons de régions non vides d'un diagramme
de Venn à trois ensembles) : aucun contre-modèle, forme Camestres valide, sans besoin de portée existentielle.
Étiquettes justes : seconde prémisse et conclusion fausses (les requins, poissons cartilagineux, ont des
branchies), donc « non crédible ». Justifications : une seule correcte, les deux autres jugent la vérité au lieu de
la forme, comme dans `fourmis` et `manchots`. Ajoute une explication correcte et deux fautives au réservoir de la
phase 2, qui en tire deux de chaque sorte : sans effet sur l'équilibre. Distinct de `requins` (II) et de `dauphins`.

### 3. `allumettes` (valide, non crédible)

```js
  { id: "allumettes", p: ["Tout ce qui est en bois coule dans l'eau.", "Les allumettes sont en bois."], c: "Les allumettes coulent dans l'eau.", valide: true, credible: false },
```

Vérification :
- Forme : Barbara (tout M est P ; tout S est M ; donc tout S est P). Valide (`syl.py`).
- Crédibilité : une allumette en bois flotte ; la première prémisse est fausse (la plupart des bois flottent).
- Lectures : certaines allumettes sont en carton ; la seconde prémisse est alors approximative, mais la validité
  ne dépend pas de sa vérité, et la conclusion reste non crédible. Point faible : même structure que `ancres`
  (« tout ce qui est en métal est léger ») ; à garder en réserve si l'on veut l'égalité des cases.

Contre-vérification : VALIDÉ, en réserve comme le propose l'auteur. Barbara valide (aucun contre-modèle). Conclusion
contraire à l'expérience courante (une allumette en bois flotte) : « non crédible » juste. Même forme et même ressort
que `ancres` ; à n'intégrer que si l'on renonce à l'égalité des cases.

### 4. `medecins-meres` (non valide, crédible)

```js
  { id: "medecins-meres", p: ["Certains médecins sont des femmes.", "Certaines femmes sont des mères."], c: "Certains médecins sont des mères.", valide: false, credible: true,
    justifications: [
      ["Valide : des médecins sont des femmes, des femmes sont des mères, donc certaines de ces femmes médecins sont forcément des mères.", false],
      ["Non valide : les femmes qui sont mères ne sont peut-être pas celles qui sont médecins ; la conclusion est vraie, mais elle ne découle pas des prémisses.", true],
      ["Valide : tout le monde connaît des femmes médecins qui ont des enfants.", false]
    ] },
```

Vérification :
- Forme : certains A sont B ; certains B sont C ; donc certains A sont C. Non valide : contre-modèle de `syl.py`
  où les femmes médecins et les femmes mères sont des personnes différentes (régions (1,1,0) et (0,1,1)).
- Crédibilité : la conclusion est vraie dans le monde. Cas « crédible mais non valide ».
- Lectures : « certains » = au moins un, sens logique habituel ; la lecture « certains, mais pas tous » ne change
  rien à l'invalidité (le contre-modèle la satisfait aussi).
- Forme voisine du générateur « certains » du grand test (`a-syl-certains-credible`) : même mécanisme, autre banque
  et autre texte. Les syllogismes du grand test sont générés à partir d'une taxonomie, sans phrase en commun.

Contre-vérification : VALIDÉ. Contre-modèle retrouvé : régions (médecin, femme, non mère) et (non médecin, femme,
mère) seules occupées. Étiquettes justes (non valide, crédible). Justifications : seule la deuxième est correcte.
La taxonomie du grand test (`TAXONOMIE_GT`) ne contient ni médecins ni mères : pas de doublon. Neutralité : la
phrase décrit un fait banal, sans jugement.

### 5. `dauphins-requins` (non valide, crédible)

```js
  { id: "dauphins-requins", p: ["Tous les requins sont des poissons.", "Aucun dauphin n'est un requin."], c: "Aucun dauphin n'est un poisson.", valide: false, credible: true },
```

Vérification :
- Forme : tout M est P ; aucun S n'est M ; donc aucun S n'est P (majeur illicite). Non valide : contre-modèle où
  un dauphin serait un poisson sans être un requin (région (0,1,1) : poisson et dauphin, pas requin).
- Crédibilité : les dauphins sont des mammifères ; prémisses et conclusion sont toutes vraies. Le piège est fort :
  trois phrases vraies, raisonnement non valide.
- Différent de `elephants` et `pigeons-vol` (aucun… aucun…) : ici la première prémisse est universelle affirmative.
- Lectures : sans double négation ; « aucun… n'est » est la négation simple du français.

Contre-vérification : VALIDÉ. Contre-modèle retrouvé : une région (dauphin, non requin, poisson) suffit ; majeur
illicite. Étiquettes justes (non valide ; prémisses et conclusion vraies, donc crédible). Ressort voisin de `vaches`
(même case, négation de l'antécédent sous forme conditionnelle) mais forme catégorique et texte différents : pas un
doublon.

### 6. `chats-poissons` (non valide, non crédible)

```js
  { id: "chats-poissons", p: ["Certains chats sont des animaux de compagnie.", "Certains animaux de compagnie sont des poissons."], c: "Certains chats sont des poissons.", valide: false, credible: false },
```

Vérification :
- Forme : exactement celle de `medecins-meres` (certains A sont B ; certains B sont C ; donc certains A sont C).
  Non valide (`syl.py`).
- Crédibilité : les deux prémisses sont vraies (poissons rouges), la conclusion est fausse : ce couple vrai-vrai-faux
  prouve à lui seul l'invalidité de la forme.
- Intérêt : mis à côté de `medecins-meres`, il montre la même forme jugée différemment selon la croyance. Les deux
  peuvent tomber dans la même partie (cases différentes).

Contre-vérification : VALIDÉ. Non valide (même contre-modèle que `medecins-meres`). Étiquettes justes : prémisses
vraies (poissons rouges), conclusion fausse. Proche de `chevaux` (II, « certains » au moyen terme), mais la première
prémisse diffère (particulière ici, universelle là) : pas un doublon.

---

## 4. `QUI_PROUVE` (static/pratiques.js)

Format : `{ texte, reponse, explication }`, sans `id` : la banque est tirée par `tirerNouveaux(…, q => q.texte)`.
Les identifiants des titres ci-dessous servent seulement à désigner les éléments. `reponse` : 0 celui qui affirme ;
1 celui qui doute ; 2 les deux, chacun pour ce qu'il affirme ; 3 personne, affaire de goût.
Répartition actuelle : 8 × 0, 3 × 1, 4 × 2, 5 × 3 ; avec ces cinq éléments : 10, 4, 6, 5.
Après contre-vérification (trois éléments retenus, deux écartés) : 9 × 0, 4 × 1, 5 × 2, 5 × 3.

### 1. `video-inondations` (actualité, désinformation)

```js
  { texte: "Sarah partage une vidéo : « Voici les inondations d'hier dans notre ville. » Adam : « Cette vidéo a été tournée il y a cinq ans, dans un autre pays. »", reponse: 2,
    explication: "Chacun affirme une date et un lieu précis. Sarah doit pouvoir dire d'où vient la vidéo ; Adam, montrer l'original plus ancien." },
```

Vérification (lectures) : Adam ne se contente pas de douter, il avance un fait précis (date et lieu) ; Sarah aussi.
Réponse 2, même logique que l'élément existant Marc et Inès. La « recherche d'image inversée » est une technique
courante de vérification, sans chiffre.

Contre-vérification : À CORRIGER (fin de l'explication retirée dans le bloc). Réponse 2 juste et sans autre lecture :
Adam affirme une date et un lieu, il ne se contente pas de douter (même logique que Marc et Inès). La mention de la
« recherche d'image inversée » est retirée : appliquée à une vidéo, elle est imprécise (on cherche à partir d'images
extraites), « souvent » n'est pas sourcé, et elle n'apporte rien à la question de la charge de la preuve. Neutre ;
pas de doublon (grep « inond », « vidéo » dans `pratiques.js`).

### 2. `etang` (quotidien, affirmation négative)

```js
  { texte: "Hugo : « Il n'y a aucun poisson dans cet étang. » Lou : « Qu'en sais-tu ? »", reponse: 0,
    explication: "Affirmer une absence, c'est affirmer quelque chose : c'est à Hugo de dire sur quoi il s'appuie, une pêche, un inventaire. Lou ne fait que poser une question." },
```

Vérification (lectures) : Hugo affirme (sous forme négative), Lou interroge. Réponse 0. Apport nouveau pour la
banque : une affirmation négative reste une affirmation. Aucune lecture ne fait de Lou un affirmant.

Contre-vérification : VALIDÉ. Hugo affirme, Lou interroge : réponse 0 sans ambiguïté. Cas nouveau dans la banque
(affirmation négative). Pas de collision : la banque n'a pas d'`id`, et l'id `etang` de `QUESTIONS_CRT` n'est
qu'un homonyme du libellé de ce titre. Clé de tirage (`q.texte`) unique.

### 3. `seisme` (actualité, résultat établi contesté)

```js
  { texte: "Un institut de géophysique annonce un séisme de magnitude 6, enregistré par des dizaines de stations dont les relevés sont publics. Un internaute : « Je n'y crois pas, prouvez-le. »", reponse: 1,
    explication: "Les preuves sont déjà là, publiques et concordantes. Pour les rejeter, l'internaute doit dire en quoi tous ces relevés seraient faux." },
```

Vérification (lectures) : même logique que les éléments existants « station météo » et « Terre autour du
Soleil » (réponse 1) : la preuve a été apportée et elle est accessible. Domaine nouveau (catastrophe naturelle,
fréquente dans l'actualité). Point douteux : on pourrait lire « je n'y crois pas » comme un simple doute (réponse 0
pour l'institut) ; l'énoncé précise que les relevés sont publics, et la banque tranche déjà ce cas par 1.

Contre-vérification : VALIDÉ. Construction identique à « station météo » et « garagiste » (la preuve est déjà
apportée et consultable ; « Je n'y crois pas, prouvez-le » conteste un résultat établi), que la banque et son
bilan (« contester un résultat solidement établi, c'est affirmer quelque chose à son tour ») tranchent par 1.
Données fictives, aucun chiffre à sourcer. Neutre.

---

## Écartés

### Écartés à la contre-vérification

#### `cyberattaque` (géopolitique)

```js
  { texte: "Le gouvernement d'un pays accuse un pays voisin d'avoir mené une cyberattaque contre ses hôpitaux. Le pays voisin : « Montrez vos preuves. »", reponse: 0,
    explication: "C'est au pays qui accuse d'apporter des preuves, par exemple les traces techniques de l'attaque. Le pays mis en cause n'a pas à prouver son innocence en demandant ces preuves ; s'il accusait à son tour un autre pays, il devrait l'étayer." },
```

Vérification (lectures) : le pays voisin ne dément rien et n'affirme rien, il demande des preuves : seule la
réponse 0 convient. Aucun pays réel nommé, aucun camp pris. Si l'on ajoutait « nous n'y sommes pour rien », la
question deviendrait discutable (un démenti est-il une affirmation ?) : c'est pourquoi l'énoncé s'en tient à la
demande de preuves.

Contre-vérification : REJETÉ. La logique (réponse 0) est juste, mais l'élément touche à la géopolitique
réelle : les accusations de cyberattaques entre États et la réplique « montrez vos preuves » renvoient à des
controverses d'actualité, où les preuves d'attribution sont souvent tenues secrètes. Enseigner que la demande du
pays accusé est la position correcte peut se lire comme une prise de parti, pour la même raison que l'auteur écarte
les « résultats d'un vote contestés ». En outre, « n'a pas à prouver son innocence en demandant ces preuves » est
mal construit (le complément semble porter sur « prouver »).

#### `caution` (quotidien)

```js
  { texte: "Un propriétaire garde une partie de la caution : « Vous avez rayé le parquet. » Le locataire : « Les rayures étaient déjà là à mon arrivée. »", reponse: 2,
    explication: "Chacun affirme un fait : le propriétaire, un dégât causé par le locataire ; le locataire, un dégât antérieur. C'est l'état des lieux d'entrée, s'il est précis, qui peut les départager." },
```

Vérification (lectures) : deux affirmations factuelles contraires, réponse 2. Volontairement, l'explication
n'avance aucune règle de droit (qui doit prouver devant un juge), qui demanderait une source juridique : elle
parle seulement de ce que chacun affirme.

Contre-vérification : REJETÉ. Au sens de la banque, la réponse 2 se défend ; mais la situation relève
d'une règle de droit qui fixe la charge de la preuve : en l'absence d'état des lieux, le locataire est présumé avoir
reçu le logement en bon état, sauf preuve contraire (article 1731 du Code civil, d'après les reprises juridiques
trouvées par recherche ; le texte de Légifrance n'a pas pu être ouvert). Un visiteur qui connaît cette
règle répondrait 0 ou 1 selon le cas. C'est le motif pour lequel l'auteur écarte « panne sous garantie » :
même traitement.

### Écartés par l'auteur

- CRT `buche` (couper une bûche en 4 morceaux en 12 minutes, combien pour 8 ?) : même mécanisme de piquets et
  d'intervalles que le générateur `piquets` du grand test (`a-intervalles`). Écartés aussi : l'horloge qui sonne
  6 coups et les trois comprimés à prendre toutes les demi-heures.
- CRT `loyer` (après une hausse de 25 %, 1 000 € ; quel loyer avant ?) : même piège de base que `hausse-baisse`,
  `remises` et l'item « pourcentages successifs » du grand test.
- CRT : file d'attente « 7e de l'avant et 7e de l'arrière », achat et revente d'un cochon, tonneau bu à deux : trop
  proches d'items publiés de Toplak, West et Stanovich (2014).
- CRT « Un taux passe de 10 % à 15 % : de combien de pour cent a-t-il augmenté ? » : ambigu (50 % ou 5 points,
  l'usage courant hésite).
- CRT « Combien de fois peut-on soustraire 5 de 25 ? » : deux réponses défendables (1 ou 5).
- CRT « deux pièces : probabilité d'un pile et d'un face » : réponse intuitive fausse peu nette ; proche de
  `des-11-12`.
- CRT aller-retour (« à quelle vitesse revenir pour une moyenne de 40 km/h ? ») : troisième variante de la moyenne
  harmonique après `vitesse-moyenne` et `cote`, déjà dans le grand test.
- PROBLEMES « ADN » (correspondance 1 sur 100 000 dans une région de 2 millions d'habitants) : c'est presque mot
  pour mot le `cas2` de la fiche `procureur` (`donnees.js`).
- PROBLEMES « les avions de Wald » : atelier `wald` (`pratiques.js`).
- PROBLEMES « anniversaires » : atelier `anniversaires` (`experiences.js`).
- PROBLEMES « salaire moyen et médiane » : déjà dans `perception.js` (graphique du salaire du dirigeant).
- PROBLEMES « vingt tests à 5 % » (probabilité d'au moins un faux résultat significatif, 64 %) : l'atelier
  `fabriquer` (`pratiques.js`) traite déjà les comparaisons multiples, et le calcul (complément d'une puissance)
  doublonne `projet`, `quatre-lancers` et `mere`.
- PROBLEMES « l'attente du bus » (paradoxe de l'inspection) : même mécanisme que `taille-cours` ; mentionné d'une
  phrase dans son explication.
- PROBLEMES « effet de leurre » en `paire` : le message affiché en cas d'incohérence (« C'est le choix le plus
  fréquent ») ne serait pas étayé par Huber, Payne et Puto (1982), dont le plan d'étude comparait des groupes.
- PROBLEMES « séjours de ski » (Arkes et Blumer, 1985) : déjà dans la fiche `couts-irrecuperables`.
- SYLLOGISMES `pianistes` (tous les pianistes lisent la musique ; certains enfants la lisent ; donc certains
  enfants sont pianistes) : valide en apparence, non valide (`syl.py`), mais même forme que `chats`, `roses` et
  `tulipes`, déjà nombreux.
- SYLLOGISMES : conditionnels du type « si c'est du vin, il contient de l'alcool ; la bière en contient ; donc… » :
  affirmation du conséquent déjà présente (`tortues`).
- QUI_PROUVE « images satellites jugées truquées » : troisième variante d'« une preuve apportée, puis une accusation
  de trucage », après Yasmine et Karim, Paul et Max.
- QUI_PROUVE « résultats d'un vote contestés » : sujet trop proche de la politique réelle.
- QUI_PROUVE « panne sous garantie » : la réponse dépend d'une règle de droit de la consommation (présomption
  pendant la garantie légale), qu'il faudrait sourcer, et la situation n'est pas nette.
