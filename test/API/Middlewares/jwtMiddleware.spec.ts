import { Axios, AxiosResponse } from "axios";
import express from "express";

import { authErrorHandler, globalErrorHandler, invalidUserDataErrorHandler, mongooseErrorHandler } from "@API/ErrorHandlers";
import { jwtMiddleware } from "@API/Middlewares";
import { isUndefined } from "@Util/TypeUtils";

import { axiosHelper, auth, apiExpectations, expressApp, dataSamples } from "../helpers";

const app: express.Application = express();

app
    .use(jwtMiddleware)

    // Error handlers
    .use(invalidUserDataErrorHandler)
    .use(authErrorHandler)
    .use(mongooseErrorHandler)
    .use(globalErrorHandler)

.get("/protected", (
    req: express.Request,
    res: express.Response
): void =>
{
    res.status(200).json({
        message: "Access granted !"
    });
});

interface IAccessDeniedTestCase
{
    accessToken?: string;
    testName: string;
}

const accessDeniedTestCases: ReadonlyArray<IAccessDeniedTestCase> = [
    { testName: "no authentication token" },
    ...dataSamples.INVALID_AUTH_TOKENS.map((token: string) => {
        return { testName: "invalid authentication token", accessToken: token }
    })
] as const;

describe("testing jwtMiddleware with /protected endpoint", () =>
{
    const _axios: Axios = axiosHelper.createAxios();
    const _protectedEndpoint: string = expressApp.getEndpointUrl("/protected");

    function _doProtectedRequest(authToken?: string): Promise<AxiosResponse>
    {
        if (isUndefined(authToken)) return _axios.get(_protectedEndpoint);
        return _axios.get(_protectedEndpoint, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });
    }

    beforeAll(async () =>
    {
        await expressApp.beforeAll(app);
    });

    afterAll(() =>
    {
        expressApp.afterAll();
    });

    describe("/protected - failed authentication", () =>
    {
        test.each(accessDeniedTestCases)("/protected - $testName", async (testCase: IAccessDeniedTestCase ) =>
        {
            const response = await _doProtectedRequest(testCase.accessToken);
            apiExpectations.expectErrorResponse(response, apiExpectations.accessDenied);
        });
    });

    it("/protected - valid token", async () =>
    {
        const response = await _doProtectedRequest(auth.getValidAccessToken());
        expect(response.status).toBe(200);
        expect(response.data.message).toBe("Access granted !");
    });
});
