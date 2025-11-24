# 🪶 Spécifications Détaillées du Projet : Mustachio

[cite_start]**Objectif :** Développer **Mustachio**, un jeu de société numérique multijoueur (3-20 joueurs) pour mobile, basé sur un jeu de cartes et des mini-jeux à boire[cite: 1]. [cite_start]L'expérience utilisateur (UX) doit être fluide, moderne, et visuellement attrayante (style cartoon)[cite: 2, 13].

---

## 🎯 Vue d'Ensemble & Exigences Générales

| Catégorie | Détails | Source |
| :--- | :--- | :--- |
| **Plateformes** | [cite_start]Android et iOS [cite: 1] [cite_start]| [cite: 1] |
| **Joueurs** | [cite_start]3 à 20 joueurs [cite: 1] [cite_start]| [cite: 1] |
| **Type de Jeu** | [cite_start]Jeu de cartes (52 cartes) tour par tour, chaque carte lance un mini-jeu[cite: 1]. [cite_start]| [cite: 1] |
| **Technologie** | [cite_start]Libre choix (gratuit), aucune limitation[cite: 10]. [cite_start]**Firebase** sera utilisé pour le multijoueur[cite: 1]. [cite_start]| [cite: 1, 10] |
| **Design** | [cite_start]Style **cartoon** pour l'effet jeu vidéo de société fun[cite: 13]. [cite_start]| [cite: 13] |
| **UX** | [cite_start]Apparence moderne, animation, transition, écran de chargement, design[cite: 2]. [cite_start]Le jeu devra être fluide, donc pas trop de clics utilisateurs et pas d'informations superflues[cite: 2]. [cite_start]| [cite: 2] |
| **Code** | [cite_start]Le code devra être propre et organisé, soutenable par la suite, séparation des fonctionnalités, etc.[cite: 12]. [cite_start]| [cite: 12] |
| **Gorgées** | [cite_start]L'hôte peut choisir le nombre de gorgées pour chaque jeu via un petit menu de paramètre[cite: 8]. [cite_start]| [cite: 8] |

---

## 👥 Gestion des Joueurs ("Moustachus")

* [cite_start]**Dénomination :** Les joueurs sont appelés les **"Moustachus"**[cite: 6].
* [cite_start]**Identification :** Chaque joueur est représenté par un **nom** (rentré par l'utilisateur lors du join ou de l'host) [cite: 5] [cite_start]et une **couleur**[cite: 5].
* [cite_start]**Couleur :** Choisie aléatoirement parmi 20 couleurs[cite: 5].
* [cite_start]**Affichage :** Le joueur actuel est appelé **"Moustachu actuel"**[cite: 6]. [cite_start]Il y aura un design et une moustache de la couleur du joueur[cite: 6].
* [cite_start]**Mini-jeux :** Chaque mini-jeu aura un logo assigné[cite: 12].

---

## [cite_start]🛠️ Parcours Utilisateur (Flow) [cite: 11, 12]

1.  [cite_start]**Lancement de l'App** $\rightarrow$ Écran de chargement stylisé[cite: 11].
2.  [cite_start]**Menu d'Accueil** $\rightarrow$ Boutons **"Créer une Table"** et **"Rejoindre une Table"**[cite: 11].

### [cite_start]Création de Partie (Hôte) [cite: 11]
* [cite_start]Clique sur "Créer une Table" $\rightarrow$ Demande de **Nom d'utilisateur** et du **Nombre de joueur**[cite: 11].
* [cite_start]Bouton **"Créér la Table"**[cite: 11].
* [cite_start]**Écran d'Attente :** Affichage du **Code de la Table** et de la **Liste de Joueur** présent[cite: 11].
* [cite_start]Boutons : **"Démarrer la Partie"**, **"Fermer la Table"**, et **"Paramètre"** pour les gorgées par jeu [cite: 11, 8] (certains jeux auront plusieurs paramètres car plusieurs sanctions, etc.) [cite_start][cite: 11].

### [cite_start]Rejoindre une Partie (Invité) [cite: 11, 12]
* [cite_start]Clique sur "Rejoindre une Table" $\rightarrow$ Soit par **code** ou dans une **liste des Tables disponible**[cite: 11, 12].
* [cite_start]Demande de **Nom d'utilisateur**[cite: 12].
* [cite_start]**Écran d'Attente :** Affichage du **Code de la Table** et de la **Liste de Joueur**[cite: 12].
* [cite_start]Message : **"en attente de l'hote pour demarrer"**[cite: 12].
* [cite_start]L'invité n'a **pas accès au paramètre**[cite: 12].

