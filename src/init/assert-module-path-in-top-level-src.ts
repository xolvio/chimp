import path from 'node:path';

export function assertModulePathInTopLevelSrc(projectMainPath: string, modulePath: string) {
  if (path.join(projectMainPath, modulePath).indexOf(path.join(projectMainPath, './src')) !== 0) {
    throw new Error(
      'Sorry! Chimp currently only works if your source code lives under ./src folder. We are happy to take a PR that changes that if you absolutely need so, but we think src is such a common pattern it makes little sense to make the code more complex "just in case"',
    );
  }
}
