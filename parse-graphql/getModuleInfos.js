const fs = require('fs');
const parseGraphql = require('./parseGraphql');
module.exports = (graphqlInfos) => {
  return graphqlInfos.map((graphqlInfo) => {
    const schemaString = fs.readFileSync(graphqlInfo.graphqlFilePath, 'utf8');
    const parsedGraphql = parseGraphql(schemaString);
    return {
      ...graphqlInfo,
      ...parsedGraphql,
      types: parsedGraphql.typeDefinitions.length > 0,
      schemaString,
    };
  });
};
