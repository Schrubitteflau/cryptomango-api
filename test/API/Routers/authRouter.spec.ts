import { app } from "@API/init";

import { Axios } from "axios";
import { ethers } from "ethers";
import { walletAuth, apiExpectations, database, axiosHelper, auth, expressApp, dataSamples } from "../helpers";
import { isUndefined } from "@Util/TypeUtils";

interface IInvalidUserDataTestCase
{
    address: any;
    signature: any;
    expectedStatus: number;
    expectedErrorMessage: string;
}

const invalidUserDataTestCases: ReadonlyArray<IInvalidUserDataTestCase> = [
    { address: undefined, signature: undefined, ...apiExpectations.invalidAddress },
    { address: null, signature: undefined, ...apiExpectations.invalidAddress },
    { address: {}, signature: undefined, ...apiExpectations.invalidAddress },
    { address: -1, signature: undefined, ...apiExpectations.invalidAddress },
    { address: true, signature: undefined, ...apiExpectations.invalidAddress },
    { address: function() {}, signature: undefined, ...apiExpectations.invalidAddress },
    { address: dataSamples.INVALID_ADDRESSES[0], signature: undefined, ...apiExpectations.invalidAddress },
    { address: dataSamples.INVALID_ADDRESSES[1], signature: undefined, ...apiExpectations.invalidAddress },
    { address: dataSamples.INVALID_ADDRESSES[2], signature: undefined, ...apiExpectations.invalidAddress },
    { address: dataSamples.INVALID_ADDRESSES[3], signature: undefined, ...apiExpectations.invalidAddress },
    { address: dataSamples.VALID_ADDRESS, signature: undefined, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: null, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: {}, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: -1, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: true, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: function() {}, ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: dataSamples.INVALID_SIGNATURES[0], ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: dataSamples.INVALID_SIGNATURES[1], ...apiExpectations.invalidSignature },
    { address: dataSamples.VALID_ADDRESS, signature: dataSamples.INVALID_SIGNATURES[2], ...apiExpectations.invalidSignature }
] as const;

describe("testing authRouter", () =>
{
    let _axios: Axios = axiosHelper.createAxios();
    let _wallet: ethers.Wallet = walletAuth.getRandomWallet();
    let _walletAddress: string = _wallet.address;
    let _baseUrl: string = expressApp.getBaseUrl();
    let _connectWalletUrl: string = `${_baseUrl}/auth/connectWallet`;

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
        test.each(invalidUserDataTestCases)("Request { Body { address: $address, signature: $signature } } => Response { code: $expectedStatus, error: $expectedErrorMessage }", async (testCase: IInvalidUserDataTestCase) =>
        {
            const body: any = {};
            // No explicit undefined
            if (!isUndefined(testCase.address)) body.address = testCase.address;
            if (!isUndefined(testCase.signature)) body.signature = testCase.signature;

            const response = await _doConnectWalletRequest(testCase.address, testCase.signature);
            expect(response.status).toBe(testCase.expectedStatus);
            expect(response.data.error).toBe(testCase.expectedErrorMessage);
        });
    });

    describe("/connectWallet - valid body", () =>
    {
        test("valid address and valid signature formats", async () =>
        {
            const response = await _doConnectWalletRequest(dataSamples.VALID_ADDRESS, dataSamples.VALID_SIGNATURE);
            apiExpectations.expectErrorResponse(response, apiExpectations.walletAuthFailed);
        });
    });

    describe("/connectWallet - authentication logic", () =>
    {
        test("address with random signature", async () =>
        {
            const response = await _doConnectWalletRequest(_walletAddress, await walletAuth.signMessageWithRandomWallet());
            apiExpectations.expectErrorResponse(response, apiExpectations.walletAuthFailed);
        });

        test("wallet signs bad message", async () =>
        {
            const message = "<bad message>";
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            apiExpectations.expectErrorResponse(response, apiExpectations.walletAuthFailed);
        });

        test("wallet signs bad message", async () =>
        {
            const message = walletAuth.getMessageToSign(walletAuth.getRandomAddress());
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            apiExpectations.expectErrorResponse(response, apiExpectations.walletAuthFailed);
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
