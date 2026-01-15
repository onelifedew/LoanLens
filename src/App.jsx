import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  MOCK_USDT_ABI,
  MOCK_USDT_ADDRESS,
  NETWORK,
  SIMPLE_LENDING_ABI,
  SIMPLE_LENDING_ADDRESS,
} from "./constants";
import "./App.css";

const fmt = (v) => Number(ethers.formatUnits(v ?? 0n, 18));
const toUnits = (v) => ethers.parseUnits(v || "0", 18);

function App() {
  const [account, setAccount] = useState("");
  const [chainOk, setChainOk] = useState(false);
  const [status, setStatus] = useState("Connect wallet to start");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [depositAmt, setDepositAmt] = useState("");
  const [borrowAmt, setBorrowAmt] = useState("");
  const [repayAmt, setRepayAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");

  const [tokenSymbol, setTokenSymbol] = useState("mUSDT");
  const [balances, setBalances] = useState({
    wallet: 0,
    deposit: 0,
    borrow: 0,
    maxBorrow: 0,
    availableBorrow: 0,
    allowance: 0,
  });

  // Connect wallet and ensure network
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask not detected. Please install it.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      await ensureNetwork();
      setStatus("Wallet connected");
      await refreshBalances();
    } catch (err) {
      setStatus(err.message || "Failed to connect wallet");
    }
  };

  const ensureNetwork = async () => {
    if (!window.ethereum) return false;
    const currentChain = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (currentChain === NETWORK.chainIdHex) {
      setChainOk(true);
      return true;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }],
      });
      setChainOk(true);
      return true;
    } catch (switchError) {
      setChainOk(false);
      setStatus("Please switch to Mantle Sepolia (chainId 5003)");
      return false;
    }
  };

  const getContracts = async (withSigner = false) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = withSigner ? await provider.getSigner() : provider;
    const token = new ethers.Contract(
      MOCK_USDT_ADDRESS,
      MOCK_USDT_ABI,
      signer
    );
    const lending = new ethers.Contract(
      SIMPLE_LENDING_ADDRESS,
      SIMPLE_LENDING_ABI,
      signer
    );
    return { provider, signer, token, lending };
  };

  const refreshBalances = async () => {
    if (!window.ethereum || !account) return;
    try {
      const ok = await ensureNetwork();
      if (!ok) return;
      const { token, lending } = await getContracts(false);
      const [walletBal, deposit, borrow, allowance, symbol] = await Promise.all([
        token.balanceOf(account),
        lending.deposits(account),
        lending.borrows(account),
        token.allowance(account, SIMPLE_LENDING_ADDRESS),
        token.symbol(),
      ]);

      const maxBorrow = (deposit * 75n) / 100n;
      const availableBorrow = maxBorrow > borrow ? maxBorrow - borrow : 0n;

      setBalances({
        wallet: fmt(walletBal),
        deposit: fmt(deposit),
        borrow: fmt(borrow),
        maxBorrow: fmt(maxBorrow),
        availableBorrow: fmt(availableBorrow),
        allowance: fmt(allowance),
      });
      setTokenSymbol(symbol);
    } catch (err) {
      setStatus(err.message || "Failed to load balances");
    }
  };

  const ensureAllowance = async (needed) => {
    const { token, lending } = await getContracts(true);
    const signerAddr = await token.runner.getAddress();
    const allowance = await token.allowance(
      signerAddr,
      await lending.getAddress()
    );
    if (allowance >= needed) return;
    const tx = await token.approve(await lending.getAddress(), needed);
    setStatus("Approving token spend...");
    await tx.wait();
  };

  const handleTx = async (fn, label) => {
    setIsActionLoading(true);
    try {
      await fn();
      setStatus(`${label} confirmed`);
      await refreshBalances();
    } catch (err) {
      setStatus(err.message || `${label} failed`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const onDeposit = () =>
    handleTx(async () => {
      const amount = toUnits(depositAmt);
      if (amount <= 0) throw new Error("Enter amount > 0");
      const { lending } = await getContracts(true);
      await ensureAllowance(amount);
      const tx = await lending.deposit(amount);
      setStatus("Depositing...");
      await tx.wait();
    }, "Deposit");

  const onBorrow = () =>
    handleTx(async () => {
      const amount = toUnits(borrowAmt);
      if (amount <= 0) throw new Error("Enter amount > 0");
      const { lending } = await getContracts(true);
      const tx = await lending.borrow(amount);
      setStatus("Borrowing...");
      await tx.wait();
    }, "Borrow");

  const onRepay = () =>
    handleTx(async () => {
      const amount = toUnits(repayAmt);
      if (amount <= 0) throw new Error("Enter amount > 0");
      const { lending } = await getContracts(true);
      await ensureAllowance(amount);
      const tx = await lending.repay(amount);
      setStatus("Repaying...");
      await tx.wait();
    }, "Repay");

  const onWithdraw = () =>
    handleTx(async () => {
      const amount = toUnits(withdrawAmt);
      if (amount <= 0) throw new Error("Enter amount > 0");
      const { lending } = await getContracts(true);
      const tx = await lending.withdraw(amount);
      setStatus("Withdrawing...");
      await tx.wait();
    }, "Withdraw");

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accs) => {
      if (accs && accs.length) {
        setAccount(accs[0]);
        refreshBalances();
      } else {
        setAccount("");
      }
    };
    const handleChainChanged = () => {
      window.location.reload();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connected = account && chainOk;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>💸 LoanLens</h1>
          <p className="tagline">
            Minimal lending on Mantle Sepolia — 75% LTV, deposit / borrow /
            repay / withdraw.
          </p>
        </div>
        <div className="actions">
          <button onClick={connectWallet} className="primary">
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </button>
          <div className="status">
            <span className={chainOk ? "ok" : "warn"}>
              {chainOk ? NETWORK.name : "Wrong network"}
            </span>
            <span className="address">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Not connected"}
            </span>
          </div>
        </div>
      </header>

      <section className="status-line">{status}</section>

      <section className="grid">
        <div className="card stats">
          <h3>Your Portfolio</h3>
          <div className="stat-row">
            <span>Wallet balance</span>
            <b>
              {balances.wallet} {tokenSymbol}
            </b>
          </div>
          <div className="stat-row">
            <span>Deposited</span>
            <b>
              {balances.deposit} {tokenSymbol}
            </b>
          </div>
          <div className="stat-row">
            <span>Borrowed</span>
            <b>
              {balances.borrow} {tokenSymbol}
            </b>
          </div>
          <div className="stat-row">
            <span>Max borrow (75% LTV)</span>
            <b>
              {balances.maxBorrow} {tokenSymbol}
            </b>
          </div>
          <div className="stat-row">
            <span>Available to borrow</span>
            <b>
              {balances.availableBorrow} {tokenSymbol}
            </b>
          </div>
        </div>

        <div className="card">
          <h3>Deposit</h3>
          <input
            type="number"
            min="0"
            placeholder={`Amount (${tokenSymbol})`}
            value={depositAmt}
            onChange={(e) => setDepositAmt(e.target.value)}
          />
          <button
            className="primary"
            disabled={!connected || isActionLoading}
            onClick={onDeposit}
          >
            Deposit
          </button>
        </div>

        <div className="card">
          <h3>Borrow</h3>
          <input
            type="number"
            min="0"
            placeholder={`Amount (${tokenSymbol})`}
            value={borrowAmt}
            onChange={(e) => setBorrowAmt(e.target.value)}
          />
          <button
            className="primary"
            disabled={!connected || isActionLoading}
            onClick={onBorrow}
          >
            Borrow
          </button>
          <p className="hint">
            Borrow up to your available limit ({balances.availableBorrow}{" "}
            {tokenSymbol})
          </p>
        </div>

        <div className="card">
          <h3>Repay</h3>
          <input
            type="number"
            min="0"
            placeholder={`Amount (${tokenSymbol})`}
            value={repayAmt}
            onChange={(e) => setRepayAmt(e.target.value)}
          />
          <button
            className="primary"
            disabled={!connected || isActionLoading}
            onClick={onRepay}
          >
            Repay
          </button>
          <p className="hint">Requires allowance to lending contract.</p>
        </div>

        <div className="card">
          <h3>Withdraw</h3>
          <input
            type="number"
            min="0"
            placeholder={`Amount (${tokenSymbol})`}
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmt(e.target.value)}
          />
          <button
            className="primary"
            disabled={!connected || isActionLoading}
            onClick={onWithdraw}
          >
            Withdraw
          </button>
          <p className="hint">
            You can withdraw only if post-withdraw LTV stays within 75%.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;

