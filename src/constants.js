import fs from 'fs';
import path from 'path';

import { AUG, CSG1, DozenGauge, Eggk47, M24, RPEGG, SMG } from '../data/guns.js';

const mapPath = path.join(import.meta.dirname, '..', 'data', 'maps.json');
export const Maps = JSON.parse(fs.readFileSync(mapPath));

const itemPath = path.join(import.meta.dirname, '..', 'data', 'items.json');
export const Items = JSON.parse(fs.readFileSync(itemPath));

export const findItemById = (id) => Items.find(item => item.id === id);

const MeshPartMappings = {
    aug: AUG,
    csg1: CSG1,
    dozenGauge: DozenGauge,
    eggk47: Eggk47,
    m24: M24,
    rpegg: RPEGG,
    smg: SMG
}

export const getWeaponClass = (item) => {
    const mainPart = item.item_data.meshName.split('_')[1];
    return MeshPartMappings[mainPart];
}

export const GameModes = {
    'ffa': 0,
    'team': 1,
    'spatula': 2,
    'kotc': 3
}

export const GameModesById = Object.fromEntries(Object.entries(GameModes).map(([key, value]) => [value, key]));

export const PlayTypes = {
    joinPublic: 0,
    createPrivate: 1,
    joinPrivate: 2
}

export const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1230.0.0.0 Safari/537.36';

export const Move = {
    FORWARD: 1,
    BACK: 2,
    LEFT: 4,
    RIGHT: 8,
    JUMP: 16,
    FIRE: 32, // useless
    MELEE: 64, // useless
    SCOPE: 128
}

export const TEAM = {
    blue: 1,
    red: 2
};

export const CoopStates = {
    start: 0,
    score: 1,
    win: 2,
    capturing: 3,
    contested: 4,
    takeover: 5,
    abandoned: 6,
    unclaimed: 7
};

export const CoopStagesById = Object.fromEntries(Object.entries(CoopStates).map(([key, value]) => [value, key]));

export const ShellStreak = {
    HardBoiled: 1,
    EggBreaker: 2,
    Restock: 4,
    OverHeal: 8,
    DoubleEggs: 16,
    MiniEgg: 32
};

export const CollectTypes = {
    AMMO: 0,
    GRENADE: 1
}

export const GameOptionFlags = {
    locked: 1,
    noTeamChange: 2,
    noTeamShuffle: 4
}

export const GameActions = {
    reset: 1,
    pause: 2
};