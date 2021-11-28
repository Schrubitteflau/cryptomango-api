import { ChecksumAddress, TransactionHash } from "@EVM/Types";

export interface ITokenSchema {
    // Address of the contract
    _id: ChecksumAddress;
    // Transaction which created this ERC20 contract
    creationTransaction: TransactionHash;
    // Timestamp when the transaction was added to the blockchain
    creationTimestamp: number;
    // Index of the creation transaction in his block
    creationTransactionIndex: number;
}
