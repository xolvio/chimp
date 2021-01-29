import getModuleNames from './getModuleNames';

const exampleList = [
  '/home/User/app/src/modules/Accounts/graphql/Accounts.graphql',
  '/home/User/app/src/modules/Inventory/graphql/Inventory.graphql',
  '/home/User/app/src/Abc.graphql',
];

const projectMainPath = '/home/User/app';
test('', () => {
  expect(getModuleNames(exampleList, projectMainPath)).toEqual([
    {
      name: 'Accounts',
      graphqlFilePath: '/home/User/app/src/modules/Accounts/graphql/Accounts.graphql',
      graphqlFileRootPath: 'modules/Accounts/graphql/',
    },
    {
      name: 'Inventory',
      graphqlFilePath: '/home/User/app/src/modules/Inventory/graphql/Inventory.graphql',
      graphqlFileRootPath: 'modules/Inventory/graphql/',
    },
    {
      name: 'Abc',
      graphqlFilePath: '/home/User/app/src/Abc.graphql',
      graphqlFileRootPath: '',
    },
  ]);
});
