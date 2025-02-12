import fs from 'fs';

class Manager {
    constructor(players, use_proxies = false) {
        players ? this.players = players : this.players = []; // based
        this.nUpdates = 0;
        if (fs.existsSync('proxies.json') && use_proxies) {
            this.proxies = JSON.parse(fs.readFileSync('proxies.json'));
            console.log("Found proxies.json, there are", this.proxies.length, "proxies");
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].proxy = this.proxies[i % this.proxies.length];
                this.players[i].use_proxy = true;
            }
        } else {
            this.proxies = [];
        }
        this._update_times = [];
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
        this.players.forEach((player) => player.on(event, callback));
    }
    update() {
        let tmp = Date.now();
        this.nUpdates++;
        this.players.forEach((player) => player.update());
        this._update_times.push(Date.now() - tmp);
    }
    avgUpdateTime(n=100) {
        return this._update_times.slice(-n).reduce((a, b) => a + b, 0) / n;
    }
}

export default {
    Manager
}