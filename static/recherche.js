// recherche.js : recherche dans tout le site (fiches, ateliers, expériences de pensée, guide, lexique).
// Dans l'en-tête, sur toutes les pages. Tolérante aux accents, à la casse et à l'ordre des mots ; « B 10 » ou « s7 »
// ouvre une fiche par son numéro. Au clavier : flèches pour parcourir, Entrée pour ouvrir, Échap pour fermer.
// Sur la liste des fiches, la même barre filtre la liste (app.js, rechercheDansFiches) et n'ouvre pas de menu.
// Dépend de app.js (normaliser, rechercheDansFiches, TYPES, rechercheNumero, texteRecherche, el, lienVers) et de ateliers.js (tousLesAteliers).

const RECHERCHE = { index: null, resultats: [], actif: -1 };
const RECHERCHE_MAX = 12;   // résultats affichés au plus ; le reste est signalé

// Forme de comparaison : minuscules, sans accents, apostrophes et ligatures ramenées à leur forme simple
const comparable = texte => normaliser(String(texte)).replace(/[’‘]/g, "'").replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/\s+/g, " ").trim();
const majusculeInitiale = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
const extrait = (texte, longueur = 120) => {
  const t = String(texte || "").replace(/\s+/g, " ").trim();
  return t.length > longueur ? t.slice(0, longueur).replace(/\s+\S*$/, "") + "…" : t;
};

// Construit l'index une fois, à la première recherche (les données sont déjà chargées)
function indexRecherche() {
  if (RECHERCHE.index) return RECHERCHE.index;
  const entrees = [];
  // Fiches : biais et sophismes, avec leur numéro de catalogue
  Object.entries(TYPES).forEach(([type, conf]) => {
    conf.fiches.forEach(f => entrees.push({
      genre: majusculeInitiale(conf.singulier), titre: f.nom, adresse: "#" + type + "/" + f.id,
      texte: comparable(texteRecherche(f)), extrait: extrait(f.definition), type, num: f.num
    }));
  });
  // Ateliers : titre, résumé, et les titres des problèmes ou des expériences qu'ils contiennent
  const motsDesAteliers = {
    classiques: () => PROBLEMES.map(p => p.titre).join(" "),
    pensee: () => EXPERIENCES_PENSEE.map(e => e.titre + " " + e.auteur).join(" ")
  };
  // Parcours (parcours.js)
  PARCOURS.forEach(p => entrees.push({
    genre: T("Parcours"), titre: T(p.titre), adresse: "#parcours/" + p.id,
    texte: comparable([T(p.titre), T(p.promesse)].join(" ")), extrait: extrait(T(p.promesse))
  }));
  tousLesAteliers().forEach(({ atelier, adresse }) => {
    const mots = motsDesAteliers[atelier.id] ? motsDesAteliers[atelier.id]() : "";
    entrees.push({
      genre: T("Atelier"), titre: atelier.titre, adresse,
      texte: comparable([atelier.titre, atelier.resume, mots].join(" ")), extrait: extrait(atelier.resume)
    });
  });
  // Guide : chaque section, et chaque terme du lexique
  document.querySelectorAll("#vue-guide article.carte[id^='g-']").forEach(article => {
    const adresse = "#guide/" + article.id.slice(2);
    const titre = article.querySelector("h2").textContent;
    entrees.push({ genre: T("Guide"), titre, adresse, texte: comparable(article.textContent), extrait: extrait(article.querySelector("p") ? article.querySelector("p").textContent : "") });
    // Le lexique est la section « Lexique » seulement (les autres listes de définitions restent dans leur section)
    const liste = article.id === "g-lexique" ? article.querySelector("dl") : null;
    if (liste) [...liste.querySelectorAll("dt")].forEach(dt => {
      const definition = dt.nextElementSibling ? dt.nextElementSibling.textContent : "";
      entrees.push({ genre: T("Lexique"), titre: dt.textContent, adresse, texte: comparable(dt.textContent + " " + definition), extrait: extrait(definition) });
    });
  });
  RECHERCHE.index = entrees;
  return entrees;
}

// Résultats pour une requête : tous les mots doivent figurer quelque part ; le titre compte davantage
function chercher(requete) {
  const q = comparable(requete);
  if (!q) return [];
  const numero = rechercheNumero(q);
  const mots = q.split(" ").filter(Boolean);
  const notes = [];
  indexRecherche().forEach((e, rang) => {
    let note = 0;
    if (numero) {
      if (e.type && e.type === numero.type && e.num === numero.num) note = 100;
    } else {
      const titre = comparable(e.titre);
      if (!mots.every(m => e.texte.includes(m))) return;
      note = 1;
      if (titre === q) note += 100;
      else if (titre.startsWith(q)) note += 60;
      else if (titre.includes(q)) note += 40;
      mots.forEach(m => { if (titre.includes(m)) note += 10; });
    }
    if (note > 0) notes.push({ e, note, rang });
  });
  return notes.sort((a, b) => b.note - a.note || a.rang - b.rang).map(n => n.e);
}

function ouvrirListe(ouvrir) {
  const liste = $("resultats-globaux");
  const champ = $("recherche-globale");
  liste.hidden = !ouvrir;
  champ.setAttribute("aria-expanded", String(ouvrir));
  if (!ouvrir) { RECHERCHE.actif = -1; champ.removeAttribute("aria-activedescendant"); }
}

