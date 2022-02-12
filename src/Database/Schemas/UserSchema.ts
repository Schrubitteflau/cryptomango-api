import { ChecksumAddress, isValidChecksumAddress } from "@Util/TypeUtils/EVM";
import { Schema } from "mongoose";

import { requiredStringWithValidator, unique } from "./PropertyValidators";

export interface IUser
{
    address: ChecksumAddress;
}

export const userSchema = new Schema<IUser>({
    address: {
        unique: unique(),
        ...requiredStringWithValidator(isValidChecksumAddress)
    }
}, {
    timestamps: true
});
