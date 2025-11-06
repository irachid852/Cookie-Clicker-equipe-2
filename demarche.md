# Projet: Cookie-Clicker Nsigma, Equipe 2

###### Angus Mustiere, Timothée Chemla, Ismael El-Bakkouchi, Bastien Pichet

Nous avons entreprit ce projet dans l'idée qu'il serait une source de connaissances.
En particulier nous n'avions quasiment jamais travaillé en groupe en informatique et l'utilisation de git ne nous était pas familière et nous avons pris cela comme étant une chance de développer de compétences de travail en équipe et en plus des apports techniques.
Il a aussi était l'occassion de 

## Organisation du travail :

Notre première difficulté fut de nous organiser, que ce soit par apport à la répartition des tâches ou de la gestion des fichiers.

###### Répartition des tâches

Au début, au cours d'une première reunion discord avec l'ensemble des quatres membres, nous avons voulu nous répartir les tâches entre Front et Back-End. Cependant, nous nous sommes rapidement rendu compte que cela ne convenait pas au vu de nos connaissances communes et de la dépendance Front/Back.

Réalisation d'un Cahier des Charges :
    -Réalisation d'une maquette du front-End pour pouvoir s'assurer de bien cadrer la partie Front-End.
    -Listing de l'ensemble des fonctionnalités que l'on souhaite implementées.
    -Répartition des tâches en fonction des connaissances de chacun.

###### Gestion des fichiers/versions

Concernant la gestion des fichiers, nous connaissions git comme étant un moyen d'enregistrer des fichiers, dossiers et particulièrement des projets informatiques mais personne ne l'avait utilisés de façon très poussé.

On a donc décider de s'y mettre en suivant les tutoriels et en faisant une branche chacun pour développer les fonctionnalités en même temps.
Encore à ce jour, nous ne saisissons pas l'ensemble des fonctionnalités qu'offre git, en particulier le 'merge de branches' mais cela nous a permis de comprendre l'importance d'une bonne gestion des différentes versions.

###### Choix des technologies

Concernant le choix des technologies, nous avons fait le choix d'en tester plusieurs afin de voir les pour et les contres, et voir laquelle correspondait le plus à nos besoins.

## Phase 1 : Front End

Concernant le Front-End, nous voulions faire quelque chose de simple et ergonomique en y incorporant les élements de la Charte Graphique de Nsigma.

Connaissant HTML/CSS/JS, mais en ayant rarement fait depuis la Terminale, nous avons décidé de commencer avec un squelette HTML fait à l'aide d'une IAG et de compléter et combler les nombreux manques avec nos connaissances de HTML/CSS/JS.
Nous avons restructurer le HTML/CSS pour coller avec notre maquette graphique.
Etant donné les connaissances limités de certain des membres en JS, nous avons repris des exemples de codes en les adaptant à notre site et à nos besoins.
Plus précisement, nous avons repris l'architecture des fonctions des "Batiments" pour en créer de nouveaux et personnaliser leur exploitation.
Nous avons travaillé analoguement pour la redaction des fonctions "Bosster". Bien entendu, la modification et création de ces nouvelles fonctions a entrainé la modification du code HTML puis celle d'autre parti du de code JS (par exemple la fonction updateDisplay).

Nous avons ensuite suivi des tutos sur Internet expliquant l'implémentation du son lors des clicks, les nombreux paramètres CSS et les différentes balises utilisables en HTML.


## Phase 2 : Back-End

Concernant le backend, nous ne connaissions pas les mêmes langages mais nous avons finalement fait le choix classique d'utiliser ExpressJs. 
Premierement on a voulu le faire en Django étant donné que nous voulions initialement coder le back en python (langage maitrisé par l'ensemble des membres).
Nous avons réalisé que cela semblait plus compliqué que nécessaire. Deux personnes de notre groupe ayant déjà fait des projets en PHP, nous avons essayé.

En experimentant, nous avons vu que ce n'etait pas aussi simple que l'on pensait. On a donc decide de partir sur du ExpressJS (langage que certain connaissait suffisament pour pouvoir travailler dessus), de plus c'était ce qui était recommandé dans les consignes. Cela a été au final un bon choix: son utilisation a été relativement simple et facilement implémentable avec l'ensemble du front. De plus, on a pu trouver des video youtube et des codes sur github pour inspirer et aider à rédiger le code, notament les fonctions nous permettant l'accès à la BDD en SQL.

Voici dans les grandes lignes comment nous avons procédé: 
On a repris un systeme d'authenfication tres simple grace a une IAG. on l'a ensuite modifié pour le faire correspondre à notre utilisation des données. Grace a des requetes SQL, on a initialisé la base de données, modifié les tables et lu des valeurs de la BDD. De plus on a ajouté la sauvegarde automatique chaque 15 secondes.
Finalement, on a eu le temps d'ajouter un leaderboard qui recupere ceux avec le plus de cookies dans la BDD. 



## Conclusion et Etapes Futures

Nous sommes satisfait du résultat qui correspond à nos attentes. Nous espérons aussi avoir répondus aux attentes du jury.
Néamoins il pourrait être intéressant de développer de nouvelles fonctionnalités notamment concernant le game Design, nous aimerions complexifier les mécaniques de jeu : 
Interractions entre les différentes machines, ajout de boosters différents
Ajout d'un "méta-jeu" tel que un casino à cookies, une bourse et d'autres idées.


