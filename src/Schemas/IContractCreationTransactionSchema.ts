import { ContractBytecode, ChecksumAddress, TransactionHash, BlockHash } from "../EVM/Types";

// Schema of a transaction which results in a contract creation
export interface IContractCreationTransactionSchema {
    // Hash of the transaction
    _id: TransactionHash,
    // Hash of the block
    blockHash: BlockHash,
    // Number of the block
    blockNumber: number,
    // Address of the sender
    from: ChecksumAddress,
    // Bytecode of contract creation
    creationBytecode: ContractBytecode,
    // Address of the created contract
    contractAddress: ChecksumAddress,
    // Timestamp of the block where the transaction was mined
    blockTimestamp: number
}
