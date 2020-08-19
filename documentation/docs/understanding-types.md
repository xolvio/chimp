---
id: understanding-types
title: Understanding Types
---

Mapping that happens in the `codegen.js` file allows us to expect that a Query/Mutation returning a given type returns all fields that are based on the intrinsic data of that object. Fields marked as `computed` will need their own resolvers.

To demonstrate this with an example, let's take the type User from [Quick Start](quickstart.md)

```graphql
type User {
  id: ID!
  name: String!
  dateOfBirth: String!
  underage: Boolean @computed
}
```

Fields that come straight from a Data Source have no annotations. In our example those are `name`, `dataOfBirth` and `id`

On the other hand - we don't save the information whether someone is or is not underage - we calculate it runtime (`@computed` annotation). That means that the resolver for Query like this:

```graphql
type Query {
  UserById(id: ID!): User!
}
```

will only expect an object with `id`, `name` and `dateOfBirth` as it's return type. To speak in code:

```typescript
// Correct, sufficient
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
    dateOfBirth: '1597154923818',
  };
};

// Incorrect, TypeScript will error:
//  Property 'dateOfBirth' is missing in type '{ name: string; }' but required in type 'UserDbObject'.
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
  };
};

// Technically correct, but will be overrulled by the underageResolver
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
    dateOfBirth: '1597154923818',
    underage: true,
  };
};
```

Generator will also generate a resolver for User.underage to return a boolean based on the current date and the users dateOfBirth.

> If you are following along from the Quick Start make sure you've modified your User type definition and run `npm run graphl:generateAll`. At that point you will notice src/modules/Users/graphql/types/UserUnderage.ts file with a test scaffold next to it. As a practice go ahead and implement it, starting with test!

Example implementation that delegates the actual calculation to an external function:

```typescript
export const UserUnderage: UserResolvers['underage'] = (user) => {
  return isUnderage(user.dateOfBirth, new Date());
};
```

This might seem like a rarely used feature at first, but it works the same way when you want to link different types (which itself is one of the main reasons to use GraphQL in the first place).

```graphql
type User {
  # ...
  friends: [User!]! @computed
}
```

Resolver:

```typescript
export const UserFriends: UserResolvers['friends'] = (user, args, context) => {
  return context.friendsService.fetchFriendsFor(user.id);
};
```

Spec:

```typescript
test('UserFriends gets the friends for a user based on a user ID', async () => {
  const context = td.object<GqlContext>();

  const USER = {
    id: 'userID',
  };

  const returnedUsers = [];
  td.when(context.friendsService.fetchFriendsFor(USER.id)).thenResolve(returnedUsers);

  const parent: ResolversParentTypes['User'] = {
    ...USER,
    name: '',
    dateOfBirth: '',
  };

  const result = await testUserFriends(parent, context);

  expect(result).toEqual(returnedUsers);
});
```

## More complex mapping

> note: The API might seem familiar to you. It's because our graphql-code-generator plugin was initially based on the typescript-mongodb plugin.

#### `@map(path: String)` (on `FIELD_DEFINITION`)

If you have a field in your data object that you want to expose differently in GraphQL use `@map`

For example, if your data source returns an object with a nested shape:

```json
{
  "credentials": { "username": "some username" }
}
```

But want to expose it as a top level field in your GraphQL User type do:

```graphql
type User {
  username: String @map(path: "credentials.username")
}
```

#### `@link` (on `FIELD_DEFINITION`)

If your data source returns an object that includes a field linking to a separate entity, for example:

```json
{
  "name": "Uncle Bob",
  "bookIds": ["2"]
}
```

You can map it like so:

```
type Author {
  name: String!
  books: [Book!]! @link @map(path: "bookIds")
}
```

In this case @link will tell the generator that your data source will not return an array of Books, but instead it will return an array of ids (it looks up Book.id field).
@map on the other hand, tells the generator that the book ids are not at "books" key but at "bookIds"
We end up with:

```typescript
export type LibraryDbObject = {
  id: string;
  branch: string;
};

type BookDbObject = {
  id: string;
  title: string;
  libraryId: LibraryDbObject['id'];
};

type AuthorDbObject = {
  name: string;
  bookIds: Array<BookDbObject['id']>;
};
```
