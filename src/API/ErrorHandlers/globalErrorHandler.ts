import express from "express";

export function globalErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    console.log("globalErrorHandler");

    console.log(error);
    res.status(500).json({
        error: "Internal error : " + error.message
    });
}
