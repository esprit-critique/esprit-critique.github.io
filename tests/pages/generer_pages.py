#!/usr/bin/env python3
"""Génère les pages fixes du site (mentions légales, confidentialité, conditions d'utilisation, page 404)
à partir d'un gabarit commun : même en-tête, même pied, même politique de sécurité que index.html (Trusted Types
compris), même politique de référent.
python3 tests/pages/generer_pages.py   (réécrit les fichiers dans static/)"""
import os, re, html, base64, hashlib

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")
MAJ = "12 novembre 2026"

# Même CSP et même script de thème que la page principale de la langue (le script est autorisé par son empreinte) :
# la page française redirige vers en/ si l'anglais a été choisi, la page anglaise non, d'où un gabarit par langue
GABARITS = {}
for langue, chemin in (("fr", "index.html"), ("en", os.path.join("en", "index.html"))):
    index = open(os.path.join(STATIC, chemin), encoding="utf-8").read()
    csp = re.search(r'  <meta http-equiv="Content-Security-Policy"[^\n]*\n', index).group(0)
    theme = re.search(r"  <script>try \{.*?</script>\n", index, re.S).group(0)
    # Les pages fixes n'ont pas à rediriger vers en/ (la redirection de la page d'accueil enverrait vers l'accueil anglais) :
    # script de thème seul, avec son empreinte dans la CSP
    theme = re.sub(r' if \(JSON\.parse\(localStorage\.getItem\("langue"\)\) === "en"\) location\.replace\([^;]*\);', "", theme)
    empreinte = base64.b64encode(hashlib.sha256(re.search(r"<script>(.*?)</script>", theme, re.S).group(1).encode("utf-8")).digest()).decode()
    csp = re.sub(r"'sha256-[^']*'", "'sha256-" + empreinte + "'", csp)
    GABARITS[langue] = (csp, theme, re.search(r'        <svg class="embleme".*?</svg>\n', index, re.S).group(0))

# Même typographie que typo() dans app.js : espace fine insécable avant ; : ! ? et insécable dans les guillemets
def typo(texte):
    return (texte.replace(" ;", "\u202f;").replace(" :", "\u202f:").replace(" !", "\u202f!").replace(" ?", "\u202f?")
            .replace("« ", "«\u00a0").replace(" »", "\u00a0»"))

TEXTES = {
    "fr": {"accueil": "Retour à l'accueil d'Esprit critique", "retour": "Retour au site", "pied": ("Mentions légales", "Confidentialité", "Conditions d'utilisation"),
           "titre": "{} · Esprit critique"},
    "en": {"accueil": "Back to the Esprit critique home page", "retour": "Back to the site", "pied": ("Legal notice", "Privacy", "Terms of use"),
           "titre": "{} · Esprit critique"},
}

def page(fichier, titre, description, corps, racine="", indexer=True, langue="fr", pied=None):
    """Écrit une page fixe. langue « en » : fichier dans static/en/, ressources prises un niveau plus haut (racine « ../ »)."""
    CSP, THEME, EMBLEME = GABARITS[langue]
    t = TEXTES[langue]
    dossier = "en/" if langue == "en" else ""
    if langue == "en":
        racine = "../"
    lien = lambda p: racine + p
    if langue == "fr":
        corps = typo(corps)
    f1, f2, f3 = pied or ("mentions-legales.html", "confidentialite.html", "cgu.html")
    contenu = f'''<!DOCTYPE html>
<html lang="{langue}">
<head>
  <meta charset="UTF-8">
{CSP}  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{html.escape(titre)} · Esprit critique</title>
  <meta name="description" content="{html.escape(description)}">
{'' if indexer else '  <meta name="robots" content="noindex">' + chr(10)}  <link rel="canonical" href="https://esprit-critique.github.io/{dossier}{fichier if indexer else ''}">
  <link rel="icon" href="{lien('favicon.svg?v=3')}" type="image/svg+xml">
  <link rel="icon" href="{lien('icone-32.png?v=3')}" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="{lien('icone.png?v=3')}">
  <meta name="theme-color" content="#f6f4ef" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16130f" media="(prefers-color-scheme: dark)">
{THEME}  <link rel="preload" href="{lien('polices/newsreader-latin-opsz-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{lien('style.css')}">
</head>
<body>
  <div class="conteneur page-fixe">
    <header class="entete">
      <a class="marque" href="{'./' if langue == 'en' else lien('./')}" title="{t['accueil']}">
{EMBLEME}        <span>Esprit critique</span>
      </a>
    </header>
    <main>
      <article class="carte texte-fixe">
{corps}
      </article>
      <p class="retour-site"><a class="bouton" href="{'./' if langue == 'en' else lien('./')}">{t['retour']}</a></p>
    </main>
    <footer class="pied">
      <p><a href="{f1 if langue == 'en' else lien(f1)}">{t['pied'][0]}</a> · <a href="{f2 if langue == 'en' else lien(f2)}">{t['pied'][1]}</a> · <a href="{f3 if langue == 'en' else lien(f3)}">{t['pied'][2]}</a></p>
    </footer>
  </div>
</body>
</html>
'''
    open(os.path.join(STATIC, dossier + fichier), "w", encoding="utf-8").write(contenu)

