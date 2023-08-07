import td from 'testdouble';

import testdoubleJest from 'testdouble-jest';
import type * as fsTypes from 'node:fs';

testdoubleJest(td, jest);

const fs = td.replace('node:fs') as typeof fsTypes;

td.when(fs.readFileSync('/src/modules/Accounts/graphql/Accounts.graphql', 'utf8')).thenReturn(`type Query {
    me: User
  }`);

// eslint-disable-next-line node/no-missing-require
const getModuleInfos = require('./get-module-infos').default;
const exampleNames = [{ name: 'Accounts', graphqlFilePath: '/src/modules/Accounts/graphql/Accounts.graphql' }];

test('', () => {
  const parsed = getModuleInfos(exampleNames)[0];
  expect(parsed.name).toEqual('Accounts');
  expect(parsed.queries).toMatchObject([{ name: 'me' }]);
  expect(parsed.types).toEqual(false);
});
