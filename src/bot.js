import API from './api.js';

import CommIn from './comm/CommIn.js';
import CommOut from './comm/CommOut.js';
import CloseCode from './constants/CloseCode.js';
import CommCode from './constants/CommCode.js';

import GamePlayer from './bot/GamePlayer.js';
import yolkws from './socket.js';

import {
    ChiknWinnerDailyLimit,
    CoopState,
    findItemById,
    FramesBetweenSyncs,
    GameMode,
    Movement,
    PlayType,
    ShellStreak,
    StateBufferSize
} from './constants/index.js';

import LookAtPosDispatch from './dispatches/LookAtPosDispatch.js';
import MovementDispatch from './dispatches/MovementDispatch.js';

import { DispatchIndex } from './dispatches/index.js';

import { coords, validate } from './wasm/direct.js';
import { createError } from './util.js';

import { Challenges } from './constants/challenges.js';
import { Maps } from './constants/maps.js';
import { Regions } from './constants/regions.js';

import {
    BuyItemError,
    ChallengeClaimError,
    ChallengeRerollError,
    ChicknWinnerError,
    ClaimSocialError,
    ClaimURLError,
    GameFindError,
    GameJoinError,
    Intents,
    LoginError,
    MatchmakerError,
    RedeemCodeError
} from './enums.js';

import processAddPlayerPacket from './packets/addPlayer.js';
import processBeginShellStreakPacket from './packets/beginShellStreak.js';
import processChallengeCompletedPacket from './packets/challengeCompleted.js';
import processChangeCharacterPacket from './packets/changeCharacter.js';
import processChatPacket from './packets/chat.js';
import processCollectItemPacket from './packets/collectItem.js';
import processDiePacket from './packets/die.js';
import processEndShellStreakPacket from './packets/endShellStreak.js';
import processEventModifierPacket from './packets/eventModifier.js';
import processExplodePacket from './packets/explode.js';
import processFirePacket from './packets/fire.js';
import processGameActionPacket from './packets/gameAction.js';
import processGameJoinedPacket from './packets/gameJoined.js';
import processGameOptionsPacket from './packets/gameOptions.js';
import processHitMeHardBoiledPacket from './packets/hitMeHardBoiled.js';
import processHitMePacket from './packets/hitMe.js';
import processHitThemPacket from './packets/hitThem.js';
import processMeleePacket from './packets/melee.js';
import processMetaGameStatePacket from './packets/metaGameState.js';
import processPausePacket from './packets/pause.js';
import processPingPacket from './packets/ping.js';
import processPlayerInfoPacket from './packets/playerInfo.js';
import processReloadPacket from './packets/reload.js';
import processRemovePlayerPacket from './packets/removePlayer.js';
import processRespawnPacket from './packets/respawn.js';
import processSocketReadyPacket from './packets/socketReady.js';
import processSpawnItemPacket from './packets/spawnItem.js';
import processSwitchTeamPacket from './packets/switchTeam.js';
import processSyncMePacket from './packets/syncMe.js';
import processSyncThemPacket from './packets/syncThem.js';
import processThrowGrenadePacket from './packets/throwGrenade.js';
import processUpdateBalancePacket from './packets/updateBalance.js';
import processSwapWeaponPacket from './packets/swapWeapon.js';

const mod = (n, m) => ((n % m) + m) % m;

export class Bot {
    static Intents = Intents;

    regionList = [];
    matchmakerListeners = [];

    #dispatches = [];

    #hooks = {};
    #globalHooks = [];

    #initialAccount;
    #initialGame;

    constructor(params = {}) {
        if (params.proxy && typeof process === 'undefined') throw new Error('proxies do not work in this environment');

        this.intents = params.intents || [];

        if (this.intents.includes(Intents.COSMETIC_DATA)) {
            const ballCap = findItemById(1001);
            if (!ballCap) throw new Error('you cannot use the COSMETIC_DATA intent inside of the browser bundles');
        }

        this.instance = params.instance || 'shellshock.io';
        this.protocol = params.protocol || 'wss';
        this.proxy = params.proxy || '';

        this.connectionTimeout = params.connectionTimeout || 5000;

        this.state = {
            // kept for specifying various params
            name: 'yolkbot',
            weaponIdx: 0,

            // wow!
            inGame: false,
            chatLines: 0,

            // movement
            yaw: 0,
            pitch: 0,
            controlKeys: 0,
            onGround: 4,
            dx: 0,
            dy: 0,
            dz: 0,

            // tracking for dispatch checks
            reloading: false,
            swappingGun: false,
            usingMelee: false,

            // syncMe related vars
            stateIdx: 0,
            serverStateIdx: 0,
            shotsFired: 0,
            buffer: []
        }

        this.players = {};
        this.me = new GamePlayer({});

        this.game = {
            raw: {}, // raw response
            code: '',
            region: '',
            socket: null,

            // data given on sign in
            gameModeId: 0, // assume ffa
            gameMode: 'ffa', // assume ffa
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

            kotc: {
                // data from kotc
                stage: CoopState.Capturing, // this is shell default
                zoneNumber: 0,
                activeZone: [],
                capturing: 0,
                captureProgress: 0,
                numCapturing: 0,
                capturePercent: 0.0
            }
        }

        this.#initialGame = this.game;

        this.account = {
            // used for auth
            id: 0,

            firebase: {
                idToken: '',
                refreshToken: '',
                expiresIn: '3600',
                localId: ''
            },

            firebaseId: '',
            sessionId: '',
            session: 0,

            email: '',
            password: '',

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
                primaryId: [3100, 3600, 3400, 3800, 4000, 4200, 4500],
                secondaryId: new Array(7).fill(3000),
                stampPositionX: 0,
                stampPositionY: 0
            },
            ownedItemIds: [],
            vip: false,

            // used for chat checking
            emailVerified: false,
            isAged: false,

            adminRoles: 0,

            rawLoginData: {},

            eggBalance: 0,
            isDoubleEggWeeknd: () => {
                const day = new Date().getUTCDay();
                return (day >= 5 && new Date().getUTCHours() >= 20) || day === 6 || day === 0;
            }
        }

