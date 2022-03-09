import { NotFoundError } from "@API/Errors";
import express from "express";

export function globalErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    if (error instanceof NotFoundError)
    {
        res.status(404).json({
            error: `Not found : ${error.message}`
        });
    }
    
    res.status(500).json({
        error: "Internal error"
    });
}
