import { createModel } from "@Models";
import { IERC1155MultiToken } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class ERC1155MultiTokenRepository extends AbstractRepository<IERC1155MultiToken>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("ERC1155MultiToken", collectionName));
    }
}
