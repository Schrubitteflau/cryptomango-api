import { Collection, Db, InsertWriteOpResult, InsertOneWriteOpResult, WithId  } from "mongodb";

import type { Operation } from "@Types";
import { mongo, toError } from "@Util";

// T corresponds to the schema of data stored in the collection, see src/Schemas

export type StoreOneResult<T> = {
    data: T
};

export type StoreManyResult<T> = {
    count: number,
    data: Array<T>
};

export type StoreOneOperation<T> = Operation<StoreOneResult<T>>;

export type StoreManyOperation<T> = Operation<StoreManyResult<T>>;

export abstract class AbstractRepository<T>
{
    public constructor
    (
        private readonly _collectionName: string
    ) { }

    protected _getCollectionName(): string
    {
        return this._collectionName;
    }

    protected async _getCollection(): Promise<Collection<T>>
    {
        const database: Db = await mongo.selectDatabase();

        return database.collection<T>(this._getCollectionName());
    }

    protected async _storeMany(values: Array<WithId<T>>): Promise<StoreManyResult<WithId<T>>>
    {
        const collection: Collection<T> = await this._getCollection();
        const insertionResult: InsertWriteOpResult<WithId<T>> = await collection.insertMany(values);

        return {
            count: insertionResult.insertedCount,
            data: insertionResult.ops
        };
    }

    protected async _storeOne(value: WithId<T>): Promise<StoreOneResult<WithId<T>>>
    {
        const collection: Collection<T> = await this._getCollection();
        const insertionResult: InsertOneWriteOpResult<WithId<T>> = await collection.insertOne(value);

        return {
            data: insertionResult.ops[0]
        };
    }

    public async storeMany(values: Array<WithId<T>>): Promise<StoreManyOperation<WithId<T>>>
    {
        if (values.length === 0)
        {
            return {
                success: true,
                operationData: {
                    count: 0,
                    data: []
                }
            };
        }

        try
        {
            return {
                success: true,
                operationData: await this._storeMany(values)
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

    public async storeOne(value: WithId<T>): Promise<StoreOneOperation<WithId<T>>>
    {
        try
        {
            return {
                success: true,
                operationData: await this._storeOne(value)
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