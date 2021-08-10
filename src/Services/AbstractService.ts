import EventEmitter from "events";

import { Network } from "../Networks";
import { BlockRepository } from "../Repositories/BlockRepository";
import { ContractCreationTransactionRepository } from "../Repositories/TransactionRepository";

export abstract class AbstractService extends EventEmitter
{
    protected constructor
    (
        protected readonly _network: Network
    )
    {
        super();
    }

    protected get _blockRepository(): BlockRepository
    {
        return this._network.getBlockRepository();
    }

    protected get _contractCreationTransactionRepository(): ContractCreationTransactionRepository
    {
        return this._network.getTransactionRepository();
    }
}
