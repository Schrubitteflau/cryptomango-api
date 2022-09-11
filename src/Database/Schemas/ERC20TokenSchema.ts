import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, numberType, stringType } from "./PropertyValidators";

export interface IERC20Token extends IBaseToken
{
    decimals?: number | null;
    name?: string | null;
    symbol?: string | null;
}

export const erc20TokenSchema = new Schema<IERC20Token>({
    ...baseTokenSchemaSpecs,
    decimals: {
        type: numberType(),
        ...notRequired()
    },
    name: {
        type: stringType(),
        ...notRequired()
    },
    symbol: {
        type: stringType(),
        ...notRequired()
    }
});
