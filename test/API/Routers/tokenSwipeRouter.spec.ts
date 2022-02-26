import { Axios } from "axios";
import { ethers } from "ethers";

import { app } from "@API/init";

import { apiExpectations, axiosHelper, walletAuth, database, expressApp } from "../helpers";

const authenticationRequiredEndpoints: ReadonlyArray<string> = [
    "/tokenSwipe/getNextTokens",
    "/tokenSwipe/dismissToken",
    "/tokenSwipe/followToken"
] as const;

describe("testing tokenSwipeRouter", () =>
{
    const _axiosNoAuth: Axios = axiosHelper.createAxios();
    const _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    const _walletAddress: string = _wallet.address;
    const _getNextTokensUrl: string = expressApp.getEndpointUrl("/tokenSwipe/getNextTokens");
    const _dismissTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/dismissToken");
    const _followTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/followToken");
    let _axiosAuth: Axios;

    function _doGetNextTokensRequest(chainId: string, type: string)
    {
        return _axiosAuth.get(_getNextTokensUrl, {
            params: {
                chainId,
                type
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
            apiExpectations.expectErrorResponse(response, apiExpectations.accessDenied);
        });
    });
});
