#!/usr/bin/env python3
"""Banc « piece-moteur » : le moteur de « La pièce du jour » (static/piece.js), hors navigateur (Node.js).
Brief, § 10 : déterminisme, non-ambiguïté, niveaux, variété, calculs (oracle Python indépendant), notation, part de
hasard, fiches. Le pilote JavaScript produit les pièces ; les vérifications de fond sont refaites ici, en Python.
python3 tests/piece_moteur.py RAPPORT"""
import json, os, re, subprocess, sys, tempfile, math

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "static")
lire = lambda nom: open(os.path.join(STATIC, nom), encoding="utf-8").read()
NIVEAUX = [1, 2, 3, 4]
JOUR_UN = 20774


def extraire(source, debut):
    i = source.index("\n" + debut) + 1
    ligne = source[i:source.index("\n", i)]
    return ligne if ligne.rstrip().endswith(";") else source[i:source.index("\n}\n", i) + 2]


def node(pilote, langue="fr"):
    """Charge les outils du site recopiés tels quels, les données et le moteur, puis le pilote (dernière expression : JSON)."""
    l = lire("langue.js")
    if langue == "en":
        prelude = 'const LANGUE = "en", LOCALE = "en-GB", PC = "%";\n' + "\n".join(
            [extraire(l, "const cleTexte"), extraire(l, "const DICTIONNAIRE"), extraire(l, "function EN_AJOUTER"), extraire(l, "function T(")])
        prelude += "\n" + "\n".join(lire("en/" + f) for f in sorted(os.listdir(os.path.join(STATIC, "en"))) if f.startswith("dico-piece"))
    else:
        prelude = 'const LANGUE = "fr", LOCALE = "fr-FR", PC = " %";\n' + extraire(l, "function T(")
    code = "\n".join([prelude, extraire(lire("app.js"), "function generateur"), extraire(lire("app.js"), "function melanger"),
                      extraire(lire("ateliers.js"), "const fr "), lire("piece-donnees.js"), lire("piece.js"), pilote])
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
    try:
        r = subprocess.run(["node", "-e", "process.stdout.write(String(require('vm').runInThisContext(require('fs').readFileSync(process.argv[1], 'utf8'))))", f.name],
                           capture_output=True, text=True, timeout=900)
    finally:
        os.remove(f.name)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[:3000])
    return json.loads(r.stdout)


