var Bloomen = artifacts.require("./bloomen/Bloomen");

module.exports = function(deployer) {
    var _bloomen;
    deployer.deploy(Bloomen).then(function(instance){
            _bloomen = instance;
            return _bloomen.addDapp('0x24Af9351Eb5c8dD6b684861281657AB90A37d454'); // ANT1 Instance
        }
    ).then(function(){            
            return _bloomen.addDapp('0x1309a2521cD0990dF7cD793fafAd204094efA8E8'); // Demo Instance
        }
    );
};
