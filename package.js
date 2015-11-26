(function () {

  'use strict';

  /**
   * This package.js file is used for Meteor package management
   * http://docs.meteor.com/#/full/packagejs
   *
   * Not using Meteor?  Ignore this, and look at package.json
   */

  var chimpVersion = '0.20.2';
  var meteorChimpVersion = '_1';

  Package.describe({
    name: 'xolvio:cucumber',
    summary: 'CucumberJS for Velocity',
    version: chimpVersion + meteorChimpVersion,
    git: 'https://github.com/xolvio/chimp.git',
    debugOnly: true
  });

  Npm.depends({
    'chimp': chimpVersion,
    'colors': '1.1.2',
    'fs-extra': '0.24.0',
    "tail-forever": "0.3.11",
    'freeport': '1.0.5'
  });

  Package.onUse(function (api) {

    api.versionsFrom('METEOR@1.2.0.1');

    api.use([
      'underscore',
      'http',
      'velocity:core@0.10.6',
      'velocity:shim@0.1.0',
      'simple:json-routes@1.0.3',
      'sanjo:long-running-child-process@1.1.3'
    ], ['server', 'client']);
    api.use([
      'velocity:html-reporter@0.9.0'
    ], 'client');

    api.addAssets([
      'meteor/src/sample-tests/feature.feature',
      'meteor/src/sample-tests/steps.js',
      'meteor/src/sample-tests/package.json',
      'meteor/src/sample-tests/fixture.js'
    ], 'server');

    api.addFiles(['meteor/src/hub-server.js'], 'server');
    api.addFiles(['meteor/src/mirror-server.js'], 'server');

  });

})();
