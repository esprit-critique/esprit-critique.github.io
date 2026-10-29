#!/usr/bin/env python3
"""Génère static/pays.js à partir des fichiers JSON de la Banque mondiale et du HCR.
Télécharger d'abord les données : ./telecharger.sh (elles vont dans cache/, non versionné)."""
import json, os, collections, datetime

ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "static", "pays.js")

# Noms français (pays souverains uniquement ; territoires exclus)
NOMS = {
 "IND":"Inde","CHN":"Chine","USA":"États-Unis","IDN":"Indonésie","PAK":"Pakistan","NGA":"Nigeria","BRA":"Brésil",
 "BGD":"Bangladesh","RUS":"Russie","ETH":"Éthiopie","MEX":"Mexique","JPN":"Japon","EGY":"Égypte","PHL":"Philippines",
 "COD":"République démocratique du Congo","VNM":"Viêt Nam","IRN":"Iran","TUR":"Turquie","DEU":"Allemagne","THA":"Thaïlande",
 "TZA":"Tanzanie","GBR":"Royaume-Uni","FRA":"France","ZAF":"Afrique du Sud","ITA":"Italie","KEN":"Kenya","MMR":"Birmanie",
 "COL":"Colombie","KOR":"Corée du Sud","SDN":"Soudan","UGA":"Ouganda","ESP":"Espagne","DZA":"Algérie","IRQ":"Irak",
 "ARG":"Argentine","AFG":"Afghanistan","YEM":"Yémen","CAN":"Canada","AGO":"Angola","UKR":"Ukraine","MAR":"Maroc",
 "UZB":"Ouzbékistan","SAU":"Arabie saoudite","POL":"Pologne","MYS":"Malaisie","MOZ":"Mozambique","GHA":"Ghana","PER":"Pérou",
 "MDG":"Madagascar","CIV":"Côte d'Ivoire","CMR":"Cameroun","NPL":"Népal","VEN":"Venezuela","NER":"Niger","AUS":"Australie",
 "PRK":"Corée du Nord","SYR":"Syrie","MLI":"Mali","BFA":"Burkina Faso","MWI":"Malawi","ZMB":"Zambie","LKA":"Sri Lanka",
 "TCD":"Tchad","KAZ":"Kazakhstan","CHL":"Chili","SOM":"Somalie","ROU":"Roumanie","SEN":"Sénégal","GTM":"Guatemala",
 "ECU":"Équateur","NLD":"Pays-Bas","KHM":"Cambodge","ZWE":"Zimbabwe","GIN":"Guinée","BEN":"Bénin","RWA":"Rwanda",
 "BDI":"Burundi","BOL":"Bolivie","TUN":"Tunisie","SSD":"Soudan du Sud","BEL":"Belgique","HTI":"Haïti","JOR":"Jordanie",
 "DOM":"République dominicaine","ARE":"Émirats arabes unis","HND":"Honduras","CUB":"Cuba","CZE":"Tchéquie","PRT":"Portugal",
 "TJK":"Tadjikistan","PNG":"Papouasie-Nouvelle-Guinée","SWE":"Suède","GRC":"Grèce","AZE":"Azerbaïdjan","ISR":"Israël",
 "HUN":"Hongrie","AUT":"Autriche","CHE":"Suisse","BLR":"Biélorussie","SLE":"Sierra Leone","TGO":"Togo","LAO":"Laos",
 "TKM":"Turkménistan","LBY":"Libye","KGZ":"Kirghizistan","PRY":"Paraguay","NIC":"Nicaragua","SRB":"Serbie","COG":"Congo",
 "BGR":"Bulgarie","SLV":"Salvador","SGP":"Singapour","DNK":"Danemark","LBN":"Liban","LBR":"Liberia","FIN":"Finlande",
 "NOR":"Norvège","CAF":"Centrafrique","OMN":"Oman","IRL":"Irlande","SVK":"Slovaquie","NZL":"Nouvelle-Zélande",
 "MRT":"Mauritanie","CRI":"Costa Rica","KWT":"Koweït","PAN":"Panama","GEO":"Géorgie","HRV":"Croatie","MNG":"Mongolie",
 "URY":"Uruguay","BIH":"Bosnie-Herzégovine","NAM":"Namibie","ARM":"Arménie","QAT":"Qatar","LTU":"Lituanie","JAM":"Jamaïque",
 "GAB":"Gabon","BWA":"Botswana","MDA":"Moldavie","ALB":"Albanie","SVN":"Slovénie","LVA":"Lettonie","MKD":"Macédoine du Nord",
 "BHR":"Bahreïn","CYP":"Chypre","EST":"Estonie","MUS":"Maurice","LUX":"Luxembourg","MLT":"Malte","ISL":"Islande",
 "MNE":"Monténégro","BTN":"Bhoutan","MDV":"Maldives","FJI":"Fidji","MCO":"Monaco"
}

