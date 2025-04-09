const globals = {};

if (typeof process !== 'undefined') {
    globals.fetch = (await import('undici')).fetch;
    globals.SocksProxyAgent = (await import('smallsocks')).SocksProxyAgent;
    globals.ProxyAgent = (await import('undici')).ProxyAgent;
    globals.WebSocket = (await import('ws')).default;
} else {
    globals.fetch = fetch;
    globals.SocksProxyAgent = undefined;
    globals.ProxyAgent = class {};
    globals.WebSocket = WebSocket;
}

export default globals;