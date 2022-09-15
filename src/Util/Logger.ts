import dateFormat from "dateformat";

export enum LogLevel {
    LEVEL_DEBUG,
    LEVEL_INFO,
    LEVEL_WARNING,
    LEVEL_ERROR
}

export class Logger {
    private readonly _prefixes: ReadonlyArray<string> = ["[+]", "[~]", "[!]", "[-]"];
    private readonly _colors: ReadonlyArray<string> = ["\x1b[37m", "\x1b[34m", "\x1b[33m", "\x1b[31m"];
    private readonly _resetColor: string = "\x1b[0m";
    private readonly _dateFormat: string = "HH:mm:ss";

    public constructor(private _logLevel: LogLevel) {}

    public set logLevel(newLogLevel: LogLevel) {
        this._logLevel = newLogLevel;
    }

    private _log(level: LogLevel, ...args: ReadonlyArray<any>): void {
        if (level >= this._logLevel) {
            const color: string = this._colors[level];
            const date: string = dateFormat(Date.now(), this._dateFormat);
            const prefix: string = this._prefixes[level];

            console.log(`${date} ${color}${prefix}${this._resetColor} %s`, ...args);
        }
    }

    public debug(...args: ReadonlyArray<any>): void {
        this._log(LogLevel.LEVEL_DEBUG, ...args);
    }

    public info(...args: ReadonlyArray<any>): void {
        this._log(LogLevel.LEVEL_INFO, ...args);
    }

    public warning(...args: ReadonlyArray<any>): void {
        this._log(LogLevel.LEVEL_WARNING, ...args);
    }

    public error(...args: ReadonlyArray<any>): void {
        this._log(LogLevel.LEVEL_ERROR, ...args);
    }
}
