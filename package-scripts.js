require('dotenv').config();


module.exports = {
  scripts: {
    test: 'truffle test',
    console: 'truffle console',
    wclean: 'rd /s /q build',
    development: 'truffle migrate',
    alastria: 'truffle migrate --network  alastria',
    hd: 'truffle migrate --network  ahd',
    ganache: 'ganache-cli -g 0 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '"',
    coffeeCli: 'node src/coffeeCli.js o',
    contractCli: 'node src/contractUtils.js'
  }
};
