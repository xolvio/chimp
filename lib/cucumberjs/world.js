var log = require('../log');

module.exports = function () {
  worldHelper.init();
  // The only way to detect if a user defined a custom world is by checking for a comment in ours.
  // See cucumber-wrapper.js
  if (this.World.toString().indexOf('// - - XOLVIO RAW WORLD - -') === -1) {
    console.log('User-defined world exists, not setting up he default Chimp world');
  } else {
    log.debug('[chimp][world] No user-defined world exists, setting up the default Chimp world');
    this.World = function World (callback) {
      worldHelper.createWorldInstanceAliases(this);
      callback();
      return this;
    };
  }
};
