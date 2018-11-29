require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');
const Web3 = require('web3');
const figlet = require('figlet');
const inquirer = require('inquirer');
const qrcode = require('qrcode-terminal');
const prettyJson = require('prettyjson');

const contractPCM = JSON.parse(fs.readFileSync('./build/contracts/PrepaidCardManager.json', 'utf8'));
const contractERC223 = JSON.parse(fs.readFileSync('./build/contracts/ERC223.json', 'utf8'));

const vendorMnemonic = 'addict boil just alien picture quantum crumble avocado cargo glide laundry pumpkin';
const finalUserMnemonic = 'wing clog sketch scrub type volcano exotic nerve immense resist say youth';

const ownerHDPprovider = new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);
const vendorHDPprovider = new HDWalletProvider(vendorMnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);
const finalUserHDPprovider = new HDWalletProvider(finalUserMnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);

final(); // si hacemos esto evitamos el blocktracker que no creo que nos sea de utilidad...

const ownerWeb3 = new Web3(ownerHDPprovider);
const vendorWeb3 = new Web3(vendorHDPprovider);
const finalUserWeb3 = new Web3(finalUserHDPprovider);

const ownerContractInstancePCM = new ownerWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const ownerContractInstanceERC223 = new ownerWeb3.eth.Contract(contractERC223.abi, contractERC223.networks[process.env.DEVELOPMENT_NETWORKID].address);


const vendorContractInstancePCM = new vendorWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);
const finalUserContractInstancePCM = new finalUserWeb3.eth.Contract(contractPCM.abi, contractPCM.networks[process.env.DEVELOPMENT_NETWORKID].address);

const cardOwnerAddress = ownerHDPprovider.getAddress(0);
const cardVendorAddress = vendorHDPprovider.getAddress(0);
const cardUserAddress = finalUserHDPprovider.getAddress(0);

const jsonPrintOptions = {
    noColor: false
};

const ownerTransactionObject = {
    from: cardOwnerAddress,
    gas: 4000000,
    gasPrice: 0
};

const vendorTransactionObject = {
    from: cardVendorAddress,
    gas: 4000000,
    gasPrice: 0
};

const finalUserTransactionObject = {
    from: cardUserAddress,
    gas: 4000000,
    gasPrice: 0
};

