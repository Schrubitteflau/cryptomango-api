import { MongoManager } from "./MongoManager";
import { Web3Manager } from "./Web3Manager";
export { jsonRpc as jsonRpcProvider } from "./Providers";
export { makeRange, IRange } from "./Range"

// https://account.getblock.io/
const getBlockAPIKey: string = "d92f493c-d742-48be-8c89-51f9981946d4";

//export const mongo: MongoManager = new MongoManager("bsc", "bep20", "localhost", 27017);
export const mongo: MongoManager = new MongoManager("localhost", 27017);

/*export const web3Manager: Web3Manager = new Web3Manager(
    `https://bsc.getblock.io/mainnet/?api_key=${getBlockAPIKey}`,
    `wss://bsc.getblock.io/mainnet/?api_key=${getBlockAPIKey}`
);*/

export const web3Manager: Web3Manager = new Web3Manager(
    "https://bsc-dataseed1.ninicoin.io/",
    "wss://bsc-ws-node.nariox.org:443"
);

export function waitSeconds(seconds: number)
{
    return new Promise((resolve) =>
    {
        setTimeout(() => { resolve(null); }, seconds * 1000);
    });
}
