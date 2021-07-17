import { AbstractService } from "./AbstractService";

import { Network } from "../Networks";

export class ContractIndexer extends AbstractService
{
    public constructor(_network: Network)
    {
        super(_network);
    }

}