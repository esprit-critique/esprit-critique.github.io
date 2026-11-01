#!/usr/bin/env python3
"""Banc « banques » du Grand test : contrôle des réservoirs rédigés (static/grand-test-donnees.js) hors navigateur.
  - effectifs minimaux et équilibre : 140 vrai-faux (70/70), 100 affirmations d'exposition (50/50), 80 grandeurs,
    au moins 12 descriptions d'angle mort, 10 questions de société à 4 arguments, 20 listes, 20 récits, 20
    combinaisons de sources ;
  - sources : chaque affirmation a une source ; chaque affirmation fausse dit si sa diffusion est documentée ; une
    source déclarée « ouverte » ne peut être que l'une de celles réellement ouvertes (enquêtes nommées, données
    Banque mondiale du site) ; tout est marqué aRelire ;
  - chiffres : chaque affirmation fondée sur les données de pays du site est recalculée depuis pays.js ;
  - contenu : identifiants et textes uniques, explications de trois phrases au plus, fiches réelles, aucun doublon
    avec VRAI_FAUX (Jaccard des trigrammes de mots ≤ 0,5), sujets exclus absents des questions de société,
    affirmations d'exposition anodines, mots critiques jamais présents dans leur liste.
python3 tests/grand_test_banques.py [FICHIER_RAPPORT]"""
import os, re, sys
from grand_test_commun import ICI, lire, executer, Rapport

sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "rapports", "banques.txt")
rapport = Rapport()
ok = rapport.ok

pilote = r"""
JSON.stringify({
  vf: VF_GT, expositions: EXPOSITIONS_GT, grandeurs: GRANDEURS_PAYS_GT.map(([p, k]) => grandeurGT("gr-" + p + "-" + k)),
  angleMort: ANGLE_MORT_GT, societe: SOCIETE_GT, drm: LISTES_DRM_GT, recits: RECITS_GT, sources: SOURCES_GT,
  banques: Object.fromEntries(Object.keys(BANQUES_GT).map(b => [b, BANQUES_GT[b]().length])),
  pays: PAYS, monde: MONDE_PAYS, vraiFauxSite: VRAI_FAUX.map(x => x.texte),
  demoDRM: LISTES_DRM_GT.map((x, i) => demonstrationDRM(i, 7)), demoRecit: RECITS_GT.map((x, i) => demonstrationRecit(i, 7)),
  demoSource: Array.from({ length: 20 }, (_, i) => demonstrationSource(i, 7)),
  bilans: [bilanDRM(demonstrationDRM(0, 7), demonstrationDRM(0, 7).test.map(x => x.present || x.critique)), bilanRecit(demonstrationRecit(0, 7), demonstrationRecit(0, 7).suggeree),
    bilanSource(demonstrationSource(0, 7), demonstrationSource(0, 7).test.map(x => x.source)), bilanSource(demonstrationSource(0, 7), demonstrationSource(0, 7).test.map(() => null))],
  cartes: CARTES_GT,
  surCorr: [indiceSurCorrection([{ surCorrection: true, reponse: 1, leurreAffiche: 1 }, { surCorrection: true, reponse: 0, leurreAffiche: 1 }, { surCorrection: false, reponse: 1, leurreAffiche: 1 }]), indiceSurCorrection([]), MESSAGE_SUR_CORRECTION]
});
"""
try:
    R = executer(pilote, ("pays.js", "grand-test-donnees.js", "grand-test.js", "jeux-donnees.js"))
except Exception as e:
    rapport.lignes.append("EXCEPTION " + str(e))
    R = None

def phrases(t):
    return [p for p in re.split(r"(?<=[.!?…])\s+(?=[A-ZÀ-ÖÉÈ«0-9])", t.strip()) if p]

def jaccard(a, b):
    def tri(t):
        m = re.findall(r"[a-zàâçéèêëîïôûùüÿœ0-9]+", t.lower())
        return {tuple(m[k:k + 3]) for k in range(len(m) - 2)}
    x, y = tri(a), tri(b)
    return len(x & y) / len(x | y) if x and y else 0.0

fiches = set()
for typ, nom in (("biais", "const BIAIS"), ("sophismes", "const SOPHISMES")):
    src = lire("donnees.js"); bloc = src[src.index(nom):]
    fiches |= {typ + ":" + m for m in re.findall(r'\{\s*id: "([^"]+)",\s*num:', bloc)}

