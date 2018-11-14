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

  constructor() public {
    erc223 = new ERC223("BloomenCoin","BLO",2);
    prepaidCardManager = new PrepaidCardManager(erc223);
    devices = new Devices();
    assets = new Assets();

    dapps.push(new ANT1DAPP(erc223));
    dapps.push(new DemoDAPP(erc223));

  }

}