import { createModel } from "@Models";
import { IERC1155MultiToken } from "@Schemas";

import { AbstractTokenRepository } from "./AbstractTokenRepository";

export class ERC1155MultiTokenRepository extends AbstractTokenRepository<IERC1155MultiToken>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("ERC1155MultiToken", collectionName));
    }
}
