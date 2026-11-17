#!/usr/bin/env python3
"""Banc « rotation » : le tirage sans remise des cartes du jour (tirerSansRemise, static/app.js), hors navigateur (Node.js).
Vérifie : l'ancien tirage gardé pour les jours déjà joués ; aucun retour avant la fin d'un cycle, ni d'un jour sur
l'autre ; un ajout (champ « depuis ») ne change aucun jour passé et rejoint le cycle en cours ; le cache rend la même
chose qu'un calcul direct ; tout élément absent du manifeste (tests/rotation-manifeste.json) porte « depuis ».
python3 tests/rotation.py RAPPORT        python3 tests/rotation.py --manifeste   (réécrit le manifeste)"""
import json, os, re, subprocess, sys, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from grand_test_commun import lire, extraire, Rapport

MANIFESTE = os.path.join(ICI, "rotation-manifeste.json")
STOCKS = ["VRAI_FAUX", "MONDE", "CITATIONS", "PAIRES_CELEBRES", "FICHES"]


def node(pilote):
    app = lire("app.js")
    code = "\n".join([extraire(app, "function generateur"), extraire(app, "function melanger"), extraire(app, "const ROTATION_DEPUIS"),
                      extraire(app, "const ROTATION_STABLE_DEPUIS"), extraire(app, "const ETATS_ROTATION"), extraire(app, "const cleTirage"), extraire(app, "const depuisTirage"),
                      extraire(app, "function rangTirage"), extraire(app, "function tirerSansRemise"), 'const LANGUE = "fr";', lire("donnees.js"), lire("jeux-donnees.js"), pilote])
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
    try:
        r = subprocess.run(["node", "-e", "process.stdout.write(String(require('vm').runInThisContext(require('fs').readFileSync(process.argv[1], 'utf8'))))", f.name],
                           capture_output=True, text=True, timeout=900)
    finally:
        os.remove(f.name)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[:2000])
    return json.loads(r.stdout)


