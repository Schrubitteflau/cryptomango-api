import { HydratedDocument } from "mongoose";

import { IERC20Token, IERC721NFT, IERC1155MultiToken, IBaseToken } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

interface IFindTokenAfterPositionParam {
    position: IBaseToken["position"];
    limit: number;
}

export abstract class AbstractTokenRepository<
    T extends IERC20Token | IERC721NFT | IERC1155MultiToken
> extends AbstractRepository<T> {
    public async findTokenAfterPosition({ position, limit }: IFindTokenAfterPositionParam) {
        // @TODO update with new tricks
        const documents: ReadonlyArray<HydratedDocument<T>> = await this._model.find({
            position: { $gt: position }
        }).limit(limit);

        return documents;
    }
}
