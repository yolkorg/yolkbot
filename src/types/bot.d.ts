type intents = {
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
    DEBUG_BEST_TARGET: 14
}

import { Character, GamePlayer, Position } from './bot/GamePlayer';
import { Challenge } from './constants/challenges';
import { AnyGun } from './constants/guns';
import { Map } from './constants/maps';
import { ADispatch } from './dispatches/index';
import { NodeList } from './pathing/mapnode';
import { API } from './api';
import { FindGameParams, Matchmaker, RawGameData } from './matchmaker';
import yolkws from './socket';

export interface BotParams {
    intents?: number[];
    proxy?: string;
    httpProxy?: string;
    instance?: string;
    protocol?: string;
    apiMaxRetries?: number;
}

export interface ChiknWinnerStatus {
    atLimit: boolean;
    limit: number;
    secondsUntilPlay: number;
    canPlayAgain: number;
}

export interface StatDamageTypes {
    pistol: number;
    grenade: number;
    rpegg: number;
    eggk: number;
    scrambler: number;
    ranger: number;
    whpper: number;
    crackshot: number;
    trihard: number;
    melee: number;
}

export interface StatKD {
    total: number;
    mode: {
        public: number;
        private: number;
    };
    dmgType: StatDamageTypes;
    gameType: {
        kotc: number;
        spatula: number;
        ffa: number;
        team: number;
    }
}

export interface Stats {
    streak: number;
    kills: StatKD;
    deaths: StatKD;
    gameType: {
        kotc: {
            captured: number;
            wins: number;
        }
    };
}

export interface RawChallenge {
    challengeInfo: Challenge;
    challengeData: {
        period: number;
        challengeId: number;
        reset: number;
        claimed: number;
        completed: number;
        data: number;
    }
}

export interface Challenges {
    raw: RawChallenge;
    id: number;
    name: string;
    desc: string;
    rewardEggs: number;
    isRerolled: boolean;
    isClaimed: boolean;
    isCompleted: boolean;
    progressNum: number;
    goalNum: number;
}

export interface AccountLoadout {
    hatId: number | null;
    meleeId: number;
    stampId: number | null;
    classIdx: number;
    colorIdx: number;
    grenadeId: number;
    primaryId: number[];
    secondaryId: number[];
    stampPositionX: number;
    stampPositionY: number;
}

export interface Account {
    id: number;
    firebaseId: string;
    sessionId: string;
    session: string;
    email: string;
    password: string;
    cw: ChiknWinnerStatus;
    loadout: AccountLoadout;
    ownedItemIds: number[];
    vip: boolean;
    accountAge: number;
    emailVerified: boolean;
    eggBalance: number;
    stats: {
        lifetime: Stats;
        monthly: Stats;
    }
    challenges: Challenges[];
    rawLoginData: any; // someday i'll type it
}

export interface GameOptions {
    gravity: number;
    damage: number;
    healthRegen: number;
    locked: boolean;
    noTeamChange: boolean;
    noTeamShuffle: boolean;
    weaponsDisabled: boolean[];
    mustUseSecondary: boolean;
}

export interface Collectable {
    id: number;
    x: number;
    y: number;
    z: number;
}

export interface Zone {
    x: number;
    y: number;
    z: number;
    zone: number;
}

export interface GameMap {
    filename: string;
    hash: string;
    name: string;
    modes: {
        FFA: boolean;
        Teams: boolean;
        Spatula: boolean;
        King: boolean;
    };
    availability: string;
    numPlayers: string;
    raw: Map;
    zones: Zone[][];
}

export interface GameSpatula {
    coords: Position;
    controlledBy: number;
    controlledByTeam: number;
}

export interface Game {
    raw: RawGameData;
    code: string;
    gameModeId: number;
    gameMode: string;
    mapIdx: number;
    map: GameMap;
    playerLimit: number;
    isGameOwner: boolean;
    isPrivate: boolean;
    options: GameOptions;
    collectables: Collectable[][];
    teamScore: number[];
    spatula: GameSpatula;
    stage: number;
    zoneNumber: number;
    activeZone: Zone[];
    capturing: number;
    captureProgress: number;
    numCapturing: number;
    stageName: string;
    capturePercent: number;
    socket: yolkws | null;
}

export interface Pathing {
    nodeList: NodeList | null;
    followingPath: boolean;
    activePath: any;
    activeNode: any;
    activeNodeIdx: number;
}

export interface BufferFrame {
    controlKeys: number;
    yaw: number;
    pitch: number;
    shotsFired: number;
}

export interface BotState {
    name: string;
    weaponIdx: number;
    reloading: boolean;
    swappingGun: boolean;
    usingMelee: boolean;
    stateIdx: number;
    serverStateIdx: number;
    shotsFired: number;
    buffer: BufferFrame[];
    quit: boolean;
}

export interface ChiknWinnerResponse {
    eggsGiven: number;
    itemIds: number[];
    rewardTier: number;
}

export class Bot {
    static Intents: intents;
    Intents: intents;
    intents: number[];

    proxy: string;
    httpProxy: string;
    instance: string;
    protocol: string;

    state: BotState;
    players: Record<string, GamePlayer>;
    me: GamePlayer;
    game: Game;
    account: Account;

    ping: number;
    lastPingTime: number;
    lastDeathTime: number;
    lastChatTime: number;
    pathing: Pathing;

    api: API;
    matchmaker: Matchmaker | null;

    constructor(params?: BotParams);

