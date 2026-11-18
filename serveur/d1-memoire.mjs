// d1-memoire.mjs : base D1 simulée en mémoire, pour les essais du Worker sans Cloudflare (essai.mjs, serveur-local.mjs).
// Elle ne comprend que les requêtes de worker.js.
export function baseMemoire() {
  const lignes = new Map();
  const executer = (sql, p) => {
    if (sql.startsWith("SELECT empreinte_jeton")) { const l = lignes.get(p[0]); return { premiere: l ? { ...l } : null }; }
    if (sql.startsWith("SELECT COUNT")) return { premiere: { n: lignes.size } };
    if (sql === "SELECT 1") return { changes: 0 };
    if (sql.startsWith("INSERT")) { lignes.set(p[0], { empreinte_jeton: p[1], contenu: p[2], version: 1, cree_le: p[3], ecrit_le: p[4] }); return { changes: 1 }; }
    if (sql.startsWith("UPDATE")) { const l = lignes.get(p[2]); if (!l || l.version !== p[3]) return { changes: 0 }; Object.assign(l, { contenu: p[0], version: l.version + 1, ecrit_le: p[1] }); return { changes: 1 }; }
    if (sql.startsWith("DELETE FROM coffres WHERE id")) return { changes: lignes.delete(p[0]) ? 1 : 0 };
    if (sql.startsWith("DELETE FROM coffres WHERE ecrit_le")) { let n = 0; for (const [k, l] of lignes) if (l.ecrit_le < p[0]) { lignes.delete(k); n++; } return { changes: n }; }
    throw new Error("requête inconnue : " + sql);
  };
  // Taille de la base : ici, la somme des contenus (D1 la donne dans meta.size_after)
  const taille = () => [...lignes.values()].reduce((s, l) => s + l.contenu.length, 0);
  return {
    lignes,
    prepare(sql) {
      let p = [];
      const r = { bind(...x) { p = x; return r; }, async first() { return executer(sql, p).premiere; }, async run() { const changes = executer(sql, p).changes; return { meta: { changes, size_after: taille() } }; } };
      return r;
    }
  };
}
