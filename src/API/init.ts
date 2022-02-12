import { Server } from "http";

import express from "express";
import cors from "cors";
import "express-async-errors";

import { apiRouter, authRouter } from "./Routers";
import { authErrorHandler, invalidUserDataErrorHandler, globalErrorHandler, mongooseErrorHandler } from "./ErrorHandlers";


export const app: express.Application = express();
const PORT: number = parseInt(process.env.API_PORT, 10);

interface IListenResult
{
    server: Server;
    port: number;
}

export function listen(): Promise<IListenResult>
{
    return new Promise((resolve) =>
    {
        const server: Server = app.listen(PORT, () => {
            resolve({
                server,
                port: PORT
            });
        });
    });
}

app
    // Middlewares
    .use(cors())
    .use(express.json())

    // Routers
    .use("/auth", authRouter)
    .use("/api", apiRouter)

    // Error handlers
    .use(invalidUserDataErrorHandler)
    .use(authErrorHandler)
    .use(mongooseErrorHandler)
    .use(globalErrorHandler)
;
