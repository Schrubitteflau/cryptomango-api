import { ethers } from "ethers";

import { ContractBytecode, ContractMethodId, assertValidContractMethodId } from "@Util/TypeUtils/EVM";
import { ERC20, ERC721WithoutSafeTransferFrom, ERC721SafeTransferFromV1, ERC721SafeTransferFromV2, ERC1155 } from "./Interfaces";

type MethodIdByteLength = 1 | 2 | 3 | 4;

// @TODO find a way to extends enum or refactor
// export type ContractType = Exclude<ContractTypeOrUnknown, ContractTypeOrUnknown.Unknown>;

export enum ContractType
{
    ERC20Token = "erc20",
    ERC721NFT = "erc721",
    ERC1155MultiToken = "erc1155"
}

export enum ContractTypeOrUnknown
{
    ERC20Token = "erc20",
    ERC721NFT = "erc721",
    ERC1155MultiToken = "erc1155",
    Unknown = "unknown"
}

export class BytecodeAnalyzer
{
    private readonly _methodIds: Array<ContractMethodId> = this._extractAllMethodIds();

    public constructor
    (
        private readonly _bytecode: ContractBytecode
    ) { }

    private _extractMethodIds(byteLength: MethodIdByteLength): Array<ContractMethodId>
    {
        /* https://hackage.haskell.org/package/evm-opcodes-0.1.0/docs/EVM-Opcode-Internal.html
            PUSH1 - PUSH32 -> 0x60 - 0x7f
            EQ -> 0x14
        */
        const pushOpcode: number = 59 + byteLength;
        // Example for byteLength = 4, with PUSH4 : /63(?<methodId>[0-9A-Fa-f]{8})14/g
        const regex = new RegExp(`${pushOpcode}(?<methodId>[0-9A-Fa-f]{${byteLength * 2}})14`, "g");
        const methodIds: Array<ContractMethodId> = [];
        const matches: IterableIterator<RegExpMatchArray> = this._bytecode.matchAll(regex);

        for (const match of matches)
        {
            // Full string match : match[0]
            // First capturing group (methodId) : match[1]
            // Usage of methodId named group is not convenient with TypeScript
            const methodId: string = match[1];

            // Pad with starting zeroes if the method id is not composed of 4 bytes
            const paddedMethodId: string = methodId.padStart(8, "0");

            assertValidContractMethodId(paddedMethodId);
            methodIds.push(paddedMethodId);
        }

        return methodIds;
    }

    private _extractAllMethodIds(): Array<ContractMethodId>
    {
        return [
            ...this._extractMethodIds(1),
            ...this._extractMethodIds(2),
            ...this._extractMethodIds(3),
            ...this._extractMethodIds(4)
        ];
    }

    private _hasMethodId(methodId: ContractMethodId): boolean
    {
        return (this._methodIds.includes(methodId));
    }

    public isInterfaceImplemented(contractInterface: ethers.utils.Interface): boolean
    {
        for (const fragment of contractInterface.fragments)
        {
            if (fragment.type === "function")
            {
                // Remove the beginning "0x"
                const methodId: string = contractInterface.getSighash(fragment.name).slice(2);

                assertValidContractMethodId(methodId);
                if (!this._hasMethodId(methodId))
                {
                    return false;
                }
            }
        }

        return true;
    }

    public isERC20Implemented(): boolean
    {
        return (this.isInterfaceImplemented(ERC20));
    }

    public isERC721Implemented(): boolean
    {
        return (
            this.isInterfaceImplemented(ERC721WithoutSafeTransferFrom) &&
            (
                this.isInterfaceImplemented(ERC721SafeTransferFromV1) ||
                this.isInterfaceImplemented(ERC721SafeTransferFromV2)
            )
        );
    }

    public isERC1155Implemented(): boolean
    {
        return (this.isInterfaceImplemented(ERC1155));
    }

    public determineContractType(): ContractTypeOrUnknown
    {
        /* Check flow :
            1. If ERC1155, it can only be ERC1155 because it's the only interface which
            implements safeBatchTransferFrom() and balanceOfBatch()
            2. If ERC721, it can only be ERC721 because it's the only interface which
            implements ownerOf() and getApproved()
            3. Then check if ERC20 is implemented. If not, the contract type is unknown
        */

        if (this.isERC1155Implemented())
        {
            return ContractTypeOrUnknown.ERC1155MultiToken;
        }
        if (this.isERC721Implemented())
        {
            return ContractTypeOrUnknown.ERC721NFT;
        }
        if (this.isERC20Implemented())
        {
            return ContractTypeOrUnknown.ERC20Token;
        }

        return ContractTypeOrUnknown.Unknown;
    }
}
