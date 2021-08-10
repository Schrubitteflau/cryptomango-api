import { AbstractService } from "./AbstractService";

import { Network } from "../Networks";
import { BlocksProviderService } from "./BlocksProviderService";
import { ContractBytecode } from "../EVM/Types";
import { BytecodeAnalyzer } from "../EVM/BytecodeAnalyzer";
import { IContractCreationTransactionSchema } from "../Schemas/IContractCreationTransactionSchema";

export enum ContractType {
    ERC20Token = "erc20",
    Unknown = "unknown"
};

export class ContractIndexer extends AbstractService
{
    public constructor
    (
        _network: Network,
        private readonly _blockProviderService: BlocksProviderService
    )
    {
        super(_network);

        this._blockProviderService.on("contractCreationTransactions", this._handleContractCreationTransactions);
    }

    private _determineContractType(contractCreationTransaction: IContractCreationTransactionSchema): ContractType
    {
        const bytecode: ContractBytecode = contractCreationTransaction.creationBytecode;
        const analyzer: BytecodeAnalyzer = new BytecodeAnalyzer(bytecode);

        if (analyzer.isERC20())
        {
            return ContractType.ERC20Token;
        }
        
        return ContractType.Unknown;
    }

    private _handleContractCreationTransactions(transactions: Array<IContractCreationTransactionSchema>, insertionCount: number): void
    {
        for (const transaction of transactions)
        {
            this._handleContractCreationTransaction(transaction);
        }
    }

    private _handleContractCreationTransaction(transaction: IContractCreationTransactionSchema): void
    {
        //const address = transaction.
    }
}
