import { model, Schema } from "mongoose";
import isEmail from "validator/lib/isEmail";
const uniqueValidator = require("mongoose-unique-validator");

export interface IUser
{
    username: string;
    email: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: Schema.Types.String,
        unique: true,
        required: [true, "Username must not be empty"],
        minlength: [5, "Your username must be at least 5 characters long"]
    },
    email: {
        type: Schema.Types.String,
        unique: true,
        // sparse: true, -> unique unless it is not defined (null)
        required: [true, "Email must not be empty"],
        validate: {
            validator: isEmail,
            message: (props) => `${props.value} is not a valid email`,
        }
    },
    password: {
        type: Schema.Types.String,
        required: [true, "You must provide a password"],
        minlength: [6, "Your password must be at least 6 characters long"]
    }
}, {
    timestamps: true
});

userSchema.plugin(uniqueValidator, {
    message: "Expected {PATH} to be unique"
});

export const User = model("User", userSchema);