DEPOT = "https://github.com/esprit-critique/esprit-critique.github.io"

page("mentions-legales.html", "Mentions légales", "Éditeur, hébergeur et licences du site Esprit critique.", f'''        <h1>Mentions légales</h1>
        <p class="source">Mises à jour le {MAJ}.</p>
        <h2>Éditeur</h2>
        <p>Esprit critique est un site personnel, non professionnel et non commercial, publié par GOATier (compte GitHub
        « Goatier-project »), dans l'organisation GitHub <a href="https://github.com/esprit-critique">esprit-critique</a>.
        Directeur de la publication : GOATier.</p>
        <p>Conformément à l'article 1-1, II de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique,
        l'éditeur, qui publie ce site à titre non professionnel, ne rend pas publiques ses coordonnées personnelles ; ses
        éléments d'identification ont été communiqués à l'hébergeur.</p>
        <h2>Contact</h2>
        <p>Pour signaler une erreur, poser une question ou exercer un droit : ouvrir un ticket sur
        <a href="{DEPOT}/issues">la page des tickets du dépôt</a> (un compte GitHub gratuit est nécessaire).</p>
        <h2>Hébergeur</h2>
        <p>GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.
        Téléphone : +1 415 857 5430. Site : <a href="https://github.com">github.com</a>.</p>
        <p>Serveur de synchronisation (facultative) : Cloudflare, Inc. (service Cloudflare Workers ; base de données située
        dans l'Union européenne), 101 Townsend Street, San Francisco, CA 94107, États-Unis. Téléphone : +1 888 993 5273.
        Site : <a href="https://www.cloudflare.com">cloudflare.com</a>.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Le code du site est sous licence MIT ; les textes (fiches, questions, explications, guide) sous licence
        Creative Commons Attribution 4.0 (CC BY 4.0) : vous pouvez les reprendre et les adapter en citant « Esprit critique,
        par GOATier ». Cette licence couvre les textes du site, pas les données d'autres organismes. Les données de la Banque
        mondiale sont sous licence CC BY 4.0, à l'exception des indicateurs qu'elle reprend d'autres organismes (dépenses
        militaires du SIPRI, réfugiés du HCR, chômage de l'OIT, sous-alimentation de la FAO, femmes au parlement de l'Union
        interparlementaire), qui restent soumis aux conditions de leur producteur. Chaque chiffre reste soumis aux
        conditions de la source indiquée à côté de lui. Détail : <a href="{DEPOT}/blob/main/LICENCE-CONTENU.md">licence des contenus</a>.
        Les titres sont composés en Newsreader (Production Type), sous <a href="polices/OFL.txt">licence SIL Open Font License 1.1</a>.</p>
        <h2>Sources des chiffres et attribution</h2>
        <p>Les chiffres du site viennent des sources suivantes, citées comme chacune le demande :</p>
        <ul>
          <li>Banque mondiale : « The World Bank, World Development Indicators » (licence CC BY 4.0).</li>
          <li>SIPRI (dépenses militaires, reprises par la Banque mondiale) : « Information from the Stockholm International Peace
          Research Institute (SIPRI) Military Expenditure Database », <a href="https://doi.org/10.55163/CQGC9685">doi.org/10.55163/CQGC9685</a>.
          Usage non commercial, d'une petite partie du jeu de données (moins de 10 %), comme le permettent ses conditions.</li>
          <li>HCR (réfugiés) : « UNHCR Refugee Population Statistics Database » (licence CC BY 4.0,
          <a href="https://www.unhcr.org/terms-use-datasets">conditions d'utilisation</a>).</li>
          <li>OIT (chômage) : base ILOSTAT de l'Organisation internationale du Travail (licence CC BY 4.0).</li>
          <li>FAO (sous-alimentation, superficies, forêts) : « FAO, [année], [base de données], licence CC BY 4.0 ».</li>
          <li>Union interparlementaire (femmes au parlement) : base Parline, via la Banque mondiale.</li>
          <li>OMS (causes de décès, santé) : « OMS, [titre du jeu de données], [année], [date de consultation] », avec les pays
          qui ont fourni les données. Ces données ne sont reprises qu'à des fins d'information sur la santé publique, sans
          promotion ni vente ; le nom et l'emblème de l'OMS ne servent pas à présenter le site.</li>
          <li>EM-DAT (catastrophes naturelles) : « EM-DAT, CRED / UCLouvain, Bruxelles, Belgique, www.emdat.be ». Seuls deux
          chiffres agrégés sont cités ; la base n'est pas redistribuée.</li>
          <li>Gapminder : « Based on free material from GAPMINDER.ORG, CC-BY LICENSE ».</li>
          <li>Autres sources (ONU, Insee, NASA, Our World in Data, études scientifiques…) : citées à côté de chaque chiffre,
          selon leurs propres conditions.</li>
        </ul>
        <h2>Contenus fictifs</h2>
        <p>Les situations, dialogues, débats, sites et organismes des exercices sont fictifs ; toute ressemblance avec des
        personnes ou des organisations existantes serait fortuite. Les études et les chiffres réels sont signalés comme tels,
        avec leur source.</p>''')

