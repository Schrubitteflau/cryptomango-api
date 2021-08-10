import { Collection, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";

import { ErrorifyOperation } from "../Types";
import { toError } from "../Util";
import { IContractCreationTransactionSchema } from "../Schemas/IContractCreationTransactionSchema";

export type StoreTransactionsResult = {
    storedTransactions: Array<IContractCreationTransactionSchema>,
    storedCount: number
};

export type StoreTransactionsOperation = ErrorifyOperation<StoreTransactionsResult>;

export class ContractCreationTransactionRepository extends AbstractRepository<IContractCreationTransactionSchema>
{
    public constructor(collectionName: string)
    {
        super(collectionName);
    }

    private async _storeTransactions(transactions: Array<IContractCreationTransactionSchema>): Promise<StoreTransactionsResult>
    {
        const collection: Collection<IContractCreationTransactionSchema> = await this._getCollection();
        const insertionResult: InsertWriteOpResult<WithId<IContractCreationTransactionSchema>> = await collection.insertMany(transactions);

        return {
            storedTransactions: insertionResult.ops,
            storedCount: insertionResult.insertedCount
        };
    }

    public async storeTransactions(transactions: Array<IContractCreationTransactionSchema>): Promise<ErrorifyOperation<StoreTransactionsResult>>
    {
        if (transactions.length === 0)
        {
            return {
                success: true,
                data: {
                    storedTransactions: [],
                    storedCount: 0
                }
            };
        }

        try
        {
            return {
                success: true,
                data: await this._storeTransactions(transactions)
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
