import { providers } from "ethers";

export const jsonRpc: providers.JsonRpcProvider = new providers.JsonRpcProvider(
    "https://bsc-dataseed1.ninicoin.io/"
);
