// debattre.js : section « Débattre ». Le débat truqué, Réparer l'argument, Reformuler sans trahir,
// Le débat à deux, et la rubrique « S'entraîner » des fiches de sophismes.
// Tous les débats, personnages, chiffres et études de ce fichier sont fictifs, et présentés comme tels.
// Chaque réplique fautive correspond à la définition de sa fiche et ne relève pas aussi de sa voisine
// (champ « distinction ») ; environ 60 % des répliques sont recevables, y compris des répliques
// impolies mais valides et des appels à une expertise pertinente.

// ===================== Débats =====================
// Réplique : { qui, texte, sophisme: id de la fiche ou null, pourquoi }

const DEBATS = [
  {
    id: "trottinettes",
    titre: "Les trottinettes en libre-service",
    contexte: "Conseil de quartier. Faut-il garder les trottinettes en libre-service dans le centre ? Nadia est pour, Yves est contre ; Mme Roux préside.",
    repliques: [
      { qui: "Nadia", texte: "Le comptage de la mairie indique 1 200 trajets en trottinette par jour ; d'après l'enquête jointe, un tiers remplacent un trajet en voiture.", sophisme: null,
        pourquoi: "Une donnée précise, avec sa source. On peut discuter la méthode de l'enquête, mais l'argument est recevable." },
      { qui: "Yves", texte: "Elles encombrent les trottoirs : la semaine dernière, j'en ai photographié quarante couchées en travers du passage, autour de la gare.", sophisme: null,
        pourquoi: "Un constat précis à l'appui d'une affirmation limitée (elles encombrent certains trottoirs). Il ne généralise pas au-delà." },
      { qui: "Nadia", texte: "Vous dites ça parce que vous tenez le garage de la rue Pasteur : évidemment que vous préférez qu'on prenne la voiture.", sophisme: "ad-hominem",
        pourquoi: "Elle attaque les intérêts d'Yves au lieu de répondre à son constat sur les trottoirs. Ses intérêts ne rendent ses photos ni vraies ni fausses." },
      { qui: "Yves", texte: "Si on laisse faire les trottinettes, demain ce seront les vélos-cargos partout, puis plus personne ne pourra marcher sur un trottoir, et les personnes âgées ne sortiront plus de chez elles.", sophisme: "pente-glissante",
        pourquoi: "Une chaîne de conséquences de plus en plus graves, dont aucune étape n'est justifiée." },
      { qui: "Mme Roux", texte: "Revenons aux faits : la police municipale a relevé onze accidents impliquant une trottinette cette année, contre quatre l'an dernier, pour deux fois plus de trajets.", sophisme: null,
        pourquoi: "Des chiffres sourcés, rapportés au nombre de trajets : c'est exactement ce qu'il faut pour comparer." },
      { qui: "Nadia", texte: "En mars, en avril et en juin, aucun accident n'a été signalé : la sécurité n'est donc pas un problème.", sophisme: "cherry-picking",
        pourquoi: "Elle ne retient que les trois mois sans accident, en passant sous silence les onze accidents de l'année qu'on vient de citer." },
      { qui: "Yves", texte: "Je ne demande pas leur suppression : je propose des emplacements de stationnement obligatoires, comme le font d'autres villes.", sophisme: null,
        pourquoi: "Il précise sa position et propose une solution intermédiaire : rien de fallacieux." },
      { qui: "Nadia", texte: "Soit on garde les trottinettes telles qu'elles sont, soit on retourne au tout-voiture.", sophisme: "faux-dilemme",
        pourquoi: "Yves vient de proposer une troisième voie (des emplacements obligatoires) : réduire le choix à deux options est un faux dilemme." },
      { qui: "Karim", texte: "Je suis kinésithérapeute. Cette année, trois de mes patients se sont blessés en trottinette ; ça ne dit rien de la fréquence en ville, mais ces blessures touchent souvent le poignet et la tête.", sophisme: null,
        pourquoi: "Une expertise pertinente, dont il précise lui-même les limites : il ne tire pas de fréquence de trois cas." },
      { qui: "Yves", texte: "Tout le monde ici est contre ces engins, il suffit d'écouter la salle : c'est bien la preuve qu'ils sont dangereux.", sophisme: "popularite",
        pourquoi: "L'avis majoritaire de la salle ne prouve rien sur le danger réel : seuls les accidents et leur fréquence le peuvent." },
      { qui: "Mme Roux", texte: "Les accidents ont augmenté, mais les trajets aussi. Avant de conclure, comparons avec les accidents de vélo sur la même distance.", sophisme: null,
        pourquoi: "Elle demande un point de comparaison pertinent avant de conclure : une démarche saine." },
      { qui: "Nadia", texte: "D'accord : demandons ces chiffres au service de la voirie avant le vote.", sophisme: null,
        pourquoi: "Accepter de vérifier avant de décider n'a rien de fallacieux." }
    ]
  },
  {
    id: "cantine",
    titre: "Un repas végétarien par semaine",
    contexte: "Conseil d'administration d'un collège. Claire, parent d'élève, propose un repas végétarien par semaine ; Bernard, autre parent, s'y oppose. M. Diallo est le chef cuisinier, Mme Petit l'infirmière scolaire.",
    repliques: [
      { qui: "Claire", texte: "Nous avons interrogé les élèves : sur 300 réponses, 140 disent qu'ils mangeraient un plat végétarien s'il est bon.", sophisme: null,
        pourquoi: "Elle rapporte un résultat d'enquête pour montrer que la demande existe, sans en faire une preuve que l'idée est bonne." },
      { qui: "Bernard", texte: "Un repas sans viande va contre la nature humaine : nos dents et notre estomac sont ceux d'un omnivore, donc la viande est ce qui est bon pour un enfant.", sophisme: "nature",
        pourquoi: "Il tire de ce qui est « naturel » la conclusion que c'est bon, sans examiner les besoins nutritionnels réels. Un omnivore peut d'ailleurs se nourrir sans viande un jour par semaine." },
      { qui: "M. Diallo", texte: "En tant que cuisinier, je peux dire qu'un plat de pois chiches et de riz, servi en quantité suffisante, apporte les protéines d'un repas : légumineuses et céréales se complètent.", sophisme: null,
        pourquoi: "Une expertise pertinente, sur une question de son métier. L'autorité est légitime quand elle porte sur le domaine de compétence." },
      { qui: "Bernard", texte: "Donc vous voulez interdire la viande à nos enfants et en faire des végétariens de force ?", sophisme: "homme-de-paille",
        pourquoi: "Claire propose un repas sur cinq ; Bernard lui prête une interdiction totale, plus facile à rejeter." },
      { qui: "Claire", texte: "Personne ne parle d'interdire : il s'agit d'un repas sur cinq.", sophisme: null,
        pourquoi: "Elle rétablit sa position, ce qui est la bonne réponse à un homme de paille." },
      { qui: "Mme Petit", texte: "Côté santé, un repas végétarien équilibré par semaine ne pose aucun problème à des collégiens. Ce qui m'inquiète davantage, ce sont les plateaux qui reviennent à moitié pleins.", sophisme: null,
        pourquoi: "Un avis compétent, dans son domaine, qui déplace utilement le débat vers le gaspillage." },
      { qui: "Bernard", texte: "Depuis l'ouverture du collège, on a toujours servi de la viande tous les midis, et ça a très bien marché.", sophisme: "tradition",
        pourquoi: "L'ancienneté d'une pratique ne dit pas si elle est la meilleure ; et l'infirmière vient de signaler un problème de gaspillage." },
      { qui: "Claire", texte: "Le gaspillage s'explique par une seule chose : les portions de viande sont trop grosses.", sophisme: "cause-unique",
        pourquoi: "Le gaspillage dépend de nombreux facteurs (goût, durée du repas, faim, présentation des plats) ; elle n'en retient qu'un." },
      { qui: "Bernard", texte: "Une cantine, c'est comme un restaurant : les clients choisissent ce qu'ils veulent. Si les élèves veulent de la viande, on doit leur en servir.", sophisme: "fausse-analogie",
        pourquoi: "La ressemblance ne porte pas sur l'essentiel : une cantine scolaire a des obligations d'équilibre alimentaire et un public qui ne choisit pas son établissement." },
      { qui: "M. Diallo", texte: "Je propose un essai sur un trimestre, en pesant les restes les jours avec et sans viande. On saura ce que les élèves mangent vraiment.", sophisme: null,
        pourquoi: "Une proposition de mesure, qui permettra de trancher par les faits." },
      { qui: "Bernard", texte: "Ça me paraît mal parti, mais je veux bien voir les pesées. Ce que je refuse, c'est qu'on décide sans demander aux familles.", sophisme: null,
        pourquoi: "Sceptique, mais il accepte la mesure et avance une exigence de méthode : c'est recevable." },
      { qui: "Claire", texte: "D'accord pour un questionnaire aux familles en même temps que l'essai.", sophisme: null,
        pourquoi: "Un accord sur la démarche : rien de fallacieux." }
    ]
  },
  {
    id: "teletravail",
    titre: "Deux jours de télétravail",
    contexte: "Réunion d'équipe dans un bureau d'études. Léa demande deux jours de télétravail par semaine. Marc et Sofia, la cheffe d'équipe, hésitent ; Paul dirige l'entreprise.",
    repliques: [
      { qui: "Léa", texte: "Je mets une heure dix pour venir : deux jours de télétravail, ce sont presque cinq heures de transport en moins par semaine, et je travaille mieux sans les interruptions de l'open space.", sophisme: null,
        pourquoi: "Un calcul simple et une expérience personnelle, présentée comme telle." },
      { qui: "Marc", texte: "Mon cousin a essayé le télétravail, il ne faisait plus rien de ses journées. Le télétravail rend les gens paresseux.", sophisme: "generalisation-hative",
        pourquoi: "Un seul cas, celui de son cousin, ne permet pas de conclure sur tous les télétravailleurs." },
      { qui: "Sofia", texte: "Depuis que Léa télétravaille le vendredi, nous avons perdu le contrat Durand : la preuve que ça ne marche pas.", sophisme: "post-hoc",
        pourquoi: "La perte du contrat a suivi le télétravail ; rien ne montre qu'elle en résulte." },
      { qui: "Léa", texte: "D'après le courrier du client, le contrat Durand a été perdu sur le prix. Le vendredi n'y est pour rien.", sophisme: null,
        pourquoi: "Elle répond par un fait vérifiable qui contredit l'explication proposée." },
      { qui: "Marc", texte: "Tu parles d'efficacité, toi qui arrives tous les jours à 9 h 30 ? Commence par être à l'heure.", sophisme: "tu-quoque",
        pourquoi: "Il rejette l'argument de Léa en pointant l'écart entre ce qu'elle défend et ce qu'elle fait, sans discuter l'argument lui-même." },
      { qui: "Paul", texte: "Le télétravail ne réglera pas tous les problèmes de concentration de l'open space : ce n'est donc pas la peine de l'essayer.", sophisme: "nirvana",
        pourquoi: "Il rejette une amélioration partielle parce qu'elle n'est pas une solution parfaite." },
      { qui: "Sofia", texte: "Ce qui m'inquiète, ce sont les nouveaux : ils apprennent beaucoup en écoutant les conversations au bureau.", sophisme: null,
        pourquoi: "Une objection pertinente, qui porte sur une conséquence réelle de la mesure." },
      { qui: "Léa", texte: "C'est un vrai point. On pourrait fixer les jours de télétravail pour que les nouveaux aient toujours quelqu'un à côté d'eux.", sophisme: null,
        pourquoi: "Elle reconnaît l'objection et y répond : un modèle de discussion honnête." },
      { qui: "Paul", texte: "De toute façon, ceux qui réclameront du télétravail, je m'en souviendrai au moment des augmentations.", sophisme: "ad-baculum",
        pourquoi: "Une menace voilée remplace les raisons : on cède par crainte, pas parce qu'on est convaincu." },
      { qui: "Marc", texte: "Ça, c'est une menace, pas un argument. Et je reconnais que l'exemple de mon cousin ne prouvait rien.", sophisme: null,
        pourquoi: "Dénoncer une menace n'est pas un sophisme, et revenir sur son propre argument faible non plus." },
      { qui: "Sofia", texte: "Proposons un essai de trois mois, avec un point sur les délais et l'accueil des nouveaux à la fin.", sophisme: null,
        pourquoi: "Un essai avec des critères fixés à l'avance : rien de fallacieux." },
      { qui: "Paul", texte: "Va pour l'essai. Je retire ce que j'ai dit sur les augmentations.", sophisme: null,
        pourquoi: "Recevable : il accepte l'essai et retire sa menace." }
    ]
  },
  {
    id: "barbecues",
    titre: "Les barbecues sur les balcons",
    contexte: "Assemblée de copropriété. Mme Garnier demande d'interdire les barbecues sur les balcons ; Hugo et Inès s'y opposent. M. Lemaire préside le conseil syndical.",
    repliques: [
      { qui: "Mme Garnier", texte: "La fumée du barbecue du troisième entre chez moi dès que j'ouvre la fenêtre ; je ne peux plus aérer le dimanche midi.", sophisme: null,
        pourquoi: "Un témoignage direct sur une gêne précise : c'est un élément du débat." },
      { qui: "Hugo", texte: "Avez-vous enfin arrêté de vous plaindre de tous vos voisins ?", sophisme: "question-piege",
        pourquoi: "La question présuppose qu'elle se plaint de tous ses voisins ; répondre « oui » ou « non » revient à l'admettre." },
      { qui: "M. Lemaire", texte: "Le règlement actuel ne dit rien des barbecues ; l'assureur de l'immeuble demande seulement qu'ils ne soient pas au charbon.", sophisme: null,
        pourquoi: "Un rappel des faits utiles à la décision." },
      { qui: "Inès", texte: "On n'a aucune preuve que cette fumée soit nocive : elle est donc sans danger.", sophisme: "ignorance",
        pourquoi: "L'absence de preuve d'un danger n'est pas une preuve d'innocuité : la question n'a simplement pas été étudiée." },
      { qui: "Mme Garnier", texte: "Vous demandiez une mesure : le voisin du deuxième a prêté son capteur de particules. Pendant les grillades, les relevés sur mon balcon dépassent nettement ceux de la rue.", sophisme: null,
        pourquoi: "Elle apporte une mesure, imparfaite mais réelle, en réponse à une demande de preuve." },
      { qui: "Inès", texte: "Une mesure sur un balcon, ça ne prouve rien : il faudrait un laboratoire agréé, sur une année entière, dans plusieurs immeubles.", sophisme: "poteaux",
        pourquoi: "Une fois la mesure fournie, elle exige une preuve bien plus lourde sans reconnaître que sa demande est satisfaite. On peut discuter la fiabilité du capteur, mais il faut alors le dire et le justifier." },
      { qui: "M. Lemaire", texte: "L'une dit que la fumée est dangereuse, l'autre qu'elle est inoffensive : la vérité est sûrement entre les deux, elle est un peu nocive.", sophisme: "juste-milieu",
        pourquoi: "La vérité ne se trouve pas forcément à mi-chemin : seules des mesures peuvent dire ce qu'il en est." },
      { qui: "Inès", texte: "Entre un petit gril électrique et un grand barbecue à charbon, il existe mille modèles intermédiaires : impossible de tracer une limite, donc on ne peut rien interdire.", sophisme: "continuum",
        pourquoi: "L'absence de frontière nette n'efface pas la différence entre les extrêmes : on peut fixer une limite, même un peu arbitraire." },
      { qui: "Hugo", texte: "Je retire ma question de tout à l'heure, elle était déplacée. Mais l'été, le balcon est la seule pièce extérieure de beaucoup d'entre nous.", sophisme: null,
        pourquoi: "Il retire une attaque et avance un intérêt légitime à prendre en compte." },
      { qui: "Mme Garnier", texte: "Je le comprends. D'après la notice que j'ai apportée, un barbecue électrique fume beaucoup moins qu'un barbecue à charbon : on pourrait n'autoriser que ceux-là.", sophisme: null,
        pourquoi: "Une proposition de compromis, appuyée sur un document vérifiable." },
      { qui: "M. Lemaire", texte: "Le règlement peut fixer une règle précise : barbecues électriques uniquement, et jamais après 22 heures. Une limite a toujours une part d'arbitraire, mais elle reste utile.", sophisme: null,
        pourquoi: "Il répond justement au sophisme du continuum : une limite arbitraire peut être raisonnable." },
      { qui: "Inès", texte: "Je voterai pour, à condition qu'on refasse le point l'an prochain.", sophisme: null,
        pourquoi: "Un accord assorti d'une condition : rien de fallacieux." }
    ]
  },
  {
    id: "vacances",
    titre: "La montagne ou la mer ?",
    contexte: "Quatre amis choisissent leur semaine de vacances : un gîte à la montagne ou une location au bord de la mer.",
    repliques: [
      { qui: "Amina", texte: "D'après les deux annonces, le gîte coûte 60 € de moins par personne pour la semaine.", sophisme: null,
        pourquoi: "Un fait vérifiable, utile à la décision." },
      { qui: "Thomas", texte: "Si un endroit est agréable, il est plein de touristes en août. Le village de la côte est plein de touristes en août : c'est donc qu'il est agréable.", sophisme: "affirmation-consequent",
        pourquoi: "De « si agréable, alors plein » et « plein », on ne peut pas conclure « agréable » : un village peut être plein pour d'autres raisons (il est le seul accessible, ou le moins cher)." },
      { qui: "Julie", texte: "Si on va à la montagne, on fera du sport. Si on choisit la mer, on ne va pas à la montagne : donc on ne fera aucun sport de la semaine.", sophisme: "negation-antecedent",
        pourquoi: "De « si montagne, alors sport » et « pas montagne », on ne peut pas conclure « pas de sport » : on peut faire du sport ailleurs." },
      { qui: "Bastien", texte: "Il y a du kayak et des sentiers côtiers près de la location : on peut faire du sport à la mer aussi.", sophisme: null,
        pourquoi: "Un contre-exemple concret, qui répond exactement au raisonnement précédent." },
      { qui: "Amina", texte: "Chacune des quatre randonnées du topo-guide est facile : les enchaîner toutes les quatre dans la journée sera donc facile aussi.", sophisme: "composition",
        pourquoi: "Ce qui est vrai de chaque partie ne l'est pas forcément du tout : quatre randonnées faciles à la suite font une journée éprouvante." },
      { qui: "Thomas", texte: "On cherche un endroit calme. D'après la météo marine, la mer sera calme toute la semaine : c'est donc là qu'on trouvera le calme qu'on cherche.", sophisme: "equivoque",
        pourquoi: "« Calme » change de sens en cours de route : une mer sans vagues n'est pas un lieu sans bruit ni foule." },
      { qui: "Julie", texte: "Les avis sur le gîte signalent un bruit de route la nuit ; deux personnes sur une trentaine s'en plaignent.", sophisme: null,
        pourquoi: "Elle rapporte un inconvénient avec sa proportion, sans l'exagérer." },
      { qui: "Bastien", texte: "Si vous choisissez la montagne, je vais passer une semaine malheureux, et ce sera votre faute. Vous voulez vraiment me faire ça ?", sophisme: "emotion",
        pourquoi: "Il cherche à culpabiliser les autres au lieu de donner des raisons de préférer la mer." },
      { qui: "Amina", texte: "Tu préfères la mer, et c'est une vraie raison de la choisir. Mais le budget de Thomas est serré.", sophisme: null,
        pourquoi: "Dans un choix de vacances, les préférences de chacun sont des raisons pertinentes : elle les prend en compte sans en faire un chantage." },
      { qui: "Thomas", texte: "C'est vrai, mon budget est serré : 60 € de différence, ça compte pour moi.", sophisme: null,
        pourquoi: "Une contrainte réelle, exprimée simplement." },
      { qui: "Julie", texte: "Et si on prenait la montagne cette année et la mer l'an prochain ?", sophisme: null,
        pourquoi: "Une proposition qui tient compte des deux préférences." },
      { qui: "Bastien", texte: "D'accord, à condition de réserver la mer dès maintenant pour l'an prochain.", sophisme: null,
        pourquoi: "Un accord avec une condition : rien de fallacieux." }
    ]
  },
  {
    id: "football",
    titre: "Sélectionner les enfants dès 8 ans ?",
    contexte: "Réunion d'un club de football amateur. Gilles, le président, veut former des équipes par niveau dès 8 ans ; Sandrine, mère d'un joueur, s'y oppose. Mehdi est éducateur au club.",
    repliques: [
      { qui: "Sandrine", texte: "Mon fils de 8 ans rentre en pleurant quand il ne joue que cinq minutes. Je préfère que tous les enfants jouent autant.", sophisme: null,
        pourquoi: "Un témoignage et une préférence, présentés comme tels : c'est un élément légitime du débat." },
      { qui: "Gilles", texte: "Tous les vrais clubs sélectionnent leurs joueurs dès le plus jeune âge.", sophisme: null,
        pourquoi: "Une affirmation générale, discutable, mais pas encore un sophisme : on peut la vérifier en cherchant des contre-exemples." },
      { qui: "Sandrine", texte: "Le club de Saint-Martin ne fait aucune sélection avant 12 ans, et trois de ses anciens joueurs sont aujourd'hui en centre de formation.", sophisme: null,
        pourquoi: "Un contre-exemple précis, ce qui est la bonne façon de mettre à l'épreuve une généralisation." },
      { qui: "Gilles", texte: "Saint-Martin n'est pas un vrai club, c'est une garderie avec des ballons.", sophisme: "vrai-ecossais",
        pourquoi: "Face au contre-exemple, il redéfinit « vrai club » pour en exclure Saint-Martin et sauver sa généralisation." },
      { qui: "Mehdi", texte: "Dans les formations d'éducateur que j'ai suivies, on recommande de faire jouer tous les enfants à cet âge : beaucoup progressent tard, et on ne peut pas savoir lesquels.", sophisme: null,
        pourquoi: "Une expertise pertinente, accompagnée de sa raison : l'autorité porte sur son domaine." },
      { qui: "Gilles", texte: "Et le parking du club, il n'est toujours pas refait ! Voilà ce dont on devrait parler.", sophisme: "hareng-rouge",
        pourquoi: "Il change de sujet au lieu de répondre à l'argument de l'éducateur." },
      { qui: "Sandrine", texte: "Un célèbre chef cuisinier, grand amateur de football, a dit à la télévision qu'il faut sélectionner dès 6 ans : ça devrait vous convaincre.", sophisme: "autorite",
        pourquoi: "La notoriété de ce chef ne fait pas de lui un spécialiste de la formation des enfants." },
      { qui: "Mehdi", texte: "Aimer le football ne fait pas de lui un spécialiste de la formation. Regardons plutôt ce qui se passe dans notre club.", sophisme: null,
        pourquoi: "Il conteste à juste titre la compétence de l'autorité invoquée, puis revient aux faits." },
      { qui: "Gilles", texte: "Les équipes qui jouent le plus de matchs sont celles qui gagnent le plus de trophées : faisons jouer les meilleurs plus souvent, et on gagnera.", sophisme: "correlation",
        pourquoi: "Les équipes qui gagnent jouent plus de matchs parce qu'elles avancent dans les compétitions : jouer davantage n'est pas la cause de leurs victoires." },
      { qui: "Gilles", texte: "L'idée que la sélection précoce n'aide pas à repérer les talents ne peut pas être vraie : sinon, tout notre système de recrutement n'aurait servi à rien.", sophisme: "consequences",
        pourquoi: "Il rejette une affirmation parce que ses conséquences lui déplaisent, sans examiner les preuves." },
      { qui: "Mehdi", texte: "Je propose des groupes par niveau à l'entraînement, mais des temps de jeu égaux en match.", sophisme: null,
        pourquoi: "Une proposition qui répond aux deux préoccupations." },
      { qui: "Gilles", texte: "Je n'y crois pas trop, mais essayons jusqu'à la fin de la saison.", sophisme: null,
        pourquoi: "Sceptique, mais prêt à essayer : rien de fallacieux." }
    ]
  },
  {
    id: "bibliotheque",
    titre: "La bibliothèque ouverte le dimanche",
    contexte: "Conseil municipal. Faut-il ouvrir la bibliothèque le dimanche ? Fatou, habitante, est pour ; René, conseiller, est contre. Élodie dirige la bibliothèque, Yann est adjoint à la culture.",
    repliques: [
      { qui: "Fatou", texte: "Je travaille en semaine jusqu'à 19 heures, comme beaucoup de parents de l'école, et le samedi la bibliothèque est bondée. Le dimanche serait le seul moment calme pour y aller avec mes enfants.", sophisme: null,
        pourquoi: "Un besoin concret, présenté comme le sien et celui d'autres parents : recevable." },
      { qui: "René", texte: "L'ouverture le dimanche, c'est une idée née dans les grandes chaînes de magasins pour vendre plus : elle n'a rien à faire dans un service public.", sophisme: "genetique",
        pourquoi: "Il juge l'idée d'après son origine supposée, sans examiner ses effets pour une bibliothèque." },
      { qui: "Élodie", texte: "Dans notre réseau, les trois bibliothèques déjà ouvertes le dimanche accueillent ce jour-là plus de familles que n'importe quel autre jour, d'après leurs bilans annuels.", sophisme: null,
        pourquoi: "Des données pertinentes et sourcées, présentées par une professionnelle du domaine." },
      { qui: "René", texte: "C'est aussi ce que réclame le collectif « Libérons le dimanche », dont les dirigeants ont été condamnés pour fraude : voilà avec qui vous voulez faire cause commune.", sophisme: "association",
        pourquoi: "Il discrédite l'idée parce que des personnes jugées détestables la défendent aussi, et non par ses défauts propres." },
      { qui: "Yann", texte: "Le vrai sujet, c'est le coût : deux agents payés double le dimanche, soit environ 18 000 € par an d'après le service du personnel.", sophisme: null,
        pourquoi: "Une objection chiffrée et sourcée, qui porte sur le fond." },
      { qui: "René", texte: "Je cite le compte rendu de l'an dernier, où Mme Élodie déclarait : « Ouvrir le dimanche épuiserait l'équipe… » Je m'arrête là, la suite n'a pas d'importance : elle est donc contre.", sophisme: "hors-contexte",
        pourquoi: "Il coupe la phrase à dessein. La suite pouvait en changer le sens, ce que la réplique suivante confirme." },
      { qui: "Élodie", texte: "Ma phrase se terminait par « … sans recrutement supplémentaire ». Avec deux agents de plus, l'équipe ne serait pas épuisée.", sophisme: null,
        pourquoi: "Elle rétablit le contexte de sa citation : c'est la bonne réponse." },
      { qui: "Yann", texte: "La culture, c'est la littérature et les beaux-arts. Les bandes dessinées et les jeux vidéo que les familles emprunteraient le dimanche n'en font pas partie : ouvrir ce jour-là ne servirait donc pas la mission culturelle de la bibliothèque.", sophisme: "definition-persuasive",
        pourquoi: "Il restreint le sens du mot « culture » pour en exclure ce qu'il veut écarter, tout en gardant son prestige." },
      { qui: "René", texte: "Ouvrir la bibliothèque le dimanche ou supprimer le repos dominical de tous les salariés de la ville, c'est la même chose : dans les deux cas, on fait travailler des gens le dimanche.", sophisme: "fausse-equivalence",
        pourquoi: "Deux agents volontaires d'un côté, tous les salariés de la ville de l'autre : un trait commun ne rend pas les deux mesures équivalentes." },
      { qui: "Élodie", texte: "Deux collègues se sont déjà portées volontaires, à condition d'avoir un jour de repos en semaine.", sophisme: null,
        pourquoi: "Une information concrète, qui répond à l'objection." },
      { qui: "Yann", texte: "Je propose un essai le premier dimanche de chaque mois, avec un comptage des entrées.", sophisme: null,
        pourquoi: "Un essai mesurable : rien de fallacieux." },
      { qui: "René", texte: "Je reste sceptique sur le coût, mais je ne m'opposerai pas à un essai limité.", sophisme: null,
        pourquoi: "Recevable : il maintient son objection tout en acceptant de voir les résultats." }
    ]
  },
  {
    id: "marche",
    titre: "Une rue piétonne le jour du marché",
    contexte: "Réunion de l'association des commerçants. Faut-il fermer la rue du marché aux voitures le samedi matin ? Antoine, habitant, est pour ; Léon, boulanger, est contre. Maryse est fleuriste, Mme Benali élue de quartier.",
    repliques: [
      { qui: "Mme Benali", texte: "La proposition : fermer la rue aux voitures le samedi de 8 heures à 14 heures. Les livraisons resteraient possibles avant 8 heures.", sophisme: null,
        pourquoi: "Un exposé précis de la proposition, ce qui évite les malentendus." },
      { qui: "Léon", texte: "Je ne peux pas savoir comment viennent mes clients du samedi, mais beaucoup me disent se garer devant la boutique.", sophisme: null,
        pourquoi: "Il présente un indice limité en reconnaissant lui-même ses limites." },
      { qui: "Antoine", texte: "Les rues piétonnes font gagner les commerces, baisser la pollution, revenir les oiseaux, diminuer la criminalité, monter la valeur des logements, disparaître les accidents, venir les touristes, rendre les gens plus heureux… et je pourrais en citer vingt autres.", sophisme: "brandolini",
        pourquoi: "Une avalanche d'affirmations non étayées, impossibles à vérifier une à une dans le temps du débat." },
      { qui: "Maryse", texte: "On ne peut pas vérifier tout ça ce soir. Concentrons-nous sur un seul point : la fréquentation des commerces.", sophisme: null,
        pourquoi: "La bonne réponse à un mitraillage : ramener le débat à un point vérifiable." },
      { qui: "Antoine", texte: "Parmi la centaine de commerces fermés en ville depuis dix ans, j'en ai repéré quatre groupés autour du carrefour du Marché, le plus fréquenté par les voitures : la circulation fait fermer les commerces.", sophisme: "tireur-elite",
        pourquoi: "Il repère après coup un regroupement parmi des fermetures dispersées dans toute la ville, et l'interprète comme un effet, sans tenir compte des autres." },
      { qui: "Léon", texte: "Ce carrefour est aussi celui qui compte le plus de commerces : il est normal d'y voir plus de fermetures.", sophisme: null,
        pourquoi: "Il propose une explication plus simple du regroupement : c'est une objection pertinente." },
      { qui: "Maryse", texte: "La rue piétonne est une bonne idée, parce qu'une rue sans voitures vaut mieux qu'une rue avec des voitures.", sophisme: "petition-principe",
        pourquoi: "La prémisse redit la conclusion sous une autre forme : rien n'est démontré." },
      { qui: "Mme Benali", texte: "Une ville voisine a compté les visiteurs de son marché avant et après l'avoir rendu piéton. Je peux demander ses chiffres et sa méthode.", sophisme: null,
        pourquoi: "Elle propose de s'appuyer sur une mesure comparable, en vérifiant la méthode." },
      { qui: "Léon", texte: "Antoine a mitraillé vingt arguments sans preuve : sa position est donc fausse, la rue piétonne ne marchera pas.", sophisme: "sophisme-sophisme",
        pourquoi: "Qu'un argument soit mauvais ne rend pas sa conclusion fausse : la rue piétonne peut marcher ou non, pour d'autres raisons." },
      { qui: "Antoine", texte: "Tu as raison, j'en ai trop accumulé. Mais ça ne règle pas la question : il nous faut des chiffres.", sophisme: null,
        pourquoi: "Il reconnaît un défaut de forme sans abandonner sa position, et demande des preuves : recevable." },
      { qui: "Maryse", texte: "Testons trois samedis, en comptant les passants et les ventes, et comparons avec les mêmes samedis de l'an dernier.", sophisme: null,
        pourquoi: "Un essai avec un point de comparaison : la bonne méthode." },
      { qui: "Léon", texte: "Vu comme ça, d'accord. Mais si mes ventes baissent nettement, on arrête.", sophisme: null,
        pourquoi: "Un accord avec un critère d'arrêt : rien de fallacieux." }
    ]
  }
];

