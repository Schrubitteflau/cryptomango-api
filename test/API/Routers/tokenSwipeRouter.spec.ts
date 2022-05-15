import type { Axios } from "axios";
import { ethers } from "ethers";

import { app } from "@API/init";

import { api, axiosHelper, walletAuth, database, expressApp, fuzz, misc, mock } from "../helpers";
import { Network, networksManager } from "@Networks";

interface IGetNextTokensParams
{
    chainId: any;
    contractType: any;
}

interface IDismissTokenParams extends IGetNextTokensParams
{
    tokenAddress: any;
}

const endpoints = {
    getNextTokens: { endpoint: "/tokenSwipe/getNextTokens", isAuthenticationRequired: true },
    dismissToken: { endpoint: "/tokenSwipe/dismissToken", isAuthenticationRequired: true }
};

const tokenAddressTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_ADDRESSES);
const chainIdTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_CHAIN_IDS);
const contractTypeTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_CONTRACT_TYPES);

const invalidGetNextTokensParamsTestCases = api.buildErrorTestCases<IGetNextTokensParams>({
    // Testing chainId param
    invalidChainId: misc.multiplyProperty({ chainId: chainIdTestValues, contractType: undefined }, "chainId"),
    chainIdNotFound: [ { chainId: "9999", contractType: undefined } ],
    // Testing contractType param
    invalidContractType: misc.multiplyProperty({ chainId: fuzz.VALID_CHAIN_ID, contractType: contractTypeTestValues }, "contractType")
});

const invalidDismissTokenParamsTestCases = api.buildErrorTestCases<IDismissTokenParams>({
    // Testing chainId param
    invalidChainId: misc.multiplyProperty({ chainId: chainIdTestValues, contractType: undefined, tokenAddress: undefined }, "chainId"),
    chainIdNotFound: [ { chainId: "9999", contractType: undefined, tokenAddress: undefined } ],
    // Testing contractType param
    invalidContractType: misc.multiplyProperty({ chainId: fuzz.VALID_CHAIN_ID, contractType: contractTypeTestValues, tokenAddress: undefined }, "contractType"),
    // Testing tokenAddress param
    invalidAddress: misc.multiplyProperty({ chainId: fuzz.VALID_CHAIN_ID, contractType: fuzz.VALID_CONTRACT_TYPE, tokenAddress: tokenAddressTestValues }, "tokenAddress")
});

describe("testing tokenSwipeRouter", () =>
{
    const _axiosNoAuth: Axios = axiosHelper.createAxios();
    const _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    const _walletAddress: string = _wallet.address;
    const _getNextTokensUrl: string = expressApp.getEndpointUrl(endpoints.getNextTokens.endpoint);
    const _dismissTokenUrl: string = expressApp.getEndpointUrl(endpoints.dismissToken.endpoint);
    const _network: Network = networksManager.getNetworks()[0];
    let _axiosAuth: Axios;

    function _doGetNextTokensRequest(params: IGetNextTokensParams)
    {
        return _axiosAuth.get(_getNextTokensUrl, {
            params
        });
    }

    function _doDismissTokenRequest(params: IDismissTokenParams)
    {
        return _axiosAuth.get(_dismissTokenUrl, {
            params
        });
    }

    beforeAll(async () =>
    {
        await database.beforeAll();
        await expressApp.beforeAll(app);

        const tokensCount: number = 50;
        const [erc20, erc721, erc1155] = mock.createMockTokens(tokensCount);
        for (let i = 0; i < tokensCount; i++)
        {
            await _network["_handleNewERC20Token"](erc20[i]);
            await _network["_handleNewERC721NFT"](erc721[i]);
            await _network["_handleNewERC1155MultiToken"](erc1155[i]);
        }

        // Authenticate and get access token
        const authResponse = await _axiosNoAuth.post(expressApp.getEndpointUrl("/auth/connectWallet"), {
            address: _walletAddress,
            signature: await walletAuth.signMessageWithWallet(_wallet)
        });
        const accessToken: string = authResponse.data.accessToken;

        _axiosAuth = axiosHelper.createAxios({
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    });

    afterAll(async () =>
    {
        await database.afterAll();
        expressApp.afterAll();
    });

    describe("/<endpoint> - authentication required", () =>
    {
        const _endpoints: ReadonlyArray<string> = Object.values(endpoints)
            .filter(endpoint => endpoint.isAuthenticationRequired === true)
            .map(endpoint => endpoint.endpoint);

        test.each(_endpoints)("%s - authentication required", async (endpoint: string) =>
        {
            const response = await _axiosNoAuth.get(expressApp.getEndpointUrl(endpoint));
            api.expectErrorResponse(response, api.errorResponses.accessDenied);
        });
    });

    describe("/getNextTokens - invalid query params", () =>
    {
        test.each(invalidGetNextTokensParamsTestCases)("Request { Query { chainId: $chainId, contractType: $contractType } } => Response $expectedResponse", async (testCase) =>
        {
            const { chainId, contractType } = testCase;
            const response = await _doGetNextTokensRequest({ chainId, contractType });
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });

    describe("/dismissToken - invalid query params", () =>
    {
        test.each(invalidDismissTokenParamsTestCases)("Request { Query { chainId: $chainId, contractType: $contractType, tokenAddress: $tokenAddress } } => Response $expectedResponse", async (testCase) =>
        {
            const { chainId, contractType, tokenAddress } = testCase;
            const response = await _doDismissTokenRequest({ chainId, contractType, tokenAddress });
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });

    describe("/getNextTokens and /dismissToken logic", () =>
    {

    });
});
