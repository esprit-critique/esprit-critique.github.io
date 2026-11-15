# Audit de sécurité du 16 novembre 2026 (skill security-audit de Cloudflare, profil quick)

Passage partiel, en lecture du code seule (aucune exécution : pas de bac à sable conforme sur la machine). Rapports
complets hors du dépôt : `~/security-audit-skill/biais-app/run-1/` (REPORT.md, NEEDS-VALIDATION.md, findings.json,
coverage-ledger.json).

| Piste | Verdict indépendant | Suite |
|---|---|---|
| « Effacer ma progression » annulé par la synchronisation (`static/coffre.js` fusion d'une clé absente) | à valider | **Corrigé** : l'effacement déconnecte l'appareil et propose de supprimer la copie en ligne ; un import remplace le coffre. Reproduit puis vérifié par le banc `synchro`. |
| Quota de création des coffres partagé par tous (`serveur/worker.js`, clé de limitation constante, plafond global) | à valider | À vérifier dans le tableau de bord Cloudflare (liaison déployée, règles par IP, taille de D1). |
| `workflow_dispatch` de `publier.yml` sur une autre branche que `main` | rejeté | Hygiène : l'environnement `github-pages` ne doit autoriser que `main`. |

Différé au prochain passage : cycle de vie de la synchronisation entre appareils (suppression en ligne recréée par un
autre appareil, connexion avec le code d'autrui) ; échappement des retours chariot dans l'export d'agenda `.ics`.
