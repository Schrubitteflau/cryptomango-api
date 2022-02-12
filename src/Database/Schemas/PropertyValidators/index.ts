import { isUndefined } from "@Util/TypeUtils";
import { Schema, ValidateFn } from "mongoose";

export function stringType()
{
    return Schema.Types.String;
}

export function numberType()
{
    return Schema.Types.Number;
}

export function required(message?: string): [ boolean, string ]
{
    return [ true, isUndefined(message) ? "{PATH} required, got '{VALUE}'" : message ];
}

export function notRequired(defaultValue: any): { required: false, default: any }
{
    return {
        // sparse: unique unless it is not defined (null and probably undefined)
        required: false,
        default: defaultValue
    };
}

// We return a boolean only, so we don't specify any error message because we use a plugin which checks unique keys
export function unique(): boolean
{
    return true;
}

export function minlength(length: number): [ number, string ]
{
    return [ length, `Expected {PATH} to be at least ${length} characters long, got '{VALUE}'` ];
}

export function min(min: number): [ number, string ]
{
    return [ min, `Expected {PATH} to have be > ${min}, got '{VALUE}'` ];
}

export function validate<T>(validator: ValidateFn<T>)
{
    return {
        validator,
        message: "'{VALUE}' is not a valid {PATH}"
    }
}

export function requiredPositiveInteger()
{
    return {
        type: numberType(),
        required: required(),
        min: min(0)
    };
}

export function requiredStringWithValidator<T>(validator: ValidateFn<T>)
{
    return {
        type: stringType(),
        required: required(),
        validate: validate(validator)
    };
}
