import { AbstractNetwork } from "./AbstractNetwork";

export class BSCNetwork extends AbstractNetwork
{
    public getBlocksCollectionName(): string
    {
        return "BSC_blocks";
    }

    public getContractCreationTransactionsCollectionName(): string
    {
        return "BSC_contract_creation_transactions";
    }

    public getERC20TokensCollectionName(): string
    {
        return "BSC_ERC20_contracts";
    }

    public getName(): string
    {
        return "Binance Smart Chain";
    }

    public getChainID(): number
    {
        return 56;
    }

    public getJsonRpcProviderURL(): string
    {
        return "https://bsc-dataseed1.ninicoin.io/";
    }
}

export const BSC: BSCNetwork = new BSCNetwork();