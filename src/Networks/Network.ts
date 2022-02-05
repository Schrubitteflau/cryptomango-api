import { IRawNetwork } from "@Config";
import type { BlockWithTransactions } from "@Types/EthersTypes";
import { IBlockWithTransactions, IContractCreationTransaction, IERC20Token, IERC721NFT, IERC1155MultiToken } from "@Schemas";
import { formatBlock, FormatBlockReturn } from "@Formatters";
import { isNull, logger } from "@Util";
import { ChecksumAddress } from "@EVM/Types";
import { providers } from "ethers";
import { ContractType, createContractWrapper, ERC1155Wrapper, ERC20Wrapper, ERC721Wrapper } from "@EVM/ContractsWrappers";
import { ContractIndexerService, BlocksDownloaderService } from "@NetworkServices";
import { HydratedDocument } from "mongoose";
import { createNetworkRelatedRepository } from "@Repositories";
import { FlushResult, ValidationResult } from "Database/Repositories/AbstractRepository";

export class Network
{
    private readonly _jsonRpcProvider: providers.JsonRpcProvider = new providers.JsonRpcProvider(
        this._config.jsonRpcProviderUrl
    );
    /**
     * Mapping of the models and their collection name
     */
    private readonly _collectionNames = {
        blockWithTransactions: this._formatCollectionName("blockWithTransactions"),
        contractCreationTransaction: this._formatCollectionName("contractCreationTransaction"),
        erc20Token: this._formatCollectionName("erc20Token"),
        erc721Token: this._formatCollectionName("erc721Token"),
        erc1155Token: this._formatCollectionName("erc1155Token")
    } as const;
    private readonly _repositories = {
        blockWithTransactions: createNetworkRelatedRepository("BlockWithTransactions", this._collectionNames.blockWithTransactions),
        contractCreationTransactions: createNetworkRelatedRepository("ContractCreationTransaction", this._collectionNames.contractCreationTransaction),
        erc20Token: createNetworkRelatedRepository("ERC20Token", this._collectionNames.erc20Token),
        erc721Token: createNetworkRelatedRepository("ERC721NFT", this._collectionNames.erc721Token),
        erc1155Token: createNetworkRelatedRepository("ERC1155MultiToken", this._collectionNames.erc1155Token)
    } as const;
    private readonly _blocksDownloaderService: BlocksDownloaderService = new BlocksDownloaderService({
        ...this._config.blocksDownloading,
        network: this
    });
    private readonly _contractIndexerService: ContractIndexerService = new ContractIndexerService(
        this._blocksDownloaderService
    );

    public constructor
    (
        private readonly _config: IRawNetwork,
    ) { }

    /**
     * Format a collection name to make it unique to the network
     * @param collectionName 
     * @returns The formatted collectionName
     */
    private _formatCollectionName(collectionName: string): string
    {
        return `${this._config.collectionPrefix}_${collectionName}`;
    }

    /**
     * Called when a new block is downloaded by the BlocksDownloaderService of this network
     * @param block Raw data containing the block and its transactions data
     */
    private async _handleNewBlock(block: BlockWithTransactions): Promise<void>
    {
        const formatBlockReturn: FormatBlockReturn = formatBlock(block);

        if (!formatBlockReturn.isSuccessful)
        {
            return logger.error(`Failed to format block #${block.number}`);
        }

        const blockValidationResult: ValidationResult = this._repositories.blockWithTransactions.insert(
            formatBlockReturn.block
        );

        if (blockValidationResult.isValid === false)
        {
            return logger.error(`Invalid block document #${formatBlockReturn.block.number}`);
        }

        const blockFlushResult: FlushResult<IBlockWithTransactions> = await this._repositories.blockWithTransactions.flush();

        for (const blockDocument of blockFlushResult.inserted)
        {
            logger.info(`Stored block #${blockDocument.number}`);
        }

        for (const contractCreationTransaction of formatBlockReturn.contractCreationTransactions)
        {
            const validationResult: ValidationResult = this._repositories.contractCreationTransactions.insert(contractCreationTransaction);

            if (validationResult.isValid === false)
            {
                return logger.error(`Invalid contractCreationTransaction document #${contractCreationTransaction.hash} of block #${contractCreationTransaction.blockNumber}`);
            }
        }

        const contractCreationTransactionsFlushResult: FlushResult<IContractCreationTransaction> = await this._repositories.contractCreationTransactions.flush();
        const storedContractCreationTransactionsCount: number = contractCreationTransactionsFlushResult.inserted.length;

        if (storedContractCreationTransactionsCount > 0)
        {
            logger.info(`Stored ${storedContractCreationTransactionsCount} contractCreationTransactions of block #${formatBlockReturn.block.number}`);
        }
    }

