import {
    assertValidContractBytecode,
    assertValidTransactionHash,
    BlockHash,
    BlockNumber,
    ChecksumAddress,
    ContractBytecode,
    toChecksumAddress,
    TransactionHash
} from "@Util/TypeUtils/EVM";

import { IContractCreationTransaction } from "@Schemas";
import type { TransactionResponse } from "@Types/EthersTypes";
import { isNullOrUndefined, isUndefined, PositiveInteger } from "@Util/TypeUtils";
import { BlockWithTransactionsWrapper } from "./BlockWithTransactionsWrapper";
import { assertValidPositiveIntegerOrZero, PositiveIntegerOrZero } from "@Util/TypeUtils/PositiveInteger";

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

interface INotContractCreation {
    isContractCreation: false;
}

interface IContractCreation {
    isContractCreation: true;
    contractAddress: ChecksumAddress;
    contractBytecode: ContractBytecode;
}

export type IsContractCreationReturn = INotContractCreation | IContractCreation;

export interface IValidatedData
{
    hash: TransactionHash;
    from: ChecksumAddress;
    indexInBlock: PositiveIntegerOrZero;
}

export class ValidationError extends Error
{
    public constructor
    (
        message: string
    )
    {
        super(message);
        this.name = "ValidationError";
    }
}

class TransactionResponseWrapperFactory
{
    /**
     * @throws {AssertTypeError}
     * @throws {ValidationError}
     */
    public create(transaction: TransactionResponse, block: BlockWithTransactionsWrapper): TransactionResponseWrapper
    {
        const { hash, from, blockHash } = transaction;
        const indexInBlock: number = block.getIndexOfTransaction(transaction);

        // The transaction must have been mined and included in the this block
        // If the blockHashes are equals, we can rely on the properties of block
        if (blockHash !== block.hash)
        {
            throw new ValidationError("Different block hashes");
        }

        assertValidTransactionHash(hash);
        // If not found, then indexInBlock = -1 and the assertion fails
        assertValidPositiveIntegerOrZero(indexInBlock);

        return new TransactionResponseWrapper(transaction, block, {
            hash,
            from: toChecksumAddress(from),
            indexInBlock
        });
    }
}

export interface IContractCreationTransactionResponseWrapper extends TransactionResponseWrapper {
    contractAddress: ChecksumAddress;
    contractBytecode: ContractBytecode;
}

class TransactionResponseWrapper
{
    private _isContractCreationData: IsContractCreationReturn | null = null;

    public constructor
    (
        private readonly _transaction: TransactionResponse,
        private readonly _block: BlockWithTransactionsWrapper,
        private readonly _validatedData: IValidatedData
    ) {}

    public get hash(): TransactionHash
    {
        return this._validatedData.hash;
    }

    public get from(): ChecksumAddress
    {
        return this._validatedData.from;
    }

    public get blockHash(): BlockHash
    {
        return this._block.hash;
    }

    public get blockNumber(): BlockNumber
    {
        return this._block.number;
    }

    public get blockTimestamp(): PositiveInteger
    {
        return this._block.timestamp;
    }

    public get indexInBlock(): PositiveIntegerOrZero
    {
        return this._validatedData.indexInBlock;
    }

    private get _contractCreationData(): IsContractCreationReturn
    {
        if (this._isContractCreationData === null)
        {
            this._isContractCreationData = this._isContractCreation();
        }
        return this._isContractCreationData;
    }

    /* contractCreationData shortcuts */

    public get contractAddress(): ChecksumAddress | null
    {
        return (this._contractCreationData.isContractCreation ? this._contractCreationData.contractAddress : null);
    }

    public get contractBytecode(): ContractBytecode | null
    {
        return (this._contractCreationData.isContractCreation ? this._contractCreationData.contractBytecode : null);
    }

    public isContractCreation(): this is IContractCreationTransactionResponseWrapper
    {
        return this._contractCreationData.isContractCreation;
    }

    private _isContractCreation(): IsContractCreationReturn
    {
        /* https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#index-8
        If the target account is not set (the transaction does not have a recipient or the recipient is set to null),
        the transaction creates a new contract */

        // The property "creates" is valid but does not appear in TypeScript definition
        const { to, creates, data } = this._transaction as (TransactionResponse & { creates?: string; });

        if (isNullOrUndefined(to) && !isUndefined(creates))
        {
            try
            {
                assertValidContractBytecode(data);
                return {
                    isContractCreation: true,
                    contractAddress: toChecksumAddress(creates),
                    contractBytecode: data
                };
            }
            catch (error)
            {
                return {
                    isContractCreation: false
                };
            }
        }

        return {
            isContractCreation: false
        };
    }
}

export type { TransactionResponseWrapper, TransactionResponseWrapperFactory };

export const factory: TransactionResponseWrapperFactory = new TransactionResponseWrapperFactory();