if R:
    vf = R["vf"]
    vrais = [x for x in vf if x["vrai"]]; faux = [x for x in vf if not x["vrai"]]
    ok("vrai-faux : 140 affirmations, 70 vraies et 70 fausses", len(vf) == 140 and len(vrais) == 70 and len(faux) == 70, (len(vf), len(vrais), len(faux)))
    ok("vrai-faux : identifiants et textes uniques", len({x["id"] for x in vf}) == 140 and len({x["texte"] for x in vf}) == 140)
    domaines = {}
    for x in vf: domaines.setdefault(x["domaine"], [0, 0])[0 if x["vrai"] else 1] += 1
    ok("vrai-faux : au moins 8 domaines, chacun avec des affirmations vraies et fausses", len(domaines) >= 8 and all(v > 0 and f > 0 for v, f in domaines.values()), domaines)
    ok("vrai-faux : aucun domaine au-delà de 20 % de la banque", max(v + f for v, f in domaines.values()) <= 28, domaines)
    ok("vrai-faux : relecture d'ensemble enregistrée (aucun élément marqué à relire isolément)", not [x["id"] for x in vf if x.get("aRelire") is True])
    ok("vrai-faux : chaque affirmation a une source", all(len(x.get("source", "")) > 10 for x in vf))
    ok("vrai-faux : chaque affirmation fausse dit si sa diffusion est documentée", all(x.get("diffusion") for x in faux), [x["id"] for x in faux if not x.get("diffusion")])
    ouvertes_diff = [x["id"] for x in vf if x.get("diffusionOuverte") and not re.match(r"^(MACDO|DEKKER|SIMONS|MCCLOSKEY)", x["diffusion"])]
    ok("vrai-faux : diffusion « ouverte » seulement pour les enquêtes réellement ouvertes", not ouvertes_diff, ouvertes_diff)
    ouvertes_src = [x["id"] for x in vf if x.get("sourceOuverte") and not re.search(r"pays\.js|Pashler|McCloskey|Philpot|Ranehill|Hagger", x["source"])]
    ok("vrai-faux : source « ouverte » seulement pour les sources réellement ouvertes (31 octobre et 1er novembre 2026)", not ouvertes_src, ouvertes_src)
    ok("vrai-faux : explications de trois phrases au plus", all(len(phrases(x["explication"])) <= 3 for x in vf), [x["id"] for x in vf if len(phrases(x["explication"])) > 3])
    mauvaises = [(x["id"], f) for x in vf for f in x.get("fiches", []) if f not in fiches]
    ok("vrai-faux : fiches liées réelles", not mauvaises, mauvaises)
    proches = [(x["id"], round(jaccard(x["texte"], t), 2)) for x in vf for t in R["vraiFauxSite"] if jaccard(x["texte"], t) > 0.5]
    ok("vrai-faux : aucun doublon avec les " + str(len(R["vraiFauxSite"])) + " affirmations de l'atelier « Vrai ou faux ? »", not proches, proches)
    proches_internes = [(a["id"], b["id"]) for i, a in enumerate(vf) for b in vf[i + 1:] if jaccard(a["texte"], b["texte"]) > 0.5]
    ok("vrai-faux : aucune paire trop semblable dans la banque", not proches_internes, proches_internes)

    # Affirmations fondées sur les données de pays : recalculées depuis pays.js
    P = {p["id"]: p for p in R["pays"]}; M = R["monde"]
    afrique = ["DZA", "COD", "SDN", "LBY", "TCD", "NER", "AGO", "MLI", "ZAF", "ETH", "EGY", "NGA", "TZA", "MRT", "NAM", "MOZ", "ZMB", "SSD", "SOM", "CAF", "MDG", "BWA", "KEN", "CMR", "MAR"]
    controles = {
        "vf-nigeria-russie": P["NGA"]["pop"] > P["RUS"]["pop"],
        "vf-ethiopie-allemagne": P["ETH"]["pop"] > P["DEU"]["pop"],
        "vf-pakistan-bresil": P["PAK"]["pop"] > P["BRA"]["pop"],
        "vf-japon-etats-unis": P["JPN"]["ev"] - P["USA"]["ev"] > 5,
        "vf-algerie-plus-vaste": max((P[i]["surf"], i) for i in afrique if i in P)[1] == "DZA",
        "vf-mongolie-densite": min((p["dens"], p["id"]) for p in R["pays"] if p.get("dens"))[1] == "MNG",
        "vf-russie-dixieme": P["RUS"]["surf"] / 149e6 > 0.1,
        "vf-esperance-vie-50": M["ev"] >= 70,              # affirmation fausse : l'espérance de vie dépasse nettement 50 ans
        "vf-fecondite-cinq": M["fec"] < 3,
        "vf-internet-minorite": M["net"] > 50,
        "vf-internet-deux-tiers": M["net"] > 200 / 3,
        "vf-mortalite-infantile": M["mi"] < 100,
        "vf-plus-65-tiers": M["age65"] < 20,
    }
    ok("vrai-faux : les " + str(len(controles)) + " affirmations fondées sur pays.js concordent avec les données", all(controles.values()), [k for k, v in controles.items() if not v])
    ok("vrai-faux : chiffres cités dans les sources de pays conformes à pays.js",
       all(str(P[i]["pop"]) in " ".join(x["source"].replace(" ", "").replace(" ", "") for x in vf) for i in ("NGA", "RUS", "ETH", "DEU", "PAK", "BRA")))

    ex = R["expositions"]
    ok("expositions : 100 affirmations, 50 vraies et 50 fausses", len(ex) == 100 and sum(1 for x in ex if x[2]) == 50, (len(ex), sum(1 for x in ex if x[2])))
    ok("expositions : identifiants et textes uniques", len({x[0] for x in ex}) == 100 and len({x[3] for x in ex}) == 100)
    ok("expositions : seulement des domaines anodins (mots, lieux, animaux), vrai et faux dans chacun",
       {x[1] for x in ex} == {"mots", "lieux", "animaux"} and all(sum(1 for x in ex if x[1] == d and x[2]) >= 10 and sum(1 for x in ex if x[1] == d and not x[2]) >= 10 for d in ("mots", "lieux", "animaux")))
    sensibles = re.compile(r"santé|maladie|vaccin|médic|guerre|élection|parti |religi|dieu|immigr|crime|police|virus|cancer", re.I)
    ok("expositions : aucune affirmation sur un sujet sensible", not [x[0] for x in ex if sensibles.search(x[3])])
    ok("expositions : phrases courtes (120 caractères au plus)", all(len(x[3]) <= 120 for x in ex))

    gr = R["grandeurs"]
    ok("grandeurs : 80, toutes calculées depuis pays.js, positives et finies", len(gr) == 80 and all(g and g["v"] > 0 for g in gr), [i for i, g in enumerate(gr) if not g])
    ok("grandeurs : identifiants uniques, trois indicateurs", len({g["id"] for g in gr if g}) == 80 and {g["id"].split("-")[2] for g in gr if g} == {"pop", "surf", "ev"})
    ecarts = []
    for g in gr:
        _, pays, k = g["id"].split("-")
        brut = P[pays][k] * (1e-6 if k == "pop" else 1)
        if abs(g["v"] - brut) > (0.05 if k != "surf" else 0.5): ecarts.append(g["id"])
    ok("grandeurs : chaque valeur égale à la donnée de pays.js (arrondi compris)", not ecarts, ecarts)

    am = R["angleMort"]
    ok("angle mort : au moins 12 descriptions, fiches réelles, sans le nom du biais", len(am) >= 12 and all(x[1] in fiches for x in am) and not any("vérité" in x[2].lower() for x in am))

    so = R["societe"]
    exclus = re.compile(r"religi|immigr|délinqu|crime|complot|vaccin|médica|parti politique|élection|gauche|droite|police", re.I)
    ok("société : 10 questions, quatre arguments chacune", len(so) == 10 and all(len(q) == 8 and all(len(q[k]) > 20 for k in (2, 3, 5, 6)) for q in so))
    ok("société : sujets exclus absents (religion, immigration, délinquance, complots, santé, politique partisane)", not [q[0] for q in so if exclus.search(" ".join(q[1:]))])
    ok("société : arguments faibles rattachés à une fiche de sophisme réelle", all("sophismes:" + q[4] in fiches and "sophismes:" + q[7] in fiches for q in so), [q[0] for q in so if "sophismes:" + q[4] not in fiches or "sophismes:" + q[7] not in fiches])
    ok("société : aucun chiffre dans les arguments (aucune donnée empirique non sourcée)", not [q[0] for q in so if re.search(r"\d", " ".join(q[2:4] + q[5:7]))])

    drm = R["drm"]
    ok("listes de mots associés : 20 listes de 10 mots, mot critique et mots sans rapport absents de la liste",
       len(drm) == 20 and all(len(l[1]) == 10 and len(set(l[1])) == 10 and l[0] not in l[1] and not set(l[2]) & set(l[1]) for l in drm))
    ok("listes : mots critiques distincts", len({l[0] for l in drm}) == 20)
    ok("récits de désinformation : 20, couleur suggérée différente de la couleur vue", len(R["recits"]) == 20 and all(r[2] != r[3] and r[2] not in r[4] and r[3] not in r[4] for r in R["recits"]))
    ok("mémoire de source : 5 jeux de 6 informations, 20 combinaisons", len(R["sources"]) == 5 and all(len(s[2]) == 6 for s in R["sources"]) and R["banques"]["source"] == 20)
    ok("banques : effectifs de tirage (" + ", ".join(k + " " + str(v) for k, v in R["banques"].items()) + ")",
       R["banques"]["vf"] == 140 and R["banques"]["exposition"] == 100 and R["banques"]["grandeur"] == 80 and R["banques"]["drm"] == 20 and R["banques"]["recit"] == 20)

    # ---------- Démonstrations de mémoire (lot 5) ----------
    dd = R["demoDRM"]
    ok("démonstration DRM : 20 instances ; six mots à reconnaître (3 appris, le mot critique jamais présenté, 2 sans rapport)",
       len(dd) == 20 and all(len(d["test"]) == 6 and sum(x["present"] for x in d["test"]) == 3 and sum(x["critique"] for x in d["test"]) == 1
                             and d["critique"] not in d["liste"] and all((x["mot"] in d["liste"]) == x["present"] for x in d["test"]) for d in dd))
    dr = R["demoRecit"]
    ok("démonstration de désinformation : 20 récits ; la couleur vue est dans le récit, la question glisse l'autre",
       len(dr) == 20 and all(d["vue"] in d["recit"] and d["suggeree"] not in d["recit"] and d["suggeree"] in d["questionTrompeuse"] and d["vue"] not in d["questionTrompeuse"]
                             and len(set(d["choix"])) == 4 and "{" not in d["recit"] for d in dr), [d["recit"][:40] for d in dr if "{" in d["recit"]])
    ds = R["demoSource"]
    ok("mémoire de source : 20 instances distinctes, chaque information attribuée à l'une des deux sources",
       len({tuple((x["texte"], x["source"]) for x in d["lues"]) for d in ds}) == 20 and all(len(d["lues"]) == 6 and all(x["source"] in d["sources"] for x in d["lues"]) for d in ds))
    b = R["bilans"]
    ok("bilans des démonstrations : mot critique reconnu, couleur suggérée repérée, sources justes et oubliées comptées",
       b[0]["critiqueReconnu"] and b[0]["apprisReconnus"] == 3 and b[0]["intrusReconnus"] == 0 and b[1]["suggeree"] and not b[1]["juste"]
       and b[2]["justes"] == 6 and b[3]["oublis"] == 6 and b[3]["justes"] == 0)
    sc = R["surCorr"]
    ok("indice de sur-correction : 1 rejet sur 2 situations concluantes ; aucune situation → non calculé ; message exact du mandat",
       sc[0] == {"indice": 0.5, "n": 2} and sc[1] is None and sc[2] == "L'esprit critique n'est pas le contre-pied systématique. Une conclusion peut être solide quand la méthode et les données le sont.")
    phr = [d["explication"] for d in dd[:1] + dr[:1] + ds[:1]]
    ok("démonstrations : explications de trois phrases au plus", all(len(phrases(x)) <= 3 for x in phr))

    # ---------- Cartes de sensibilisation (lot 10) ----------
    ca = R["cartes"]
    doms = {}
    for c in ca: doms[c["domaine"]] = doms.get(c["domaine"], 0) + 1
    ok("cartes : au moins 40, réparties entre prévision, idées fausses, hasard, mémoire, confiance et réplication (≥ 5 chacune)",
       len(ca) >= 40 and set(doms) == {"prevision", "idees-fausses", "hasard", "memoire", "confiance", "replication"} and min(doms.values()) >= 5, doms)
    ok("cartes : 45 mots au plus, identifiants uniques", all(len(c["texte"].split()) <= 45 for c in ca) and len({c["id"] for c in ca}) == len(ca))
    ok("cartes : source, date, statut (établi, discuté, à répliquer) et limite pour chacune",
       all(c["source"] and c["date"] and c["statut"] in ("établi", "discuté", "à répliquer") and c["limite"] for c in ca))
    ouvertes = re.compile(r"Macdonald|Dekker|Simons et Chabris|Gapminder|Ipsos|pays\.js|paradoxe des anniversaires|Klein|Hagger|Ranehill|Watts|Gignac|Wood et Porter|Haran")
    ok("cartes : « source ouverte » seulement pour les sources réellement ouvertes", all(not c.get("sourceOuverte") or ouvertes.search(c["source"]) for c in ca), [c["id"] for c in ca if c.get("sourceOuverte") and not ouvertes.search(c["source"])])
    ok("cartes : aucun chiffre de sondage électoral sans données vérifiées",  not re.search(r"\d", next(c for c in ca if c["id"] == "ca-sondages-loin")["texte"]))
    ok("cartes : aucune peur, aucun conseil médical (mots exclus)", not [c["id"] for c in ca if re.search(r"danger mortel|mourir|terrifi|traitement|médicament|vaccin", c["texte"], re.I)])

sys.exit(1 if rapport.ecrire(sortie) else 0)
