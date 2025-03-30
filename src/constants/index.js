import { AUG, CSG1, DozenGauge, Eggk47, M24, RPEGG, SMG } from './guns.js';
import { Items } from './items.js';

export const findItemById = (id) => Items.find(item => item.id === id);

export const ChiknWinnerDailyLimit = 3;

export const CollectTypes = {
    AMMO: 0,
    GRENADE: 1
}

export const CoopStates = {
    start: 0,
    score: 1,
    win: 2,
    capturing: 3,
    contested: 4,
    takeover: 5,
    abandoned: 6,
    unclaimed: 7
}

export const FirebaseKey = 'AIzaSyDP4SIjKaw6A4c-zvfYxICpbEjn1rRnN50';

export const GameActions = {
    reset: 1,
    pause: 2
}

export const GameModes = {
    'ffa': 0,
    'team': 1,
    'spatula': 2,
    'kotc': 3
}

export const GameOptionFlags = {
    locked: 1,
    noTeamChange: 2,
    noTeamShuffle: 4
}

export const GunList = [Eggk47, DozenGauge, CSG1, RPEGG, SMG, M24, AUG];

export const IsBrowser = typeof window !== 'undefined';

export const ItemTypes = {
    Hat: 1,
    Stamp: 2,
    Primary: 3,
    Secondary: 4,
    Grenade: 6,
    Melee: 7
};

export const Movements = {
    FORWARD: 1,
    BACK: 2,
    LEFT: 4,
    RIGHT: 8,
    JUMP: 16,
    FIRE: 32, // useless
    MELEE: 64, // useless
    SCOPE: 128 // useless
}

export const PlayTypes = {
    joinPublic: 0,
    createPrivate: 1,
    joinPrivate: 2
}

export const ProxiesEnabled = !IsBrowser && typeof Bun == 'undefined';

export const ShellStreaks = {
    HardBoiled: 1,
    EggBreaker: 2,
    Restock: 4,
    OverHeal: 8,
    DoubleEggs: 16,
    MiniEgg: 32
}

export const SocialMedias = {
    0: 'Facebook',
    1: 'Instagram',
    2: 'Tiktok',
    3: 'Discord',
    4: 'Youtube',
    5: 'Twitter',
    6: 'Twitch'
}

export const SocialRewards = {
    Discord: 'rew_1200',
    Tiktok: 'rew_1208',
    Instagram: 'rew_1219',
    Steam: 'rew_1223',
    Facebook: 'rew_1227',
    Twitter: 'rew_1234',
    Twitch: 'rew_twitch_social'
}

export const Teams = {
    blue: 1,
    red: 2
}

export const URLRewards = [
    'giveBasketBrosReward',
    'mercZoneFinalGift',
    'midMonthGiveMeEggs',
    'newYolkerSignupReward',
    'newYolkerItemReward',
    'newYolkerWelcomeBack',
    'WelcomeBack'
]

export const UserAgent = IsBrowser ? undefined :
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'