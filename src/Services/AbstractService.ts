import EventEmitter from "events";
import { Collection, Db } from "mongodb";

import { mongo } from "../Util";

export abstract class AbstractService extends EventEmitter
{
    protected constructor
    (
        protected readonly _serviceName: string
    )
    {
        super();
    }

    protected get _collectionName(): string
    {
        return this._serviceName;
    }

    protected async _getDatabase(): Promise<Db>
    {
        return await mongo.selectDatabase("BSC");
    }

    protected async _getCollection<T>(): Promise<Collection<T>>
    {
        const database: Db = await this._getDatabase();

        return database.collection<T>(this._collectionName);
    }
}
