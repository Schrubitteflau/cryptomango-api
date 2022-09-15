import { logger } from "@Util";
import { plugin, connect, ConnectOptions, Mongoose } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// It's probably harmful for performance because it executes find() queries
/*plugin(uniqueValidator, {
    message: "Expected {PATH} to be unique"
});*/

function initMongoose(mongoose: Mongoose): void {
    //mongoose.set("cloneSchemas", true);
}

export async function connectMongoose(uri: string): Promise<Mongoose> {
    logger.info(`Connecting to database ${uri}...`);
    const mongoose = await connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions);
    logger.info(`Connected to database ${uri}`);

    initMongoose(mongoose);

    return mongoose;
}
