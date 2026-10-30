// controle-affichage.js : repère les défauts de mise en page du site « Esprit critique ».
// À charger APRÈS les scripts du site, dans une page de test (jamais en production).
//
//   controleAffichage(racine)  analyse ce qui est affiché dans « racine » (par défaut la vue visible)
//   controleDonnees()          dessine toutes les variantes des frises, planisphères, arbres et
//                              illustrations des fiches, et analyse chacune
//
// Chaque fonction renvoie une liste de défauts { type, ou, texte, detail }. Liste vide = rien à signaler.
// Types de défauts :
//   page-defilement-horizontal  la page est plus large que l'écran
//   svg-texte-rogne             un texte SVG dépasse du dessin (il est coupé à l'écran)
//   svg-textes-superposes       deux textes d'un même dessin se chevauchent
//   texte-hors-de-sa-forme      un texte déborde du cercle ou du rectangle qui le contient
//   element-hors-cadre          une forme ou un texte sort du viewBox
//   html-hors-ecran             un élément dépasse du bord de l'écran
//   html-texte-deborde          un texte dépasse de sa boîte (ou y est tronqué)
//   a11y-sans-nom               un bouton, un lien ou un champ sans nom pour les lecteurs d'écran
//   id-double                   un identifiant HTML utilisé plusieurs fois

