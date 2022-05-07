import { isValidPositiveInteger } from "@Util/TypeUtils";

describe("testing isValidPositiveInteger", () =>
{
    const notPositiveIntegerValues: ReadonlyArray<any> = [
        0, -1, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, {}, "", []
    ];

    it.each(notPositiveIntegerValues)("isValidPositiveInteger(%s) - returns false", (value: any) =>
    {
        expect(isValidPositiveInteger(value)).toBe(false);
    });

    it("isValidPositiveInteger(1) - returns true", () =>
    {
        expect(isValidPositiveInteger(1)).toBe(true);
    });

});
