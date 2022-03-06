import { ChecksumAddress, isValidChecksumAddress, isValidTransactionHash, TransactionHash } from "@Util/TypeUtils/EVM";
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
    creationTimestamp: number;
    // Index of the creation transaction in his block
    creationTransactionIndex: number;
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