    private async _handleNewERC20Token(token: IERC20Token): Promise<void>
    {
        const validationResult: ValidationResult = this._repositories.erc20Token.insert(token);

        if (validationResult.isValid === false)
        {
            logger.error(`Invalid erc20Token document at address ${token.address}`);
        }

        const flushResult: FlushResult<IERC20Token> = await this._repositories.erc20Token.flush();

        for (const document of flushResult.inserted)
        {
            logger.info(`Stored erc20Token document : ${document.name} $${document.symbol} at ${document.address}`);
        }
    }

    private async _handleNewERC721NFT(token: IERC721NFT): Promise<void>
    {
        const validationResult: ValidationResult = this._repositories.erc721Token.insert(token);

        if (validationResult.isValid === false)
        {
            logger.error(`Invalid erc721Token document at address ${token.address}`);
        }

        const flushResult: FlushResult<IERC721NFT> = await this._repositories.erc721Token.flush();

        for (const document of flushResult.inserted)
        {
            logger.info(`Stored erc721Token document : ${document.name} $${document.symbol} at ${document.address}`);
        }
    }

    private async _handleNewERC1155MultiToken(token: IERC1155MultiToken): Promise<void>
    {
        const validationResult: ValidationResult = this._repositories.erc1155Token.insert(token);

        if (validationResult.isValid === false)
        {
            logger.error(`Invalid erc1155Token document at address ${token.address}`);
        }

        const flushResult: FlushResult<IERC1155MultiToken> = await this._repositories.erc1155Token.flush();

        for (const document of flushResult.inserted)
        {
            logger.info(`Stored erc1155Token document : ${document.name} $${document.symbol} at ${document.address}`);
        }
    }

    /** Some getters **/
    public getFullName(): string
    {
        return this._config.fullName;
    }

    public getChainId(): number
    {
        return this._config.chainId;
    }

    /**
     * Fetch the block data and its transactions of the block specified by blockNumber
     * @param blockNumber 
     * @returns A promise resolved with an BlockWithTransactions object
     */
    public getBlockWithTransactions(blockNumber: number): Promise<BlockWithTransactions>
    {
        return this._jsonRpcProvider.getBlockWithTransactions(blockNumber);
    }

    /**
     * @returns A promise resolved with the last block number added on chain
     */
    public getLatestBlockNumberOnChain(): Promise<number>
    {
        return this._jsonRpcProvider.getBlockNumber();
    }

    /**
     * Fetch the number of the latest stored block in the database, not the latest block on chain
     * @returns A promise resolved with the block number, or null if no blocks are stored yet
     */
    public async getLatestStoredBlockNumber(): Promise<number | null>
    {
        const block: HydratedDocument<IBlockWithTransactions> | null = await this._repositories.blockWithTransactions.getLatest();

        return (isNull(block) ? null : block.number);
    }

    // @TODO refactor signatures
    public createContractWrapper(type: "ERC20", contractAddress: ChecksumAddress): ERC20Wrapper;
    public createContractWrapper(type: "ERC721", contractAddress: ChecksumAddress): ERC721Wrapper;
    public createContractWrapper(type: "ERC1155", contractAddress: ChecksumAddress): ERC1155Wrapper;

    public createContractWrapper(type: ContractType, contractAddress: ChecksumAddress)
    {
        return createContractWrapper(type, contractAddress, this._jsonRpcProvider);
    }

    /**
     * Starts all the services required to download and index the blocks.
     * These services only emits data, they don't have access to the database.
     */
    public startSyncing(): void
    {
        this._blocksDownloaderService.on("block", this._handleNewBlock.bind(this));
        this._contractIndexerService.on("ERC20Token", this._handleNewERC20Token.bind(this));
        this._contractIndexerService.on("ERC721NFT", this._handleNewERC721NFT.bind(this));
        this._contractIndexerService.on("ERC1155MultiToken", this._handleNewERC1155MultiToken.bind(this));

        this._contractIndexerService.start();
        this._blocksDownloaderService.start();
    }
}