// ===================== Réparer l'argument =====================
// Un argument fautif (sophisme s) et quatre réécritures :
//   rep    : vraie réparation, qui garde la conclusion et corrige le raisonnement [texte, pourquoi]
//   autre  : garde la conclusion mais commet un autre sophisme [texte, id du sophisme]
//   acc    : simple accusation de sophisme, qui ne répare rien
//   concl  : change de conclusion pour échapper au défaut
// Situations fictives.

const REPARATIONS = [
  { s: "ad-hominem", arg: "Ne suis pas son projet de budget pour le club : il a raté son bac.",
    rep: ["Ne suis pas son projet de budget : il oublie l'assurance des locaux, 900 € par an, et il est donc en déficit.", "La critique porte sur le contenu du budget, ce qui peut réellement le mettre en défaut."],
    autre: ["Ne suis pas son projet de budget : tout le bureau le trouve mauvais.", "popularite"],
    acc: "Ton reproche sur son bac est une attaque personnelle.",
    concl: "Il a raté son bac, mais son budget est peut-être bon." },
  { s: "tu-quoque", arg: "Tu me dis de ranger mon téléphone pendant les repas, alors que tu passes tes soirées sur le tien : ton conseil ne vaut rien.",
    rep: ["Ton conseil ne me concerne pas vraiment : je ne regarde mon téléphone à table que pour les appels d'astreinte, une fois par semaine.", "La réponse porte sur le bien-fondé du conseil dans son cas, et non sur la conduite de celui qui le donne."],
    autre: ["Ton conseil ne vaut rien : dans ma famille, on a toujours gardé le téléphone à table.", "tradition"],
    acc: "Tu me fais la morale : c'est un sophisme.",
    concl: "Tu passes aussi beaucoup de temps sur ton téléphone : rangeons-les tous les deux pendant les repas." },
  { s: "association", arg: "Ne votons pas pour la réduction de l'éclairage nocturne : c'est ce que réclame un groupuscule extrémiste.",
    rep: ["Ne votons pas pour la réduction de l'éclairage nocturne dans les passages souterrains : la police municipale y a relevé la moitié des agressions de l'an dernier, de nuit.", "Le refus s'appuie sur une conséquence de la mesure elle-même, et non sur ceux qui la défendent."],
    autre: ["Ne votons pas pour la réduction de l'éclairage : on a toujours éclairé les rues toute la nuit.", "tradition"],
    acc: "Comparer vos adversaires à des extrémistes, c'est un sophisme.",
    concl: "Ce groupuscule réclame la mesure, mais elle peut quand même être bonne." },
  { s: "autorite", arg: "Ce matelas soigne le mal de dos : un champion de tennis l'affirme dans la publicité.",
    rep: ["Ce matelas soulage le mal de dos : dans un essai comparant deux groupes de patients tirés au sort, ceux qui l'utilisaient avaient moins de douleurs après trois mois.", "Une étude comparative remplace le témoignage d'une célébrité hors de son domaine."],
    autre: ["Ce matelas soigne le mal de dos : il s'en vend des milliers chaque mois.", "popularite"],
    acc: "Invoquer un champion de tennis, c'est un argument d'autorité.",
    concl: "Ce champion de tennis aime son matelas." },
  { s: "popularite", arg: "Cette crème anti-rides est efficace : c'est la plus vendue du pays.",
    rep: ["Cette crème atténue les rides : dans un essai en double aveugle, les rides mesurées ont diminué davantage qu'avec une crème neutre.", "Une mesure contrôlée remplace le nombre d'acheteurs, qui ne dit rien de l'efficacité."],
    autre: ["Cette crème anti-rides est efficace : elle est 100 % naturelle.", "nature"],
    acc: "« La plus vendue », c'est un appel à la popularité.",
    concl: "Cette crème est très populaire." },
  { s: "tradition", arg: "Il faut garder la réunion du lundi à 8 heures : on l'a toujours faite à cette heure-là.",
    rep: ["Il faut garder la réunion du lundi à 8 heures : c'est le seul créneau où les équipes de nuit et de jour sont présentes en même temps.", "La raison invoquée est une utilité actuelle, et non l'ancienneté de l'habitude."],
    autre: ["Il faut garder la réunion à 8 heures : sinon, on finira par ne plus faire de réunion du tout, et l'équipe se désorganisera.", "pente-glissante"],
    acc: "Dire « on a toujours fait comme ça » est un sophisme.",
    concl: "On a toujours fait la réunion à 8 heures, mais on pourrait la déplacer." },
  { s: "nature", arg: "Ce sirop à base de plantes est sans danger pour les enfants : il est entièrement naturel.",
    rep: ["Ce sirop est sans danger pour les enfants aux doses indiquées : ses effets indésirables ont été étudiés chez l'enfant et sont rares et bénins.", "La sécurité repose sur des données de tolérance, pas sur l'origine naturelle des ingrédients."],
    autre: ["Ce sirop est sans danger : nos grands-mères le donnaient déjà à leurs enfants.", "tradition"],
    acc: "« Naturel » ne veut rien dire : c'est un sophisme.",
    concl: "Ce sirop est fabriqué à partir de plantes." },
  { s: "emotion", arg: "Il faut acheter ce détecteur de fumée : imaginez vos enfants pris au piège dans les flammes.",
    rep: ["Il faut acheter un détecteur de fumée : il donne l'alerte avant que la fumée n'atteigne les chambres, alors que la plupart des incendies mortels surviennent la nuit, pendant le sommeil.", "Le danger est décrit par ses mécanismes, sans chercher à effrayer pour emporter l'accord."],
    autre: ["Il faut acheter ce détecteur : tous vos voisins en ont déjà un.", "popularite"],
    acc: "Vous jouez sur la peur, c'est un sophisme.",
    concl: "Les incendies domestiques sont terrifiants." },
  { s: "consequences", arg: "Mon équipe ne peut pas avoir commis d'erreur de calcul dans ce dossier : sinon, tout le projet serait à refaire.",
    rep: ["Mon équipe n'a pas commis d'erreur de calcul dans ce dossier : un second ingénieur a refait tous les calculs indépendamment et trouve les mêmes résultats.", "Une vérification indépendante remplace le refus d'envisager une conséquence désagréable."],
    autre: ["Mon équipe ne peut pas s'être trompée : elle a toujours rendu des calculs justes jusqu'ici, donc elle ne se trompera jamais.", "generalisation-hative"],
    acc: "Refuser l'erreur à cause de ses conséquences, c'est un sophisme.",
    concl: "Si mon équipe s'est trompée, tout le projet est à refaire." },
  { s: "genetique", arg: "La semaine de quatre jours est une mauvaise idée : elle a été inventée par un patron qui voulait faire de la publicité à son entreprise.",
    rep: ["La semaine de quatre jours est une mauvaise idée pour notre service d'accueil : il doit rester ouvert cinq jours, et nos effectifs ne permettent pas de couvrir le cinquième.", "L'objection porte sur les effets de la mesure dans ce cas précis, et non sur son origine."],
    autre: ["La semaine de quatre jours est une mauvaise idée : avec elle, on finira par ne plus travailler que trois jours, puis deux.", "pente-glissante"],
    acc: "Juger une idée d'après son inventeur, c'est un sophisme génétique.",
    concl: "La semaine de quatre jours a une origine publicitaire." },
  { s: "ad-baculum", arg: "Tu vas soutenir mon projet en réunion, sinon je ne t'aiderai plus pour tes dossiers.",
    rep: ["Soutiens mon projet en réunion : il réduit de moitié les délais de livraison, et tes clients s'en plaignent depuis des mois.", "Une raison qui concerne l'intérêt du projet remplace la menace."],
    autre: ["Soutiens mon projet : tout le monde dans l'équipe le soutient déjà.", "popularite"],
    acc: "Me menacer, c'est un appel à la force.",
    concl: "Je ne t'aiderai plus pour tes dossiers." },
  { s: "homme-de-paille", arg: "Tu proposes de limiter les écrans à une heure par jour pour les enfants ? Donc tu veux les priver de toute technologie et en faire des marginaux.",
    rep: ["Une limite d'une heure par jour est trop basse : les devoirs de collège demandent déjà souvent plus d'une heure d'ordinateur.", "L'objection porte sur la proposition réelle (une heure par jour), et non sur une caricature."],
    autre: ["Ta proposition ne vaut rien : tu passes toi-même des heures devant ton écran.", "tu-quoque"],
    acc: "Ta proposition est un sophisme.",
    concl: "Les enfants ont besoin de technologie." },
  { s: "hareng-rouge", arg: "On me reproche le retard du chantier de l'école ? Parlons plutôt de la propreté des rues, qui s'est beaucoup améliorée.",
    rep: ["Le chantier de l'école a pris trois mois de retard parce que l'entreprise de charpente a fait faillite ; la nouvelle entreprise s'est engagée sur une livraison en mars.", "La réponse porte enfin sur la question posée : le retard et ses causes."],
    autre: ["Le retard ? Vous préférez donc qu'on bâcle le chantier et que le toit s'effondre sur les enfants ?", "homme-de-paille"],
    acc: "Votre question sur le retard est un piège.",
    concl: "La propreté des rues s'est beaucoup améliorée." },
  { s: "question-piege", arg: "Pourquoi as-tu encore oublié de payer la facture d'électricité ce mois-ci ?",
    rep: ["La facture d'électricité de ce mois-ci n'apparaît pas sur le relevé : l'as-tu payée ?", "La question ne présuppose plus ce qui reste à établir : elle demande d'abord le fait."],
    autre: ["Tu as oublié la facture, comme tous les gens distraits : les distraits oublient toujours tout.", "generalisation-hative"],
    acc: "Ta question est un sophisme.",
    concl: "Il faudrait penser à payer la facture." },
  { s: "poteaux", arg: "Tu voulais une preuve que le nouveau logiciel fait gagner du temps ? Ce test chronométré ne compte pas : il faudrait le refaire sur six mois avec toute l'équipe.",
    rep: ["Ton test chronométré montre un gain de temps sur une tâche ; je l'accepte. Mais il ne porte que sur la saisie : pour conclure au gain global, il faudrait aussi mesurer la relecture.", "Il reconnaît que la preuve demandée a été fournie, puis justifie précisément ce qui manque encore."],
    autre: ["Ton test ne compte pas : tu es payé par l'éditeur du logiciel.", "ad-hominem"],
    acc: "Tu fais un sophisme avec ton test.",
    concl: "Le logiciel fait gagner du temps." },
  { s: "brandolini", arg: "Ce restaurant est le pire de la ville : la serveuse était lente, la musique trop forte, les prix exagérés, le parking trop loin, les chaises inconfortables, le menu trop court, la lumière trop vive, et je pourrais continuer.",
    rep: ["Ce restaurant est le pire que j'aie essayé en ville : sur les trois plats commandés, deux étaient froids, et l'addition comptait un plat que nous n'avions pas pris.", "Deux faits précis et vérifiables remplacent une liste de griefs impossibles à examiner."],
    autre: ["Ce restaurant est le pire de la ville : tous mes collègues le disent.", "popularite"],
    acc: "Tu accumules les reproches, c'est un sophisme.",
    concl: "Je n'ai pas aimé ma soirée dans ce restaurant." },
  { s: "faux-dilemme", arg: "Soit on achète la voiture neuve, soit on ne part plus jamais en vacances.",
    rep: ["Pour partir en vacances, il nous faut une voiture fiable : la nôtre est tombée en panne trois fois cette année, et la réparation coûterait plus que sa valeur. Une neuve, ou une bonne occasion, réglerait le problème.", "Le raisonnement part d'un besoin réel et laisse ouvertes les autres options."],
    autre: ["Il faut acheter la voiture neuve : nos voisins viennent tous de changer la leur.", "popularite"],
    acc: "Tu présentes un faux dilemme.",
    concl: "On pourrait aussi louer une voiture pour les vacances." },
  { s: "juste-milieu", arg: "Le vendeur dit que la maison vaut 400 000 €, l'acheteur 300 000 € : elle vaut donc 350 000 €.",
    rep: ["La maison vaut environ 350 000 € : c'est le prix moyen au mètre carré des cinq ventes comparables du quartier cette année.", "L'estimation vient de données de marché, et non du point médian entre deux prétentions intéressées."],
    autre: ["La maison vaut 350 000 € : un ami de l'acheteur, professeur de mathématiques, en est sûr.", "autorite"],
    acc: "Couper la poire en deux, c'est un sophisme.",
    concl: "Le vendeur et l'acheteur pourraient s'entendre à 350 000 €." },
  { s: "fausse-analogie", arg: "Un employé, c'est comme une machine : il suffit de l'entretenir régulièrement pour qu'il produise toujours autant.",
    rep: ["Un employé reste plus productif s'il prend régulièrement des congés : dans notre service, les arrêts maladie baissent nettement l'année qui suit les congés pris en entier.", "Le constat porte sur les employés eux-mêmes, sans transférer des propriétés d'une machine."],
    autre: ["Un employé produit toujours autant s'il est bien traité : tous les managers le savent.", "popularite"],
    acc: "Comparer un employé à une machine, c'est une fausse analogie.",
    concl: "Les machines doivent être entretenues régulièrement." },
  { s: "fausse-equivalence", arg: "Oublier de rendre un livre à la bibliothèque ou voler dans un magasin, c'est pareil : dans les deux cas, on garde ce qui ne nous appartient pas.",
    rep: ["Oublier de rendre un livre est un tort, même s'il est sans commune mesure avec un vol : on prive les autres lecteurs, et le retard est pénalisé pour cette raison.", "Le tort est reconnu pour lui-même, sans être assimilé à une faute bien plus grave."],
    autre: ["Oublier de rendre un livre, c'est grave : aujourd'hui un livre, demain un vol, après-demain un cambriolage.", "pente-glissante"],
    acc: "Comparer un oubli et un vol, c'est une fausse équivalence.",
    concl: "Voler dans un magasin est un délit." },
  { s: "nirvana", arg: "Ce casque de vélo ne protège pas de tous les accidents : autant ne pas le porter.",
    rep: ["Ce casque ne protège pas de tout, mais il réduit le risque de blessure grave à la tête : il vaut donc la peine d'être porté.", "La solution est jugée sur ce qu'elle améliore, et non comparée à une protection parfaite qui n'existe pas."],
    autre: ["Pas besoin de casque : mon grand-père n'en a jamais porté et il n'a jamais eu d'accident.", "generalisation-hative"],
    acc: "Exiger une protection parfaite, c'est le sophisme du nirvana.",
    concl: "Aucun casque ne protège de tous les accidents." },
  { s: "post-hoc", arg: "J'ai changé de coiffeur, et le lendemain j'ai décroché l'emploi : ce nouveau coiffeur me porte chance.",
    rep: ["J'ai décroché cet emploi parce que j'avais préparé l'entretien : la recruteuse m'a dit avoir retenu ma présentation du dossier.", "La cause invoquée est appuyée par une information directe, et non par une simple succession."],
    autre: ["Ce coiffeur porte chance : tous ses clients le disent.", "popularite"],
    acc: "Tu confonds avant et cause.",
    concl: "J'ai changé de coiffeur la veille de mon entretien." },
  { s: "correlation", arg: "Les élèves qui dorment le plus ont les meilleures notes : dormir davantage améliore donc les résultats.",
    rep: ["Dormir davantage améliore les résultats : dans une expérience où des classes tirées au sort ont commencé les cours une heure plus tard, leurs élèves ont dormi plus et obtenu de meilleures notes que les autres.", "Une expérience avec tirage au sort écarte les facteurs communs (motivation, milieu familial) qui pouvaient expliquer le lien observé."],
    autre: ["Dormir davantage améliore les résultats : tous les professeurs le disent.", "popularite"],
    acc: "Tu confonds corrélation et causalité.",
    concl: "Les élèves qui dorment le plus ont les meilleures notes." },
  { s: "pente-glissante", arg: "Si on autorise les chiens dans le parc, bientôt il y aura des chevaux, puis des vaches, et le parc deviendra une ferme.",
    rep: ["Si on autorise les chiens dans le parc, il faudra des sacs et des poubelles adaptés : dans le parc voisin, les déjections ont triplé la première année faute d'équipement.", "La conséquence annoncée est directe et appuyée sur un exemple, sans chaîne d'étapes imaginaires."],
    autre: ["N'autorisons pas les chiens : ce parc a toujours été interdit aux animaux.", "tradition"],
    acc: "Ton raisonnement est une pente glissante.",
    concl: "Les chevaux n'ont rien à faire dans un parc." },
  { s: "tireur-elite", arg: "Les trois dernières pannes de la photocopieuse ont eu lieu un mardi : le mardi lui porte malheur.",
    rep: ["Le mardi est le jour le plus risqué pour la photocopieuse : c'est le jour où l'on imprime les fiches de paie, trois fois plus de pages que les autres jours, et douze des vingt pannes de l'année ont eu lieu un mardi.", "Le lien est établi sur toutes les pannes de l'année, et non sur les trois dernières repérées après coup, avec un mécanisme plausible."],
    autre: ["Le mardi porte malheur à la photocopieuse : le technicien de maintenance en est persuadé.", "autorite"],
    acc: "Tu dessines la cible autour des impacts.",
    concl: "La photocopieuse est souvent en panne." },
  { s: "cause-unique", arg: "Si les élèves ont de moins bons résultats en lecture, c'est uniquement à cause des téléphones portables.",
    rep: ["Les téléphones portables jouent sans doute un rôle dans la baisse des résultats en lecture, parmi d'autres facteurs comme le temps de lecture à l'école ou le sommeil.", "Le facteur est conservé, mais à sa place parmi les autres."],
    autre: ["C'est la faute des téléphones : depuis qu'ils existent, les résultats baissent.", "post-hoc"],
    acc: "Tu ne vois qu'une seule cause : c'est un sophisme.",
    concl: "Les élèves passent beaucoup de temps sur leur téléphone." },
  { s: "generalisation-hative", arg: "Les deux stagiaires de l'an dernier étaient en retard tous les matins : les stagiaires ne sont jamais ponctuels.",
    rep: ["Les deux stagiaires de l'an dernier étaient souvent en retard : il faudra préciser les horaires dès le premier jour avec le prochain.", "La conclusion reste à la mesure des deux cas observés, sans les étendre à tous les stagiaires."],
    autre: ["Les stagiaires ne sont jamais ponctuels : c'est bien connu, tout le monde le dit.", "popularite"],
    acc: "Tu généralises.",
    concl: "Nos deux derniers stagiaires étaient en retard." },
  { s: "vrai-ecossais", arg: "Aucun vrai cuisinier n'utilise de bouillon en cube. — Le chef du restaurant étoilé d'à côté en utilise. — Alors ce n'est pas un vrai cuisinier.",
    rep: ["Beaucoup de cuisiniers préfèrent un bouillon maison, plus savoureux ; certains, même réputés, utilisent du bouillon en cube.", "La généralisation est corrigée face au contre-exemple, au lieu de redéfinir « vrai cuisinier »."],
    autre: ["Aucun vrai cuisinier n'utilise de cube : c'est contraire à la cuisine naturelle.", "nature"],
    acc: "Tu fais un « aucun vrai Écossais ».",
    concl: "Ce chef utilise du bouillon en cube." },
  { s: "composition", arg: "Chaque ingrédient de ce gâteau est délicieux : le gâteau sera forcément délicieux.",
    rep: ["Ce gâteau a de bonnes chances d'être délicieux : la recette a été testée plusieurs fois, et ses ingrédients sont de qualité.", "C'est la recette elle-même, déjà éprouvée, qui justifie la conclusion, et non la seule qualité de chaque ingrédient."],
    autre: ["Ce gâteau sera délicieux : ma grand-mère le fait comme ça depuis cinquante ans.", "tradition"],
    acc: "Tu fais un sophisme de composition.",
    concl: "Chaque ingrédient de ce gâteau est délicieux." },
  { s: "cherry-picking", arg: "Notre newsletter marche très bien : regardez ces trois numéros qui ont été lus par 60 % des abonnés.",
    rep: ["Notre newsletter marche plutôt bien : sur l'année, 38 % des abonnés en moyenne l'ont ouverte, contre 25 % pour les lettres comparables de notre secteur.", "La conclusion s'appuie sur l'ensemble des numéros et sur un point de comparaison, et non sur les meilleurs seulement."],
    autre: ["Notre newsletter marche très bien : depuis qu'on l'envoie le mardi, les ventes ont augmenté.", "post-hoc"],
    acc: "Tu choisis tes chiffres.",
    concl: "Trois de nos numéros ont été très lus." },
  { s: "affirmation-consequent", arg: "Si le chat a mangé, sa gamelle est vide. Sa gamelle est vide : donc il a mangé.",
    rep: ["La gamelle n'a pu se vider que si le chat a mangé : elle était pleine ce matin et personne d'autre n'y a accès. Elle est vide : donc il a mangé.", "La prémisse affirme cette fois que seul le repas du chat peut vider la gamelle : la conclusion découle alors du raisonnement."],
    autre: ["Le chat a mangé : il mange toujours à cette heure-ci.", "tradition"],
    acc: "Tu affirmes le conséquent.",
    concl: "La gamelle du chat est vide." },
  { s: "negation-antecedent", arg: "Si on prend le train de 8 heures, on sera à l'heure. On ne prend pas le train de 8 heures : donc on sera en retard.",
    rep: ["On ne sera à l'heure que si on prend le train de 8 heures, car le suivant arrive après le début de la réunion. On ne le prend pas : donc on sera en retard.", "La prémisse établit cette fois une condition nécessaire (« seulement si ») : la conclusion découle alors du raisonnement."],
    autre: ["On sera en retard : on est toujours en retard quand on ne prend pas ce train, tout le monde le sait.", "popularite"],
    acc: "Tu nies l'antécédent.",
    concl: "On ne prendra pas le train de 8 heures." },
  { s: "petition-principe", arg: "Ce guide de voyage est fiable, car il est écrit par des auteurs dignes de confiance ; et ces auteurs sont dignes de confiance, puisqu'ils écrivent un guide fiable.",
    rep: ["Ce guide de voyage est fiable : sur les vingt adresses que nous avons vérifiées sur place, dix-neuf correspondaient à sa description.", "La fiabilité est établie par une vérification extérieure, et non par un cercle qui suppose la conclusion."],
    autre: ["Ce guide est fiable : c'est le plus vendu en librairie.", "popularite"],
    acc: "Ton argument tourne en rond.",
    concl: "Les auteurs de ce guide sont connus." },
  { s: "ignorance", arg: "Personne n'a prouvé que ce complément alimentaire est inefficace : il marche donc.",
    rep: ["Ce complément alimentaire n'a pas encore fait ses preuves : en attendant des essais comparatifs, on ne peut pas dire qu'il marche.", "L'absence de preuve conduit à suspendre le jugement, au lieu d'être prise pour une preuve."],
    autre: ["Ce complément marche : il est fait à partir de plantes.", "nature"],
    acc: "Tu inverses la charge de la preuve.",
    concl: "Personne n'a étudié ce complément alimentaire." },
  { s: "sophisme-sophisme", arg: "Pour défendre ce sirop contre le rhume, tu as seulement dit que « tout le monde le prend » : c'est un appel à la popularité, donc ce sirop est inefficace.",
    rep: ["Ce sirop est sans doute inefficace : dans les essais comparatifs publiés, il ne fait pas mieux qu'un sirop sans principe actif. Et ton appel à la popularité ne prouve rien dans un sens ni dans l'autre.", "La conclusion s'appuie sur des essais, et non sur la faiblesse de l'argument adverse."],
    autre: ["Ce sirop est inefficace : il vient d'un laboratoire qui a déjà vendu des produits douteux.", "genetique"],
    acc: "Tu fais un appel à la popularité.",
    concl: "Ton argument pour ce sirop est fallacieux." },
  { s: "equivoque", arg: "Une loi doit être respectée. La gravité est une loi. Donc il faut respecter la gravité.",
    rep: ["La gravité est une loi de la nature : on ne peut pas s'y soustraire. Il faut donc en tenir compte, par exemple en calculant la charge que supporte une étagère.", "« Loi » garde un seul sens (une loi de la nature), et « respecter » devient « tenir compte » : le raisonnement ne joue plus sur les mots."],
    autre: ["Il faut respecter la gravité : c'est naturel.", "nature"],
    acc: "Tu joues sur les mots.",
    concl: "La gravité est une loi de la physique." },
  { s: "hors-contexte", arg: "Le maire veut fermer la piscine : il a déclaré « Il faut fermer la piscine ». (Sa phrase complète : « Il faut fermer la piscine l'été prochain pour refaire le toit, puis la rouvrir en septembre. »)",
    rep: ["Le maire veut fermer la piscine l'été prochain : il a déclaré « Il faut fermer la piscine l'été prochain pour refaire le toit, puis la rouvrir en septembre ».", "La citation est rendue en entier, et la conclusion ne dit que ce qu'elle dit : une fermeture temporaire."],
    autre: ["Le maire veut fermer la piscine : tous les habitants le disent.", "popularite"],
    acc: "Tu cites hors contexte.",
    concl: "Le maire a parlé de la piscine." },
  { s: "continuum", arg: "Un euro de plus ne fait pas de quelqu'un un riche. Donc, en ajoutant un euro à la fois, personne ne devient jamais riche : la richesse n'existe pas.",
    rep: ["Il n'y a pas de seuil précis où l'on devient riche, mais la différence entre 1 000 € et 10 millions d'euros de patrimoine est bien réelle : un seuil conventionnel peut servir.", "L'absence de frontière nette est reconnue sans nier la différence entre les extrêmes."],
    autre: ["La richesse n'existe pas : c'est une invention des journaux.", "genetique"],
    acc: "Tu fais un sophisme du continuum.",
    concl: "Un euro de plus ne change rien." },
  { s: "definition-persuasive", arg: "Être un bon parent, c'est ne jamais dire non à son enfant : ceux qui posent des limites sont donc de mauvais parents.",
    rep: ["Poser des limites peut nuire à un enfant quand elles sont arbitraires ou jamais expliquées : c'est ce que reprochent certains psychologues aux interdits sans raison.", "Le reproche porte sur des pratiques précises, avec leurs raisons, au lieu de redéfinir « bon parent » pour condamner tous ceux qui posent des limites."],
    autre: ["Ceux qui posent des limites sont de mauvais parents : ils ont eux-mêmes été élevés trop sévèrement.", "genetique"],
    acc: "Tu redéfinis les mots à ta convenance.",
    concl: "Certains parents disent souvent non." },
  { s: "cherry-picking", id: "cherry-sport", arg: "Ce club de sport est très efficace : sur sa page, cinq membres montrent leurs 20 kilos perdus.",
    rep: ["Ce club de sport est plutôt efficace : sur l'ensemble de ses membres inscrits depuis un an, la perte de poids moyenne est de 4 kilos, d'après le bilan publié par le club.", "La conclusion s'appuie sur tous les membres, et non sur les cinq meilleurs résultats."],
    autre: ["Ce club est très efficace : il existe depuis trente ans.", "tradition"],
    acc: "Tu ne montres que les meilleurs cas.",
    concl: "Cinq membres de ce club ont perdu 20 kilos." }
];

