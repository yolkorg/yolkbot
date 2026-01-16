import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { GunEquipTime } from '../constants/index.js';

export class MeleeDispatch {
    validate() {
        return true;
    }

    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.melee);
        out.send(bot.game.socket);

        bot.state.usingMelee = true;

        // gameloop every 33.33 (repeating) ms, 17 ticks
        setTimeout(() => {
            bot.state.usingMelee = false
            bot.state.swappingGun = true

            setTimeout(() => {
                bot.state.swappingGun = false
            }, 0.5 * GunEquipTime)
        }, (100 / 3) * 17);
    }
}

export default MeleeDispatch;