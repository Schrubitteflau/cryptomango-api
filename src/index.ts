import { BlocksProviderService, ContractIndexerService } from "@Services";
import { BSC, Ethereum } from "@Networks";
import { BytecodeAnalyzer } from "@EVM/BytecodeAnalyzer";
import { ethers } from "ethers";
import { assertValidContractBytecode } from "@EVM/Types";
import { ERC1155 } from "@EVM/Interfaces";


async function main()
{
    /*const blocks = new BlocksProviderService("auto", "latest", 20, BSC);
    const contracts = new ContractIndexerService(blocks);*/

    //const t = "0x0590b6d7985c56b921932209a92f6e8d5ca2ca62fe7ca6c7b1f98e7662dadfd2";
    //const t = "0xfefb4f26c63ea2ae0ae682aff52c5dbd9b1d210e8069423f37491283928ac994"
    const t = "0xada108d509e0ab8083798f9c4994f793cfb28bbc02c7dc357d4a65228cb5ff32"

    const b = await Ethereum.getJsonRpcProvider().getTransaction(t);
    const bytecode = b.data;
    assertValidContractBytecode(bytecode);
    const a = new BytecodeAnalyzer(bytecode);
    const r = a.isInterfaceImplemented(ERC1155);

    console.log(r)

    /*const blocks = new BlocksProviderService(11930400, "latest", 10, Ethereum);
    const contracts = new ContractIndexerService(blocks);

    blocks.start();*/
}

main();
