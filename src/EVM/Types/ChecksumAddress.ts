import { ethers } from "ethers";

declare const validChecksumAddress: unique symbol;

export type ChecksumAddress = string & {
    [validChecksumAddress]: true
};

export function assertValidChecksumAddress(address: string): asserts address is ChecksumAddress
{
    if (!isValidChecksumAddress(address))
    {
        throw new Error(`${address} is not a valid checksum address`);
    }
}

export function isValidChecksumAddress(address: string): address is ChecksumAddress
{
    return ethers.utils.isAddress(address);
}

export function toChecksumAddress(address: string): string
{
    return ethers.utils.getAddress(address.toLowerCase());
}