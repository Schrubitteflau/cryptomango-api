import { assertValidBlockHash, assertValidTransactionHash, BlockHash, TransactionHash } from "@EVM/Types";
import { IBlockWithTransactionsSchema, IContractCreationTransactionSchema } from "@Schemas";
import { TransactionResponseFormatter } from "./TransactionResponseFormatter";

import type { BlockWithTransactions, TransactionResponse } from "@Types/EthersTypes";

export type FormatBlockReturn = {
    block: IBlockWithTransactionsSchema,
    contractCreationTransactions: Array<IContractCreationTransactionSchema>
};

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

    private _extractContractCreationTransactions(): Array<IContractCreationTransactionSchema>
    {
        const txs: Array<TransactionResponse> = this._blockWithTransactions.transactions;
        const contractCreationTxs: Array<IContractCreationTransactionSchema> = [];

        // More efficient than map() and then filter()
        for (const tx of txs)
        {
            const formatter = new TransactionResponseFormatter(tx, this._blockWithTransactions);
            const formatted = formatter.format();

            if (formatted !== null)
            {
                contractCreationTxs.push(formatted);
            }
        }

        return contractCreationTxs;
    }

    private _extractAllTransactionHashes(): Array<TransactionHash>
    {
        const txs: Array<TransactionResponse> = this._blockWithTransactions.transactions;

        return txs.map((tx: TransactionResponse) =>
        {
            const { hash } = tx;
            assertValidTransactionHash(hash);
            return hash;
        });
    }

    public format(): FormatBlockReturn
    {
        const contractCreationTxs: Array<IContractCreationTransactionSchema> = this._extractContractCreationTransactions();
        const contractCreationTxsHashes: Array<TransactionHash> = contractCreationTxs.map((tx: IContractCreationTransactionSchema) => tx._id);
        const allTxsHashes: Array<TransactionHash> = this._extractAllTransactionHashes();

        const formattedBlock: IBlockWithTransactionsSchema = {
            _id: this._blockNumber,
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
    const formatter = new BlockWithTransactionsFormatter(blockWithTransactions);
    return formatter.format();
}

export function formatBulk(blockWithTransactions: Array<BlockWithTransactions>): Array<FormatBlockReturn>
{
    return blockWithTransactions.map((block: BlockWithTransactions) => format(block));
}
