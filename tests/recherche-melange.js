// Banc d'essai : recherche dans tout le site, sections d'ateliers pliables, « Question au hasard ».
// Nécessite le serveur local (python3 app.py) et Playwright (npm ci), avec CHROME=$(python3 tests/navigateur.py) :
//   node tests/recherche-melange.js            (adresse : http://localhost:8000/, ou variable URL_SITE)
// Chaque ligne affichée est un contrôle ; le code de sortie vaut 1 si l'un d'eux échoue.
const { chromium } = require('playwright');

const SITE = process.env.URL_SITE || 'http://localhost:8000/';
let echecs = 0;
const ok = (libelle, condition, detail = '') => {
  if (!condition) echecs++;
  console.log((condition ? 'OK    ' : 'ECHEC ') + libelle + (detail && !condition ? ' : ' + detail : ''));
};

(async () => {
  // Chrome du système (variable CHROME, posée par tests/lancer.sh) : aucun navigateur à télécharger
  const navigateur = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const erreurs = [];
  const nouvellePage = async (largeur = 1280, hauteur = 900) => {
    const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur } });
    const p = await contexte.newPage();
    p.on('pageerror', e => erreurs.push('page : ' + e.message));
    p.on('console', m => { if (m.type() === 'error') erreurs.push('console : ' + m.text()); });
    return p;
  };
  const resultats = p => p.$$eval('#resultats-globaux [role=option] .resultat-titre', l => l.map(x => x.textContent));
  const chercher = async (p, texte) => { await p.fill('#recherche-globale', texte); await p.waitForTimeout(40); return resultats(p); };

  // ---------- Recherche ----------
  let p = await nouvellePage();
  await p.goto(SITE + '#accueil', { waitUntil: 'load' });
  await p.waitForTimeout(300);
  let r = await chercher(p, 'linda');
  ok('« linda » trouve l\'atelier des problèmes classiques', r.includes('Problèmes classiques'), JSON.stringify(r));
  r = await chercher(p, 'b 10');
  ok('« B 10 » ouvre la fiche numéro 10 des biais seule', r.length === 1 && r[0] === "Effet d'ancrage", JSON.stringify(r));
  r = await chercher(p, 'S7');
  ok('« S7 » ouvre le sophisme numéro 7', r.length === 1, JSON.stringify(r));
  r = await chercher(p, 'conjonction');
  ok('recherche : « conjonction » trouve la fiche de la conjonction', r.some(t => /conjonction/i.test(t)), JSON.stringify(r));
  r = await chercher(p, 'consequent');
  ok('recherche sans accent : « consequent » trouve « conséquent »', r.some(t => /conséquent/i.test(t)), JSON.stringify(r));
  r = await chercher(p, 'ockham');
  ok('« ockham » trouve le rasoir (glossaire ou outils philosophiques)', r.length >= 2, JSON.stringify(r));
  r = await chercher(p, 'zzqxw');
  const bilan = await p.textContent('#bilan-globale');
  ok('une recherche sans résultat le dit', r.length === 0 && bilan.includes('Aucun résultat'), bilan);
  await chercher(p, 'hasard');
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('ArrowDown');
  const actif = await p.getAttribute('#recherche-globale', 'aria-activedescendant');
  ok('les flèches déplacent la sélection', actif === 'resultat-1', String(actif));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(250);
  const adresse = await p.evaluate(() => location.hash);
  ok('Entrée ouvre le résultat choisi', /^#(biais|sophismes|chiffres|tests|guide)\//.test(adresse), adresse);
  ok('la recherche se referme après le choix', (await p.getAttribute('#recherche-globale', 'aria-expanded')) === 'false');
  await chercher(p, 'ancrage');
  await p.keyboard.press('Escape');
  ok('Échap referme la liste sans effacer le texte', (await p.getAttribute('#recherche-globale', 'aria-expanded')) === 'false' && (await p.inputValue('#recherche-globale')) === 'ancrage');
  await p.keyboard.press('Escape');
  ok('Échap une seconde fois efface la recherche', (await p.inputValue('#recherche-globale')) === '');
  await p.close();

  // ---------- Sections pliables ----------
  p = await nouvellePage();
  await p.goto(SITE + '#ateliers', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.removeItem('sectionsOuvertes'));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(300);
  const nSections = await p.$$eval('.section-ateliers', s => s.length);
  ok('sept sections d\'ateliers', nSections === 7, String(nSections));
  const pliees = await p.$$eval('.section-ateliers .pliant', b => b.every(x => x.getAttribute('aria-expanded') === 'false'));
  const masquees = await p.$$eval('.section-ateliers .corps-section', c => c.every(x => x.hidden));
  ok('toutes les sections sont pliées par défaut', pliees && masquees);
  await p.click('#section-melange .pliant');
  const ouverte = await p.getAttribute('#section-melange .pliant', 'aria-expanded');
  const visible = await p.isVisible('#section-melange .cartes-grille');
  ok('un clic déplie la section', ouverte === 'true' && visible);
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(300);
  ok('la section reste dépliée après rechargement', (await p.getAttribute('#section-melange .pliant', 'aria-expanded')) === 'true');
  await p.click('.sommaire-ateliers .puce:nth-child(2)');
  await p.waitForTimeout(400);
  ok('le sommaire ouvre sa section', (await p.getAttribute('#section-monde .pliant', 'aria-expanded')) === 'true');
  await p.close();

  // ---------- Question au hasard ----------
  p = await nouvellePage();
  await p.goto(SITE + '#chiffres/melange', { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const jeux = [];
  // Chaque jeu demande une ou plusieurs actions (choisir, certitude, valider, saisir) avant « Question suivante »
  // Jusqu'à dix questions comptées dans le score de session (certains jeux demandent plusieurs gestes par question)
  const jauges = [];
  // Jusqu'au bilan, qui vient après vingt questions répondues
  for (let tour = 0, questions = 0; tour < 400 && !(await p.$('.melange-bilan')); tour++) {
    const suivant = p.locator('.melange-partie button[data-suivant]').first();
    if (await suivant.count()) {
      await suivant.click();
      questions++;
      await p.waitForTimeout(60);
      continue;
    }
    const largeur = await p.$eval('.melange-question .jauge > div', e => parseFloat(e.style.width)).catch(() => null);
    if (largeur !== null && jauges[jauges.length - 1] !== largeur) jauges.push(largeur);
    const titre = await p.textContent('.melange-jeu a').catch(() => '');
    if (titre && jeux[jeux.length - 1] !== titre) jeux.push(titre);
    const actions = ['.melange-partie button.choix:not([disabled])', '.melange-partie .certitude-boutons button:not([disabled])', '.melange-partie button.bouton:not([disabled]):not([data-suivant])'];
    let clique = false;
    for (const sel of actions) {
      const b = p.locator(sel).first();
      if (await b.count()) { await b.click({ timeout: 2000 }).catch(() => {}); clique = true; break; }
    }
    if (!clique) {
      const saisie = p.locator('.melange-partie input:not([type=checkbox]):not([type=radio])').first();
      if (await saisie.count()) { await saisie.fill('50'); await p.keyboard.press('Enter'); }
    }
    await p.waitForTimeout(60);
  }
  ok('le mélange tire des jeux différents', new Set(jeux).size >= 4, [...new Set(jeux)].join(' | '));
  ok('la jauge avance avec la partie (« Question n / 20 »)', jauges.length > 2 && jauges[jauges.length - 1] > jauges[0], JSON.stringify(jauges.slice(0, 4)));
  ok('partie de vingt questions : le bilan affiche « x / 20 »', / \/ 20$/.test((await p.textContent('.melange-bilan .grand-score')).trim()));
  const total = await p.evaluate(() => melange.total);
  ok('le score de session compte les questions jouées', total === 20, String(total));
  const anneaux = await p.$$eval('.melange-bilan .anneau', l => l.map(a => a.querySelector('figcaption').textContent + ' ' + a.querySelector('svg').getAttribute('aria-label')));
  ok('bilan après vingt questions : un anneau par catégorie, avec sa part de bonnes réponses', anneaux.length >= 2 && anneaux.every(a => /sur \d+/.test(a)), JSON.stringify(anneaux));
  const resultatsAteliers = await p.evaluate(() => lire('resultatsAteliers', {}));
  ok('le mélange n\'enregistre aucune partie', !('melange' in resultatsAteliers));
  await p.goto(SITE + '#chiffres/monde', { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const drapeau = await p.evaluate(() => MELANGE.actif);
  const compteur = await p.textContent('.quiz-entete');
  ok('après le mélange, un atelier joue sa partie complète', drapeau === false && compteur.includes('1 / 10'), compteur);
  await p.close();

  // ---------- Mise en page et version anglaise ----------
  for (const [largeur, hauteur] of [[390, 844], [1280, 900]]) {
    p = await nouvellePage(largeur, hauteur);
    await p.goto(SITE + '#ateliers', { waitUntil: 'load' });
    await p.waitForTimeout(300);
    await p.fill('#recherche-globale', 'vrai');
    await p.waitForTimeout(100);
    const debordement = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok('pas de défilement horizontal à ' + largeur + ' px', debordement === 0, String(debordement));
    await p.close();
  }
  p = await nouvellePage();
  await p.goto(SITE + 'en/#ateliers', { waitUntil: 'load' });
  await p.waitForTimeout(300);
  r = await chercher(p, 'linda');
  ok('version anglaise : la recherche fonctionne', r.length > 0, JSON.stringify(r));
  const placeholder = await p.getAttribute('#recherche-globale', 'placeholder');
  ok('version anglaise : libellé traduit', placeholder === 'Search everything…', placeholder);
  await p.close();

  // ---------- Sécurité de la vraie page (CSP en balise meta) ----------
  for (const page of ['', 'en/']) {
    p = await nouvellePage();
    await p.goto(SITE + page + '#accueil', { waitUntil: 'load' });
    await p.waitForTimeout(200);
    const sw = await p.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise(r => setTimeout(() => r(false), 5000))]));
    ok('service worker enregistré malgré Trusted Types (' + (page || 'fr') + ')', sw);
    const avant = erreurs.length;
    const tt = await p.evaluate(() => { try { document.createElement('div').innerHTML = '<b>x</b>'; return false; } catch (e) { return true; } });
    await p.waitForTimeout(50);
    erreurs.length = avant;   // le refus provoqué ici est écrit dans la console : attendu
    ok('Trusted Types actif (' + (page || 'fr') + ') : innerHTML refusé', tt);
    const referent = await p.getAttribute('meta[name=referrer]', 'content');
    ok('politique de référent (' + (page || 'fr') + ') : no-referrer', referent === 'no-referrer', String(referent));
    await p.close();
  }
  // Un script qui n'arrive pas : message « Chargement incomplet », et le bouton « Recharger » recharge vraiment
  // (l'ancien onclick en ligne était bloqué par la CSP)
  p = await nouvellePage();
  let bloquer = true;
  await p.route('**/pays.js', route => bloquer ? route.abort() : route.continue());
  const erreursAvant = erreurs.length;
  await p.goto(SITE + '#accueil', { waitUntil: 'load' });
  await p.waitForTimeout(200);
  const message = await p.textContent('main h2').catch(() => '');
  ok('script manquant : message « Chargement incomplet »', message === 'Chargement incomplet', message);
  erreurs.length = erreursAvant;   // l'échec de chargement et l'arrêt volontaire du script sont attendus ici
  bloquer = false;
  await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), p.click('main button')]);
  await p.waitForTimeout(300);
  ok('script manquant : « Recharger » recharge la page, qui s\'affiche', await p.evaluate(() => !!document.querySelector('main > section:not([hidden]) .carte') && !/Chargement incomplet/.test(document.querySelector('main').textContent)));
  await p.close();

  ok('aucune erreur JavaScript ni violation de la politique de sécurité', erreurs.length === 0, erreurs.slice(0, 5).join(' ; '));
  await navigateur.close();
  console.log(echecs ? echecs + ' contrôle(s) en échec' : 'Tous les contrôles sont passés');
  process.exit(echecs ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
