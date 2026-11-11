// enligne.js : section « Se protéger en ligne » (refonte, lot 7). Deux ateliers : « Vrai message ou hameçonnage ? »
// (détections et fausses alertes, sensibilité d′ comme « Le débat truqué », puis « Trouver l'indice ») et « Lequel
// résiste le plus longtemps ? » (mots de passe : le calcul de l'entropie, avec une hypothèse d'attaque explicite).
// Messages fictifs : aucune marque réelle ; les domaines sont en .example, réservé, qui ne peut pas exister.
// Dépend d'app.js, ateliers.js, niveaux.js (deroulerNiveaux, tirerSelonNiveau) et debattre.js (dPrime), à l'appel.

SECTIONS_ATELIERS.push({ id: "enligne", titre: "Se protéger en ligne", intro: "Messages, liens, mots de passe : l'esprit critique là où on s'en sert le plus souvent. Crier à l'arnaque partout est aussi une erreur." });

PICTOS.hamecon = '<path d="M30 6v20a9 9 0 0 1-18 0v-4" /><path d="M12 22l-4 4M12 22l4 4"/><circle cx="30" cy="6" r="2.5" class="plein"/><path d="M6 40h36" class="pointille"/>';
PICTOS.cadenas = '<rect x="10" y="21" width="28" height="21" rx="3" class="fond"/><rect x="10" y="21" width="28" height="21" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/><circle cx="24" cy="31" r="2.5" class="plein"/><path d="M24 33.5v3.5"/>';

