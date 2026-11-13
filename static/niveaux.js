// niveaux.js : progression dans les ateliers. Trois niveaux : 1 (découverte), 2 (confirmé), 3 (expert) ; certains
// ateliers vont jusqu'à 4 (maître) et 5 (virtuose), voir NIVEAUX_MAX.
// Par défaut, le niveau s'ajuste tout seul (mode « auto ») ; on peut aussi le choisir à la main.
// Stockage : niveaux[idAtelier] = { niveau, mode: "auto" | "choisi", parties, serie }.

const NOMS_NIVEAUX = { 1: T("découverte"), 2: T("confirmé"), 3: T("expert"), 4: T("maître"), 5: T("virtuose") };
// Ateliers qui vont au-delà du niveau 3 (plus durs, et mieux payés : barème « atelier-note », progression.js)
const NIVEAUX_MAX = { points: 5, hasard: 5, correlation: 5, graphiques: 5, crt: 5, classiques: 5, depistage: 5, "mots-de-passe": 5, "regle-246": 5, pays: 5, nord: 5, chronologie: 5, mortalite: 5, grandeurs: 5, hameconnage: 5, reparer: 5, "debat-truque": 5 };
const niveauMax = id => NIVEAUX_MAX[id] || 3;

function niveauAtelier(id) {
  const n = lire("niveaux", {})[id] || {};
  return {
    niveau: Number.isInteger(n.niveau) && n.niveau >= 1 && n.niveau <= niveauMax(id) ? n.niveau : 1,
    mode: n.mode === "choisi" ? "choisi" : "auto",
    parties: n.parties || 0,
    serie: n.serie || 0
  };
}

function enregistrerNiveau(id, changements) {
  const tous = lire("niveaux", {});
  tous[id] = Object.assign(niveauAtelier(id), changements);
  ecrire("niveaux", tous);
}

// Ajustement en « escalier » : le niveau monte après 3 bonnes réponses d'affilée et descend après 1 erreur.
// Cette règle « 3 réussites pour monter, 1 erreur pour descendre » converge vers environ 79,4 % de réussite
// (Levitt, « Transformed up-down methods in psychoacoustics », Journal of the Acoustical Society of America, 1971).
// En mode « choisi », le niveau ne bouge pas. Renvoie le niveau de la question suivante.
function suivreReponse(id, juste) {
  const n = niveauAtelier(id);
  if (n.mode !== "auto") return n.niveau;
  let { niveau, serie } = n;
  if (juste) {
    serie++;
    if (serie >= 3) { niveau = Math.min(niveauMax(id), niveau + 1); serie = 0; }
  } else {
    niveau = Math.max(1, niveau - 1);
    serie = 0;
  }
  enregistrerNiveau(id, { niveau, serie });
  return niveau;
}

// Ateliers dont toutes les questions s'affichent ensemble : ajustement d'une partie à l'autre.
// Même esprit que l'escalier : il faut réussir nettement (80 % au moins) pour monter, et un échec net
// (moins de 50 %) fait descendre.
function suivrePartie(id, score, sur) {
  const n = niveauAtelier(id);
  if (n.mode !== "auto" || !sur) return n.niveau;
  const taux = score / sur;
  const niveau = taux >= 0.8 ? Math.min(niveauMax(id), n.niveau + 1) : taux < 0.5 ? Math.max(1, n.niveau - 1) : n.niveau;
  enregistrerNiveau(id, { niveau, serie: 0 });
  return niveau;
}

