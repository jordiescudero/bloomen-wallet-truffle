require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var fs = require('fs');
const Web3 = require('web3');

var contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));
var contractERC223 = JSON.parse(fs.readFileSync('./build/contracts/ERC223.json', 'utf8'));

var vendorMnemonic = 'addict boil just alien picture quantum crumble avocado cargo glide laundry pumpkin';
var finalUserMnemonic = 'wing clog sketch scrub type volcano exotic nerve immense resist say youth';

const GAS = 999999999999999;


Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
const _user = process.env.ALASTRIA_USER;
const _password = process.env.ALASTRIA_PASSWORD;
const _auth = 'Basic ' + Buffer.from(_user + ':' + _password).toString('base64');
const _headers = [{name: 'Authorization', value: _auth}];
const _provider = new Web3.providers.HttpProvider(process.env.ALASTRIA_URL, {timeout: 0, headers: _headers });

var ownerHDPprovider =new HDWalletProvider(process.env.ALASTRIA_MNEMONIC, process.env.ALASTRIA_URL);   
ownerHDPprovider.engine.stop();
ownerHDPprovider.engine._providers[2].provider=_provider;
ownerHDPprovider.engine.start();

var vendorHDPprovider =new HDWalletProvider(vendorMnemonic, process.env.ALASTRIA_URL);  
vendorHDPprovider.engine.stop();
vendorHDPprovider.engine._providers[2].provider=_provider;
ownerHDPprovider.engine.start();

var finalUserHDPprovider =new HDWalletProvider(finalUserMnemonic, process.env.ALASTRIA_URL);  
finalUserHDPprovider.engine.stop();
finalUserHDPprovider.engine._providers[2].provider=_provider;
ownerHDPprovider.engine.start();


final(); // si hacemos esto evitamos el blocktracker que no creo que nos sea de utilidad...

const ownerWeb3 = new Web3(ownerHDPprovider);
const vendorWeb3 = new Web3(vendorHDPprovider);
const finalUserWeb3 = new Web3(finalUserHDPprovider);

const ownerContractInstancePCM = new ownerWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.ALASTRIA_NETWORKID].address);
const ownerContractInstanceERC223 = new ownerWeb3.eth.Contract(contractERC223.abi, contractERC223.networks[process.env.ALASTRIA_NETWORKID].address);


const vendorContractInstancePCM = new vendorWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.ALASTRIA_NETWORKID].address);
const finalUserContractInstancePCM = new finalUserWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.ALASTRIA_NETWORKID].address);

console.log('owner:',ownerHDPprovider.getAddress(0));
console.log('vendor:',vendorHDPprovider.getAddress(0));
console.log('final:',finalUserHDPprovider.getAddress(0));

const ownerTransactionObject = {
    from: ownerHDPprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
  };

  const vendorTransactionObject = {
    from: vendorHDPprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
  };

  const finalUserTransactionObject = {
    from: finalUserHDPprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
  };

 


 function addCard(){
    const _cardId=294844777744;
    const _secretKey = 'my secret key2';
    console.log('addCard pre' );
    return ownerContractInstancePCM.methods.addCard(_cardId,100,ownerWeb3.utils.keccak256(_secretKey)).send(ownerTransactionObject);
   

    //ownerContractInstanceERC223.methods.mint(finalUserHDPprovider.getAddress(0),100).send(ownerTransactionObject);
    //console.log('mint');


    //let balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePCM',balancePCM);

    // let isSigner = await ownerContractInstancePCM.methods.isSigner(vendorHDPprovider.getAddress(0)).call();
    // console.log('isSigner',isSigner);
    // if (!isSigner) {
    //     await ownerContractInstancePCM.methods.addSigner(vendorHDPprovider.getAddress(0)).send(ownerTransactionObject);
    //     console.log('addSigner');
    // }
    // await vendorContractInstancePCM.methods.activateCard(_cardId).send(vendorTransactionObject);
    // console.log('activateCard');

    //let card = await ownerContractInstancePCM.methods.getCard(_cardId).call();
    //console.log('getCard',card);
    //let balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePRE',balancePCM);
    // await finalUserContractInstancePCM.methods.validateCard( finalUserWeb3.utils.fromAscii(_secretKey)).send(finalUserTransactionObject);
    // console.log('validateCard');
    //balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePOST',balancePCM);
    //return 'done';
    
}

addCard().then((result)=> {
   // final();
    console.log(result);
    checkTransaction(result);
}, (err)=> {      
  //  final();
    console.log(err);
});

function final() {
    ownerHDPprovider.engine.stop();
    vendorHDPprovider.engine.stop();
    finalUserHDPprovider.engine.stop();
}

function checkTransaction(result) {
    setTimeout( function (){
        ownerWeb3.eth.getTransactionReceipt(result,
            function(status){
                if (!status) {
                    console.log('Next try...');
                    this.checkTransaction(result);              
                }
                else if( GAS > status.gasUsed){
                    //transaction error
                    console.log('OK');
                } else {
                    console.log('KO');
                }
            }
        );
    },1000);   
}




