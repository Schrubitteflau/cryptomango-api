import { createModel } from "@Models";
import { ITokenSwipe } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class TokenSwipeRepository extends AbstractRepository<ITokenSwipe>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("TokenSwipe", collectionName));
    }
}
