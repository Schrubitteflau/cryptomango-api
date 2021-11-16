import { logger, toError } from "@Util";
import { ERC1155 } from "../Contracts";

export class ERC1155Wrapper
{
    public constructor
    (
        private readonly _erc1155: ERC1155
    ) { }

    public async name(): Promise<string | null>
    {
        try
        {
            return await this._erc1155.name();
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
            return await this._erc1155.symbol();
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }
}