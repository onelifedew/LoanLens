# LoanLens

A decentralized lending and borrowing protocol built with Solidity smart contracts and a React frontend. LoanLens enables users to deposit tokens as collateral, borrow against their deposits, and repay loans in a trustless manner.

## Overview

LoanLens is a DeFi (Decentralized Finance) application that implements a simple but functional lending protocol. Users can:

- **Deposit** tokens to earn interest and provide liquidity
- **Borrow** tokens up to 75% of their collateral value (LTV - Loan-to-Value ratio)
- **Repay** loans by returning borrowed tokens
- **Withdraw** collateral (subject to borrow limits)

## Project Structure

### Smart Contracts (`/contracts`)

- **SimpleLending.sol** - Core lending protocol contract with deposit, borrow, repay, and withdraw functions
- **MockUSDT.sol** - Mock ERC20 token for testing and development

### Frontend (`/src`)

- **components/** - React components for the user interface
  - `BorrowForm.jsx` - Component for borrowing tokens
  - `LendForm.jsx` - Component for depositing/lending tokens
  - `LoanStats.jsx` - Component displaying lending and borrowing statistics
  - `Navbar.jsx` - Navigation bar component
- **constants.js** - Configuration constants and contract addresses
- **App.jsx** - Main application component
- **SimpleLendingABI.js** - ABI for smart contract interaction

### Scripts (`/scripts`)

- **deploy.js** - Deployment script for smart contracts
- **faucet.js** - Faucet script for distributing test tokens

## Tech Stack

- **Smart Contracts**: Solidity 0.8.20
- **Contract Development**: Hardhat
- **Frontend**: React 19 with Vite
- **Web3 Interaction**: ethers.js v6
- **Build Tool**: Vite
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start Vite dev server
npm run dev

# Compile smart contracts (if using Hardhat)
npx hardhat compile

# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Smart Contract Features

### Key Parameters

- **LTV (Loan-to-Value)**: 75% - Users can borrow up to 75% of their deposited collateral

### Core Functions

- `deposit(uint256 amount)` - Deposit tokens as collateral
- `borrow(uint256 amount)` - Borrow tokens against collateral
- `repay(uint256 amount)` - Repay borrowed tokens
- `withdraw(uint256 amount)` - Withdraw deposited collateral

## License

MIT