        this.#initialAccount = this.account;

        this.api = new API({
            proxy: this.proxy,
            protocol: this.protocol,
            instance: this.instance,
            connectionTimeout: this.connectionTimeout
        });

        this.ping = 0;

        this.lastPingTime = -1;
        this.lastDeathTime = -1;
        this.lastUpdateTick = 0;

        this.pathing = {
            nodeList: null,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }

        this.hasQuit = false;

        if (this.intents.includes(Intents.NO_AFK_KICK)) this.afkKickInterval = 0;
        if (this.intents.includes(Intents.RENEW_SESSION)) this.renewSessionInterval = 0;
    }

    dispatch(dispatch, isEmit) {
        if (dispatch.validate(this)) {
            if (dispatch.check(this)) dispatch.execute(this);
            else this.#dispatches.push(dispatch);
            return true;
        }

        console.error(`${isEmit ? 'emit' : 'dispatch'}: validation failed for dispatch ${dispatch.constructor.name}`);
        console.error('this means the dispatch will NEVER RUN!');
        console.error('make sure all parameters are valid and that any player IDs are in the game');

        return false;
    }

    async createAccount(email, pass) {
        this.account = this.#initialAccount;

        this.account.email = email;
        this.account.password = pass;

        const loginData = await this.api.createAccount(email, pass);
        return this.processLoginData(loginData);
    }

    async login(email, pass) {
        this.account = this.#initialAccount;

        this.account.email = email;
        this.account.password = pass;

        const loginData = await this.api.loginWithCredentials(email, pass);
        return this.processLoginData(loginData);
    }

    async loginWithRefreshToken(refreshToken) {
        this.account = this.#initialAccount;
        const loginData = await this.api.loginWithRefreshToken(refreshToken);
        return this.processLoginData(loginData);
    }

    async loginAnonymously() {
        this.account = this.#initialAccount;
        const loginData = await this.api.loginAnonymously();
        return this.processLoginData(loginData);
    }

    processLoginData(loginData) {
        if (!loginData.ok || !loginData.playerOutput) {
            this.$emit('authFail', loginData);

            if (loginData.ok && !loginData.playerOutput)
                console.error('processLoginData: missing playerOutput but is ok', loginData);

            return { ...loginData, error: LoginError.InternalError, ok: false };
        }

        if (loginData.banRemaining) {
            this.$emit('banned', loginData.banRemaining);
            return createError(LoginError.AccountBanned);
        }

        this.account.firebase = loginData.firebase;

        loginData = loginData.playerOutput;

        this.account.rawLoginData = loginData;

        this.account.adminRoles = loginData.adminRoles || 0;
        this.account.eggBalance = loginData.currentBalance;
        this.account.emailVerified = loginData.emailVerified;
        this.account.firebaseId = loginData.firebaseId;
        this.account.id = loginData.id;
        this.account.isAged = new Date(loginData.dateCreated).getTime() < 17145468e5;
        this.account.loadout = loginData.loadout;
        this.account.ownedItemIds = loginData.ownedItemIds;
        this.account.session = loginData.session;
        this.account.sessionId = loginData.sessionId;
        this.account.vip = loginData.active_sub === 'IsVIP';

        if (this.intents.includes(Intents.BOT_STATS)) this.account.stats = {
            lifetime: loginData.statsLifetime,
            monthly: loginData.statsCurrent
        };

        if (this.intents.includes(Intents.CHALLENGES)) this.#importChallenges(loginData.challenges);

        this.$emit('authSuccess', this.account);

        if (this.intents.includes(Intents.RENEW_SESSION)) {
            this.renewSessionInterval = setInterval(async () => {
                if (!this.account?.sessionId) return clearInterval(this.renewSessionInterval);

                const res = await this.api.queryServices({ cmd: 'renewSession', sessionId: this.account.sessionId });
                if (res.data !== 'renewed') this.$emit('sessionExpired');
            }, 600000); // 10 minutes
        }

        return { ok: true, account: this.account };
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

    async createMatchmaker() {
        const matchmaker = new yolkws(`${this.protocol}://${this.instance}/matchmaker/`, this.proxy);
        matchmaker.autoReconnect = true;

        const didConnect = await matchmaker.tryConnect();
        if (!didConnect) return createError(MatchmakerError.WebSocketConnectFail);

        this.matchmaker = matchmaker;

        let uuidTimeouts = [];

        this.matchmaker.onmessage = async (e) => {
            const data = JSON.parse(e.data);

            if (data.command === 'validateUUID') {
                const timeout = setTimeout(() => {
                    console.error('createMatchmaker: the matchmaker did not respond to our validateUUID')
                    console.error('createMatchmaker: this means yolkbot is broken, please report this on Github');
                    console.error('createMatchmaker: https://github.com/yolkorg/yolkbot (or join the Discord)');
                }, 5000);

                uuidTimeouts.push(timeout);

                return this.matchmaker.send(JSON.stringify({ command: 'validateUUID', hash: await validate(data.uuid) }));
            }

            if (data.command === 'gameFound' || data.error) uuidTimeouts.forEach((t) => clearTimeout(t));

            this.matchmakerListeners.forEach((listener) => listener(data));
        }

        return { ok: true };
    }

    async getRegions() {
        if (!this.matchmaker) {
            const mmConnection = await this.createMatchmaker();
            if (!mmConnection.ok) return mmConnection;
        }

        return new Promise((res) => {
            const listener = (data) => {
                if (data.command === 'regionList') {
                    this.matchmakerListeners.splice(this.matchmakerListeners.indexOf(listener), 1);
                    this.regionList = data.regionList;

                    res({ ok: true, regionList: this.regionList });
                }
            };

            this.matchmakerListeners.push(listener);
            this.matchmaker.send(JSON.stringify({ command: 'regionList' }));
        });
    }

    async initSession() {
        if (!this.account.sessionId && !this.intents.includes(Intents.SKIP_LOGIN)) {
            const anonLogin = await this.loginAnonymously();
            if (!anonLogin.ok) return anonLogin;
        }

        if (!this.matchmaker) {
            const mmConnection = await this.createMatchmaker();
            if (!mmConnection.ok) return mmConnection;
        }

        return { ok: true };
    }

    async findPublicGame(region, mode) {
        if (typeof region !== 'string') return createError(GameFindError.MissingParams);
        if (typeof mode !== 'number') return createError(GameFindError.MissingParams);

        const regions = this.regionList.length ? this.regionList : Regions;
        if (!regions.find(r => r.id === region)) return createError(GameFindError.InvalidRegion);

        let computedModeId;

        if (typeof mode === 'number') {
            if (Object.values(GameMode).indexOf(mode) > -1) computedModeId = mode;
            else return createError(GameFindError.InvalidMode);
        } else if (typeof mode === 'string') {
            const modeEntry = Object.keys(GameMode).find((key) => key.toLowerCase() === mode.toLowerCase());
            if (modeEntry) computedModeId = GameMode[modeEntry];
            else return createError(GameFindError.InvalidMode);
        } else return createError(GameFindError.InvalidMode);

        const initInfo = await this.initSession();
        if (!initInfo.ok) return initInfo;

        const game = await new Promise((resolve) => {
            const listener = (msg) => {
                if (msg.command === 'notice') return;

                this.matchmakerListeners.splice(this.matchmakerListeners.indexOf(listener), 1);

                if (msg.command === 'gameFound') return resolve(msg);
                if (msg.error === 'sessionNotFound') return resolve(createError(GameFindError.SessionExpired));

                console.error('findPublicGame: unknown matchmaker response', JSON.stringify(msg));
                resolve(createError(GameFindError.InternalError));
            };

            this.matchmakerListeners.push(listener);

            this.matchmaker.send(JSON.stringify({
                command: 'findGame',
                region,
                playType: PlayType.JoinPublic,
                gameType: computedModeId,
                sessionId: this.account.sessionId
            }));
        });

        return { ok: true, region: game.region, subdomain: game.subdomain, id: game.id, private: game.private, raw: game };
    }

    async createPrivateGame(region, mode, map) {
        if (typeof region !== 'string') return createError(GameFindError.MissingParams);

        const regions = this.regionList.length ? this.regionList : Regions;
        if (!regions.find(r => r.id === region)) return createError(GameFindError.InvalidRegion);

        let computedModeId;

        if (typeof mode === 'number') {
            if (Object.values(GameMode).indexOf(mode) > -1) computedModeId = mode;
            else return createError(GameFindError.InvalidMode);
        } else if (typeof mode === 'string') {
            const modeEntry = Object.keys(GameMode).find((key) => key.toLowerCase() === mode.toLowerCase());
            if (modeEntry) computedModeId = GameMode[modeEntry];
            else return createError(GameFindError.InvalidMode);
        } else return createError(GameFindError.InvalidMode);

        const mapIdx = Maps.findIndex(m => m.name.toLowerCase() === map.toLowerCase());
        if (mapIdx === -1) return createError(GameFindError.InvalidMap);

        const initInfo = await this.initSession();
        if (!initInfo.ok) return initInfo;

        const game = await new Promise((resolve) => {
            const listener = (msg) => {
                if (msg.command === 'notice') return;

                this.matchmakerListeners.splice(this.matchmakerListeners.indexOf(listener), 1);

                if (msg.command === 'gameFound') return resolve(msg);
                if (msg.error === 'sessionNotFound') return resolve(createError(GameFindError.SessionExpired));

                console.error('createPrivateGame: unknown matchmaker response', JSON.stringify(msg));
                resolve(createError(GameFindError.InternalError));
            };

            this.matchmakerListeners.push(listener);

            this.matchmaker.send(JSON.stringify({
                command: 'findGame',
                region,
                playType: PlayType.CreatePrivate,
                gameType: computedModeId,
                sessionId: this.account.sessionId,
                noobLobby: false,
                map: mapIdx
            }));
        });

        return { ok: true, region: game.region, subdomain: game.subdomain, id: game.id, private: game.private, raw: game };
    }

    async join(name, data) {
        this.state.name = name || 'yolkbot';

        if (typeof data === 'string') {
            if (data.includes('#')) data = data.split('#')[1];

            const initInfo = await this.initSession();
            if (!initInfo.ok) return initInfo;

            const joinResult = await new Promise((resolve) => {
                const listener = (message) => {
                    if (message.command === 'gameFound') {
                        this.matchmakerListeners.splice(this.matchmakerListeners.indexOf(listener), 1);

                        this.game.raw = message;
                        this.game.code = message.id;
                        this.game.region = message.region;

                        resolve(message.id);
                    }

                    if (message.error && message.error === 'gameNotFound') {
                        this.matchmakerListeners.splice(this.matchmakerListeners.indexOf(listener), 1);
                        resolve('gameNotFound');
                    }
                };

                this.matchmakerListeners.push(listener);

                this.matchmaker.send(JSON.stringify({
                    command: 'joinGame',
                    id: data,
                    observe: false,
                    sessionId: this.account.sessionId
                }));
            });

            if (joinResult === 'gameNotFound') return createError(GameJoinError.GameNotFound);

            if (!this.game.raw.id) {
                console.error('join: invalid game data received from matchmaker:', this.game.raw);
                return createError(GameJoinError.InternalError);
            }
        } else if (typeof data === 'object') {
            if (!data.id || !data.subdomain || !data.uuid || !data.region) return createError(GameJoinError.InvalidObject);

            if (this.account.id === 0) {
                const anonAttempt = await this.loginAnonymously();
                if (!anonAttempt.ok) return anonAttempt;
            }

            this.game.raw = data;
            this.game.code = this.game.raw.id;
            this.game.region = this.game.raw.region;
        } else return createError(GameJoinError.MissingParams);

        const host = this.game.raw.host || (this.instance.startsWith('localhost:') ? this.instance : `${this.game.raw.subdomain}.${this.instance}`);
        this.game.socket = new yolkws(`${this.protocol}://${host}/game/${this.game.raw.id}`, this.proxy);
        this.game.socket.binaryType = 'arraybuffer';
        this.game.socket.connectionTimeout = this.connectionTimeout;

        this.game.socket.onBeforeConnect = () => {
            this.game.socket.onmessage = (msg) => this.processPacket(msg.data);

            this.game.socket.onclose = (e) => {
                if (this.state?.inGame) {
                    this.$emit('close', e.code);
                    this.leave(-1);
                }
            }
        }

        const didConnect = await this.game.socket.tryConnect();
        if (!didConnect) return createError(GameJoinError.WebSocketConnectFail);

        return { ok: true };
    }

    #processMovement(ndx, ndy, ndz) {
        this.state.onGround = Math.max(--this.state.onGround, 0);

        this.me.position.x += ndx;
        this.me.position.y += ndy;
        this.me.position.z += ndz;

        const thisBlockX = Math.floor(this.me.position.x);
        const thisBlockY = Math.floor(this.me.position.y);
        const thisBlockZ = Math.floor(this.me.position.z);

        const blockInMyHitbox = this.pathing.nodeList.at(thisBlockX, thisBlockY, thisBlockZ);
        if (blockInMyHitbox && !blockInMyHitbox.isAir()) {
            if (!this.climbing && blockInMyHitbox.isLadder()) {
                // todo: handle ladders
            }
        }

        if (this.me.climbing) {
            /* todo: handle ladders
            var cx = this.climbX;
            var cz = this.climbZ;
            this.climbing = false;
            this.capturing = false;
            cell = getMapCellAt(cx, Math.floor(this.me.position.y + 0.25), cz);
            if (cell && Math.floor(cell.ry / Math.PI90) == this.climbRY && cell.mesh && cell.mesh.colliderType == "ladder") {
                this.climbing = true;
            }
            */
        } else if (blockInMyHitbox && blockInMyHitbox.isJumpPad()) {
            this.me.position.y += 0.26;
            this.me.jumping = true;
            this.state.onGround = 0;
        }
    }

    #processPathfinding() {
        const pathLen = this.pathing.activePath.length;
        const lastNode = this.pathing.activePath[pathLen - 1];
        const myPos = this.me.position;
        const myFloorY = Math.floor(myPos.y);

        const lastNodeCenter = lastNode.flatCenter();
        const distToEndCenter = Math.hypot(myPos.x - lastNodeCenter.x, myPos.z - lastNodeCenter.z);

        if (distToEndCenter < 0.3) {
            this.pathing.activePath = null;
            this.pathing.activeNode = null;
            this.pathing.activeNodeIdx = 0;

            this.dispatch(new MovementDispatch(0));
            this.$emit('pathfindComplete');
        } else {
            let shouldJump = false;

            if (this.pathing.activeNodeIdx < pathLen - 1) {
                const currentNode = this.pathing.activePath[this.pathing.activeNodeIdx];
                const nextNode = this.pathing.activePath[this.pathing.activeNodeIdx + 1];

                const dx = Math.abs(currentNode.x - nextNode.x);
                const dz = Math.abs(currentNode.z - nextNode.z);

                const isParkourJump =
                    (dx === 2 && dz === 0) || // 2 block
                    (dx === 0 && dz === 2) || // 2 block
                    (dx === 2 && dz === 1) || // L
                    (dx === 1 && dz === 2) || // L
                    (dx === 2 && dz === 2); // diagonal 2 block

                if (isParkourJump) {
                    const localX = myPos.x - Math.floor(myPos.x);
                    const localZ = myPos.z - Math.floor(myPos.z);

                    const headingX = nextNode.x > currentNode.x ? 1 : (nextNode.x < currentNode.x ? -1 : 0);
                    const headingZ = nextNode.z > currentNode.z ? 1 : (nextNode.z < currentNode.z ? -1 : 0);

                    let distToEdge = 0;
                    if (headingX > 0) distToEdge = 1 - localX;
                    else if (headingX < 0) distToEdge = localX;
                    else if (headingZ > 0) distToEdge = 1 - localZ;
                    else if (headingZ < 0) distToEdge = localZ;

                    if (distToEdge <= 0.04) shouldJump = true;
                }
            }

            let positionTarget;
            if (this.pathing.activeNodeIdx < pathLen) {
                positionTarget = this.pathing.activePath[this.pathing.activeNodeIdx].flatCenter();
                if (this.state.onGround) this.dispatch(new LookAtPosDispatch(positionTarget));
            }

            for (let i = this.pathing.activeNodeIdx; i < pathLen; i++) {
                const node = this.pathing.activePath[i];
                if (node.flatRadialDistance(myPos) < 0.1 && node.y === myFloorY) {
                    this.pathing.activeNodeIdx = i + 1;
                    this.pathing.activeNode = this.pathing.activePath[this.pathing.activeNodeIdx];
                    break;
                }
            }

            const movementKeys = Movement.Forward | (shouldJump ? Movement.Jump : 0);
            this.dispatch(new MovementDispatch(movementKeys));
        }
    }

    update() {
        if (this.hasQuit) return;

        if (this.pathing.activePath && this.intents.includes(Intents.PATHFINDING)) this.#processPathfinding();

        for (let i = 0; i < this.#dispatches.length; i++) {
            const disp = this.#dispatches[i];
            if (disp.check(this)) {
                disp.execute(this);
                this.#dispatches.splice(i, 1);
            }
        }

        this.state.chatLines = Math.max(0, this.state.chatLines - 1 / (30 * 4));

        if (this.me.playing) {
            const currentIdx = this.state.stateIdx;
            const isBufferDebug = this.intents.includes(Intents.DEBUG_BUFFER);

            if (isBufferDebug) console.log('setting buffer for idx', currentIdx);

            this.me.jumping = !!(this.state.controlKeys & Movement.Jump);

            this.state.buffer[currentIdx] = {
                controlKeys: this.state.controlKeys,
                yaw: this.state.yaw,
                pitch: this.state.pitch,
                shotsFired: this.state.shotsFired,
                position: isBufferDebug ? { ...this.me.position } : {}
            }

            this.state.shotsFired = 0;

            if (this.intents.includes(Intents.SIMULATION)) {
                var dx = 0;
                var dy = 0;
                var dz = 0;

                var state = this.state.buffer[currentIdx];

                if (state.controlKeys & Movement.Left) {
                    dx -= Math.cos(state.yaw);
                    dz += Math.sin(state.yaw);
                }

                if (state.controlKeys & Movement.Right) {
                    dx += Math.cos(state.yaw);
                    dz -= Math.sin(state.yaw);
                }

                if (state.controlKeys & Movement.Forward) {
                    if (this.me.climbing) dy += 1;
                    else {
                        dx -= Math.sin(state.yaw);
                        dz -= Math.cos(state.yaw);
                    }
                }

                if (state.controlKeys & Movement.Backward) {
                    if (this.me.climbing) dy -= 1;
                    else {
                        dx += Math.sin(state.yaw);
                        dz += Math.cos(state.yaw);
                    }
                }

                if (state.controlKeys & Movement.Jump) this.state.controlKeys ^= this.state.controlKeys & Movement.Jump;

                if (this.me.climbing) {
                    this.me.jumping = false;

                    dy += dy * 0.028;
                    this.me.position.y += dy;
                    dy *= 0.5;

                    this.#processMovement(0, dy, 0);
                } else {
                    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (mag > 0) {
                        const normDx = dx / mag;
                        const normDz = dz / mag;

                        dx = this.state.dx + normDx * 0.025;
                        dz = this.state.dz + normDz * 0.025;
                    } else {
                        dx = this.state.dx;
                        dz = this.state.dz;
                    }

                    dy = this.state.dy - (this.game.options.gravity * 0.012);
                    dy = Math.max(-0.29, dy);

                    var oldX = this.me.position.x;
                    var oldY = this.me.position.y;
                    var oldZ = this.me.position.z;

                    this.#processMovement(dx, dy, dz);

                    dx = this.me.position.x - oldX;
                    dy = this.me.position.y - oldY;
                    dz = this.me.position.z - oldZ;

                    if (this.state.onGround && dy > 0) {
                        const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        const normY = mag === 0 ? 0 : dy / mag;
                        var n = 1 - normY * 0.5;
                        dx *= n;
                        dz *= n;
                    }
                }

                dx *= 0.64;
                dz *= 0.64;
                if (this.me.climbing) dy *= 0.64;

                this.state.dx = dx;
                this.state.dy = dy;
                this.state.dz = dz;
            }

            if ((this.state.stateIdx % FramesBetweenSyncs) === 0) {
                this.$emit('tick');

                const out = new CommOut();

                out.packInt8(CommCode.syncMe);
                out.packInt8(this.state.stateIdx);
                out.packInt8(this.state.serverStateIdx);

                const startIdx = mod(this.state.stateIdx - FramesBetweenSyncs + 1, StateBufferSize);

                if (isBufferDebug) console.log('--- START THIS SYNC LOGGING ---');

                for (let i = 0; i < FramesBetweenSyncs; i++) {
                    const idx = mod(startIdx + i, StateBufferSize);
                    const frame = this.state.buffer[idx] || {};
                    const keys = frame.controlKeys || 0;
                    const shots = frame.shotsFired || 0;
                    const yaw = frame.yaw ?? this.state.yaw;
                    const pitch = frame.pitch ?? this.state.pitch;

                    if (isBufferDebug) console.log('adding', this.state.stateIdx, startIdx, idx, frame);

                    out.packInt8(keys);
                    out.packInt8(shots);
                    out.packString(coords(yaw, pitch));
                    out.packInt8(100);
                }

                out.send(this.game.socket);

                if (isBufferDebug) console.log('--- END SYNC LOGGING ---');

                this.state.buffer = [];

                this.lastUpdateTick = 0;
            } else this.lastUpdateTick++;

            this.state.stateIdx = mod(this.state.stateIdx + 1, StateBufferSize);
        }

        if (!this.intents.includes(Intents.PLAYER_HEALTH)) return;

        const regen = 0.1 * (this.game.isPrivate ? this.game.options.healthRegen : 1);
        const players = Object.values(this.players);

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.playing && player.hp > 0) {
                const hasOverHeal = player.streakRewards.includes(ShellStreak.OverHeal);
                player.hp += hasOverHeal ? -regen : regen;
                player.hp = hasOverHeal ? Math.max(100, player.hp) : Math.min(100, player.hp);
            }

            if (player.spawnShield > 0) player.spawnShield -= 6;
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

    $emit(event, ...args) {
        if (this.hasQuit) return;

        if (this.#hooks[event]) for (const cb of this.#hooks[event]) cb(...args);
        for (const cb of this.#globalHooks) cb(event, ...args);
    }

    emit(event, ...args) {
        const dispatch = DispatchIndex[event];
        if (dispatch) this.dispatch(new dispatch(...args), true);
        else throw new Error(`no event found for "${event}"`);
    }

    updateGameOptions() {
        const out = new CommOut();
        out.packInt8(CommCode.gameOptions);
        out.packInt8(this.game.options.gravity * 4);
        out.packInt8(this.game.options.damage * 4);
        out.packInt8(this.game.options.healthRegen * 4);

        const flags =
            (this.game.options.locked ? 1 : 0) |
            (this.game.options.noTeamChange ? 2 : 0) |
            (this.game.options.noTeamShuffle ? 4 : 0);

        out.packInt8(flags);

        this.game.options.weaponsDisabled.forEach((v) => out.packInt8(v ? 1 : 0));

        out.send(this.game.socket);
    }

    packetHandlers = {
        [CommCode.syncThem]: processSyncThemPacket.bind(null, this),
        [CommCode.fire]: processFirePacket.bind(null, this),
        [CommCode.hitThem]: processHitThemPacket.bind(null, this),
        [CommCode.syncMe]: processSyncMePacket.bind(null, this),
        [CommCode.hitMe]: processHitMePacket.bind(null, this),
        [CommCode.swapWeapon]: processSwapWeaponPacket.bind(null, this),
        [CommCode.collectItem]: processCollectItemPacket.bind(null, this),
        [CommCode.respawn]: processRespawnPacket.bind(null, this),
        [CommCode.die]: processDiePacket.bind(null, this),
        [CommCode.pause]: processPausePacket.bind(null, this),
        [CommCode.chat]: processChatPacket.bind(null, this),
        [CommCode.addPlayer]: processAddPlayerPacket.bind(null, this),
        [CommCode.removePlayer]: processRemovePlayerPacket.bind(null, this),
        [CommCode.eventModifier]: processEventModifierPacket.bind(null, this),
        [CommCode.metaGameState]: processMetaGameStatePacket.bind(null, this),
        [CommCode.beginShellStreak]: processBeginShellStreakPacket.bind(null, this),
        [CommCode.endShellStreak]: processEndShellStreakPacket.bind(null, this),
        [CommCode.hitMeHardBoiled]: processHitMeHardBoiledPacket.bind(null, this),
        [CommCode.gameOptions]: processGameOptionsPacket.bind(null, this),
        [CommCode.ping]: processPingPacket.bind(null, this),
        [CommCode.switchTeam]: processSwitchTeamPacket.bind(null, this),
        [CommCode.changeCharacter]: processChangeCharacterPacket.bind(null, this),
        [CommCode.reload]: processReloadPacket.bind(null, this),
        [CommCode.explode]: processExplodePacket.bind(null, this),
        [CommCode.throwGrenade]: processThrowGrenadePacket.bind(null, this),
        [CommCode.spawnItem]: processSpawnItemPacket.bind(null, this),
        [CommCode.melee]: processMeleePacket.bind(null, this),
        [CommCode.updateBalance]: processUpdateBalancePacket.bind(null, this),
        [CommCode.challengeCompleted]: processChallengeCompletedPacket.bind(null, this),
        [CommCode.gameAction]: processGameActionPacket.bind(null, this),
        [CommCode.socketReady]: processSocketReadyPacket.bind(null, this),
        [CommCode.gameJoined]: processGameJoinedPacket.bind(null, this),
        [CommCode.playerInfo]: processPlayerInfoPacket.bind(null, this),

        [CommCode.respawnDenied]: () => {
            this.me.playing = false;
            this.$emit('respawnDenied');
        },
        [CommCode.requestGameOptions]: () => {
            this.game.isPrivate = true;
            this.updateGameOptions();
        },

        [CommCode.expireUpgrade]: () => { },
        [CommCode.clientReady]: () => { },
        [CommCode.musicInfo]: () => CommIn.unPackLongString()
    }

    processPacket(packet) {
        CommIn.init(packet);

        if (this.intents.includes(Intents.PACKET_HOOK)) this.$emit('packet', packet);

        let lastCommand = 0;
        let lastCode = 0;

        while (CommIn.isMoreDataAvailable()) {
            const cmd = CommIn.unPackInt8U();
            const handler = this.packetHandlers[cmd];

            if (handler) handler();
            else {
                console.error(`processPacket: got but couldn't identify: ${Object.keys(CommCode).find(k => CommCode[k] === cmd)} ${cmd}`);
                if (lastCommand) console.error(`processPacket: it may be a result of the ${lastCommand} command (${lastCode}).`);
                break;
            }

            lastCommand = Object.keys(CommCode).find(k => CommCode[k] === cmd);
            lastCode = cmd;

            if (this.intents.includes(Intents.LOG_PACKETS)) console.log(`[LOG_PACKETS] packet ${lastCommand}: ${lastCode}`);
        }
    }

    async checkChiknWinner() {
        const response = await this.api.queryServices({
            cmd: 'chicknWinnerReady',
            id: this.account.id,
            sessionId: this.account.sessionId
        });

        if (!response.ok) return response;

        this.account.cw.limit = response.limit;
        this.account.cw.atLimit = response.limit >= 4;

        // if there is a "span", that means that it's under the daily limit and you can play again soon
        // if there is a "period", that means that the account is done for the day and must wait a long time
        this.account.cw.secondsUntilPlay = (this.account.cw.atLimit ? response.period : response.span) || 0;
        this.account.cw.canPlayAgain = Date.now() + (this.account.cw.secondsUntilPlay * 1000);

        return { ok: true, cw: this.account.cw };
    }

    async playChiknWinner(doPrematureCooldownCheck = true) {
        if (this.account.cw.atLimit || this.account.cw.limit > ChiknWinnerDailyLimit) return createError(ChicknWinnerError.HitDailyLimit);
        if ((this.account.cw.canPlayAgain > Date.now()) && doPrematureCooldownCheck) return createError(ChicknWinnerError.OnCooldown);

        const response = await this.api.queryServices({
            cmd: 'incentivizedVideoReward',
            firebaseId: this.account.firebaseId,
            id: this.account.id,
            sessionId: this.account.sessionId,
            token: null
        });

        if (!response.ok) return response;

        if (response.error) {
            if (response.error === 'RATELIMITED' || response.error === 'RATELMITED') {
                await this.checkChiknWinner();
                return createError(ChicknWinnerError.OnCooldown);
            } else if (response.error === 'SESSION_EXPIRED') {
                this.$emit('sessionExpired');
                return createError(ChicknWinnerError.SessionExpired);
            }

            console.error('unknown Chikn Winner response, report this on Github:', response);
            return createError(ChicknWinnerError.InternalError);
        }

        if (response.reward) {
            this.account.eggBalance += response.reward.eggsGiven;
            response.reward.itemIds.forEach((id) => this.account.ownedItemIds.push(id));

            await this.checkChiknWinner();

            return { ok: true, ...response.reward };
        }

        console.error('unknown Chikn Winner response, report this on Github:', response);
        return createError(ChicknWinnerError.InternalError);
    }

    async resetChiknWinner() {
        if (this.account.eggBalance < 200) return createError(ChicknWinnerError.NotEnoughResetEggs);
        if (!this.account.cw.atLimit) return createError(ChicknWinnerError.NotAtDailyLimit);

        const response = await this.api.queryServices({
            cmd: 'chwReset',
            sessionId: this.account.sessionId
        });

        if (!response.ok) return response;

        if (response.result !== 'SUCCESS') {
            console.error('unknown Chikn Winner reset response, report this on Github:', response);
            return createError(ChicknWinnerError.InternalError);
        }

        this.account.eggBalance -= 200;
        await this.checkChiknWinner();

        return { ok: true, cw: this.account.cw };
    }

    canSee(target) {
        if (!this.intents.includes(Intents.PATHFINDING)) throw new Error('canSee: you need enable the PATHFINDING intent');
        return this.pathing.nodeList.hasLineOfSight(this.me.position, target.position);
    }

    async refreshChallenges() {
        const result = await this.api.queryServices({
            cmd: 'challengeGetDaily',
            sessionId: this.account.sessionId,
            playerId: this.account.id
        });

        if (!result.ok) return result;

        this.#importChallenges(result);

        return { ok: true, challenges: this.account.challenges };
    }

    async rerollChallenge(challengeId) {
        const result = await this.api.queryServices({
            cmd: 'challengeRerollSlot',
            sessionId: this.account.sessionId,
            slotId: challengeId
        });

        if (!result.ok) return result;

        if (result['0']) {
            this.#importChallenges(Object.values(result));
            return { ok: true, challenges: this.account.challenges };
        }

        const isInEnum = Object.values(ChallengeRerollError).includes(result.error);
        if (isInEnum) return { ok: false, error: result.error };

        console.error('rerollChallenge: unknown error response', result);
        return { ok: false, error: ChallengeRerollError.InternalError };
    }

    async claimChallenge(challengeId) {
        const result = await this.api.queryServices({
            cmd: 'challengeClaimReward',
            sessionId: this.account.sessionId,
            slotId: challengeId
        });

        if (!result.ok) return result;

        if (result.reward) {
            this.#importChallenges(result.challenges);
            if (result.reward > 0) this.account.eggBalance += result.reward;
            return { ok: true, eggReward: result.reward, updatedChallenges: this.account.challenges }
        }

        const isInEnum = Object.values(ChallengeClaimError).includes(result.error);
        if (isInEnum) return { ok: false, error: result.error };

        console.error('claimChallenge: unknown error response', result);
        return { ok: false, error: ChallengeClaimError.InternalError };
    }

    async refreshBalance() {
        const result = await this.api.queryServices({
            cmd: 'checkBalance',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId
        });

        if (!result.ok) return result;

        this.account.eggBalance = result.currentBalance;

        return { ok: true, currentBalance: result.currentBalance };
    }

    async redeemCode(code) {
        const result = await this.api.queryServices({
            cmd: 'redeem',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            id: this.account.id,
            code
        });

        if (!result.ok) return result;

        if (result.result === 'SUCCESS') {
            this.account.eggBalance = result.eggs_given;
            result.item_ids.forEach((id) => this.account.ownedItemIds.push(id));

            return { ok: true, eggsGiven: result.eggs_given, itemIds: result.item_ids };
        }

        const isInEnum = Object.values(RedeemCodeError).includes(result.result);
        if (isInEnum) return { ok: false, error: result.result };

        console.error('redeemCode: unknown error response', result);
        return { ok: false, error: RedeemCodeError.InternalError };
    }

    async claimURLReward(reward) {
        const result = await this.api.queryServices({
            cmd: 'urlRewardParams',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            reward
        });

        if (!result.ok) return result;

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
            return { ok: true, rewards: { eggs: result.eggsGiven, items: result.itemIds } };
        }

        const isInEnum = Object.values(ClaimURLError).includes(result.result);
        if (isInEnum) return { ok: false, error: result.result };

        console.error('claimURLReward: unknown error response', result);
        return { ok: false, error: ClaimURLError.InternalError };
    }

    async claimSocialReward(rewardTag) {
        const result = await this.api.queryServices({
            cmd: 'reward',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            rewardTag
        });

        if (!result.ok) return result;

        if (result.result === 'SUCCESS') {
            this.account.eggBalance += result.eggsGiven;
            result.itemIds.forEach((id) => this.account.ownedItemIds.push(id));
            return { ok: true, rewards: { eggs: result.eggsGiven, items: result.itemIds } };
        }

        const isInEnum = Object.values(ClaimSocialError).includes(result.result);
        if (isInEnum) return { ok: false, error: result.result };

        console.error('claimSocialReward: unknown error response', result);
        return { ok: false, error: ClaimSocialError.InternalError };
    }

    async buyItem(itemId) {
        const result = await this.api.queryServices({
            cmd: 'buy',
            firebaseId: this.account.firebaseId,
            sessionId: this.account.sessionId,
            itemId,
            save: true
        });

        if (!result.ok) return result;

        if (result.result === 'SUCCESS') {
            this.account.eggBalance = result.currentBalance;
            this.account.ownedItemIds.push(result.itemId);
            return { ok: true, itemId: result.itemId, currentBalance: result.currentBalance };
        }

        const isInEnum = Object.values(BuyItemError).includes(result.result);
        if (isInEnum) return { ok: false, error: result.result };

        console.error('buyItem: unknown error response', result);
        return { ok: false, error: BuyItemError.InternalError };
    }

    leave(code = CloseCode.mainMenu) {
        if (this.hasQuit) return;

        this.state.inGame = false;

        if (code > -1) {
            this.game?.socket?.close(code);
            this.$emit('leave', code);
        }

        clearInterval(this.updateIntervalId);

        this.#dispatches = [];

        this.state.chatLines = 0;

        this.state.reloading = false;
        this.state.swappingGun = false;
        this.state.usingMelee = false;

        this.state.stateIdx = 0;
        this.state.serverStateIdx = 0;
        this.state.shotsFired = 0;
        this.state.buffer = [];

        this.players = {};
        this.me = new GamePlayer({});

        this.game = this.#initialGame;

        this.ping = 0;

        this.lastPingTime = -1;
        this.lastDeathTime = -1;
        this.lastUpdateTick = 0;

        this.pathing = {
            nodeList: null,
            activePath: null,
            activeNode: null,
            activeNodeIdx: 0
        }
    }

    logout() {
        this.account = this.#initialAccount;

        if (this.intents.includes(Intents.RENEW_SESSION))
            clearInterval(this.renewSessionInterval);
    }

    quit(noCleanup = false) {
        if (this.hasQuit) return;
        this.hasQuit = true;

        this.leave();

        if (this.matchmaker) {
            this.matchmaker.close();
            if (!noCleanup) delete this.matchmaker;
        }

        if (this.intents.includes(Intents.NO_AFK_KICK)) clearInterval(this.afkKickInterval);
        if (this.intents.includes(Intents.RENEW_SESSION)) clearInterval(this.renewSessionInterval);

        if (!noCleanup) {
            delete this.account;
            delete this.api;
            delete this.game;
            delete this.me;
            delete this.pathing;
            delete this.players;
            delete this.state;
            delete this.packetHandlers;

            this.#initialAccount = {};
            this.#initialGame = {};

            this.#hooks = {};
            this.#globalHooks = [];
            this.#dispatches = [];
        }
    }
}

export default Bot;