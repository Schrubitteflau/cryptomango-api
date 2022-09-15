import { Mongoose } from "mongoose";

import { connectMongoose } from "@Database/init";
import { app, listen } from "@API/init";
import { Network, networksManager } from "@Networks";
import { logger } from "@Util";

async function startSyncing(): Promise<void> {
    const networks: ReadonlyArray<Network> = networksManager.getNetworks({
        syncEnabledOnly: true
    });

    for (const network of networks) {
        network.startSyncing();
    }
}

async function startApi(): Promise<void> {
    const { port } = await listen();
    logger.info(`API listening on port ${port}`);
}

async function main(): Promise<void> {
    const { START_API, START_SYNCING } = process.env;
    const mongoose: Mongoose = await connectMongoose(process.env.MONGO_DATABASE_URL);

    if (START_API.toLowerCase() === "true") {
        startApi();
    }

    if (START_SYNCING.toLowerCase() === "true") {
        startSyncing();
    }
}

main();
