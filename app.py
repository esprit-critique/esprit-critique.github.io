# app.py : serveur local de l'application Esprit critique.
# Utilise uniquement la bibliothèque standard de Python : aucune installation nécessaire.
# Lancement : python3 app.py, puis ouvrir l'adresse affichée.
#   python3 app.py          le site n'est accessible que depuis ce Mac
#   python3 app.py --wifi   accessible aussi depuis les appareils du même réseau (iPhone) : à éviter sur un Wi-Fi public

import http.server
import os
import socket
import socketserver
import sys

PORT = 8000
DOSSIER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


class Handler(http.server.SimpleHTTPRequestHandler):
    # Ne pas annoncer la version de Python dans les réponses
    server_version = "EspritCritique"
    sys_version = ""
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
        # En-têtes de sécurité : type de fichier respecté, aucune adresse transmise aux autres sites,
        # page non intégrable par un autre site, aucun accès à la caméra, au micro ou à la position
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        super().end_headers()

    def list_directory(self, path):
        # Pas de liste du contenu des dossiers
        self.send_error(404, "Introuvable")
        return None


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
    # Par défaut, seul ce Mac peut se connecter ("127.0.0.1"). Avec --wifi, "0.0.0.0" accepte aussi les autres
    # appareils du réseau : n'importe qui sur le même Wi-Fi peut alors ouvrir le site.
    wifi = "--wifi" in sys.argv[1:]
    with Serveur(("0.0.0.0" if wifi else "127.0.0.1", PORT), Handler) as httpd:
        print("Esprit critique est lancé.")
        print(f"  Sur ce Mac   : http://localhost:{PORT}")
        ip = adresse_wifi() if wifi else None
        if ip:
            print(f"  Sur l'iPhone : http://{ip}:{PORT}  (même réseau Wi-Fi ; tout appareil de ce réseau y a accès)")
        elif not wifi:
            print("  Depuis un autre appareil : python3 app.py --wifi, ou le site en ligne https://esprit-critique.github.io/")
        print("Arrêt : Ctrl + C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServeur arrêté.")
