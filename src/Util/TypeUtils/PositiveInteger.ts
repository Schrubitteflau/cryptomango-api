import { AssertTypeError } from "./AssertTypeError";

declare const validPositiveInteger: unique symbol;

export type PositiveInteger = number & {
    [validPositiveInteger]: true
};

export function isValidPositiveInteger(value: any): value is PositiveInteger
{
    return ((typeof value === "number") && (value % 1 === 0) && (value > 0));
}

export function assertValidPositiveInteger(number: number): asserts number is PositiveInteger
{
    if (!isValidPositiveInteger(number))
    {
        throw new AssertTypeError(number, "positive integer");
    }
}
