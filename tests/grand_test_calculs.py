#!/usr/bin/env python3
"""Banc « calculs » du Grand test : exécute les fonctions pures de static/grand-test.js hors navigateur (moteur
JavaScript de macOS, osascript -l JavaScript, sans Node.js) et compare leurs résultats à un oracle écrit à part,
ici, en Python : intervalles de Wilson, couverture binomiale exacte, d′ et c (loi normale de Python), Brier et
Murphy, score de fourchette, rapprochement rétrospectif, répondants simulés.
python3 tests/grand_test_calculs.py [FICHIER_RAPPORT]"""
import json, math, os, random, sys
from statistics import NormalDist
from grand_test_commun import ICI, executer, Rapport

sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "rapports", "calculs.txt")

rapport = Rapport()
ok = rapport.ok

proche = lambda a, b, tol: a is not None and b is not None and abs(a - b) <= tol

# ===================== Oracle =====================
Z = 1.2816

def wilson_oracle(k, n):
    """Wilson avec correction de continuité, d'après Newcombe (1998), écrit indépendamment."""
    if n == 0:
        return None, None
    p = k / n
    a = 2 * n * p + Z * Z
    b = 2 * (n + Z * Z)
    bas = 0.0 if k == 0 else (a - 1 - Z * math.sqrt(Z * Z - 2 - 1 / n + 4 * p * (n * (1 - p) + 1))) / b
    haut = 1.0 if k == n else (a + 1 + Z * math.sqrt(Z * Z + 2 - 1 / n + 4 * p * (n * (1 - p) - 1))) / b
    return max(0.0, bas), min(1.0, haut)

z = NormalDist().inv_cdf

def ds_oracle(vv, nv, fv, nf):
    h, f = (vv + .5) / (nv + 1), (fv + .5) / (nf + 1)
    return z(h) - z(f), -(z(h) + z(f)) / 2

def murphy_oracle(reps):
    n = len(reps)
    obar = sum(o for _, o in reps) / n
    classes = {}
    for p, o in reps:
        classes.setdefault(p, []).append(o)
    rel = sum(len(v) / n * (p - sum(v) / len(v)) ** 2 for p, v in classes.items())
    res = sum(len(v) / n * (sum(v) / len(v) - obar) ** 2 for p, v in classes.items())
    return rel, res, obar * (1 - obar), sum((p - o) ** 2 for p, o in reps) / n

def fourchette_oracle(v, bas, haut, annee):
    t = (lambda x: x / 100) if annee else (lambda x: math.log10(max(x, abs(v) / 1e6)))
    b, h, vv = t(bas), t(haut), t(v)
    return (h - b) + 20 * max(0, b - vv) + 20 * max(0, vv - h)


# ===================== Pilote JavaScript =====================
random.seed(20261031)
cas_murphy = [[[random.choice([0.25, 0.5, 0.7, 0.9, 0.99]), random.randint(0, 1)] for _ in range(random.randint(1, 40))] for _ in range(200)]
cas_fourchettes = [[10 ** random.uniform(0, 9), None, None, False] for _ in range(60)] + [[random.randint(1200, 2020), None, None, True] for _ in range(20)]
for c in cas_fourchettes:
    v = c[0]
    if c[3]:
        c[1], c[2] = v + random.randint(-150, 40), v + random.randint(-40, 150)
    else:
        c[1], c[2] = v * 10 ** random.uniform(-2, 0.5), v * 10 ** random.uniform(-0.5, 2)
    if c[1] > c[2]:
        c[1], c[2] = c[2], c[1]
cas_rapprochement = [[10 ** random.uniform(0, 6), 10 ** random.uniform(0, 6), 10 ** random.uniform(0, 6)] for _ in range(50)]

