declare const validBlockHash: unique symbol;

export type BlockHash = string & {
    [validBlockHash]: true
};

export function assertValidBlockHash(hash: string): asserts hash is BlockHash
{
    if (!isValidBlockHash(hash))
    {
        throw new Error(`${hash} is not valid block hash`);
    }
}

export function isValidBlockHash(hash: string): hash is BlockHash
{
    const regex: RegExp = /^0x[0-9a-fA-F]{64}$/;

    return (regex.test(hash));
}
