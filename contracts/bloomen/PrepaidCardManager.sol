pragma solidity ^0.4.23;


import "./token/ERC223.sol";

contract PrepaidCardManager  {

  ERC223 public erc223;
  constructor(ERC223 _erc223) public {
    erc223 = _erc223;
  }

//  function addCard(uint _cardId, uint _tokens, bytes32 _hash) public   {
//   }

}