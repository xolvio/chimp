import Jasmine from 'jasmine'

var jasmine = new Jasmine();
jasmine.loadConfig({
  spec_dir: '.',
  spec_files: ['jasmine.spec.js']
});
jasmine.execute();