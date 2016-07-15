var _ = require('underscore');

module.exports = function () {
  chimpHelper.init();
  chimpHelper.loadAssertionLibrary();

  var UserWorld = this.World;
  this.World = function World() {
    this.browser = global.browser;
    this.driver = global.browser;
    this.client = global.browser;
    this.request = global.request;
    this.ddp = global.ddp;
    this.mirror = global.ddp;
    this.server = global.ddp;
    this.chimpWidgets = global.chimpWidgets;

    if (UserWorld) {
      // The user can modify the world
      var userWorldInstance = UserWorld.apply(this, _.toArray(arguments));
      if (userWorldInstance) {
        _.extend(this, userWorldInstance);
      }
    }

    return this;
  };
};
