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

    protected async getDatabase(): Promise<Db>
    {
        return await mongo.selectDatabase("BSC");
    }

    protected async getCollection<T>(): Promise<Collection<T>>
    {
        const database: Db = await this.getDatabase();

        return database.collection<T>(this._collectionName);
    }

    //protected abstract getCollection(): Promise<Collection>;

    /*protected async getCollection(): Promise<Collection>
    {
        const database: Db = await this.getDatabase();

        return database.collection(this._collectionName);
    }*/
}
