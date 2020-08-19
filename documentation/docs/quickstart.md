---
id: quickstart
title: Quick Start
sidebar_label: Quick Start
---

In Another section we will show you how you can add Chimp to an existing Apollo App, in this one we will focus on the essentials. This will allow you to get a feel of what is this generator all about.

To bootstrap your app with the necessary tooling run:

```bash
npx chimp gql:create generated-app
cd generated-app
```

This is the folder structure you will see:

```
├── README.md
├── codegen.js
├── fix-generated.js
├── jest.config.js
├── jest.setup.js
├── nodemon.run.json
├── package.json
├── tsconfig.json
└── src
   ├── context.ts
   ├── createApp.ts
   ├── dataSources.ts
   ├── index.ts
   ├── root.ts
   └── modules
      └── RemoveMe
          └── graphql
              ├── RemoveMe.graphql
              └── queries
                  ├── HelloQuery.spec.ts
                  └── HelloQuery.ts
  

```

You can find detailed explanation of everything in this structure [here.](structure.md)

Note: We leave the structure to you, you can put all your .graphql files at your src/ and that will work too. Nonetheless, we suggest that your schema files comply to a structure similar to proposed `./src/modules/MODULE_NAME/graphql/MODULE_NAME.graphql`. That allows you to cleanly separate non-graphql responsibilities inside modules, for example:

```

└── Module
    ├── graphql
    │   ├── Module.graphql
    │   ├── mutations
    │   │   ├── Mutation.spec.ts
    │   │   └── Mutation.ts
    │   └── queries
    │       ├── Query.spec.ts
    │       └── Query.ts
    ├── repository
    │   ├── ModuleRepository.spec.ts
    │   └── ModuleRepository.ts
    ├── factories
    │   └── SomeFactory.ts
    └── services
        ├── ModuleService.ts
        └── ModuleService.spec.ts
```

Let's assume we've created a new module named Users:

```bash
mkdir -p src/modules/Users/graphql
```

Now create a simple schema file for it `src/modules/Users/graphql/Users.graphql`:

```graphql
type User {
  id: ID!
  name: String!
  dateOfBirth: Int!
}

extend type Query {
  UserById(id: ID!): User!
}
```

> Please note, we `extend` Queries and Mutations, as those are defined somewhere else - that helps IDEs to understand that we don't have conflicting types defined in our project

Let's run the generation now:

```bash
npm run graphql:generateAll
```

That command will create Mutations/Queries/Type resolvers, tests for them, types and perform all the necessary connection between the main schema, contexts, etc.  
Remember to run it anytime you modify one of your GraphQL files.
It might be helpful to start with a clean git state before running the generation - that way you can easily see what's the actual result of the generation.

> In our case, if you want to follow through, that means running something like `git add -A && git commit -m "Initial commit"`

stage the files and take a look at what changed:

```bash
git add src/modules/Users/ && git status
```

You should see something like this:

```bash
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   src/modules/Users/graphql/Users.graphql
        new file:   src/modules/Users/graphql/mutations/UserAddMutation.spec.ts
        new file:   src/modules/Users/graphql/mutations/UserAddMutation.ts
        new file:   src/modules/Users/graphql/queries/UserByIdQuery.spec.ts
        new file:   src/modules/Users/graphql/queries/UserByIdQuery.ts
```

going from the top, the Users.graphql file is the one created and changed by us, no surprises there.
Then we get a scaffold for a test for your Mutation, and the Mutation itself.
Same for the test for a Query and the Query itself.

Notice that there are no changes related to the app boilercode here. Chimp takes care of those automatically. That means the commit diffs are smaller so you don't have to worry about the constant dread of conflicts that typical to GraphQL layer development.

Let's go to the spec file and fill the 'UserById' with a dummy specification:

```typescript
// (..)
test('UserById', async () => {
  const context = td.object<GqlContext>();

  const variables: QueryUserByIdArgs = { id: 'myId' };

  const result = await testUserById(variables, context);

  expect(result).toEqual({ id: 'myId', name: 'not myId', dateOfBirth: '1597154923818' });
});
```

The test is failing so let's make it pass.

Change

```typescript
export const UserByIdQuery: QueryResolvers['UserById'] = (_, args) => {
  throw new Error('Not implemented yet');
};
```

into

```typescript
export const UserByIdQuery: QueryResolvers['UserById'] = (_, args) => {
  return { id: args.id, name: `not ${args.id}`, dateOfBirth: '1597154923818' };
};
```

> Please forgive the simplification of passing the timestamp as a string - dealing with Dates is outside of Chimp scope. Use your favorite GraphQL Date pattern.

If you are not running the server yet, do it now:
`npm start`

Go to the GraphQL Playground (in our case [http://localhost:4000/graphql](http://localhost:4000/graphql)

and run a query:

```graphql
query {
  UserById(id: "myId") {
    id
    name
    dateOfBirth
  }
}
```

You should see the result:

```json
{
  "data": {
    "UserById": {
      "id": "myId",
      "name": "not myId",
      "dateOfBirth": "1597154923818"
    }
  }
}
```

Going forward you don't have to (and probably shouldn't - to save time) check all the queries and mutations manually - that's what the tests are for! But it's great to see how little work you have to do to add another operation to your App - and with tests too!

## Next steps

We showed you a simplified use of the generator. You will probably want to have some fields computed by field resolvers. You will probably also want to link different Types together. Read on in [Understanding Types](understanding-types.md) to understand how our generator helps you do those things.
