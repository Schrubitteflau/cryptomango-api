import { BaseWrapper, RpcCallResult } from "./BaseWrapper";
import { ERC1155 } from "../Contracts";

export class ERC1155Wrapper extends BaseWrapper {
    public constructor(private readonly _erc1155: ERC1155) {
        super();
    }

    /**
     * @alwaysResolve
     */
    public async name(): Promise<RpcCallResult<string>> {
        return this._handleCall(this._erc1155.name());
    }

    /**
     * @alwaysResolve
     */
    public async symbol(): Promise<RpcCallResult<string>> {
        return this._handleCall(this._erc1155.symbol());
    }
}
