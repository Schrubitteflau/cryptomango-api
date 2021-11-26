import { providers } from "ethers";

import {
    BlockRepository,
    ContractCreationTransactionRepository,
    ERC20ContractRepository,
    ERC721ContractRepository,
    ERC1155ContractRepository
} from "@Repositories"

export abstract class AbstractNetwork
{
    private _blockRepository: BlockRepository | null = null;
    private _contractCreationTransactionRepository: ContractCreationTransactionRepository | null = null;
    private _ERC20ContractRepository: ERC20ContractRepository | null = null;
    private _ERC721ContractRepository: ERC721ContractRepository | null = null;
    private _ERC1155ContractRepository: ERC1155ContractRepository | null = null;
    private _jsonRpcProvider: providers.JsonRpcProvider | null = null;

    // Collections names for storing the data of this network in the database
    public abstract getBlocksCollectionName(): string;
    public abstract getContractCreationTransactionsCollectionName(): string;
    public abstract getERC20ContractCollectionName(): string;
    public abstract getERC721ContractCollectionName(): string;
    public abstract getERC1155ContractCollectionName(): string;

    // Full name of the network
    public abstract getName(): string;

    // Chain ID of the network
    public abstract getChainID(): number;

    // JsonRpc provider URL used for the network
    public abstract getJsonRpcProviderURL(): string;

    public getJsonRpcProvider(): providers.JsonRpcProvider
    {
        if (this._jsonRpcProvider === null)
        {
            this._jsonRpcProvider = new providers.JsonRpcProvider(this.getJsonRpcProviderURL());
        }

        return this._jsonRpcProvider;
    }

    public getBlockRepository(): BlockRepository
    {
        if (this._blockRepository === null)
        {
            this._blockRepository = new BlockRepository(this.getBlocksCollectionName());
        }

        return this._blockRepository;
    }

    public getTransactionRepository(): ContractCreationTransactionRepository
    {
        if (this._contractCreationTransactionRepository === null)
        {
            this._contractCreationTransactionRepository = new ContractCreationTransactionRepository(this.getContractCreationTransactionsCollectionName());
        }

        return this._contractCreationTransactionRepository;
    }

    public getERC20ContractRepository(): ERC20ContractRepository
    {
        if (this._ERC20ContractRepository === null)
        {
            this._ERC20ContractRepository = new ERC20ContractRepository(this.getERC20ContractCollectionName());
        }

        return this._ERC20ContractRepository;
    }

    public getERC721ContractRepository(): ERC721ContractRepository
    {
        if (this._ERC721ContractRepository === null)
        {
            this._ERC721ContractRepository = new ERC721ContractRepository(this.getERC721ContractCollectionName());
        }

        return this._ERC721ContractRepository;
    }
    
    public getERC1155ContractRepository(): ERC1155ContractRepository
    {
        if (this._ERC1155ContractRepository === null)
        {
            this._ERC1155ContractRepository = new ERC1155ContractRepository(this.getERC1155ContractCollectionName());
        }

        return this._ERC1155ContractRepository;
    }
}
