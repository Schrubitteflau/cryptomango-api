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

### Utilisation de vmTrace

Voir : https://github.com/banteg/vmtrace/blob/main/demo.py (ou `banteg_vmtrace_demo.py` si le repo n'existe plus)
Lignes intéressantes :
```python
request_raw("trace_replayTransaction", [tx, ["vmTrace"]])
request_raw("trace_replayBlockTransactions", [hex(height), ["vmTrace"]])
```

Il s'agit bien de `Parity traces`, non supportées par `geth`. `trace_replayBlockTransactions` pourrait s'avérer particulièrement intéssant également !

Plug-in `geth` pour ajouter le support des `Parity traces` : https://github.com/openrelayxyz/plugeth-plugins/tree/master/packages/plugeth-parity

Pour résumer, les prérequis seront donc un archive node supportant les `Parity traces`.

## Internal transactions

On peut également inspecter les `internal transactions` pour voir tous les `call` et `create` : https://etherscan.io/tx/0x3feabd79e8549ad68d1827c074fa7123815c80206498946293d5373a160fd866#internal

Bien qu'il n'y ait pas de méthode pour directement accéder aux transactions internes d'une transaction (ou d'un bloc), ça peut être un bon point de départ pour des recherches : https://www.geeksforgeeks.org/normal-transactions-vs-internal-transactions-in-etherscan/

Une "transaction interne" ne désigne pas réellement une transaction, telle que décrite dans le whitepaper. Ce nom est plutôt donné comme convention pour tous les transferts de valeur et de données qui ont lieu d'un contrat à un autre. Ces transactions internes sont donc le fruit indirect de l'exécution de transactions par des EOA. Par exemple, un utilisateur appelle un contrat qui va appeler un autre contrat et qui va lui-même déployer un autre contrat. Dans ce cas, on pourrait tracer la transaction et en isoler des parties, celle qui correspond au second appel de contrat, et celle qui correspond à la création de contrat. Les transactions internes ne sont donc que le résultat de l'exécution d'une transaction, elles ne sont donc pas stockées sur la blockchain. En effet, une "transaction interne" correspond seulement à une partie de l'exécution d'une transaction, qui est la seule à avoir une origine, un champ data, un hash, etc. J'ai lu quelque part de chaque transaction interne correspondait à une modification du state.

Je pense qu'il y aurait la possibilité de modifier un client Ethereum, afin de tracer les transactions au fur à mesure de la synchronisation du full-node, puisqu'un archive node est hors de portée (au moins pour le moment). L'idée serait de stocker les résultats de `trace` et/ou de `debug`, d'en faire une base de données qu'il suffira alors de consulter pour retracer la vie d'une transaction. À voir si c'est faisable. En plus, il y aurait peut-être la possibilité de créer un service payant pour ceux qui souhaitent accéder aux données.

https://ethereum.stackexchange.com/questions/3417/how-to-get-contract-internal-transactions

J'ai donc eu la même idée que plusieurs autres personnes, qui est de tracer toutes les transactions, de les indexer, de les stocker dans une base de données et de les rendre accessible.

## debug_subscribe

La solution la plus fiable sans la nécessité d'avoir un archive node serait donc de tracer toutes les transactions au fur à mesure que le full-node se synchronise. Voir [cette PR](https://github.com/ethereum/go-ethereum/pull/15516) qui semble intéressante et qui permettrait de ne pas avoir à spammer de requêtes :
```
{"id": 1, "method": "debug_subscribe", "params": ["traceChain", "0x0", "0xffff", {"tracer": "callTracer"}]}
```

Un exemple de réponse est :
```json
{"jsonrpc":"2.0","method":"debug_subscription","params":{"subscription":"0xe1deecc4b399e5fd2b2a8abbbc4624e2","result":{"block":"0xf43","hash":"0xacb74aa08838896ad60319bce6e07c92edb2f5253080eb3883549ed8f57ea679","traces":[{"from":"0x31b98d14007bdee637298086988a0bbd31184523","gas":"0x0","gasUsed":"0x0","input":"0x","output":"0x","time":"1.568µs","to":"0xbedcf417ff2752d996d2ade98b97a6f0bef4beb9","type":"CALL","value":"0xde0b6b3a7640000"}]}}}

{"jsonrpc":"2.0","method":"debug_subscription","params":{"subscription":"0xe1deecc4b399e5fd2b2a8abbbc4624e2","result":{"block":"0xf47","hash":"0xea841221179e37ca9cc23424b64201d8805df327c3296a513e9f1fe6faa5ffb3","traces":[{"from":"0xbedcf417ff2752d996d2ade98b97a6f0bef4beb9","gas":"0x4687a0","gasUsed":"0x12e0d","input":"0x...","output":"0x...","time":"658.529µs","to":"0x5481c0fe170641bd2e0ff7f04161871829c1902d","type":"CREATE","value":"0x0"}]}}}

{"jsonrpc":"2.0","method":"debug_subscription","params":{"subscription":"0xe1deecc4b399e5fd2b2a8abbbc4624e2","result":{"block":"0xfff","hash":"0x254ccbc40eeeb183d8da11cf4908529f45d813ef8eefd0fbf8a024317561ac6b"}}}
```

Une autre solution temporaire pourrait être d'utiliser l'[API d'Etherscan](https://docs.etherscan.io/api-endpoints/accounts#get-internal-transactions-by-transaction-hash), mais je cherche une solution de plus bas niveau, qui fonctionnerait avec peu de latence et pour tout noeud d'une blockchain EVM.

## Instrumenting EVM

Voir : https://ethereum.stackexchange.com/questions/4446/instrumenting-evm

```
To do this, you need to define a VM log collector, which implements StructLogCollector. This function gets called on every step of the VM, and is provided with copies of the memory, stack, and modified parts of the storage, along with the program counter, current opcode, gas left, and other data. It's also called when an error occurs that causes a transaction to fail.

To extract the data you want, you need to watch for several things: 'CREATE', 'CALL', 'CALLCODE' and 'DELEGATECALL' opcodes, which invoke new contracts or accounts and potentially transfer value, and 'SUICIDE' which returns value to the caller. You also need to watch for anything that causes a call to return, and for the aforementioned errors.

While tracing, you need to maintain a stack that represents the stack of calls made by the current transaction, with each stack frame containing a list of value transfers that have been made so far. A non-error return pops a stack frame, adding all its value transfers to the frame below. An error return pops the frame, discarding all the transfers. When you pop the final frame, the set of transfers on it are the ones that were finalized as part of the transaction.

An implementation of all of this can be seen as part of my Etherquery code : https://github.com/Arachnid/etherquery/blob/master/etherquery/trace.go#L102
```
