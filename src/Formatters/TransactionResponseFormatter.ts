import {
    assertValidBlockHash,
    assertValidChecksumAddress,
    assertValidContractBytecode,
    assertValidTransactionHash,
    toChecksumAddress
} from "@EVM/Types";

import type { IContractCreationTransactionSchema } from "@Schemas";
import type { TransactionResponse, BlockWithTransactions } from "@Types/EthersTypes";

export class TransactionResponseFormatter
{
    public constructor
    (
        private readonly _transaction: TransactionResponse,
        private readonly _block: BlockWithTransactions
    ) { }

    private _isToNull(): boolean
    {
        const { to } = this._transaction;

        /* https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#index-8
        If the target account is not set (the transaction does not have a recipient or the recipient is set to null),
        the transaction creates a new contract */
        return (to === null || typeof(to) === "undefined");
    }

    public format(): IContractCreationTransactionSchema | null
    {
        // The property "creates" is valid but does not appear in TypeScript definition
        const {
            hash: txHash,
            blockHash,
            from,
            data,
            creates
        } = this._transaction as (TransactionResponse & { "creates": string | undefined });

        // The transaction must have been mined an included in the this block
        // If the condition if false, we can rely on this._block properties
        if (blockHash !== this._block.hash)
        {
            return null;
        }

        // It's not a contract creation transaction
        if (!this._isToNull() || typeof(creates) === "undefined")
        {
            return null;
        }

        try
        {
            const contractAddress = toChecksumAddress(creates);
            const senderAddress = toChecksumAddress(from);

            assertValidTransactionHash(txHash);
            assertValidBlockHash(blockHash);
            assertValidChecksumAddress(senderAddress);
            assertValidContractBytecode(data);
            assertValidChecksumAddress(contractAddress);

            return {
                _id: txHash,
                blockHash,
                blockNumber: this._block.number,
                from: senderAddress,
                creationBytecode: data,
                contractAddress,
                blockTimestamp: this._block.timestamp
            };
        }
        catch (e)
        {
            return null;
        }
    }
}

export function format(tx: TransactionResponse, block: BlockWithTransactions): IContractCreationTransactionSchema | null
{
    const formatter = new TransactionResponseFormatter(tx, block);
    return formatter.format();
}

export function formatBulk(tx: Array<TransactionResponse>, block: BlockWithTransactions): Array<IContractCreationTransactionSchema | null>
{
    return tx.map((tx: TransactionResponse) => format(tx, block));
}
