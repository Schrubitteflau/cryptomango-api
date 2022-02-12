import { AssertTypeError } from "../AssertTypeError";

declare const validBlockHash: unique symbol;

export type BlockHash = string & {
    [validBlockHash]: true
};

export function isValidBlockHash(hash: string): hash is BlockHash
{
    const regex: RegExp = /^0x[0-9a-fA-F]{64}$/;

    return (regex.test(hash));
}

export function assertValidBlockHash(hash: string): asserts hash is BlockHash
{
    if (!isValidBlockHash(hash))
    {
        throw new AssertTypeError(`${hash} is not valid block hash`);
    }
}