// ===================== Messages =====================
// texte : morceaux du message (le passage révélateur, « indice », est l'un d'eux) ; fraude : vrai ou faux ;
// levier : la fiche du mécanisme exploité (pour un vrai message : null)
const MESSAGES_ENLIGNE = [
  { id: "colis-frais", niveau: 1, canal: "SMS", de: "+33 7 •• •• •• ••", fraude: true, levier: "biais:aversion-perte", indice: 2,
    texte: ["Expressia : votre colis n° 4482 est bloqué au dépôt.", "Des frais de 1,99 € sont à régler sous 24 h, sinon il sera renvoyé.", "Payer ici : expressia-frais-livraison.example/payer"],
    explication: "Le lien ne mène pas au site du transporteur mais à un domaine inventé pour l'occasion, et la petite somme sert à obtenir votre numéro de carte. La menace de perdre le colis joue sur l'aversion à la perte." },
  { id: "mediatheque", niveau: 1, canal: "Courriel", de: "Médiathèque de Saint-Aubin <contact@mediatheque-saint-aubin.example>", fraude: false, levier: null, indice: 1,
    texte: ["Bonjour, les trois livres que vous avez empruntés sont à rendre avant le 18 novembre.", "Vous pouvez prolonger le prêt depuis votre compte, sur le site de la médiathèque.", "Bonne lecture !"],
    explication: "Rien n'est demandé : ni lien, ni paiement, ni identifiant. Le message renvoie au site que vous connaissez déjà, sans vous presser." },
  { id: "banque-suspension", niveau: 1, canal: "Courriel", de: "Banque Duroc <securite@banque-duroc.securite-clients.example>", fraude: true, levier: "sophismes:ad-baculum", indice: 1,
    texte: ["Activité inhabituelle détectée sur votre compte.", "Il sera suspendu dans 2 heures si vous ne confirmez pas vos identifiants.", "[Confirmer mes identifiants]"],
    explication: "Une banque ne demande jamais vos identifiants par courriel. La menace d'une suspension imminente sert à vous empêcher de réfléchir : c'est un appel à la peur." },
  { id: "proche-detresse", niveau: 1, canal: "SMS", de: "Numéro inconnu", fraude: true, levier: "sophismes:emotion", indice: 0,
    texte: ["Maman c'est moi, j'ai cassé mon téléphone, c'est mon nouveau numéro.", "Tu peux m'envoyer 450 € pour une facture urgente ?", "Je te rembourse demain, je ne peux pas appeler."],
    explication: "Un « nouveau numéro » et l'impossibilité d'appeler empêchent la seule vérification utile : rappeler la personne à son numéro habituel. L'urgence et l'affection font le reste." },
  { id: "rendez-vous", niveau: 1, canal: "SMS", de: "Cabinet médical", fraude: false, levier: null, indice: 1,
    texte: ["Votre rendez-vous chez le Dr Lemaire est confirmé le jeudi 14 à 10 h 30.", "Pour annuler, appelez le cabinet au numéro habituel."],
    explication: "Pas de lien, pas de paiement, et il renvoie au numéro que vous connaissez : un rappel ordinaire." },
  { id: "support-virus", niveau: 2, canal: "Courriel", de: "Support Fenestra <alerte@fenestra-support-technique.example>", fraude: true, levier: "biais:autorite", indice: 1,
    texte: ["Nous avons détecté 3 virus sur votre ordinateur.", "Appelez immédiatement notre technicien certifié au numéro ci-dessous pour éviter la perte de vos données.", "Ne redémarrez pas votre appareil."],
    explication: "Personne ne peut voir à distance les virus de votre ordinateur pour vous en avertir. Le titre de « technicien certifié » joue sur l'autorité ; au téléphone, on vous demandera d'installer un logiciel de prise de contrôle." },
  { id: "attestation", niveau: 2, canal: "Courriel", de: "Caisse de retraite Horizon <ne-pas-repondre@caisse-horizon.example>", fraude: false, levier: null, indice: 1,
    texte: ["Votre attestation fiscale 2025 est disponible dans votre espace personnel.", "Connectez-vous comme d'habitude sur notre site, en tapant son adresse.", "Nous ne vous demanderons jamais votre mot de passe par courriel."],
    explication: "Le message vous invite à taper vous-même l'adresse du site, sans lien à suivre : c'est exactement ce qu'il faut faire." },
  { id: "rh-paie", niveau: 2, canal: "Courriel", de: "Service RH <rh@arcane-paie.example>", fraude: true, levier: "biais:autorite", indice: 0,
    texte: ["De : rh@arcane-paie.example (votre entreprise écrit d'habitude depuis @arcane.example)", "Mise à jour obligatoire : reconnectez-vous avec votre mot de passe professionnel avant ce soir,", "sinon votre salaire de novembre sera retardé."],
    explication: "L'adresse de l'expéditeur ressemble à celle de l'entreprise sans être la sienne. L'autorité du service et la menace sur le salaire servent à obtenir votre mot de passe." },
  { id: "livraison-demain", niveau: 2, canal: "SMS", de: "Expressia", fraude: false, levier: null, indice: 1,
    texte: ["Expressia : votre colis sera livré demain entre 9 h et 13 h.", "Suivi dans l'application Expressia."],
    explication: "Aucun lien, aucune somme : une information que l'on peut vérifier dans l'application déjà installée." },
  { id: "concours", niveau: 2, canal: "Courriel", de: "Service fidélité <cadeaux@super-tirage.example>", fraude: true, levier: "biais:conformisme", indice: 1,
    texte: ["Félicitations, vous avez été tiré au sort parmi nos clients les plus fidèles !", "Déjà 8 254 personnes ont réclamé leur lot : il n'en reste que 3.", "Payez seulement les frais de port (2 €) pour recevoir le vôtre."],
    explication: "Vous n'avez participé à aucun tirage. Le nombre de gagnants qui auraient déjà réclamé leur lot pousse à faire comme eux, et la rareté à ne pas réfléchir ; les frais de port servent à prendre votre numéro de carte." },
  { id: "banque-lien", niveau: 3, canal: "Courriel", de: "Banque Duroc <noreply@banque-duroc.example>", fraude: true, levier: "biais:autorite", indice: 2,
    texte: ["Votre relevé de novembre est disponible.", "Consultez-le dans votre espace client :", "https://banque-duroc.example.releve-securise.example/connexion"],
    explication: "Le nom de l'expéditeur s'affiche comme celui de la banque, ce qui se falsifie facilement. Mais le lien mène au domaine releve-securise.example : dans une adresse, c'est la fin avant le premier « / » qui compte, pas le début." },
  { id: "banque-appareil", niveau: 3, canal: "Courriel", de: "Banque Duroc <noreply@banque-duroc.example>", fraude: false, levier: null, indice: 2,
    texte: ["Une connexion à votre espace a eu lieu depuis un nouvel appareil le 9 novembre à 21 h 12.", "Si c'est vous, il n'y a rien à faire.", "Sinon, appelez votre conseiller au numéro inscrit au dos de votre carte."],
    explication: "Inquiétant, mais légitime : rien n'est demandé, aucun lien, et il renvoie au numéro que vous possédez déjà. Crier à l'arnaque ici, c'est une fausse alerte." },
  { id: "collegue-cartes", niveau: 3, canal: "Message", de: "Julien (compta)", fraude: true, levier: "biais:autorite", indice: 2,
    texte: ["Salut, c'est Julien de la compta.", "Le directeur a besoin de 4 cartes cadeaux de 100 € pour un client, tu peux les acheter et m'envoyer les codes ?", "Il est en réunion, ne l'appelle pas."],
    explication: "Des cartes cadeaux dont on envoie les codes ne laissent aucune trace : c'est le moyen de paiement favori des escrocs. Interdire de vérifier auprès du directeur est le signe décisif." },
  { id: "parents-eleves", niveau: 3, canal: "Courriel", de: "Association des parents d'élèves <bureau@ape-jules-ferry.example>", fraude: false, levier: null, indice: 1,
    texte: ["Comme décidé à l'assemblée générale,", "la cotisation de 12 € se règle à la rentrée, en espèces ou par chèque, auprès de la trésorière.", "Merci à tous !"],
    explication: "Une somme modeste, décidée en réunion, réglée en main propre : rien qui ressemble à une escroquerie." },
  { id: "abonnement", niveau: 3, canal: "Courriel", de: "Streamia <facturation@streamia-compte.example>", fraude: true, levier: "biais:aversion-perte", indice: 1,
    texte: ["Votre paiement a été refusé.", "Vos listes et votre historique seront supprimés dans 48 h.", "Mettez à jour votre carte : streamia-compte.example/paiement"],
    explication: "La perte annoncée de vos listes joue sur l'aversion à la perte ; le domaine n'est pas celui du service. En cas de doute, ouvrez l'application elle-même plutôt que le lien." }
];

