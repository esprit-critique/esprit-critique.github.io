# Faits à vérifier

Aucun fait non vérifié n'est affiché sur le site à ce jour.

- Rosenthal, « Monty Hall, Monty Fall, Monty Crawl », Math Horizons, 2008 : référence vérifiée (Crossref). Le site
  n'en cite que l'existence ; la conclusion (changer gagne une fois sur deux avec un présentateur distrait) est
  vérifiée par la simulation affichée.
- Wason et Brooks, « THOG: The anatomy of a problem », Psychological Research, 1979 : référence vérifiée (Crossref).
  Le site n'en cite aucun chiffre ; la solution du problème se vérifie par le raisonnement donné.
- Population de Paris (« Ordres de grandeur ») : le site affichait 2 047 602 habitants « au 1er janvier 2023 », chiffre
  qui ne correspond à aucune série de l'Insee (population légale de référence 2020 : 2 145 906 ; référence 2023 :
  2 103 778 d'après l'Insee Flash Île-de-France de décembre 2025, cité par une recherche, insee.fr inaccessible depuis
  la session du 13 novembre 2026). Affiché désormais : « environ 2,1 millions », vrai pour les deux séries. Le chiffre
  exact reste à confirmer sur insee.fr avant d'être affiché.
- Écartés faute de source vérifiable (non affichés) : « Impossible n'est pas français » (Napoléon), une phrase de
  Spinoza, les taux de réussite de Lecoutre (1992) et de Tversky et Kahneman (1971, 1972) pour les problèmes ajoutés.
- Mentions légales, téléphone de l'hébergeur : +1 415 857 5430. Aucune page officielle de GitHub ne donne de numéro ;
  celui-ci vient du registre ARIN (contact « GitHub », type bureau), où GitHub déclare lui-même ses coordonnées. Un
  répertoire tiers (datarequests.org) donne +1 877 448 4820, non retenu. L'adresse (88 Colin P. Kelly Jr. Street,
  San Francisco, CA 94107) vient de la déclaration de confidentialité de GitHub.

## Illusion de Ponzo (refonte, lot 2, 11 novembre 2026)

Non retenue pour l'illusion du jour : l'article de Mario Ponzo de 1911 souvent cité porte sur une illusion tactile
(illusion d'Aristote), et l'origine de l'illusion visuelle qui porte son nom reste incertaine (Ponzo l'aurait employée
en 1912 pour expliquer l'illusion de la Lune). Piste : Bertamini et Wade (2023), traduction commentée, *Perception*.
À ajouter seulement avec une source primaire vérifiée.

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

- **« Impossible n'est pas français », Napoléon** (citation, statut « déformée » envisagé) : on la rattache souvent à une
  lettre au général Lemarois de 1813 (« cela n'est pas français ») ; lettre non retrouvée dans la Correspondance
  générale (napoleon.org). À vérifier sur le texte de la lettre avant de l'ajouter à `CITATIONS`.
- **« Les requins existaient avant les arbres »** (vrai ou faux) : vrai selon les sources de vulgarisation (requins
  vers 450 millions d'années, premiers arbres vers 385 à 390 millions), mais l'écart dépend de ce qu'on appelle un
  requin et la page du Smithsonian n'a pas pu être lue. À vérifier sur une source de paléontologie.

## Questions des jeux (relecture du rédacteur, lot 2, 17 novembre 2026)

- **`especes` (MONDE)** : l'explication disait que les populations sauvages de tigres avaient augmenté depuis les années
  1990. Wikipedia (en), « Tiger », d'après l'évaluation de l'UICN de 2022, dit l'inverse : de 5 000 à 8 262 tigres à
  la fin des années 1990 à 3 726 à 5 578 en 2022. Phrase retirée ; l'explication ne dit plus que les statuts. À
  vérifier sur la fiche UICN (iucnredlist.org refuse les requêtes automatiques) : statuts du tigre, du panda et du
  rhinocéros noir en 1996 et aujourd'hui (le rhinocéros noir semble « en danger critique » dès 1996, d'où la question
  reformulée « parmi les espèces menacées »), et hausse des populations de rhinocéros noirs depuis les années 1990
  (affirmation conservée, source WWF non précisée).
- **`scolarite` (MONDE)** : « environ 9 ans » de scolarité pour les femmes de 30 ans n'a pas d'année. Retrouver
  l'année des données IHME reprises par Gapminder et l'ajouter.
- **`densite-monde` (MONDE)** : « déserts et glaces compris » ramené à « déserts compris ». 62 habitants par km² pour
  8,1 milliards d'habitants suppose environ 130 millions de km² de terres, ce qui exclut probablement l'Antarctique
  (149 millions de km² de terres émergées en tout, d'après `pacifique-terres`). Vérifier la définition de
  l'indicateur EN.POP.DNST / AG.LND.TOTL.K2 de la Banque mondiale avant de préciser.
- **`napoleon` (VRAI_FAUX)** : « 5 pieds 2 pouces » français font 167,8 cm (5 × 32,48 + 2 × 2,707), 168,6 cm avec les
  4 lignes souvent citées ; le site arrondit à « environ 1,70 m ». Vérifier la mesure sur le rapport d'autopsie
  (Antommarchi) avant d'afficher un chiffre plus précis.
- **Sources absentes** (chiffres affichés sans source nommée) : GRANDEURS `oiseaux` (« plus de 11 000 espèces »),
  `insectes`, `atmosphere`, `andromede`, `monaco-surface`, `pop-1800` (« estimations historiques ») ; ETALONNAGE
  `mont-blanc-1786`, `eiffel`, `elephant`, `hyperion` (116,22 m en 2026 d'après Wikipedia (en), « Hyperion (tree) »,
  vérifié le 17 novembre 2026), `mont-blanc`, `or`. Ajouter la source vérifiée de chacun.
