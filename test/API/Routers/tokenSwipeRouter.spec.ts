import { app } from "@API/init";

import { Axios } from "axios";
import { ethers } from "ethers";
import { apiExpectations, axiosHelper, walletAuth, database, expressApp } from "../helpers";

const authenticationRequiredEndpoints: ReadonlyArray<string> = [
    "/tokenSwipe/getNextTokens",
    "/tokenSwipe/dismissToken",
    "/tokenSwipe/followToken"
] as const;

describe("testing tokenSwipeRouter", () =>
{
    let _axiosNoAuth: Axios = axiosHelper.createAxios();
    let _axiosAuth: Axios;
    let _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    let _walletAddress: string = _wallet.address;
    let _getNextTokensUrl: string = expressApp.getEndpointUrl("/tokenSwipe/getNextTokens");
    let _dismissTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/dismissToken");
    let _followTokenUrl: string = expressApp.getEndpointUrl("/tokenSwipe/followToken");

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
        test.each(authenticationRequiredEndpoints)("/$endpoint - authentication required", async (endpoint: string) =>
        {
            const response = await _axiosNoAuth.get(expressApp.getEndpointUrl(endpoint));
            apiExpectations.expectErrorResponse(response, apiExpectations.accessDenied);
        });
    });
});
