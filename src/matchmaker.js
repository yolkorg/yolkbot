import { loginAnonymously } from '#api';
import { GameModes, PlayTypes, ProxiesEnabled } from '#constants';

import yolkws from './socket.js';

export class Matchmaker {
    connected = false;
    onceConnected = [];

    proxy = null;
    sessionId = '';

    onListeners = new Map();
    onceListeners = new Map();

    #forceClose = false;

    // sessionId: string, a custom session id
    // proxy: a socks5 proxy string
    // instance: a custom game instance
    constructor(params = {}) {
        if (!params.instance) params.instance = 'shellshock.io';

        if (params.sessionId) this.sessionId = params.sessionId;
        else this.#createSessionId(params.instance);

        if (params.proxy && !ProxiesEnabled) throw new Error('proxies do not work and hence are not supported in the browser');
        else if (params.proxy) this.proxy = params.proxy;

        this.#createSocket(params.instance);
    }

    async #createSocket(instance) {
        const attempt = async () => {
            try {
                this.ws = new yolkws(`wss://${instance}/matchmaker/`, this.proxy);
                this.ws.onerror = async (e) => {
                    console.error(e);
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

            if (this.sessionId) {
                this.onceConnected.forEach(func => func());
            }
        };

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.#emit('msg', data);
        }

        this.ws.onclose = () => {
            if (this.#forceClose) return;

            this.connected = false;
            this.#createSocket(instance);
        }
    }

    async #createSessionId(instance) {
        const anonLogin = await loginAnonymously(this.proxy, instance);
        if (!anonLogin || typeof anonLogin == 'string') this.#emit('authFail', anonLogin);

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

        return new Promise((res) => {
            const listener = (data2) => {
                if (data2.command == 'regionList') {
                    this.regionList = data2.regionList;
                    this.off('msg', listener);
                    res(data2.regionList);
                }
            };

            this.on('msg', listener);

            this.ws.onerror = (e2) => {
                throw new Error('Failed to get regions', e2);
            }

            this.ws.send(JSON.stringify({ command: 'regionList' }));
        });
    }

    async findPublicGame(params = {}) {
        await this.waitForConnect();

        // params.region
        // params.mode -> params.gameType
        // params.isPublic -> params.playType
        if (!params.region) { throw new Error('did not specify a region in findGame, use <Matchmaker>.getRegions() for a list') }

        if (this.regionList) {
            const region = this.regionList.find(r => r.id == params.region);
            if (!region) {
                throw new Error('did not find region in regionList, if you are attempting to force a region, avoid calling getRegions()')
            }
        } // else { console.log('regionList not found, not validating findGame region, use <Matchmaker>.regionList() to check region') }

        if (!params.mode) { throw new Error('did not specify a mode in findGame') }
        if (GameModes[params.mode] === undefined) { throw new Error('invalid mode in findGame, see GameModes for a list') }

        return new Promise((res) => {
            const opts = {
                command: 'findGame',
                region: params.region,
                playType: PlayTypes.joinPublic,
                gameType: GameModes[params.mode],
                sessionId: this.sessionId
            };

            const listener = (data2) => {
                if (data2.command == 'gameFound') {
                    this.off('msg', listener);
                    res(data2);
                }
            };

            this.on('msg', listener);

            this.ws.send(JSON.stringify(opts));
        });
    }

    getRandomRegion() {
        if (!this.regionList) {
            throw new Error('called getRandomRegion() without region list cached, use <Matchmaker>.getRegions() before getRandomRegion()');
        }
        return this.regionList[Math.floor(Math.random() * this.regionList.length)].id;
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
}

export default Matchmaker;
