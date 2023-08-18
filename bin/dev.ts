#!/usr/bin/env tsx

// eslint-disable-next-line node/shebang
const oclif = require('@oclif/core');

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development';

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif.run().then(oclif.flush).catch(oclif.Errors.handle);
