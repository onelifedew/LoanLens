import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// Usage:
// node scripts/faucet.js <recipient> [amount]
// Defaults to 100 tokens (18 decimals) if amount is not provided.

const RPC_URL =
  process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const MOCK_USDT_ADDRESS = "0x09ebc02641eEfc6f67d4a2eEDd60cfFF4D8a6c8B";

const MOCK_USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

async function main() {
  if (!PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not set in .env");
  }

  const [recipient, amountArg] = process.argv.slice(2);
  if (!recipient) {
    throw new Error("Recipient address is required. Usage: node scripts/faucet.js <recipient> [amount]");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, 5003);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const token = new ethers.Contract(MOCK_USDT_ADDRESS, MOCK_USDT_ABI, wallet);
  const decimals = await token.decimals();
  const symbol = await token.symbol();

  const amount = amountArg
    ? ethers.parseUnits(amountArg, decimals)
    : ethers.parseUnits("100", decimals);

  const bal = await token.balanceOf(await wallet.getAddress());
  if (bal < amount) {
    throw new Error(
      `Deployer faucet balance too low. Have ${ethers.formatUnits(
        bal,
        decimals
      )} ${symbol}, need ${ethers.formatUnits(amount, decimals)} ${symbol}.`
    );
  }

  console.log(`Sending ${ethers.formatUnits(amount, decimals)} ${symbol} to ${recipient} ...`);
  const tx = await token.transfer(recipient, amount);
  console.log("Tx submitted:", tx.hash);
  await tx.wait();
  console.log("Faucet transfer confirmed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

