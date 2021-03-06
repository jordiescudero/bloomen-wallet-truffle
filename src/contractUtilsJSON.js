require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic =bip39.generateMnemonic();

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/SmJson.json', 'utf8'));
const GAS = 500000;

const Web3 = require('web3');

var hdprovider =new HDWalletProvider(mnemonic, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  

const web3 = new Web3(hdprovider);

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
  };

const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

function doStuff() {
    switch(process.argv[2]){
        case 'get':
            get();
            break;
        default:
            console.log('no command... get')
   }
   
   hdprovider.engine.stop();
}

function get(){
    contractInstance.methods.getNodes().call(transactionObject).then(
        (result) => {
        console.log('GET:',result)
        });
}



doStuff();
