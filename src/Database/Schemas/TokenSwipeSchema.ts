import { Schema, PopulatedDoc } from "mongoose";

import { IUser } from "./UserSchema";
import { required, requiredPositiveInteger, unique } from "./PropertyValidators";

interface ITokenSwipePayload
{
    creationTimestamp: number;
    creationTransactionIndex: number;
}

export interface ITokenSwipe
{
    user: PopulatedDoc<IUser>;    
    erc20: ITokenSwipePayload;
    erc721: ITokenSwipePayload;
    erc1155: ITokenSwipePayload;
}

// Same data model erc20, erc721 and erc1155
const tokenSwipePayloadSchema = {
    creationTimestamp: requiredPositiveInteger(),
    creationTransactionIndex: requiredPositiveInteger()
};

export const tokenSwipeSchema = new Schema<ITokenSwipe>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: required(),
        unique: unique()
    },
    erc20: tokenSwipePayloadSchema,
    erc721: tokenSwipePayloadSchema,
    erc1155: tokenSwipePayloadSchema
});
