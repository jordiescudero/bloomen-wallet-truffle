require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var fs = require('fs');
const Web3 = require('web3');

const GAS = 999999999999999;

var contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));
var contractERC223 = JSON.parse(fs.readFileSync('./build/contracts/ERC223.json', 'utf8'));

var vendorMnemonic = 'addict boil just alien picture quantum crumble avocado cargo glide laundry pumpkin';
var finalUserMnemonic = 'wing clog sketch scrub type volcano exotic nerve immense resist say youth';

var ownerHDPprovider =new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  
var vendorHDPprovider =new HDWalletProvider(vendorMnemonic, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  
var finalUserHDPprovider =new HDWalletProvider(finalUserMnemonic, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);  

final(); // si hacemos esto evitamos el blocktracker que no creo que nos sea de utilidad...

const ownerWeb3 = new Web3(ownerHDPprovider);
const vendorWeb3 = new Web3(vendorHDPprovider);
const finalUserWeb3 = new Web3(finalUserHDPprovider);

const ownerContractInstancePCM = new ownerWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const ownerContractInstanceERC223 = new ownerWeb3.eth.Contract(contractERC223.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);


const vendorContractInstancePCM = new vendorWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const finalUserContractInstancePCM = new finalUserWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);

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


async function addCard(_cardId, _secretKey){
    // const _cardId=294819;
    // const _secretKey = 'my secret key2';
    await ownerContractInstancePCM.methods.addCard(_cardId,100,ownerWeb3.utils.keccak256(_secretKey)).send(ownerTransactionObject)
     .then((tx)=>{
        //console.log(tx);
        return checkTransaction(tx.transactionHash);
     });
    console.log('addCard');

    // // ownerContractInstanceERC223.methods.mint(finalUserHDPprovider.getAddress(0),100).send(ownerTransactionObject) 
    // // .then((tx)=>{
    // //         console.log(tx);
    // //         checkTransaction(tx.transactionHash);
    // //      });
    // // console.log('mint');


    // let balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    // console.log('balancePCM',balancePCM);

    // let isSigner = await ownerContractInstancePCM.methods.isSigner(vendorHDPprovider.getAddress(0)).call();
    // console.log('isSigner',isSigner);
    // if (!isSigner) {
    //     ownerContractInstancePCM.methods.addSigner(vendorHDPprovider.getAddress(0)).send(ownerTransactionObject).then((tx)=>{
    //         console.log(tx);
    //         checkTransaction(tx.transactionHash);
    //      });;
    //     console.log('addSigner');
    // }

    await ownerContractInstancePCM.methods.activateCard(_cardId).send(ownerTransactionObject).then((tx)=>{
        //console.log(tx);
        return checkTransaction(tx.transactionHash);
     });
    console.log('activateCard');

    // // let card = await ownerContractInstancePCM.methods.getCard(_cardId).call();
    // // console.log('getCard',card);
    let balanceuser = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    console.log('balancePRE',balanceuser);

    await finalUserContractInstancePCM.methods.validateCard( finalUserWeb3.utils.fromAscii(_secretKey)).send(finalUserTransactionObject).then((tx)=>{
        return  checkTransaction(tx.transactionHash);
     });


    balanceuser = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    console.log('balancePOST',balanceuser);
    // return 'done';
    
}

addCard(100,'koko100').then( 
    ()=> addCard(20,'koko20')
).then( 
    ()=> addCard(30,'koko30')
).then( 
    ()=> addCard(40,'koko40')
).then( 
    ()=> addCard(50,'koko50')
).then( 
    ()=> addCard(60,'koko60')
).then( 
    ()=> addCard(70,'koko70')
).then( 
    ()=> addCard(80,'koko80')
).then( 
    ()=> addCard(90,'koko90')
).then((result)=> {
    final();
    console.log(result);
}, (err)=> {      
    final();
    console.log(err);
});

function final() {
    ownerHDPprovider.engine.stop();
    vendorHDPprovider.engine.stop();
    finalUserHDPprovider.engine.stop();
}

function checkTransaction(tx) {

    return new Promise( (resolve,reject) => {
        setTimeout(() => {
            ownerWeb3.eth.getTransactionReceipt(tx,
                function(err,status){
                    if (!status) {
                        console.log('Next try...');
                        checkTransaction(tx);              
                    }
                    else if( GAS == status.gasUsed ){
                        //transaction error
                        console.log('KO');
                        reject();
                    } else {
                        console.log('OK');
                        resolve();
                    }
                }
            );
        },1000); 

    });
      
}




