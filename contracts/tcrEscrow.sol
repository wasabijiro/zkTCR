// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./MyToken.sol";

contract Escrow {
    address admin;
    uint256 public totalBalance;
    address constant p2pmAddress = 0xe1EE7922cf2Bfc63E7c426C9AEFe3ea604359533;

    struct Transaction {
        address buyer;
        uint256 amount;
        bool locked;
        bool spent;
    }

    mapping(address => mapping(uint256 => Transaction)) public balances;
    uint256[] public transactionIds; // トランザクションIDを保持する配列

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can unlock escrow.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function accept(
        uint256 _tx_id,
        address _buyer,
        uint256 _amount
    ) external returns (uint256) {
        P2PM token = P2PM(p2pmAddress);
        token.transferFrom(msg.sender, address(this), _amount);
        totalBalance += _amount;
        balances[msg.sender][_tx_id] = Transaction(
            _buyer,
            _amount,
            true,
            false
        );

        transactionIds.push(_tx_id); // トランザクションIDを配列に追加

        return token.balanceOf(msg.sender);
    }

    function getAllTransactionIds() external view returns (uint256[] memory) {
        return transactionIds;
    }

    // retrieve current state of transaction in escrow
    function transaction(address _seller, uint256 _tx_id)
        external
        view
        returns (
            uint256,
            bool,
            address
        )
    {
        return (
            balances[_seller][_tx_id].amount,
            balances[_seller][_tx_id].locked,
            balances[_seller][_tx_id].buyer
        );
    }

    // admin unlocks tokens in escrow for a transaction
    function release(uint256 _tx_id, address _seller)
        external
        onlyAdmin
        returns (bool)
    {
        balances[_seller][_tx_id].locked = false;
        return true;
    }

    // seller is able to withdraw unlocked tokens
    function withdraw(uint256 _tx_id) external returns (bool) {
        require(
            balances[msg.sender][_tx_id].locked == false,
            "This escrow is still locked"
        );
        require(
            balances[msg.sender][_tx_id].spent == false,
            "Already withdrawn"
        );

        P2PM token = P2PM(p2pmAddress);
        token.transfer(msg.sender, balances[msg.sender][_tx_id].amount);

        totalBalance -= balances[msg.sender][_tx_id].amount;
        balances[msg.sender][_tx_id].spent = true;
        return true;
    }

    // admin can send funds to buyer if dispute resolution is in buyer's favor
    function resolveToBuyer(address _seller, uint256 _tx_id)
        external
        onlyAdmin
        returns (bool)
    {
        P2PM token = P2PM(p2pmAddress);
        token.transfer(
            balances[_seller][_tx_id].buyer,
            balances[_seller][_tx_id].amount
        );

        balances[_seller][_tx_id].spent = true;
        totalBalance -= balances[_seller][_tx_id].amount;
        return true;
    }
}
