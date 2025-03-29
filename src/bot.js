import { createAccount, loginAnonymously, loginWithCredentials, loginWithRefreshToken, queryServices } from '#api';

import CommIn from './comm/CommIn.js';
import CommOut from './comm/CommOut.js';
import { CommCode } from './comm/Codes.js';

import GamePlayer from './bot/GamePlayer.js';
import Matchmaker from './matchmaker.js';
import yolkws from './socket.js';

import {
    ChiknWinnerDailyLimit,
    CollectTypes,
    CoopStates,
    findItemById,
    GameActions,
    GameModes,
    GameOptionFlags,
    GunList,
    IsBrowser,
    ItemTypes,
    Movements,
    PlayTypes,
    ProxiesEnabled,
    ShellStreaks
} from '#constants';

import LookAtPosDispatch from './dispatches/LookAtPosDispatch.js';
import MovementDispatch from './dispatches/MovementDispatch.js';

import { NodeList } from './pathing/mapnode.js';

import { Maps } from './constants/maps.js';

const CoopStagesById = Object.fromEntries(Object.entries(CoopStates).map(([key, value]) => [value, key]));
const GameModesById = Object.fromEntries(Object.entries(GameModes).map(([key, value]) => [value, key]));

const intents = {
    CHALLENGES: 1,
    STATS: 2,
    PATHFINDING: 3,
    BUFFERS: 4,
    PING: 5,
    COSMETIC_DATA: 6,
    PLAYER_HEALTH: 7,
    PACKET_HOOK: 8
}

export class Bot {
    static Intents = intents;
    Intents = intents;

    constructor(params = {}) {
        if (params.proxy && !ProxiesEnabled)
            throw new Error('proxies do not work and hence are not supported in the browser');

        this.intents = params.intents || [];

        this.instance = params.instance || 'shellshock.io';
        this.proxy = params.proxy || '';

        this.autoUpdate = params.doUpdate || true;
        this.updateInterval = params.updateInterval || 16.5;

        this._hooks = {};
        this._globalHooks = [];
        this._liveCallbacks = [];

        // private information NOT FOR OTHER PLAYERS!!
        this.state = {
            // kept for specifying socket open sequence
            name: '',

            // tracking for dispatch checks
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
            socket: null,

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
                nodes: {},
                zones: []
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
            zoneNumber: 0,
            activeZone: [],
            capturing: 0,
            captureProgress: 0,
            numCapturing: 0,
            stageName: '',
            capturePercent: 0.0
        }

        this.account = {
            // used for auth
            id: 0,
            firebaseId: '',
            sessionId: '',
            session: '',

            // raw login params
            email: '',
            password: '',

            // chikn winner related info
            cw: {
                atLimit: false,
                limit: 0,
                secondsUntilPlay: 0, // short cooldown, in seconds
                canPlayAgain: Date.now()
            },

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

        this.matchmaker = null;

        this.ping = 0;
        this.lastPingTime = -1;

        this.lastDeathTime = -1;
        this.lastChatTime = -1;
        this.lastUpdateTime = -1;

        this.controlKeys = 0;

        this.pathing = {
            nodeList: null,
            followingPath: false,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }

        if (this.intents.includes(this.Intents.PLAYER_HEALTH)) this.healthIntervalId = setInterval(() => {
            if (!this.players) return;

            for (const player of Object.values(this.players)) {
                if (player.playing && player.hp > 0) {
                    const regenSpeed = 0.1 * (this.game.isPrivate ? this.game.options.healthRegen : 1);

                    if (player.streakRewards.includes(ShellStreaks.OverHeal)) {
                        player.hp = Math.max(100, player.hp - regenSpeed);
                    } else {
                        player.hp = Math.min(100, player.hp + regenSpeed);
                    }
                }
            }
        }, 33);
    }

    dispatch(disp) {
        this._dispatches.push(disp);
    }

    async createAccount(email, pass) {
        this.account.email = email;
        this.account.password = pass;

        const loginData = await createAccount(email, pass, this.proxy, this.instance);
        return await this.#processLoginData(loginData);
    }

    async login(email, pass) {
        this.account.email = email;
        this.account.password = pass;

        const loginData = await loginWithCredentials(email, pass, this.proxy, this.instance);
        return await this.#processLoginData(loginData);
    }

    async loginWithRefreshToken(refreshToken) {
        const loginData = await loginWithRefreshToken(refreshToken, this.proxy, this.instance);
        return await this.#processLoginData(loginData);
    }

    async loginAnonymously() {
        delete this.account.email;
        delete this.account.password;

        const loginData = await loginAnonymously(this.proxy, this.instance);
        return await this.#processLoginData(loginData);
    }

    async #processLoginData(loginData) {
        if (typeof loginData == 'string') {
            this.emit('authFail', loginData);
            return false;
        }

        if (loginData.banRemaining) {
            this.emit('banned', loginData.banRemaining);
            return false;
        }

        this.account.rawLoginData = loginData;

        this.account.accountAge = loginData.accountAge;
        this.account.eggBalance = loginData.currentBalance;
        this.account.emailVerified = loginData.emailVerified;
        this.account.firebaseId = loginData.firebaseId;
        this.account.id = loginData.id;
        this.account.loadout = loginData.loadout;
        this.account.ownedItemIds = loginData.ownedItemIds;
        this.account.session = loginData.session;
        this.account.sessionId = loginData.sessionId;
        this.account.vip = loginData.upgradeProductId && !loginData.upgradeIsExpired;

        if (this.intents.includes(this.Intents.STATS)) this.account.stats = {
            lifetime: loginData.statsLifetime,
            monthly: loginData.statsCurrent
        };

        if (this.intents.includes(this.Intents.CHALLENGES)) {
            this.account.challenges = [];

            const { Challenges } = await import('./constants/challenges.js');

            for (const challenge of loginData.challenges) {
                const challengeData = Challenges.find(c => c.id == challenge.challengeId);
                if (!challengeData) continue;

                delete challenge.playerId;

                this.account.challenges.push({
                    ...challengeData,
                    ...challenge
                });
            }
        }

        return this.account;
    }

