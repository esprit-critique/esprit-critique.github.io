// essai.mjs : essais du Worker sans Cloudflare (node serveur/essai.mjs). Code de sortie 1 si un essai échoue.
import { traiter } from "./worker.js";
import worker from "./worker.js";
import { baseMemoire } from "./d1-memoire.mjs";

let echecs = 0;
const ok = (nom, cond, detail = "") => { if (!cond) echecs++; console.log((cond ? "OK    " : "ÉCHEC ") + nom + (cond ? "" : " — " + detail)); };
const env = { BASE: baseMemoire(), ORIGINES: "https://esprit-critique.github.io,http://localhost:8000", MAX_COFFRES: "3" };
const ID = "0123456789abcdef0123456789abcdef", JETON = "a".repeat(64), AUTRE = "b".repeat(64);
const req = (methode, { id = ID, jeton = JETON, corps, version, origine = "https://esprit-critique.github.io" } = {}) => traiter(new Request("https://synchro.exemple/v1/coffres/" + id, {
  method: methode, body: corps === undefined ? undefined : typeof corps === "string" ? corps : JSON.stringify(corps),
  headers: { ...(jeton ? { Authorization: "Bearer " + jeton } : {}), ...(version !== undefined ? { "If-Match": String(version) } : {}), ...(origine ? { Origin: origine } : {}) }
}), env);

ok("sans jeton : 401", (await req("GET", { jeton: null })).status === 401);
ok("identifiant mal formé : 404", (await req("GET", { id: "../etc" })).status === 404);
ok("coffre absent : 404", (await req("GET")).status === 404);
let r = await req("PUT", { corps: { contenu: "chiffré-1" }, version: 0 });
ok("création : 201, version 1", r.status === 201 && (await r.json()).version === 1);
r = await req("GET");
const lu = await r.json();
ok("lecture : contenu et version", r.status === 200 && lu.contenu === "chiffré-1" && lu.version === 1);
ok("réponse : no-store, nosniff, CORS limité à l'origine du site", r.headers.get("Cache-Control") === "no-store" && r.headers.get("X-Content-Type-Options") === "nosniff" && r.headers.get("Access-Control-Allow-Origin") === "https://esprit-critique.github.io");
ok("mauvais jeton : 403, rien n'est lu", (await req("GET", { jeton: AUTRE })).status === 403);
ok("mauvais jeton : 403, rien n'est écrit", (await req("PUT", { jeton: AUTRE, corps: { contenu: "x" }, version: 1 })).status === 403 && env.BASE.lignes.get(ID).contenu === "chiffré-1");
ok("origine étrangère : 403", (await req("GET", { origine: "https://pirate.exemple" })).status === 403);
ok("taille dépassée : 413", (await req("PUT", { corps: { contenu: "x".repeat(300 * 1024) }, version: 1 })).status === 413);
ok("JSON invalide : 400", (await req("PUT", { corps: "{", version: 1 })).status === 400);
r = await req("PUT", { corps: { contenu: "chiffré-2" }, version: 1 });
ok("mise à jour à la bonne version : 200, version 2", r.status === 200 && (await r.json()).version === 2);
r = await req("PUT", { corps: { contenu: "chiffré-3" }, version: 1 });
ok("conflit de version : 409, la copie n'est pas écrasée", r.status === 409 && (await r.json()).version === 2 && env.BASE.lignes.get(ID).contenu === "chiffré-2");
ok("le serveur ne garde que l'empreinte du jeton", env.BASE.lignes.get(ID).empreinte_jeton !== JETON && /^[0-9a-f]{64}$/.test(env.BASE.lignes.get(ID).empreinte_jeton));
for (const k of [1, 2]) await req("PUT", { id: String(k).repeat(32), corps: { contenu: "c" }, version: 0 });
ok("plafond du nombre de coffres : 507", (await req("PUT", { id: "f".repeat(32), corps: { contenu: "c" }, version: 0 })).status === 507);
ok("suppression : 204, puis 404", (await req("DELETE")).status === 204 && (await req("GET")).status === 404);
env.BASE.lignes.get("1".repeat(32)).ecrit_le = Date.now() - 25 * 30.44 * 86400000;
await worker.scheduled({}, env);
ok("purge : les coffres inactifs depuis plus de 24 mois sont supprimés, pas les autres", !env.BASE.lignes.has("1".repeat(32)) && env.BASE.lignes.has("2".repeat(32)));
console.log(echecs ? echecs + " essai(s) en échec" : "Tous les essais du serveur sont passés");
process.exit(echecs ? 1 : 0);
