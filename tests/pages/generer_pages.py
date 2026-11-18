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
          <li>Natural Earth (contours des terres du planisphère de « Le nord est où ? ») : « Made with Natural Earth »,
          naturalearthdata.com, domaine public.</li>
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
          <li>Natural Earth (land outlines of the world map in “Where is north?”): “Made with Natural Earth”,
          naturalearthdata.com, public domain.</li>
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
# ===================== Pages des fiches (biais/, sophismes/ et leurs versions anglaises) =====================
# Dans l'application, une fiche est une adresse en « # » (#biais/ancrage), que les moteurs de recherche ne traitent pas
# comme une page : chaque fiche a donc aussi une page statique, sans script autre que celui du thème, qui renvoie à la
# fiche interactive. Textes lus par fiches_donnees.js dans les fichiers du site, comme le site les affiche (aucune copie
# à tenir à jour) ; les questions du quiz (cas, cas2, casSup) n'y figurent pas, pour ne rien dévoiler.
import json, subprocess

SITE = "https://esprit-critique.github.io/"
DONNEES = json.loads(subprocess.run(["node", os.path.join(ICI, "fiches_donnees.js")], check=True, capture_output=True, text=True).stdout)
TYPES_FICHES = ("biais", "sophismes")

TEXTES_FICHES = {
    "fr": {"nature": {"biais": "biais cognitif", "sophismes": "sophisme"},
           "titre_liste": {"biais": "Les {} biais cognitifs", "sophismes": "Les {} sophismes"},
           "desc_liste": {"biais": "Les {} biais cognitifs d'Esprit critique, classés par thème : définition, mécanisme, exemple, parade et source de chacun.",
                          "sophismes": "Les {} sophismes d'Esprit critique, classés par thème : définition, schéma de l'argument, exemple, réponse et source de chacun."},
           "intro_liste": {"biais": "Un biais cognitif est une erreur de jugement systématique : il se produit chez presque tout le monde, dans le même sens. Chaque fiche dit d'où il vient et comment s'en prémunir.",
                           "sophismes": "Un sophisme est un raisonnement qui paraît valide sans l'être. Chaque fiche montre la forme de l'argument, pourquoi il ne tient pas et comment y répondre."},
           "autre_liste": {"biais": ("sophismes", "Voir aussi les sophismes"), "sophismes": ("biais", "Voir aussi les biais cognitifs")},
           "retour_liste": {"biais": "← Tous les biais", "sophismes": "← Tous les sophismes"},
           "entrainer": "S'entraîner", "entrainer_texte": "Dans l'application, chaque fiche propose de quoi s'entraîner à reconnaître la notion. Sans inscription : votre progression reste sur votre appareil.",
           "entrainer_bouton": "Ouvrir la fiche interactive", "ouvrir_liste": "S'entraîner dans l'application", "numero": {"biais": "Biais numéro {}, ", "sophismes": "Sophisme numéro {}, "},
           "titre_mecanisme": {"biais": "Mécanisme", "sophismes": "Pourquoi l'argument est invalide"},
           "titre_parade": {"biais": "Comment s'en prémunir", "sophismes": "Comment répondre"}},
    "en": {"nature": {"biais": "cognitive bias", "sophismes": "fallacy"},
           "titre_liste": {"biais": "The {} cognitive biases", "sophismes": "The {} fallacies"},
           "desc_liste": {"biais": "The {} cognitive biases of Esprit critique, grouped by theme: definition, mechanism, example, defence and source for each.",
                          "sophismes": "The {} fallacies of Esprit critique, grouped by theme: definition, argument diagram, example, response and source for each."},
           "intro_liste": {"biais": "A cognitive bias is a systematic error of judgement: it happens to almost everyone, in the same direction. Each entry explains where it comes from and how to protect yourself.",
                           "sophismes": "A fallacy is reasoning that looks valid but isn’t. Each entry shows the form of the argument, why it fails and how to respond."},
           "autre_liste": {"biais": ("sophismes", "See also the fallacies"), "sophismes": ("biais", "See also the cognitive biases")},
           "retour_liste": {"biais": "← All biases", "sophismes": "← All fallacies"},
           "entrainer": "Practise", "entrainer_texte": "In the app, each entry offers ways to practise recognising the concept. No sign-up: your progress stays on your device.",
           "entrainer_bouton": "Open the interactive entry", "ouvrir_liste": "Practise in the app", "numero": {"biais": "Bias number {}, ", "sophismes": "Fallacy number {}, "},
           "titre_mecanisme": {"biais": "Mechanism", "sophismes": "Why the argument is invalid"},
           "titre_parade": {"biais": "How to protect yourself", "sophismes": "How to respond"}},
}

