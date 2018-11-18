var Bloomen = artifacts.require("./bloomen/Bloomen");
var ERC223 = artifacts.require("./bloomen/token/ERC223");
var PrepaidCardManager = artifacts.require("./bloomen/PrepaidCardManager");

var _erc223, _assets, _devices, _prepaidCardManager, _bloomen;

module.exports = function(deployer) {
  var _erc223, _prepaidCardManager;
  deployer.then(function (){
    return ERC223.deployed();
  }).then( function(instance){
    _erc223 = instance;
    return PrepaidCardManager.deployed();
  }).then(function (instance){
    _prepaidCardManager=instance;
    return deployer.deploy(Bloomen, _erc223.address, _prepaidCardManager.address);
  });
};

