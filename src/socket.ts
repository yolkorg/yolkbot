import globals from './env/globals.js';
import UserAgent from './env/userAgent.js';

import type { WWWebSocket } from 'wwws';

interface yolkwsParams {
    proxy?: string | null;
    errorLogger?: (...args: any[]) => void;
}

export class yolkws {
    connected = false;
    autoReconnect = false;

    url: string;
    proxy: string | null;

    binaryType = '';

    connectionTimeout = 5000;

    socket: WebSocket | WWWebSocket | null = null;

    errorLogger = (...args: any[]) => console.error(...args);

    onBeforeConnect: (() => void) | null = null;

    onopen = () => { };
    onmessage = (event: MessageEvent) => { };
    onclose = (event: CloseEvent) => { };
    onerror = (event: Event) => { };

    constructor(url: string, params: Partial<yolkwsParams> = {}) {
        if (typeof params !== 'object') params = {};

        if (typeof process === 'undefined' && params.proxy)
            throw new Error('You cannot pass a proxy to a WebSocket in this environment.');

        this.url = url;
        this.proxy = params.proxy || null;

        if (typeof params.errorLogger === 'function') this.errorLogger = params.errorLogger;
    }

    async tryConnect(tries = 1): Promise<boolean> {
        const url = new URL(this.url);

        const retryOrQuit = async () => {
            if (tries === 5) return false;
            return await this.tryConnect(tries + 1);
        }

        try {
            this.socket = globals.isIsolated ? new globals.WebSocket(this.url) : new (globals.WebSocket as typeof WWWebSocket)(this.url, {
                proxy: this.proxy || undefined,
                headers: {
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'connection': 'Upgrade',
                    'origin': (url.origin.replace('ws', 'http')) as string,
                    'pragma': 'no-cache',
                    'user-agent': (UserAgent as string)
                }
            });

            if (this.binaryType) this.socket.binaryType = this.binaryType;
        } catch (e) {
            this.errorLogger(`Failed to connect on try ${tries}, trying again...`, e);
            return await retryOrQuit();
        }

        if (this.onBeforeConnect) this.onBeforeConnect();

        return new Promise((resolve) => {
            if (!this.socket) return this.errorLogger('socket is null in tryConnect promise...this should NEVER happen, open an issue');

            const timeout = setTimeout(async () => {
                if (this.socket) this.socket.close();
                resolve(await retryOrQuit());
            }, this.connectionTimeout);

            const errorListener = async (e: Event) => {
                clearTimeout(timeout);
                this.errorLogger('WebSocket error', e);
                resolve(await retryOrQuit());
            };

            this.socket.addEventListener('open', async () => {
                if (!this.socket) return;

                clearTimeout(timeout);
                this.connected = true;

                this.onopen();

                this.socket.removeEventListener('error', errorListener);

                this.socket.addEventListener('message', (messageEvent) => this.onmessage(messageEvent));
                this.socket.addEventListener('close', (closeEvent) => !this.autoReconnect && this.onclose(closeEvent));
                this.socket.addEventListener('error', (event) => this.onerror(event));

                resolve(true);
            });

            this.socket.addEventListener('error', errorListener);

            this.socket.addEventListener('close', (event) => {
                if (this.connected) {
                    this.connected = false;
                    if (this.autoReconnect) setTimeout(async () => {
                        const didConnect = await this.tryConnect();
                        if (!didConnect) {
                            if (this.onclose) this.onclose(event);
                            this.errorLogger('tryConnect: failed to reconnect to', this.url, 'after 5 attempts.');
                            this.errorLogger('tryConnect: please check your internet connection & ensure your IP isn\'t blocked.');
                        }
                    }, 250);
                }
            });
        })
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>) {
        return this.socket?.send(data);
    }

    close(code?: number) {
        if (!this.socket) return;

        this.autoReconnect = false;

        if ('terminate' in this.socket && typeof this.socket.terminate === 'function') {
            try {
                this.socket.terminate();
            } catch { }
        } else this.socket.close(code);
    }
}

export default yolkws;