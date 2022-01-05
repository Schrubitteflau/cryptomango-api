import express from "express";

import { UserSession, userSessionsManager } from "../Users";

export interface IUserSessionResponseLocals
{
    userSession: UserSession;
}

export function userSessionMiddleware(
    req: express.Request,
    res: express.Response<any, IUserSessionResponseLocals>,
    next: express.NextFunction
): void
{
    if (typeof (req.jwtDecoded) !== "object")
    {
        next(new Error("Cannot read req.jwtDecoded property"));
        return;
    }

    const { userId } = req.jwtDecoded;
    const userSession: UserSession | null = userSessionsManager.getUserSession(userId);

    if (userSession === null)
    {
        next(new Error(`UserSession for user #${userId} does not exist`));
        return;
    }

    res.locals.userSession = userSession;
    
    next();
}
