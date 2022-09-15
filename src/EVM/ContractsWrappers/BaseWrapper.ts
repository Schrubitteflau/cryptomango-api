import { errors } from "ethers";

import { logger } from "@Util";
import { toError } from "@Util/TypeUtils";

interface EthersJsonRpcError extends Error {
    reason: string;
    code: string;
    error: {
        reason: string;
        code: string;
        body: string;
        error: object;
        requestBody: string;
        requestMethod: string;
        url: string;
    };
    data: string;
}

export enum ErrorType {
    // The contract does not implement the called method
    EVM_METHOD_NOT_IMPLEMENTED = "METHOD_NOT_IMPLEMENTED",
    // The error returned by the endpoint is not handled
    UNHANDLED = "UNHANDLED",
    // The error returned by Ethers can't be handled
    INVALID_FORMAT = "INVALID_FORMAT"
}

interface RpcCallResultSuccess<T> {
    isSuccess: true;
    value: T;
}

interface RpcCallResultError {
    isSuccess: false;
    rawError: Error;
    errorType: ErrorType;
}

export type RpcCallResult<T> = RpcCallResultSuccess<T> | RpcCallResultError;

export abstract class BaseWrapper {
    private _isEthersJsonRpcError(error: Error): error is EthersJsonRpcError {
        const { reason, code, error: err } = error as EthersJsonRpcError;

        return (
            typeof reason === "string" &&
            typeof code === "string" &&
            typeof err === "object" &&
            typeof err.body === "string"
        );
    }

    protected _determineErrorType(error: Error): ErrorType {
        if (!this._isEthersJsonRpcError(error)) {
            logger.error(`${ErrorType.INVALID_FORMAT} => `, error);
            return ErrorType.INVALID_FORMAT;
        }

        // See : https://docs.ethers.io/v5/api/utils/logger/#errors--call-exception
        if (error.code === errors.CALL_EXCEPTION) {
            return ErrorType.EVM_METHOD_NOT_IMPLEMENTED;
        }

        logger.error(`${ErrorType.UNHANDLED} => `, error);
        return ErrorType.UNHANDLED;
    }

    protected _success<T>(value: T): RpcCallResultSuccess<T> {
        return {
            isSuccess: true,
            value
        };
    }

    protected _error(err: unknown): RpcCallResultError {
        const error: Error = toError(err);

        return {
            isSuccess: false,
            errorType: this._determineErrorType(error),
            rawError: error
        };
    }

    protected async _handleCall<T>(call: Promise<T>): Promise<RpcCallResult<T>> {
        try {
            return this._success(await call);
        } catch (error) {
            return this._error(error);
        }
    }
}
