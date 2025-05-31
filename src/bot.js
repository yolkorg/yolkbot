import API from './api.js';

import CommIn from './comm/CommIn.js';
import CommOut from './comm/CommOut.js';
import { CloseCode } from './comm/Codes.js';
import { CommCode } from './constants/codes.js';

import GamePlayer from './bot/GamePlayer.js';
import Matchmaker from './matchmaker.js';
import yolkws from './socket.js';

import {
    ChiknWinnerDailyLimit,
    CollectTypes,
    CoopStates,
    findItemById,
    FramesBetweenSyncs,
    GameActions,
    GameModes,
    GameOptionFlags,
    GunList,
    ItemTypes,
    Movements,
    PlayTypes,
    ProxiesEnabled,
    ShellStreaks,
    StateBufferSize
} from './constants/index.js';

import LookAtPosDispatch from './dispatches/LookAtPosDispatch.js';
import MovementDispatch from './dispatches/MovementDispatch.js';

import { NodeList } from './pathing/mapnode.js';

import { coords } from './wasm/wrapper.js';
import { fetchMap, initKotcZones } from './util.js';

import { Challenges } from './constants/challenges.js';
import { Maps } from './constants/maps.js';

const CoopStagesById = Object.fromEntries(Object.entries(CoopStates).map(([key, value]) => [value, key]));
const GameModesById = Object.fromEntries(Object.entries(GameModes).map(([key, value]) => [value, key]));

const intents = {
    CHALLENGES: 1,
    STATS: 2,
    PATHFINDING: 3,
    PING: 5,
    COSMETIC_DATA: 6,
    PLAYER_HEALTH: 7,
    PACKET_HOOK: 8,
    LOG_PACKETS: 10,
    NO_LOGIN: 11,
    DEBUG_BUFFER: 12,
    DEBUG_BEST_TARGET: 14,
    KOTC_ZONES: 15
}

const mod = (n, m) => ((n % m) + m) % m;

export class Bot {
    static Intents = intents;
    Intents = intents;

    #dispatches = [];

    #hooks = {};
    #globalHooks = [];

    #initialAccount;
    #initialGame;

    constructor(params = {}) {
        if (params.proxy && !ProxiesEnabled) this.processError('proxies do not work and hence are not supported in the browser');

        this.intents = params.intents || [];

        if (this.intents.includes(this.Intents.COSMETIC_DATA)) {
            const ballCap = findItemById(1001);
            if (!ballCap) this.processError('you cannot use the COSMETIC_DATA intent inside of the singlefile browser bundles');
        }

        this.instance = params.instance || 'shellshock.io';
        this.protocol = params.protocol || 'wss';
        this.proxy = params.proxy || '';
        this.httpProxy = params.httpProxy || '';

        this.state = {
            // kept for specifying various params
            name: 'yolkbot',
            weaponIdx: 0,

            // wow!
            inGame: false,

            // view
            yaw: 0,
            pitch: 0,
            controlKeys: 0,

            // tracking for dispatch checks
            reloading: false,
            swappingGun: false,
            usingMelee: false,

            // syncMe related vars
            stateIdx: 0,
            serverStateIdx: 0,
            shotsFired: 0,
            buffer: [],

            // for checks
            left: false
        }

        this.players = {}
        this.me = new GamePlayer({})

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
                // false = allowed to use
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

        this.#initialGame = this.game;

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
        }

        this.#initialAccount = this.account;

        this.matchmaker = null;

        this.api = new API({
            instance: this.instance,
            protocol: this.protocol,
            proxy: this.proxy,
            httpProxy: this.httpProxy,
            maxRetries: params?.apiMaxRetries
        });

        this.ping = 0;
        this.lastPingTime = -1;

        this.lastDeathTime = -1;
        this.lastChatTime = -1;

        this.lastUpdateTick = 0;

        this.pathing = {
            nodeList: null,
            followingPath: false,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }

