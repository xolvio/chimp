const path = require('path');
module.exports = (fileList, projectMainPath) => {
  return fileList.map((graphqlFilePath) => {
    const possibleModuleName = path.basename(graphqlFilePath, '.graphql');
    return {
      name: possibleModuleName,
      graphqlFilePath,
      graphqlFileRootPath: graphqlFilePath.replace(`${projectMainPath}/src/`, '').replace(`${possibleModuleName}.graphql`, '')
    };
  });
};
