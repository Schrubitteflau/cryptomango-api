import { BytecodeAnalyzer, ContractTypeOrUnknown } from "@EVM/BytecodeAnalyzer";
import { ERC20Wrapper, ERC721Wrapper, ERC1155Wrapper, ErrorType, RpcCallResult } from "@EVM/ContractsWrappers";
import { BlockWithTransactionsWrapper } from "@Formatters";
import { IBaseToken, IERC20Token, IERC721NFT, IERC1155MultiToken } from "@Schemas";
import { logger } from "@Util";
import { AbstractNetworkService } from "./AbstractNetworkService";
import { Network } from "@Networks";
import { IContractCreationTransactionResponseWrapper } from "Formatters/TransactionResponseWrapper";
import { toPositiveInteger } from "@Util/TypeUtils";

export declare interface ContractIndexerService {
    // Emitted when a new token is found by the indexer
    on(event: "ERC20Token", listener: (token: IERC20Token, creationTransaction: IContractCreationTransactionResponseWrapper) => void): this;
    on(event: "ERC721NFT", listener: (token: IERC721NFT, creationTransaction: IContractCreationTransactionResponseWrapper) => void): this;
    on(event: "ERC1155MultiToken", listener: (token: IERC1155MultiToken, creationTransaction: IContractCreationTransactionResponseWrapper) => void): this;

    emit(event: "ERC20Token", token: IERC20Token, creationTransaction: IContractCreationTransactionResponseWrapper): any;
    emit(event: "ERC721NFT", token: IERC721NFT, creationTransaction: IContractCreationTransactionResponseWrapper): any;
    emit(event: "ERC1155MultiToken", token: IERC1155MultiToken, creationTransaction: IContractCreationTransactionResponseWrapper): any;
}

/**
 * This service only focuses on analyzing newly created contracts and determining if they corresponds to one of
 * these 3 token standards : ERC20, ERC721 or ERC1155.
 */
export class ContractIndexerService extends AbstractNetworkService
{
    public constructor
    (
        network: Network
    )
    {
        super(network);
    }

    /**
     * Called each time a block is received by the Network and successfully wrapped
     */
    private _handleBlockWithTransactionsWrapper(blockWithTransactions: BlockWithTransactionsWrapper): void
    {
        for (const transaction of blockWithTransactions.getContractCreationTransactions())
        {
            if (transaction.isContractCreation())
            {
                this._handleContractCreationTransaction(transaction);
            }
            else
            {
                // @TODO ne devrait jamais arriver
                logger.error("ContractIndexerService::_handleContractCreationTransaction => isContractCreation is false");
            }
        }
    }

    /**
     * Determine the contract type created in a contract creation transaction and call a specific handling method
     * @param transaction A wrapper around the contract creation transaction. We assume that the transaction is
     * a contract creation transaction, it must have been checked before
     */
    private _handleContractCreationTransaction(transaction: IContractCreationTransactionResponseWrapper): void
    {
        const bytecodeAnalyzer: BytecodeAnalyzer = new BytecodeAnalyzer(transaction.contractBytecode);
        const contractType: ContractTypeOrUnknown = bytecodeAnalyzer.determineContractType();

        switch (contractType)
        {
            case ContractTypeOrUnknown.ERC20Token:
                this._handleERC20TokenContract(transaction);
                break;
            case ContractTypeOrUnknown.ERC721NFT:
                this._handleERC721NFTContract(transaction);
                break;
            case ContractTypeOrUnknown.ERC1155MultiToken:
                this._handleERC1155MultiTokenContract(transaction);
                break;
        }
    }

    /**
     * Extract the required properties for a IBaseToken
     * @param transaction Contract creation transaction
     * @returns 
     */
    private _extractBaseTokenProperties(transaction: IContractCreationTransactionResponseWrapper): IBaseToken
    {
        const { hash, contractAddress, blockNumber, indexInBlock } = transaction;

        return {
            _id: contractAddress,
            address: contractAddress,
            creationTransaction: hash,
            position: toPositiveInteger(blockNumber * 1000 + indexInBlock)
        };
    }

    private _transformCallResultValue<T>(callResult: RpcCallResult<T>): T | null | undefined
    {
        if (callResult.isSuccess)
        {
            // OK, return the actual value
            return callResult.value;
        }

        if (callResult.errorType === ErrorType.EVM_METHOD_NOT_IMPLEMENTED)
        {
            // null means that the contract doesn't implement the method
            return null;
        }

        // undefined means that the value couldn't be retrieved, for an unknown reason, and we should try again later
        return void 0;
    }

    private async _handleERC20TokenContract(transaction: IContractCreationTransactionResponseWrapper): Promise<void>
    {
        const contract: ERC20Wrapper = this._network.createContractWrapper("ERC20", transaction.contractAddress);
        const [decimals, name, symbol] = await Promise.all([contract.decimals(), contract.name(), contract.symbol()]);

        const tokenData: IERC20Token = {
            ...this._extractBaseTokenProperties(transaction),
            decimals: this._transformCallResultValue(decimals),
            name: this._transformCallResultValue(name),
            symbol: this._transformCallResultValue(symbol)
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC20 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC20Token", tokenData, transaction);
    }

    private async _handleERC721NFTContract(transaction: IContractCreationTransactionResponseWrapper): Promise<void>
    {
        const contract: ERC721Wrapper = this._network.createContractWrapper("ERC721", transaction.contractAddress);
        const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);

        const tokenData: IERC721NFT = {
            ...this._extractBaseTokenProperties(transaction),
            name: this._transformCallResultValue(name),
            symbol: this._transformCallResultValue(symbol)
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC721 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC721NFT", tokenData, transaction);
    }

    private async _handleERC1155MultiTokenContract(transaction: IContractCreationTransactionResponseWrapper): Promise<void>
    {
        const contract: ERC1155Wrapper = this._network.createContractWrapper("ERC1155", transaction.contractAddress);
        const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);

        const tokenData: IERC1155MultiToken = {
            ...this._extractBaseTokenProperties(transaction),
            name: this._transformCallResultValue(name),
            symbol: this._transformCallResultValue(symbol)
        };

        logger.info(`[ContractIndexerService]::${this._network.getFullName()} : found ERC1155 ${tokenData.name} $${tokenData.symbol} at ${transaction.contractAddress}`);
        this.emit("ERC1155MultiToken", tokenData, transaction);
    }

    /**
     * Start listening to new wrapped blocks and their transations
     */
    public start(): void
    {
        this._network.on("blockWithTransactions", this._handleBlockWithTransactionsWrapper.bind(this));
    }
}
