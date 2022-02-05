import { createModel } from "@Models";
import { IERC721NFT } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class ERC721NFTRepository extends AbstractRepository<IERC721NFT>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("ERC721NFT", collectionName));
    }
}
