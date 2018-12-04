#!/usr/bin/env node
require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');
const Web3 = require('web3');
const figlet = require('figlet');
const inquirer = require('inquirer');
const program = require('commander');
const qrcode = require('qrcode-terminal');
const prettyJson = require('prettyjson');
const version = require('../package.json').version;

const contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));

const finalUserMnemonic = 'wing clog sketch scrub type volcano exotic nerve immense resist say youth';

const ownerHDPprovider = new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);
const finalUserHDPprovider = new HDWalletProvider(finalUserMnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);

final(); // si hacemos esto evitamos el blocktracker que no creo que nos sea de utilidad...

const ownerWeb3 = new Web3(ownerHDPprovider);
const finalUserWeb3 = new Web3(finalUserHDPprovider);

const ownerContractInstancePCM = new ownerWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const finalUserContractInstancePCM = new finalUserWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);

const cardOwnerAddress = ownerHDPprovider.getAddress(0);
const cardUserAddress = finalUserHDPprovider.getAddress(0);

const jsonPrintOptions = {
    noColor: false
};

const GAS = 4000000;

const ownerTransactionObject = {
    from: cardOwnerAddress,
    gas: GAS,
    gasPrice: 0
};

const finalUserTransactionObject = {
    from: cardUserAddress,
    gas: GAS,
    gasPrice: 0
};

program
    .version(version, '-v --version');

program.on('--help', function () {
    console.log('  Empty command triggers the menu.')
});

async function producerMenu() {
    let options = [
        { name: 'Create a prepaid card', value: cardCreation },
        { name: 'Activate a prepaid card', value: cardActivation },
        { name: 'See prepaid card information', value: cardInfo },
        { name: 'Purge prepaid cards', value: cardDeletionMenu },
        { name: 'Check balance', value: checkOwnerBalance }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select an operation:', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

async function cardCreation() {
    let questions = [
        { type: 'input', name: 'secret', message: 'Specify the secret key:' },
        { type: 'input', name: 'amount', message: 'Amount of tokens:' }
    ];
    console.log('Create a prepaid card');
    let answer = await inquirer.prompt(questions);
    let randomId = getRandomId();
    await ownerContractInstancePCM.methods.addCard(randomId, answer.amount, ownerWeb3.utils.keccak256(answer.secret)).send(ownerTransactionObject)
        .then((tx) => {
            console.log('Transaction sent.');
            return checkTransaction(tx.transactionHash);
        });
    let secrets = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    secrets.cards.push({ id: randomId, secret: answer.secret, active: false });
    fs.writeFileSync('./data/secrets.json', JSON.stringify(secrets), 'utf8');
    console.log('Done.');
}

async function cardActivation() {
    let cards = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    let cardIds = [];
    cards.cards.forEach(card => {
        if (!card.active) {
            cardIds.push(card.id.toString());
        }
    });
    if (cardIds.length == 0) {
        console.log('There are no inactive prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds }
    ];
    console.log('Activate prepaid card');
    let answer = await inquirer.prompt(questions);
    await ownerContractInstancePCM.methods.activateCard(answer.id).send(ownerTransactionObject)
        .then((tx) => {
            console.log('Transaction sent.');
            return checkTransaction(tx.transactionHash);
        });
    cards.cards.forEach(card => {
        if (card.id == answer.id) {
            card.active = true;
        }
    });
    fs.writeFileSync('./data/secrets.json', JSON.stringify(cards), 'utf8');
    console.log('Done.');
}

async function cardInfo() {
    let cards = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    let cardIds = [];
    cards.cards.forEach(card => {
        cardIds.push(card.id.toString());
    });
    if (cardIds.length == 0) {
        console.log('There are no prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds }
    ];
    console.log('See prepaid card information');
    let answer = await inquirer.prompt(questions);
    let cardInfo = await ownerContractInstancePCM.methods.getCard(answer.id).call(ownerTransactionObject);
    let card = { cardId: cardInfo.cardId, owner: cardInfo.owner, tokens: cardInfo.tokens, active: cardInfo.active };
    console.log(prettyJson.render(card, jsonPrintOptions));
}

async function cardDeletionMenu() {
    let options = [
        { name: 'Delete active cards', value: deleteActives },
        { name: 'Delete all cards', value: deleteAll }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select a delete operation:', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

function deleteActives() {
    let cards = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    for (i = 0; i < cards.cards.length; i++) {
        if (cards.cards[i].active) {
            cards.cards.splice(i, 1);
        }
    }
    fs.writeFileSync('./data/secrets.json', JSON.stringify(cards), 'utf8');
    console.log('Done.');
}

function deleteAll() {
    cards = { cards: [] };
    fs.writeFileSync('./data/secrets.json', JSON.stringify(cards), 'utf8');
    console.log('Done.');
}

function getRandomId() {
    return Math.floor(Math.random() * (Math.pow(2, 50) - 1)) + 1;
}

async function checkOwnerBalance() {
    let balance = await ownerContractInstancePCM.methods.balanceOf(contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address).call(ownerTransactionObject);
    console.log(balance + ' tokens.');
}

async function userMenu() {
    let options = [
        { name: 'Get prepaid card QR', value: getCardQr },
        { name: 'Check balance', value: checkUserBalance }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select an operation:', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

async function getCardQr() {
    let cards = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    let cardIds = [];
    cards.cards.forEach(card => {
        if (card.active) {
            cardIds.push(card.id.toString());
        }
    });
    if (cardIds.length == 0) {
        console.log('There are no active prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds }
    ];
    console.log('Get prepaid card QR');
    let answer = await inquirer.prompt(questions);
    let secret;
    cards.cards.forEach(card => {
        if (card.id == answer.id) {
            secret = card.secret;
        }
    });
    await qrcode.generate(secret);
}

async function checkUserBalance() {
    let balance = await finalUserContractInstancePCM.methods.balanceOf(cardUserAddress).call(finalUserTransactionObject);
    console.log(balance + ' tokens.');
}

async function mainMenu() {
    let menuOptions = [
        { name: "Producer", value: producerMenu },
        { name: "User", value: userMenu },
        { name: "Exit", value: 0 }
    ];
    let questions = [
        { type: "list", name: "menu", message: "Select your profile:", choices: menuOptions }
    ];
    let answer = await inquirer.prompt(questions);
    if (answer.menu == 0) {
        return;
    } else {
        await answer.menu();
        mainMenu();
    }
}

function final() {
    ownerHDPprovider.engine.stop();
    finalUserHDPprovider.engine.stop();
}

function checkTransaction(tx) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            ownerWeb3.eth.getTransactionReceipt(tx,
                function (err, status) {
                    if (err) {
                        console.log('KO');
                        reject(err);
                    }else if (!status) {
                        console.log('Checking transaction ...');
                        checkTransaction(tx);
                    }
                    else if (GAS == status.gasUsed) {
                        //transaction error
                        console.log('Out of gas.');
                        reject();
                    } else {
                        console.log('Transaction mined.');
                        resolve();
                    }
                }
            );
        }, 1000);
    });
}

figlet.text('Prepaid Cards System', {
    font: 'Big'
}, async function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
    program.parse(process.argv);
    if (program.args.length == 0) {
        mainMenu();
    }
});
