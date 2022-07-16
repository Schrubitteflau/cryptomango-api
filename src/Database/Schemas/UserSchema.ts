import { ContractType } from "@EVM/ContractsWrappers";
import { PositiveInteger, PositiveIntegerOrZero } from "@Util/TypeUtils";
import { ChainId, ChecksumAddress, isValidChecksumAddress } from "@Util/TypeUtils/EVM";
import { Schema } from "mongoose";

import { required, requiredPositiveInteger, requiredPositiveIntegerOrZero, requiredStringWithValidator, unique } from "./PropertyValidators";


export interface IChainContractSwipeState {
    creationTimestamp: PositiveInteger;
    creationTransactionIndex: PositiveIntegerOrZero;
}

const chainContractSwipeStateSchema = new Schema<IChainContractSwipeState>({
    creationTimestamp: {
        ...requiredPositiveInteger()
    },
    creationTransactionIndex: {
        ...requiredPositiveIntegerOrZero()
    }
});

export type ChainSwipeState = {
    [key in ContractType]: IChainContractSwipeState;
}

const chainSwipeStateSchema = new Schema<ChainSwipeState>({
    ERC20: {
        required: required(),
        type: chainContractSwipeStateSchema
    },
    ERC721: {
        required: required(),
        type: chainContractSwipeStateSchema
    },
    ERC1155: {
        required: required(),
        type: chainContractSwipeStateSchema
    }
});

export interface IUser
{
    address: ChecksumAddress;
    swipeState: {
        [key: ChainId]: ChainSwipeState;
    };
}

export const userSchema = new Schema<IUser>({
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    },
    swipeState: {
        required: required(),
        type: Schema.Types.Map,
        of: chainSwipeStateSchema
    }
}, {
    timestamps: true
});
