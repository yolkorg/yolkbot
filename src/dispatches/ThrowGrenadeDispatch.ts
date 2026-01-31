import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ThrowGrenadeDispatch {
    constructor(power = 1) {
        this.power = power;
    }

    validate(): boolean {
        return typeof this.power === 'number' && this.power >= 0 && this.power <= 1;
    }

    check(bot: Bot): boolean {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot: Bot): void {
        const out = new CommOut();
        out.packInt8(CommCode.throwGrenade);
        out.packFloat(this.power);
        out.send(bot.game.socket);
    }
}

export default ThrowGrenadeDispatch;