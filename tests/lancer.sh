#!/bin/bash
# Lance les bancs d'essai dans Chrome sans fenêtre, sur téléphone (390 × 844) et ordinateur (1 280 × 900),
# en clair puis en sombre, et rassemble les rapports dans tests/rapports/.
#
#   tests/lancer.sh                       tous les bancs, dans les quatre configurations
#   tests/lancer.sh affichage             un seul banc (affichage, ateliers, test, niveaux, items, csp, grand, hors-ligne, calculs ou familles)
#   CONFIGS="390 clair" tests/lancer.sh   une seule configuration
#
# Les bancs sont copiés dans static/ le temps du test, puis enlevés ; le serveur local est arrêté à la fin.
cd "$(dirname "$0")/.."
RACINE=$(pwd)
BANCS=${*:-"affichage ateliers test niveaux items csp grand hors-ligne calculs"}
CONFIGS=${CONFIGS:-"390 clair
390 sombre
1280 clair
1280 sombre"}
COPIES="_affichage.html _ateliers.html _test.html _niveaux.html niveaux.html controle-affichage.js _grand-test.html"
# Les bancs chargent _site.html : la page du site sans sa politique de sécurité (CSP), qui interdit eval,
# dont les bancs se servent pour lire l'état du site. La vraie page est contrôlée par le banc « csp ».
mkdir -p tests/rapports

nettoyer() {
  for f in $COPIES _site.html _site-grand.html _grand-test-essai.js; do rm -f "static/$f"; done
  [ -n "$SERVEUR" ] && kill "$SERVEUR" 2>/dev/null
}
trap nettoyer EXIT

# Syntaxe des scripts des bancs : une erreur empêcherait tout le banc de tourner, sans message
for f in tests/_*.html tests/niveaux.html; do
  python3 -c "import re,sys; open('/tmp/banc-syntaxe.js','w').write('\n'.join(re.findall(r'<script>(.*?)</script>', open(sys.argv[1]).read(), re.S)))" "$f"
  verdict=$(osascript -l JavaScript -e "ObjC.import('Foundation'); var t = \$.NSString.stringWithContentsOfFileEncodingError('/tmp/banc-syntaxe.js', \$.NSUTF8StringEncoding, null).js; try { new Function(t); 'ok' } catch (e) { e + ' (ligne ' + e.line + ')' }")
  [ "$verdict" != ok ] && { echo "!! $f : $verdict"; ERREUR_SYNTAXE=1; }
done
# Syntaxe des scripts du site : une erreur (variable déclarée deux fois…) bloquerait tout le site
for f in static/*.js; do
  verdict=$(osascript -l JavaScript -e "ObjC.import('Foundation'); var t = \$.NSString.stringWithContentsOfFileEncodingError('$f', \$.NSUTF8StringEncoding, null).js; try { new Function(t); 'ok' } catch (e) { e + ' (ligne ' + e.line + ')' }")
  [ "$verdict" != ok ] && { echo "!! $f : $verdict"; ERREUR_SYNTAXE=1; }
done
# Noms globaux en double entre les scripts du site (une fonction redéclarée en remplacerait une autre sans message)
python3 tests/noms_globaux.py || ERREUR_SYNTAXE=1
[ -n "$ERREUR_SYNTAXE" ] && { echo "Bancs non lancés : corriger d'abord la syntaxe."; exit 1; }

for f in $COPIES; do cp "tests/$f" static/; done
grep -v 'http-equiv="Content-Security-Policy"' static/index.html > static/_site.html
# Copie d'essai du Grand test : mêmes fichiers, mais drapeaux GRAND_TEST_VISIBLE et GRAND_TEST_ESSAI à true. La
# version publiée garde ses drapeaux à false (vérifié par le banc « grand ») ; rien n'est modifié dans static/.
sed -e 's/^const GRAND_TEST_VISIBLE = false;$/const GRAND_TEST_VISIBLE = true;/' -e 's/^const GRAND_TEST_ESSAI = false;$/const GRAND_TEST_ESSAI = true;/' \
  static/grand-test.js > static/_grand-test-essai.js
sed 's/src="grand-test.js"/src="_grand-test-essai.js"/' static/_site.html > static/_site-grand.html
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
    [ "$banc" = grand ] && page="_grand-test.html"
    if [ "$banc" = calculs ] || [ "$banc" = familles ]; then
      python3 "tests/grand_test_$banc.py" "$rapport" > /dev/null   # hors navigateur (moteur JavaScript de macOS)
    elif [ "$banc" = hors-ligne ]; then
      python3 tests/hors_ligne.py "$largeur,$hauteur" "$theme" "$rapport"   # service worker, serveur coupé en cours de banc
    elif [ "$banc" = csp ]; then
      python3 tests/csp.py "$largeur,$hauteur" "$theme" "$rapport"   # la vraie page, hors cadre, avec sa CSP
    else
      python3 tests/chrome.py "http://localhost:8000/$page?l=$largeur&h=$hauteur" "$largeur,$hauteur" "$theme" "$rapport"
    fi
    echo "== $banc, $largeur px, $theme : $(grep -m1 '^RÉSUMÉ' "$rapport" || head -1 "$rapport")"
  done
done
echo "Rapports complets : $RACINE/tests/rapports/"
