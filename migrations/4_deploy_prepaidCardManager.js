
var ERC223 = artifacts.require("./bloomen/token/ERC223");
var PrepaidCardManager = artifacts.require("./bloomen/PrepaidCardManager");


module.exports = function(deployer) {
  var _erc223, _prepaidCardManager;
  deployer.then(function (){
    return ERC223.deployed();
  }).then( function(instance){
    _erc223 = instance;
    return deployer.deploy(PrepaidCardManager,_erc223.address);
  }).then(function (instance){
    _prepaidCardManager=instance;
    return _erc223.addMinter(_prepaidCardManager.address);
  });
};
