import { Schema } from "mongoose";

import { BlockHash, BlockNumber, isValidBlockHash, isValidTransactionHash, TransactionHash } from "@Util/TypeUtils/EVM";
import { required, requiredPositiveInteger, requiredStringWithValidator, stringType, unique, validate } from "./PropertyValidators";
import { PositiveInteger } from "@Util/TypeUtils";

export interface IBlockWithTransactions
{
    // The id is the block number
    _id: BlockNumber;
    // Block number
    number: BlockNumber;
    // Block hash
    hash: BlockHash;
    // Timestamp when it was added to the blockchain (mined or validated)
    timestamp: PositiveInteger;
    // Transactions hashes
    transactions: ReadonlyArray<TransactionHash>;
    // Contract creation transactions hashes
    contractCreationTransactions: ReadonlyArray<TransactionHash>;
}

export const blockWithTransactionsSchema = new Schema<IBlockWithTransactions>({
    _id: {
        ...requiredPositiveInteger()
    },
    number: {
        unique: unique(),
        ...requiredPositiveInteger()
    },
    hash: {
        unique: unique(),
        ...requiredStringWithValidator(isValidBlockHash)
    },
    timestamp: requiredPositiveInteger(),
    transactions: {
        type: [{
            type: stringType(),
            required: required("Empty entry in transactions list"),
            validate: validate(isValidTransactionHash)
        }],
        required: required()
    },
    contractCreationTransactions: {
        type: [{
            type: stringType(),
            required: required("Empty entry in contractCreationTransactions list"),
            validate: validate(isValidTransactionHash)
        }],
        required: required()
    }
});
