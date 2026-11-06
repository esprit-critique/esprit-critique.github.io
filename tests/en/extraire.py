#!/usr/bin/env python3
"""Textes français du site, pour la version anglaise (static/en/dico-*.js).

Lit les scripts de static/ avec un petit analyseur JavaScript (chaînes, gabarits, commentaires, expressions
régulières) et en tire :
  - les textes français « complets » : à traduire dans un dictionnaire (le site les remplace à l'affichage) ;
  - les textes « assemblés » (chaîne collée à une valeur par +, ou gabarit avec ${…}) : le code doit les écrire
    sous la forme T("texte avec {0}", valeur), sinon la traduction ne peut pas réordonner la phrase.

  python3 tests/en/extraire.py                    résumé par fichier
  python3 tests/en/extraire.py FICHIER.js         liste des textes de ce fichier (id, texte)
  python3 tests/en/extraire.py --assembles [F]    les textes assemblés, avec leur ligne
  python3 tests/en/extraire.py --manquants [F]    les textes complets sans traduction (sortie en erreur s'il y en a)
"""
import glob, hashlib, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")
IGNORES = {"sw.js", "langue.js", "donnees.js", "indices.js", "pays.js"}   # donnees.js et indices.js : traduits par static/en/fiches.js ; pays.js : par static/en/pays.js


def lire(chemin):
    with open(chemin, encoding="utf-8") as f:
        return f.read()


# ---------------------------------------------------------------- analyseur
ECHAPPEMENTS = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


def decoder(brut):
    """Valeur d'une chaîne JavaScript à partir de son texte source (sans les guillemets)."""
    sortie, i = [], 0
    while i < len(brut):
        c = brut[i]
        if c != "\\":
            sortie.append(c); i += 1; continue
        i += 1
        c = brut[i]
        if c == "u":
            if brut[i + 1] == "{":
                fin = brut.index("}", i)
                sortie.append(chr(int(brut[i + 2:fin], 16))); i = fin + 1
            else:
                sortie.append(chr(int(brut[i + 1:i + 5], 16))); i += 5
        elif c == "x":
            sortie.append(chr(int(brut[i + 1:i + 3], 16))); i += 3
        elif c == "\n":
            i += 1
        else:
            sortie.append(ECHAPPEMENTS.get(c, c)); i += 1
    return "".join(sortie)


MOTS_AVANT_REGEX = {"return", "typeof", "case", "in", "of", "delete", "void", "throw", "new", "else", "do"}


def analyser(source):
    """Liste de jetons : ('chaine', valeur, ligne), ('gabarit', [parties], ligne, [expressions]), ('p', signe), ('id', nom)…"""
    jetons, i, n, ligne = [], 0, len(source), 1

    def precedent_permet_regex():
        if not jetons:
            return True
        t = jetons[-1]
        if t[0] == "p":
            return t[1] not in (")", "]", "}")
        if t[0] == "id":
            return t[1] in MOTS_AVANT_REGEX
        return False

    def lire_gabarit(debut):
        """Lit un gabarit à partir du guillemet ouvrant ; rend (parties, expressions, position après)."""
        nonlocal ligne
        parties, expressions, courant, j = [], [], [], debut + 1
        while j < n:
            c = source[j]
            if c == "\\":
                courant.append(source[j:j + 2]); j += 2; continue
            if c == "`":
                parties.append(decoder("".join(courant)))
                return parties, expressions, j + 1
            if c == "$" and source[j + 1:j + 2] == "{":
                parties.append(decoder("".join(courant))); courant = []
                profondeur, k = 1, j + 2
                while k < n and profondeur:
                    d = source[k]
                    if d in "\"'":
                        k = fin_chaine(k) ; continue
                    if d == "`":
                        _, _, k = lire_gabarit(k); continue
                    if d == "{": profondeur += 1
                    elif d == "}": profondeur -= 1
                    k += 1
                expressions.append(source[j + 2:k - 1])
                j = k; continue
            if c == "\n": ligne += 1
            courant.append(c); j += 1
        raise SystemExit("gabarit non fermé")

    def fin_chaine(debut):
        guillemet, j = source[debut], debut + 1
        while source[j] != guillemet:
            j += 2 if source[j] == "\\" else 1
        return j + 1

    while i < n:
        c = source[i]
        if c == "\n":
            ligne += 1; i += 1
        elif c in " \t\r":
            i += 1
        elif source.startswith("//", i):
            while i < n and source[i] != "\n": i += 1
        elif source.startswith("/*", i):
            fin = source.index("*/", i + 2)
            ligne += source.count("\n", i, fin); i = fin + 2
        elif c in "\"'":
            fin = fin_chaine(i)
            jetons.append(("chaine", decoder(source[i + 1:fin - 1]), ligne)); i = fin
        elif c == "`":
            debut_ligne = ligne
            parties, expressions, i = lire_gabarit(i)
            jetons.append(("gabarit", parties, debut_ligne, expressions))
        elif c == "/" and precedent_permet_regex():
            j, classe = i + 1, False
            while source[j] != "/" or classe:
                if source[j] == "\\": j += 1
                elif source[j] == "[": classe = True
                elif source[j] == "]": classe = False
                j += 1
            j += 1
            while j < n and source[j].isalpha(): j += 1
            jetons.append(("regex", source[i:j], ligne)); i = j
        elif c.isalpha() or c in "_$":
            j = i
            while j < n and (source[j].isalnum() or source[j] in "_$"): j += 1
            jetons.append(("id", source[i:j], ligne)); i = j
        elif c.isdigit():
            j = i
            while j < n and (source[j].isalnum() or source[j] in "._"): j += 1
            jetons.append(("num", source[i:j], ligne)); i = j
        else:
            jetons.append(("p", c, ligne)); i += 1
    return jetons