// Comme tirerNouveaux, avec priorité au niveau demandé : d'abord les éléments jamais vus de ce niveau,
// puis ceux des niveaux voisins, puis, si tout a été vu, de nouveau ceux du niveau demandé.
// niveauDe(e) donne le niveau d'un élément (par défaut, son champ niveau, ou 1).
function tirerSelonNiveau(cle, elements, n, niveau, idDe = e => e.id, niveauDe = e => e.niveau || 1) {
  const vus = lire("vus", {});
  const dejaVus = new Set(vus[cle] || []);
  // Jusqu'au niveau 5 : une banque sans élément de niveau 4 ou 5 retombe sur ses éléments de niveau 3
  const ordre = [niveau, niveau - 1, niveau + 1, niveau - 2, niveau + 2].filter(x => x >= 1 && x <= 5);
  const pris = [];
  const prendre = liste => liste.forEach(e => { if (pris.length < n && !pris.includes(e)) pris.push(e); });
  ordre.forEach(niv => prendre(melanger(elements.filter(e => niveauDe(e) === niv && !dejaVus.has(idDe(e))))));
  if (pris.length < n) {
    // Tout a été vu à ces niveaux : on remet en jeu les plus anciens d'abord. Une question ne revient ainsi qu'après
    // toutes les autres, et jamais dans la partie en cours (remettre tout le stock en jeu la faisait revenir)
    const liste = vus[cle] || [];
    const ids = new Set(elements.filter(e => ordre.includes(niveauDe(e))).map(idDe));
    for (let k = 0; k < liste.length && pris.length < n; k++) {
      if (!ids.has(liste[k])) continue;
      const e = elements.find(x => idDe(x) === liste[k]);
      if (e && !pris.includes(e)) { pris.push(e); liste.splice(k--, 1); }
    }
    vus[cle] = liste;
  }
  vus[cle] = [...new Set([...(vus[cle] || []), ...pris.map(idDe)])];
  ecrire("vus", vus);
  return pris;
}

// Puces « Auto · 1 · 2 · 3 », sur le modèle du choix de thème. Un clic relance la partie.
function choixNiveau(id, relancer) {
  const actuel = niveauAtelier(id);
  const bloc = el("div", "choix-niveau");
  const puces = el("div", "puces puces-niveau");
  puces.setAttribute("role", "group");
  puces.setAttribute("aria-label", "Niveau de difficulté");
  [["auto", "Auto"], ...Array.from({ length: niveauMax(id) }, (_, k) => [k + 1, String(k + 1)])].forEach(([valeur, texte]) => {
    const actif = valeur === "auto" ? actuel.mode === "auto" : actuel.mode === "choisi" && actuel.niveau === valeur;
    const b = el("button", "puce" + (actif ? " active" : ""), texte);
    b.setAttribute("aria-pressed", String(actif));
    if (valeur !== "auto") b.setAttribute("aria-label", T("Niveau {0} : {1}", valeur, NOMS_NIVEAUX[valeur]));
    else b.setAttribute("aria-label", "Niveau automatique");
    b.addEventListener("click", () => {
      enregistrerNiveau(id, valeur === "auto" ? { mode: "auto", serie: 0 } : { mode: "choisi", niveau: valeur, serie: 0 });
      relancer();
      remonter();
    });
    puces.appendChild(b);
  });
  // Points de lucidité multipliés selon le niveau (barème « atelier-note », progression.js) ; rien en mode sobre
  bloc.append(puces, el("p", "source", (actuel.mode === "auto"
    ? T("Auto adapte la difficulté à vos réponses.")
    : T("Niveau {0} ({1}) choisi : il reste fixe.", actuel.niveau, NOMS_NIVEAUX[actuel.niveau])) + (modeSobre() ? "" : " " + (niveauMax(id) > 3 ? T("Points : × 1,5 au niveau 2, × 2 au niveau 3, × 2,5 au niveau 4, × 3 au niveau 5.") : T("Points : × 1,5 au niveau 2, × 2 au niveau 3.")).replace(/× ?/g, "×\u00a0"))));   // « × » jamais seul en fin de ligne
  return bloc;
}

// Détails de la partie en cours, lus par afficherScore : niveaux posés et réponses justes par niveau
const PARTIES_EN_COURS = {};

// Niveau d'une partie : le plus fréquent parmi les questions posées, le plus élevé en cas d'égalité
function niveauDePartie(niveaux) {
  let meilleur = 1, compte = -1;
  [1, 2, 3, 4, 5].forEach(n => {
    const c = niveaux.filter(x => x === n).length;
    if (c >= compte && c > 0) { meilleur = n; compte = c; }
  });
  return meilleur;
}

// Mode « Question au hasard » (melange.js) : vrai pendant le lancement d'un jeu tiré au hasard, avec la fonction
// qui reçoit la question jouée (résultat, juste ou non). Faux partout ailleurs : les ateliers gardent leur partie complète.
const MELANGE = { actif: false, fin: null };

