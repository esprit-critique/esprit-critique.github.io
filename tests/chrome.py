#!/usr/bin/env python3
"""Ouvre une page de test dans Chrome sans fenêtre et enregistre son rapport.
python3 chrome.py URL LARGEUR,HAUTEUR clair|sombre FICHIER_RAPPORT [DÉLAI_S]
La page écrit son rapport dans la console, ligne par ligne (« RAPPORT: … »), puis « RAPPORT-FIN ».
On lit la console au fil de l'eau et l'on arrête Chrome dès la fin du rapport, ou au bout du délai :
Chrome sans fenêtre ne s'arrête pas toujours de lui-même."""
import subprocess, sys, os, signal, re, select, tempfile, shutil, time

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
url, taille, theme, sortie = sys.argv[1:5]
delai = int(sys.argv[5]) if len(sys.argv) > 5 else 600
profil = tempfile.mkdtemp(prefix="chrome-test-")
cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--user-data-dir=" + profil,
       "--window-size=" + taille, f"--blink-settings=preferredColorScheme={1 if theme == 'clair' else 0}",
       "--enable-logging=stderr", "--v=0", "--virtual-time-budget=3600000", "--dump-dom", url]
p = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, start_new_session=True)

def texte(brut):
    # La console de Chrome échappe les caractères non ASCII (\u00e9…) et les guillemets
    return brut.encode("latin-1", "replace").decode("unicode_escape").encode("latin-1", "replace").decode("utf-8", "replace")

lignes, progres, fini, tampon, fin = [], [], False, b"", time.time() + delai
try:
    while time.time() < fin and not fini:
        pret, _, _ = select.select([p.stderr], [], [], 1)
        if not pret:
            if p.poll() is not None: break
            continue
        morceau = os.read(p.stderr.fileno(), 65536)
        if not morceau: break
        tampon += morceau
        *completes, tampon = tampon.split(b"\n")
        for l in completes:
            etape = re.search(rb'"BANC: (.*)", source', l)
            if etape: progres.append(texte(etape.group(1).decode("latin-1")))
            m = re.search(rb'"RAPPORT(-FIN|: ?(.*))", source', l)
            if not m: continue
            if m.group(1) == b"-FIN": fini = True
            else: lignes.append(texte(m.group(2).decode("latin-1")))
finally:
    try: os.killpg(p.pid, signal.SIGKILL)
    except OSError: pass
    shutil.rmtree(profil, ignore_errors=True)
if not fini:
    # Banc inachevé : on garde les vérifications déjà faites, pour savoir où il s'est arrêté
    lignes = ["RÉSUMÉ : INACHEVÉ (délai de " + str(delai) + " s dépassé ou page bloquée)", "Dernières étapes :"] + progres[-15:]
open(sortie, "w").write("\n".join(lignes) + "\n")
