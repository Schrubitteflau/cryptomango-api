import { ITokenSchema } from "./ITokenSchema";

export interface IERC721TokenSchema extends ITokenSchema {
    // Name, null if name() function is not implemented
    name: string | null;
    // Symbol, null if symbol() function is not implemented
    symbol: string | null;
}
