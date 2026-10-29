// niveaux.js : progression dans les ateliers. Trois niveaux : 1 (découverte), 2 (confirmé), 3 (expert).
// Par défaut, le niveau s'ajuste tout seul (mode « auto ») ; on peut aussi le choisir à la main.
// Stockage : niveaux[idAtelier] = { niveau, mode: "auto" | "choisi", parties, serie }.

const NOMS_NIVEAUX = { 1: "découverte", 2: "confirmé", 3: "expert" };

function niveauAtelier(id) {
  const n = lire("niveaux", {})[id] || {};
  return {
    niveau: [1, 2, 3].includes(n.niveau) ? n.niveau : 1,
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
    if (serie >= 3) { niveau = Math.min(3, niveau + 1); serie = 0; }
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
  const niveau = taux >= 0.8 ? Math.min(3, n.niveau + 1) : taux < 0.5 ? Math.max(1, n.niveau - 1) : n.niveau;
  enregistrerNiveau(id, { niveau, serie: 0 });
  return niveau;
}

// Comme tirerNouveaux, avec priorité au niveau demandé : d'abord les éléments jamais vus de ce niveau,
// puis ceux des niveaux voisins, puis, si tout a été vu, de nouveau ceux du niveau demandé.
// niveauDe(e) donne le niveau d'un élément (par défaut, son champ niveau, ou 1).
function tirerSelonNiveau(cle, elements, n, niveau, idDe = e => e.id, niveauDe = e => e.niveau || 1) {
  const vus = lire("vus", {});
  const dejaVus = new Set(vus[cle] || []);
  const ordre = [niveau, niveau - 1, niveau + 1, niveau - 2, niveau + 2].filter(x => x >= 1 && x <= 3);
  const pris = [];
  const prendre = liste => liste.forEach(e => { if (pris.length < n && !pris.includes(e)) pris.push(e); });
  ordre.forEach(niv => prendre(melanger(elements.filter(e => niveauDe(e) === niv && !dejaVus.has(idDe(e))))));
  if (pris.length < n) {
    // Tout a été vu à ces niveaux : nouveau cycle pour le niveau demandé
    const deNiveau = elements.filter(e => niveauDe(e) === niveau);
    vus[cle] = (vus[cle] || []).filter(i => !deNiveau.some(e => idDe(e) === i));
    ordre.forEach(niv => prendre(melanger(elements.filter(e => niveauDe(e) === niv))));
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
  [["auto", "Auto"], [1, "1"], [2, "2"], [3, "3"]].forEach(([valeur, texte]) => {
    const actif = valeur === "auto" ? actuel.mode === "auto" : actuel.mode === "choisi" && actuel.niveau === valeur;
    const b = el("button", "puce" + (actif ? " active" : ""), texte);
    b.setAttribute("aria-pressed", String(actif));
    if (valeur !== "auto") b.setAttribute("aria-label", "Niveau " + valeur + " : " + NOMS_NIVEAUX[valeur]);
    else b.setAttribute("aria-label", "Niveau automatique");
    b.addEventListener("click", () => {
      enregistrerNiveau(id, valeur === "auto" ? { mode: "auto", serie: 0 } : { mode: "choisi", niveau: valeur, serie: 0 });
      relancer();
      remonter();
    });
    puces.appendChild(b);
  });
  bloc.append(puces, el("p", "source", actuel.mode === "auto"
    ? "Auto adapte la difficulté à vos réponses."
    : "Niveau " + actuel.niveau + " (" + NOMS_NIVEAUX[actuel.niveau] + ") choisi : il reste fixe."));
  return bloc;
}

// Détails de la partie en cours, lus par afficherScore : niveaux posés et réponses justes par niveau
const PARTIES_EN_COURS = {};

// Niveau d'une partie : le plus fréquent parmi les questions posées, le plus élevé en cas d'égalité
function niveauDePartie(niveaux) {
  let meilleur = 1, compte = -1;
  [1, 2, 3].forEach(n => {
    const c = niveaux.filter(x => x === n).length;
    if (c >= compte && c > 0) { meilleur = n; compte = c; }
  });
  return meilleur;
}

// Déroule une partie dont chaque question est tirée au niveau du moment ; même forme que derouler().
// options : { id, n, tirer(niveau, i), relancer(), libelle, estJuste(resultat), avant(zone) }
// afficher(element, zone, fini, niveau) affiche une question ; bilan(resultats) conclut la partie.
function deroulerNiveaux(zone, options, afficher, bilan) {
  const { id, n, tirer, libelle, relancer } = options;
  const estJuste = options.estJuste || (r => r === true);
  let i = 0;
  let niveau = niveauAtelier(id).niveau;
  const resultats = [], niveaux = [];
  function etape() {
    zone.innerHTML = "";
    if (i >= n) {
      PARTIES_EN_COURS[id] = { niveaux, justes: resultats.map(estJuste) };
      enregistrerNiveau(id, { parties: niveauAtelier(id).parties + 1 });
      return bilan(resultats);
    }
    if (i === 0) {
      zone.appendChild(choixNiveau(id, relancer));
      if (options.avant) options.avant(zone);
    }
    entete(zone, i + 1, n, libelle, niveau);
    const element = tirer(niveau, i);
    niveaux.push(niveau);
    afficher(element, zone, (resultat, conteneur) => {
      resultats.push(resultat);
      niveau = suivreReponse(id, estJuste(resultat));
      (conteneur || zone).appendChild(boutonSuivant(i === n - 1 ? "Voir le bilan" : "Suivant", () => { i++; etape(); }));
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
  bloc.appendChild(el("p", null, "Partie jouée au niveau " + n + " (" + NOMS_NIVEAUX[n] + ")" + (max > n ? ", jusqu'au niveau " + max : "") + "."));
  const lignes = [1, 2, 3].map(niv => {
    const poses = p.niveaux.map((x, k) => [x, p.justes[k]]).filter(([x]) => x === niv);
    return poses.length ? "niveau " + niv + " : " + poses.filter(([, j]) => j).length + " / " + poses.length : null;
  }).filter(Boolean);
  bloc.appendChild(el("p", "source", "Réponses justes par niveau — " + lignes.join(" ; ") + "."));
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
