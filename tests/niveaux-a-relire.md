# Niveaux à relire

Les niveaux des ateliers à contenu écrit ont été attribués à la main, selon les critères écrits en tête de chaque
tableau (rappelés ci-dessous). Pour changer un niveau, modifier le champ `niveau` de l'item dans `static/jeux-donnees.js`
ou `static/experiences.js`. Le décompte par niveau et les manques : `tests/lancer.sh items` (ou `tests/niveaux.html`).

Les ateliers fondés sur des données (« Plus ou moins ? », « Qu'est-ce qui tue le plus ? », « Avant ou après ? »,
« Le nord est où ? ») calculent le niveau à partir des données : fonctions `niveauDuelPays`, `niveauDuelCauses`,
`niveauPaireChronologie` et `niveauPaireVilles` de `static/chiffres.js`. Les paires célèbres sont au niveau 2.

## Problèmes classiques

Niveau 1 : linda, steve, monte-carlo, instructeurs, epidemie. Niveau 2 : maternites, dick, allais, ellsberg,
etats-finaux. Niveau 3 : taxi, sally-clark, berkeley, comtes.

## Trois questions faciles

Niveau 1 : les trois questions originales de Frederick (batte, machines, nenuphars). Niveau 2 : les quatre de
Thomson et Oppenheimer (course, moutons, emilie, trou). Aucune question de niveau 3 pour l'instant.

## Nouveaux items de ce lot

« Vrai ou faux ? », niveau 3, affirmations fausses telles qu'elles sont formulées : nil, perihelie, tournesol, big-ben,
einstein-nobel, pole-sud, edison, annee, eiffel-hauteur, colomb-premier. Chacune a été vérifiée (Wikipédia, Fondation
Nobel, Atamian et al., Science, 2016) ; leur explication dit ce qui est vrai.

## Le monde en chiffres

Niveaux : d'après la part de bonnes réponses du public dans l'enquête Gapminder de 2017 quand elle est connue (plus de 30 % : niveau 1 ; 15 à 30 % : niveau 2 ; moins de 15 % : niveau 3), sinon d'après la notoriété de la donnée.

**Niveau 1** (7)

- `esperance` Quelle est l'espérance de vie à la naissance dans le monde ? → 70 ans
- `fecondite` Combien d'enfants une femme a-t-elle en moyenne dans le monde ? → environ 2,2
- `villes` Quelle part de l'humanité vit en ville ? → 58 %
- `enfants` Depuis 1990, la mortalité des enfants de moins de 5 ans dans le monde a… → baissé de plus de moitié
- `population` Combien d'êtres humains vivent sur Terre en 2025 ? → 8,2 milliards
- `refugies-revenus` Où vivent la plupart des réfugiés du monde ? → dans des pays à revenu faible ou intermédiaire
- `pib` Depuis 1990, le revenu moyen par habitant dans le monde, corrigé de l'inflation, a… → nettement augmenté

**Niveau 2** (14)

