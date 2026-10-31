#!/bin/bash
# Captures pleine page des quatre fiches de référence (mission « fiches »), dans tests/rapports/fiches/<étape>/
#   tests/pages/fiches.sh avant        (puis « etape-1 », « etape-2 »…)
cd "$(dirname "$0")/../.."
ETAPE=${1:?étape attendue, par exemple avant}
FICHES="aller:biais/ancrage aller:biais/halo aller:sophismes/ad-hominem aller:sophismes/faux-dilemme"
mkdir -p "tests/rapports/fiches/$ETAPE"
for taille in 390,7000 1280,4600; do
  for theme in clair sombre; do
    python3 tests/capturer.py "$taille" "$theme" $FICHES | grep -v "^ok"
    for e in $FICHES; do
      nom=$(echo "$e" | sed 's/aller://; s|/|-|g')
      cp "tests/rapports/captures/$nom-$theme-${taille%,*}.png" "tests/rapports/fiches/$ETAPE/" 2>/dev/null
    done
  done
done
ls "tests/rapports/fiches/$ETAPE" | wc -l
