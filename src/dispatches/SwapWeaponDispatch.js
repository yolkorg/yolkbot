import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class SwapWeaponDispatch {
    constructor(manualWeapon) {
        this.manualWeapon = manualWeapon;
    }

    validate() {
        return typeof this.manualWeapon === 'number' || typeof this.manualWeapon === 'undefined';
    }

    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        let chosenWeapon = +!bot.me.activeGun;
        if (typeof this.manualWeapon === 'number') chosenWeapon = this.manualWeapon;

        bot.me.activeGun = chosenWeapon;

        const out = new CommOut();
        out.packInt8(CommCode.swapWeapon);
        out.packInt8(bot.me.activeGun);
        out.send(bot.game.socket);
    }
}

export default SwapWeaponDispatch;