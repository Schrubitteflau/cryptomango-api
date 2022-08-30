# Idée générale
Dans le futur, il faudra que j'opère plus bas niveau et que j'inspecte en détail le comportement de chaque transaction afin de voir si elles résultent en une création de smart contract. Cela permettrait d'indexer les données plus efficacement et de manière plus durable, mais va nécessiter de faire tourner un node. À ce moment-là il faudra donc installer des agents d'indexation sur chaque machine fesant tourner le node, l'indexation se fera sur cette même machine et `cryptomango-api` deviendra un aggrégateur, une passerelle pour accéder à ces informations.

# Ressources potentiellement intéressantes :
- https://banteg.mirror.xyz/3dbuIlaHh30IPITWzfT1MFfSg6fxSssMqJ7TcjaWecM
- https://github.com/ApeWorX/evm-trace

# Possibilités

## stateDiff
Faire un stateDiff à l'aide de `trace_replayTransaction`. Comme indiqué [ici](https://banteg.mirror.xyz/3dbuIlaHh30IPITWzfT1MFfSg6fxSssMqJ7TcjaWecM) :
```
Parity traces are quite different from Geth, the ad hoc traces come in three different flavors: trace, vmTrace, and stateDiff.

Parity traces are supported in Erigon, Nethermind, Besu, Foundry.
They are not supported in Geth, Hardhat, Ganache.
Anything beyond trace type requires an archive node.
```

## vmTrace
Transaction intéressante : https://etherscan.io/tx/0x3feabd79e8549ad68d1827c074fa7123815c80206498946293d5373a160fd866
Sa vmTrace : https://etherscan.io/vmtrace?txhash=0x3feabd79e8549ad68d1827c074fa7123815c80206498946293d5373a160fd866&type=parity#decoded

Chaque section où `type` vaut `create` correspond à une création de contrat engendrée par la transaction `0x3feab...`. Cette transaction est un appel de contrat : `contract_address(0x752350797CB92Ad3BF1295Faf904B27585e66BF5).newDAO()`
On peut également voir l'invocation flow ici : https://tools.blocksec.com/tx/eth/0x3feabd79e8549ad68d1827c074fa7123815c80206498946293d5373a160fd866

11 contrats ont été créés par cette transaction. Voici donc tous les contrats qui ont été créés, `etherscan` et `Blocksec` sont d'accord là-dessus :
1. 0x5a98fcbea516cf06857215779fd812ca3bef1b32 (Lido: LDO Token)
2. 0xb8ffc3cd6e7cf5a098a1c92f48009765b24088dc (Lido: Deployer 2)
3. 0x9895f0f17cc1d1891b6f18ee0b483b6f221b37bb (Lido: Aragon ACL)
4. 0x853cc0d5917f49b57b8e9f89e491f5e18919093a (non nommé par `Etherscan`, nommé `AppProxyPinned` par `BlockSec`)
5. 0x3e40d73eb977dc6a537af587d48316fee66e9c8c (Lido: Treasury)
6. 0xb9e5cbb9ca5b0d659238807e84d0176930753d86 (Lido: Aragon Finance)
7. 0xf73a1260d222f447210581ddf212d915c09a3249 (Lido: Aragon Token Manager)
8. 0x2e59a20f205bb85a89c53f1936454680651e618e (Lido: Aragon Voting)
9. 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 (Lido: stETH Token)
10. 0x55032650b14df07b85bf18a3a3ec8e0af2e028d5 (Lido: Node Operators Registry)
11. 0x442af784a788a5bd6f42a01ebe9f287a871243fb (Lido: Oracle)

On peut facilement vérifier que tous ces contrats ont été créés par la transaction `0x3feabd79e8549ad68d1827c074fa7123815c80206498946293d5373a160fd866`, et `TraceAddress` permet de se rendre compte à quel niveau d'imbrication d'appel on se situe. Il faudrait tester la création d'un contrat engendrant la création d'un autre contrat (dans son constructeur et dans un appel de méthode), à plusieurs niveaux d'imbrications, afin de voir si vraiment toutes les créations de contrat sont interceptées, mais je pense que oui.

# Utilisation de vmTrace

Voir : https://github.com/banteg/vmtrace/blob/main/demo.py (ou `banteg_vmtrace_demo.py` si le repo n'existe plus)
Lignes intéressantes :
```python
request_raw("trace_replayTransaction", [tx, ["vmTrace"]])
request_raw("trace_replayBlockTransactions", [hex(height), ["vmTrace"]])
```

Il s'agit bien de `Parity traces`, non supportées par `geth`. `trace_replayBlockTransactions` pourrait s'avérer particulièrement intéssant également !

Plug-in `geth` pour ajouter le support des `Parity traces` : https://github.com/openrelayxyz/plugeth-plugins/tree/master/packages/plugeth-parity

Pour résumer, les prérequis seront donc un archive node supportant les `Parity traces`.
