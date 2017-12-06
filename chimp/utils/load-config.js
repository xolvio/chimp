import cosmiconfig from 'cosmiconfig';
import defaultConfig from './default-config';

const explorer = cosmiconfig('chimp', {
  sync: true,
  rcExtensions: true,
  js: 'chimp.js'
});

function mergeDefaultConfig(config = {}) {
  const newConfig = {};
  Object.keys(defaultConfig).forEach(key => {
    newConfig[key] = Object.assign({}, defaultConfig[key], config[key]);
  });
  return newConfig;
}

export default function loadConfig() {
  const config = explorer.load(__dirname);

  if (!config) {
    return defaultConfig;
  }

  return mergeDefaultConfig(config.config);
}
