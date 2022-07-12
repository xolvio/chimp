import validateUniqueName from './validateUniqueName';

test('should throw error if duplicate entry found', () => {
  const names = ['apple', 'banana', 'orange', 'banana'];
  expect(() =>
    validateUniqueName(names, (name: any) => {
      throw new Error(`duplicate record found: ${name}`);
    }),
  ).toThrow('duplicate record found: banana');
});

test('should not throw error if no duplicate entry found', () => {
  const names = ['apple', 'banana', 'orange'];
  expect(() =>
    validateUniqueName(names, () => {
      throw new Error('duplicate record found');
    }),
  ).not.toThrow();
});
