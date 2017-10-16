import server from '../../meteor/server-base'

beforeAll(function() {
    server.connect();
});

export default server;