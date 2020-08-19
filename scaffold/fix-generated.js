const shell = require("shelljs");

shell.sed(
  "-i",
  /\| StitchingResolver<TResult, TParent, TContext, TArgs>;/,
  "",
  "./generated/graphql/types.ts"
);
