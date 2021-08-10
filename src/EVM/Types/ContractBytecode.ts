declare const validContractBytecode: unique symbol;

export type ContractBytecode = string & {
    [validContractBytecode]: true
};

export function assertValidContractBytecode(bytecode: string): asserts bytecode is ContractBytecode
{
    if (!isValidContractBytecode(bytecode))
    {
        throw new Error(`${bytecode} is not valid contract bytecode`);
    }
}

export function isValidContractBytecode(bytecode: string): bytecode is ContractBytecode
{
    const regex: RegExp = /^0x[0-9a-fA-F]+$/;

    return (regex.test(bytecode));
}
