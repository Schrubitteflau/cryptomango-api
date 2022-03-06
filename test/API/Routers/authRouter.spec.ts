import type { Axios } from "axios";
import { ethers } from "ethers";

import { app } from "@API/init";

import { walletAuth, api, database, axiosHelper, auth, expressApp, fuzz, misc } from "../helpers";

interface IConnectWalletParams
{
    address: any;
    signature: any;
}

const addressTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_ADDRESSES);
const signatureTestValues: ReadonlyArray<any> = fuzz.createFuzzValuesSet(fuzz.INVALID_SIGNATURES);

const invalidConnectWalletParamsTestCases: api.ExpectedApiResponseForParams<IConnectWalletParams> = api.buildErrorTestCases<IConnectWalletParams>({
    // Testing address param
    invalidAddress: misc.multiplyProperty({ address: addressTestValues, signature: undefined }, "address"),
    // Testing contractType param
    invalidSignature: misc.multiplyProperty({ address: fuzz.VALID_ADDRESS, signature: signatureTestValues }, "signature")
});

describe("testing authRouter", () =>
{
    const _axios: Axios = axiosHelper.createAxios();
    const _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    const _walletAddress: string = _wallet.address;
    const _baseUrl: string = expressApp.getBaseUrl();
    const _connectWalletUrl: string = `${_baseUrl}/auth/connectWallet`;

    function _doConnectWalletRequest(address?: any, signature?: any)
    {
        return _axios.post(_connectWalletUrl, {
            address,
            signature
        });
    }

    beforeAll(async () =>
    {
        await database.beforeAll();
        await expressApp.beforeAll(app);
    });

    afterAll(async () =>
    {
        await database.afterAll();
        expressApp.afterAll();
    });

    describe("/connectWallet - invalid body", () =>
    {
        test.each(invalidConnectWalletParamsTestCases)("Request { Body { address: $address, signature: $signature } } => Response $expectedResponse", async (testCase) =>
        {
            const response = await _doConnectWalletRequest(testCase.address, testCase.signature);
            api.expectErrorResponse(response, testCase.expectedResponse);
        });
    });

    describe("/connectWallet - valid body", () =>
    {
        test("valid address and valid signature formats", async () =>
        {
            const response = await _doConnectWalletRequest(fuzz.VALID_ADDRESS, fuzz.VALID_SIGNATURE);
            api.expectErrorResponse(response, api.errorResponses.walletAuthFailed);
        });
    });

    describe("/connectWallet - authentication logic", () =>
    {
        test("address with random signature", async () =>
        {
            const response = await _doConnectWalletRequest(_walletAddress, await walletAuth.signMessageWithRandomWallet());
            api.expectErrorResponse(response, api.errorResponses.walletAuthFailed);
        });

        test("wallet signs bad message", async () =>
        {
            const message = "<bad message>";
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            api.expectErrorResponse(response, api.errorResponses.walletAuthFailed);
        });

        test("wallet signs bad message", async () =>
        {
            const message = walletAuth.getMessageToSign(walletAuth.getRandomAddress());
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            api.expectErrorResponse(response, api.errorResponses.walletAuthFailed);
        });

        test("wallet signs valid message", async () =>
        {
            const response = await _doConnectWalletRequest(_walletAddress, await walletAuth.signMessageWithWallet(_wallet));
            expect(response.status).toBe(200);
            const jwtDecoded = auth.jwtDecode(response.data.accessToken);
            expect(typeof jwtDecoded).toBe("object");
            expect((jwtDecoded as any).address).toBe(_walletAddress);
        });
    });
});
