import { Collection, Db } from "mongodb";

import { mongo } from "../Util";

// T corresponds to the schema of data stored in the collection
export abstract class AbstractRepository<T>
{
    protected abstract _getCollectionName(): string;

    protected async _getDatabase(): Promise<Db>
    {
        return await mongo.selectDatabase("BSC");
    }

    protected async _getCollection(): Promise<Collection<T>>
    {
        const database: Db = await this._getDatabase();

        return database.collection<T>(this._getCollectionName());
    }
}