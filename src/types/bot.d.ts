import { Character, GamePlayer, Position, View } from './bot/GamePlayer';

import { Challenge } from './constants/challenges';
import { CreatedGun } from './constants/guns';
import { MapJSON } from './constants/maps';
import { Item } from './constants/items';
import { Region } from './constants/regions';

import { ADispatch, DispatchParams } from './dispatches/index';

import AStar from './pathing/astar';
import { NodeList } from './pathing/mapnode';

import { API, AuthResponse, RawFirebase, ReturnError } from './api';
import yolkws from './socket';

import {
    APIError,
    BuyItemError,
    ChallengeRerollError,
    ChicknWinnerError,
    ClaimSocialError,
    ClaimURLError,
    GameFindError,
    GameJoinError,
    Intents,
    LoginError,
    MatchmakerError,
    PathfindError,
    RedeemCodeError,
    ZoneLeaveReason
} from './enums';

export interface BotParams {
    intents?: number[];
    proxy?: string;
    instance?: string;
    protocol?: string;
    connectionTimeout?: number;
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
        reset: 0 | 1;
        claimed: 0 | 1;
        completed: 0 | 1;
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

export interface RawLoginData {
    id: number;
    firebaseId: string;
    sessionId: string;
    session: number;
    emailVerified: boolean;
    maskedEmail: string | null;
    kills: number;
    deaths: number;
    streak: number;
    currentBalance: number;
    ownedItemIds: number[];
    loadout: AccountLoadout | null;
    upgradeProductId: number | null;
    upgradeMultiplier: number | null;
    upgradeAdFree: boolean | null;
    upgradeExpiryDate: number | null;
    upgradeIsExpired: boolean | null;
    maybeSchoolEmail: boolean | null;
    upgradeName: string | null;
    upgradeType: 'subscription' | null;
    subscriptionEnded: boolean;
    social: string | null;
    twitchLinked: boolean | null;
    twitchName: string | null;
    dateCreated: string;
    dateModified: string;
    accountAge: number;
    statsLifetime: Stats;
    statsMonthly: Stats;
    eggsSpent: number | null;
    eggsSpentMonthly: number | null;
    challenges: RawChallenge[];
    unclaimedRewards: RawChallenge[];
    claimedChallenges: RawChallenge[];
    notification: {
        id: number;
        type: {
            vip: {
                ids: number[];
                eggs: number;
            };
            purchases: {
                ids: number[];
                eggs: number;
            };
        };
        read: 0 | 1;
    }
    adminRoles?: number;
    active_sub: 'IsVIP' | 'WasVIP' | null;
    firstSignin: boolean;
    chwReady: {
        period?: number;
        span?: number;
        limit?: number;
        reset?: number;
    }
    cgAccountStatus: {
        hasAccount: boolean;
    }
}

export interface Account {
    id: number;
    firebase: RawFirebase;
    firebaseId: string;
    sessionId: string;
    session: string;
    email: string;
    password: string;
    cw: ChiknWinnerStatus;
    loadout: AccountLoadout;
    ownedItemIds: number[];
    vip: boolean;
    isAged: boolean;
    isCG: boolean;
    emailVerified: boolean;
    eggBalance: number;
    stats: {
        lifetime: Stats;
        monthly: Stats;
    }
    challenges: Challenges[];
    adminRoles: number;
    rawLoginData: RawLoginData;
    isDoubleEggWeeknd: () => boolean;
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
    raw: MapJSON;
    zones: Zone[][];
}

export interface GameSpatula {
    coords: Position;
    controlledBy: number;
    controlledByTeam: number;
}

export interface GameKOTC {
    stage: number;
    zoneNumber: number;
    activeZone: Zone[];
    capturing: number;
    captureProgress: number;
    numCapturing: number;
    capturePercent: number;
}

export interface RawGameData {
    command: 'gameFound';
    region: string;
    subdomain: string;
    id: string;
    uuid: string;
    private: boolean;
    noobLobby: boolean;
}

export interface FindGameResponse {
    ok: true;
    region: string;
    subdomain: string;
    id: string;
    private: boolean;
    raw: RawGameData;
}

export interface Game {
    raw: RawGameData;
    code: string;
    socket: yolkws | null;
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
    kotc: GameKOTC;
}

export interface Pathing {
    nodeList: NodeList | null;
    astar: AStar | null;
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
    inGame: boolean;
    chatLines: number;
    yaw: number;
    pitch: number;
    controlKeys: number;
    onGround: number;
    dx: number;
    dy: number;
    dz: number;
    reloading: boolean;
    swappingGun: boolean;
    usingMelee: boolean;
    stateIdx: number;
    serverStateIdx: number;
    shotsFired: number;
    buffer: BufferFrame[];
}

export interface ChiknWinnerResponse {
    ok: true;
    eggsGiven: number;
    itemIds: number[];
    rewardTier: number;
}

export interface FireBullet {
    posX: number;
    posY: number;
    posZ: number;
    dirX: number;
    dirY: number;
    dirZ: number;
}

export interface LoginResponse {
    ok: true;
    account: Account;
}

export interface GameStateChanges {
    teamScore: { before: number[], after: number[] };
    kotc?: { before: GameKOTC, after: GameKOTC };
    spatula?: { before: GameSpatula, after: GameSpatula };
    playersOnZone?: { before: GamePlayer[] };
}

export class Bot {
    static Intents: Intents;
    intents: number[];

