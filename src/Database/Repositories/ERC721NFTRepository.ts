import { createModel } from "@Models";
import { IERC721NFT } from "@Schemas";

import { AbstractTokenRepository } from "./AbstractTokenRepository";

export class ERC721NFTRepository extends AbstractTokenRepository<IERC721NFT>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("ERC721NFT", collectionName));
    }
}
