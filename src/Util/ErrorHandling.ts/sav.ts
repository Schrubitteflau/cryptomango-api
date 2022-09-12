/*type MayThrow_ReturnValue<ReturnType> = {
    returnValue: ReturnType;
    error: null;
};

type MayThrow_Error<ErrorType extends Error> = {
    returnValue: null;
    error: ErrorType;
};

export type MayThrow<ReturnType, ErrorType extends Error> =
    MayThrow_ReturnValue<ReturnType> |
    MayThrow_Error<ErrorType>;

export function throwError<ErrorType extends Error>(error: ErrorType): MayThrow_Error<ErrorType>
{
    return {
        returnValue: null,
        error
    };
}

export function returnValue<ReturnType>(returnValue: ReturnType): MayThrow_ReturnValue<ReturnType>
{
    return {
        returnValue,
        error: null
    };
}

export function hasError<ReturnType, ErrorType extends Error>(mayThrow: MayThrow<ReturnType, ErrorType>): mayThrow is MayThrow_Error<ErrorType>
{
    return (mayThrow.error !== null);
}


class AError extends Error {
    public A: string = "";
}
class BError extends Error {
    public B: string = "";
}
class CError extends Error {
    public C: string = "";
}
class DError extends Error {
    public D: string = "";
}

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
}
*/