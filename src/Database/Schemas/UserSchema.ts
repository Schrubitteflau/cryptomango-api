import { PositiveInteger } from "@Util/TypeUtils";
import { ChainId, ChecksumAddress, isValidChecksumAddress } from "@Util/TypeUtils/EVM";
import { Schema } from "mongoose";

import { requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

// @TODO mettre dans autre fichier et utiliser dans basetokenschema ?
interface IChainSwipeState {
    creationTimestamp: PositiveInteger;
    creationTransactionIndex: PositiveInteger;
}

const chainSwipeStateSchema = new Schema<IChainSwipeState>({
    creationTimestamp: {
        ...requiredPositiveInteger()
    },
    creationTransactionIndex: {
        ...requiredPositiveInteger()
    }
});

export interface IUser
{
    address: ChecksumAddress;
    swipeState: {
        [key: ChainId]: IChainSwipeState;
    };
}

export const userSchema = new Schema<IUser>({
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    swipeState: {
        type: Schema.Types.Map,
        of: chainSwipeStateSchema
    }
}, {
    timestamps: true
});
