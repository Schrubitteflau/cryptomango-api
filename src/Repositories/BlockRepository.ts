import type { Collection, Cursor } from "mongodb";

import type { IBlockWithTransactionsSchema } from "../Schemas/IBlockWithTransactionsSchema";
import { AbstractRepository } from "./AbstractRepository";

export class BlockRepository extends AbstractRepository<IBlockWithTransactionsSchema>
{
    public async getLatestStoredBlock(): Promise<IBlockWithTransactionsSchema | null>
    {
        const collection: Collection<IBlockWithTransactionsSchema> = await this._getCollection();
        const cursor: Cursor<IBlockWithTransactionsSchema> = collection.find().sort({ _id: -1 }).limit(1);

        return cursor.next();
    }
}
