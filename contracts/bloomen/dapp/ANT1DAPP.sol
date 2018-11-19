pragma solidity ^0.4.23;

import "../common/DAPP.sol"; 

contract ANT1DAPP is DAPP {
  constructor(address _erc223Addr) DAPP(_erc223Addr) public {
    addPathData("name", "ANT1 DAPP");    
  }
}