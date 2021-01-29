module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/.yalc/', 'scaffold/', 'generate/templates/', 'test-module/', '/lib'],
};
