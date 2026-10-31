#!/usr/bin/env python3
"""Banc « familles » du Grand test : génère TOUTES les instances de toutes les familles (static/grand-test-donnees.js,
générateurs de static/grand-test.js) hors navigateur, et les vérifie contre un oracle écrit à part, ici :
  - intégrité : au moins 20 instances par famille, textes distincts, aucun reste de gabarit, choix distincts,
    bonne réponse unique et différente du leurre, explications de trois phrases au plus, fiches et ateliers réels ;
  - résolution indépendante : chaque réponse est recalculée en Python à partir des valeurs (moyenne harmonique,
    Bayes, binomiale, Monty Hall par énumération…) ; la validité des raisonnements est jugée en relisant le texte
    produit et en énumérant tous les modèles d'ensembles ; leur crédibilité, d'après la taxonomie ;
  - non-reprise : similarité de Jaccard sur les trigrammes de mots contre les textes des banques du site (> 0,5 :
    revue) et entre familles ;
  - tirage : 20 tests consécutifs, plusieurs graines, complet et express : pas de répétition avant trois tests,
    une instance par famille, quotas, équilibre des formes, compteur de déjà-vus exact, reproductibilité, position
    de la bonne réponse équilibrée.
python3 tests/grand_test_familles.py [FICHIER_RAPPORT]"""
import itertools, json, math, os, re, sys
from fractions import Fraction
from grand_test_commun import ICI, STATIC, lire, executer, Rapport

sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "rapports", "familles.txt")
rapport = Rapport()
ok = rapport.ok

pilote = r"""
const R = { familles: [], taxonomie: TAXONOMIE_GT };
FAMILLES_GT.forEach(f => {
  const n = tailleFamille(f), instances = [];
  for (let i = 0; i < n; i++) {
    const x = instanceGT(f, i, 12345);
    instances.push({ i, type: x.type, texte: x.texte, question: x.question, choix: x.choix, juste: x.juste, leurre: x.leurre, unite: x.unite || null,
      valeurs: x.valeurs, explication: x.explication, justeAffiche: x.justeAffiche, leurreAffiche: x.leurreAffiche, choixAffiches: x.choixAffiches, credible: x.credible });
  }
  R.familles.push({ id: f.id, axe: f.axe, type: f.type, generer: f.generer, forme: f.forme || null, valide: f.valide, credible: f.credible,
    difficulte: f.difficulte, fiches: f.fiches, ateliers: f.ateliers, aRelire: f.aRelire, surCorrection: !!f.surCorrection,
    nombres: f.nombres || null, surfaces: surfacesDe(f) || null, taille: n, instances });
});
// Tirage : 20 tests consécutifs pour chaque graine et chaque mode
R.simulations = [];
[[1, "complet"], [77, "complet"], [2026, "express"], [9, "express"]].forEach(([g0, mode]) => {
  let etat = etatGrandTestVide();
  const tests = [];
  for (let t = 0; t < 20; t++) {
    const graine = (g0 * 1000 + t) >>> 0;
    const p = tirerPassation(etat, mode, graine);
    const debut = new Date(Date.UTC(2026, 0, 1 + 2 * t, 10)).toISOString(), fin = new Date(Date.UTC(2026, 0, 1 + 2 * t, 11)).toISOString();
    const c = commencerPassation(etat, mode, graine, p.instances, debut);
    etat = terminerPassation(c.etat, fin).etat;
    tests.push({ instances: p.instances, issues: p.issues, positions: p.instances.filter(x => familleGT(x.famille).type === "qcm").map(x => instanceGT(familleGT(x.famille), x.valeurs.i, graine).justeAffiche) });
  }
  R.simulations.push({ graine: g0, mode, tests, valide: grandTestValide(etat) });
});
const a = tirerPassation(etatGrandTestVide(), "complet", 5), b = tirerPassation(etatGrandTestVide(), "complet", 5), c = tirerPassation(etatGrandTestVide(), "complet", 6);
R.reproductible = JSON.stringify(a) === JSON.stringify(b);
R.variable = JSON.stringify(a.instances) !== JSON.stringify(c.instances);
R.memeGraineMemeTexte = JSON.stringify(instanceGT(familleGT("b-esperance"), 3, 8)) === JSON.stringify(instanceGT(familleGT("b-esperance"), 3, 8));
// Version publiée (GRAND_TEST_ESSAI à false) : aucun contenu à relire n'est tiré
R.publiables = FAMILLES_GT.filter(f => f.aRelire === false).length;
JSON.stringify(R);
"""

