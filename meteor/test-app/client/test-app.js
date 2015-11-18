(function () {

  'use strict';

  Meteor.call('getTitle', function (err, res) {
    $('h1').text(res).show();
  });

})();