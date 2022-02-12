import { isNull } from "./null";
import { isUndefined } from "./undefined";

export function isNullOrUndefined(value: any): value is null | undefined
{
    return (isNull(value) || isUndefined(value));
}
