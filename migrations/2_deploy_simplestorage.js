// File: `./migrations/2_deploy_simplestorage.js`

var SimpleStorage = artifacts.require("./utils/SimpleStorage");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage, 42)
};
