import { AssertTypeError } from "../AssertTypeError";

import { ethers } from "ethers";

declare const validChecksumAddress: unique symbol;

export type ChecksumAddress = string & {
    [validChecksumAddress]: true
};

export function isValidChecksumAddress(address: string): address is ChecksumAddress
{
    try
    {
        const checksumAddress: string = ethers.utils.getAddress(address.toLowerCase());
        return (address === checksumAddress);
    }
    catch (error)
    {
        return false;
    }
}

export function assertValidChecksumAddress(address: string): asserts address is ChecksumAddress
{
    if (!isValidChecksumAddress(address))
    {
        throw new AssertTypeError(`${address} is not a valid checksum address`);
    }
}

export function toChecksumAddress(address: string): ChecksumAddress
{
    const checksumAddress: string = ethers.utils.getAddress(address.toLowerCase());
    assertValidChecksumAddress(checksumAddress);
    return checksumAddress;
}
