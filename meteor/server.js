Npm.require('colors');

Meteor.startup(function () {
  console.log('xolvio:cucumber has been deprecated, please use Chimp. For a migration guide, go here: '.white.bgRed);
  console.log('https://chimp.readme.io/docs/migrating-from-xolviocucumber-to-chimp'.blue);
  console.log('- Your friends at'.gray, 'Xolv.io'.green.bold);
});