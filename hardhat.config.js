import dotenv from "dotenv";

dotenv.config();

const config = {
  solidity: "0.8.20",
  networks: {
    mantleSepolia: {
      type: "http",
      url: process.env.MANTLE_SEPOLIA_RPC_URL || "https://mantle-sepolia.drpc.org",
      chainId: 5003,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;

