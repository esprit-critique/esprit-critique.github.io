// sw.js : mode hors ligne. Stratégie « réseau d'abord » : en ligne, on sert toujours la version publiée (et l'on met
// le cache à jour) ; hors ligne, on sert la dernière version enregistrée. Aucune donnée n'est envoyée nulle part.
// À chaque nouveau fichier du site : l'ajouter à FICHIERS et changer le numéro de version du cache.
const CACHE = "esprit-critique-v7";
const FICHIERS = [
  "./", "index.html", "style.css", "manifest.webmanifest?v=3", "favicon.svg?v=3", "icone-32.png?v=3", "icone.png?v=3", "icone-512.png?v=3",
  "donnees.js", "schemas.js", "pays.js", "jeux-donnees.js", "ateliers.js", "niveaux.js", "experiences.js", "chiffres.js",
  "perception.js", "debattre.js", "raisonner.js", "pratiques.js", "indices.js", "app.js",
  "polices/newsreader-latin-opsz-normal.woff2", "polices/newsreader-latin-wght-italic.woff2", "polices/OFL.txt"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  // Supprime les caches des versions précédentes
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(c => c !== CACHE).map(c => caches.delete(c)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Seulement les fichiers du site, en lecture ; jamais les pages de test (« _… »)
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.split("/").pop().startsWith("_")) return;
  e.respondWith(
    fetch(e.request)
      .then(reponse => {
        if (reponse.ok) { const copie = reponse.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
        return reponse;
      })
      // Hors ligne : la copie enregistrée ; à défaut, la page d'accueil, mais seulement pour une navigation (jamais à la place d'un script)
      .catch(() => caches.match(e.request, { ignoreSearch: false }).then(r => r || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
