pragma solidity ^0.4.23;

import "../common/DAPP.sol"; 

contract DemoDAPP is DAPP {
  constructor(address _erc223Addr)  DAPP(_erc223Addr) public {
    addPathData("name", "Demo DAPP"); 
  }
}