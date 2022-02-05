import { plugin } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

plugin(uniqueValidator, {
    message: "Expected {PATH} to be unique"
});
