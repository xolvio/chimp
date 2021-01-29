import { assertModulePathInTopLevelSrc } from './assert-module-path-in-top-level-src';

test('assertModulePathInTopLevelSrc', () => {
  expect(() => assertModulePathInTopLevelSrc('/path/to/app', './src')).not.toThrow();
  expect(() => assertModulePathInTopLevelSrc('/path/to/app', 'src')).not.toThrow();
  expect(() => assertModulePathInTopLevelSrc('/path/to/app', './deeper/src')).toThrow();
});
