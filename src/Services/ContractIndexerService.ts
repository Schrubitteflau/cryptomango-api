import { AbstractService } from "./AbstractService";
import { BlocksProviderService } from "./BlocksProviderService";
import { ContractBytecode } from "@EVM/Types";
import { BytecodeAnalyzer, ContractType } from "@EVM/BytecodeAnalyzer";
import { IERC20TokenSchema, IContractCreationTransactionSchema } from "@Schemas";
import { ERC20, ERC20__factory, ERC721, ERC721__factory, ERC1155, ERC1155__factory } from "@EVM/Contracts";
import { ERC20Wrapper, ERC721Wrapper, ERC1155Wrapper } from "@EVM/ContractsWrappers";
import { ERC20TokenRepository, StoreOneOperation } from "@Repositories";
import { logger } from "@Util";

export declare interface ContractIndexerService {
    // Emitted when a new ERC20 token is detected
    on(event: "ERC20Token", listener: (token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema) => void): this;

    emit(event: "ERC20Token", token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema): any;
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
            default:
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
            decimals: await wrapper.decimals(),
            name: await wrapper.name(),
            symbol: await wrapper.symbol()
        };
        const repository: ERC20TokenRepository = this._network.getERC20ContractRepository();

        const storeOperation: StoreOneOperation<IERC20TokenSchema> = await repository.storeOne(tokenData);
        if (storeOperation.success === true)
        {
            const stored: IERC20TokenSchema = storeOperation.operationData.data;
            const { name, symbol, creationTransaction } = stored;

            logger.debug(`Successfully stored ERC20 token ${name} $${symbol} at ${creationTransaction} tx`);
            this.emit("ERC20Token", stored, transaction);
        }
        else
        {
            const { name, symbol, creationTransaction } = tokenData;
            logger.error(`Cannot store ERC20 token ${name} $${symbol} at ${creationTransaction} tx : ${storeOperation.error.message}`);
        }
    }

    private async _handleERC721NFTContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const contract: ERC721 = ERC721__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper: ERC721Wrapper = new ERC721Wrapper(contract);

        const name = await wrapper.name();
        const symbol = await wrapper.symbol();
        
        logger.debug(`ERC721 at ${transaction.contractAddress} -> name = ${name}, symbol = ${symbol}`);
    }

    private async _handleERC1155MultiTokenContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const contract: ERC1155 = ERC1155__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper: ERC1155Wrapper = new ERC1155Wrapper(contract);

        const name = await wrapper.name();
        const symbol = await wrapper.symbol();
        
        logger.debug(`ERC1155 at ${transaction.contractAddress} -> name = ${name}, symbol = ${symbol}`);
    }
}
