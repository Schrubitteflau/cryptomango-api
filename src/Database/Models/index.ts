import { Model, model, Schema } from "mongoose";

import {
    blockWithTransactionsSchema,
    contractCreationTransactionSchema,
    erc20TokenSchema,
    erc721NFTSchema,
    erc1155MultiTokenSchema,
    userSchema
} from "@Schemas";

const nameSchemaMapping = {
    BlockWithTransactions: blockWithTransactionsSchema,
    ContractCreationTransaction: contractCreationTransactionSchema,
    ERC20Token: erc20TokenSchema,
    ERC721NFT: erc721NFTSchema,
    ERC1155MultiToken: erc1155MultiTokenSchema,
    User: userSchema
} as const;

type ExtractDataTypeFromSchema<T> = T extends Schema<infer U> ? U : never;

export function createModel<ModelName extends keyof typeof nameSchemaMapping>(
    name: ModelName,
    collectionName: string
): Model<ExtractDataTypeFromSchema<typeof nameSchemaMapping[ModelName]>>
{
    const schema: Schema = nameSchemaMapping[name];

    return model(
        name,
        schema,
        collectionName
    );
}
