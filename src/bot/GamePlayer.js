import { GunList } from '#constants';
import { Cluck9mm } from '../constants/guns.js';

export class GamePlayer {
    constructor(id = -1, team = 0, playerData) {
        this.id = id;
        this.team = team;

        this.data = playerData;

        this.name = playerData.name_;
        this.uniqueId = playerData.uniqueId_;

        this.playing = playerData.playing_;

        this.social = playerData.social_ && JSON.parse(playerData.social_);
        this.showBadge = !playerData.hideBadge_ || false;

        this.position = {
            x: this.data.x_,
            y: this.data.y_,
            z: this.data.z_
        };

        this.jumping = false;
        this.climbing = false;

        this.view = {
            yaw: this.data.yaw_,
            pitch: this.data.pitch_
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

        this.activeGun = this.data.weaponIdx_;
        this.selectedGun = 0;
        this.weapons = [{}, {}];

        if (this.character.primaryGun) {
            const weaponClass = GunList[this.character.primaryGun.exclusive_for_class];
            this.selectedGun = this.character.primaryGun.exclusive_for_class;

            this.weapons[0] = new weaponClass();
            this.weapons[1] = new Cluck9mm();
        }

        this.grenades = 1;

        this.buffer = {
            0: {},
            1: {},
            2: {}
        };

        this.kills = 0;
        this.hp = 100;

        this.hpShield = 0;
        this.streakRewards = [];

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