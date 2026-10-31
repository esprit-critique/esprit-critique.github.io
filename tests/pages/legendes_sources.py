#!/usr/bin/env python3
"""Compare, pour les fiches illustrées, la légende de l'illustration (schemas.js) et le champ source (donnees.js) :
signale les paires dont plus de 40 % des mots significatifs de la légende figurent aussi dans la source.
python3 tests/pages/legendes_sources.py"""
import json, os, re, subprocess
ICI = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(ICI, "..", "..", "static")
schemas = open(os.path.join(S, "schemas.js"), encoding="utf-8").read()
# Chaque illustration, dans l'objet SCHEMAS : « "type:id": () => { … legende: "…" … } »
legendes = {}
for m in re.finditer(r'^  "([a-z]+:[a-z0-9-]+)": \(\) =>', schemas, re.M):
    suite = schemas[m.end():]
    prochain = re.search(r'^  "[a-z]+:[a-z0-9-]+": \(\) =>', suite, re.M)
    bloc = suite[:prochain.start() if prochain else len(suite)]
    l = re.search(r'legende:\s*("(?:[^"\\]|\\.)*")', bloc)
    if l: legendes[m.group(1)] = json.loads(l.group(1))
code = 'ObjC.import("Foundation"); const s = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError("' + os.path.join(S, "donnees.js") + '", 4, null)); new Function(s + "; return JSON.stringify(Object.fromEntries([...BIAIS.map(f => [\\"biais:\\" + f.id, f.source]), ...SOPHISMES.map(f => [\\"sophismes:\\" + f.id, f.source])]))")()'
sources = json.loads(subprocess.run(["osascript", "-l", "JavaScript", "-e", code], capture_output=True, text=True).stdout)
VIDES = set("le la les un une des de du d l et à a au aux en est sont que qui ne pas plus pour par sur dans son sa ses il elle ils elles on se s qu ce cette ces avec mais ou donc leur leurs entre comme été être fait".split())
mots = lambda t: {m for m in re.findall(r"[a-zàâçéèêëîïôûùüÿœ0-9]+", t.lower()) if m not in VIDES and len(m) > 2 or m.isdigit()}
print(len(legendes), "illustrations")
for cle, leg in legendes.items():
    a, b = mots(leg), mots(sources.get(cle, ""))
    part = len(a & b) / len(a) if a else 0
    if part > 0.4: print(f"{cle} : {round(100 * part)} % — {sorted(a & b)}")
