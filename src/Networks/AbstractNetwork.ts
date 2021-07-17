import { BlockRepository } from "../Repositories/BlockRepository"
import { TransactionRepository } from "../Repositories/TransactionRepository";

export abstract class AbstractNetwork
{
    private _blockRepository: BlockRepository | null = null;
    private _transactionRepository: TransactionRepository | null = null;

    // Collections names for storing the data of this network in the database
    public abstract getBlocksCollectionName(): string;
    public abstract getContractCreationTransactionsCollectionName(): string;

    // Name of the network
    public abstract getName(): string;

    public getBlockRepository(): BlockRepository
    {
        if (this._blockRepository === null)
        {
            this._blockRepository = new BlockRepository(this.getBlocksCollectionName());
        }

        return this._blockRepository;
    }

    public getTransactionRepository(): TransactionRepository
    {
        if (this._transactionRepository === null)
        {
            this._transactionRepository = new TransactionRepository(this.getContractCreationTransactionsCollectionName());
        }

        return this._transactionRepository;
    }
}
