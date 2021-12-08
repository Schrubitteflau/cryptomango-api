import express from "express";
import { UnauthorizedError } from "express-jwt";

export function authErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    console.log("authErrorHandler");

    if (error instanceof UnauthorizedError)
    {
        res.status(403).json({
            error: "Access denied"
        });
    }
    else
    {
        next(error);
    }   
}
