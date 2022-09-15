export class AssertTypeError extends Error {
    public constructor(value: any, valueTypeName: string) {
        super(`${value} is not a valid ${valueTypeName}`);
        this.name = "AssertTypeError";
    }
}
