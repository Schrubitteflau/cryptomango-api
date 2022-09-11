import { NotFoundError } from "@API/Errors";
import { SessionNotExistError } from "@API/Errors/SessionNotExistError";
import { logger } from "@Util";
import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void
{
    if (error instanceof NotFoundError)
    {
        res.status(404).json({
            error: `Not found : ${error.message}`
        });
    }
    else if (error instanceof SessionNotExistError)
    {
        res.status(403).json({
            error: "Please disconnect and reconnect your wallet"
        });
    }
    else
    {
        logger.error("Internal unhandled error ", error);

        res.status(500).json({
            error: "Internal error"
        });
    }
}
