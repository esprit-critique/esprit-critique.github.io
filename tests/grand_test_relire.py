#!/usr/bin/env python3
"""Recopie dans tests/grand-test-a-relire.md la liste de TOUS les contenus du Grand test encore à relire par une
personne (familles d'items, vrai-faux, affirmations d'exposition, grandeurs, angle mort, questions de société,
démonstrations de mémoire, cartes, entités), entre les marqueurs « début » et « fin » des réservoirs. Le reste du
fichier n'est pas touché. À relancer après toute modification de static/grand-test-donnees.js.
python3 tests/grand_test_relire.py"""
import os, re
from grand_test_commun import ICI, executer

FICHIER = os.path.join(ICI, "grand-test-a-relire.md")
DEBUT, FIN = "<!-- début des réservoirs : section générée par tests/grand_test_relire.py -->", "<!-- fin des réservoirs -->"

pilote = r"""
const fam = FAMILLES_GT.map(f => ({ id: f.id, axe: f.axe, construit: f.construit, n: tailleFamille(f), aRelire: f.aRelire !== false, exemple: (() => { const x = instanceGT(f, 0, 1); return x.texte + " " + x.question; })() }));
JSON.stringify({ fam, vf: VF_GT, ex: EXPOSITIONS_GT, gr: GRANDEURS_PAYS_GT.map(([p, k]) => grandeurGT("gr-" + p + "-" + k)), am: ANGLE_MORT_GT, so: SOCIETE_GT,
  drm: LISTES_DRM_GT, recits: RECITS_GT, sources: SOURCES_GT,
  cartes: typeof CARTES_GT === "undefined" ? [] : CARTES_GT, entites: typeof ENTITES_GT === "undefined" ? [] : ENTITES_GT });
"""
R = executer(pilote, ("pays.js", "grand-test-donnees.js", "grand-test.js"))
cellule = lambda t: str(t).replace("|", "/").replace("\n", " ")

L = [DEBUT, "", "## Réservoirs rédigés par IA — chaque ligne est à relire (section générée, ne pas modifier à la main)", "",
     "Drapeau `aRelire` : tant qu'il n'est pas levé dans `static/grand-test-donnees.js` après relecture, l'élément n'est",
     "jamais tiré dans la version publiée. « Ouverte » : la source a été ouverte pendant la rédaction (31 octobre 2026) ;",
     "« non ouverte » : la vérification exacte reste à faire sur la source citée.", ""]

