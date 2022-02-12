import { AssertTypeError } from "../AssertTypeError";

declare const validTransactionHash: unique symbol;

export type TransactionHash = string & {
    [validTransactionHash]: true
};

export function isValidTransactionHash(hash: string): hash is TransactionHash
{
    const regex: RegExp = /^0x[0-9a-fA-F]{64}$/;

    return (regex.test(hash));
}

export function assertValidTransactionHash(hash: string): asserts hash is TransactionHash
{
    if (!isValidTransactionHash(hash))
    {
        throw new AssertTypeError(`${hash} is not a valid transaction hash`);
    }
}
