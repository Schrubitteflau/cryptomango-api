import { Schema } from "mongoose";

import { baseTokenSchemaSpecs, IBaseToken } from "./BaseTokenSchema";
import { notRequired, stringType } from "./PropertyValidators";

export interface IERC1155MultiToken extends IBaseToken
{
    name?: string | null;
    symbol?: string | null;
}

export const erc1155MultiTokenSchema = new Schema<IERC1155MultiToken>({
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
