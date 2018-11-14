pragma solidity ^0.4.23;


import "./Json.sol"; 
import "../token/ERC223.sol";

contract DAPP is Json {

  ERC223 public erc223;
  
  constructor(ERC223 _erc223) public {
    erc223 = _erc223;
    addPathData("@type","DAPP");
  }
    
}