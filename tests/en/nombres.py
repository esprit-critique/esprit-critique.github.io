#!/usr/bin/env python3
"""Nombres écrits à la française dans les scripts (« 842 000 », « 9,5 », « 12 % ») : génère static/en/dico-nombres.js,
leur équivalent anglais (« 842,000 », « 9.5 », « 12% »). Ne traite que les textes sans aucune lettre ;
ceux qui contiennent des mots se traduisent à la main dans les dictionnaires de leur fichier.

  python3 tests/en/nombres.py"""
import glob, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extraire as x

SEUL_NOMBRE = re.compile(r"^[\s≈~+\-−–<>%0-9.,  ×/°€$()²³]+$")


NOMBRE = re.compile(r"^([≈~+\-−–<>\s]*)(\d{1,3}(?:[\u202f\u00a0 ]\d{3})+|\d+)(?:,(\d+))?((?:[\u202f\u00a0 ]?%)?)\s*$")


def en_anglais(s):
    """« ≈ 12 345,6 » -> « ≈ 12,345.6 » ; « 70 % » -> « 70% ». None si le texte n'est pas un simple nombre."""
    m = NOMBRE.match(s)
    if not m:
        return None
    avant, entier, decimales, pct = m.groups()
    entier = re.sub(r"[\u202f\u00a0 ]", ",", entier)
    return avant + entier + ("." + decimales if decimales else "") + ("%" if pct else "")


def main():
    paires = {}
    for f in x.fichiers(None):
        for t in x.analyser(x.lire(os.path.join(x.STATIC, f))):
            textes = [t[1]] if t[0] == "chaine" else (t[1] if t[0] == "gabarit" and len(t[1]) == 1 else [])
            for s in textes:
                if re.search(r"\d", s) and SEUL_NOMBRE.match(s):
                    e = en_anglais(s)
                    if e is not None and e != s and x.cle(s) not in paires:
                        paires[x.cle(s)] = (s, e)
    lignes = ["  " + json.dumps(list(p), ensure_ascii=False) for p in paires.values()]
    sortie = os.path.join(x.STATIC, "en", "dico-nombres.js")
    with open(sortie, "w", encoding="utf-8") as f:
        f.write("// dico-nombres.js : nombres écrits à la française dans les scripts, avec leur forme anglaise.\n")
        f.write("// Fichier généré par tests/en/nombres.py : ne pas modifier à la main.\n")
        f.write("EN_AJOUTER([\n" + ",\n".join(lignes) + "\n]);\n")
    print(sortie, ":", len(lignes), "paires")
    for p in list(paires.values())[:12]:
        print("  ", p)


main()
