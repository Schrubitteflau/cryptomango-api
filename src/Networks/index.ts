import { BSCNetwork, BSC } from "./BSCNetwork";
import { EthereumNetwork, Ethereum } from "./EthereumNetwork";

export type Network = BSCNetwork | EthereumNetwork;

export {
    BSC,
    Ethereum
};

export function getByChainId(chainId: number): Network | null
{
    if (chainId === 1)
    {
        return Ethereum;
    }
    else if (chainId === 56)
    {
        return BSC;
    }

    return null;
}