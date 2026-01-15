import { AUG, CSG1, DozenGauge, EggK47, M24, RPEGG, SMG } from './guns.js';

export { findItemById } from './findItemById.js';

export const BanDuration = {
    FiveMinutes: 0,
    FifteenMinutes: 1,
    OneHour: 2
}

export const ChallengeSubType = {
    Killstreak: 0,
    KillWithWeapon: 1,
    MovementDistance: 3,
    Jumping: 4,
    TimePlayed: 6,
    TimeAlive: 7,
    KillWithCondition: 8,
    TotalKills: 10,
    SpatulaKills: 10,
    Collecting: 18,
    FromTheCoop: 20,
    SpecialOffensive: 21,
    WinKOTC: 23,
    KillWithSpatula: 23
}

export const ChallengeType = {
    Kill: 0,
    Damage: 1,
    Death: 2,
    Movement: 3,
    Collect: 4,
    Time: 5,
    KOTC: 6,
    Spatula: 7
}

export const ChatFlag = {
    None: 0,
    Pinned: 2,
    Team: 4,
    Mod: 254,
    Server: 255
}

export const ChiknWinnerDailyLimit = 3;

export const CollectType = {
    Ammo: 0,
    Grenade: 1
}

export const CoopState = {
    Start: 0,
    Score: 1,
    Win: 2,
    Capturing: 3,
    Contested: 4,
    Takeover: 5,
    Abandoned: 6,
    Unclaimed: 7
}

export const FirebaseKey = 'AIzaSyDP4SIjKaw6A4c-zvfYxICpbEjn1rRnN50';

export const FramesBetweenSyncs = 3;

export const GameAction = {
    Reset: 1,
    Pause: 2
}

export const GameMode = {
    FFA: 0,
    Team: 1,
    Spatula: 2,
    KOTC: 3
}

export const GameOptionFlag = {
    Locked: 1,
    NoTeamChange: 2,
    NoTeamShuffle: 4
}

export const GunEquipTime = 13;

export const GunList = [EggK47, DozenGauge, CSG1, RPEGG, SMG, M24, AUG];

export const ItemType = {
    Hat: 1,
    Stamp: 2,
    Primary: 3,
    Secondary: 4,
    Grenade: 6,
    Melee: 7
};

export const Movement = {
    Forward: 1,
    Backward: 2,
    Left: 4,
    Right: 8,
    Jump: 16,
    Fire: 32, // useless
    Melee: 64, // useless
    Scope: 128 // useless
}

export const PlayType = {
    JoinPublic: 0,
    CreatePrivate: 1,
    JoinPrivate: 2
}

export const ShellStreak = {
    HardBoiled: 1,
    EggBreaker: 2,
    Restock: 4,
    OverHeal: 8,
    DoubleEggs: 16,
    MiniEgg: 32
}

export const SocialMedia = {
    Facebook: 0,
    Instagram: 1,
    Tiktok: 2,
    Discord: 3,
    Youtube: 4,
    Twitter: 5,
    Twitch: 6
}

export const SocialReward = {
    Discord: 'rew_1200',
    Tiktok: 'rew_1208',
    Instagram: 'rew_1219',
    Steam: 'rew_1223',
    Facebook: 'rew_1227',
    Twitter: 'rew_1234',
    Twitch: 'rew_twitch_social'
}

export const StateBufferSize = 256;

export const Team = {
    Blue: 1,
    Red: 2
}

// https://techblog.willshouse.com/2012/01/03/most-common-user-agents

const latestChromeVersion = 143;
const latestFirefoxVersion = 146;
// const selectedChromeOSBuild = '16181.61.0';

const agents = [
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`,
    `Mozilla/5.0 (X11; Linux x86_64; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`,
    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36 Edg/${latestChromeVersion}.0.0.0`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`
    // `Mozilla/5.0 (X11; CrOS x86_64 ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`,
    // `Mozilla/5.0 (X11; CrOS armv7l ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`,
    // `Mozilla/5.0 (X11; CrOS aarch64 ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`
]

export const UserAgent = agents[Math.floor(Math.random() * agents.length)];