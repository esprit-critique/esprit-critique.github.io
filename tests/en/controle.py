#!/usr/bin/env python3
"""Contrôle de la version anglaise (static/en/).

  python3 tests/en/controle.py            vérifie, rend 1 s'il y a un problème
  python3 tests/en/controle.py --sw       affiche la ligne de static/sw.js à jour (fichiers de en/)

Vérifie :
  1. que chaque fichier de static/en/ est dans la liste FICHIERS du service worker (lecture hors connexion) ;
  2. que chaque dictionnaire static/en/dico-*.js est chargé par en/index.html, et que les scripts de la page française
     le sont aussi par la page anglaise ;
  3. qu'aucun texte français complet n'est resté sans traduction (voir extraire.py --manquants) ;
  4. que les dictionnaires n'ont pas de clé en double avec deux traductions différentes."""
import glob, json, os, re, subprocess, sys, collections

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")


def lire(chemin):
    with open(os.path.join(STATIC, chemin), encoding="utf-8") as f:
        return f.read()


def fichiers_en():
    return sorted("en/" + os.path.basename(c) for c in glob.glob(os.path.join(STATIC, "en", "*")) if os.path.isfile(c))


def ligne_sw():
    return ", ".join('"%s"' % f for f in fichiers_en())


def main():
    if "--sw" in sys.argv:
        print(ligne_sw()); return 0
    problemes = []

    sw = lire("sw.js")
    bloc = re.search(r"const FICHIERS = \[(.*?)\];", sw, re.S).group(1)
    dans_sw = set(re.findall(r'"([^"]+)"', bloc))
    for f in fichiers_en():
        if f not in dans_sw:
            problemes.append("sw.js : %s manque dans FICHIERS" % f)
    for f in dans_sw:
        if f.startswith("en/") and not os.path.exists(os.path.join(STATIC, f)):
            problemes.append("sw.js : %s n'existe pas" % f)

    anglais, francais = lire("en/index.html"), lire("index.html")
    scripts_en = re.findall(r'<script src="([^"]+)"', anglais)
    for d in sorted(glob.glob(os.path.join(STATIC, "en", "dico-*.js"))):
        if os.path.basename(d) not in scripts_en:
            problemes.append("en/index.html ne charge pas %s" % os.path.basename(d))
    for s in re.findall(r'<script src="([^"]+)"', francais):
        if s != "langue.js" and ("../" + s) not in scripts_en and s not in scripts_en:
            problemes.append("en/index.html ne charge pas ../%s (chargé par index.html)" % s)

    for d in sorted(glob.glob(os.path.join(STATIC, "en", "dico-*.js"))):
        src = open(d, encoding="utf-8").read()
        paires = json.loads(src[src.index("EN_AJOUTER(") + len("EN_AJOUTER("):src.rindex(");")])
        vus = collections.defaultdict(set)
        for fr, en in paires:
            vus[re.sub(r"\s+", " ", fr).strip()].add(en)
        for fr, ens in vus.items():
            if len(ens) > 1:
                problemes.append("%s : « %s » a %d traductions" % (os.path.basename(d), fr[:50], len(ens)))

    r = subprocess.run([sys.executable, os.path.join(ICI, "extraire.py"), "--manquants"], capture_output=True, text=True)
    manquants = [l for l in r.stdout.splitlines() if l.strip()]
    if manquants:
        problemes.append("%d texte(s) sans traduction (python3 tests/en/extraire.py --manquants)" % len(manquants))
        problemes += ["    " + l[:140] for l in manquants[:10]]

    for p in problemes:
        print(p)
    print("version anglaise :", "problèmes" if problemes else "OK")
    return 1 if problemes else 0


if __name__ == "__main__":
    sys.exit(main())
