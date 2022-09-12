/*class _MayThrow<ReturnValue = any, ErrorType extends Error = Error>
{
    private _returnValue: ReturnValue | null = null;
    private _error: ErrorType | null = null;

    public returnValue(value: ReturnValue): this
    {
        this._error = null;
        this._returnValue = value;
        return this;
    }

    public throwError(error: ErrorType): this
    {
        this._returnValue = null;
        this._error = error;
        return this;
    }

    public isErrorType<ErrorTypeUser extends ErrorType>(error: new (...params: any) => ErrorTypeUser): this is _MayThrow<ReturnValue, ErrorTypeUser>
    {
        return true;
    }
}

class _AError extends Error {}
class _BError extends Error {}
class _CError extends Error {}
class _DError extends Error {}

function a()
{
    let a: _DError = new _CError()
    const c = new _MayThrow<number | string, _AError | _CError | SyntaxError>();
    const dd: _DError = new _CError();

    return c.throwError(new _DError())

    return c.returnValue("")
}

function yt()
{
    const fer= a();

    if (fer.isErrorType(_DError))
    {
        fer
    }
}*/