function lancerHameconnage(zone) {
  deroulerNiveaux(zone, {
    id: "hameconnage", n: 8, libelle: "Message",
    tirer: niveau => tirerSelonNiveau("hameconnage", MESSAGES_ENLIGNE, 1, niveau)[0],
    estJuste: r => r && r.juste,
    relancer: () => lancerHameconnage(zone)
  }, (m, zone, fini) => {
    const carte = el("div", "message-fictif");
    carte.append(el("p", "message-canal", T("{0} · de : {1}", T(m.canal), m.de)));
    const morceaux = m.texte.map(t => { const p = el("p", "message-morceau", t); carte.appendChild(p); return p; });
    zone.append(el("p", "consigne", "Ce message est-il une tentative d'hameçonnage ?"), carte);
    const boutons = [["Hameçonnage", true], ["Message légitime", false]].map(([texte, fraude], k) => {
      const b = boutonChoix(texte, k);
      b.addEventListener("click", () => {
        boutons.forEach(x => { x.disabled = true; });
        const juste = fraude === m.fraude;
        boutons[m.fraude ? 0 : 1].classList.add("juste");
        if (!juste) b.classList.add("faux");
        const retour = el("div", "retour-quiz");
        retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), juste ? T("Juste.") : m.fraude ? T("C'était une tentative d'hameçonnage.") : T("C'était un vrai message : fausse alerte.")));
        // Trouver l'indice : toucher le passage qui trahit le message (ou qui le rend digne de confiance)
        retour.appendChild(el("p", "consigne", m.fraude ? "Trouver l'indice : touchez le passage qui le trahit." : "Trouver l'indice : touchez le passage qui le rend digne de confiance."));
        const indices = el("div", "indices-message");
        m.texte.forEach((t, i) => {
          const s = el("button", "segment-indice", t);
          s.type = "button";
          s.addEventListener("click", () => {
            indices.querySelectorAll("button").forEach(x => { x.disabled = true; });
            indices.children[m.indice].classList.add("juste");
            if (i !== m.indice) s.classList.add("faux");
            morceaux[m.indice].classList.add("indice-revele");
            indices.after(paragraphe(i === m.indice ? T("Bien vu.") : T("L'indice était : « {0} »", m.texte[m.indice])));
          });
          indices.appendChild(s);
        });
        retour.append(indices, paragraphe(m.explication));
        if (m.levier && INDEX.get(m.levier)) retour.appendChild(lienVers("#" + m.levier.replace(":", "/"), T("Le levier : {0}", INDEX.get(m.levier).fiche.nom), "lien-discret"));
        zone.appendChild(retour);
        fini({ juste, fraude: m.fraude, alerte: fraude }, retour);
      });
      zone.appendChild(b);
      return b;
    });
  }, resultats => {
    const fraudes = resultats.filter(r => r.fraude).length, legitimes = resultats.length - fraudes;
    const detections = resultats.filter(r => r.fraude && r.alerte).length, fausses = resultats.filter(r => !r.fraude && r.alerte).length;
    const { d } = dPrime(detections, fraudes, fausses, legitimes);
    afficherScore(zone, "hameconnage", resultats.filter(r => r.juste).length, resultats.length);
    zone.appendChild(paragraphe(T("Tentatives repérées : {0} sur {1}. Fausses alertes : {2} sur {3} vrais messages. Sensibilité d′ : {4} (0 : au hasard ; 2 et plus : très bonne).", detections, fraudes, fausses, legitimes, fr(Number(d.toFixed(2))))));
    ajouterExplication(zone, "Se méfier sans tout soupçonner", [
      "Les signes qui reviennent : une urgence, une menace ou une récompense ; un lien dont le domaine n'est pas celui de l'expéditeur (dans une adresse, c'est la partie juste avant le premier « / » qui compte) ; une demande inhabituelle : identifiants, code, paiement, cartes cadeaux.",
      "Le bon réflexe ne passe jamais par le message lui-même : on rappelle la personne au numéro que l'on connaît, on tape soi-même l'adresse du site, on ouvre l'application déjà installée. Et un message inquiétant peut être légitime : crier à l'arnaque partout est aussi une erreur."
    ], [["#biais/autorite", "Biais d'autorité"], ["#sophismes/ad-baculum", "Appel à la force"], ["#tests/laterale", "La lecture latérale"]]);
    boutonRejouer(zone, () => lancerHameconnage(zone));
  });
}

