import { StrictContractType } from "@EVM/BytecodeAnalyzer";
import { ITokenSwipe, IUser } from "@Models";
import { Network } from "@Networks"; 
import { IERC1155TokenSchema, IERC20TokenSchema, IERC721TokenSchema } from "@Schemas";
import { TokenSwipeService } from "@Services";
import { MongooseDocument } from "@Types";
import { AllowedSchemas } from "Repositories/AbstractTokenRepository";
import { TokenSwipeCache } from "./TokenSwipeCache";

interface IGetNextTokenSwipeConfig
{
    network: Network;
    tokenType: StrictContractType;
}

export class UserSession
{
    private readonly _tokenSwipeCache = new TokenSwipeCache();

    public constructor
    (
        private readonly _userDocument: MongooseDocument<IUser>,
        private readonly _tokenSwipeDocument: MongooseDocument<ITokenSwipe>
    ) { }

    /**
     * @returns {string} this id of the User document
     */
    public getId(): string
    {
        return this._userDocument.id;
    }

    public getNextTokenSwipe(config: IGetNextTokenSwipeConfig & { tokenType: StrictContractType.ERC20Token }): Promise<Array<IERC20TokenSchema>>;
    public getNextTokenSwipe(config: IGetNextTokenSwipeConfig & { tokenType: StrictContractType.ERC721NFT }): Promise<Array<IERC721TokenSchema>>;
    public getNextTokenSwipe(config: IGetNextTokenSwipeConfig & { tokenType: StrictContractType.ERC1155MultiToken }): Promise<Array<IERC1155TokenSchema>>;

    public async getNextTokenSwipe(config: IGetNextTokenSwipeConfig): Promise<Array<AllowedSchemas>>
    {
        const tokenSwipeService: TokenSwipeService = config.network.getTokenSwipeService();
        let afterCreationTimestamp: number = 0;
        let afterCreationTransactionIndex: number = 0;

        switch (config.tokenType)
        {
            case StrictContractType.ERC20Token:
                afterCreationTimestamp = this._tokenSwipeDocument.erc20.creationTimestamp;
                afterCreationTransactionIndex = this._tokenSwipeDocument.erc20.creationTransactionIndex;
                break;
            case StrictContractType.ERC721NFT:
                afterCreationTimestamp = this._tokenSwipeDocument.erc721.creationTimestamp;
                afterCreationTransactionIndex = this._tokenSwipeDocument.erc721.creationTransactionIndex;
                break;
            case StrictContractType.ERC1155MultiToken:
                afterCreationTimestamp = this._tokenSwipeDocument.erc1155.creationTimestamp;
                afterCreationTransactionIndex = this._tokenSwipeDocument.erc1155.creationTransactionIndex;
                break;
        }

        const tokensCursor = await tokenSwipeService.getNextTokens({
            tokensCount: 10,
            after: {
                creationTimestamp: afterCreationTimestamp,
                creationTransactionIndex: afterCreationTransactionIndex
            },
            contractType: config.tokenType
        });

        const tokens = await tokensCursor.toArray();

        for (const token of tokens)
        {
            this._tokenSwipeCache.add({
                contractType: config.tokenType,
                networkUniqueId: config.network.getUniqueId(),
                contractData: token
            });
        }

        return tokens;
    }

    public followToken(network: Network, contractType: StrictContractType, address: string): void
    {
        const data = this._tokenSwipeCache.get({
            networkUniqueId: network.getUniqueId(),
            contractType,
            contractAddress: address
        });

        if (data === null)
        {
            throw new Error("followToken -> data is null");
        }

        this._tokenSwipeDocument[contractType] = {
            creationTimestamp: data.creationTimestamp,
            creationTransactionIndex: data.creationTransactionIndex
        };
    }

    public dismissToken(network: Network, contractType: StrictContractType, address: string): void
    {
        const data = this._tokenSwipeCache.get({
            networkUniqueId: network.getUniqueId(),
            contractType,
            contractAddress: address
        });

        if (data === null)
        {
            throw new Error("followToken -> data is null");
        }

        this._tokenSwipeDocument[contractType] = {
            creationTimestamp: data.creationTimestamp,
            creationTransactionIndex: data.creationTransactionIndex
        };
    }
}
