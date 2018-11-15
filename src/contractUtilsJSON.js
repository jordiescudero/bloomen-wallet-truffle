require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = bip39.generateMnemonic();

var fs = require('fs');
var jsonPathLibrary = require('json-path-value');
var jsonPath = new jsonPathLibrary.JsonPath();

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

async function doStuff() {
    switch (process.argv[2]) {
        case 'get':
            console.log(JSON.stringify(await get()));
            break;
        // case 'del':
        //     del();
        //     break;
        // case 'mod':
        //     mod();
        //     break;
        case 'store':
            let json = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
            storeJson(json);
            break;
        default:
            console.log('no command ...');
    }

    hdprovider.engine.stop();
}

async function storeJson(json) {
    var result = await contractInstance.methods.getNodes().call(transactionObject);
    if (result.length != 0) {
        console.log("Data already stored.");
    } else {
        var jsonpathPairs = jsonPath.marshall(json, "", []);
        for (i = 0; i < jsonpathPairs.length; i++) {
            const jsonPathPair = jsonpathPairs[i];
            await contractInstance.methods.addPath(jsonPathPair.getPath(), jsonPathPair.getValue(), jsonPathPair.getType()).send(transactionObject);
        }
        console.log("Done.");
    }
}

async function get() {
    var result = await contractInstance.methods.getNodes().call(transactionObject);
    var storedJsonPathPairs = [];
    var i;
    for (i = 0; i < result.length; i++) {
        var jsonPathValue = result[i];
        storedJsonPathPairs.push(new jsonPathLibrary.JsonPathPair(jsonPathValue[0], jsonPathValue[1], jsonPathValue[2], ''));
    }
    return jsonPath.unMarshall(storedJsonPathPairs);
}

async function del() {
    await contractInstance.methods.deletePath("a.b.c.name").send(transactionObject);
    console.log("Done.");
}

async function mod() {
    await contractInstance.methods.modifyPath("a.b.c.author", "Adri").send(transactionObject);
    console.log("Done");
}

doStuff();
