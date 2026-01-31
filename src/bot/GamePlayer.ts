import { Movement, ShellStreak, SocialMedia, Team } from '../enums.js';
import { Cluck9mm, CreatedGun, GunList } from '../constants/guns.js';
import { createGun } from '../util.js';

import { Position2D, Position3D } from '../common.d';
import { Item } from '../constants/items.js';

const RSocialMedia = Object.fromEntries(
    Object.entries(SocialMedia)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => [value, key.toLowerCase()])
);

export interface View {
    yaw: number;
    pitch: number;
}

export type ShellColor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Character {
    eggColor: ShellColor;
    primaryGun: Item | number;
    secondaryGun: Item | number;
    stamp: Item | number;
    hat: Item | number;
    grenade: Item | number;
    melee: Item | number;
    stampPos: Position2D;
}

export type GunId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PlayerStats {
    totalKills: number;
    totalDeaths: number;
    bestStreak: number;
}

export interface PlayerData {
    id: string;
    uniqueId: string;
    name: string;
    safeName: string;
    charClass: GunId;
    team: Team;
    primaryWeaponItem: Item | number;
    secondaryWeaponItem: Item | number;
    shellColor: ShellColor;
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
    $kills: number;
    $deaths: number;
    $streak: number;
    totalKills: number;
    totalDeaths: number;
    bestStreak: number;
    $bestOverallStreak: number;
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

export type PlayerWeapons = [CreatedGun, CreatedGun];

export interface PlayerAdminData {
    ip: string;
    dbId: string;
}

export class GamePlayer {
    id: number;
    uniqueId: string;
    name: string;
    safeName: string;
    team: number;
    playing: boolean;
    socials: { id: number; username: string; type: string }[];
    isVip: boolean;
    showBadge: boolean;
    streak: number;
    shellStreaks: ShellStreak[];
    scale: number;
    position: Position3D;
    jumping: boolean;
    scoping: boolean;
    climbing: boolean;
    view: View;
    inKotcZone: boolean = false;
    character: Character;
    stats: PlayerStats;
    activeGun: number;
    selectedGun: number;
    weapons: ReturnType<typeof createGun>[];
    grenades: number;
    hp: number;
    hpShield: number;
    spawnShield: number;
    randomSeed: number;

    constructor(playerData: PlayerData, activeZone = null) {
        this.id = Number(playerData.id);
        this.uniqueId = playerData.uniqueId;

        this.name = playerData.name;
        this.safeName = playerData.safeName;

        this.team = playerData.team;

        this.playing = playerData.playing;

        this.socials = [];
        if (typeof playerData.social === 'string' && playerData.social.length) {
            try {
                const parsed = JSON.parse(playerData.social);
                if (Array.isArray(parsed)) this.socials = parsed;
            } catch (e) {
                console.error('Error parsing socials:', e);
                console.error('Report this on Github!');
            }
        }
        this.socials.forEach((social) => social.type = RSocialMedia[social.id]);

        this.isVip = playerData.upgradeProductId > 0;
        this.showBadge = !playerData.hideBadge || false;

        this.streak = playerData.score;

        this.shellStreaks = Object.values(ShellStreak)
            .filter((streak): streak is number => typeof streak === 'number')
            .filter(streak => playerData.activeShellStreaks & streak);

        this.scale = this.shellStreaks.includes(ShellStreak.MiniEgg) ? 0.5 : 1;

        this.position = {
            x: playerData.x,
            y: playerData.y,
            z: playerData.z
        };

        this.jumping = !!(playerData.$controlKeys & Movement.Jump);
        this.scoping = !!(playerData.$controlKeys & Movement.Scope);
        this.climbing = false;

        this.view = {
            yaw: playerData.yaw,
            pitch: playerData.pitch
        };

        this.updateKotcZone(activeZone);

        this.character = {
            eggColor: playerData.shellColor,
            primaryGun: playerData.primaryWeaponItem,
            secondaryGun: playerData.secondaryWeaponItem,
            stamp: playerData.stampItem,
            hat: playerData.hatItem,
            grenade: playerData.grenadeItem,
            melee: playerData.meleeItem,
            stampPos: {
                x: playerData.stampPosX,
                y: playerData.stampPosY
            }
        }

        this.stats = {
            totalKills: playerData.totalKills,
            totalDeaths: playerData.totalDeaths,
            bestStreak: playerData.bestStreak
        }

        this.activeGun = playerData.weaponIdx;
        this.selectedGun = playerData.charClass;
        this.weapons = [];

        if (this.character.primaryGun) {
            this.weapons[0] = createGun(GunList[this.selectedGun]);
            this.weapons[1] = createGun(Cluck9mm);
        }

        this.grenades = 1;

        this.hp = playerData.hp;
        this.hpShield = 0;

        this.spawnShield = playerData.shield;

        this.randomSeed = 0;
    }

    updateKotcZone(activeZone) {
        if (activeZone) {
            const fx = Math.floor(this.position.x);
            const fy = Math.floor(this.position.y);
            const fz = Math.floor(this.position.z);

            this.inKotcZone = activeZone.some((coordSets) => coordSets.x === fx && coordSets.y === fy && coordSets.z === fz) && this.playing;
        } else this.inKotcZone = false;
    }
}

export default GamePlayer;