/*type MayThrow_ReturnValue<ReturnType> = {
    __kind: "returnValue";
    returnValue: ReturnType;
};

type MayThrow_Error<ErrorType extends Error> = {
    __kind: "error";
    error: ErrorType;
};

export type MayThrow<ReturnType, ErrorType extends Error> =
    MayThrow_ReturnValue<ReturnType> |
    MayThrow_Error<ErrorType>;

export function throwError<ErrorType extends Error>(error: ErrorType): MayThrow_Error<ErrorType>
{
    return {
        __kind: "error",
        error
    };
}

export function returnValue<ReturnType>(returnValue: ReturnType): MayThrow_ReturnValue<ReturnType>
{
    return {
        __kind: "returnValue",
        returnValue
    };
}

export function hasError<ReturnType, ErrorType extends Error>(mayThrow: MayThrow<ReturnType, ErrorType>): mayThrow is MayThrow_Error<ErrorType>
{
    return (mayThrow.__kind === "error");
}

export function hasReturnValue<ReturnType, ErrorType extends Error>(mayThrow: MayThrow<ReturnType, ErrorType>): mayThrow is MayThrow_ReturnValue<ReturnType>
{
    return (mayThrow.__kind === "returnValue");
}

abstract class CustomError<UniqueErrorId extends string> extends Error {
    // Doesn't exist at the runtime, only used to make CustomError instances incompatibles if their
    // UniqueErrorId type is different
    declare private readonly _uniqueErrorId: UniqueErrorId;
}

class AError extends CustomError<"AError"> {}
class BError extends CustomError<"BError"> {}
class CError extends CustomError<"CError"> {}
class DError extends CustomError<"DError"> {}

let gijt: AError = new AError
let fijreo: DError = new CError

declare function condition(): boolean;

function div(n1: number, n2: number): MayThrow<number | null | boolean, AError | BError | CError>
{
    if (n1 === 1) {
        return throwError(new AError);
    }

    if (n2 === 0) {
        return throwError(new BError);
    }

    if (condition()) {
        if (condition()) {
            return throwError(new CError)
        }
        return returnValue(1);
    }

    if (condition()) {
        return returnValue(null);
    }

    return returnValue(true)
}

const a = div(1, 0);
if (!hasError(a)) {
    a.error
    a.returnValue
} else {
    a.error
    a.returnValue

    if (a.error instanceof AError)
    {
        a.error
    }
    else
    {
        a.error
    }
}

if (hasReturnValue(a))
{
    a.error
    a.returnValue
}
else
{
    a.error
    a.returnValue
}
*/