// Déroule une partie dont chaque question est tirée au niveau du moment ; même forme que derouler().
// options : { id, n, tirer(niveau, i), relancer(), libelle, estJuste(resultat), avant(zone) }
// afficher(element, zone, fini, niveau) affiche une question ; bilan(resultats) conclut la partie.
function deroulerNiveaux(zone, options, afficher, bilan) {
  const { id, tirer, libelle, relancer } = options;
  const estJuste = options.estJuste || (r => r === true);
  // En mode « Question au hasard » (melange.js), la partie ne compte qu'une question : pas de réglage de niveau,
  // pas de bilan ni d'enregistrement de partie, et la fin passe la main au mélange. Le mode est lu une seule fois,
  // au lancement : le mélange peut donc avoir fini de tirer sa question quand le joueur répond.
  const melange = MELANGE.actif ? MELANGE.fin : null;
  const n = melange ? 1 : options.n;
  let i = 0;
  let niveau = niveauAtelier(id).niveau;
  const resultats = [], niveaux = [];
  function etape() {
    zone.replaceChildren();
    if (i >= n) {
      if (melange) return melange(resultats[0], estJuste(resultats[0]));
      PARTIES_EN_COURS[id] = { niveaux, justes: resultats.map(estJuste) };
      enregistrerNiveau(id, { parties: niveauAtelier(id).parties + 1 });
      return bilan(resultats);
    }
    if (i === 0 && !melange) {
      zone.appendChild(choixNiveau(id, relancer));
      if (options.avant) options.avant(zone);
    }
    entete(zone, i + 1, n, libelle, niveau);
    const element = tirer(niveau, i);
    niveaux.push(niveau);
    afficher(element, zone, (resultat, conteneur) => {
      resultats.push(resultat);
      niveau = suivreReponse(id, estJuste(resultat));
      const suite = i === n - 1 ? (melange ? "Question suivante" : "Voir le bilan") : "Suivant";
      (conteneur || zone).appendChild(boutonSuivant(suite, () => { i++; etape(); }));
      montrer(conteneur);
    }, niveau);
  }
  etape();
}

// Lignes du bilan : niveau atteint et réponses justes par niveau
function bilanNiveaux(id) {
  const p = PARTIES_EN_COURS[id];
  if (!p) return null;
  const bloc = el("div", "bilan-niveaux");
  const n = niveauDePartie(p.niveaux), max = Math.max(...p.niveaux);
  bloc.appendChild(el("p", null, (max > n ? T("Partie jouée au niveau {0} ({1}), jusqu'au niveau {2}.", n, NOMS_NIVEAUX[n], max) : T("Partie jouée au niveau {0} ({1}).", n, NOMS_NIVEAUX[n]))));
  const lignes = [1, 2, 3, 4, 5].map(niv => {
    const poses = p.niveaux.map((x, k) => [x, p.justes[k]]).filter(([x]) => x === niv);
    return poses.length ? T("niveau {0} : {1} / {2}", niv, poses.filter(([, j]) => j).length, poses.length) : null;
  }).filter(Boolean);
  bloc.appendChild(el("p", "source", T("Réponses justes par niveau — {0}.", lignes.join(" ; "))));
  return bloc;
}

// Maîtrise : au moins 90 % au niveau 3 sur trois parties. Une mention, jamais un verrou.
function atelierMaitrise(id) {
  const r = resultatAtelier(id);
  return !!(r && r.niveaux && r.niveaux[3] && (r.niveaux[3].reussites90 || 0) >= 3);
}

// Ateliers dont les questions s'affichent ensemble : enregistre le niveau de la partie et les réponses
// justes (pour le bilan), puis ajuste le niveau de la partie suivante
function noterPartieEntiere(id, niveau, justes) {
  PARTIES_EN_COURS[id] = { niveaux: justes.map(() => niveau), justes };
  enregistrerNiveau(id, { parties: niveauAtelier(id).parties + 1 });
  suivrePartie(id, justes.filter(Boolean).length, justes.length);
}

