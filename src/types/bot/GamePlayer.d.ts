import { AnyGun, Cluck9mm } from '../constants/guns';
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

export interface PlayerStats {
    killsInGame: number;
    deathsInGame: number;
    streak: number;
    totalKills: number;
    totalDeaths: number;
    bestGameStreak: number;
    bestOverallStreak: number;
}

export interface PlayerData {
    id: string;
    uniqueId: string;
    name: string;
    safename: string;
    charClass: number;
    team: 0 | 1 | 2;
    primaryWeaponItem: Item | number;
    secondaryWeaponItem: Item | number;
    shellColor: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    hatItem: Item | number;
    stampItem: Item | number;
    stampPosX: number;
    stampPosY: number;
    grenadeItem: Item | number;
    meleeItem: Item | number;
    x: number;
    y: number;
    z: number;
    $dx: number;
    $dy: number;
    $dz: number;
    yaw: number;
    pitch: number;
    score: number;
    kills: number;
    deaths: number;
    streak: number;
    totalKills: number;
    totalDeaths: number;
    bestGameStreak: number;
    bestOverallStreak: number;
    shield: number;
    hp: number;
    playing: boolean;
    weaponIdx: number;
    $controlKeys: number;
    upgradeProductId: number;
    activeShellStreaks: number;
    social: string;
    hideBadge: boolean;
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
    stats: PlayerStats;
    activeGun: number;
    selectedGun: number;
    weapons: [AnyGun, Cluck9mm];
    grenades: number;
    streak: number;
    hp: number;
    hpShield: number;
    spawnShield: number;
    streakRewards: number[];
    randomSeed: number;

    constructor(playerData: PlayerData);
}

export default GamePlayer;