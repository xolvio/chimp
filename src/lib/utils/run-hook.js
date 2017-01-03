import path from 'path';
import log from './../log';

export default function runHook(module, method, ...args) {
  const modulePath = process.env[`chimp.${module}Hooks`];
  if (!modulePath) {
    return;
  }

  let hooksModule = null;
  try {
    hooksModule = require(path.join(process.cwd(), modulePath));
  } catch (e) {
    log.error(`Could not find ${module}Hooks module at ${modulePath}`);
    throw e;
  }

  const hook = hooksModule[method];
  if (hook) {
    log.debug(`[chimp][helper] running ${module} ${method} hook`);
    hook(...args);
  }
}
