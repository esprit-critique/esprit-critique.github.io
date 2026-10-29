# app.py : serveur local de l'application Esprit critique.
# Utilise uniquement la bibliothèque standard de Python : aucune installation nécessaire.
# Lancement : python3 app.py, puis ouvrir l'adresse affichée.

import http.server
import os
import socket
import socketserver
import sys

PORT = 8000
DOSSIER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


class Handler(http.server.SimpleHTTPRequestHandler):
    # Types de fichiers que Python ne connaît pas toujours
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
    }

    def __init__(self, *args, **kwargs):
        # Les fichiers envoyés au navigateur viennent du dossier "static"
        super().__init__(*args, directory=DOSSIER, **kwargs)

    def end_headers(self):
        # Oblige le navigateur à vérifier s'il existe une version plus récente des fichiers :
        # après une modification, un simple rechargement suffit, y compris sur l'iPhone.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


class Serveur(socketserver.ThreadingTCPServer):
    allow_reuse_address = True  # permet de relancer le serveur tout de suite après un arrêt
    daemon_threads = True

    def handle_error(self, request, client_address):
        # Connexion coupée par le navigateur ou par un filtre réseau : fréquent et sans gravité,
        # on ne l'affiche pas (c'était l'erreur « Socket is not connected »).
        erreur = sys.exc_info()[1]
        if isinstance(erreur, ConnectionError) or getattr(erreur, "errno", None) in (32, 54, 57):
            return
        super().handle_error(request, client_address)


def adresse_wifi():
    # Adresse du Mac sur le réseau local. connect() en UDP n'envoie rien :
    # il sert seulement à savoir quelle interface réseau serait utilisée.
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("192.0.2.1", 80))  # adresse réservée à la documentation, jamais contactée
            return s.getsockname()[0]
    except OSError:
        return None


if __name__ == "__main__":
    # "0.0.0.0" accepte les connexions des autres appareils du Wi-Fi (l'iPhone)
    with Serveur(("0.0.0.0", PORT), Handler) as httpd:
        print("Esprit critique est lancé.")
        print(f"  Sur ce Mac   : http://localhost:{PORT}")
        ip = adresse_wifi()
        if ip:
            print(f"  Sur l'iPhone : http://{ip}:{PORT}  (même réseau Wi-Fi)")
        print("Arrêt : Ctrl + C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServeur arrêté.")
