#!/bin/bash
# Régénère static/apercu.png et static/apercu-en.png (images de partage, 1 200 × 630) à partir de
# tests/pages/apercu.html et apercu-en.html : capture par Chrome sans fenêtre, puis réduction à 256 couleurs
# (tests/pages/optimiser_png.py --palette).
cd "$(dirname "$0")/../.."
CHROME_CHEMIN=$(python3 tests/navigateur.py)
for paire in "apercu.html apercu.png" "apercu-en.html apercu-en.png"; do
  set -- $paire
  SORTIE=$(mktemp -d)/apercu.png
  PROFIL=$(mktemp -d)
  "$CHROME_CHEMIN" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$PROFIL" \
    --window-size=1200,630 --virtual-time-budget=3000 --screenshot="$SORTIE" "file://$(pwd)/tests/pages/$1" > /dev/null 2>&1 &
  PID_CHROME=$!
  for _ in $(seq 1 40); do [ -s "$SORTIE" ] && break; sleep 0.5; done
  sleep 0.5; kill -9 "$PID_CHROME" 2>/dev/null
  python3 tests/pages/optimiser_png.py "$SORTIE" "static/$2" --palette
done
