import { print } from 'graphql';
import path from 'path';
import fs from 'fs';
import schema from './combineSchemas';

const printed = print(schema);

const outputPath = path.join(process.cwd(), './schema.graphql');
fs.writeFileSync(outputPath, printed);
