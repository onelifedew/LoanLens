require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    mantleSepolia: {
      url: process.env.MANTLE_SEPOLIA_RPC_URL || "https://mantle-sepolia.drpc.org",
      chainId: 5003,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;

