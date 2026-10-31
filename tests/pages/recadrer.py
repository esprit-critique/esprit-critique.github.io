#!/usr/bin/env python3
"""Découpe une bande d'une capture PNG, à taille réelle, par Chrome sans fenêtre (aucune bibliothèque d'images).
python3 tests/pages/recadrer.py entree.png sortie.png HAUT HAUTEUR"""
import os, signal, subprocess, sys, tempfile, time
entree, sortie, haut, hauteur = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
largeur = int(subprocess.run(["sips", "-g", "pixelWidth", entree], capture_output=True, text=True).stdout.split()[-1])
page = os.path.join(tempfile.mkdtemp(), "bande.html")
open(page, "w").write(f'<!DOCTYPE html><style>html,body{{margin:0;overflow:hidden}}div{{width:{largeur}px;height:{hauteur}px;background:url("file://{os.path.abspath(entree)}") 0 -{haut}px no-repeat}}</style><div></div>')
if os.path.exists(sortie): os.remove(sortie)
p = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=" + tempfile.mkdtemp(),
    "--allow-file-access-from-files", f"--window-size={largeur},{hauteur}", "--virtual-time-budget=1500", "--screenshot=" + os.path.abspath(sortie), "file://" + page],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
for _ in range(40):
    if os.path.exists(sortie) and os.path.getsize(sortie): break
    time.sleep(0.5)
time.sleep(0.5); os.killpg(p.pid, signal.SIGKILL)
print(sortie)