page("confidentialite.html", "Politique de confidentialité", "Esprit critique : progression gardée dans le navigateur, sans cookie ni mesure d'audience ; synchronisation facultative, chiffrée sur l'appareil.", f'''        <h1>Politique de confidentialité</h1>
        <p class="source">Mise à jour le {MAJ}.</p>
        <p><strong>En bref : sans synchronisation, aucune donnée ne quitte votre navigateur.</strong> Si vous activez la
        synchronisation, une copie chiffrée de votre progression est gardée chez Cloudflare sous un identifiant dérivé de
        votre code : ce sont des données pseudonymisées, donc des données personnelles au sens du RGPD (détail plus bas). Pas de cookie, de mesure d'audience, de publicité ni de ressource extérieure (polices,
        scripts ou images d'autres sites). Si vous activez la synchronisation, une copie chiffrée sur votre appareil est
        conservée chez un hébergeur ; personne d'autre que vous ne peut la lire, pas même l'éditeur.</p>
        <h2>Ce qui reste dans votre navigateur</h2>
        <p>Votre progression est enregistrée dans le stockage local de votre navigateur (« localStorage ») : fiches acquises,
        réponses et révisions du quiz, résultats et niveaux des ateliers, prévisions et décisions que vous notez, repérages,
        fiches lues, parcours suivis, maîtrise, grade, points de lucidité et distinctions, objectif du jour, pseudonyme
        (facultatif) et réglages (thème, animations, mode sobre). Sans synchronisation, ces données ne quittent jamais votre appareil ; l'éditeur n'y a jamais accès. Elles servent uniquement
        au fonctionnement que vous demandez : ce stockage strictement nécessaire n'exige pas de consentement (article 82
        de la loi Informatique et Libertés), d'où l'absence de bandeau.</p>
        <p>Le site garde aussi, dans votre navigateur, jusqu'à quatre copies de cette progression : une par jour, et une juste
        avant un import ou une restauration. Elles permettent de revenir en arrière depuis <a href="./#guide/donnees">Vos données</a>.</p>
        <p>Pour lire le site hors connexion, votre navigateur garde aussi une copie des fichiers du site (service worker).
        Elle ne contient aucune donnée vous concernant.</p>
        <h2>Vos droits sur ces données</h2>
        <p>Vous les exercez depuis le site, sans compte : l'éditeur ne peut ni lire votre copie en ligne ni la retrouver sans
        votre code.</p>
        <ul>
          <li>Accès et portabilité : « Enregistrer dans un fichier », dans <a href="./#guide/donnees">Vos données</a>.</li>
          <li>Suppression de la copie en ligne : « Supprimer la copie en ligne », dans
          <a href="./#profil/reglages">Profil, Réglages</a> (suppression immédiate sur le serveur).</li>
          <li>Les effacer : « Effacer ma progression », au même endroit (les copies automatiques sont effacées aussi), ou en effaçant les données de navigation du site.</li>
          <li>Les fichiers que le site crée (sauvegarde, agenda .ics) sont fabriqués sur votre appareil et ne sont envoyés nulle part.</li>
        </ul>
        <h2>Synchronisation (facultative)</h2>
        <p>Si vous l'activez (Profil, Réglages), votre progression est chiffrée dans votre navigateur (AES-256-GCM) avant
        d'être envoyée. Le serveur garde, pour chaque copie : un identifiant de 32 caractères dérivé de votre code,
        l'empreinte (SHA-256) d'un jeton lui aussi dérivé de votre code, le contenu chiffré (256 Ko au plus), un numéro de
        version, et les dates de création et de dernière écriture. Ni votre code, ni votre pseudonyme, ni votre adresse IP
        ne sont enregistrés dans cette base. Aucune adresse électronique, aucun nom, aucun mot de passe ne sont collectés ;
        le site ne peut pas récupérer un code perdu. Le code est gardé sur vos appareils connectés, pour pouvoir être
        réaffiché.</p>
        <p>Ces éléments sont des données pseudonymisées : personne ne peut lire le contenu sans votre code, mais ils restent
        des données personnelles au sens du RGPD.</p>
        <ul>
          <li>Base légale : votre consentement (article 6, paragraphe 1, a du RGPD). La synchronisation n'est activée que si
          vous le demandez ; vous retirez votre consentement en supprimant la copie en ligne.</li>
          <li>Où : dans une base Cloudflare D1 créée avec la juridiction « Union européenne » (stockage dans l'Union).</li>
          <li>Combien de temps : tant que vous l'utilisez ; une purge quotidienne supprime toute copie restée 24 mois sans
          écriture.</li>
          <li>Sous-traitant : Cloudflare, Inc. (service Cloudflare Workers et base D1), selon son contrat de traitement des
          données. Comme tout hébergeur, Cloudflare voit l'adresse IP des requêtes, que le serveur du site n'enregistre pas.</li>
          <li>Transfert hors de l'Union : Cloudflare est une société américaine, et les requêtes peuvent être traitées par
          ses centres de données hors de l'Union européenne. Ces transferts sont encadrés par la certification de Cloudflare
          au cadre de protection des données UE–États-Unis (Data Privacy Framework) et, à défaut, par les clauses
          contractuelles types de la Commission européenne (décision 2021/914).</li>
        </ul>
        <h2>L'hébergeur</h2>
        <p>Le site est hébergé par GitHub Pages. Comme tout hébergeur, GitHub reçoit les demandes de pages : selon sa
        documentation, l'adresse IP des visiteurs est enregistrée et conservée pour des raisons de sécurité. L'éditeur n'a pas
        accès à ces journaux. Voir la <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement">déclaration de confidentialité de GitHub</a>.</p>
        <h2>Partage</h2>
        <p>Le bouton « Partager » ouvre le menu de partage de votre appareil, ou copie le lien : le site n'envoie rien lui-même.
        Les images « Partager cette carte » et « Partager mon grade » sont dessinées sur votre appareil, puis confiées au menu
        de partage ou enregistrées dans vos fichiers : elles ne passent par aucun serveur.</p>
        <p>Installer le site comme une application (écran d'accueil) ne transmet rien non plus : votre appareil garde la page
        et ses fichiers.</p>
        <h2>Contact et réclamation</h2>
        <p>Pour toute question : <a href="{DEPOT}/issues">tickets du dépôt</a> (un compte GitHub est nécessaire ; vos droits,
        eux, s'exercent sans compte, depuis le site). Vous pouvez aussi adresser une réclamation à la
        CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).</p>''')

