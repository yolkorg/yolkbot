import { GunList, ShellStreaks, SocialMedias } from '#constants';
import { Cluck9mm } from '../constants/guns.js';

export class GamePlayer {
    constructor(id = -1, team = 0, playerData) {
        this.id = id;
        this.team = team;

        this.raw = playerData;

        this.name = playerData.name_;
        this.uniqueId = playerData.uniqueId_;

        this.playing = playerData.playing_;

        this.socials = playerData.social_ && JSON.parse(playerData.social_);
        if (this.socials) this.socials.forEach((social) => social.type = SocialMedias[social.id]);

        this.isVip = playerData.upgradeProductId_ > 0;
        this.showBadge = !playerData.hideBadge_ || false;

        this.position = {
            x: playerData.x_,
            y: playerData.y_,
            z: playerData.z_
        };

        this.jumping = false;
        this.climbing = false;

        this.view = {
            yaw: playerData.yaw_,
            pitch: playerData.pitch_
        };

        this.character = {
            eggColor: playerData.shellColor_,
            primaryGun: playerData.primaryWeaponItem_,
            secondaryGun: playerData.secondaryWeaponItem_,
            stamp: playerData.stampItem_,
            hat: playerData.hatItem_,
            grenade: playerData.grenadeItem_,
            melee: playerData.meleeItem_
        }

        this.activeGun = playerData.weaponIdx_;
        this.selectedGun = 0;
        this.weapons = [{}, {}];

        if (this.character.primaryGun) {
            this.selectedGun = playerData.charClass_;

            this.weapons[0] = new GunList[this.selectedGun]();
            this.weapons[1] = new Cluck9mm();
        }

        this.grenades = 1;

        this.buffer = {
            0: {},
            1: {},
            2: {}
        };

        this.streak = playerData.score_;
        this.hp = playerData.hp_;

        this.hpShield = playerData.shield_;
        this.streakRewards = Object.values(ShellStreaks).filter(streak => playerData.activeShellStreaks_ & streak);

        this.randomSeed = 0;
        this.serverStateIdx = 0;
    }

    dispatch() {
        throw new Error('you cannot call this function from a GamePlayer. call dispatch() on an instance of Bot instead.');
    }

    join() {
        throw new Error('you cannot call this function from a GamePlayer. call join() on an instance of Bot instead.');
    }

    update() {
        throw new Error('you cannot call this function from a GamePlayer. call update() on an instance of Bot instead.');
    }
}

export default GamePlayer;