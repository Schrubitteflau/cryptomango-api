import EventEmitter from "events";

import { Network } from "@Networks";

export abstract class AbstractNetworkService extends EventEmitter {
    protected constructor(protected readonly _network: Network) {
        super();
    }

    public getNetwork(): Network {
        return this._network;
    }
}
