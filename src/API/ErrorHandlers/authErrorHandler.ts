import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "express-jwt";

import { WalletSignatureAuthError } from "../Errors/WalletSignatureAuthError";

// @TODO mettre tous les error handlers dans 1 même fichier et rendre ça cool à écrire genre
/*
    createErrorHandlerMiddleware(
        on(UnauthorizedError, ({ req: Request, res: Response, error: UnauthorizedError }) => {
            res.status(403).json({
                error: "Access denied"
            });
        }),
        on(WalletSignatureAuthError): ...
    )
*/
export function authErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof UnauthorizedError) {
        res.status(403).json({
            error: "Access denied"
        });
    } else if (error instanceof WalletSignatureAuthError) {
        res.status(403).json({
            error: error.message
        });
    } else {
        next(error);
    }
}
