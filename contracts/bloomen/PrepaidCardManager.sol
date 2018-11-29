pragma solidity ^0.4.24;

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
    mapping (bytes32 => uint256) private activeCards_;
    uint256[] private ids_;

    ERC223 public erc223;

    modifier cardExists(uint256 _cardId) {
        require(cards_[_cardId].initialized > 0, "not_exist");
        _;
    }

    modifier validExists(uint256 _cardId) {
        require(_cardId > 0, "valid_card_id");
        _;
    }

    constructor(address _erc223Addr) public {
        erc223 = ERC223(_erc223Addr);
    }

    function getCard(uint256 _cardId) public view cardExists(_cardId) returns(uint256 cardId, address owner, uint256 tokens, bool active)  {
        return (cards_[_cardId].cardId, cards_[_cardId].owner, cards_[_cardId].tokens, cards_[_cardId].active);
    }

    function getCardIds() public view returns(uint256[]) {
        return ids_;
    }

    function addCard(uint256 _cardId, uint256 _tokens, bytes32 _hash) public validExists(_cardId) onlyOwner {
        require(_tokens > 0, "empty_tokens");
        require(cards_[_cardId].initialized == 0, "card_exist");
        erc223.mint(this,_tokens);
        Card memory newCard = Card(_hash, _cardId, _tokens, false, msg.sender, 1);
        cards_[_cardId] = newCard;
        ids_.push(_cardId);
    }

    function activateCard(uint256 _cardId) public cardExists(_cardId) onlySigner {
        require(cards_[_cardId].active == false, "not_activatable");
        cards_[_cardId].active = true;
        activeCards_[cards_[_cardId].hash] = _cardId;
    }

    function validateCard(bytes _secret) public {
        bytes32 hash = keccak256(_secret);
        uint256 cardId = activeCards_[hash];
        require(cardId > 0, "not_active");
        require(cards_[cardId].active == true, "not_active");
        require(cards_[cardId].hash == hash, "wrong_secret");
    
        erc223.transfer(msg.sender,cards_[cardId].tokens);
        emit CardValidated(cards_[cardId].owner, cards_[cardId].cardId, msg.sender);
    
        delete activeCards_[hash];
        delete cards_[cardId];
        for (uint256 i = 0; i < ids_.length; i++) {
            if (ids_[i] == cardId) {
                _removeCardId(i);
                break;
            }
        }
    }

    function _removeCardId(uint256 index) internal {
        if (index >= ids_.length) return;
        for (uint i = index; i<ids_.length-1; i++){
            ids_[i] = ids_[i+1];
        }
        delete ids_[ids_.length-1];
        ids_.length--;
    }

}