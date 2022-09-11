import { PositiveInteger } from "@Util/TypeUtils";
import { ChecksumAddress, isValidChecksumAddress, isValidTransactionHash, TransactionHash } from "@Util/TypeUtils/EVM";
import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

export interface IBaseToken
{
    // The id is the address
    _id: ChecksumAddress;
    // Address of the contract
    address: ChecksumAddress;
    // Transaction which created this contract
    creationTransaction: TransactionHash;
    // Position (order) of the contract in the chain, compared to the others contracts
    // of the same type and in the same chain :
    // BLOCK_NUMBER * CONSTANT + TX_POSITION_IN_BLOCK
    position: PositiveInteger;
}
/* For the optional specific properties, such as name, symbol and decimals, the value follows this rule :
- undefined if the function() is not implemented by the contract
- null if an unhandled unknown error occured while calling the contract
- the value if the call worked properly
*/

export const baseTokenSchemaSpecs = {
    _id: requiredStringWithValidator(isValidChecksumAddress),
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    creationTransaction: requiredStringWithValidator(isValidTransactionHash),
    position: requiredPositiveInteger()
} as const;
