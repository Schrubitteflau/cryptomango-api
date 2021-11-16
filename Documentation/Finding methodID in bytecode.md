# Finding methodID in bytecode

https://blog.openzeppelin.com/deconstructing-a-solidity-contract

appel de balanceOf(address _owner) : 0x70a08231

Stack :
[
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

DUP1 duplique le 1er élément de la stack :
[
	"0x0000000000000000000000000000000000000000000000000000000070a08231",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

PUSH4 18160ddd ajoute les 4 octets spécifiés à la stack, sachant que 1 WORD = 256 bits = 32 octets
"18160ddd" correspond au method id (totalSupply() ici) de la méthode testée
[
	"0x0000000000000000000000000000000000000000000000000000000018160ddd",
	"0x0000000000000000000000000000000000000000000000000000000070a08231",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

EQ consomme les 2 derniers éléments de la stack et push 1 s'ils sont égaux, ou 0 :
[
	"0x0000000000000000000000000000000000000000000000000000000000000000",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

PUSH2 005c empile l'addresse à laquelle l'instruction JUMPI va peut-être se rendre :
[
	"0x000000000000000000000000000000000000000000000000000000000000005c",
	"0x0000000000000000000000000000000000000000000000000000000000000000",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

JUMPI prend les 2 derniers éléments de la pile : l'addresse et la condition, ici la condition est fausse
car la valeur est 0x0, donc le jump à 0x5c ne sera pas effectué :
[
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

Et on recommence :

DUP1 :
[
	"0x0000000000000000000000000000000000000000000000000000000070a08231",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

PUSH4 70a08231 :
[
	"0x0000000000000000000000000000000000000000000000000000000070a08231",
	"0x0000000000000000000000000000000000000000000000000000000070a08231",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

EQ :
[
	"0x0000000000000000000000000000000000000000000000000000000000000001",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

PUSH2 0087 :
[
	"0x0000000000000000000000000000000000000000000000000000000000000087",
	"0x0000000000000000000000000000000000000000000000000000000000000001",
	"0x0000000000000000000000000000000000000000000000000000000070a08231"
]

JUMPI : cette fois, puisque le 2ème élément de la pile est à 0x1, la condition est vraie et le jump vers
l'instruction à l'addresse 0x87 (135) est effectué, c'est ici que commence le corps de la fonction dont
la method id correspond à celle qu'on a appelée, soit 0x70a08231 donc balanceOf(address)

PUSH4 : 0x63
EQ : 0x14
On peut donc rechercher le schéma [63{4 bytes}14] et partir du principe que les 4 bytes correspondent à une method id, même si ce n'est pas forcément le cas. Mais les probabilités d'obtenir de faux positifs restent très faibles.

Attention, il se trouve que si la method id commence par un ou plusieurs octets nuls (0x00), le comportement est différent. Par exemple, la signature `balanceOf(address,uint256)` trouvée dans le standard `ERC1155` donne la method id `00fdd58e`.

Malheuresement, il n'existe visiblement pas d'instruction `PUSH4 0x00fdd58e` dans le code des 
contrats qui l'implémentent (en tout cas, pas dans `0x76be3b62873462d2142405439777e971754e8e77`). On trouve `PUSH3 0xfdd58e` à la place, ce qui donne la suite hexadécimale `62fdd58e`. Voir : https://etherscan.io/address/0x76be3b62873462d2142405439777e971754e8e77#code

Pour prévenir cela, la solution actuelle est de tester `PUSH4 0x00fdd58e` et l'option optimisée, donc `PUSH3`, `PUSH2` ou `PUSH1` en fonction du nombre d'octets forts à 0.
