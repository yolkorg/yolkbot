import API from './api.js';
import { GameModes, PlayTypes, ProxiesEnabled } from './constants/index.js';
import { validate } from './wasm/wrapper.js';

import yolkws from './socket.js';

export class Matchmaker {
    connected = false;
    onceConnected = [];

    proxy = null;
    sessionId = '';

    onListeners = new Map();
    onceListeners = new Map();

    #forceClose = false;

    constructor(params = {}) {
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
        const attempt = async () => {
            try {
                this.ws = new yolkws(`${protocol}://${instance}/matchmaker/`, this.proxy);
                this.ws.onerror = async (e) => {
                    this.#processError(e);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return await attempt();
                }
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await attempt();
            }
        }

        await attempt();

        this.ws.onopen = () => {
            this.connected = true;
            this.ws.onerror = null;

            if (this.sessionId || noLogin)
                this.onceConnected.forEach(func => func());
        };

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.command === 'validateUUID')
                this.ws.send(JSON.stringify({ command: 'validateUUID', hash: validate(data.uuid) }));

            this.#emit('msg', data);
        }

        this.ws.onclose = () => {
            if (this.#forceClose) return;

            this.connected = false;
            this.#createSocket(instance);
        }
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

    async findPublicGame(params = {}) {
        await this.waitForConnect();

        if (!params.region && !this.regionList)
            return this.#processError('pass a region to createPrivateGame or call getRegions() for a random one');

        if (!params.region) opts.region = this.getRandomRegion();

        if (this.regionList && !this.regionList.find(r => r.id === params.region))
            return this.#processError('did not find region in regionList');

        if (!params.mode) return this.#processError('pass a mode to findPublicGame')
        if (!GameModes[params.mode]) return this.#processError('invalid mode passed to findPublicGame, see GameModes for a list')

        return new Promise((res) => {
            const opts = {
                command: 'findGame',
                region: params.region,
                playType: PlayTypes.joinPublic,
                gameType: GameModes[params.mode],
                sessionId: this.sessionId
            };

            const listener = (data2) => {
                if (data2.command === 'gameFound') {
                    this.off('msg', listener);
                    res(data2);
                }
            };

            this.on('msg', listener);

            this.ws.send(JSON.stringify(opts));
        });
    }

    getRandomRegion() {
        if (!this.regionList) this.#processError('use <Matchmaker>.getRegions() before getRandomRegion()');
        else return this.regionList[Math.floor(Math.random() * this.regionList.length)].id;
    }

    getRandomGameMode() {
        const gameModeArray = Object.keys(GameModes);
        return gameModeArray[Math.floor(Math.random() * gameModeArray.length)];
    }

    close() {
        this.#forceClose = true;
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
        // eslint-disable-next-line custom/no-throw
        else throw error;
    }
}

export default Matchmaker;
