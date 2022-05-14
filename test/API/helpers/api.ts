import { AxiosResponse } from "axios";

export interface IApiErrorResponse
{
    status: number;
    errorMessage: string;
}

export const errorResponses = {
    accessDenied: { status: 403, errorMessage: "Access denied" },
    invalidAddress: { status: 422, errorMessage: "Invalid address format" },
    invalidChainId: { status: 422, errorMessage: "Invalid chainId format" },
    invalidContractType: { status: 422, errorMessage: "Invalid contractType" },
    chainIdNotFound: { status: 404, errorMessage: "Not found : Can't find a network with the provided chainId" },
    invalidSignature: { status: 422, errorMessage: "Invalid signature format" },
    walletAuthFailed: { status: 403, errorMessage: "Failed to authenticate wallet" },
} as const;

export function expectErrorResponse(response: AxiosResponse, expectation: IApiErrorResponse): void
{
    expect(response.status).toBe(expectation.status);
    expect(response.data.error).toBe(expectation.errorMessage);
}

export type ExpectedApiResponseForParams<ParamsType> = ReadonlyArray<ParamsType & {
    expectedResponse: IApiErrorResponse
}>;

type ErrorResponseType = keyof typeof errorResponses;

type BuildErrorTestCasesParam<T> = Partial<{
    [error in ErrorResponseType]: ReadonlyArray<T>
}>;

/*
  Input example: {
    invalidAddress: [{ address: "0xa1", signature: "0xs1" }, { address: "0xa2", signature: "0xs2" }],
    chainIdNotFound: [{ chainId: "890" }, { chainId: "6789" }]
  }

  Expected output: [
    { address: "0xa1", signature: "0xs1", expectedResponse: { status: 422, errorMessage: "Invalid address format" } },
    { address: "0xa2", signature: "0xs2", expectedResponse: { status: 422, errorMessage: "Invalid address format" } },
    { chainId: "890", expectedResponse: { status: 404, errorMessage: "Not found : Can't find a network with the provided chainId" } },
    { chainId: "6789", expectedResponse: { status: 404, errorMessage: "Not found : Can't find a network with the provided chainId" } }
  ]
*/
export function buildErrorTestCases<ParamsType>(errorAndRequestParams: BuildErrorTestCasesParam<ParamsType>): ExpectedApiResponseForParams<ParamsType>
{
    let ret: ExpectedApiResponseForParams<ParamsType> = [];
    // Keep the index type in the for..in loop
    let errorResponseName: ErrorResponseType;

    for (errorResponseName in errorAndRequestParams)
    {
        const errorResponse: IApiErrorResponse = errorResponses[errorResponseName];
        const requestParams: ReadonlyArray<ParamsType> | undefined = errorAndRequestParams[errorResponseName];

        if (!Array.isArray(requestParams)) continue;

        const toAppend: ExpectedApiResponseForParams<ParamsType> = requestParams.map((params: ParamsType) => ({
            ...params,
            expectedResponse: errorResponse
        }));

        ret = [ ...ret, ...toAppend ];
    }

    return ret;
}

export function expectApiResponseForParams<T>(expectedResponse: IApiErrorResponse, paramsList: ReadonlyArray<T>): ExpectedApiResponseForParams<T>
{
    return paramsList.map((params: T) => {
        return {
            ...params,
            expectedResponse
        }
    });
}
