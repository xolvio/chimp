import gql from 'graphql-tag';
import validateUniqueName from './validateUniqueName';

export default (graphqlString: string) => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  const interfacesTypeDefs = graphqlAST.definitions
    .filter((d) => ['InterfaceTypeDefinition'].includes(d.kind))
    // @ts-ignore
    .map((f) => f.name.value);

  validateUniqueName(interfacesTypeDefs, (name: string) => {
    throw new Error(`Duplicate interface name found: ${name}`);
  });

  return interfacesTypeDefs;
};
