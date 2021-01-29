// chunks of the code taken from git-state package.
import { execSync } from 'child_process';

const EOL = /\r?\n/;

const statusSync = function (repoPath: string) {
  const stdout = execSync('git status -s', {
    cwd: repoPath,
  }).toString();
  const status = { dirty: 0, untracked: 0, changed: false };
  stdout
    .trim()
    .split(EOL)
    .filter((file) => file)
    .forEach(function (file) {
      status.changed = true;
      if (file.substr(0, 2) === '??') status.untracked++;
      else status.dirty++;
    });
  return status;
};

export function assertGitCleanState() {
  const currentPath = process.cwd();

  const status = statusSync(currentPath);

  if (status.changed && !process.env.IGNORE_GIT) {
    console.error(`We are about to generate and modify some code, but you have ${status.dirty} modified and ${status.untracked} new files.
  To make sure you can easily verify and revert the changes introduced by this tool, please commit or stash the existing changes.`);
    process.exit(2);
  }
}
