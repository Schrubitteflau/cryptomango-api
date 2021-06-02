export interface IRange {
    start: number,
    end: number,
    range: number
};

export function makeRange(start: number, end: number, maxGap: number): IRange
{
    // Si la plage est plus grande que la maximum spécifiée
    if (end - start > maxGap - 1)
    {
        // Alors on réduit end à sa valeur maximale tolérée
        end = start + maxGap - 1;
    }

    return {
        start,
        end,
        range: end - start + 1
    };
}