PILOTE = """
// Les situations du jour tirent dans les fiches, emballées comme dans INDEX (app.js)
const FICHES = [...BIAIS.map(fiche => ({ type: "biais", fiche })), ...SOPHISMES.map(fiche => ({ type: "sophismes", fiche }))];
const stocks = { VRAI_FAUX, MONDE, CITATIONS, PAIRES_CELEBRES, FICHES };
const D = ROTATION_STABLE_DEPUIS, res = {};
res.ids = Object.fromEntries(Object.entries(stocks).map(([k, l]) => [k, l.map(x => ({ cle: cleTirage(x), depuis: depuisTirage(x) || null }))]));
// Ancien tirage, recopié : les deux jours déjà joués doivent le garder
const ancien = (liste, n, jour, sel) => { const o = melanger(liste, generateur(sel)); return Array.from({ length: Math.min(n, liste.length) }, (_, i) => o[(jour * n + i) % liste.length]); };
res.anciens = [ROTATION_DEPUIS, D - 1].every(j => [[VRAI_FAUX, 1, 29], [MONDE, 3, 11], [CITATIONS, 2, 17]].every(([l, n, s]) =>
  tirerSansRemise(l, n, j, s).map(cleTirage).join() === ancien(l, n, j, s).map(cleTirage).join()));
// Cycles : sur 2,5 cycles, aucun élément ne revient avant que tout le stock soit sorti, ni d'un jour sur l'autre
res.cycles = {};
for (const [nom, l] of Object.entries(stocks)) for (const n of [1, 3]) {
  const jours = Math.ceil(2.5 * l.length / n), tirages = [];
  for (let k = 0; k < jours; k++) tirages.push(tirerSansRemise(l, n, D + k, 7).map(cleTirage));
  const plat = tirages.flat(), L = l.length;
  let doublonCycle = null, veille = null;
  for (let c = 0; c * L < plat.length - L; c++) { const tranche = plat.slice(c * L, (c + 1) * L); if (new Set(tranche).size !== tranche.length) doublonCycle = c; }
  // Le premier cycle : exactement tout le stock
  const premier = new Set(plat.slice(0, L));
  for (let k = 1; k < tirages.length; k++) if (tirages[k].some(x => tirages[k - 1].includes(x))) veille = k;
  res.cycles[nom + "/" + n] = { premierComplet: premier.size === L, doublonCycle, veille, jourDouble: tirages.findIndex(t => new Set(t).size !== t.length) };
}
// Ajout : un élément « depuis » D + 10 ne change aucun jour d'avant, et sort avant qu'un élément ne revienne
const avec = [...VRAI_FAUX, { id: "essai-ajout", texte: "", depuis: D + 10 }];
const avant = k => tirerSansRemise(VRAI_FAUX, 1, D + k, 29).map(cleTirage).join();
const apres = k => tirerSansRemise(avec, 1, D + k, 29).map(cleTirage).join();
res.ajoutPasse = Array.from({ length: 10 }, (_, k) => k).every(k => avant(k) === apres(k));
const sortie = [];
for (let k = 0; k < VRAI_FAUX.length + 5; k++) sortie.push(apres(k));
const jourAjout = sortie.indexOf("essai-ajout"), premierRetour = sortie.findIndex((x, i) => sortie.indexOf(x) < i);
res.ajout = { jourAjout, premierRetour };
// Cache : un jour lointain demandé d'un coup, puis pas à pas, donne le même résultat
ETATS_ROTATION.clear(); const direct = tirerSansRemise(MONDE, 3, D + 200, 11).map(cleTirage).join();
ETATS_ROTATION.clear(); let pas; for (let k = 0; k <= 200; k += 37) pas = tirerSansRemise(MONDE, 3, D + k, 11);
pas = tirerSansRemise(MONDE, 3, D + 200, 11).map(cleTirage).join();
const recul = tirerSansRemise(MONDE, 3, D + 50, 11).map(cleTirage).join();
ETATS_ROTATION.clear(); const reculDirect = tirerSansRemise(MONDE, 3, D + 50, 11).map(cleTirage).join();
res.cache = direct === pas && recul === reculDirect;
JSON.stringify(res);
"""


def main():
    r = node(PILOTE)
    if sys.argv[1:] == ["--manifeste"]:
        json.dump({k: [x["cle"] for x in v if not x["depuis"]] for k, v in r["ids"].items()}, open(MANIFESTE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("manifeste réécrit")
        return 0
    sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "rapports", "rotation.txt")
    rapport = Rapport()
    ok = rapport.ok
    ok("jours déjà joués (16 et 17 novembre 2026) : l'ancien tirage est gardé", r["anciens"])
    for cle, c in r["cycles"].items():
        ok(cle + " : le premier cycle sort tout le stock, une fois chacun", c["premierComplet"])
        ok(cle + " : aucun élément ne revient avant la fin du cycle", c["doublonCycle"] is None, c)
        ok(cle + " : rien de la veille le lendemain, rien en double le même jour", c["veille"] is None and c["jourDouble"] == -1, c)
    ok("ajout : les jours d'avant son « depuis » ne changent pas", r["ajoutPasse"])
    a = r["ajout"]
    ok("ajout : il sort dans le cycle en cours, avant tout retour", a["jourAjout"] >= 10 and (a["premierRetour"] == -1 or a["jourAjout"] < a["premierRetour"]), a)
    ok("cache : même tirage calculé d'un coup, pas à pas ou en revenant en arrière", r["cache"])
    manifeste = json.load(open(MANIFESTE, encoding="utf-8"))
    for nom in STOCKS:
        connus = set(manifeste.get(nom, []))
        sans = [x["cle"] for x in r["ids"][nom] if x["cle"] not in connus and not x["depuis"]]
        ok(nom + " : chaque élément ajouté après le manifeste porte « depuis » (sinon il rebattrait les jours passés)", not sans, sans)
    return 1 if rapport.ecrire(sortie) else 0


if __name__ == "__main__":
    sys.exit(main())
