---
id: structure
title: Structure Explained
---

A fresh project will consist of a following structure (* are optional):

```
├── README.md
├── fix-generated.js *
├── jest.config.js
├── jest.setup.js *
├── nodemon.run.json *
├── package.json
├── tsconfig.json
└── src
    ├── context.ts
    ├── createApp.ts
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

It's advisable to initialize an app to look into specific files while reading this page, but you can also look here [github.com/xolvio/chimp-gql-tiny-example](https://github.com/xolvio/chimp-gql-tiny-example): 

## Top Level /

### Readme.md

Readme.md is a generic readme explaining basic operations and usage of the repo. You will probably want to extend it according to your project.

### codegen.js

codegen.js is a configuration used by Chimp to generate TypeScript definitions used by the project. Additionally, it provides Entity and Federation related directives to the generator.

It also maps all the types to their respective data based types.
This is crucial to understanding the assumptions that the generator uses to generate code and limit boilercode.
Read more here - [Understanding Types](understanding-types.md)

### fix-generated.js

If you want to manually tweak the generated types, this will allow you to do so.
Please let us know why would you need to do so, most probably this is something we can automate in Chimp.

### jest.config.js

Standard Jest Configuration for the TypeScript Project. Additionally, we use `pathsToModuleNameMapper` to resolve the `@app/` and `@generated/` absolute paths

### jest.setup.js

Runtime Jest setup - by default we configure testdouble here, feel free to add your own configuration.

### nodemon.run.json

Standard Nodemon configuration. Feel free to adjust to your liking.

### package.json

Enough said.

### tsconfig.json

Standard TypeScript configuration - feel free to adjust to your needs.
Important part to our generator is the part that setups the paths, so we can cleanly import things from `@app/` and `@generated/` absolute paths without descending into the `../../../../` madness.

```typescript
{
// ..
    "baseUrl": "./",
    "paths": {
      "@app/*": ["./src/*"],
      "@generated/*": ["./generated/*"]
    }
}
```

## src/

### context.ts

Define your dynamic context here. It will be passed to your resolvers.
By default, our context consists of three things:

- headers coming from http request
- jwt coming from cookies property jwt
- object defined by a Root Interface (empty by default, read more in the `root.ts` section)

### createApp.ts

Exports a function that configures (but does not start!) Apollo Server.

You will find there a basic cors configuration.

Another important thing that happens here is the initialization of context with the passed root object.

### index.ts

Starts up the server based on the app configured in createApp.ts

### root.ts

Exports an object on which you can put anything you want (Controllers, Services, Repositories, Use Cases), that will later be accessible in the context object by your resolvers.

By using the root object instead of importing things directly in the resolvers files you allow for injecting those dependencies in test.

You might not need to use this file if your GraphQL server is only an aggregation layer using Apollo-based DataSources.

## Modules

### Example from the fresh initialization

Let's take another look at the modules

```bash
modules
└── RemoveMe
    └── graphql
        ├── RemoveMe.graphql
        └── queries
            ├── HelloQuery.spec.ts
            └── HelloQuery.ts
```

As you can notice we use a pattern you are welcome to follow.

Every module has a name, that name is reflected in the `module/Module_Name/graphql/Module_Name.graphql` file.

Based on that file our generator will generate resolvers for Queries, Mutations, Fields, also spec files scaffolds for them.

### Realistic Example

For a walk through a fully-developed example go to one of our examples:

- [Standalone Example](Examples/Standalone.md)
- [Federation Example](Examples/Federation.md)
