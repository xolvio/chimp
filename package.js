Package.describe({
  name: 'xolvio:cucumber',
  summary: 'DEPRECATED - CucumberJS for Velocity',
  version: '0.22.0',
  git: 'https://github.com/xolvio/chimp.git',
  debugOnly: true
});

Npm.depends({'colors': '1.1.2'});

Package.onUse(function (api) {
  api.addFiles(['meteor/server.js'], 'server');
});
