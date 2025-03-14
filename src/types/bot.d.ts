import { NodeList } from '../pathing/mapnode.js';

import { Character, GamePlayer } from './bot/GamePlayer';
import { Map } from './constants/maps';
import { ADispatch } from './dispatches/index';
import { Gun } from './gun';
import { Matchmaker, RawGameData } from './matchmaker';
import yolkws from './socket';

export interface BotParams {
    name?: string;
    proxy?: string;
    doUpdate?: boolean;
    updateInterval?: number;
    doPing?: boolean;
    pingInterval?: number;
    doPathing?: boolean;
    instance?: string;
}

export interface Account {
    firebaseId: string;
    sessionId: string;
    session: string;
    loadout: {
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
    };
    ownedItemIds: number[];
    vip: boolean;
    accountAge: number;
    emailVerified: boolean;
    eggBalance: number;
    rawLoginData: any; // i ain't typoing allat
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

export interface Game {
    raw: RawGameData;
    code: string;
    gameModeId: number;
    gameMode: string;
    mapIdx: number;
    map: {
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
    };
    playerLimit: number;
    isGameOwner: boolean;
    isPrivate: boolean;
    options: GameOptions;
    collectables: Collectable[][];
    teamScore: number[];
    spatula: {
        coords: { x: number; y: number; z: number };
        controlledBy: number;
        controlledByTeam: number;
    };
    stage: number;
    activeZone: number;
    capturing: number;
    captureProgress: number;
    numCapturing: number;
    stageName: string;
    capturePercent: number;
}

export interface Pathing {
    nodeList: NodeList | null;
    followingPath: boolean;
    activePath: any;
    activeNode: any;
    activeNodeIdx: number;
}

export interface BotState {
    loggedIn: boolean;
    gameFound: boolean;
    reloading: boolean;
    swappingGun: boolean;
    usingMelee: boolean;
    shotsFired: number;
    joinedGame?: boolean;
}

export class Bot {
    proxy: string;
    name?: string;
    autoPing: boolean;
    autoUpdate: boolean;
    disablePathing: boolean;
    pingInterval: number;
    updateInterval: number;
    instance: string;
    state: BotState;
    players: Record<string, GamePlayer>;
    me: GamePlayer;
    game: Game;
    account: Account;
    gameSocket: yolkws | null;
    ping: number;
    lastPingTime: number;
    lastDeathTime: number;
    lastChatTime: number;
    lastUpdateTime: number;
    nUpdates: number;
    controlKeys: number;
    initTime: number;
    pathing: Pathing;
    matchmaker: Matchmaker | null;

    constructor(params?: BotParams);

    login(email: string, pass: string): Promise<Account | false>;
    dispatch(disp: ADispatch): void;
    drain(): void;
    initMatchmaker(): Promise<boolean>;
    createPrivateGame(opts: { region: string; mode: string; map: string }): Promise<RawGameData>;
    join(data: string | RawGameData): Promise<void>;
    update(): void;
    onAny(cb: Function): void;

    on(event: 'authFail', cb: (reason: string) => void): void;
    on(event: 'balanceUpdate', cb: (oldBalance: number, newBalance: number) => void): void;
    on(event: 'banned', cb: (banRemaining: string) => void): void;
    on(event: 'chat', cb: (player: GamePlayer | undefined, message: string, flags: number) => void): void;
    on(event: 'close', cb: (code: number) => void): void;
    on(event: 'collectAmmo', cb: (player: GamePlayer, weapon: Gun) => void): void;
    on(event: 'collectGrenade', cb: (player: GamePlayer) => void): void;
    on(event: 'gameForcePause', cb: () => void): void;
    on(event: 'gameOptionsChange', cb: (oldOptions: GameOptions, newOptions: GameOptions) => void): void;
    on(event: 'gameReset', cb: () => void): void;
    on(event: 'gameStateChange', cb: (oldState: Game, newState: Game) => void): void;
    on(event: 'pingUpdate', cb: (oldPing: number, newPing: number) => void): void;
    on(event: 'playerBeginStreak', cb: (player: GamePlayer, streak: number) => void): void;
    on(event: 'playerChangeCharacter', cb: (player: GamePlayer, oldCharacter: Character, newCharacter: Character) => void): void;
    on(event: 'playerChangeGun', cb: (player: GamePlayer, oldGun: number, newGun: number) => void): void;
    on(event: 'playerDamaged', cb: (player: GamePlayer, oldHp: number, newHp: number) => void): void;
    on(event: 'playerDeath', cb: (player: GamePlayer, killer: GamePlayer) => void): void;
    on(event: 'playerFire', cb: (player: GamePlayer, weapon: Gun) => void): void;
    on(event: 'playerJoin', cb: (player: GamePlayer) => void): void;
    on(event: 'playerLeave', cb: (player: GamePlayer) => void): void;
    on(event: 'playerMelee', cb: (player: GamePlayer) => void): void;
    on(event: 'playerPause', cb: (player: GamePlayer) => void): void;
    on(event: 'playerReload', cb: (player: GamePlayer, weapon: Gun) => void): void;
    on(event: 'playerRespawn', cb: (player: GamePlayer) => void): void;
    on(event: 'playerSwapWeapon', cb: (player: GamePlayer, nowActive: number) => void): void;
    on(event: 'playerSwitchTeam', cb: (player: GamePlayer, oldTeam: number, newTeam: number) => void): void;
    on(event: 'selfDamaged', cb: (oldHp: number, newHp: number) => void): void;
    on(event: 'selfMoved', cb: (oldPos: { x: number; y: number; z: number }, newPos: { x: number; y: number; z: number }) => void): void;
    on(event: 'selfRespawnFail', cb: () => void): void;
    on(event: 'selfShieldHit', cb: (oldShield: number, newShield: number) => void): void;
    on(event: 'selfShieldLost', cb: () => void): void;
    on(event: 'spawnItem', cb: (type: number, _id: number, pos: { x: number; y: number; z: number }) => void): void;
    on(event: 'tick', cb: () => void): void;
}

export default Bot;