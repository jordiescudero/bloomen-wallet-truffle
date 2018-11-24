pragma solidity ^0.4.23;


import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/utils/Address.sol";


import "./ERC223ReceivingContract.sol";

contract ERC223 is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor (string _name, string _symbol, uint8 _decimals) public ERC20Detailed(_name, _symbol, _decimals){}

    // Overridden transfer method with _data param for transaction data
  function transfer(address _to, uint _value, bytes _data) public {

    _transfer(msg.sender,_to,_value);
    _tokenFallback(msg.sender, _to, _value , _data );
  }

    // Overridden Backwards compatible transfer method without _data param
  function transfer(address _to, uint _value) public returns (bool) {
    bytes memory empty;
    _transfer(msg.sender,_to,_value);
    _tokenFallback(msg.sender, _to, _value , empty );
    return true;
  }

  function _tokenFallback(address sender, address to, uint256 value , bytes data ) internal {
    if(Address.isContract(to)) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(to);
      receiver.tokenFallback(sender, value, data);
    }
    emit Transfer(sender, to, value);
  }


}