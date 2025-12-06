import { GunList, Movement, ShellStreak, SocialMedia } from '../constants/index.js';
import { Cluck9mm } from '../constants/guns.js';
import { createGun } from '../util.js';

const RSocialMedia = Object.fromEntries(Object.entries(SocialMedia).map(([key, value]) => [value, key.toLowerCase()]));

export class GamePlayer {
    constructor(playerData, activeZone = null) {
        this.id = playerData.id;
        this.uniqueId = playerData.uniqueId;

        this.name = playerData.name;
        this.safeName = playerData.safeName;

        this.team = playerData.team;

        this.playing = playerData.playing;

        this.socials = playerData.social && JSON.parse(playerData.social);
        if (this.socials) this.socials.forEach((social) => social.type = RSocialMedia[social.id]);

        this.isVip = playerData.upgradeProductId > 0;
        this.showBadge = !playerData.hideBadge || false;

        this.streak = playerData.score;
        this.streakRewards = Object.values(ShellStreak).filter(streak => playerData.activeShellStreaks & streak);

        this.scale = this.streakRewards.includes(ShellStreak.MiniEgg) ? 0.5 : 1;

        this.position = {
            x: playerData.x,
            y: playerData.y,
            z: playerData.z
        };

        this.jumping = playerData.$controlKeys & Movement.Jump;
        this.scoping = playerData.$controlKeys & Movement.Scope;
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
        if (!activeZone) return this.inKotcZone = false;

        const fx = Math.floor(this.position.x);
        const fy = Math.floor(this.position.y);
        const fz = Math.floor(this.position.z);

        this.inKotcZone = activeZone.some((coordSets) => coordSets.x === fx && coordSets.y === fy && coordSets.z === fz) && this.playing;
    }
}

export default GamePlayer;