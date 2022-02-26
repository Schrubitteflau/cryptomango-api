export const VALID_ADDRESS: string = "0x3f349bBaFEc1551819B8be1EfEA2fC46cA749aA1" as const;
export const VALID_SIGNATURE: string = "0xfaf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c" as const;

export const INVALID_ADDRESSES: ReadonlyArray<string> = [
    // Missing "0x"
    "3f349bBaFEc1551819B8be1EfEA2fC46cA749aA1",
    // "j" is not a hexadecimal character
    "0xjf349bBaFEc1551819B8be1EfEA2fC46cA749aA1",
    // Not a checksummed address
    VALID_ADDRESS.toLowerCase(),
    "<invalid format>"
] as const;

export const INVALID_SIGNATURES: ReadonlyArray<string> = [
    // Missing "0x"
    "faf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c",
    // "j" is not a hexadecimal character
    "0xjaf3c00184145c5ecb511d58271170aa07283ae44c62f5401c3de6e2407fae384301c1f34da4c70bff3a085c225862aa98db4d08c4d3daa36215d4fcf6cdd6381c",
    "<invalid format>"
] as const;

export const INVALID_AUTH_TOKENS: ReadonlyArray<string> = [
    // Wrong signature
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjA4ZWNlYjk1ZWYyODExZGFiM2U1NjMiLCJhZGRyZXNzIjoiMHgzNzdmZjgzMTY1QzZkQzU0QTYyN0Y4Mjc4NDNiM2U5RTUwMjFGOEQwIiwiaWF0IjoxNjQ0NzUyMTA3LCJleHAiOjE2NDQ3NTU3MDcsImp0aSI6IjYwNGJlN2VkLTFkN2YtNDcyYi05MDg0LTUxZWQ0MjIxY2IxMiJ9.TDRl3PqtTC4efNHiAtCajwr87pX1MaynbY_YJMJ8xFQ",
    // Wrong signature and body
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.40OXv6OSdTvI0ySKf2LjIOQPGVo78ze2Z74T41Rq8t0"
] as const;
