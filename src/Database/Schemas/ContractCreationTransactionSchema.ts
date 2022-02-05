import { Schema } from "mongoose";

import { ContractBytecode, ChecksumAddress, TransactionHash, BlockHash, isValidTransactionHash, isValidBlockHash, isValidChecksumAddress, isValidContractBytecode } from "@EVM/Types";
import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

// Schema of a transaction which results in a contract creation
export interface IContractCreationTransaction
{
    // Hash of the transaction
    hash: TransactionHash;
    // Hash of the block
    blockHash: BlockHash;
    // Number of the block
    blockNumber: number;
    // Address of the sender
    from: ChecksumAddress;
    // Bytecode of contract creation
    creationBytecode: ContractBytecode;
    // Address of the created contract
    contractAddress: ChecksumAddress;
    // Timestamp of the block where the transaction was mined
    blockTimestamp: number;
    // Index of the transaction in the block (0 for the first, 1 for the second...)
    indexInBlock: number;
}

export const contractCreationTransactionSchema = new Schema<IContractCreationTransaction>({
    hash: {
        unique: unique(),
        ...requiredStringWithValidator(isValidTransactionHash)
    },
    blockHash: requiredStringWithValidator(isValidBlockHash),
    blockNumber: {
        unique: unique(),
        ...requiredPositiveInteger()
    },
    from: requiredStringWithValidator(isValidChecksumAddress),
    creationBytecode: requiredStringWithValidator(isValidContractBytecode),
    contractAddress: requiredStringWithValidator(isValidChecksumAddress),
    blockTimestamp: requiredPositiveInteger(),
    indexInBlock: requiredPositiveInteger()
});
