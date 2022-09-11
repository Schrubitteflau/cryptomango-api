import { isValidPositiveIntegerOrZero } from "../PositiveInteger";
import { AssertTypeError } from "../AssertTypeError";

declare const validBlockNumber: unique symbol;

export type BlockNumber = number & {
    [validBlockNumber]: true
};

export function isValidBlockNumber(blockNumber: number): blockNumber is BlockNumber
{
    return (isValidPositiveIntegerOrZero(blockNumber));
}

export function assertValidBlockNumber(blockNumber: number): asserts blockNumber is BlockNumber
{
    if (!isValidBlockNumber(blockNumber))
    {
        throw new AssertTypeError(blockNumber, "block number");
    }
}
