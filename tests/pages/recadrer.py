#!/usr/bin/env python3
"""Découpe une bande d'une capture PNG, à taille réelle, par Chrome sans fenêtre (aucune bibliothèque d'images).
python3 tests/pages/recadrer.py entree.png sortie.png HAUT HAUTEUR"""
import os, signal, struct, subprocess, sys, tempfile, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")); from navigateur import CHROME
entree, sortie, haut, hauteur = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
# Largeur lue dans l'en-tête IHDR du PNG (octets 16 à 19), sans « sips », propre à macOS
largeur = struct.unpack(">I", open(entree, "rb").read(24)[16:20])[0]
page = os.path.join(tempfile.mkdtemp(), "bande.html")
open(page, "w").write(f'<!DOCTYPE html><style>html,body{{margin:0;overflow:hidden}}div{{width:{largeur}px;height:{hauteur}px;background:url("file://{os.path.abspath(entree)}") 0 -{haut}px no-repeat}}</style><div></div>')
if os.path.exists(sortie): os.remove(sortie)
p = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=" + tempfile.mkdtemp(),
    "--allow-file-access-from-files", f"--window-size={largeur},{hauteur}", "--virtual-time-budget=1500", "--screenshot=" + os.path.abspath(sortie), "file://" + page],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
for _ in range(40):
    if os.path.exists(sortie) and os.path.getsize(sortie): break
    time.sleep(0.5)
time.sleep(0.5); os.killpg(p.pid, signal.SIGKILL)
print(sortie)
