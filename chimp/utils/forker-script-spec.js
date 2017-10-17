import Forker from './forker'

describe('Forker Script', function () {
  it('should start the Forker with the startup message, the startup message timeout and the starter script path', function () {
    const STARTUP_MESSAGE = 5;
    const STARTUP_MESSAGE_TIMEOUT = 6;
    this.startupMessage = process.argv[STARTUP_MESSAGE] = 'hello there';
    this.startupMessageTimeout = process.argv[STARTUP_MESSAGE_TIMEOUT] = '1234';
    class ForkerFake {}
    ForkerFake.prototype.execute = td.function();
    this.Forker = td.replace('./forker', ForkerFake);

    require('./forker-script');

    td.verify(this.Forker.prototype.execute({
      scriptPath: __dirname + '/starter.js',
      startupMessage: this.startupMessage,
      startupMessageTimeout: parseInt(this.startupMessageTimeout),
    }));
  });
});