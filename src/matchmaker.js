import EventEmitter from 'node:events';

import { SocksProxyAgent } from 'socks-proxy-agent';
import { WebSocket } from 'ws';

import { loginAnonymously } from '#api';
import { GameModes, PlayTypes, USER_AGENT } from '#constants';

class Matchmaker extends EventEmitter {
    connected = false;
    onceConnected = [];

    proxy = null;
    sessionId = '';

    forceClose = false;

    constructor(customSessionId, proxy) {
        super();

        if (customSessionId) {
            this.sessionId = customSessionId;
        } else {
            this.createSessionId();
        }

        if (proxy) {
            this.proxy = new SocksProxyAgent(proxy);
        }

        this.createSocket();
    }

    createSocket() {
        this.ws = new WebSocket('wss://shellshock.io/matchmaker/', {
            headers: {
                'user-agent': USER_AGENT,
                'accept-language': 'en-US,en;q=0.9'
            },
            agent: this.proxy
        });

        this.ws.onopen = () => {
            this.connected = true;
            if (this.sessionId) {
                this.onceConnected.forEach(func => func());
            }
        };

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.emit('msg', data);
        }

        this.ws.onclose = () => {
            if (this.forceClose) { return; }

            this.connected = false;
            this.createSocket();
        }
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }

    async createSessionId() {
        const j = await loginAnonymously(this.proxy);
        this.sessionId = j.sessionId;
        console.log('matchmaker got sessionid', this.sessionId);
        if (this.connected) { this.onceConnected.forEach(func => func()); }
    }

    // eslint-disable-next-line require-await
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
            console.log('fetching regions');

            this.on('msg', (data2) => {
                if (data2.command == 'regionList') {
                    this.regionList = data2.regionList;
                    res(data2.regionList);
                }
            });

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
        } else { console.log('regionList not found, not validating findGame region, use <Matchmaker>.regionList() to check region') }

        if (!params.mode) { throw new Error('did not specify a mode in findGame') }
        if (GameModes[params.mode] === undefined) { throw new Error('invalid mode in findGame, see GameModes for a list') }

        console.log('post-modification params', params);

        return new Promise((res) => {
            const opts = {
                command: 'findGame',
                region: params.region,
                playType: PlayTypes.joinPublic,
                gameType: GameModes[params.mode],
                sessionId: this.sessionId
            };

            this.on('msg', (data2) => {
                if (data2.command == 'gameFound') {
                    res(data2);
                }
            });

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
        this.forceClose = true;
        this.ws.close();
    }
}

export default Matchmaker;