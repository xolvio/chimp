const path = require('path');
const shell = require('shelljs');

shell.sed(
  '-i',
  /\| StitchingResolver<TResult, TParent, TContext, TArgs>;/,
  '',
  path.join(process.cwd(), './generated/graphql/types.ts'),
);

shell.sed(
  '-i',
  /(import { ReadStream } from "fs-capacitor";)/,
  '// @ts-ignore\n$1',
  path.join(process.cwd(), './generated/graphql/types.ts'),
);