def typo_fiche(texte, langue):
    """Même typographie que typo() dans app.js (le texte des fiches passe par elle dans l'application)."""
    if langue == "en":
        return texte
    texte = re.sub(r" ([;:!?%»])", "\u202f\\1", texte).replace("« ", "«\u202f")
    return re.sub(r"(\d) (?=\d{3}\b)", "\\1\u202f", texte)

def txt(texte, langue):
    """Texte des données : typographie, puis échappement de < > & et du guillemet droit (aucune balise ne peut venir
    des données, et le texte peut aller dans un attribut entre guillemets droits). L'apostrophe reste telle quelle."""
    return html.escape(typo_fiche(texte, langue), quote=False).replace('"', "&quot;")

def forme_html(lignes, langue):
    """Schéma de l'argument, comme schemaArgument() : la conclusion sous un trait, les variables (A, P, P'…) en <var>."""
    sortie, conclusion = [], False
    debut = r"^(So|Then|Therefore)\b" if langue == "en" else r"^(Donc|Alors)\b"
    for ligne in lignes:
        classe = ""
        if not conclusion and re.match(debut, ligne):
            classe, conclusion = ' class="conclusion"', True
        morceaux, pos, texte = [], 0, typo_fiche(ligne, langue)
        for m in re.finditer(r"(^|[^\w'’])([A-Z](?:['’′](?![^\W\d_]))?)(?![^\W\d_]|['’])", texte):
            d = m.start(2)
            morceaux.append(html.escape(texte[pos:d], quote=False) + "<var>" + html.escape(m.group(2), quote=False) + "</var>")
            pos = d + len(m.group(2))
        morceaux.append(html.escape(texte[pos:], quote=False))
        sortie.append(f"<p{classe}>{''.join(morceaux)}</p>")
    return '<div class="forme">' + "".join(sortie) + "</div>"

def section(titre, contenu_html, invisible_h2=None):
    if not contenu_html:
        return ""
    h2 = f'<h2 class="invisible">{invisible_h2}</h2>' if invisible_h2 else ""
    h3 = f"<h3>{titre}</h3>" if titre else ""
    return f'          <div class="section">{h2}{h3}{contenu_html}</div>\n'

def groupe(titre, sections):
    contenu = "".join(s for s in sections if s)
    return f'        <section class="groupe-fiche">\n          <h2>{titre}</h2>\n{contenu}        </section>\n' if contenu else ""

def classe_cat(categorie):
    """Classe de couleur d'une catégorie (fiches.css), d'après son glyphe, identique dans les deux langues."""
    assert re.fullmatch(r"[a-z-]+", categorie["glyphe"]) and re.fullmatch(r"#[0-9a-f]{6}", categorie["couleur"]), categorie
    return "cat-" + categorie["glyphe"]

def page_statique(langue, chemin, titre, description, alternes, corps, og_type="article"):
    """Écrit static/<chemin> (chemin relatif, en/… pour l'anglais) avec l'en-tête, la CSP et le pied des pages fixes."""
    CSP, THEME, EMBLEME = GABARITS[langue]
    t = TEXTES[langue]
    profondeur = chemin.count("/")
    racine = "../" * profondeur                         # vers static/
    accueil = racine + ("en/" if langue == "en" else "")  # accueil de la langue
    pied = ("legal-notice.html", "privacy.html", "terms.html") if langue == "en" else ("mentions-legales.html", "confidentialite.html", "cgu.html")
    url = SITE + chemin.removesuffix("index.html")
    liens_langues = "".join(f'  <link rel="alternate" hreflang="{l}" href="{SITE + c.removesuffix("index.html")}">\n' for l, c in alternes)
    contenu = f'''<!DOCTYPE html>
<html lang="{langue}">
<head>
  <meta charset="UTF-8">
{CSP}  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{titre} · Esprit critique</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{url}">
{liens_langues}  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="Esprit critique">
  <meta property="og:title" content="{titre}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}{'apercu-en.png' if langue == 'en' else 'apercu.png'}">
  <link rel="icon" href="{racine}favicon.svg?v=3" type="image/svg+xml">
  <link rel="icon" href="{racine}icone-32.png?v=3" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="{racine}icone.png?v=3">
  <meta name="theme-color" content="#f6f4ef" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16130f" media="(prefers-color-scheme: dark)">
{THEME}  <link rel="preload" href="{racine}polices/newsreader-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{racine}style.css">
  <link rel="stylesheet" href="{racine}fiches.css">
</head>
<body>
  <div class="conteneur page-fixe">
    <header class="entete">
      <a class="marque" href="{accueil}" title="{t['accueil']}">
{EMBLEME}        <span>Esprit critique</span>
      </a>
    </header>
    <main>
{corps}    </main>
    <footer class="pied">
      <p><a href="{accueil}{pied[0]}">{t['pied'][0]}</a> · <a href="{accueil}{pied[1]}">{t['pied'][1]}</a> · <a href="{accueil}{pied[2]}">{t['pied'][2]}</a></p>
    </footer>
  </div>
</body>
</html>
'''
    os.makedirs(os.path.dirname(os.path.join(STATIC, chemin)), exist_ok=True)
    open(os.path.join(STATIC, chemin), "w", encoding="utf-8").write(contenu)
    return chemin