    regionList: Region[];
    matchmakerListeners: Function[];

    proxy: string;
    instance: string;
    protocol: string;
    connectionTimeout: number;

    state: BotState;
    players: Record<string, GamePlayer>;
    me: GamePlayer;
    game: Game;
    account: Account;

    ping: number;
    pathing: Pathing;

    lastPingTime: number;
    lastDeathTime: number;

    hasQuit: boolean;

    api: API;
    matchmaker: yolkws | null;

    constructor(params?: BotParams);

    loginAnonymously(): Promise<LoginResponse | LoginError>;
    loginWithRefreshToken(refreshToken: string): Promise<LoginResponse | LoginError>;
    login(email: string, pass: string): Promise<LoginResponse | LoginError>;
    createAccount(email: string, pass: string): Promise<LoginResponse | LoginError>;
    processLoginData: (data: AuthResponse | ReturnError) => LoginResponse | LoginError;

    createMatchmaker(): Promise<{ ok: true } | MatchmakerError>;
    getRegions(): Promise<{ ok: true, regionList: Region[] } | MatchmakerError>;

    initSession(): Promise<{ ok: true } | LoginError | MatchmakerError>;

    findPublicGame(region: string, mode: string | number): Promise<FindGameResponse | GameFindError | LoginError | MatchmakerError>;
    createPrivateGame(region: string, mode: string | number, map: string): Promise<FindGameResponse | GameFindError | LoginError | MatchmakerError>;

    join(botName: string, data: string | FindGameResponse | RawGameData): Promise<{ ok: true } | LoginError | MatchmakerError | GameJoinError>;

    update(): void;

    onAny(cb: Function): void;
    off(event: string, cb: Function): void;

