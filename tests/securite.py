#!/usr/bin/env python3
"""Contrôle statique de sécurité du site publié (static/), lancé par l'intégration continue et par tests/lancer.sh.
Échoue (code 1) si le code :
  - insère du HTML ou exécute du texte (innerHTML, outerHTML, insertAdjacentHTML, document.write, eval, new Function,
    setTimeout ou setInterval avec une chaîne) ;
  - pose un gestionnaire d'événement ou un style par setAttribute, ou une adresse « javascript: » ;
  - charge une ressource depuis une autre origine (script, feuille de style, image, police, fetch) ;
  - ouvre un lien dans un nouvel onglet sans rel="noopener" ;
et si les politiques de sécurité (CSP) des pages ne concordent pas : empreinte du script en ligne de chaque page,
CSP identiques hors empreinte, fichiers de static/ absents de la liste du service worker.
python3 tests/securite.py"""
import base64, glob, hashlib, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.abspath(os.path.join(ICI, "..", "static"))
problemes = []


def publies(*motifs):
    """Fichiers publiés de static/ : sans les copies temporaires des bancs (« _… », niveaux.html, controle-affichage.js)."""
    for motif in motifs:
        for chemin in sorted(glob.glob(os.path.join(STATIC, "**", motif), recursive=True, include_hidden=True)):
            nom = os.path.basename(chemin)
            if not (nom.startswith("_") or nom in ("niveaux.html", "controle-affichage.js")):
                yield chemin


rel = lambda chemin: os.path.relpath(chemin, STATIC)

# ---------- Motifs interdits ----------
INTERDITS = [
    (r"\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML", "insertion de HTML"),
    (r"document\.write\b", "document.write"),
    (r"(?<![\w.])eval\s*\(|\bnew\s+Function\s*\(", "exécution de texte (eval, new Function)"),
    (r"\bset(?:Timeout|Interval)\s*\(\s*[\"'`]", "setTimeout ou setInterval avec une chaîne"),
    (r"setAttribute\(\s*[\"'](?:on\w+|style)[\"']", "gestionnaire d'événement ou style posé par setAttribute"),
    (r"javascript:", "adresse javascript:"),
    (r"(?:src|href)\s*=\s*[\"']https?://[^\"']*[\"'][^>]*>|\bfetch\(\s*[\"'`]https?:|@import|url\(\s*[\"']?https?:|\.src\s*=\s*[\"'`]https?:",
     "ressource chargée depuis une autre origine"),
]
for chemin in publies("*.js", "*.html", "*.css"):
    texte = open(chemin, encoding="utf-8").read()
    for motif, quoi in INTERDITS:
        for m in re.finditer(motif, texte):
            extrait = texte[max(0, m.start() - 60):m.end() + 40]
            ligne = texte.count("\n", 0, m.start()) + 1
            # Liens <a href="https://…"> : une navigation, pas une ressource chargée
            if quoi.startswith("ressource") and re.search(r"<a\s[^>]*$", texte[max(0, m.start() - 300):m.start() + 1]):
                continue
            # Balises <link rel="canonical|alternate"> : des adresses, rien n'est chargé
            if quoi.startswith("ressource") and re.search(r'<link rel="(?:canonical|alternate)"[^>]*$', texte[max(0, m.start() - 200):m.start() + 1]):
                continue
            # Métadonnées de partage (og:, twitter:) : lues par les sites qui affichent un aperçu, pas par la page
            if quoi.startswith("ressource") and re.search(r'<meta property="og:', texte[max(0, m.start() - 200):m.start() + 1]):
                continue
            problemes.append(f"{rel(chemin)}:{ligne} : {quoi} — {extrait.strip()[:140]!r}")
    # Nouvel onglet sans rel="noopener" : en HTML, et en JavaScript (a.target = "_blank" sans a.rel = "noopener" à côté)
    for m in re.finditer(r"<a\s[^>]*target=\"_blank\"[^>]*>", texte):
        if "noopener" not in m.group(0):
            problemes.append(f"{rel(chemin)}:{texte.count(chr(10), 0, m.start()) + 1} : lien target=\"_blank\" sans rel=\"noopener\"")
    for m in re.finditer(r"\.target\s*=\s*[\"']_blank[\"']", texte):
        if "noopener" not in texte[max(0, m.start() - 120):m.end() + 120]:
            problemes.append(f"{rel(chemin)}:{texte.count(chr(10), 0, m.start()) + 1} : target = \"_blank\" sans rel = \"noopener\"")

