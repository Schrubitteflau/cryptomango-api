import { createModel } from "@Models";
import { IContractCreationTransaction } from "@Schemas";

import { AbstractRepository } from "./AbstractRepository";

export class ContractCreationTransactionRepository extends AbstractRepository<IContractCreationTransaction> {
    public constructor(collectionName: string) {
        super(createModel("ContractCreationTransaction", collectionName));
    }
}
