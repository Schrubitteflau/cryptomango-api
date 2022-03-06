import { connectMongoose } from "@Database/init";

import { Mongoose } from "mongoose";

let _mongoose: Mongoose;

export async function beforeAll(): Promise<void>
{
    const databaseUrl: string = process.env.TESTING_MONGO_DATABASE_URL;
    _mongoose = await connectMongoose(databaseUrl);

    const collections = await _mongoose.connection.db.listCollections().toArray();

    if (collections.length > 0)
    {
        // @TODO see how we can exit and cancel all the tests, because it doesn't work
        // the tests are still executed but they crash because of some undefined variables
        throw new Error(`Can't use a not empty database for tests (using : ${databaseUrl}`);
    }
}

export async function afterAll(): Promise<void>
{
    await _mongoose.connection.db.dropDatabase();
    await _mongoose.disconnect();
}
