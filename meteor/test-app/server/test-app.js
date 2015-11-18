(function () {

  'use strict';

  Meteor.methods({
    'updateTitle': function (title) {
      Meteor.settings.pageTitle = title;
    },
    'getTitle': function () {
      return Meteor.settings.pageTitle;
    }
  });

})();
