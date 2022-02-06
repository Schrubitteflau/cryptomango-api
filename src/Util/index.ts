import { Logger, LogLevel } from "./Logger";
export { waitSeconds } from "./TimeUtils";
export {
    PositiveInteger,
    assertPositiveInteger,
    isPositiveInteger,
    isNull,
    isNullOrUndefined,
    isPrimitiveValue,
    isUndefined,
    toError
} from "./TypeUtils";

export function throwRandomErrorIfEnabled(): void
{
    if (process.env.THROW_RANDOM_ERRORS === "true" && Math.random() * 10 < parseInt(process.env.THROW_RANDOM_ERRORS_RATE, 10))
    {
        throw new Error("Potential Error");
    }
}

export const logger: Logger = new Logger(LogLevel.LEVEL_DEBUG);
