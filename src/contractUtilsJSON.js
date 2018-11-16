require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = bip39.generateMnemonic();

var fs = require('fs');
var jsonPathLibrary = require('json-path-value');
var jsonPath = new jsonPathLibrary.JsonPath();

var jsonContainerFactoryJSON = JSON.parse(fs.readFileSync('./build/contracts/JsonContainerFactory.json', 'utf8'));
var jsonContainerAbi = JSON.parse(fs.readFileSync('./build/contracts/JsonContainer.json', 'utf8')).abi; 
const GAS = 5000000;

const Web3 = require('web3');

var hdprovider = new HDWalletProvider(mnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);

const web3 = new Web3(hdprovider);

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};

const jsonContainerFactoryInstance = new web3.eth.Contract(jsonContainerFactoryJSON.abi, jsonContainerFactoryJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

async function doStuff() {
    switch (process.argv[2]) {
        case 'containers':
            console.log(await getContainers());
            break;
        case 'new-container':
            let json = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
            createContainer(json, process.argv[4]);
            break;
        case 'get-data':
            console.log(JSON.stringify(jsonPath.unMarshall(await get(process.argv[3]))));
            break;
        case 'update':
            updateContainer(JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), process.argv[4]);
            break;
        default:
            console.log('no command ...');
    }

    hdprovider.engine.stop();
}

async function getContainers() {
    return await jsonContainerFactoryInstance.methods.getContainers().call(transactionObject);
}

async function createContainer(json, name) {
    console.log(name);
    var jsonPathPairs = jsonPath.marshall(json, "", []);
    var paths = [];
    var values = [];
    var types = [];
    for (i = 0; i < jsonPathPairs.length; i++) {
        paths.push(jsonPathPairs[i].getPath());;
        values.push(jsonPathPairs[i].getValue());
        types.push(jsonPathPairs[i].getType());
    }
    await jsonContainerFactoryInstance.methods.createContainer(paths, values, types, name).send(transactionObject);
    console.log("Done.");
}

async function get(address) {
    var jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    var result = await jsonContainerInstance.methods.getNodes().call(transactionObject);
    var storedJsonPathPairs = [];
    var i;
    for (i = 0; i < result.length; i++) {
        var jsonPathValue = result[i];
        storedJsonPathPairs.push(new jsonPathLibrary.JsonPathPair(jsonPathValue[0], jsonPathValue[1], jsonPathValue[2], ''));
    }
    return storedJsonPathPairs;
}

async function updateContainer(json, address) {
    var jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    var unmarshalledStorage = jsonPath.unMarshall(await get(address));
    var differences = jsonPath.compareJsonPath(unmarshalledStorage, json);
    var i;
    var additions = {'paths' : [], 'values' : [], 'types' : []};
    var deletions = {'paths' : []};
    var modifications = {'paths' : [], 'values' : [], 'types' : []};
    for (i = 0; i < differences.length; i++) {
        var difference = differences[i];
        var diff = difference.diff;
        switch (diff) {
            case 'Modified':
                modifications.paths.push(difference.path);
                modifications.values.push(JSON.stringify(difference.value));
                modifications.types.push(difference.type);
                break;
        }
    }
    if (additions.paths.length > 0) {
        console.log("Adding ...");
        await jsonContainerInstance.methods.add(modifications.paths, modifications.values, modifications.types).send(transactionObject);
    }
    if (deletions.paths.length > 0) {
        console.log("Deleting ...");
        await jsonContainerInstance.methods.del(modifications.paths).send(transactionObject);
    }
    if (modifications.paths.length > 0) {
        console.log("Modifying ...");
        await jsonContainerInstance.methods.modify(modifications.paths, modifications.values, modifications.types).send(transactionObject);
    }
    console.log("Done.");
}

async function storeJson(json) {
    var result = await jsonContainerFactoryInstance.methods.getNodes().call(transactionObject);
    if (result.length != 0) {
        console.log("Data already stored.");
    } else {
        var jsonPathPairs = jsonPath.marshall(json, "", []);
        for (i = 0; i < jsonPathPairs.length; i++) {
            const jsonPathPair = jsonPathPairs[i];
            await jsonContainerFactoryInstance.methods.addPath(jsonPathPair.getPath(), jsonPathPair.getValue(), jsonPathPair.getType()).send(transactionObject);
        }
        console.log("Done.");
    }
}

async function del() {
    await jsonContainerFactoryInstance.methods.deletePath("a.b.c.name").send(transactionObject);
    console.log("Done.");
}

async function mod() {
    await jsonContainerFactoryInstance.methods.modifyPath("a.b.c.author", "Adri").send(transactionObject);
    console.log("Done");
}

doStuff();
