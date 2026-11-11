#!/usr/bin/env python3
"""Chemin de Chrome pour les bancs, sous macOS comme sous Linux : la variable d'environnement CHROME si elle est
posée, sinon le premier navigateur trouvé dans le PATH, sinon l'emplacement habituel sous macOS.
python3 tests/navigateur.py affiche ce chemin (pour les scripts shell)."""
import os, shutil

MAC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME = os.environ.get("CHROME") or next(
    (c for c in map(shutil.which, ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser")) if c), MAC)

if __name__ == "__main__":
    print(CHROME)
