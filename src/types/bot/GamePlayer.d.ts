import { AnyGun } from '../constants/guns';
import { Item } from '../constants/items';

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface View {
    yaw: number;
    pitch: number;
}

export interface Character {
    eggColor: string;
    primaryGun: Item | number;
    secondaryGun: Item | number;
    stamp: Item | number;
    hat: Item | number;
    grenade: Item | number;
    melee: Item | number;
    stampPos: {
        x: number;
        y: number;
    }
}

export interface Buffer {
    // not sure how buffers work
    // users dont need to access anyways
    [key: number]: any;
}

export interface PlayerData {
    id_: string;
    uniqueId_: string;
    name_: string;
    safename_: string;
    charClass_: number;
    team_: 0 | 1 | 2;
    primaryWeaponItem_: Item | number;
    secondaryWeaponItem_: Item | number;
    shellColor_: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    hatItem_: Item | number;
    stampItem_: Item | number;
    stampPosX_: number;
    stampPosY_: number;
    grenadeItem_: Item | number;
    meleeItem_: Item | number;
    x_: number;
    y_: number;
    z_: number;
    dx_: number;
    dy_: number;
    dz_: number;
    yaw_: number;
    pitch_: number;
    score_: number;
    kills_: number;
    deaths_: number;
    streak_: number;
    totalKills_: number;
    totalDeaths_: number;
    bestGameStreak_: number;
    bestOverallStreak_: number;
    shield_: number;
    hp_: number;
    playing_: boolean;
    weaponIdx_: number;
    controlKeys_: number;
    upgradeProductId_: number;
    activeShellStreaks_: number;
    social_: string;
    hideBadge_: boolean;
}

export interface Social {
    id: number;
    type: 'Facebook' | 'Instagram' | 'Tiktok' | 'Discord' | 'Youtube' | 'Twitter' | 'Twitch';
    url: string;
    active: boolean;
}

export class GamePlayer {
    id: string;
    team: 0 | 1 | 2;
    raw: PlayerData;
    name: string;
    uniqueId: string;
    playing: boolean;
    socials: Social[];
    isVip: boolean;
    showBadge: boolean;
    position: Position;
    jumping: boolean;
    climbing: boolean;
    view: View;
    character: Character;
    activeGun: number;
    selectedGun: number;
    weapons: AnyGun[];
    grenades: number;
    buffer: Buffer;
    streak: number;
    hp: number;
    hpShield: number;
    streakRewards: number[];
    randomSeed: number;
    serverStateIdx: number;

    constructor(id: string, team: string, playerData: PlayerData);
}

export default GamePlayer;