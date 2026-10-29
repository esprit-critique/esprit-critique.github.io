# Situations exclues du mode « Notions proches »

Le mode « Notions proches » du quiz présente une situation d'une fiche X (champ `cas` ou `cas2`) et deux réponses :
X et la notion de son champ `distinction`. Une situation qui convient aussi à cette voisine rend le duel injuste.

J'ai relu les 180 situations (90 fiches × 2). Les 14 situations ci-dessous sont exclues du mode, par la liste
`SITUATIONS_DOUTEUSES` d'`app.js`. Elles restent utilisées par le quiz ordinaire, où la voisine n'est jamais
proposée comme mauvaise réponse. **Aucune situation de `donnees.js` n'a été modifiée** : les réécritures
proposées attendent ton accord. Une fois une situation réécrite, il suffit de retirer sa ligne de la liste.

Notation : `cas` = première situation, `cas2` = seconde.

## Notions emboîtées (la voisine est une catégorie plus large)

La fiche elle-même dit que X est une forme particulière de sa voisine : choisir la voisine n'est donc pas faux.

| Situation | Voisine | Raison |
|---|---|---|
| `biais:procureur` cas et cas2 | Négligence du taux de base | « le sophisme du procureur en est la forme judiciaire » : toute situation du procureur néglige aussi le taux de base. |
| `biais:planification` cas et cas2 | Biais d'optimisme | « une forme d'optimisme appliquée aux délais et aux coûts ». |
| `sophismes:tu-quoque` cas et cas2 | Attaque personnelle | « une forme particulière d'attaque personnelle ». |

Proposition : garder ces situations hors du mode. Pour ces paires, un duel n'a de sens que dans l'autre sens
(une situation d'attaque personnelle qui n'est pas un « toi aussi », par exemple), ce qui est déjà le cas.

## Situations qui débordent sur la voisine

| Situation | Voisine | Problème | Réécriture proposée |
|---|---|---|---|
| `biais:taux-de-base` cas2 (le taxi) | Sophisme du procureur | C'est un juge qui conclut, au sujet d'un accident : la forme judiciaire, donc aussi le procureur. | Remplacer « Le juge en conclut » par « Une compagnie d'assurance en conclut », et « impliqué dans un accident » par « impliqué dans un accrochage déclaré à l'assurance ». |
| `biais:regression-moyenne` cas (le manager) | Post hoc | Le manager attribue l'amélioration aux reproches qui l'ont précédée : c'est aussi un post hoc. | « Un manager prévoit que les dix meilleurs commerciaux du mois feront aussi bien le mois suivant, et fixe leurs objectifs en conséquence. Le mois suivant, la plupart ont des résultats plus proches de la moyenne, et il s'étonne qu'ils se soient relâchés. » |
| `biais:regression-moyenne` cas2 (les radars) | Post hoc | « attribue toute la baisse aux radars » : succession prise pour cause, donc post hoc. | « Un club recrute l'attaquant qui a marqué le plus de buts la saison précédente, en comptant sur le même total. La saison suivante, il marque nettement moins, sans blessure ni changement de poste. » |
| `biais:taille-echantillon` cas2 (le restaurant) | Généralisation hâtive | Choisir sur la foi de trois avis revient aussi à généraliser à partir de trois cas. | « Dans un classement des hôpitaux, les dix meilleurs taux de guérison et les dix plus mauvais appartiennent presque tous à de petits établissements. Un journal en conclut que les petits hôpitaux sont soit excellents, soit dangereux. » |
| `biais:ikea` cas (les origamis) | Effet de dotation | Les participants possèdent aussi leurs origamis : la simple possession pourrait suffire à expliquer l'écart avec les observateurs. | Préciser la comparaison : « … leur attribuent bien plus de valeur que d'autres participants à qui l'on a simplement donné des origamis identiques, pliés par quelqu'un d'autre. » |
| `biais:negativite` cas (le site d'information) | Heuristique de disponibilité | La dernière phrase (« ses lecteurs finissent par croire que la situation se dégrade ») décrit une estimation de fréquence faussée par les souvenirs disponibles. | Supprimer la dernière phrase ; terminer par « … et en publie de plus en plus. » |
| `biais:illusion-controle` cas (le loto) | Erreur du joueur | Les numéros « qui sortent souvent » relèvent d'une croyance sur les tirages, pas sur le contrôle. | Remplacer « en combinant dates de naissance et numéros "qui sortent souvent" » par « à partir des dates de naissance de ses proches ». |
| `sophismes:emotion` cas (la note) | Appel aux conséquences | L'étudiant invoque les conséquences d'une note basse pour la faire changer : c'est aussi un appel aux conséquences. | « Pour défendre son projet devant le jury, une étudiante raconte longuement les sacrifices de ses parents et ses nuits blanches, sans répondre aux critiques sur sa méthode. » |

## Paires relues sans réserve

Les 166 autres situations ne conviennent qu'à leur fiche, au vu du texte « Ne pas confondre » de chacune.
Quelques cas limites ont été gardés parce que la distinction de la fiche tranche explicitement :
ancrage et veste barrée, statu quo et inscription automatique, raisonnement motivé et supporters,
juste milieu et vaccin, tireur d'élite et Lincoln-Kennedy.
