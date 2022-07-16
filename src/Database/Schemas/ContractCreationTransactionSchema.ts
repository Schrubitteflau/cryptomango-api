import { Schema } from "mongoose";

import { ContractBytecode, ChecksumAddress, TransactionHash, BlockHash, isValidTransactionHash, isValidBlockHash, isValidChecksumAddress, isValidContractBytecode, BlockNumber } from "@Util/TypeUtils/EVM";
import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";
import { PositiveInteger, PositiveIntegerOrZero } from "@Util/TypeUtils";

// Schema of a transaction which results in a contract creation
export interface IContractCreationTransaction
{
    // The id is the hash of the transaction
    _id: TransactionHash;
    // Hash of the transaction
    hash: TransactionHash;
    // Hash of the block
    blockHash: BlockHash;
    // Number of the block
    blockNumber: BlockNumber;
    // Address of the sender
    from: ChecksumAddress;
    // Bytecode of contract creation
    creationBytecode: ContractBytecode;
    // Address of the created contract
    contractAddress: ChecksumAddress;
    // Timestamp of the block where the transaction was mined
    blockTimestamp: PositiveInteger;
    // Index of the transaction in the block (0 for the first, 1 for the second...)
    indexInBlock: PositiveIntegerOrZero;
}

export const contractCreationTransactionSchema = new Schema<IContractCreationTransaction>({
    _id: {
        ...requiredStringWithValidator(isValidTransactionHash)
    },
    hash: {
        unique: unique(),
        ...requiredStringWithValidator(isValidTransactionHash)
    },
    blockHash: requiredStringWithValidator(isValidBlockHash),
    blockNumber: {
        ...requiredPositiveInteger()
    },
    from: requiredStringWithValidator(isValidChecksumAddress),
    creationBytecode: requiredStringWithValidator(isValidContractBytecode),
    contractAddress: requiredStringWithValidator(isValidChecksumAddress),
    blockTimestamp: requiredPositiveInteger(),
    indexInBlock: requiredPositiveInteger()
});
