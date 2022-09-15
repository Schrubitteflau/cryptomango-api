import { isValidPositiveInteger } from "../PositiveInteger";
import { AssertTypeError } from "../AssertTypeError";

declare const validChainId: unique symbol;

export type ChainId = number & {
    [validChainId]: true;
};

export function isValidChainId(chainId: number): chainId is ChainId {
    return isValidPositiveInteger(chainId);
}

export function assertValidChainId(chainId: number): asserts chainId is ChainId {
    if (!isValidChainId(chainId)) {
        throw new AssertTypeError(chainId, "chain identifier");
    }
}
