// chunks of the code taken from git-state package.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EOL = /\r?\n/;

const statusSync = function (repo, opts) {
  opts = opts || {};
  const stdout = execSync('git status -s', {
    cwd: repo,
    maxBuffer: opts.maxBuffer,
  }).toString();
  const status = { dirty: 0, untracked: 0, changed: false };
  stdout
    .trim()
    .split(EOL)
    .forEach(function (file) {
      if (!file || file.indexOf('src/') === -1 || file.indexOf('.graphql') > -1) {
        return;
      }
      status.changed = true;
      if (file.substr(0, 2) === '??') status.untracked++;
      else status.dirty++;
    });
  return status;
};

module.exports = function checkIfGitStateClean() {
  const currentPath = process.cwd();

  const status = statusSync(currentPath);

  if (status.changed && !process.env.IGNORE_GIT) {
    console.error(`We are about to generate and modify some code, but you have ${status.dirty} modified and ${status.untracked} new files. We are counting only files in src/ and excluding .graphql.
  To make sure you can easily verify and revert the changes introduced by this tool, please commit or stash the existing changes.
  If you want to ignore this warning run the tooling with IGNORE_GIT=true. This is STRONGLY discouraged!`);
    process.exit(2);
  }
};
