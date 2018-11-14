pragma solidity ^0.4.23;

import "../common/DAPP.sol"; 

contract DemoDAPP is DAPP {
  constructor(ERC223 _erc223)  DAPP(_erc223) public {
    addPathData("name", "Demo DAPP"); 
  }
}