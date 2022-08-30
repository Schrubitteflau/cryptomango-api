from web3 import HTTPProvider, Web3
from evm_trace import TraceFrame


if __name__ == "__main__":
    provider="https://bsc.getblock.io/mainnet/?api_key=bc25b918-f5c7-4df1-8fa8-cafb242d6f12"
    provider="https://eth.getblock.io/mainnet/?api_key=a1fbc4ed-7d61-4e25-a1e2-81b4a61a5610"
    web3 = Web3(HTTPProvider(provider))
    txn_hash="0x9fb73d9e0a99412fa09d12ebb5cedf5fdb0d091994a23ad88f4009d544c0cfbf"
    txn_hash="0x9ce97c7e8040002df869fff04caa9b5f176dd11859ab4af317bd86fd4455918d"
    struct_logs = web3.manager.request_blocking("debug_traceTransaction", [txn_hash]).structLogs
    print(struct_logs)
    for item in struct_logs:
        print(TraceFrame(**item))
