import { AssertTypeError } from "../AssertTypeError";
import { isValidHexString } from "../HexString";

declare const validMessageSignature: unique symbol;

export type MessageSignature = string & {
    [validMessageSignature]: true
};

export function isValidMessageSignature(signature: string): signature is MessageSignature
{
    return (isValidHexString(signature) && signature.length === 132);
}

export function assertValidMessageSignature(signature: string): asserts signature is MessageSignature
{
    if (!isValidMessageSignature(signature))
    {
        throw new AssertTypeError(signature, "message signature");
    }
}
