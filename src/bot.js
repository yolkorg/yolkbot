import { loginAnonymously, loginWithCredentials } from '#api';

import CommIn from './comm/CommIn.js';
import CommOut from './comm/CommOut.js';
import { CommCode } from './comm/Codes.js';

import GamePlayer from './bot/GamePlayer.js';
import Matchmaker from './matchmaker.js';
import yolkws from './socket.js';

import {
    CollectTypes,
    CoopStates,
    findItemById,
    GameActions,
    GameModes,
    GameOptionFlags,
    GunList,
    IsBrowser,
    Movements,
    PlayTypes,
    ShellStreaks
} from '#constants';

import LookAtPosDispatch from './dispatches/LookAtPosDispatch.js';
import MovementDispatch from './dispatches/MovementDispatch.js';

import { NodeList } from './pathing/mapnode.js';

import { Maps } from './constants/maps.js';

const CoopStagesById = Object.fromEntries(Object.entries(CoopStates).map(([key, value]) => [value, key]));
const GameModesById = Object.fromEntries(Object.entries(GameModes).map(([key, value]) => [value, key]));

export class Bot {
    // params.name - the bot name
    // params.proxy - a socks(4|5) proxy
    // params.doUpdate - whether to auto update
    // params.updateInterval - the auto update interval
    // params.doPing - whether to auto ping (for bot.<ping>)
    // params.pingInterval - the ping interval
    // params.doPathing - whether to run pathfinding logic
    // params.instance - a custom shell URL to run requests through
    constructor(params = {}) {
        if (params.proxy && IsBrowser)
            throw new Error('proxies do not work and hence are not supported in the browser');

        this.proxy = params.proxy || '';
        this.name = params.name || Math.random().toString(36).substring(8);

        this.autoPing = params.doPing || true;
        this.autoUpdate = params.doUpdate || true;
        this.disablePathing = !params.doPathing || true;

        this.pingInterval = params.pingInterval || 1000;
        this.updateInterval = params.updateInterval || 5;

        this.instance = params.instance || 'shellshock.io';

        this._hooks = {};
        this._globalHooks = [];
        this._liveCallbacks = [];

        // private information NOT FOR OTHER PLAYERS!!
        this.state = {
            loggedIn: false,
            gameFound: false,

            // once we implement more packets these may be moved to "players"
            reloading: false,
            swappingGun: false,
            usingMelee: false,

            // shots fired ezzz
            shotsFired: 0
        }

        this.players = {}
        this.me = new GamePlayer(this.id, 0, {})

        this.game = {
            raw: {}, // matchmaker response
            code: '',

            // data given on sign in
            gameModeId: 0, // assume ffa
            gameMode: GameModesById[0], // assume ffa
            mapIdx: 0,
            map: {
                filename: '',
                hash: '',
                name: '',
                modes: {
                    FFA: false,
                    Teams: false,
                    Spatula: false,
                    King: false
                },
                availability: 'both',
                numPlayers: '18',
                raw: {},
                nodes: {}
            },
            playerLimit: 0,
            isGameOwner: false,
            isPrivate: true,

            // game options
            options: {
                gravity: 1,
                damage: 1,
                healthRegen: 1,
                locked: false,
                noTeamChange: false,
                noTeamShuffle: false,
                // array of weapons from eggk to trihard
                // false = alloed to use
                // true = cannot use
                weaponsDisabled: Array(7).fill(false),
                mustUseSecondary: false // if weaponsDisabled is ALL true
            },

            // ammos/grenades on the ground that can be picked up
            collectables: [[], []],

            // data from metaGame
            teamScore: [0, 0, 0], // [0, blue, red] - no clue what 1st index is for

            // data from spatula game
            spatula: {
                coords: { x: 0, y: 0, z: 0 },
                controlledBy: 0,
                controlledByTeam: 0
            },

            // data from kotc
            stage: CoopStates.capturing,
            activeZone: 0,
            capturing: 0,
            captureProgress: 0,
            numCapturing: 0,
            stageName: '',
            capturePercent: 0.0
        }

        this.account = {
            // used for auth
            firebaseId: '',
            sessionId: '',
            session: '',

            // used for skin changing
            loadout: {
                hatId: null,
                meleeId: 0,
                stampId: null,
                classIdx: 0,
                colorIdx: 0,
                grenadeId: 0,
                primaryId: [
                    3100, 3600,
                    3400, 3800,
                    4000, 4200,
                    4500
                ],
                secondaryId: new Array(7).fill(3000),
                stampPositionX: 0,
                stampPositionY: 0
            },
            ownedItemIds: [],
            vip: false,

            // used for chat checking
            accountAge: 0,
            emailVerified: false,

            // balance is tracked
            eggBalance: 0,

            // raw login
            rawLoginData: {}
        };

        this._dispatches = [];
        this._packetQueue = [];

        this.gameSocket = null;

        this.ping = 0;
        this.lastPingTime = -1;

        this.lastDeathTime = -1;
        this.lastChatTime = -1;

        this.lastUpdateTime = -1;
        this.nUpdates = 0;

        this.controlKeys = 0;

        this.initTime = Date.now();

        this.pathing = {
            nodeList: null,
            followingPath: false,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }
    }

    async login(email, pass) {
        // const time = Date.now();

        this.email = email;
        this.pass = pass;

        const loginData = await loginWithCredentials(email, pass, this.proxy, this.instance);

        if (typeof loginData == 'string') {
            this.#emit('authFail', loginData);
            return false;
        }

        if (loginData.banRemaining) {
            this.#emit('banned', loginData.banRemaining);
            return false;
        }

        this.state.loggedIn = true;

        this.account.rawLoginData = loginData;

        this.account.accountAge = loginData.accountAge;
        this.account.eggBalance = loginData.currentBalance;
        this.account.emailVerified = loginData.emailVerified;
        this.account.firebaseId = loginData.firebaseId;
        this.account.loadout = loginData.loadout;
        this.account.ownedItemIds = loginData.ownedItemIds;
        this.account.sessionId = loginData.sessionId;
        this.account.vip = loginData.upgradeProductId && !loginData.upgradeIsExpired;

        // console.log('Logged in successfully. Time:', Date.now() - time, 'ms');

        return this.account;
    }

