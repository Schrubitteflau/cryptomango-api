export function throwRandomErrorIfEnabled(): void
{
    if (process.env.THROW_RANDOM_ERRORS === "true" && Math.random() * 10 < parseInt(process.env.THROW_RANDOM_ERRORS_RATE, 10))
    {
        throw new Error("Potential Error");
    }
}
