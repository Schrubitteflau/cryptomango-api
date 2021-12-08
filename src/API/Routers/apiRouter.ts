import express from "express";

import { jwtMiddleware, userSessionMiddleware, IUserSessionResponseLocals } from "../Middlewares";

export const apiRouter: express.Router = express.Router();

apiRouter
    .use(jwtMiddleware)
    .use(userSessionMiddleware)

.get("/protected", (
    req: express.Request,
    res: express.Response<any, IUserSessionResponseLocals>
): void =>
{
    res.json({
        message: "bravo, " + res.locals.userSession.getId()
    });
});
