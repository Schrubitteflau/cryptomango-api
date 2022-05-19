TODO : mieux gérer les logs : afficher + d'infos concernant la provenance
utiliser DEBUG LOG WARNING ERROR au lieu des symboles
passer la plupart en DEBUG et ne pas les afficher ?

comprendre pq seules les collections du 1er réseau sont initialisées au début,
et comprendre pq mongoose-unique-validator devient fou
=> voir du côté des modèles et schémas

===
implémenter access et refresh token :
- https://www.izertis.com/en/-/refresh-token-with-jwt-authentication-in-node-js#:~:text=Refresh%20token%3A%20The%20refresh%20token,to%20obtain%20an%20access%20token.
- https://youtu.be/favjC6EKFgw?list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw
- https://youtu.be/nI8PYZNFtac
- https://youtu.be/d2gfJ8UVPDo
- https://youtu.be/iD49_NIQ-R4
- https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
- https://youtu.be/25GS0MLT8JU

aussi, mettre le path du cookie à /refresh par exemple, pour que le cookie ne soit envoyé qu'à cet endroit-là,
car ça ne sert à rien de l'envoyer à chaque requête !

===

rendre le code de test d'API mieux et + axé sur la logique
=> écrire des utilitaires pour tester les bons paramètres des requêtes (fuzz), et faire les tests à part,
genre authRouter.fuzz.spec.ts

===

.technology TLD
0x99fe3b1391503a1bc1788051347a1324bff41452
https://sx.technology/
https://etherscan.io/tx/0xe7197402c822b447d0aaa0d31076a3c58c3317217380d1fda555c1c71e256801

earlybsc.com
-> redirige vers https://lithium.ventures/
=> tester redirections

mettre readonly partout où c'est possible

https://etherscan.io/tx/0x2d842963f3461f9c9196a90094dc37a750aaf6c95fda99c9baecf4ebb3d84778
name : goblintown
site : https://goblintown.wtf/
TLD : wtf
faire juste requêtes DNS au début

ajouter nft
thesaudisnft.com
=> https://opensea.io/collection/thesaudis

===

centraliser toutes les erreurs dans src/CustomErrors
src/CustomErrors/API, etc...

===

swipe de tokens coingecko ou CMC

===

intégrer outil en mode tu importes ABI et tu peux appeler un contrat directement (write + read) et aussi ajouter une option callStatic qui permet de simuler la transaction

===

intégrer outil de comparaison de vitesse d'endpoints Rpc, exemples pour DogeChain :

const rpc = [
    "https://rpc-sg.dogechain.dog",
    "https://rpc-us.dogechain.dog",
    "https://rpc.dogechain.dog",
    "https://rpc01-sg.dogechain.dog",
    "https://rpc02-sg.dogechain.dog",
    "https://rpc03-sg.dogechain.dog"
];

===

investiguer fuite de mémoire ? la RAM consommée semble augmenter sans cesse

===

gérer log mieux avec préfixe pour chaque classe : interface ILoggable
et faire un truc en mode :
getLogSource : retourne str unique pour agréger tous les logs d'une même provenance, par exemple
"BlockDownloadersServices::Binance smart chain"

centralisation des logs :
logger.log(LOGS.BLOCK_DOCUMENT_VALIDATION_FAILED, params)

===

ethlend.io redirige vers aave.com

===

réorganiser imports

===

migration node-fetch -> axios

===

dans le dossier config/, gérer les variables d'environnement

===

supprimer lib validator

===

remplacer if (=== true) par if(condition) et if (=== false) par if (!condition)

===

ajouter données spécifiques genre MAX_MINT, MAX_SUPPLY, TEAM_CLAIM_AMOUNT, etc. pour les nfts
ajouter aussi si le contrat est vérifié ou pas
ajouter indicateurs de scam ou pas etc
=> regrouper le max d'infos à cet endroit ou prendre une décision rapidement

===

passer axios en savedev

===

vérif si https://bscscan.com/token/0xd1D52246271ed5a7403c543ceea3344E39A8af29
dans bdd

------------
pancake testnet

tx swap : https://testnet.bscscan.com/tx/0xa8a57eb8f9a5a5b757a23496a9005223de987fcdb035a0bf5a440f6d87c09bd3


router : 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3
factory : 0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc
