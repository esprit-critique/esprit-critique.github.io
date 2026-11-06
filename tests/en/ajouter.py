#!/usr/bin/env python3
"""Ajoute des traductions à static/en/dico-<fichier>.js.

  python3 tests/en/ajouter.py app.js traductions.json

traductions.json : {"identifiant": "texte anglais", …}, les identifiants étant ceux que donne
  python3 tests/en/extraire.py app.js
Le dictionnaire garde les paires déjà écrites ; une paire dont l'identifiant est repris est remplacée.
Le fichier produit contient le français à gauche et l'anglais à droite, une paire par ligne."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extraire as x


def main():
    source, trad = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8"))
    complets, _ = x.extraire(os.path.join(x.STATIC, source))
    par_id = {}
    for _, texte in complets:
        par_id.setdefault(x.identifiant(texte), texte)
    # « =texte français » : paire donnée en toutes lettres (formes que le code construit, comme « notions »)
    for i in [i for i in trad if i.startswith("=")]:
        par_id[i] = i[1:]
    inconnus = [i for i in trad if i not in par_id]
    if inconnus:
        sys.exit("identifiants inconnus : " + ", ".join(inconnus))
    sortie = os.path.join(x.STATIC, "en", "dico-" + os.path.splitext(source)[0] + ".js")
    paires = {}
    if os.path.exists(sortie):
        debut = open(sortie, encoding="utf-8").read()
        for fr, en in json.loads(debut[debut.index("EN_AJOUTER(") + 11:debut.rindex(");")]):
            paires[x.cle(fr)] = (fr, en)
    for i, en in trad.items():
        paires[x.cle(par_id[i])] = (par_id[i], en)
    # ordre du fichier source, puis les paires dont le français n'y figure plus
    ordre = [x.cle(t) for _, t in complets]
    ordre += [x.cle(i[1:]) for i in trad if i.startswith("=")]
    vus, lignes = set(), []
    for c in ordre + [c for c in paires if c not in ordre]:
        if c in paires and c not in vus:
            vus.add(c)
            lignes.append("  " + json.dumps(list(paires[c]), ensure_ascii=False))
    with open(sortie, "w", encoding="utf-8") as f:
        f.write(f"// {os.path.basename(sortie)} : traductions anglaises des textes de {source} (français à gauche, anglais à droite).\n")
        f.write("// Les {0}, {1}… sont remplacés par les valeurs que passe le code : T(\"… {0} …\", valeur).\n")
        f.write("EN_AJOUTER([\n" + ",\n".join(lignes) + "\n]);\n")
    print(sortie, ":", len(lignes), "paires")


main()