def generer_fiches():
    ecrites = []
    for langue in ("fr", "en"):
        d, tf = DONNEES[langue], TEXTES_FICHES[langue]
        dossier = "en/" if langue == "en" else ""
        lib = lambda l: txt(d["libelles"][l], langue)
        index = {(type_, f["id"]): f for type_ in TYPES_FICHES for f in d["fiches"][type_]}
        cats = {type_: {c["nom"]: c for c in d["categories"][type_]} for type_ in TYPES_FICHES}
        for type_ in TYPES_FICHES:
            singulier = lib("biais" if type_ == "biais" else "sophisme")
            for f in d["fiches"][type_]:
                cat = cats[type_][f["categorie"]]
                # Voir aussi : dans les deux sens, comme dans l'application
                lies = list(dict.fromkeys(f.get("lies", []) + [f"{t}:{g['id']}" for t in TYPES_FICHES for g in d["fiches"][t] if f"{type_}:{f['id']}" in g.get("lies", [])]))
                def lien(cle):
                    t2, id2 = cle.split(":")
                    g = index[(t2, id2)]
                    href = f"{id2}.html" if t2 == type_ else f"../{t2}/{id2}.html"
                    autre = f" ({lib('biais' if t2 == 'biais' else 'sophisme')})" if t2 != type_ else ""
                    return f'<a href="{href}">{txt(g["nom"], langue)}{autre}</a>'
                distinction = ""
                if f.get("distinction"):
                    cible, texte = f["distinction"]
                    distinction = (f'<div class="distinction"><p class="contre"><span aria-hidden="true">≠ </span>'
                                   f'<span class="invisible">{lib("À ne pas confondre avec : ")}</span>{lien(cible)}</p>'
                                   f'<p>{txt(texte[:1].upper() + texte[1:], langue)}</p></div>')
                numero = ("B" if type_ == "biais" else "S") + "\u00a0" + str(f["num"])
                corps = (f'      <a class="lien retour" href="./">{txt(tf["retour_liste"][type_], langue)}</a>\n'
                         f'      <article class="carte carte-fiche a-indice {classe_cat(cat)}">\n'
                         f'        <span class="numero-fiche indice-coin"><span aria-hidden="true">{numero}</span><span class="invisible">{txt(tf["numero"][type_].format(f["num"]), langue)}</span></span>\n'
                         f'        <div class="entete-fiche">\n'
                         f'          <div class="entete-carte"><span class="etiquette-numero"><span class="etiquette">{singulier} · {txt(f["categorie"], langue)}</span></span></div>\n'
                         f'          <h1 class="fiche-titre">{txt(f["nom"], langue)}</h1>\n'
                         + (f'          <p class="autres-noms">{txt(f["autresNoms"], langue)}</p>\n' if f.get("autresNoms") else "")
                         + f'          <p class="fiche-definition">{txt(f["definition"], langue)}</p>\n'
                         f'        </div>\n'
                         f'        <div class="tete-fiche">\n'
                         + section(lib("Schéma de l'argument"), forme_html(f["forme"], langue) if f.get("forme") else "", lib("L'essentiel"))
                         + section(txt(tf["titre_mecanisme"][type_], langue), f'<p>{txt(f["mecanisme"], langue)}</p>', None if f.get("forme") else lib("L'essentiel"))
                         + '        </div>\n'
                         + groupe(lib("En pratique"), [section(lib("Exemple"), f'<p class="encadre">{txt(f["exemple"], langue)}</p>'),
                                                       section(lib("Cas célèbre"), f'<p class="celebre">{txt(f["celebre"], langue)}</p>' if f.get("celebre") else "")])
                         + groupe(lib("Se défendre"), [section(txt(tf["titre_parade"][type_], langue), f'<p>{txt(f["parade"], langue)}</p>'),
                                                       section(lib("Ne pas confondre"), distinction)])
                         + groupe(lib("Aller plus loin"), [section(lib("Source"), f'<p class="source">{txt(f["source"], langue)}</p>'),
                                                           section(lib("Voir aussi"), '<div class="voir-aussi">' + "".join(lien(c) for c in lies) + "</div>" if lies else "")])
                         + groupe(txt(tf["entrainer"], langue), [section(None, f'<p>{txt(tf["entrainer_texte"], langue)}</p>'
                                                                         f'<p><a class="bouton" href="../#{type_}/{f["id"]}">{txt(tf["entrainer_bouton"], langue)}</a></p>')])
                         + '      </article>\n')
                titre = f'{txt(f["nom"], langue)} ({txt(tf["nature"][type_], langue)})'
                ecrites.append(page_statique(langue, f"{dossier}{type_}/{f['id']}.html", titre, txt(f["definition"], langue),
                                             [("fr", f"{type_}/{f['id']}.html"), ("en", f"en/{type_}/{f['id']}.html")], corps))
            # Liste des fiches du type, par catégorie
            n = len(d["fiches"][type_])
            blocs = ""
            for c in d["categories"][type_]:
                elements = "".join(f'            <li><a href="{f["id"]}.html">{txt(f["nom"], langue)}</a>{txt(" : ", langue)}{txt(f["definition"], langue)}</li>\n'
                                   for f in d["fiches"][type_] if f["categorie"] == c["nom"])
                blocs += (f'        <section class="{classe_cat(c)}" id="{c["glyphe"]}">\n          <h2>{txt(c["nom"], langue)}</h2>\n'
                          f'          <p class="source">{txt(c["description"], langue)}</p>\n          <ul>\n{elements}          </ul>\n        </section>\n')
            autre_type, autre_texte = tf["autre_liste"][type_]
            titre = txt(tf["titre_liste"][type_].format(n), langue)
            corps = (f'      <article class="carte texte-fixe">\n        <h1>{titre}</h1>\n        <p>{txt(tf["intro_liste"][type_], langue)}</p>\n{blocs}'
                     f'        <p><a href="../{autre_type}/">{txt(autre_texte, langue)}</a></p>\n'
                     f'        <p>{txt(tf["entrainer_texte"], langue)}</p>\n'
                     f'        <p><a class="bouton" href="../#{type_}">{txt(tf["ouvrir_liste"], langue)}</a></p>\n      </article>\n')
            ecrites.append(page_statique(langue, f"{dossier}{type_}/index.html", titre, txt(tf["desc_liste"][type_].format(n), langue),
                                         [("fr", f"{type_}/index.html"), ("en", f"en/{type_}/index.html")], corps, og_type="website"))
    # Couleur de chaque catégorie : classes posées sur les cartes (la CSP interdit le style en ligne)
    regles = sorted({f".{classe_cat(c)} {{ --c: {c['couleur']}; }}" for type_ in TYPES_FICHES for c in DONNEES["fr"]["categories"][type_]})
    open(os.path.join(STATIC, "fiches.css"), "w", encoding="utf-8").write(
        "/* fiches.css : généré par tests/pages/generer_pages.py (ne pas modifier à la main). Couleur de chaque catégorie\n"
        "   pour les pages statiques des fiches ; les couleurs viennent de donnees.js. */\n" + "\n".join(regles) + "\n")
    return ecrites

