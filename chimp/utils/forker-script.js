import Forker from './forker';
import {join} from 'path';

const STARTUP_MESSAGE = 5;
const STARTUP_MESSAGE_TIMEOUT = 6;
const startupMessage = process.argv[STARTUP_MESSAGE];
const startupMessageTimeout = parseInt(process.argv[STARTUP_MESSAGE_TIMEOUT]);
const scriptPath = join(__dirname, 'starter.js');
new Forker().execute({scriptPath, startupMessage, startupMessageTimeout});
