const path = require("path")
const shell = require("shelljs");

shell.sed(
  "-i",
  /\| StitchingResolver<TResult, TParent, TContext, TArgs>;/,
  "",
  path.join(process.cwd(), "./generated/graphql/types.ts")
);
