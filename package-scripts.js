require('dotenv').config();


module.exports = {
  scripts: {
    test: 'truffle test',
    console: 'truffle console',
    wclean: 'rd /s /q build',
    development: 'truffle migrate --reset',
    alastria: 'truffle migrate --reset --network alastria',
    hd: 'truffle migrate --network  hd',
    ganache: 'ganache-cli -g 0 --db ganache_db  -i 123456 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" ',
    nohupGanache: 'xnohup nps ganache',
    coffeeCli: 'node src/coffeeCli.js o',
    contractCli: 'node src/contractUtils.js',
    qr: 'node src/qrTest.js'
  }
};