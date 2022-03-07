import { AssertTypeError } from "../AssertTypeError";

import { ethers } from "ethers";
import { assertValidHexString } from "../hexString";

declare const validChecksumAddress: unique symbol;

// TODO rename ChecksumAddress into ChecksummedAddress
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
        throw new AssertTypeError(address, "checksum address");
    }
}

/**
 * @param address The address to convert
 * @returns The formatted address, as a ChecksumAddress
 * @throws **AssertTypeError**
 */
export function toChecksumAddress(address: string): ChecksumAddress
{
    assertValidHexString(address, 42);
    const checksumAddress: string = ethers.utils.getAddress(address.toLowerCase());
    assertValidChecksumAddress(checksumAddress);
    return checksumAddress;
}
