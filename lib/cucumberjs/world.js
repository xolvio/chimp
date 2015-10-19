var log = require('../log');

module.exports = function () {
  worldHelper.init();
  log.debug('[chimp][world] No user-defined world exists, setting up the default Chimp world');
  this.World = function World (callback) {
    worldHelper.createWorldInstanceAliases(this);
    callback();
    return this;
  };
};
