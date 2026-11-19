# Secrets du site : solutions

**Attention, ce fichier dévoile tout.** Les distinctions secrètes s'affichent « Distinction secrète » dans le profil
tant qu'elles ne sont pas obtenues. Chaque découverte s'inscrit dans `distinctions.drapeaux.secrets` (sauvegardée,
synchronisée) ; les conditions sont dans `DISTINCTIONS` (`static/progression.js`), les déclencheurs dans la section
« Secrets » de `static/profil.js`.

| Difficulté | Distinction | Comment l'obtenir | Où c'est codé |
|---|---|---|---|
| Facile | Les apparences | Toucher l'emblème de l'en-tête (existait déjà). | `app.js`, clic sur `.marque` |
| Facile | Chercheur de secrets | Taper « secret » dans la recherche. La réponse est un indice vers la console. | `recherche.js` |
| Facile | Noctambule | Choisir le thème sombre (bouton de thème). Jusqu'au 19 novembre 2026 : gagner des points entre minuit et 5 h, retiré (ne pas récompenser le jeu nocturne). | `appliquerTheme`, `app.js` |
| Moyen | Bilingue | Ouvrir le site en français puis en anglais (`/en/`), sur le même appareil. Annoncée à l'action suivante. | chargement, `profil.js` |
| Moyen | Sésame | Taper « doute » (« doubt » en anglais) au clavier, hors de tout champ : l'emblème se révèle. | `keydown`, `profil.js` |
| Moyen (rare) | Vendredi 13 | Gagner des points un vendredi 13. Lien : apophénie. | `gagner()`, `profil.js` |
| Moyen | Démonteur d'illusions | Vérifier huit illusions du jour différentes (existait déjà). | `illusions.js` |
| Difficile | Œil de lynx | Dans « Combien de points ? », donner le nombre exact d'un nuage d'au moins 100 points (niveau 2 et plus). | `chiffres.js`, bilan |
| Difficile | Tous les sceaux | Terminer les 16 parcours. | condition calculée |
| Très difficile | Cryptographe | Ouvrir la console du navigateur : une énigme donne des numéros de fiches. Leurs initiales forment un mot (« esprit » en français, « reason » en anglais), à taper dans la recherche. | `enigmeConsole()`, `profil.js` ; `recherche.js` |

Le mot de l'énigme est recalculé à partir des noms de fiches (`enigmeConsole()`) : si une fiche est renommée, les
numéros donnés suivent, et le mot reste écrivable.
