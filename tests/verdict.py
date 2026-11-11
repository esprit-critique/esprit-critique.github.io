#!/usr/bin/env python3
"""Verdict d'un rapport de banc, d'après sa ligne « RÉSUMÉ » : code de sortie 0 s'il ne relève aucun échec.
Formes reconnues : « 12 / 12 vérifications réussies », « 0 défaut… ; 0 erreur(s) JavaScript »,
« aucun blocage ni erreur », « 0 niveau(x) sans assez d'items » ; « INACHEVÉ » ou un compte non nul échoue.
python3 tests/verdict.py RAPPORT       (sans argument : contrôle de ce script sur des exemples)"""
import re, sys


def echoue(resume):
    m = re.search(r"(\d+) / (\d+) vérifications", resume)
    return bool(not resume.startswith("RÉSUMÉ") or "INACHEVÉ" in resume or "ÉCHEC" in resume or (m and m.group(1) != m.group(2))
                or re.search(r"(?<![\d.,])[1-9]\d* (défaut|erreur|niveau|problème)", resume))


if len(sys.argv) < 2:
    for resume, attendu in [("RÉSUMÉ : 237 / 237 vérifications réussies ; 0 défaut(s) d'affichage", False),
                            ("RÉSUMÉ : 236 / 237 vérifications réussies ; 0 défaut(s) d'affichage", True),
                            ("RÉSUMÉ : 237 / 237 vérifications réussies ; 2 défaut(s) d'affichage", True),
                            ("RÉSUMÉ : 0 défaut (aucun) ; 14 exception(s) ignorée(s) ; 108 pages ; 0 erreur(s) JavaScript", False),
                            ("RÉSUMÉ : 0 défaut (aucun) ; 14 exception(s) ignorée(s) ; 108 pages ; 3 erreur(s) JavaScript", True),
                            ("RÉSUMÉ : aucun blocage ni erreur sur 18 adresses", False), ("RÉSUMÉ : 2 problème(s) sur 18 adresses", True),
                            ("RÉSUMÉ : 0 niveau(x) sans assez d'items, sur 36", False), ("RÉSUMÉ : 1 niveau(x) sans assez d'items, sur 36", True),
                            ("RÉSUMÉ : INACHEVÉ (délai)", True), ("RÉSUMÉ : 26 contrôle(s) réussi(s) ; ÉCHEC", True),
                            ("RÉSUMÉ : 27 contrôle(s) réussi(s) ; 0 échec", False), ("", True)]:
        assert echoue(resume) == attendu, resume
    print("verdict.py : exemples conformes")
    sys.exit(0)
lignes = open(sys.argv[1], encoding="utf-8").read().splitlines()
sys.exit(1 if echoue(next((l for l in lignes if l.startswith("RÉSUMÉ")), "")) else 0)