try:
    R = executer(pilote, ("grand-test-donnees.js", "grand-test.js"))
    R_publie = executer("JSON.stringify({ n: tirerPassation(etatGrandTestVide(), 'complet', 3).instances.length, issues: tirerPassation(etatGrandTestVide(), 'complet', 3).issues.length });",
                        ("grand-test-donnees.js", "grand-test.js"), essai=False)
except Exception as e:
    rapport.lignes.append("EXCEPTION " + str(e))
    R = None

# ===================== Références réelles du site =====================
ids_fiches = set()
for typ, nom in (("biais", "const BIAIS"), ("sophismes", "const SOPHISMES")):
    src = lire("donnees.js")
    bloc = src[src.index(nom):]
    bloc = bloc[:bloc.index("\nconst ", 10)] if "\nconst " in bloc[10:] else bloc
    ids_fiches |= {typ + ":" + m for m in re.findall(r'\{\s*id: "([^"]+)",\s*num:', bloc)}
ateliers = set()
for f in ("chiffres.js", "perception.js", "experiences.js", "raisonner.js", "pratiques.js", "debattre.js"):
    src = lire(f)
    for m in re.finditer(r'\{\s*\n?\s*id: "([^"]+)",\s*\n\s*section: "([^"]+)"', src):
        # Un atelier de JEUX s'ouvre en #chiffres/…, une expérience en #tests/… (selon le tableau qui le reçoit)
        jeu = src.rfind("JEUX", 0, m.start()) > src.rfind("EXPERIENCES", 0, m.start())
        ateliers.add(("#chiffres/" if jeu else "#tests/") + m.group(1))

# ===================== Oracle =====================
def phrases(t):
    return [p for p in re.split(r"(?<=[.!?…])\s+(?=[A-ZÀ-ÖÉÈ«0-9])", t.strip()) if p]

def solde(t):
    return not re.search(r"\{[A-Za-z]+\}|undefined|NaN|null|\[object|Infinity", t)

def fr_nombre(x):
    """Lecture d'un nombre à la française (espace fine, virgule) dans un texte de choix."""
    m = re.search(r"[−-]?\d[\d   ]*(?:,\d+)?", x)
    return None if not m else float(m.group(0).replace(" ", "").replace(" ", "").replace(" ", "").replace(",", ".").replace("−", "-"))

# Taxonomie : appartenances du sens courant
def taxo(T):
    parent = {}
    for g in T:
        for s in g["sous"]:
            parent[s["b"][0]] = g["c"][0]
            for m in s["membres"]:
                parent[m[0]] = s["b"][0]
    def ancetres(x):
        r = {x}
        while x in parent:
            x = parent[x]; r.add(x)
        return r
    return ancetres

def vrai_tous(anc, x, y): return y in anc(x)
def vrai_jamais(anc, x, y): return y not in anc(x) and x not in anc(y)
def vrai_certains(anc, x, y): return y in anc(x) or x in anc(y)

MOTIFS = [(re.compile(r"^(?:Donc )?[Tt]ou(?:te)?s les (.+?) sont des (.+?)\.$"), "tous"),
          (re.compile(r"^(?:Donc )?[Ll]es (.+?) ne sont jamais des (.+?)\.$"), "jamais"),
          (re.compile(r"^(?:Donc )?[Cc]ertain(?:e)?s (.+?) sont des (.+?)\.$"), "certains")]

