import globals from './globals.js';
import { IsBrowser, ProxiesEnabled, UserAgent } from './constants/index.js';

/*
const generateWebSocketKey = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}
*/

class yolkws {
    url = '';
    proxy = '';

    binaryType = '';

    maxRetries = 5;

    constructor(url, proxy) {
        this.url = url;

        if (!ProxiesEnabled && proxy) {
            console.error('You cannot pass a proxy to a yolkws in this environment.');
            process.exit(1);
        }

        this.proxy = proxy;
    }

    async tryConnect(tries = 1) {
        const url = new URL(this.url);

        const retryOrQuit = async () => {
            if (tries === 5) return false;
            return await this.tryConnect(tries + 1);
        }

        try {
            this.socket = IsBrowser ? new globals.WebSocket(this.url) : new globals.WebSocket(this.url, {
                agent: this.proxy ? new globals.SocksProxyAgent(this.proxy) : undefined,
                headers: {
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'connection': 'Upgrade',
                    'host': url.host,
                    'origin': url.origin.replace('ws', 'http'),
                    'pragma': 'no-cache',
                    'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits',
                    // 'sec-websocket-key': generateWebSocketKey(),
                    // 'sec-websocket-version': '13',
                    // 'upgrade': 'websocket',
                    'user-agent': UserAgent
                }
            });

            if (this.binaryType) this.socket.binaryType = this.binaryType;
        } catch (e) {
            console.error(`Failed to connect on try ${tries}, trying again...`, e);
            return await retryOrQuit();
        }

        return new Promise((resolve) => {
            const timeout = setTimeout(async () => {
                if (IsBrowser) this.socket.close();
                else this.socket.terminate();
                resolve(await retryOrQuit());
            }, 5000);

            const errorListener = async (e) => {
                clearTimeout(timeout);
                console.error('WebSocket error', e);
                resolve(await retryOrQuit());
            };

            this.socket.addEventListener('open', async () => {
                clearTimeout(timeout);
                this.socket.removeEventListener('error', errorListener);
                resolve(true);
            });

            this.socket.addEventListener('error', errorListener);
        })
    }

    get onmessage() {
        return this.socket?.onmessage;
    }

    set onmessage(handler) {
        if (this.socket) this.socket.onmessage = handler;
    }

    get onclose() {
        return this.socket?.onclose;
    }

    set onclose(handler) {
        if (this.socket) this.socket.onclose = handler;
    }

    get close() {
        return this.socket?.close;
    }
}

export default yolkws;