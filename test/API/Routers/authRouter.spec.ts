import { connectMongoose } from "@Database/init";
import { app, listen } from "@API/init";

import axios, { Axios } from "axios";
import { Mongoose } from "mongoose";
import { Server } from "http";
import { ethers } from "ethers";
import { decode as jwtDecode } from "jsonwebtoken";

const VALID_ADDRESS = "0x3f349bBaFEc1551819B8be1EfEA2fC46cA749aA1";
const VALID_SIGNATURE = "0xfaf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c";

interface IInvalidUserDataTestCases
{
    address: any;
    signature: any;
    expectedStatus: number;
    expectedErrorMessage: string;
}

const expectInvalidAddress = {
    expectedStatus: 422,
    expectedErrorMessage: "Invalid address format"
};

const expectInvalidSignature = {
    expectedStatus: 422,
    expectedErrorMessage: "Invalid signature format"
};

const invalidUserDataTestCases: ReadonlyArray<IInvalidUserDataTestCases> = [
    { address: undefined, signature: undefined, ...expectInvalidAddress },
    { address: null, signature: null, ...expectInvalidAddress },
    { address: "<invalid format>", signature: undefined, ...expectInvalidAddress },
    { address: VALID_ADDRESS.toLowerCase(), signature: undefined, ...expectInvalidAddress },
    { address: "3f349bBaFEc1551819B8be1EfEA2fC46cA749aA1", signature: undefined, ...expectInvalidAddress },
    { address: "0xjf349bBaFEc1551819B8be1EfEA2fC46cA749aA1", signature: undefined, ...expectInvalidAddress },
    { address: VALID_ADDRESS, signature: undefined, ...expectInvalidSignature },
    { address: VALID_ADDRESS, signature: null, ...expectInvalidSignature },
    { address: VALID_ADDRESS, signature: "<invalid format>", ...expectInvalidSignature },
    { address: VALID_ADDRESS, signature: "faf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c", ...expectInvalidSignature },
    { address: VALID_ADDRESS, signature: "0xjaf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c", ...expectInvalidSignature }
];

function getMessageToSign(address: string): string
{
    const obj = {
        message: "Welcome to cryptomango !",
        address
    };
    return JSON.stringify(obj, null, 4);
}

async function signMessageWithRandomWallet(): Promise<string>
{
    const wallet: ethers.Wallet = getRandomWallet();
    const address: string = await wallet.getAddress();
    const message: string = getMessageToSign(address);
    return wallet.signMessage(message);
}

function getRandomWallet(): ethers.Wallet
{
    return ethers.Wallet.createRandom();
}

describe("testing authRouter", () =>
{
    let _axios: Axios = axios.create({
        // Always resolve
        validateStatus: () => true
    });
    let _wallet: ethers.Wallet = getRandomWallet();
    let _walletAddress: string;
    let _baseUrl: string;
    let _connectWalletUrl: string;
    let _mongoose: Mongoose;
    let _httpServer: Server;

    function _doConnectWalletRequest(address?: any, signature?: any)
    {
        return _axios.post(_connectWalletUrl, {
            address,
            signature
        });
    }

    beforeAll(async () =>
    {
        _mongoose = await connectMongoose(process.env.TESTING_MONGO_DATABASE_URL);

        const collections = await _mongoose.connection.db.listCollections().toArray();

        if (collections.length > 0)
        {
            // @TODO see how we can exit and cancel all the tests, because it doesn't work
            // the tests are still executed but they crash because of some undefined variables
            throw new Error("Can't use a not empty database for tests");
        }

        const { port, server } = await listen();
        _httpServer = server;
        _baseUrl = `http://localhost:${port}/auth`;
        _connectWalletUrl = `${_baseUrl}/connectWallet`;

        _walletAddress = await _wallet.getAddress();
    });

    afterAll(async () =>
    {
        _httpServer.close();
        await _mongoose.connection.db.dropDatabase();
        await _mongoose.disconnect();
    });

    describe("/connectWallet - invalid body", () =>
    {
        test.each(invalidUserDataTestCases)("Body { address: $address, signature: $signature } => Response { code: $expectedStatus, error: $expectedErrorMessage }", async (testCase: IInvalidUserDataTestCases) =>
        {
            const body: any = {};
            // No explicit undefined
            if (typeof testCase.address !== "undefined") body.address = testCase.address;
            if (typeof testCase.signature !== "undefined") body.signature = testCase.signature;

            const response = await _doConnectWalletRequest(testCase.address, testCase.signature);
            expect(response.status).toBe(testCase.expectedStatus);
            expect(response.data.error).toBe(testCase.expectedErrorMessage);
        });
    });

    describe("/connectWallet - valid body", () =>
    {
        test("valid address and valid signature formats", async () =>
        {
            const response = await _doConnectWalletRequest(VALID_ADDRESS, VALID_SIGNATURE);
            expect(response.status).toBe(403);
            expect(response.data.error).toBe("Failed to authenticate wallet");
        });
    });

    describe("/connectWallet - authentication logic", () =>
    {
        test("address with random signature", async () =>
        {
            const response = await _doConnectWalletRequest(_walletAddress, await signMessageWithRandomWallet());
            expect(response.status).toBe(403);
            expect(response.data.error).toBe("Failed to authenticate wallet");
        });

        test("wallet signs bad message", async () =>
        {
            const message = "<bad message>";
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            expect(response.status).toBe(403);
            expect(response.data.error).toBe("Failed to authenticate wallet");
        });

        test("wallet signs bad message", async () =>
        {
            const message = getMessageToSign("0x0000000000000000000000000000000000000000");
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            expect(response.status).toBe(403);
            expect(response.data.error).toBe("Failed to authenticate wallet");
        });

        test("wallet signs valid message", async () =>
        {
            const message = getMessageToSign(_walletAddress);
            const response = await _doConnectWalletRequest(_walletAddress, await _wallet.signMessage(message));
            expect(response.status).toBe(200);
            const jwtDecoded = jwtDecode(response.data.accessToken);
            expect(typeof jwtDecoded).toBe("object");
            expect((jwtDecoded as any).address).toBe(_walletAddress);
        });
    });
});
