#!/usr/bin/env python3
"""Recompresse une image PNG sans perte, en Python pur (aucune bibliothèque à installer) :
palette de couleurs si l'image en compte 256 au plus, meilleur filtre ligne par ligne, compression zlib maximale,
métadonnées retirées. python3 tests/pages/optimiser_png.py entree.png [sortie.png] [--palette]
Avec --palette (avec perte, pour les dessins à aplats) : les 256 couleurs les plus fréquentes sont gardées, chaque
autre pixel prend la plus proche d'entre elles ; l'écart maximal est affiché."""
import struct, sys, zlib

def lire_png(chemin):
    d = open(chemin, "rb").read()
    assert d[:8] == b"\x89PNG\r\n\x1a\n", "pas un PNG"
    pos, idat, ihdr, plte, trns = 8, b"", None, None, None
    while pos < len(d):
        n, = struct.unpack(">I", d[pos:pos + 4]); typ = d[pos + 4:pos + 8]; data = d[pos + 8:pos + 8 + n]; pos += 12 + n
        if typ == b"IHDR": ihdr = struct.unpack(">IIBBBBB", data)
        elif typ == b"PLTE": plte = data
        elif typ == b"tRNS": trns = data
        elif typ == b"IDAT": idat += data
    l, h, prof, couleur, _, _, entrelace = ihdr
    assert prof == 8 and entrelace == 0 and couleur in (2, 3, 6), "format non pris en charge"
    canaux = {2: 3, 3: 1, 6: 4}[couleur]
    brut = zlib.decompress(idat)
    lignes, prec, ligne_octets = [], bytearray(l * canaux), l * canaux
    for y in range(h):
        f = brut[y * (ligne_octets + 1)]; c = bytearray(brut[y * (ligne_octets + 1) + 1:(y + 1) * (ligne_octets + 1)])
        for i in range(ligne_octets):
            a = c[i - canaux] if i >= canaux else 0; b = prec[i]; cc = prec[i - canaux] if i >= canaux else 0
            if f == 1: c[i] = (c[i] + a) & 255
            elif f == 2: c[i] = (c[i] + b) & 255
            elif f == 3: c[i] = (c[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - cc; pa, pb, pc = abs(p - a), abs(p - b), abs(p - cc)
                c[i] = (c[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else cc)) & 255
        lignes.append(bytes(c)); prec = c
    # Pixels en RGBA
    pixels = []
    for c in lignes:
        if couleur == 6: pixels.append([tuple(c[i:i + 4]) for i in range(0, len(c), 4)])
        elif couleur == 2: pixels.append([tuple(c[i:i + 3]) + (255,) for i in range(0, len(c), 3)])
        else:
            pal = [tuple(plte[i:i + 3]) for i in range(0, len(plte), 3)]
            alpha = list(trns or b"") + [255] * 256
            pixels.append([pal[v] + (alpha[v],) for v in c])
    return l, h, pixels

def filtrer(lignes, bpp):
    # Pour chaque ligne, le filtre qui donne la plus petite somme des valeurs absolues (heuristique classique)
    sortie, prec = b"", bytes(len(lignes[0]))
    for c in lignes:
        candidats = []
        for f in range(5):
            r = bytearray(len(c))
            for i in range(len(c)):
                a = c[i - bpp] if i >= bpp else 0; b = prec[i]; cc = prec[i - bpp] if i >= bpp else 0
                if f == 0: v = c[i]
                elif f == 1: v = c[i] - a
                elif f == 2: v = c[i] - b
                elif f == 3: v = c[i] - (a + b) // 2
                else:
                    p = a + b - cc; pa, pb, pc = abs(p - a), abs(p - b), abs(p - cc)
                    v = c[i] - (a if pa <= pb and pa <= pc else b if pb <= pc else cc)
                r[i] = v & 255
            candidats.append((sum(x if x < 128 else 256 - x for x in r), f, bytes(r)))
        _, f, r = min(candidats)
        sortie += bytes([f]) + r; prec = c
    return sortie

def bloc(typ, data):
    return struct.pack(">I", len(data)) + typ + data + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)

def ecrire_png(chemin, l, h, pixels):
    couleurs = sorted({p for ligne in pixels for p in ligne})
    opaque = all(p[3] == 255 for p in couleurs)
    if len(couleurs) <= 256:
        index = {p: i for i, p in enumerate(couleurs)}
        lignes = [bytes(index[p] for p in ligne) for ligne in pixels]
        tete = struct.pack(">IIBBBBB", l, h, 8, 3, 0, 0, 0)
        extra = bloc(b"PLTE", b"".join(bytes(p[:3]) for p in couleurs))
        if not opaque: extra += bloc(b"tRNS", bytes(p[3] for p in couleurs))
        donnees = b"".join(bytes([0]) + c for c in lignes)   # avec une palette, l'absence de filtre est la règle
    else:
        bpp = 3 if opaque else 4
        lignes = [b"".join(bytes(p[:bpp]) for p in ligne) for ligne in pixels]
        tete = struct.pack(">IIBBBBB", l, h, 8, 2 if opaque else 6, 0, 0, 0)
        extra = b""
        donnees = filtrer(lignes, bpp)
    png = b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", tete) + extra + bloc(b"IDAT", zlib.compress(donnees, 9)) + bloc(b"IEND", b"")
    open(chemin, "wb").write(png)
    return len(couleurs)

def reduire_palette(pixels):
    from collections import Counter
    frequences = Counter(p for ligne in pixels for p in ligne)
    gardees = [p for p, _ in frequences.most_common(256)]
    proche, ecart = {}, 0
    for p in frequences:
        if p in proche: continue
        q = min(gardees, key=lambda g: sum((a - b) ** 2 for a, b in zip(p, g)))
        proche[p] = q; ecart = max(ecart, max(abs(a - b) for a, b in zip(p, q)))
    return [[proche[p] for p in ligne] for ligne in pixels], ecart

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    entree = args[0]; sortie = args[1] if len(args) > 1 else entree
    avant = len(open(entree, "rb").read())
    l, h, pixels = lire_png(entree)
    ecart = 0
    if "--palette" in sys.argv: pixels, ecart = reduire_palette(pixels)
    n = ecrire_png(sortie, l, h, pixels)
    apres = len(open(sortie, "rb").read())
    # Vérification : l'image écrite est bien celle voulue, pixel pour pixel
    assert lire_png(sortie)[2] == pixels, "image modifiée"
    print(f"{entree} : {avant} → {apres} octets ({n} couleurs)" + (f", écart maximal {ecart} sur 255 par canal" if ecart else ", identique pixel pour pixel"))
