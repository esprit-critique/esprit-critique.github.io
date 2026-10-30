#!/usr/bin/env python3
"""Génère les pages fixes du site (mentions légales, confidentialité, conditions d'utilisation, page 404)
à partir d'un gabarit commun : même en-tête, même pied, même politique de sécurité que index.html.
python3 tests/pages/generer_pages.py   (réécrit les fichiers dans static/)"""
import os, re, html

ICI = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ICI, "..", "..", "static")
MAJ = "30 octobre 2026"

index = open(os.path.join(STATIC, "index.html"), encoding="utf-8").read()
# Même CSP et même script de thème que la page principale (le script est autorisé par son empreinte)
CSP = re.search(r'  <meta http-equiv="Content-Security-Policy"[^\n]*\n', index).group(0)
THEME = re.search(r"  <script>try \{.*?</script>\n", index, re.S).group(0)
EMBLEME = re.search(r'        <svg class="embleme".*?</svg>\n', index, re.S).group(0)

# Même typographie que typo() dans app.js : espace fine insécable avant ; : ! ? et insécable dans les guillemets
def typo(texte):
    return (texte.replace(" ;", "\u202f;").replace(" :", "\u202f:").replace(" !", "\u202f!").replace(" ?", "\u202f?")
            .replace("« ", "«\u00a0").replace(" »", "\u00a0»"))

def page(fichier, titre, description, corps, racine="", indexer=True):
    lien = lambda p: racine + p
    corps = typo(corps)
    contenu = f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
{CSP}  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{html.escape(titre)} · Esprit critique</title>
  <meta name="description" content="{html.escape(description)}">
{'' if indexer else '  <meta name="robots" content="noindex">' + chr(10)}  <link rel="canonical" href="https://esprit-critique.github.io/{fichier if indexer else ''}">
  <link rel="icon" href="{lien('favicon.svg?v=3')}" type="image/svg+xml">
  <link rel="icon" href="{lien('icone-32.png?v=3')}" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="{lien('icone.png?v=3')}">
  <meta name="theme-color" content="#f6f4ef" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16130f" media="(prefers-color-scheme: dark)">
{THEME}  <link rel="stylesheet" href="{lien('style.css')}">
</head>
<body>
  <div class="conteneur page-fixe">
    <header class="entete">
      <a class="marque" href="{lien('./')}" title="Retour à l'accueil d'Esprit critique">
{EMBLEME}        <span>Esprit critique</span>
      </a>
    </header>
    <main>
      <article class="carte texte-fixe">
{corps}
      </article>
      <p class="retour-site"><a class="bouton" href="{lien('./')}">Retour au site</a></p>
    </main>
    <footer class="pied">
      <p><a href="{lien('mentions-legales.html')}">Mentions légales</a> · <a href="{lien('confidentialite.html')}">Confidentialité</a> · <a href="{lien('cgu.html')}">Conditions d'utilisation</a></p>
    </footer>
  </div>
</body>
</html>
'''
    open(os.path.join(STATIC, fichier), "w", encoding="utf-8").write(contenu)

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
        <h2>Propriété intellectuelle</h2>
        <p>Le code du site est sous licence MIT ; les textes (fiches, questions, explications, guide) sous licence
        Creative Commons Attribution 4.0 (CC BY 4.0) : vous pouvez les reprendre et les adapter en citant « Esprit critique,
        par GOATier ». Les données de la Banque mondiale sont sous licence CC BY 4.0 ; les autres chiffres proviennent des
        sources publiques indiquées à côté de chacun. Détail : <a href="{DEPOT}/blob/main/LICENCE-CONTENU.md">licence des contenus</a>.</p>
        <h2>Contenus fictifs</h2>
        <p>Les situations, dialogues, débats, sites et organismes des exercices sont fictifs ; toute ressemblance avec des
        personnes ou des organisations existantes serait fortuite. Les études et les chiffres réels sont signalés comme tels,
        avec leur source.</p>''')

