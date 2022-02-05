import { BlockWithTransactions } from "@Types/EthersTypes";
import { BytecodeAnalyzer, ContractType } from "@EVM/BytecodeAnalyzer";
import { ERC20Wrapper, ERC721Wrapper, ERC1155Wrapper } from "@EVM/ContractsWrappers";
import { formatBlock, FormatBlockReturn } from "@Formatters";
import { IBaseToken, IContractCreationTransaction, IERC20Token, IERC721NFT, IERC1155MultiToken } from "@Schemas";
import { logger } from "@Util";
import { AbstractNetworkService } from "./AbstractNetworkService";
import { BlocksDownloaderService } from "./BlocksDownloaderService";

export declare interface ContractIndexerService {
    // Emitted when a new token is found by the indexer
    on(event: "ERC20Token", listener: (token: IERC20Token, creationTransaction: IContractCreationTransaction) => void): this;
    on(event: "ERC721NFT", listener: (token: IERC721NFT, creationTransaction: IContractCreationTransaction) => void): this;
    on(event: "ERC1155MultiToken", listener: (token: IERC1155MultiToken, creationTransaction: IContractCreationTransaction) => void): this;

    emit(event: "ERC20Token", token: IERC20Token, creationTransaction: IContractCreationTransaction): any;
    emit(event: "ERC721NFT", token: IERC721NFT, creationTransaction: IContractCreationTransaction): any;
    emit(event: "ERC1155MultiToken", token: IERC1155MultiToken, creationTransaction: IContractCreationTransaction): any;
}

export class ContractIndexerService extends AbstractNetworkService
{
    public constructor
    (
        private readonly _blocksDownloaderService: BlocksDownloaderService
    )
    {
        super(_blocksDownloaderService.getNetwork());
    }

    /**
     * Called once a new block is downloaded by the BlocksDownloaderService
     * @param block Block data and its transactions
     */
    private _handleNewBlock(block: BlockWithTransactions): void
    {
        const formatResult: FormatBlockReturn = formatBlock(block);

        if (!formatResult.isSuccessful)
        {
            return logger.error(`Failed to format block #${block.number}`);
        }

        for (const transaction of formatResult.contractCreationTransactions)
        {
            this._handleContractCreationTransaction(transaction);
        }
    }

    /**
     * Determine the contract type created in a contract creation transaction and call a specific handling method
     * @param transaction The contract creation transaction data
     */
    private _handleContractCreationTransaction(transaction: IContractCreationTransaction): void
    {
        const bytecodeAnalyzer: BytecodeAnalyzer = new BytecodeAnalyzer(transaction.creationBytecode);
        const contractType: ContractType = bytecodeAnalyzer.determineContractType();

        switch (contractType)
        {
            case ContractType.ERC20Token:
                this._handleERC20TokenContract(transaction);
                break;
            case ContractType.ERC721NFT:
                this._handleERC721NFTContract(transaction);
                break;
            case ContractType.ERC1155MultiToken:
                this._handleERC1155MultiTokenContract(transaction);
                break;
        }
    }

    /**
     * Extract the required properties for a IBaseToken
     * @param transaction Contract creation transaction
     * @returns 
     */
    private _extractBaseTokenProperties(transaction: IContractCreationTransaction): IBaseToken
    {
        return {
            address: transaction.contractAddress,
            creationTransaction: transaction.hash,
            creationTimestamp: transaction.blockTimestamp,
            creationTransactionIndex: transaction.indexInBlock
        };
    }

    private async _handleERC20TokenContract(transaction: IContractCreationTransaction): Promise<void>
    {
        const contractWrapper: ERC20Wrapper = this._network.createContractWrapper("ERC20", transaction.contractAddress);
        const tokenData: IERC20Token = {
            ...this._extractBaseTokenProperties(transaction),
            decimals: await contractWrapper.decimals(),
            name: await contractWrapper.name(),
            symbol: await contractWrapper.symbol()
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC20 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC20Token", tokenData, transaction);
    }

    private async _handleERC721NFTContract(transaction: IContractCreationTransaction): Promise<void>
    {
        const contractWrapper: ERC721Wrapper = this._network.createContractWrapper("ERC721", transaction.contractAddress);
        const tokenData: IERC721NFT = {
            ...this._extractBaseTokenProperties(transaction),
            name: await contractWrapper.name(),
            symbol: await contractWrapper.symbol()
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC721 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC721NFT", tokenData, transaction);
    }

    private async _handleERC1155MultiTokenContract(transaction: IContractCreationTransaction): Promise<void>
    {
        const contractWrapper: ERC1155Wrapper = this._network.createContractWrapper("ERC1155", transaction.contractAddress);
        const tokenData: IERC1155MultiToken = {
            ...this._extractBaseTokenProperties(transaction),
            name: await contractWrapper.name(),
            symbol: await contractWrapper.symbol()
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC1155 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC1155MultiToken", tokenData, transaction);
    }

    /**
     * Start listening to new blocks
     */
    public start(): void
    {
        this._blocksDownloaderService.on("block", this._handleNewBlock.bind(this));
    }
}
