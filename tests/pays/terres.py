# Usage : python3 tests/pays/terres.py ne_110m_land.geojson 0.2 (fichier de https://github.com/nvkelso/natural-earth-vector, geojson/)
# Simplifie Natural Earth 110m land : Douglas-Peucker (tolérance en degrés), dixièmes de degré, en texte compact.
import json, sys
src, tol = sys.argv[1], float(sys.argv[2])
def dp(pts, tol):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; n2 = dx * dx + dy * dy
    def dist(p):
        if n2 == 0: return ((p[0]-x1)**2 + (p[1]-y1)**2) ** .5
        t = max(0, min(1, ((p[0]-x1)*dx + (p[1]-y1)*dy) / n2)); return ((p[0]-x1-t*dx)**2 + (p[1]-y1-t*dy)**2) ** .5
    i, m = max(((i, dist(p)) for i, p in enumerate(pts[1:-1], 1)), key=lambda x: x[1])
    return dp(pts[:i+1], tol)[:-1] + dp(pts[i:], tol) if m > tol else [pts[0], pts[-1]]
d = json.load(open(src)); anneaux = []
for f in d['features']:
    g = f['geometry']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for poly in polys:
        r = poly[0]   # contour extérieur seulement (les lacs ne sont pas des trous à cette échelle)
        mid = len(r) // 2   # couper en deux : Douglas-Peucker sur un anneau fermé
        s = dp(r[:mid+1], tol)[:-1] + dp(r[mid:], tol)
        pts = []
        for x, y in s:
            p = (round(x * 10), round(y * 10))
            if not pts or pts[-1] != p: pts.append(p)
        if len(pts) >= 4: anneaux.append(pts)
texte = ";".join(" ".join(f"{x},{y}" for x, y in a) for a in anneaux)
print(len(anneaux), "anneaux", sum(map(len, anneaux)), "points", len(texte), "octets", file=sys.stderr)
print(texte)