    async initMatchmaker() {
        if (this.account.id == 0) {
            // console.log('Not logged in, attempting to create anonymous user...');
            const anonLogin = await this.loginAnonymously();
            if (!anonLogin) return false;
        }

        if (!this.matchmaker) {
            // console.log('No matchmaker, creating instance')
            this.matchmaker = new Matchmaker({
                sessionId: this.account.sessionId,
                proxy: this.proxy,
                instance: this.instance
            });

            this.matchmaker.on('authFail', (data) => this.emit('authFail', data));

            await this.matchmaker.getRegions();
        }

        return true;
    }

    async #joinGameWithCode(code) {
        if (!await this.initMatchmaker()) return false;

        return await new Promise((resolve) => {
            const listener = (mes) => {
                if (mes.command == 'gameFound') {
                    this.matchmaker.off('msg', listener);

                    this.game.raw = mes;
                    this.game.code = code;

                    resolve();
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
        });
    }

    async #onGameMesssage(msg) {
        CommIn.init(msg.data);

        let out;
        const cmd = CommIn.unPackInt8U();

        switch (cmd) {
            case CommCode.socketReady:
                out = CommOut.getBuffer();
                out.packInt8(CommCode.joinGame);

                out.packString(this.state.name); // name
                out.packString(this.game.raw.uuid); // game id

                out.packInt8(0); // hidebadge
                out.packInt8(0); // weapon choice

                out.packInt32(this.account.session); // session int
                out.packString(this.account.firebaseId); // firebase id
                out.packString(this.account.sessionId); // session id

                out.send(this.game.socket);
                break;

            case CommCode.gameJoined: {
                this.me.id = CommIn.unPackInt8U();
                // console.log("My id is:", this.me.id);
                this.me.team = CommIn.unPackInt8U();
                // console.log("My team is:", this.me.team);
                this.game.gameModeId = CommIn.unPackInt8U(); // aka gameType
                this.game.gameMode = GameModesById[this.game.gameModeId];
                // console.log("Gametype:", this.game.gameMode, this.game.gameModeId);
                this.game.mapIdx = CommIn.unPackInt8U();
                this.game.map = Maps[this.game.mapIdx];
                if (this.intents.includes(this.Intents.PATHFINDING)) {
                    this.game.map.raw = await this.#fetchMap(this.game.map.filename, this.game.map.hash);
                    this.pathing.nodeList = new NodeList(this.game.map.raw);
                    if (this.game.gameModeId === GameModes.kotc) this.#initKotcZones();
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

                const out = CommOut.getBuffer();
                out.packInt8(CommCode.clientReady);
                out.send(this.game.socket);

                this.game.socket.onmessage = (msg) => this._packetQueue.push(msg.data);

                if (this.autoUpdate)
                    this.updateIntervalId = setInterval(() => this.update(), this.updateInterval);

                if (this.intents.includes(this.Intents.PING)) {
                    const out = CommOut.getBuffer();
                    out.packInt8(CommCode.ping);
                    out.send(this.game.socket);
                    this.lastPingTime = Date.now();
                }
                break;
            }

            case CommCode.eventModifier:
                // console.log("Echoed eventModifier"); // why the fuck do you need to do this
                out = CommOut.getBuffer();
                out.packInt8(CommCode.eventModifier);
                out.send(this.game.socket);
                break;

            case CommCode.requestGameOptions:
                this.#processGameRequestOptionsPacket();
                break;

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

        await new Promise((resolve) => {
            const listener = (msg) => {
                if (msg.command == 'gameFound') {
                    this.matchmaker.off('msg', listener);

                    this.game.raw = msg;
                    this.game.code = this.game.raw.id;

                    resolve();
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
        });

        return this.game.raw;
    }

    async join(name, data) {
        this.state.name = name || 'yolkbot';

        if (typeof data == 'string') {
            if (data.includes('#')) data = data.split('#')[1]; // stupid shell kids put in full links
            // this is a string code that we can pass and get the needed info from
            await this.#joinGameWithCode(data);
        } else if (typeof data == 'object') {
            if (this.account.id == 0) {
                // console.log('passed an object but you still need to be logged in!!')
                await this.loginAnonymously();
            }

            // this is a game object that we can pass and get the needed info from
            this.game.raw = data;
            this.game.code = this.game.raw.id;
        }

        if (!this.game.raw.id || !this.game.raw.subdomain)
            throw new Error('invalid game data passed to <bot>.join');

        // console.log(`Joining ${this.game.raw.id} using proxy ${this.proxy || 'none'}`);

        const attempt = async () => {
            try {
                this.game.socket = new yolkws(`wss://${this.game.raw.subdomain}.${this.instance}/game/${this.game.raw.id}`, this.proxy);
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await attempt();
            }
        }

        await attempt();

        this.game.socket.binaryType = 'arraybuffer';

        this.game.socket.onopen = () => {
            // console.log('Successfully connected to game server.');
        }

        this.game.socket.onmessage = this.#onGameMesssage.bind(this);

        this.game.socket.onclose = (e) => {
            // console.log('Game socket closed:', e.code, Object.entries(CloseCode).filter(([, v]) => v == e.code));
            this.emit('close', e.code);
        }
    }

    #processPathfinding() {
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

    update() {
        if (!this.state.joinedGame) throw new Error('Not playing, can\'t update. ');

        // process pathfinding
        if (this.pathing.followingPath && this.intents.includes(this.Intents.PATHFINDING)) this.#processPathfinding();

        // process incoming packets
        while (this._packetQueue.length > 0) this.#handlePacket(this._packetQueue.shift());

        // process dispatches
        if (this._dispatches.length > 0) {
            for (let i = 0; i < this._dispatches.length; i++) {
                const disp = this._dispatches[i];
                if (disp.check(this)) {
                    disp.execute(this);
                    this._dispatches.splice(i, 1);
                    break; // only 1 dispatch per update
                }
            }
        }

        // process syncMe
        const now = Date.now();
        if (now - this.lastUpdateTime >= 50) {
            this.emit('tick');

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
            out.send(this.game.socket);

            this.lastUpdateTime = now;
            this.state.shotsFired = 0;
        }

        while (this._liveCallbacks.length > 0) {
            const cb = this._liveCallbacks.shift();
            cb();
        }
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

    emit(event, ...args) {
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
            const { homedir } = await import('node:os');

            const yolkbotCache = join(homedir(), '.yolkbot');
            const mapCache = join(yolkbotCache, 'maps');

            if (!existsSync(yolkbotCache)) mkdirSync(yolkbotCache);
            if (!existsSync(mapCache)) mkdirSync(mapCache);

            const mapFile = join(mapCache, `${name}-${hash}.json`);

            if (existsSync(mapFile))
                return JSON.parse(readFileSync(mapFile, 'utf-8'));

            console.log('map not in cache, IMPORT!!', name, hash);

            const data = await (await fetch(`https://${this.instance}/maps/${name}.json?${hash}`)).json();

            writeFileSync(mapFile, JSON.stringify(data, null, 4), { flag: 'w+' });

            return data;
        } else {
            const data = await (await fetch(`https://esm.sh/gh/yolkorg/maps/maps/${name}.json`)).json();
            return data;
        }
    }

    #initKotcZones() {
        const meshData = this.game.map.raw.data['DYNAMIC.capture-zone.none'];
        if (!meshData) return delete this.game.map.zones;

        let numCaptureZones = 0;
        const mapData = {};
        const zones = [];

        for (const cell of meshData) {
            if (!mapData[cell.x]) mapData[cell.x] = {};
            if (!mapData[cell.x][cell.y]) mapData[cell.x][cell.y] = {};
            mapData[cell.x][cell.y][cell.z] = { zone: null };
        }

        const offsets = [
            { x: -1, z: 0 },
            { x: 1, z: 0 },
            { x: 0, z: -1 },
            { x: 0, z: 1 }
        ];

        function getMapCellAt(x, y, z) {
            return mapData[x] && mapData[x][y] && mapData[x][y][z] ? mapData[x][y][z] : null;
        }

        for (const cellA of meshData) {
            if (!mapData[cellA.x][cellA.y][cellA.z].zone) {
                cellA.zone = ++numCaptureZones;
                mapData[cellA.x][cellA.y][cellA.z].zone = cellA.zone;

                const currentZone = [cellA];
                let hits;

                do {
                    hits = 0;
                    for (const cellB of meshData) {
                        if (!mapData[cellB.x][cellB.y][cellB.z].zone) {
                            for (const o of offsets) {
                                const cell = getMapCellAt(cellB.x + o.x, cellB.y, cellB.z + o.z);
                                if (cell && cell.zone == cellA.zone) {
                                    hits++;
                                    cellB.zone = cellA.zone;
                                    mapData[cellB.x][cellB.y][cellB.z].zone = cellA.zone;
                                    currentZone.push(cellB);
                                    break;
                                }
                            }
                        }
                    }
                } while (hits > 0);

                zones.push(currentZone);
            }
        }

        this.game.map.zones = zones;
    }

    #processChatPacket() {
        const id = CommIn.unPackInt8U();
        const msgFlags = CommIn.unPackInt8U();
        const text = CommIn.unPackString().valueOf();
        const player = this.players[Object.keys(this.players).find(p => this.players[p].id == id)];
        // console.log(`Player ${player.name}: ${text} (flags: ${msgFlags})`);
        // console.log(`Their position: ${player.position.x}, ${player.position.y}, ${player.position.z}`);
        this.emit('chat', player, text, msgFlags);
    }

    #processAddPlayerPacket() {
        const id_ = CommIn.unPackInt8U();
        const findCosmetics = this.intents.includes(this.Intents.COSMETIC_DATA);
        const playerData = {
            id_: id_,
            uniqueId_: CommIn.unPackString(),
            name_: CommIn.unPackString(),
            safename_: CommIn.unPackString(),
            charClass_: CommIn.unPackInt8U(),
            team_: CommIn.unPackInt8U(),
            primaryWeaponItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            secondaryWeaponItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            shellColor_: CommIn.unPackInt8U(),
            hatItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            stampItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            _unused: CommIn.unPackInt8(),
            _unused2: CommIn.unPackInt8(),
            grenadeItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            meleeItem_: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            x_: CommIn.unPackFloat(),
            y_: CommIn.unPackFloat(),
            z_: CommIn.unPackFloat(),
            dx_: CommIn.unPackFloat(),
            dy_: CommIn.unPackFloat(),
            dz_: CommIn.unPackFloat(),
            yaw_: CommIn.unPackRadU(),
            pitch_: CommIn.unPackRad(),
            score_: CommIn.unPackInt32U(),
            // the following are all stats
            kills_: CommIn.unPackInt16U(),
            deaths_: CommIn.unPackInt16U(),
            streak_: CommIn.unPackInt16U(),
            totalKills_: CommIn.unPackInt32U(),
            totalDeaths_: CommIn.unPackInt32U(),
            bestGameStreak_: CommIn.unPackInt16U(),
            bestOverallStreak_: CommIn.unPackInt16U(),
            // end stats
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

        if (!this.players[playerData.id_])
            this.players[playerData.id_] = new GamePlayer(playerData.id_, playerData.team_, playerData);

        if (this.me.id == playerData.id_) {
            this.me = this.players[playerData.id_];
        }

        this.emit('playerJoin', this.players[playerData.id_]);
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

            if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.rounds = rounds0;
            if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.store = store0;
            if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.rounds = rounds1;
            if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.store = store1;

            player.grenades = grenades;
            player.position = { x: x, y: y, z: z };
            // console.log(`Player ${player.name} respawned at ${x}, ${y}, ${z}`);
            this.emit('playerRespawn', player);
        } else {
            // console.log(`Player ${id} not found. (me: ${this.me.id}) (respawn)`);
        }
    }

    #processSyncThemPacket() {
        const id = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const climbing = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player || player.id == this.me.id) {
            for (let i2 = 0; i2 < 3 /* FramesBetweenSyncs */; i2++) {
                CommIn.unPackInt8U();
                CommIn.unPackRadU();
                CommIn.unPackRad();
                CommIn.unPackInt8U();
            }
            return;
        }

