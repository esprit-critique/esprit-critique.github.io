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
Banque mondiale) ; `groenland` et `afrique` attendent une source primaire pour la superficie de l'Afrique. Puis `banane` (EPA, RadTown).
Sources trouvées mais illisibles automatiquement (à vérifier à la main) : `rhin` (CIPR : Rhin, 1 233 km ; ICPDR : Danube,
2 857 km), `koala` (ministère australien de l'Environnement, DCCEEW), `dinosaures-humains` (Smithsonian : Homo sapiens
vers 300 000 ans, lu ; extinction des dinosaures non aviens vers 66 millions d'années, page inaccessible).

Restent sourcées sur Wikipédia (39), à reprendre une à une sur la source primaire : `chauves-souris`, `poisson-rouge`, `vikings`, `autruches`, `tete-chaleur`, `desert`, `colomb`, `sahara-vert`, `groenland`, `diamants`, `alcool-chaleur`, `vomitorium`, `cotes`, `ver`, `rhin`, `rome`, `pingouins`, `cent-ans`, `dinosaures-humains`, `cleopatre`, `trex`, `pieuvre`, `abeilles`, `robot`, `ours`, `loire`, `paris-montreal`, `fuseaux`, `chine-heure`, `bebe-os`, `galilee`, `pise`, `afrique`, `nil`, `baleines`, `tomate`, `araignees`, `coeur`, `koala`.
