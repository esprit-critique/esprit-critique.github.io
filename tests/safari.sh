#!/bin/bash
# Lance les bancs d'essai dans Safari (et non plus dans Chrome) : chaque banc s'ouvre dans un onglet, écrit son
# rapport dans la page, et le script le lit par AppleScript (macOS demande une fois d'autoriser le pilotage de Safari).
# Safari passe au premier plan pendant les bancs : ne pas s'en servir en même temps.
#
#   tests/safari.sh              bancs test, ateliers, niveaux et affichage, à 390 px
#   tests/safari.sh test         un seul banc
#   LARGEUR=1280 tests/safari.sh
cd "$(dirname "$0")/.."
BANCS=${*:-"test ateliers niveaux affichage"}
LARGEUR=${LARGEUR:-390}
HAUTEUR=$([ "$LARGEUR" = 390 ] && echo 844 || echo 900)
COPIES="_affichage.html _ateliers.html _test.html _niveaux.html niveaux.html controle-affichage.js"
mkdir -p tests/rapports

nettoyer() {
  for f in $COPIES _site.html; do rm -f "static/$f"; done
  [ -n "$SERVEUR" ] && kill "$SERVEUR" 2>/dev/null
}
trap nettoyer EXIT

for f in $COPIES; do cp "tests/$f" static/; done
grep -v 'http-equiv="Content-Security-Policy"' static/index.html > static/_site.html
if ! curl -s -o /dev/null http://localhost:8000/; then
  python3 app.py > /dev/null 2>&1 &
  SERVEUR=$!
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null http://localhost:8000/ && break; sleep 0.5; done
fi

for banc in $BANCS; do
  rapport="tests/rapports/safari-$banc-$LARGEUR.txt"
  url="http://localhost:8000/_$banc.html?l=$LARGEUR&h=$HAUTEUR&safari=$RANDOM"
  # Safari au premier plan : dans une fenêtre cachée, il gèle requestAnimationFrame et espace les minuteurs
  osascript -e "tell application \"Safari\" to make new document with properties {URL:\"$url\"}" -e 'tell application "Safari" to activate' > /dev/null
  texte=""
  for _ in $(seq 1 360); do   # jusqu'à 30 minutes (les bancs tournent en temps réel dans Safari)
    sleep 5
    texte=$(osascript -e 'tell application "Safari" to get text of document 1' 2>/dev/null)
    echo "$texte" | grep -q "^RÉSUMÉ" && break
  done
  echo "$texte" | sed -n '/^RÉSUMÉ/,$p' > "$rapport"
  osascript -e 'tell application "Safari" to close document 1' > /dev/null 2>&1
  echo "== Safari, $banc, $LARGEUR px : $(grep -m1 '^RÉSUMÉ' "$rapport" || echo 'pas de rapport')"
done
echo "Rapports : tests/rapports/safari-*.txt"
