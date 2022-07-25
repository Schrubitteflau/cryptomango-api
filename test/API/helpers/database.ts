import { Mongoose } from "mongoose";

import { connectMongoose } from "@Database/init";

let _mongoose: Mongoose;

export async function beforeAll(): Promise<void>
{
    const databaseUrl: string = process.env.MONGO_DATABASE_URL;
    _mongoose = await connectMongoose(databaseUrl);
    const { db } = _mongoose.connection;

    const collections = await _mongoose.connection.db.listCollections().toArray();

    for (const { name } of collections)
    {
        const collection = db.collection(name);
        const document = await collection.findOne();
        if (document !== null)
        {
            // See if there's a proper way to exit and don't run the tests
            //throw new Error(`Non-empty collection ${name} in database ${databaseUrl}`);
            console.log(`Non-empty collection ${name} in database ${databaseUrl}`);
            process.exit(1);
        }
    }
}

export async function afterAll(): Promise<void>
{
    await _mongoose.connection.db.dropDatabase();
    await _mongoose.disconnect();
}
