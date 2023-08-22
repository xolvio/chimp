import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command, Flags } from '@oclif/core';
import shell from 'shelljs';
import { execQuietly } from '../generate/helpers/execQuietly';
import { findProjectMainPath } from '../generate/helpers/findProjectMainPath';
import { newTask, setupListr } from '../generate/helpers/ListrHelper';
import { assertGitCleanState } from '../init/assert-git-clean-state';

function installingTooling(projectMainPath: string): Promise<void> {
  function determinePackageManager() {
    if (fs.existsSync('./yarn.lock')) {
      return 'yarn';
    }

    if (fs.existsSync('./pnpm-lock.yaml')) {
      return 'pnpm';
    }

    return 'npm';
  }

  function installPackage(packageManager: 'yarn' | 'pnpm' | 'npm', packageName: string) {
    let command;

    switch (packageManager) {
      case 'yarn':
        command = `yarn add --dev ${packageName}`;
        break;
      case 'pnpm':
        command = `pnpm add --save-dev ${packageName}`;
        break;
      case 'npm':
      default:
        command = `npm install --save-dev ${packageName}`;
        break;
    }

    console.log('installing packages');
    return execQuietly(command, { cwd: projectMainPath });
  }

  const packageManager = determinePackageManager();
  return installPackage(packageManager, '@graphql-tools/graphql-file-loader @graphql-tools/load @graphql-tools/merge');
}

function moveCode(projectMainPath: string, chimpMainPath: string) {
  shell.cp(
    path.join(chimpMainPath, 'src/generate/templates/ejectedSchema.ts'),
    path.join(projectMainPath, 'src/schema.ts'),
  );

  // Move genericDataModelSchema.graphql
  shell.mv(
    path.join(projectMainPath, 'generated/graphql/genericDataModelSchema.graphql'),
    path.join(projectMainPath, 'src/genericDataModelSchema.graphql'),
  );

  // Move types.ts
  shell.mv(path.join(projectMainPath, 'generated/graphql/types.ts'), path.join(projectMainPath, 'src/graphqlTypes.ts'));

  for (const resolverFile of shell.ls(path.join(projectMainPath, 'generated/graphql/*Resolvers.ts'))) {
    const fileName = resolverFile.split('/').pop();
    const moduleName = fileName!.replace('Resolvers.ts', '');
    const targetDir = path.join(projectMainPath, `src/modules/${moduleName}/graphql/`);

    shell.mv(resolverFile, targetDir);
  }

  // Move resolvers.ts
  shell.mv(
    path.join(projectMainPath, 'generated/graphql/resolvers.ts'),
    path.join(projectMainPath, 'src/resolvers.ts'),
  );

  // Move schema.ts
  shell.rm(path.join(projectMainPath, 'generated/graphql/schema.ts'));

  // Move helpers
  for (const helperFile of shell.ls(path.join(projectMainPath, 'generated/graphql/helpers/*.ts'))) {
    const fileName = helperFile.split('/').pop()!.replace('SpecWrapper.ts', '');
    const importPath = shell.grep(`import { ${fileName} }`, helperFile).replace(/.*from\s+["']([^"']+)["'].*/, '$1');
    const resolvedPath = importPath.replace('~app/modules', path.join(projectMainPath, 'src/modules'));
    const targetDir = `${resolvedPath.replace(fileName, '').replace('\n', '')}test-helpers`;

    shell.mkdir('-p', targetDir);
    shell.mv(helperFile, `${targetDir}/${fileName}SpecWrapper.ts`);
  }

  // Update imports in resolvers.ts
  shell.sed(
    '-i',
    /import { (.+?)Resolvers } from "\.\/(.+?)Resolvers";/g,
    'import { $1Resolvers } from "~app/modules/$1/graphql/$1Resolvers";',
    path.join(projectMainPath, 'src/resolvers.ts'),
  );

  // Update imports in ./src/ that use path: "~generated/graphql/types"
  shell
    .find(path.join(projectMainPath, 'src/'))
    .filter((file) => file.match(/\.ts$/))
    // eslint-disable-next-line unicorn/no-array-for-each
    .forEach((file) => {
      shell.sed(
        '-i',
        `import { schema } from "~generated/graphql/schema"`,
        `import { schema } from "~app/schema"`,
        file,
      );
      shell.sed(
        '-i',
        `import { resolvers } from "~generated/graphql/resolvers"`,
        `import { resolvers } from "~app/resolvers"`,
        file,
      );
      shell.sed('-i', `import { Resolvers } from "./types";`, `import { Resolvers } from "~app/graphqlTypes";`, file);
      shell.sed('-i', '~generated/graphql/helpers/', './test-helpers/', file);
      shell.sed('-i', /~generated\/graphql\/types/g, '~app/graphqlTypes', file);
    });
}

export default class Eject extends Command {
  static description = 'eject from chimp';

  static examples = ['$ chimp eject'];

  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    await this.parse(Eject);

    assertGitCleanState();
    const chimpMainPath = path.join(__dirname, '../../');
    const projectMainPath = findProjectMainPath();

    const tasks = setupListr([
      newTask('Moving code', async () => moveCode(projectMainPath, chimpMainPath)),
      newTask('Installing GraphQL schema tooling', async () => installingTooling(projectMainPath)),
    ]);

    try {
      await tasks.run();
    } catch (error) {
      console.error(error);
    }
  }
}