page("cgu.html", "Conditions d'utilisation", "Conditions d'utilisation du site Esprit critique : accès libre et gratuit, contenus pédagogiques sous licence libre.", f'''        <h1>Conditions d'utilisation</h1>
        <p class="source">Mises à jour le {MAJ}.</p>
        <h2>Objet</h2>
        <p>Esprit critique propose des fiches sur les biais cognitifs et les sophismes, un quiz et des ateliers. Utiliser
        le site vaut acceptation des présentes conditions.</p>
        <h2>Accès</h2>
        <p>Le site est libre, gratuit, sans inscription ni publicité. L'éditeur s'efforce de le garder accessible, sans
        pouvoir le garantir : il peut être interrompu, modifié ou fermé à tout moment, notamment pour maintenance.</p>
        <h2>Nature des contenus</h2>
        <p>Les contenus ont un but pédagogique. Ils sont sourcés et vérifiés avec soin, mais peuvent contenir des erreurs :
        signalez-les. Ils ne constituent ni un avis médical, ni un conseil financier, juridique ou psychologique. Les tests
        et bilans proposés (portrait, bilan avant et après…) sont des exercices, non des évaluations validées. La maîtrise,
        les grades et les points mesurent la réussite dans les jeux du site, pas l'intelligence ni l'esprit critique ; ils ne
        comparent personne à personne.</p>
        <p>Les situations, débats, sites et organismes des exercices sont fictifs.</p>
        <h2>Vos données</h2>
        <p>Votre progression reste dans votre navigateur, sauf si vous activez la synchronisation : voir la
        <a href="confidentialite.html">politique de confidentialité</a>. Vous êtes seul responsable de sa conservation ; le
        site propose de l'enregistrer dans un fichier. La synchronisation est un service gratuit, sans garantie de
        disponibilité ; gardez un fichier de sauvegarde (« Enregistrer dans un fichier ») pour ne rien perdre, ainsi que
        votre code de synchronisation, que le site ne peut pas récupérer.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Code sous licence MIT, textes sous licence CC BY 4.0 : vous pouvez les réutiliser, y compris à des fins
        commerciales, en citant la source. Les chiffres et données d'autres organismes restent soumis aux conditions de leur
        source, parfois plus strictes. Voir les <a href="mentions-legales.html">mentions légales</a>.</p>
        <h2>Liens vers d'autres sites</h2>
        <p>Les liens vers d'autres sites (sources, hébergeur) sont donnés à titre d'information ; l'éditeur n'est pas
        responsable de leur contenu.</p>
        <h2>Responsabilité</h2>
        <p>L'éditeur ne saurait être tenu responsable de l'usage fait des contenus, ni d'une perte de progression liée au
        navigateur (effacement des données, changement d'appareil).</p>
        <h2>Modification et droit applicable</h2>
        <p>Ces conditions peuvent évoluer ; la date de mise à jour figure en haut de la page. Elles sont soumises au droit français.</p>''')

