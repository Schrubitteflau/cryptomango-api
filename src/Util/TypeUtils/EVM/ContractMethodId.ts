import { AssertTypeError } from "../AssertTypeError";

declare const validContractMethodId: unique symbol;

export type ContractMethodId = string & {
    [validContractMethodId]: true
};

export function isValidContractMethodId(methodId: string): methodId is ContractMethodId
{
    const regex: RegExp = /^[0-9a-fA-F]{8}$/;

    return (regex.test(methodId));
}

export function assertValidContractMethodId(methodId: string): asserts methodId is ContractMethodId
{
    if (!isValidContractMethodId(methodId))
    {
        throw new AssertTypeError(`${methodId} is not a valid contract method id`);
    }
}
