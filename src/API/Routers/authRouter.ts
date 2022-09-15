import { Router, Response, NextFunction } from "express";
import { sign as jwtSign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { UserSession, userSessionsManager } from "@API/Users";
import { getGlobalRepository, UserRepository } from "@Repositories";
import { IUser } from "@Schemas";
import { HydratedDocument } from "mongoose";
import { isNull } from "@Util/TypeUtils";
import { assertValidChecksumAddress, ChecksumAddress } from "@Util/TypeUtils/EVM";
import { ethers } from "ethers";
import { InvalidUserDataError, WalletSignatureAuthError } from "../Errors";
import { isValidMessageSignature } from "@Util/TypeUtils/EVM";
import { extractChecksumAddressFromString } from "@API/Extractors";
import { RequestWithBody } from "@Types/Express";

export interface IJwtPayload {
    userId: string;
    address: ChecksumAddress;
}

export interface IJwtBody extends IJwtPayload {
    iat: number;
    exp: number;
    jti: string;
}

interface IConnectWalletRequest {
    signature: string;
    address: string;
}

export const authRouter: Router = Router();
const userRepository: UserRepository = getGlobalRepository("User");

interface IMessageToSign {
    message: string;
    address: ChecksumAddress;
}

function getMessageToSign(address: ChecksumAddress): string {
    const obj: IMessageToSign = {
        message: "Welcome to cryptomango !",
        address: address
    };
    return JSON.stringify(obj, null, 4);
}

authRouter.post("/connectWallet", async (req: RequestWithBody<IConnectWalletRequest>, res: Response, next: NextFunction) =>
{
    const { signature } = req.body;
    const address = extractChecksumAddressFromString(req.body.address);

    if (!isValidMessageSignature(signature))
    {
        // @TODO nothrow
        //return next(new InvalidUserDataError("Invalid signature format"));
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

    const rawUser: IUser = {
        address,
        swipeState: {}
    };

    // Now we know that the user is the owner of the address
    const user: HydratedDocument<IUser> =
        (await userRepository.findOne(rawUser)) || (await userRepository.createOne(rawUser));

    // We can't fetch or create the user in the database
    if (isNull(user))
    {
        throw new Error("Unknown error : cannot create or find user in the database");
    }

    // Build the JWT payload
    const jwtPayload: IJwtPayload = {
        userId: user.id,
        address: user.address
    };
    // And sign it
    const jwt: string = jwtSign(jwtPayload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        // @TODO attention, il faut que le temps d'expiration ici soit le même
        // que pour celui des sessions, car si la personne est toujours connectée
        // mais inactive depuis longtemps et que la session a été supprimée,
        // alors getUserSession() renverra null et SessionNotExistError sera levée
        expiresIn: '300d',//"1h",
        jwtid: uuidv4()
    });

    // Build the user's session if it doesn't exists
    if (!userSessionsManager.hasUserSession(user.id))
    {
        const userSession: UserSession = new UserSession(user);
        userSessionsManager.addUserSession(userSession);
    }

    // @TODO setcookie plutôt que localstorage = + sécure et + automatique côté client
    // mais du coup côté client faudra stocker qqpart si on est login ou pas ?
    // et aussi gérer le refresh des cookies pour que ça expire pas d'un coup pdt qu'on
    // utilise l'appli ? endpoint /refreshAuth par ex qui fera un autre setcookie
    //res.status(200).cookie()

    res.status(200).json({
        accessToken: jwt
    });
});