page("404.html", "Page introuvable", "Cette adresse n'existe pas sur Esprit critique.", '''        <h1>Page introuvable</h1>
        <p>Cette adresse n'existe pas. Esprit critique tient presque entièrement en une seule page : les fiches, le quiz et
        les ateliers s'ouvrent depuis l'accueil.</p>
        <ul class="liens-404">
          <li><a href="/#biais">Les 51 biais cognitifs</a></li>
          <li><a href="/#sophismes">Les 39 sophismes</a></li>
          <li><a href="/#quiz">Le quiz</a></li>
          <li><a href="/#ateliers">Les 51 ateliers</a></li>
          <li><a href="/#guide">Le guide</a></li>
        </ul>''', racine="/", indexer=False)
# ---------------------------------------------------------------- pages anglaises (static/en/)
MAJ_EN = "12 November 2026"
PIED_EN = ("legal-notice.html", "privacy.html", "terms.html")

page("legal-notice.html", "Legal notice", "Publisher, host and licences of the Esprit critique website.", f'''        <h1>Legal notice</h1>
        <p class="source">Last updated {MAJ_EN}.</p>
        <h2>Publisher</h2>
        <p>Esprit critique is a personal, non-professional, non-commercial website published by GOATier (GitHub account
        “Goatier-project”), within the GitHub organisation <a href="https://github.com/esprit-critique">esprit-critique</a>.
        Publication director: GOATier.</p>
        <p>In accordance with Article 1-1, II of French Law No. 2004-575 of 21 June 2004 on confidence in the digital economy,
        the publisher, who runs this site on a non-professional basis, does not make personal contact details public; the
        information identifying the publisher has been provided to the host.</p>
        <h2>Contact</h2>
        <p>To report a mistake, ask a question or exercise a right: open an issue on
        <a href="{DEPOT}/issues">the repository’s issues page</a> (a free GitHub account is required).</p>
        <h2>Host</h2>
        <p>GitHub, Inc. (GitHub Pages service), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.
        Telephone: +1 415 857 5430. Website: <a href="https://github.com">github.com</a>.</p>
        <p>Sync server (optional): Cloudflare, Inc. (Cloudflare Workers service; database located in the European Union),
        101 Townsend Street, San Francisco, CA 94107, United States. Telephone: +1 888 993 5273.
        Website: <a href="https://www.cloudflare.com">cloudflare.com</a>.</p>
        <h2>Intellectual property</h2>
        <p>The site’s code is released under the MIT licence; the texts (entries, questions, explanations, guide) under the
        Creative Commons Attribution 4.0 licence (CC BY 4.0): you may reuse and adapt them, crediting “Esprit critique,
        by GOATier”. This licence covers the site’s texts, not data from other organisations. World Bank data are under the
        CC BY 4.0 licence, except for the indicators it takes from other organisations (SIPRI military expenditure, UNHCR
        refugees, ILO unemployment, FAO undernourishment, Inter-Parliamentary Union women in parliament), which remain subject
        to their producer’s terms. Each figure remains subject to the terms of the source given next to it.
        Details: <a href="{DEPOT}/blob/main/LICENCE-CONTENU.md">content licence</a>.
        Headings are set in Newsreader (Production Type), under the <a href="../polices/OFL.txt">SIL Open Font License 1.1</a>.</p>
        <h2>Sources of figures and attribution</h2>
        <p>The site’s figures come from the following sources, credited as each of them requires:</p>
        <ul>
          <li>World Bank: “The World Bank, World Development Indicators” (CC BY 4.0 licence).</li>
          <li>SIPRI (military expenditure, taken up by the World Bank): “Information from the Stockholm International Peace
          Research Institute (SIPRI) Military Expenditure Database”, <a href="https://doi.org/10.55163/CQGC9685">doi.org/10.55163/CQGC9685</a>.
          Non-commercial use of a small part of the dataset (less than 10%), as its terms allow.</li>
          <li>UNHCR (refugees): “UNHCR Refugee Population Statistics Database” (CC BY 4.0 licence,
          <a href="https://www.unhcr.org/terms-use-datasets">terms of use</a>).</li>
          <li>ILO (unemployment): ILOSTAT database of the International Labour Organization (CC BY 4.0 licence).</li>
          <li>FAO (undernourishment, land area, forests): “FAO, [year], [database], licence CC BY 4.0”.</li>
          <li>Inter-Parliamentary Union (women in parliament): Parline database, via the World Bank.</li>
          <li>WHO (causes of death, health): “WHO, [dataset title], [year], [date of access]”, with the countries that provided
          the data. These data are used only to inform about public health, with no promotion or sale; WHO’s name and emblem
          are not used to present the site.</li>
          <li>EM-DAT (natural disasters): “EM-DAT, CRED / UCLouvain, Brussels, Belgium, www.emdat.be”. Only two aggregate
          figures are quoted; the database is not redistributed.</li>
          <li>Gapminder: “Based on free material from GAPMINDER.ORG, CC-BY LICENSE”.</li>
          <li>Other sources (UN, Insee, NASA, Our World in Data, scientific studies…): credited next to each figure, under their
          own terms.</li>
        </ul>
        <h2>Fictional content</h2>
        <p>The situations, dialogues, debates, websites and organisations in the exercises are fictional; any resemblance to
        real people or organisations would be coincidental. Real studies and figures are flagged as such,
        with their source.</p>''', langue="en", pied=PIED_EN)

