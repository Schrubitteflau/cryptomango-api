import { AssertTypeError } from "./AssertTypeError";
import { isUndefined } from "./undefined";

declare const validHexString: unique symbol;

export type HexString = string & {
    [validHexString]: true
};

export function isValidHexString(string: string): string is HexString
{
    const regex: RegExp = /^0x[0-9a-fA-F]+$/;

    return (regex.test(string));
}

export function assertValidHexString(string: string, requiredLength?: number): asserts string is HexString
{
    if (!isValidHexString(string))
    {
        throw new AssertTypeError(string, "hexadecimal string");
    }

    if (!isUndefined(requiredLength) && string.length !== requiredLength)
    {
        throw new AssertTypeError(string, `${requiredLength} character length hex string`);
    }
}
