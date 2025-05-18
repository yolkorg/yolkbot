const globals = {};

if (typeof process !== 'undefined') {
    globals.fetch = (await import('undici')).fetch;
    globals.SocksProxyAgent = (await import('smallsocks')).SocksProxyAgent;
    globals.ProxyAgent = (await import('undici')).ProxyAgent;
    globals.WebSocket = (await import('ws')).default;
} else if (typeof window !== 'undefined') {
    globals.fetch = fetch.bind(window);
    globals.SocksProxyAgent = null;
    globals.ProxyAgent = class {};
    globals.WebSocket = WebSocket;
// eslint-disable-next-line custom/no-throw
} else throw new Error('unknown environment...could not detect node.js or browser...open an issue in the yolkbot github');

export default globals;