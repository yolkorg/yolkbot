import { AUG, CSG1, DozenGauge, Eggk47, M24, RPEGG, SMG } from './guns';
import { Item } from './items';

export declare const findItemById: (id: number) => Item;

export declare const ChatFlags: {
    none: number;
    pinned: number;
    team: number;
}

export declare const ChiknWinnerDailyLimit: number;

export declare const CollectTypes: {
    AMMO: number;
    GRENADE: number;
};

export declare const CoopStates: {
    start: number;
    score: number;
    win: number;
    capturing: number;
    contested: number;
    takeover: number;
    abandoned: number;
    unclaimed: number;
};

export declare const FirebaseKey: string;

export declare const SyncRate: number;
export declare const FramesBetweenSyncs: number;

export declare const GameActions: {
    reset: number;
    pause: number;
};

export declare const GameModes: {
    ffa: number;
    team: number;
    spatula: number;
    kotc: number;
};

export declare const GameOptionFlags: {
    locked: number;
    noTeamChange: number;
    noTeamShuffle: number;
};

export declare const GunList: Array<typeof Eggk47 | typeof DozenGauge | typeof CSG1 | typeof RPEGG | typeof SMG | typeof M24 | typeof AUG>;

export declare const IsBrowser: boolean;

export declare const ItemTypes: {
    Hat: number;
    Stamp: number;
    Primary: number;
    Secondary: number;
    Grenade: number;
    Melee: number;
};

export declare const Movements: {
    FORWARD: number;
    BACK: number;
    LEFT: number;
    RIGHT: number;
    JUMP: number;
    FIRE: number;
    MELEE: number;
    SCOPE: number;
};

export declare const PlayTypes: {
    joinPublic: number;
    createPrivate: number;
    joinPrivate: number;
};

export declare const ProxiesEnabled: boolean;

export declare const ShellStreaks: {
    HardBoiled: number;
    EggBreaker: number;
    Restock: number;
    OverHeal: number;
    DoubleEggs: number;
    MiniEgg: number;
};

export declare const SocialMedias: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
};

export declare const SocialRewards: {
    Discord: string;
    Tiktok: string;
    Instagram: string;
    Steam: string;
    Facebook: string;
    Twitter: string;
    Twitch: string;
}

export declare const StateBufferSize: number;

export declare const Teams: {
    blue: number;
    red: number;
};

export declare const URLRewards: string[];

export declare const UserAgent: string;