pilote = """
const R = {};
const W = (k, n) => { const r = wilsonCorrige(k, n); return [r.bas, r.haut]; };
R.wilsonGrille = [];
for (let n = 1; n <= 40; n++) for (let k = 0; k <= n; k++) R.wilsonGrille.push([k, n].concat(W(k, n)));
R.wilsonVide = wilsonCorrige(0, 0);
R.wilsonErreurs = [[3, 2], [-1, 4], [1.5, 4]].map(([k, n]) => { try { wilsonCorrige(k, n); return false; } catch (e) { return true; } });
R.interpretations = [
  interpreterProportion(wilsonCorrige(8, 16), 0.25), interpreterProportion(wilsonCorrige(16, 16), 0.25),
  interpreterProportion(wilsonCorrige(5, 6), 0.25), interpreterProportion(wilsonCorrige(1, 2), 0.25),
  interpreterProportion(wilsonCorrige(0, 0), 0.25), interpreterProportion(wilsonCorrige(4, 16), 0.25),
  interpreterProportion(wilsonCorrige(0, 16), 0.5), interpreterProportion(wilsonCorrige(15, 16), 0.25)];
R.hasardA = hasardConventionnel([0, 0, 0, 0, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
R.leurre = [partLeurre([{ juste: true }, { juste: true }]), partLeurre([{ juste: false, leurre: true }, { juste: false, leurre: false }, { juste: true }])];
R.ds = [];
for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12; b++) { const r = detectionSignal(a, 12, b, 12); R.ds.push([a, b, r.d, r.c]); }
R.dsInvalide = detectionSignal(13, 12, 0, 12);
// Rééchantillonnage
const donnees = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
R.boot1 = reechantillonner(donnees, t => moyenneGT(t), 2000, generateur(42));
R.boot2 = reechantillonner(donnees, t => moyenneGT(t), 2000, generateur(42));
R.boot3 = reechantillonner(donnees, t => moyenneGT(t), 2000, generateur(43));
R.bootConstant = reechantillonner([3, 3, 3], t => moyenneGT(t), 500, generateur(1));
R.bootErreurs = [100, 6000, 250.5].map(n => { try { reechantillonner(donnees, moyenneGT, n, generateur(1)); return false; } catch (e) { return true; } });
R.bootVide = reechantillonner([], moyenneGT, 500, generateur(1));
const parfait = [].concat(Array.from({ length: 12 }, () => ({ vrai: true, repondVrai: true })), Array.from({ length: 12 }, () => ({ vrai: false, repondVrai: false })));
R.discParfait = discernement(parfait, 7);
R.discToujoursVrai = discernement(parfait.map(j => ({ vrai: j.vrai, repondVrai: true })), 7);
R.discDeterministe = JSON.stringify(discernement(parfait.map((j, k) => ({ vrai: j.vrai, repondVrai: k % 3 ? j.vrai : !j.vrai })), 11)) === JSON.stringify(discernement(parfait.map((j, k) => ({ vrai: j.vrai, repondVrai: k % 3 ? j.vrai : !j.vrai })), 11));
// Étalonnage
const sur60 = [].concat(Array.from({ length: 60 }, () => ({ p: 0.99, o: 1 })), Array.from({ length: 40 }, () => ({ p: 0.99, o: 0 })));
R.brier60 = brier(sur60);
R.brierParfait = brier(Array.from({ length: 30 }, () => ({ p: 0.99, o: 1 })));
R.brierVide = brier([]);
R.murphy = CAS_MURPHY.map(c => { const m = murphy(c.map(([p, o]) => ({ p, o }))); const b = brier(c.map(([p, o]) => ({ p, o }))); return [m.fiabilite, m.resolution, m.incertitude, m.somme, b.score]; });
R.surconfiance = surconfiancePlage(sur60, 5);
// Fourchettes
R.fourchettes = CAS_FOURCHETTES.map(([v, bas, haut, annee]) => scoreFourchette({ v, unite: annee ? "" : "u" }, bas, haut, 0.1));
const grandes = [{ v: 120, unite: "km" }, { v: 1789, unite: "" }, { v: 3e6, unite: "habitants" }];
R.couvertureLarge = bilanFourchettes(grandes.map(q => ({ q, bas: q.v / 2, haut: q.v * 2 })));
R.couverturePonctuelle = bilanFourchettes(grandes.map(q => ({ q, bas: q.v * 1.5, haut: q.v * 1.5 })));
// Démonstrations
R.retro = [rapprochement(100, 1000, 100, "log"), rapprochement(100, 1000, 1000, "log"), rapprochement(1800, 1850, 1800, "lineaire"),
  rapprochement(1800, 1850, 1850, "lineaire"), rapprochement(1000, 1000, 50, "log"), rapprochement(10, 1000, 1e9, "log"), rapprochement(-1, 10, 5, "log")];
R.retroGrille = CAS_RAPPROCHEMENT.map(([e, v, r]) => rapprochement(e, v, r, "log"));
const alea = generateur(99);
R.illusoire = Array.from({ length: 1000 }, () => {
  const notes = Array.from({ length: 16 }, (_, k) => ({ expose: k < 8, vrai: k % 2 === 0, note: 1 + Math.floor(alea() * 6) }));
  return veriteIllusoire(notes).toutes;
});
R.angleMort = [angleMort([{ moi: 3, autres: 5 }, { moi: 4, autres: 4 }]), angleMort([])];
// Impartialité
const notes = [{ camp: "pour", qualite: "solide", note: 5 }, { camp: "pour", qualite: "faible", note: 2 }, { camp: "contre", qualite: "solide", note: 5 }, { camp: "contre", qualite: "faible", note: 2 }];
R.camp = [indiceCamp([{ position: "pour", notes }]).indice, indiceCamp([{ position: null, notes }]).indice, indiceCamp([{ position: null, notes }]).raison,
  indiceCamp([{ position: "pour", notes: notes.map(x => Object.assign({}, x, { note: x.camp === "pour" ? x.note + 1 : x.note })) }]).indice,
  sensibiliteQualite([{ position: null, notes }])];
R.croyance = [biaisCroyance([{ credible: true, repondValide: true }, { credible: true, repondValide: true }, { credible: false, repondValide: false }, { credible: false, repondValide: true }]), biaisCroyance([{ credible: true, repondValide: true }])];
R.surCorrection = [surCorrection([{ preuveSuffisante: true, rejet: true }, { preuveSuffisante: true, rejet: false }, { preuveSuffisante: false, rejet: true }]), surCorrection([{ preuveSuffisante: false, rejet: true }])];
// Répondants simulés (500 simulations chacun)
const al = generateur(2026);
R.hasardQCM = Array.from({ length: 500 }, () => moyenneGT(Array.from({ length: 10 }, () => al() < 0.25 ? 1 : 0)));
R.hasardVF = Array.from({ length: 500 }, () => {
  const j = Array.from({ length: 24 }, (_, k) => ({ vrai: k < 12, repondVrai: al() < 0.5 }));
  const vv = j.filter(x => x.vrai && x.repondVrai).length, fv = j.filter(x => !x.vrai && x.repondVrai).length;
  return detectionSignal(vv, 12, fv, 12).d;
});
// Comparaisons et tendances
const serie = p => Array.from({ length: 20 }, (_, k) => k < p * 20 ? 1 : 0);
R.comparer = [comparerPassations(serie(0.5), serie(0.5), 3).verdict, comparerPassations(serie(0.2), serie(0.9), 3).verdict, comparerPassations(serie(0.9), serie(0.2), 3).verdict, comparerPassations([], serie(0.5), 3)];
R.tendance = [tendance([serie(0.1), serie(0.5)], 4).verdict, tendance([serie(0.1), serie(0.5), serie(0.9)], 4).verdict, tendance([serie(0.5), serie(0.5), serie(0.5)], 4).verdict,
  tendance([serie(0.9), serie(0.5), serie(0.1)], 4).verdict, tendance([serie(0.1), serie(0.5), serie(0.9)], 4).pente];
const items = (prefixe, erreurs) => erreurs.map((e, k) => ({ instanceId: prefixe + k, erreur: e }));
R.entite = [entiteAffaiblie(items("a", [1, 1, 1, 1, 1, 1]), items("b", [0, 0, 0, 0, 0, 0]), 8).affaiblie,
  entiteAffaiblie(items("a", [1, 0, 1, 0]), items("b", [1, 0, 0, 1]), 8).raison,
  entiteAffaiblie(items("a", [1, 1]), items("b", [0, 0, 0]), 8).raison,
  entiteAffaiblie(items("a", [1, 1, 1]), items("a", [0, 0, 0]), 8).raison];
R.graine = [graineDe("abc"), graineDe("abc"), graineDe("abd"), graineDe({ a: 1 })];
JSON.stringify(R);
"""
pilote = ("const CAS_MURPHY = " + json.dumps(cas_murphy) + ";\nconst CAS_FOURCHETTES = " + json.dumps(cas_fourchettes)
          + ";\nconst CAS_RAPPROCHEMENT = " + json.dumps(cas_rapprochement) + ";\n" + pilote)

