import URL from 'url';
import DDPClient from 'xolvio-ddp';

function DDP(url) {
    console.log('[chimp][ddp] creating DDP wrapper');
    this.url = this._getUrl(url);

    const options = this._getOptions();
    console.log('[chimp][ddp] Connecting to DDP server');
    return new DDPClient(options)
}

DDP.prototype._getUrl = function (ddpHost) {
    if (ddpHost.indexOf('http://') === -1 && ddpHost.indexOf('https://') === -1) {
        throw new Error('[chimp][ddp] DDP url must contain the protocol');
    }
    return URL.parse(ddpHost);
};


DDP.prototype._getOptions = function () {
    return {
        host: this.url.hostname,
        port: this.url.port,
        ssl: this.url.protocol === 'https:',
        path: '/websocket',
        autoReconnect: true,
        autoReconnectTimer: 500,
        maintainCollections: true,
        ddpVersion: '1',
        useSockJs: this.url.pathname !== '/'
    };
};

export default DDP;
