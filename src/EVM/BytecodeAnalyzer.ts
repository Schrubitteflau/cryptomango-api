import { ethers } from "ethers";

import { ContractBytecode, ContractMethodId, assertValidContractMethodId } from "./Types";
import { ERC20 } from "./Interfaces";

export class BytecodeAnalyzer
{
    private readonly _methodIds: Array<ContractMethodId> = this._extractMethodIds();

    public constructor
    (
        private readonly _bytecode: ContractBytecode
    ) { }

    private _extractMethodIds(): Array<ContractMethodId>
    {
        const regex: RegExp = /63(?<methodId>[0-9A-Fa-f]{8})14/g;
        const methodIds: Array<ContractMethodId> = [];
        const matches = this._bytecode.matchAll(regex);

        for (const match of matches)
        {
            // Full string match : match[0]
            // First capturing group (methodId) : match[1]
            // Usage of methodId named group is not convenient with TypeScript
            const methodId: string = match[1];
            assertValidContractMethodId(methodId);
            methodIds.push(methodId);
        }

        return methodIds;
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

    public isERC20(): boolean
    {
        return (this.isInterfaceImplemented(ERC20));
    }
}
