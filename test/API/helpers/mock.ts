import { IERC1155MultiToken, IERC20Token, IERC721NFT } from "@Schemas";
import { PositiveInteger, toPositiveInteger, toPositiveIntegerOrZero } from "@Util/TypeUtils";
import { ChecksumAddress, toChecksumAddress, TransactionHash } from "@Util/TypeUtils/EVM";
import { toTransactionHash } from "@Util/TypeUtils/EVM/TransactionHash";
import { PositiveIntegerOrZero } from "@Util/TypeUtils/PositiveInteger";

export function createMockTokens(count: number = 10): [
    ReadonlyArray<IERC20Token>,
    ReadonlyArray<IERC721NFT>,
    ReadonlyArray<IERC1155MultiToken>
]
{
    const erc20: Array<IERC20Token> = [];
    const erc721: Array<IERC721NFT> = [];
    const erc1155: Array<IERC1155MultiToken> = [];

    for (let i = 1; i <= count; i++)
    {
        const address: ChecksumAddress = toChecksumAddress("0x" + i.toString(16).padStart(40, "0"));
        const creationTimestamp: PositiveInteger = toPositiveInteger(i);
        const creationTransaction: TransactionHash = toTransactionHash("0x" + i.toString(16).padStart(64, "0"));
        const creationTransactionIndex: PositiveIntegerOrZero = toPositiveIntegerOrZero(i);
        const decimals: number = 18;
        const name: string = `_NAME_${i}`;
        const symbol: string = `_$${i}`;

        erc20.push({
            _id: address,
            address,
            creationTimestamp,
            creationTransaction,
            creationTransactionIndex,
            decimals,
            name: "erc20" + name,
            symbol: "erc20" + symbol
        });

        erc721.push({
            _id: address,
            address,
            creationTimestamp,
            creationTransaction,
            creationTransactionIndex,
            name: "erc721" + name,
            symbol: "erc721" + symbol
        });

        erc1155.push({
            _id: address,
            address,
            creationTimestamp,
            creationTransaction,
            creationTransactionIndex,
            name: "erc1155" + name,
            symbol: "erc1155" + symbol
        });
    }

    return [erc20, erc721, erc1155];
}
