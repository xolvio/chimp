import server from '../../meteor/server-base'

before(function() {
    server.connect();
});

export default server;