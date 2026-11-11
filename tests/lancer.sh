#!/bin/bash
# Lance les bancs d'essai dans Chrome sans fenêtre, sur téléphone (390 × 844) et ordinateur (1 280 × 900),
# en clair puis en sombre, et rassemble les rapports dans tests/rapports/.
#
#   tests/lancer.sh                       tous les bancs, dans les quatre configurations
#   tests/lancer.sh affichage             un seul banc (affichage, ateliers, test, niveaux, items, csp, grand, hors-ligne, calculs,
#                                         familles, banques, recherche ou aleatoire)
#   CONFIGS="390 clair" tests/lancer.sh   une seule configuration
#
# Les bancs sont copiés dans static/ le temps du test, puis enlevés ; le serveur local est arrêté à la fin.
# Sous macOS comme sous Linux : Chrome (variable CHROME, sinon cherché : tests/navigateur.py), Python 3 et Node.js.
# Code de sortie 1 si un banc échoue (tests/verdict.py), pour l'intégration continue.
cd "$(dirname "$0")/.."
RACINE=$(pwd)
BANCS=${*:-"affichage ateliers test niveaux items csp grand hors-ligne calculs familles banques recherche aleatoire progression synchro"}
export CHROME=${CHROME:-$(python3 tests/navigateur.py)}
CONFIGS=${CONFIGS:-"390 clair
390 sombre
1280 clair
1280 sombre"}
COPIES="_progression.html _aleatoire.html _affichage.html _ateliers.html _test.html _niveaux.html niveaux.html controle-affichage.js _grand-test.html"
# Les bancs chargent _site.html : la page du site sans sa politique de sécurité (CSP), qui interdit eval,
# dont les bancs se servent pour lire l'état du site. La vraie page est contrôlée par le banc « csp ».
mkdir -p tests/rapports

nettoyer() {
  for f in $COPIES _site.html _site-grand.html _grand-test-essai.js _site-synchro.html _coffre-essai.js; do rm -f "static/$f"; done
  [ -n "$SERVEUR_SYNCHRO" ] && kill "$SERVEUR_SYNCHRO" 2>/dev/null
  [ -n "$SERVEUR" ] && kill "$SERVEUR" 2>/dev/null
}
trap nettoyer EXIT

# Syntaxe des scripts des bancs : une erreur empêcherait tout le banc de tourner, sans message
SYNTAXE=$(mktemp -d)
for f in tests/_*.html tests/niveaux.html; do
  python3 -c "import re,sys; open(sys.argv[2],'w').write('\n'.join(re.findall(r'<script>(.*?)</script>', open(sys.argv[1]).read(), re.S)))" "$f" "$SYNTAXE/banc.js"
  node --check "$SYNTAXE/banc.js" 2>/dev/null || { echo "!! $f :"; node --check "$SYNTAXE/banc.js" 2>&1 | head -5; ERREUR_SYNTAXE=1; }
done
rm -rf "$SYNTAXE"
# Syntaxe des scripts du site : une erreur (variable déclarée deux fois…) bloquerait tout le site
for f in static/*.js static/en/*.js; do
  node --check "$f" 2>/dev/null || { echo "!! $f :"; node --check "$f" 2>&1 | head -5; ERREUR_SYNTAXE=1; }
done
# Noms globaux en double entre les scripts du site (une fonction redéclarée en remplacerait une autre sans message)
python3 tests/noms_globaux.py || ERREUR_SYNTAXE=1
# Contrôle statique de sécurité (insertion de HTML, CSP, liste du service worker…)
python3 tests/securite.py || ERREUR_SYNTAXE=1
[ -n "$ERREUR_SYNTAXE" ] && { echo "Bancs non lancés : corriger d'abord la syntaxe."; exit 1; }

for f in $COPIES; do cp "tests/$f" static/; done
grep -v 'http-equiv="Content-Security-Policy"' static/index.html > static/_site.html
# Copie d'essai du Grand test : mêmes fichiers, mais drapeaux GRAND_TEST_VISIBLE et GRAND_TEST_ESSAI à true. La
# version publiée garde ses drapeaux à false (vérifié par le banc « grand ») ; rien n'est modifié dans static/.
sed -e 's/^const GRAND_TEST_VISIBLE = false;$/const GRAND_TEST_VISIBLE = true;/' -e 's/^const GRAND_TEST_ESSAI = false;$/const GRAND_TEST_ESSAI = true;/' \
  static/grand-test.js > static/_grand-test-essai.js
sed 's/src="grand-test.js"/src="_grand-test-essai.js"/' static/_site.html > static/_site-grand.html
# Copie d'essai de la synchronisation : coffre pointé sur le serveur local (serveur/serveur-local.mjs) ; rien n'est modifié dans static/
sed 's|^const SYNCHRO_URL = "[^"]*";|const SYNCHRO_URL = "http://localhost:8787";|' static/coffre.js > static/_coffre-essai.js
sed 's/src="coffre.js"/src="_coffre-essai.js"/' static/_site.html > static/_site-synchro.html
if ! curl -s -o /dev/null http://localhost:8000/; then
  python3 app.py > /dev/null 2>&1 &
  SERVEUR=$!
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null http://localhost:8000/ && break; sleep 0.5; done
fi

while read -r largeur theme; do
  [ -z "$largeur" ] && continue
  PREMIERE=${PREMIERE:-$largeur-$theme}
  hauteur=$([ "$largeur" = 390 ] && echo 844 || echo 900)
  for banc in $BANCS; do
    rapport="tests/rapports/$banc-$largeur-$theme.txt"
    page="_$banc.html"; [ "$banc" = items ] && page="niveaux.html"   # items : décompte des items par niveau
    [ "$banc" = grand ] && page="_grand-test.html"
    case $banc in recherche|calculs|familles|banques|aleatoire|progression|synchro)
      # Bancs indépendants de la taille et du thème : une seule fois, dans la première configuration
      [ "$PREMIERE" = "$largeur-$theme" ] || continue
      rapport="tests/rapports/$banc.txt" ;;
    esac
    if [ "$banc" = synchro ]; then   # Playwright, deux navigateurs et le Worker servi en local sur une base en mémoire
      node serveur/essai.mjs > "$rapport.serveur" 2>&1 && r1="0 échec" || r1="ÉCHEC"
      node serveur/serveur-local.mjs 8787 > /dev/null 2>&1 &
      SERVEUR_SYNCHRO=$!
      for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null http://localhost:8787/ && break; sleep 0.3; done
      if node tests/synchro.js > "$rapport.tmp" 2>&1; then r2="0 échec"; else r2="ÉCHEC"; fi
      kill "$SERVEUR_SYNCHRO" 2>/dev/null; SERVEUR_SYNCHRO=
      { echo "RÉSUMÉ : serveur $r1 ; navigateurs $r2 ; $(grep -c '^OK' "$rapport.serveur" "$rapport.tmp" | awk -F: '{s+=$2} END {print s}') contrôle(s) réussi(s)"; cat "$rapport.serveur" "$rapport.tmp"; } > "$rapport"; rm -f "$rapport.tmp" "$rapport.serveur"
    elif [ "$banc" = recherche ]; then   # Playwright (npm ci), avec ses propres tailles d'écran
      if node tests/recherche-melange.js > "$rapport.tmp" 2>&1; then r="0 échec"; else r="ÉCHEC"; fi
      { echo "RÉSUMÉ : $(grep -c '^OK' "$rapport.tmp") contrôle(s) réussi(s) ; $r"; cat "$rapport.tmp"; } > "$rapport"; rm -f "$rapport.tmp"
    elif [ "$banc" = calculs ] || [ "$banc" = familles ] || [ "$banc" = banques ]; then
      python3 "tests/grand_test_$banc.py" "$rapport" > /dev/null   # hors navigateur (Node.js)
    elif [ "$banc" = hors-ligne ]; then
      python3 tests/hors_ligne.py "$largeur,$hauteur" "$theme" "$rapport"   # service worker, serveur coupé en cours de banc
    elif [ "$banc" = csp ]; then
      python3 tests/csp.py "$largeur,$hauteur" "$theme" "$rapport"   # la vraie page, hors cadre, avec sa CSP
    else
      python3 tests/chrome.py "http://localhost:8000/$page?l=$largeur&h=$hauteur" "$largeur,$hauteur" "$theme" "$rapport"
    fi
    echo "== $banc, $largeur px, $theme : $(grep -m1 '^RÉSUMÉ' "$rapport" || head -1 "$rapport")"
    python3 tests/verdict.py "$rapport" || ECHECS="$ECHECS $banc-$largeur-$theme"
  done
done <<< "$CONFIGS"
echo "Rapports complets : $RACINE/tests/rapports/"
[ -z "$ECHECS" ] || { echo "Bancs en échec :$ECHECS"; exit 1; }
