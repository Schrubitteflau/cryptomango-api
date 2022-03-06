import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, numberType, stringType } from "./PropertyValidators";

export interface IERC20Token extends IBaseToken
{
    // Decimals, null if decimals() function is not implemented
    decimals: number | null;
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}

export const erc20TokenSchema = new Schema<IERC20Token>({
    ...baseTokenSchemaSpecs,
    decimals: {
        type: numberType(),
        ...notRequired(null)
    },
    name: {
        type: stringType(),
        ...notRequired(null)
    },
    symbol: {
        type: stringType(),
        ...notRequired(null)
    }
});
