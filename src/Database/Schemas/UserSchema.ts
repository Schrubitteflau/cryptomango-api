import { Schema } from "mongoose";
import isEmail from "validator/lib/isEmail";

import { minlength, required, requiredStringWithValidator, stringType, unique } from "./PropertyValidators";

export interface IUser
{
    username: string;
    email: string;
    password: string;
}

export const userSchema = new Schema<IUser>({
    username: {
        type: stringType(),
        unique: unique(),
        required: required(),
        minlength: minlength(5)
    },
    email: {
        unique: unique(),
        ...requiredStringWithValidator(isEmail)
    },
    password: {
        type: stringType(),
        required: required(),
        minlength: minlength(6)
    }
}, {
    timestamps: true
});