def lire_enonce(p):
    for motif, sorte in MOTIFS:
        m = motif.match(p)
        if m: return sorte, m.group(1), m.group(2)
    return None

def valide_par_modeles(premisses, conclusion):
    """Énumère tous les modèles de trois ensembles non vides (régions occupées parmi 8) : valide si la conclusion
    est vraie dans tous les modèles où les prémisses le sont."""
    termes = sorted({t for _, x, y in premisses + [conclusion] for t in (x, y)})
    if len(termes) > 3: return None
    regions = list(itertools.product([0, 1], repeat=len(termes)))
    def vrai(enonce, occupees):
        sorte, x, y = enonce
        ix, iy = termes.index(x), termes.index(y)
        if sorte == "tous": return not any(r[ix] and not r[iy] for r in occupees)
        if sorte == "jamais": return not any(r[ix] and r[iy] for r in occupees)
        return any(r[ix] and r[iy] for r in occupees)
    for masque in range(1, 2 ** len(regions)):
        occupees = [r for k, r in enumerate(regions) if masque >> k & 1]
        if not all(any(r[k] for r in occupees) for k in range(len(termes))): continue   # termes non vides
        if all(vrai(p, occupees) for p in premisses) and not vrai(conclusion, occupees): return False
    return True

def verite(anc, enonce):
    sorte, x, y = enonce
    return {"tous": vrai_tous, "jamais": vrai_jamais, "certains": vrai_certains}[sorte](anc, x, y)

def binom_queue(n, p, seuil):
    k0 = math.floor(n * seuil / 100) + 1
    return sum(math.comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(k0, n + 1))

def monty_ignorant(n):
    """Énumération exacte : lot uniforme, vous prenez la porte 0, une autre porte ouverte au hasard, vide.
    Probabilité que le lot soit derrière une porte fermée précise (autre que la vôtre)."""
    total, vous, autre = Fraction(0), Fraction(0), Fraction(0)
    for lot in range(n):
        for ouverte in range(1, n):
            p = Fraction(1, n) * Fraction(1, n - 1)
            if ouverte == lot: continue
            total += p
            if lot == 0: vous += p
            restante = 1 if ouverte != 1 else 2
            if lot == restante: autre += p
    return vous / total, autre / total

def jaccard(a, b):
    def tri(t):
        m = re.findall(r"[a-zàâçéèêëîïôûùüÿœ0-9]+", t.lower())
        return {tuple(m[k:k + 3]) for k in range(len(m) - 2)}
    x, y = tri(a), tri(b)
    return len(x & y) / len(x | y) if x and y else 0.0

