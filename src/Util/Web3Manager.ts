import Web3 from "web3"

export class Web3Manager
{
    private readonly _httpProvider = new Web3.providers.HttpProvider(this._httpProviderURL);
    private readonly _webSocketProvider = new Web3.providers.WebsocketProvider(this._webSocketProviderURL);
    public readonly web3Http = new Web3(this._httpProvider);
    public readonly web3WebSocket = new Web3(this._webSocketProvider);

    public constructor
    (
        private readonly _httpProviderURL: string,
        private readonly _webSocketProviderURL: string
    ) { }
}
