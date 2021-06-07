import gql from 'graphql-tag';
import { ScalarTypeDefinitionNode } from 'graphql/language/ast';

export default (graphqlString: string): string[] => {
  const graphqlAST = gql`
    ${graphqlString}
  `;

  return (graphqlAST.definitions.filter((d) => d.kind === 'ScalarTypeDefinition') as ScalarTypeDefinitionNode[])
    .filter((d) => {
      const isPredefined = Boolean(
        d.directives?.find((directive) => {
          return directive.name.value === 'predefined';
        }),
      );
      return !isPredefined;
    })
    .map((f) => f.name.value)
    .filter((s) => s !== 'Upload');
};
