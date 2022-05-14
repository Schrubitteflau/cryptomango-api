import express from "express";

import { Network } from "@Networks";
import { RequestWithQuery, ResponseWithLocals } from "@Types/Express";

import { jwtMiddleware, userSessionMiddleware, IUserSessionResponseLocals } from "../Middlewares";
import { extractChecksumAddressFromString, extractContractTypeFromString, extractNetworkFromString } from "@API/Extractors";
import { ContractType } from "@EVM/BytecodeAnalyzer";
import { ChecksumAddress } from "@Util/TypeUtils/EVM";

interface IGetNextTokensQuery
{
    chainId: string;
    contractType: string;
}

interface IFollowTokenQuery
{
    chainId: string;
    contractType: string;
    tokenAddress: string;
}

interface IDismissTokenQuery extends IFollowTokenQuery {}

export const tokenSwipeRouter: express.Router = express.Router();

tokenSwipeRouter
    .use(jwtMiddleware)
    .use(userSessionMiddleware)

.get("/getNextTokens", async (
    req: RequestWithQuery<IGetNextTokensQuery>,
    res: ResponseWithLocals<IUserSessionResponseLocals>
): Promise<void> =>
{
    const network: Network = extractNetworkFromString(req.query.chainId);
    const contractType: ContractType = extractContractTypeFromString(req.query.contractType);

    res.status(200).json({
        message: "oui!"
    });
})

.get("/dismissToken", async (
    req: RequestWithQuery<IDismissTokenQuery>,
    res: ResponseWithLocals<IUserSessionResponseLocals>
): Promise<void> =>
{
    const network: Network = extractNetworkFromString(req.query.chainId);
    const contractType: ContractType = extractContractTypeFromString(req.query.contractType);
    const tokenAddress: ChecksumAddress = extractChecksumAddressFromString(req.query.tokenAddress);

    res.status(200).json({
        message: "oui!"
    });
});