// ===================== Mots de passe =====================
// Modèles : aléatoire (longueur × log2 de la taille de l'alphabet), phrase de mots tirés au hasard dans une liste de
// 7 776 mots (méthode Diceware : log2(7 776) ≈ 12,9 bits par mot), ou mot de passe choisi par une personne, dont
// l'entropie est estimée d'après la façon dont un attaquant le chercherait (raison écrite).
const LISTE_MOTS = 7776;
const bitsDe = m => m.type === "aleatoire" ? m.longueur * Math.log2(m.alphabet) : m.type === "mots" ? m.mots * Math.log2(LISTE_MOTS) : m.bits;
const ALPHABETS = { 26: "minuscules", 62: "lettres et chiffres", 95: "lettres, chiffres et symboles" };
const MOTS_DE_PASSE = [
  { id: "chat", niveau: 1, a: { texte: "chat", type: "humain", bits: 14, raison: "un mot courant : un attaquant essaie d'abord les quelque 20 000 mots les plus courants, soit environ 14 bits" },
    b: { texte: "x7Kp2mQ9vL", type: "aleatoire", longueur: 10, alphabet: 62 } },
  { id: "123456", niveau: 1, a: { texte: "123456", type: "humain", bits: 3, raison: "il figure en tête de toutes les listes de mots de passe divulgués : il est essayé parmi les tout premiers" },
    b: { texte: "tortue-volcan-agrafe-nuage", type: "mots", mots: 4 } },
  { id: "bonjour", niveau: 1, a: { texte: "Bonjour", type: "humain", bits: 15, raison: "un mot courant avec une majuscule au début, la première variante essayée" },
    b: { texte: "q8#Lz!vR", type: "aleatoire", longueur: 8, alphabet: 95 } },
  { id: "password", niveau: 2, a: { texte: "P@ssw0rd!", type: "humain", bits: 20, raison: "un mot courant aux substitutions classiques (a → @, o → 0) et un symbole à la fin : les outils d'attaque appliquent ces règles d'office" },
    b: { texte: "violet-cartable-mangue", type: "mots", mots: 3 } },
  { id: "soleil", niveau: 2, a: { texte: "Soleil2024!", type: "humain", bits: 25, raison: "mot courant (14 bits), majuscule initiale (1 bit), année récente (environ 6 bits), symbole final parmi les plus fréquents (environ 3 bits)" },
    b: { texte: "mxqfbtrzwk", type: "aleatoire", longueur: 10, alphabet: 26 } },
  { id: "chanson", niveau: 2, a: { texte: "J'aime le chocolat", type: "humain", bits: 30, raison: "une phrase courante, choisie par une personne : les mots s'enchaînent de façon prévisible, bien loin de mots tirés au hasard" },
    b: { texte: "plume-garage-ortie-volant", type: "mots", mots: 4 } },
  { id: "cnil", niveau: 3, a: { texte: "k7#Qm2!xZp9&", type: "aleatoire", longueur: 12, alphabet: 95 },
    b: { texte: "brique-hamac-sirop-tulipe-gravier-ourlet-copain", type: "mots", mots: 7 } },
  { id: "quatorze", niveau: 3, a: { texte: "Rx4tQ8vmW2pLz9", type: "aleatoire", longueur: 14, alphabet: 62 },
    b: { texte: "k7#Qm2!xZp9&", type: "aleatoire", longueur: 12, alphabet: 95 } },
  { id: "animaux", niveau: 3, a: { texte: "chien-chat-souris-lapin-cheval", type: "humain", bits: 38, raison: "cinq animaux familiers, choisis par une personne parmi quelque 200 : environ 7,6 bits par mot, pas 12,9" },
    b: { texte: "fjord-pastel-ruban-orage", type: "mots", mots: 4 } }
];
// Hypothèse de calcul, écrite telle quelle dans l'explication : dix milliards d'essais par seconde, l'ordre de grandeur
// d'une attaque hors ligne sur un fichier de mots de passe mal protégé ; en moyenne, on trouve après la moitié des essais
function dureeAttaque(bits) {
  const s = Math.pow(2, bits - 1) / 1e10;
  if (s < 1) return T("moins d'une seconde");
  const unites = [[31557600e9, "milliard d'années", "milliards d'années"], [31557600e6, "million d'années", "millions d'années"], [31557600, "an", "ans"], [86400, "jour", "jours"], [3600, "heure", "heures"], [60, "minute", "minutes"], [1, "seconde", "secondes"]];
  const [u, un, plusieurs] = unites.find(([u]) => s >= u);
  const valeur = Number((s / u).toPrecision(2));
  return T("environ {0} {1}", fr(valeur), T(valeur >= 2 ? plusieurs : un));
}
function descriptionMotDePasse(m) {
  const bits = Math.round(bitsDe(m));
  const comment = m.type === "aleatoire" ? T("{0} caractères tirés au hasard parmi {1} ({2}) : {0} × log2 {1}", m.longueur, m.alphabet, T(ALPHABETS[m.alphabet]))
    : m.type === "mots" ? T("{0} mots tirés au hasard dans une liste de 7 776 : {0} × 12,9 bits", m.mots) : T(m.raison);
  return T("« {0} » : environ {1} bits ({2}). Temps moyen pour le trouver : {3}.", m.texte, bits, comment, dureeAttaque(bits));
}

