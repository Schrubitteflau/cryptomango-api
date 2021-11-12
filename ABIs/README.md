ABIs based on :
- https://eips.ethereum.org/EIPS/eip-20
- https://eips.ethereum.org/EIPS/eip-721
- https://eips.ethereum.org/EIPS/eip-1155

Note that `name()` and `symbol()` are included even though these methods are optionnal (EIP-20 and EIP-720) or are simply not part of the standard (EIP-1155). They are present because they are very common and if the contract doesn't implement it, this is not a problem.
