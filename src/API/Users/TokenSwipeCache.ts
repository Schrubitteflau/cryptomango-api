import { StrictContractType } from "@EVM/BytecodeAnalyzer";
import { IERC1155TokenSchema, IERC20TokenSchema, IERC721TokenSchema } from "@Schemas";
import { AllowedSchemas } from "@Repositories";

interface ITokenSwipeCache
{
    [networkUniqueId: string]: {
        erc20: Array<IERC20TokenSchema>;
        erc721: Array<IERC721TokenSchema>;
        erc1155: Array<IERC1155TokenSchema>;
    };
}

interface IAddMethodParams
{
    networkUniqueId: string;
    contractType: StrictContractType;
    contractData: AllowedSchemas;
}

interface IGetMethodParams
{
    networkUniqueId: string;
    contractType: StrictContractType;
    contractAddress: string;
}

export class TokenSwipeCache
{
    private readonly _cache: ITokenSwipeCache = {};

    public add(params: IAddMethodParams): void
    {
        this._cache[params.networkUniqueId][params.contractType].push(params.contractData as any);
    }

    public get(params: IGetMethodParams): AllowedSchemas | null
    {
        return this._cache[params.networkUniqueId][params.contractType].find((value: AllowedSchemas) =>
        {
            return (value._id === params.contractAddress);
        }) || null;
    }
}
