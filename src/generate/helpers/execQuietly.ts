// @ts-ignore
import shelljs from 'shelljs';

export async function execQuietly(command: string, options: Record<string, unknown>, errorMessage = '') {
  return new Promise((resolve, reject) => {
    const child = shelljs.exec(command, {
      ...options,
      silent: true,
      async: true,
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data: string) => {
      stdoutData += data;
    });

    child.stdout.on('end', () => {
      resolve(stdoutData);
    });

    child.stderr.on('data', (data: string) => {
      stderrData += data;
    });

    child.stderr.on('end', () => {
      if (stderrData) {
        reject(new Error(`${stdoutData} ${errorMessage}: , ${stderrData}`));
      }
    });
  });
}