// ===================== Mode chrono =====================
// 60 secondes pour répondre au plus grand nombre de questions : +1 par bonne réponse, −2 par erreur, pour décourager
// les réponses au hasard. Record séparé (clé « chrono »). Si l'appareil demande de réduire les animations, pas de
// jauge qui défile : le temps restant s'affiche seulement en texte.
// options : { cle, titre, tirer() → { texte, options, juste, explication }, relancer() }
function partieChrono(zone, options) {
  zone.replaceChildren();
  // demarrer : le compte à rebours attend un clic (le quiz rouvre ce mode au chargement de #quiz)
  if (options.demarrer) {
    const b = el("button", "bouton large", "Démarrer");
    b.type = "button";
    b.addEventListener("click", () => partieChrono(zone, { ...options, demarrer: false }));
    zone.append(el("p", "consigne", T("{0} : 60 secondes", T(options.titre))), b);
    return;
  }
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let score = 0, bonnes = 0, erreurs = 0, reste = 60, termine = false;
  const temps = el("p", "chrono-temps"), points = el("p", "chrono-points");
  const tete = el("div", "chrono-tete");
  tete.append(temps, points);
  const jauge = reduit ? null : el("div", "jauge chrono-jauge");
  if (jauge) jauge.appendChild(el("div"));
  const verdict = el("p", "chrono-verdict");
  verdict.setAttribute("aria-live", "polite");
  const zoneQ = el("div");
  zone.append(el("p", "consigne", T("{0} : 60 secondes", T(options.titre))), tete);
  if (jauge) zone.appendChild(jauge);
  zone.append(verdict, zoneQ);
  const maj = () => {
    temps.textContent = T("Reste : {0} s", reste);
    points.textContent = typo(signe(score) + " points");
    if (jauge) jauge.firstChild.style.width = (100 * reste / 60) + "%";
  };
  const question = () => {
    zoneQ.replaceChildren();
    const q = options.tirer();
    zoneQ.appendChild(el("p", "cas", q.texte));
    q.options.forEach((o, k) => {
      const b = boutonChoix(o, k);
      b.addEventListener("click", () => {
        if (termine) return;
        if (k === q.juste) { score++; bonnes++; verdict.textContent = "Juste."; verdict.className = "chrono-verdict juste-texte"; }
        else { score -= 2; erreurs++; verdict.textContent = typo(T("Erreur : c'était « {0} ».", T(q.options[q.juste]))); verdict.className = "chrono-verdict faux-texte"; }
        maj();
        question();
      });
      zoneQ.appendChild(b);
    });
  };
  const fin = () => {
    termine = true;
    clearInterval(minuteur);
    const records = lire("chrono", {});
    const ancien = records[options.cle];
    const joue = bonnes + erreurs > 0;   // partie sans réponse : ni record, ni points, ni activité
    const nouveau = joue && (ancien === undefined || score > ancien);
    if (nouveau) { records[options.cle] = score; ecrire("chrono", records); }
    if (joue) noterActivite();
    if (joue && options.cle === "quiz") gagner("chrono", score);
    zone.replaceChildren();
    zone.append(el("p", "consigne", "Temps écoulé"), el("p", "grand-score", typo(signe(score) + " points")),
      paragraphe(T("{0}, {1} (chaque erreur retire 2 points).", pluriel(bonnes, "bonne réponse", "bonnes réponses"), pluriel(erreurs, "erreur"))),
      el("p", nouveau && ancien !== undefined ? "verdict juste" : "source", !joue ? "Aucune réponse : rien n'est enregistré." : ancien === undefined ? "Premier record enregistré." : nouveau ? T("Nouveau record ! L'ancien était de {0} points.", signe(ancien)) : T("Votre record : {0} points.", signe(ancien))));
    if (options.retour) boutonRejouer(zone, () => partieChrono(zone, { ...options, demarrer: false }), "Rejouer le chrono");
    boutonRejouer(zone, options.relancer, options.retour || "Revenir à l'atelier");
  };
  // Le temps restant se lit sur l'horloge : un navigateur ralentit les minuteurs d'un onglet en arrière-plan
  // (Safari, iPhone), et compter les déclenchements allongerait la partie au-delà de 60 secondes
  const finPartie = Date.now() + 60000;
  const tic = () => {
    if (termine) return;
    if (!zone.isConnected || !zoneQ.isConnected) { clearInterval(minuteur); document.removeEventListener("visibilitychange", tic); return; }
    reste = Math.max(0, Math.ceil((finPartie - Date.now()) / 1000));
    maj();
    if (reste <= 0) { document.removeEventListener("visibilitychange", tic); fin(); }
  };
  const minuteur = setInterval(tic, 250);
  // Au retour sur l'onglet, la fin de partie est constatée tout de suite, sans attendre le prochain déclenchement
  document.addEventListener("visibilitychange", tic);
  maj();
  question();
}

