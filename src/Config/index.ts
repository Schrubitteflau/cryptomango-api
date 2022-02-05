import fs from "fs";
import path from "path";

import { IBlocksDownloaderServiceConfig } from "@NetworkServices";

const APP_ROOT_FOLDER: string = path.resolve(".");
const CONFIG_FOLDER: string = path.join(APP_ROOT_FOLDER, "config");

export interface IRawNetwork
{
    chainId: number;
    fullName: string;
    jsonRpcProviderUrl: string;
    collectionPrefix: string;
    isActive: boolean;
    blocksDownloading: Omit<IBlocksDownloaderServiceConfig, "network">
}

export type RawNetworksList = ReadonlyArray<IRawNetwork>;

function readJsonConfigFile<T>(filename: string): T
{
    const filePath: string = path.join(CONFIG_FOLDER, filename);
    const data: string = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

export const networksConfig: RawNetworksList = readJsonConfigFile<RawNetworksList>("networks.json");
