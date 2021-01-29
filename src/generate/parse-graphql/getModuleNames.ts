const path = require('path');
export default (fileList: string[], projectMainPath: string) => {
  return fileList.map((graphqlFilePath) => {
    const possibleModuleName = path.basename(graphqlFilePath, '.graphql') as string;
    return {
      name: possibleModuleName,
      graphqlFilePath,
      graphqlFileRootPath: graphqlFilePath
        .replace(`${projectMainPath}/src/`, '')
        .replace(`${possibleModuleName}.graphql`, ''),
    };
  });
};
