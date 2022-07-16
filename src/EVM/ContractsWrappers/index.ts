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
};

// @TODO confusion between ContractType and the enum ContractType of BytecodeAnalyzer
export type ContractType = keyof typeof contractsTypesMapping;
type ContractFactory = typeof contractsTypesMapping[ContractType]["factory"];
type ContractWrapper = typeof contractsTypesMapping[ContractType]["wrapper"];

export function createContractWrapper(type: "ERC20", contractAddress: ChecksumAddress, provider: providers.JsonRpcProvider): ERC20Wrapper;
export function createContractWrapper(type: "ERC721", contractAddress: ChecksumAddress, provider: providers.JsonRpcProvider): ERC721Wrapper;
export function createContractWrapper(type: "ERC1155", contractAddress: ChecksumAddress, provider: providers.JsonRpcProvider): ERC1155Wrapper;
export function createContractWrapper(type: ContractType, contractAddress: ChecksumAddress, provider: providers.JsonRpcProvider): InstanceType<ContractWrapper>;

export function createContractWrapper(type: ContractType, contractAddress: ChecksumAddress, provider: providers.JsonRpcProvider): InstanceType<ContractWrapper>
{
    const factory: ContractFactory = contractsTypesMapping[type].factory;
    const wrapper: ContractWrapper = contractsTypesMapping[type].wrapper;

    const contract = factory.connect(contractAddress, provider);

    return new wrapper(contract as any);
}

export {
    ERC20Wrapper,
    ERC721Wrapper,
    ERC1155Wrapper
};
