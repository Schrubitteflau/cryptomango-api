import { AbstractService } from "./AbstractService";
import { jsonRpcProvider, Range, waitSeconds, logger } from "../Util";
import { blockRepository, IBlockWithTransactionsSchema, StoreBlocksOperation, StoreBlocksResult, TransformBlockReturn } from "../Repositories/BlockRepository";
import { ITransactionSchema, StoreTransactionsOperation, StoreTransactionsResult, transactionRepository } from "../Repositories/TransactionRepository";

import type { BlockWithTransactions, TransactionResponse } from "../Types/EthersTypes";

export interface IRangeBlocksWithTransactions {
    range: Range,
    blocks: Array<BlockWithTransactions>
}

type AggregateBlocksAndTransactionsReturn = {
    blocks: Array<IBlockWithTransactionsSchema>,
    transactions: Array<ITransactionSchema>
};
export declare interface BlocksProviderService {
    // Raw downloaded blocks, with all transactions data
    on(event: "newBlocksRange", listener: (blocks: IRangeBlocksWithTransactions) => void): this;
    // Only the transactions which deploys a smart contract
    on(event: "contractCreationTransactions", listener: (transactions: Array<ITransactionSchema>, insertionCount: number) => void): this;

    emit(event: "newBlocksRange", blocks: IRangeBlocksWithTransactions): any;
    emit(event: "contractCreationTransactions", transactions: Array<ITransactionSchema>, insertionCount: number): any;
}

class BlockRangeDownloader
{
    private _isDownloading: boolean = false;

    public constructor
    (
        private readonly _start: number,
        private readonly _end: number
    )
    {
        if (_start > _end)
        {
            throw new Error("Start block cannot be after end block");
        }
    }

    private async _getBlockWithTransactions(block: number): Promise<BlockWithTransactions>
    {
        return await jsonRpcProvider.getBlockWithTransactions(block);
    }

    private _downloadBlocks(): Promise<Array<BlockWithTransactions>>
    {
        const promises: Array<Promise<BlockWithTransactions>> = [];

        for (let blockNumber = this._start; blockNumber <= this._end; blockNumber++)
        {
            promises.push(
                this._getBlockWithTransactions(blockNumber)
            );
        }

        this._isDownloading = true;

        return Promise.all(promises);
    }

    public download(): Promise<Array<BlockWithTransactions>>
    {
        if (this._isDownloading === true)
        {
            throw new Error("Already downloading");
        }

        return this._downloadBlocks();
    }
}

export class BlocksProviderService extends AbstractService
{
    private _currentBlock: number = 0;

    public constructor
    (
        private readonly _startBlock: number | "auto",
        private readonly _endBlock: number | "latest",
        // The exact number of blocks to download at the same time
        private readonly _downloadRange: number
    )
    {
        super("blocks");

        if (this._downloadRange === 1)
        {
            logger.warning("BlocksProviderService started with _downloadRange = 1");
        }
    }

    private async _getLastBlockNumber(): Promise<number>
    {
        return await jsonRpcProvider.getBlockNumber();
    }

    private async _computeRange(): Promise<Range>
    {
        if (this._endBlock === "latest")
        {
            return new Range(this._currentBlock, await this._getLastBlockNumber(), this._downloadRange);
        }

        return new Range(this._currentBlock, this._endBlock, this._downloadRange);
    }

    private async _downloadBlocksRange(range: Range): Promise<IRangeBlocksWithTransactions>
    {
        const downloader: BlockRangeDownloader = new BlockRangeDownloader(range.start, range.end);

        return {
            range,
            blocks: await downloader.download()
        };
    }

