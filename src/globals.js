import report from './reporter.js';

const globals = {};

const isWorker = typeof WebSocketPair !== 'undefined';
const isNode = typeof process !== 'undefined' && !isWorker;
const isBrowser = typeof window !== 'undefined';

if (!isBrowser && !isWorker && !isNode) report({ tag: 'uenv' });

globals.SocksProxyAgent = isNode ? (await import('smallsocks')).SocksProxyAgent : null;
globals.ProxyAgent = isNode ? (await import('undici')).ProxyAgent : class {};
globals.WebSocket = isBrowser || isWorker ? self.WebSocket : await import('ws'); 

export default globals;