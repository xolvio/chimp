// @ts-ignore
import finder from 'find-package-json';

export const getChimpVersion = () => {
  const f = finder(__dirname);
  const packageJson = f.next();

  return packageJson.value.version;
};
