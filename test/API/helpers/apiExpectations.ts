import { AxiosResponse } from "axios";

interface IApiErrorExpectation
{
    expectedStatus: number;
    expectedErrorMessage: string;
}

export const accessDenied: IApiErrorExpectation = {
    expectedStatus: 403,
    expectedErrorMessage: "Access denied"
} as const;

export const invalidAddress: IApiErrorExpectation = {
    expectedStatus: 422,
    expectedErrorMessage: "Invalid address format"
} as const;

export const invalidSignature: IApiErrorExpectation = {
    expectedStatus: 422,
    expectedErrorMessage: "Invalid signature format"
} as const;

export const walletAuthFailed: IApiErrorExpectation = {
    expectedStatus: 403,
    expectedErrorMessage: "Failed to authenticate wallet"
};

export function expectErrorResponse(response: AxiosResponse, expectation: IApiErrorExpectation): void
{
    expect(response.status).toBe(expectation.expectedStatus);
    expect(response.data.error).toBe(expectation.expectedErrorMessage);
}
