// coffre.js : synchronisation facultative de la progression, chiffrée sur l'appareil avant tout envoi (refonte, lot 6).
// Tant que SYNCHRO_URL est vide, rien n'apparaît dans l'interface et rien n'est envoyé nulle part.
//
// Principe : pas d'adresse électronique ni de mot de passe. Le compte est un code de synchronisation de 16 caractères
// en base 32 de Crockford (80 bits tirés de crypto.getRandomValues). Du code, HKDF-SHA-256 dérive trois valeurs
// indépendantes : l'identifiant du coffre, le jeton d'accès, et la clé AES-256-GCM (non extractible). Le serveur ne voit
// que l'identifiant, l'empreinte du jeton et un contenu chiffré illisible. Modèle de menace : SECURITE.md.

const SYNCHRO_URL = "https://esprit-critique-synchro.esprit-critique-synchro.workers.dev";   // serveur/README.md ; son origine est dans connect-src (contrôlé par tests/securite.py)

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SEL_SYNCHRO = "esprit-critique/synchro/v1";

// ===================== Code de synchronisation =====================
function genererCodeSynchro() {
  const octets = crypto.getRandomValues(new Uint8Array(10));
  let bits = 0, n = 0, code = "";
  for (const o of octets) {
    n = (n << 8) | o; bits += 8;
    while (bits >= 5) { bits -= 5; code += CROCKFORD[(n >> bits) & 31]; }
  }
  return code;
}
// Saisie tolérante (Crockford) : espaces et tirets ignorés, I et L lus 1, O lu 0. Rend null si invalide.
function normaliserCodeSynchro(texte) {
  const c = String(texte || "").toUpperCase().replace(/[\s-]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{16}$/.test(c) ? c : null;
}
const afficherCodeSynchro = code => code.match(/.{4}/g).join(" ");

// ===================== Dérivation et chiffrement =====================
const hexDe = octets => [...new Uint8Array(octets)].map(o => o.toString(16).padStart(2, "0")).join("");
const base64De = octets => btoa(String.fromCharCode(...new Uint8Array(octets)));
const octetsDe64 = texte => Uint8Array.from(atob(texte), c => c.charCodeAt(0));

async function deriverSecrets(code) {
  const ikm = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "HKDF", false, ["deriveBits", "deriveKey"]);
  const params = info => ({ name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode(SEL_SYNCHRO), info: new TextEncoder().encode(info) });
  const id = hexDe(await crypto.subtle.deriveBits(params("identifiant"), ikm, 128));
  const jeton = hexDe(await crypto.subtle.deriveBits(params("jeton"), ikm, 256));
  const cle = await crypto.subtle.deriveKey(params("chiffrement"), ikm, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  return { id, jeton, cle };
}

// Compression facultative (CompressionStream), puis AES-GCM avec un vecteur aléatoire de 12 octets, jamais réutilisé,
// et l'identifiant du coffre comme donnée associée (un contenu ne peut pas être déplacé d'un coffre à un autre)
async function compresser(octets, sens) {
  const flux = new Blob([octets]).stream().pipeThrough(sens === "z" ? new CompressionStream("gzip") : new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(flux).arrayBuffer());
}
async function chiffrerCoffre(secrets, objet) {
  let clair = new TextEncoder().encode(JSON.stringify(objet));
  const z = typeof CompressionStream === "function";
  if (z) clair = await compresser(clair, "z");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chiffre = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(secrets.id) }, secrets.cle, clair);
  return JSON.stringify({ v: 1, z, iv: base64De(iv), c: base64De(chiffre) });
}
// Rend l'objet déchiffré, ou lève une erreur si le contenu a été altéré (AES-GCM l'authentifie) ou est d'un autre format
async function dechiffrerCoffre(secrets, texte) {
  const e = JSON.parse(texte);
  if (!e || e.v !== 1 || typeof e.iv !== "string" || typeof e.c !== "string") throw new Error("format inconnu");
  let clair = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: octetsDe64(e.iv), additionalData: new TextEncoder().encode(secrets.id) }, secrets.cle, octetsDe64(e.c)));
  if (e.z) clair = await compresser(clair, "d");
  return JSON.parse(new TextDecoder().decode(clair));
}

