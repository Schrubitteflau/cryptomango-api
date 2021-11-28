import { AbstractService } from "./AbstractService";
import { BlocksProviderService } from "./BlocksProviderService";
import { BytecodeAnalyzer, ContractType } from "@EVM/BytecodeAnalyzer";
import { IERC20TokenSchema, IContractCreationTransactionSchema, IERC721TokenSchema, IERC1155TokenSchema } from "@Schemas";
import { ERC20, ERC20__factory, ERC721, ERC721__factory, ERC1155, ERC1155__factory } from "@EVM/Contracts";
import { ERC20Wrapper, ERC721Wrapper, ERC1155Wrapper } from "@EVM/ContractsWrappers";
import { ERC20ContractRepository, ERC721ContractRepository, ERC1155ContractRepository, StoreOneOperation } from "@Repositories";
import { logger } from "@Util";

export declare interface ContractIndexerService {
    // Emitted when a new token is indexed and stored
    on(event: "ERC20Token", listener: (token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema) => void): this;
    on(event: "ERC721Token", listener: (token: IERC721TokenSchema, creationTransaction: IContractCreationTransactionSchema) => void): this;
    on(event: "ERC1155Token", listener: (token: IERC1155TokenSchema, creationTransaction: IContractCreationTransactionSchema) => void): this;

    emit(event: "ERC20Token", token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema): any;
    emit(event: "ERC721Token", token: IERC721TokenSchema, creationTransaction: IContractCreationTransactionSchema): any;
    emit(event: "ERC1155Token", token: IERC1155TokenSchema, creationTransaction: IContractCreationTransactionSchema): any;
}

export class ContractIndexerService extends AbstractService
{
    public constructor
    (
        private readonly _blockProviderService: BlocksProviderService
    )
    {
        super(_blockProviderService.network);

        this._blockProviderService.on("contractCreationTransactions", this._handleContractCreationTransactions.bind(this));
    }

    private _handleContractCreationTransactions(transactions: Array<IContractCreationTransactionSchema>): void
    {
        for (const transaction of transactions)
        {
            this._handleContractCreationTransaction(transaction);
        }
    }

    private _handleContractCreationTransaction(transaction: IContractCreationTransactionSchema): void
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

    private async _handleERC20TokenContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const contract: ERC20 = ERC20__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper: ERC20Wrapper = new ERC20Wrapper(contract);
        const tokenData: IERC20TokenSchema = {
            _id: transaction.contractAddress,
            creationTransaction: transaction._id,
            creationTimestamp: transaction.blockTimestamp,
            creationTransactionIndex: transaction.indexInBlock,
            decimals: await wrapper.decimals(),
            name: await wrapper.name(),
            symbol: await wrapper.symbol()
        };
        const repository: ERC20ContractRepository = this._network.getERC20ContractRepository();

        const storeOperation: StoreOneOperation<IERC20TokenSchema> = await repository.storeOne(tokenData);
        if (storeOperation.success === true)
        {
            const stored: IERC20TokenSchema = storeOperation.operationData.data;
            const { _id, name, symbol, creationTransaction } = stored;

            logger.debug(`Successfully stored ERC20 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction}`);
            this.emit("ERC20Token", stored, transaction);
        }
        else
        {
            const { _id, name, symbol, creationTransaction } = tokenData;
            logger.error(`Cannot store ERC20 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction} : ${storeOperation.error.message}`);
        }
    }

    private async _handleERC721NFTContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const contract: ERC721 = ERC721__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper: ERC721Wrapper = new ERC721Wrapper(contract);
        const tokenData: IERC721TokenSchema = {
            _id: transaction.contractAddress,
            creationTransaction: transaction._id,
            creationTimestamp: transaction.blockTimestamp,
            creationTransactionIndex: transaction.indexInBlock,
            name: await wrapper.name(),
            symbol: await wrapper.symbol()
        };
        const repository: ERC721ContractRepository = this._network.getERC721ContractRepository();

        const storeOperation: StoreOneOperation<IERC721TokenSchema> = await repository.storeOne(tokenData);
        if (storeOperation.success === true)
        {
            const stored: IERC721TokenSchema = storeOperation.operationData.data;
            const { _id, name, symbol, creationTransaction } = stored;

            logger.debug(`Successfully stored ERC721 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction}`);
            this.emit("ERC721Token", stored, transaction);
        }
        else
        {
            const { _id, name, symbol, creationTransaction } = tokenData;
            logger.error(`Cannot store ERC721 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction} : ${storeOperation.error.message}`);
        }
    }

    private async _handleERC1155MultiTokenContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const contract: ERC1155 = ERC1155__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper: ERC1155Wrapper = new ERC1155Wrapper(contract);
        const tokenData: IERC1155TokenSchema = {
            _id: transaction.contractAddress,
            creationTransaction: transaction._id,
            creationTimestamp: transaction.blockTimestamp,
            creationTransactionIndex: transaction.indexInBlock,
            name: await wrapper.name(),
            symbol: await wrapper.symbol()
        };
        const repository: ERC1155ContractRepository = this._network.getERC1155ContractRepository();

        const storeOperation: StoreOneOperation<IERC1155TokenSchema> = await repository.storeOne(tokenData);
        if (storeOperation.success === true)
        {
            const stored: IERC1155TokenSchema = storeOperation.operationData.data;
            const { _id, name, symbol, creationTransaction } = stored;

            logger.debug(`Successfully stored ERC1155 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction}`);
            this.emit("ERC1155Token", stored, transaction);
        }
        else
        {
            const { _id, name, symbol, creationTransaction } = tokenData;
            logger.error(`Cannot store ERC1155 token ${name} $${symbol} at address ${_id} with tx ${creationTransaction} : ${storeOperation.error.message}`);
        }
    }
}
