import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class ThrowGrenadeDispatch {
    constructor(power = 1) {
        this.power = power;
    }

    check(bot) {
        return bot.me.playing &&
            !bot.state.reloading &&
            !bot.state.swappingGun &&
            !bot.state.usingMelee &&
            this.power >= 0 &&
            this.power <= 1;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.throwGrenade);
        out.packFloat(this.power);
        out.send(bot.game.socket);
    }
}

export default ThrowGrenadeDispatch;