L += ["### Familles d'items générés (" + str(len(R["fam"])) + ")", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
for f in R["fam"]:
    L.append("| " + " | ".join(cellule(c) for c in [f["id"], f["construit"] + " (" + str(f["n"]) + " instances ; exemple : « " + f["exemple"][:160] + "… »)",
             "situations fictives", "Relire le français, la neutralité, l'unicité de la réponse et le leurre de plusieurs instances ; difficulté visée non mesurée", "aRelire" if f["aRelire"] else "relue", ""]) + " |")

L += ["", "### Vrai ou faux (" + str(len(R["vf"])) + ")", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
for x in R["vf"]:
    verif = ("Source ouverte (données du site)" if x.get("sourceOuverte") else "Ouvrir la source et vérifier le fait")
    if not x["vrai"]:
        verif += " ; diffusion : " + ("enquête ouverte" if x.get("diffusionOuverte") else "à vérifier ou à documenter") + " (" + x.get("diffusion", "") + ")"
    L.append("| " + " | ".join(cellule(c) for c in [x["id"], ("VRAI : " if x["vrai"] else "FAUX : ") + x["texte"], x["source"], verif, "aRelire", ""]) + " |")

L += ["", "### Affirmations d'exposition, vérité illusoire (" + str(len(R["ex"])) + ")", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
for i, d, v, t in R["ex"]:
    src = "CNRTL (étymologie)" if d == "mots" else "atlas, encyclopédie" if d == "lieux" else "encyclopédie de zoologie"
    L.append("| " + " | ".join(cellule(c) for c in [i, ("VRAI : " if v else "FAUX : ") + t, src, "Vérifier le fait ; vérifier qu'une fausse affirmation reste anodine", "aRelire", ""]) + " |")

L += ["", "### Grandeurs des fourchettes (" + str(len(R["gr"])) + ")", "",
      "Valeurs calculées à l'affichage depuis `static/pays.js` (Banque mondiale, API, données d'octobre 2026). À relire : le",
      "libellé de la question et le choix de l'unité, pas les chiffres, déjà publiés par le site.", ""]

L += ["", "### Angle mort (" + str(len(R["am"])) + ")", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
for i, fiche, t in R["am"]:
    L.append("| " + " | ".join(cellule(c) for c in [i, t, "méthode inspirée de Scopelliti et al. (2015), non normée", "Description fidèle au biais (" + fiche + ") sans le nommer ; formulation neutre", "aRelire", ""]) + " |")

L += ["", "### Questions de société (" + str(len(R["so"])) + ")", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
for q in R["so"]:
    L.append("| " + " | ".join(cellule(c) for c in [q[0], q[1] + " — faibles : « " + q[3] + " » (" + q[4] + ") ; « " + q[6] + " » (" + q[7] + ")", "aucune (arguments sans données)",
             "Neutralité ; arguments solides de force comparable ; sophismes bien identifiés ; sujet peu clivant", "aRelire", ""]) + " |")

L += ["", "### Démonstrations de mémoire", "",
      "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|",
      "| m-drm | " + str(len(R["drm"])) + " listes de mots associés, originales en français (mots critiques : " + ", ".join(l[0] for l in R["drm"]) + ") | paradigme de Roediger et McDermott (1995), aucune norme française connue | Force d'association de chaque liste avec son mot critique ; démonstration non normative | aRelire | |",
      "| m-desinformation | " + str(len(R["recits"])) + " récits neutres, couleur suggérée par une question ultérieure | paradigme de Loftus (étude précise à choisir) | Scènes anodines, sans enjeu ni sujet traumatique ; correction annoncée et faite | aRelire | |",
      "| m-source | " + str(len(R["sources"])) + " jeux de 6 informations d'un village fictif, 4 répartitions entre deux sources | aucune | Informations clairement fictives ; sources fictives | aRelire | |"]

if R["cartes"]:
    L += ["", "### Cartes de sensibilisation (" + str(len(R["cartes"])) + ")", "",
          "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|"]
    for c in R["cartes"]:
        L.append("| " + " | ".join(cellule(x) for x in [c["id"], c["texte"] + " (statut : " + c["statut"] + ")", c["source"] + " (" + c["date"] + ")",
                 ("Source ouverte ; relire la formulation" if c.get("sourceOuverte") else "Ouvrir la source et vérifier chaque chiffre") + " ; limite : " + c["limite"], "aRelire", ""]) + " |")
if R["entites"]:
    L += ["", "### Entités pédagogiques et niveaux (cachés)", "",
          "| ID | affirmation ou décision | source | vérification exacte | drapeau | personne-date |", "|---|---|---|---|---|---|",
          "| entites | " + str(len(R["entites"])) + " noms : " + cellule(", ".join(e[1] for e in R["entites"])) + " | aucune | Chaque nom est une métaphore du mécanisme, sans jugement sur la personne ; relecture de la charte (DESIGN.md) | aRelire | |",
          "| niveaux | Cinq niveaux inspirés de la caverne de Platon ; seuils proportion 0,40/0,50/0,60/0,70, d′ 0,25/0,5/0,75/1,0 | règle fixée dans grand-test.js | Pertinence des seuils, formulation, texte obligatoire | aRelire | |"]
L += ["", FIN]

texte = open(FICHIER, encoding="utf-8").read()
if DEBUT in texte:
    texte = texte[:texte.index(DEBUT)] + "\n".join(L) + texte[texte.index(FIN) + len(FIN):]
else:
    texte = texte.rstrip("\n") + "\n\n" + "\n".join(L) + "\n"
open(FICHIER, "w", encoding="utf-8").write(texte)
print(str(len(R["fam"]) + len(R["vf"]) + len(R["ex"]) + len(R["am"]) + len(R["so"]) + 3 + len(R["cartes"]) + (2 if R["entites"] else 0)) + " lignes à relire inscrites dans " + os.path.basename(FICHIER))
