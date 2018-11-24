pragma solidity ^0.4.23;

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../node_modules/openzeppelin-solidity/contracts/access/roles/SignerRole.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./token/ERC223.sol";

contract PrepaidCardManager is SignerRole, Ownable {
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

  modifier cardExists(uint256 _cardId) {
    require(cards_[_cardId].initialized > 0, "not_exist");
    _;
  }

  constructor(address _erc223Addr) public {
    erc223 = ERC223(_erc223Addr);
  }

  function getCard(uint256 _cardId) cardExists(_cardId) public view returns(uint256 cardId, address owner, uint256 tokens, bool active)  {
    return (cards_[_cardId].cardId, cards_[_cardId].owner, cards_[_cardId].tokens, cards_[_cardId].active);
  }

  function addCard(uint256 _cardId, uint256 _tokens, bytes32 _hash) onlyOwner public {
    require(_tokens > 0, "empty_tokens");
    require(cards_[_cardId].initialized == 0, "card_exist");
    erc223.mint(this,_tokens);
    Card memory newCard = Card(_hash, _cardId, _tokens, false, msg.sender, 1);
    cards_[_cardId] = newCard;    
  }

  function activateCard(uint256 _cardId) cardExists(_cardId) onlySigner public {
    require(cards_[_cardId].active == false, "not_activatable");
    cards_[_cardId].active=true;    
  }

  function validateCard(uint256 _cardId, bytes _secret) cardExists(_cardId) public {
    require(cards_[_cardId].active == true, "not_active");
    require(cards_[_cardId].hash ==  keccak256(_secret), "wrong_secret");
  
    erc223.transfer(msg.sender,cards_[_cardId].tokens);
    emit CardValidated(cards_[_cardId].owner, cards_[_cardId].cardId, msg.sender);
  
    delete cards_[_cardId];
  }


}