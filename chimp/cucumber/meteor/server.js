import {Before, After} from 'cucumber';
import server from '../../meteor/server-base'

Before(function() {
    server.connect();
});

export default server;