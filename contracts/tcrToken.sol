// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract P2PM is ERC20 {
    address public admin;
    constructor() ERC20("tcr", "TCR") {
        _mint(msg.sender, 3000 * 10 ** decimals());
        admin = msg.sender;
    }
}
