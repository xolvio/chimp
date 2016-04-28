import {parseBoolean} from './environment-variable-parsers';

export function isCI() {
  return parseBoolean(process.env.CI);
}