# ---------- Politiques de sécurité des pages ----------
csps = {}
for chemin in publies("*.html"):
    texte = open(chemin, encoding="utf-8").read()
    m = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)">', texte)
    if not m:
        if rel(chemin) != "google94b657f6d0442a2f.html":   # fichier de validation de Google Search Console, sans script
            problemes.append(f"{rel(chemin)} : aucune politique de sécurité (CSP)")
        continue
    csp = m.group(1)
    if 'name="referrer" content="no-referrer"' not in texte:
        problemes.append(f"{rel(chemin)} : balise <meta name=\"referrer\" content=\"no-referrer\"> absente")
    # Chaque script en ligne doit être autorisé par son empreinte, et chaque empreinte correspondre à un script
    scripts = re.findall(r"<script>(.*?)</script>", texte, re.S)
    attendues = {"'sha256-" + base64.b64encode(hashlib.sha256(s.encode("utf-8")).digest()).decode() + "'" for s in scripts}
    presentes = set(re.findall(r"'sha256-[^']*'", csp))
    if attendues != presentes:
        problemes.append(f"{rel(chemin)} : empreinte de la CSP {sorted(presentes)} ≠ script en ligne {sorted(attendues)}")
    for directive in ("require-trusted-types-for 'script'", "object-src 'none'", "base-uri 'none'"):
        if directive not in csp:
            problemes.append(f"{rel(chemin)} : CSP sans « {directive} »")
    csps[rel(chemin)] = re.sub(r"'sha256-[^']*'", "'sha256-…'", csp)
if len(set(csps.values())) > 1:
    reference = csps.get("index.html")
    for page, csp in csps.items():
        if csp != reference:
            problemes.append(f"{page} : CSP différente de celle de index.html (hors empreinte) : {csp}")

# ---------- Liste du service worker ----------
sw = open(os.path.join(STATIC, "sw.js"), encoding="utf-8").read()
fichiers_sw = {f.split("?")[0] for f in json.loads(re.search(r"const FICHIERS = (\[[\s\S]*?\]);", sw).group(1))}
# Fichiers volontairement hors du cache : pages fixes (consultées en ligne), fichiers pour les moteurs de recherche et
# les aperçus de partage, le service worker lui-même
HORS_CACHE = {"sw.js", "robots.txt", "sitemap.xml", "google94b657f6d0442a2f.html", "apercu.png", "apercu-en.png",
              "404.html", "mentions-legales.html", "confidentialite.html", "cgu.html", ".well-known/security.txt"}
for chemin in publies("*"):
    if os.path.isdir(chemin) or os.path.basename(chemin) == ".DS_Store":
        continue
    nom = rel(chemin)
    if nom not in fichiers_sw and nom not in HORS_CACHE:
        problemes.append(f"{nom} : absent de la liste FICHIERS de sw.js (et de la liste HORS_CACHE de ce contrôle)")
for nom in fichiers_sw - {"./"}:
    if not os.path.exists(os.path.join(STATIC, nom)):
        problemes.append(f"sw.js : « {nom} » listé mais absent de static/")

# ---------- security.txt (RFC 9116) : en échec 30 jours avant son expiration ----------
import datetime
chemin = os.path.join(STATIC, ".well-known", "security.txt")
if not os.path.exists(chemin):
    problemes.append(".well-known/security.txt absent")
else:
    contenu = open(chemin, encoding="utf-8").read()
    m = re.search(r"^Expires: (\S+)$", contenu, re.M)
    if not re.search(r"^Contact: https://", contenu, re.M) or not m:
        problemes.append(".well-known/security.txt : champs Contact et Expires obligatoires")
    else:
        expire = datetime.datetime.fromisoformat(m.group(1).replace("Z", "+00:00"))
        if expire - datetime.datetime.now(datetime.timezone.utc) < datetime.timedelta(days=30):
            problemes.append(f".well-known/security.txt expire le {m.group(1)} : repousser la date (un an au plus)")

for p in problemes:
    print("ÉCHEC", p)
print("sécurité :", f"{len(problemes)} problème(s)" if problemes else "OK")
sys.exit(1 if problemes else 0)