function lancerMotsDePasse(zone) {
  deroulerNiveaux(zone, {
    id: "mots-de-passe", n: 6, libelle: "Paire",
    tirer: niveau => { const p = tirerSelonNiveau("mots-de-passe", MOTS_DE_PASSE, 1, niveau)[0]; return { ...p, ordre: melanger([p.a, p.b]) }; },
    relancer: () => lancerMotsDePasse(zone)
  }, (p, zone, fini) => {
    zone.append(el("p", "consigne", "Lequel résiste le plus longtemps à un attaquant ?"));
    const plusFort = bitsDe(p.ordre[0]) >= bitsDe(p.ordre[1]) ? 0 : 1;
    const boutons = p.ordre.map((m, k) => {
      const b = boutonChoix(m.texte, k);
      b.classList.add("mot-de-passe");
      b.addEventListener("click", () => {
        boutons.forEach(x => { x.disabled = true; });
        boutons[plusFort].classList.add("juste");
        if (k !== plusFort) b.classList.add("faux");
        const retour = el("div", "retour-quiz");
        retour.append(el("p", "verdict " + (k === plusFort ? "juste" : "faux"), k === plusFort ? T("Juste.") : T("Le plus solide : « {0} ».", p.ordre[plusFort].texte)),
          paragraphe(descriptionMotDePasse(p.ordre[0])), paragraphe(descriptionMotDePasse(p.ordre[1])));
        zone.appendChild(retour);
        fini(k === plusFort, retour);
      });
      zone.appendChild(b);
      return b;
    });
  }, resultats => {
    afficherScore(zone, "mots-de-passe", resultats.filter(Boolean).length, resultats.length);
    ajouterExplication(zone, "La longueur avant la complexité", [
      "Chaque bit d'entropie double le nombre d'essais nécessaires. Un caractère tiré au hasard parmi 95 vaut 6,6 bits, un mot tiré au hasard dans une liste de 7 776 en vaut 12,9 : une phrase de quelques mots vraiment tirés au hasard bat souvent un mot de passe court et compliqué. Ce qui ruine un mot de passe, c'est d'être choisi par une personne : les attaquants essaient d'abord les mots courants, les substitutions classiques et les années.",
      "Hypothèse de calcul : dix milliards d'essais par seconde, l'ordre de grandeur d'une attaque hors ligne sur un fichier de mots de passe mal protégé. Un site qui limite le nombre d'essais rend l'attaque bien plus lente. Sans autre mesure, la CNIL recommande au moins 80 bits : par exemple 12 caractères mêlant majuscules, minuscules, chiffres et caractères spéciaux, 14 caractères sans caractère spécial obligatoire, ou une phrase de passe d'au moins 7 mots (délibération n° 2022-100 du 21 juillet 2022). Le code de synchronisation de ce site compte 80 bits, tirés au hasard.",
      "Pour les retenir tous : un gestionnaire de mots de passe, et un mot de passe différent pour chaque site."
    ], [["#guide/securite", "La sécurité de ce site"]]);
    boutonRejouer(zone, () => lancerMotsDePasse(zone));
  });
}

EXPERIENCES.push(
  { id: "hameconnage", section: "enligne", picto: "hamecon", couleur: "#a8432e", duree: "4 min", titre: "Vrai message ou hameçonnage ?",
    resume: "Huit messages fictifs : arnaque ou vrai message ? On compte les tentatives repérées et les fausses alertes, puis on cherche l'indice.", lancer: lancerHameconnage },
  { id: "mots-de-passe", section: "enligne", picto: "cadenas", couleur: "#44546a", duree: "3 min", titre: "Lequel résiste le plus longtemps ?",
    resume: "Deux mots de passe : lequel tiendra le plus longtemps face à un attaquant ? Le calcul de l'entropie, avec son hypothèse d'attaque.", lancer: lancerMotsDePasse }
);
