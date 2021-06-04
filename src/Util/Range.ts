export class RangeError extends Error { }

export class Range
{
    public constructor
    (
        private readonly _start: number,
        private readonly _end: number,
        // Maximum difference allowed between start and end
        private readonly _maxGap: number
    )
    {
        if (_end < _start)
        {
            throw new RangeError("end cannot be lower than start");
        }
    }

    public get start(): number
    {
        return this._start;
    }

    public get end(): number
    {
        // If the difference is bigger than _maxGap
        if (this._end - this.start > this._maxGap - 1)
        {
            // Then end is lowered to its maximum value
            return (this.start + this._maxGap - 1);
        }

        return this._end;
    }

    public get difference(): number
    {
        return (this.end - this.start + 1);
    }
}