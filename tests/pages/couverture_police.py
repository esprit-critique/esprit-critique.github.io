#!/usr/bin/env python3
"""Vérifie que le sous-ensemble « latin » de Newsreader couvre les caractères des textes du site.
Parcourt les chaînes des scripts (fiches, ateliers, guide…) et le texte des pages HTML, et liste les caractères
hors de la plage unicode-range du sous-ensemble. Un caractère absent n'est pas perdu : le navigateur le prend
dans la police suivante de --titre (Iowan, Palatino, Georgia), mais son dessin diffère.
python3 tests/pages/couverture_police.py"""
import glob, html, os, re
from collections import Counter

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")
# Plage du fichier newsreader-latin-*.woff2 (paquet @fontsource-variable/newsreader 5.3.0)
PLAGE = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"

def dans_plage(c):
    n = ord(c)
    for morceau in PLAGE.split(","):
        a, _, b = morceau[2:].partition("-")
        if int(a, 16) <= n <= int(b or a, 16): return True
    return False

textes = []
for f in glob.glob(os.path.join(STATIC, "*.js")):
    if f.endswith("sw.js"): continue
    t = open(f, encoding="utf-8").read()
    t = re.sub(r"^\s*//.*$", "", t, flags=re.M)   # commentaires
    textes += [(os.path.basename(f), s) for s in re.findall(r'"((?:[^"\\\n]|\\.)*)"', t)]
for f in glob.glob(os.path.join(STATIC, "*.html")):
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", open(f, encoding="utf-8").read(), flags=re.S)
    textes.append((os.path.basename(f), html.unescape(re.sub(r"<[^>]+>", " ", t))))

manquants, exemples = Counter(), {}
for source, s in textes:
    for c in s:
        if not dans_plage(c):
            manquants[c] += 1
            exemples.setdefault(c, (source, s.strip()[:70]))
if not manquants:
    print("Tous les caractères sont couverts par le sous-ensemble latin.")
for c, n in manquants.most_common():
    print(f"U+{ord(c):04X} « {c} » : {n} fois, par exemple dans {exemples[c][0]} : {exemples[c][1]}")
