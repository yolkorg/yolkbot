import globals from './env/globals.js';
import { UserAgent } from './constants/index.js';

class yolkws {
    url = '';
    proxy = '';

    binaryType = '';

    maxRetries = 5;
    connectionTimeout = 5000;

    constructor(url, proxy) {
        if (globals.isBrowser && proxy) throw new Error('You cannot pass a proxy to a WebSocket in a browser.');

        this.url = url;
        this.proxy = proxy;
    }

    async tryConnect(tries = 1) {
        const url = new URL(this.url);

        const retryOrQuit = async () => {
            if (tries === 5) return false;
            return await this.tryConnect(tries + 1);
        }

        try {
            this.socket = globals.isBrowser ? new globals.WebSocket(this.url) : new globals.WebSocket(this.url, {
                proxy: this.proxy || null,
                headers: {
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'connection': 'Upgrade',
                    'origin': url.origin.replace('ws', 'http'),
                    'pragma': 'no-cache',
                    'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits',
                    'user-agent': UserAgent
                }
            });

            if (this.binaryType) this.socket.binaryType = this.binaryType;
        } catch (e) {
            console.error(`Failed to connect on try ${tries}, trying again...`, e);
            return await retryOrQuit();
        }

        if (this.onBeforeConnect) this.onBeforeConnect();

        return new Promise((resolve) => {
            const timeout = setTimeout(async () => {
                this.socket.close();
                resolve(await retryOrQuit());
            }, this.connectionTimeout);

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

    // listeners

    get onmessage() {
        return this.socket?.onmessage;
    }

    set onmessage(handler) {
        if (this.socket) this.socket.onmessage = handler;
        else console.error('set onmessage before socket existed');
    }

    get onclose() {
        return this.socket?.onclose;
    }

    set onclose(handler) {
        if (this.socket) this.socket.onclose = handler;
        else console.error('set onclose before socket existed');
    }

    get onerror() {
        return this.socket?.onerror;
    }

    set onerror(handler) {
        if (this.socket) this.socket.onerror = handler;
        else console.error('set onclose before socket existed');
    }

    // methods

    send(data) {
        return this.socket?.send(data);
    }

    close(data) {
        return this.socket?.close(data);
    }
}

export default yolkws;