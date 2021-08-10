import { Collection, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";

import { ErrorifyOperation } from "../Types";
import { toError } from "../Util";

export interface IERC20TokenSchema {
    // Address of the contract
    _id: string
}

export type StoreERC20TokenResult = {
    storedERC20Contracts: Array<IERC20TokenSchema>,
    storedCount: number
};

export type StoreERC20TokenOperation = ErrorifyOperation<StoreERC20TokenResult>;

export class ERC20TokenRepository extends AbstractRepository<IERC20TokenSchema>
{
    public constructor(collectionName: string)
    {
        super(collectionName);
    }

    private async _storeERC20Contracts(contracts: Array<IERC20TokenSchema>): Promise<StoreERC20TokenResult>
    {
        const collection: Collection<IERC20TokenSchema> = await this._getCollection();
        const insertionResult: InsertWriteOpResult<WithId<IERC20TokenSchema>> = await collection.insertMany(contracts);

        return {
            storedERC20Contracts: insertionResult.ops,
            storedCount: insertionResult.insertedCount
        };
    }

    public async storeERC20Contracts(contracts: Array<IERC20TokenSchema>): Promise<ErrorifyOperation<StoreERC20TokenResult>>
    {
        if (contracts.length === 0)
        {
            return {
                success: true,
                data: {
                    storedERC20Contracts: [],
                    storedCount: 0
                }
            };
        }

        try
        {
            return {
                success: true,
                data: await this._storeERC20Contracts(contracts)
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
