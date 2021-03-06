require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic =process.env.ALASTRIA_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Bloomen.json', 'utf8'));
const GAS = 999999999999999;

const Web3 = require('web3');

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
const _user = process.env.ALASTRIA_USER;
const _password = process.env.ALASTRIA_PASSWORD;
const _auth = 'Basic ' + Buffer.from(_user + ':' + _password).toString('base64');
const _headers = [{name: 'Authorization', value: _auth}];
const _provider = new Web3.providers.HttpProvider(process.env.ALASTRIA_URL, {timeout: 0, headers: _headers });


var hdprovider =new HDWalletProvider(mnemonic, process.env.ALASTRIA_URL); 
hdprovider.engine.stop();
hdprovider.engine._providers[2].provider=_provider
hdprovider.engine.start();

const web3 = new Web3(hdprovider);

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
  };

  const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.ALASTRIA_NETWORKID].address);

function doStuff() {
    switch(process.argv[2]){
        case 'get':
            get();
            break;
        case 'add':
            set(process.argv[3]);
            break;
        default:
            console.log('no command... get|set')
   }
   
   hdprovider.engine.stop();
}

function get(){
    contractInstance.methods.getDapps().call(transactionObject).then(
        (result) => {
        console.log('GET:',result)
        });
}

function set(value){
        console.log("address:",value);
        contractInstance.methods.addDapp(value).send( transactionObject).then(checkTransaction);
}



function checkTransaction(result) {
    setTimeout( function (){
        web3.eth.getTransactionReceipt(result,
            function(status){
                if( GAS== status.gasUsed){
                    //transaction error
                    console.log('KO');
                } else {
                    console.log('OK');
                }
            }
        );
    },4000);   
}


doStuff();
