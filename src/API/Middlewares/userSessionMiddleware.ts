import { Request, Response, NextFunction } from "express";

import { UserSession, userSessionsManager } from "../Users";
import { isNull, isObject } from "@Util/TypeUtils";
import { SessionNotExistError } from "@API/Errors/SessionNotExistError";

export interface IUserSessionResponseLocals
{
    userSession: UserSession;
}

export function userSessionMiddleware(
    req: Request,
    res: Response<any, IUserSessionResponseLocals>,
    next: NextFunction
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
        next(new SessionNotExistError(userId));
        return;
    }

    res.locals.userSession = userSession;
    
    next();
}
