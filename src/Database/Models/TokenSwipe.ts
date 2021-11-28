import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
const uniqueValidator = require("mongoose-unique-validator");

interface ITokenSwipeTokenModel
{
    creationTimestamp: number;
    creationTransactionIndex: number;
}

export interface ITokenSwipe
{
    user: PopulatedDoc<IUser>;    
    erc20: ITokenSwipeTokenModel;
    erc721: ITokenSwipeTokenModel;
    erc1155: ITokenSwipeTokenModel;
}

// The data model is the same of erc20, erc721 and erc1155
const tokenSwipeTokenModel = {
    creationTimestamp: {
        type: Schema.Types.Number,
        min: 0,
        required: true
    },
    creationTransactionIndex: {
        type: Schema.Types.Number,
        min: 0,
        required: true
    }
};

const tokenSwipeSchema = new Schema<ITokenSwipe>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    erc20: tokenSwipeTokenModel,
    erc721: tokenSwipeTokenModel,
    erc1155: tokenSwipeTokenModel
});

tokenSwipeSchema.plugin(uniqueValidator, {
    message: "Expected {PATH} to be unique"
});

export const TokenSwipe = model("TokenSwipe", tokenSwipeSchema);
