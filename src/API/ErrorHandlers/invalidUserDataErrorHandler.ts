import { Request, Response, NextFunction } from "express";

import { InvalidUserDataError } from "../Errors/InvalidUserDataError";

export function invalidUserDataErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void
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
