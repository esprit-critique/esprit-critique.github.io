#!/usr/bin/env python3
"""Formes des pays pour « Plus ou moins ? » (surfaces comparées) : static/pays-formes.js.
Usage : python3 tests/pays/formes.py tests/pays/cache/ne_50m_admin_0_countries.geojson
Source : Natural Earth, Admin 0 – Countries, 1:50 000 000 (github.com/nvkelso/natural-earth-vector, v5.1.2,
geojson/), domaine public. Chaque pays est projeté en projection azimutale équivalente de Lambert centrée sur sa
partie principale : les aires sont conservées, donc deux pays dessinés à la même échelle se comparent à vue.
Les territoires éloignés (au-delà de deux fois la taille de la partie principale et de 1 200 km, sauf s'ils font au
moins un dixième du pays et sont à moins de 5 000 km : péninsule malaise, Papouasie, Alaska) et les îles de moins de
0,3 % de la surface gardée ne sont pas dessinés ; le champ « loin » le signale quand cela retire plus de 2 %
de la surface. Une forme n'est gardée que si son aire concorde à 20 % près avec la surface affichée par le jeu (pays.js).
Contours simplifiés (Douglas-Peucker, tolérance proportionnelle à la taille du pays)."""
import json, math, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")
R = 6371.0088   # rayon moyen de la Terre, en km

def laea(lon0, lat0):
    p0, l0 = math.radians(lat0), math.radians(lon0)
    def f(lon, lat):
        p, l = math.radians(lat), math.radians(lon)
        c = 1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        k = math.sqrt(2 / c)
        return (R * k * math.cos(p) * math.sin(l - l0), R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0)))
    return f

def aire(pts):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]))) / 2

def centre(pts):
    a = cx = cy = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        c = x1 * y2 - x2 * y1; a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c
    return (cx / (3 * a), cy / (3 * a)) if a else pts[0]

def dp(pts, tol):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; n2 = dx * dx + dy * dy
    def dist(p):
        if n2 == 0: return math.hypot(p[0] - x1, p[1] - y1)
        t = max(0, min(1, ((p[0] - x1) * dx + (p[1] - y1) * dy) / n2)); return math.hypot(p[0] - x1 - t * dx, p[1] - y1 - t * dy)
    i, m = max(((i, dist(p)) for i, p in enumerate(pts[1:-1], 1)), key=lambda x: x[1])
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol) if m > tol else [pts[0], pts[-1]]

def forme(feature):
    g = feature["geometry"]
    anneaux = [poly[0] for poly in ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"])]
    # Partie principale : le plus grand anneau, mesuré dans une projection centrée sur lui-même
    def aire_km(r):
        lon, lat = centre(r); f = laea(lon, lat); return aire([f(*p) for p in r])
    principal = max(anneaux, key=aire_km)
    lon0, lat0 = centre(principal)
    f = laea(lon0, lat0)
    proj = [[f(*p) for p in r] for r in anneaux]
    a_princ = aire(proj[anneaux.index(principal)])
    cp = centre(proj[anneaux.index(principal)])
    rayon = max(1200, 2 * math.sqrt(a_princ))
    total = sum(aire(p) for p in proj)
    # Gardé : proche de la partie principale, ou au moins un dixième du pays (péninsule malaise, Papouasie, Alaska)
    distance = lambda p: math.hypot(*(a - b for a, b in zip(centre(p), cp)))
    gardes = [p for p in proj if distance(p) <= rayon + math.sqrt(aire(p)) or (aire(p) >= 0.1 * total and distance(p) <= 5000)]
    a_gardee = sum(aire(p) for p in gardes)
    gardes = [p for p in gardes if aire(p) >= 0.003 * a_gardee]
    a_dessinee = sum(aire(p) for p in gardes)
    taille = math.sqrt(a_dessinee)
    tol = 0.006 * taille
    unite = taille / 400          # coordonnées entières, environ 400 unités pour la taille du pays
    chemins = []
    for p in gardes:
        mid = len(p) // 2
        s = dp(p[:mid + 1], tol)[:-1] + dp(p[mid:], tol)
        pts = []
        for x, y in s:
            q = (round(x / unite), round(-y / unite))   # SVG : y vers le bas
            if not pts or pts[-1] != q: pts.append(q)
        if len(pts) < 3: continue
        d = "M%d %d" % pts[0] + "l" + " ".join("%d %d" % (b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) + "z"
        chemins.append(d)
    return {"e": round(unite, 5), "d": "".join(chemins), "loin": (total - a_dessinee) / total > 0.02, "aire": round(a_dessinee)}

def main():
    ne = json.load(open(sys.argv[1], encoding="utf-8"))
    src = open(os.path.join(STATIC, "pays.js"), encoding="utf-8").read()
    ids = re.findall(r'\{"id": "([A-Z0-9]{3})"', src)
    par_code = {}
    for feat in ne["features"]:
        for k in ("WB_A3", "ISO_A3", "ADM0_A3"):
            c = feat["properties"].get(k)
            if c and c != "-99": par_code.setdefault(c, feat)
    formes, absents = {}, []
    surfaces = dict(re.findall(r'\{"id": "([A-Z0-9]{3})"[^}]*?"surf": ([0-9.]+)', src))
    ecartes = []
    for i in ids:
        if i not in par_code: absents.append(i); continue
        f = forme(par_code[i])
        # La forme doit montrer la surface que le jeu annonce : à 20 % près, sinon le jeu garde ses carrés
        if i in surfaces and 0.8 <= f["aire"] / float(surfaces[i]) <= 1.2: formes[i] = f
        else: ecartes.append("%s (%.2f)" % (i, f["aire"] / float(surfaces[i])) if i in surfaces else i)
    print("écartés :", " ".join(ecartes))
    lignes = ",\n".join('  "%s": [%s, "%s"%s]' % (i, f["e"], f["d"], ", 1" if f["loin"] else "") for i, f in formes.items())
    sortie = ("// pays-formes.js : contour de chaque pays, pour comparer des surfaces à la même échelle (« Plus ou moins ? »).\n"
              "// Fichier généré par tests/pays/formes.py à partir de Natural Earth, Admin 0 – Countries, 1:50 000 000 (v5.1.2,\n"
              "// naturalearthdata.com, domaine public) : ne pas modifier à la main. Projection azimutale équivalente de Lambert\n"
              "// centrée sur chaque pays (les aires sont conservées). Format : [km par unité, chemin SVG en unités entières,\n"
              "// 1 si des territoires éloignés ne sont pas dessinés].\n"
              "const FORMES_PAYS = {\n" + lignes + "\n};\n")
    open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(STATIC, "pays-formes.js"), "w", encoding="utf-8").write(sortie)
    print(len(formes), "formes ;", len(sortie) // 1024, "Ko ; absents :", " ".join(absents) or "aucun")
    return formes

if __name__ == "__main__":
    main()
