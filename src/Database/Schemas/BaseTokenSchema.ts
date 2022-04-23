import { PositiveInteger } from "@Util/TypeUtils";
import { ChecksumAddress, isValidChecksumAddress, isValidTransactionHash, TransactionHash } from "@Util/TypeUtils/EVM";
import { PositiveIntegerOrZero } from "@Util/TypeUtils/PositiveInteger";
import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

export interface IBaseToken
{
    // The id is the address
    _id: ChecksumAddress;
    // Address of the contract
    address: ChecksumAddress;
    // Transaction which created this ERC20 contract
    creationTransaction: TransactionHash;
    // Timestamp when the transaction was added to the blockchain
    creationTimestamp: PositiveInteger;
    // Index of the creation transaction in its block (0 for the first, 1 for the second...)
    creationTransactionIndex: PositiveIntegerOrZero;
}

export const baseTokenSchemaSpecs = {
    _id: {
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    creationTransaction: requiredStringWithValidator(isValidTransactionHash),
    creationTimestamp: requiredPositiveInteger(),
    creationTransactionIndex: requiredPositiveInteger()
} as const;
