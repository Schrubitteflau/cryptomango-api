import express from "express";
import { sign as jwtSign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { UserSession, userSessionsManager } from "@API/Users";
import { getGlobalRepository, UserRepository } from "@Repositories";
import { IUser } from "@Schemas";
import { HydratedDocument } from "mongoose";
import { isNull } from "@Util/TypeUtils";
import { assertValidChecksumAddress, ChecksumAddress, isValidChecksumAddress } from "@Util/TypeUtils/EVM";
import { ethers } from "ethers";
import { InvalidUserDataError } from "@API/Errors/InvalidUserDataError";
import { isValidMessageSignature } from "@Util/TypeUtils/EVM/MessageSignature";
import { WalletSignatureAuthError } from "@API/Errors/WalletSignatureAuthError";

export interface IJwtPayload
{
    userId: string;
    address: ChecksumAddress;
}

export interface IJwtBody extends IJwtPayload
{
    iat: number;
    exp: number;
    jti: string;
}

export const authRouter: express.Router = express.Router();
const userRepository: UserRepository = getGlobalRepository("User");

interface IMessageToSign
{
    message: string;
    address: ChecksumAddress;
}

function getMessageToSign(address: ChecksumAddress): string
{
    const obj: IMessageToSign = {
        message: "Welcome to cryptomango !",
        address: address
    };
    return JSON.stringify(obj, null, 4);
}

authRouter.post("/connectWallet", async (req: express.Request, res: express.Response) =>
{
    let { address, signature } = req.body;

    if (!isValidChecksumAddress(address))
    {
        throw new InvalidUserDataError("Invalid address format");
    }

    if (!isValidMessageSignature(signature))
    {
        throw new InvalidUserDataError("Invalid signature format");
    }

    // @TODO implémenter nonce

    const messageSignedByClient: string = getMessageToSign(address);

    // @TODO this method is not performant : ~200ms
    const signerAddress: string = ethers.utils.verifyMessage(messageSignedByClient, signature);

    assertValidChecksumAddress(signerAddress);

    const decodedMessage: IMessageToSign = JSON.parse(messageSignedByClient);
    if (address !== signerAddress || signerAddress !== decodedMessage.address)
    {
        throw new WalletSignatureAuthError("Failed to authenticate wallet");
    }

    // Now we know that the user is the owner of the address
    const user: HydratedDocument<IUser> | null = await userRepository.findOneOrInsert({
        address
    });

    // We can't fetch or create the user in the database
    if (isNull(user))
    {
        throw new Error("Unknown error");
    }

    // Build the JWT payload
    const jwtPayload: IJwtPayload = {
        userId: user.id,
        address: user.address
    };
    // And sign it
    const jwt: string = jwtSign(jwtPayload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1h",
        jwtid: uuidv4()
    });

    // Build the user's session if it doesn't exists
    if (!userSessionsManager.hasUserSession(user.id))
    {
        const userSession: UserSession = new UserSession(user);
        userSessionsManager.addUserSession(userSession);
    }

    res.json({
        accessToken: jwt
    });
});
