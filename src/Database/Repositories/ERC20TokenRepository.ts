import { createModel } from "@Models";
import { IERC20Token } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class ERC20TokenRepository extends AbstractRepository<IERC20Token>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("ERC20Token", collectionName));
    }
}
