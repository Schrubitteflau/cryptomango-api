import { Model, model, Schema } from "mongoose";

import {
    IBlockWithTransactions, blockWithTransactionsSchema,
    IContractCreationTransaction, contractCreationTransactionSchema,
    ITokenSwipe, tokenSwipeSchema,
    IERC20Token, erc20TokenSchema,
    IERC721NFT, erc721NFTSchema,
    IERC1155MultiToken, erc1155MultiTokenSchema,
    IUser, userSchema
} from "@Schemas";

const nameSchemaMapping = {
    BlockWithTransactions: blockWithTransactionsSchema,
    ContractCreationTransaction: contractCreationTransactionSchema,
    TokenSwipe: tokenSwipeSchema,
    ERC20Token: erc20TokenSchema,
    ERC721NFT: erc721NFTSchema,
    ERC1155MultiToken: erc1155MultiTokenSchema,
    User: userSchema
} as const;

type ModelName = keyof typeof nameSchemaMapping;

export function createModel(name: "BlockWithTransactions", collectionName: string): Model<IBlockWithTransactions>;
export function createModel(name: "ContractCreationTransaction", collectionName: string): Model<IContractCreationTransaction>;
export function createModel(name: "TokenSwipe", collectionName: string): Model<ITokenSwipe>;
export function createModel(name: "ERC20Token", collectionName: string): Model<IERC20Token>;
export function createModel(name: "ERC721NFT", collectionName: string): Model<IERC721NFT>;
export function createModel(name: "ERC1155MultiToken", collectionName: string): Model<IERC1155MultiToken>;
export function createModel(name: "User", collectionName: string): Model<IUser>;

export function createModel<T>(name: ModelName, collectionName: string): Model<T>
{
    const schema: Schema = nameSchemaMapping[name];

    return model<T>(
        name,
        schema,
        collectionName
    );
}
