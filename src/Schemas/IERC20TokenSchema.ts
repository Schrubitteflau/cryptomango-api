import { ChecksumAddress, TransactionHash } from "../EVM/Types";

export interface IERC20TokenSchema {
    // Address of the contract
    _id: ChecksumAddress,
    // Transaction which created this ERC20 contract
    tokenCreationTransaction: TransactionHash,
    // Decimals, null if decimals() function is not implemented
    decimals: number | null,
    // Name, null if name() function is not implemented
    name: string | null,
    // Symbol, null if symbol() function is not implemented
    symbol: string | null
}
