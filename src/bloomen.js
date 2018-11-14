require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

//const packedArgs = web3.eth.abi.encodeParameters(['uint256', 'string'], ['123', 'Hello world']);`


var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Bloomen.json', 'utf8'));
const GAS = 500000;

const Web3 = require('web3');

var hdprovider =new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  

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
    contractInstance.methods.dapps(1).call(transactionObject).then(
        (result) => {
        console.log('GET:',result)
        });
}



doStuff();
