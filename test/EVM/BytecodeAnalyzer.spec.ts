import path from "path";
import fs from "fs";

import { providers } from "ethers";

import { BytecodeAnalyzer, ContractType } from "../../src/EVM/BytecodeAnalyzer";
import { assertValidChecksumAddress, assertValidContractBytecode, ChecksumAddress, ContractBytecode } from "../../src/EVM/Types";

type ContractsData = {
    [type in ContractType]: Array<ChecksumAddress>
};

type ContractsDataEntry = [ContractType, Array<ChecksumAddress>];

type ContractsDataEntries = Array<ContractsDataEntry>;

type FormattedContractsData = Array<{ expectedType: ContractType, address: ChecksumAddress }>;

const contracts: ContractsData = require("./BytecodeAnalyzerCache/contracts.json");

const cacheFolder: string = path.join(__dirname, "BytecodeAnalyzerCache");

/* Format from :
    { "type": [ addresses ] }
   To :
    { "address": address, "expectedType": type }
*/
function formatContractsData(): FormattedContractsData
{
    const entries: ContractsDataEntries = Object.entries(contracts) as ContractsDataEntries;
    const formatted: FormattedContractsData = [];

    for (const [ expectedType, addresses ] of entries)
    {
        for (const address of addresses)
        {
            assertValidChecksumAddress(address);
            formatted.push({ address, expectedType });
        }
    }

    return formatted;
}

async function getContractBytecode(address: ChecksumAddress): Promise<ContractBytecode>
{
    /* Check if the bytecode of this contract is in the cache. If not, get it from the
    blockchain and store it into the cache */
    const bytecodeCachePath: string = path.join(cacheFolder, address);
    let bytecode: string = "";

    try
    {
        bytecode = fs.readFileSync(bytecodeCachePath, "utf-8");
    }
    catch (e)
    {
        const provider = new providers.JsonRpcProvider("https://main-light.eth.linkpool.io/");

        bytecode = await provider.getCode(address);
        console.log("bytecode ok, now writing on " + bytecodeCachePath);
        fs.writeFileSync(bytecodeCachePath, bytecode, "utf-8");
    }

    assertValidContractBytecode(bytecode);
    return bytecode;
}

const testCases = formatContractsData();

describe.each(testCases)("Test BytecodeAnalyzer.ts with $expectedType at $address", ({ address, expectedType }) =>
{
    let bytecodeAnalyzer: BytecodeAnalyzer;
    let bytecode: ContractBytecode;

    beforeEach(async () =>
    {
        bytecode = await getContractBytecode(address);
        bytecodeAnalyzer = new BytecodeAnalyzer(bytecode);
    });

    test("Contract at $address should be resolved as $expectedType type", () =>
    {
        const determinedType: ContractType = bytecodeAnalyzer.determineContractType();
        expect(determinedType).toBe(expectedType);
    })
});