// ===================== Reformuler sans trahir =====================
// Positions fictives, chacune avec quatre reformulations :
//   fidele : ce que l'auteur a dit, ni plus ni moins
//   paille : une version déformée, plus extrême ou plus faible, facile à réfuter
//   acier  : la version la plus forte que l'auteur accepterait encore (meilleures raisons, objections prévues)
//   hors   : une reformulation qui parle d'autre chose

const REFORMULATIONS = [
  { id: "devoirs", auteur: "Hélène, professeure des écoles",
    position: "Je donne peu de devoirs écrits à mes élèves de CM1. À la maison, certains ont un parent pour les aider, d'autres non : les devoirs creusent les écarts. Je préfère qu'ils lisent un quart d'heure chaque soir.",
    fidele: "Elle limite les devoirs écrits parce que l'aide à la maison est inégale, et leur préfère un quart d'heure de lecture quotidienne.",
    paille: "Elle pense que les enfants n'ont pas à travailler en dehors de l'école.",
    acier: "Le travail à la maison profite surtout aux enfants qui y trouvent de l'aide ; mieux vaut un exercice que tous peuvent faire seuls, comme la lecture, qui entretient aussi un apprentissage essentiel.",
    hors: "Elle trouve que les programmes de CM1 sont trop chargés." },
  { id: "voiture-electrique", auteur: "Marc, garagiste",
    position: "Je conseille une voiture électrique aux clients qui roulent surtout en ville et peuvent recharger chez eux. Pour ceux qui font souvent de longs trajets sans borne sur leur route, je reste plus prudent.",
    fidele: "Il recommande l'électrique pour un usage urbain avec recharge à domicile, et reste réservé pour les longs trajets mal équipés en bornes.",
    paille: "Il pense que les voitures électriques ne servent à rien dès qu'on sort de la ville.",
    acier: "L'intérêt d'une voiture électrique dépend de l'usage : excellent quand on recharge chez soi et qu'on roule surtout en ville, plus incertain quand les longs trajets dépendent de bornes rares ; le conseil doit donc partir des trajets réels de chaque client.",
    hors: "Il trouve que les voitures électriques coûtent trop cher à l'achat." },
  { id: "reunions", auteur: "Sofia, cheffe d'équipe",
    position: "Je voudrais supprimer la réunion d'équipe du vendredi. La moitié des points pourrait passer par écrit, et elle tombe au moment où chacun essaie de finir sa semaine.",
    fidele: "Elle veut supprimer la réunion du vendredi, parce qu'une bonne partie peut se faire par écrit et qu'elle tombe mal.",
    paille: "Elle veut supprimer toutes les réunions et faire tout par messages.",
    acier: "Une réunion ne se justifie que pour ce qui demande vraiment un échange : si la moitié des points du vendredi peuvent se traiter par écrit, il vaut mieux les traiter ainsi et libérer un créneau où chacun a besoin de se concentrer.",
    hors: "Elle trouve que l'équipe travaille trop le vendredi." },
  { id: "potager", auteur: "Bernard, jardinier amateur",
    position: "Je n'utilise plus d'engrais chimique dans mon potager. Le compost suffit pour les légumes que je fais pousser, et je n'ai pas vu de différence de récolte depuis trois ans.",
    fidele: "Il a remplacé l'engrais chimique par du compost dans son potager, sans constater de baisse de récolte en trois ans.",
    paille: "Il pense que les engrais chimiques sont du poison et que l'agriculture devrait s'en passer.",
    acier: "Pour un potager familial comme le sien, le compost apporte assez de nutriments : trois ans de récoltes comparables le suggèrent, même si une seule parcelle ne permet pas de généraliser à toutes les cultures.",
    hors: "Il pense que les légumes du marché sont moins bons que ceux du potager." },
  { id: "velo-ecole", auteur: "Nadia, mère d'élève",
    position: "J'aimerais que l'école organise des rangs à vélo le matin, encadrés par des parents. Beaucoup d'enfants habitent à moins de deux kilomètres, et les voitures devant l'école rendent le carrefour dangereux.",
    fidele: "Elle propose des trajets à vélo encadrés par des parents, parce que beaucoup d'enfants habitent près de l'école et que les voitures rendent le carrefour dangereux.",
    paille: "Elle veut interdire aux parents d'amener leurs enfants en voiture.",
    acier: "Pour des enfants qui habitent à moins de deux kilomètres, un trajet à vélo encadré est faisable et retire des voitures d'un carrefour dangereux ; l'encadrement par des adultes répond à la principale objection, la sécurité des enfants sur la route.",
    hors: "Elle trouve que les enfants ne font pas assez de sport à l'école." },
  { id: "lecture-ecran", auteur: "Yann, libraire",
    position: "Je ne dis pas que les liseuses sont mauvaises. Mais pour les longs textes difficiles, beaucoup de mes clients me disent mieux retenir sur papier, et j'ai la même impression.",
    fidele: "Il n'est pas contre les liseuses, mais lui et beaucoup de ses clients ont l'impression de mieux retenir les textes longs et difficiles sur papier.",
    paille: "Il pense que lire sur écran abîme la mémoire.",
    acier: "Pour les textes longs et exigeants, plusieurs lecteurs, dont lui, ont l'impression de mieux retenir sur papier ; c'est une raison de garder ce support pour ce type de lecture, en attendant des mesures plus solides que des impressions.",
    hors: "Il pense que les librairies sont menacées par la vente en ligne." },
  { id: "chien", auteur: "Inès, propriétaire d'un chien",
    position: "Je laisse mon chien sans laisse au parc seulement tôt le matin, quand il est presque vide. Il revient au rappel, et je le rattache dès qu'un enfant ou un autre chien arrive.",
    fidele: "Elle détache son chien au parc seulement quand il est presque vide, parce qu'il obéit au rappel, et le rattache dès que quelqu'un arrive.",
    paille: "Elle pense que les chiens devraient pouvoir courir librement partout.",
    acier: "Laisser un chien obéissant courir dans un parc vide ne fait courir de risque à personne, à condition de le rattacher dès que d'autres usagers arrivent : c'est ce qu'elle fait.",
    hors: "Elle trouve que le parc n'est pas assez entretenu." },
  { id: "fast-fashion", auteur: "Claire, couturière",
    position: "J'achète moins de vêtements qu'avant, mais de meilleure qualité. Une veste bien cousue dure dix ans ; trois vestes bon marché qui se déforment en un an finissent par coûter plus cher.",
    fidele: "Elle achète moins mais mieux, parce qu'un vêtement solide dure longtemps et revient finalement moins cher que plusieurs vêtements bon marché.",
    paille: "Elle pense que les gens qui achètent des vêtements bon marché gaspillent leur argent.",
    acier: "Sur la durée, un vêtement solide peut coûter moins cher que plusieurs vêtements fragiles ; c'est vrai pour qui peut avancer la somme et choisit des pièces qu'il portera longtemps.",
    hors: "Elle trouve que les vêtements sont mal taillés aujourd'hui." },
  { id: "sieste", auteur: "Paul, directeur d'une PME",
    position: "J'ai aménagé une salle de repos où chacun peut faire une sieste de vingt minutes après le déjeuner. Je n'oblige personne, mais plusieurs salariés disent être plus efficaces l'après-midi.",
    fidele: "Il propose, sans l'imposer, une salle pour une courte sieste, et plusieurs salariés s'en disent plus efficaces l'après-midi.",
    paille: "Il veut que ses salariés dorment au travail.",
    acier: "Offrir la possibilité d'une courte sieste, sans l'imposer, ne coûte presque rien et peut aider ceux qui sont fatigués l'après-midi ; les témoignages de ses salariés vont dans ce sens, même s'ils ne valent pas une mesure.",
    hors: "Il trouve que les pauses déjeuner sont trop courtes." },
  { id: "cantine-bio", auteur: "M. Diallo, cuisinier de cantine",
    position: "Je préfère acheter des légumes à des producteurs de la région, même s'ils ne sont pas tous bio. Ils sont cueillis plus mûrs, et je peux aller voir comment ils sont cultivés.",
    fidele: "Il privilégie les légumes de producteurs de la région, bio ou non, parce qu'ils sont plus mûrs et qu'il peut voir comment ils sont cultivés.",
    paille: "Il pense que le bio ne sert à rien.",
    acier: "Pour une cantine, la fraîcheur et la possibilité de vérifier soi-même les pratiques d'un producteur proche peuvent compter davantage qu'un label : c'est un choix de qualité, qui ne s'oppose pas au bio.",
    hors: "Il trouve que les enfants ne mangent pas assez de légumes." },
  { id: "jeux-video", auteur: "Amina, mère de deux enfants",
    position: "Mes enfants jouent aux jeux vidéo le week-end, une heure par jour. Je ne trouve pas ça mauvais en soi ; ce que je surveille, c'est que ça ne remplace ni le sommeil ni les amis.",
    fidele: "Elle autorise une heure de jeu par jour le week-end, sans juger les jeux mauvais, en veillant à ce qu'ils ne prennent pas la place du sommeil et des amis.",
    paille: "Elle laisse ses enfants jouer sans limite.",
    acier: "Le temps de jeu compte moins que ce qu'il remplace : une heure le week-end est raisonnable tant que le sommeil et la vie sociale ne sont pas sacrifiés, et c'est ce qu'il faut surveiller.",
    hors: "Elle trouve que les jeux vidéo sont trop chers." },
  { id: "marche-pied", auteur: "Léon, retraité",
    position: "Je fais mes courses à pied plutôt qu'en voiture quand c'est à moins d'un kilomètre. Ça me fait marcher, et je ne cherche plus de place pour me garer.",
    fidele: "Il fait à pied les courses à moins d'un kilomètre, pour marcher et éviter de chercher une place.",
    paille: "Il pense que la voiture est inutile en ville.",
    acier: "Pour des courses toutes proches, la marche est souvent plus simple que la voiture, une fois compté le temps de stationnement, et elle offre en plus une activité physique régulière.",
    hors: "Il trouve que les magasins de son quartier ferment trop tôt." },
  { id: "notes", auteur: "Hugo, professeur de collège",
    position: "En sixième, je remplace certaines notes par des appréciations détaillées. Les élèves lisent la note et ignorent le commentaire ; sans note, ils lisent enfin ce qu'il faut corriger.",
    fidele: "Il remplace certaines notes de sixième par des appréciations, parce que sans note les élèves lisent enfin les commentaires.",
    paille: "Il veut supprimer les notes à l'école.",
    acier: "Un commentaire ne sert que s'il est lu ; si la note détourne l'attention du commentaire, la retirer sur certains devoirs aide l'élève à savoir quoi corriger, sans renoncer à l'évaluer ailleurs.",
    hors: "Il trouve que les classes de sixième sont trop chargées." },
  { id: "voisins", auteur: "Mme Garnier, habitante d'un immeuble",
    position: "Je propose une boîte d'échange de livres dans le hall. Ça ne coûte rien, et plusieurs voisins m'ont dit avoir des cartons de livres qu'ils ne relisent pas.",
    fidele: "Elle propose une boîte d'échange de livres dans le hall, gratuite, parce que des voisins ont des livres dont ils ne se servent plus.",
    paille: "Elle veut transformer le hall en bibliothèque.",
    acier: "Une boîte d'échange ne coûte rien, donne une seconde vie aux livres que plusieurs voisins n'utilisent plus, et peut se retirer facilement si elle pose problème.",
    hors: "Elle trouve que le hall de l'immeuble est trop sombre." },
  { id: "transports", auteur: "Fatou, habitante d'un quartier périphérique",
    position: "Je voudrais un bus le dimanche dans notre quartier. Beaucoup d'habitants n'ont pas de voiture, et sans bus ils ne peuvent pas rendre visite à leur famille ce jour-là.",
    fidele: "Elle demande un bus le dimanche parce que beaucoup d'habitants sans voiture ne peuvent pas, sinon, voir leur famille ce jour-là.",
    paille: "Elle veut que les bus circulent partout à toute heure.",
    acier: "Le dimanche est le jour des visites familiales ; pour les habitants sans voiture, une seule ligne de bus fait la différence entre pouvoir y aller ou non, ce qui justifie une desserte même réduite.",
    hors: "Elle trouve que les bus de semaine sont souvent en retard." }
];

