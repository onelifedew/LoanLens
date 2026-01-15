import dotenv from "dotenv";
import { createRequire } from "module";
import { ethers } from "ethers";

dotenv.config();

const require = createRequire(import.meta.url);
const SimpleLendingArtifact = require("../artifacts/contracts/SimpleLending.sol/SimpleLending.json");
const MockUSDTArtifact = require("../artifacts/contracts/MockUSDT.sol/MockUSDT.json");

async function main() {
  const rpcUrl =
    process.env.MANTLE_SEPOLIA_RPC_URL || "https://mantle-sepolia.drpc.org";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, 5003);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with:", wallet.address);

  // Deploy MockUSDT
  const MockUSDTFactory = new ethers.ContractFactory(
    MockUSDTArtifact.abi,
    MockUSDTArtifact.bytecode,
    wallet
  );
  const mockUSDT = await MockUSDTFactory.deploy();
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("MockUSDT deployed to:", mockUSDTAddress);

  // Deploy SimpleLending with MockUSDT address
  const SimpleLendingFactory = new ethers.ContractFactory(
    SimpleLendingArtifact.abi,
    SimpleLendingArtifact.bytecode,
    wallet
  );
  const simpleLending = await SimpleLendingFactory.deploy(mockUSDTAddress);
  await simpleLending.waitForDeployment();
  const simpleLendingAddress = await simpleLending.getAddress();
  console.log("SimpleLending deployed to:", simpleLendingAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



