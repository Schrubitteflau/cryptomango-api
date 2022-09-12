/*class MayThrow<ReturnType, ErrorType extends Error, uniq>
{
    public constructor(public returnValue: ReturnType, public error: ErrorType) {}
}

type MayThrow2<ReturnType, ErrorType extends Error, uniq> = {
    returnValue: ReturnType;
    error: ErrorType;
    uniq: uniq;
}

function f<ReturnType, ErrorType extends Error, uniq>(returnValue: ReturnType, error: ErrorType, uniq: uniq): MayThrow2<ReturnType, ErrorType, uniq>
{
    return {
        returnValue,
        error,
        uniq
    }
}

class AError extends Error {}
class BError extends Error {}
class CError extends Error {
    public CError: string ="";
}
class DError extends Error {}

let aaa: CError = new BError()

declare function getBoolean(): boolean;

function div(n1: number, n2: number)
{
    if (n2 === 0)
    {
        const fa = f(1, new AError(), "rggrtgtr")
        return fa;
        //return new MayThrow<null, AError, "frere">(null, new AError(""));
    }

    if (n1 === 1)
    {
        return new MayThrow<null, BError, "'frrj">(null, new BError(""));
    }
}*/