import globals from './env/globals.js';
import { UserAgent } from './constants/index.js';

export class yolkws {
    connected = false;
    autoReconnect = false;

    url = '';
    proxy = '';

    binaryType = '';

    maxRetries = 5;
    connectionTimeout = 5000;

    onopen = () => { };
    onmessage = () => { };
    onclose = () => { };
    onerror = () => { };

    constructor(url, proxy) {
        if (typeof process === 'undefined' && proxy) throw new Error('You cannot pass a proxy to a WebSocket in this environment.');

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
            this.socket = typeof process === 'undefined' ? new globals.WebSocket(this.url) : new globals.WebSocket(this.url, {
                proxy: this.proxy || null,
                headers: {
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'connection': 'Upgrade',
                    'origin': url.origin.replace('ws', 'http'),
                    'pragma': 'no-cache',
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
                this.connected = true;

                this.socket.removeEventListener('error', errorListener);

                this.socket.addEventListener('open', (...data) => this.onopen(...data));
                this.socket.addEventListener('message', (...data) => this.onmessage(...data));
                this.socket.addEventListener('close', (...data) => this.onclose(...data));
                this.socket.addEventListener('error', (...data) => this.onerror(...data));

                resolve(true);
            });

            this.socket.addEventListener('error', errorListener);

            this.socket.addEventListener('close', () => {
                if (this.connected) {
                    this.connected = false;
                    if (this.autoReconnect) setTimeout(async () => {
                        const didConnect = await this.tryConnect();
                        if (!didConnect) {
                            if (this.onclose) this.onclose();
                            console.error('tryConnect: failed to reconnect to', this.url, 'after 5 attempts.');
                            console.error('tryConnect: please check your internet connection & ensure your IP isn\'t blocked.');
                        }
                    }, 250);
                }
            });
        })
    }

    send(data) {
        return this.socket?.send(data);
    }

    close(data) {
        if (!this.socket) return;

        this.autoReconnect = false;

        const closeResponse = this.socket.close(data);

        if (this.socket.terminate) {
            try {
                this.socket.terminate();
            } catch { }
        }

        return closeResponse;
    }
}

export default yolkws;