import { AbstractService } from "./AbstractService";
import { jsonRpcProvider, IRange, makeRange, waitSeconds } from "../Util";

import type { BlockWithTransactions } from "../Types/EthersTypes";

export interface IBlockWithTransaction extends BlockWithTransactions {
    _id: number
}

export interface IRangeBlocksWithTransaction extends IRange {
    blocks: Array<IBlockWithTransaction>
}

export declare interface BlocksProviderService {
    on(event: "newBlocks", listener: (blocks: IRangeBlocksWithTransaction) => void): this;

    emit(event: "newBlocks", blocks: IRangeBlocksWithTransaction): any;
}

class BlockRangeDownloader
{
    private isDownloading: boolean = false;

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

    private async getBlockWithTransactions(block: number): Promise<IBlockWithTransaction>
    {
        const blockData: BlockWithTransactions = await jsonRpcProvider.getBlockWithTransactions(block);

        return {
            _id: blockData.number,
            ...blockData
        };
    }

    private downloadBlocks(): Promise<Array<IBlockWithTransaction>>
    {
        const promises: Array<Promise<IBlockWithTransaction>> = [];

        for (let blockNumber = this._start; blockNumber <= this._end; blockNumber++)
        {
            promises.push(
                this.getBlockWithTransactions(blockNumber)
            );
        }

        this.isDownloading = true;

        return Promise.all(promises);
    }

    public download(): Promise<Array<IBlockWithTransaction>>
    {
        if (this.isDownloading === true)
        {
            throw new Error("Already downloading");
        }

        return this.downloadBlocks();
    }
}

export class BlocksProviderService extends AbstractService
{
    private _currentBlock: number = this._startBlock;

    public constructor
    (
        private readonly _startBlock: number,
        private readonly _endBlock: number | "latest",
        private readonly _maxDownloadRange: number
    )
    {
        super("blocks");
    }

    private async getLastBlock(): Promise<number>
    {
        return await jsonRpcProvider.getBlockNumber();
    }

    private async computeRange(): Promise<IRange>
    {
        if (this._endBlock === "latest")
        {
            return makeRange(this._currentBlock, await this.getLastBlock(), this._maxDownloadRange);
        }

        return makeRange(this._currentBlock, this._endBlock, this._maxDownloadRange);
    }

    private async downloadRange(range: IRange): Promise<IRangeBlocksWithTransaction>
    {
        const downloader: BlockRangeDownloader = new BlockRangeDownloader(range.start, range.end);

        return {
            ...range,
            blocks: await downloader.download()
        };
    }

    public async start(): Promise<void>
    {
        console.log("start");

        // Si this._endBlock vaut "latest", alors la boucle ne sera jamais quittée
        while (this._endBlock === "latest" || this._currentBlock < this._endBlock)
        {
            const range: IRange = await this.computeRange();
            console.log(range);

            /* Si on veut se synchroniser au dernier bloc, on lance un téléchargement
            lorsque l'on a au minimum 20 blocs à télécharger */
            if (this._endBlock === "latest" && range.range < 1)
            {
                await waitSeconds(60);
            }
            else
            {
                const blocks: IRangeBlocksWithTransaction = await this.downloadRange(range);
                this._currentBlock = blocks.end + 1;
                this.emit("newBlocks", blocks);
            }            
        }
    }
}
