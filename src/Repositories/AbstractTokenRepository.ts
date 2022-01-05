import { Collection, Cursor } from "mongodb";

import { IERC1155TokenSchema, IERC20TokenSchema, IERC721TokenSchema } from "@Schemas";
import { AbstractRepository } from "./AbstractRepository";

interface IFindAfterConfig
{
    after: {
        creationTimestamp: number;
        creationTransactionIndex: number;
    };
    tokenCount: number;
}

export type AllowedSchemas = IERC20TokenSchema | IERC721TokenSchema | IERC1155TokenSchema;

export abstract class AbstractTokenRepository<T extends AllowedSchemas> extends AbstractRepository<T>
{
    public async findAfter(config: IFindAfterConfig): Promise<Cursor<T>>
    {
        // TODO : enlever any
        const collection: Collection<any> = await this._getCollection();

        return collection.find({
            creationTimestamp: { $gt: config.after.creationTimestamp },
            creationTransactionIndex: { $gt: config.after.creationTransactionIndex }
        }).sort({
            creationTimestamp: 1,
            creationTransactionIndex: 1
        }).limit(config.tokenCount);
    }
}
