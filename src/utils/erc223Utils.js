require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");
const RLP = require('rlp');

var mnemonic =process.env.ALASTRIA_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));
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
            add();
            break;
        default:
            console.log('no command... get|add')
   }
   
   hdprovider.engine.stop();
}

async function get(){

    await contractInstance.methods.balanceOf('0xc33ddf117d4dbe85a76600a1a79873380cfba2ad').call(transactionObject).then(
        (result) => {
            console.log('ME:',result)
        });

    await contractInstance.methods.balanceOf('0xc3d47824ddbd528fca680bc56ffdf7036b3e60fb').call(transactionObject).then(
        (result) => {
            console.log('Distributor:',result)
        });
    await contractInstance.methods.balanceOf('0xae474b24632289fa7844b351f8d1e045b2461d35').call(transactionObject).then(
        (result) => {
            console.log('Service:',result)
        }); 
    await contractInstance.methods.balanceOf('0x933892ae13417ca965ceb29b40d52e10e0f21bb7').call(transactionObject).then(
        (result) => {
            console.log('TAX:',result)
        });   
        
        
}

function add(){
  
    contractInstance.methods.mint("0xc33ddf117d4dbe85a76600a1a79873380cfba2ad",1000).send(transactionObject)
    .then((tx) => {
        console.log('Transaction sent.',tx.transactionHash);
        return checkTransaction(tx.transactionHash);
    },(err)=> console.log(err));
}

function checkTransaction(tx) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            web3.eth.getTransactionReceipt(tx,
                function (err, status) {
                    if (err) {
                        console.log('KO');
                        reject(err);
                    } else if (!status) {
                        console.log('Checking transaction ...');
                        checkTransaction(tx);
                    }
                    else if (GAS == status.gasUsed) {
                        //transaction error
                        console.log('Error','Out of gas.');
                        resolve();
                    } else {
                        console.log('Transaction mined.');
                        resolve();
                    }
                }
            );
        }, 1000);
    });
}


doStuff();
