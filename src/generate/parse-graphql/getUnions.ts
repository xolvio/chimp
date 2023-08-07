import gql from 'graphql-tag';
import validateUniqueName from './validateUniqueName';

export default (graphqlString: string) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  const unionTypeDefinitions = graphqlAST.definitions
    .filter((d) => ['UnionTypeDefinition'].includes(d.kind))
    // @ts-ignore
    .map((f) => f.name.value);

  validateUniqueName(unionTypeDefinitions, (name: string) => {
    throw new Error(`Duplicate union name found: ${name}`);
  });
  return unionTypeDefinitions;
};
