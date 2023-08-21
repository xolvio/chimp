/* eslint-disable @typescript-eslint/no-use-before-define */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ListrContext, ListrRendererFactory, ListrTaskWrapper } from 'listr2';
import { Command, Flags } from '@oclif/core';
import configDebug from 'debug';
import { findProjectMainPath } from '../generate/helpers/findProjectMainPath';
import { newTask, setupListr } from '../generate/helpers/ListrHelper';
import { assertModulePathInTopLevelSrc } from '../init/assert-module-path-in-top-level-src';
import { assertGitCleanState } from '../init/assert-git-clean-state';
import { getChimpVersion } from '../helpers/get-chimp-version';
const DEFAULT_MODULES_PATH = './src/modules';

const debug = configDebug('commands:init');
const readJsonFile = async (path: string) => {
  if (!fs.existsSync(path)) {
    throw new Error(`Can't find ${path} for your project.`);
  }

  const fileContent = await fs.promises.readFile(path, { encoding: 'utf-8' });
  return JSON.parse(fileContent);
};

const addProjectDependencies = async (projectMainPath: string, modulesPath: string) => {
  function addChimp() {
    let chimpCommand = 'chimp generate';
    // if (path.join(projectMainPath, DEFAULT_MODULES_PATH) !== path.join(projectMainPath, modulesPath)) {
    chimpCommand = `${chimpCommand} -p ${modulesPath}`;
    // }
    packageJsonFile.scripts.chimp = chimpCommand;
    packageJsonFile.devDependencies.chimp = getChimpVersion();
  }

  function addDevDependenciesWithMatchingVersions(packages: string[]) {
    addDependencies(packages, 'devDependencies');
  }

  function addDependenciesWithMatchingVersions(packages: string[]) {
    addDependencies(packages, 'dependencies');
  }

  function addDependencies(packages: string[], type: string) {
    for (const packageName of packages) {
      if (!packageJsonFile[type][packageName]) {
        packageJsonFile[type][packageName] = scaffoldPackageJsonFile[type][packageName];
      }
    }
  }

  debug('reading package.json');
  const packageJsonPath = path.join(projectMainPath, 'package.json');
  const packageJsonFile = await readJsonFile(packageJsonPath);
  debug('reading scaffold package.json');
  const scaffoldPackageJsonFile = await readJsonFile(path.join(__dirname, '../../scaffold/package.json'));
  if (!packageJsonFile.scripts) {
    packageJsonFile.scripts = {};
  }

  if (!packageJsonFile.devDependencies) {
    packageJsonFile.devDependencies = {};
  }

  debug('adding chimp');
  addChimp();

  packageJsonFile.devDependencies.prettier = scaffoldPackageJsonFile.devDependencies.prettier;
  packageJsonFile.devDependencies.jest = scaffoldPackageJsonFile.devDependencies.jest;

  debug('adding dev dependencies');
  // TODO figure out remaining dependencies
  addDevDependenciesWithMatchingVersions([
    '@graphql-codegen/add',
    '@graphql-codegen/cli',
    '@graphql-codegen/typescript',
    '@graphql-codegen/typescript-mongodb',
    '@graphql-codegen/typescript-operations',
    '@graphql-codegen/typescript-resolvers',
    '@graphql-tools/graphql-file-loader',
    '@graphql-tools/load',
    '@graphql-tools/merge',
    '@types/jest',
    'chimp-graphql-codegen-plugin',
    'jest',
    'prettier',
    'shelljs',
    'typescript',
    'ts-jest',
    'testdouble',
    'testdouble-jest',
  ]);
  debug('adding dependencies');
  // TODO shelljs? ?
  addDependenciesWithMatchingVersions(['@apollo/federation', 'lodash', 'graphql-tag', 'tsconfig-paths']);

  packageJsonFile.dependencies.graphql = scaffoldPackageJsonFile.dependencies.graphql;

  debug('saving package.json changes');
  await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJsonFile, null, 2));
  // TODO prettify the file
};

