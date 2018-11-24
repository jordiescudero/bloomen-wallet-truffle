pragma solidity ^0.4.23;

import "./PrepaidCardManager.sol";
import "./Devices.sol";
import "./Assets.sol";
import "./common/DAPP.sol";
import "./token/ERC223.sol";
import "./dapp/ANT1DAPP.sol";
import "./dapp/DemoDAPP.sol";

contract Bloomen {

  PrepaidCardManager public prepaidCardManager;
  Devices public devices;
  Assets public assets;
  ERC223 public erc223;
  address[] public dapps;

  constructor(address _erc223Addr, address _prepaidCardManagerAddr, address _assetsAddr, address _devicesAddr) public {
    erc223 = ERC223(_erc223Addr);
    prepaidCardManager = PrepaidCardManager(_prepaidCardManagerAddr);
    devices = Devices(_devicesAddr);
    assets = Assets(_assetsAddr);

  }

  function addDapp(address _dappAddress) public {
    // TODO: Only owner protection
    dapps.push(_dappAddress);
  }
}