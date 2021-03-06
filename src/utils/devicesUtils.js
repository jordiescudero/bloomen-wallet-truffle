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

console.log('addr:' + hdprovider.getAddress(0));

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

function get(){ 
    
    contractInstance.methods
    //.isAllowed(web3.utils.keccak256('este es el hash'))
    //.isOwner(web3.utils.keccak256('xxxOOOO'),20,1)
    //.toRemove(web3.utils.keccak256('xxxOOOO'))
    //.isDuplicated(web3.utils.keccak256('xxxOOOO'))
    //.sameOwner(web3.utils.keccak256('xxxOOOO'))
    //.isAllowed(web3.utils.keccak256('xxxOOOO2'))
    
    //.getExpirationDate(web3.utils.keccak256('xxxOOOO6'))
    //.getNow()
    //.getDevicesPageCount()
    .getDevices(1)
    .call(transactionObject).then(
        (result) => {
            console.log('GET:',result)
        });

        
}

function add(){
    //handshake(bytes32 _deviceHash, uint256 _assetId, uint256 _schemaId, uint256 _lifeTime, string _dappId)
    
    let n =  Date.now() ;
    console.log('date:',n); 
    n = n / 1000;
    n += 60; //one day 
    n = Math.trunc(n);
    console.log('date:',n);    
    contractInstance.methods.handshake(web3.utils.keccak256('xxxOOOO7'),20,1,n,"dummy dapp").send(transactionObject)
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
