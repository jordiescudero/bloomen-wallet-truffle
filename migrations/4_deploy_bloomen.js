var Bloomen = artifacts.require("./bloomen/Bloomen");

module.exports = function(deployer) {
  //deployer.deploy(Bloomen);
  var _ec223, _assets, _devices, _pcm, _bloomen;
  deployer.deploy(Bloomen).then(function(instance) {
    _bloomen = instance;
    _bloomen.prepaidCardManager().then((res)=> {console.log("PCM",res);});
  });
};
