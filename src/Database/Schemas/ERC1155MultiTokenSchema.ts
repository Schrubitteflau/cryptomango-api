import { Schema } from "mongoose";

import { isValidChecksumAddress, isValidTransactionHash } from "@EVM/Types";
import { IBaseToken } from "./BaseTokenSchema";
import { notRequired, requiredPositiveInteger, requiredStringWithValidator, stringType, unique } from "./PropertyValidators";

export interface IERC1155MultiToken extends IBaseToken
{
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}

export const erc1155MultiTokenSchema = new Schema<IERC1155MultiToken>({
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    creationTransaction: requiredStringWithValidator(isValidTransactionHash),
    creationTimestamp: requiredPositiveInteger(),
    creationTransactionIndex: requiredPositiveInteger(),
    name: {
        type: stringType(),
        ...notRequired(null)
    },
    symbol: {
        type: stringType(),
        ...notRequired(null)
    }
});
