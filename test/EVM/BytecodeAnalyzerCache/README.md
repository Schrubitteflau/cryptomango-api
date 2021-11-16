This folder contains :
- `contracts.json` which maps all the contracts addresses whose bytecode will be tested by `̀BytecodeAnalyzer.spec.ts`̀ when running tests. The content of this file is updated by running `scripts/fetchEtherscanTokensContractsAddresses.js` 
- Text files whose name is an Ethereum-format address containing the raw hex bytecode of the contracts designated by this address. These files don't have to be committed since they only exists to prevent fetching large amount of data from the blockchain each time the tests are run.
