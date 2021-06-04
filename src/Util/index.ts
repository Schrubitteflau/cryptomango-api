import { MongoManager } from "./MongoManager";
import { Logger } from "./Logger";
export { jsonRpc as jsonRpcProvider } from "./Providers";
export { Range } from "./Range";

// https://account.getblock.io/
const getBlockAPIKey: string = "d92f493c-d742-48be-8c89-51f9981946d4";

//export const mongo: MongoManager = new MongoManager("bsc", "bep20", "localhost", 27017);
export const mongo: MongoManager = new MongoManager("localhost", 27017);

export function waitSeconds(seconds: number)
{
    return new Promise((resolve) =>
    {
        setTimeout(() => { resolve(null); }, seconds * 1000);
    });
}

export const logger: Logger = new Logger();