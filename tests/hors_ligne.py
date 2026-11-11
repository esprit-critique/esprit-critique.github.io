#!/usr/bin/env python3
"""Banc « hors-ligne » : sert static/ sur un port à part (8011), ouvre tests/_hors-ligne.html dans Chrome sans
fenêtre, coupe le serveur quand la page a installé le service worker (« PRET »), puis lit le rapport : chaque
fichier mis en cache doit encore se charger, sans aucune donnée de l'utilisateur dans le cache.
python3 tests/hors_ligne.py LARGEUR,HAUTEUR clair|sombre FICHIER_RAPPORT"""
import functools, http.server, os, re, select, shutil, signal, subprocess, sys, tempfile, threading, time

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.abspath(os.path.join(ICI, "..", "static"))
from navigateur import CHROME
PORT = 8011
taille, theme, sortie = sys.argv[1:4]

class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

shutil.copy(os.path.join(ICI, "_hors-ligne.html"), os.path.join(STATIC, "_hors-ligne.html"))
serveur = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Silencieux, directory=STATIC))
threading.Thread(target=serveur.serve_forever, daemon=True).start()
profil = tempfile.mkdtemp(prefix="chrome-hl-")
p = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=" + profil, "--window-size=" + taille,
                      f"--blink-settings=preferredColorScheme={1 if theme == 'clair' else 0}", "--enable-logging=stderr", "--v=0",
                      f"http://localhost:{PORT}/_hors-ligne.html"], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, start_new_session=True)
texte = lambda b: b.encode("latin-1", "replace").decode("unicode_escape").encode("latin-1", "replace").decode("utf-8", "replace")
lignes, tampon, fini, coupe, fin = [], b"", False, False, time.time() + 60
try:
    while time.time() < fin and not fini:
        pret, _, _ = select.select([p.stderr], [], [], 0.5)
        if not pret: continue
        morceau = os.read(p.stderr.fileno(), 65536)
        if not morceau: break
        tampon += morceau
        *completes, tampon = tampon.split(b"\n")
        for l in completes:
            if not coupe and b'"PRET"' in l:
                serveur.shutdown(); serveur.server_close(); coupe = True
            m = re.search(rb'"RAPPORT(-FIN|: ?(.*))", source', l)
            if not m: continue
            if m.group(1) == b"-FIN": fini = True
            else: lignes.append(texte(m.group(2).decode("latin-1")))
finally:
    try: os.killpg(p.pid, signal.SIGKILL)
    except OSError: pass
    if not coupe: serveur.shutdown(); serveur.server_close()
    shutil.rmtree(profil, ignore_errors=True)
    os.remove(os.path.join(STATIC, "_hors-ligne.html"))
if not fini:
    lignes = ["RÉSUMÉ : INACHEVÉ (page bloquée ou délai dépassé)"] + lignes
open(sortie, "w").write("\n".join(lignes) + "\n")
