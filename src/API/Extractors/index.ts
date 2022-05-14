import { InvalidUserDataError, NotFoundError } from "../Errors";

import { Network, networksManager } from "@Networks";
import { ContractType } from "@EVM/BytecodeAnalyzer";
import { ChecksumAddress, isValidChainId, toChecksumAddress } from "@Util/TypeUtils/EVM";
import { AssertTypeError } from "@Util/TypeUtils";

export function extractNetworkFromString(_chainId: string): Network
{
    const chainId: number = parseInt(_chainId, 10);

    if (isNaN(chainId) || !isValidChainId(chainId))
    {
        throw new InvalidUserDataError("Invalid chainId format");
    }

    const network: Network | null = networksManager.getByChainId(chainId);

    if (network === null)
    {
        throw new NotFoundError("Can't find a network with the provided chainId");
    }

    return network;
}

export function extractContractTypeFromString(contractType: string): ContractType
{
    if (
        contractType === ContractType.ERC20Token ||
        contractType === ContractType.ERC721NFT ||
        contractType === ContractType.ERC1155MultiToken
    )
    {
        return contractType;
    }

    throw new InvalidUserDataError("Invalid contractType");
}

export function extractChecksumAddressFromString(address: string): ChecksumAddress
{
    try
    {
        return toChecksumAddress(address);
    }
    catch (error)
    {
        if (error instanceof AssertTypeError)
        {
            throw new InvalidUserDataError("Invalid address format");
        }
        else
        {
            throw new Error("Unknown error");
        }
    }
}
