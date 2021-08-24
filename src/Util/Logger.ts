import dateFormat from "dateformat";

enum LogLevel {
    LEVEL_DEBUG,
    LEVEL_INFO,
    LEVEL_WARNING,
    LEVEL_ERROR
};

export class Logger
{
    private readonly _prefixes: Array<string> = [ "[+]", "[~]", "[!]", "[-]" ];
    private readonly _colors: Array<string> = [ "\x1b[37m", "\x1b[34m", "\x1b[33m", "\x1b[31m" ];
    private readonly _resetColor: string = "\x1b[0m";
    private readonly _dateFormat: string = "HH:mm:ss";
    private _logLevel: LogLevel = LogLevel.LEVEL_DEBUG;

    public set logLevel(newLogLevel: LogLevel)
    {
        this._logLevel = newLogLevel;
    }

    private _log(level: LogLevel, ...args: Array<any>): void
    {
        if (level >= this._logLevel)
        {
            const color: string = this._colors[level];
            const date: string = dateFormat(Date.now(), this._dateFormat);
            const prefix: string = this._prefixes[level];

            console.log(`${date} ${color}${prefix}${this._resetColor} %s`, ...args);
        }
    }

    public debug(...args: Array<any>): void
    {
        this._log(LogLevel.LEVEL_DEBUG, ...args);
    }

    public info(...args: Array<any>): void
    {
        this._log(LogLevel.LEVEL_INFO, ...args);
    }

    public warning(...args: Array<any>): void
    {
        this._log(LogLevel.LEVEL_WARNING, ...args);
    }

    public error(...args: Array<any>): void
    {
        this._log(LogLevel.LEVEL_ERROR, ...args);
    }
}
