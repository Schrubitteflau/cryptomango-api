import express from "express";

import { InvalidUserDataError } from "../Errors/InvalidUserDataError";

export function invalidUserDataErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    if (error instanceof InvalidUserDataError)
    {
        res.status(422).json({
            error: error.message
        });
    }
    else
    {
        next(error);
    }
}
