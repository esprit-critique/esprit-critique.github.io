#!/bin/bash
# Lance les bancs d'essai dans Chrome sans fenêtre, sur téléphone (390 × 844) et ordinateur (1 280 × 900),
# en clair puis en sombre, et rassemble les rapports dans tests/rapports/.
#
#   tests/lancer.sh                       tous les bancs, dans les quatre configurations
#   tests/lancer.sh affichage             un seul banc (affichage, ateliers, test, niveaux ou items)
#   CONFIGS="390 clair" tests/lancer.sh   une seule configuration
#
# Les bancs sont copiés dans static/ le temps du test, puis enlevés ; le serveur local est arrêté à la fin.
cd "$(dirname "$0")/.."
RACINE=$(pwd)
BANCS=${*:-"affichage ateliers test niveaux items"}
CONFIGS=${CONFIGS:-"390 clair
390 sombre
1280 clair
1280 sombre"}
COPIES="_affichage.html _ateliers.html _test.html _niveaux.html niveaux.html controle-affichage.js"
mkdir -p tests/rapports

nettoyer() {
  for f in $COPIES; do rm -f "static/$f"; done
  [ -n "$SERVEUR" ] && kill "$SERVEUR" 2>/dev/null
}
trap nettoyer EXIT

# Syntaxe des scripts des bancs : une erreur empêcherait tout le banc de tourner, sans message
for f in tests/_*.html tests/niveaux.html; do
  python3 -c "import re,sys; open('/tmp/banc-syntaxe.js','w').write('\n'.join(re.findall(r'<script>(.*?)</script>', open(sys.argv[1]).read(), re.S)))" "$f"
  verdict=$(osascript -l JavaScript -e "ObjC.import('Foundation'); var t = \$.NSString.stringWithContentsOfFileEncodingError('/tmp/banc-syntaxe.js', \$.NSUTF8StringEncoding, null).js; try { new Function(t); 'ok' } catch (e) { e + ' (ligne ' + e.line + ')' }")
  [ "$verdict" != ok ] && { echo "!! $f : $verdict"; ERREUR_SYNTAXE=1; }
done
[ -n "$ERREUR_SYNTAXE" ] && { echo "Bancs non lancés : corriger d'abord la syntaxe."; exit 1; }

for f in $COPIES; do cp "tests/$f" static/; done
if ! curl -s -o /dev/null http://localhost:8000/; then
  python3 app.py > /dev/null 2>&1 &
  SERVEUR=$!
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null http://localhost:8000/ && break; sleep 0.5; done
fi

echo "$CONFIGS" | while read -r largeur theme; do
  [ -z "$largeur" ] && continue
  hauteur=$([ "$largeur" = 390 ] && echo 844 || echo 900)
  for banc in $BANCS; do
    rapport="tests/rapports/$banc-$largeur-$theme.txt"
    page="_$banc.html"; [ "$banc" = items ] && page="niveaux.html"   # items : décompte des items par niveau
    python3 tests/chrome.py "http://localhost:8000/$page?l=$largeur&h=$hauteur" "$largeur,$hauteur" "$theme" "$rapport"
    echo "== $banc, $largeur px, $theme : $(grep -m1 '^RÉSUMÉ' "$rapport" || head -1 "$rapport")"
  done
done
echo "Rapports complets : $RACINE/tests/rapports/"
