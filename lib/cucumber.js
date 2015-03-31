var path = require('path'),
    cp = require('child_process');

/**
 * Cucumber Constructor
 *
 * @param {Object} options
 * @api public
 */

function Cucumber(options) {
  this.options = options;
}

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

Cucumber.prototype.run = function(callback) {
  var cucumberPath = "",
      args = [],
      that = this;

  cucumberPath = path.resolve(__dirname, '../node_modules/.bin/cucumber.js');
  args = process.argv.slice(2).concat(['-r', path.join(this.options.path, 'step_definitions'), '-r', path.resolve(__dirname, 'cucumberjs/world.js'), '-r', path.resolve(__dirname, 'cucumberjs/hooks.js')]);
  cucumber = cp.spawn(cucumberPath, args, { env: process.env});

  cucumber.stdout.on('data', function(data) {
    process.stdout.write(data);
  });

  cucumber.stderr.pipe(process.stdout);

  cucumber.on('close', function() {
    callback();
  });

  process.on('exit', function() {
    cucumber.kill();
  });
};

module.exports = Cucumber;
