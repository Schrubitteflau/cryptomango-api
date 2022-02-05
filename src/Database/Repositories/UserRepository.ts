import { createModel } from "@Models";
import { IUser } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class UserRepository extends AbstractRepository<IUser>
{
    public constructor
    (
        collectionName: string
    )
    {
        super(createModel("User", collectionName));
    }
}