// ===================== Le débat à deux =====================
// Sujets peu clivants : deux camps, tirés au sort.

const SUJETS_DEBAT = [
  ["Faut-il faire ses courses une fois par semaine plutôt que plusieurs fois ?", "Une fois par semaine", "Plusieurs fois"],
  ["Vaut-il mieux partir en vacances en juillet ou en septembre ?", "En juillet", "En septembre"],
  ["Faut-il apprendre à cuisiner à l'école ?", "Oui, en cours obligatoire", "Non, c'est le rôle des familles"],
  ["Les livres valent-ils mieux en bibliothèque qu'achetés ?", "Emprunter", "Acheter"],
  ["Faut-il se lever tôt le week-end ?", "Oui", "Non"],
  ["Vaut-il mieux vivre en ville ou à la campagne ?", "En ville", "À la campagne"],
  ["Faut-il interdire les téléphones en classe ?", "Oui", "Non"],
  ["Le petit-déjeuner est-il indispensable ?", "Oui", "Non"],
  ["Faut-il préférer le train à l'avion pour les trajets de moins de cinq heures ?", "Le train", "Laisser le choix"],
  ["Vaut-il mieux avoir un chat ou un chien ?", "Un chat", "Un chien"],
  ["Faut-il tutoyer ses collègues ?", "Oui", "Non"],
  ["Faut-il regarder un film en version originale sous-titrée ?", "Version originale", "Version doublée"],
  ["Vaut-il mieux offrir un objet ou une expérience ?", "Un objet", "Une expérience"],
  ["Faut-il faire ses devoirs dès le retour de l'école ?", "Tout de suite", "Après une pause"],
  ["Vaut-il mieux lire le livre avant de voir le film ?", "Le livre d'abord", "Peu importe l'ordre"],
  ["Faut-il fêter son anniversaire en grand ?", "Oui", "Non"],
  ["Vaut-il mieux voyager seul ou en groupe ?", "Seul", "En groupe"],
  ["Faut-il réserver ses vacances longtemps à l'avance ?", "Oui", "Non, à la dernière minute"],
  ["Le sport en salle vaut-il le sport en plein air ?", "En salle", "En plein air"],
  ["Faut-il garder les enfants à la maison le mercredi ?", "Oui", "Non, activités extérieures"],
  ["Vaut-il mieux écrire à la main ou à l'ordinateur pour prendre des notes ?", "À la main", "À l'ordinateur"],
  ["Faut-il se fixer des bonnes résolutions au Nouvel An ?", "Oui", "Non"],
  ["Vaut-il mieux une grande fête ou un dîner entre proches ?", "Une grande fête", "Un dîner entre proches"],
  ["Faut-il apprendre une langue avec une application ?", "Oui", "Non, avec un cours"],
  ["Vaut-il mieux louer ou acheter son logement ?", "Louer", "Acheter"],
  ["Faut-il ranger sa chambre tous les jours ?", "Oui", "Non, une fois par semaine"],
  ["Les jeux de société valent-ils mieux que les jeux vidéo en famille ?", "Les jeux de société", "Les jeux vidéo"],
  ["Faut-il préférer les vacances actives aux vacances de repos ?", "Actives", "De repos"],
  ["Vaut-il mieux travailler en musique ou en silence ?", "En musique", "En silence"],
  ["Faut-il donner de l'argent de poche aux enfants ?", "Oui, chaque semaine", "Non, au cas par cas"]
];