page("privacy.html", "Privacy policy", "Esprit critique: progress kept in your browser, no cookies or audience tracking; optional sync, encrypted on your device.", f'''        <h1>Privacy policy</h1>
        <p class="source">Last updated {MAJ_EN}.</p>
        <p><strong>In short: without sync, no data leaves your browser.</strong> If you turn on sync, an encrypted copy of your
        progress is kept by Cloudflare under an identifier derived from your code: this is pseudonymised data, and therefore
        personal data under the GDPR (details below). No cookies, audience tracking, advertising or external resources (fonts, scripts or images from other sites).
        If you turn on sync, a copy encrypted on your device is kept by a host; no one but you can read it, not even the publisher.</p>
        <h2>What stays in your browser</h2>
        <p>Your progress is saved in your browser’s local storage (“localStorage”): entries marked as learned, quiz answers
        and reviews, workshop results and levels, forecasts and decisions you record, anything you have spotted, cards read,
        paths followed, mastery, rank, clarity points and distinctions, daily goal, nickname (optional) and settings (theme,
        animations, plain mode). Without sync, this data never leaves your device; the publisher never has access to it. It is used only to provide
        the features you ask for: this strictly necessary storage does not require consent (Article 82 of the French Data
        Protection Act), which is why there is no banner.</p>
        <p>The site also keeps, in your browser, up to four copies of this progress: one per day, and one just before an
        import or a restoration. They let you go back from <a href="./#guide/donnees">Your data</a>.</p>
        <p>To let you read the site offline, your browser also keeps a copy of the site’s files (a service worker).
        It contains no data about you.</p>
        <h2>Your rights over this data</h2>
        <p>You exercise them from the site, with no account: the publisher can neither read your online copy nor find it
        without your code.</p>
        <ul>
          <li>Access and portability: “Save to a file”, in <a href="./#guide/donnees">Your data</a>.</li>
          <li>Deleting the online copy: “Delete the online copy”, in <a href="./#profil/reglages">Profile, Settings</a>
          (immediate deletion on the server).</li>
          <li>Erase it: “Erase my progress”, in the same place (the automatic copies are erased too), or by clearing the site’s browsing data.</li>
          <li>The files the site creates (backup, .ics calendar) are produced on your device and are not sent anywhere.</li>
        </ul>
        <h2>Sync (optional)</h2>
        <p>If you turn it on (Profile, Settings), your progress is encrypted in your browser (AES-256-GCM) before being sent.
        For each copy, the server keeps: a 32-character identifier derived from your code, the fingerprint (SHA-256) of a token
        also derived from your code, the encrypted content (256 KB at most), a version number, and the dates of creation and
        last write. Neither your code, nor your nickname, nor your IP address is recorded in this database. No email address,
        name or password is collected; the site cannot recover a lost code. The code is kept on your signed-in devices so
        that it can be shown again.</p>
        <p>This is pseudonymised data: no one can read the content without your code, but it remains personal data under
        the GDPR.</p>
        <ul>
          <li>Legal basis: your consent (Article 6(1)(a) GDPR). Sync is only turned on if you ask for it; you withdraw your
          consent by deleting the online copy.</li>
          <li>Where: in a Cloudflare D1 database created with the “European Union” jurisdiction (storage in the Union).</li>
          <li>How long: as long as you use it; a daily purge deletes any copy left 24 months without a write.</li>
          <li>Processor: Cloudflare, Inc. (Cloudflare Workers service and D1 database), under its data processing agreement.
          Like any host, Cloudflare sees the IP address of requests, which the site’s server does not record.</li>
          <li>Transfer outside the Union: Cloudflare is an American company, and requests may be handled by its data centres
          outside the European Union. These transfers are covered by Cloudflare’s certification under the EU–US Data Privacy
          Framework and, failing that, by the European Commission’s standard contractual clauses (Decision 2021/914).</li>
        </ul>
        <h2>The host</h2>
        <p>The site is hosted by GitHub Pages. Like any host, GitHub receives requests for pages: according to its
        documentation, visitors’ IP addresses are recorded and kept for security reasons. The publisher has no
        access to these logs. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub’s privacy statement</a>.</p>
        <h2>Sharing</h2>
        <p>The “Share” button opens your device’s sharing menu, or copies the link: the site itself sends nothing.
        The “Share this card” and “Share my rank” images are drawn on your device, then handed to the sharing menu or saved
        to your files: they go through no server.</p>
        <p>Installing the site as an app (home screen) sends nothing either: your device keeps the page and its files.</p>
        <h2>Contact and complaints</h2>
        <p>For any question: <a href="{DEPOT}/issues">the repository’s issues</a> (a GitHub account is required; your rights,
        however, are exercised from the site, with no account). You may also lodge a complaint with the
        CNIL, the French data protection authority (<a href="https://www.cnil.fr/en">cnil.fr</a>).</p>''', langue="en", pied=PIED_EN)