if R:
    T = R["taxonomie"]; anc = taxo(T)
    familles = R["familles"]
    ok(str(len(familles)) + " familles, toutes avec au moins 20 instances", all(f["taille"] >= 20 for f in familles), [(f["id"], f["taille"]) for f in familles if f["taille"] < 20])
    ok("au moins 12 familles marquées pour les pièges avancés (sur-correction, lecture fine, dénominateur, unités…)",
       len([f for f in familles if f["surCorrection"] or f["id"] in ("a-portee-negation", "a-presuppose", "a-relations", "a-seulement-si", "b-denominateur", "b-unites", "b-points-pourcents")]) >= 11)
    ok("identifiants de familles uniques", len({f["id"] for f in familles}) == len(familles))
    ok("toutes les familles écrites par IA portent aRelire: true", all(f["aRelire"] is True for f in familles))
    mauvaises_fiches = [(f["id"], x) for f in familles for x in f["fiches"] if x not in ids_fiches]
    ok("fiches liées : toutes existent dans donnees.js (" + str(len(ids_fiches)) + " fiches)", not mauvaises_fiches and len(ids_fiches) == 90, mauvaises_fiches)
    mauvais_ateliers = [(f["id"], x) for f in familles for x in f["ateliers"] if x not in ateliers]
    ok("ateliers liés : tous existent (" + str(len(ateliers)) + " ateliers relevés)", not mauvais_ateliers and len(ateliers) == 45, mauvais_ateliers)

    pb_texte, pb_choix, pb_phrases, pb_doublons, pb_oracle = [], [], [], [], []
    for f in familles:
        textes = set()
        for x in f["instances"]:
            ident = f["id"] + "@" + str(x["i"])
            tout = " ".join([x["texte"], x["question"], x["explication"]] + (x.get("choix") or []))
            if not solde(tout): pb_texte.append(ident)
            textes.add(x["texte"] + "|" + x["question"])
            if len(phrases(x["explication"])) > 3: pb_phrases.append((ident, len(phrases(x["explication"]))))
            if x["type"] == "qcm":
                if len(x["choix"]) != 4 or len(set(x["choix"])) != 4 or x["leurre"] is None or x["juste"] == x["leurre"]: pb_choix.append(ident)
                if sorted(x["choixAffiches"]) != sorted(x["choix"]) or x["choixAffiches"][x["justeAffiche"]] != x["choix"][x["juste"]]: pb_choix.append(ident + " (ordre)")
            if x["type"] == "calcul" and (x["juste"] == x["leurre"] or not isinstance(x["juste"], (int, float))): pb_choix.append(ident)
        if len(textes) != f["taille"]: pb_doublons.append(f["id"])
    ok("aucun reste de gabarit ni valeur indéfinie dans les textes", not pb_texte, pb_texte[:8])
    ok("choix distincts, bonne réponse unique et différente du leurre, ordre affiché cohérent", not pb_choix, pb_choix[:8])
    ok("explications de trois phrases au plus", not pb_phrases, pb_phrases[:8])
    ok("instances distinctes de surface dans chaque famille", not pb_doublons, pb_doublons)

    def verifier(fid, test):
        f = next(f for f in familles if f["id"] == fid)
        fautes = []
        for x in f["instances"]:
            try:
                if not test(f, x): fautes.append(x["i"])
            except Exception as e:
                fautes.append(str(x["i"]) + " : " + str(e))
        ok("oracle " + fid + " (" + str(f["taille"]) + " instances)", not fautes, fautes[:6])

    verifier("a-vitesse", lambda f, x: x["juste"] == 2 * x["valeurs"]["a"] * x["valeurs"]["b"] / (x["valeurs"]["a"] + x["valeurs"]["b"]) and x["juste"] == int(x["juste"])
             and x["leurre"] == (x["valeurs"]["a"] + x["valeurs"]["b"]) / 2 and max(x["valeurs"].values()) <= 130)
    verifier("a-hausse-baisse", lambda f, x: abs(x["juste"] - x["valeurs"]["base"] * (1 + x["valeurs"]["p"] / 100) * (1 - x["valeurs"]["p"] / 100)) < 1e-9 and x["juste"] == int(x["juste"]) and x["leurre"] == x["valeurs"]["base"])
    verifier("a-intervalles", lambda f, x: x["valeurs"]["longueur"] % x["valeurs"]["pas"] == 0 and x["juste"] == x["valeurs"]["longueur"] // x["valeurs"]["pas"] + 1 and 6 <= x["leurre"] <= 30)
    verifier("a-moyenne-ponderee", lambda f, x: (lambda v: x["juste"] == (v["n1"] * v["m1"] + v["n2"] * v["m2"]) / (v["n1"] + v["n2"]) and x["juste"] == int(x["juste"]) and x["leurre"] == (v["m1"] + v["m2"]) / 2)(x["valeurs"]))
    verifier("a-portee-negation", lambda f, x: x["choix"][x["juste"]].startswith("Au moins") and x["choix"][x["leurre"]].startswith("Aucun"))
    verifier("a-presuppose", lambda f, x: "ne dit pas que" in x["choix"][x["juste"]] and x["choix"][x["leurre"]] == f["surfaces"][x["i"]][3][0])
    def relations(f, x):
        adj = f["surfaces"][x["i"]]
        m = re.match(r"^(\S+) est moins (\S+) qu(?:e |')(\S+)\. (\S+) est plus (\S+) qu(?:e |')(\S+)\.$", x["texte"])
        p1, a1, p2, p2b, a2, p3 = m.groups()
        assert a1 in adj[:2] and a2 in adj[2:] and p2 == p2b and len({p1, p2, p3}) == 3
        rang = {p1: 0, p2: 1, p3: 2}            # « moins positif que » puis « plus négatif que » : ordre croissant
        return x["choix"][x["juste"]] == max(rang, key=rang.get) and x["choix"][x["leurre"]] == p1
    verifier("a-relations", relations)
    verifier("a-seulement-si", lambda f, x: x["choix"][x["juste"]].startswith("On ne peut pas savoir"))
    def syllogisme(f, x):
        enonces = [lire_enonce(p) for p in re.split(r"(?<=\.)\s+", x["texte"])]
        assert all(enonces) and len(enonces) == 3, x["texte"]
        valide = valide_par_modeles(enonces[:2], enonces[2])
        credible = verite(anc, enonces[2])
        return valide == f["valide"] == x["juste"] and credible == f["credible"] == x["credible"]
    for f in familles:
        if f["generer"] == "syllogisme": verifier(f["id"], syllogisme)
    def taux(f, x):
        v = x["valeurs"]; post = v["prev"] * v["sens"] / (v["prev"] * v["sens"] + (100 - v["prev"]) * v["fp"]) * 100
        attendu_leurre = v["sens"] if f["id"] == "b-taux-base" else v["prev"]
        fort = post > 60 if f["id"] != "b-taux-base" else post < 40
        return fr_nombre(x["choix"][x["juste"]]) == round(post) and fr_nombre(x["choix"][x["leurre"]]) == attendu_leurre and fort and len({fr_nombre(c) for c in x["choix"]}) == 4
    verifier("b-taux-base", taux); verifier("b-depistage-surcorrection", taux)
    verifier("b-conjonction", lambda f, x: all(c.startswith(x["choix"][x["juste"]][:-1]) for c in x["choix"]) and len(x["choix"][x["juste"]]) == min(len(c) for c in x["choix"]))
    verifier("b-echantillon", lambda f, x: (lambda v: binom_queue(v["n2"], .5, v["seuil"]) > binom_queue(v["n1"], .5, v["seuil"]) and x["choix"][x["juste"]] == f["surfaces"][x["i"]][2])(x["valeurs"]))
    verifier("b-regression", lambda f, x: (lambda v: v["t2"] < v["t1"] and v["b2"] > v["b1"])(x["valeurs"]))
    verifier("b-risque-relatif", lambda f, x: (lambda v: fr_nombre(x["choix"][x["juste"]]) == v["n"] * v["hausse"] / 100 and fr_nombre(x["choix"][x["leurre"]]) == v["hausse"] * 100 and len({fr_nombre(c) for c in x["choix"]}) == 4)(x["valeurs"]))
    verifier("b-esperance", lambda f, x: (lambda v: fr_nombre(x["choix"][x["juste"]]) == v["gain"] / v["k"] - v["mise"] and len({fr_nombre(c) for c in x["choix"]}) == 4)(x["valeurs"]))
    def simpson(f, x):
        a1, na1, a2, na2, b1, nb1, b2, nb2 = f["nombres"][x["i"] % len(f["nombres"])]
        return a1 / na1 > b1 / nb1 and a2 / na2 > b2 / nb2 and (b1 + b2) / (nb1 + nb2) > (a1 + a2) / (na1 + na2) and x["choix"][x["juste"]] == "La méthode A"
    verifier("b-simpson", simpson)
    verifier("b-joueur", lambda f, x: x["choix"][x["juste"]] == "1 chance sur " + str(x["valeurs"]["k"]))
    verifier("b-denominateur", lambda f, x: x["choix"][x["juste"]].startswith("La part"))
    def unites(f, x):
        opts = f["surfaces"][x["i"]][2]
        base = [v * fac for v, _, fac in opts]
        juste, leurre = base.index(max(base)), [o[0] for o in opts].index(max(o[0] for o in opts))
        return juste != leurre and len(set(base)) == 4 and fr_nombre(x["choix"][x["juste"]]) == opts[juste][0] and fr_nombre(x["choix"][x["leurre"]]) == opts[leurre][0]
    verifier("b-unites", unites)
    def points(f, x):
        a, b = x["valeurs"]["a"], x["valeurs"]["b"]
        return x["choix"][x["juste"]].startswith("Une baisse de " + str(a - b) + " points") and str(round(100 * (a - b) / a)) in x["choix"][x["juste"]] and a - b != round(100 * (a - b) / a)
    verifier("b-points-pourcents", points)
    def monty(f, x):
        n = x["valeurs"]["n"]; vous, autre = monty_ignorant(n)
        return vous == autre == Fraction(1, n - 1) and ("1 sur " + str(n - 1)) in x["choix"][x["juste"]]
    verifier("b-monty-surcorrection", monty)
    for f in familles:
        if f["generer"] == "conceptuel":
            verifier(f["id"], lambda f, x: x["juste"] == 0 and x["leurre"] == 1)

    # ---------- Non-reprise ----------
    corpus = []
    for nom in ("jeux-donnees.js", "experiences.js", "raisonner.js", "pratiques.js", "debattre.js", "donnees.js", "perception.js", "chiffres.js"):
        corpus += [s for s in re.findall(r'"((?:[^"\\]|\\.){40,})"', lire(nom))]
    similaires = []
    for f in familles:
        for x in f["instances"][:: max(1, f["taille"] // 20)]:
            t = x["texte"] + " " + x["question"]
            for c in corpus:
                j = jaccard(t, c)
                if j > 0.5: similaires.append((f["id"] + "@" + str(x["i"]), round(j, 2), c[:60]))
    ok("non-reprise : aucune instance à plus de 0,5 de similarité avec les " + str(len(corpus)) + " textes des banques du site", not similaires, similaires[:5])
    entre = []
    representants = [(f["id"], f["instances"][0]["texte"] + " " + f["instances"][0]["question"]) for f in familles]
    for (ia, ta), (ib, tb) in itertools.combinations(representants, 2):
        if jaccard(ta, tb) > 0.5 and not (ia.startswith("a-syl") and ib.startswith("a-syl")) and {ia, ib} != {"b-taux-base", "b-depistage-surcorrection"}:
            entre.append((ia, ib, round(jaccard(ta, tb), 2)))
    ok("non-reprise entre familles différentes (hors formes jumelles déclarées)", not entre, entre[:5])

    # ---------- Tirage ----------
    ok("reproductibilité : même graine → même tirage ; autre graine → autre tirage ; même instance → même texte", R["reproductible"] and R["variable"] and R["memeGraineMemeTexte"])
    ok("version publiée : aucun contenu à relire n'est tiré (0 item, déficit signalé)", R_publie["n"] == 0 and R_publie["issues"] > 0 and R["publiables"] == 0)
    par_id = {f["id"]: f for f in familles}
    QUOTAS = {"complet": {"A-calcul": 4, "A-lecture": 4, "A-raisonnement": 8, "B": 10, "C": 10}, "express": {"A-calcul": 1, "A-lecture": 1, "A-raisonnement": 2, "B": 4, "C": 4}}
    def strate(f):
        return "A-calcul" if f["axe"] == "A" and f["type"] == "calcul" else "A-lecture" if f["axe"] == "A" and f["type"] == "qcm" else "A-raisonnement" if f["axe"] == "A" else f["axe"]
    for sim in R["simulations"]:
        nom = sim["mode"] + ", graine " + str(sim["graine"])
        fautes_rep, fautes_fam, fautes_quota, fautes_vu, fautes_equilibre, fautes_entrelacs, reutil = [], [], [], [], [], [], 0
        vus = {}                         # instanceId → liste des rangs de tests où elle a été vue
        difficultes, positions = [], []
        for t, test in enumerate(sim["tests"]):
            ids = [x["instanceId"] for x in test["instances"]]
            fams = [x["famille"] for x in test["instances"]]
            if len(set(fams)) != len(fams): fautes_fam.append(t)
            compte = {}
            for x in test["instances"]: compte[strate(par_id[x["famille"]])] = compte.get(strate(par_id[x["famille"]]), 0) + 1
            if compte != QUOTAS[sim["mode"]]: fautes_quota.append((t, compte))
            syl = [par_id[x["famille"]] for x in test["instances"] if strate(par_id[x["famille"]]) == "A-raisonnement"]
            if sum(1 for f in syl if f["valide"]) * 2 != len(syl): fautes_equilibre.append(t)
            reutilisees = {m.split(" : ")[-1] for m in test["issues"] if "réutilisée" in m}
            reutil += len(reutilisees)
            for x in test["instances"]:
                anciens = vus.get(x["instanceId"], [])
                if any(t - r <= 3 for r in anciens) and x["instanceId"] not in reutilisees: fautes_rep.append((t, x["instanceId"]))
                if x["dejaVu"] != bool(anciens) or x["compteurTestsAvant"] != len(anciens): fautes_vu.append((t, x["instanceId"]))
            # Entrelacement : pas deux items de même strate à la suite quand l'étape en compte d'autres
            etapes = {}
            for x in test["instances"]: etapes.setdefault(x["valeurs"]["etape"], []).append(strate(par_id[x["famille"]]))
            for e, s in etapes.items():
                if len(set(s)) > 1:
                    majoritaire = max(s.count(k) for k in set(s))
                    suites = sum(1 for u, v in zip(s, s[1:]) if u == v)
                    if suites > max(0, 2 * majoritaire - len(s) - 1): fautes_entrelacs.append((t, e))
            for x in test["instances"]: vus.setdefault(x["instanceId"], []).append(t)
            difficultes.append(sum(par_id[f]["difficulte"] for f in fams) / len(fams))
            positions += test["positions"]
        ok(nom + " : aucune instance répétée avant trois tests terminés (" + str(reutil) + " réutilisation(s) déclarée(s))", not fautes_rep, fautes_rep[:5])
        ok(nom + " : une seule instance par famille et par test", not fautes_fam, fautes_fam)
        ok(nom + " : quotas par strate respectés à chaque test", not fautes_quota, fautes_quota[:3])
        ok(nom + " : autant de raisonnements valides que non valides", not fautes_equilibre, fautes_equilibre)
        ok(nom + " : déjà-vu et compteur de tests exacts, recalculés depuis l'historique", not fautes_vu, fautes_vu[:5])
        ok(nom + " : items entrelacés (pas de suite évitable de même strate)", not fautes_entrelacs, fautes_entrelacs[:5])
        ok(nom + " : difficulté visée stable d'un test à l'autre (écart ≤ 0,5)", max(difficultes) - min(difficultes) <= 0.5, (round(min(difficultes), 2), round(max(difficultes), 2)))
        part = max(positions.count(k) for k in range(4)) / len(positions)
        ok(nom + " : aucune position de bonne réponse au-delà de 40 % des QCM (" + str(round(100 * part)) + " % au plus)", part <= 0.40)
        ok(nom + " : historique valide après 20 tests", sim["valide"])

sys.exit(1 if rapport.ecrire(sortie) else 0)
