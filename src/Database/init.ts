import { plugin, connect, ConnectOptions, Mongoose } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

plugin(uniqueValidator, {
    message: "Expected {PATH} to be unique"
});

export async function connectMongoose(uri: string): Promise<Mongoose>
{
    return connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions);
}
