#!/usr/bin/env node
const fs = require('fs');

const program = require('commander');
const shelljs = require('shelljs');
const path = require('path');
const findProjectMainPath = require('../helpers/findProjectMainPath');
const execQuietly = require('../helpers/execQuietly');

function updatePrefixes(appDirectory, appPrefix, generatedPrefix) {
  if (appPrefix || generatedPrefix) {
    shelljs.ls('-R', appDirectory).forEach((file) => {
      if (shelljs.test('-f', `${appDirectory}/${file}`)) {
        if (appPrefix) {
          shelljs.sed('-i', '@app', appPrefix, `${appDirectory}/${file}`);
        }
        if (generatedPrefix) {
          shelljs.sed('-i', '@generated', generatedPrefix, `${appDirectory}/${file}`);
        }
      }
    });
    let gqlGenerateCustomPrefixString = '';
    if (appPrefix) {
      gqlGenerateCustomPrefixString += ` '${appPrefix}'`;
    }
    if (generatedPrefix) {
      gqlGenerateCustomPrefixString += ` '${generatedPrefix}'`;
    }
    shelljs.sed(
      '-i',
      'chimp gql:generate',
      `chimp gql:generate${gqlGenerateCustomPrefixString}`,
      `${appDirectory}/package.json`,
    );
  }
}

program
  .command('gql:create <app-directory> [app-prefix] [generated-prefix]')
  .description(
    `Create a new app - pass a name that will also be used as the apps directory.
  By default we use @app to point to your src/ and @generated to point to your generated/ folders. In some cases you might want to change those defaults, run the app like so: chimp gql:create name '~newapp' '~newgenerated'`,
  )
  .action((appDirectory, appPrefix, generatedPrefix) => {
    const scaffoldDir = `${process.cwd()}/${appDirectory}`;

    if (fs.existsSync(scaffoldDir)) {
      console.log(`Path: ${scaffoldDir} already exists. Can't create a new app in an already existing path.`);
      process.exit(1);
    }
    shelljs.cp('-R', path.join(__dirname, '../scaffold'), `${scaffoldDir}`);
    shelljs.exec(`cd ${appDirectory} && git init .`);
    shelljs.mv(`${appDirectory}/gitignore`, `${appDirectory}/.gitignore`);

    updatePrefixes(appDirectory, appPrefix, generatedPrefix);

    console.log(`\n${appDirectory} created successfully!`);
    console.log(`run:
   cd ${appDirectory}
   npm install`);
    console.log('and start hacking! :-)');
  });

const runTypeGen = (projectMainPath) => {
  const customCodegenConfig = path.join(projectMainPath, './codegen.js');
  let codegenConfigPath;
  if (fs.existsSync(customCodegenConfig)) {
    codegenConfigPath = customCodegenConfig;
  } else {
    codegenConfigPath = path.join(__dirname, '../runtime-config-helpers/codegen.js');
  }
  execQuietly(`graphql-codegen --config ${codegenConfigPath}`, { cwd: projectMainPath });
};

const fixGenerated = (projectMainPath) => {
  const customFixGenerated = path.join(projectMainPath, 'fix-generated.js');
  let fixGeneratedPath;
  if (fs.existsSync(customFixGenerated)) {
    fixGeneratedPath = customFixGenerated;
  } else {
    fixGeneratedPath = path.join(__dirname, '../runtime-config-helpers/fix-generated.js');
  }
  execQuietly(`node ${fixGeneratedPath}`, { cwd: projectMainPath });
};

const prettifyGenerated = (projectMainPath, modulesPath = 'src') => {
  execQuietly(`npx prettier --write "${modulesPath}/**/*.ts" "generated/**/*.ts" --loglevel error`, {
    cwd: projectMainPath,
  });
};

program
  .command('gql:generate [app-prefix] [generated-prefix] [modules-path]')
  .description(
    `Generate Mutations, Queries, Type Resolvers and the scaffolding based on your graphql files
  By default we use @app to point to your src/ and @generated to point to your generated/ folders. In some cases you might want to change those defaults, run the generator like so: chimp gql:generate '~newapp' '~newgenerated'

  For migrating an existing app to chimp you can use the modules-path option to point to where it should look for .graphql files. It will ignore everything else.`,
  )
  .action((appPrefix, generatedPrefix, modulesPath) => {
    require('../generateModule')(appPrefix, generatedPrefix, modulesPath);

    const projectMainPath = findProjectMainPath();

    runTypeGen(projectMainPath);
    fixGenerated(projectMainPath);
    prettifyGenerated(projectMainPath, modulesPath);
  });

program.parse(process.argv);
