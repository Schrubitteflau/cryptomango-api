import { BaseWrapper, RpcCallResult } from "./BaseWrapper";
import { ERC721 } from "../Contracts";

export class ERC721Wrapper extends BaseWrapper {
    public constructor(private readonly _erc721: ERC721) {
        super();
    }

    /**
     * @alwaysResolve
     */
    public async tokenURI(tokenId: number): Promise<RpcCallResult<string>> {
        return this._handleCall(this._erc721.tokenURI(tokenId));
    }

    /**
     * @alwaysResolve
     */
    public async name(): Promise<RpcCallResult<string>> {
        return this._handleCall(this._erc721.name());
    }

    /**
     * @alwaysResolve
     */
    public async symbol(): Promise<RpcCallResult<string>> {
        return this._handleCall(this._erc721.symbol());
    }
}
