pragma solidity ^0.4.23;


import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/utils/Address.sol";

import "./ERC223ReceivingContract.sol";

//https://gist.github.com/wadeAlexC/42c9b8e061d4b0afb850e52c802bb115
//https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603

contract ERC223 is ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor (string _name, string _symbol, uint8 _decimals) public ERC20Detailed(_name, _symbol, _decimals){}

    // Overridden transfer method with _data param for transaction data
  function transfer(address _to, uint _value, bytes _data) public {

    super.transfer(_to,_value);

    if(Address.isContract(_to)) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
      receiver.tokenFallback(msg.sender, _value, _data);
    }
    emit Transfer(msg.sender, _to, _value);
  }

    // Overridden Backwards compatible transfer method without _data param
  function transfer(address _to, uint _value) public returns (bool) {
    bytes memory empty;
    this.transfer(_to, _value, empty);
  }
}