#!/bin/bash
# Régénère static/apercu.png (image de partage, 1 200 × 630) à partir de tests/pages/apercu.html :
# capture par Chrome sans fenêtre, puis réduction à 256 couleurs (tests/pages/optimiser_png.py --palette).
cd "$(dirname "$0")/../.."
SORTIE=$(mktemp -d)/apercu.png
PROFIL=$(mktemp -d)
"$(python3 tests/navigateur.py)" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$PROFIL" \
  --window-size=1200,630 --virtual-time-budget=3000 --screenshot="$SORTIE" "file://$(pwd)/tests/pages/apercu.html" > /dev/null 2>&1 &
PID_CHROME=$!
for _ in $(seq 1 40); do [ -s "$SORTIE" ] && break; sleep 0.5; done
sleep 0.5; kill -9 "$PID_CHROME" 2>/dev/null
python3 tests/pages/optimiser_png.py "$SORTIE" static/apercu.png --palette
