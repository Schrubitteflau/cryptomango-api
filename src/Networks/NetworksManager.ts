import { IRawNetwork, networksConfig } from "@Config";
import { Network } from "./Network";

class NetworksManager
{
    private _networks: ReadonlyArray<Network> = this._parseNetworks();

    /**
     * Create Network instances from raw data, only if rawNetwork.isActive is true
     */
    private _parseNetworks(): ReadonlyArray<Network>
    {
        return networksConfig
            .filter((rawNetwork: IRawNetwork) => rawNetwork.isActive)
            .map((rawNetwork: IRawNetwork) => new Network(rawNetwork))
        ;
    }

    /**
     * Returns a Network instance based on the provided chainId parameter
     * @param chainId The unique chain id of the network we are looking for 
     * @returns The found Network, or null
     */
    public getByChainId(chainId: number): Network | null
    {
        return this._networks.find((network: Network) => network.getChainId() === chainId) || null;
    }

    public getNetworks(): ReadonlyArray<Network>
    {
        return this._networks;
    }
}

export const networksManager: NetworksManager = new NetworksManager();
