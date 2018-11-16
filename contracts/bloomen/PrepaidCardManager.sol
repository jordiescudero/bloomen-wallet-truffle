pragma solidity ^0.4.23;

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./token/ERC223.sol";

contract PrepaidCardManager  {
  using SafeMath for uint256;

  event CardValidated(
    address indexed owner,
    uint256 cardId,
    address indexed user
  );

  struct Card {
    bytes32 hash;
    uint256 cardId;  
    uint256 tokens;
    bool active;
    address owner;
    uint initialized;
  }

  mapping (uint256 => Card) private cards_;

  ERC223 public erc223;
  constructor(ERC223 _erc223) public {
    erc223 = _erc223;
  }

  function getCard(uint256 _cardId) public view returns(uint256 cardId, address owner, uint256 tokens, bool active){
    require(cards_[_cardId].initialized > 0);
    return (cards_[_cardId].cardId, cards_[_cardId].owner, cards_[_cardId].tokens, cards_[_cardId].active);
  }

  function addCard(uint256 _cardId, uint256 _tokens, bytes32 _hash) public {
    require(_tokens > 0);
    require(cards_[_cardId].initialized == 0);
    erc223.mint(this,_tokens);
    Card memory newCard = Card(_hash, _cardId, _tokens, false, msg.sender, 1);
    cards_[_cardId] = newCard;    
  }

  function activateCard(uint256 _cardId) public {
    require(cards_[_cardId].initialized == 1);
    require(cards_[_cardId].active == false);
    // require(cards_[_cardId].owner == msg.sender);
    // TODO: move to role approach ... add validator
    cards_[_cardId].active=true;    
  }

  function validateCard(uint256 _cardId, bytes _secret) public {
    require(cards_[_cardId].initialized == 1);
    require(cards_[_cardId].active == true);
    require(cards_[_cardId].hash ==  keccak256(_secret));
  
    erc223.transfer(msg.sender,cards_[_cardId].tokens);
    emit CardValidated(cards_[_cardId].owner, cards_[_cardId].cardId, msg.sender);
  
    delete cards_[_cardId];
  }


}