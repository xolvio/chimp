import finder from 'find-package-json';

export function findProjectMainPath() {
  const f = finder(process.cwd());
  return f
    .next()
    .filename.split('/')
    .filter((c: string) => c.indexOf('package.json') === -1)
    .join('/');
}
