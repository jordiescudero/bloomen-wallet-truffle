pragma solidity ^0.4.23;

import "../common/DAPP.sol"; 

contract ANT1DAPP is DAPP {
  constructor(ERC223 _erc223) DAPP(_erc223) public {
    addPathData("name", "ANT1 DAPP");    
  }
}