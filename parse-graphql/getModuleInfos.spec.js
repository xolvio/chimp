const td = require('testdouble');
require('testdouble-jest')(td, jest);
const fs = td.replace('fs');
td.when(fs.readFileSync('/src/modules/Accounts/graphql/Accounts.graphql', 'utf8')).thenReturn(`type Query {
    me: User
  }`);

const getModuleInfos = require('./getModuleInfos');
const exampleNames = [{ name: 'Accounts', graphqlFilePath: '/src/modules/Accounts/graphql/Accounts.graphql' }];

test('', () => {
  const parsed = getModuleInfos(exampleNames)[0];
  expect(parsed.name).toEqual('Accounts');
  expect(parsed.queries).toMatchObject([{ name: 'me' }]);
  expect(parsed.types).toEqual(false);
});
