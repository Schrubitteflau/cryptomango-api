const ethers = require("ethers");

const txHash = "0xe17e79ddd7f128cde4576ac65cc0b7333547c87768b00bcb2477772654cd660d";

const pancakeFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const pairCreatedSignature = [ "event PairCreated(address indexed token0, address indexed token1, address pair, uint)" ];
const pairCreatedInterface = new ethers.utils.Interface(pairCreatedSignature);

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

async function main()
{
    const tx = await provider.getTransactionReceipt(txHash);
    const logs = tx.logs;

    for (const log of logs)
    {
        try {
            const result = pairCreatedInterface.parseLog(log);
            const { token0, token1, pair } = result.args;
            if (log.address.toLowerCase() === pancakeFactory.toLowerCase() && result.name === "PairCreated") {
                console.log(`New pair : token0 => ${token0}, token1 => ${token1}, pair => ${pair}`);
            }
        } catch (e) {
            //console.log(e)
        } 
    }
    //console.log(logs);
}

main();

// https://docs.ethers.io/v5/concepts/events/


/*

config/transactionEvents.json


[
    {
        "chainId": 56,
        "name": "PancakeSwap: Factory v2 => PairCreated",
        // La collection sera nommée, "bsc_" + "pcs_factoryV2_PairCreated"
        "eventId": "pcs_factoryV2_PairCreated",
        "fromAddress": "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
        "eventAbi": "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
    },
    {
        ...
    }
]

*/