        this.hasQuit = false;
    }

    dispatch(dispatch) {
        if (dispatch.validate(this)) {
            if (dispatch.check(this)) dispatch.execute(this);
            else this.#dispatches.push(dispatch);
            return true;
        } else return false;
    }

    async createAccount(email, pass) {
        this.account.email = email;
        this.account.password = pass;

        const loginData = await this.api.createAccount(email, pass);
        return this.#processLoginData(loginData);
    }

    async login(email, pass) {
        this.account.email = email;
        this.account.password = pass;

        const loginData = await this.api.loginWithCredentials(email, pass);
        return this.#processLoginData(loginData);
    }

    async loginWithRefreshToken(refreshToken) {
        const loginData = await this.api.loginWithRefreshToken(refreshToken);
        return this.#processLoginData(loginData);
    }

    async loginAnonymously() {
        delete this.account.email;
        delete this.account.password;

        const loginData = await this.api.loginAnonymously();
        return this.#processLoginData(loginData);
    }

    #processLoginData(loginData) {
        if (typeof loginData !== 'object') {
            this.emit('authFail', loginData);
            return false;
        }

        if (loginData.banRemaining) {
            this.emit('banned', loginData.banRemaining);
            return false;
        }

        if (!loginData.playerOutput) {
            this.emit('authFail', loginData);
            return false;
        }

        loginData = loginData.playerOutput;

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

        if (this.intents.includes(this.Intents.CHALLENGES))
            this.#importChallenges(loginData.challenges);

        this.emit('authSuccess', this.account);

        return this.account;
    }

    #importChallenges(challengeArray) {
        this.account.challenges = [];

        for (const challengeData of challengeArray) {
            const challengeInfo = Challenges.find(c => c.id === challengeData.challengeId);
            if (!challengeInfo) continue;

            delete challengeData.playerId;

            this.account.challenges.push({
                raw: { challengeInfo, challengeData },
                id: challengeData.challengeId,
                name: challengeInfo.loc.title,
                desc: challengeInfo.loc.desc,
                rewardEggs: challengeInfo.reward,
                isRerolled: !!challengeData.reset,
                isClaimed: !!challengeData.claimed,
                isCompleted: !!challengeData.completed,
                progressNum: challengeData.progress,
                goalNum: challengeInfo.goal
            });
        }
    }

    async initMatchmaker() {
        if (!this.account.sessionId && !this.intents.includes(this.Intents.NO_LOGIN)) {
            const anonLogin = await this.loginAnonymously();
            if (!anonLogin) return false;
        }

        if (!this.matchmaker) {
            this.matchmaker = new Matchmaker({
                sessionId: this.account.sessionId,
                proxy: this.proxy,
                instance: this.instance,
                protocol: this.protocol,
                noLogin: this.intents.includes(this.Intents.NO_LOGIN),
                api: this.api
            });

            this.matchmaker.on('authFail', (data) => this.emit('authFail', data));
            this.matchmaker.on('error', (data) => this.processError(data));

            await this.matchmaker.getRegions();
        }

        return true;
    }

    async #joinGameWithCode(code) {
        if (!await this.initMatchmaker()) return 'matchmakerInitFail';

        await this.matchmaker.waitForConnect();

        return await new Promise((resolve) => {
            const listener = (message) => {
                if (message.command === 'gameFound') {
                    this.matchmaker.off('msg', listener);

                    this.game.raw = message;
                    this.game.code = message.id;

                    resolve(message.id);
                }

                if (message.error && message.error === 'gameNotFound') {
                    this.processError(`Game ${code} not found (likely expired).`)
                    this.leave();
                    return 'gameNotFound';
                }
            };

            this.matchmaker.on('msg', listener);

            this.matchmaker.send({
                command: 'joinGame',
                id: code,
                observe: false,
                sessionId: this.account.sessionId
            });
        });
    }

    async findPublicGame(opts) {
        if (!this.matchmaker) this.initMatchmaker();
        if (!this.matchmaker) return false;

        return await this.matchmaker.findPublicGame(opts);
    }

    // region - a region id ('useast', 'germany', etc)
    // mode - a mode name that corresponds to a GameMode id
    // map - the name of a map
    async createPrivateGame(opts = {}) {
        if (!await this.initMatchmaker()) return false;

        if (!opts.region && !this.matchmaker.regionList && !this.matchmaker.regionList.length)
            return this.processError('pass a region to createPrivateGame or call getRegions() for a random one');

        if (!opts.region) opts.region = this.matchmaker.getRandomRegion();

        if (!opts.mode) return this.processError('pass a mode to createPrivateGame')
        if (typeof GameModes[opts.mode] !== 'number') return this.processError('invalid mode passed to createPrivateGame, see GameModes for a list')

        if (!opts.map) opts.map = Maps[Maps.length * Math.random() | 0].name;

        const map = Maps.find(m => m.name.toLowerCase() === opts.map.toLowerCase());
        const mapIdx = Maps.indexOf(map);

        if (mapIdx === -1) return this.processError('invalid map, see the Maps constant for a list');

        await this.matchmaker.waitForConnect();

        const game = await new Promise((resolve) => {
            const listener = (msg) => {
                if (msg.command === 'gameFound') {
                    this.matchmaker.off('msg', listener);
                    resolve(msg);
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

        return game;
    }

    async join(name, data) {
        this.state.name = name || 'yolkbot';

        if (typeof data === 'string') {
            if (data.includes('#')) data = data.split('#')[1]; // stupid shell kids put in full links

            const joinResult = await this.#joinGameWithCode(data);

            if (joinResult === 'matchmakerInitFail') return this.processError('failed to create matchmaker, you may be ratelimited (try a vpn?)');
            if (joinResult === 'gameNotFound') return this.processError('game not found, it may have expired or been deleted');
            if (!this.game.raw.id) return this.processError('an internal error occured while joining the game, please report this to developers');
        }

        if (typeof data === 'object') {
            if (this.account.id === 0) await this.loginAnonymously();

            this.game.raw = data;
            this.game.code = this.game.raw.id;

            if (!this.game.raw.id) return this.processError('invalid game object passed to join (missing id)');
            if (!this.game.raw.subdomain) return this.processError('invalid game object passed to join (missing subdomain)');
            if (!this.game.raw.uuid) return this.processError('invalid game object passed to join (missing uuid)');
        }

        const attempt = async () => {
            try {
                const host = this.instance.startsWith('localhost:') ? this.instance : `${this.game.raw.subdomain}.${this.instance}`;

                this.game.socket = new yolkws(`${this.protocol}://${host}/game/${this.game.raw.id}`, this.proxy);
                this.game.socket.onerror = async (e) => {
                    this.processError(e);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return await attempt();
                }
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await attempt();
            }
        }

        await attempt();

        this.game.socket.binaryType = 'arraybuffer';

        this.game.socket.onopen = () => this.game.socket.onerror = null;
        this.game.socket.onmessage = (msg) => this.processPacket(msg.data);

        this.game.socket.onclose = (e) => {
            if (this.state.left) this.state.left = false;
            else {
                this.emit('close', e.code);
                this.leave(-1);
            }
        }
    }

    #processPathfinding() {
        const myPositionStr = Object.entries(this.me.position).map(entry => Math.floor(entry[1])).join(',');

        if (myPositionStr === this.pathing.activePath[this.pathing.activePath.length - 1].positionStr) {
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
                if (node.flatRadialDistance(this.me.position) < 0.1 && node.position.y === Math.floor(this.me.position.y)) {
                    if (this.pathing.activePath.indexOf(node) >= this.pathing.activeNodeIdx) {
                        this.pathing.activeNodeIdx = this.pathing.activePath.indexOf(node) + 1;
                        this.pathing.activeNode = this.pathing.activePath[this.pathing.activeNodeIdx];
                        break;
                    }
                }
            }

            if (!(this.state.controlKeys & Movements.FORWARD)) this.dispatch(new MovementDispatch(Movements.FORWARD));
        }
    }

    update() {
        if (this.hasQuit) return;

        if (this.pathing.followingPath && this.intents.includes(this.Intents.PATHFINDING))
            this.#processPathfinding();

        if (this.#dispatches.length > 0) {
            for (let i = 0; i < this.#dispatches.length; i++) {
                const disp = this.#dispatches[i];
                if (disp.check(this)) {
                    disp.execute(this);
                    this.#dispatches.splice(i, 1);
                }
            }
        }

        if (this.me.playing) {
            const idx = this.state.stateIdx;

            if (this.intents.includes(this.Intents.DEBUG_BUFFER)) {
                console.log('setting buffer for idx', idx);
                console.log('checking...shotsFired', this.state.shotsFired);
            }

            this.me.jumping = !!(this.state.controlKeys & Movements.JUMP);

            this.state.buffer[idx] = {
                controlKeys: this.state.controlKeys,
                yaw: this.state.yaw,
                pitch: this.state.pitch,
                shotsFired: this.state.shotsFired
            }

            this.state.shotsFired = 0;

            if (this.lastUpdateTick >= 2) {
                this.emit('tick');

                const out = CommOut.getBuffer();

                out.packInt8(CommCode.syncMe);

                out.packInt8(this.state.stateIdx); // stateIdx
                out.packInt8(this.state.serverStateIdx);

                const startIdx = mod((this.state.stateIdx - FramesBetweenSyncs) + 1, StateBufferSize);
                for (let i = 0; i < FramesBetweenSyncs; i++) {
                    const idxOnFrame = mod(startIdx + i, StateBufferSize);

                    if (this.intents.includes(this.Intents.DEBUG_BUFFER))
                        console.log('going with', this.state.stateIdx, startIdx, idxOnFrame, this.state.buffer[idxOnFrame]);

                    out.packInt8(this.state.buffer[idxOnFrame]?.controlKeys || 0);
                    out.packInt8(this.state.buffer[idxOnFrame]?.shotsFired || 0);

                    const targetYaw = this.state.buffer[idxOnFrame]?.yaw || this.state.yaw;
                    const targetPitch = this.state.buffer[idxOnFrame]?.pitch || this.state.pitch;
                    const resultingCoords = coords(targetYaw, targetPitch);

                    out.packString(resultingCoords); // coords from the wasm :100:

                    out.packInt8(100); // fixes commcode issues, supposed to be scale or smth
                }

                out.send(this.game.socket);

                this.state.buffer = [];

                this.lastUpdateTick = 0;
            } else this.lastUpdateTick++;

            this.state.stateIdx = mod(this.state.stateIdx + 1, StateBufferSize);
        }

        if (this.intents.includes(this.Intents.PLAYER_HEALTH)) {
            for (const player of Object.values(this.players)) {
                if (player.playing && player.hp > 0) {
                    const regenSpeed = 0.1 * (this.game.isPrivate ? this.game.options.healthRegen : 1);

                    if (player.streakRewards.includes(ShellStreaks.OverHeal)) player.hp = Math.max(100, player.hp - regenSpeed);
                    else player.hp = Math.min(100, player.hp + regenSpeed);
                }

                if (player.spawnShield > 0) player.spawnShield -= 6;
            }
        }
    }

    on(event, cb) {
        if (Object.keys(this.#hooks).includes(event)) this.#hooks[event].push(cb);
        else this.#hooks[event] = [cb];
    }

    onAny(cb) {
        this.#globalHooks.push(cb);
    }

    off(event, cb) {
        if (cb) this.#hooks[event] = this.#hooks[event].filter((hook) => hook !== cb);
        else this.#hooks[event] = [];
    }

    emit(event, ...args) {
        if (this.hasQuit) return;

        if (this.#hooks[event]) for (const cb of this.#hooks[event]) cb(...args);
        for (const cb of this.#globalHooks) cb(event, ...args);
    }

    #processChatPacket() {
        const id = CommIn.unPackInt8U();
        const msgFlags = CommIn.unPackInt8U();
        const text = CommIn.unPackString().valueOf();

        const player = this.players[id];

        this.emit('chat', player, text, msgFlags);
    }

    #processAddPlayerPacket() {
        const id = CommIn.unPackInt8U();
        const findCosmetics = this.intents.includes(this.Intents.COSMETIC_DATA);

        const playerData = {
            id,
            uniqueId: CommIn.unPackString(),
            name: CommIn.unPackString(),
            safeName: CommIn.unPackString(),
            charClass: CommIn.unPackInt8U(),
            team: CommIn.unPackInt8U(),
            primaryWeaponItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            secondaryWeaponItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            shellColor: CommIn.unPackInt8U(),
            hatItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            stampItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            stampPosX: CommIn.unPackInt8(),
            stampPosY: CommIn.unPackInt8(),
            grenadeItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            meleeItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
            x: CommIn.unPackFloat(),
            y: CommIn.unPackFloat(),
            z: CommIn.unPackFloat(),
            $dx: CommIn.unPackFloat(),
            $dy: CommIn.unPackFloat(),
            $dz: CommIn.unPackFloat(),
            yaw: CommIn.unPackRadU(),
            pitch: CommIn.unPackRad(),
            score: CommIn.unPackInt32U(),
            // the following are all stats
            kills: CommIn.unPackInt16U(),
            deaths: CommIn.unPackInt16U(),
            streak: CommIn.unPackInt16U(),
            totalKills: CommIn.unPackInt32U(),
            totalDeaths: CommIn.unPackInt32U(),
            bestGameStreak: CommIn.unPackInt16U(),
            bestOverallStreak: CommIn.unPackInt16U(),
            // end stats
            shield: CommIn.unPackInt8U(),
            hp: CommIn.unPackInt8U(),
            playing: CommIn.unPackInt8U(),
            weaponIdx: CommIn.unPackInt8U(),
            $controlKeys: CommIn.unPackInt8U(),
            upgradeProductId: CommIn.unPackInt8U(),
            activeShellStreaks: CommIn.unPackInt8U(),
            social: CommIn.unPackLongString(),
            hideBadge: CommIn.unPackInt8U()
        };

        CommIn.unPackInt8U(); // mapIdx
        CommIn.unPackInt8U(); // private (bool)
        CommIn.unPackInt8U(); // gametype

        const player = new GamePlayer(playerData, this.game.gameMode === GameModes.kotc ? this.game.activeZone : null);
        if (!this.players[playerData.id]) this.players[playerData.id] = player;

        this.emit('playerJoin', player);

        if (this.me.id === playerData.id) {
            this.me = player;
            this.emit('botJoined', this.me);
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

            if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.rounds = rounds0;
            if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.store = store0;
            if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.rounds = rounds1;
            if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.store = store1;

            player.grenades = grenades;
            player.position = { x, y, z };

            player.spawnShield = 120;

            this.emit('playerRespawn', player);
        }
    }

    #processSyncThemPacket() {
        const id = CommIn.unPackInt8U();
        const x = CommIn.unPackFloat();
        const y = CommIn.unPackFloat();
        const z = CommIn.unPackFloat();
        const climbing = CommIn.unPackInt8U();

        const player = this.players[id];
        if (!player || player.id === this.me.id) {
            for (let i2 = 0; i2 < FramesBetweenSyncs; i2++) {
                CommIn.unPackInt8U();
                CommIn.unPackRadU();
                CommIn.unPackRad();
                CommIn.unPackInt8U();
            }
            return;
        }

        for (let i2 = 0; i2 < FramesBetweenSyncs; i2++) {
            const controlKeys = CommIn.unPackInt8U();

            if (controlKeys & Movements.JUMP) player.jumping = true;
            else player.jumping = false;

            player.view.yaw = CommIn.unPackRadU();
            player.view.pitch = CommIn.unPackRad();

            CommIn.unPackInt8U();
        }

        const didChange = player.position.x !== x || player.position.y !== y || player.position.z !== z || player.climbing !== climbing;

        if (player.position.x !== x) player.position.x = x;
        if (player.position.z !== z) player.position.z = z;

        if (!player.jumping || Math.abs(player.position.y - y) > 0.5 && player.position.y !== y)
            player.position.y = y;

        if (player.climbing !== climbing) player.climbing = climbing;

        if (didChange) {
            this.emit('playerMove', player, player.position);

            if (this.game.gameModeId === GameModes.kotc) {
                const activeZone = this.game.activeZone;
                if (!activeZone) {
                    if (player.inKotcZone) {
                        player.inKotcZone = false;
                        this.emit('playerLeaveZone', player, activeZone);
                    }
                    return;
                }

                const fx = Math.round(x);
                const fy = Math.floor(y);
                const fz = Math.round(z);

                const isInZone = activeZone.some((coordSets) => coordSets.x === fx && coordSets.y === fy && coordSets.z === fz);

                if (player.inKotcZone && !isInZone) {
                    player.inKotcZone = false;
                    this.emit('playerLeaveZone', player);
                } else if (!player.inKotcZone && isInZone) {
                    player.inKotcZone = true;
                    this.emit('playerEnterZone', player);
                }
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
        const killerId = CommIn.unPackInt8U();

        CommIn.unPackInt8U(); // respawnTime
        CommIn.unPackInt8U(); // killerLastDmg
        CommIn.unPackInt8U(); // killedLastDmg

        const killed = this.players[killedId];
        const killer = this.players[killerId];

        if (killed) {
            killed.playing = false;
            killed.streak = 0;
            killed.lastDeathTime = Date.now();
            killed.hp = 100;
            killed.spawnShield = 0;
            killed.stats.deathsInGame++;
            killed.stats.totalDeaths++;
        }

        if (killer) {
            killer.streak++;
            killer.stats.killsInGame++;
            killer.stats.totalKills++;
            killer.stats.streak = killer.streak;

            if (killer.streak > killer.stats.bestGameStreak) killer.stats.bestGameStreak = killer.streak;
            if (killer.streak > killer.stats.bestOverallStreak) killer.stats.bestOverallStreak = killer.streak;
        }

        this.emit('playerDeath', killed, killer);
    }

    #processFirePacket() {
        const id = CommIn.unPackInt8U();

        for (let i = 0; i < 6; i++) CommIn.unPackFloat();

        const player = this.players[id];
        if (!player) return;

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

        this.game.collectables[type] = this.game.collectables[type].filter(c => c.id !== id);

        if (type === CollectTypes.AMMO) {
            const playerWeapon = player.weapons[applyToWeaponIdx];
            if (playerWeapon && playerWeapon.ammo) {
                playerWeapon.ammo.store = Math.min(playerWeapon.ammo.storeMax, playerWeapon.ammo.store + playerWeapon.ammo.pickup);
                this.emit('collectAmmo', player, playerWeapon);
            }
        }

        if (type === CollectTypes.GRENADE) {
            player.grenades++;
            if (player.grenades > 3) player.grenades = 3;

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

        CommIn.unPackInt8U(); // stateIdx

        const serverStateIdx = CommIn.unPackInt8U();

        const newX = CommIn.unPackFloat();
        const newY = CommIn.unPackFloat();
        const newZ = CommIn.unPackFloat();

        this.me.climbing = !!CommIn.unPackInt8U();

        CommIn.unPackInt8U();
        CommIn.unPackInt8U();

        if (!player) return;

        this.state.serverStateIdx = serverStateIdx;

        const oldX = player.position.x;
        const oldY = player.position.y;
        const oldZ = player.position.z;

        player.position.x = newX;
        player.position.y = newY;
        player.position.z = newZ;

        if (oldX !== newX || oldY !== newY || oldZ !== newZ)
            this.emit('selfMoved', player, { x: oldX, y: oldY, z: oldZ }, { x: newX, y: newY, z: newZ });
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
        if (this.game.gameModeId === GameModes.spatula) {
            this.game.teamScore[1] = CommIn.unPackInt16U();
            this.game.teamScore[2] = CommIn.unPackInt16U();

            const spatulaCoords = {
                x: CommIn.unPackFloat(),
                y: CommIn.unPackFloat(),
                z: CommIn.unPackFloat()
            };

            const controlledBy = CommIn.unPackInt8U();
            const controlledByTeam = CommIn.unPackInt8U();

            this.game.spatula = { coords: spatulaCoords, controlledBy, controlledByTeam };

            this.emit('gameStateChange', this.game);
        } else if (this.game.gameModeId === GameModes.kotc) {
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
        } else if (this.game.gameModeId === GameModes.team) {
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

        if (this.game.gameModeId === GameModes.ffa) delete this.game.teamScore;
    }

    #processBeginStreakPacket() {
        const id = CommIn.unPackInt8U();
        const ksType = CommIn.unPackInt8U();
        const player = this.players[id];

        switch (ksType) {
            case ShellStreaks.HardBoiled:
                if (id === this.me.id) this.me.shieldHp = 100;
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
                if (player.weapons[1] && player.weapons[1].ammo) {
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

        if (streaks.includes(ksType) && player.streakRewards.includes(ksType))
            player.streakRewards = player.streakRewards.filter((r) => r !== ksType);

        this.emit('playerEndStreak', player, ksType);
    }

    #processHitShieldPacket() {
        const hb = CommIn.unPackInt8U();
        const hp = CommIn.unPackInt8U();

        CommIn.unPackFloat();
        CommIn.unPackFloat();

        this.me.shieldHp = hb;
        this.me.hp = hp;

        if (this.me.shieldHp <= 0) {
            this.me.streakRewards = this.me.streakRewards.filter((r) => r !== ShellStreaks.HardBoiled);
            this.emit('selfShieldLost');
        } else this.emit('selfShieldHit', this.me.shieldHp);
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

        if (action === GameActions.pause) {
            this.emit('gameForcePause');
            setTimeout(() => this.me.playing = false, 3000);
        }

        if (action === GameActions.reset) {
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
        }, 1000);
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

    updateGameOptions() {
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

        out.send(this.game.socket);
    }

    #processGameRequestOptionsPacket() {
        this.updateGameOptions();
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

        if (itemType === ItemTypes.Grenade) this.emit('grenadeExploded', item, { x, y, z }, damage, radius);
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

        const challenge = this.account.challenges.find(c => c.id === challengeId);
        this.emit('challengeComplete', player, challenge);

        if (player.id === this.me.id) this.refreshChallenges();
    }

    #processSocketReadyPacket() {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.joinGame);

        out.packString(this.state.name);
        out.packString(this.game.raw.uuid);

        out.packInt8(0); // hidebadge
        out.packInt8(this.state.weaponIdx || this.account?.loadout?.classIdx || 0);

        out.packInt32(this.account.session);
        out.packString(this.account.firebaseId);
        out.packString(this.account.sessionId);

        out.send(this.game.socket);
    }

    async #processGameJoinedPacket() {
        this.me.id = CommIn.unPackInt8U();
        this.me.team = CommIn.unPackInt8U();
        this.game.gameModeId = CommIn.unPackInt8U(); // aka gameType
        this.game.gameMode = GameModesById[this.game.gameModeId];
        this.game.mapIdx = CommIn.unPackInt8U();
        this.game.map = Maps[this.game.mapIdx];

        if (this.intents.includes(this.Intents.KOTC_ZONES) || this.intents.includes(this.Intents.PATHFINDING)) {
            this.game.map.raw = await fetchMap(this.game.map.filename, this.game.map.hash);

            if (this.game.gameModeId === GameModes.kotc) {
                const meshData = this.game.map.raw.data['DYNAMIC.capture-zone.none'];
                if (meshData) this.game.map.zones = initKotcZones(meshData);
                else delete this.game.map.zones;
            }

            if (this.intents.includes(this.Intents.PATHFINDING))
                this.pathing.nodeList = new NodeList(this.game.map.raw);
        }

        this.game.playerLimit = CommIn.unPackInt8U();
        this.game.isGameOwner = CommIn.unPackInt8U() === 1;
        this.game.isPrivate = CommIn.unPackInt8U() === 1;

        CommIn.unPackInt8U(); // abTestBucket, unused

        this.state.inGame = true;
        this.lastDeathTime = Date.now();

        const out = CommOut.getBuffer();
        out.packInt8(CommCode.clientReady);
        out.send(this.game.socket);

        this.updateIntervalId = setInterval(() => this.update(), 100 / 3);

        if (this.intents.includes(this.Intents.PING)) {
            this.lastPingTime = Date.now();

            const out2 = CommOut.getBuffer();
            out2.packInt8(CommCode.ping);
            out2.send(this.game.socket);
        }

        this.emit('gameReady');
    }

    processPacket(packet) {
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

                case CommCode.socketReady:
                    this.#processSocketReadyPacket();
                    break;

                case CommCode.gameJoined:
                    this.#processGameJoinedPacket();
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
                case CommCode.expireUpgrade:
                case CommCode.clientReady:
                    break;

                case CommCode.musicInfo:
                    CommIn.unPackLongString();
                    break;

                default:
                    console.error(`processPacket: I got but couldn't identify a: ${Object.keys(CommCode).find(k => CommCode[k] === cmd)} ${cmd}`);
                    if (lastCommand) console.error(`processPacket: It may be a result of the ${lastCommand} command (${lastCode}).`);
                    abort = true
                    break;
            }

            lastCommand = Object.keys(CommCode).find(k => CommCode[k] === cmd);
            lastCode = cmd;

            if (this.intents.includes(this.Intents.LOG_PACKETS))
                console.log(`[LOG_PACKETS] Packet ${lastCommand}: ${lastCode}`);
        }
    }

    async checkChiknWinner() {
        const response = await this.api.queryServices({
            cmd: 'chicknWinnerReady',
            id: this.account.id,
            sessionId: this.account.sessionId
        });

        if (typeof response === 'string') return response;

        this.account.cw.limit = response.limit;
        this.account.cw.atLimit = response.limit >= 4;

        // if there is a "span", that means that it's under the daily limit and you can play again soon
        // if there is a "period", that means that the account is done for the day and must wait a long time
        this.account.cw.secondsUntilPlay = (this.account.cw.atLimit ? response.period : response.span) || 0;
        this.account.cw.canPlayAgain = Date.now() + (this.account.cw.secondsUntilPlay * 1000);

        return this.account.cw;
    }

    async playChiknWinner(doPrematureCooldownCheck = true) {
        if (this.account.cw.atLimit || this.account.cw.limit > ChiknWinnerDailyLimit) return 'hit_daily_limit';
        if ((this.account.cw.canPlayAgain > Date.now()) && doPrematureCooldownCheck) return 'on_cooldown';

        const response = await this.api.queryServices({
            cmd: 'incentivizedVideoReward',
            firebaseId: this.account.firebaseId,
            id: this.account.id,
            sessionId: this.account.sessionId,
            token: null
        });

        if (typeof response === 'string') return response;

        if (response.error) {
            if (response.error === 'RATELIMITED' || response.error === 'RATELMITED') {
                await this.checkChiknWinner();
                return 'on_cooldown';
            } else if (response.error === 'SESSION_EXPIRED') {
                return 'session_expired';
            } else {
                console.error('Unknown Chikn Winner response, report this on Github:', response);
                return 'unknown_error';
            }
        }

        if (response.reward) {
            this.account.eggBalance += response.reward.eggsGiven;
            response.reward.itemIds.forEach((id) => this.account.ownedItemIds.push(id));

            await this.checkChiknWinner();

            return response.reward;
        }

        console.error('Unknown Chikn Winner response, report this on Github:', response);
        return 'unknown_error';
    }

    async resetChiknWinner() {
        if (this.account.eggBalance < 200) return 'not_enough_eggs';
        if (!this.account.cw.atLimit) return 'not_at_limit';

        const response = await this.api.queryServices({
            cmd: 'chwReset',
            sessionId: this.account.sessionId
        });

        if (typeof response === 'string') return response;

        if (response.result !== 'SUCCESS') {
            console.error('Unknown Chikn Winner reset response, report this on Github:', response);
            return 'unknown_error';
        }

        this.account.eggBalance -= 200;
        await this.checkChiknWinner();

        return this.account.cw;
    }

    canSee(target) {
        if (!this.intents.includes(this.Intents.PATHFINDING)) return this.processError('You must have the PATHFINDING intent to use this method.');
        return this.pathing.nodeList.hasLineOfSight(this.me.position, target.position);
    }

    getBestTarget(customFilter = () => true) {
        const options = Object.values(this.players)
            .filter((player) => player?.playing)
            .filter((player) => player.hp > 0)
            .filter((player) => player.id !== this.me.id)
            .filter((player) => this.me.team === 0 || player.team !== this.me.team)
            .filter((player) => !!customFilter(player));

        const distancePlayers = options.map(player => ({
            player,
            distance: Math.sqrt(
                Math.pow(player.position.x - this.me.position.x, 2) +
                Math.pow(player.position.y - this.me.position.y, 2) +
                Math.pow(player.position.z - this.me.position.z, 2)
            )
        })).sort((a, b) => a.distance - b.distance);

        if (!distancePlayers.length) {
            if (this.intents.includes(this.Intents.DEBUG_BEST_TARGET)) console.log('no targets found');
            return null;
        }

        const closestLoSPlayer = distancePlayers.find(player => this.canSee(player.player));

        if (this.intents.includes(this.Intents.DEBUG_BEST_TARGET)) {
            console.log('detected ', distancePlayers.length, 'targets');
            console.log('closest target: ', distancePlayers[0].player.name);
            console.log('all targets (ordered): ', distancePlayers.map(a => a.player.name));
            console.log('found LoS player?', !!closestLoSPlayer);
            if (closestLoSPlayer) console.log('closest LoS player: ', closestLoSPlayer.player.name);
        }

        if (closestLoSPlayer) return { player: closestLoSPlayer.player, inLoS: true };

        return { player: distancePlayers[0].player, inLoS: false };
    }

    async refreshChallenges() {
        const result = await this.api.queryServices({
            cmd: 'challengeGetDaily',
            sessionId: this.account.sessionId,
            playerId: this.account.id
        });

        this.#importChallenges(result);

        return this.account.challenges;
    }

    async rerollChallenge(challengeId) {
        const result = await this.api.queryServices({
            cmd: 'challengeRerollSlot',
            sessionId: this.account.sessionId,
            slotId: challengeId
        });

        this.#importChallenges(result);

        return this.account.challenges;
    }

    async claimChallenge(challengeId) {
        const result = await this.api.queryServices({
            cmd: 'challengeClaimReward',
            sessionId: this.account.sessionId,
            slotId: challengeId
        });

        this.#importChallenges(result.challenges);

        if (result.reward > 0) this.account.eggBalance += result.reward;

        return {
            eggReward: result.reward,
            updatedChallenges: this.account.challenges
        }
    }

    async refreshBalance() {
        const result = await this.api.queryServices({
            cmd: 'checkBalance',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId
        });

        this.account.eggBalance = result.currentBalance;

        return result.currentBalance;
    }

    async redeemCode(code) {
        const result = await this.api.queryServices({
            cmd: 'redeem',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            id: this.account.id,
            code
        });

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
        const result = await this.api.queryServices({
            cmd: 'urlRewardParams',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            reward
        });

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
        }

        return result;
    }

    async claimSocialReward(rewardTag) {
        const result = await this.api.queryServices({
            cmd: 'reward',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            rewardTag
        });

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
        }

        return result;
    }

    async buyItem(itemId) {
        const result = await this.api.queryServices({
            cmd: 'buy',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            itemId,
            save: true
        });

        if (result.result === 'SUCCESS') {
            this.account.eggBalance = result.currentBalance;
            this.account.ownedItemIds.push(result.itemId);
        }

        return result;
    }

    processError(error) {
        if (this.#hooks.error && this.#hooks.error.length) this.emit('error', error);
        // eslint-disable-next-line custom/no-throw
        else throw error;
    }

    leave(code = CloseCode.mainMenu) {
        if (this.hasQuit) return;

        if (code > -1) {
            this.game?.socket?.close(code);
            this.state.left = true;
            this.emit('leave', code);
        }

        clearInterval(this.updateIntervalId);

        this.#dispatches = [];

        this.state.reloading = false;
        this.state.swappingGun = false;
        this.state.usingMelee = false;

        this.state.stateIdx = 0;
        this.state.serverStateIdx = 0;
        this.state.shotsFired = 0;
        this.state.buffer = [];

        this.players = {}
        this.me = new GamePlayer({})

        this.game = this.#initialGame;

        this.ping = 0;
        this.lastPingTime = -1;

        this.lastDeathTime = -1;
        this.lastChatTime = -1;

        this.lastUpdateTick = 0;

        this.pathing = {
            nodeList: null,
            followingPath: false,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }
    }

    logout() {
        this.account = this.#initialAccount;
    }

    quit(noCleanup = false) {
        if (this.hasQuit) return;

        this.leave();

        if (this.matchmaker) {
            this.matchmaker.close();
            if (!noCleanup) this.matchmaker = null;
        }

        if (!noCleanup) {
            delete this.account;
            delete this.api;
            delete this.game;
            delete this.me;
            delete this.players;
            delete this.state;
        }

        this.hasQuit = true;
    }
}

export default Bot;