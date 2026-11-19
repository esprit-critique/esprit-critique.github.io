# Faits à vérifier

Aucun fait non vérifié n'est affiché sur le site à ce jour.

- Rosenthal, « Monty Hall, Monty Fall, Monty Crawl », Math Horizons, 2008 : référence vérifiée (Crossref). Le site
  n'en cite que l'existence ; la conclusion (changer gagne une fois sur deux avec un présentateur distrait) est
  vérifiée par la simulation affichée.
- Wason et Brooks, « THOG: The anatomy of a problem », Psychological Research, 1979 : référence vérifiée (Crossref).
  Le site n'en cite aucun chiffre ; la solution du problème se vérifie par le raisonnement donné.
- Population de Paris (« Ordres de grandeur ») : 2 103 778 habitants en 2023, vérifié le 18 novembre 2026 sur le
  dossier complet de l'Insee pour la commune de Paris (COM-75056, tableau POP T1, recensement de 2023) ; affiché.
- Écartés faute de source vérifiable (non affichés) : une phrase de Spinoza (son texte n'a pas été noté : impossible à
  retrouver), les taux de réussite de Lecoutre (1992) et de Tversky et Kahneman (1971, 1972) pour les problèmes ajoutés.
  « Impossible n'est pas français » : vérifiée et ajoutée le 18 novembre 2026 (voir plus bas).
- Mentions légales, téléphone de l'hébergeur : +1 415 857 5430. Aucune page officielle de GitHub ne donne de numéro ;
  celui-ci vient du registre ARIN (contact « GitHub », type bureau), où GitHub déclare lui-même ses coordonnées. Un
  répertoire tiers (datarequests.org) donne +1 877 448 4820, non retenu. L'adresse (88 Colin P. Kelly Jr. Street,
  San Francisco, CA 94107) vient de la déclaration de confidentialité de GitHub.

## Illusion de Ponzo (refonte, lot 2, 11 novembre 2026)

Non retenue pour l'illusion du jour : l'article de Mario Ponzo de 1911 souvent cité porte sur une illusion tactile
(illusion d'Aristote), et l'origine de l'illusion visuelle qui porte son nom reste incertaine (Ponzo l'aurait employée
en 1912 pour expliquer l'illusion de la Lune : « Rapports entre quelques illusions visuelles de contraste angulaire et
l'appréciation de grandeur des astres à l'horizon », Archives italiennes de biologie, 58, 1912, non trouvé en ligne le
18 novembre 2026). La piste Bertamini et Wade (2023, *Perception*) ne convient pas : elle traduit un autre article de
Ponzo (1928, sur la numérosité). À ajouter seulement avec l'article de 1912 lu.

## Synchronisation : textes à relire avant d'activer SYNCHRO_URL (refonte, lot 6, 11 novembre 2026)

Tant que `SYNCHRO_URL` est vide, les textes actuels restent vrais (« aucune donnée envoyée »). Le commit qui active la
synchronisation doit les rendre exacts (README Principes, `noscript` et « Vos données » des deux `index.html`, pied de
page, en-tête de `sw.js`, introduction du portrait, textes du Grand test, `tests/pages/generer_pages.py`). Proposition :

- **Principe** : « Sans compte par défaut : votre progression reste dans votre navigateur. Si vous activez la
  synchronisation, une copie chiffrée sur votre appareil est conservée chez un hébergeur ; personne d'autre que vous ne
  peut la lire. »
- **Politique de confidentialité, nouvelle section « Synchronisation (facultative) »** : « Si vous l'activez, votre
  progression est chiffrée dans votre navigateur (AES-256-GCM) avant d'être envoyée. Sont envoyés : ce contenu chiffré,
  illisible sans votre code ; sa taille ; un identifiant et un jeton dérivés de votre code. L'hébergeur du serveur
  (Cloudflare) voit, comme tout hébergeur, l'adresse IP des requêtes. Les données sont conservées dans une base située
  dans l'Union européenne, tant que vous les utilisez, et supprimées automatiquement après 24 mois sans écriture. Vous
  pouvez les supprimer à tout moment : Profil, Réglages, « Supprimer la copie en ligne ». Aucune adresse électronique,
  aucun nom, aucun mot de passe ne sont collectés ; le site ne peut pas récupérer un code perdu. »
