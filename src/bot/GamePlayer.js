import { GunList, ShellStreaks, SocialMedias } from '../constants/index.js';
import { Cluck9mm } from '../constants/guns.js';

export class GamePlayer {
    constructor(playerData) {
        this.id = playerData.id;
        this.name = playerData.name;
        this.uniqueId = playerData.uniqueId;

        this.team = playerData.team;

        this.playing = playerData.playing;

        this.socials = playerData.social && JSON.parse(playerData.social);
        if (this.socials) this.socials.forEach((social) => social.type = SocialMedias[social.id]);

        this.isVip = playerData.upgradeProductId > 0;
        this.showBadge = !playerData.hideBadge || false;

        this.position = {
            x: playerData.x,
            y: playerData.y,
            z: playerData.z
        };

        this.jumping = false;
        this.climbing = false;

        this.view = {
            yaw: playerData.yaw,
            pitch: playerData.pitch
        };

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
            killsInGame: playerData.kills,
            deathsInGame: playerData.deaths,
            streak: playerData.streak,
            totalKills: playerData.totalKills,
            totalDeaths: playerData.totalDeaths,
            bestGameStreak: playerData.bestGameStreak,
            bestOverallStreak: playerData.bestOverallStreak
        }

        this.activeGun = playerData.weaponIdx;
        this.selectedGun = playerData.charClass;
        this.weapons = [];

        if (this.character.primaryGun) {
            this.weapons[0] = new GunList[this.selectedGun]();
            this.weapons[1] = new Cluck9mm();
        }

        this.grenades = 1;

        this.streak = playerData.score;
        this.streakRewards = Object.values(ShellStreaks).filter(streak => playerData.activeShellStreaks & streak);

        this.hp = playerData.hp;
        this.hpShield = 0;

        this.spawnShield = playerData.shield;

        this.randomSeed = 0;
    }
}

export default GamePlayer;