PILOTE = r"""
(() => {
  const res = { niveaux: {}, ambigu: [], marge: [], incompat: [], composition: [], preuves: [], vides: [], echecs: [], options: [], notation: [], proprietes: [], hasard: {}, oracle: [], fiches: [] };
  const structure = p => JSON.stringify(p.zones.map(z => [z.id, z.role, z.etat, z.procede || z.leurre || null, z.d, z.toleres, z.preuves || null])) + JSON.stringify([p.verdict, p.chiffrer.map(q => [q.type, q.reponse, q.options])]);
  res.determinisme = [1, 2, 3, 4].every(n => [20774, 20800, 20999].every(j => structure(pieceDuJour(j, n)) === structure(pieceDuJour(j, n))));
  res.structures = [1, 2, 3, 4].flatMap(n => [20774, 20811, 20900].map(j => structure(pieceDuJour(j, n))));
  const verifier = (p, n) => {
    const ids = new Set(p.zones.map(z => z.id));
    for (const z of p.zones) {
      if (!z.texte || !z.rectifie) res.vides.push([n, p.format, z.role]);
      for (const q of Object.keys(PIECE_REGLES)) {
        const d = PIECE_REGLES[q].detecte(p, z), est = z.etat === "piegee" && z.procede === q;
        if (est && !d) res.ambigu.push(["non détecté", q, z.texte]);
        if (!est && d && !z.toleres.includes(q)) res.ambigu.push(["faux positif", q, z.role, z.etat, z.texte]);
        const R = PIECE_REGLES[q];
        if (R.parametre && R.seuils) {
          const x = R.parametre(z);
          if (x !== null && x !== undefined) {
            const [piege, sur, sens] = R.seuils;
            if (sens === "min" ? (x < piege && (sur === null || x > sur)) : (x > piege && (sur === null || x < sur))) res.marge.push([q, x, z.texte]);
          }
        }
      }
      (z.preuves || []).forEach(id => { if (!ids.has(id)) res.preuves.push([z.procede, id]); });
    }
    const pieges = p.zones.filter(z => z.etat === "piegee");
    pieges.forEach(x => pieges.forEach(y => { if (x !== y && PIECE_PROCEDES[x.procede].incompatibles.includes(y.procede)) res.incompat.push([x.procede, y.procede]); }));
    if (p.zones.filter(z => z.etat !== "piegee" && !z.toleres.length).length < 2 * pieges.length) res.composition.push([n, p.format]);
    // Nommer : nombre de choix, vrai procédé présent, voisins
    p.zones.forEach(z => {
      const o = pieceOptionsNommer(p, z), N = PIECE_NIVEAUX[n];
      if (o.length !== N.choix || new Set(o).size !== o.length) res.options.push(["taille", n, o.length]);
      if (z.etat === "piegee" && !o.includes(z.procede)) res.options.push(["absent", n, z.procede]);
      if (z.etat === "piegee" && PIECE_PROCEDES[z.procede].voisins.filter(v => pieceProcedesNiveau(n).includes(v)).slice(0, N.voisins).some(v => !o.includes(v))) res.options.push(["voisin", n, z.procede]);
    });
  };
  // Non-ambiguïté : pièces libres, 3 000 graines par niveau
  for (const n of [1, 2, 3, 4]) for (let g = 0; g < 3000; g++) {
    let p;
    try { p = pieceLibre(n, g); } catch (e) { res.echecs.push([n, g, e.message]); continue; }
    verifier(p, n);
  }
  // Niveaux, variété, calculs : 365 pièces du jour par niveau
  for (const n of [1, 2, 3, 4]) {
    const jours = [];
    for (let j = 20774; j < 20774 + 365; j++) {
      let p;
      try { p = pieceDuJour(j, n); } catch (e) { res.echecs.push([n, j, e.message]); continue; }
      verifier(p, n);
      const pieges = p.zones.filter(z => z.etat === "piegee");
      jours.push({ j, format: p.format, monde: p.monde, procedes: pieges.map(z => z.procede).sort(), zones: p.zones.length,
        leurres: p.zones.filter(z => z.etat === "leurre").length, intensites: pieges.map(z => z.intensite), familles: pieges.map(z => PIECE_PROCEDES[z.procede].famille),
        chiffrer: p.chiffrer.map(q => q.options ? "choix" : "libre"), annonce: p.annonce, empreinte: p.zones.map(z => z.texte).join("|") });
      if (j % 3 === 0) res.oracle.push({ n, format: p.format, verite: { serie: p.verite.serie, annees: p.verite.annees, k: p.verite.k, prix: p.verite.prix, sondage: p.verite.sondage },
        effectif: (p.zones.find(z => z.role === "methode-effectif") || {}).d || null, procedes: pieges.map(z => z.procede), verdict: p.verdict,
        chiffrer: p.chiffrer.map(q => ({ type: q.type, reponse: q.reponse, options: q.options })) });
    }
    res.niveaux[n] = { jours, permis: pieceProcedesNiveau(n), formats: pieceFormatsNiveau(n) };
  }
  // Notation : table de cas sur des pièces réelles, puis propriétés sur des réponses tirées au hasard
  const alea = generateur(7);
  const pieceAvec = (n, saine) => { for (let g = 0; g < 2000; g++) { const p = pieceLibre(n, g); if ((p.zones.every(z => z.etat !== "piegee")) === saine) return p; } throw new Error("aucune pièce " + (saine ? "saine" : "piégée") + " au niveau " + n); };
  // (niveau 1 : aucune pièce saine ; la pièce saine est donc prise au niveau 2 et au niveau 3)
  for (const [n, saine] of [[1, false], [2, true], [3, false], [3, true]]) {
    const p = pieceAvec(n, saine), pieges = p.zones.filter(z => z.etat === "piegee");
    const juste = { marques: Object.fromEntries(pieges.map(z => [z.id, z.procede])), rien: saine, chiffres: p.chiffrer.map(q => q.reponse), verdict: p.verdict };
    const libres = p.zones.filter(z => z.etat !== "piegee" && !z.toleres.length);
    const voisin = pieges.length ? { ...juste, marques: { [pieges[0].id]: PIECE_PROCEDES[pieges[0].procede].voisins[0] } } : null;
    res.notation.push({ n, saine, P: pieges.length,
      parfait: noterPiece(p, juste), toutManque: noterPiece(p, { marques: {}, rien: false, chiffres: [], verdict: null }),
      rien: noterPiece(p, { marques: {}, rien: true, chiffres: p.chiffrer.map(q => q.reponse), verdict: p.verdict }),
      fausseAlerte: noterPiece(p, { ...juste, rien: false, marques: { ...juste.marques, [libres[0].id]: null } }),
      voisin: voisin && noterPiece(p, voisin),
      toutMarquer: noterPiece(p, { marques: Object.fromEntries(p.zones.map(z => [z.id, null])), rien: false, chiffres: [], verdict: null }) });
  }
  for (let i = 0; i < 400; i++) {
    const n = 1 + Math.floor(alea() * 4), p = pieceLibre(n, 5000 + i);
    const zones = p.zones.map(z => z.id), marques = {};
    zones.forEach(id => { if (alea() < 0.3) marques[id] = pieceChoix(alea, Object.keys(PIECE_PROCEDES)); });
    const rep = { marques, rien: false, chiffres: p.chiffrer.map(q => q.reponse + Math.round(alea() * 6 - 3)), verdict: pieceChoix(alea, ["etablie", "non-etablie", "contredite"]) };
    const base = noterPiece(p, rep);
    const libre = p.zones.find(z => !(z.id in marques) && z.etat !== "piegee" && !z.toleres.length);
    const piege = p.zones.find(z => !(z.id in marques) && z.etat === "piegee");
    res.proprietes.push({ note: base.note, total: base.parts.reperage + base.parts.nom + base.parts.chiffre + base.parts.verdict,
      plusFausse: libre ? noterPiece(p, { ...rep, marques: { ...marques, [libre.id]: null } }).note : null,
      plusTrouve: piege ? noterPiece(p, { ...rep, marques: { ...marques, [piege.id]: null } }).note : null });
  }
  // Part de hasard : joueur qui marque au hasard, joueur qui répond toujours « Rien à signaler »
  for (const n of [1, 2, 3, 4]) {
    let hasard = 0, rien = 0, nb = 300;
    for (let g = 0; g < nb; g++) {
      const p = pieceLibre(n, 9000 + g), marques = {};
      p.zones.forEach(z => { if (alea() < 0.5) marques[z.id] = pieceChoix(alea, pieceOptionsNommer(p, z)); });
      const q = p.chiffrer.map(x => x.options ? pieceChoix(alea, x.options) : Math.round(alea() * 100));
      const v = pieceChoix(alea, ["etablie", "non-etablie", "contredite"]);
      hasard += noterPiece(p, { marques, rien: false, chiffres: q, verdict: v }).note;
      rien += noterPiece(p, { marques: {}, rien: true, chiffres: q, verdict: v }).note;
    }
    res.hasard[n] = { hasard: hasard / nb / 10, rien: rien / nb / 10 };
  }
  res.fiches = Object.values(PIECE_PROCEDES).map(p => p.fiche).filter(Boolean);
  res.catalogue = Object.fromEntries(Object.entries(PIECE_PROCEDES).map(([id, p]) => [id, { effet: p.effet, famille: p.famille }]));
  return JSON.stringify(res);
})()
"""