    dispatch(disp) {
        this._dispatches.push(disp);
    }

    drain() {
        for (let i = 0; i < this._dispatches.length; i++) {
            const disp = this._dispatches[i];
            if (disp.check(this)) {
                disp.execute(this);
                this._dispatches.splice(i, 1);
                return; // only 1 dispatch per update
            } else {
                // console.log("Dispatch failed", this.state.joinedGame, this.lastChatTime)
            }
        }
    }

    async #anonLogin() {
        const loginData = await loginAnonymously(this.proxy, this.instance);

        if (typeof loginData == 'string') {
            this.#emit('authFail', loginData);
            return false;
        }

        this.state.loggedIn = true;

        this.account.rawLoginData = loginData;

        this.account.accountAge = loginData.accountAge;
        this.account.eggBalance = loginData.currentBalance;
        this.account.emailVerified = loginData.emailVerified;
        this.account.firebaseId = loginData.firebaseId;
        this.account.loadout = loginData.loadout;
        this.account.ownedItemIds = loginData.ownedItemIds;
        this.account.session = loginData.session;
        this.account.sessionId = loginData.sessionId;
        this.account.vip = false;

        return this.account;
    }

    async initMatchmaker() {
        if (!this.state.loggedIn) {
            // console.log('Not logged in, attempting to create anonymous user...');
            const anonLogin = await this.#anonLogin();
            if (!anonLogin) return false;
        }

        if (!this.matchmaker) {
            // console.log('No matchmaker, creating instance')
            this.matchmaker = new Matchmaker({
                sessionId: this.account.sessionId,
                proxy: this.proxy,
                instance: this.instance
            });

            this.matchmaker.on('authFail', (data) => this.#emit('authFail', data));

            await this.matchmaker.getRegions();
        }

        return true;
    }

    async #joinGameWithCode(code) {
        if (!await this.initMatchmaker()) return false;

        const listener = (mes) => {
            if (mes.command == 'gameFound') {
                this.game.raw = mes;
                this.game.code = code;
                delete this.game.raw.command; // pissed me off

                this.gameFound = true;
            }

            if (mes.error && mes.error == 'gameNotFound')
                throw new Error(`Game ${code} not found (likely expired).`)
        };

        this.matchmaker.on('msg', listener);

        this.matchmaker.send({
            command: 'joinGame',
            id: code,
            observe: false,
            sessionId: this.account.sessionId
        })

        while (!this.gameFound) await new Promise(r => setTimeout(r, 10));

        this.matchmaker.off('msg', listener);
    }

    async #onGameMesssage(msg) { // to minify with vscode
        CommIn.init(msg.data);

        let out;
        const cmd = CommIn.unPackInt8U();

        switch (cmd) {
            case CommCode.socketReady:
                out = CommOut.getBuffer();
                out.packInt8(CommCode.joinGame);

                out.packString(this.name); // name
                out.packString(this.game.raw.uuid); // game id

                out.packInt8(0); // hidebadge
                out.packInt8(0); // weapon choice

                out.packInt32(this.account.session); // session int
                out.packString(this.account.firebaseId); // firebase id
                out.packString(this.account.sessionId); // session id

                out.send(this.gameSocket);
                break;

            case CommCode.gameJoined:
                this.me.id = CommIn.unPackInt8U();
                // console.log("My id is:", this.me.id);
                this.me.team = CommIn.unPackInt8U();
                // console.log("My team is:", this.me.team);
                this.game.gameModeId = CommIn.unPackInt8U(); // aka gameType
                this.game.gameMode = GameModesById[this.game.gameModeId];
                // console.log("Gametype:", this.game.gameMode, this.game.gameModeId);
                this.game.mapIdx = CommIn.unPackInt8U();
                this.game.map = Maps[this.game.mapIdx];
                if (!this.disablePathing) {
                    this.game.map.raw = await this.#fetchMap(this.game.map.filename, this.game.map.hash);
                    this.pathing.nodeList = new NodeList(this.game.map.raw);
                }
                // console.log("Map:", this.game.map);
                this.game.playerLimit = CommIn.unPackInt8U();
                // console.log("Player limit:", this.game.playerLimit);
                this.game.isGameOwner = CommIn.unPackInt8U() == 1;
                // console.log("Is game owner:", this.game.isGameOwner);
                this.game.isPrivate = CommIn.unPackInt8U() == 1;
                // console.log("Is private game:", this.game.isPrivate);

                // console.log('Successfully joined game.');
                this.state.joinedGame = true;
                this.lastDeathTime = Date.now();

                break;

            case CommCode.eventModifier:
                // console.log("Echoed eventModifier"); // why the fuck do you need to do this
                out = CommOut.getBuffer();
                out.packInt8(CommCode.eventModifier);
                out.send(this.gameSocket);
                break;

            case CommCode.requestGameOptions: {
                out = CommOut.getBuffer();
                out.packInt8(CommCode.gameOptions);
                out.packInt8(this.game.options.gravity * 4);
                out.packInt8(this.game.options.damage * 4);
                out.packInt8(this.game.options.healthRegen * 4);

                const flags =
                    (this.game.options.locked ? 1 : 0) |
                    (this.game.options.noTeamChange ? 2 : 0) |
                    (this.game.options.noTeamShuffle ? 4 : 0);

                out.packInt8(flags);

                this.game.options.weaponsDisabled.forEach((v) => {
                    out.packInt8(v ? 1 : 0);
                });
                break;
            }

            default:
                try {
                    const inferredCode = Object.entries(CommCode).filter(([, v]) => v == cmd)[0][0];
                    console.error('onGameMessage: Received but did not handle a:', inferredCode);
                    // packet could potentially not exist, then [0][0] will error
                } catch {
                    console.error('onGameMessage: Unexpected packet received during startup: ' + cmd);
                }
        }
    }

    // region - a region id ('useast', 'germany', etc)
    // mode - a mode name that corresponds to a GameMode id
    // map - the name of a map
    async createPrivateGame(opts = {}) {
        if (!await this.initMatchmaker()) return false;

        if (!opts.region) { throw new Error('pass a region: createPrivateGame({ region: "useast", ... })') }
        if (!this.matchmaker.regionList.find(r => r.id == opts.region))
            throw new Error('invalid region, see <bot>.matchmaker.regionList for a region list (pass an "id")')

        if (!opts.mode) throw new Error('pass a mode: createPrivateGame({ mode: "ffa", ... })')
        if (GameModes[opts.mode] == undefined) throw new Error('invalid mode, see GameModes for a list')

        if (!opts.map) throw new Error('pass a map: createPrivateGame({ map: "downfall", ... })')

        const map = Maps.find(m => m.name.toLowerCase() == opts.map.toLowerCase());
        const mapIdx = Maps.indexOf(map);

        if (mapIdx == -1) throw new Error('invalid map, see the Maps constant for a list')

        const listener = (msg) => {
            if (msg.command == 'gameFound') {
                this.game.raw = msg;
                this.game.code = this.game.raw.id;
                delete this.game.raw.command;

                this.gameFound = true;
            }
        };

        this.matchmaker.on('msg', listener);

        this.matchmaker.send({
            command: 'findGame',
            region: opts.region,
            playType: PlayTypes.createPrivate,
            gameType: GameModes[opts.mode],
            sessionId: this.account.sessionId,
            noobLobby: false,
            map: mapIdx
        });

        while (!this.gameFound) await new Promise(r => setTimeout(r, 10));

        this.matchmaker.off('msg', listener);

        return this.game.raw;
    }

    async join(data) {
        if (typeof data == 'string') {
            if (data.includes('#')) data = data.split('#')[1]; // stupid shell kids put in full links
            // this is a string code that we can pass and get the needed info from
            await this.#joinGameWithCode(data);
        } else if (typeof data == 'object') {
            if (!this.state.loggedIn) {
                // console.log('passed an object but you still need to be logged in!!')
                await this.#anonLogin();
            }

            // this is a game object that we can pass and get the needed info from
            this.game.raw = data;
            this.game.code = this.game.raw.id;
            delete this.game.raw.command;

            this.gameFound = true;
        }

        if (!this.game.raw.id || !this.game.raw.subdomain)
            throw new Error('invalid game data passed to <bot>.join');

        // console.log(`Joining ${this.game.raw.id} using proxy ${this.proxy || 'none'}`);

        this.gameSocket = new yolkws(`wss://${this.game.raw.subdomain}.${this.instance}/game/${this.game.raw.id}`, this.proxy);

        this.gameSocket.binaryType = 'arraybuffer';

        this.gameSocket.onopen = () => {
            // console.log('Successfully connected to game server.');
        }

        this.gameSocket.onmessage = this.#onGameMesssage.bind(this);

        this.gameSocket.onclose = (e) => {
            // console.log('Game socket closed:', e.code, Object.entries(CloseCode).filter(([, v]) => v == e.code));
            this.#emit('close', e.code);
        }

        while (!this.state.joinedGame) await new Promise(r => setTimeout(r, 5));

        const out = CommOut.getBuffer();
        out.packInt8(CommCode.clientReady);
        out.send(this.gameSocket);

        this.gameSocket.onmessage = (msg) => this._packetQueue.push(msg.data);

        // console.log(`Successfully joined ${this.game.code}. Startup to join time: ${Date.now() - this.initTime} ms`);

        if (this.autoUpdate)
            setInterval(() => this.update(), this.updateInterval);

        if (this.autoPing) {
            const out = CommOut.getBuffer();
            out.packInt8(CommCode.ping);
            out.send(this.gameSocket);
            this.lastPingTime = Date.now();
        }
    }

    update() {
        if (!this.state.joinedGame) { throw new Error('Not playing, can\'t update. '); }

        this.nUpdates++;

        if (this._packetQueue.length === 0 && this._dispatches.length === 0) return;

        let packet;
        while ((packet = this._packetQueue.shift()) !== undefined) { this.#handlePacket(packet); }

        this.drain();

        if (this.pathing.followingPath && !this.disablePathing) {
            const myPositionStr = Object.entries(this.me.position).map(entry => Math.floor(entry[1])).join(',');

            if (myPositionStr == this.pathing.activePath[this.pathing.activePath.length - 1].positionStr()) {
                // console.log('Completed path to', this.pathing.activePath[this.pathing.activePath.length - 1].position);
                this.pathing.followingPath = false;
                this.pathing.activePath = null;
                this.pathing.activeNode = null;
                this.pathing.activeNodeIdx = 0;

                this.dispatch(new MovementDispatch(0));
            } else {
                let positionTarget;
                if (this.pathing.activeNodeIdx < this.pathing.activePath.length - 1) {
                    positionTarget = this.pathing.activePath[this.pathing.activeNodeIdx + 1].flatCenter();
                    this.dispatch(new LookAtPosDispatch(positionTarget));
                } else {
                    positionTarget = this.pathing.activePath[this.pathing.activeNodeIdx].flatCenter();
                    this.dispatch(new LookAtPosDispatch(positionTarget));
                }

                for (const node of this.pathing.activePath) {
                    if (node.flatRadialDistance(this.me.position) < 0.1 && node.position.y == Math.floor(this.me.position.y)) {
                        if (this.pathing.activePath.indexOf(node) >= this.pathing.activeNodeIdx) {
                            this.pathing.activeNodeIdx = this.pathing.activePath.indexOf(node) + 1;
                            this.pathing.activeNode = this.pathing.activePath[this.pathing.activeNodeIdx];
                            break;
                        } else {
                            // console.log('Close to node that\'s before, idx:', 
                            //    this.pathing.activePath.indexOf(node), 'current:', this.pathing.activeNodeIdx);
                        }
                    } else {
                        // console.log('Node at', node.position, 'is', node.flatRadialDistance(this.me.position), 'away.')
                    }
                    // console.log('activeNode is ', this.pathing.activeNode.flatRadialDistance(this.me.position), 'away');
                }

                if (!(this.controlKeys & Movements.FORWARD)) {
                    this.dispatch(new MovementDispatch(Movements.FORWARD));
                }
            }

            /*let onPath = false;
            for (const node of this.pathing.activePath) {
                if (node.positionStr() == myPositionStr) {
                    onPath = true;
                    break;
                }
            }
            if (!onPath) {
                console.log('Got off-path somehow');
                this.dispatch(new PathfindDispatch(this.pathing.activePath[this.pathing.activePath.length - 1]));
                this.pathing.followingPath = false;
                this.pathing.activePath = null;
                this.pathing.activeNode = null;
                this.pathing.activeNodeIdx = 0;
            }*/
        }

        if (Date.now() - this.lastUpdateTime >= 50) {
            this.#emit('tick');

            // Send out update packet
            const out = CommOut.getBuffer();
            out.packInt8(CommCode.syncMe);
            out.packInt8(Math.random() * 128 | 0); // stateIdx
            out.packInt8(this.me.serverStateIdx); // serverStateIdx
            for (let i = 0; i < 3; i++) {
                out.packInt8(this.controlKeys); // controlkeys
                out.packInt8(this.state.shotsFired); // shots fired
                out.packRadU(this.me.view.yaw); // yaw
                out.packRad(this.me.view.pitch); // pitch
                out.packInt8(100); // fixes commcode issues, does nothing
            }
            out.send(this.gameSocket);

            this.lastUpdateTime = Date.now();
            this.state.shotsFired = 0;
        }

        let cb;
        while ((cb = this._liveCallbacks.shift()) !== undefined) cb();
    }

    on(event, cb) {
        if (Object.keys(this._hooks).includes(event)) this._hooks[event].push(cb);
        else this._hooks[event] = [cb];
    }

    onAny(cb) {
        this._globalHooks.push(cb);
    }

    // these are auth-related codes (liveCallbacks doesn't run during auth)
    #mustBeInstant = ['authFail', 'banned'];

    #emit(event, ...args) {
        if (this._hooks[event]) {
            for (const cb of this._hooks[event]) {
                if (this.#mustBeInstant.includes(event)) cb(...args);
                else this._liveCallbacks.push(() => cb(...args));
            }
        }

        for (const cb of this._globalHooks) {
            if (this.#mustBeInstant.includes(event)) cb(event, ...args);
            else this._liveCallbacks.push(() => cb(event, ...args));
        }
    }

    async #fetchMap(name, hash) {
        if (!IsBrowser) {
            const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import('node:fs');
            const { join } = await import('node:path');

            if (existsSync(join(import.meta.dirname, '..', 'data', 'cache', 'maps', `${name}-${hash}.json`))) {
                return JSON.parse(readFileSync(join(import.meta.dirname, '..', 'data', 'cache', 'maps', `${name}-${hash}.json`), 'utf-8'));
            }

            console.warn(`Map "${name}" not found in cache, fetching...`);

            const data = await (await fetch(`https://${this.instance}/maps/${name}.json?${hash}`)).json();

            const dir = join(import.meta.dirname, '..', 'data', 'cache', 'maps');
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

            writeFileSync(
                join(dir, `${name}-${hash}.json`),
                JSON.stringify(data, null, 4),
                { flag: 'w+' }
            );
            return data;
        } else {
            const data = await (await fetch(`https://${this.instance}/maps/${name}.json?${hash}`)).json();
            return data;
        }
    }

    #processChatPacket() {
        const id = CommIn.unPackInt8U();
        const msgFlags = CommIn.unPackInt8U();
        const text = CommIn.unPackString().valueOf();
        const player = this.players[Object.keys(this.players).find(p => this.players[p].id == id)];
        // console.log(`Player ${player.name}: ${text} (flags: ${msgFlags})`);
        // console.log(`Their position: ${player.position.x}, ${player.position.y}, ${player.position.z}`);
        this.#emit('chat', player, text, msgFlags);
    }

    #processAddPlayerPacket() {
        const id_ = CommIn.unPackInt8U();
        const uniqueId = CommIn.unPackString();
        const name = CommIn.unPackString();
        const safename = CommIn.unPackString(); // ??? (a)
        const charClass = CommIn.unPackInt8U();
        const playerData = {
            id_: id_,
            uniqueId_: uniqueId,
            name_: name,
            safename_: safename,
            charClass_: charClass,
            team_: CommIn.unPackInt8U(),
            primaryWeaponItem_: findItemById(CommIn.unPackInt16U()),
            secondaryWeaponItem_: findItemById(CommIn.unPackInt16U()), // b
            shellColor_: CommIn.unPackInt8U(),
            hatItem_: findItemById(CommIn.unPackInt16U()),
            stampItem_: findItemById(CommIn.unPackInt16U()),
            unknownInt8: CommIn.unPackInt8(), // c
            otherUnknownInt8: CommIn.unPackInt8(),
            grenadeItem_: findItemById(CommIn.unPackInt16U()),
            meleeItem_: findItemById(CommIn.unPackInt16U()),
            x_: CommIn.unPackFloat(),
            y_: CommIn.unPackFloat(),
            z_: CommIn.unPackFloat(),
            dx_: CommIn.unPackFloat(),
            dy_: CommIn.unPackFloat(),
            dz_: CommIn.unPackFloat(),
            yaw_: CommIn.unPackRadU(),
            pitch_: CommIn.unPackRad(),
            score_: CommIn.unPackInt32U(),
            kills_: CommIn.unPackInt16U(),
            deaths_: CommIn.unPackInt16U(),
            streak_: CommIn.unPackInt16U(),
            totalKills_: CommIn.unPackInt32U(),
            totalDeaths_: CommIn.unPackInt32U(),
            bestGameStreak_: CommIn.unPackInt16U(),
            bestOverallStreak_: CommIn.unPackInt16U(),
            shield_: CommIn.unPackInt8U(),
            hp_: CommIn.unPackInt8U(),
            playing_: CommIn.unPackInt8U(),
            weaponIdx_: CommIn.unPackInt8U(),
            controlKeys_: CommIn.unPackInt8U(),
            upgradeProductId_: CommIn.unPackInt8U(),
            activeShellStreaks_: CommIn.unPackInt8U(),
            social_: CommIn.unPackLongString(),
            hideBadge_: CommIn.unPackInt8U()
        };

        playerData.gameData_ = {};
        playerData.gameData_.mapIdx = CommIn.unPackInt8U();
        playerData.gameData_.private = CommIn.unPackInt8U();
        playerData.gameData_.gameType = CommIn.unPackInt8U();

        if (!this.players[playerData.id_]) {
            this.players[playerData.id_] = new GamePlayer(playerData.id_, playerData.team_, playerData);

            const player = this.players[playerData.id_];

            if (player.playing) {
                player.healthInterval = setInterval(() => {
                    if (player.hp < 1) return;

                    const regenSpeed = 0.1 * (this.game.isPrivate ? this.game.options.healthRegen : 1);

                    if (player.streakRewards.includes(ShellStreaks.OverHeal)) {
                        player.hp = Math.max(100, player.hp - regenSpeed);
                    } else {
                        player.hp = Math.min(100, player.hp + regenSpeed);
                    }
                }, 33);
            }
        }

        if (this.me.id == playerData.id_) {
            this.me = this.players[playerData.id_];
        }

        this.#emit('playerJoin', this.players[playerData.id_]);

        const unp = CommIn.unPackInt8U();
        if (unp == CommCode.addPlayer) { // there is another player stacked
            this.#processAddPlayerPacket();
        }
    }

    #processRespawnPacket() {
        const id = CommIn.unPackInt8U();
        const seed = CommIn.unPackInt16U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const rounds0 = CommIn.unPackInt8U();
        const store0 = CommIn.unPackInt8U();
        const rounds1 = CommIn.unPackInt8U();
        const store1 = CommIn.unPackInt8U();
        const grenades = CommIn.unPackInt8U();
        const player = this.players[id];
        if (player) {
            player.playing = true;
            player.randomSeed = seed;

            player.weapons[0].ammo.rounds = rounds0;
            player.weapons[0].ammo.store = store0;
            player.weapons[1].ammo.rounds = rounds1;
            player.weapons[1].ammo.store = store1;

            player.grenades = grenades;
            player.position = { x: x, y: y, z: z };
            // console.log(`Player ${player.name} respawned at ${x}, ${y}, ${z}`);
            this.#emit('playerRespawn', player);

            if (player.healthInterval) {
                clearInterval(player.healthInterval);
            }

            player.healthInterval = setInterval(() => {
                if (player.hp < 1) return;

                const regenSpeed = 0.1 * (this.game.isPrivate ? this.game.options[GameOptionFlags.healthRegen] : 1);

                if (player.streakRewards.includes(ShellStreaks.OverHeal)) {
                    player.hp = Math.max(100, player.hp - regenSpeed);
                } else {
                    player.hp = Math.min(100, player.hp + regenSpeed);
                }
            }, 33);
        } else {
            // console.log(`Player ${id} not found. (me: ${this.me.id}) (respawn)`);
        }
    }

    #processExternalSyncPacket() {
        const id = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const climbing = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player || !player.buffer) return;

        if (player.id == this.me.id) {
            for (let i2 = 0; i2 < 3 /* FramesBetweenSyncs */; i2++) {
                CommIn.unPackInt8U();
                CommIn.unPackRadU();
                CommIn.unPackRad();
            }
        }

        let yaw, pitch;
        for (let i2 = 0; i2 < 3; i2++) {
            player.buffer[i2].controlKeys = CommIn.unPackInt8U();
            yaw = CommIn.unPackRadU();
            if (!isNaN(yaw)) { player.buffer[i2].yaw_ = yaw }
            pitch = CommIn.unPackRad();
            if (!isNaN(pitch)) { player.buffer[i2].pitch_ = pitch }
        }

        player.position.x = x;

        if (!player.jumping || Math.abs(player.position.y - y) > 0.5) {
            player.position.y = y;
        }

        player.position.z = z;
        player.buffer[0].x = x;
        player.buffer[0].y = y;
        player.buffer[0].z = z;
        player.climbing = climbing;
        // console.log(`Player ${player.name} is now at ${x}, ${y}, ${z} (climbing = ${climbing})`);
    }

    #processPausePacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];
        if (player) {
            player.playing = false;
            this.#emit('playerPause', player);
        }
    }

    #processSwapWeaponPacket() {
        const id = CommIn.unPackInt8U();
        const newWeaponId = CommIn.unPackInt8U();

        const player = this.players[id];
        if (player) {
            player.activeGun = newWeaponId;
            this.#emit('playerSwapWeapon', player, newWeaponId);
        }
    }

    #processDeathPacket() {
        const killedId = CommIn.unPackInt8U();
        const byId = CommIn.unPackInt8U();
        // const rs = CommIn.unPackInt8U();

        const killed = this.players[killedId];
        const killer = this.players[byId];

        /*
        const killerLastDmg = CommIn.unPackInt8U();
        const killedLastDmg = CommIn.unPackInt8U();
        */

        if (killed) {
            killed.playing = false;
            killed.kills = 0;
            killed.lastDeathTime = Date.now();
            // console.log(`Player ${killed.name} died.`);
        }

        if (killer) { killer.kills++; }
        // console.log(`Player ${killer.name} is on a streak of ${killer.kills} kills.`);

        this.#emit('playerDeath', killed, killer); // killed, killer
    }

    #processFirePacket() {
        const id = CommIn.unPackInt8U();

        const player = this.players[id];
        const playerWeapon = player.weapons[player.activeGun];

        playerWeapon.ammo.rounds--;

        this.#emit('playerFire', player, playerWeapon);
    }

    #processSpawnItemPacket() {
        const id = CommIn.unPackInt16U();
        const type = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();

        this.game.collectables[type].push({ id, x, y, z });

        this.#emit('spawnItem', type, id, { x, y, z });
    }

    #processCollectPacket() {
        const playerId = CommIn.unPackInt8U();
        const type = CommIn.unPackInt8U();
        const applyToWeaponIdx = CommIn.unPackInt8U();
        const id = CommIn.unPackInt16U();

        const player = this.players[playerId];

        this.game.collectables[type] = this.game.collectables[type].filter(c => c.id != id);

        if (type == CollectTypes.AMMO) {
            const playerWeapon = player.weapons[applyToWeaponIdx];
            playerWeapon.ammo.store = Math.min(playerWeapon.ammo.storeMax, playerWeapon.ammo.store + playerWeapon.ammo.pickup);
            this.#emit('collectAmmo', player, playerWeapon);
        }

        if (type == CollectTypes.GRENADE) {
            player.grenades >= 3 ? player.grenades = 3 : player.grenades++;
            this.#emit('collectGrenade', player);
        }
    }

    #processHitThemPacket() {
        const id = CommIn.unPackInt8U();
        const hp = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player) return;

        const oldHP = player.hp;
        player.hp = hp;

        this.#emit('playerDamaged', player, oldHP, player.hp);
    }

    #processHitMePacket() {
        const hp = CommIn.unPackInt8U();
        const oldHp = this.me.hp;

        this.me.hp = hp;

        this.#emit('selfDamaged', oldHp, this.me.hp);
    }

    #processSyncMePacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];
        if (!player) return;

        CommIn.unPackInt8U(); // stateIdx

        const serverStateIdx = CommIn.unPackInt8U();
        player.serverStateIdx = serverStateIdx;

        const newX = CommIn.unPackFloat();
        const newY = CommIn.unPackFloat();
        const newZ = CommIn.unPackFloat();

        const oldX = player.position.x;
        const oldY = player.position.y;
        const oldZ = player.position.z;

        player.position.x = newX;
        player.position.y = newY;
        player.position.z = newZ;

        if (oldX != newX || oldY != newY || oldZ != newZ) {
            this.#emit('selfMoved', player, { x: oldX, y: oldY, z: oldZ }, { x: newX, y: newY, z: newZ });
        }
    }

    #processEventModifierPacket() {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.eventModifier);
        out.send(this.gameSocket);
    }

    #processRemovePlayerPacket() {
        const id = CommIn.unPackInt8U();
        const removedPlayer = { ...this.players[id] }; // creates a snapshot of the player since they'll be deleted

        delete this.players[id.toString()];

        this.#emit('playerLeave', removedPlayer);
    }

    #processGameStatePacket() {
        if (this.game.gameModeId == GameModes.spatula) {
            this.game.teamScore[1] = CommIn.unPackInt16U();
            this.game.teamScore[2] = CommIn.unPackInt16U();

            const spatulaCoords = {
                x: CommIn.unPackFloat(),
                y: CommIn.unPackFloat(),
                z: CommIn.unPackFloat()
            };

            const controlledBy = CommIn.unPackInt8U();
            const controlledByTeam = CommIn.unPackInt8U();

            this.game.spatula = {
                coords: spatulaCoords,
                controlledBy: controlledBy,
                controlledByTeam: controlledByTeam
            };

            this.#emit('gameStateChange', this.game);
        } else if (this.game.gameModeId == GameModes.kotc) {
            this.game.stage = CommIn.unPackInt8U(); // constants.CoopStates
            this.game.activeZone = CommIn.unPackInt8U(); // a number to represent which 'active zone' kotc is using
            this.game.capturing = CommIn.unPackInt8U(); // the team capturing, named "teams" in shell src
            this.game.captureProgress = CommIn.unPackInt16U(); // progress of the coop capture
            this.game.numCapturing = CommIn.unPackInt8U(); // number of players capturing - number/1000
            this.game.teamScore[1] = CommIn.unPackInt8U(); // team 1 (blue) score
            this.game.teamScore[2] = CommIn.unPackInt8U(); // team 2 (red) score

            // not in shell, for utility purposes =D
            this.game.stageName = CoopStagesById[this.game.stage]; // name of the stage ('start' / 'capturing' / 'etc')
            this.game.capturePercent = this.game.captureProgress / 1000; // progress of the capture as a percentage

            this.#emit('gameStateChange', this.game);
        }

        if (this.game.gameModeId !== GameModes.spatula) {
            delete this.game.spatula;
        }

        if (this.game.gameModeId !== GameModes.kotc) {
            delete this.game.stage;
            delete this.game.activeZone;
            delete this.game.capturing;
            delete this.game.captureProgress;
            delete this.game.numCapturing
        }

        if (this.game.gameModeId !== GameModes.spatula && this.game.gameModeId !== GameModes.kotc) {
            delete this.game.teamScore;
        }
    }

    #processBeginStreakPacket() {
        const id = CommIn.unPackInt8U();
        const ksType = CommIn.unPackInt8U();
        const player = this.players[id];

        switch (ksType) {
            case ShellStreaks.HardBoiled:
                player.hpShield = 100;
                player.streakRewards.push(ShellStreaks.HardBoiled);
                break;

            case ShellStreaks.EggBreaker:
                player.streakRewards.push(ShellStreaks.EggBreaker);
                break;

            case ShellStreaks.Restock: {
                player.grenades = 3;

                // main weapon
                player.weapons[0].ammo.rounds = player.weapons[0].ammo.capacity;
                player.weapons[0].ammo.store = player.weapons[0].ammo.storeMax;

                // secondary, always cluck9mm
                player.weapons[1].ammo.rounds = player.weapons[1].ammo.capacity;
                player.weapons[1].ammo.store = player.weapons[1].ammo.storeMax;
                break;
            }

            case ShellStreaks.OverHeal:
                player.hp = Math.min(200, player.hp + 100);
                player.streakRewards.push(ShellStreaks.OverHeal);
                break;

            case ShellStreaks.DoubleEggs:
                player.streakRewards.push(ShellStreaks.DoubleEggs);
                break;

            case ShellStreaks.MiniEgg:
                player.streakRewards.push(ShellStreaks.MiniEgg);
                break;
        }

        this.#emit('playerBeginStreak', player, ksType);
    }

    #processEndStreakPacket() {
        const id = CommIn.unPackInt8U();
        const ksType = CommIn.unPackInt8U();
        const player = this.players[id];

        const streaks = [
            ShellStreaks.EggBreaker,
            ShellStreaks.OverHeal,
            ShellStreaks.DoubleEggs,
            ShellStreaks.MiniEgg
        ];

        if (streaks.includes(ksType) && player.streakRewards.includes(ksType)) {
            player.streakRewards = player.streakRewards.filter((r) => r != ksType);
        }

        this.#emit('playerEndStreak', ksType, player);
    }

    #processHitShieldPacket() {
        const hb = CommIn.unPackInt8U();
        const hp = CommIn.unPackInt8U();

        this.me.hpShield = hb;
        this.me.hp = hp;

        if (this.me.hpShield <= 0) {
            this.me.streakRewards = this.me.streakRewards.filter((r) => r != ShellStreaks.HardBoiled);
            this.#emit('selfShieldLost');
        } else {
            this.#emit('selfShieldHit', this.me.hpShield);
        }
    }

    #processGameOptionsPacket() {
        const oldOptions = { ...this.game.options };

        let gravity = CommIn.unPackInt8U();
        let damage = CommIn.unPackInt8U();
        let healthRegen = CommIn.unPackInt8U();

        if (gravity < 1 || gravity > 4) { gravity = 4; }
        if (damage < 0 || damage > 8) { damage = 4; }
        if (healthRegen > 16) { healthRegen = 4; }

        this.game.options.gravity = gravity / 4;
        this.game.options.damage = damage / 4;
        this.game.options.healthRegen = healthRegen / 4;

        const rawFlags = CommIn.unPackInt8U();

        Object.keys(GameOptionFlags).forEach((optionFlagName) => {
            const value = rawFlags & GameOptionFlags[optionFlagName] ? 1 : 0;
            this.game.options[optionFlagName] = value;
        });

        this.game.options.weaponsDisabled = Array.from({ length: 7 }, () => CommIn.unPackInt8U() === 1);
        this.game.options.mustUseSecondary = this.game.options.weaponsDisabled.every((v) => v);

        this.#emit('gameOptionsChange', oldOptions, this.game.options);
        return false;
    }

    #processGameActionPacket() {
        const action = CommIn.unPackInt8U();

        if (action == GameActions.pause) {
            // console.log('settings changed, gameOwner changed game settings, force paused');
            this.#emit('gameForcePause');
            setTimeout(() => this.me.playing = false, 3000);
        }

        if (action == GameActions.reset) {
            // console.log('owner reset game');

            this.me.kills = 0;
            this.game.teamScore = [0, 0, 0];

            this.game.spatula.controlledBy = 0;
            this.game.spatula.controlledByTeam = 0;
            this.game.spatula.coords = { x: 0, y: 0, z: 0 };

            this.game.stage = CoopStates.capturing;
            this.game.activeZone = 0;
            this.game.capturing = 0;
            this.game.captureProgress = 0;
            this.game.numCapturing = 0;
            this.game.stageName = CoopStagesById[CoopStates.capturing];
            this.game.capturePercent = 0.0;

            this.#emit('gameReset');
        }
    }

    #processPingPacket() {
        const oldPing = this.ping;

        this.ping = Date.now() - this.lastPingTime;

        this.#emit('pingUpdate', oldPing, this.ping);

        setTimeout(() => {
            const out = CommOut.getBuffer();
            out.packInt8(CommCode.ping);
            out.send(this.gameSocket);
            this.lastPingTime = Date.now();
        }, this.pingInterval);
    }

    #processSwitchTeamPacket() {
        const id = CommIn.unPackInt8U();
        const toTeam = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player) return;

        const oldTeam = player.team;

        player.team = toTeam;
        player.kills = 0;

        this.#emit('playerSwitchTeam', player, oldTeam, toTeam);
    }

    #processChangeCharacterPacket() {
        const id = CommIn.unPackInt8U();
        const weaponIndex = CommIn.unPackInt8U();

        const primaryWeaponIdx = CommIn.unPackInt16U();
        const secondaryWeaponIdx = CommIn.unPackInt16U();
        const shellColor = CommIn.unPackInt8U();
        const hatIdx = CommIn.unPackInt16U();
        const stampIdx = CommIn.unPackInt16U();
        const grenadeIdx = CommIn.unPackInt16U();
        const meleeIdx = CommIn.unPackInt16U();

        const primaryWeaponItem = findItemById(primaryWeaponIdx);
        const secondaryWeaponItem = findItemById(secondaryWeaponIdx);
        const hatItem = findItemById(hatIdx);
        const stampItem = findItemById(stampIdx);
        const grenadeItem = findItemById(grenadeIdx);
        const meleeItem = findItemById(meleeIdx);

        const player = this.players[id];
        if (player) {
            const oldCharacter = { ...player.character };
            const oldWeaponIdx = player.selectedGun;

            player.character.eggColor = shellColor;
            player.character.primaryGun = primaryWeaponItem;
            player.character.secondaryGun = secondaryWeaponItem;
            player.character.stamp = stampItem;
            player.character.hat = hatItem;
            player.character.grenade = grenadeItem;
            player.character.melee = meleeItem;

            player.selectedGun = weaponIndex;
            player.weapons[0] = new GunList[weaponIndex]();

            if (oldWeaponIdx !== player.selectedGun) this.#emit('playerChangeGun', player, oldWeaponIdx, player.selectedGun);
            if (oldCharacter !== player.character) this.#emit('playerChangeCharacter', player, oldCharacter, player.character);
        }
    }

    #processUpdateBalancePacket() {
        const newBalance = CommIn.unPackInt32U();
        const oldBalance = this.account.eggBalance;

        this.account.eggBalance = newBalance;
        this.#emit('balanceUpdate', newBalance - oldBalance, newBalance);
    }

    #processRespawnDeniedPacket() {
        this.me.playing = false;
        this.#emit('selfRespawnFail');
    }

    #processMeleePacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];

        if (player) this.#emit('playerMelee', player);
    }

    // we do this since reload doesn't get emitted to ourselves
    processReloadPacket(customPlayer, iUnderstandThisIsForInternalUseOnlyAndIShouldNotBeCallingThis) {
        if (!iUnderstandThisIsForInternalUseOnlyAndIShouldNotBeCallingThis)
            throw new Error('processReloadPacket is exposed for internal use only. do not call it.');

        const id = customPlayer || CommIn.unPackInt8U();
        const player = this.players[id];

        if (!player) return;

        const playerActiveWeapon = player.weapons[player.activeGun];

        const newRounds = Math.min(
            Math.min(playerActiveWeapon.ammo.capacity, playerActiveWeapon.ammo.reload) - playerActiveWeapon.ammo.rounds,
            playerActiveWeapon.ammo.store
        );

        playerActiveWeapon.ammo.rounds += newRounds;
        playerActiveWeapon.ammo.store -= newRounds;

        this.#emit('playerReload', player, playerActiveWeapon);
    }

    #handlePacket(packet) {
        CommIn.init(packet);
        this.#emit('packet', packet);
        const cmd = CommIn.unPackInt8U();
        switch (cmd) {
            case CommCode.chat:
                this.#processChatPacket(packet);
                break;

            case CommCode.addPlayer:
                this.#processAddPlayerPacket(packet);
                break;

            case CommCode.respawn:
                this.#processRespawnPacket(packet);
                break;

            case CommCode.swapWeapon:
                this.#processSwapWeaponPacket(packet);
                break;

            case CommCode.syncThem:
                this.#processExternalSyncPacket(packet);
                break;

            case CommCode.pause:
                this.#processPausePacket(packet);
                break;

            case CommCode.die:
                this.#processDeathPacket(packet);
                break;

            case CommCode.fire:
                this.#processFirePacket(packet);
                break;

            case CommCode.collectItem:
                this.#processCollectPacket(packet);
                break;

            case CommCode.hitThem:
                this.#processHitThemPacket(packet);
                break;

            case CommCode.hitMe:
                this.#processHitMePacket(packet);
                break;

            case CommCode.syncMe:
                this.#processSyncMePacket(packet);
                break;

            case CommCode.eventModifier:
                this.#processEventModifierPacket(packet);
                break;

            case CommCode.removePlayer:
                this.#processRemovePlayerPacket(packet);
                break;

            case CommCode.metaGameState:
                this.#processGameStatePacket(packet);
                break;

            case CommCode.beginShellStreak:
                this.#processBeginStreakPacket(packet);
                break;

            case CommCode.endShellStreak:
                this.#processEndStreakPacket(packet);
                break;

            case CommCode.hitMeHardBoiled:
                this.#processHitShieldPacket(packet);
                break;

            case CommCode.gameOptions:
                this.#processGameOptionsPacket(packet);
                break;

            case CommCode.gameAction:
                this.#processGameActionPacket(packet);
                break;

            case CommCode.ping:
                this.#processPingPacket(packet);
                break;

            case CommCode.switchTeam:
                this.#processSwitchTeamPacket(packet);
                break;

            case CommCode.changeCharacter:
                this.#processChangeCharacterPacket(packet);
                break;

            case CommCode.updateBalance:
                this.#processUpdateBalancePacket(packet);
                break;

            case CommCode.respawnDenied:
                this.#processRespawnDeniedPacket(packet);
                break;

            case CommCode.reload:
                this.processReloadPacket(null, true);
                break;

            case CommCode.spawnItem:
                this.#processSpawnItemPacket();
                break;

            case CommCode.melee:
                this.#processMeleePacket();
                break;

            case CommCode.clientReady:
            case CommCode.expireUpgrade:
            case CommCode.musicInfo:
            case CommCode.challengeCompleted:
                // we do not plan to implement these
                // for more info, see comm/codes.js
                break;

            case CommCode.explode:
            case CommCode.throwGrenade:
                // do nothing
                break;

            default:
                console.error(`handlePacket: I got but did not handle a: ${Object.entries(CommCode).filter(([, v]) => v == cmd)[0][0]}`);
                break;
        }
    }
}

export default Bot;
