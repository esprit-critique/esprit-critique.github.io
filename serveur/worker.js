// worker.js : serveur de synchronisation d'Esprit critique (Cloudflare Worker + base D1). Aucune dépendance.
// Il garde des coffres chiffrés qu'il ne sait pas lire : identifiant, empreinte du jeton, contenu, version, deux dates.
// Routes : GET, PUT, DELETE /v1/coffres/:id, jeton dans « Authorization: Bearer … » ; PUT contrôle la version
// (en-tête If-Match ; 409 en cas de conflit : le site fusionne et recommence). Modèle de menace : ../SECURITE.md.

const ID_VALIDE = /^[0-9a-f]{32}$/;
const JETON_VALIDE = /^[0-9a-f]{64}$/;
const TAILLE_MAX = 256 * 1024;
const INACTIVITE_MAX = 24 * 30.44 * 86400000;   // 24 mois

async function empreinte(texte) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(h)].map(o => o.toString(16).padStart(2, "0")).join("");
}
// Comparaison en temps constant de deux chaînes de même longueur (empreintes hexadécimales)
function egauxTempsConstant(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function origineAutorisee(requete, env) {
  const origine = requete.headers.get("Origin");
  const permises = String(env.ORIGINES || "").split(",").map(x => x.trim()).filter(Boolean);
  return origine && permises.includes(origine) ? origine : null;
}
function reponse(statut, corps, origine) {
  const entetes = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Type": "application/json", "Vary": "Origin" };
  if (origine) Object.assign(entetes, { "Access-Control-Allow-Origin": origine, "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type, If-Match", "Access-Control-Max-Age": "600" });
  return new Response(corps === null ? null : JSON.stringify(corps), { status: statut, headers: entetes });
}

export async function traiter(requete, env) {
  const origine = origineAutorisee(requete, env);
  // Une origine étrangère est refusée (les navigateurs l'auraient bloquée ; on ne la sert pas non plus)
  if (requete.headers.get("Origin") && !origine) return reponse(403, { erreur: "origine refusée" }, null);
  if (requete.method === "OPTIONS") return reponse(204, null, origine);
  const m = new URL(requete.url).pathname.match(/^\/v1\/coffres\/([^/]+)$/);
  if (!m || !ID_VALIDE.test(m[1])) return reponse(404, { erreur: "introuvable" }, origine);
  const id = m[1];
  const jeton = (requete.headers.get("Authorization") || "").replace(/^Bearer /, "");
  if (!JETON_VALIDE.test(jeton)) return reponse(401, { erreur: "jeton absent ou mal formé" }, origine);
  const empreinteJeton = await empreinte(jeton);
  const coffre = await env.BASE.prepare("SELECT empreinte_jeton, contenu, version FROM coffres WHERE id = ?").bind(id).first();
  if (coffre && !egauxTempsConstant(coffre.empreinte_jeton, empreinteJeton)) return reponse(403, { erreur: "jeton refusé" }, origine);

  if (requete.method === "GET") {
    if (!coffre) return reponse(404, { erreur: "aucun coffre" }, origine);
    return reponse(200, { contenu: coffre.contenu, version: coffre.version }, origine);
  }
  if (requete.method === "DELETE") {
    if (!coffre) return reponse(404, { erreur: "aucun coffre" }, origine);
    await env.BASE.prepare("DELETE FROM coffres WHERE id = ?").bind(id).run();
    return reponse(204, null, origine);
  }
  if (requete.method === "PUT") {
    const texte = await requete.text();
    if (texte.length > TAILLE_MAX) return reponse(413, { erreur: "contenu trop gros" }, origine);
    let corps;
    try { corps = JSON.parse(texte); } catch (e) { return reponse(400, { erreur: "JSON invalide" }, origine); }
    if (!corps || typeof corps.contenu !== "string" || corps.contenu.length > TAILLE_MAX) return reponse(400, { erreur: "contenu absent" }, origine);
    const attendue = Number(requete.headers.get("If-Match") || 0);
    const maintenant = Date.now();
    if (!coffre) {
      if (attendue !== 0) return reponse(409, { erreur: "conflit de version", version: 0 }, origine);
      if (env.LIMITE_CREATIONS) {
        const { success } = await env.LIMITE_CREATIONS.limit({ key: "creation" });
        if (!success) return reponse(429, { erreur: "trop de créations, réessayer plus tard" }, origine);
      }
      const { n } = await env.BASE.prepare("SELECT COUNT(*) AS n FROM coffres").first();
      if (n >= Number(env.MAX_COFFRES || 100000)) return reponse(507, { erreur: "capacité atteinte" }, origine);
      await env.BASE.prepare("INSERT INTO coffres (id, empreinte_jeton, contenu, version, cree_le, ecrit_le) VALUES (?, ?, ?, 1, ?, ?)").bind(id, empreinteJeton, corps.contenu, maintenant, maintenant).run();
      return reponse(201, { version: 1 }, origine);
    }
    // Écriture conditionnelle : seulement si personne n'a écrit depuis la version lue
    const r = await env.BASE.prepare("UPDATE coffres SET contenu = ?, version = version + 1, ecrit_le = ? WHERE id = ? AND version = ?").bind(corps.contenu, maintenant, id, attendue).run();
    if (!r.meta || r.meta.changes !== 1) return reponse(409, { erreur: "conflit de version", version: coffre.version }, origine);
    return reponse(200, { version: attendue + 1 }, origine);
  }
  return reponse(405, { erreur: "méthode non permise" }, origine);
}

export default {
  // Aucune donnée de la requête n'est journalisée (ni adresse, ni identifiant, ni contenu)
  async fetch(requete, env) {
    try { return await traiter(requete, env); } catch (e) { return reponse(500, { erreur: "erreur interne" }, origineAutorisee(requete, env)); }
  },
  // Purge planifiée des coffres inactifs depuis 24 mois
  async scheduled(evenement, env) {
    await env.BASE.prepare("DELETE FROM coffres WHERE ecrit_le < ?").bind(Date.now() - INACTIVITE_MAX).run();
  }
};
