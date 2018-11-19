pragma solidity ^0.4.23;



import "./Json.sol"; 
import "../token/ERC223.sol";
import "../../../node_modules/solidity-rlp/contracts/RLPReader.sol";

contract DAPP is Json {

  ERC223 public erc223;
  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;
  
  constructor(address _erc223Addr) public {
    erc223 = ERC223(_erc223Addr);
    addPathData("@type","DAPP");
  }

  function decode(bytes memory _in) public pure returns (uint, string) {
   
    RLPReader.RLPItem memory item = _in.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();
    
    return (itemList[0].toUint(), string(itemList[1].toBytes()));        
  }
    
}