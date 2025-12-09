import WWWebSocket from 'wwws';
import iFetch from './fetch';

declare const globals: {
    fetch: typeof globalThis.fetch | typeof iFetch,
    WebSocket: typeof globalThis.WebSocket | typeof WWWebSocket
};

export default globals;