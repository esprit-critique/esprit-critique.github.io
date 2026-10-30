#!/usr/bin/env python3
"""Banc « csp » : ouvre la vraie page du site (index.html, avec sa politique de sécurité), hors de tout cadre,
sur plusieurs adresses, et relève dans la console de Chrome les blocages de la politique de sécurité (CSP)
et les erreurs JavaScript. Les autres bancs utilisent une copie sans CSP (voir lancer.sh).
python3 tests/csp.py LARGEUR,HAUTEUR clair|sombre FICHIER_RAPPORT"""
import os, re, select, shutil, signal, subprocess, sys, tempfile, time

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ADRESSES = ["accueil", "biais/ancrage", "sophismes/post-hoc", "quiz", "ateliers", "chiffres/monde", "chiffres/intervalles",
            "tests/demonter", "tests/laterale", "bingo/12345", "portrait", "guide/methode", "adresse-inconnue", "biais/%E0",
            # Pages fixes (adresses commençant par « / »)
            "/mentions-legales.html", "/confidentialite.html", "/cgu.html", "/404.html"]
SIGNES = re.compile(r"Content Security Policy|Refused to|Uncaught|TypeError|ReferenceError|SyntaxError|URIError")
taille, theme, sortie = sys.argv[1:4]

problemes = []
for adresse in ADRESSES:
    profil = tempfile.mkdtemp(prefix="chrome-csp-")
    cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=" + profil, "--window-size=" + taille,
           f"--blink-settings=preferredColorScheme={1 if theme == 'clair' else 0}", "--enable-logging=stderr", "--v=0",
           "http://localhost:8000" + adresse if adresse.startswith("/") else "http://localhost:8000/#" + adresse]
    p = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, start_new_session=True)
    tampon, fin = b"", time.time() + 6   # six secondes de vraie exécution par adresse
    while time.time() < fin:
        pret, _, _ = select.select([p.stderr], [], [], 0.5)
        if pret:
            morceau = os.read(p.stderr.fileno(), 65536)
            if not morceau: break
            tampon += morceau
    try: os.killpg(p.pid, signal.SIGKILL)
    except OSError: pass
    shutil.rmtree(profil, ignore_errors=True)
    for ligne in tampon.decode("utf-8", "replace").splitlines():
        if "CONSOLE" in ligne and SIGNES.search(ligne):
            problemes.append(("" if adresse.startswith("/") else "#") + adresse + " : " + ligne.split("] ", 1)[-1][:300])

lignes = ["RÉSUMÉ : " + ("aucun blocage ni erreur" if not problemes else str(len(problemes)) + " problème(s)") + " sur " + str(len(ADRESSES)) + " adresses"]
lignes += ["ÉCHEC " + x for x in problemes]
with open(sortie, "w", encoding="utf-8") as f:
    f.write("\n".join(lignes) + "\n")
