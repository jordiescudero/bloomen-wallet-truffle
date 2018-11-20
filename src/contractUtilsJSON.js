require('dotenv').config();
var bip39 = require('bip39');

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = bip39.generateMnemonic();

const fs = require('fs');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();

const jsonContainerFactoryJSON = JSON.parse(fs.readFileSync('./build/contracts/JsonContainerFactory.json', 'utf8'));
const jsonContainerAbi = JSON.parse(fs.readFileSync('./build/contracts/JsonContainer.json', 'utf8')).abi;
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

async function _getContainers() {
    var data = await jsonContainerFactoryInstance.methods.getContainers().call(transactionObject);
    return data;
}

async function _createContainer(json, name) {
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
}

async function _get(address) {
    var jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    var result = await jsonContainerInstance.methods.getNodes().call(transactionObject);
    var storedJsonPathPairs = [];
    var i;
    for (i = 0; i < result.length; i++) {
        var jsonPathValue = result[i];
        var type = jsonPathValue[2];
        var value = jsonPathValue[1];
        if ('Array' == type) {
            value = JSON.parse(jsonPathValue[1]);
        }
        storedJsonPathPairs.push(new jsonPathLibrary.JsonPathPair(jsonPathValue[0], value, type, ''));
    }
    return storedJsonPathPairs;
}

async function _updateContainer(json, address) {
    var jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    var unmarshalledStorage = jsonPath.unMarshall(await _get(address));
    var differences = jsonPath.compareJsonPath(unmarshalledStorage, json);
    var i;
    var additions = { 'paths': [], 'values': [], 'types': [] };
    var deletions = { 'paths': [] };
    var modifications = { 'paths': [], 'values': [], 'types': [] };
    for (i = 0; i < differences.length; i++) {
        var difference = differences[i];
        var diff = difference.diff;
        switch (diff) {
            case jsonPath.DIFF_ADDED:
                additions.paths.push(difference.path);
                if (difference.type == jsonPath.TYPE_STRING) {
                    additions.values.push(difference.value);
                } else {
                    additions.values.push(JSON.stringify(difference.value));
                }
                additions.types.push(difference.type);
                break;
            case jsonPath.DIFF_DELETED:
                deletions.paths.push(difference.path);
                break;
            case jsonPath.DIFF_MODIFIED:
                modifications.paths.push(difference.path);
                if (difference.type == jsonPath.TYPE_STRING) {
                    modifications.values.push(difference.value);
                } else {
                    modifications.values.push(JSON.stringify(difference.value));
                }
                modifications.types.push(difference.type);
                break;
        }
    }
    if (additions.paths.length > 0) {
        console.log("Adding ...");
        console.log(additions);
        await jsonContainerInstance.methods.add(additions.paths, additions.values, additions.types).send(transactionObject);
    }
    if (deletions.paths.length > 0) {
        console.log("Deleting ...");
        console.log(deletions);
        await jsonContainerInstance.methods.del(deletions.paths).send(transactionObject);
    }
    if (modifications.paths.length > 0) {
        console.log("Modifying ...");
        console.log(modifications);
        await jsonContainerInstance.methods.modify(modifications.paths, modifications.values, modifications.types).send(transactionObject);
    }
}

module.exports = (function () {
    hdprovider.engine.stop();
    return {
        getContainers: _getContainers,
        get: _get,
        createContainer: _createContainer,
        updateContainer: _updateContainer
    }
});
