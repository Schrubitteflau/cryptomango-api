import { MongoManager } from "./MongoManager";

export const mongo: MongoManager = new MongoManager(
    process.env.MONGO_USER,
    process.env.MONGO_PASSWORD,
    process.env.MONGO_HOST,
    parseInt(process.env.MONGO_PORT, 10)
);
