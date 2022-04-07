import { AssertTypeError } from "../AssertTypeError";
import { isValidHexString } from "../HexString";

declare const validContractBytecode: unique symbol;

export type ContractBytecode = string & {
    [validContractBytecode]: true
};

export function isValidContractBytecode(bytecode: string): bytecode is ContractBytecode
{
    return (isValidHexString(bytecode));
}

export function assertValidContractBytecode(bytecode: string): asserts bytecode is ContractBytecode
{
    if (!isValidContractBytecode(bytecode))
    {
        throw new AssertTypeError(bytecode, "contract bytecode");
    }
}
