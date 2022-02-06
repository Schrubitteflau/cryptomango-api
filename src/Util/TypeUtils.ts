export function isPrimitiveValue(value: any): boolean
{
    /* If the value is already an object (a non-primitive value), the constructor Object() will return
    this same value and the condition will be true. In the other case, Object() will create an object
    from this value, and the condition will be false :
        false  
        -> false
        
        Boolean(false) 
        -> false
        
        Object(false) 
        -> Boolean {false}

        false === false
        false === Boolean(false)
        false !== Object(false)
    */
    return (value !== Object(value));
}

export function toError(error: any): Error
{
    if (error instanceof Error)
    {
        return error;
    }

    return new Error(error);
}

declare const validPositiveInteger: unique symbol;

export type PositiveInteger = number & {
    [validPositiveInteger]: true
};

export function assertPositiveInteger(number: number): asserts number is PositiveInteger
{
    if (!isPositiveInteger(number))
    {
        throw new Error(`${number} is not a positive integer`);
    }
}

export function isPositiveInteger(value: any): value is PositiveInteger
{
    return ((typeof value === "number") && (value % 1 === 0) && (value > 0));
}

export function isUndefined(value: any): value is undefined
{
    return (typeof value === "undefined");
}

export function isNull(value: any): value is null
{
    return (value === null);
}

export function isNullOrUndefined(value: any): value is null | undefined
{
    return (isNull(value) || isUndefined(value));
}
