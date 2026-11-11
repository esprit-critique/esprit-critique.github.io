// Banc « synchro » (lot 6), Playwright :
//   1. vraie page, sans compte (avec sa CSP) : aucune requête ne part vers une autre origine, sur une vingtaine d'adresses ;
//   2. drapeau pointé sur un serveur local (copie d'essai _site-synchro.html, coffre pointé sur serveur/serveur-local.mjs) :
//      un compte créé dans un navigateur, connecté dans un second, modifications des deux côtés, fusion vérifiée ;
//      un contenu altéré d'un seul bit est refusé sans toucher aux données locales.
// Lancé par tests/lancer.sh synchro (qui prépare la copie d'essai et le serveur local).
const { chromium } = require('playwright');
const SITE = process.env.URL_SITE || 'http://localhost:8000/';
const SYNCHRO = process.env.URL_SYNCHRO || 'http://localhost:8787';
let echecs = 0;
const ok = (libelle, condition, detail = '') => { if (!condition) echecs++; console.log((condition ? 'OK    ' : 'ECHEC ') + libelle + (detail && !condition ? ' : ' + detail : '')); };

(async () => {
  const navigateur = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  // ---------- 1. Drapeau vide ----------
  const ctx = await navigateur.newContext();
  const p = await ctx.newPage();
  const ailleurs = [];
  p.on('request', r => { const u = new URL(r.url()); if (u.origin !== new URL(SITE).origin && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) ailleurs.push(r.url()); });
  for (const h of ['accueil', 'biais', 'biais/ancrage', 'quiz', 'ateliers', 'chiffres/monde', 'tests/crt', 'profil', 'profil/reglages', 'profil/distinctions', 'parcours', 'parcours/hasard', 'portrait', 'guide', 'guide/donnees', 'cartes/biais', 'defi/123', 'chiffres/melange']) {
    await p.goto(SITE + '#' + h, { waitUntil: 'load' });
    await p.waitForTimeout(150);
  }
  ok('sans compte : aucune requête vers une autre origine sur 18 adresses', ailleurs.length === 0, ailleurs.slice(0, 5).join(' '));
  await p.goto(SITE + '#profil/reglages', { waitUntil: 'load' });
  await p.waitForSelector('.bloc-synchro', { timeout: 5000 }).catch(() => {});
  ok('sans compte : le bloc de synchronisation est proposé, l\'indicateur reste caché', !!(await p.$('.bloc-synchro')) && (await p.$eval('.etat-synchro', e => e.hidden)));
  await ctx.close();

  // ---------- 2. Deux navigateurs, un serveur local ----------
  const ouvrir = async () => {
    const c = await navigateur.newContext();
    const page = await c.newPage();
    page.on('dialog', d => d.accept());
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(e.message));
    await page.goto(SITE + '_site-synchro.html#profil/reglages', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    return { c, page, erreurs };
  };
  const A = await ouvrir(), B = await ouvrir();
  ok('drapeau actif : le bloc « Synchroniser mes appareils » apparaît', !!(await A.page.$('.bloc-synchro')));
  // A : progression propre, puis création du compte
  await A.page.evaluate(() => {
    localStorage.setItem('acquis', JSON.stringify(['biais:ancrage']));
    localStorage.setItem('records', JSON.stringify({ tout: 6 }));
    localStorage.setItem('confiance', JSON.stringify({ 90: [10, 8] }));
  });
  await A.page.click('.bloc-synchro button:has-text("Créer un compte")');
  await A.page.waitForSelector('.code-synchro-valeur', { timeout: 10000 });
  const code = (await A.page.textContent('.code-synchro-valeur')).trim();
  ok('création : un code de 16 caractères en quatre groupes', /^[0-9A-Z]{4} [0-9A-Z]{4} [0-9A-Z]{4} [0-9A-Z]{4}$/.test(code), code);
  // B : progression différente, puis connexion avec le code (saisi en minuscules, sans espaces)
  await B.page.evaluate(() => {
    localStorage.setItem('acquis', JSON.stringify(['sophismes:post-hoc']));
    localStorage.setItem('records', JSON.stringify({ tout: 9 }));
    localStorage.setItem('confiance', JSON.stringify({ 90: [4, 4] }));
  });
  await B.page.fill('#code-synchro', code.replace(/ /g, '').toLowerCase());
  await B.page.click('.bloc-synchro button:has-text("Se connecter")');
  await B.page.waitForTimeout(1500);
  // A se synchronise de nouveau : il reçoit la fusion
  await A.page.evaluate(() => synchroniser());
  const lireCles = page => page.evaluate(() => ({ acquis: JSON.parse(localStorage.getItem('acquis')).sort(), records: JSON.parse(localStorage.getItem('records')), confiance: JSON.parse(localStorage.getItem('confiance')) }));
  const a = await lireCles(A.page), b = await lireCles(B.page);
  ok('fusion : union des fiches acquises, des deux côtés', JSON.stringify(a.acquis) === '["biais:ancrage","sophismes:post-hoc"]' && JSON.stringify(b.acquis) === JSON.stringify(a.acquis), JSON.stringify([a.acquis, b.acquis]));
  ok('fusion : maximum des records', a.records.tout === 9 && b.records.tout === 9, JSON.stringify([a.records, b.records]));
  ok('fusion : compteurs cumulés additionnés (base vide)', JSON.stringify(a.confiance[90]) === '[14,12]' && JSON.stringify(b.confiance[90]) === '[14,12]', JSON.stringify([a.confiance, b.confiance]));
  // Modification sur B après connexion, puis synchronisations : A la reçoit, et les compteurs ne sont pas comptés deux fois
  await B.page.evaluate(() => { const c = JSON.parse(localStorage.getItem('confiance')); c[90] = [c[90][0] + 1, c[90][1] + 1]; ecrire('confiance', c); return synchroniser(); });
  await A.page.evaluate(() => synchroniser());
  const a2 = await lireCles(A.page);
  ok('fusion à trois : une réponse ajoutée sur B arrive sur A, sans double compte', JSON.stringify(a2.confiance[90]) === '[15,13]', JSON.stringify(a2.confiance));
  ok('le serveur ne voit qu\'un contenu chiffré', await A.page.evaluate(async url => {
    const etat = await lireEtatSynchro();
    const r = await fetch(url + '/v1/coffres/' + etat.id, { headers: { Authorization: 'Bearer ' + etat.jeton } });
    const { contenu } = await r.json();
    return !/ancrage|post-hoc|confiance/.test(contenu) && JSON.parse(contenu).v === 1;
  }, SYNCHRO));
  // Contenu altéré d'un seul bit : refusé, les données locales restent intactes
  const avant = await lireCles(A.page);
  const refus = await A.page.evaluate(async url => {
    const etat = await lireEtatSynchro();
    const r = await fetch(url + '/v1/coffres/' + etat.id, { headers: { Authorization: 'Bearer ' + etat.jeton } });
    const { contenu, version } = await r.json();
    const e = JSON.parse(contenu);
    const octets = Uint8Array.from(atob(e.c), c => c.charCodeAt(0));
    octets[5] ^= 1;
    e.c = btoa(String.fromCharCode(...octets));
    await fetch(url + '/v1/coffres/' + etat.id, { method: 'PUT', headers: { Authorization: 'Bearer ' + etat.jeton, 'Content-Type': 'application/json', 'If-Match': String(version) }, body: JSON.stringify({ contenu: JSON.stringify(e) }) });
    try { await synchroniser(); return 'accepté'; } catch (x) { return 'refusé'; }
  }, SYNCHRO);
  ok('contenu altéré d\'un seul bit : refusé', refus === 'refusé');
  ok('contenu altéré : les données locales sont intactes', JSON.stringify(await lireCles(A.page)) === JSON.stringify(avant));
  ok('aucune erreur JavaScript', !A.erreurs.length && !B.erreurs.length, [...A.erreurs, ...B.erreurs].join(' | '));
  await navigateur.close();
  console.log(echecs ? echecs + ' contrôle(s) en échec' : 'Tous les contrôles sont passés');
  process.exit(echecs ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
