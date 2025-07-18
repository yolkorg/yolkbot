import API from './api.js';
import { ProxiesEnabled } from './constants/index.js';
import { validate } from './wasm/wrapper.js';

import yolkws from './socket.js';

export class Matchmaker {
    connected = false;
    onceConnected = [];

    regionList = [];

    proxy = null;
    sessionId = '';

    onListeners = new Map();
    onceListeners = new Map();

    #noExitOnError = false;
    #forceClose = false;

    constructor(params = {}) {
        this.#noExitOnError = params.noExitOnError || false;

        if (!params.instance) params.instance = 'shellshock.io';
        if (!params.protocol) params.protocol = 'wss';

        if (!params.api) this.api = new API({ instance: params.instance, protocol: params.protocol, proxy: params.proxy });
        else this.api = params.api;

        if (params.sessionId || params.noLogin) this.sessionId = params.sessionId;
        else this.#createSessionId();

        if (params.proxy && !ProxiesEnabled) this.#processError('proxies do not work and hence are not supported in the browser');
        else if (params.proxy) this.proxy = params.proxy;

        this.#createSocket(params.instance, params.protocol, params.noLogin);
    }

    async #createSocket(instance, protocol, noLogin) {
        this.ws = new yolkws(`${protocol}://${instance}/matchmaker/`, this.proxy);

        const didConnect = await this.ws.tryConnect();
        if (!didConnect) return this.#processError('WebSocket did not connect...');

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.command === 'validateUUID')
                return this.ws.send(JSON.stringify({ command: 'validateUUID', hash: validate(data.uuid) }));

            this.#emit('msg', data);
        }

        this.ws.onclose = () => {
            this.connected = false;
            if (!this.#forceClose) this.#createSocket(instance, protocol, noLogin);
        }

        this.connected = true;
        if (this.sessionId || noLogin) this.onceConnected.forEach(func => func());
    }

    async #createSessionId() {
        const anonLogin = await this.api.loginAnonymously();
        if (!anonLogin || typeof anonLogin === 'string') this.#emit('authFail', anonLogin);

        this.sessionId = anonLogin.sessionId;
        if (this.connected) this.onceConnected.forEach(func => func());
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }

    async waitForConnect() {
        return new Promise((res) => {
            if (this.connected) {
                res();
            } else {
                this.onceConnected.push(res);
            }
        });
    }

    async getRegions() {
        await this.waitForConnect();

        const that = this;

        return new Promise((res) => {
            const listener = (data2) => {
                if (data2.command === 'regionList') {
                    this.regionList = data2.regionList;
                    this.off('msg', listener);
                    res(data2.regionList);
                }
            };

            this.on('msg', listener);

            this.ws.onerror = (e2) => that.#processError('failed to get regions', e2);

            this.ws.send(JSON.stringify({ command: 'regionList' }));
        });
    }

    close() {
        this.#forceClose = true;
        this.connected = false;
        this.ws.close();
    }

    on(event, callback) {
        if (!this.onListeners.has(event)) {
            this.onListeners.set(event, []);
        }

        this.onListeners.get(event).push(callback);
    }

    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }

        this.onceListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.onListeners.has(event)) {
            this.onListeners.set(event, this.onListeners.get(event).filter(func => func !== callback));
        }

        if (this.onceListeners.has(event)) {
            this.onceListeners.set(event, this.onceListeners.get(event).filter(func => func !== callback));
        }
    }

    #emit(event, ...args) {
        if (this.onListeners.has(event)) {
            this.onListeners.get(event).forEach(func => func(...args));
        }

        if (this.onceListeners.has(event)) {
            this.onceListeners.get(event).forEach(func => func(...args));
            this.onceListeners.delete(event);
        }
    }

    #processError(error) {
        if (this.onListeners.has('error')) this.#emit('error', error);
        else {
            console.error(error);
            if (!this.#noExitOnError) process.exit(1);
        }
    }
}

export default Matchmaker;
