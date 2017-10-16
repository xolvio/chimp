import LongRunningChildProcess from './long-running-child-process'

const PATH_TO_EXECUTABLE = 4;
const EXECUTABLE_ARGS = 5;
const PARENT_PID = 6;
const executablePath = process.argv[PATH_TO_EXECUTABLE];
const executableArgs = JSON.parse(process.argv[EXECUTABLE_ARGS]);
const parentPid = parseInt(process.argv[PARENT_PID]);

new LongRunningChildProcess().start({
  executablePath,
  executableArgs,
  parentPid
});