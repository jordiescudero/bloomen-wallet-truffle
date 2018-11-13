require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = bip39.generateMnemonic();

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/SmJson.json', 'utf8'));
const GAS = 500000;

const Web3 = require('web3');

var hdprovider = new HDWalletProvider(mnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);

const web3 = new Web3(hdprovider);

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};

const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

function doStuff() {
    switch (process.argv[2]) {
        case 'get':
            get();
            break;
        case 'set':
            set();
            break;
        case 'del':
            del();
            break;
        case 'mod':
            mod();
            break;
        default:
            console.log('no command ...')
    }

    hdprovider.engine.stop();
}

async function set() {
    await contractInstance.methods.addPathData("a.b.c.@type", "Asset").send(transactionObject);
    await contractInstance.methods.addPathData("a.b.c.name", "My new Song").send(transactionObject);
    await contractInstance.methods.addPathData("a.b.c.author", "My new Song").send(transactionObject);
    await contractInstance.methods.addPathData("a.b.c.lyrics", "Nulla facilisi. Nullam risus dui, egestas sit amet consectetur quis, suscipit vitae sapien.").send(transactionObject);
    console.log("Done.");
}

function get() {
    contractInstance.methods.getNodes().call(transactionObject).then(
        (result) => {
            console.log('GET:', result);
        });
}

async function del() {
    await contractInstance.methods.deletePath("a.b.c.name").send(transactionObject);
    console.log("Done.");
}

async function mod() {
    await contractInstance.methods.modify("a.b.c.author", "Adri").send(transactionObject);
    console.log("Done");
}

doStuff();
