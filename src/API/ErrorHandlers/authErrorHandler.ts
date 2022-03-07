import express from "express";
import { UnauthorizedError } from "express-jwt";

import { WalletSignatureAuthError } from "../Errors/WalletSignatureAuthError";

export function authErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    if (error instanceof UnauthorizedError)
    {
        res.status(403).json({
            error: "Access denied"
        });
    }
    else if (error instanceof WalletSignatureAuthError)
    {
        res.status(403).json({
            error: error.message
        });
    }
    else
    {
        next(error);
    }
}
