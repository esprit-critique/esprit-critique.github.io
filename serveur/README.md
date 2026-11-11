# Serveur de synchronisation d'Esprit critique

Un Cloudflare Worker (`worker.js`) et une base D1. Il garde des **coffres chiffrés** qu'il ne sait pas lire : pour
chaque coffre, l'identifiant (dérivé du code sur l'appareil), l'empreinte SHA-256 du jeton d'accès, le contenu chiffré
(AES-256-GCM, 256 Ko au plus), un numéro de version et deux dates. Ni adresse IP, ni pseudonyme. Aucune dépendance npm
à l'exécution. Ce dossier n'est pas publié avec le site (seul `static/` l'est). Modèle de menace : `../SECURITE.md`.

## Essais, sans Cloudflare

```
node serveur/essai.mjs                 # le Worker sur une base simulée en mémoire : jetons, tailles, conflits, origines, purge
CONFIGS="390 clair" tests/lancer.sh synchro   # en plus : deux navigateurs, création, connexion, fusion, contenu altéré
```

`serveur-local.mjs` sert le Worker en local (port 8787) pour le banc « synchro » ; `d1-memoire.mjs` simule les seules
requêtes de `worker.js`.

## Mise en service (propriétaire du site)

Commandes vérifiées dans la documentation de Cloudflare le 11 novembre 2026 (Wrangler, D1, limitation de débit). Elles
demandent un compte Cloudflare (offre gratuite : 100 000 requêtes par jour et 10 ms de calcul par requête ; le Worker
n'emploie aucun hachage lent, inutile avec un secret de 80 bits).

1. Se connecter : `npx wrangler login`
2. Créer la base, **dans la juridiction européenne** (ce choix ne peut plus être changé ensuite) :
   `npx wrangler d1 create esprit-critique-synchro --jurisdiction=eu`
   Reporter l'identifiant affiché (`database_id`) dans `serveur/wrangler.toml`.
3. Créer la table : `npx wrangler d1 execute esprit-critique-synchro --remote --file=serveur/schema.sql`
4. Déployer, depuis le dossier `serveur/` : `npx wrangler deploy`
   L'adresse obtenue ressemble à `https://esprit-critique-synchro.<compte>.workers.dev`.
5. Dans le site :
   - `static/coffre.js` : `const SYNCHRO_URL = "https://esprit-critique-synchro.<compte>.workers.dev";`
   - `static/index.html` et `static/en/index.html` : ajouter cette origine à `connect-src` dans la CSP, puis
     `python3 tests/pages/generer_pages.py` (les pages fixes reprennent la CSP) ;
   - textes de confidentialité : voir « Textes à mettre à jour » dans `tests/refonte-journal.md` (lot 6) ;
   - `python3 tests/securite.py` vérifie que `SYNCHRO_URL` et `connect-src` concordent.

## Garde-fous

Identifiant conforme à `^[0-9a-f]{32}$` ; jeton comparé en temps constant à son empreinte ; contenu limité à 256 Ko ;
CORS limité aux origines de `ORIGINES` (`wrangler.toml`) ; créations limitées par la limitation de débit des Workers
(approximative et locale à chaque centre de données) ; plafond du nombre total de coffres (`MAX_COFFRES`) ; purge
quotidienne des coffres inactifs depuis 24 mois ; réponses en `Cache-Control: no-store` et
`X-Content-Type-Options: nosniff` ; aucune donnée de requête journalisée.
