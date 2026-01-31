import { WWWebSocket } from 'wwws';

import iFetch from './fetch.js';

declare var DedicatedWorkerGlobalScope: any;
declare var Cloudflare: any;
declare var WebSocketPair: any;
declare var Deno: any;

const isBrowser = typeof window !== 'undefined' && typeof HTMLElement !== 'undefined';
const isWebWorker = typeof self !== 'undefined' && typeof DedicatedWorkerGlobalScope !== 'undefined' && self instanceof DedicatedWorkerGlobalScope;
const isCloudflareWorker = typeof WebSocketPair !== 'undefined' && typeof Cloudflare !== 'undefined';

const isUnsandboxedElectron = typeof process === 'object' && process.versions?.electron && process.versions?.node && typeof window !== 'undefined' && typeof window.require !== 'undefined';

const isNode = typeof process !== 'undefined' && 'moduleLoadList' in process && (process.moduleLoadList as string[]).length > 0;
const isDeno = typeof Deno !== 'undefined' as const;
const isBun = typeof Bun !== 'undefined' as const;

if (!isBrowser && !isCloudflareWorker && !isWebWorker && !isUnsandboxedElectron && !isNode && !isDeno && !isBun)
    throw new Error('yolkbot doesn\'t know how to run in this environment. Please open an issue on GitHub with information on where you run yolkbot.');

const isIsolated = !isNode && !isDeno && !isBun && !isUnsandboxedElectron;

interface FetchResponse {
    json: () => any;
    text: () => string;
}

export const globals = {
    isIsolated,
    fetch: isIsolated ? (...args: unknown[]) => (globalThis.fetch as unknown as (...args: unknown[]) => Promise<FetchResponse>)(...args) : iFetch,
    WebSocket: isIsolated ? globalThis.WebSocket : WWWebSocket
} as const;

export default globals;