import { ethers } from "ethers";

// https://eips.ethereum.org/EIPS/eip-20
export const ERC20 = new ethers.utils.Interface([
    "function totalSupply() public view returns (uint256)",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function transfer(address _to, uint256 _value) public returns (bool success)",
    "function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
    "event Approval(address indexed _owner, address indexed _spender, uint256 _value)"
]);

// Optionnal but commonly used : decimals(), symbol() and name()
export const ERC20Decimals = new ethers.utils.Interface([
    "function decimals() public view returns (uint8)"
]);

export const ERC20Symbol = new ethers.utils.Interface([
    "function symbol() public view returns (string)"
]);

export const ERC20Name = new ethers.utils.Interface([
    "function name() public view returns (string)"
]);

// https://eips.ethereum.org/EIPS/eip-721 without safeTransferFrom() and ERC165
export const ERC721WithoutSafeTransferFrom = new ethers.utils.Interface([
    "event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)",
    "event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId)",
    "event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)",
    "function balanceOf(address _owner) external view returns (uint256)",
    "function ownerOf(uint256 _tokenId) external view returns (address)",
    "function transferFrom(address _from, address _to, uint256 _tokenId) external payable",
    "function approve(address _approved, uint256 _tokenId) external payable",
    "function setApprovalForAll(address _operator, bool _approved) external",
    "function getApproved(uint256 _tokenId) external view returns (address)",
    "function isApprovedForAll(address _owner, address _operator) external view returns (bool)"
]);

// ERC721 : safeTransferFrom variant 1
export const ERC721SafeTransferFromV1 = new ethers.utils.Interface([
    "function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable"
]);

// ERC721 : safeTransferFrom variant 2
export const ERC721SafeTransferFromV2 = new ethers.utils.Interface([
    "function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable"
]);

// ERC721 metadata : name()
export const ERC721Name = new ethers.utils.Interface([
    "function name() external view returns (string _name)"
]);

// ERC721 metadata : symbol()
export const ERC721Symbol = new ethers.utils.Interface([
    "function symbol() external view returns (string _symbol)"
]);

// ERC721 metadata : tokenURI()
export const ERC721TokenURI = new ethers.utils.Interface([
    "function tokenURI(uint256 _tokenId) external view returns (string)"
]);

// https://eips.ethereum.org/EIPS/eip-1155 without ERC165
export const ERC1155 = new ethers.utils.Interface([
    "event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)",
    "event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values)",
    "event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)",
    "event URI(string _value, uint256 indexed _id)",
    "function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external",
    "function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) external",
    "function balanceOf(address _owner, uint256 _id) external view returns (uint256)",
    "function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory)",
    "function setApprovalForAll(address _operator, bool _approved) external",
    "function isApprovedForAll(address _owner, address _operator) external view returns (bool)"
]);

// Not part of ERC1155 standard, but commonly used : name() and symbol()
export const ERC1155Symbol = new ethers.utils.Interface([
    "function symbol() public view returns (string)"
]);

export const ERC1155Name = new ethers.utils.Interface([
    "function name() public view returns (string)"
]);
