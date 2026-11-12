// sw.js : mode hors ligne. Stratégie « réseau d'abord » : en ligne, on sert toujours la version publiée (et l'on met
// le cache à jour) ; hors ligne, on sert la dernière version enregistrée. Seuls les fichiers du site sont mis en cache.
// À chaque nouveau fichier du site : l'ajouter à FICHIERS et changer le numéro de version du cache.
const CACHE = "esprit-critique-v26";
// Liste lue en JSON par les bancs (_test, _grand-test, _hors-ligne) : pas de commentaire à l'intérieur. Version anglaise :
// la page et ses dictionnaires (liste complète : python3 tests/en/controle.py).
const FICHIERS = [
  "./", "index.html", "style.css", "manifest.webmanifest?v=4", "favicon.svg?v=3", "icone-32.png?v=3", "icone.png?v=3", "icone-512.png?v=3",
  "langue.js", "donnees.js", "schemas.js", "pays.js", "jeux-donnees.js", "ateliers.js", "niveaux.js", "experiences.js", "chiffres.js",
  "perception.js", "debattre.js", "raisonner.js", "pratiques.js", "melange.js", "enligne.js", "indices.js", "grand-test-donnees.js", "grand-test.js", "grand-test-interface.js", "illusions.js", "tirage.js", "progression.js", "graphiques.js", "profil.js", "parcours.js", "coffre.js", "sauvegarde.js", "app.js", "recherche.js",
  "en/dico-app.js", "en/dico-ateliers.js", "en/dico-chiffres.js", "en/dico-debattre.js", "en/dico-experiences.js", "en/dico-grand-test-interface.js", "en/dico-grand-test.js", "en/dico-illusions.js", "en/dico-melange.js", "en/dico-tirage.js", "en/dico-progression.js", "en/dico-graphiques.js", "en/dico-profil.js", "en/dico-parcours.js", "en/dico-coffre.js", "en/dico-enligne.js", "en/dico-jeux-donnees.js", "en/dico-niveaux.js", "en/dico-nombres.js", "en/dico-perception.js", "en/dico-pratiques.js", "en/dico-raisonner.js", "en/dico-schemas.js", "en/fiches.js", "en/grand-test-donnees.js", "en/grand-test.js", "en/index.html", "en/legal-notice.html", "en/pays.js", "en/privacy.html", "en/terms.html",
  "polices/newsreader-latin-opsz-normal.woff2", "polices/newsreader-latin-wght-italic.woff2", "polices/OFL.txt"
];

// Fichiers d'une langue : en/… pour l'anglais, les pages françaises (« ./ » et les .html de la racine) pour le
// français, et tout le reste (scripts, styles, polices) pour les deux
const fichiersDe = en => FICHIERS.filter(f => f.startsWith("en/") ? en : f === "./" || /^[^/]+\.html$/.test(f) ? !en : true);
const estAnglais = adresse => new URL(adresse, location.href).pathname.includes("/en/");
// Ajoute au cache les fichiers de la langue qui y manquent (hors ligne : rien, sans erreur)
const completer = en => caches.open(CACHE).then(async c => {
  const manquants = [];
  for (const f of fichiersDe(en)) if (!(await c.match(f))) manquants.push(f);
  if (manquants.length) await c.addAll(manquants);
}).catch(() => {});

self.addEventListener("install", e => {
  // Seulement la langue de la page qui installe : un visiteur français ne télécharge pas la version anglaise
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(pages => caches.open(CACHE).then(c => c.addAll(fichiersDe(pages.some(p => estAnglais(p.url))))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  // Supprime les caches des versions précédentes
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(c => c !== CACHE).map(c => caches.delete(c)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Seulement les fichiers du site, en lecture ; jamais les pages de test (« _… »)
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.split("/").pop().startsWith("_")) return;
  // Première visite d'une langue : ses fichiers rejoignent le cache, pour qu'elle fonctionne aussi hors ligne
  if (e.request.mode === "navigate") e.waitUntil(completer(estAnglais(url)));
  e.respondWith(
    fetch(e.request)
      .then(reponse => {
        if (reponse.ok) { const copie = reponse.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
        return reponse;
      })
      // Hors ligne : la copie enregistrée ; à défaut, la page d'accueil, mais seulement pour une navigation (jamais à la place d'un script)
      .catch(() => caches.match(e.request, { ignoreSearch: false }).then(r => r || (e.request.mode === "navigate" ? caches.match(url.pathname.includes("/en/") ? "en/index.html" : "index.html") : Response.error())))
  );
});
