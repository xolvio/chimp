import DDP from './DDP';

if (!process.env['DDP_URL']) {
    throw Error("If you want to use meteor/server please set up the ROOT_URL env first" +
        "(e.g. export DDP_URL='http://localhost:3000') ")
}

const server = new DDP(process.env['DDP_URL']);

export default server;