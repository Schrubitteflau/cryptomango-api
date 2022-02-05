import { Schema } from "mongoose";

import { BlockHash, isValidBlockHash, isValidTransactionHash, TransactionHash } from "@EVM/Types";
import { required, requiredPositiveInteger, requiredStringWithValidator, stringType, unique, validate } from "./PropertyValidators";

export interface IBlockWithTransactions
{
    // Block number
    number: number;
    // Block hash
    hash: BlockHash;
    // Timestamp when it was added to the blockchain (mined or validated)
    timestamp: number;
    // Transactions hashes
    transactions: ReadonlyArray<TransactionHash>;
    // Contract creation transactions hashes
    contractCreationTransactions: ReadonlyArray<TransactionHash>;
}

export const blockWithTransactionsSchema = new Schema<IBlockWithTransactions>({
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
