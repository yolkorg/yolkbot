import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class MeleeDispatch {
    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.melee);
        out.send(bot.game.socket);

        bot.usingMelee = true;

        // gameloop every 33.33 (repeating) ms, 17 ticks, so 566.61 is the closest you get
        setTimeout(() => {
            bot.usingMelee = false
            bot.swappingGun = true

            setTimeout(() => {
                bot.swappingGun = false
            }, 0.5 * bot.me.weapons[0].equipTime)
        }, 566.61);
    }
}

export default MeleeDispatch;