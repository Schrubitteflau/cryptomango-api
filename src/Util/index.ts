import { MongoManager } from "./MongoManager";
import { Logger } from "./Logger";
export { jsonRpc as jsonRpcProvider } from "./Providers";
export { Range } from "./Range";

//export const mongo: MongoManager = new MongoManager("bsc", "bep20", "localhost", 27017);
export const mongo: MongoManager = new MongoManager(
    process.env.MONGO_USER,
    process.env.MONGO_PASSWORD,
    process.env.MONGO_HOST,
    parseInt(process.env.MONGO_PORT, 10)
);

export function waitSeconds(seconds: number): Promise<void>
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, seconds * 1000);
    });
}

export function toError(error: any): Error
{
    if (error instanceof Error)
    {
        return error;
    }

    return new Error(error);
}

export const logger: Logger = new Logger();