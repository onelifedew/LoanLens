// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

contract SimpleLending {
    IERC20 public immutable token;

    uint256 public constant LTV = 75; // 75%

    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;

    constructor(address _token) {
        token = IERC20(_token);
    }

    // 🟢 Deposit tokens (Lend)
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        token.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
    }

    // 🔵 Borrow tokens
    function borrow(uint256 amount) external {
        uint256 maxBorrow = (deposits[msg.sender] * LTV) / 100;

        require(
            borrows[msg.sender] + amount <= maxBorrow,
            "Borrow limit exceeded"
        );

        borrows[msg.sender] += amount;
        token.transfer(msg.sender, amount);
    }

    // 🔴 Repay loan
    function repay(uint256 amount) external {
        require(borrows[msg.sender] >= amount, "Invalid repay amount");

        token.transferFrom(msg.sender, address(this), amount);
        borrows[msg.sender] -= amount;
    }

    // 🟡 Withdraw collateral
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");

        uint256 remainingDeposit = deposits[msg.sender] - amount;
        uint256 maxBorrowAfter = (remainingDeposit * LTV) / 100;

        require(
            borrows[msg.sender] <= maxBorrowAfter,
            "Withdrawal breaks collateral"
        );

        deposits[msg.sender] = remainingDeposit;
        token.transfer(msg.sender, amount);
    }
}