async function producerMenu() {
    let options = [
        { name: 'Create a prepaid card', value: cardCreation },
        { name: 'Assign vendor to a prepaid card', value: addVendor },
        { name: 'See prepaid card information', value: cardInfo }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select an operation', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

async function cardCreation() {
    let questions = [
        { type: 'input', name: 'id', message: 'Give an identificator:' },
        { type: 'input', name: 'secret', message: 'Specify the secret key:' },
        { type: 'input', name: 'amount', message: 'Amount of tokens:' }
    ];
    console.log('Create a prepaid card');
    let answer = await inquirer.prompt(questions);
    await ownerContractInstancePCM.methods.addCard(answer.id, answer.amount, ownerWeb3.utils.keccak256(answer.secret)).send(ownerTransactionObject);
    let secrets = JSON.parse(fs.readFileSync('./data/secrets.json', 'utf8'));
    secrets.cards.push({ id: answer.id, secret: answer.secret });
    fs.writeFileSync('./data/secrets.json', JSON.stringify(secrets), 'utf8');
    console.log('Done.');
}

async function addVendor() {
    let cardIds = await ownerContractInstancePCM.methods.getCardIds().call(ownerTransactionObject);
    if (cardIds.length == 0) {
        console.log('There are no prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds },
        { type: 'input', name: 'vendor', message: 'Specify vendor address:' }
    ];
    console.log('Assign vendor to a prepaid card');
    let answer = await inquirer.prompt(questions);
    let isSigner = await ownerContractInstancePCM.methods.isSigner(vendorHDPprovider.getAddress(0)).call();
    if (!isSigner) {
        await ownerContractInstancePCM.methods.addSigner(vendorHDPprovider.getAddress(0)).send(ownerTransactionObject);
        console.log('Done.');
    } else {
        console.log('Already vendor.');
    }
}

async function cardInfo() {
    let cardIds = await ownerContractInstancePCM.methods.getCardIds().call(ownerTransactionObject);
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

async function vendorMenu() {
    let options = [
        { name: 'Activate prepaid card', value: cardActivation }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select an operation', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

async function cardActivation() {
    let cardIds = await ownerContractInstancePCM.methods.getCardIds().call(ownerTransactionObject);
    if (cardIds.length == 0) {
        console.log('There are no prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds }
    ];
    console.log('Activate prepaid card');
    let answer = await inquirer.prompt(questions);
    await vendorContractInstancePCM.methods.activateCard(answer.id).send(vendorTransactionObject);
    console.log('Done.');
}

async function userMenu() {
    let options = [
        { name: 'Get prepaid card QR', value: getCardQr },
        { name: 'Redeem card code', value: redeem }
    ];
    let questions = [
        { type: 'list', name: 'operation', message: 'Select an operation', choices: options }
    ];
    let answer = await inquirer.prompt(questions);
    await answer.operation();
}

async function getCardQr() {
    let cardIds = await ownerContractInstancePCM.methods.getCardIds().call(ownerTransactionObject);
    if (cardIds.length == 0) {
        console.log('There are no prepaid cards.');
        return;
    }
    let questions = [
        { type: 'list', name: 'id', message: 'Select a prepaid card:', choices: cardIds }
    ];
    console.log('Get prepaid card QR');
    let answer = await inquirer.prompt(questions);
    qrcode.generate(answer.id, function (str) {
        console.log(str);
    });
}

async function redeem() {
    let questions = [
        { type: 'input', name: 'secret', message: 'Redemption code:' }
    ];
    console.log('Redeem card code');
    let answer = await inquirer.prompt(questions);
    await finalUserContractInstancePCM.methods.validateCard(finalUserWeb3.utils.fromAscii(answer.secret)).send(finalUserTransactionObject);
    console.log('Done.');
}

async function addCard() {
    const _cardId = 2948;
    const _secretKey = 'my secret key2';
    await ownerContractInstancePCM.methods.addCard(_cardId, 100, ownerWeb3.utils.keccak256(_secretKey)).send(ownerTransactionObject);
    console.log('addCard');

    //ownerContractInstanceERC223.methods.mint(finalUserHDPprovider.getAddress(0),100).send(ownerTransactionObject);
    //console.log('mint');


    //let balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePCM',balancePCM);

    let isSigner = await ownerContractInstancePCM.methods.isSigner(vendorHDPprovider.getAddress(0)).call();
    console.log('isSigner', isSigner);
    if (!isSigner) {
        await ownerContractInstancePCM.methods.addSigner(vendorHDPprovider.getAddress(0)).send(ownerTransactionObject);
        console.log('addSigner');
    }
    await vendorContractInstancePCM.methods.activateCard(_cardId).send(vendorTransactionObject);
    console.log('activateCard');

    //let card = await ownerContractInstancePCM.methods.getCard(_cardId).call();
    //console.log('getCard',card);
    //let balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePRE',balancePCM);
    await finalUserContractInstancePCM.methods.validateCard(finalUserWeb3.utils.fromAscii(_secretKey)).send(finalUserTransactionObject);
    console.log('validateCard');
    //balancePCM = await ownerContractInstanceERC223.methods.balanceOf(finalUserHDPprovider.getAddress(0)).call();
    //console.log('balancePOST',balancePCM);
    return 'done';

}

async function mainMenu() {
    let menuOptions = [
        { name: "Producer", value: producerMenu },
        { name: "Vendor", value: vendorMenu },
        { name: "User", value: userMenu },
        { name: "Exit", value: 0}
    ];
    let questions = [
        { type: "list", name: "menu", message: "Select your profile", choices: menuOptions }
    ];
    let answer = await inquirer.prompt(questions);
    if (answer.menu == 0) {
        return;
    } else {
        await answer.menu();
        mainMenu();
    }
}

// addCard().then((result)=> {
//     final();
//     console.log(result);
// }, (err)=> {      
//     final();
//     console.log(err);
// });

function final() {
    ownerHDPprovider.engine.stop();
    vendorHDPprovider.engine.stop();
    finalUserHDPprovider.engine.stop();
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
    // program.parse(process.argv);
    // if (program.args.length == 0) {
    mainMenu();
    // }
});
