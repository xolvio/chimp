import getInterfaces from './getInterfaces';

const gql = (a: TemplateStringsArray) => a[0];

test('get the interfaces', () => {
  const schemaString = gql`
    type TodoItem @key(fields: "id") {
      id: ID!
      list: List
    }

    extend type List {
      id: ID!
      todos: [TodoItem!]!
      incompleteCount: Int!
    }

    type InMemory {
      id: ID!
    }

    type Query {
      homes: [Home]
    }
    interface Home {
      address: string
    }
  `;

  const res = getInterfaces(schemaString);

  expect(res).toEqual(['Home']);
});
