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

export const ERC20Decimals = new ethers.utils.Interface([
    "function decimals() public view returns (uint8)"
]);

export const ERC20Symbol = new ethers.utils.Interface([
    "function symbol() public view returns (string)"
]);

export const ERC20Name = new ethers.utils.Interface([
    "function name() public view returns (string)"
]);
