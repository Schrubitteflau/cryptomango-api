import { InvalidUserDataError } from "../Errors/InvalidUserDataError";
import express from "express";

export function invalidUserDataErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    //console.log("invalidUserDataErrorHandler");

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
