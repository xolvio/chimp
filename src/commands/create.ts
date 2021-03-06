import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import shelljs from 'shelljs';
import { Command, flags } from '@oclif/command';
import { getChimpVersion } from '../helpers/get-chimp-version';

function updatePrefixes(appDirectory: string, appPrefix: string, generatedPrefix: string) {
  if (appPrefix || generatedPrefix) {
    shelljs.ls('-R', appDirectory).forEach((file: string) => {
      if (shelljs.test('-f', `${appDirectory}/${file}`)) {
        if (appPrefix) {
          shelljs.sed('-i', '~app', appPrefix, `${appDirectory}/${file}`);
        }
        if (generatedPrefix) {
          shelljs.sed('-i', '~generated', generatedPrefix, `${appDirectory}/${file}`);
        }
      }
    });
    let gqlGenerateCustomPrefixString = '';
    if (appPrefix !== '~app') {
      gqlGenerateCustomPrefixString += ` -a '${appPrefix}'`;
    }
    if (generatedPrefix !== '~generated') {
      gqlGenerateCustomPrefixString += ` -p '${generatedPrefix}'`;
    }
    shelljs.sed(
      '-i',
      'chimp generate',
      `chimp generate${gqlGenerateCustomPrefixString}`,
      `${appDirectory}/package.json`,
    );
    const currentChimpVersion = getChimpVersion();
    shelljs.sed('-i', '"chimp": "latest"', `"chimp": "${currentChimpVersion}"`, `${appDirectory}/package.json`);
  }
}

const create = (appDirectory: string, appPrefix: string, generatedPrefix: string) => {
  const scaffoldDir = `${process.cwd()}/${appDirectory}`;

  if (fs.existsSync(scaffoldDir)) {
    console.log(`Path: ${scaffoldDir} already exists. Can't create a new app in an already existing path.`);
    process.exit(1);
  }
  shelljs.cp('-R', path.join(__dirname, '../../scaffold'), `${scaffoldDir}`);
  shelljs.exec(`cd ${appDirectory} && git init .`);
  shelljs.mv(`${appDirectory}/gitignore`, `${appDirectory}/.gitignore`);

  updatePrefixes(appDirectory, appPrefix, generatedPrefix);

  console.log(`\n${appDirectory} created successfully!`);
  console.log(`run:
   cd ${appDirectory}
   npm install`);
  console.log('and start hacking! :-)');
};

export default class Create extends Command {
  static description = 'create (scaffold) a new app';

  static examples = ['$ chimp create my-new-app', '$ chimp create my-new-app -a ~src -g ~chimp-helpers'];

  static flags = {
    help: flags.help({ char: 'h' }),
    appPrefix: flags.string({
      char: 'a',
      description: 'prefix that points to the sourcecode of your app',
      default: '~app',
    }),
    generatedPrefix: flags.string({
      char: 'g',
      description: 'prefix that points to the generated by chimp helper code',
      default: '~generated',
    }),
  };

  static args = [{ name: 'name', description: 'name of the new app, also used as the directory' }];

  async run() {
    const { args, flags } = this.parse(Create);
    create(args.name, flags.appPrefix, flags.generatedPrefix);
  }
}