    loginAnonymously(): Promise<Account | false>;
    loginWithRefreshToken(refreshToken: string): Promise<Account | false>;
    login(email: string, pass: string): Promise<Account | false>;
    createAccount(email: string, pass: string): Promise<Account | false>;

    initMatchmaker(): Promise<boolean>;
    createPrivateGame(opts: { region: string; mode: string; map: string }): Promise<RawGameData>;
    findPublicGame(params: FindGameParams): Promise<RawGameData>;
    join(botName: string, data: string | RawGameData): Promise<void>;

    processPacket(data: number[]): void;
    dispatch(disp: ADispatch): void;
    update(): void;

    canSee(player: GamePlayer): boolean;
    getBestTarget(customFilter?: (player: GamePlayer) => boolean): { player: GamePlayer, inLoS: boolean } | undefined;

    onAny(cb: Function): void;
    off(event: string, cb: Function): void;

    on(event: 'authFail', cb: (reason: string) => void): void;
    on(event: 'authSuccess', cb: (account: Account) => void): void;
    on(event: 'balanceUpdate', cb: (oldBalance: number, newBalance: number) => void): void;
    on(event: 'banned', cb: (banRemaining: string) => void): void;
    on(event: 'chat', cb: (player: GamePlayer | undefined, message: string, flags: number) => void): void;
    on(event: 'close', cb: (code: number) => void): void;
    on(event: 'collectAmmo', cb: (player: GamePlayer, weapon: AnyGun) => void): void;
    on(event: 'collectGrenade', cb: (player: GamePlayer) => void): void;
    on(event: 'gameForcePause', cb: () => void): void;
    on(event: 'gameOptionsChange', cb: (oldOptions: GameOptions, newOptions: GameOptions) => void): void;
    on(event: 'gameReady', cb: () => void): void;
    on(event: 'gameReset', cb: () => void): void;
    on(event: 'gameStateChange', cb: (oldState: Game, newState: Game) => void): void;
    on(event: 'grenadeExploded', cb: (item: Item | number, pos: Position, damage: number, radius: number) => void): void;
    on(event: 'leave', cb: () => void): void;
    on(event: 'packet', cb: (packet: ArrayBuffer) => void): void;
    on(event: 'pingUpdate', cb: (oldPing: number, newPing: number) => void): void;
    on(event: 'playerBeginStreak', cb: (player: GamePlayer, streak: number) => void): void;
    on(event: 'playerChangeCharacter', cb: (player: GamePlayer, oldCharacter: Character, newCharacter: Character) => void): void;
    on(event: 'playerChangeGun', cb: (player: GamePlayer, oldGun: number, newGun: number) => void): void;
    on(event: 'playerDamaged', cb: (player: GamePlayer, oldHp: number, newHp: number) => void): void;
    on(event: 'playerDeath', cb: (player: GamePlayer, killer: GamePlayer) => void): void;
    on(event: 'playerFire', cb: (player: GamePlayer, weapon: AnyGun) => void): void;
    on(event: 'playerJoin', cb: (player: GamePlayer) => void): void;
    on(event: 'playerLeave', cb: (player: GamePlayer) => void): void;
    on(event: 'playerMelee', cb: (player: GamePlayer) => void): void;
    on(event: 'playerPause', cb: (player: GamePlayer) => void): void;
    on(event: 'playerReload', cb: (player: GamePlayer, weapon: AnyGun) => void): void;
    on(event: 'playerRespawn', cb: (player: GamePlayer) => void): void;
    on(event: 'playerSwapWeapon', cb: (player: GamePlayer, nowActive: number) => void): void;
    on(event: 'playerSwitchTeam', cb: (player: GamePlayer, oldTeam: number, newTeam: number) => void): void;
    on(event: 'quit', cb: () => void): void;
    on(event: 'rocketHit', cb: (pos: Position, damage: number, blastRadius: number) => void): void;
    on(event: 'selfDamaged', cb: (oldHealth: number, newHealth: number) => void): void;
    on(event: 'selfMoved', cb: (oldPosition: Position, newPosition: Position) => void): void;
    on(event: 'selfRespawnFail', cb: () => void): void;
    on(event: 'selfShieldHit', cb: (oldShieldHealth: number, newShieldHealth: number) => void): void;
    on(event: 'selfShieldLost', cb: () => void): void;
    on(event: 'spawnItem', cb: (itemType: number, uniqueItemId: number, itemPosition: Position) => void): void;
    on(event: 'tick', cb: () => void): void;

    checkChiknWinner(): Promise<ChiknWinnerStatus>;
    playChiknWinner(doPrematureCooldownCheck: boolean): Promise<ChiknWinnerResponse | string>;
    resetChiknWinner(): Promise<ChiknWinnerStatus>;

    refreshChallenges(): Promise<Challenges[]>;
    claimChallenge(challengeId: number): Promise<{ eggReward: number, updatedChallenges: Challenges[] }>;
    rerollChallenge(challengeId: number): Promise<Challenges[]>;

    refreshBalance(): Promise<number>;
    redeemCode(code: string): Promise<{ result: string; eggsGiven: number; itemIds: number[]; }>;
    claimURLReward(reward: string): Promise<{ result: string; eggsGiven: number; itemIds: number[]; }>;
    claimSocialReward(rewardTag: string): Promise<{ result: string; eggsGiven: number; itemIds: number[]; }>;
    buyItem(itemId: number): Promise<{ result: string; currentBalance: number; itemId: number; }>;

    leave(code?: number): void;
    logout(): void;
    quit(noCleanup?: boolean): void;
}

export default Bot;