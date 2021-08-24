import { AbstractService } from "./AbstractService";
import { Network } from "../Networks";
import { BlocksProviderService } from "./BlocksProviderService";
import { ContractBytecode } from "../EVM/Types";
import { BytecodeAnalyzer } from "../EVM/BytecodeAnalyzer";
import { IERC20TokenSchema, IContractCreationTransactionSchema } from "../Schemas";
import { ERC20, ERC20__factory } from "../EVM/Contracts";
import { ERC20Wrapper } from "../EVM/ContractsWrappers";
import { ERC20TokenRepository, StoreOneOperation } from "../Repositories";
import { logger } from "../Util";

export enum ContractType {
    ERC20Token = "erc20",
    Unknown = "unknown"
};

export declare interface ContractIndexerService {
    // Emitted when a new ERC20 token is detected
    on(event: "ERC20Token", listener: (token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema) => void): this;

    emit(event: "ERC20Token", token: IERC20TokenSchema, creationTransaction: IContractCreationTransactionSchema): any;
}

export class ContractIndexerService extends AbstractService
{
    public constructor
    (
        private readonly _blockProviderService: BlocksProviderService,
        _network: Network,
    )
    {
        super(_network);

        this._blockProviderService.on("contractCreationTransactions", this._handleContractCreationTransactions.bind(this));
    }

    private _determineContractType(bytecode: ContractBytecode): ContractType
    {
        const analyzer: BytecodeAnalyzer = new BytecodeAnalyzer(bytecode);

        if (analyzer.isERC20Implemented())
        {
            return ContractType.ERC20Token;
        }
        
        return ContractType.Unknown;
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
        const contractType: ContractType = this._determineContractType(transaction.creationBytecode);

        switch (contractType)
        {
            case ContractType.ERC20Token:
                this._handleERC20TokenContract(transaction);
                break;
            default:
                break;
        }
    }

    private async _handleERC20TokenContract(transaction: IContractCreationTransactionSchema): Promise<void>
    {
        const token: ERC20 = ERC20__factory.connect(
            transaction.contractAddress,
            this._network.getJsonRpcProvider()
        );
        const wrapper = new ERC20Wrapper(token);
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

            logger.info(`Successfully stored ERC20 token ${name} $${symbol} at ${creationTransaction} tx`);
            this.emit("ERC20Token", stored, transaction);
        }
        else
        {
            const { name, symbol, creationTransaction } = tokenData;
            logger.info(`Cannot store ERC20 token ${name} $${symbol} at ${creationTransaction} tx : ${storeOperation.error.message}`);
        }
    }
}
