import shelljs from 'shelljs';
import debugConfigurator from 'debug';

const debug = debugConfigurator('execQuietly');

export async function execQuietly(command: string, options: Record<string, unknown>, errorMessage = '') {
  return new Promise((resolve, reject) => {
    const child = shelljs.exec(command, {
      ...options,
      silent: !debug.enabled,
      async: true,
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout!.on('data', (data: string) => {
      stdoutData += data;
    });

    child.stderr!.on('data', (data: string) => {
      stderrData += data;
    });

    // Listen for the exit event to get the exit code
    child.on('exit', (code: number) => {
      if (code === 0) {
        resolve(stdoutData);
      } else {
        reject(new Error(`${stdoutData} ${errorMessage}: ${stderrData} ${command}`));
      }
    });
  });
}