// ===================== Outils =====================

// Section « Débattre », après « Raisonner », et son pictogramme : deux bulles de dialogue
SECTIONS_ATELIERS.splice(SECTIONS_ATELIERS.findIndex(s => s.id === "raisonner") + 1, 0,
  { id: "debattre", titre: "Débattre", intro: "Repérer un sophisme au fil d'un échange, réparer un argument, reformuler la position de l'autre : l'esprit critique en situation." });
PICTOS.bulles = '<path d="M4 8h26v16H16l-7 6v-6H4z" class="fond"/><path d="M4 8h26v16H16l-7 6v-6H4z"/><path d="M10 14h14M10 18.5h9"/><path d="M34 18h10v15h-4v6l-7-6H20v-5"/><path d="M26 28.5h12" class="pointille"/>';

const cleSophisme = id => "sophismes:" + id;
const ficheSophisme = id => INDEX.get(cleSophisme(id)).fiche;

// Quatre noms proposés pour une réplique fautive : la bonne réponse, sa voisine (champ distinction)
// et deux sophismes de la même catégorie
function optionsSophisme(id) {
  const fiche = ficheSophisme(id);
  const voisine = INDEX.get(fiche.distinction[0]);
  const exclues = new Set([cleSophisme(id), fiche.distinction[0]]);
  const memeCategorie = melanger(SOPHISMES.filter(f => f.categorie === fiche.categorie && !exclues.has(cleSophisme(f.id))));
  const autres = melanger(SOPHISMES.filter(f => !exclues.has(cleSophisme(f.id)) && f.categorie !== fiche.categorie));
  const leurres = [...memeCategorie, ...autres].slice(0, 2).map(f => ({ cle: cleSophisme(f.id), fiche: f, type: "sophismes" }));
  return melanger([{ cle: cleSophisme(id), fiche, type: "sophismes" }, { cle: fiche.distinction[0], fiche: voisine.fiche, type: voisine.type }, ...leurres]);
}