# ------------------------------------------------------------ tri des textes
# Mots qui ressemblent à du texte mais n'en sont pas (noms de touches, de balises, de types de fichiers…)
NON_TEXTES = {"Enter", "Escape", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab", "Backspace", "Home", "End",
              "Esprit critique : affichage dans le cadre d'un autre site refusé", "les deux", "\\n", "PRODID:-//Esprit critique//esprit-critique.github.io//FR", "text/calendar;charset=utf-8"}

ACCENTS = re.compile(r"[àâäçéèêëîïôöùûüœÿÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŒ«»]")
MOT = re.compile(r"[A-Za-zÀ-ÿŒœ]{2,}")


def ressemble_a_du_texte(s):
    """Vrai pour un texte lu par une personne ; faux pour un identifiant, une classe CSS, une adresse, une couleur…"""
    t = s.strip()
    if t in NON_TEXTES or re.search(r"[>\[\]]|\{(?!\d+\})|(?<!\{\d)(?<!\{\d\d)\}|:not\(|prefers-|^[#.][\w-]", t) or re.fullmatch(r"[\w#.\-]+( [\w#.\-]+)*, ?.*", t) and re.search(r"input|textarea|button|section|script", t):
        return False
    if len(t) < 2 or not re.search(r"[A-Za-zÀ-ÿ]", t):
        return False
    if re.fullmatch(r"[LlDd]'[A-Za-zÀ-ÿ]{2,}", t):             # « L'ancre », « l'humeur » : un nom précédé de son article élidé
        return True
    if re.match(r"^(l'|d')[A-ZÀ-Ý]", t):                      # « l'Inde », « d'Allemagne » : un nom précédé de son article
        return True
    if re.fullmatch(r"[#.\[]?[\w\-:.#\[\]=\"'/*>+~, ()]*", t) and not ACCENTS.search(t) and " " not in t:
        # un seul mot ASCII : identifiant, sauf s'il commence par une majuscule suivie de minuscules (« Accueil »)
        return bool(re.fullmatch(r"[A-Z][a-z]{2,}[a-z\-']*", t))
    if re.match(r"^(https?://|#|\.|/|data:|[a-z\-]+:[^ ])", t) and " " not in t:
        return False
    if re.fullmatch(r"[MmLlHhVvCcSsQqTtAaZz0-9 ,.\-]+", t):      # tracé SVG
        return False
    if re.fullmatch(r"[a-z0-9\-]+( [a-z0-9\-]+)*", t) and not ACCENTS.search(t):
        # plusieurs mots en minuscules sans accent : classes CSS (« verdict juste ») ou français (« le calcul »)
        return len(MOT.findall(t)) >= 2 and any(len(m) > 3 for m in MOT.findall(t)) and bool(
            re.search(r"\b(le|la|les|un|une|des|du|de|et|ou|est|sur|dans|pour|par|que|qui|pas|ne|se|ce|en|au|aux|à)\b", t))
    return True


def textes_html(s):
    """Textes lus dans une chaîne qui contient des balises (« <h2>Titre</h2> ») : un texte par morceau entre balises."""
    return [re.sub(r"\s+", " ", m).strip() for m in re.split(r"<[^>]*>", s) if re.search(r"[A-Za-zÀ-ÿ]{2}", m)]


