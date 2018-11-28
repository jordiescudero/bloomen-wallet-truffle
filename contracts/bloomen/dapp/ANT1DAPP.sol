pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "../common/DAPP.sol"; 

contract ANT1DAPP is DAPP {
    constructor(address _erc223Addr) DAPP(_erc223Addr) public {
        _addPath("@type1","DAPP", "string");
    }
}