// ===================== Classements (niveau 3) =====================
// Éléments à mettre dans l'ordre avec des boutons ↑ et ↓, utilisables au doigt et au clavier.
// libelle(e) donne le texte d'un élément ; surValidation(ordre) reçoit l'ordre choisi.
function classementInteractif(zone, elements, libelle, surValidation) {
  let ordre = melanger(elements);
  const liste = el("ol", "classement");
  liste.setAttribute("aria-live", "polite");
  const dessiner = focus => {
    liste.replaceChildren();
    ordre.forEach((e, k) => {
      const li = el("li");
      const haut = el("button", "bouton-pas", "↑"), bas = el("button", "bouton-pas", "↓");
      haut.setAttribute("aria-label", T("Monter {0}", libelle(e)));
      bas.setAttribute("aria-label", T("Descendre {0}", libelle(e)));
      haut.disabled = k === 0;
      bas.disabled = k === ordre.length - 1;
      const deplacer = (vers, sens) => {
        [ordre[k], ordre[vers]] = [ordre[vers], ordre[k]];
        dessiner([vers, sens]);
      };
      haut.addEventListener("click", () => deplacer(k - 1, "haut"));
      bas.addEventListener("click", () => deplacer(k + 1, "bas"));
      li.append(el("span", "classement-rang", String(k + 1)), el("span", "classement-nom", libelle(e)), haut, bas);
      liste.appendChild(li);
    });
    // Le focus suit l'élément déplacé, pour enchaîner les déplacements au clavier
    if (focus) {
      const boutons = liste.children[focus[0]].querySelectorAll("button");
      const b = focus[1] === "haut" ? boutons[0] : boutons[1];
      (b.disabled ? (focus[1] === "haut" ? boutons[1] : boutons[0]) : b).focus();
    }
  };
  dessiner();
  const valider = el("button", "bouton large", "Valider le classement");
  valider.dataset.valider = "1";
  valider.addEventListener("click", () => {
    liste.querySelectorAll("button").forEach(b => { b.disabled = true; });
    valider.remove();
    surValidation(ordre);
  });
  zone.append(liste, valider);
}

// Part des paires rangées dans le bon ordre : complément de la distance de Kendall, rapportée au nombre de paires.
// rang(e) : place exacte de l'élément (plus petit = premier). Un classement presque juste rapporte presque tous les points.
function pairesConcordantes(ordre, rang) {
  let justes = 0, total = 0;
  const inversees = [];
  for (let i = 0; i < ordre.length; i++) {
    for (let j = i + 1; j < ordre.length; j++) {
      total++;
      if (rang(ordre[i]) < rang(ordre[j])) justes++; else inversees.push([ordre[j], ordre[i]]);
    }
  }
  return { part: justes / total, justes, total, inversees };
}

// Somme des résultats d'une partie qui mêle questions à une réponse (true / false) et classements (part de 0 à 1)
const sommeResultats = resultats => resultats.reduce((t, r) => t + (r === true ? 1 : typeof r === "number" ? r : 0), 0);
const justeOuPresque = r => r === true || (typeof r === "number" && r >= 0.8);

// Correction d'un classement : verdict, bon ordre (avec un détail par élément) et paires inversées
function corrigerClassement(retour, ordre, bonOrdre, libelle, detail) {
  const p = pairesConcordantes(ordre, e => bonOrdre.indexOf(e));
  retour.appendChild(el("p", "verdict " + (p.part === 1 ? "juste" : p.part >= 0.8 ? "" : "faux"),
    p.part === 1 ? T("Classement exact.") : T("{0} paires sur {1} dans le bon ordre.", p.justes, p.total)));
  const ol = el("ol", "liste-simple");
  bonOrdre.forEach(e => ol.appendChild(el("li", null, libelle(e) + " : " + detail(e))));
  retour.append(el("p", "consigne", "Le bon ordre"), ol);
  if (p.inversees.length) retour.appendChild(paragraphe(T("Paires inversées, dans le bon ordre : {0}.", p.inversees.map(([a, b]) => T("{0} avant {1}", libelle(a), libelle(b))).join(" ; ")), "source"));
  return Number(p.part.toFixed(2));
}
