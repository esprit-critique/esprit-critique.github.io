// serveur-local.mjs : le Worker servi en local sur une base en mémoire, pour le banc « synchro » (tests/synchro.js).
// node serveur/serveur-local.mjs [port]   (origines admises : http://localhost:8000)
import http from "node:http";
import { traiter } from "./worker.js";
import { baseMemoire } from "./d1-memoire.mjs";

const env = { BASE: baseMemoire(), ORIGINES: "http://localhost:8000", MAX_COFFRES: "1000" };
const port = Number(process.argv[2]) || 8787;
http.createServer(async (req, res) => {
  const morceaux = [];
  for await (const m of req) morceaux.push(m);
  const corps = Buffer.concat(morceaux);
  const r = await traiter(new Request("http://localhost:" + port + req.url, { method: req.method, headers: req.headers, body: ["GET", "HEAD", "OPTIONS", "DELETE"].includes(req.method) ? undefined : corps }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, "127.0.0.1", () => console.log("prêt sur " + port));
