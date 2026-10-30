#!/usr/bin/env python3
"""Captures d'écran sans fenêtre, d'après les scénarios de _visu.html.
python3 tests/capturer.py 390,844|1280,900 clair|sombre scenario1 scenario2 …
Les images vont dans tests/rapports/captures/. Chaque capture utilise un profil Chrome neuf et un délai
maximal : Chrome écrit l'image puis tarde parfois à s'arrêter, on attend le fichier puis on l'arrête."""
import subprocess, sys, os, signal, tempfile, shutil, time, urllib.request, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "static")
DOSSIER = os.path.join(ICI, "rapports", "captures")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
taille, theme, *scenarios = sys.argv[1:]
os.makedirs(DOSSIER, exist_ok=True)

serveur = None
try: urllib.request.urlopen("http://localhost:8000/", timeout=2)
except OSError:
    serveur = subprocess.Popen([sys.executable, os.path.join(ICI, "..", "app.py")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
shutil.copy(os.path.join(ICI, "_visu.html"), STATIC)
# _visu.html charge _site.html : la page du site sans sa politique de sécurité, qui interdirait eval (voir lancer.sh)
with open(os.path.join(STATIC, "index.html"), encoding="utf-8") as e, open(os.path.join(STATIC, "_site.html"), "w", encoding="utf-8") as s:
    s.writelines(l for l in e if 'http-equiv="Content-Security-Policy"' not in l)
try:
    for sc in scenarios:
        profil = tempfile.mkdtemp(prefix="chrome-capture-")
        nom = sc.replace("aller:", "").replace("schema:", "schema-").replace("/", "-")
        sortie = os.path.join(DOSSIER, f"{nom}-{theme}-{taille.split(',')[0]}.png")
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=" + profil, "--no-first-run",
               f"--blink-settings=preferredColorScheme={1 if theme == 'clair' else 0}", f"--window-size={taille}",
               "--virtual-time-budget=5000", "--screenshot=" + sortie, f"http://localhost:8000/_visu.html#{urllib.parse.quote(sc)}"]
        if os.path.exists(sortie): os.remove(sortie)
        p = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        debut, taille_prec = time.time(), -1
        while time.time() - debut < 40:
            time.sleep(0.5)
            if os.path.exists(sortie):
                t = os.path.getsize(sortie)
                if t > 0 and t == taille_prec: break
                taille_prec = t
        try: os.killpg(p.pid, signal.SIGKILL)
        except OSError: pass
        print("ok" if os.path.exists(sortie) else "ÉCHEC", sortie)
        shutil.rmtree(profil, ignore_errors=True)
finally:
    os.remove(os.path.join(STATIC, "_visu.html"))
    os.remove(os.path.join(STATIC, "_site.html"))
    if serveur: serveur.terminate()