function activer(rang) {
  const items = [...$("resultats-globaux").querySelectorAll("[role='option']")];
  if (!items.length) return;
  RECHERCHE.actif = (rang + items.length) % items.length;
  items.forEach((li, k) => {
    li.classList.toggle("actif", k === RECHERCHE.actif);
    li.setAttribute("aria-selected", String(k === RECHERCHE.actif));
  });
  $("recherche-globale").setAttribute("aria-activedescendant", items[RECHERCHE.actif].id);
  // Défilement de la liste seule (scrollIntoView ferait aussi défiler la page)
  const liste = $("resultats-globaux"), li = items[RECHERCHE.actif];
  if (li.offsetTop < liste.scrollTop) liste.scrollTop = li.offsetTop;
  else if (li.offsetTop + li.offsetHeight > liste.scrollTop + liste.clientHeight) liste.scrollTop = li.offsetTop + li.offsetHeight - liste.clientHeight;
}

// Aucune sélection, liste ramenée en haut (nouvelle requête)
function desactiver() {
  RECHERCHE.actif = -1;
  $("resultats-globaux").scrollTop = 0;
  $("recherche-globale").removeAttribute("aria-activedescendant");
}

function afficherRecherche() {
  const champ = $("recherche-globale");
  const liste = $("resultats-globaux");
  const bilan = $("bilan-globale");
  const q = champ.value.trim();
  liste.replaceChildren();
  // Sur la liste des fiches, la barre filtre la liste (app.js) : pas de menu déroulant
  if (rechercheDansFiches() || comparable(q).length < 2 && !rechercheNumero(comparable(q))) {
    RECHERCHE.resultats = [];
    bilan.textContent = "";
    ouvrirListe(false);
    return;
  }
  RECHERCHE.resultats = chercher(q);
  const total = RECHERCHE.resultats.length;
  if (!total) {
    liste.appendChild(el("li", "resultat-vide", T("Aucun résultat pour « {0} ».", q)));
    bilan.textContent = T("Aucun résultat pour « {0} ».", q);
  } else {
    RECHERCHE.resultats.slice(0, RECHERCHE_MAX).forEach((e, k) => {
      const li = el("li", "resultat");
      li.id = "resultat-" + k;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      const lien = el("a", "resultat-lien");
      lien.href = e.adresse;
      lien.tabIndex = -1;   // le clavier passe par le champ : flèches, Entrée
      lien.append(el("span", "resultat-genre", e.genre), el("span", "resultat-titre", e.titre));
      if (e.extrait) lien.appendChild(el("span", "resultat-extrait", e.extrait));
      li.appendChild(lien);
      liste.appendChild(li);
    });
    if (total > RECHERCHE_MAX) liste.appendChild(el("li", "resultat-vide", T("Encore {0} : précisez la recherche.", total - RECHERCHE_MAX)));
    bilan.textContent = pluriel(total, "résultat");
  }
  ouvrirListe(true);
  desactiver();
}

function fermerRecherche(effacer) {
  const champ = $("recherche-globale");
  if (effacer && champ.value) {
    champ.value = "";
    if (rechercheDansFiches()) champ.dispatchEvent(new Event("input"));   // le filtre des fiches suit
  }
  RECHERCHE.resultats = [];
  $("bilan-globale").textContent = "";
  ouvrirListe(false);
}

// Ouvre le résultat choisi : l'adresse change, la page s'affiche (afficherPage, dans app.js)
function ouvrirResultat(adresse) {
  fermerRecherche(true);
  $("recherche-globale").blur();
  if (location.hash === adresse) afficherPage(); else location.hash = adresse;
}

(function brancherRecherche() {
  const champ = $("recherche-globale");
  if (!champ) return;
  const liste = $("resultats-globaux");
  champ.addEventListener("focus", () => indexRecherche());
  champ.addEventListener("input", afficherRecherche);
  champ.addEventListener("keydown", e => {
    const ouverte = !liste.hidden;
    if (e.key === "ArrowDown") { e.preventDefault(); if (!ouverte) afficherRecherche(); activer(RECHERCHE.actif + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); activer(RECHERCHE.actif < 0 ? -1 : RECHERCHE.actif - 1); }   // sans sélection : le dernier
    else if (e.key === "Enter") {
      const choisi = RECHERCHE.resultats[RECHERCHE.actif >= 0 ? RECHERCHE.actif : 0];
      if (ouverte && choisi) { e.preventDefault(); ouvrirResultat(choisi.adresse); }
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      if (ouverte) fermerRecherche(false); else fermerRecherche(true);
    }
  });
  // Clic sur un résultat : le lien suit son adresse, la recherche se referme
  liste.addEventListener("click", e => {
    const lien = e.target.closest("a.resultat-lien");
    if (!lien) return;
    e.preventDefault();
    ouvrirResultat(lien.getAttribute("href"));
  });
  // Le focus quitte la recherche (hors de la liste) : on la referme
  champ.closest(".recherche-globale").addEventListener("focusout", e => {
    if (!e.currentTarget.contains(e.relatedTarget)) ouvrirListe(false);
  });
})();
