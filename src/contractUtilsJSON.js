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
var RLP = require('rlp');

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
    var pathValues = [];
    for (i = 0; i < jsonPathPairs.length; i++) {
        var pathValue = [];
        pathValue.push(jsonPathPairs[i].getPath());;
        pathValue.push(jsonPathPairs[i].getValue());
        pathValue.push(jsonPathPairs[i].getType());
        pathValues.push(pathValue);
    }
    var encodedData = RLP.encode(pathValues);
    await jsonContainerFactoryInstance.methods.createContainer(encodedData, name).send(transactionObject);
}

async function _get(address) {
    var jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    var result = await jsonContainerInstance.methods.getData().call(transactionObject);
    var storedJsonPathPairs = [];
    var i;
    for (i = 0; i < result.length; i++) {
        var jsonPathValue = result[i];
        var type = jsonPathValue[2];
        var value;
        if (jsonPath.TYPE_ARRAY == type) {
            value = JSON.parse(jsonPathValue[1]);
        } else {
            value = jsonPathValue[1];
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
    var changes = [];
    for (i = 0; i < differences.length; i++) {
        var pathValueDiff = [];
        pathValueDiff.push(differences.path);
        if (difference.type == jsonPath.TYPE_STRING) {
            pathValueDiff.push(difference.value);
        } else {
            pathValueDiff.push(JSON.stringify(differences.values));
        }
        pathValueDiff.push(differences.type);
        pathValueDiff.push(differences.diff);
        changes.push(pathValueDiff);
    }
    var encodedDataUpdate = RLP.encode(changes);
    await jsonContainerInstance.methods.update(encodedDataUpdate).send(transactionObject);

    // var additions = { 'paths': [], 'values': [], 'types': [] };
    // var deletions = { 'paths': [] };
    // var modifications = { 'paths': [], 'values': [], 'types': [] };
    // for (i = 0; i < differences.length; i++) {
    //     var difference = differences[i];
    //     var diff = difference.diff;
    //     switch (diff) {
    //         case jsonPath.DIFF_ADDED:
    //             additions.paths.push(difference.path);
    //             if (difference.type == jsonPath.TYPE_STRING) {
    //                 additions.values.push(difference.value);
    //             } else {
    //                 additions.values.push(JSON.stringify(difference.value));
    //             }
    //             additions.types.push(difference.type);
    //             break;
    //         case jsonPath.DIFF_DELETED:
    //             deletions.paths.push(difference.path);
    //             break;
    //         case jsonPath.DIFF_MODIFIED:
    //             modifications.paths.push(difference.path);
    //             if (difference.type == jsonPath.TYPE_STRING) {
    //                 modifications.values.push(difference.value);
    //             } else {
    //                 modifications.values.push(JSON.stringify(difference.value));
    //             }
    //             modifications.types.push(difference.type);
    //             break;
    //     }
    // }
    // if (additions.paths.length > 0) {
    //     var encodedDataAdd = RLP.encode([additions.paths, additions.values, additions.types]);
    //     await jsonContainerInstance.methods.add(encodedDataAdd).send(transactionObject);
    // }
    // if (deletions.paths.length > 0) {
    //     await jsonContainerInstance.methods.del(deletions.paths).send(transactionObject);
    // }
    // if (modifications.paths.length > 0) {
    //     var encodedDataMod = RLP.encode([modifications.paths, modifications.values, modifications.types]);
    //     await jsonContainerInstance.methods.modify(encodedDataMod).send(transactionObject);
    // }
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
