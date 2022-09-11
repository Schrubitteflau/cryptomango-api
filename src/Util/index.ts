import { Logger, LogLevel } from "./Logger";
export { waitSeconds } from "./TimeUtils";

// @TODO create @Logger namespace !
// @TODO remove all logic in index.ts !
export const logger: Logger = new Logger(LogLevel.LEVEL_DEBUG);
