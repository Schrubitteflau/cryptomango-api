import { Collection, Db } from "mongodb";

import { mongo } from "../Util";

// T corresponds to the schema of data stored in the collection
export abstract class AbstractRepository<T>
{
    protected constructor(private readonly _collectionName: string) { }

    protected async _getCollection(): Promise<Collection<T>>
    {
        const database: Db = await mongo.selectDatabase();

        return database.collection<T>(this._getCollectionName());
    }

    protected _getCollectionName(): string
    {
        return this._collectionName;
    }
}