import express from "express";
import { sign as jwtSign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { TokenSwipe, User } from "@Models";
import { UserSession, UserSessionFactory, userSessionsManager } from "@API/Users";

export const authRouter: express.Router = express.Router();

export interface IJwtBody
{
    userId: string;
    iat: number;
    exp: number;
    jti: string;
}

authRouter.post("/signin", async (req: express.Request, res: express.Response) =>
{
    const { username, password } = req.body;
    const userValidate = new User({
        username,
        password
    });
    // Validate the data before searching the user in the database
    const error = userValidate.validateSync([
        "username",
        "password"
    ]);

    // If the validation fails
    if (error instanceof Error)
    {
        throw error;
    }

    // Actually fetching the user
    const user = await User.findOne({
        username,
        password
    }).orFail();

    // Build the JWT payload
    const jwtPayload = {
        userId: user._id
    };
    // And sign it
    const jwt: string = jwtSign(jwtPayload, "secret", {
        algorithm: "HS256",
        expiresIn: "1h",
        jwtid: uuidv4()
    });

    // Build the user's session
    const userSessionFactory: UserSessionFactory = new UserSessionFactory(user._id);
    const userSession: UserSession = await userSessionFactory.buildUserSession();
    userSessionsManager.addUserSession(userSession);

    res.json({
        accessToken: jwt
    });
})

.post("/signup", async (req: express.Request, res: express.Response) =>
{
    const { email, password, username } = req.body;

    const user = await User.create({
        email,
        password,
        username
    });

    res.status(200).json({
        message: "User created, you can sign in"
    });
});
