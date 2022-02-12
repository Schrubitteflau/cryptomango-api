export class AssertTypeError extends Error
{
    public constructor
    (
        message: string
    )
    {
        super(message);
        this.name = "AssertTypeError";
    }
}
