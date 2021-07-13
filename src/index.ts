import { providers } from "ethers";
import { json } from "express";
import { Db } from "mongodb";
import { exit } from "process";
import { blockRepository, IBlockWithTransactionsSchema } from "./Repositories/BlockRepository";
import { BlocksProviderService } from "./Services/BlocksProviderService";
import { jsonRpcProvider, mongo } from "./Util";

//import { mongo, web3Manager } from "./Util";


async function findBlock(number: number, db: Db): Promise<IBlockWithTransactionsSchema | null>
{
    const collections = [
        "blocks",
        "blocks10",
        "blocks2",
        "blocks3",
        "blocks4",
        "blocks5",
        "blocks6",
        "blocks7",
        "blocks8",
        "blocks9"
    ];

    for (const collection of collections)
    {
        const c = await db.collection<IBlockWithTransactionsSchema>(collection).findOne({ _id: number });

        if (c !== null)
        {
            console.log(`Block #${number} found in collection ${collection}`);
            return c;
        }
    }

    return null;
}



async function main(): Promise<void>
{
    console.log(process.env);
    process.exit();

    //const a = new BlocksProviderService(10, "latest", 2);
    const d = await mongo.selectDatabase("BSC");

    try {
        await d.dropCollection("theblocks");
        await d.dropCollection("thetransactions");
    } catch(e) {}

    const a = new BlocksProviderService(6953700, 6953720, 5);

    // tester cet event si il renvoie bien toutes les transactions avec toutes les datas
    a.on("contractCreationTransactions", console.log);

    a.start();

    /*const n = 7200000;
    const b = await findBlock(n, d);

    if (b === null)
    {
        console.log(`Cannot find block #${n}, let's download it`);
    }
    else
    {

    }*/

    //const blockWithTxs = await jsonRpcProvider.getBlockWithTransactions(6953711);

    //await blockRepository.storeBlocks([blockWithTxs]);
    console.log("OK");

    /*for (const tx of blockWithTxs.transactions)
    {
        console.log(`${tx.hash} : ${tx.to}`);
        if (tx.to === null || typeof tx.to === "undefined")
        {
            console.log("CONTRACT CREATION HERE");
        }
    }*/

    /*a.on("newBlocks", async (blocks) =>
    {
        console.log("newBlocks");
        
        d.collection("yo").insertMany(blocks.blocks, (err, res) =>
        {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Inséré : blocks " + blocks.start + " à " + blocks.end);
            }
        })
    });

    a.start();*/


    //const block = await web3Manager.web3Http.eth.getBlock(6953711, true);
    /*const block = await jsonRpcProvider.getBlockWithTransactions(6953711);

    //console.log(block);

    for (const b of block.transactions)
    {
        if (b.hash === "0x5f42b1f3271c5d53d3ac376459d4b75b97276a14bf8068535e213503c51375a0")
        {
            console.log(b);
        }
    }*/

    //console.log(block.transactions[0].to);

    //console.log(block);

    /*const tokens: ITokenFomoTokenList = await tokenFomoScraper.getTokensList();

    console.log(tokens);

    const db: Db = await mongo.selectDatabase("bsc");
    console.log("Connected to database 'bsc'");

    // Mongo collection already exists
    //db.createCollection("aa");

    db.collection("aa").insertMany(transformTokenFomoTokenList(tokens), function (err, res) {
        console.log(err);
        console.log(res);
    })*/
}

main();
