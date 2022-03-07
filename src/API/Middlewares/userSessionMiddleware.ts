import express from "express";

import { UserSession, userSessionsManager } from "../Users";
import { isNull, isObject } from "@Util/TypeUtils";

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
    if (!isObject(req.jwtDecoded))
    {
        next(new Error("Cannot read req.jwtDecoded property properly"));
        return;
    }

    const { userId } = req.jwtDecoded;
    const userSession: UserSession | null = userSessionsManager.getUserSession(userId);

    if (isNull(userSession))
    {
        next(new Error(`UserSession for user #${userId} does not exist`));
        return;
    }

    res.locals.userSession = userSession;
    
    next();
}