# Indicateurs retenus. « ecart » : comment juger qu'un duel est intéressant (ni évident, ni à pile ou face)
INDICATEURS = [
 ("pop",   "SP.POP.TOTL",          "ratio", (1.2, 3.5)),
 ("surf",  "AG.SRF.TOTL.K2",       "ratio", (1.2, 3.5)),
 ("dens",  "EN.POP.DNST",          "ratio", (1.3, 4.0)),
 ("ev",    "SP.DYN.LE00.IN",       "diff",  (2.0, 9.0)),
 ("pib",   "NY.GDP.PCAP.PP.CD",    "ratio", (1.2, 3.0)),
 ("fec",   "SP.DYN.TFRT.IN",       "diff",  (0.3, 2.0)),
 ("age65", "SP.POP.65UP.TO.ZS",    "diff",  (3.0, 15.0)),
 ("mi",    "SP.DYN.IMRT.IN",       "ratio", (1.3, 4.0)),
 ("net",   "IT.NET.USER.ZS",       "diff",  (6.0, 30.0)),
 ("foret", "AG.LND.FRST.ZS",       "diff",  (6.0, 30.0)),
 ("co2",   "EN.GHG.CO2.PC.CE.AR5", "ratio", (1.3, 4.0)),
 ("croissance", "SP.POP.GROW",      "diff",  (0.4, 2.5)),
 ("pibtotal", "NY.GDP.MKTP.CD",     "ratio", (1.3, 4.0)),
 ("chomage", "SL.UEM.TOTL.ZS",      "diff",  (2.0, 12.0)),
 ("transferts", "BX.TRF.PWKR.DT.GD.ZS", "diff", (3.0, 25.0)),
 ("armee", "MS.MIL.XPND.GD.ZS",     "diff",  (0.6, 4.0)),
 ("armeeusd", "MS.MIL.XPND.CD",     "ratio", (1.3, 4.0)),
 ("femmes", "SG.GEN.PARL.ZS",       "diff",  (6.0, 25.0)),
]
ARRONDI = {"pop": 0, "surf": 0, "dens": 1, "ev": 1, "pib": 0, "fec": 2, "age65": 1, "mi": 1, "net": 1, "foret": 1, "co2": 2,
           "croissance": 2, "pibtotal": 0, "chomage": 1, "transferts": 1, "armee": 2, "armeeusd": 0, "femmes": 1}
# Seuil minimal des deux valeurs d'un duel (sinon la comparaison porte sur des nombres insignifiants)
MINIMUMS = {"refugies": 10000, "refugieshab": 1, "origine": 10000, "transferts": 0.5}

