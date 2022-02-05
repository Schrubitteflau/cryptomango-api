import { createModel } from "@Models";
import { IBlockWithTransactions } from "@Schemas";
import { HydratedDocument } from "mongoose";

import { AbstractRepository } from "./AbstractRepository";

export class BlockWithTransactionsRepository extends AbstractRepository<IBlockWithTransactions>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("BlockWithTransactions", collectionName));
    }

    /**
     * @TODO rendre blindé
     * Retrieve the most recent block stored in our database
     * @returns A promise resolved by a document representing a IBlockWithTransactions, or null if the collection is empty
     */
    public async getLatest(): Promise<HydratedDocument<IBlockWithTransactions> | null>
    {
        return this._model.findOne({}).sort({ number: -1 }).exec();
    }
}
