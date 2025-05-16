import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class SwapWeaponDispatch {
    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        bot.me.activeGun = +!bot.me.activeGun;

        const out = CommOut.getBuffer();
        out.packInt8(CommCode.swapWeapon);
        out.packInt8(bot.me.activeGun);
        out.send(bot.game.socket);
    }
}

export default SwapWeaponDispatch;