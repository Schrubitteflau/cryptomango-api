import { Collection, Cursor, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";
import { toError } from "../Util";

import type { BlockWithTransactions, TransactionResponse } from "../Types/EthersTypes";
import type { ErrorifyOperation } from "../Types";

export type TransformBlockReturn = {
    transformedBlock: IBlockWithTransactionsSchema,
    contractCreationTransactions: Array<TransactionResponse>
};

export interface IBlockWithTransactionsSchema extends Omit<BlockWithTransactions, "transactions"> {
    _id: number,
    // Transactions hashes of every transaction of the block
    transactions: Array<string>,
    // Same but only store transaction which creates a contract
    contractCreationTransactions: Array<string>
}

export type StoreBlocksResult = {
    storedBlocks: Array<IBlockWithTransactionsSchema>,
    storedCount: number
};

export type StoreBlocksOperation = ErrorifyOperation<StoreBlocksResult>;

export class BlockRepository extends AbstractRepository<IBlockWithTransactionsSchema>
{
    public constructor(collectionName: string)
    {
        super(collectionName);
    }

    public async getLatestStoredBlock(): Promise<IBlockWithTransactionsSchema | null>
    {
        const collection: Collection<IBlockWithTransactionsSchema> = await this._getCollection();
        const cursor: Cursor<IBlockWithTransactionsSchema> = collection.find().sort({ _id: -1 }).limit(1);

        return await cursor.next();
    }
 
    /**
     * Converts a BlockWithTransactions object to a IBlockWithTransactions object and
     * also returns the transactions which deploys a smart contract
     * 
     * @param block 
     * @returns 
     */
    public transformBlock(block: BlockWithTransactions): TransformBlockReturn
    {
        const transactionsHashes: Array<string> = block.transactions.map((tx: TransactionResponse) => tx.hash);
        /* https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#index-8
        If the target account is not set (the transaction does not have a recipient or the
        recipient is set to null), the transaction creates a new contract */
        const contractCreationTransactions: Array<TransactionResponse> = block.transactions.filter((tx: TransactionResponse) => tx.to === null);
        const contractCreationTransactionsHashes: Array<string> = contractCreationTransactions.map((tx: TransactionResponse) => tx.hash);

        const transformedBlock: IBlockWithTransactionsSchema = {
            ...block,
            _id: block.number,
            transactions: transactionsHashes,
            contractCreationTransactions: contractCreationTransactionsHashes,
        };

        return {
            transformedBlock,
            contractCreationTransactions
        };
    }

    public transformBlocks(blocks: Array<BlockWithTransactions>): Array<TransformBlockReturn>
    {
        return blocks.map(this.transformBlock);
    }

    private async _storeBlocks(blocks: Array<IBlockWithTransactionsSchema>): Promise<StoreBlocksResult>
    {
        const collection: Collection<IBlockWithTransactionsSchema> = await this._getCollection();
        const insertionResult: InsertWriteOpResult<WithId<IBlockWithTransactionsSchema>> = await collection.insertMany(blocks);

        return {
            storedBlocks: insertionResult.ops,
            storedCount: insertionResult.insertedCount
        };
    }

    public async storeBlocks(blocks: Array<IBlockWithTransactionsSchema>): Promise<ErrorifyOperation<StoreBlocksResult>>
    {
        if (blocks.length === 0)
        {
            return {
                success: true,
                data: {
                    storedBlocks: [],
                    storedCount: 0
                }
            };
        }

        try
        {
            return {
                success: true,
                data: await this._storeBlocks(blocks)
            };
        }
        catch (error)
        {
            return {
                success: false,
                error: toError(error)
            };
        } 
    }
}
