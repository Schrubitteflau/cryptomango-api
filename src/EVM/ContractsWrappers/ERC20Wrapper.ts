import { BigNumber } from "@ethersproject/bignumber";

import { ERC20 } from "../Contracts";
import { BaseWrapper, RpcCallResult } from "./BaseWrapper";

export class ERC20Wrapper extends BaseWrapper
{
    public constructor (
        private readonly _erc20: ERC20
    ) {
        super();
    }

    /**
     * @alwaysResolve
     */
    public async decimals(): Promise<RpcCallResult<number>>
    {
        return this._handleCall(this._erc20.decimals());
    }

    /**
     * @alwaysResolve
     */
    public async name(): Promise<RpcCallResult<string>>
    {
        return this._handleCall(this._erc20.name());
    }

    /**
     * @alwaysResolve
     */
    public async symbol(): Promise<RpcCallResult<string>>
    {
        return this._handleCall(this._erc20.symbol());
    }

    /**
     * @alwaysResolve
     */
    public async balanceOf(owner: string): Promise<RpcCallResult<BigNumber>>
    {
        return this._handleCall(this._erc20.balanceOf(owner));
    }
}