// ===================== Fusion, jamais écrasement =====================
// Deux appareils peuvent avoir avancé chacun de leur côté. Une règle par clé (table lisible), sinon : la version la plus
// récente l'emporte (horodatages posés par ecrire()). base : la dernière version synchronisée (fusion à trois).
const estObjet = v => v !== null && typeof v === "object" && !Array.isArray(v);
const union = (a, b) => [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])];
// Compteurs cumulés : base + ce que chaque appareil a ajouté depuis (récursif sur les nombres, objets et tableaux de nombres)
function troisVoies(a, b, base) {
  if (typeof a === "number" || typeof b === "number") {
    const x = typeof a === "number" ? a : 0, y = typeof b === "number" ? b : 0, z = typeof base === "number" ? base : 0;
    return Math.max(x, y, x + y - z);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const l = Math.max((a || []).length, (b || []).length);
    return Array.from({ length: l }, (_, k) => troisVoies((a || [])[k], (b || [])[k], (base || [])[k]));
  }
  const sortie = {};
  new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach(k => { sortie[k] = troisVoies((a || {})[k], (b || {})[k], (base || {})[k]); });
  return sortie;
}
const parCle = (a, b, choisir) => {
  const sortie = { ...(estObjet(a) ? a : {}) };
  Object.entries(estObjet(b) ? b : {}).forEach(([k, v]) => { sortie[k] = k in sortie ? choisir(sortie[k], v) : v; });
  return sortie;
};
const plusJoue = (x, y) => ((y && y.n) || 0) > ((x && x.n) || 0) ? y : x;

const REGLES_FUSION = {
  acquis: (a, b) => union(a, b),
  activite: (a, b) => union(a, b).sort((x, y) => x - y).slice(-400),
  fichesLues: (a, b) => union(a, b),
  distinctions: (a, b) => ({ obtenues: union((a || {}).obtenues, (b || {}).obtenues),
    drapeaux: { embleme: !!(((a || {}).drapeaux || {}).embleme || ((b || {}).drapeaux || {}).embleme), illusions: union(((a || {}).drapeaux || {}).illusions, ((b || {}).drapeaux || {}).illusions) } }),
  memoire: (a, b) => parCle(a, b, plusJoue),                                       // par notion : l'entrée la plus jouée
  records: (a, b) => parCle(a, b, Math.max),
  chrono: (a, b) => parCle(a, b, Math.max),
  resultatsAteliers: (a, b) => parCle(a, b, (x, y) => ({ ...plusJoue(x, y), record: Math.max(x.record ?? -Infinity, y.record ?? -Infinity) })),
  confiance: troisVoies, fourchettes: troisVoies, certitudes: troisVoies, duels: troisVoies,
  lucidite: (a, b, base) => ({ ...(a || {}), ...troisVoies(
    { total: (a || {}).total, jours: (a || {}).jours, cumuls: (a || {}).cumuls },
    { total: (b || {}).total, jours: (b || {}).jours, cumuls: (b || {}).cumuls },
    { total: (base || {}).total, jours: (base || {}).jours, cumuls: (base || {}).cumuls }),
    uniques: { ...((b || {}).uniques || {}), ...((a || {}).uniques || {}) } }),
  maitrise: (a, b) => ({ ...(a || {}), jours: { ...((b || {}).jours || {}), ...((a || {}).jours || {}) }, meilleure: Math.max((a || {}).meilleure || 0, (b || {}).meilleure || 0) })
};

// local, distant, base : { cles: { cle: valeur }, horodatages: { cle: ms } }
function fusionnerProgressions(local, distant, base) {
  const cles = {}, horodatages = {};
  const toutes = new Set([...Object.keys(local.cles || {}), ...Object.keys(distant.cles || {})]);
  toutes.forEach(cle => {
    const a = (local.cles || {})[cle], b = (distant.cles || {})[cle], o = ((base || {}).cles || {})[cle];
    const ha = (local.horodatages || {})[cle] || 0, hb = (distant.horodatages || {})[cle] || 0;
    if (a === undefined) cles[cle] = b;
    else if (b === undefined) cles[cle] = a;
    else if (REGLES_FUSION[cle]) cles[cle] = REGLES_FUSION[cle](a, b, o);
    else cles[cle] = hb > ha ? b : a;
    horodatages[cle] = Math.max(ha, hb);
  });
  return { cles, horodatages };
}

