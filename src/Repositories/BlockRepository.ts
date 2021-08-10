import { Collection, Cursor, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";
import { toError } from "../Util";

import type { ErrorifyOperation } from "../Types";
import { IBlockWithTransactionsSchema } from "../Schemas/IBlockWithTransactionsSchema";

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
