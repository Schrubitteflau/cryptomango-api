import { Logger, LogLevel } from "./Logger";
export { Range } from "./Range";

export function waitSeconds(seconds: number): Promise<void>
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, seconds * 1000);
    });
}

export function toError(error: any): Error
{
    if (error instanceof Error)
    {
        return error;
    }

    return new Error(error);
}

export const logger: Logger = new Logger(LogLevel.LEVEL_DEBUG);