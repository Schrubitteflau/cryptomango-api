import { Collection, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractRepository } from "./AbstractRepository";

import type { TransactionResponse } from "../Types/EthersTypes";
import { ErrorifyOperation } from "../Types";
import { toError } from "../Util";


export interface ITransactionSchema extends Omit<TransactionResponse, "confirmations"> {
    // Hash of the transaction
    _id: string,
    // Timestamp of the block in which is included the transaction
    blockTimestamp: number
}

export type StoreTransactionsResult = {
    storedTransactions: Array<ITransactionSchema>,
    storedCount: number
};

export type StoreTransactionsOperation = ErrorifyOperation<StoreTransactionsResult>;

export class TransactionRepository extends AbstractRepository<ITransactionSchema>
{
    public constructor(collectionName: string)
    {
        super(collectionName);
    }

    // Converts a TransactionResponse object to a ITransactionSchema object
    public transformTransaction(transaction: TransactionResponse, blockTimestamp: number): ITransactionSchema
    {
        return {
            ...transaction,
            _id: transaction.hash,
            blockTimestamp
        };
    }

    public transformTransactionsOfTheSameBlock(transactions: Array<TransactionResponse>, blockTimestamp: number): Array<ITransactionSchema>
    {
        return transactions.map((transaction: TransactionResponse) => this.transformTransaction(transaction, blockTimestamp));
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
