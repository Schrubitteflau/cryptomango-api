import { Db, MongoClient } from "mongodb";

import { logger } from "@Util";

export class MongoManager
{
    private readonly _client = new MongoClient(this.connectionString, {
        useUnifiedTopology: true
    });

    public constructor
    (
        private readonly _username: string,
        private readonly _password: string,
        private readonly _host: string,
        private readonly _port: number
    ) { }

    public get connectionString(): string
    {
        return `mongodb://${encodeURIComponent(this._username)}:${encodeURIComponent(this._password)}@${this._host}:${this._port}`;
    }

    private async _getClient(): Promise<MongoClient>
    {
        if (!this._client.isConnected())
        {
            logger.info(`Connecting to ${this.connectionString}`);
            await this._client.connect();
            logger.info(`Connected to ${this.connectionString}`);
        }

        return this._client;
    }

    private async _selectDatabase(databaseName: string): Promise<Db>
    {
        const connectedClient: MongoClient = await this._getClient();

        return connectedClient.db(databaseName);
    }

    public selectDatabase(): Promise<Db>
    {
        return this._selectDatabase(process.env.MONGO_DATABASE);
    }
}