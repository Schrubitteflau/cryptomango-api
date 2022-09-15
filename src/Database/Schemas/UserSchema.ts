import { ContractType } from "@EVM/ContractsWrappers";
import { PositiveInteger } from "@Util/TypeUtils";
import { ChainId, ChecksumAddress, isValidChecksumAddress } from "@Util/TypeUtils/EVM";
import { Schema } from "mongoose";

import { required, requiredPositiveInteger, requiredStringWithValidator, unique } from "./PropertyValidators";

export type ChainSwipeState = {
    // Key => type of the contract, Value => last seen position (see IBaseToken["position"])
    [key in ContractType]: PositiveInteger;
};

const chainSwipeStateSchema = new Schema<ChainSwipeState>({
    ERC20: requiredPositiveInteger(),
    ERC721: requiredPositiveInteger(),
    ERC1155: requiredPositiveInteger()
});

export interface IUser {
    address: ChecksumAddress;
    swipeState: {
        [key: ChainId]: ChainSwipeState;
    };
}

export const userSchema = new Schema<IUser>(
    {
        address: {
            unique: unique(),
            ...requiredStringWithValidator(isValidChecksumAddress)
        },
        swipeState: {
            required: required(),
            type: Schema.Types.Map,
            of: chainSwipeStateSchema
        }
    },
    {
        timestamps: true
    }
);