page("confidentialite.html", "Politique de confidentialité", "Esprit critique ne collecte aucune donnée personnelle : pas de compte, pas de cookie, pas de mesure d'audience.", f'''        <h1>Politique de confidentialité</h1>
        <p class="source">Mise à jour le {MAJ}.</p>
        <p><strong>En bref : l'éditeur ne collecte aucune donnée personnelle.</strong> Le site n'a ni compte, ni formulaire envoyé
        à un serveur, ni cookie, ni mesure d'audience, ni publicité, ni ressource extérieure (polices, scripts ou images d'autres sites).</p>
        <h2>Ce qui reste dans votre navigateur</h2>
        <p>Votre progression est enregistrée dans le stockage local de votre navigateur (« localStorage ») : fiches acquises,
        réponses et révisions du quiz, résultats et niveaux des ateliers, prévisions et décisions que vous notez, repérages,
        thème choisi. Ces données ne quittent jamais votre appareil ; l'éditeur n'y a pas accès. Elles servent uniquement
        au fonctionnement que vous demandez : ce stockage strictement nécessaire n'exige pas de consentement (article 82
        de la loi Informatique et Libertés), d'où l'absence de bandeau.</p>
        <p>Le site garde aussi, dans votre navigateur, jusqu'à quatre copies de cette progression : une par jour, et une juste
        avant un import ou une restauration. Elles permettent de revenir en arrière depuis <a href="./#guide/donnees">Vos données</a>.</p>
        <p>Pour lire le site hors connexion, votre navigateur garde aussi une copie des fichiers du site (service worker).
        Elle ne contient aucune donnée vous concernant.</p>
        <h2>Vos droits sur ces données</h2>
        <ul>
          <li>Les emporter : « Enregistrer dans un fichier », dans <a href="./#guide/donnees">Vos données</a>.</li>
          <li>Les effacer : « Effacer ma progression », au même endroit (les copies automatiques sont effacées aussi), ou en effaçant les données de navigation du site.</li>
          <li>Les fichiers que le site crée (sauvegarde, agenda .ics) sont fabriqués sur votre appareil et ne sont envoyés nulle part.</li>
        </ul>
        <h2>L'hébergeur</h2>
        <p>Le site est hébergé par GitHub Pages. Comme tout hébergeur, GitHub reçoit les demandes de pages : selon sa
        documentation, l'adresse IP des visiteurs est enregistrée et conservée pour des raisons de sécurité. L'éditeur n'a pas
        accès à ces journaux. Voir la <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement">déclaration de confidentialité de GitHub</a>.</p>
        <h2>Partage</h2>
        <p>Le bouton « Partager » ouvre le menu de partage de votre appareil, ou copie le lien : le site n'envoie rien lui-même.</p>
        <h2>Contact et réclamation</h2>
        <p>Pour toute question : <a href="{DEPOT}/issues">tickets du dépôt</a>. Vous pouvez aussi adresser une réclamation à la
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
        et bilans proposés (portrait, bilan avant et après…) sont des exercices, non des évaluations validées.</p>
        <p>Les situations, débats, sites et organismes des exercices sont fictifs.</p>
        <h2>Vos données</h2>
        <p>Votre progression reste dans votre navigateur : voir la <a href="confidentialite.html">politique de confidentialité</a>.
        Vous êtes seul responsable de sa conservation ; le site propose de l'enregistrer dans un fichier.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Code sous licence MIT, textes sous licence CC BY 4.0 : vous pouvez les réutiliser, y compris à des fins
        commerciales, en citant la source. Voir les <a href="mentions-legales.html">mentions légales</a>.</p>
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
          <li><a href="/#ateliers">Les 45 ateliers</a></li>
          <li><a href="/#guide">Le guide</a></li>
        </ul>''', racine="/", indexer=False)
print("pages générées")
