import {
    assertValidBlockHash,
    assertValidChecksumAddress,
    assertValidContractBytecode,
    assertValidTransactionHash,
    toChecksumAddress
} from "@Util/TypeUtils/EVM";

import { IContractCreationTransaction } from "@Schemas";
import type { TransactionResponse, BlockWithTransactions } from "@Types/EthersTypes";
import { isNullOrUndefined, isUndefined } from "@Util/TypeUtils";

interface ISuccessfulFormatTransactionResult
{
    isSuccessful: true;
    contractCreationTransaction: IContractCreationTransaction;
}

interface IFailedFormatTransactionResult
{
    isSuccessful: false;
}

export type FormatTransactionResult = ISuccessfulFormatTransactionResult | IFailedFormatTransactionResult;

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
        return isNullOrUndefined(to);
    }

    public format(): IContractCreationTransaction
    {
        // The property "creates" is valid but does not appear in TypeScript definition
        const {
            hash: txHash,
            blockHash,
            from,
            data,
            creates
        } = this._transaction as (TransactionResponse & { "creates": string | undefined });

        // The transaction must have been mined and included in the this block
        // If the blockHashes are equals, we can rely on this._block properties
        if (blockHash !== this._block.hash)
        {
            throw new Error("Different block hashes");
        }

        // It's not a contract creation transaction
        if (!this._isToNull() || isUndefined(creates))
        {
            throw new Error("Not a contract creation transaction");
        }

        const contractAddress: string = toChecksumAddress(creates);
        const senderAddress: string = toChecksumAddress(from);
        const indexInBlock: number = this._block.transactions.indexOf(this._transaction);

        assertValidTransactionHash(txHash);
        assertValidBlockHash(blockHash);
        assertValidChecksumAddress(senderAddress);
        assertValidContractBytecode(data);
        assertValidChecksumAddress(contractAddress);

        return {
            hash: txHash,
            blockHash,
            blockNumber: this._block.number,
            from: senderAddress,
            creationBytecode: data,
            contractAddress,
            blockTimestamp: this._block.timestamp,
            indexInBlock: indexInBlock
        };
    }
}

export function format(tx: TransactionResponse, block: BlockWithTransactions): FormatTransactionResult
{
    try
    {
        const formatter = new TransactionResponseFormatter(tx, block);
        return {
            isSuccessful: true,
            contractCreationTransaction: formatter.format()
        }
    }
    catch (error)
    {
        return {
            isSuccessful: false
        };
    }
}
