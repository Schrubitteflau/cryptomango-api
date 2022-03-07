export class AssertTypeError extends Error
{
    public constructor
    (
        value: any,
        valueName: string
    )
    {
        super(`${value} is not a valid ${valueName}`);
        this.name = "AssertTypeError";
    }
}