// Lien vers la fiche d'un sophisme
const lienSophisme = id => lienVers("#sophismes/" + id, ficheSophisme(id).nom);

// Réciproque de la fonction de répartition de la loi normale centrée réduite (Φ⁻¹),
// par l'approximation rationnelle de Peter Acklam (erreur relative inférieure à 1,15 × 10⁻⁹) :
// une fraction rationnelle au centre, une autre dans chaque queue (p < 0,02425 ou p > 0,97575).
function phiInverse(p) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const bas = 0.02425;
  if (p < bas) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - bas) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

// Sensibilité d′ de la théorie de la détection du signal, avec la correction de 0,5 (log-linéaire)
// qui évite les taux de 0 ou de 1 : H = (détections + 0,5) / (sophismes + 1), F = (fausses alertes + 0,5) / (recevables + 1)
function dPrime(detections, sophismes, faussesAlertes, recevables) {
  const h = (detections + 0.5) / (sophismes + 1), f = (faussesAlertes + 0.5) / (recevables + 1);
  return { d: phiInverse(h) - phiInverse(f), h, f };
}

// Une réplique de débat, avec son auteur
function blocReplique(r, classe) {
  const bloc = el("div", "replique" + (classe ? " " + classe : ""));
  bloc.append(el("span", "replique-qui", r.qui), el("p", classe ? null : "cas", r.texte));
  return bloc;
}

// Correction d'une réplique : verdict, explication et lien vers la fiche
function corrigerReplique(retour, r, verdict, juste) {
  retour.appendChild(el("p", "verdict " + (juste ? "juste" : "faux"), verdict));
  retour.appendChild(paragraphe(r.pourquoi));
  if (r.sophisme) {
    const l = el("div", "voir-aussi");
    l.appendChild(lienSophisme(r.sophisme));
    retour.appendChild(l);
  }
}

