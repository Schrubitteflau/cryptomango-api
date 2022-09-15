import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, stringType } from "./PropertyValidators";

export interface IERC721NFT extends IBaseToken {
    name?: string | null;
    symbol?: string | null;
}

export const erc721NFTSchema = new Schema<IERC721NFT>({
    ...baseTokenSchemaSpecs,
    name: {
        type: stringType(),
        ...notRequired()
    },
    symbol: {
        type: stringType(),
        ...notRequired()
    }
});
