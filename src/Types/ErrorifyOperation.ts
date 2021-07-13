type SuccessfulOperation<T> = {
    success: true,
    data: T
}

type FailedOperation = {
    success: false,
    error: Error
}

export type ErrorifyOperation<T> = SuccessfulOperation<T> | FailedOperation;
