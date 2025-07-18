import { AUG, CSG1, DozenGauge, Eggk47, M24, RPEGG, SMG } from './guns';

export { findItemById } from './findItemById';

export declare const BanDuration: {
    FiveMinutes: number;
    FifteenMinutes: number;
    OneHour: number;
}

export declare const ChallengeSubType: {
    Killstreak: number;
    KillWithWeapon: number;
    MovementDistance: number;
    Jumping: number;
    TimePlayed: number;
    TimeAlive: number;
    KillWithCondition: number;
    TotalKills: number;
    SpatulaKills: number;
    Collecting: number;
    FromTheCoop: number;
    SpecialOffensive: number;
    WinKOTC: number;
    KillWithSpatula: number;
}

export declare const ChallengeType: {
    Kill: number;
    Damage: number;
    Death: number;
    Movement: number;
    Collect: number;
    Time: number;
    KOTC: number;
    Spatula: number;
}

export declare const ChatFlag: {
    None: number;
    Pinned: number;
    Team: number;
    Mod: number;
    Server: number;
}

export declare const ChiknWinnerDailyLimit: number;

export declare const CollectType: {
    Ammo: number;
    Grenade: number;
};

export declare const CoopState: {
    Start: number;
    Score: number;
    Win: number;
    Capturing: number;
    Contested: number;
    Takeover: number;
    Abandoned: number;
    Unclaimed: number;
};

export declare const FirebaseKey: string;

export declare const FramesBetweenSyncs: number;

export declare const GameAction: {
    Reset: number;
    Pause: number;
};

export declare const GameMode: {
    FFA: number;
    Team: number;
    Spatula: number;
    KOTC: number;
};

export declare const GameOptionFlags: {
    Locked: number;
    NoTeamChange: number;
    NoTeamShuffle: number;
};

export declare const GunEquipTime: number;

export declare const GunList: Array<typeof Eggk47 | typeof DozenGauge | typeof CSG1 | typeof RPEGG | typeof SMG | typeof M24 | typeof AUG>;

export declare const IsBrowser: boolean;

export declare const ItemType: {
    Hat: number;
    Stamp: number;
    Primary: number;
    Secondary: number;
    Grenade: number;
    Melee: number;
};

export declare const Movement: {
    Forward: number;
    Backward: number;
    Left: number;
    Right: number;
    Jump: number;
    Fire: number;
    Melee: number;
    Scope: number;
};

export declare const PlayTypes: {
    joinPublic: number;
    createPrivate: number;
    joinPrivate: number;
};

export declare const ProxiesEnabled: boolean;

export declare const ShellStreak: {
    HardBoiled: number;
    EggBreaker: number;
    Restock: number;
    OverHeal: number;
    DoubleEggs: number;
    MiniEgg: number;
};

export declare const SocialMedia: {
    Facebook: number;
    Instagram: number;
    Tiktok: number;
    Discord: number;
    Youtube: number;
    Twitter: number;
    Twitch: number;
};

export declare const SocialReward: {
    Discord: string;
    Tiktok: string;
    Instagram: string;
    Steam: string;
    Facebook: string;
    Twitter: string;
    Twitch: string;
}

export declare const StateBufferSize: number;

export declare const Team: {
    Blue: number;
    Red: number;
};

export declare const URLRewards: string[];

export declare const UserAgent: string;