- **Conditions d'utilisation** : « La synchronisation est un service gratuit, sans garantie de disponibilité ; gardez un
  fichier de sauvegarde (« Enregistrer dans un fichier ») pour ne rien perdre. »

## Contenus écartés faute de source primaire (ajout de culture générale, 16 novembre 2026)

- **« Impossible n'est pas français », Napoléon** : vérifiée le 18 novembre 2026 dans la Correspondance de Napoléon Ier,
  tome XXV (archive.org, `correspondancede0000vari_t3m5`), lettre n° 20256 au général comte Lemarois, Dresde, 9 juillet
  1813 : « “Ce n'est pas possible”, m'écrivez-vous : cela n'est pas français. » Ajoutée à `CITATIONS` (statut
  « déformée », `depuis`).
- **« Les requins existaient avant les arbres »** : vérifié le 18 novembre 2026 sur les résumés (PubMed) de Miller,
  Cloutier et Turner, Nature, 2003 (requin articulé *Doliodus problematicus*, presque 409 millions d'années, Dévonien
  inférieur) et de Stein et al., Nature, 2007 (arbres de Gilboa, fin du Dévonien moyen) ; ajouté à `VRAI_FAUX` avec
  `depuis`. Aucun âge n'est donné pour les arbres : le résumé de Stein n'en cite pas.

## Sources des sophismes restées générales (audit du 18 novembre 2026)

