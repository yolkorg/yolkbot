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
    primaryGun: Item;
    secondaryGun: Item;
    stamp: Item;
    hat: Item;
    grenade: Item;
    melee: Item;
}

export interface Buffer {
    // not sure how buffers work
    // users dont need to access anyways
    [key: number]: any;
}

export interface PlayerData {
    name_: string;
    uniqueId_: string;
    playing_: boolean;
    social_: string;
    hideBadge_: boolean;
    x_: number;
    y_: number;
    z_: number;
    yaw_: number;
    pitch_: number;
    shellColor_: string;
    primaryWeaponItem_: Item;
    secondaryWeaponItem_: Item;
    stampItem_: Item;
    hatItem_: Item;
    grenadeItem_: Item;
    meleeItem_: Item;
    weaponIdx_: number;
}

export interface Social {
    // another property but i forgot it
    id: string;
    url: string;
}

export class GamePlayer {
    id: string;
    team: 0 | 1 | 2;
    data: PlayerData;
    name: string;
    uniqueId: string;
    playing: boolean;
    social: Social[];
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
    kills: number;
    hp: number;
    hpShield: number;
    streakRewards: number[];
    randomSeed: number;
    serverStateIdx: number;

    constructor(id: string, team: string, playerData: PlayerData);
}

export default GamePlayer;