    on(event: 'authFail', cb: (reason: string) => void): void;
    on(event: 'authSuccess', cb: (account: Account) => void): void;
    on(event: 'balanceUpdate', cb: (oldBalance: number, newBalance: number) => void): void;
    on(event: 'banned', cb: (banRemaining: string) => void): void;
    on(event: 'botJoin', cb: (botPlayer: GamePlayer) => void): void;
    on(event: 'challengeComplete', cb: (player: GamePlayer, challengeId: number) => void): void;
    on(event: 'chat', cb: (player: GamePlayer | undefined, message: string, flags: number) => void): void;
    on(event: 'close', cb: (code: number) => void): void;
    on(event: 'gameForcePause', cb: () => void): void;
    on(event: 'gameOptionsChange', cb: (oldOptions: GameOptions, newOptions: GameOptions) => void): void;
    on(event: 'gameReady', cb: () => void): void;
    on(event: 'gameReset', cb: () => void): void;
    on(event: 'gameStateChange', cb: (changes: GameStateChanges) => void): void;
    on(event: 'grenadeExplode', cb: (item: Item | number, pos: Position, damage: number, radius: number) => void): void;
    on(event: 'leave', cb: (closeCode: number) => void): void;
    on(event: 'mapLoad', cb: (map: MapJSON) => void): void;
    on(event: 'packet', cb: (packet: ArrayBuffer) => void): void;
    on(event: 'pathfindComplete', cb: () => void): void;
    on(event: 'pathfindError', cb: (error: PathfindError) => void): void;
    on(event: 'pingUpdate', cb: (oldPing: number, newPing: number) => void): void;
    on(event: 'playerBeginStreak', cb: (player: GamePlayer, streakType: number) => void): void;
    on(event: 'playerChangeCharacter', cb: (player: GamePlayer, oldCharacter: Character, newCharacter: Character) => void): void;
    on(event: 'playerChangeGun', cb: (player: GamePlayer, oldGunId: number, newGunId: number) => void): void;
    on(event: 'playerCollectAmmo', cb: (player: GamePlayer, weapon: CreatedGun, itemId: number) => void): void;
    on(event: 'playerCollectGrenade', cb: (player: GamePlayer, itemId: number) => void): void;
    on(event: 'playerDamage', cb: (player: GamePlayer, oldHp: number, newHp: number) => void): void;
    on(event: 'playerDeath', cb: (killed: GamePlayer, killer: GamePlayer, oldKilled: GamePlayer, damageInt: number) => void): void;
    on(event: 'playerEndStreak', cb: (player: GamePlayer, streakType: number) => void): void;
    on(event: 'playerEnterZone', cb: (player: GamePlayer) => void): void;
    on(event: 'playerFire', cb: (player: GamePlayer, weapon: CreatedGun, bullet: FireBullet) => void): void;
    on(event: 'playerJoin', cb: (player: GamePlayer) => void): void;
    on(event: 'playerInfo', cb: (player: GamePlayer, playerIP: string, playerDBId: string) => void): void;
    on(event: 'playerLeave', cb: (player: GamePlayer) => void): void;
    on(event: 'playerLeaveZone', cb: (player: GamePlayer, leaveReason: ZoneLeaveReason) => void): void;
    on(event: 'playerMelee', cb: (player: GamePlayer) => void): void;
    on(event: 'playerMove', cb: (player: GamePlayer, oldPosition: Position, newPosition: Position) => void): void;
    on(event: 'playerPause', cb: (player: GamePlayer) => void): void;
    on(event: 'playerReload', cb: (player: GamePlayer, weapon: CreatedGun) => void): void;
    on(event: 'playerRespawn', cb: (player: GamePlayer) => void): void;
    on(event: 'playerRotate', cb: (player: GamePlayer, oldView: View, newView: View) => void): void;
    on(event: 'playerSwapWeapon', cb: (player: GamePlayer, nowActive: number) => void): void;
    on(event: 'playerSwitchTeam', cb: (player: GamePlayer, oldTeam: number, newTeam: number) => void): void;
    on(event: 'playerThrowGrenade', cb: (player: GamePlayer, position: Position, dPosition: Position) => void): void;
    on(event: 'respawnDenied', cb: () => void): void;
    on(event: 'rocketHit', cb: (pos: Position, damage: number, blastRadius: number) => void): void;
    on(event: 'selfShieldHit', cb: (newShieldHealth: number, newPlayerHealth: number, dir: { dx: number, dz: number }) => void): void;
    on(event: 'selfShieldLost', cb: (newPlayerHealth: number, dir: { dx: number, dz: number }) => void): void;
    on(event: 'sessionExpired', cb: () => void): void;
    on(event: 'spawnItem', cb: (itemType: number, itemPosition: Position, itemId: number) => void): void;
    on(event: 'tick', cb: () => void): void;

    dispatch(disp: ADispatch): boolean;
    emit<K extends keyof DispatchParams>(type: K, ...args: DispatchParams[K]): boolean;

    packetHandlers: Record<number, () => void>;
    processPacket(data: number[]): void;

    checkChiknWinner(): Promise<{ ok: true, cw: ChiknWinnerStatus } | APIError>;
    playChiknWinner(doPrematureCooldownCheck: boolean): Promise<ChiknWinnerResponse | APIError | ChicknWinnerError>;
    resetChiknWinner(): Promise<{ ok: true, cw: ChiknWinnerStatus } | APIError | ChicknWinnerError>;

    canSee(player: GamePlayer): boolean;
    getBestTarget(): GamePlayer | null;

    refreshChallenges(): Promise<{ ok: true, challenges: Challenges[] } | APIError>;
    rerollChallenge(challengeId: number): Promise<{ ok: true, challenges: Challenges[] } | APIError | ChallengeRerollError>;
    claimChallenge(challengeId: number): Promise<{ ok: true, eggReward: number, updatedChallenges: Challenges[] } | APIError>;

    refreshBalance(): Promise<{ ok: true, currentBalance: number } | APIError>;
    redeemCode(code: string): Promise<{ ok: true; eggsGiven: number; itemIds: number[]; } | APIError | RedeemCodeError>;
    claimURLReward(reward: string): Promise<{ ok: true; eggsGiven: number; itemIds: number[]; } | APIError | ClaimURLError>;
    claimSocialReward(rewardTag: string): Promise<{ ok: true; eggsGiven: number; itemIds: number[]; } | APIError | ClaimSocialError>;
    buyItem(itemId: number): Promise<{ ok: true; currentBalance: number; itemId: number; } | APIError | BuyItemError>;

    leave(code?: number): void;
    logout(): void;
    quit(noCleanup?: boolean): void;
}

export default Bot;