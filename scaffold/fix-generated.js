const shell = require("shelljs");

shell.sed(
  "-i",
  /\| StitchingResolver<TResult, TParent, TContext, TArgs>;/,
  "",
  "./generated/graphql/types.ts"
);

shell.sed(
  "-i",
  /(import { ReadStream } from "fs-capacitor";)/,
  '// @ts-ignore\n$1',
  "./generated/graphql/types.ts"
);
