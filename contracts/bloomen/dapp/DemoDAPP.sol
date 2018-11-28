pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "../common/DAPP.sol"; 

contract DemoDAPP is DAPP {
    constructor(address _erc223Addr)  DAPP(_erc223Addr) public {
    }
}