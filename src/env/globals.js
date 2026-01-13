import iFetch from './fetch.js';

const globals = {};

const isBrowser = typeof window !== 'undefined' && typeof HTMLElement !== 'undefined';
const isWorker = typeof WebSocketPair !== 'undefined' && typeof Cloudflare !== 'undefined';

const isNode = typeof process !== 'undefined' && process.moduleLoadList?.length > 0;
const isDeno = typeof Deno !== 'undefined';
const isBun = typeof Bun !== 'undefined';

if (!isBrowser && !isWorker && !isNode && !isDeno && !isBun)
    throw new Error('yolkbot doesn\'t know how to run in this environment. Please open an issue on GitHub with information on where you run yolkbot.');

import { WWWebSocket } from 'wwws';

globals.fetch = typeof process === 'undefined' ? (...args) => globalThis.fetch(...args) : iFetch;
globals.WebSocket = typeof process === 'undefined' ? globalThis.WebSocket : WWWebSocket;

export default globals;