PILOTE_STRUCTURE = r"""JSON.stringify([1, 2, 3, 4].flatMap(n => [20774, 20811, 20900].map(j => { const p = pieceDuJour(j, n);
  return JSON.stringify(p.zones.map(z => [z.id, z.role, z.etat, z.procede || z.leurre || null, z.d, z.toleres, z.preuves || null])) + JSON.stringify([p.verdict, p.chiffrer.map(q => [q.type, q.reponse, q.options])]); })))"""


def js_round(x):
    return math.floor(x + 0.5)


def pct(a, b):
    return js_round(100 * (b - a) / a)


def effets_catalogue():
    """Effet de chaque procédé sur le verdict, lu dans le catalogue relu par le propriétaire (tests/piece-a-relire.md)."""
    effets, colonne = {}, None
    for ligne in open(os.path.join(ICI, "piece-a-relire.md"), encoding="utf-8"):
        cellules = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if "Effet" in cellules:
            colonne = cellules.index("Effet")
        elif colonne is not None and cellules and re.fullmatch(r"`[a-z-]+`", cellules[0]) and len(cellules) > colonne:
            effets[cellules[0].strip("`")] = cellules[colonne]
    return effets


def oracle_reponse(o):
    v, t = o["verite"], o["chiffrer"][0]["type"]
    s = v["serie"]
    if t == "variation":
        return pct(s[0], s[11])
    if t == "variation-bilan":
        k = v["k"]
        return pct(js_round((s[k - 4] + s[k - 3] + s[k - 2]) / 3), s[11])
    if t == "remise":
        return js_round(100 * (v["prix"]["ancien"] - v["prix"]["prix"]) / v["prix"]["ancien"])
    if t == "ecart-sondage":
        oui = v["sondage"]["oui"]
        return oui - (100 - oui - v["sondage"]["sansAvis"])
    if t == "abandon":
        e = o["effectif"]
        return js_round(100 * (e["effectif"]["n"] - e["finis"]) / e["effectif"]["n"])
    raise ValueError(t)


