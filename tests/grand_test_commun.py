"""Outils communs aux bancs du Grand test exécutés hors navigateur (moteur JavaScript de macOS, sans Node.js).
executer(pilote) charge les outils d'autres fichiers employés par le moteur, puis les fichiers du Grand test, puis
le pilote, qui se termine par une expression JSON.stringify(...)."""
import json, os, subprocess, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "static")
lire = lambda nom: open(os.path.join(STATIC, nom), encoding="utf-8").read()


def extraire(source, debut):
    """Une déclaration de premier niveau : de la ligne qui commence par « debut » à l'accolade fermante en colonne 0
    (ou la seule ligne, pour une constante d'une ligne)."""
    i = source.index("\n" + debut) + 1
    ligne = source[i:source.index("\n", i)]
    if ligne.rstrip().endswith(";"):
        return ligne
    return source[i:source.index("\n}\n", i) + 2]


def outils():
    """Les outils d'autres fichiers employés par le moteur, recopiés tels quels depuis leur fichier."""
    return "\n".join([
        extraire(lire("app.js"), "function generateur"),
        extraire(lire("app.js"), "function melanger"),
        extraire(lire("debattre.js"), "function phiInverse"),
        extraire(lire("chiffres.js"), "const estAnnee"),
        extraire(lire("chiffres.js"), "function echelleFourchette"),
        extraire(lire("chiffres.js"), "function scoreFourchette"),
    ])


def executer(pilote, fichiers=("grand-test.js",), essai=True):
    """essai=True : comme la copie d'essai du banc, les contenus encore à relire sont admis (GRAND_TEST_ESSAI)."""
    code = "\n".join(lire(f) for f in fichiers)
    if essai:
        code = code.replace("const GRAND_TEST_ESSAI = false;", "const GRAND_TEST_ESSAI = true;")
    code = outils() + "\n" + code + "\n" + pilote
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
    try:
        r = subprocess.run(["osascript", "-l", "JavaScript", f.name], capture_output=True, text=True, timeout=900)
    finally:
        os.remove(f.name)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[:2000])
    return json.loads(r.stdout)


class Rapport:
    def __init__(self):
        self.lignes = []

    def ok(self, nom, cond, detail=""):
        self.lignes.append(("OK    " if cond else "ÉCHEC ") + nom + ("" if cond or not detail else " — " + str(detail)[:600]))

    def ecrire(self, sortie):
        echecs = sum(1 for l in self.lignes if not l.startswith("OK"))
        self.lignes.insert(0, "RÉSUMÉ : " + str(len(self.lignes) - echecs) + " / " + str(len(self.lignes)) + " vérifications réussies")
        os.makedirs(os.path.dirname(sortie), exist_ok=True)
        open(sortie, "w", encoding="utf-8").write("\n".join(self.lignes) + "\n")
        print(self.lignes[0])
        return echecs