PAGES_FICHES = generer_fiches()

# Plan du site : les pages d'accueil et fixes, puis les listes et les pages des fiches
FIXES = ["", "mentions-legales.html", "confidentialite.html", "cgu.html", "en/", "en/legal-notice.html", "en/privacy.html", "en/terms.html"]
adresses = FIXES + [p.removesuffix("index.html") for p in PAGES_FICHES]
open(os.path.join(STATIC, "sitemap.xml"), "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Plan du site, généré par tests/pages/generer_pages.py (ne pas modifier à la main). Les fiches ont\n'
    '     une page statique chacune (biais/, sophismes/, en/…) ; les ateliers restent des adresses en « # » de la page d\'accueil. -->\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}{a}</loc></url>\n" for a in adresses) + "</urlset>\n")

# Contrôle : chaque lien et chaque ressource relatifs des pages des fiches mènent à un fichier existant de static/,
# et chaque page a exactement un h1
for chemin in PAGES_FICHES:
    texte = open(os.path.join(STATIC, chemin), encoding="utf-8").read()
    assert texte.count("<h1") == 1, chemin
    for cible in re.findall(r'(?:href|src)="([^"]+)"', texte):
        if cible.startswith(("https://", "#")):
            continue
        fichier = os.path.normpath(os.path.join(STATIC, os.path.dirname(chemin), cible.split("#")[0].split("?")[0]))
        if fichier.endswith(os.sep) or os.path.isdir(fichier):
            fichier = os.path.join(fichier, "index.html")
        assert fichier.startswith(os.path.abspath(STATIC)) and os.path.isfile(fichier), f"{chemin} : lien mort {cible}"
print(f"pages générées, dont {len(PAGES_FICHES)} pages de fiches")
