import * as fs from 'node:fs';
import parseGraphql from './parse-graphql';
import getModuleNames from './getModuleNames';

export default (graphqlInfos: ReturnType<typeof getModuleNames>) => {
  return graphqlInfos.map((graphqlInfo) => {
    const schemaString = fs.readFileSync(graphqlInfo.graphqlFilePath, 'utf8');
    const parsedGraphql = parseGraphql(schemaString);
    return {
      ...graphqlInfo,
      ...parsedGraphql,
      types: parsedGraphql.typeDefinitions.length > 0,
      schemaString: `${schemaString}
      scalar Upload
      `,
    };
  });
};
