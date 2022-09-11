import { createModel } from "@Models";
import { IERC20Token } from "@Schemas";

import { AbstractTokenRepository } from "./AbstractTokenRepository";

export class ERC20TokenRepository extends AbstractTokenRepository<IERC20Token> {
    public constructor(collectionName: string) {
        super(createModel("ERC20Token", collectionName));
    }
}