(function () {
  const MARGE = 0.5; // tolérance, en pixels ou en unités du viewBox

  // Vue affichée : la section <main> visible, sinon le document entier
  function vueVisible() {
    return [...document.querySelectorAll("main section.vue")].find(s => !s.hidden) || document.body;
  }

  function nomDuDessin(s) {
    return s.getAttribute("aria-label") || s.getAttribute("class") || "svg";
  }

  // Vrai si un ancêtre (jusqu'au <svg>) porte une transformation : ses coordonnées locales ne sont
  // alors pas celles du viewBox, et l'on s'abstient de conclure.
  function transforme(e, s) {
    for (let p = e; p && p !== s; p = p.parentNode) if (p.getAttribute && p.getAttribute("transform")) return true;
    return false;
  }

  // Formes susceptibles de contenir un texte : rectangles, cercles, ellipses (hors fonds de graphique)
  function formesConteneurs(s, vb) {
    return [...s.querySelectorAll("rect, circle, ellipse")]
      .filter(f => !transforme(f, s) && !f.closest("defs, marker, clipPath, pattern"))
      .map(f => {
        const n = k => Number(f.getAttribute(k) || 0);
        if (f.tagName === "rect") return { f, rect: true, x: n("x"), y: n("y"), w: n("width"), h: n("height") };
        const r = f.tagName === "circle" ? n("r") : null;
        return { f, rect: false, cx: n("cx"), cy: n("cy"), rx: r ?? n("rx"), ry: r ?? n("ry") };
      })
      .filter(f => {
        const aire = f.rect ? f.w * f.h : Math.PI * f.rx * f.ry;
        const assezGrande = f.rect ? f.w > 14 && f.h > 10 : f.rx > 6;
        return assezGrande && aire < 0.6 * vb.width * vb.height; // un fond de graphique n'est pas un conteneur
      });
  }

  const dedans = (f, x, y) => f.rect
    ? x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h
    : ((x - f.cx) / f.rx) ** 2 + ((y - f.cy) / f.ry) ** 2 <= 1;
  const aire = f => (f.rect ? f.w * f.h : Math.PI * f.rx * f.ry);

  // Analyse d'un dessin SVG en unités du viewBox
  function analyserDessin(s, defauts) {
    const vb = s.viewBox && s.viewBox.baseVal;
    if (!vb || !vb.width || s.getBoundingClientRect().width < 2) return;
    const nom = nomDuDessin(s);
    const textes = [...s.querySelectorAll("text")].filter(t => t.textContent.trim() && !transforme(t, s));

    // 1. Texte qui sort du dessin, et texte qui déborde de sa forme
    const formes = formesConteneurs(s, vb);
    textes.forEach(t => {
      const b = t.getBBox();
      if (!b.width) return;
      const hors = [];
      if (b.x < vb.x - MARGE) hors.push("gauche " + (vb.x - b.x).toFixed(1));
      if (b.x + b.width > vb.x + vb.width + MARGE) hors.push("droite " + (b.x + b.width - vb.x - vb.width).toFixed(1));
      if (b.y < vb.y - MARGE) hors.push("haut " + (vb.y - b.y).toFixed(1));
      if (b.y + b.height > vb.y + vb.height + MARGE) hors.push("bas " + (b.y + b.height - vb.y - vb.height).toFixed(1));
      if (hors.length) defauts.push({ type: "svg-texte-rogne", ou: nom, texte: t.textContent.trim(), detail: hors.join(", ") + " unités (viewBox " + vb.width + " × " + vb.height + ")" });

      // Hauteur utile du texte : on ignore une partie des espaces d'ascendantes et de descendantes
      const y0 = b.y + 0.2 * b.height, y1 = b.y + 0.85 * b.height;
      const xm = b.x + b.width / 2, ym = (y0 + y1) / 2;
      const conteneur = formes.filter(f => dedans(f, xm, ym)).sort((a, c) => aire(a) - aire(c))[0];
      if (!conteneur) return;
      const coins = [[b.x, y0], [b.x + b.width, y0], [b.x, y1], [b.x + b.width, y1]];
      if (coins.every(([x, y]) => dedans(conteneur, x, y))) return;
      let depasse;
      if (conteneur.rect) {
        depasse = Math.max(conteneur.x - b.x, b.x + b.width - conteneur.x - conteneur.w, conteneur.y - y0, y1 - conteneur.y - conteneur.h);
      } else {
        // Demi-largeur disponible dans l'ellipse à la hauteur du texte
        const dy = Math.max(Math.abs(y0 - conteneur.cy), Math.abs(y1 - conteneur.cy));
        const demi = dy < conteneur.ry ? conteneur.rx * Math.sqrt(1 - (dy / conteneur.ry) ** 2) : 0;
        depasse = Math.max(conteneur.cx - demi - b.x, b.x + b.width - conteneur.cx - demi);
      }
      const forme = conteneur.rect ? "rectangle de " + conteneur.w + " × " + conteneur.h
        : conteneur.f.tagName === "circle" ? "cercle de rayon " + conteneur.rx : "ellipse de " + conteneur.rx + " × " + conteneur.ry;
      defauts.push({ type: "texte-hors-de-sa-forme", ou: nom, texte: t.textContent.trim(), detail: "dépasse de " + depasse.toFixed(1) + " unités de sa forme (" + forme + ")" });
    });

    // 2. Textes qui se chevauchent (plus de 15 % de la plus petite boîte)
    const boites = textes.map(t => t.getBBox());
    for (let i = 0; i < textes.length; i++) {
      for (let j = i + 1; j < textes.length; j++) {
        const a = boites[i], c = boites[j];
        const l = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x);
        const h = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
        if (l <= 0.5 || h <= 2) continue;
        const part = (l * h) / Math.min(a.width * a.height, c.width * c.height);
        if (part > 0.15) defauts.push({ type: "svg-textes-superposes", ou: nom, texte: textes[i].textContent.trim() + " / " + textes[j].textContent.trim(), detail: Math.round(100 * part) + " % de recouvrement" });
      }
    }

    // 3. Formes qui sortent du viewBox (les textes sont traités plus haut)
    s.querySelectorAll("rect, circle, ellipse, line, path, polygon, polyline").forEach(e => {
      if (transforme(e, s) || e.closest("defs, marker, clipPath, pattern")) return;
      let b;
      try { b = e.getBBox(); } catch (_) { return; }
      if (!b.width && !b.height) return;
      const m = 1.5; // l'épaisseur du trait déborde légitimement d'un peu
      if (b.x < vb.x - m || b.y < vb.y - m || b.x + b.width > vb.x + vb.width + m || b.y + b.height > vb.y + vb.height + m) {
        defauts.push({ type: "element-hors-cadre", ou: nom, texte: e.tagName, detail: "boîte " + [b.x, b.y, b.x + b.width, b.y + b.height].map(v => v.toFixed(0)).join(", ") + " pour un viewBox " + vb.width + " × " + vb.height });
      }
    });
  }

  // Analyse de la vue affichée (ou de « racine »)
  window.controleAffichage = function (racine) {
    const vue = racine || vueVisible();
    const defauts = [];
    const largeur = document.documentElement.clientWidth;

    if (document.documentElement.scrollWidth > largeur + 1) {
      defauts.push({ type: "page-defilement-horizontal", ou: location.hash, texte: "", detail: document.documentElement.scrollWidth + " px pour " + largeur + " px" });
    }

    vue.querySelectorAll("svg").forEach(s => analyserDessin(s, defauts));

    vue.querySelectorAll("*").forEach(e => {
      if (e.closest("svg")) return;
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.display === "inline" || cs.visibility === "hidden") return;
      if (cs.position === "absolute" && cs.clip !== "auto") return; // textes réservés aux lecteurs d'écran
      const b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      const texte = (e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 80);
      const nom = e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].join(".") : "");
      if (b.right > largeur + 1 || b.left < -1) {
        let p = e.parentElement, defilable = false;
        while (p) { if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) { defilable = true; break; } p = p.parentElement; }
        if (!defilable) defauts.push({ type: "html-hors-ecran", ou: nom, texte, detail: "de " + Math.round(b.left) + " à " + Math.round(b.right) + " px" });
      }
      if (e.children.length === 0 && texte && e.scrollWidth > e.clientWidth + 1 && !/(auto|scroll)/.test(cs.overflowX)) {
        defauts.push({ type: "html-texte-deborde", ou: nom, texte, detail: e.scrollWidth + " px de contenu pour " + e.clientWidth + " px" + (/(hidden|clip)/.test(cs.overflowX) ? " (tronqué)" : "") });
      }
      // Accessibilité : un bouton, un lien ou un champ doit avoir un nom lisible par un lecteur d'écran
      if (e.matches("button, a[href], input:not([type=hidden]), textarea, select")) {
        const libelle = e.id && document.querySelector('label[for="' + e.id + '"]');
        const nomAccessible = (e.getAttribute("aria-label") || e.getAttribute("title") || (e.closest("label") || libelle || {}).textContent
          || (e.getAttribute("aria-labelledby") && document.getElementById(e.getAttribute("aria-labelledby")) || {}).textContent
          || (e.matches("input, textarea, select") ? "" : e.textContent) || "").trim();
        if (!nomAccessible) defauts.push({ type: "a11y-sans-nom", ou: nom, texte: e.outerHTML.slice(0, 80), detail: "aucun nom accessible" });
      }
    });
    // Identifiants en double dans toute la page
    const vus = new Set();
    document.querySelectorAll("[id]").forEach(e => {
      if (vus.has(e.id)) defauts.push({ type: "id-double", ou: location.hash, texte: e.id, detail: "identifiant présent plusieurs fois" });
      vus.add(e.id);
    });
    return defauts;
  };

  // Toutes les variantes des dessins générés à partir des données
  window.controleDonnees = function () {
    const banc = document.createElement("div");
    banc.style.cssText = "width: 340px; position: absolute; left: 0; top: 0; visibility: visible;";
    vueVisible().prepend(banc);
    const defauts = [];
    const essayer = (element, contexte) => {
      banc.innerHTML = "";
      banc.appendChild(element);
      const avant = defauts.length;
      banc.querySelectorAll("svg").forEach(s => analyserDessin(s, defauts));
      for (let k = avant; k < defauts.length; k++) defauts[k].ou = contexte + " · " + defauts[k].ou;
    };

    // Frise de « Avant ou après ? » : chaque événement à gauche, puis à droite
    if (typeof EVENEMENTS !== "undefined" && typeof frise === "function") {
      const tries = [...EVENEMENTS].sort((a, b) => momentEvenement(a) - momentEvenement(b));
      const premier = tries[0], dernier = tries[tries.length - 1];
      EVENEMENTS.forEach(e => {
        if (e !== dernier) essayer(frise(e, dernier), "frise, à gauche : " + e.nom);
        if (e !== premier) essayer(frise(premier, e), "frise, à droite : " + e.nom);
      });
    }

    // Planisphère de « Le nord est où ? » : toutes les paires que le jeu peut tirer, dans les deux ordres
    if (typeof VILLES !== "undefined" && typeof planisphere === "function") {
      const ids = Object.keys(VILLES);
      const combinaisons = [];
      (typeof PAIRES_VILLES !== "undefined" ? PAIRES_VILLES : []).forEach(p => {
        combinaisons.push([p.a, p.b, p.sens], [p.b, p.a, p.sens]);
      });
      ids.forEach(a => ids.forEach(b => {
        if (a === b) return;
        ["nord", "est"].forEach(sens => {
          const ecart = Math.abs(sens === "nord" ? VILLES[a][1] - VILLES[b][1] : VILLES[a][2] - VILLES[b][2]);
          if (ecart >= 0.8 && ecart <= (sens === "nord" ? 9 : 14)) combinaisons.push([a, b, sens]);
        });
      }));
      combinaisons.forEach(([a, b, sens]) => essayer(planisphere([a, b], sens), "planisphère " + sens + " : " + VILLES[a][0] + " / " + VILLES[b][0]));
    }

    // Arbre de « Tests positifs » : 300 scénarios tirés au hasard
    if (typeof scenarioAuHasard === "function" && typeof arbreFrequences === "function") {
      for (let k = 0; k < 300; k++) {
        const s = scenarioAuHasard();
        essayer(arbreFrequences(s, comptesDepistage(s)), "arbre : " + s.noms.join(" / ") + ", population " + s.population);
      }
    }

    // Illustrations des fiches
    if (typeof SCHEMAS !== "undefined") {
      Object.keys(SCHEMAS).forEach(cle => essayer(SCHEMAS[cle]().svg, "illustration " + cle));
    }

    banc.remove();
    // Un même défaut répété (même type, même texte, même côté) n'est compté qu'une fois
    const vus = new Set();
    return defauts.filter(d => {
      const cle = d.type + "|" + d.texte + "|" + d.detail.split(" ")[0];
      if (vus.has(cle)) return false;
      vus.add(cle);
      return true;
    });
  };
})();
