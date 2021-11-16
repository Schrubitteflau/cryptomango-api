import { ChecksumAddress, TransactionHash } from "@EVM/Types";

export interface IERC1155TokenSchema {
    // Address of the contract
    _id: ChecksumAddress,
    // Transaction which created this ERC20 contract
    creationTransaction: TransactionHash,
    // Timestamp when the transaction was added to the blockchain
    creationTimestamp: number,
    // Name, null if name() function is not implemented
    name: string | null,
    // Symbol, null if symbol() function is not implemented
    symbol: string | null
}
