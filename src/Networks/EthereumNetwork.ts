import { AbstractNetwork } from "./AbstractNetwork";

export class EthereumNetwork extends AbstractNetwork
{
    public getBlocksCollectionName(): string
    {
        return "Ethereum_blocks";
    }

    public getContractCreationTransactionsCollectionName(): string
    {
        return "Ethereum_contract_creation_transactions";
    }

    public getERC20ContractCollectionName(): string
    {
        return "Ethereum_ERC20_contracts";
    }

    public getERC721ContractCollectionName(): string
    {
        return "Ethereum_ERC721_contracts";
    }

    public getERC1155ContractCollectionName(): string
    {
        return "Ethereum_ERC1155_contracts";
    }

    public getName(): string
    {
        return "Ethereum";
    }

    public getChainID(): number
    {
        return 1;
    }

    public getJsonRpcProviderURL(): string
    {
        return "https://apis-sj.ankr.com/8364b7806abd40c884ec8abd18216217/8eb465ff9f4d3d6cc9acc1c73cf8fe28/eth/fast/main";
    }
}

export const Ethereum: EthereumNetwork = new EthereumNetwork();