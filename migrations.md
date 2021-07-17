# 16/07/2021

Add `blockTimestamp` field and remove `confirmations` to stored documents `ITransactionSchema`.

```js
db.BSC_contract_creation_transactions.aggregate([
    { $lookup: { from: "BSC_blocks", localField: "blockNumber", foreignField: "_id", as: "block" } },
    { $set: { blockTimestamp: { $first: "$block.timestamp" } } },
    { $unset: [ "confirmations", "block" ] },
    { $out: "TEMP_BSC_contract_creation_transactions" }
])
```

