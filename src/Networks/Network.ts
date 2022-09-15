import { IRawNetwork } from "@Config";
import type { BlockWithTransactions } from "@Types/EthersTypes";
import {
    IBlockWithTransactions,
    IContractCreationTransaction,
    IERC20Token,
    IERC721NFT,
    IERC1155MultiToken
} from "@Schemas";
import { logger } from "@Util";
import { assertValidChainId, ChainId, ChecksumAddress } from "@Util/TypeUtils/EVM";
import { providers } from "ethers";
import { ContractType, createContractWrapper } from "@EVM/ContractsWrappers";
import { ContractIndexerService, BlocksDownloaderService } from "@NetworkServices";
import { HydratedDocument } from "mongoose";
// @TODO unifier les 2 ContractType
import { ContractType as ContractTypeEnum } from "@EVM/BytecodeAnalyzer";
import { createNetworkRelatedRepository, InsertBuffer, ValidationResult } from "@Repositories";
import { BlockWithTransactionsWrapper, blockWithTransactionsWrapperFactory } from "@Formatters";
import EventEmitter from "events";

export class SyncNotEnabledError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "SyncNotEnabledError";
    }
}

export declare interface Network {
    // Emitted when a block is received and successfully wrapped into a BlockWithTransactionsWrapper
    on(event: "blockWithTransactions", listener: (blockWithTransactions: BlockWithTransactionsWrapper) => void): this;

    emit(event: "blockWithTransactions", blockWithTransactions: BlockWithTransactionsWrapper): any;
}

export class Network extends EventEmitter {
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
    public readonly _repositories = {
        blockWithTransactions: createNetworkRelatedRepository(
            "BlockWithTransactions",
            this._collectionNames.blockWithTransactions
        ),
        contractCreationTransactions: createNetworkRelatedRepository(
            "ContractCreationTransaction",
            this._collectionNames.contractCreationTransaction
        ),
        erc20Token: createNetworkRelatedRepository("ERC20Token", this._collectionNames.erc20Token),
        erc721Token: createNetworkRelatedRepository("ERC721NFT", this._collectionNames.erc721Token),
        erc1155Token: createNetworkRelatedRepository("ERC1155MultiToken", this._collectionNames.erc1155Token)
    } as const;
    private readonly _blocksDownloaderService: BlocksDownloaderService = new BlocksDownloaderService({
        ...this._config.blocksDownloading,
        network: this
    });
    private readonly _contractIndexerService: ContractIndexerService = new ContractIndexerService(this);

    public constructor(private readonly _config: IRawNetwork) {
        super();
    }

    /**
     * Format a collection name to make it unique to the network
     *
     * @param collectionName
     * @returns The formatted collectionName
     */
    private _formatCollectionName(collectionName: string): string {
        return `${this._config.collectionPrefix}_${collectionName}`;
    }

    private _onRawBlock(rawBlock: BlockWithTransactions): void {
        // @TODO try catch pas ouf
        try {
            const wrapper: BlockWithTransactionsWrapper = blockWithTransactionsWrapperFactory.create(rawBlock);
            this.emit("blockWithTransactions", wrapper);
            this._store(wrapper);
        } catch (error) {
            logger.error(`Failed to format block #${rawBlock.number}, error : ${error}`, error);
        }
    }

    /**
     * Called each time a new block is downloaded a formatted by the FormattedBlocksProviderService
     * @param block Block data and its contract creation transactions
     */
    private async _store(blockWithTransactions: BlockWithTransactionsWrapper): Promise<void> {
        //@TODO réduire ce code en simplifiant l'API de Repository
        const block: IBlockWithTransactions = {
            _id: blockWithTransactions.number,
            number: blockWithTransactions.number,
            hash: blockWithTransactions.hash,
            timestamp: blockWithTransactions.timestamp,
            contractCreationTransactions: blockWithTransactions.getContractCreationTransactionsHashes(),
            transactions: blockWithTransactions.getAllTransactionHashes()
        };

        const insertedBlock: HydratedDocument<IBlockWithTransactions> =
            await this._repositories.blockWithTransactions.createOne(block);

        logger.info(`Stored block #${insertedBlock.number} ${insertedBlock.hash}`);

        const cctxInsertBuffer: InsertBuffer<IContractCreationTransaction> =
            this._repositories.contractCreationTransactions.createInsertBuffer();

        for (const cctx of blockWithTransactions.getContractCreationTransactions()) {
            const transaction: IContractCreationTransaction = {
                _id: cctx.hash,
                blockHash: cctx.blockHash,
                blockNumber: cctx.blockNumber,
                blockTimestamp: cctx.blockTimestamp,
                contractAddress: cctx.contractAddress,
                creationBytecode: cctx.contractBytecode,
                from: cctx.from,
                hash: cctx.hash,
                indexInBlock: cctx.indexInBlock
            };

            const validationResult: ValidationResult = cctxInsertBuffer.add(transaction);

            if (!validationResult.isValid) {
                logger.error(
                    `Invalid contractCreationTransaction document #${cctx.hash} of block #${cctx.blockNumber}`
                );
                logger.error(cctx);
                return;
            }
        }

        const insertedCctx: ReadonlyArray<HydratedDocument<IContractCreationTransaction>> =
            await cctxInsertBuffer.insert();

        if (insertedCctx.length > 0) {
            logger.info(`Stored ${insertedCctx.length} contractCreationTransactions of block #${block.number}`);
        }
    }

