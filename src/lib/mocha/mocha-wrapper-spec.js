// import { MochaWrapper } from './mocha-wrapper';
import Mocha from 'mocha';
import glob from 'glob';

var filesGlobParam = './src/**/*.spec.js';
var testDir = './tests/';
var testDirFiles = ['fileA.js', 'fileB.js'];

class FakeMocha {
  constructor() {
    this.aa = 'aa';
  }
  run () {
    console.log('--FakeMocha run()');
  }
  addFile(file){
    console.log('--FakeMocha addFile():', file);
  }
}

describe.only('mocha-wrapper', function () {
  beforeEach(function () {
    this.mocha = td.replace('mocha', td.object(Mocha));
    this.path = td.replace('path');
    this.glob = td.replace('glob', td.object(glob));
    td.replace('exit', td.function('exit'));
    td.replace('../babel-register', td.object({}));
  });
  afterEach(function() {
    td.reset();
  });
  describe('add files', function () {
    it('adds files inside testDir', function () {
      process.env['chimp.path'] = testDir;
      process.env.mochaConfig = JSON.stringify({ tags: ''});
      process.argv = [];

      td.when(this.path.join('mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.resolve(__dirname, 'mocha-helper.js')).thenReturn('mocha-helper.js');
      td.when(this.path.join(testDir, '**')).thenReturn(testDir);
      td.when(this.glob.sync(testDir)).thenReturn(testDirFiles);
      td.when(this.mocha.run(td.matchers.anything())).thenReturn(null);
      require('./mocha-wrapper.js')
      // const mochaWrapper = new require('./mocha-wrapper.js').MochaWrapper;
      // td.verify(this.mocha.addFile('fileA.js'));
    });
    // it('adds files inside testDir', function () {
    //   process.env['chimp.path'] = testDir;
    //   process.env.mochaConfig = JSON.stringify({ tags: ''});
    //   process.argv = [];
    //
    //   td.when(this.path.join('mocha-helper.js')).thenReturn('mocha-helper.js');
    //   td.when(this.path.resolve(__dirname, 'mocha-helper.js')).thenReturn('mocha-helper.js');
    //   td.when(this.path.join(testDir, '**')).thenReturn(testDir);
    //   td.when(this.glob.sync(testDir)).thenReturn(testDirFiles);
    //   td.when(this.mocha.run(td.matchers.anything())).thenReturn(null);
    //   const mochaWrapper = new require('./mocha-wrapper.js').MochaWrapper;
    //   td.verify(this.mocha.addFile('fileA.js'));
    // });
  });
});
