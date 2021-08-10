import { providers } from "ethers";

import { BlockRepository } from "../Repositories/BlockRepository"
import { ERC20TokenRepository } from "../Repositories/ERC20TokenRepository";
import { ContractCreationTransactionRepository } from "../Repositories/TransactionRepository";

export abstract class AbstractNetwork
{
    private _blockRepository: BlockRepository | null = null;
    private _contractCreationTransactionRepository: ContractCreationTransactionRepository | null = null;
    private _ERC20TokenRepository: ERC20TokenRepository | null = null;
    private _jsonRpcProvider: providers.JsonRpcProvider | null = null;

    // Collections names for storing the data of this network in the database
    public abstract getBlocksCollectionName(): string;
    public abstract getContractCreationTransactionsCollectionName(): string;
    public abstract getERC20TokensCollectionName(): string

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

    public getERC20ContractRepository(): ERC20TokenRepository
    {
        if (this._ERC20TokenRepository === null)
        {
            this._ERC20TokenRepository = new ERC20TokenRepository(this.getERC20TokensCollectionName());
        }

        return this._ERC20TokenRepository;
    }
}
