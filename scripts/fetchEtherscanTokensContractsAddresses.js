// @ts-check

const path = require("path");
const fs = require("fs");

const fetch = require("node-fetch");
const cheerio = require("cheerio");

const contracts = require("../test/EVM/BytecodeAnalyzerCache/contracts.json");

/**
 * Returns a list of known addresses according to the specified contract type
 * The addresses are scraped for etherscan.io
 * @param { "erc20" | "erc721" | "erc1155" } contractType
 * @returns { Promise<Array<string>> } addresses
 */
async function fetchEtherscanTokensContractsAddresses(contractType)
{
    let url;

    switch (contractType)
    {
        case "erc20":
            url = "https://etherscan.io/tokens";
            break;
        case "erc721":
            url = "https://etherscan.io/tokens-nft";
            break;
        case "erc1155":
            url = "https://etherscan.io/tokens-nft1155";
            break;
        default:
            throw new Error("Unsupported ContractType");
    }

    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html);
    const $anchors = $("table#tblResult tbody tr a");

    const addresses = $anchors.map(function()
    {
        const href = this.attribs.href;
        const regex = /(?<address>0x.{40})/;
        const match = href.match(regex);
        const address = match?.groups?.address;
        return address;
    }).toArray();

    return addresses;
}

/**
 * 
 * @param { "erc20" | "erc721" | "erc1155" } contractType
 * @param { Array<string> } addresses
 * @returns { Array<string> } Merged addresses
 */
function getUpdatedContractsCache(contractType, addresses)
{
    // Simply merge the addresses
    return [...new Set([...contracts[contractType], ...addresses])];
}

async function main()
{
    const erc20Contracts = await fetchEtherscanTokensContractsAddresses("erc20");
    const erc721Contracts = await fetchEtherscanTokensContractsAddresses("erc721");
    const erc1155Contracts = await fetchEtherscanTokensContractsAddresses("erc1155");

    contracts.erc20 = getUpdatedContractsCache("erc20", erc20Contracts);
    contracts.erc721 = getUpdatedContractsCache("erc721", erc721Contracts);
    contracts.erc1155 = getUpdatedContractsCache("erc1155", erc1155Contracts);

    const contractsPath = path.join(__dirname, "..", "test", "EVM", "BytecodeAnalyzerCache", "contracts.json");
    const json = JSON.stringify(contracts, null, 4);

    fs.writeFileSync(contractsPath, json, "utf-8");
}

main();
