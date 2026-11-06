#!/usr/bin/env python3
"""Noms globaux en double entre les scripts du site. Les scripts sont classiques et partagent un seul espace de
noms : une constante déclarée deux fois bloque tout le site, et une fonction déclarée deux fois remplace l'autre
sans message. Affiche les doublons et sort en erreur s'il y en a.
python3 tests/noms_globaux.py"""
import glob, os, re, sys
ICI = os.path.dirname(os.path.abspath(__file__))
DECLARATION = re.compile(r"^(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", re.M)
vus = {}
# static/en/ : les scripts de la version anglaise partagent le même espace de noms que ceux de static/
for chemin in sorted(glob.glob(os.path.join(ICI, "..", "static", "*.js")) + glob.glob(os.path.join(ICI, "..", "static", "en", "*.js"))):
    nom = os.path.relpath(chemin, os.path.join(ICI, "..", "static"))
    if os.path.basename(nom).startswith("_") or nom == "sw.js":   # copies de banc ; le service worker a son propre espace
        continue
    for m in DECLARATION.finditer(open(chemin, encoding="utf-8").read()):
        vus.setdefault(m.group(1), []).append(nom)
doublons = {k: v for k, v in vus.items() if len(v) > 1}
for k, v in sorted(doublons.items()):
    print("!! nom global en double : " + k + " (" + ", ".join(v) + ")")
sys.exit(1 if doublons else 0)
