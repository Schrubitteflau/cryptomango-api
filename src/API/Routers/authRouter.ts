import express from "express";
import jwt from "express-jwt";
import { sign as jwtSign } from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

import { User } from "@Models";

const authRouter: express.Router = express.Router();

const middleware = jwt({
    secret: "secret",
    algorithms: [ "HS256" ],
    credentialsRequired: true
});

authRouter.get("/protected", middleware, (req: express.Request, res) =>
{
    console.log(req.user);
    res.json({
        message: "bravo"
    });
})

// Authorization: Bearer [token]

authRouter.post("/login", async (req: express.Request, res: express.Response) =>
{
    const { username, password } = req.body;
    const userValidate = new User({
        username,
        password
    });
    const error = userValidate.validateSync([
        "username",
        "password"
    ]);

    if (error instanceof Error)
    {
        throw error;
    }

    const user = await User.findOne({
        username,
        password
    }).orFail();

    const jwtPayload = {
        userId: user._id
    };

    const jwt: string = jwtSign(jwtPayload, "secret", {
        algorithm: "HS256",
        expiresIn: "1h",
        jwtid: uuidv4()
    });

    res.json({
        accessToken: jwt
    });
})

authRouter.post("/register", async (req: express.Request, res: express.Response) =>
{
    const { email, password, username } = req.body;

    await User.create({
        email,
        password,
        username
    });

    res.status(200).json({
        message: "User created, please log in"
    });
});

export { authRouter };
