import type { BlockWithTransactions, TransactionResponse } from "@Types/EthersTypes";
import { logger } from "@Util";
import { assertValidPositiveInteger, PositiveInteger } from "@Util/TypeUtils";
import {
    assertValidBlockHash,
    assertValidBlockNumber,
    BlockHash,
    BlockNumber,
    TransactionHash
} from "@Util/TypeUtils/EVM";
import {
    factory as transactionResponseWrapperFactory,
    IContractCreationTransactionResponseWrapper,
    TransactionResponseWrapper
} from "./TransactionResponseWrapper";

export interface IValidatedData {
    number: BlockNumber;
    hash: BlockHash;
    timestamp: PositiveInteger;
}

class BlockWithTransactionsWrapperFactory {
    /**
     * @throws {AssertTypeError}
     */
    public create(blockWithTransactions: BlockWithTransactions): BlockWithTransactionsWrapper {
        const { number, hash, timestamp } = blockWithTransactions;

        assertValidBlockNumber(number);
        assertValidBlockHash(hash);
        assertValidPositiveInteger(timestamp);

        return new BlockWithTransactionsWrapper(blockWithTransactions, {
            number,
            hash,
            timestamp
        });
    }
}

class BlockWithTransactionsWrapper {
    private readonly _transactionWrappers: ReadonlyArray<TransactionResponseWrapper> =
        this._createTransactionWrappers();

    public constructor(
        private readonly _blockWithTransactions: BlockWithTransactions,
        private readonly _validatedData: IValidatedData
    ) {}

    public get number(): BlockNumber {
        return this._validatedData.number;
    }

    public get hash(): BlockHash {
        return this._validatedData.hash;
    }

    public get timestamp(): PositiveInteger {
        return this._validatedData.timestamp;
    }

    private _createTransactionWrappers(): ReadonlyArray<TransactionResponseWrapper> {
        const transactionWrappers: Array<TransactionResponseWrapper> = [];

        for (const tx of this._blockWithTransactions.transactions) {
            try {
                transactionWrappers.push(transactionResponseWrapperFactory.create(tx, this));
            } catch (error) {
                //@TODO mieux
                logger.error(
                    `BlockWithTransactionsWrapper : Invalid tx ${tx.hash} at block #${this.number}, error : ${error}`
                );
            }
        }

        return transactionWrappers;
    }

    /**
     * @param tx The TransactionResponse object to search
     * @returns The index of the the transaction in the block, or -1 if it is not present
     */
    public getIndexOfTransaction(tx: TransactionResponse): number {
        return this._blockWithTransactions.transactions.indexOf(tx);
    }

    public getAllTransactionHashes(): ReadonlyArray<TransactionHash> {
        return this._transactionWrappers.map((tx: TransactionResponseWrapper) => tx.hash);
    }

    public getContractCreationTransactions(): ReadonlyArray<IContractCreationTransactionResponseWrapper> {
        const contractCreationTransactions: Array<IContractCreationTransactionResponseWrapper> = [];

        // No filter here because the type changes from TransactionResponseWrapper to IContractCreationTransactionResponseWrapper
        for (const transaction of this._transactionWrappers) {
            if (transaction.isContractCreation()) {
                contractCreationTransactions.push(transaction);
            }
        }

        return contractCreationTransactions;
    }

    public getContractCreationTransactionsHashes(): ReadonlyArray<TransactionHash> {
        return this.getContractCreationTransactions().map((tx: TransactionResponseWrapper) => tx.hash);
    }
}

export type { BlockWithTransactionsWrapper, BlockWithTransactionsWrapperFactory };

export const factory: BlockWithTransactionsWrapperFactory = new BlockWithTransactionsWrapperFactory();
