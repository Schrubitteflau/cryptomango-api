import { Network } from "@Networks";
import { logger, waitSeconds } from "@Util";
import { isNull, isValidPositiveInteger } from "@Util/TypeUtils";
import { AbstractNetworkService } from "./AbstractNetworkService";
import type { BlockWithTransactions } from "@Types/EthersTypes";

export interface IBlocksDownloaderServiceConfig
{
    // If set to "auto", it will retrieve the last stored block and start from this one 
    fromBlock: number | "auto";
    // If set to "latest", it will constantly check for new blocks added once it's synchronized
    toBlock: number | "latest";
    // The network on which operate to
    network: Network;
    // Behavior when a fatal error occured during the block downloading
    onError: {
        restartAfterSeconds: number;
    };
    // Cooldown to wait until checking for the last block number once synchronized
    onSync: {
        cooldownSeconds: number;
    };
}

export declare interface BlocksDownloaderService {
    // Raw downloaded block, with all the transactions data
    on(event: "rawBlock", listener: (block: BlockWithTransactions) => void): this;

    emit(event: "rawBlock", block: BlockWithTransactions): any;
}

interface IState
{
    currentBlock: number;
    targetBlock: number;
    status: "started" | "stopped" | "done";
}

/**
 * An instance of this class will simply download all the blocks of the
 * Network one by one, and emit an event each time a new block is downloaded
 */
export class BlocksDownloaderService extends AbstractNetworkService
{
    private _state: IState = {
        currentBlock: 0,
        targetBlock: 0,
        status: "stopped"
    };

    public constructor
    (
        private readonly _config: IBlocksDownloaderServiceConfig
    )
    {
        // Makes the shortcut property _network and some helper methods available
        super(_config.network);

        //@TODO uncomment
        logger.info(`Created a BlocksDownloaderService instance for ${this._network.getFullName()}`);

        if (isValidPositiveInteger(_config.fromBlock) && isValidPositiveInteger(_config.toBlock) && _config.fromBlock >= _config.toBlock)
        {
            throw new Error("fromBlock must be < toBlock");
        }
    }

    /**
     * Sets the value of the state currentBlock according to the value of _config.fromBlock
     */
    private async _setCurrentBlock(): Promise<void>
    {
        if (this._config.fromBlock === "auto")
        {
            logger.info("fromBlock is set to 'auto', fetching the latest stored block...");
            const latestStoredBlockNumber: number | null = await this._network.getLatestStoredBlockNumber()
            if (isNull(latestStoredBlockNumber))
            {
                this._state.currentBlock = 0;
                logger.info("No block stored, starting from #0");
            }
            else
            {
                this._state.currentBlock = latestStoredBlockNumber + 1;
                logger.info(`Retrieved block ${latestStoredBlockNumber}, starting from #${latestStoredBlockNumber + 1}`);
            }
        }
        else
        {
            this._state.currentBlock = this._config.fromBlock;
            logger.info(`Starting from given block #${this._config.fromBlock}`);
        }
    }

    /**
     * Sets the value of the state setTargetBlock according to the value of _config.fromBlock
     */
    private async _setTargetBlock(): Promise<void>
    {
        if (this._config.toBlock === "latest")
        {
            logger.info("toBlock is set to 'latest', fetching the last block number...");
            const latestBlockNumberOnChain: number = await this._network.getLatestBlockNumberOnChain();
            logger.info(`Latest block on chain is #${latestBlockNumberOnChain}`);

            this._state.targetBlock = latestBlockNumberOnChain;
        }
        else
        {
            this._state.targetBlock = this._config.toBlock;
        }
    }

    private async _waitUntilNewBlocks(): Promise<void>
    {
        const lastTargetBlock = this._state.targetBlock;

        while (lastTargetBlock >= this._state.targetBlock)
        {
            logger.info(`Waiting for ${this._config.onSync.cooldownSeconds} seconds`);
            await waitSeconds(this._config.onSync.cooldownSeconds);
            await this._setTargetBlock();
        }
    }

    /**
     * It will start downloading the blocks one by one and emitting events
     */
    private async _start(): Promise<void>
    {
        if (this.isStarted)
        {
            throw new Error("Already started");
        }

        this._state.status = "started";
        logger.info(`Starting BlocksDownloaderService : syncing until block #${this._config.toBlock}`);

        await this._setCurrentBlock();
        await this._setTargetBlock();

        if (this._state.currentBlock >= this._state.targetBlock)
        {
            logger.warning(`currentBlock (${this._state.currentBlock}) >= targetBlock (${this._state.targetBlock})`);
        }

        // In all cases, we sync until we reach the targetBlock
        while (this._state.currentBlock <= this._state.targetBlock)
        {
            // The last downloaded block will be the targetBlock
            const block: BlockWithTransactions = await this._network.getBlockWithTransactions(this._state.currentBlock);
            this.emit("rawBlock", block);

            logger.info(`Fetched block #${block.number}`);

            if (this._state.currentBlock === this._state.targetBlock && this._config.toBlock === "latest")
            {
                // We stay stuck until at least one new block is added
                await this._waitUntilNewBlocks();
            }

            this._state.currentBlock++;
        }

        this._state.status = "done";
    }

    public get isStarted(): boolean
    {
        return (this._state.status === "started");
    }

    public get isDone(): boolean
    {
        return (this._state.status === "done");
    }

    /**
     * Wrapper for _start() method with auto-restart
     */
    public async start(): Promise<void>
    {
        let loop: boolean = true;
        while (loop)
        {
            try
            {
                // If it ends normally, then it'll not throw an error and set the status to "done",
                // which is checked in the finally clause
                await this._start();
            }
            catch (error)
            {
                this._state.status = "stopped";
                logger.error(`An error occured, restarting in ${this._config.onError.restartAfterSeconds} seconds`, error);
                await waitSeconds(this._config.onError.restartAfterSeconds);
            }
            finally
            {
                if (this.isDone)
                {
                    logger.info("Done !");
                    loop = false;
                }
            }
        }
    }
}
