var Bloomen = artifacts.require("./bloomen/Bloomen");
var ERC223 = artifacts.require("./bloomen/token/ERC223");
var ANT1DAPP = artifacts.require("./bloomen/dapp/ANT1DAPP");
var DemoDAPP = artifacts.require("./bloomen/dapp/DemoDAPP");

module.exports = function(deployer) {
  var _erc223, _bloomen, _dapp;
  deployer.then(function (){
    return ERC223.deployed();
  }).then( function(instance){
    _erc223 = instance;
    return Bloomen.deployed();
  }).then( function(instance){
    _bloomen = instance;
    return deployer.deploy(ANT1DAPP, _erc223.address); 
  }).then( function(instance){
    return _bloomen.addDapp(instance.address);
  }).then( function(instance){
    console.log("1f");
    return deployer.deploy(DemoDAPP, _erc223.address);
  }).then( function(instance){
    return _bloomen.addDapp(instance.address);
  });
};

