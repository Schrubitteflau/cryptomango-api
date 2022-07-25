import { providers } from "ethers";

import { ERC1155__factory, ERC20__factory, ERC721__factory } from "@EVM/Contracts";
import { ChecksumAddress } from "@Util/TypeUtils/EVM";
import { ERC20Wrapper } from "./ERC20Wrapper";
import { ERC721Wrapper } from "./ERC721Wrapper";
import { ERC1155Wrapper } from "./ERC1155Wrapper";

const contractsTypesMapping = {
    ERC20: {
        factory: ERC20__factory,
        wrapper: ERC20Wrapper
    },
    ERC721: {
        factory: ERC721__factory,
        wrapper: ERC721Wrapper
    },
    ERC1155: {
        factory: ERC1155__factory,
        wrapper: ERC1155Wrapper
    }
} as const;

// @TODO confusion between ContractType and the enum ContractType of BytecodeAnalyzer
export type ContractType = keyof typeof contractsTypesMapping;

export function createContractWrapper<T extends ContractType>(
    type: T,
    contractAddress: ChecksumAddress,
    provider: providers.JsonRpcProvider
): InstanceType<typeof contractsTypesMapping[T]["wrapper"]>
{
    const factory = contractsTypesMapping[type].factory;
    const wrapper = contractsTypesMapping[type].wrapper;

    const contract = factory.connect(contractAddress, provider);

    return new wrapper(contract as any) as any;
}

export {
    ERC20Wrapper,
    ERC721Wrapper,
    ERC1155Wrapper
};
