const getScalars = require('./getScalars');
const gql = (a) => a[0];

test('get the non extended types with apollo key annotation', () => {
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

    scalar MyOwn
  `;

  const res = getScalars(schemaString);

  expect(res).toEqual(['MyOwn']);
});
