#!/usr/bin/env node
const finder = require('find-package-json');
const shelljs = require('shelljs');
const { Source, buildSchema } = require('graphql');

const getModuleInfos = require('./parse-graphql/getModuleInfos');
const getModuleNames = require('./parse-graphql/getModuleNames');
const getFederatedEntities = require('./parse-graphql/getFederatedEntities');
const getInterfaces = require('./parse-graphql/getInterfaces');
// const checkIfGitStateClean = require('./helpers/checkIfGitStateClean');
const saveRenderedTemplate = require('./helpers/saveRenderedTemplate');

const execute = (appPrefix = '@app', generatedPrefix = '@generated') => {
  const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const f = finder(process.cwd());
  const projectMainPath = f
    .next()
    .filename.split('/')
    .filter((c) => c.indexOf('package.json') == -1)
    .join('/');

  shelljs.mkdir('-p', `${projectMainPath}/generated/graphql`);

  // "Framework" "generated" files - initial generation
  const createCombineSchemas = () => {
    const templateName = './templates/combineSchemas.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `combineSchemas.ts`;

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createCombineSchemas();

  const createPrintSchema = () => {
    const templateName = './templates/printSchema.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `printSchema.ts`;

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createPrintSchema();

  const createGenericDataModelSchema = () => {
    const templateName = './templates/genericDataModelSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `genericDataModelSchema.graphql`;

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createGenericDataModelSchema();

  const createFrameworkSchema = () => {
    const templateName = './templates/frameworkSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `frameworkSchema.graphql`;

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  createFrameworkSchema();

  const createGetCodegenConfig = () => {
    const templateName = './templates/getCodegenConfig.js';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `getCodegenConfig.js`;

    saveRenderedTemplate(templateName, { appPrefix }, filePath, fileName);
  };

  createGetCodegenConfig();

  const graphqlPaths = shelljs.ls(`${projectMainPath}/src/**/*.graphql`);

  const moduleNames = getModuleNames(graphqlPaths, projectMainPath);
  const modules = getModuleInfos(moduleNames);

  const createGlobalResolvers = () => {
    const templateName = './templates/resolvers.handlebars';
    const context = { modules };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `resolvers.ts`;
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  createGlobalResolvers();

  // End of "Framework" "generated" files

  // Initial App Setup files

  const { stdout: schemaString, stderr } = shelljs.exec('ts-node ./generated/graphql/printSchema.ts', {
    cwd: projectMainPath,
    silent: true,
  });

  if (stderr) {
    throw new Error(`Error while combining schema: , ${stderr}`);
  }

  const createGlobalSchema = () => {
    const templateName = './templates/schema.ts';
    const context = { modules, schemaString, generatedPrefix };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = `schema.ts`;
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  createGlobalSchema();

  modules.forEach((module) => {
    const moduleName = module.name;
    const { graphqlFileRootPath } = module;
    const createQuery = (queryName, hasArguments) => {
      const templateName = './templates/query.handlebars';
      const context = { queryName, moduleName, hasArguments, generatedPrefix };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/queries/`;
      const fileName = `${queryName}Query.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createQuerySpec = (queryName, hasArguments) => {
      const templateName = './templates/query.spec.handlebars';
      const context = { queryName, moduleName, hasArguments, generatedPrefix };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/queries/`;
      const fileName = `${queryName}Query.spec.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    if (module.queries && module.queries.length) {
      shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/queries`);
      module.queries.forEach(({ name, hasArguments, variables }) => {
        createQuery(name, hasArguments);
        createQuerySpec(name, hasArguments);
      });
    }

    const createMutation = (mutationName, hasArguments) => {
      const templateName = './templates/mutation.handlebars';
      const context = { mutationName, moduleName, hasArguments, generatedPrefix };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/mutations/`;
      const fileName = `${mutationName}Mutation.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    const createMutationSpec = (mutationName, hasArguments) => {
      const templateName = './templates/mutation.spec.handlebars';
      const context = { mutationName, moduleName, hasArguments, generatedPrefix };
      const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/mutations/`;
      const fileName = `${mutationName}Mutation.spec.ts`;
      const keepIfExists = true;
      saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
    };

    if (module.mutations && module.mutations.length) {
      shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/mutations`);
      module.mutations.forEach(({ name, hasArguments, variables }) => {
        createMutation(name, hasArguments);
        createMutationSpec(name, hasArguments);
      });
    }
  });

  const createTypeResolvers = () => {
    modules.forEach(({ name, typeDefinitions, types, schemaString, queries, mutations, graphqlFileRootPath }) => {
      let typeResolvers = [];
      if (types) {
        const federatedEntities = getFederatedEntities(schemaString);
        const interfaces = getInterfaces(schemaString);
        schemaString = schemaString.replace(/extend type/g, `type`);
        let source = new Source(schemaString);
        let schema = buildSchema(source);
        shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/types/`);

        const createInterfaceType = (interfaceName) => {
          const templateName = './templates/typeTypeResolvers.handlebars';
          let capitalizedFieldName = capitalize('__resolveType');
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
          let capitalizedFieldName = capitalize('__resolveType');
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
        interfaces.forEach((interfaceName) => {
          createInterfaceType(interfaceName);
          createInterfaceSpec(interfaceName);
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
            let source = new Source(newSchemaString);
            let schema = buildSchema(source);
            type = schema.getType(typeDef.name);
          }
          if (type.astNode) {
            filtered = type.astNode.fields.filter((f) =>
              f.directives.find(
                (d) => d.name.value === 'computed' || d.name.value === 'link' || d.name.value === 'requires'
              )
            );
          }

          if (federatedEntities.find((e) => e === typeDef.name)) {
            filtered.push({ name: { value: '__resolveReference' }, resolveReferenceType: true });
          }

          filtered.forEach(({ name: { value }, resolveReferenceType }) => {
            const templateName = './templates/typeTypeResolvers.handlebars';
            let capitalizedFieldName = capitalize(value);
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

          filtered.forEach(({ name: { value }, arguments, resolveReferenceType }) => {
            const templateName = './templates/typeTypeResolvers.spec.handlebars';
            let capitalizedFieldName = capitalize(value);
            const context = {
              typeName: typeDef.name,
              fieldName: value,
              moduleName: name,
              hasArguments: arguments && arguments.length,
              resolveReferenceType,
              capitalizedFieldName,
              generatedPrefix,
            };
            const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/types/`;
            const fileName = `${typeDef.name}${capitalizedFieldName}.spec.ts`;
            const keepIfExists = true;

            saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
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
        const context = { moduleName, queries, mutations, typeResolvers, graphqlFileRootPath, appPrefix };
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