page("terms.html", "Terms of use", "Terms of use of the Esprit critique website: free and open access, educational content under a free licence.", f'''        <h1>Terms of use</h1>
        <p class="source">Last updated {MAJ_EN}.</p>
        <h2>Purpose</h2>
        <p>Esprit critique offers entries on cognitive biases and fallacies, a quiz and workshops. Using the site
        means accepting these terms.</p>
        <h2>Access</h2>
        <p>The site is free to use, with no registration and no advertising. The publisher does their best to keep it
        accessible, but cannot guarantee it: it may be interrupted, changed or closed at any time, in particular for maintenance.</p>
        <h2>Nature of the content</h2>
        <p>The content is educational. It is sourced and checked with care, but may contain errors:
        please report them. It is neither medical advice nor financial, legal or psychological advice. The tests
        and assessments offered (portrait, before-and-after assessment…) are exercises, not validated evaluations. Mastery,
        ranks and points measure success in the site’s games, not intelligence or critical thinking; they compare no one
        with anyone.</p>
        <p>The situations, debates, websites and organisations in the exercises are fictional.</p>
        <h2>Your data</h2>
        <p>Your progress stays in your browser, unless you turn on sync: see the <a href="privacy.html">privacy policy</a>.
        You alone are responsible for keeping it; the site offers to save it to a file. Sync is a free service with no
        guarantee of availability; keep a backup file (“Save to a file”) so as not to lose anything, as well as your sync
        code, which the site cannot recover.</p>
        <h2>Intellectual property</h2>
        <p>Code under the MIT licence, texts under the CC BY 4.0 licence: you may reuse them, including for
        commercial purposes, crediting the source. Figures and data from other organisations remain subject to the terms of
        their source, which are sometimes stricter. See the <a href="legal-notice.html">legal notice</a>.</p>
        <h2>Links to other sites</h2>
        <p>Links to other sites (sources, host) are given for information; the publisher is not
        responsible for their content.</p>
        <h2>Liability</h2>
        <p>The publisher cannot be held liable for the use made of the content, nor for any loss of progress caused by the
        browser (data being cleared, changing device).</p>
        <h2>Changes and applicable law</h2>
        <p>These terms may change; the date of the last update appears at the top of the page. They are governed by French law.</p>''', langue="en", pied=PIED_EN)
print("pages générées")
