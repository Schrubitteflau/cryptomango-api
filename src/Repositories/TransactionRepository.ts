import { Collection, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";

import type { TransactionResponse } from "../Types/EthersTypes";
import { ErrorifyOperation } from "../Types";
import { toError } from "../Util";

export interface ITransactionSchema extends TransactionResponse {
    // Hash of the transaction
    _id: string
}

export type StoreTransactionsResult = {
    storedTransactions: Array<ITransactionSchema>,
    storedCount: number
};

export type StoreTransactionsOperation = ErrorifyOperation<StoreTransactionsResult>;

class TransactionRepository extends AbstractRepository<ITransactionSchema>
{
    protected _getCollectionName(): string
    {
        return "thetransactions";
    }

    // Converts a TransactionResponse object to a ITransactionSchema object
    public transformTransaction(transaction: TransactionResponse): ITransactionSchema
    {
        return {
            _id: transaction.hash,
            ...transaction
        };
    }

    public transformTransactions(transactions: Array<TransactionResponse>): Array<ITransactionSchema>
    {
        return transactions.map(this.transformTransaction);
    }

    private async _storeTransactions(transactions: Array<ITransactionSchema>): Promise<StoreTransactionsResult>
    {
        const collection: Collection<ITransactionSchema> = await this._getCollection();
        const insertionResult: InsertWriteOpResult<WithId<ITransactionSchema>> = await collection.insertMany(transactions);

        return {
            storedTransactions: insertionResult.ops,
            storedCount: insertionResult.insertedCount
        };
    }

    public async storeTransactions(transactions: Array<ITransactionSchema>): Promise<ErrorifyOperation<StoreTransactionsResult>>
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

export const transactionRepository: TransactionRepository = new TransactionRepository();
