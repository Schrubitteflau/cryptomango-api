import { Router } from "express";

import { Network } from "@Networks";
import { RequestWithQuery, ResponseWithLocals } from "@Types/Express";

import { jwtMiddleware, userSessionMiddleware, IUserSessionResponseLocals } from "../Middlewares";
import { extractChecksumAddressFromString, extractContractTypeFromString, extractNetworkFromString } from "@API/Extractors";
import { ContractType } from "@EVM/BytecodeAnalyzer";
import { ChecksumAddress } from "@Util/TypeUtils/EVM";
import { ChainSwipeState } from "@Schemas";
import { ContractType as AnotherContractType } from "@EVM/ContractsWrappers";
import { isNull, PositiveInteger } from "@Util/TypeUtils";
import { InvalidUserDataError, NotFoundError } from "@API/Errors";

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

export const tokenSwipeRouter: Router = Router();

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
    const repository = network.getRepositoryOfContractType(contractType);

    const swipeState: ChainSwipeState = res.locals.userSession.getSwipeState(network);
    // @TODO temporaire, faut vraiment unifier les 2 ContractType
    // en faisant une classe par exemple
    const currentPosition: PositiveInteger = swipeState[contractType.toUpperCase() as AnotherContractType];

    const tokens = await repository.findTokenAfterPosition({
        position: currentPosition,
        limit: 10
    });

    res.status(200).json({
        tokens
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
    const repository = network.getRepositoryOfContractType(contractType);

    const swipeState: ChainSwipeState = res.locals.userSession.getSwipeState(network);
    // @TODO temporaire, faut vraiment unifier les 2 ContractType
    // en faisant une classe par exemple
    const currentPosition: PositiveInteger = swipeState[contractType.toUpperCase() as AnotherContractType];

    const token = await repository.findById(tokenAddress);

    if (isNull(token))
    {
        throw new NotFoundError("Token not found");
    }

    if (token.position <= currentPosition)
    {
        res.status(200).json({
            message: "Ignored"
        });
        return;
    }

    // @TODO passer par une méthode update serait mieux
    swipeState[contractType.toUpperCase() as AnotherContractType] = token.position;

    res.status(200).json({
        message: "Token dismissed"
    });
});