def main(sortie):
    lignes = []
    ok = lambda nom, cond, detail="": lignes.append(("OK    " if cond else "ÉCHEC ") + nom + ("" if cond or not detail else " — " + str(detail)[:700]))
    info = lambda texte: lignes.append("INFO  " + texte)
    try:
        r = node(PILOTE)
    except Exception as e:
        open(sortie, "w", encoding="utf-8").write("RÉSUMÉ : INACHEVÉ (moteur)\n" + str(e))
        return 1
    NIV = {1: dict(zones=(4, 5), pieges=(1, 1), saines=0, leurres=(0, 0), familles="GR", intensite="forte", chiffrer=[]),
           2: dict(zones=(5, 7), pieges=(0, 1), saines=25, leurres=(1, 1), familles="GCR", intensite="forte", chiffrer=[]),
           3: dict(zones=(7, 9), pieges=(0, 2), saines=20, leurres=(2, 2), familles="GCMRS", intensite="moyenne", chiffrer=["choix"]),
           4: dict(zones=(9, 12), pieges=(0, 3), saines=15, leurres=(2, 3), familles="GCMRS", intensite="faible", chiffrer=["libre"])}

    # 1. Déterminisme, français et anglais
    ok("déterminisme : même jour et même niveau, même pièce", r["determinisme"])
    try:
        en = node(PILOTE_STRUCTURE, "en")
        ok("même structure en français et en anglais (12 pièces)", en == r["structures"], "structures différentes")
    except Exception as e:
        ok("même structure en français et en anglais", False, e)
    ok("aucune génération en échec", not r["echecs"], r["echecs"][:5])

    # 2. Non-ambiguïté
    ok("non-ambiguïté : chaque piège détecté, aucune zone saine ou leurre détectée (hors tolérés), 4 × 3 000 pièces libres et 4 × 365 pièces du jour",
       not r["ambigu"], r["ambigu"][:4])
    ok("aucune valeur dans une marge interdite", not r["marge"], r["marge"][:4])
    ok("toutes les preuves désignent des zones affichées", not r["preuves"], r["preuves"][:4])
    ok("aucune paire de procédés incompatibles", not r["incompat"], r["incompat"][:4])
    ok("garantie de composition : au moins deux zones saines ou leurres non tolérées par piège", not r["composition"], r["composition"][:4])
    ok("chaque zone a un texte et un texte rectifié", not r["vides"], r["vides"][:4])

    # 3. Niveaux (brief, § 4.7)
    for n in NIVEAUX:
        J, c = r["niveaux"][str(n)]["jours"], NIV[n]
        hors = [(d["j"], d["zones"]) for d in J if not c["zones"][0] <= d["zones"] <= c["zones"][1]]
        ok(f"niveau {n} : {c['zones'][0]} à {c['zones'][1]} zones", not hors, hors[:5])
        hors = [(d["j"], d["procedes"]) for d in J if not c["pieges"][0] <= len(d["procedes"]) <= c["pieges"][1]]
        ok(f"niveau {n} : {c['pieges'][0]} à {c['pieges'][1]} piège(s)", not hors, hors[:5])
        part = 100 * sum(not d["procedes"] for d in J) / len(J)
        ok(f"niveau {n} : part de pièces saines {part:.0f} % (visée {c['saines']} %, ± 5 points)", abs(part - c["saines"]) <= 5)
        hors = [(d["j"], d["leurres"]) for d in J if not c["leurres"][0] <= d["leurres"] <= c["leurres"][1]]
        ok(f"niveau {n} : {c['leurres'][0]} à {c['leurres'][1]} leurre(s)", not hors, hors[:5])
        hors = [(d["j"], d["familles"]) for d in J if any(f not in c["familles"] for f in d["familles"])]
        ok(f"niveau {n} : familles {', '.join(c['familles'])} seulement", not hors, hors[:5])
        hors = [(d["j"], d["intensites"]) for d in J if any(i != c["intensite"] for i in d["intensites"])]
        ok(f"niveau {n} : intensité {c['intensite']}", not hors, hors[:5])
        hors = [(d["j"], d["chiffrer"]) for d in J if d["chiffrer"] != c["chiffrer"]]
        ok(f"niveau {n} : « Chiffrer » {c['chiffrer'] or 'absent'}", not hors, hors[:5])
        if n == 1:
            ok("niveau 1 : nombre de pièges annoncé", all(d["annonce"] == 1 for d in J))
    ok("« Nommer » : nombre de choix du niveau, vrai procédé et voisins présents", not r["options"], r["options"][:5])

    # 4. Variété, 365 jours par niveau
    for n in NIVEAUX:
        J, permis, formats = r["niveaux"][str(n)]["jours"], r["niveaux"][str(n)]["permis"], r["niveaux"][str(n)]["formats"]
        emp = [d["empreinte"] for d in J]
        ok(f"niveau {n} : aucune pièce en double sur 365 jours", len(set(emp)) == len(emp))
        doubles = [d["j"] for a, d in zip(J, J[1:]) if (a["format"], a["monde"]) == (d["format"], d["monde"])]
        ok(f"niveau {n} : jamais le même format et le même monde deux jours de suite", not doubles, doubles[:5])
        proches = [(J[i]["j"], J[k]["j"]) for i in range(len(J)) for k in range(i + 1, min(i + 7, len(J))) if J[i]["procedes"] and J[i]["procedes"] == J[k]["procedes"]]
        ok(f"niveau {n} : jamais le même ensemble de procédés à moins de 7 jours (pièces saines exceptées)", not proches, proches[:5])
        manque = [(J[i]["j"], p) for i in range(0, len(J) - 59) for p in permis if not any(p in d["procedes"] for d in J[i:i + 60])]
        ok(f"niveau {n} : chaque procédé permis ({len(permis)}) vu au moins une fois tous les 60 jours", not manque, manque[:5])
        manque = [(J[i]["j"], f) for i in range(0, len(J) - 13) for f in formats if not any(d["format"] == f for d in J[i:i + 14])]
        ok(f"niveau {n} : chaque format permis ({len(formats)}) vu au moins une fois tous les 14 jours", not manque, manque[:5])

    # 5. Calculs : réponses de « Chiffrer » et verdicts recalculés ici, à partir de la vérité et du catalogue
    effets = effets_catalogue()
    force = {"aucun": 0, "non-etablie": 1, "contredite": 2}
    absents = [p for p in r["catalogue"] if p not in effets]
    ok("catalogue : chaque procédé en service a son effet dans tests/piece-a-relire.md", not absents, absents)
    ecarts = [(p, r["catalogue"][p]["effet"], effets.get(p)) for p in r["catalogue"] if effets.get(p) != r["catalogue"][p]["effet"]]
    ok("catalogue : l'effet de chaque procédé dans le moteur est celui du catalogue", not ecarts, ecarts)
    faux_v, faux_c = [], []
    for o in r["oracle"]:
        attendu = ["etablie", "non-etablie", "contredite"][max([0] + [force[effets.get(p, "aucun")] for p in o["procedes"]])]
        if attendu != o["verdict"]:
            faux_v.append((o["format"], o["procedes"], o["verdict"], attendu))
        if o["chiffrer"]:
            rep = oracle_reponse(o)
            q = o["chiffrer"][0]
            if rep != q["reponse"] or (q["options"] and (rep not in q["options"] or len(set(q["options"])) != len(q["options"]) or len(q["options"]) < 3)):
                faux_c.append((o["format"], q, rep))
    ok(f"verdicts recalculés par l'oracle ({len(r['oracle'])} pièces)", not faux_v, faux_v[:4])
    ok("réponses de « Chiffrer » recalculées par l'oracle, et présentes parmi les choix", not faux_c, faux_c[:4])

    # 6. Notation (brief, § 5.2)
    for c in r["notation"]:
        nom = f"niveau {c['n']}, pièce {'saine' if c['saine'] else 'piégée'}"
        ok(f"notation, {nom} : relevé parfait = 10", c["parfait"]["note"] == 10 and c["parfait"]["exact"], c["parfait"])
        ok(f"notation, {nom} : tout manqué = 0 au repérage et au nom", c["toutManque"]["parts"]["reperage"] == 0 and c["toutManque"]["parts"]["nom"] == 0 if c["P"] else c["toutManque"]["parts"]["reperage"] == (7 if c["n"] < 3 else 5), c["toutManque"])
        ok(f"notation, {nom} : « Rien à signaler » {'vaut tout le repérage' if c['saine'] else 'vaut 0 au repérage'}", c["rien"]["parts"]["reperage"] == ((7 if c["n"] < 3 else 5) if c["saine"] else 0), c["rien"])
        ok(f"notation, {nom} : une fausse alerte fait baisser la note", c["fausseAlerte"]["note"] < c["parfait"]["note"] and c["fausseAlerte"]["A"] == 1, c["fausseAlerte"])
        if c["voisin"]:
            ok(f"notation, {nom} : un voisin vaut la moitié du nom", abs(c["voisin"]["parts"]["nom"] - (3 if c["n"] < 3 else 2) * 0.5 / c["P"]) < 1e-9, c["voisin"])
        ok(f"notation, {nom} : tout marquer vaut 0 au repérage", c["toutMarquer"]["parts"]["reperage"] == 0, c["toutMarquer"])
    P = r["proprietes"]
    ok(f"notation : note entière dans [0, 10], arrondie au plus proche ({len(P)} réponses)", all(0 <= p["note"] <= 10 and p["note"] == min(10, js_round(p["total"] + 1e-9)) for p in P))
    ok("notation : une fausse alerte de plus n'augmente jamais la note", all(p["plusFausse"] is None or p["plusFausse"] <= p["note"] for p in P))
    ok("notation : un piège trouvé de plus ne diminue jamais la note", all(p["plusTrouve"] is None or p["plusTrouve"] >= p["note"] for p in P))

    # 7. Part de hasard (pour MAITRISE_JEUX.piece, lot P3 : le pire des deux joueurs)
    for n in NIVEAUX:
        h = r["hasard"][str(n)]
        info(f"part de hasard, niveau {n} : joueur au hasard {h['hasard']:.2f}, joueur « Rien à signaler » {h['rien']:.2f}")
    pire = max(max(h.values()) for h in r["hasard"].values())
    ok(f"part de hasard : au plus 0,5 de la note, quel que soit le joueur (pire : {pire:.2f})", pire <= 0.5)

    # 8. Fiches : chaque identifiant lié existe dans les données (donnees.js) ou dans les ateliers
    d = lire("donnees.js")
    coupe = d.index("const SOPHISMES")
    biais, sophismes = set(re.findall(r'\bid: "([a-z0-9-]+)"', d[:coupe])), set(re.findall(r'\bid: "([a-z0-9-]+)"', d[coupe:]))
    ateliers = set(re.findall(r'\bid: "([a-z0-9-]+)"', "".join(lire(f) for f in os.listdir(STATIC) if f.endswith(".js") and not f.startswith("piece"))))
    absentes = [f for f in r["fiches"] if not ((f.startswith("biais:") and f[6:] in biais) or (f.startswith("sophismes:") and f[10:] in sophismes) or (f.startswith("atelier:") and f[8:] in ateliers))]
    ok("fiches liées : chaque identifiant existe", not absentes, absentes)
    familles = {}
    for p, c in r["catalogue"].items():
        familles[c["famille"]] = familles.get(c["famille"], 0) + 1
    ok(f"au moins 24 procédés en service, 3 par famille ({len(r['catalogue'])} : {familles})", len(r["catalogue"]) >= 24 and all(familles.get(f, 0) >= 3 for f in "GCMRS"))

    reussis = sum(l.startswith("OK") for l in lignes)
    total = sum(l.startswith(("OK", "ÉCHEC")) for l in lignes)
    open(sortie, "w", encoding="utf-8").write(f"RÉSUMÉ : {reussis} / {total} vérifications réussies\n" + "\n".join(lignes) + "\n")
    return 0 if reussis == total else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "rapports", "piece-moteur.txt")))
