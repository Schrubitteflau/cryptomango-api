import { assertValidBlockHash, assertValidTransactionHash, BlockHash, TransactionHash } from "@Util/TypeUtils/EVM";
import { format as formatContractCreationTransaction, FormatTransactionResult } from "./TransactionResponseFormatter";

import type { BlockWithTransactions, TransactionResponse } from "@Types/EthersTypes";
import { IBlockWithTransactions, IContractCreationTransaction } from "@Schemas";
import { toError } from "@Util/TypeUtils";

interface IFormatResult
{
    block: IBlockWithTransactions;
    contractCreationTransactions: ReadonlyArray<IContractCreationTransaction>;
}

interface ISuccessfulFormatBlockReturn extends IFormatResult
{
    isSuccessful: true;
}

interface IFailedFormatBlockReturn
{
    isSuccessful: false;
    error: Error;
}

export type FormatBlockReturn = ISuccessfulFormatBlockReturn | IFailedFormatBlockReturn;

export class BlockWithTransactionsFormatter
{
    public constructor
    (
        private readonly _blockWithTransactions: BlockWithTransactions
    ) { }

    private get _blockNumber(): number
    {
        return this._blockWithTransactions.number;
    }

    private get _blockHash(): BlockHash
    {
        const { hash } = this._blockWithTransactions;
        assertValidBlockHash(hash);
        return hash;
    }

    private get _timestamp(): number
    {
        return this._blockWithTransactions.timestamp;
    }

    private _extractContractCreationTransactions(): Array<IContractCreationTransaction>
    {
        const txs: Array<TransactionResponse> = this._blockWithTransactions.transactions;
        const contractCreationTxs: Array<IContractCreationTransaction> = [];

        for (const tx of txs)
        {
            const result: FormatTransactionResult = formatContractCreationTransaction(tx, this._blockWithTransactions);

            if (result.isSuccessful)
            {
                contractCreationTxs.push(result.contractCreationTransaction);
            }
        }

        return contractCreationTxs;
    }

    private _extractAllTransactionHashes(): ReadonlyArray<TransactionHash>
    {
        const txs: ReadonlyArray<TransactionResponse> = this._blockWithTransactions.transactions;

        return txs.map((tx: TransactionResponse) =>
        {
            const { hash } = tx;
            assertValidTransactionHash(hash);
            return hash;
        });
    }

    public format(): IFormatResult
    {
        const contractCreationTxs: ReadonlyArray<IContractCreationTransaction> = this._extractContractCreationTransactions();
        const contractCreationTxsHashes: ReadonlyArray<TransactionHash> = contractCreationTxs.map((tx: IContractCreationTransaction) => tx.hash);
        const allTxsHashes: ReadonlyArray<TransactionHash> = this._extractAllTransactionHashes();

        const formattedBlock: IBlockWithTransactions = {
            _id: this._blockNumber,
            number: this._blockNumber,
            hash: this._blockHash,
            timestamp: this._timestamp,
            transactions: allTxsHashes,
            contractCreationTransactions: contractCreationTxsHashes
        };

        return {
            block: formattedBlock,
            contractCreationTransactions: contractCreationTxs
        };
    }
}

export function format(blockWithTransactions: BlockWithTransactions): FormatBlockReturn
{
    try
    {
        const formatter = new BlockWithTransactionsFormatter(blockWithTransactions);

        return {
            isSuccessful: true,
            ...formatter.format()
        };
    }
    catch (error)
    {
        return {
            isSuccessful: false,
            error: toError(error)
        }
    }
}