Treize sources ont été précisées et vérifiées sur le texte (Aristote, Rhétorique I, 2, Réfutations sophistiques 4 et 5,
Premiers Analytiques II, 16 ; Hume, Traité II, 3, 2 ; Bentham, Book of Fallacies I, 2 ; Mill, Système de logique V, 5 ;
Diogène Laërce II, 108 ; Boykoff et Boykoff 2004 ; Rosenthal 1979 ; Walton 1992). La fiche « Généralisation hâtive »
attribuait la notion aux Réfutations sophistiques : Aristote n'y décrit pas la généralisation à partir de quelques cas
(le plus proche est le « secundum quid », emploi absolu ou relatif d'un terme) ; source remplacée par Mill.

Précisées le 18 novembre 2026 (deuxième passe) : `tu-quoque` (Walton, Ad Hominem Arguments, 1998), `popularite`
(Walton, Appeal to Popular Opinion, 1999), `ad-baculum` (Walton, Scare Tactics, 2000), `post-hoc` (Aristote,
Rhétorique II, 24, lu sur Perseus), `hors-contexte` (Quote Mine Project de TalkOrigins, lu ; l'origine du terme y est
dite obscure, d'où son retrait), `tireur-elite` (note « Cancer Clusters » du Connecticut Department of Public Health,
lue : elle décrit le mécanisme sans employer le terme ; l'article de Gawande, New Yorker, 1999, reste illisible).

Restent générales, sans erreur relevée : `poteaux` (expression idiomatique), `faux-dilemme`, `juste-milieu`,
`cause-unique`, `negation-antecedent` et `sophisme-sophisme` (le recueil de Madsen Pirie, 1985, n'a pas pu être
consulté).

## Vrai ou faux : sources secondaires à remplacer (audit du 18 novembre 2026)

Sur 106 affirmations, 66 n'avaient que Wikipédia pour source (le plus souvent les listes d'idées reçues). Huit ont été
vérifiées sur la publication primaire (résumés PubMed, texte intégral sur PMC) et leur explication alignée sur elle :
`chiens` (Neitz et al. 1989), `taureau` (Jacobs et al. 1998), `craquer` (deWeber et al. 2011), `ongles`, `rasage` et
`penombre` (Vreeman et Carroll, BMJ 2007), `cerveau-energie` (Raichle et Gusnard 2002), `oiseaux` (Brusatte et al. 2015) ;
puis `sang-bleu` (Kienle et al., Applied Optics 1996, résumé) et `chimpanze` (Chimpanzee Sequencing and Analysis
Consortium, Nature 2005, résumé) ; puis `saisons` et `perihelie` (NASA Space Place) et `son-eau` (NOAA), chiffres non
vérifiés retirés des explications ; puis `face-cachee` (NASA, Top Moon Questions) et `neutrons` (NASA, Imagine the
Universe : affirmation reformulée sur le morceau de sucre, environ un milliard de tonnes, au lieu d'une cuillère à café
et de « plus de 5 milliards de tonnes », non vérifiés) ; puis `nintendo` (historique officiel de Nintendo) et `annee`
(United States Naval Observatory) ; puis `eiffel-hauteur` (Ville de Paris), `verre` (Zanotto, Am. J. Phys. 1998, résumé)
et `metre` (Arago, Astronomie populaire, XXIII, 14). `big-ben` : vérifié à la main par le propriétaire le 19 novembre 2026 sur parliament.uk (« Facts and figures » :
« Big Ben weighs 13.7 tonnes » ; « Clock Tower to be renamed Elizabeth Tower », 2012), le site refusant la lecture
automatique. Puis `chimborazo` (NOAA), `pole-sud` (NSIDC) et `atlantique` (NOAA Ocean Exploration), chiffres non vérifiés
retirés (6 263 m, 2 835 m, 2,5 cm). Puis `alaska` et `bresil` (US Census Bureau, State Area Measurements ;
Banque mondiale). Puis `banane` (EPA, RadTown).
Sources trouvées mais illisibles automatiquement pour `rhin` (CIPR, ICPDR) et `dinosaures-humains` (Smithsonian, extinction) :
les deux ont été sourcées ensuite sur d'autres sources primaires lues (voir plus bas).
Puis `chauves-souris` (USGS, « Are bats blind? » ; écholocation et « aucune espèce » retirés, la page ne les dit pas), `pieuvre` (Wells, J. Exp. Biol. 1980, résumé : « a trio of hearts », dont deux cœurs branchiaux ; rôle de pompe vers les branchies retiré), `baleines` (NOAA, Marine mammals), `koala` (gouvernement de Nouvelle-Galles du Sud, page lue : le kangourou, non cité, remplacé par le wombat, son plus proche parent) et `coeur` (NIH, NHLBI, Heart Anatomy et Blood Flow).
Puis `vikings` (Musée national du Danemark, « Viking helmets » : explication reformulée, la page signalant des casques à cornes figurés, comme sur la tapisserie d'Oseberg ; Wagner, non cité, retiré), `araignees` (Smithsonian Education ; « six pattes » des insectes retiré), `ours` (Bureau of Land Management : poils sans pigment, d'aspect blanc ; « jaunâtre » retiré), `galilee` (Museo Galileo ; Shakespeare Birthplace Trust) et `pise` (Opera della Primaziale Pisana, citant Vasari ; achèvement au XIVe siècle, non dit, retiré).
Puis `rhin` (Bundesanstalt für Gewässerkunde : Rhin 1 232,7 km, Danube 2 857 km ; « 2 850 km » corrigé en « environ 2 860 km »), `loire` (Sandre, Carthage 2017 : Loire 1 006 km, Seine 775 km), `sahara-vert` (Cheddadi et al., PNAS 2021, résumé : période humide africaine vers 14 500 à 5 000 ans ; « 11 000 à 5 000 ans » et « prairies, arbres et lacs », non lus, remplacés) et `dinosaures-humains` (Brusatte et al., Biol. Rev. 2015, résumé : 66 millions d'années ; Smithsonian Human Origins : Homo habilis, 2,4 à 1,4 millions d'années).
Puis `tomate` (Cour suprême des États-Unis, Nix v. Hedden, 1893 : « Botanically speaking, tomatoes are the fruit of a vine » ; formation à partir de la fleur et graines, non lues, retirées), `nil` (INPE, communiqué du 1er juillet 2008 : Amazone 6 992,06 km, Nil 6 852,15 km ; « la plupart des géographes le placent en tête », non sourcé, retiré), `cotes` (NCI, SEER Training Modules : 24 côtes) et `autruches` (Smithsonian's National Zoo : la tête baissée pour retourner les œufs ; Pline, Histoire naturelle, X, 1, lu sur Perseus : la tête dans un buisson, pas dans le sable).
Puis `alcool-chaleur` (Johnston et al., Eur. J. Appl. Physiol. 1996, résumé, PMID 8897037 : débit sanguin accru dans les doigts, aucun effet sur la baisse de la température interne en eau à 28 °C ; « le corps en perd plus vite » retiré), `tete-chaleur` (Pretorius et al., J. Appl. Physiol. 2006, résumé, PMID 16614357 : la tête, 7 % de la surface du corps, n'augmente la perte de chaleur totale que de 10 % en eau à 17 °C ; le BMJ 2008 de Vreeman et Carroll, payant, abandonné), `poisson-rouge` (Gee, Stephenson et Wright, J. Exp. Anal. Behav. 1994, résumé, PMID 16812735 : anticipation de l'heure du repas, maintenue quelques jours ; « au moins trois mois » et « formes, couleurs et sons », non lus, retirés), `diamants` (Shirey et Shigley, Gems & Gemology 2013, texte intégral sur gia.edu : diamants stables au-delà de 140 km, la plupart âgés de milliards d'années ; « 150 à 200 km » et les premières plantes terrestres, non lus, retirés), `chine-heure` (China Daily, China Services Info, 2025 : un seul fuseau, UTC+8) et `abeilles` (Ramirez-Moreno, Galizia et Nouvian, Phil. Trans. R. Soc. B 2025, texte intégral sur PMC : piquer un vertébré se termine par la mort de l'abeille ; « contre d'autres insectes, elle peut piquer sans mourir », non lu, retiré).
Puis `groenland` et `afrique` (ONU, Division de statistique, Annuaire statistique, tableau « Population, density and surface area », CSV lu : Afrique 29 648 000 km², au lieu de 30,3 millions ; Groenland 2 166 000 ; Chine 9 600 000 ; États-Unis 9 834 000 ; Inde 3 287 000 km² ; la phrase sur la projection de Mercator, sans source lue, retirée), `rome` et `paris-montreal` (NOAA, NCEI, liste des stations GHCN-Daily : Roma Ciampino 41,78° N, Central Park 40,78° N, Paris-Montsouris 48,82° N, Montréal-Trudeau 45,47° N ; les phrases sur le climat, non sourcées, retirées), `cent-ans` (BnF, notice RAMEAU : 24 mai 1337, 15 octobre 1453 ; « longues trêves », non lues, retirées) et `pingouins` (Planet-Vie, École normale supérieure : une seule espèce de pingouin, qui vole, dans l'hémisphère Nord ; 18 espèces de manchots, toutes dans l'hémisphère Sud).
Puis `desert` (Australian Antarctic Division, « Antarctic geography and geology » : continent le plus sec, autant d'humidité sur le plateau que les déserts chauds, 13 661 000 km² ; USGS, « Deserts: Geology and Resources » : désert défini par la pluie, mais Sahara donné comme le plus grand désert, les déserts polaires étant classés à part ; l'explication dit désormais que la réponse dépend de cette définition ; « 9,2 millions de km² », non lu, retiré), `vomitorium` (Macrobe, Saturnales, VI, 4, 3, lu sur LacusCurtius : passages par lesquels la foule qui entre « se déverse » sur les gradins ; « couloir de sortie » corrigé), `cleopatre` (Rosicrucian Egyptian Museum : pyramides de Gizeh commencées vers 2560 avant notre ère, Cléopâtre VII, 69-30 avant notre ère) et `trex` (Carnegie Museum of Natural History : Tyrannosaurus 66 à 68 millions d'années, Stegosaurus 145 à 150 ; « 69 » et « 155 » corrigés, écart minimal porté à 77 millions d'années).
Puis `ver` (Rajagopalan et al., In Vitro Cell. Dev. Biol. Anim. 2022, résumé, PMID 35920958 : chez Eudrilus eugeniae, seul le morceau qui garde le clitellum se régénère, les dix premiers segments coupés meurent en général en quatre jours ; Bely, Integr. Comp. Biol. 2006, résumé, PMID 21672762 : régénération de l'arrière presque universelle chez les annélides, de l'avant moins répandue ; « seules quelques espèces » corrigé), `robot` (ministère tchèque des Affaires étrangères, page de l'ambassade à Copenhague, 2021, et texte de Jaroslav Veis publié par l'ambassade à Erevan : premier emploi dans R.U.R., publiée en novembre 1920, mot soufflé par Josef Čapek ; l'étymologie robota, « travail forcé », absente des pages lues, retirée) et `bebe-os` (Hsu, Chen et Chen, Int. J. Mol. Sci. 2024, texte intégral sur PMC : environ 270 os chez le nourrisson, 206 chez l'adulte ; simple mention dans une revue sur l'ostéoporose, faute d'avoir trouvé une source d'anatomie lisible). À vérifier à la main : `colomb`, Jeffrey Burton Russell, « Inventing the Flat Earth », History Today (https://www.historytoday.com/archive/inventing-flat-earth, refus 403 ; l'exposition « 1492: An Ongoing Voyage » de la Library of Congress, lue, ne traite pas la question) ; `fuseaux`, aucune page officielle française donnant le nombre de fuseaux horaires de la France n'a été trouvée (piste : décrets fixant l'heure légale de chaque territoire, sur Légifrance).

Restent sourcées sur Wikipédia (2), à reprendre une à une sur la source primaire : `colomb`, `fuseaux`.

## Loi de Goodhart, formulation de Strathern (audit des points, 19 novembre 2026)

Non affichée : la formulation « lorsqu'une mesure devient un objectif, elle cesse d'être une bonne mesure » est
attribuée à Marilyn Strathern, « “Improving ratings”: audit in the British University system », *European Review*,
5(3), 305-321, 1997 (référence vérifiée sur Cambridge Core et RePEc). La phrase elle-même n'a pas pu être lue dans
l'article : les copies en ligne (gwern.net, archive.org) n'étaient pas accessibles depuis la session. Le guide dit
seulement « ce qu'on appelle la loi de Goodhart », sans citation ni date. À ajouter avec la page de l'article lue.

## Mode sobre (lot B, 19 novembre 2026) : sources non affichées

Références confirmées sur Crossref, mais résumé non lu (Crossref ne le fournit pas, PubMed ne les indexe pas) :
leurs résultats ne sont pas cités sur le site.
- Leroy (2009), « Why is it so hard to do my work? The challenge of attention residue… », *Organizational Behavior
  and Human Decision Processes*, 109(2), 168-181 : le résidu d'attention d'une tâche inachevée.
- Hanus et Fox (2015), *Computers & Education*, 80, 152-161 : badges et classement en cours.
- Sundararajan et Adesope (2020), « Keep it coherent: a meta-analysis of the seductive details effect »,
  *Educational Psychology Review*, 32(3), 707-734.
- Gollwitzer et Sheeran (2006), *Advances in Experimental Social Psychology*, 38, 69-119 ; Sheeran, Listrom et
  Gollwitzer (2024), « The when and how of planning… », *European Review of Social Psychology*, 36(1), 162-194
  (en ligne le 27 mars 2024) : intentions de mise en œuvre (d = 0,65, puis plus faible).
- Sailer et Homner (2020) : le tableau du lot B donnait r = 0,31 ; le guide affiche déjà g = 0,49 (apprentissage),
  valeur vérifiée auparavant. Le r n'est pas affiché.
