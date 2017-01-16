// taken from https://github.com/timbotnik/meteor-autoupdate-watcher

var DDPClient = require('xolvio-ddp'),
  _ = require('underscore'),
  URL = require('url'),
  log = require('./log');

var AutoupdateWatcher = function (options) {
  this.options = options;
  this._url = this._getUrl(options.ddp);
  this._currentVersions = {};
  this._lastRerun = 0;
  this._autoupdateCollection = {};
  this._ddpClient = null;
};

AutoupdateWatcher.prototype._getUrl = function (ddpHost) {
  if (ddpHost instanceof Array) {
    ddpHost = ddpHost[0];
  }
  if (ddpHost.indexOf('http://') === -1 && ddpHost.indexOf('https://') === -1) {
    throw new Error('[chimp][ddp] DDP url must contain the protocol');
  }
  return URL.parse(ddpHost);
};

AutoupdateWatcher.prototype._triggerRerun = function () {
  var self = this;
  var now = (new Date()).getTime();
  if (now - self._lastRerun > 1000) {
    // debounce this since we always see multiple version records change around the same time
    // actually rerun here...
    self._lastRerun = now;
    self._trigger();
  }
};

AutoupdateWatcher.prototype._didUpdateVersion = function (doc) {
  var self = this;
  var versionType;
  var versionKey;
  if (doc._id.match(/version/) === null) {
    versionType = 'version-server';
    versionKey = '_id';
  } else {
    versionType = doc._id;
    versionKey = 'version';
  }
  var prevVersion = self._currentVersions[versionType];
  var newVersion = doc[versionKey];
  var isUpdated = prevVersion && prevVersion !== newVersion;
  if (isUpdated) {
    log.debug('[chimp][ddp-watcher] New ' + versionType + ': ' + newVersion);
  }
  self._currentVersions[versionType] = newVersion;
  return isUpdated;
};

AutoupdateWatcher.prototype._checkForUpdate = function () {
  var self = this;
  var observedAutoupdate = false;
  _.each(self._autoupdateCollection, function (doc) {
    if (!observedAutoupdate && self._didUpdateVersion(doc)) {
      observedAutoupdate = true;
    }
  });

  if (observedAutoupdate) {
    self._triggerRerun();
  }
};

AutoupdateWatcher.prototype.watch = function (trigger) {
  var self = this;
  self._trigger = trigger;
  self._ddpClient = new DDPClient({
    // All properties optional, defaults shown
    host: this._url.hostname,
    port: this._url.port,
    ssl: this._url.protocol === 'https:',
    autoReconnect: true,
    autoReconnectTimer: 500,
    maintainCollections: true,
    ddpVersion: '1',
    useSockJs: true
  });

  /*
   * Observe the autoupdate collection.
   */
  var observer = self._ddpClient.observe('meteor_autoupdate_clientVersions');
  observer.added = function (id) {
    log.debug('[chimp][ddp-watcher] ADDED to ' + observer.name + ':  ' + id);
  };
  observer.changed = function (id, oldFields, clearedFields, newFields) {
    log.debug('[chimp][ddp-watcher] CHANGED in ' + observer.name + ':  ' + id);
    log.debug('[chimp][ddp-watcher] CHANGED old field values: ', oldFields);
    log.debug('[chimp][ddp-watcher] CHANGED cleared fields: ', clearedFields);
    log.debug('[chimp][ddp-watcher] CHANGED new fields: ', newFields);
    if (self._didUpdateVersion(self._autoupdateCollection[id])) {
      self._triggerRerun();
    }
  };
  observer.removed = function (id, oldValue) {
    log.debug('[chimp][ddp-watcher] REMOVED in ' + observer.name + ':  ' + id);
    log.debug('[chimp][ddp-watcher] REMOVED previous value: ', oldValue);
  };
  self._observer = observer;

  /*
   * Connect to the Meteor Server
   */

  self._ddpClient.connect(function (error, wasReconnect) {

    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-established
    if (error) {
      log.error('[chimp][ddp-watcher] DDP connection error!', error);
      self._isConnected = false;
      return;
    }
    self._isConnected = true;

    if (wasReconnect) {
      log.debug('[chimp][ddp-watcher] Reconnected');
    } else {
      log.debug('[chimp][ddp-watcher] Connected');
    }

    // force a reset of 'maintained' collections
    self._ddpClient.collections = {};

    /*
     * Subscribe to the Meteor Autoupdate Collection
     */
    self._subscriptionHandle = self._ddpClient.subscribe('meteor_autoupdate_clientVersions', [],
       function () { // callback when the subscription is ready
         self._autoupdateCollection = self._ddpClient.collections.meteor_autoupdate_clientVersions;
         log.debug('[chimp][ddp-watcher] meteor_autoupdate_clientVersions ready:');
         log.debug('[chimp][ddp-watcher] ' + self._autoupdateCollection);
         self._checkForUpdate();
       }
    );
  });
};


module.exports = AutoupdateWatcher;
