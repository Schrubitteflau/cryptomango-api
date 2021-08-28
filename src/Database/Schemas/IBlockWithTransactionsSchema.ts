import { BlockHash, TransactionHash } from "@EVM/Types";

export interface IBlockWithTransactionsSchema {
    // Block number
    _id: number,
    // Block hash
    hash: BlockHash,
    // Timestamp when it was added to the blockchain (mined or validated)
    timestamp: number,
    // Transactions hashes
    transactions: Array<TransactionHash>,
    // Contract creation transactions hashes
    contractCreationTransactions: Array<TransactionHash>
}
