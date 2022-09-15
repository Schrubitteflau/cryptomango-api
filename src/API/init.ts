import { Server } from "http";

import express from "express";
import cors from "cors";
import "express-async-errors";

import { authRouter, tokenSwipeRouter } from "./Routers";
import { authErrorHandler, invalidUserDataErrorHandler, globalErrorHandler } from "./ErrorHandlers";

export const app: express.Application = express();
export const LISTEN_PORT: number = parseInt(process.env.API_PORT, 10);

interface IListenResult {
    server: Server;
    port: number;
}

export function listen(): Promise<IListenResult> {
    return new Promise((resolve) => {
        const server: Server = app.listen(LISTEN_PORT, () => {
            resolve({
                server,
                port: LISTEN_PORT
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
    .use("/tokenSwipe", tokenSwipeRouter)

    // Error handlers
    .use(invalidUserDataErrorHandler)
    .use(authErrorHandler)
    .use(globalErrorHandler);
