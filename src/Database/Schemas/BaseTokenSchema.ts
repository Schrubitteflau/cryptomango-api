import { Schema } from "mongoose";

import { ChecksumAddress, isValidChecksumAddress, isValidTransactionHash, TransactionHash } from "@EVM/Types";
import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

export interface IBaseToken
{
    // Address of the contract
    address: ChecksumAddress;
    // Transaction which created this ERC20 contract
    creationTransaction: TransactionHash;
    // Timestamp when the transaction was added to the blockchain
    creationTimestamp: number;
    // Index of the creation transaction in his block
    creationTransactionIndex: number;
}

export const baseTokenSchema = new Schema<IBaseToken>({
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    creationTransaction: requiredStringWithValidator(isValidTransactionHash),
    creationTimestamp: requiredPositiveInteger(),
    creationTransactionIndex: requiredPositiveInteger()
});
