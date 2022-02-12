import { isPositiveInteger } from "@Util/TypeUtils";

describe("testing isPositiveInteger", () =>
{

    it("isPositiveInteger(0) - returns false", () =>
    {
        expect(isPositiveInteger(0)).toBe(false);
    });

    it("isPositiveInteger(-1) - returns false", () =>
    {
        expect(isPositiveInteger(-1)).toBe(false);
    });

    it("isPositiveInteger(1) - returns true", () =>
    {
        expect(isPositiveInteger(1)).toBe(true);
    });

});