    // @TODO voir si moyen de factoriser _handleNewERC20Token _handleNewERC721NFT et _handleNewERC1155MultiToken
    private async _handleNewERC20Token(token: IERC20Token): Promise<void> {
        // @TODO potentielle erreur de validation
        const inserted: HydratedDocument<IERC20Token> = await this._repositories.erc20Token.createOne(token);

        //logger.error(`Invalid erc20Token document at address ${token.address}`);

        logger.info(`Stored erc20Token document : ${inserted.name} $${inserted.symbol} at ${inserted.address}`);
    }

    private async _handleNewERC721NFT(token: IERC721NFT): Promise<void> {
        // @TODO potentielle erreur de validation
        const inserted: HydratedDocument<IERC721NFT> = await this._repositories.erc721Token.createOne(token);

        //logger.error(`Invalid erc721Token document at address ${token.address}`);

        logger.info(`Stored erc721Token document : ${inserted.name} $${inserted.symbol} at ${inserted.address}`);
    }

    private async _handleNewERC1155MultiToken(token: IERC1155MultiToken): Promise<void> {
        // @TODO potentielle erreur de validation
        const inserted: HydratedDocument<IERC1155MultiToken> = await this._repositories.erc1155Token.createOne(token);

        //logger.error(`Invalid erc1155Token document at address ${token.address}`);

        logger.info(`Stored erc1155Token document : ${inserted.name} $${inserted.symbol} at ${inserted.address}`);
    }

    public getFullName(): string {
        return this._config.fullName;
    }

    public getChainId(): ChainId {
        //@TODO pas performant, check à chaque fois
        assertValidChainId(this._config.chainId);
        return this._config.chainId;
    }

    public get isSyncEnabled(): boolean {
        return this._config.isSyncEnabled;
    }

    /**
     * Fetch the block data and its transactions of the block specified by blockNumber
     *
     * @param blockNumber
     * @returns A promise resolved with an BlockWithTransactions object
     */
    public getBlockWithTransactions(blockNumber: number): Promise<BlockWithTransactions> {
        return this._jsonRpcProvider.getBlockWithTransactions(blockNumber);
    }

    /**
     * @returns A promise resolved with the last block number added on chain
     */
    public getLatestBlockNumberOnChain(): Promise<number> {
        return this._jsonRpcProvider.getBlockNumber();
    }

    /**
     * Fetch the number of the latest stored block in the database, not the latest block on chain
     *
     * @returns A promise resolved with the block number, or null if no blocks are stored yet
     */
    public async getLatestStoredBlockNumber(): Promise<number | null> {
        const block: HydratedDocument<IBlockWithTransactions> | null =
            await this._repositories.blockWithTransactions.getLatest();

        return block?.number || null;
    }

    public createContractWrapper<T extends ContractType>(type: T, contractAddress: ChecksumAddress) {
        return createContractWrapper(type, contractAddress, this._jsonRpcProvider);
    }

    // @TODO typer et attention car ContractTypeEnum
    public getRepositoryOfContractType(type: ContractTypeEnum) {
        switch (type) {
            case ContractTypeEnum.ERC20Token:
                return this._repositories.erc20Token;
            case ContractTypeEnum.ERC721NFT:
                return this._repositories.erc721Token;
            case ContractTypeEnum.ERC1155MultiToken:
                return this._repositories.erc1155Token;
        }
    }

    /**
     * Starts all the services required to download and index the blocks.
     * These services only emits data, they don't have access to the database.
     *
     * @throws SyncNotEnabledError
     */
    public startSyncing(): void {
        if (!this.isSyncEnabled) {
            throw new SyncNotEnabledError("Sync is not enabled");
        }

        this._blocksDownloaderService.on("rawBlock", this._onRawBlock.bind(this));
        this._contractIndexerService.on("ERC20Token", this._handleNewERC20Token.bind(this));
        this._contractIndexerService.on("ERC721NFT", this._handleNewERC721NFT.bind(this));
        this._contractIndexerService.on("ERC1155MultiToken", this._handleNewERC1155MultiToken.bind(this));

        this._contractIndexerService.start();
        this._blocksDownloaderService.start();
    }
}
