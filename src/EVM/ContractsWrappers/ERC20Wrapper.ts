import { BigNumber } from "@ethersproject/bignumber";
import { logger, toError } from "@Util";
import { ERC20 } from "../Contracts";

export class ERC20Wrapper
{
    public constructor
    (
        private readonly _erc20: ERC20
    ) { }

    public async decimals(): Promise<number | null>
    {
        try
        {
            return await this._erc20.decimals();
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }

    public async name(): Promise<string | null>
    {
        try
        {
            return await this._erc20.name();
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }

    public async symbol(): Promise<string | null>
    {
        try
        {
            return await this._erc20.symbol();
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }

    public async balanceOf(owner: string): Promise<BigNumber | null>
    {
        try
        {
            return await this._erc20.balanceOf(owner);
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }
}