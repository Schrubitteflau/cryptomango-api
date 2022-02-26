import { LISTEN_PORT } from "@API/init";

import express from "express";
import { Server } from "http";

let _app: express.Application;
let _httpServer: Server;

export function beforeAll(app: express.Application): Promise<void>
{
    _app = app;

    return new Promise((resolve) => {
        _httpServer = app.listen(LISTEN_PORT, () => {
            resolve();
        });
    });
}

export function afterAll(): void
{
    _httpServer.close();
}

export function getBaseUrl(): string
{
    return `http://localhost:${LISTEN_PORT}`;
}

export function getEndpointUrl(appendEndpoint: string): string
{
    const baseUrl: string = getBaseUrl();
    return `${baseUrl}${appendEndpoint}`;
}
