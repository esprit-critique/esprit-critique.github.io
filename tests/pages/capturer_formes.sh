#!/bin/bash
# Capture des 39 schémas d'argument (scénario « formes » de tests/_visu.html), dans tests/rapports/formes-<thème>.png
cd "$(dirname "$0")/../.."
for theme in clair sombre; do
  python3 tests/capturer.py 640,7400 "$theme" formes | grep -v "^ok"
  cp "tests/rapports/captures/formes-$theme-640.png" "tests/rapports/formes-$theme.png" && echo "tests/rapports/formes-$theme.png"
done
