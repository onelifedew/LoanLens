export const NETWORK = {
  name: "Mantle Sepolia",
  chainId: 5003,
  chainIdHex: "0x138b",
  rpcUrl: "https://rpc.sepolia.mantle.xyz",
};

export const MOCK_USDT_ADDRESS = "0x09ebc02641eEfc6f67d4a2eEDd60cfFF4D8a6c8B";
export const SIMPLE_LENDING_ADDRESS = "0xAA0A472B8CdDDd7e2f432c8B985C17Df105EaFBf";

export const SIMPLE_LENDING_ABI = [
  "function LTV() view returns (uint256)",
  "function deposits(address) view returns (uint256)",
  "function borrows(address) view returns (uint256)",
  "function deposit(uint256 amount)",
  "function borrow(uint256 amount)",
  "function repay(uint256 amount)",
  "function withdraw(uint256 amount)",
];

export const MOCK_USDT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