try:
    R = executer(pilote)
except Exception as e:
    rapport.lignes.append("EXCEPTION " + str(e))
    R = None

if R:
    # --- Wilson ---
    ecarts = [(k, n) for k, n, b, h in R["wilsonGrille"] if not (proche(b, wilson_oracle(k, n)[0], 1e-12) and proche(h, wilson_oracle(k, n)[1], 1e-12))]
    ok("Wilson corrigé : 860 cas (n de 1 à 40) identiques à l'oracle à 10⁻¹²", not ecarts, ecarts[:5])
    attendus = {(8, 16): (0.319, 0.681), (16, 16): (0.856, 1), (9, 10): (0.658, 0.990)}
    grille = {(k, n): (b, h) for k, n, b, h in R["wilsonGrille"]}
    ok("Wilson : valeurs de contrôle du mandat à 10⁻³ (8/16, 16/16, 9/10)", all(proche(grille[c][0], a[0], 1e-3) and proche(grille[c][1], a[1], 1e-3) for c, a in attendus.items()),
       {c: grille[c] for c in attendus})
    ok("Wilson : n = 0 ne produit aucune valeur", R["wilsonVide"]["p"] is None and R["wilsonVide"]["bas"] is None)
    ok("Wilson : k > n, k négatif ou non entier refusés", all(R["wilsonErreurs"]))
    couvertures = {}
    for p in (0.3, 0.6, 0.85):
        for n in (10, 16):
            couvertures[(p, n)] = sum(math.comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n + 1) if grille[(k, n)][0] <= p <= grille[(k, n)][1])
    ok("couverture binomiale exacte des plages à 80 % entre 0,80 et 0,97 (p ∈ {0,3 ; 0,6 ; 0,85}, n ∈ {10 ; 16})",
       all(0.80 <= c <= 0.97 for c in couvertures.values()), {k: round(v, 4) for k, v in couvertures.items()})
    ok("libellés : hasard, presque sans faute, trop peu d'items, non mesuré, sous le hasard", R["interpretations"] == [
        "nettement au-dessus du hasard", "presque sans faute", "nettement au-dessus du hasard", "trop peu d'items pour estimer",
        "non mesuré", "au niveau du hasard", "en dessous du hasard", "presque sans faute"], R["interpretations"])
    ok("hasard conventionnel de l'axe A (4 calculs, 4 QCM, 8 jugements) = 0,3125", proche(R["hasardA"], 0.3125, 1e-12))
    ok("leurre intuitif : non calculable sans erreur ; 1 erreur sur 2 = leurre → 0,5", R["leurre"] == [None, 0.5])
    # --- Détection du signal ---
    ecarts = [(a, b) for a, b, d, c in R["ds"] if not (proche(d, ds_oracle(a, 12, b, 12)[0], 1e-6) and proche(c, ds_oracle(a, 12, b, 12)[1], 1e-6))]
    ok("d′ et c : 169 cas (12 vrais, 12 faux) identiques à l'oracle (loi normale de Python) à 10⁻⁶", not ecarts, ecarts[:5])
    ds = {(a, b): (d, c) for a, b, d, c in R["ds"]}
    ok("d′ : répondant parfait = 3,54 ; toujours faux = −3,54 (bornes théoriques)", proche(ds[(12, 0)][0], 3.54, 5e-3) and proche(ds[(0, 12)][0], -3.54, 5e-3))
    ok("répondre toujours « vrai » : d′ = 0, c = −1,77 ; toujours « faux » : c = +1,77", proche(ds[(12, 12)][0], 0, 1e-12) and proche(ds[(12, 12)][1], -1.77, 5e-3) and proche(ds[(0, 0)][1], 1.77, 5e-3))
    ok("d′ : effectifs incohérents refusés", R["dsInvalide"] is None)
    ok("plages de d′ du répondant parfait : réduites à 3,54", proche(R["discParfait"]["plageD"]["bas"], 3.54, 5e-3) and proche(R["discParfait"]["plageD"]["haut"], 3.54, 5e-3))
    ok("toujours « vrai » : d′ = 0 et c = −1,77 avec leurs plages", proche(R["discToujoursVrai"]["d"], 0, 1e-12) and proche(R["discToujoursVrai"]["plageC"]["bas"], -1.77, 5e-3))
    ok("discernement : même graine, mêmes plages", R["discDeterministe"])
    # --- Rééchantillonnage ---
    b1, b2, b3 = R["boot1"], R["boot2"], R["boot3"]
    ok("rééchantillonnage : même graine → mêmes bornes ; autre graine → tirages différents", b1 == b2 and (b1["bas"], b1["haut"]) != (None, None) and b3 is not None)
    ok("rééchantillonnage 8/16 : bornes 10–90 proches de la théorie normale (0,5 ± 0,16, à 0,04)", proche(b1["bas"], 0.5 - 1.2816 * math.sqrt(.25 / 16), 0.04) and proche(b1["haut"], 0.5 + 1.2816 * math.sqrt(.25 / 16), 0.04), b1)
    ok("rééchantillonnage : données constantes → plage nulle", R["bootConstant"]["bas"] == 3 and R["bootConstant"]["haut"] == 3)
    ok("rééchantillonnage : nombre de tirages validé (100, 6 000, 250,5 refusés)", all(R["bootErreurs"]))
    ok("rééchantillonnage : données vides → aucune plage", R["bootVide"] is None)
    # --- Étalonnage ---
    br = R["brier60"]
    ok("certitude 99 %, 60 % de réussite : surconfiance de 39 points", proche(br["surconfiance"], 0.39, 1e-12))
    ok("Brier = 0,4 × 0,99² + 0,6 × 0,01², à 10⁻⁶", proche(br["score"], 0.4 * 0.99 ** 2 + 0.6 * 0.01 ** 2, 1e-6))
    ok("répondant parfait sûr à 99 % : surconfiance non positive", R["brierParfait"]["surconfiance"] <= 0)
    ok("Brier sans réponse : aucune valeur", R["brierVide"] is None)
    ecarts = [i for i, (m, c) in enumerate(zip(R["murphy"], cas_murphy)) if not (abs(m[3] - m[4]) <= 1e-9 and all(proche(x, y, 1e-12) for x, y in zip(m[:3] + [m[4]], murphy_oracle(c))))]
    ok("Murphy : fiabilité − résolution + incertitude = Brier à 10⁻⁹, et égal à l'oracle (200 cas)", not ecarts, ecarts[:5])
    s = R["surconfiance"]
    ok("surconfiance : plage de rééchantillonnage qui encadre la valeur", s["plage"]["bas"] <= s["valeur"] <= s["plage"]["haut"])
    # --- Fourchettes ---
    ecarts = [i for i, (x, c) in enumerate(zip(R["fourchettes"], cas_fourchettes)) if not proche(x, fourchette_oracle(*c), 1e-9)]
    ok("score de fourchette : 80 cas identiques à l'oracle (log₁₀, années en siècles)", not ecarts, ecarts[:5])
    ok("fourchettes larges qui couvrent tout : couverture totale", R["couvertureLarge"]["k"] == 3 and R["couvertureLarge"]["n"] == 3)
    ok("fourchettes ponctuelles fausses : couverture nulle", R["couverturePonctuelle"]["k"] == 0)
    # --- Démonstrations ---
    ok("rétrospectif : souvenir = estimation → 0 ; souvenir = vraie valeur → 1 (log et linéaire)", R["retro"][:4] == [0, 1, 0, 1], R["retro"][:4])
    ok("rétrospectif : estimation exacte ou valeur non positive en log → non défini ; borne à −1", R["retro"][4] is None and R["retro"][5] == -1 and R["retro"][6] is None)
    def retro_oracle(e, v, r):
        e, v, r = math.log10(e), math.log10(v), math.log10(r)
        return max(-1, min(1, (abs(e - v) - abs(r - v)) / abs(e - v)))
    ok("rétrospectif : 50 cas identiques à l'oracle à 10⁻⁹", all(proche(x, retro_oracle(*c), 1e-9) for x, c in zip(R["retroGrille"], cas_rapprochement)))
    vi = R["illusoire"]
    moy, et = sum(vi) / len(vi), math.sqrt(sum((x - sum(vi) / len(vi)) ** 2 for x in vi) / (len(vi) - 1)) / math.sqrt(len(vi))
    ok("vérité illusoire sans effet injecté : moyenne compatible avec zéro (1 000 simulations)", abs(moy) < 3 * et, round(moy, 4))
    ok("angle mort : (5 + 4)/2 − (3 + 4)/2 = 1 ; sans réponse : aucune valeur", R["angleMort"] == [1, None])
    # --- Impartialité ---
    ok("indice de camp : notes identiques → 0 ; sans position → non calculé ; +1 à son camp → 1", R["camp"][0] == 0 and R["camp"][1] is None and R["camp"][2] == "aucune position choisie" and R["camp"][3] == 1)
    ok("sensibilité à la qualité : solides 5, faibles 2 → 3", R["camp"][4] == 3)
    ok("biais de croyance : 1 − 0,5 = 0,5 ; une seule condition → non calculé", R["croyance"] == [0.5, None])
    ok("sur-correction : 1 rejet sur 2 situations concluantes → 0,5", R["surCorrection"][0] == {"indice": 0.5, "n": 2} and R["surCorrection"][1] is None)
    # --- Répondants simulés ---
    m = sum(R["hasardQCM"]) / 500
    ok("répondant au hasard, QCM à 4 choix (500 simulations) : moyenne à ±0,03 de 0,25", abs(m - 0.25) <= 0.03, round(m, 4))
    m = sum(R["hasardVF"]) / 500
    ok("répondant au hasard, vrai-faux (500 simulations) : d′ moyen à ±0,1 de 0", abs(m) <= 0.1, round(m, 4))
    # --- Comparaisons ---
    ok("comparaison : identiques → pas de changement net ; 0,2 → 0,9 progrès net ; l'inverse recul net ; vide → rien",
       R["comparer"] == ["pas de changement net mesurable", "progrès net", "recul net", None], R["comparer"])
    ok("tendance : rien avant trois tests ; hausse, plat, baisse ; pente 0,4 par test", R["tendance"][:4] == [
        "pas assez de tests comparables", "tendance à la hausse", "tendance non mesurable", "tendance à la baisse"] and proche(R["tendance"][4], 0.4, 1e-12), R["tendance"])
    ok("entité affaiblie : baisse nette → oui ; bruit → non mesurable ; < 3 items → non ; items répétés → non",
       R["entite"] == [True, "évolution non mesurable", "moins de trois items par test", "items répétés"], R["entite"])
    g = R["graine"]
    ok("graine dérivée du contenu : déterministe, sensible au contenu, entier 32 bits", g[0] == g[1] and g[0] != g[2] and all(0 <= x < 2 ** 32 and int(x) == x for x in g))

sys.exit(1 if rapport.ecrire(sortie) else 0)
