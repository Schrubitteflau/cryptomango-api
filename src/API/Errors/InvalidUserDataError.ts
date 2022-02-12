export class InvalidUserDataError extends Error
{
    public constructor
    (
        message: string
    )
    {
        super(message);
        this.name = "InvalidUserDataError";
    }
}
