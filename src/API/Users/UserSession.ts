import { HydratedDocument } from "mongoose";
import { ChainSwipeState, IUser } from "@Schemas";
import { ChainId } from "@Util/TypeUtils/EVM";
import { Network } from "@Networks";
import { isObject, toPositiveInteger } from "@Util/TypeUtils";

export class UserSession
{
    public constructor
    (
        private readonly _userDocument: HydratedDocument<IUser>
    ) { }

    /**
     * @returns The string representation of the unique id of the User in the database
     */
    public getId(): string
    {
        return this._userDocument.id;
    }

    /**
     * @param network 
     * @returns The IChainSwipeState entry for the provided chainId
     * If no entry is found, it creates the entry in the underlying document with default values
     */
    public getSwipeState(network: Network): ChainSwipeState
    {
        const chainId: ChainId = network.getChainId();
        const swipeState: ChainSwipeState = this._userDocument.swipeState[chainId];

        if (!isObject(swipeState)) {
            this._userDocument.swipeState[chainId] = {
                ERC20: toPositiveInteger(1),
                ERC721: toPositiveInteger(1),
                ERC1155: toPositiveInteger(1)
            };
        }

        return this._userDocument.swipeState[chainId];
    }

    public async saveInDatabase(): Promise<void>
    {
        await this._userDocument.update();
    }
}
