require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var fs = require('fs');
const Web3 = require('web3');

var contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));

var vendorMnemonic = 'addict boil just alien picture quantum crumble avocado cargo glide laundry pumpkin';
var finalUserMnemonic = 'wing clog sketch scrub type volcano exotic nerve immense resist say youth';

var ownerHDPprovider =new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  
var vendorHDPprovider =new HDWalletProvider(vendorMnemonic, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  
var finalUserHDPprovider =new HDWalletProvider(finalUserMnemonic, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  

const ownerWeb3 = new Web3(ownerHDPprovider);
const vendorWeb3 = new Web3(vendorHDPprovider);
const finalUserWeb3 = new Web3(finalUserHDPprovider);

const ownerContractInstancePCM = new ownerWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const vendorContractInstancePCM = new vendorWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const finalUserContractInstancePCM = new finalUserWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);

const ownerTransactionObject = {
    from: ownerHDPprovider.getAddress(0),
    gas: 4000000,
    gasPrice: 0
  };

 


async function addCard(){
    return ownerContractInstancePCM.methods.addCard(2,1,ownerWeb3.utils.keccak256('my secret key2')).send(ownerTransactionObject);
}


addCard().then((result)=> console.log(result));

console.log("stop");
ownerHDPprovider.engine.stop();
vendorHDPprovider.engine.stop();
finalUserHDPprovider.engine.stop();


