#!/bin/bash
# Captures des écrans de référence de l'identité visuelle, dans tests/rapports/identite/<étape>/
#   tests/pages/planche.sh avant        (puis « apres-1 », « apres-2 »…)
cd "$(dirname "$0")/../.."
ETAPE=${1:?étape attendue, par exemple avant}
ECRANS="accueil aller:biais aller:biais/ancrage aller:sophismes/ad-hominem quiz-faux vf-bilan aller:guide"
mkdir -p "tests/rapports/identite/$ETAPE"
for taille in 390,844 1280,900; do
  for theme in clair sombre; do
    python3 tests/capturer.py "$taille" "$theme" $ECRANS | grep -v "^ok" 
    for e in $ECRANS; do
      nom=$(echo "$e" | sed 's/aller://; s|/|-|g')
      cp "tests/rapports/captures/$nom-$theme-${taille%,*}.png" "tests/rapports/identite/$ETAPE/" 2>/dev/null
    done
  done
done
ls "tests/rapports/identite/$ETAPE" | wc -l