### Déroulement de Partie
* [cite_start]Une fois la partie démarrée, le premier joueur tire une carte (tirée aléatoirement comme pour un vrai paquet) et le premier jeu commence[cite: 12].
* [cite_start]**Multijoueur :** La plus part des actions dans le jeu seront vues par tous les utilisateurs [cite: 3][cite_start], sauf certains jeux, où chaque joueur a un écran différent[cite: 3].
* [cite_start]**Rejoindre en Cours :** Si on rejoins une partie en cours, on est dans un écran de chargement jusqu'à ce que le mini-jeu en cours soit terminé pour ne pas provoquer de bug[cite: 7].
* [cite_start]**Cartes de Jeu :** Les jeux qui nécessitent des cartes ne prennent pas les cartes dans le jeu de carte principales[cite: 9].

---

## 🃏 Liste Complète des Mini-Jeux et Règles

### A. ORAL GAME

| Carte | Nom du Jeu | Règles Détaillées | Source |
| :---: | :--- | :--- | :--- |
| **1** | **Roi du cercle** | [cite_start]Le joueur actuel invente une **nouvelle règle**[cite: 13]. [cite_start]La règle est valable jusqu'au prochain as[cite: 13]. [cite_start]**(only rules)** [cite: 13] [cite_start]| [cite: 13] |
| **3** | **Le 3-3-3** | [cite_start]Le joueur **précédent** du joueur actif choisit un **thème** à l'oral puis lance le chrono[cite: 14]. [cite_start]Le joueur doit trouver **trois choses** qui match avec le thème en **3 secondes**[cite: 14]. [cite_start]**Affichage :** Tout le monde voit le chronomètre [cite: 14][cite_start], mais seul le joueur précédent peut le lancer et l'arrêter[cite: 14]. [cite_start]**Sanction/Récompense :** Si le chrono arrive à zéro, c'est perdu et un indicateur sonore est émis[cite: 14]. [cite_start]Si le joueur précédent clique sur validé pendant les 3 secondes, c'est gagné[cite: 14]. [cite_start]Sinon, il boit **3 gorgées**[cite: 14]. [cite_start]| [cite: 14] |
| **6** | **Six Time** | [cite_start]Une fois que **tous les joueurs** sont prêts (chaque joueur doit indiquer s'il est prêt) [cite: 15][cite_start], un rond de chargement se lance en gros sur tous les écrans[cite: 15]. [cite_start]Une fois finis, un **chrono invisible** se lance pour tous les joueurs[cite: 15]. [cite_start]Chaque joueur peut alors **arrêter son chrono** à l'aide d'un bouton[cite: 15]. [cite_start]**Sanction/Récompense :** Si le chrono est à un **multiple de 6** avec **50 centièmes de seconde près** [cite: 15][cite_start], il peut distribuer le multiple en gorgées (ex: chrono arrêté à 6,30s, on distribue 1)[cite: 15]. [cite_start]Sinon il le boit (ex: à 17,48s on boit 3)[cite: 15, 16]. [cite_start]**Fin du Jeu :** Le jeu s'arrête quand tous les joueurs ont arrêté leur chrono[cite: 16]. [cite_start]Une fois que l'on a arrêté son chrono, on voit alors les chronos de tous les autres joueurs en cours ou arrêtés[cite: 16]. [cite_start]| [cite: 15, 16] |
| **7** | **Le Loto des Doigts** | Le joueur a trois choix, deviner : <br> 1. Le nombre **exact** $\rightarrow$ Récompense : $2 \times$ nb de joueur en gorgée. [cite_start]Risque : boit **3 gorgées**[cite: 17, 18]. <br> 2. Dans une **borne de 2** (ex: entre 4 et 6, inclus) $\rightarrow$ Récompense : ($1 \times$ nb joueur / 1.5) on arrondit au supérieur en gorgée. [cite_start]Risque : boit **2 gorgées**[cite: 17, 18]. <br> 3. Dans une **borne de 4** $\rightarrow$ Récompense : **1 gorgée**. [cite_start]Risque : boit **1 gorgée**[cite: 17, 18]. [cite_start]<br> Une fois que le joueur a choisi, tous les autres joueurs choisissent chacun entre 1 et 2 (nombre de doigt qu'ils choisissent de lever chacun)[cite: 17]. [cite_start]On fait la somme de toutes les valeurs et on compare au choix du joueur principal pour savoir les gorgées[cite: 18]. [cite_start]S'il trouve, il distribue la valeur, sinon il boit respectivement 3, 2 et 1 gorgée pour respecter le risk/reward[cite: 17, 18]. [cite_start]| [cite: 17, 18] |
| **8** | **La Méduse** | [cite_start]Tout le monde ferme les yeux et baisse la tête[cite: 19]. [cite_start]Le joueur dit "mééééééduse"[cite: 19]. [cite_start]À la fin du mot, tous les joueurs lèvent la tête et regardent un autre joueur[cite: 19]. [cite_start]Si deux joueurs se regardent, ils doivent trinquer et boire **2 gorgées**[cite: 19]. [cite_start]**(only rules)** [cite: 20] [cite_start]| [cite: 19, 20] |
| **9** | **Mini-bac** | [cite_start]Le joueur choisit un thème[cite: 20]. [cite_start]Chaque joueur doit dire un terme qui correspond au thème en suivant les lettres de l'alphabet (ex: fruit $\rightarrow$ abricot, banane, cerise, date, etc.)[cite: 20]. [cite_start]Le joueur qui n'en a plus boit **3 gorgées**[cite: 20]. [cite_start]**(only rules)** [cite: 21] [cite_start]| [cite: 20, 21] |
| **10** | **Le jeu de la Note** | [cite_start]Le joueur ferme les yeux[cite: 21]. [cite_start]Les autres joueurs se mettent d'accord sur une note de 1 à 10[cite: 21]. [cite_start]**Vote :** Chaque joueur (pas le joueur principal qui a un écran d'attente) vote en temps réel pour une note[cite: 21]. [cite_start]On voit en temps réel qui vote pour quelle note grâce à la couleur de moustache[cite: 21]. [cite_start]Au bout de **8 secondes**, la note avec le plus de vote est choisie, on l'affiche en gros pendant 3 secondes[cite: 22]. [cite_start]Le joueur peut alors réouvrir les yeux et demande à chaque joueur un thème à l'oral[cite: 22]. [cite_start]Le joueur doit alors lui donner un terme qui correspond à la note dans le thème (un thème différent par joueur ou non)[cite: 22]. [cite_start]**Sanction/Récompense :** Il choisit une note ; s'il trouve la bonne note, il distribue **4 gorgées** sinon il boit **2**[cite: 22]. [cite_start]| [cite: 21, 22] |
| **Roi** | **Mustachio** | [cite_start]Le joueur devient le **Mustachio**[cite: 22]. [cite_start]Il peut, à tout moment de la partie, **une fois par tour** et jusqu'à ce qu'un autre Mustachio soit désigné, mettre ses deux doigts sous le nez[cite: 22]. [cite_start]**Geste :** Tous les autres joueurs doivent alors faire le même geste[cite: 23]. [cite_start]Le dernier joueur à le faire voit sa prochaine sanction en gorgée **doublée**[cite: 23]. [cite_start]**Balle :** Le Mustachio a également une "balle" qu'il peut tirer sur un joueur lorsque celui-ci boit[cite: 23]. [cite_start]Le joueur en question voit alors sa sanction en gorgée **doublée**[cite: 23]. [cite_start]**Perte :** Si le Mustachio n'a pas tiré sa balle et qu'un autre Mustachio est désigné, alors il voit lui aussi sa prochaine sanction **doublée**[cite: 23]. [cite_start]**(only rules)**[cite: 23]. [cite_start]Un petit bouton sur l'écran de jeu principal du Mustachio est présent pour qu'il puisse tirer (le bouton sert uniquement à détecter si le Mustachio a tiré ou non)[cite: 24]. [cite_start]| [cite: 22, 23, 24] |
| **Reine** | **Cupidon** | [cite_start]Le joueur désigne deux joueurs (dans une liste de tous les joueurs scrollable) qui sont maintenant lié par les liens de l'amour[cite: 24]. [cite_start]**Effet du Lien :** Si un joueur prend 2 gorgées, l'autre joueur les prends également[cite: 24]. [cite_start]Si lors d'un jeu les deux joueurs prennent des gorgées différentes, alors les deux joueurs prennent le nombre de gorgées le plus élevé[cite: 24]. [cite_start]Les joueurs sont liés jusqu'au prochain cupidon[cite: 24]. [cite_start]**Affichage :** Les amoureux doivent être affichés sur l'écran de jeu principal de tout le monde[cite: 25]. [cite_start]| [cite: 24, 25] |

### B. DICE GAME (Jeux de Dés)

| Carte | Nom du Jeu | Règles Détaillées | Source |
| :---: | :--- | :--- | :--- |
| **2** | **Duel du Con** | [cite_start]Le joueur choisit un autre joueur à défier[cite: 25]. [cite_start]Les deux lancent un dé[cite: 25]. [cite_start]**Sanction :** Le plus bas boit la **différence** qu'il y a entre les deux dés en gorgées[cite: 25]. [cite_start]Si les deux dés sont égaux, alors les deux boivent la valeur du dé[cite: 25]. [cite_start]**(Animation de lancé de dés requise)** [cite: 2] [cite_start]| [cite: 25, 2] |
| **4** | **Trinquette** | [cite_start]Le joueur qui tire le 4 lance **2 dés** et annonce son score à l'oral[cite: 26]. [cite_start]**Ordre de Puissance :** On lit toujours le plus grand dé en premier[cite: 26]. [cite_start]Par ordre de puissance, 32 est le plus faible et 66 le plus fort[cite: 26]. [cite_start]Les doubles sont toujours plus puissants que le reste (11, puis 22, puis 33, puis 44, puis 55, puis 66)[cite: 26]. [cite_start]11 est plus puissant que 56[cite: 26]. [cite_start]**Déroulement :** Le joueur suivant peut soit dire **"ok"** ou **"menteur"**[cite: 26]. [cite_start]<br> * Si **"menteur"** : Les dés du joueur précédent sont révélés[cite: 26]. [cite_start]S'il mentait, il boit **4 gorgées**[cite: 27]. [cite_start]Sinon, celui qui a dit "menteur" boit **4 gorgées**[cite: 27]. [cite_start]<br> * Si **"ok"** : On ne révèle pas les dés du joueur précédent, et il lance les dés, et ainsi de suite[cite: 27]. [cite_start]**Fin de Jeu :** La valeur la plus haute est la trinquette, le **21**, et elle vaut **1 cul sec**[cite: 27]. [cite_start]| [cite: 26, 27] |

### C. CARD GAME (Jeux de Cartes)

| Carte | Nom du Jeu | Règles Détaillées | Source |
| :---: | :--- | :--- | :--- |
| **5** | **Purple** | [cite_start]Chaque joueur fait le jeu complet [cite: 28][cite_start], et tout le monde assiste à chaque jeu pour le suspens[cite: 28]. [cite_start]Le joueur actif est soumis à une série de devinettes successives: <br> 1. On lui demande chacun son tour : **rouge ou noir** et on lui donne la carte[cite: 28]. [cite_start]<br> 2. Puis : **plus ou moins** que sa carte précédente[cite: 28]. [cite_start]<br> 3. Puis : **entre ou pas entre** ses deux cartes précédentes[cite: 28]. [cite_start]<br> **Banque de Gorgées :** À chaque erreur, le joueur concerné met **2 gorgées dans sa banque**[cite: 28]. [cite_start]<br> 4. Pour finir, on lui demande le **signe** de sa dernière carte (carreau, cœur, etc.)[cite: 28]. [cite_start]<br> **Fin de Jeu :** S'il a bon, il **distribue sa banque**[cite: 28]. [cite_start]Sinon, il la **boit**[cite: 28]. [cite_start]| [cite: 28] |
| **Valet** | **PMU** | [cite_start]**Mises :** Chaque joueur mise sur une **couleur** (rouge ou noir) et un **nombre de gorgées**[cite: 29]. [cite_start]Les gagnants donnent leurs gorgées, et les perdants boivent leurs gorgées[cite: 29]. Une fois que tous les joueurs ont validé leurs mises. [cite_start]<br> **Course :** On place alors deux chevaux (un rouge et un noir) sur la ligne de départ[cite: 29]. [cite_start]On tire les cartes une à une[cite: 29]. [cite_start]Chaque carte fait avancer le cheval de sa couleur d'un palier[cite: 29]. [cite_start]Il y a **6 paliers** (de 0 à 6)[cite: 29]. [cite_start]<br> **Malus :** À chaque palier jouable (**1 à 5**), il y a une carte malus face cachée[cite: 29, 30]. [cite_start]Quand les deux chevaux ont **atteint ou dépassé** un palier, la carte se retourne et la couleur du cheval correspondant **recule de 1**[cite: 30]. [cite_start]<br> **Fin de Jeu :** Une fois un cheval arrivé (palier 6), sa couleur gagne, c'est la fin du jeu et on distribue les gorgées[cite: 30]. [cite_start]| [cite: 29, 30] |