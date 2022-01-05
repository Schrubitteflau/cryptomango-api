import { Cursor } from "mongodb";

import { StrictContractType } from "@EVM/BytecodeAnalyzer";
import { Network } from "@Networks";
import { ERC1155ContractRepository, ERC20ContractRepository, ERC721ContractRepository } from "@Repositories";
import { AbstractService } from "./AbstractService";
import { AllowedSchemas } from "Repositories/AbstractTokenRepository";

interface IGetNextTokensConfig
{
    tokensCount: number;
    after: {
        creationTimestamp: number;
        creationTransactionIndex: number;
    };
    contractType: StrictContractType;
}

export class TokenSwipeService extends AbstractService
{
    public constructor
    (
        _network: Network
    )
    {
        super(_network);
    }

    /**
     * Returns the next {tokensCount} created after {creationTimestamp} and {creationTransactionIndex}
     * whose type is defined by {contractType} and deployed in the current network and 
     */
    public getNextTokens<T extends AllowedSchemas>(config: IGetNextTokensConfig): Promise<Cursor<T>>
    {
        const { contractType } = config;
        let repository: ERC20ContractRepository | ERC721ContractRepository | ERC1155ContractRepository;

        switch (contractType)
        {
            case StrictContractType.ERC20Token:
                repository = this._network.getERC20ContractRepository();
                break;
            case StrictContractType.ERC721NFT:
                repository = this._network.getERC721ContractRepository();
                break;
            case StrictContractType.ERC1155MultiToken:
                repository = this._network.getERC1155ContractRepository();
                break;
        }

        return (repository.findAfter({
            after: {
                creationTimestamp: config.after.creationTimestamp,
                creationTransactionIndex: config.after.creationTransactionIndex
            },
            tokenCount: 100
        }) as any);
    }
}
