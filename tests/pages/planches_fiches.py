#!/usr/bin/env python3
"""Planches « avant / après » de la mission « fiches » : pour chacune des quatre fiches, le haut et le milieu de la
page, avant et après, en clair et en sombre, côte à côte (tests/rapports/fiches/planches/<fiche>-<largeur>.png).
Les bandes sont découpées dans les captures pleine page de tests/pages/fiches.sh, par Chrome sans fenêtre.
python3 tests/pages/planches_fiches.py [étape finale, par défaut etape-6]"""
import os, signal, subprocess, sys, tempfile, time
ICI = os.path.dirname(os.path.abspath(__file__))
DOSSIER = os.path.abspath(os.path.join(ICI, "..", "rapports", "fiches"))
APRES = sys.argv[1] if len(sys.argv) > 1 else "etape-6"
FICHES = ["biais-ancrage", "biais-halo", "sophismes-ad-hominem", "sophismes-faux-dilemme"]
# Bandes (haut, milieu) : position et hauteur en pixels de la capture, puis échelle d'affichage
BANDES = {390: ([(0, 1150), (1150, 1150)], 1.0), 1280: ([(0, 1000), (1000, 1000)], 0.5)}
os.makedirs(os.path.join(DOSSIER, "planches"), exist_ok=True)
for largeur, (bandes, echelle) in BANDES.items():
    for fiche in FICHES:
        cellules = ""
        for theme in ["clair", "sombre"]:
            for nom, (haut, h) in zip(["haut", "milieu"], bandes):
                for etape in ["avant", APRES]:
                    image = f"{DOSSIER}/{etape}/{fiche}-{theme}-{largeur}.png"
                    cellules += (f'<figure><figcaption>{etape} · {theme} · {nom}</figcaption>'
                                 f'<div style="width:{int(largeur * echelle)}px;height:{int(h * echelle)}px;background:url(\'file://{image}\') 0 -{int(haut * echelle)}px / {int(largeur * echelle)}px auto no-repeat"></div></figure>')
        l, hh = int(largeur * echelle), int(bandes[0][1] * echelle)
        page = (f'<!DOCTYPE html><meta charset="UTF-8"><style>body{{margin:0;padding:12px;background:#ccc;font:13px -apple-system,sans-serif;'
                f'display:grid;grid-template-columns:repeat(4,{l}px);gap:10px}}figure{{margin:0}}figcaption{{font-weight:600;margin:0 0 4px}}'
                f'div{{border:1px solid #888}}</style>{cellules}')
        html = os.path.join(tempfile.mkdtemp(), "planche.html"); open(html, "w").write(page)
        sortie = os.path.join(DOSSIER, "planches", f"{fiche}-{largeur}.png")
        if os.path.exists(sortie): os.remove(sortie)
        p = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--user-data-dir=" + tempfile.mkdtemp(), "--allow-file-access-from-files", f"--window-size={4 * l + 60},{2 * hh + 90}",
            "--virtual-time-budget=2000", "--screenshot=" + sortie, "file://" + html], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        for _ in range(40):
            if os.path.exists(sortie) and os.path.getsize(sortie): break
            time.sleep(0.5)
        time.sleep(0.5); os.killpg(p.pid, signal.SIGKILL)
        print(sortie)
