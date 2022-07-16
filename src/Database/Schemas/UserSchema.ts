import { ContractType } from "@EVM/BytecodeAnalyzer";
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

export interface IChainSwipeState {
    [ContractType.ERC20Token]: IChainContractSwipeState;
    [ContractType.ERC721NFT]: IChainContractSwipeState;
    [ContractType.ERC1155MultiToken]: IChainContractSwipeState;
}

const chainSwipeStateSchema = new Schema<IChainSwipeState>({
    [ContractType.ERC20Token]: {
        required: required(),
        type: chainContractSwipeStateSchema
    },
    [ContractType.ERC721NFT]: {
        required: required(),
        type: chainContractSwipeStateSchema
    },
    [ContractType.ERC1155MultiToken]: {
        required: required(),
        type: chainContractSwipeStateSchema
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
        required: required(),
        type: Schema.Types.Map,
        of: chainSwipeStateSchema
    }
}, {
    timestamps: true
});