- `electricite` Quelle part de la population mondiale a accès à l'électricité ? → 80 %
- `revenus` Où vit la majorité de la population mondiale ? → dans des pays à revenu intermédiaire
- `filles` Dans le monde, quelle part des filles achève l'école primaire ? → 88 %
- `scolarite` Dans le monde, les hommes de 30 ans ont passé en moyenne 10 ans à l'école. Et les femmes du même âge ? → 9 ans
- `alphabetisation` Quelle part des adultes dans le monde sait lire et écrire ? → 88 %
- `jeunes` Quelle part de la population mondiale a moins de 15 ans ? → 25 %
- `ages` Quelle part de la population mondiale a 65 ans ou plus ? → 10 %
- `internet` Quelle part de la population mondiale utilise Internet ? → 74 %
- `maternelle` Depuis 1990, la mortalité maternelle (décès liés à la grossesse et à l'accouchement) a… → été divisée par deux
- `faim` Quelle part de la population mondiale est sous-alimentée ? → 8 %
- `parlements` Quelle part des sièges des parlements nationaux est occupée par des femmes dans le monde ? → 27 %
- `pic` Selon les projections de l'ONU, la population mondiale… → culminera vers 2085, à environ 10,3 milliards
- `forets` Quelle part des terres émergées est couverte de forêts ? → 31 %
- `refugies` Combien de personnes ont été forcées de quitter leur foyer (réfugiés et déplacés internes) dans le monde ? → 120 millions

**Niveau 3** (13)

- `pauvrete` Depuis 1990, la part de l'humanité vivant dans l'extrême pauvreté a… → été divisée par plus de deux
- `vaccins` Quelle part des enfants d'un an dans le monde a reçu au moins un vaccin ? → 80 %
- `catastrophes` En cent ans, le nombre annuel de morts dues aux catastrophes naturelles a… → diminué de plus de moitié
- `especes` En 1996, le tigre, le panda géant et le rhinocéros noir étaient classés en danger. Combien de ces espèces sont aujourd'hui plus menacées ? → aucune
- `eau` Quelle part de la population mondiale dispose d'une eau potable « gérée en toute sécurité » (à domicile, disponible et non contaminée) ? → 74 %
- `croissance` Quelle part des enfants de moins de 5 ans a un retard de croissance (une taille trop petite pour leur âge, signe de malnutrition chronique) ? → 23 %
- `electricite-propre` En 2024, quelle part de l'électricité mondiale a été produite sans combustibles fossiles (renouvelables et nucléaire) ? → 41 %
- `peine-de-mort` Combien de pays ont aboli la peine de mort, en droit ou en pratique ? → plus de 140
- `nucleaire` Combien d'armes nucléaires existaient dans le monde en janvier 2025 ? → environ 12 000
- `depenses-militaires` En 2024, les dépenses militaires mondiales ont… → augmenté de près de 10 %
- `etats-unis-armee` Quelle part des dépenses militaires mondiales les États-Unis représentent-ils ? → 37 %
- `autocraties` Quelle part de la population mondiale vit dans un pays classé comme autocratie ? → environ les trois quarts
- `refugies-iran` Quel pays accueillait le plus de réfugiés fin 2024 ? → l'Iran

## Vrai ou faux ?

Niveaux : 1, idées reçues très connues ; 2, faits qui demandent une connaissance précise ; 3, comparaisons ou chiffres contre-intuitifs, où l'intuition se trompe le plus souvent.

**Niveau 1** (25)

- `cerveau-10` [faux] Nous n'utilisons que 10 % de notre cerveau.
- `muraille-lune` [faux] La Grande Muraille de Chine est visible à l'œil nu depuis la Lune.
- `foudre` [faux] La foudre ne frappe jamais deux fois au même endroit.
- `chauves-souris` [faux] Les chauves-souris sont aveugles.
- `sang-bleu` [faux] Dans les veines, le sang est bleu.
- `poisson-rouge` [faux] Les poissons rouges ont une mémoire de trois secondes.
- `taureau` [faux] La couleur rouge rend les taureaux furieux.
- `autruches` [faux] Les autruches enfouissent leur tête dans le sable quand elles ont peur.
- `rasage` [faux] Se raser fait repousser les poils plus épais.
- `ror` [faux] Le vaccin ROR (rougeole, oreillons, rubéole) provoque l'autisme.
- `desert` [faux] Le plus grand désert du monde est le Sahara.
- `chimpanze` [faux] L'être humain descend du chimpanzé.
- `saisons` [faux] Il fait plus chaud en été parce que la Terre est alors plus proche du Soleil.
- `face-cachee` [faux] La face cachée de la Lune est toujours plongée dans l'obscurité.
- `ver` [faux] Un ver de terre coupé en deux donne deux vers.
- `cent-ans` [faux] La guerre de Cent Ans a duré cent ans.
- `dinosaures-humains` [faux] Les premiers humains ont côtoyé des dinosaures non aviens.
- `pieuvre` [vrai] Les pieuvres ont trois cœurs.
- `son-eau` [vrai] Le son se propage plus vite dans l'eau que dans l'air.
- `abeilles` [vrai] Une abeille ouvrière qui pique un humain en meurt, en général.
- `robot` [vrai] Le mot « robot » vient du tchèque.
- `metre` [vrai] Le système métrique a été créé pendant la Révolution française.
- `oiseaux` [vrai] Les oiseaux sont des dinosaures.
- `villes` [vrai] Plus de la moitié de l'humanité vit en ville.
- `huit-milliards` [vrai] La population mondiale a dépassé 8 milliards d'habitants.

**Niveau 2** (39)

- `napoleon` [faux] Napoléon était particulièrement petit pour son époque.
- `vikings` [faux] Les guerriers vikings portaient des casques à cornes.
- `terre-plate` [faux] Au Moyen Âge, les savants européens pensaient que la Terre était plate.
- `sucre` [faux] Le sucre rend les enfants hyperactifs.
- `ongles` [faux] Les cheveux et les ongles continuent de pousser après la mort.
- `tete-chaleur` [faux] On perd la plus grande partie de sa chaleur par la tête.
- `einstein` [faux] Einstein a échoué en mathématiques à l'école.
- `brioche` [faux] Marie-Antoinette a dit : « Qu'ils mangent de la brioche ! »
- `colomb` [faux] Christophe Colomb voulait prouver que la Terre était ronde.
- `sahara-vert` [faux] Le Sahara a toujours été un désert.
- `groenland` [faux] Le Groenland est plus vaste que l'Afrique.
- `doublement` [faux] La population mondiale double environ tous les vingt ans.
- `diamants` [faux] Les diamants sont du charbon compressé.
- `verre` [faux] Les vitraux anciens sont plus épais en bas parce que le verre coule lentement.
- `alcool-chaleur` [faux] Boire de l'alcool réchauffe le corps.
- `chiens` [faux] Les chiens voient en noir et blanc.
- `langue` [faux] Chaque saveur est perçue par une zone précise de la langue.
- `vomitorium` [faux] Les Romains se faisaient vomir dans des « vomitoriums » pendant leurs banquets.
- `cotes` [faux] Les femmes ont une côte de plus que les hommes.
- `penombre` [faux] Lire dans la pénombre abîme durablement les yeux.
- `craquer` [faux] Faire craquer ses doigts provoque de l'arthrose.
- `rhin` [faux] Le Rhin est plus long que le Danube.
- `rome` [faux] Rome est plus au sud que New York.
- `alaska` [faux] L'Alaska est plus vaste que le Mexique.
- `pingouins` [faux] Les pingouins vivent en Antarctique.
- `cleopatre` [vrai] Cléopâtre a vécu plus près de notre époque que de la construction de la grande pyramide de Khéops.
- `banane` [vrai] Une banane est légèrement radioactive.
- `soleil-masse` [vrai] Le Soleil concentre plus de 99 % de la masse du Système solaire.
- `eclair` [vrai] L'air traversé par un éclair devient plus chaud que la surface du Soleil.
- `ours` [vrai] Sous leur fourrure, les ours polaires ont la peau noire.
- `lune-recul` [vrai] La Lune s'éloigne de la Terre de quelques centimètres par an.
- `loire` [vrai] La Loire est le plus long fleuve s'écoulant entièrement en France.
- `inde-chine` [vrai] L'Inde compte plus d'habitants que la Chine.
- `chine-heure` [vrai] La Chine n'utilise qu'un seul fuseau horaire.
- `bebe-os` [vrai] Un nouveau-né a plus d'os qu'un adulte.
- `pise` [vrai] La tour de Pise a commencé à pencher pendant sa construction.
- `madagascar` [vrai] Madagascar est plus vaste que la France métropolitaine.
- `afrique` [vrai] L'Afrique est plus vaste que la Chine, les États-Unis et l'Inde réunis.
- `ev-france` [vrai] En France, l'espérance de vie des femmes dépasse 85 ans.

**Niveau 3** (29)

- `telephones` [faux] Le Centre international de recherche sur le cancer classe les ondes des téléphones portables comme « cancérogènes certaines ».
- `naissances-deces` [faux] En France, en 2025, il y a eu plus de naissances que de décès.
- `venus` [vrai] Vénus met plus de temps à faire un tour sur elle-même qu'à faire le tour du Soleil.
- `arbres-etoiles` [vrai] Il y a plus d'arbres sur Terre que d'étoiles dans la Voie lactée.
- `trex` [vrai] Le tyrannosaure a vécu plus près de notre époque que de celle du stégosaure.
- `mauna-kea` [vrai] Mesuré depuis sa base, au fond de l'océan, le Mauna Kea (Hawaï) est plus haut que l'Everest.
- `paris-montreal` [vrai] Paris est plus au nord que Montréal.
- `bangladesh` [vrai] Le Bangladesh compte plus d'habitants que la Russie.
- `japon-forets` [vrai] Les forêts couvrent environ deux tiers du territoire du Japon.
- `fuseaux` [vrai] La France est le pays qui compte le plus de fuseaux horaires.
- `cerveau-energie` [vrai] Le cerveau représente environ 2 % de la masse du corps mais consomme environ un cinquième de son énergie.
- `atlantique` [vrai] L'océan Atlantique s'élargit de quelques centimètres par an.
- `chimborazo` [vrai] Le sommet le plus éloigné du centre de la Terre n'est pas celui de l'Everest.
- `galilee` [vrai] Galilée et Shakespeare sont nés la même année.
- `nintendo` [vrai] Nintendo a été fondée au XIXe siècle.
- `bresil` [vrai] Le Brésil est plus vaste que les États-Unis sans l'Alaska ni Hawaï.
- `neutrons` [vrai] Une cuillère à café de matière d'étoile à neutrons pèserait plusieurs milliards de tonnes.
- `pauvrete` [vrai] La part de l'humanité vivant dans l'extrême pauvreté a été divisée par plus de quatre depuis 1990.
- `electricite` [vrai] Plus de 90 % de l'humanité a accès à l'électricité.
- `nil` [faux] Le Nil est, sans contestation possible, le plus long fleuve du monde.
- `perihelie` [faux] La Terre est plus proche du Soleil en juillet qu'en janvier.
- `tournesol` [faux] Les tournesols suivent le Soleil d'est en ouest tout au long de leur vie.
- `big-ben` [faux] Big Ben est le nom de la tour de l'horloge du palais de Westminster, à Londres.
- `einstein-nobel` [faux] Albert Einstein a reçu le prix Nobel de physique pour sa théorie de la relativité.
- `pole-sud` [faux] Le pôle Sud est plus froid que le pôle Nord parce qu'il est plus éloigné du Soleil.
- `edison` [faux] Thomas Edison a inventé l'ampoule électrique.
- `annee` [faux] Une année dure exactement 365 jours et 6 heures.
- `eiffel-hauteur` [faux] La tour Eiffel garde la même hauteur toute l'année.
- `colomb-premier` [faux] Christophe Colomb a été le premier Européen à atteindre l'Amérique.

## Ordres de grandeur

Niveaux : 1, quantités familières ou souvent citées ; 2, quantités qu'on peut reconstituer par un raisonnement ; 3, très grands nombres sans repère quotidien.

**Niveau 1** (12)

- `langues` Nombre de langues parlées dans le monde
- `islande` Nombre d'habitants de l'Islande
- `monaco` Nombre d'habitants de Monaco
- `chine` Nombre d'habitants de la Chine
- `univers` Âge de l'Univers, en années
- `terre-age` Âge de la Terre, en années
- `pop-1800` Population mondiale en 1800
- `internautes` Nombre d'utilisateurs d'Internet dans le monde
- `enfants` Nombre d'enfants de moins de 15 ans dans le monde
- `communes` Nombre de communes en France
- `naissances-fr` Nombre de naissances en France en 2025
- `lune-humains` Nombre de personnes ayant marché sur la Lune

**Niveau 2** (12)

- `neurones` Nombre de neurones dans un cerveau humain
- `etoiles` Nombre d'étoiles dans la Voie lactée
- `terre-soleil` Distance moyenne entre la Terre et le Soleil, en kilomètres
- `deces-jour` Nombre de décès par jour dans le monde
- `naissances-jour` Nombre de naissances par jour dans le monde
- `battements` Nombre de battements de cœur au cours d'une vie de 80 ans
- `pib-monde` PIB mondial annuel, en dollars
- `pauvres` Nombre de personnes vivant dans l'extrême pauvreté (moins de 3 dollars par jour)
- `russie` Superficie de la Russie, en km²
- `monaco-surface` Superficie de Monaco, en km²
- `muraille` Longueur totale de la Grande Muraille de Chine, en kilomètres
- `soleil-diametre` Diamètre du Soleil, en kilomètres

**Niveau 3** (9)

- `cellules` Nombre de cellules humaines dans le corps d'un adulte
- `bacteries` Nombre de bactéries hébergées par le corps d'un adulte
- `arbres` Nombre d'arbres sur Terre
- `fourmis` Nombre de fourmis sur Terre
- `oceans` Volume total des océans, en kilomètres cubes
- `lumiere-an` Distance parcourue par la lumière en un an, en kilomètres
- `proxima` Distance de l'étoile la plus proche du Soleil (Proxima du Centaure), en kilomètres
- `humains-ayant-vecu` Nombre d'êtres humains nés depuis l'apparition de notre espèce
- `co2` Émissions mondiales annuelles de CO₂ du secteur électrique, en tonnes

## Êtes-vous sûr à 90 % ?

Niveaux : 1, quantités et dates très connues ; 2, connaissances de culture générale précise ; 3, quantités rarement rencontrées, où la largeur de la fourchette compte le plus.

**Niveau 1** (26)

- `everest` Hauteur du mont Everest
- `os` Nombre d'os du squelette d'un adulte
- `darwin` Année de publication de « L'Origine des espèces » de Darwin
- `terre-lune` Distance moyenne entre la Terre et la Lune
- `onu` Nombre d'États membres de l'ONU
- `mozart` Année de naissance de Mozart
- `france-pop` Population de la France au 1er janvier 2026
- `seine` Longueur de la Seine
- `wright` Année du premier vol motorisé des frères Wright
- `napoleon` Année de la mort de Napoléon Ier
- `piano` Nombre de touches d'un piano standard
- `equateur` Circonférence de la Terre à l'équateur
- `eiffel` Hauteur de la tour Eiffel, antennes comprises
- `lumiere` Vitesse de la lumière dans le vide
- `chromosomes` Nombre de chromosomes d'une cellule humaine
- `dents-lait` Nombre de dents de lait d'un enfant
- `calment` Âge de Jeanne Calment à sa mort, record de longévité humaine vérifié
- `mont-blanc` Altitude du mont Blanc
- `bolt` Record du monde du 100 m (Usain Bolt, 2009)
- `bastille` Année de la prise de la Bastille
- `hugo` Année de naissance de Victor Hugo
- `louis14` Année de la mort de Louis XIV
- `versailles` Année de la signature du traité de Versailles
- `tunnel` Année de l'ouverture du tunnel sous la Manche
- `adn` Année de la découverte de la structure de l'ADN
- `wikipedia` Année de création de Wikipédia

**Niveau 2** (25)

- `son` Vitesse du son dans l'air à 20 °C
- `lune-diametre` Diamètre de la Lune
- `burj` Hauteur de la tour Burj Khalifa (Dubaï)
- `elements` Nombre d'éléments du tableau périodique
- `kilimandjaro` Altitude du Kilimandjaro
- `mediterranee` Superficie de la mer Méditerranée
- `sahara` Superficie du Sahara
- `loire` Longueur de la Loire
- `danube` Longueur du Danube
- `tgv` Record de vitesse sur rail (TGV, 2007)
- `liberte` Hauteur de la statue de la Liberté, socle compris
- `communes` Nombre de communes en France au 1er janvier 2025
- `naissances-fr` Nombre de naissances en France en 2025
- `ev-femmes` Espérance de vie des femmes en France en 2025
- `fecondite-fr` Nombre moyen d'enfants par femme en France en 2025
- `greffe` Année de la première greffe du cœur
- `penicilline` Année de la découverte de la pénicilline
- `telephone` Année du brevet du téléphone de Graham Bell
- `separation` Année de la loi de séparation des Églises et de l'État
- `japon` Population du Japon en 2025
- `bresil` Population du Brésil en 2025
- `canada` Population du Canada en 2025
- `allemagne` Population de l'Allemagne en 2025
- `ev-japon` Espérance de vie à la naissance au Japon en 2024
- `russie` Superficie de la Russie

**Niveau 3** (29)

- `mont-blanc-1786` Année de la première ascension du mont Blanc
- `afrique-onu` Nombre de pays africains membres de l'ONU
- `baikal` Profondeur maximale du lac Baïkal
- `mars-diametre` Diamètre de la planète Mars
- `jupiter-diametre` Diamètre de Jupiter
- `mars-annee` Durée d'une année sur Mars
- `mars-soleil` Distance moyenne entre le Soleil et Mars
- `jupiter-annee` Durée d'une année sur Jupiter
- `venus-temperature` Température moyenne à la surface de Vénus
- `terre-vitesse` Vitesse de la Terre sur son orbite autour du Soleil
- `fer` Température de fusion du fer
- `or` Masse d'un litre d'or
- `elephant` Durée de gestation d'une éléphante d'Afrique
- `hyperion` Hauteur du plus grand arbre connu (un séquoia de Californie)
- `mariannes` Profondeur maximale de la fosse des Mariannes
- `angel` Hauteur du Salto Ángel (Venezuela), plus haute chute d'eau du monde
- `muraille` Longueur totale de la Grande Muraille de Chine, toutes sections comprises
- `titicaca` Altitude du lac Titicaca
- `paris-surface` Superficie de la commune de Paris
- `constantinople` Année de la prise de Constantinople par les Ottomans
- `montgolfiere` Année du premier vol habité en montgolfière
- `esclavage` Année de l'abolition définitive de l'esclavage dans les colonies françaises
- `principia` Année de publication des « Principia » de Newton
- `photo` Année de la plus ancienne photographie conservée (Niépce)
- `nigeria` Population du Nigeria en 2025
- `ev-nigeria` Espérance de vie à la naissance au Nigeria en 2024
- `coree` Nombre moyen d'enfants par femme en Corée du Sud en 2024
- `japon-65` Part des 65 ans et plus dans la population du Japon en 2025
- `bangladesh` Densité de population du Bangladesh en 2024

## Qui l'a vraiment dit ?

Niveaux : 1, citations dont l'attribution est très connue ou très discutée ; 2, citations courantes dont l'origine l'est moins ; 3, attributions erronées tenaces ou citations authentiques peu connues.

**Niveau 1** (14)

- `galilee` [apocryphe] Galilée, après son procès (1633) : « Et pourtant, elle tourne. »
- `louis14` [apocryphe] Louis XIV : « L'État, c'est moi. »
- `watson` [deformee] Sherlock Holmes, chez Conan Doyle : « Élémentaire, mon cher Watson. »
- `vador` [deformee] Dark Vador, « L'Empire contre-attaque » (1980) : « Luke, je suis ton père. »
- `casablanca` [deformee] Humphrey Bogart, « Casablanca » (1942) : « Joue-la encore, Sam. »
- `lavoisier` [deformee] Antoine Lavoisier : « Rien ne se perd, rien ne se crée, tout se transforme. »
- `newton` [authentique] Isaac Newton : « Si j'ai vu plus loin, c'est en me tenant sur les épaules de géants. »
- `marx` [authentique] Karl Marx : « La religion est l'opium du peuple. »
- `descartes` [authentique] René Descartes : « Je pense, donc je suis. »
- `pascal` [authentique] Blaise Pascal : « Le cœur a ses raisons que la raison ne connaît point. »
- `sartre` [authentique] Jean-Paul Sartre : « L'enfer, c'est les autres. »
- `montaigne` [authentique] Michel de Montaigne : « Que sais-je ? »
- `candide` [authentique] Voltaire : « Il faut cultiver notre jardin. »
- `boileau` [authentique] Nicolas Boileau : « Ce que l'on conçoit bien s'énonce clairement. »

**Niveau 2** (11)

- `voltaire` [apocryphe] Voltaire : « Je ne suis pas d'accord avec ce que vous dites, mais je me battrai jus »
- `einstein-folie` [apocryphe] Albert Einstein : « La folie, c'est de faire toujours la même chose et de s'attendre à un  »
- `henri4` [apocryphe] Henri IV : « Paris vaut bien une messe. »
- `ford` [apocryphe] Henry Ford : « Si j'avais demandé aux gens ce qu'ils voulaient, ils m'auraient répond »
- `machiavel` [deformee] Machiavel : « La fin justifie les moyens. »
- `socrate` [deformee] Socrate : « Je sais que je ne sais rien. »
- `churchill` [authentique] Winston Churchill : « La démocratie est le pire des régimes, à l'exception de tous les autre »
- `kant` [authentique] Emmanuel Kant : « Sapere aude ! Aie le courage de te servir de ton propre entendement. »
- `rabelais` [authentique] François Rabelais : « Science sans conscience n'est que ruine de l'âme. »
- `einstein-des` [authentique] Albert Einstein : « Dieu ne joue pas aux dés. »
- `nietzsche` [authentique] Friedrich Nietzsche : « Ce qui ne me tue pas me rend plus fort. »

**Niveau 3** (9)

- `darwin` [apocryphe] Charles Darwin : « Ce n'est pas le plus fort de l'espèce qui survit, ni le plus intellige »
- `burke` [apocryphe] Edmund Burke : « Pour triompher, le mal n'a besoin que de l'inaction des gens de bien. »
- `malraux` [apocryphe] André Malraux : « Le XXIe siècle sera religieux ou ne sera pas. »
- `statistiques` [apocryphe] Benjamin Disraeli : « Il y a trois sortes de mensonges : les mensonges, les sacrés mensonges »
- `gandhi` [deformee] Gandhi : « Sois le changement que tu veux voir dans le monde. »
- `camus` [deformee] Albert Camus : « Mal nommer les choses, c'est ajouter au malheur du monde. »
- `russell` [authentique] Bertrand Russell : « Le problème de ce monde, c'est que les imbéciles sont sûrs d'eux, alor »
- `feynman` [authentique] Richard Feynman : « Le premier principe est de ne pas se tromper soi-même, et vous êtes la »
- `hume` [authentique] David Hume : « Le sage proportionne sa croyance aux preuves. »

