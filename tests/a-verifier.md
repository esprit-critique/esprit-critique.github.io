# Faits à vérifier

Aucun fait non vérifié n'est affiché sur le site à ce jour.

- Rosenthal, « Monty Hall, Monty Fall, Monty Crawl », Math Horizons, 2008 : référence vérifiée (Crossref). Le site
  n'en cite que l'existence ; la conclusion (changer gagne une fois sur deux avec un présentateur distrait) est
  vérifiée par la simulation affichée.
- Wason et Brooks, « THOG: The anatomy of a problem », Psychological Research, 1979 : référence vérifiée (Crossref).
  Le site n'en cite aucun chiffre ; la solution du problème se vérifie par le raisonnement donné.
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
