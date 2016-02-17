jest.dontMock('../lib/options-loader');
jest.dontMock('path');

describe('Options Loader', () => {
  const optionsLoader = require('../lib/options-loader');

  describe('getOptions', () => {
    const fs = require('fs');

    beforeEach(() => {
      spyOn(process, 'cwd').and.returnValue('/myFolder');
      optionsLoader._exit = jest.genMockFn();
      optionsLoader._requireFile = jest.genMockFn();
    });

    it('should use the first argument as the config file if it is a js file containing "chimp"', () => {
      const argv = ['not', 'applicable', 'my-chimp-file.js'];
      optionsLoader._getProcessArgv = jest.genMockFn().mockReturnValue(argv);

      fs.existsSync = jest.genMockFn().mockReturnValue(true);
      optionsLoader.getOptions();

      expect(optionsLoader._requireFile.mock.calls[0][0]).toBe('/myFolder/my-chimp-file.js');
    });

    it('should remove the config file from the arguments', () => {
      fs.existsSync = jest.genMockFn().mockReturnValue(true);
      const argv = ['not', 'applicable', 'my-chimp-file.js', '2nd-arg'];
      optionsLoader._getProcessArgv = jest.genMockFn().mockReturnValue(argv);

      optionsLoader.getOptions();

      expect(argv).toEqual(['not', 'applicable', '2nd-arg']);
    });

    it('it should log an error if the provided config file does not exist and exist with a code 1', () => {
      const argv = ['not', 'applicable', 'my-chimp-file.js'];
      optionsLoader._getProcessArgv = jest.genMockFn().mockReturnValue(argv);

      fs.existsSync = jest.genMockFn().mockReturnValue(false);
      optionsLoader.getOptions();

      expect(optionsLoader._exit.mock.calls[0][0]).toBe(1);
    });

    it('should load the chimp.js file if it exists in the current directory', () => {
      const argv = ['not', 'applicable', 'not-a-config-file.js'];
      optionsLoader._getProcessArgv = jest.genMockFn().mockReturnValue(argv);

      fs.existsSync = jest.genMockFn().mockReturnValue(true);
      optionsLoader.getOptions();

      expect(optionsLoader._requireFile.mock.calls[0][0]).toBe('/myFolder/chimp.js');
    });

    it('should load default values from default.js', () => {
      const argv = ['not', 'applicable', 'not-a-config-file.js'];
      optionsLoader._getProcessArgv = jest.genMockFn().mockReturnValue(argv);
      optionsLoader._getDefaultConfigFilePath = jest.genMockFn().mockReturnValue('defaultFileLocation');

      fs.existsSync = jest.genMockFn().mockReturnValue(true);
      optionsLoader.getOptions();

      expect(optionsLoader._requireFile.mock.calls[1][0]).toBe('defaultFileLocation');
    });
  });
});
