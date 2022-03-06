import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, stringType } from "./PropertyValidators";

export interface IERC1155MultiToken extends IBaseToken
{
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}

export const erc1155MultiTokenSchema = new Schema<IERC1155MultiToken>({
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
