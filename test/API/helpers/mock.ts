import { IERC1155MultiToken, IERC20Token, IERC721NFT } from "@Schemas";
import { PositiveInteger, toPositiveInteger } from "@Util/TypeUtils";
import { ChecksumAddress, toChecksumAddress, TransactionHash } from "@Util/TypeUtils/EVM";
import { toTransactionHash } from "@Util/TypeUtils/EVM/TransactionHash";

export class ArrayIterator<T>
{
    private _cursor: number = 0;

    public constructor(
        private readonly _values: ReadonlyArray<T>
    ) {}

    public at(index: number): T
    {
        return this._values[index];
    }

    public read(count: number): ReadonlyArray<T>;
    public read(): T;
    public read(count?: number): T | ReadonlyArray<T>
    {
        if (typeof count === "number")
        {
            return this._values.slice(this._cursor, this._cursor + count);
        }

        return this._values[this._cursor];
    }

    public next(count: number): ReadonlyArray<T>;
    public next(): T;
    public next(count?: number): T | ReadonlyArray<T>
    {
        // This doesn't compile :
        // const ret = this.read(count);

        if (typeof count === "number")
        {
            this._cursor += count;
            return this._values.slice(this._cursor - count, this._cursor);
        }

        return this._values[this._cursor++];
    }

    public setCursor(newCursor: number): void
    {
        this._cursor = newCursor;
    }

    public seekCursor(offset: number): void
    {
        this._cursor += offset;
    }
}

export function createMockTokens(count: number = 10): [
    ArrayIterator<IERC20Token>,
    ArrayIterator<IERC721NFT>,
    ArrayIterator<IERC1155MultiToken>
]
{
    const erc20: Array<IERC20Token> = [];
    const erc721: Array<IERC721NFT> = [];
    const erc1155: Array<IERC1155MultiToken> = [];

    for (let i = 1; i <= count; i++)
    {
        const address: ChecksumAddress = toChecksumAddress("0x" + i.toString(16).padStart(40, "0"));
        const position: PositiveInteger = toPositiveInteger(i + 1);
        const creationTransaction: TransactionHash = toTransactionHash("0x" + i.toString(16).padStart(64, "0"));
        const decimals: number = 18;
        const name: string = `_NAME_${i}`;
        const symbol: string = `_$${i}`;

        erc20.push({
            _id: address,
            address,
            position,
            creationTransaction,
            decimals,
            name: "erc20" + name,
            symbol: "erc20" + symbol
        });

        erc721.push({
            _id: address,
            address,
            position,
            creationTransaction,
            name: "erc721" + name,
            symbol: "erc721" + symbol
        });

        erc1155.push({
            _id: address,
            address,
            position,
            creationTransaction,
            name: "erc1155" + name,
            symbol: "erc1155" + symbol
        });
    }

    return [
        new ArrayIterator(erc20),
        new ArrayIterator(erc721),
        new ArrayIterator(erc1155)
    ];
}
