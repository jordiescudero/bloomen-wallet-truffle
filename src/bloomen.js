require('dotenv').config();

var RLP = require('rlp');

var HDWalletProvider = require("truffle-hdwallet-provider");

//const packedArgs = web3.eth.abi.encodeParameters(['uint256', 'string'], ['123', 'Hello world']);`
var _dappAddr ="0x969996355A2aCAe843DaC3CdDc7D96aa3A515765";
var _pcmAddr ="0x50E52DCb3CF7726Feea68efa297dAADE563a58c5";

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Bloomen.json', 'utf8'));
var contractDAPP = JSON.parse(fs.readFileSync('./build/contracts/DAPP.json', 'utf8'));
var contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));


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
  const contractInstanceDAPP = new web3.eth.Contract(contractDAPP.abi, _dappAddr);
  const contractInstancePCM = new web3.eth.Contract(contractPCM.abi, _pcmAddr);

function doStuff() {
    switch(process.argv[2]){
        case 'get':
            get();
            break;
        case 'decode':
            decode();
            break;
        case 'card':
            card();
            break;
        default:
            console.log('no command... get')
   }
   
   hdprovider.engine.stop();
}

function get(){
    contractInstance.methods.dapps(1).call(transactionObject).then(
    //contractInstance.methods.prepaidCardManager().call(transactionObject).then(
            (result) => {
        console.log('GET:',result)
        });
}

function decode(){

    var testArray =[123 ,'This function takes in a data, convert it to buffer if not, and a length for recursion']
    
    var encoded = RLP.encode(testArray);
    
    console.log(encoded);
    contractInstanceDAPP.methods.decode(encoded).call(transactionObject).then(
        (result) => {
        console.log('DECODE:',result)
        });
}

function card(){
    
    contractInstancePCM.methods.addCard(2,1,web3.utils.keccak256('my secret key2')).send(transactionObject).then(
        (result) => {
        console.log('DECODE:',result)
        },
        (err) => {
            console.log('ERROR:',err)
        });
}


doStuff();
