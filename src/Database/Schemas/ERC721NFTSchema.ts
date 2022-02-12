import { Schema } from "mongoose";

import { isValidChecksumAddress, isValidTransactionHash } from "@Util/TypeUtils/EVM";
import { IBaseToken } from "./BaseTokenSchema";
import { notRequired, requiredPositiveInteger, requiredStringWithValidator, stringType, unique } from "./PropertyValidators";

export interface IERC721NFT extends IBaseToken
{
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}

export const erc721NFTSchema = new Schema<IERC721NFT>({
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
