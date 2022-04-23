import { AssertTypeError } from "./AssertTypeError";

declare const validPositiveInteger: unique symbol;
declare const validPositiveIntegerOrZero: unique symbol;

export type PositiveInteger = number & {
    [validPositiveInteger]: true
};

export type PositiveIntegerOrZero = number & {
    [validPositiveIntegerOrZero]: true
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

export function assertValidPositiveIntegerOrZero(number: number): asserts number is PositiveIntegerOrZero
{
    if (!isValidPositiveInteger(number) && number !== 0)
    {
        throw new AssertTypeError(number, "positive integer or zero");
    }
}