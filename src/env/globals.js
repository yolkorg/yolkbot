import iFetch from './fetch.js';

const globals = {};

const isBrowser = typeof window !== 'undefined' && typeof HTMLElement !== 'undefined';
const isWorker = typeof WebSocketPair !== 'undefined' && typeof Cloudflare !== 'undefined';

const isNode = typeof process !== 'undefined' && process.moduleLoadList?.length > 0;
const isDeno = typeof Deno !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent?.startsWith('Deno/');
const isBun = typeof Bun !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent?.startsWith('Bun/');

if (!isBrowser && !isWorker && !isNode && !isDeno && !isBun)
    throw new Error('yolkbot doesn\'t know how to run in this environment. Please open an issue on GitHub with information on where you run yolkbot.');

globals.fetch = isBrowser || isWorker ? globalThis.fetch : iFetch;
globals.WebSocket = isBrowser || isWorker ? globalThis.WebSocket : (await import('wwws')).WWWebSocket;

export default globals;