// ===================== Ateliers =====================

EXPERIENCES.push(
  // ---------------------------------------------------------------
  {
    id: "debat-truque",
    section: "debattre",
    picto: "bulles",
    couleur: "#a8432e",
    duree: "6 min",
    titre: "Le débat truqué",
    resume: "Un débat fictif, réplique par réplique : recevable ou sophisme ? Et lequel ? Attention aux fausses alertes : un ton vif ou une autorité compétente ne font pas un sophisme. " + DEBATS.length + " débats.",
    lancer(zone) {
      const debat = tirerNouveaux("debats", DEBATS, 1)[0];
      zone.innerHTML = "";
      derouler(zone, debat.repliques, (r, zone, fini) => {
        zone.appendChild(el("p", "consigne", debat.titre));
        zone.appendChild(paragraphe(debat.contexte, "source"));
        // Les deux répliques précédentes, pour suivre l'échange
        const k = debat.repliques.indexOf(r);
        debat.repliques.slice(Math.max(0, k - 2), k).forEach(p => zone.appendChild(blocReplique(p, "precedente")));
        zone.appendChild(blocReplique(r));
        const choix = [boutonChoix("Recevable", 0), boutonChoix("Sophisme", 1)];
        choix.forEach(b => zone.appendChild(b));
        const terminer = (resultat, verdict, juste) => {
          const retour = el("div", "retour-quiz");
          corrigerReplique(retour, r, verdict, juste);
          zone.appendChild(retour);
          fini(resultat, retour);
        };
        choix[0].addEventListener("click", () => {
          choix.forEach(b => { b.disabled = true; });
          choix[0].classList.add(r.sophisme ? "faux" : "juste");
          if (r.sophisme) choix[1].classList.add("juste");
          terminer({ sophisme: !!r.sophisme, alerte: false, nomme: false },
            r.sophisme ? "Sophisme manqué : " + ficheSophisme(r.sophisme).nom + "." : "Juste : réplique recevable.", !r.sophisme);
        });
        choix[1].addEventListener("click", () => {
          choix.forEach(b => { b.disabled = true; });
          if (!r.sophisme) {
            choix[1].classList.add("faux");
            choix[0].classList.add("juste");
            terminer({ sophisme: false, alerte: true, nomme: false }, "Fausse alerte : cette réplique est recevable.", false);
            return;
          }
          choix[1].classList.add("juste");
          zone.appendChild(el("p", "consigne", "Lequel ?"));
          const options = optionsSophisme(r.sophisme);
          const boutons = options.map((o, i) => {
            const b = boutonChoix(o.fiche.nom, i);
            b.addEventListener("click", () => {
              boutons.forEach(x => { x.disabled = true; });
              const nomme = o.cle === cleSophisme(r.sophisme);
              boutons[options.findIndex(x => x.cle === cleSophisme(r.sophisme))].classList.add("juste");
              if (!nomme) b.classList.add("faux");
              terminer({ sophisme: true, alerte: true, nomme }, nomme ? "Juste : " + ficheSophisme(r.sophisme).nom + "." : "Sophisme repéré, mais il s'agit de : " + ficheSophisme(r.sophisme).nom + ".", nomme);
            });
            zone.appendChild(b);
            return b;
          });
        });
      }, resultats => {
        const sophismes = resultats.filter(x => x.sophisme).length, recevables = resultats.length - sophismes;
        const detections = resultats.filter(x => x.sophisme && x.alerte).length;
        const nommes = resultats.filter(x => x.nomme).length;
        const fausses = resultats.filter(x => !x.sophisme && x.alerte).length;
        const justes = resultats.filter(x => x.sophisme === x.alerte).length;
        const { d } = dPrime(detections, sophismes, fausses, recevables);
        const historique = lire("debats", []);
        historique.push({ j: aujourdHui(), d: Number(d.toFixed(2)), det: detections, s: sophismes, fa: fausses, r: recevables });
        ecrire("debats", historique.slice(-30));
        afficherScore(zone, "debat-truque", justes, resultats.length);
        const liste = el("ul", "liste-simple");
        liste.append(el("li", null, "Sophismes repérés : " + detections + " sur " + sophismes + (detections ? ", dont " + nommes + " bien nommé" + (nommes > 1 ? "s" : "") : "")),
          el("li", null, "Fausses alertes : " + fausses + " sur " + recevables + " répliques recevables"),
          el("li", null, "Sensibilité d′ = " + fr(Number(d.toFixed(2)))));
        zone.appendChild(liste);
        zone.appendChild(paragraphe("Le d′ mesure votre capacité à distinguer les sophismes des répliques recevables, indépendamment de votre tendance à crier au sophisme : 0 correspond au hasard, 1 à une distinction nette, 2 ou plus à une très bonne distinction. Avec douze répliques, la mesure reste approximative.", "source"));
        const { h, f } = dPrime(detections, sophismes, fausses, recevables);
        const z = x => fr(Number(x.toFixed(2)));
        zone.appendChild(calculEnDetail([
          "Taux de détection H et taux de fausses alertes F, avec une correction de 0,5 qui évite les taux de 0 ou de 1 :",
          "= H = (détections + 0,5) / (sophismes + 1) = (" + detections + " + 0,5) / (" + sophismes + " + 1) = " + z(h),
          "= F = (fausses alertes + 0,5) / (recevables + 1) = (" + fausses + " + 0,5) / (" + recevables + " + 1) = " + z(f),
          "On convertit chaque taux en écart à la moyenne d'une loi normale (Φ⁻¹, la réciproque de sa fonction de répartition), puis on fait la différence :",
          "= d′ = Φ⁻¹(H) − Φ⁻¹(F) = " + z(phiInverse(h)) + " − (" + z(phiInverse(f)) + ") = " + z(d),
          "Répondre « sophisme » à tout ferait monter H, mais aussi F : le d′ ne bougerait guère. Seule une meilleure distinction le fait monter."
        ]));
        ajouterExplication(zone, "Repérer sans tout soupçonner", [
          "On peut apprendre à reconnaître des techniques de manipulation : après de courtes vidéos présentant cinq d'entre elles (langage émotionnel, incohérence, faux dilemme, bouc émissaire, attaque personnelle), des participants les repéraient mieux, avec des effets de 0,28 à 0,68 écart-type en laboratoire, et d'environ 5 % lors d'un essai sur YouTube (Roozenbeek et al., Science Advances, 2022).",
          "Mais un entraînement peut aussi rendre méfiant envers tout. En réanalysant deux jeux de ce type avec les outils de la détection du signal, Modirrousta-Galian et Higham (2023) concluent qu'ils font surtout répondre « faux » plus souvent, sans mieux distinguer le vrai du faux ; ce résultat est discuté. D'où le décompte séparé des fausses alertes, et le d′, qui en tient compte.",
          "Un ton vif, une affirmation discutable ou l'avis d'un expert compétent ne sont pas des sophismes. Et une conclusion n'est pas fausse parce qu'elle a été mal défendue."
        ], [["#sophismes/sophisme-sophisme", "Sophisme du sophisme"], ["#guide/debattre", "Débattre honnêtement"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "debat-truque").lancer(zone), "Un autre débat");
      }, "Réplique");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "reparer",
    section: "debattre",
    picto: "bulles",
    couleur: "#3d6b4f",
    duree: "5 min",
    titre: "Réparer l'argument",
    resume: "Dénoncer un sophisme ne suffit pas. Parmi quatre réécritures, trouvez celle qui garde la conclusion et corrige le raisonnement. " + REPARATIONS.length + " arguments, dix par partie.",
    lancer(zone) {
      const LIBELLES = {
        rep: "Réparation",
        autre: "Autre sophisme",
        acc: "Simple accusation",
        concl: "Changement de conclusion"
      };
      derouler(zone, tirerNouveaux("reparer", REPARATIONS, 10, x => x.id || x.s), (x, zone, fini) => {
        zone.appendChild(el("p", "consigne", "Cet argument commet un sophisme : " + ficheSophisme(x.s).nom.toLowerCase()));
        zone.appendChild(el("p", "cas", x.arg));
        zone.appendChild(el("p", "consigne", "Quelle réécriture le répare ?"));
        const options = melanger([["rep", x.rep[0]], ["autre", x.autre[0]], ["acc", x.acc], ["concl", x.concl]]);
        const boutons = options.map(([type, texte], i) => {
          const b = boutonChoix(texte, i);
          b.addEventListener("click", () => {
            boutons.forEach(y => { y.disabled = true; });
            boutons[options.findIndex(([t]) => t === "rep")].classList.add("juste");
            if (type !== "rep") b.classList.add("faux");
            const retour = el("div", "retour-quiz");
            retour.appendChild(el("p", "verdict " + (type === "rep" ? "juste" : "faux"), type === "rep" ? "Juste." : "Ce n'est pas une réparation."));
            const explications = {
              rep: x.rep[1],
              autre: "Garde la conclusion, mais commet un autre sophisme : " + ficheSophisme(x.autre[1]).nom.toLowerCase() + ". " + ficheSophisme(x.autre[1]).definition,
              acc: "Dénoncer le sophisme ne fournit aucune raison, ni pour la conclusion ni contre elle : l'argument n'est pas réparé.",
              concl: "Évite le défaut en renonçant à ce que l'argument voulait établir : ce n'est plus le même argument."
            };
            const liste = el("ul", "liste-simple");
            ["rep", "autre", "acc", "concl"].forEach(t => {
              const li = el("li");
              li.append(el("strong", null, LIBELLES[t] + " : "), texteNoeud(explications[t]));
              liste.appendChild(li);
            });
            retour.appendChild(liste);
            const l = el("div", "voir-aussi");
            l.appendChild(lienSophisme(x.s));
            if (x.autre[1] !== x.s) l.appendChild(lienSophisme(x.autre[1]));
            retour.appendChild(l);
            zone.appendChild(retour);
            fini(type === "rep", retour);
          });
          zone.appendChild(b);
          return b;
        });
      }, resultats => {
        afficherScore(zone, "reparer", resultats.filter(Boolean).length, resultats.length);
        ajouterExplication(zone, "Critiquer, puis reconstruire", [
          "Repérer un sophisme montre qu'un argument ne prouve pas sa conclusion ; cela ne montre pas que la conclusion est fausse. Pour savoir ce qu'elle vaut, il faut chercher de meilleures raisons, pour ou contre.",
          "Une réparation garde la conclusion et lui donne un appui légitime : un fait vérifiable, une comparaison, une mesure, ou une prémisse qui rend le raisonnement valide. Quand aucun appui n'existe, la conclusion honnête est souvent plus modeste, et il faut le reconnaître."
        ], [["#sophismes/sophisme-sophisme", "Sophisme du sophisme"], ["#guide/methode", "Examiner une affirmation"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "reparer").lancer(zone));
      }, "Argument");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "reformuler",
    section: "debattre",
    picto: "bulles",
    couleur: "#2f6db5",
    duree: "5 min",
    titre: "Reformuler sans trahir",
    resume: "Avant de critiquer une position, savoir la redire : trouvez la reformulation fidèle, puis la version la plus forte que son auteur accepterait encore. " + REFORMULATIONS.length + " positions.",
    lancer(zone) {
      const TYPES_REFORMULATION = {
        fidele: ["Fidèle", "Elle dit ce que l'auteur a dit, ni plus ni moins."],
        paille: ["Homme de paille", "Elle déforme la position en la rendant plus extrême ou plus faible : facile à réfuter, mais ce n'est plus la sienne."],
        acier: ["Homme d'acier", "Elle garde la position et la renforce : meilleures raisons, limites assumées, objections prévues. L'auteur l'accepterait, et c'est elle qu'il faut discuter."],
        hors: ["Hors sujet", "Elle parle d'autre chose que de la position exprimée."]
      };
      derouler(zone, tirerNouveaux("reformuler", REFORMULATIONS, 5), (x, zone, fini) => {
        zone.appendChild(el("p", "consigne", x.auteur));
        zone.appendChild(el("p", "cas", "« " + x.position + " »"));
        const options = melanger(["fidele", "paille", "acier", "hors"]);
        let points = 0;
        const etape = (question, attendu, suite) => {
          zone.appendChild(el("p", "consigne", question));
          const boutons = options.map((t, i) => {
            const b = boutonChoix(x[t], i);
            b.addEventListener("click", () => {
              boutons.forEach(y => { y.disabled = true; });
              boutons[options.indexOf(attendu)].classList.add("juste");
              if (t !== attendu) b.classList.add("faux");
              else points++;
              const retour = el("div", "retour-quiz");
              retour.appendChild(el("p", "verdict " + (t === attendu ? "juste" : "faux"), (t === attendu ? "Juste : " : "Réponse : ") + TYPES_REFORMULATION[attendu][0].toLowerCase() + "."));
              retour.appendChild(paragraphe(TYPES_REFORMULATION[attendu][1]));
              if (t !== attendu) retour.appendChild(paragraphe("Votre choix : " + TYPES_REFORMULATION[t][0].toLowerCase() + ". " + TYPES_REFORMULATION[t][1], "source"));
              zone.appendChild(retour);
              suite(retour);
            });
            zone.appendChild(b);
            return b;
          });
        };
        etape("Quelle reformulation est fidèle ?", "fidele", retour => {
          const continuer = el("button", "bouton", "Deuxième question");
          continuer.dataset.suivant = "1";
          continuer.style.marginTop = "12px";
          continuer.addEventListener("click", () => {
            continuer.remove();
            etape("Quelle version est la plus forte que l'auteur accepterait encore ?", "acier", retour2 => fini(points, retour2));
          });
          retour.appendChild(continuer);
          montrer(retour);
        });
      }, resultats => {
        afficherScore(zone, "reformuler", resultats.reduce((a, b) => a + b, 0), 2 * resultats.length);
        ajouterExplication(zone, "Redire avant de répondre", [
          "Les règles de Rapoport, rapportées par Daniel Dennett, commencent par là : reformuler la position de l'autre si clairement qu'il dise « je n'aurais pas dit mieux ». On répond alors à ce qu'il pense vraiment, et il est plus disposé à écouter.",
          "L'homme d'acier va plus loin : discuter la meilleure version d'une position. Si elle résiste, on a appris quelque chose ; si elle tombe, la critique est solide."
        ], [["#guide/debattre", "Débattre honnêtement (règles de Rapoport)"], ["#sophismes/homme-de-paille", "Homme de paille"]]);
        boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "reformuler").lancer(zone));
      }, "Position");
    }
  },
  // ---------------------------------------------------------------
  {
    id: "debat-a-deux",
    section: "debattre",
    picto: "bulles",
    couleur: "#8a3f8f",
    duree: "15 min",
    titre: "Le débat à deux",
    resume: "Sur un seul téléphone, pour deux personnes : un sujet et des camps tirés au sort, des temps de parole minutés, des reformulations à faire valider, puis chacun défend l'autre camp.",
    lancer(zone) {
      zone.innerHTML = "";
      let minuteur = null;
      const arreter = () => { if (minuteur) clearInterval(minuteur); minuteur = null; };
      zone.appendChild(paragraphe("Posez le téléphone entre vous. Deux personnes, A et B ; le site tire le sujet et les camps, puis vous guide étape par étape. Pas de score : le but est de se comprendre."));
      const ligne = el("div", "ligne");
      const noms = ["A", "B"].map(lettre => {
        const champ = el("input", "champ");
        champ.placeholder = "Prénom de " + lettre;
        champ.setAttribute("aria-label", "Prénom de la personne " + lettre);
        ligne.appendChild(champ);
        return champ;
      });
      zone.appendChild(ligne);
      const tirer = el("button", "bouton large", "Tirer un sujet");
      tirer.dataset.valider = "1";
      zone.appendChild(tirer);
      tirer.addEventListener("click", () => {
        const [sujet, campA, campB] = melanger(SUJETS_DEBAT)[0];
        const [pourA, pourB] = Math.random() < 0.5 ? [campA, campB] : [campB, campA];
        const a = noms[0].value.trim() || "A", b = noms[1].value.trim() || "B";
        const etapes = [
          [a + " défend sa position", 90, a + " défend « " + pourA + " ». " + b + " écoute sans interrompre."],
          [b + " reformule", 0, b + " redit la position de " + a + " avec ses propres mots, jusqu'à ce que " + a + " confirme."],
          [b + " défend sa position", 90, b + " défend « " + pourB + " ». " + a + " écoute sans interrompre."],
          [a + " reformule", 0, a + " redit la position de " + b + " avec ses propres mots, jusqu'à ce que " + b + " confirme."],
          [a + " défend l'autre camp", 60, a + " défend maintenant « " + pourB + " », du mieux possible."],
          [b + " défend l'autre camp", 60, b + " défend maintenant « " + pourA + " », du mieux possible."],
          ["Points d'accord", 0, "Ensemble, notez les points sur lesquels vous êtes d'accord."]
        ];
        let i = 0;
        const afficher = () => {
          arreter();
          zone.innerHTML = "";
          if (i >= etapes.length) return bilan();
          entete(zone, i + 1, etapes.length, "Étape");
          zone.appendChild(el("p", "consigne", sujet));
          const [titre, duree, consigne] = etapes[i];
          zone.appendChild(el("h3", "titre-etape", titre));
          zone.appendChild(el("p", "cas", consigne));
          const suivant = el("button", "bouton", i === etapes.length - 1 ? "Terminer" : "Étape suivante");
          suivant.dataset.suivant = "1";
          suivant.addEventListener("click", () => { i++; afficher(); remonter(); });
          if (duree) {
            let reste = duree, enPause = true;
            const affichage = el("p", "minuteur", "");
            const maj = () => { affichage.textContent = Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0"); affichage.classList.toggle("fini", reste === 0); };
            maj();
            const pause = el("button", "bouton secondaire", "Démarrer");
            pause.addEventListener("click", () => {
              enPause = !enPause;
              pause.textContent = enPause ? "Reprendre" : "Pause";
              if (enPause) arreter();
              else minuteur = setInterval(() => {
                if (!affichage.isConnected) return arreter();
                reste = Math.max(0, reste - 1);
                maj();
                if (reste === 0) { arreter(); pause.disabled = true; pause.textContent = "Temps écoulé"; }
              }, 1000);
            });
            const actions = el("div", "actions");
            actions.append(pause, suivant);
            zone.append(affichage, actions);
          } else if (titre === "Points d'accord") {
            const liste = el("ul", "liste-simple accords");
            const champ = el("input", "champ");
            champ.placeholder = "Un point d'accord";
            champ.setAttribute("aria-label", "Un point d'accord");
            const ajouter = el("button", "bouton secondaire", "Ajouter");
            ajouter.dataset.valider = "1";
            ajouter.addEventListener("click", () => {
              if (!champ.value.trim()) return champ.focus();
              liste.appendChild(el("li", null, champ.value.trim()));
              champ.value = "";
              champ.focus();
            });
            const l = el("div", "ligne");
            l.append(champ, ajouter);
            zone.append(l, liste, suivant);
          } else {
            const qui = consigne.split(" redit")[0], auteur = i === 1 ? a : b;
            const oui = el("button", "bouton", "Oui, c'est ça");
            oui.addEventListener("click", () => { oui.disabled = true; oui.textContent = auteur + " confirme"; zone.appendChild(suivant); });
            zone.appendChild(paragraphe("Quand " + auteur + " se reconnaît dans la reformulation de " + qui + ", " + auteur + " touche :", "source"));
            zone.appendChild(oui);
          }
          zone.appendChild(paragraphe("Pour comprendre ce que l'autre pense, demandez-le-lui plutôt que de le deviner : dans 25 expériences, se mettre à la place d'autrui n'a pas rendu plus juste le jugement porté sur ses pensées, alors que le lui demander, si (Eyal, Steffel et Epley, 2018).", "source"));
        };
        const bilan = () => {
          noterPartie("debat-a-deux");
          zone.appendChild(el("p", "consigne", "Pour finir"));
          zone.appendChild(el("h3", null, "Avons-nous commis un sophisme ?"));
          zone.appendChild(paragraphe("Repassez l'échange ensemble. Si l'un de ces sophismes vous dit quelque chose, ouvrez la fiche : sans reproche, c'est ainsi qu'on s'améliore."));
          CATEGORIES_SOPHISMES.forEach(c => {
            const bloc = el("div", "voir-aussi");
            bloc.style.margin = "4px 0 10px";
            SOPHISMES.filter(f => f.categorie === c.nom).forEach(f => bloc.appendChild(lienSophisme(f.id)));
            zone.append(el("p", "consigne", c.nom), bloc);
          });
          ajouterExplication(zone, "Pourquoi ces étapes", [
            "Reformuler jusqu'à ce que l'autre se reconnaisse oblige à écouter ; défendre l'autre camp fait découvrir ses meilleures raisons. Ce sont les deux premières règles de Rapoport, rapportées par Daniel Dennett.",
            "Demander à l'autre ce qu'il pense, plutôt que l'imaginer, est la seule méthode qui a amélioré la compréhension d'autrui dans les expériences d'Eyal, Steffel et Epley (2018)."
          ], [["#guide/debattre", "Débattre honnêtement"]]);
          boutonRejouer(zone, () => EXPERIENCES.find(e => e.id === "debat-a-deux").lancer(zone), "Un autre sujet");
        };
        afficher();
      });
    }
  }
);

// Ateliers à éprouver depuis les fiches : chaque sophisme a une réplique de débat et un exercice de réparation
SOPHISMES.forEach(f => {
  const cle = cleSophisme(f.id);
  ATELIERS_DES_FICHES[cle] = [...new Set([...(ATELIERS_DES_FICHES[cle] || []), "#tests/debat-truque", "#tests/reparer"])];
});
ATELIERS_DES_FICHES["sophismes:homme-de-paille"].push("#tests/reformuler");

// ===================== S'entraîner, sur les fiches de sophismes =====================
// Trois mini-exercices tirés des débats et des réparations (jamais des situations cas et cas2,
// réservées au quiz). Renvoie null si la fiche n'a pas de contenu.

function entrainementFiche(type, fiche) {
  if (type !== "sophismes") return null;
  const repliques = DEBATS.flatMap(d => d.repliques.filter(r => r.sophisme === fiche.id).map(r => ({ r, d })));
  const reparation = REPARATIONS.find(x => x.s === fiche.id);
  const voisine = fiche.distinction && INDEX.get(fiche.distinction[0]);
  const repliqueVoisine = voisine && voisine.type === "sophismes"
    ? DEBATS.flatMap(d => d.repliques.filter(r => r.sophisme === voisine.fiche.id).map(r => ({ r, d })))[0] : null;
  if (!repliques.length && !reparation) return null;
  const bloc = el("div", "entrainement");

  // 1. Une réplique de débat : recevable ou sophisme ?
  if (repliques.length) {
    const { r, d } = repliques[0];
    const ex = el("div", "exercice");
    ex.append(el("p", "consigne", "Dans un débat : " + d.titre.toLowerCase()), blocReplique(r, "replique-fiche"));
    const choix = [boutonChoix("Recevable", 0), boutonChoix("Sophisme", 1)];
    choix.forEach((b, k) => {
      b.addEventListener("click", () => {
        choix.forEach(x => { x.disabled = true; });
        choix[1].classList.add("juste");
        if (k === 0) choix[0].classList.add("faux");
        const retour = el("div", "retour-quiz");
        corrigerReplique(retour, r, k === 1 ? "Juste : c'est un exemple de ce sophisme." : "Non : c'est un exemple de ce sophisme.", k === 1);
        ex.appendChild(retour);
      });
      ex.appendChild(b);
    });
    bloc.appendChild(ex);
  }

  // 2. Réparer l'argument
  if (reparation) {
    const ex = el("div", "exercice");
    ex.append(el("p", "consigne", "Réparer l'argument"), el("p", "replique-fiche-texte", reparation.arg));
    const options = melanger([["rep", reparation.rep[0]], ["autre", reparation.autre[0]], ["acc", reparation.acc], ["concl", reparation.concl]]);
    const boutons = options.map(([t, texte], i) => {
      const b = boutonChoix(texte, i);
      b.addEventListener("click", () => {
        boutons.forEach(x => { x.disabled = true; });
        boutons[options.findIndex(([u]) => u === "rep")].classList.add("juste");
        if (t !== "rep") b.classList.add("faux");
        const retour = el("div", "retour-quiz");
        retour.appendChild(el("p", "verdict " + (t === "rep" ? "juste" : "faux"), t === "rep" ? "Juste." : "La réparation est la réponse en vert."));
        retour.appendChild(paragraphe(reparation.rep[1]));
        ex.appendChild(retour);
      });
      ex.appendChild(b);
      return b;
    });
    bloc.appendChild(ex);
  }

  // 3. Duel avec la notion voisine, à partir d'une réplique de débat
  if (repliqueVoisine && repliques.length) {
    // L'une des deux répliques, au hasard : celle de ce sophisme ou celle de sa voisine
    const cible = melanger([{ r: repliques[0].r, f: fiche }, { r: repliqueVoisine.r, f: voisine.fiche }])[0];
    const ex = el("div", "exercice");
    ex.append(el("p", "consigne", "Notion voisine : laquelle des deux ?"), blocReplique(cible.r, "replique-fiche"));
    const noms = melanger([fiche, voisine.fiche]);
    const boutons = noms.map((f, i) => {
      const b = boutonChoix(f.nom, i);
      b.addEventListener("click", () => {
        boutons.forEach(z => { z.disabled = true; });
        boutons[noms.indexOf(cible.f)].classList.add("juste");
        if (f !== cible.f) b.classList.add("faux");
        const retour = el("div", "retour-quiz");
        retour.appendChild(el("p", "verdict " + (f === cible.f ? "juste" : "faux"), (f === cible.f ? "Juste : " : "Réponse : ") + cible.f.nom + "."));
        retour.appendChild(paragraphe(cible.r.pourquoi));
        const p = el("p", "distinction");
        p.append(el("strong", null, "Ce qui les distingue : "), texteNoeud(fiche.distinction[1]));
        retour.appendChild(p);
        ex.appendChild(retour);
      });
      ex.appendChild(b);
      return b;
    });
    bloc.appendChild(ex);
  }
  return bloc;
}
