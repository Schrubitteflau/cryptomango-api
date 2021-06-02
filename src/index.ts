import { Db } from "mongodb";
import { tokenFomoScraper, ITokenFomoTokenList } from "./Modules";
import { BlocksProviderService } from "./Services/BlocksProviderService";
import { jsonRpcProvider, mongo } from "./Util";

//import { mongo, web3Manager } from "./Util";


function transformTokenFomoTokenList(tokens: ITokenFomoTokenList): any
{
    const t: any = tokens.map((token: any) =>
    {
        token._id = token.addr;
        return token;
    });

    return t;
}

// https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#index-8
/* "If the target account is not set (the transaction does not have a recipient or the
recipient is set to null), the transaction creates a new contract */

async function main(): Promise<void>
{
    const a = new BlocksProviderService(10, "latest", 2);
    const d = await mongo.selectDatabase("BSC");

    a.on("newBlocks", async (blocks) =>
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

    a.start();


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
