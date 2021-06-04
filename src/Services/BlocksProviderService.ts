import { Collection, Cursor, InsertWriteOpResult, WithId } from "mongodb";

import { AbstractService } from "./AbstractService";
import { jsonRpcProvider, Range, waitSeconds, logger } from "../Util";

import type { BlockWithTransactions } from "../Types/EthersTypes";


export interface IBlockWithTransaction extends BlockWithTransactions {
    _id: number
}

export interface IRangeBlocksWithTransaction {
    range: Range,
    blocks: Array<IBlockWithTransaction>
}

export declare interface BlocksProviderService {
    on(event: "newBlocksRange", listener: (blocks: IRangeBlocksWithTransaction) => void): this;

    emit(event: "newBlocksRange", blocks: IRangeBlocksWithTransaction): any;
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

    private async _getBlockWithTransactions(block: number): Promise<IBlockWithTransaction>
    {
        const blockData: BlockWithTransactions = await jsonRpcProvider.getBlockWithTransactions(block);

        return {
            _id: blockData.number,
            ...blockData
        };
    }

    private _downloadBlocks(): Promise<Array<IBlockWithTransaction>>
    {
        const promises: Array<Promise<IBlockWithTransaction>> = [];

        for (let blockNumber = this._start; blockNumber <= this._end; blockNumber++)
        {
            promises.push(
                this._getBlockWithTransactions(blockNumber)
            );
        }

        this._isDownloading = true;

        return Promise.all(promises);
    }

    public download(): Promise<Array<IBlockWithTransaction>>
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
    }

    private async _getLatestStoredBlock(): Promise<IBlockWithTransaction | null>
    {
        const collection: Collection<IBlockWithTransaction> = await this._getCollection<IBlockWithTransaction>();
        const cursor: Cursor<IBlockWithTransaction> = collection.find().sort({ _id: -1 }).limit(1);

        return await cursor.next();
    }

    private async _getLastBlock(): Promise<number>
    {
        return await jsonRpcProvider.getBlockNumber();
    }

    private async _computeRange(): Promise<Range>
    {
        if (this._endBlock === "latest")
        {
            return new Range(this._currentBlock, await this._getLastBlock(), this._downloadRange);
        }

        return new Range(this._currentBlock, this._endBlock, this._downloadRange);
    }

    private async _downloadBlocksRange(range: Range): Promise<IRangeBlocksWithTransaction>
    {
        const downloader: BlockRangeDownloader = new BlockRangeDownloader(range.start, range.end);

        return {
            range,
            blocks: await downloader.download()
        };
    }

    private async _persistBlocks(blocks: Array<IBlockWithTransaction>): Promise<InsertWriteOpResult<WithId<IBlockWithTransaction>>>
    {
        const collection: Collection<IBlockWithTransaction> = await this._getCollection<IBlockWithTransaction>();
    
        return await collection.insertMany(blocks);
    }

    private async _prepareStartingBlock(): Promise<void>
    {
        if (this._startBlock === "auto")
        {
            logger.info("Start block is set to 'auto', fetching the latest stored block...");
            const lastBlock: IBlockWithTransaction | null = await this._getLatestStoredBlock();
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
                logger.info(`Downloading blocks #${range.start} to #${range.end}...`);
                const rangeBlocks: IRangeBlocksWithTransaction = await this._downloadBlocksRange(range);
                logger.info(`Successfully downloaded ${range.difference} blocks`);
                const insertionResult: InsertWriteOpResult<WithId<IBlockWithTransaction>> = await this._persistBlocks(rangeBlocks.blocks);
                logger.info(`Successfully stored ${insertionResult.insertedCount} blocks`);
                this._currentBlock = rangeBlocks.range.end + 1;
                this.emit("newBlocksRange", rangeBlocks);
            }
        }
    }
}
