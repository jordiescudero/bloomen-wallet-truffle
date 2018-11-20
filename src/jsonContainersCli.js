#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const utils = require('./contractUtilsJSON');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();

program
    .command('new-container')
    .alias('nc')
    .description('Create a new JSON container.')

    .action(async function () {
        const files = fs.readdirSync('./src/json/');
        questions = [
            { type: 'input', name: 'name', message: 'Give a name' },
            { type: 'list', name: 'file', message: 'Choose a file', choices: files }
        ];
        console.log('Create a new JSON container.');
        var answer = await inquirer.prompt(questions);
        let json = JSON.parse(fs.readFileSync('./src/json/' + answer.file, 'utf8'));
        await utils().createContainer(json, answer.name);
        console.log(answer.name + ' container crated.');
    });

program
    .command('get-data')
    .alias('gd')
    .description('Get data from a JSON container.')

    .action(async function () {
        var containers = await utils().getContainers();
        var containersMetadata = [];
        var i;
        for (i = 0; i < containers.length; i++) {
            containersMetadata.push({ name: containers[i].name, value: containers[i].add });
        }
        var questions = [
            { type: 'list', name: 'container', message: 'Choose a container', choices: containersMetadata }
        ];
        console.log('Get data from a container');
        var answer = await inquirer.prompt(questions);
        console.log(JSON.stringify(jsonPath.unMarshall(await utils().get(answer.container))));
    });

program
    .command('update')
    .alias('u')
    .description('Update data of a JSON container')

    .action(async function () {
        var containers = await utils().getContainers();
        var containersMetadata = [];
        var i;
        for (i = 0; i < containers.length; i++) {
            containersMetadata.push({ name: containers[i].name, value: containers[i].add });
        }
        const files = fs.readdirSync('./src/json/');
        var questions = [
            { type: 'list', name: 'container', message: 'Choose a container', choices: containersMetadata },
            { type: 'list', name: 'file', message: 'Choose a file', choices: files }
        ];
        console.log('Update data of a JSON container');
        var answer = await inquirer.prompt(questions);
        let json = JSON.parse(fs.readFileSync('./src/json/' + answer.file, 'utf8'));
        await utils().updateContainer(json, answer.container);
        console.log('Container updated.');
    });

figlet.text('JSON warehouse', {
    font: 'slant'
}, function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
    program.parse(process.argv);
    if (program.args.length == 0) {
        program.help();
    }
});