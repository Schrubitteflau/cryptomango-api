import { ITokenSchema } from "./ITokenSchema";

export interface IERC20TokenSchema extends ITokenSchema {
    // Decimals, null if decimals() function is not implemented
    decimals: number | null;
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}
