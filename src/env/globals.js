import { WWWebSocket } from 'wwws';

import iFetch from './fetch.js';

const globals = {};

const isBrowser = typeof window !== 'undefined' && typeof HTMLElement !== 'undefined';
const isWebWorker = (typeof self !== 'undefined') && (self.constructor.name === 'DedicatedWorkerGlobalScope');
const isCloudflareWorker = typeof WebSocketPair !== 'undefined' && typeof Cloudflare !== 'undefined';

const isNode = typeof process !== 'undefined' && process.moduleLoadList?.length > 0;
const isDeno = typeof Deno !== 'undefined';
const isBun = typeof Bun !== 'undefined';

if (!isBrowser && !isCloudflareWorker && !isWebWorker && !isNode && !isDeno && !isBun)
    throw new Error('yolkbot doesn\'t know how to run in this environment. Please open an issue on GitHub with information on where you run yolkbot.');

globals.isBrowser = isBrowser || isWebWorker;
globals.isIsolated = !isNode && !isDeno && !isBun;

globals.fetch = globals.isIsolated ? (...args) => globalThis.fetch(...args) : iFetch;
globals.WebSocket = globals.isIsolated ? globalThis.WebSocket : WWWebSocket;

export default globals;