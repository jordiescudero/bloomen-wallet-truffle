pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;


import "../../../node_modules/json-warehouse/contracts/JsonContainer.sol";
import "../token/ERC223.sol";


contract DAPP is JsonContainer {

    ERC223 public erc223;
  
    constructor(address _erc223Addr) JsonContainer() public {
        erc223 = ERC223(_erc223Addr);
    }
    
}