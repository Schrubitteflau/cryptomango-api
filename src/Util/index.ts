import { MongoManager } from "./MongoManager";
import { Logger } from "./Logger";
import type { ErrorifyOperation } from "../Types";
export { jsonRpc as jsonRpcProvider } from "./Providers";
export { Range } from "./Range";

//export const mongo: MongoManager = new MongoManager("bsc", "bep20", "localhost", 27017);
export const mongo: MongoManager = new MongoManager("149.91.81.195", 27017);

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