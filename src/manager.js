import fs from 'fs';
import path from 'path';

const proxyJSONPath = path.join(import.meta.dirname, '..', 'data', 'proxies.json');

export class Manager {
    _updateTimes = [];

    constructor(players, useProxies = false) {
        players ? this.players = players : this.players = []; // based
        this.nUpdates = 0;
        if (fs.existsSync(proxyJSONPath) && useProxies) {
            this.proxies = JSON.parse(proxyJSONPath);
            console.log('Found proxies.json, there are', this.proxies.length, 'proxies');
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].proxy = this.proxies[i % this.proxies.length];
                this.players[i].useProxy = true;
            }
        } else { this.proxies = []; }
    }

    async login(emails, passwords) {
        await Promise.all(this.players.map(async (player, i) => {
            await player.login(emails[i], passwords[i]);
        }));
    }

    async join(code) {
        await Promise.all(this.players.map(async (player) => {
            await player.join(code);
        }));
    }

    dispatch(dispatch) {
        this.players.forEach((player) => player.dispatch(dispatch));
    }

    drain(nPackets = -1) {
        this.players.forEach((player) => player.drain(nPackets));
    }

    on(event, callback) {
        this.players.forEach((player) => player.on(event, (...args) => callback(player, ...args)));
    }

    update() {
        const tmp = Date.now();
        this.nUpdates++;
        this.players.forEach((player) => player.update());
        this._updateTimes.push(Date.now() - tmp);
    }

    avgUpdateTime(n = 100) {
        return this._updateTimes.slice(-n).reduce((a, b) => a + b, 0) / n;
    }

    getSessionId() {
        const authorizedPlayers = this.players.filter((player) => player.loginData?.sessionId);
        if (authorizedPlayers.length) {
            const randomPlayer = Math.floor(Math.random() * authorizedPlayers.length);
            return randomPlayer?.loginData?.sessionId;
        } else return null;
    }
}

export default Manager;