#!/usr/bin/env node
import getModuleInfos from './parse-graphql/get-module-infos';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as shelljs from 'shelljs';
import configureDebug from 'debug';
import { Source, buildSchema } from 'graphql';
import { pascalCase } from 'pascal-case';
import getModuleNames from './parse-graphql/getModuleNames';
import getFederatedEntities from './parse-graphql/getFederatedEntities';
import getInterfaces from './parse-graphql/getInterfaces';
import getScalars from './parse-graphql/getScalars';
// import checkIfGitStateClean from './helpers/checkIfGitStateClean';
import { saveRenderedTemplate } from './helpers/saveRenderedTemplate';
import { findProjectMainPath } from './helpers/findProjectMainPath';
import { execQuietly } from './helpers/execQuietly';

const debug = configureDebug('generate-module');

const generateSchema = async (projectMainPath: string) => {
  await execQuietly(`ts-node -r tsconfig-paths/register ./generated/graphql/printSchema.ts > ./schema.graphql`, {
    cwd: projectMainPath,
  });
};

export const executeGeneration = async (appPrefix = '~app', generatedPrefix = '~generated', modulesPath = 'src/') => {
  const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
  const projectMainPath = findProjectMainPath();
  shelljs.mkdir('-p', `${projectMainPath}/generated/graphql/helpers`);

  // "Framework" "generated" files - initial generation
  const createCombineSchemas = () => {
    const templateName = './templates/combineSchemas.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'combineSchemas.ts';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  debug('createCombineSchemas');
  createCombineSchemas();

  const createPrintSchema = () => {
    const templateName = './templates/printSchema.ts';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'printSchema.ts';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  debug('createPrintSchema');
  createPrintSchema();

  const createGenericDataModelSchema = () => {
    const templateName = './templates/genericDataModelSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'genericDataModelSchema.graphql';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  debug('createGenericDataModelSchema');
  createGenericDataModelSchema();

  const createFrameworkSchema = () => {
    const templateName = './templates/frameworkSchema.graphql';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'frameworkSchema.graphql';

    saveRenderedTemplate(templateName, {}, filePath, fileName);
  };

  debug('createFrameworkSchema');
  createFrameworkSchema();

  const createGetCodegenConfig = () => {
    const templateName = './templates/getCodegenConfig.js';
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'getCodegenConfig.js';

    saveRenderedTemplate(templateName, { appPrefix }, filePath, fileName);
  };

  debug('createGetCodegenConfig');
  createGetCodegenConfig();
  const modulesResolvedPath = path.join(projectMainPath, modulesPath);
  const graphqlPaths = shelljs.ls(path.join(modulesResolvedPath, '**/*.graphql'));

  const moduleNames = getModuleNames(graphqlPaths, projectMainPath);
  const modules = getModuleInfos(moduleNames);

  const createGlobalResolvers = () => {
    const templateName = './templates/resolvers.handlebars';
    const context = { modules };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'resolvers.ts';
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  debug('createGlobalResolvers');
  createGlobalResolvers();

  // End of "Framework" "generated" files

  // Initial App Setup files

  debug('generateSchema');
  await generateSchema(projectMainPath);

  const globalSchemaString = fs.readFileSync(path.join(projectMainPath, 'schema.graphql')); // read file

  const createGlobalSchema = () => {
    const templateName = './templates/schema.ts';
    const context = { modules, schemaString: globalSchemaString.toString().replace(/`/g, '\\`'), generatedPrefix };
    const filePath = `${projectMainPath}/generated/graphql/`;
    const fileName = 'schema.ts';
    saveRenderedTemplate(templateName, context, filePath, fileName);
  };

  debug('createGlobalSchema');
  createGlobalSchema();

  modules.forEach((module) => {
    const moduleName = module.name;
    const { graphqlFileRootPath } = module;
    const createQuery = (queryName: string, hasArguments: boolean) => {
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

    const createQuerySpec = (queryName: string, hasArguments: boolean) => {
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

    const createQuerySpecWrapper = (queryName: string, hasArguments: boolean) => {
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

    if (module.queries && module.queries.length > 0) {
      shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/queries`);
      module.queries.forEach(({ name, hasArguments }: { name: string; hasArguments: boolean }) => {
        createQuery(name, hasArguments);
        createQuerySpec(name, hasArguments);
        createQuerySpecWrapper(name, hasArguments);
      });
    }

    const createMutation = (mutationName: string, hasArguments: boolean) => {
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

    const createMutationSpec = (mutationName: string, hasArguments: boolean) => {
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

    const createMutationSpecWrapper = (mutationName: string, hasArguments: boolean) => {
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

    if (module.mutations && module.mutations.length > 0) {
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
      const typeResolvers: { typeName: string; fieldName: { name: string; capitalizedName: string }[] }[] = [];

      if (types) {
        debug(`create type resolvers for module ${name}`);

        const federatedEntities = getFederatedEntities(schemaString);
        const interfaces = getInterfaces(schemaString);
        // Leaving this for now
        // eslint-disable-next-line no-param-reassign
        schemaString = schemaString.replace(/extend type/g, 'type');
        const source = new Source(schemaString);
        const schema = buildSchema(source, { assumeValidSDL: true });
        shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/types/`);

        const createInterfaceType = (interfaceName: string) => {
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

        const createInterfaceSpec = (interfaceName: string) => {
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

        const createInterfaceSpecWrapper = (interfaceName: string) => {
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
        type FilteredType = { name: { value: string }; resolveReferenceType: boolean; arguments?: string[] };
        typeDefinitions.forEach((typeDef) => {
          let filtered: FilteredType[] = [];
          let type = schema.getType(typeDef.name);
          if (!type) {
            const newSchemaString = schemaString.replace(`extend type ${typeDef.name}`, `type ${typeDef.name}`);
            type = buildSchema(new Source(newSchemaString)).getType(typeDef.name);
          }
          if (type?.astNode) {
            // @ts-ignore
            filtered = type.astNode.fields.filter((field) =>
              field.directives.find(
                (d: { name: { value: string } }) =>
                  d.name.value === 'computed' || d.name.value === 'link' || d.name.value === 'requires' || d.name.value === 'map',
              ),
            );
          }

          let isFederatedAndExternal = false;
          if (federatedEntities.find((e) => e === typeDef.name)) {
            isFederatedAndExternal =
              Boolean(type!.astNode) &&
              Boolean(
                // @ts-ignore
                type?.astNode.fields.find((field) => field.directives.find((d) => d.name.value === 'external')),
              );

            const foundComputed = type?.astNode?.directives?.find((d) => d.name.value === 'computed');
            const notComputed = Boolean(!foundComputed);

            // If it's a federated and external but NOT marked with a computed directive, we do not want to
            // create the resolveReference files for it.
            if (!(isFederatedAndExternal && notComputed)) {
              filtered.push({ name: { value: '__resolveReference' }, resolveReferenceType: true });
            }
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

          const createTypeFieldResolverSpec = (
            value: string,
            resolveReferenceType: boolean,
            resolverArguments?: string[],
          ) => {
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
          const createTypeFieldResolverSpecWrapper = (
            value: string,
            resolveReferenceType: boolean,
            resolverArguments?: string[],
          ) => {
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

          if (filtered.length > 0) {
            typeResolvers.push({
              typeName: typeDef.name,
              fieldName: filtered.map(({ name: { value } }) => ({ name: value, capitalizedName: capitalize(value) })),
            });
          }
        });
      }

      const scalars = getScalars(schemaString);

      const createScalarResolvers = () => {
        if (scalars && scalars.length > 0) {
          shelljs.mkdir('-p', `${projectMainPath}/src/${graphqlFileRootPath}/scalars/`);
        }
        scalars.forEach((scalarName) => {
          const templateName = './templates/scalarResolver.handlebars';
          const context = {
            scalarName,
            moduleName: name,
            generatedPrefix,
          };
          const filePath = `${projectMainPath}/src/${graphqlFileRootPath}/scalars/`;
          const fileName = `${scalarName}.ts`;
          const keepIfExists = true;

          saveRenderedTemplate(templateName, context, filePath, fileName, keepIfExists);
        });
      };
      createScalarResolvers();

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
          scalars,
        };
        const filePath = `${projectMainPath}/generated/graphql/`;
        const fileName = `${moduleName}Resolvers.ts`;
        saveRenderedTemplate(templateName, context, filePath, fileName);
      };

      createModuleResolvers();
    });
  };

  debug('createTypeResolvers');
  createTypeResolvers();
};
