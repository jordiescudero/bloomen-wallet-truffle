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
  DAPP[] public dapps;

  constructor(address _erc223Addr, address _prepaidCardManagerAddr) public {
    erc223 = ERC223(_erc223Addr);
    prepaidCardManager = PrepaidCardManager(_prepaidCardManagerAddr);
    devices = new Devices();
    assets = new Assets();

    dapps.push(new ANT1DAPP(erc223));
    dapps.push(new DemoDAPP(erc223));

  }

}