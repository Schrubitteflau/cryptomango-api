import { logger, toError } from "@Util";
import { ERC721 } from "../Contracts";

export class ERC721Wrapper
{
    public constructor
    (
        private readonly _erc721: ERC721
    ) { }

    public async tokenURI(tokenId: number): Promise<string | null>
    {
        try
        {
            return await this._erc721.tokenURI(tokenId);
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
            return await this._erc721.name();
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
            return await this._erc721.symbol();
        }
        catch (error)
        {
            logger.error(toError(error).message);
            return null;
        }
    }
}