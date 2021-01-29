/* eslint-disable import/no-extraneous-dependencies */
// @ts-ignore
import shelljs from 'shelljs';
import path from 'path';
// @ts-ignore
import waitOn from 'wait-on';
// @ts-ignore
import axios from 'axios';
import assert from 'assert';
import { spawn } from 'child_process';

function quietExec(command: string, options: {}, errorMessage = '') {
  const { stdout, stderr, code } = shelljs.exec(command, {
    ...options,
  });

  if (code !== 0) {
    throw new Error(`${errorMessage}: , ${stderr}`);
  }
  return stdout;
}

const pathToRunFrom = path.join(process.cwd(), '../');
console.log('GOZDECKI pathToRunFrom', pathToRunFrom);
quietExec('./chimp/bin/run create chimp-test-repo', { cwd: pathToRunFrom });
//
shelljs.cp('-R', './test-module', '../chimp-test-repo/src/modules/');
const pathToRunFromChimp = path.join(process.cwd(), '../chimp-test-repo');
console.log('GOZDECKI pathToRunFromChimp', pathToRunFromChimp);
shelljs.sed('-i', /"chimp": "latest"/, '"chimp": "../chimp"', path.join(pathToRunFromChimp, 'package.json'));

quietExec('npm install', { cwd: pathToRunFromChimp });
quietExec('npm run type-check', { cwd: pathToRunFromChimp });
spawn('npm', ['start'], {
  stdio: 'ignore',
  detached: true,
  cwd: pathToRunFromChimp,
}).unref();

const opts = {
  resources: ['http://localhost:4000/graphql'],
  validateStatus(status: number) {
    return status >= 200 && status <= 405;
  },
};

const checkGraphQl = async () => {
  try {
    await waitOn(opts);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }

  try {
    const { data } = await axios.post('http://localhost:4000/graphql', {
      query: '{ GetNumbers { one two three computed } }',
    });
    assert.deepStrictEqual(data?.data?.GetNumbers, { one: 1, two: null, three: 3, computed: '1 2 3' });
    console.log('Looking good! Got: ', data?.data?.GetNumbers);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }
};

checkGraphQl().then(() => ({}));