meta = {c["id"]: c for c in json.load(open(os.path.join(ICI, "pays.json")))[1]}
pays = {iso: {"id": iso, "nom": nom, "lat": round(float(meta[iso]["latitude"] or 0), 1)} for iso, nom in NOMS.items()}
annees, monde = {}, {}
for cle, code, _, _ in INDICATEURS:
    lignes = json.load(open(os.path.join(ICI, code + ".json")))[1]
    par_pays = {r["countryiso3code"]: r for r in lignes if r["value"] is not None}
    compte = collections.Counter(r["date"] for iso, r in par_pays.items() if iso in NOMS)
    annee = int(compte.most_common(1)[0][0])
    annees[cle] = annee
    for iso in NOMS:
        r = par_pays.get(iso)
        if r is None or int(r["date"]) < annee - 1:
            continue                      # valeur absente ou trop ancienne : le pays n'est pas proposé pour cet indicateur
        v = round(r["value"], ARRONDI[cle])
        if ARRONDI[cle] == 0: v = int(v)
        pays[iso][cle] = v
        if int(r["date"]) != annee:
            pays[iso].setdefault("annees", {})[cle] = int(r["date"])
    # Valeur mondiale, pour situer les deux pays
    w = json.load(open(os.path.join(ICI, "WLD_" + code + ".json")))[1] if os.path.exists(os.path.join(ICI, "WLD_" + code + ".json")) else None
    if w:
        vals = [r for r in w if r["value"] is not None and int(r["date"]) == annee]
        if vals: monde[cle] = round(vals[0]["value"], ARRONDI[cle] if ARRONDI[cle] else 1)

# Réfugiés (HCR, fin 2024) : réfugiés relevant du HCR et autres personnes ayant besoin d'une protection
# internationale, par pays d'accueil et par pays d'origine ; et par rapport à la population de 2024.
nb = lambda v: float(v) if v not in (None, "-", "") else 0.0
pop2024 = {r["countryiso3code"]: r["value"] for r in json.load(open(os.path.join(ICI, "pop2024.json")))[1] if r["value"]}
for fichier, cle, champ in [("hcr_asile.json", "refugies", "coa_iso"), ("hcr_origine.json", "origine", "coo_iso")]:
    for r in json.load(open(os.path.join(ICI, fichier)))["items"]:
        iso = r[champ]
        if iso in pays:
            total = nb(r["refugees"]) + nb(r["oip"])
            pays[iso][cle] = int(round(total, -2)) if total >= 1000 else int(total)
            if cle == "refugies" and iso in pop2024:
                pays[iso]["refugieshab"] = round(1000 * total / pop2024[iso], 1)
annees.update({"refugies": 2024, "refugieshab": 2024, "origine": 2024})
INDICATEURS += [("refugies", None, "ratio", (1.4, 6.0)), ("refugieshab", None, "ratio", (1.5, 6.0)), ("origine", None, "ratio", (1.4, 6.0))]

manquants = {cle: [p["nom"] for p in pays.values() if cle not in p] for cle, *_ in INDICATEURS}
for cle, m in manquants.items():
    if m: print(f"{cle} ({annees[cle]}) : {len(m)} sans valeur — {', '.join(m[:12])}")

lignes = []
for p in sorted(pays.values(), key=lambda p: p["nom"]):
    lignes.append("  " + json.dumps(p, ensure_ascii=False, separators=(", ", ": ")))
aujourd_hui = datetime.date.today().isoformat()
js = f"""// pays.js : données par pays de la Banque mondiale (World Development Indicators, data.worldbank.org).
// Fichier généré automatiquement le {aujourd_hui} à partir de l'API de la Banque mondiale : ne pas modifier à la main.
// Chaque indicateur est donné pour l'année indiquée dans ANNEES_PAYS ; « annees » signale les rares exceptions.
// lat : latitude de la capitale (sert à signaler l'effet de la projection de Mercator).
// Réfugiés : données du HCR (api.unhcr.org), fin 2024 ; dépenses militaires : SIPRI, via la Banque mondiale.

const ANNEES_PAYS = {json.dumps(annees)};

// Valeurs mondiales (agrégat « Monde » de la Banque mondiale), même année
const MONDE_PAYS = {json.dumps(monde)};

// Seuils qui rendent un duel intéressant : rapport entre les valeurs, ou écart absolu ;
// troisième nombre éventuel : valeur minimale exigée des deux pays
const ECARTS_PAYS = {json.dumps({cle: [mode, list(bornes)] + ([MINIMUMS[cle]] if cle in MINIMUMS else []) for cle, _, mode, bornes in INDICATEURS})};

const PAYS = [
""" + ",\n".join(lignes) + "\n];\n"
open(SORTIE, "w").write(js)
print("pays.js :", len(pays), "pays,", os.path.getsize(SORTIE), "octets ; années :", annees)
print("monde :", monde)
