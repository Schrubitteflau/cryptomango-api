import { authErrorHandler, globalErrorHandler, invalidUserDataErrorHandler, mongooseErrorHandler } from "@API/ErrorHandlers";
import { jwtMiddleware } from "@API/Middlewares";
import { isUndefined } from "@Util/TypeUtils";
import { Axios, AxiosResponse } from "axios";
import express from "express";
import { axiosHelper, auth, apiExpectations, expressApp } from "../helpers";

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

const INVALID_AUTH_TOKENS = [
    // Wrong signature
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjA4ZWNlYjk1ZWYyODExZGFiM2U1NjMiLCJhZGRyZXNzIjoiMHgzNzdmZjgzMTY1QzZkQzU0QTYyN0Y4Mjc4NDNiM2U5RTUwMjFGOEQwIiwiaWF0IjoxNjQ0NzUyMTA3LCJleHAiOjE2NDQ3NTU3MDcsImp0aSI6IjYwNGJlN2VkLTFkN2YtNDcyYi05MDg0LTUxZWQ0MjIxY2IxMiJ9.TDRl3PqtTC4efNHiAtCajwr87pX1MaynbY_YJMJ8xFQ",
    // Wrong signature and body
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.40OXv6OSdTvI0ySKf2LjIOQPGVo78ze2Z74T41Rq8t0"
] as const;

const accessDeniedTestCases: ReadonlyArray<IAccessDeniedTestCase> = [
    { testName: "no authentication token" },
    ...INVALID_AUTH_TOKENS.map((token: string) => {
        return { testName: "invalid authentication token", accessToken: token }
    })
] as const;

describe("testing jwtMiddleware with /protected endpoint", () =>
{
    let _axios: Axios = axiosHelper.createAxios();
    let _protectedEndpoint: string = expressApp.getEndpointUrl("/protected");

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
    })
});
