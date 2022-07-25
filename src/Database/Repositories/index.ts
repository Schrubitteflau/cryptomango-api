export type { InsertBuffer, ValidationResult } from "./AbstractRepository";
import { BlockWithTransactionsRepository } from "./BlockWithTransactionsRepository";
import { ContractCreationTransactionRepository } from "./ContractCreationTransactionRepository";
import { ERC1155MultiTokenRepository } from "./ERC1155MultiTokenRepository";
import { ERC20TokenRepository } from "./ERC20TokenRepository";
import { ERC721NFTRepository } from "./ERC721NFTRepository";
import { TokenSwipeRepository } from "./TokenSwipeRepository";
import { UserRepository } from "./UserRepository";

const globalRepositories = {
    User: new UserRepository("users")
} as const;

const networkRelatedRepositories = {
    BlockWithTransactions: BlockWithTransactionsRepository,
    ContractCreationTransaction: ContractCreationTransactionRepository,
    TokenSwipe: TokenSwipeRepository,
    ERC20Token: ERC20TokenRepository,
    ERC721NFT: ERC721NFTRepository,
    ERC1155MultiToken: ERC1155MultiTokenRepository
} as const;

type GlobalRepositoryName = keyof typeof globalRepositories;
type NetworkRelatedRepositoryName = keyof typeof networkRelatedRepositories;

export function createNetworkRelatedRepository<T extends NetworkRelatedRepositoryName>(name: T, collectionName: string): InstanceType<typeof networkRelatedRepositories[T]>
{
    const repository = networkRelatedRepositories[name];
    return (new repository(collectionName) as any);
}

export function getGlobalRepository<T extends GlobalRepositoryName>(name: T): typeof globalRepositories[T]
{
    return globalRepositories[name];
}

export {
    BlockWithTransactionsRepository,
    ContractCreationTransactionRepository,
    TokenSwipeRepository,
    UserRepository,
    ERC20TokenRepository,
    ERC721NFTRepository,
    ERC1155MultiTokenRepository
};