    private async _prepareStartingBlock(): Promise<void>
    {
        if (this._startBlock === "auto")
        {
            logger.info("Start block is set to 'auto', fetching the latest stored block...");
            const lastBlock: IBlockWithTransactionsSchema | null = await blockRepository.getLatestStoredBlock();
            if (lastBlock === null)
            {
                this._currentBlock = 0;
                logger.info("No block stored, starting from #0");
            }
            else
            {
                this._currentBlock = lastBlock.number + 1;
                logger.info(`Retrieved block ${lastBlock.number}, starting from #${lastBlock.number + 1}`);
            }
        }
        else
        {
            this._currentBlock = this._startBlock;
            logger.info(`Starting from block #${this._startBlock}`);
        }
    }

    private _aggregateBlocksAndTransactions(transformed: Array<TransformBlockReturn>): AggregateBlocksAndTransactionsReturn
    {
        // Aggregate the blocks and the transactions in order to insert all of them with a single database query
        const aggregatedBlocks: Array<IBlockWithTransactionsSchema> = [];
        const aggregatedTransactions: Array<ITransactionSchema> = [];

        for (const { transformedBlock, contractCreationTransactions } of transformed)
        {
            aggregatedBlocks.push(transformedBlock);
            aggregatedTransactions.push(...transactionRepository.transformTransactions(contractCreationTransactions));
        }

        return {
            blocks: aggregatedBlocks,
            transactions: aggregatedTransactions
        };
    }

    private async _download(range: Range)
    {
        logger.info(`Downloading blocks #${range.start} to #${range.end}...`);
        const rangeBlocks: IRangeBlocksWithTransactions = await this._downloadBlocksRange(range);
        logger.info(`Successfully downloaded ${range.difference} blocks`);

        const transformedBlocks: Array<TransformBlockReturn> = blockRepository.transformBlocks(rangeBlocks.blocks);
        const { blocks, transactions } = this._aggregateBlocksAndTransactions(transformedBlocks);

        const storeBlocksOperationResult: StoreBlocksOperation = await blockRepository.storeBlocks(blocks);
        if (storeBlocksOperationResult.success === true)
        {
            const storeBlocksResult: StoreBlocksResult = storeBlocksOperationResult.data;
            this._currentBlock = rangeBlocks.range.end + 1;

            logger.info(`Successfully stored ${storeBlocksResult.storedCount} blocks`);
            this.emit("newBlocksRange", rangeBlocks);
        }
        else
        {
            logger.error(`Error while storing blocks : ${storeBlocksOperationResult.error.message}`);
        }

        const storeTransactionsOperationResult: StoreTransactionsOperation = await transactionRepository.storeTransactions(transactions);
        if (storeTransactionsOperationResult.success === true)
        {
            const storeTransactionResult: StoreTransactionsResult = storeTransactionsOperationResult.data;

            logger.info(`Successfully stored ${storeTransactionResult.storedCount} transactions`);
            this.emit("contractCreationTransactions", storeTransactionResult.storedTransactions, storeTransactionResult.storedCount);
        }
        else
        {
            logger.error(`Error while storing transactions : ${storeTransactionsOperationResult.error.message}`);
        }
    }

    public async start(): Promise<void>
    {
        logger.info("Starting BlocksProviderService");
        logger.info(`Syncing until block #${this._endBlock}`);

        await this._prepareStartingBlock();

        // never leaves the loop if this._endBlock equals "latest"
        while (this._endBlock === "latest" || this._currentBlock < this._endBlock)
        {
            const range: Range = await this._computeRange();

            /* Si on veut se synchroniser au dernier bloc, on attend d'être à au moins
            un certain nombre de blocs de retard pour se mettre à jour : il faut que
            le nombre de blocs à télécharger soit au moins égal au nombre de blocs que
            l'on télécharge en une fois */
            if (this._endBlock === "latest" && this._downloadRange > range.difference)
            {
                logger.info(`${range.difference} until sync, download range set to ${this._downloadRange}`);
                logger.info("Waiting for 60 seconds...");
                await waitSeconds(60);
            }
            else
            {
                await this._download(range);
            }
        }
    }
}
