require('dotenv').config()

var Web3 = require('web3');


module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
   development: {
      host: process.env.DEVELOPMENT_HOST,
      port: process.env.DEVELOPMENT_PORT, 
      network_id: "*", 
      gasPrice: 2000000000,
      gas: 6721975,
      from: process.env.DEVELOPMENT_ACCOUNT,
    },
    alastria: {
      provider: () => {

        // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
        const _user = process.env.ALASTRIA_USER;
        const _password = process.env.ALASTRIA_PASSWORD;
        const _auth = 'Basic ' + Buffer.from(_user + ':' + _password).toString('base64');
        const _headers = [{name: 'Authorization', value: _auth}];
        const _provider = new Web3.providers.HttpProvider(process.env.ALASTRIA_URL, {timeout: 0, headers: _headers });
        return _provider;
      },
      network_id: "*", 
      gasPrice: 0,
      gas: 999999999999,
      from: process.env.ALASTRIA_ACCOUNT,
    }
  }
};
