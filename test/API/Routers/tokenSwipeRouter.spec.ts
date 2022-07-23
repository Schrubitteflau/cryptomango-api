import type { Axios, AxiosResponse } from "axios";
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
    const _mockTokensCount: number = 50;
    const [_mockErc20, _mockErc721, _mockErc1155] = mock.createMockTokens(_mockTokensCount);
    let _axiosAuth: Axios;

    function _getNextTokens(params: IGetNextTokensParams)
    {
        return _axiosAuth.get(_getNextTokensUrl, {
            params
        });
    }

    function _dismissToken(params: IDismissTokenParams)
    {
        return _axiosAuth.get(_dismissTokenUrl, {
            params
        });
    }

    beforeAll(async () =>
    {
        await database.beforeAll();
        await expressApp.beforeAll(app);

        for (let i = 0; i < _mockTokensCount; i++)
        {
            // @TODO beurk
            await _network["_handleNewERC20Token"](_mockErc20[i]);
            await _network["_handleNewERC721NFT"](_mockErc721[i]);
            await _network["_handleNewERC1155MultiToken"](_mockErc1155[i]);
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
            const response = await _getNextTokens({ chainId, contractType });
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });

    describe("/dismissToken - invalid query params", () =>
    {
        test.each(invalidDismissTokenParamsTestCases)("Request { Query { chainId: $chainId, contractType: $contractType, tokenAddress: $tokenAddress } } => Response $expectedResponse", async (testCase) =>
        {
            const { chainId, contractType, tokenAddress } = testCase;
            const response = await _dismissToken({ chainId, contractType, tokenAddress });
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });

    describe("/getNextTokens and /dismissToken logic", () =>
    {
        const chainId = _network.getChainId();
        const pagination = 10;
        // Indexes
        let idxErc20 = 0;
        let idxErc721 = 0;
        let idxErc1155 = 0;

        function expectTokensResponse(response: AxiosResponse, tokens: Array<any>)
        {
            expect(response.status).toBe(200);
            expect(response.data.tokens).toEqual(
                expect.arrayContaining(
                    tokens.map(token => expect.objectContaining(token))
                )
            );
        }

        function expectTokenDimissedResponse(response: AxiosResponse)
        {
            expect(response.status).toBe(200);
            expect(response.data.message).toBe("Token dismissed");
        }

        it("Get next ERC20 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc20" });
            expectTokensResponse(response, _mockErc20.slice(idxErc20, idxErc20 + pagination));
        });

        it("Dismiss 1 ERC20 token", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc20", tokenAddress: _mockErc20[idxErc20].address });
            expect(response.status).toBe(200);
            expect(response.data.message).toBe("Token dismissed");
            idxErc20++;
        });

        it("Get next ERC20 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc20" });
            expectTokensResponse(response, _mockErc20.slice(idxErc20, idxErc20 + pagination));
        });

        it("Dismiss 1 ERC721 token", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc721", tokenAddress: _mockErc721[idxErc721].address });
            expectTokenDimissedResponse(response);
            idxErc721++;
        });

        it("Get next ERC20 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc20" });
            expectTokensResponse(response, _mockErc20.slice(idxErc20, idxErc20 + pagination));
        });

        it("Get next ERC721 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc721" });
            expectTokensResponse(response, _mockErc721.slice(idxErc721, idxErc721 + pagination));
        });

        it("Dismiss 45 ERC1155 tokens", async () =>
        {
            for (let i = 0; i < 45; i++)
            {
                const response = await _dismissToken({ chainId, contractType: "erc1155", tokenAddress: _mockErc1155[idxErc1155].address });
                expectTokenDimissedResponse(response)
                idxErc1155++;
            }
        });

        it("Get next ERC1155 tokens (45 - 50)", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc1155" });
            expectTokensResponse(response, _mockErc1155.slice(idxErc1155, idxErc1155 + pagination));
        });

        it("Dismiss 1 ERC1155 token", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc1155", tokenAddress: _mockErc1155[idxErc1155].address });
            expectTokenDimissedResponse(response);
            idxErc1155++;
        });

        it("Get next ERC1155 tokens (46 - 50)", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc1155" });
            expectTokensResponse(response, _mockErc1155.slice(idxErc1155, idxErc1155 + pagination));
        });

        it("Dismiss 4 ERC1155 tokens", async () =>
        {
            for (let i = 0; i < 4; i++)
            {
                const response = await _dismissToken({ chainId, contractType: "erc1155", tokenAddress: _mockErc1155[idxErc1155].address });
                expectTokenDimissedResponse(response);
                idxErc1155++;
            }
        });

        it("Get next ERC1155 (empty)", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc1155" });
            expectTokensResponse(response, _mockErc1155.slice(idxErc1155, idxErc1155 + pagination));
            // Empty array : no more tokens
            expect(response.data.tokens).toEqual([]);
        });

        it("Dismiss 1 ERC721 token", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc721", tokenAddress: _mockErc721[idxErc721].address });
            expectTokenDimissedResponse(response);
            idxErc721++;
        });

        it("Get next ERC20 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc20" });
            expectTokensResponse(response, _mockErc20.slice(idxErc20, idxErc20 + pagination));
        });

        it("Get next ERC721 tokens", async () =>
        {
            const response = await _getNextTokens({ chainId, contractType: "erc721" });
            expectTokensResponse(response, _mockErc721.slice(idxErc721, idxErc721 + pagination));
        });

        // A token whose timestamp is before the last token dismissed (current cursor) cannot be dismissed
        it("Dismiss a previously dismissed ERC1155 token", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc1155", tokenAddress: _mockErc1155[5].address });
            expect(response.status).toBe(200);
            expect(response.data.message).toBe("Ignored");
        });

        // Dismiss a token that doesn't exist
        it("Dismiss an ERC20 token that doesn't exist", async () =>
        {
            const response = await _dismissToken({ chainId, contractType: "erc20", tokenAddress: fuzz.ZERO_ADDRESS });
            expect(response.status).toBe(404);
            expect(response.data.error).toBe("Not found : Token not found");
        });

        // We can still dismiss the last token indexed before the others, which will be ignored
        // The only thing we can't do is to go back in time
        it("Dismiss an ERC20 token which should be dismissed after others", async () =>
        {
            // We set the index at 40, and dismiss this token
            idxErc20 = 40;
            const response1 = await _dismissToken({ chainId, contractType: "erc20", tokenAddress: _mockErc20[idxErc20].address });
            expectTokenDimissedResponse(response1);

            // So the next ones should be from 41 to 41 + pagination
            idxErc20++;
            const response2 = await _getNextTokens({ chainId, contractType: "erc20"});
            expectTokensResponse(response2, _mockErc20.slice(idxErc20, idxErc20 + pagination));
        });
    });
});
