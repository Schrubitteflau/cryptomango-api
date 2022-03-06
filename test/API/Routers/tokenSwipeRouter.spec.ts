import type { Axios } from "axios";
import { ethers } from "ethers";

import { app } from "@API/init";

import { api, axiosHelper, walletAuth, database, expressApp, fuzz, misc } from "../helpers";

interface IGetNextTokensParams
{
    chainId: any;
    contractType: any;
}

interface IDismissTokenParams extends IGetNextTokensParams
{
    tokenAddress: any;
}

interface IFollowTokenParams extends IDismissTokenParams { }

const authenticationRequiredEndpoints: ReadonlyArray<string> = [
    "/tokenSwipe/getNextTokens",
    "/tokenSwipe/dismissToken",
    "/tokenSwipe/followToken"
] as const;

const tokenAddressTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_ADDRESSES);
const chainIdTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_CHAIN_IDS);
const contractTypeTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_CONTRACT_TYPES);

const invalidGetNextTokensParamsTestCases: api.ExpectedApiResponseForParams<IGetNextTokensParams> = api.buildErrorTestCases<IGetNextTokensParams>({
    // Testing chainId param
    invalidChainId: misc.multiplyProperty({ chainId: chainIdTestValues, contractType: undefined }, "chainId"),
    chainIdNotFound: [ { chainId: "9999", contractType: undefined } ],
    // Testing contractType param
    invalidContractType: misc.multiplyProperty({ chainId: fuzz.VALID_CHAIN_ID, contractType: contractTypeTestValues }, "contractType")
});

describe("testing tokenSwipeRouter", () =>
{
    const _axiosNoAuth: Axios = axiosHelper.createAxios();
    const _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    const _walletAddress: string = _wallet.address;
    const _getNextTokensUrl: string = expressApp.getEndpointUrl("/tokenSwipe/getNextTokens");
    const _dismissTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/dismissToken");
    const _followTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/followToken");
    let _axiosAuth: Axios;

    function _doGetNextTokensRequest(chainId: any, contractType: any)
    {
        return _axiosAuth.get(_getNextTokensUrl, {
            params: {
                chainId,
                contractType
            }
        });
    }

    beforeAll(async () =>
    {
        await database.beforeAll();
        await expressApp.beforeAll(app);

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
        test.each(authenticationRequiredEndpoints)("%s - authentication required", async (endpoint: string) =>
        {
            const response = await _axiosNoAuth.get(expressApp.getEndpointUrl(endpoint));
            api.expectErrorResponse(response, api.errorResponses.accessDenied);
        });
    });

    describe("/getNextTokens - invalid query params", () =>
    {
        test.each(invalidGetNextTokensParamsTestCases)("Request { Query { chainId: $chainId, contractType: $contractType } } => Response $expectedResponse", async (testCase) =>
        {
            const response = await _doGetNextTokensRequest(testCase.chainId, testCase.contractType);
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });
});
