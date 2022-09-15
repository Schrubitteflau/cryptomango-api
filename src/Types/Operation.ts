// TODO : toujours utilisé ?
type SuccessfulOperation<T> = {
    success: true;
    operationData: T;
};

type FailedOperation = {
    success: false;
    error: Error;
};

export type Operation<T> = SuccessfulOperation<T> | FailedOperation;