def parties_de_gabarit(parties):
    return "".join(p if k == len(parties) - 1 else p + "{" + str(k) + "}" for k, p in enumerate(parties))


def extraire(chemin):
    """Rend (complets, assembles) : complets = [(ligne, texte)], assembles = [(ligne, texte avec {k})]."""
    source = lire(chemin)
    lignes = source.split("\n")
    jetons = analyser(source)
    complets, assembles = [], []
    for k, t in enumerate(jetons):
        if t[0] == "chaine":
            avant = jetons[k - 1] if k else None
            apres = jetons[k + 1] if k + 1 < len(jetons) else None
            colle = (avant and avant[0] == "p" and avant[1] == "+") or (apres and apres[0] == "p" and apres[1] == "+")
            if re.search(r"<[a-z/][^>]*>", t[1]):
                for morceau in textes_html(t[1]):
                    if ressemble_a_du_texte(morceau): complets.append((t[2], morceau))
                continue
            if not ressemble_a_du_texte(t[1]):
                continue
            # « "a" + "b" » (deux chaînes) se lit comme un seul texte pour le lecteur du code, pas pour le site
            voisin_valeur = False
            if avant and avant[0] == "p" and avant[1] == "+" and k >= 2 and jetons[k - 2][0] != "chaine":
                voisin_valeur = True
            if apres and apres[0] == "p" and apres[1] == "+" and k + 2 < len(jetons) and jetons[k + 2][0] != "chaine":
                voisin_valeur = True
            if colle and voisin_valeur and "fr-seulement" in lignes[t[2] - 1]:
                continue                       # texte d'une branche réservée au français
            (assembles if colle and voisin_valeur else complets).append((t[2], t[1]))
        elif t[0] == "gabarit":
            if len(t[1]) == 1:
                if ressemble_a_du_texte(t[1][0]):
                    complets.append((t[2], t[1][0]))
            else:
                texte = parties_de_gabarit(t[1])
                if ressemble_a_du_texte(re.sub(r"\{\d+\}", "", texte)):
                    assembles.append((t[2], texte))
    return complets, assembles


def identifiant(texte):
    return hashlib.sha1(re.sub(r"\s+", " ", texte).encode("utf-8")).hexdigest()[:7]


# --------------------------------------------------------------- dictionnaires
def cle(texte):
    return re.sub(r"[  \s]+", " ", texte).strip()


def paires_dictionnaires():
    """{texte français normalisé: anglais} lu dans static/en/dico-*.js."""
    dico = {}
    for chemin in sorted(glob.glob(os.path.join(STATIC, "en", "dico-*.js"))):
        source = lire(chemin)
        debut, fin = source.index("EN_AJOUTER(") + len("EN_AJOUTER("), source.rindex(");")
        for fr, en in json.loads(source[debut:fin]):
            dico[cle(fr)] = en
    return dico


def fichiers(demande):
    tous = sorted(os.path.basename(c) for c in glob.glob(os.path.join(STATIC, "*.js")))
    tous = [f for f in tous if f not in IGNORES and not f.startswith("_")]
    return [f for f in tous if f == demande] if demande else tous


def main():
    args = sys.argv[1:]
    mode = "resume"
    if args and args[0] in ("--assembles", "--manquants"):
        mode, args = args[0][2:], args[1:]
    elif args and args[0].endswith(".js"):
        mode = "liste"
    demande = args[0] if args else None
    erreur = False
    dico = paires_dictionnaires() if mode in ("manquants", "resume") else {}
    vus = set()
    for f in fichiers(demande):
        complets, assembles = extraire(os.path.join(STATIC, f))
        uniques = {}
        for ligne, texte in complets:
            uniques.setdefault(cle(texte), (ligne, texte))
        if mode == "resume":
            manquants = [t for c, (l, t) in uniques.items() if c not in dico]
            print(f"{f:26} {len(uniques):5} textes, dont {len(manquants):5} sans traduction ; {len(assembles):4} assemblés")
        elif mode == "liste":
            for c, (ligne, texte) in uniques.items():
                print(f"{identifiant(texte)}\t{ligne}\t{texte}")
        elif mode == "assembles":
            for ligne, texte in assembles:
                print(f"{f}:{ligne}\t{texte}")
        elif mode == "manquants":
            for c, (ligne, texte) in uniques.items():
                if c not in dico and c not in vus:
                    print(f"{f}:{ligne}\t{texte}"); erreur = True
                vus.add(c)
    sys.exit(1 if erreur else 0)


if __name__ == "__main__":
    main()