const createExampleCode = async (task: ListrTaskWrapper<ListrContext, ListrRendererFactory>, targetDir: string) => {
  if (fs.existsSync(targetDir)) {
    const exampleDir = './src/chimp-modules';
    let newDir = await task.prompt({
      type: 'Input',
      message: `${targetDir} already exists. Please enter new module name [${exampleDir}]:`,
    });
    if (newDir === '') {
      newDir = exampleDir;
    }

    await createExampleCode(task, newDir);
  } else {
    const exampleModulePath = `${targetDir}/RemoveMe/graphql/`;
    await fs.promises.mkdir(exampleModulePath, { recursive: true });
    await fs.promises.copyFile(
      path.join(__dirname, '../../scaffold/src/modules/removeMe/graphql/RemoveMe.graphql'),
      path.join(exampleModulePath, 'RemoveMe.graphql'),
    );
  }
};

async function configureTsconfig(projectMainPath: string) {
  const tsconfigJsonPath = path.join(projectMainPath, 'tsconfig.json');
  let tsconfig;
  if (fs.existsSync(tsconfigJsonPath)) {
    tsconfig = await readJsonFile(tsconfigJsonPath);
    // TODO make the prefixes configurable here as well (based on the create) ? low priority. That would also require chanigng the way we generate the chimp script in add ProjectDependencies

    const chimpPaths = {
      '~app/*': ['./src/*'],
      '~generated/*': ['./generated/*'],
    };
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths
      ? { ...tsconfig.compilerOptions.paths, ...chimpPaths }
      : { ...chimpPaths };

    if (!tsconfig.compilerOptions.baseUrl) {
      tsconfig.compilerOptions.baseUrl = './';
    }
  } else {
    tsconfig = await readJsonFile(path.join(__dirname, '../../scaffold/tsconfig.json'));
  }

  await fs.promises.writeFile(tsconfigJsonPath, JSON.stringify(tsconfig, null, 2));
}

async function configureJest(projectMainPath: string, task: ListrTaskWrapper<ListrContext, ListrRendererFactory>) {
  const jestConfigPath = path.join(projectMainPath, 'jest.config.js');

  if (fs.existsSync(jestConfigPath)) {
    task.output =
      "Sorry! We can't adjust existing jest.config.js automatically yet, please take a look at https://github.com/xolvio/chimp#updating-jestconfigjs-after-chimp-init to see how to do so manually";
  } else {
    await fs.promises.copyFile(path.join(__dirname, '../../scaffold/jest.config.js'), jestConfigPath);
    await fs.promises.copyFile(
      path.join(__dirname, '../../scaffold/jest.setup.js'),
      path.join(projectMainPath, 'jest.setup.js'),
    );
  }
}

async function addContext(projectMainPath: string) {
  const contextPath = path.join(projectMainPath, 'src/context.ts');
  const contextCode = `export type GqlContext = {}`;
  if (fs.existsSync(contextPath)) {
    let contextContent = await fs.promises.readFile(contextPath, { encoding: 'utf-8' });
    contextContent = `${contextContent}
    ${contextCode}`;
    await fs.promises.writeFile(contextPath, contextContent);
  } else {
    await fs.promises.writeFile(contextPath, contextCode);
  }
}

export default class Init extends Command {
  static description = 'init Chimp';

  static examples = ['$ chimp init', '$ chimp init -p ./src/chimp-modules'];

  static flags = {
    help: Flags.help({ char: 'h' }),
    modulesPath: Flags.string({
      char: 'p',
      description: 'path to the GraphQL modules.',
      default: DEFAULT_MODULES_PATH,
    }),
  };

  async run() {
    assertGitCleanState();

    const {
      flags: { modulesPath },
    } = await this.parse(Init);
    const projectMainPath = findProjectMainPath();

    assertModulePathInTopLevelSrc(projectMainPath, modulesPath);
    const tasks = setupListr([
      newTask('Creating example code', (task) => createExampleCode(task, path.join(projectMainPath, modulesPath))),
      newTask('Add project dependencies', () => addProjectDependencies(projectMainPath, modulesPath)),
      newTask('Configure tsconfig.json', () => configureTsconfig(projectMainPath)),
      newTask('Configure jest', (task) => configureJest(projectMainPath, task)),
      newTask('Add empty GraphQL context file', () => addContext(projectMainPath)),
      // newTask('Install packages', async () => addContext(projectMainPath)),
    ]);

    // eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    await tasks.run().catch(() => {
      debug('Init failed');
    });
  }
}
