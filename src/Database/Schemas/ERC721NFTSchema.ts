import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, stringType } from "./PropertyValidators";

export interface IERC721NFT extends IBaseToken
{
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}

export const erc721NFTSchema = new Schema<IERC721NFT>({
    ...baseTokenSchemaSpecs,
    name: {
        type: stringType(),
        ...notRequired(null)
    },
    symbol: {
        type: stringType(),
        ...notRequired(null)
    }
});
