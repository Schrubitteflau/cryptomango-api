import path from "path";
import fs from "fs";

import { providers } from "ethers";

import { assertValidChecksumAddress, assertValidContractBytecode, ChecksumAddress, ContractBytecode, toChecksumAddress } from "@Util/TypeUtils/EVM";
import { ContractType } from "@EVM/BytecodeAnalyzer";

import BytecodeAnalyzerCacheContracts from "./BytecodeAnalyzerCache/contracts.json";

// ContractsData
type ContractsData = {
    [type in ContractType]: Array<ChecksumAddress>
};

type ContractsDataEntry = [ContractType, Array<ChecksumAddress>];
type ContractsDataEntries = Array<ContractsDataEntry>;

export type FormattedContractsData = Array<{ expectedType: ContractType, address: ChecksumAddress }>;

const cacheFolder: string = path.join(__dirname, "BytecodeAnalyzerCache", "cache");
const contractsToTest: ContractsData = BytecodeAnalyzerCacheContracts as any;

fs.mkdirSync(cacheFolder, {
    recursive: true
});

/* Format from :
    { "type": [ addresses ] }
   To :
    { "address": address, "expectedType": type }
*/
export function getTestCases(): FormattedContractsData
{
    const entries: ContractsDataEntries = Object.entries(contractsToTest) as ContractsDataEntries;
    const formatted: FormattedContractsData = [];

    for (const [ expectedType, addresses ] of entries)
    {
        for (const address of addresses)
        {
            formatted.push({
                address: toChecksumAddress(address),
                expectedType
            });
        }
    }

    return formatted;
}

export async function getContractBytecode(address: ChecksumAddress): Promise<ContractBytecode>
{
    /* Check if the bytecode of this contract is in the cache.
    If not, get it from the blockchain and store it into the cache */
    const bytecodeCachePath: string = path.join(cacheFolder, address);
    let bytecode: string = "";

    try
    {
        bytecode = fs.readFileSync(bytecodeCachePath, "utf-8");
    }
    catch (error)
    {
        const provider = new providers.JsonRpcProvider("https://main-light.eth.linkpool.io/");

        bytecode = await provider.getCode(address);
        console.log(`Writing file ${bytecodeCachePath}`);
        fs.writeFileSync(bytecodeCachePath, bytecode, "utf-8");
    }

    assertValidContractBytecode(bytecode);
    return bytecode;
}