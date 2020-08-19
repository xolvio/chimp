#!/usr/bin/env node
const fs = require('fs');

const program = require('commander');
const shelljs = require('shelljs');

program
  .command('gql:create <app-directory>')
  .description('Create a new app - pass a name that will also be used as the apps directory')
  .action(function (appDirectory) {
    const scaffoldDir = `${process.cwd()}/${appDirectory}`;

    if (fs.existsSync(scaffoldDir)) {
      console.log(`Path: ${scaffoldDir} already exists. Can't create a new app in an already existing path.`);
      process.exit(1);
    }
    shelljs.cp('-R', `${__dirname}/scaffold`, `${scaffoldDir}`);
    shelljs.exec(`cd ${appDirectory} && git init .`);
    console.log(`\n${appDirectory} created successfully!`);
    console.log(`run:
   cd ${appDirectory}
   npm install`);
    console.log('and start hacking! :-)');
  });

program
  .command('gql:generate')
  .description('Generate Mutations, Queries, Type Resolvers and the scaffolding based on your graphql files')
  .action(function () {
    require('./generateModule');
  });

program.parse(process.argv);