        if (player.position.x !== x) player.position.x = x;
        if (player.position.z !== z) player.position.z = z;

        if (!player.jumping || Math.abs(player.position.y - y) > 0.5 && player.position.y !== y)
            player.position.y = y;

        if (player.climbing !== climbing) player.climbing = climbing;

        if (this.intents.includes(this.Intents.BUFFERS)) {
            if (!player.buffer) return;

            for (let i2 = 0; i2 < 3; i2++) {
                player.buffer[i2].controlKeys = CommIn.unPackInt8U();

                const yaw = CommIn.unPackRadU();
                if (!isNaN(yaw)) player.buffer[i2].yaw_ = yaw

                const pitch = CommIn.unPackRad();
                if (!isNaN(pitch)) player.buffer[i2].pitch_ = pitch

                CommIn.unPackInt8U();
            }

            player.buffer[0].x = x;
            player.buffer[0].y = y;
            player.buffer[0].z = z;
        } else {
            for (let i2 = 0; i2 < 3; i2++) {
                CommIn.unPackInt8U();
                CommIn.unPackRadU();
                CommIn.unPackRad();
                CommIn.unPackInt8U();
            }
        }
    }

    #processPausePacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];
        if (player) {
            player.playing = false;
            this.emit('playerPause', player);
        }
    }

    #processSwapWeaponPacket() {
        const id = CommIn.unPackInt8U();
        const newWeaponId = CommIn.unPackInt8U();

        const player = this.players[id];
        if (player) {
            player.activeGun = newWeaponId;
            this.emit('playerSwapWeapon', player, newWeaponId);
        }
    }

    #processDeathPacket() {
        const killedId = CommIn.unPackInt8U();
        const byId = CommIn.unPackInt8U();

        CommIn.unPackInt8U();
        CommIn.unPackInt8U();
        CommIn.unPackInt8U();

        const killed = this.players[killedId];
        const killer = this.players[byId];

        if (killed) {
            killed.playing = false;
            killed.streak = 0;
            killed.lastDeathTime = Date.now();
            killed.hp = 100;
            killed.hpShield = 0;
        }

        if (killer) killer.streak++;

        this.emit('playerDeath', killed, killer);
    }

    #processFirePacket() {
        const id = CommIn.unPackInt8U();

        for (let i = 0; i < 6; i++)
            CommIn.unPackFloat();

        const player = this.players[id];
        const playerWeapon = player.weapons[player.activeGun];

        if (playerWeapon && playerWeapon.ammo) {
            playerWeapon.ammo.rounds--;
            this.emit('playerFire', player, playerWeapon);
        }
    }

    #processSpawnItemPacket() {
        const id = CommIn.unPackInt16U();
        const type = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();

        this.game.collectables[type].push({ id, x, y, z });

        this.emit('spawnItem', type, id, { x, y, z });
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
            if (playerWeapon && playerWeapon.ammo) {
                playerWeapon.ammo.store = Math.min(playerWeapon.ammo.storeMax, playerWeapon.ammo.store + playerWeapon.ammo.pickup);
                this.emit('collectAmmo', player, playerWeapon);
            }
        }

        if (type == CollectTypes.GRENADE) {
            player.grenades++;
            if (player.grenades > 3) player.grenades = 3

            this.emit('collectGrenade', player);
        }
    }

    #processHitThemPacket() {
        const id = CommIn.unPackInt8U();
        const hp = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player) return;

        const oldHP = player.hp;
        player.hp = hp;

        this.emit('playerDamaged', player, oldHP, player.hp);
    }

    #processHitMePacket() {
        const hp = CommIn.unPackInt8U();

        CommIn.unPackFloat();
        CommIn.unPackFloat();

        const oldHp = this.me.hp;
        this.me.hp = hp;

        this.emit('selfDamaged', oldHp, this.me.hp);
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

        CommIn.unPackInt8U();
        CommIn.unPackInt8U();
        CommIn.unPackInt8U();

        const oldX = player.position.x;
        const oldY = player.position.y;
        const oldZ = player.position.z;

        player.position.x = newX;
        player.position.y = newY;
        player.position.z = newZ;

        if (oldX != newX || oldY != newY || oldZ != newZ) {
            this.emit('selfMoved', player, { x: oldX, y: oldY, z: oldZ }, { x: newX, y: newY, z: newZ });
        }
    }

    #processEventModifierPacket() {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.eventModifier);
        out.send(this.game.socket);
    }

    #processRemovePlayerPacket() {
        const id = CommIn.unPackInt8U();
        const removedPlayer = { ...this.players[id] }; // creates a snapshot of the player since they'll be deleted

        delete this.players[id.toString()];

        this.emit('playerLeave', removedPlayer);
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

            this.emit('gameStateChange', this.game);
        } else if (this.game.gameModeId == GameModes.kotc) {
            this.game.stage = CommIn.unPackInt8U(); // constants.CoopStates
            this.game.zoneNumber = CommIn.unPackInt8U(); // a number to represent which 'active zone' kotc is using
            this.game.capturing = CommIn.unPackInt8U(); // the team capturing, named "teams" in shell src
            this.game.captureProgress = CommIn.unPackInt16U(); // progress of the coop capture
            this.game.numCapturing = CommIn.unPackInt8U(); // number of players capturing - number/1000
            this.game.teamScore[1] = CommIn.unPackInt8U(); // team 1 (blue) score
            this.game.teamScore[2] = CommIn.unPackInt8U(); // team 2 (red) score

            // not in shell, for utility purposes =D
            this.game.stageName = CoopStagesById[this.game.stage]; // name of the stage ('start' / 'capturing' / 'etc')
            this.game.capturePercent = this.game.captureProgress / 1000; // progress of the capture as a percentage
            this.game.activeZone = this.game.map.zones ? this.game.map.zones[this.game.zoneNumber - 1] : null;

            this.emit('gameStateChange', this.game);
        } else if (this.game.gameModeId == GameModes.team) {
            this.game.teamScore[1] = CommIn.unPackInt16U();
            this.game.teamScore[2] = CommIn.unPackInt16U();
        }

        if (this.game.gameModeId !== GameModes.spatula) {
            delete this.game.spatula;
        }

        if (this.game.gameModeId !== GameModes.kotc) {
            delete this.game.stage;
            delete this.game.zoneNumber;
            delete this.game.capturing;
            delete this.game.captureProgress;
            delete this.game.numCapturing;
            delete this.game.stageName;
            delete this.game.numCapturing;
            delete this.game.activeZone;
        }

        if (this.game.gameModeId == GameModes.ffa) {
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
                if (player.weapons[0] && player.weapons[0].ammo) {
                    player.weapons[0].ammo.rounds = player.weapons[0].ammo.capacity;
                    player.weapons[0].ammo.store = player.weapons[0].ammo.storeMax;
                }

                // secondary, always cluck9mm
                if (player.weapons[1] && player.weapons[0].ammo) {
                    player.weapons[1].ammo.rounds = player.weapons[1].ammo.capacity;
                    player.weapons[1].ammo.store = player.weapons[1].ammo.storeMax;
                }
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

        this.emit('playerBeginStreak', player, ksType);
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

        this.emit('playerEndStreak', ksType, player);
    }

    #processHitShieldPacket() {
        const hb = CommIn.unPackInt8U();
        const hp = CommIn.unPackInt8U();

        CommIn.unPackFloat();
        CommIn.unPackFloat();

        this.me.hpShield = hb;
        this.me.hp = hp;

        if (this.me.hpShield <= 0) {
            this.me.streakRewards = this.me.streakRewards.filter((r) => r != ShellStreaks.HardBoiled);
            this.emit('selfShieldLost');
        } else {
            this.emit('selfShieldHit', this.me.hpShield);
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

        this.emit('gameOptionsChange', oldOptions, this.game.options);
        return false;
    }

    #processGameActionPacket() {
        const action = CommIn.unPackInt8U();

        if (action == GameActions.pause) {
            // console.log('settings changed, gameOwner changed game settings, force paused');
            this.emit('gameForcePause');
            setTimeout(() => this.me.playing = false, 3000);
        }

        if (action == GameActions.reset) {
            // console.log('owner reset game');

            Object.values(this.players).forEach((player) => player.streak = 0);

            if (this.game.gameModeId !== GameModes.ffa) this.game.teamScore = [0, 0, 0];

            if (this.game.gameModeId === GameModes.spatula) {
                this.game.spatula.controlledBy = 0;
                this.game.spatula.controlledByTeam = 0;
                this.game.spatula.coords = { x: 0, y: 0, z: 0 };
            }

            if (this.game.gameModeId === GameModes.kotc) {
                this.game.stage = CoopStates.capturing;
                this.game.zoneNumber = 0;
                this.game.activeZone = null;
                this.game.capturing = 0;
                this.game.captureProgress = 0;
                this.game.numCapturing = 0;
                this.game.stageName = CoopStagesById[CoopStates.capturing];
                this.game.capturePercent = 0.0;
            }

            this.emit('gameReset');
        }
    }

    #processPingPacket() {
        if (!this.intents.includes(this.Intents.PING)) return;

        const oldPing = this.ping;

        this.ping = Date.now() - this.lastPingTime;

        this.emit('pingUpdate', oldPing, this.ping);

        setTimeout(() => {
            const out = CommOut.getBuffer();
            out.packInt8(CommCode.ping);
            out.send(this.game.socket);
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
        player.streak = 0;

        this.emit('playerSwitchTeam', player, oldTeam, toTeam);
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

        CommIn.unPackInt8();
        CommIn.unPackInt8();

        const findCosmetics = this.intents.includes(this.Intents.COSMETIC_DATA);

        const primaryWeaponItem = findCosmetics ? findItemById(primaryWeaponIdx) : primaryWeaponIdx;
        const secondaryWeaponItem = findCosmetics ? findItemById(secondaryWeaponIdx) : secondaryWeaponIdx;
        const hatItem = findCosmetics ? findItemById(hatIdx) : hatIdx;
        const stampItem = findCosmetics ? findItemById(stampIdx) : stampIdx;
        const grenadeItem = findCosmetics ? findItemById(grenadeIdx) : grenadeIdx;
        const meleeItem = findCosmetics ? findItemById(meleeIdx) : meleeIdx;

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

            if (oldWeaponIdx !== player.selectedGun) this.emit('playerChangeGun', player, oldWeaponIdx, player.selectedGun);
            if (oldCharacter !== player.character) this.emit('playerChangeCharacter', player, oldCharacter, player.character);
        }
    }

    #processUpdateBalancePacket() {
        const newBalance = CommIn.unPackInt32U();
        const oldBalance = this.account.eggBalance;

        this.account.eggBalance = newBalance;
        this.emit('balanceUpdate', newBalance - oldBalance, newBalance);
    }

    #processRespawnDeniedPacket() {
        this.me.playing = false;
        this.emit('selfRespawnFail');
    }

    #processMeleePacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];

        if (player) this.emit('playerMelee', player);
    }

    #processReloadPacket() {
        const id = CommIn.unPackInt8U();
        const player = this.players[id];

        if (!player) return;

        const playerActiveWeapon = player.weapons[player.activeGun];

        if (playerActiveWeapon.ammo) {
            const newRounds = Math.min(
                Math.min(playerActiveWeapon.ammo.capacity, playerActiveWeapon.ammo.reload) - playerActiveWeapon.ammo.rounds,
                playerActiveWeapon.ammo.store
            );

            playerActiveWeapon.ammo.rounds += newRounds;
            playerActiveWeapon.ammo.store -= newRounds;
        }

        this.emit('playerReload', player, playerActiveWeapon);
    }

    #processGameRequestOptionsPacket() {
        const out = CommOut.getBuffer();
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
    }

    #processExplodePacket() {
        const itemType = CommIn.unPackInt8U();
        let item = CommIn.unPackInt16U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const damage = CommIn.unPackInt8U();
        const radius = CommIn.unPackFloat();

        if (this.intents.includes(this.Intents.COSMETIC_DATA))
            item = findItemById(item);

        if (itemType == ItemTypes.Grenade) this.emit('grenadeExploded', item, { x, y, z }, damage, radius);
        else this.emit('rocketHit', { x, y, z }, damage, radius);
    }

    #processThrowGrenadePacket() {
        const id = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const dx = CommIn.unPackFloat();
        const dy = CommIn.unPackFloat();
        const dz = CommIn.unPackFloat();

        const player = this.players[id];

        if (player) {
            player.grenades--;
            this.emit('playerThrowGrenade', player, { x, y, z }, { x: dx, y: dy, z: dz });
        }
    }

    #processChallengeCompletePacket() {
        const id = CommIn.unPackInt8U();
        const challengeId = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player) return;

        if (!this.intents.includes(this.Intents.CHALLENGES))
            return this.emit('challengeComplete', player, challengeId);

        const challenge = this.account.challenges.find(c => c.id == challengeId);
        this.emit('challengeComplete', player, challenge);

        if (player.id == this.me.id) this.refreshChallenges();
    }

    #handlePacket(packet) {
        CommIn.init(packet);

        if (this.intents.includes(this.Intents.PACKET_HOOK))
            this.emit('packet', packet);

        let lastCommand = 0;
        let lastCode = 0;
        let abort = false;

        while (CommIn.isMoreDataAvailable() && !abort) {
            const cmd = CommIn.unPackInt8U();

            switch (cmd) {
                case CommCode.syncThem:
                    this.#processSyncThemPacket();
                    break;

                case CommCode.fire:
                    this.#processFirePacket();
                    break;

                case CommCode.hitThem:
                    this.#processHitThemPacket();
                    break;

                case CommCode.syncMe:
                    this.#processSyncMePacket();
                    break;

                case CommCode.hitMe:
                    this.#processHitMePacket();
                    break;

                case CommCode.swapWeapon:
                    this.#processSwapWeaponPacket();
                    break;

                case CommCode.collectItem:
                    this.#processCollectPacket();
                    break;

                case CommCode.respawn:
                    this.#processRespawnPacket();
                    break;

                case CommCode.die:
                    this.#processDeathPacket();
                    break;

                case CommCode.pause:
                    this.#processPausePacket();
                    break;

                case CommCode.chat:
                    this.#processChatPacket();
                    break;

                case CommCode.addPlayer:
                    this.#processAddPlayerPacket();
                    break;

                case CommCode.removePlayer:
                    this.#processRemovePlayerPacket();
                    break;

                case CommCode.eventModifier:
                    this.#processEventModifierPacket();
                    break;

                case CommCode.metaGameState:
                    this.#processGameStatePacket();
                    break;

                case CommCode.beginShellStreak:
                    this.#processBeginStreakPacket();
                    break;

                case CommCode.endShellStreak:
                    this.#processEndStreakPacket();
                    break;

                case CommCode.hitMeHardBoiled:
                    this.#processHitShieldPacket();
                    break;

                case CommCode.gameOptions:
                    this.#processGameOptionsPacket();
                    break;

                case CommCode.ping:
                    this.#processPingPacket();
                    break;

                case CommCode.switchTeam:
                    this.#processSwitchTeamPacket();
                    break;

                case CommCode.changeCharacter:
                    this.#processChangeCharacterPacket();
                    break;

                case CommCode.reload:
                    this.#processReloadPacket();
                    break;

                case CommCode.explode:
                    this.#processExplodePacket();
                    break;

                case CommCode.throwGrenade:
                    this.#processThrowGrenadePacket();
                    break;

                case CommCode.spawnItem:
                    this.#processSpawnItemPacket();
                    break;

                case CommCode.melee:
                    this.#processMeleePacket();
                    break;

                case CommCode.updateBalance:
                    this.#processUpdateBalancePacket();
                    break;

                case CommCode.challengeCompleted:
                    this.#processChallengeCompletePacket();
                    break;

                case CommCode.gameAction:
                    this.#processGameActionPacket();
                    break;

                case CommCode.requestGameOptions:
                    this.#processGameRequestOptionsPacket();
                    break;

                case CommCode.respawnDenied:
                    this.#processRespawnDeniedPacket();
                    break;

                // we do not plan to implement these
                // for more info, see comm/codes.js
                case CommCode.clientReady:
                case CommCode.expireUpgrade:
                    break;

                case CommCode.musicInfo:
                    CommIn.unPackLongString();
                    break;

                default:
                    console.error(`handlePacket: I got but did not handle a: ${Object.keys(CommCode).find(k => CommCode[k] === cmd)} ${cmd}`);
                    if (lastCommand) console.error(`handlePacket: It may be a result of the ${lastCommand} command (${lastCode}).`);
                    abort = true
                    break;
            }

            lastCommand = Object.keys(CommCode).find(k => CommCode[k] === cmd);
            lastCode = cmd;
        }
    }

    async checkChiknWinner() {
        const response = await queryServices({
            cmd: 'chicknWinnerReady',
            id: this.account.id,
            sessionId: this.account.sessionId
        });

        this.account.cw.limit = response.limit;
        this.account.cw.atLimit = response.limit > 3;

        // if there is a "span", that means that it's under the daily limit and you can play again soon
        // if there is a "period", that means that the account is done for the day and must wait a long time
        this.account.cw.secondsUntilPlay = response.span || response.period || 0;
        this.account.cw.canPlayAgain = Date.now() + (this.account.cw.secondsUntilPlay * 1000);

        return this.account.cw;
    }

    async playChiknWinner() {
        if (this.account.cw.atLimit || this.account.cw.limit > ChiknWinnerDailyLimit) return 'hit_daily_limit';
        if (this.account.cw.canPlayAgain > Date.now()) return 'on_cooldown';

        const response = await queryServices({
            cmd: 'incentivizedVideoReward',
            firebaseId: this.account.firebaseId,
            id: this.account.id,
            sessionId: this.account.sessionId,
            token: null
        }, this.proxy, this.instance);

        if (response.error) {
            if (response.error == 'RATELIMITED') {
                await this.checkChiknWinner();
                return 'on_cooldown';
            } else if (response.error == 'SESSION_EXPIRED') {
                return 'session_expired';
            } else {
                console.error('Unknown Chikn Winner response', response);
                return 'unknown_error';
            }
        }

        if (response.reward) {
            this.account.eggBalance += response.reward.eggsGiven;
            response.reward.itemIds.forEach((id) => this.account.ownedItemIds.push(id));

            await this.checkChiknWinner();

            return response.reward;
        }

        console.error('Unknown Chikn Winner response', response);
        return 'unknown_error';
    }

    async resetChiknWinner() {
        if (this.account.eggBalance < 200) return 'not_enough_eggs';
        if (!this.account.cw.atLimit) return 'not_at_limit';

        const response = await queryServices({
            cmd: 'chwReset',
            sessionId: this.account.sessionId
        });

        if (response.result !== 'SUCCESS') {
            console.error('Unknown Chikn Winner reset response', response);
            return 'unknown_error';
        }

        this.account.eggBalance -= 200;
        await this.checkChiknWinner();

        return this.account.cw;
    }

    canSee(target) {
        if (!this.intents.includes(this.Intents.PATHFINDING)) throw new Error('You must have the PATHFINDING intent to use this method.');
        return this.pathing.nodeList.hasLineOfSight(this.me.position, target.position);
    }

    getBestTarget(customFilter = () => true) {
        const options = Object.values(this.players)
            .filter((player) => player)
            .filter((player) => player !== this.me)
            .filter((player) => player.playing)
            .filter((player) => player.hp > 0)
            .filter((player) => player.name !== this.me.name)
            .filter((player) => this.me.team === 0 || player.team !== this.me.team)
            .filter((player) => this.canSee(player))
            .filter((player) => !!customFilter(player));

        let minDistance = 200;
        let targetPlayer = null;

        for (const player of options) {
            const dx = player.position.x - this.me.position.x;
            const dy = player.position.y - this.me.position.y;
            const dz = player.position.z - this.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                targetPlayer = player;
            }
        }

        return targetPlayer;
    }

    async refreshBalance() {
        const result = await queryServices({
            cmd: 'checkBalance',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId
        }, this.proxy, this.instance);

        this.account.eggBalance = result.currentBalance;

        return result.currentBalance;
    }

    async redeemCode(code) {
        const result = await queryServices({
            cmd: 'redeem',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            id: this.account.id,
            code
        }, this.proxy, this.instance);

        if (result.result === 'SUCCESS') {
            this.account.eggBalance = result.eggs_given;
            result.item_ids.forEach((id) => this.account.ownedItemIds.push(id));

            return {
                result,
                eggsGiven: result.eggs_given,
                itemIds: result.item_ids
            };
        } else return result;
    }

    async claimURLReward(reward) {
        const result = await queryServices({
            cmd: 'urlRewardParams',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            reward
        }, this.proxy, this.instance);

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
        }

        return result;
    }

    async claimSocialReward(rewardTag) {
        const result = await queryServices({
            cmd: 'reward',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            rewardTag
        }, this.proxy, this.instance);

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
        }

        return result;
    }

    async buyItem(itemId) {
        const result = await queryServices({
            cmd: 'buy',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            itemId,
            save: true
        }, this.proxy, this.instance);

        if (result.result === 'SUCCESS') {
            this.account.eggBalance = result.currentBalance;
            this.account.ownedItemIds.push(result.itemId);
        }

        return result;
    }

    quit(noCleanup = false) {
        if (this.intents.includes(this.Intents.PLAYER_HEALTH))
            clearInterval(this.healthIntervalId);

        clearInterval(this.updateIntervalId);

        this.game.socket.close();
        this.matchmaker.close();

        this._dispatches = [];
        this._packetQueue = [];

        if (!noCleanup) {
            delete this.account;
            delete this.game;
            delete this.me;
            delete this.players;
        }
    }
}

export default Bot;
