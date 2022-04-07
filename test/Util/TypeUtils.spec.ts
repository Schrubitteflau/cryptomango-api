import { isPositiveInteger } from "@Util/TypeUtils";

describe("testing isPositiveInteger", () =>
{
    const notPositiveIntegerValues: ReadonlyArray<any> = [
        0, -1, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, {}, "", []
    ];

    it.each(notPositiveIntegerValues)("isPositiveInteger(%s) - returns false", (value: any) =>
    {
        expect(isPositiveInteger(value)).toBe(false);
    });

    it("isPositiveInteger(1) - returns true", () =>
    {
        expect(isPositiveInteger(1)).toBe(true);
    });

});
