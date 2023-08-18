import { print } from 'graphql';
import path from 'path';
import fs from 'fs';
import schema from './combineSchemas';

const printed = print(schema);

const outputPath = path.join(process.env.PROJECT_PATH || '', './schema.graphql');
fs.writeFileSync(outputPath, printed);
