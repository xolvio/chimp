#!/usr/bin/env node
const finder = require('find-package-json');
const shelljs = require('shelljs');
const { Source, buildSchema } = require('graphql');
const path = require('path');
const { pascalCase } = require('pascal-case');

const getModuleInfos = require('./parse-graphql/getModuleInfos');
const getModuleNames = require('./parse-graphql/getModuleNames');
const getFederatedEntities = require('./parse-graphql/getFederatedEntities');
const getInterfaces = require('./parse-graphql/getInterfaces');
// const checkIfGitStateClean = require('./helpers/checkIfGitStateClean');
const saveRenderedTemplate = require('./helpers/saveRenderedTemplate');

const execute = (appPrefix = '@app', generatedPrefix = '@generated', modulesPath = 'src/') => {
  const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const f = finder(process.cwd());
  const projectMainPath = f
    .next()
    .filename.split('/')
    .filter((c) => c.indexOf('package.json') === -1)
    .join('/');

  shelljs.mkdir('-p', `${projectMainPath}/generated/graphql/helpers`);

  // "Framework" "generated" files - initial generation
  const createCombineSchemas = () => {
    const templateName = './templates/combineSchemas.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'combineSchemas.ts';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createCombineSchemas();

  const createPrintSchema = () => {
    const templateName = './templates/printSchema.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'printSchema.ts';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createPrintSchema();

  const createGenericDataModelSchema = () => {
    const templateName = './templates/genericDataModelSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'genericDataModelSchema.graphql';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createGenericDataModelSchema();

  const createFrameworkSchema = () => {
    const templateName = './templates/frameworkSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'frameworkSchema.graphql';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createFrameworkSchema();

  const createGetCodegenConfig = () => {
    const templateName = './templates/getCodegenConfig.js';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'getCodegenConfig.js';

    saveRenderedTemplate(templateName, { appPrefix }, filePath, fileName);
  };

  createGetCodegenConfig();
  const modulesResolvedPath = path.join(projectMainPath, modulesPath);
  const graphqlPaths = shelljs.ls(`${modulesResolvedPath}**/*.graphql`);

  const moduleNames = getModuleNames(graphqlPaths, projectMainPath);
  const modules = getModuleInfos(moduleNames);

  const createGlobalResolvers = () => {
    const templateName = './templates/resolvers.handlebars';
    const context = { modules };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'resolvers.ts';
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  createGlobalResolvers();

  // End of "Framework" "generated" files

  // Initial App Setup files

  const { stdout: globalSchemaString, stderr } = shelljs.exec('ts-node ./generated/graphql/printSchema.ts', {
    cwd: projectMainPath,
    silent: true,
  });

  if (stderr) {
    throw new Error(`Error while combining schema: , ${stderr}`);
  }

  const createGlobalSchema = () => {
    const templateName = './templates/schema.ts';
    const context = { modules, schemaString: globalSchemaString, generatedPrefix };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'schema.ts';
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  createGlobalSchema();

  modules.forEach((module) => {
    const moduleName = module.name;
    const { graphqlFileRootPath } = module;
    const createQuery = (queryName, hasArguments) => {
      const templateName = './templates/query.handlebars';
      const context = {
        queryName,
        moduleName,
        hasArguments,
        generatedPrefix,
      };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/queries/`;
      const fileName = `${queryName}Query.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createQuerySpec = (queryName, hasArguments) => {
      const templateName = './templates/query.spec.handlebars';
      const context = {
        queryName,
        moduleName,
        hasArguments,
        generatedPrefix,
        pascalCasedArgName: `Query${pascalCase(queryName)}Args`,
      };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/queries/`;
      const fileName = `${queryName}Query.spec.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createQuerySpecWrapper = (queryName, hasArguments) => {
      const templateName = './templates/querySpecWrapper.handlebars';
      const context = {
        queryName,
        moduleName,
        hasArguments,
        generatedPrefix,
        appPrefix,
        graphqlFileRootPath,
        pascalCasedArgName: `Query${pascalCase(queryName)}Args`,
      };
      const filePath = `${projectMainPath}/generated/graphql/helpers/`;
      const fileName = `${queryName}QuerySpecWrapper.ts`;
      const keepIfExists = false;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    if (module.queries && module.queries.length) {
      shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/queries`);
      module.queries.forEach(({ name, hasArguments }) => {
        createQuery(name, hasArguments);
        createQuerySpec(name, hasArguments);
        createQuerySpecWrapper(name, hasArguments);
      });
    }

    const createMutation = (mutationName, hasArguments) => {
      const templateName = './templates/mutation.handlebars';
      const context = {
        mutationName,
        moduleName,
        hasArguments,
        generatedPrefix,
      };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/mutations/`;
      const fileName = `${mutationName}Mutation.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createMutationSpec = (mutationName, hasArguments) => {
      const templateName = './templates/mutation.spec.handlebars';
      const context = {
        mutationName,
        moduleName,
        hasArguments,
        generatedPrefix,
        appPrefix,
        graphqlFileRootPath,
        pascalCasedArgName: `Mutation${pascalCase(mutationName)}Args`,
      };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/mutations/`;
      const fileName = `${mutationName}Mutation.spec.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createMutationSpecWrapper = (mutationName, hasArguments) => {
      const templateName = './templates/mutationSpecWrapper.handlebars';
      const context = {
        mutationName,
        moduleName,
        hasArguments,
        generatedPrefix,
        appPrefix,
        graphqlFileRootPath,
        pascalCasedArgName: `Mutation${pascalCase(mutationName)}Args`,
      };
      const filePath = `${projectMainPath}/generated/graphql/helpers/`;

      const fileName = `${mutationName}MutationSpecWrapper.ts`;
      const keepIfExists = false;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    if (module.mutations && module.mutations.length) {
      shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/mutations`);
      module.mutations.forEach(({ name, hasArguments }) => {
        createMutation(name, hasArguments);
        createMutationSpec(name, hasArguments);
        createMutationSpecWrapper(name, hasArguments);
      });
    }
  });

  const createTypeResolvers = () => {
    modules.forEach(({ name, typeDefinitions, types, schemaString, queries, mutations, graphqlFileRootPath }) => {
      const typeResolvers = [];
      if (types) {
        const federatedEntities = getFederatedEntities(schemaString);
        const interfaces = getInterfaces(schemaString);
        // Leaving this for now
        // eslint-disable-next-line no-param-reassign
        schemaString = schemaString.replace(/extend type/g, 'type');
        const source = new Source(schemaString);
        const schema = buildSchema(source);
        shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/types/`);

        const createInterfaceType = (interfaceName) => {
          const templateName = './templates/typeTypeResolvers.handlebars';
          const capitalizedFieldName = capitalize('__resolveType');
          const context = {
            typeName: interfaceName,
            fieldName: '__resolveType',
            moduleName: name,
            resolveReferenceType: true,
            capitalizedFieldName,
            generatedPrefix,
          };
          const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/types/`;
          const fileName = `${interfaceName}${capitalizedFieldName}.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        };

        const createInterfaceSpec = (interfaceName) => {
          const templateName = './templates/typeTypeResolvers.spec.handlebars';
          const capitalizedFieldName = capitalize('__resolveType');
          const context = {
            typeName: interfaceName,
            fieldName: '__resolveType',
            moduleName: name,
            hasArguments: false,
            resolveReferenceType: true,
            capitalizedFieldName,
            generatedPrefix,
          };
          const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/types/`;
          const fileName = `${interfaceName}${capitalizedFieldName}.spec.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        };

        const createInterfaceSpecWrapper = (interfaceName) => {
          const templateName = './templates/typeTypeResolversSpecWrapper.handlebars';
          const capitalizedFieldName = capitalize('__resolveType');
          const context = {
            typeName: interfaceName,
            fieldName: '__resolveType',
            moduleName: name,
            hasArguments: false,
            resolveReferenceType: true,
            capitalizedFieldName,
            generatedPrefix,
            appPrefix,
            graphqlFileRootPath,
          };
          const filePath = `${projectMainPath}/generated/graphql/helpers/`;
          const fileName = `${interfaceName}${capitalizedFieldName}SpecWrapper.ts`;
          const keepIfExists = false;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        };
        interfaces.forEach((interfaceName) => {
          createInterfaceType(interfaceName);
          createInterfaceSpec(interfaceName);
          createInterfaceSpecWrapper(interfaceName);
          typeResolvers.push({
            typeName: interfaceName,
            fieldName: [{ name: '__resolveType', capitalizedName: capitalize('__resolveType') }],
          });
        });
        typeDefinitions.forEach((typeDef) => {
          let filtered = [];
          let type = schema.getType(typeDef.name);
          if (!type) {
            const newSchemaString = schemaString.replace(`extend type ${typeDef.name}`, `type ${typeDef.name}`);
            type = buildSchema(new Source(newSchemaString)).getType(typeDef.name);
          }
          if (type.astNode) {
            filtered = type.astNode.fields.filter((field) =>
              field.directives.find(
                (d) => d.name.value === 'computed' || d.name.value === 'link' || d.name.value === 'requires',
              ),
            );
          }

          let isFederatedAndExternal = false;
          if (federatedEntities.find((e) => e === typeDef.name)) {
            filtered.push({ name: { value: '__resolveReference' }, resolveReferenceType: true });
            isFederatedAndExternal =
              type.astNode &&
              !!type.astNode.fields.find((field) => field.directives.find((d) => d.name.value === 'external'));
          }

          filtered.forEach(({ name: { value }, resolveReferenceType }) => {
            const templateName = './templates/typeTypeResolvers.handlebars';
            const capitalizedFieldName = capitalize(value);
            const context = {
              typeName: typeDef.name,
              fieldName: value,
              moduleName: name,
              resolveReferenceType,
              capitalizedFieldName,
              generatedPrefix,
            };
            const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/types/`;
            const fileName = `${typeDef.name}${capitalizedFieldName}.ts`;
            const keepIfExists = true;

            saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
          });

          const createTypeFieldResolverSpec = (value, resolveReferenceType, resolverArguments) => {
            const templateName = './templates/typeTypeResolvers.spec.handlebars';
            const capitalizedFieldName = capitalize(value);
            const context = {
              typeName: typeDef.name,
              fieldName: value,
              moduleName: name,
              hasArguments: resolverArguments && resolverArguments.length,
              resolveReferenceType,
              capitalizedFieldName,
              generatedPrefix,
              pascalCasedArgName: `${typeDef.name}${pascalCase(capitalizedFieldName)}Args`,
            };
            const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/types/`;
            const fileName = `${typeDef.name}${capitalizedFieldName}.spec.ts`;
            const keepIfExists = true;

            saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
          };
          const createTypeFieldResolverSpecWrapper = (value, resolveReferenceType, resolverArguments) => {
            const templateName = './templates/typeTypeResolversSpecWrapper.handlebars';
            const capitalizedFieldName = capitalize(value);
            const context = {
              typeName: typeDef.name,
              fieldName: value,
              moduleName: name,
              hasArguments: resolverArguments && resolverArguments.length,
              resolveReferenceType,
              capitalizedFieldName,
              generatedPrefix,
              appPrefix,
              graphqlFileRootPath,
              isFederatedAndExternal,
              pascalCasedArgName: `${typeDef.name}${pascalCase(capitalizedFieldName)}Args`,
            };
            const filePath = `${projectMainPath}/generated/graphql/helpers/`;
            const fileName = `${typeDef.name}${capitalizedFieldName}SpecWrapper.ts`;
            const keepIfExists = true;

            saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
          };

          filtered.forEach(({ name: { value }, arguments: resolverArguments, resolveReferenceType }) => {
            createTypeFieldResolverSpec(value, resolveReferenceType, resolverArguments);
            createTypeFieldResolverSpecWrapper(value, resolveReferenceType, resolverArguments);
          });

          if (filtered.length) {
            typeResolvers.push({
              typeName: typeDef.name,
              fieldName: filtered.map(({ name: { value } }) => ({ name: value, capitalizedName: capitalize(value) })),
            });
          }
        });
      }
      const moduleName = name;
      const createModuleResolvers = () => {
        const templateName = './templates/moduleResolvers.handlebars';
        const context = {
          moduleName,
          queries,
          mutations,
          typeResolvers,
          graphqlFileRootPath,
          appPrefix,
        };
        const filePath = `${projectMainPath}/generated/graphql/`;
        const fileName = `${moduleName}Resolvers.ts`;
        saveRenderedTemplate(templateName, context, filePath, fileName);
      };

      createModuleResolvers();
    });
  };

  createTypeResolvers();
};
module.exports = execute;