// ===================== État local (IndexedDB) =====================
// La clé non extractible, le jeton et le code (pour pouvoir le réafficher : compromis décrit dans SECURITE.md)
function baseSynchro() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open("esprit-critique-synchro", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("coffre");
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function lireEtatSynchro() {
  const db = await baseSynchro();
  return new Promise(ok => { const t = db.transaction("coffre").objectStore("coffre").get("etat"); t.onsuccess = () => ok(t.result || null); t.onerror = () => ok(null); });
}
async function ecrireEtatSynchro(etat) {
  const db = await baseSynchro();
  return new Promise((ok, ko) => {
    const t = db.transaction("coffre", "readwrite");
    if (etat) t.objectStore("coffre").put(etat, "etat"); else t.objectStore("coffre").delete("etat");
    t.oncomplete = () => ok(); t.onerror = () => ko(t.error);
  });
}

// ===================== Horodatages des clés modifiées =====================
const SYNCHRO = { actif: false, statut: "inactif", minuterie: null, derniere: 0, enCours: null };
// Appelé par ecrire() : seulement quand un compte est actif sur cet appareil
function noterModification(cle) {
  if (!SYNCHRO.actif || !CLES_SAUVEGARDE.includes(cle)) return;
  const h = lire("horodatages", {});
  h[cle] = Date.now();
  try { localStorage.setItem("horodatages", JSON.stringify(h)); } catch (e) { /* le prochain envoi prendra la valeur par défaut */ }
  planifierSynchro();
}
const progressionLocale = () => ({ cles: Object.fromEntries(CLES_SAUVEGARDE.map(c => [c, lire(c, undefined)]).filter(([, v]) => v !== undefined)), horodatages: lire("horodatages", {}) });

// ===================== Échanges avec le serveur =====================
async function requeteSynchro(methode, secrets, corps, version) {
  const entetes = { Authorization: "Bearer " + secrets.jeton };
  if (corps !== undefined) entetes["Content-Type"] = "application/json";
  if (version !== undefined) entetes["If-Match"] = String(version);
  return fetch(SYNCHRO_URL + "/v1/coffres/" + secrets.id, { method: methode, headers: entetes, body: corps === undefined ? undefined : JSON.stringify(corps), cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
}

// Une synchronisation : lire la copie distante, la déchiffrer, la valider, fusionner, écrire localement, renvoyer.
// Un contenu qui ne se déchiffre pas, ou plus ancien que la dernière version connue, est refusé sans toucher aux données.
async function synchroniser() {
  if (SYNCHRO.enCours) return SYNCHRO.enCours;
  SYNCHRO.enCours = (async () => {
    const etat = await lireEtatSynchro();
    if (!etat) { majStatutSynchro("inactif"); return; }
    if (!navigator.onLine) { majStatutSynchro("hors-ligne"); return; }
    majStatutSynchro("en-cours");
    const secrets = { id: etat.id, jeton: etat.jeton, cle: etat.cle };
    try {
      for (let essai = 0; essai < 3; essai++) {
        const r = await requeteSynchro("GET", secrets);
        let distant = { cles: {}, horodatages: {} }, version = 0;
        if (r.ok) {
          const corps = await r.json();
          version = corps.version;
          if (version < (etat.version || 0)) throw new Error("version distante plus ancienne que la dernière connue");
          const brut = await dechiffrerCoffre(secrets, corps.contenu);
          const { valides } = validerSauvegarde(brut.cles || {});
          distant = { cles: valides, horodatages: estObjet(brut.horodatages) ? brut.horodatages : {} };
        } else if (r.status !== 404) throw new Error("serveur : " + r.status);
        const fusion = fusionnerProgressions(progressionLocale(), distant, etat.base);
        Object.entries(fusion.cles).forEach(([cle, valeur]) => { if (JSON.stringify(valeur) !== JSON.stringify(lire(cle, undefined))) ecrireSansHorodatage(cle, valeur); });
        localStorage.setItem("horodatages", JSON.stringify(fusion.horodatages));
        const envoi = await requeteSynchro("PUT", secrets, { contenu: await chiffrerCoffre(secrets, fusion) }, version);
        if (envoi.status === 409) continue;   // un autre appareil a écrit entre-temps : on relit et l'on refusionne
        if (!envoi.ok) throw new Error("serveur : " + envoi.status);
        const { version: nouvelle } = await envoi.json();
        await ecrireEtatSynchro({ ...etat, version: nouvelle, base: fusion, derniere: Date.now() });
        majStatutSynchro("a-jour");
        return;
      }
      throw new Error("conflits répétés");
    } catch (e) {
      majStatutSynchro("erreur", e.message);
      throw e;
    }
  })().finally(() => { SYNCHRO.enCours = null; });
  return SYNCHRO.enCours;
}

// Écriture d'une valeur venue de la fusion : sans horodater (ce n'est pas une modification de cet appareil)
function ecrireSansHorodatage(cle, valeur) {
  const actif = SYNCHRO.actif;
  SYNCHRO.actif = false;
  ecrire(cle, valeur);
  SYNCHRO.actif = actif;
}

// Quelques secondes après une modification, au plus une fois par minute
function planifierSynchro() {
  clearTimeout(SYNCHRO.minuterie);
  majStatutSynchro("en-attente");
  const attente = Math.max(4000, SYNCHRO.derniere + 60000 - Date.now());
  SYNCHRO.minuterie = setTimeout(() => { SYNCHRO.derniere = Date.now(); synchroniser().catch(() => {}); }, attente);
}

async function creerCompteSynchro() {
  const code = genererCodeSynchro();
  await activerCompte(code);
  return code;
}
async function connecterCompte(texte) {
  const code = normaliserCodeSynchro(texte);
  if (!code) throw new Error("code invalide");
  await activerCompte(code);
}
async function activerCompte(code) {
  const secrets = await deriverSecrets(code);
  await ecrireEtatSynchro({ code, id: secrets.id, jeton: secrets.jeton, cle: secrets.cle, version: 0, base: null, derniere: 0 });
  SYNCHRO.actif = true;
  // Toutes les clés présentes comptent comme modifiées maintenant, puis première synchronisation (fusion avec le coffre)
  const h = lire("horodatages", {});
  CLES_SAUVEGARDE.forEach(c => { if (lire(c, undefined) !== undefined && !h[c]) h[c] = 1; });
  localStorage.setItem("horodatages", JSON.stringify(h));
  await synchroniser();
}
async function deconnecterAppareil() {
  await ecrireEtatSynchro(null);
  SYNCHRO.actif = false;
  majStatutSynchro("inactif");
}
async function supprimerCopieEnLigne() {
  const etat = await lireEtatSynchro();
  if (!etat) return;
  const r = await requeteSynchro("DELETE", { id: etat.id, jeton: etat.jeton });
  if (!r.ok && r.status !== 404) throw new Error("serveur : " + r.status);
  await deconnecterAppareil();
}

// ===================== Interface =====================
const STATUTS_SYNCHRO = { inactif: "Synchronisation désactivée", "a-jour": "À jour", "en-attente": "En attente", "en-cours": "Synchronisation…", "hors-ligne": "Hors ligne : la synchronisation attend", erreur: "Erreur de synchronisation" };
function majStatutSynchro(statut, detail) {
  SYNCHRO.statut = statut;
  const pastille = document.querySelector(".etat-synchro");
  if (pastille) {
    pastille.hidden = statut === "inactif";
    pastille.dataset.statut = statut;
    // Un role=status n'annonce que son texte : libellé dans un texte invisible, infobulle pour la souris
    const libelle = T(STATUTS_SYNCHRO[statut]) + (detail ? " : " + detail : "");
    pastille.replaceChildren(el("span", "invisible", libelle));
    pastille.title = libelle;
  }
  const p = document.querySelector(".statut-synchro");
  if (p) p.textContent = typo(T(STATUTS_SYNCHRO[statut]) + (detail ? " (" + detail + ")" : ""));
}

// Bloc « Synchroniser mes appareils » de l'onglet Réglages du profil ; rien si la synchronisation n'est pas en service
async function blocSynchro() {
  if (!SYNCHRO_URL) return null;
  const bloc = el("section", "bloc-synchro");
  bloc.append(el("h3", "titre-bloc", "Synchroniser mes appareils"),
    el("p", "source", "Facultatif. Votre progression est chiffrée sur cet appareil avant d'être envoyée : personne d'autre ne peut la lire, pas même le propriétaire du site. Le code de synchronisation est le compte ; il n'y a ni adresse électronique, ni mot de passe, ni récupération par courriel : gardez-le."),
    el("p", "statut-synchro", T(STATUTS_SYNCHRO[SYNCHRO.statut])));
  const actions = el("div", "actions actions-synchro");
  const bouton = (texte, action) => { const b = el("button", "bouton secondaire", texte); b.type = "button"; b.addEventListener("click", action); actions.appendChild(b); return b; };
  const etat = await lireEtatSynchro();
  if (!etat) {
    bouton("Créer un compte", async () => {
      const code = await creerCompteSynchro().catch(e => { annoncer(e.message); return null; });
      if (code) { montrerCode(bloc, code); }
    });
    const champ = el("input", "champ champ-texte");
    champ.id = "code-synchro";
    champ.autocomplete = "off";
    champ.setAttribute("autocapitalize", "characters");
    champ.placeholder = "XXXX XXXX XXXX XXXX";
    const etiquette = el("label", "consigne", "Se connecter avec un code");
    etiquette.htmlFor = champ.id;
    bloc.append(etiquette, champ);
    bouton("Se connecter", async () => {
      try { await connecterCompte(champ.value); afficherPageProfil("reglages"); } catch (e) { annoncer(T("Connexion impossible : {0}", e.message)); }
    });
  } else {
    bouton("Synchroniser maintenant", () => synchroniser().catch(() => {}));
    bouton("Afficher mon code", () => { if (confirm(T("Afficher le code de synchronisation ? Toute personne qui le voit peut lire votre progression."))) montrerCode(bloc, etat.code); });
    bouton("Se déconnecter de cet appareil", async () => { await deconnecterAppareil(); afficherPageProfil("reglages"); });
    bouton("Supprimer la copie en ligne", async () => {
      if (!confirm(T("Supprimer la copie chiffrée gardée en ligne ? La progression de cet appareil reste intacte."))) return;
      try { await supprimerCopieEnLigne(); afficherPageProfil("reglages"); } catch (e) { annoncer(e.message); }
    });
  }
  bloc.appendChild(actions);
  return bloc;
}

// Le code, à garder : groupes de quatre, formulaire pour le gestionnaire de mots de passe, fiche de secours à imprimer
function montrerCode(bloc, code) {
  const cadre = el("div", "code-synchro");
  cadre.append(el("p", "consigne", "Votre code de synchronisation"), el("p", "code-synchro-valeur", afficherCodeSynchro(code)),
    el("p", "source", "Saisissez-le sur votre autre appareil (Profil, Réglages). Enregistrez-le dans votre gestionnaire de mots de passe ou imprimez-le : sans lui, la copie en ligne est perdue."));
  // Un formulaire d'identifiant : les gestionnaires de mots de passe proposent de l'enregistrer
  const formulaire = el("form", "formulaire-code");
  formulaire.addEventListener("submit", e => { e.preventDefault(); annoncer(T("Code proposé à votre gestionnaire de mots de passe.")); });
  const utilisateur = el("input");
  utilisateur.type = "text"; utilisateur.name = "username"; utilisateur.autocomplete = "username"; utilisateur.value = "Esprit critique"; utilisateur.hidden = true;
  const mdp = el("input", "champ");
  mdp.type = "password"; mdp.name = "password"; mdp.autocomplete = "new-password"; mdp.value = code; mdp.readOnly = true;
  mdp.setAttribute("aria-label", T("Code de synchronisation, pour le gestionnaire de mots de passe"));
  const enregistrer = el("button", "bouton secondaire", "Enregistrer dans le gestionnaire de mots de passe");
  enregistrer.type = "submit";
  formulaire.append(utilisateur, mdp, enregistrer);
  const imprimer = el("button", "bouton secondaire", "Imprimer une fiche de secours");
  imprimer.type = "button";
  imprimer.addEventListener("click", () => window.print());
  cadre.append(formulaire, imprimer);
  bloc.appendChild(cadre);
}

// Au chargement : si un compte est actif, synchronisation, puis à chaque passage en arrière-plan et au retour en ligne
async function demarrerSynchro() {
  if (!SYNCHRO_URL || !window.indexedDB || !window.crypto || !crypto.subtle) return;
  const etat = await lireEtatSynchro().catch(() => null);
  if (!etat) return;
  SYNCHRO.actif = true;
  synchroniser().catch(() => {});
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") synchroniser().catch(() => {}); });
  window.addEventListener("online", () => synchroniser().catch(() => {}));
}
