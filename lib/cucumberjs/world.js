var log = require('../log');

module.exports = function () {
  chimpHelper.init();
  chimpHelper.loadAssertionLibrary();
  // The only way to detect if a user defined a custom world is by checking for a comment in ours.
  // See cucumber-wrapper.js
  if (this.World.toString().indexOf('// - - XOLVIO RAW WORLD - -') === -1) {
    console.log('User-defined world exists, not setting up the default Chimp world');
  } else {
    log.debug('[chimp][world] No user-defined world exists, setting up the default Chimp world');
    this.World = function World (callback) {
      this.browser = global.browser;
      this.driver = global.browser;
      this.client = global.browser;
      this.request = global.request;
      this.ddp = global.ddp;
      this.mirror = global.ddp;
      this.server = global.ddp;
      this.chimpWidgets = global.chimpWidgets;
      callback();
      return this;
    };
  }
};
