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

    public getName(): string
    {
        return "BSC";
    }
}

export const BSC: BSCNetwork = new BSCNetwork();