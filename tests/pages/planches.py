#!/usr/bin/env python3
"""Planches « avant / après » de l'identité visuelle : pour chaque écran de référence, les captures avant et après,
en clair et en sombre, côte à côte (tests/rapports/identite/planches/<écran>-<largeur>.png), par Chrome sans fenêtre.
python3 tests/pages/planches.py [étape finale, par défaut apres-6]"""
import os, signal, subprocess, sys, tempfile, time
ICI = os.path.dirname(os.path.abspath(__file__))
DOSSIER = os.path.abspath(os.path.join(ICI, "..", "rapports", "identite"))
APRES = sys.argv[1] if len(sys.argv) > 1 else "apres-6"
ECRANS = ["accueil", "biais", "biais-ancrage", "sophismes-ad-hominem", "quiz-faux", "vf-bilan", "guide"]
os.makedirs(os.path.join(DOSSIER, "planches"), exist_ok=True)
for largeur, echelle in [(390, 1.0), (1280, 0.42)]:
    for e in ECRANS:
        cellules = "".join(f'<figure><figcaption>{etape} · {theme}</figcaption><img src="{DOSSIER}/{etape}/{e}-{theme}-{largeur}.png"></figure>'
                           for theme in ["clair", "sombre"] for etape in ["avant", APRES])
        l = int(largeur * echelle)
        page = f'''<!DOCTYPE html><meta charset="UTF-8"><style>body{{margin:0;padding:16px;background:#ddd;font:15px -apple-system,sans-serif;display:flex;gap:12px}}
figure{{margin:0}}figcaption{{margin:0 0 6px;font-weight:600}}img{{width:{l}px;display:block;border:1px solid #999}}</style>{cellules}'''
        html = os.path.join(tempfile.mkdtemp(), "planche.html"); open(html, "w").write(page)
        sortie = os.path.join(DOSSIER, "planches", f"{e}-{largeur}.png")
        hauteur = int((844 if largeur == 390 else 900) * echelle) + 70
        p = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--user-data-dir=" + tempfile.mkdtemp(), f"--window-size={4 * l + 80},{hauteur}", "--virtual-time-budget=2000",
            "--allow-file-access-from-files", "--screenshot=" + sortie, "file://" + html], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        for _ in range(40):
            if os.path.exists(sortie) and os.path.getsize(sortie): break
            time.sleep(0.5)
        time.sleep(0.5); os.killpg(p.pid, signal.SIGKILL)
        print(sortie)
