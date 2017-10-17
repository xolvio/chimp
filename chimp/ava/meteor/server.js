import test from 'ava';
import server from '../../meteor/server-base'

test.before(() => {
  server.connect();
});

export default server;